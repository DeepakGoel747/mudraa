// src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your actual backend server's IP address or domain.
// If testing on an Android emulator, '10.0.2.2' usually points to your computer's localhost.
// If testing on a physical device, use your computer's network IP address (e.g., 192.168.1.X).
// Ensure your Flask server is running and accessible from your device/emulator.
export const API_BASE_URL = 'http://192.168.1.7:3001/api'; // Your main API prefix
export const USER_API_URL = `${API_BASE_URL}/users`; // Specific to user routes

// This is your Firebase Project's Web API Key (found in Firebase console)
// Store this securely, e.g., in an environment configuration file.
const FIREBASE_WEB_API_KEY = 'AIzaSyDihdnO11qTSF3Ntodk6TUxBfQ01OQqqcs'; // <<< REPLACE THIS!

const TOKEN_REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_WEB_API_KEY}`;

const api = axios.create({
  baseURL: API_BASE_URL, // Using the /api prefix
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Adds the auth token to every request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Do not add Authorization header for auth endpoints like login, register, request-otp, forgot-password
    const noAuthEndpoints = [
      `${USER_API_URL}/login-email-password`,
      `${USER_API_URL}/request-otp`,
      `${USER_API_URL}/register`,
      `${USER_API_URL}/forgot-password`,
      // Add any other public endpoints here
    ];
    // Note: verify-id-token *does* require an auth header with the initial token from client SDK
    // but if you only use login-email-password, it's less relevant directly after that specific login.

    const fullUrl = config.baseURL && config.url ? `${config.baseURL}${config.url}` : config.url || '';

    if (!noAuthEndpoints.includes(fullUrl)) {
        // For secure token storage, react-native-keychain is better
        const idToken = await AsyncStorage.getItem('firebaseIdToken');
        if (idToken && config.headers) {
            config.headers.Authorization = `Bearer ${idToken}`;
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token is already being refreshed, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest); // Retry with new token
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true; // Mark that we've tried to refresh for this request
      isRefreshing = true;

      const refreshToken = await AsyncStorage.getItem('firebaseRefreshToken');
      if (!refreshToken) {
        console.log('No refresh token, redirecting to login');
        isRefreshing = false;
        // Here you would typically navigate the user to the login screen
        // This requires access to your navigation instance or a global navigation utility
        // For now, just rejecting. Your UI components should handle this.
        // authService.logout(); // Example: Call a logout function to clear data
        processQueue(new Error('Session expired. Please login again.'), null);
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      try {
        console.log('Attempting to refresh ID token...');
        const refreshResponse = await axios.post(
          TOKEN_REFRESH_URL,
          {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { id_token: newIdToken, refresh_token: newRefreshToken } = refreshResponse.data;
        await AsyncStorage.setItem('firebaseIdToken', newIdToken);
        if (newRefreshToken) { // Firebase might rotate refresh tokens
          await AsyncStorage.setItem('firebaseRefreshToken', newRefreshToken);
        }
        console.log('ID Token refreshed successfully.');
        isRefreshing = false;
        if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newIdToken}`;
        }
        processQueue(null, newIdToken); // Process queued requests with the new token
        return api(originalRequest); // Retry the original request with the new token

      } catch (refreshError: any) {
        console.error('Failed to refresh ID token:', refreshError.response?.data || refreshError.message);
        isRefreshing = false;
        processQueue(refreshError, null); // Reject queued requests
        // Critical error in refreshing token, clear tokens and force re-login
        await AsyncStorage.removeItem('firebaseIdToken');
        await AsyncStorage.removeItem('firebaseRefreshToken');
        // Navigate to login (needs navigation instance or global utility)
        // authService.logout();
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }
    // For other errors, or if retry already happened, just reject
    return Promise.reject(error);
  }
);

export default api;
