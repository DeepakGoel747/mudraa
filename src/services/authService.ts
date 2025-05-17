// src/services/authService.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth'; // Import client-side Firebase Auth

export const API_BASE_URL = 'http://192.168.1.7:3001/api'; // Ensure this is correct for your dev environment
const USER_API_PREFIX = '/users';

const ID_TOKEN_KEY = 'myapp_firebaseIdToken';
const USER_DATA_KEY = 'myapp_userData';

// Custom error for session issues
class SessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 200000, // Increased timeout slightly
});

const authService = {
    login: async (email: string, password: string): Promise<any> => {
        try {
            console.log(`AuthService: Attempting login via backend for ${email}`);
            const backendResponse = await api.post(`${USER_API_PREFIX}/login-email-password`, {
                email,
                password,
            });
            // console.log('AuthService: Backend login response.data:', JSON.stringify(backendResponse.data, null, 2));
            const { customToken, user, message, uid } = backendResponse.data;
            if (customToken && uid && user) {
                console.log(`AuthService: Received customToken for UID: ${uid}. Signing into Firebase client...`);
                await auth().signInWithCustomToken(customToken);
                console.log('AuthService: Firebase client signInWithCustomToken successful.');

                const firebaseUser = auth().currentUser;
                if (!firebaseUser) {
                    console.error('AuthService: Firebase user is null after signInWithCustomToken!');
                    throw new Error('Failed to establish Firebase session on client.');
                }
                const idToken = await firebaseUser.getIdToken(true); // Force refresh
                
                await AsyncStorage.setItem(ID_TOKEN_KEY, idToken);
                console.log('AuthService: ID token from client SDK stored in AsyncStorage.');
                await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
                
                api.defaults.headers.common.Authorization = `Bearer ${idToken}`;
                console.log('AuthService: Login successful, client Firebase session established.');
                
                return { success: true, message, user, uid, idToken };
            } else {
                console.warn('AuthService: Backend login response missing customToken, uid, or user data.', backendResponse.data);
                throw new Error(message || backendResponse.data?.error || 'Login failed: Invalid response from backend.');
            }
        } catch (error: any) {
            console.error('AuthService Login Error (raw):', error);
            let errorMessage = 'Login failed. Please check your credentials or network connection.';
            if (error.isAxiosError && error.response?.data) {
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            console.error('AuthService Login Error (processed):', errorMessage);
            throw new Error(errorMessage);
        }
    },

    logout: async (): Promise<void> => {
        try {
            console.log('AuthService: Attempting client-side Firebase signOut...');
            await auth().signOut();
            console.log('AuthService: Client-side Firebase signOut successful.');
        } catch (error: any) {
            console.error('AuthService: Error during Firebase signOut:', error.message);
        } finally {
            await AsyncStorage.removeItem(ID_TOKEN_KEY);
            await AsyncStorage.removeItem(USER_DATA_KEY);
            delete api.defaults.headers.common['Authorization'];
            console.log('AuthService: Local tokens and user data cleared after logout.');
        }
    },

    getCurrentUser: async (): Promise<any | null> => {
        const userJson = await AsyncStorage.getItem(USER_DATA_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    getIdToken: async (forceRefresh: boolean = false): Promise<string | null> => {
        const firebaseUser = auth().currentUser;
        if (firebaseUser) {
            try {
                const token = await firebaseUser.getIdToken(forceRefresh);
                console.log('[AuthService] getIdToken: Retrieved ID token from Firebase SDK.');
                return token;
            } catch (error: any) {
                console.error('[AuthService] getIdToken: Error getting ID token from Firebase SDK (raw):', error);
                await authService.logout(); 
                throw new SessionExpiredError("Your session is invalid or expired. Please log in again.");
            }
        }
        console.log('[AuthService] getIdToken: No current Firebase user.');
        return null;
    },
    
    isAuthenticated: async (): Promise<boolean> => {
        const firebaseUser = auth().currentUser;
        if (firebaseUser) {
            try {
                await firebaseUser.getIdToken(true); 
                return true;
            } catch (error) {
                console.warn("[AuthService] isAuthenticated: getIdToken(true) failed, session might be invalid.", error);
                return false;
            }
        }
        return false; 
    },

    requestPasswordResetOTP: async (email: string): Promise<any> => {
        try {
            const response = await api.post(`${USER_API_PREFIX}/forgot-password`, { email });
            if (response.status >= 200 && response.status < 300 && response.data?.message) {
                return response.data;
            } else {
                throw new Error(response.data?.error || response.data?.message || 'Failed to request password reset: Invalid server response.');
            }
        } catch (error: any) {
            console.error('AuthService requestPasswordResetOTP Error (raw):', error);
            let errorMessage = 'Failed to request password reset. Please try again.';
            if (error.isAxiosError && error.response?.data) {
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    },
    
    changeAuthenticatedUserPassword: async (currentPassword: string, newPassword: string): Promise<any> => {
        try {
            const response = await api.post(`${USER_API_PREFIX}/settings/change-password`, { currentPassword, newPassword });
            if (response.status >= 200 && response.status < 300 && response.data?.message) {
                return response.data; 
            } else {
                throw new Error(response.data?.error || response.data?.message || 'Password change failed: Invalid server response.');
            }
        } catch (error: any) {
            console.error('AuthService changeAuthenticatedUserPassword Error (raw):', error);
            let errorMessage = 'Failed to change password. Please try again.';
             if (error.isAxiosError && error.response?.data) {
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    },

    resetPasswordWithOTP: async (data: { email: string; otp: string; new_password: string }): Promise<any> => {
        try {
            const response = await api.post(`${USER_API_PREFIX}/reset-password-with-otp`, data);
            if (response.status >= 200 && response.status < 300 && response.data?.message) {
                return response.data;
            } else {
                throw new Error(response.data?.error || response.data?.message || 'Password reset failed: Invalid server response.');
            }
        } catch (error: any) {
            console.error('AuthService resetPasswordWithOTP Error (raw):', error);
            let errorMessage = 'Password reset failed. An unexpected error occurred.';
            if (error.isAxiosError && error.response?.data) {
                errorMessage = error.response.data.error || error.response.data.message || `Server error (${error.response.status}). Please try again.`;
            } else if (error.isAxiosError && error.request) {
                 errorMessage = 'Network error or no response from server. Please check your connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    },
};

// --- Axios Request Interceptor ---
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const publicEndpoints = [
            `${USER_API_PREFIX}/login-email-password`, `${USER_API_PREFIX}/request-otp`,
            `${USER_API_PREFIX}/register`, `${USER_API_PREFIX}/forgot-password`,
            `${USER_API_PREFIX}/reset-password-with-otp`,
        ];
        const isPublicEndpoint = publicEndpoints.some(publicPath => config.url?.startsWith(publicPath));

        if (!isPublicEndpoint) {
            const firebaseUser = auth().currentUser;
            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken(); 
                    if (idToken && config.headers) {
                        config.headers.Authorization = `Bearer ${idToken}`;
                    }
                } catch (tokenError: any) { // Renamed error variable
                    console.error("Axios Interceptor: Error getting ID token from Firebase SDK:", tokenError.message);
                    // Decide if you want to throw an error here to cancel the request,
                    // or let it proceed (backend will likely return 401).
                    // For now, letting it proceed. The response interceptor will handle 401.
                }
            } else {
                console.warn('Axios Interceptor: No current Firebase user for protected route:', config.url);
            }
        }
        return config;
    },
    (requestError: any) => { // Renamed error variable
        console.error("Axios Request Interceptor Error:", requestError);
        return Promise.reject(new Error(requestError.message || "Error in request setup.")); // Reject with a new Error
    }
);

// --- Axios Response Interceptor (REFINED) ---
api.interceptors.response.use(
    (response) => response, // Simply return successful responses
    async (axiosError: AxiosError) => { // Explicitly type as AxiosError
        const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };
        let errorToReject: Error;

        console.warn('Axios Response Interceptor: Error caught for URL:', originalRequest?.url, 'Status:', axiosError.response?.status);
        console.log('Axios Response Interceptor: Raw AxiosError:', JSON.stringify(axiosError, null, 2));


        if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
            console.log('Axios Interceptor (401): Attempting token refresh and retry for', originalRequest.url);
            originalRequest._retry = true;
            
            const firebaseUser = auth().currentUser;
            if (firebaseUser) {
                try {
                    const newIdToken = await firebaseUser.getIdToken(true); // Force refresh
                    if (newIdToken && originalRequest.headers) {
                        console.log('Axios Interceptor (401): Firebase SDK provided new ID token. Retrying.');
                        originalRequest.headers['Authorization'] = `Bearer ${newIdToken}`;
                        await AsyncStorage.setItem(ID_TOKEN_KEY, newIdToken);
                        return api(originalRequest); // Retry the original request
                    } else {
                        console.error('Axios Interceptor (401): Firebase SDK did NOT provide new ID token. Logging out.');
                        await authService.logout();
                        errorToReject = new SessionExpiredError('Your session has expired. Please log in again.');
                    }
                } catch (sdkError: any) {
                    console.error('Axios Interceptor (401): Error force-refreshing ID token from Firebase SDK:', sdkError.message);
                    await authService.logout();
                    errorToReject = new SessionExpiredError('Your session is invalid. Please log in again.');
                }
            } else {
                console.warn('Axios Interceptor (401): No current Firebase user. Forcing client logout.');
                await authService.logout(); // Ensure client state is cleared
                // Construct a new error from the original Axios error details for clarity
                const serverMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || `Authentication failed (401).`;
                errorToReject = new Error(serverMessage);
            }
        } else {
            // For non-401 errors, or if retry for 401 already happened/failed
            if (axiosError.response) {
                const serverMessage = 
                    (axiosError.response.data as any)?.error || 
                    (axiosError.response.data as any)?.message || 
                    `Request failed with status ${axiosError.response.status}.`;
                errorToReject = new Error(serverMessage);
                // (errorToReject as any).status = axiosError.response.status; // Optionally attach status
            } else if (axiosError.request) {
                errorToReject = new Error('Network request failed: No response received from server.');
            } else {
                errorToReject = new Error(axiosError.message || 'An unexpected error occurred during the API request.');
            }
        }
        console.error("Axios Response Interceptor - Rejecting with Error:", errorToReject.message, errorToReject);
        return Promise.reject(errorToReject); // Always reject with an Error instance
    }
);

export default authService;
