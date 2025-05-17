// OTPScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

// --- Type Definitions ---
// Ensure this matches the parameters passed from RegisterScreen
// and what your OTP/Success/Login screens expect or are named.
export type RootStackParamList = {
  Register: undefined;
  OTP: {
      email: string;
      name: string; // For resend OTP context
      phoneNumber: string; // For resend OTP context
      password?: string; // For resend OTP context (backend stores it with OTP)
  };
  Success: undefined; // Your success screen after registration
  Login: undefined;   // Your login screen
  // Add other screens as needed
};

type OTPScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTP'>;
type OTPRouteProp = RouteProp<RootStackParamList, 'OTP'>;

// --- Configuration ---
// Ensure this is the correct and reachable IP/domain for your Flask backend
const API_BASE_URL = 'http://172.20.10.2:5000/api/users'; 

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<OTPRouteProp>();

  const { email, name, phoneNumber, password } = route.params || {};

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(4).fill('')); // Assuming 6-digit OTP from backend
  const [timer, setTimer] = useState<number>(57); // Initial timer value
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!email || !name || !phoneNumber || !password) {
      Alert.alert(
        'Error',
        'Required information is missing. Please go back to the registration screen and try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [email, name, phoneNumber, password, navigation]);

  const setRef = (index: number) => (element: TextInput | null) => {
    inputRefs.current[index] = element;
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtpDigits = [...otpDigits];
    // Allow only one digit per input, and only numeric
    newOtpDigits[index] = value.replace(/[^0-9]/g, '').slice(0, 1); 
    setOtpDigits(newOtpDigits);
    setErrorMessage(null);

    if (value && index < otpDigits.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent: { key: keyValue } }: { nativeEvent: { key: string } }, index: number) => {
    if (keyValue === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== otpDigits.length) {
      setErrorMessage(`Please enter the complete ${otpDigits.length}-digit OTP.`);
      return;
    }
    if (!email) { // Should be caught by useEffect, but defensive check
        setErrorMessage("User email is missing. Please restart registration.");
        return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestData = {
      email: email, // Email is used by backend to find the OTP and associated temp user data
      otp: enteredOtp,
    };

    const targetUrl = `${API_BASE_URL}/register`;
    console.log('Confirming OTP and Registering User at:', targetUrl);
    console.log('Sending data:', JSON.stringify(requestData, null, 2));

    try {
      const response = await axios.post(targetUrl, requestData, {
        headers: { 'Content-Type': 'application/json' },
      });

      setIsLoading(false);
      console.log('Registration Success Status:', response.status);
      console.log('Registration Success Data:', response.data);

      if (response.status === 201) { // HTTP 201 Created
        Alert.alert('Success', response.data.message || 'Registration successful!');
        // Navigate to a success screen or login screen
        navigation.navigate('Success'); // Or 'Login'
      } else {
        // Should be caught by axios error handling, but defensive
        throw new Error(response.data?.error || `Registration failed with status ${response.status}`);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error('API Request Failed (Register):', error);
      let friendlyErrorMessage = 'Registration failed. Please check the OTP or try again.';
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
        const serverError = error.response.data;
        friendlyErrorMessage = serverError?.error || serverError?.message || friendlyErrorMessage;
        if (serverError?.type === 'OtpError' || error.response.status === 400) {
            setOtpDigits(Array(otpDigits.length).fill('')); // Clear OTP fields
            inputRefs.current[0]?.focus(); // Focus first input
        }
      } else if (error.request) {
        friendlyErrorMessage = 'Could not connect to the server. Please check your connection.';
      } else {
        friendlyErrorMessage = 'An unexpected error occurred during registration.';
      }
      setErrorMessage(friendlyErrorMessage);
      Alert.alert('Registration Failed', friendlyErrorMessage);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    if (!email || !name || !phoneNumber || !password) { // Ensure all data for resend is available
        Alert.alert("Error", "Cannot resend OTP. Key user information is missing. Please restart registration.");
        return;
    }

    setIsResending(true); // Use a separate loading state for resend
    setErrorMessage(null);

    const requestData = {
      email: email,
      name: name, // Name is needed by /request-otp
      phoneNumber: phoneNumber, // Phone is needed by /request-otp
      password: password, // Password is needed by /request-otp to re-store with new OTP
    };
    
    const targetUrl = `${API_BASE_URL}/request-otp`;
    console.log('Resending OTP from:', targetUrl);
    console.log('Sending data for resend:', JSON.stringify(requestData, null, 2));

    try {
      const response = await axios.post(targetUrl, requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      setIsResending(false);
      setTimer(57); // Reset timer
      setCanResend(false);
      setOtpDigits(Array(otpDigits.length).fill(''));
      inputRefs.current[0]?.focus();
      Alert.alert('OTP Resent', response.data.message || 'A new OTP has been sent to your email.');

    } catch (error: any) {
      setIsResending(false);
      console.error('Resend OTP Failed:', error);
      let friendlyErrorMessage = 'Failed to resend OTP.';
      if (error.response) {
        const serverError = error.response.data;
        friendlyErrorMessage = serverError?.error || serverError?.message || friendlyErrorMessage;
      } else if (error.request) {
        friendlyErrorMessage = 'Network error. Could not resend OTP.';
      }
      setErrorMessage(friendlyErrorMessage);
      Alert.alert('Resend Failed', friendlyErrorMessage);
    }
  };
  
  const isConfirmDisabled = otpDigits.join('').length !== otpDigits.length || isLoading || isResending;

  if (!email) { // If email is somehow missing, show a loading or error state.
    return (
        <View style={styles.container_loading}>
            <ActivityIndicator size="large" color="#00FF7F" />
            <Text style={styles.loading_text}>Loading details...</Text>
        </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP</Text>
        </View>
        <Text style={styles.emailText}>
          Enter the {otpDigits.length}-digit code sent to: {email}
        </Text>

        <View style={styles.otpContainer}>
          {otpDigits.map((digit, index) => (
            <TextInput
              key={index}
              ref={setRef(index)}
              style={[
                styles.otpInput,
                errorMessage ? styles.otpInputError : null,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isLoading && !isResending}
            />
          ))}
        </View>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <TouchableOpacity onPress={handleResend} disabled={!canResend || isLoading || isResending}>
          <Text
            style={[
              styles.resendText,
              (!canResend || isLoading || isResending) && styles.resendTextDisabled,
            ]}
          >
            {timer > 0 ? `Resend in ${formatTime(timer)}` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            isConfirmDisabled && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={isConfirmDisabled}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#11150F" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Register</Text>
          )}
        </TouchableOpacity>
         <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop:20}}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container_loading: { // Centering content for loading state
    flex: 1,
    backgroundColor: '#11150F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading_text: {
    color: '#00FF7F',
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
  },
  container: {
    flex: 1,
    backgroundColor: '#11150F',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // More padding for status bar
    paddingBottom: 30, // More padding at bottom
  },
  header: {
    marginBottom: 20, // Reduced margin
    alignItems: 'center',
  },
  title: {
    fontSize: 28, // Increased font size
    fontFamily: 'Poppins-Bold', 
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emailText: {
    color: '#AEAEAE', // Lighter grey
    textAlign: 'center',
    marginBottom: 25, // Increased margin
    fontSize: 15, // Slightly larger
    fontFamily: 'Poppins-Regular', 
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center OTP boxes
    marginBottom: 25, // Increased margin
    gap: Platform.OS === 'ios' ? 12 : 10, // Responsive gap
  },
  otpInput: {
    width: 50, // Slightly smaller for 6 digits
    height: 55,
    borderWidth: 1.5, // Thicker border
    borderColor: '#333333', // Darker grey border
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 22, // Adjusted font size
    textAlign: 'center',
    backgroundColor: '#1E1E1E', // Slightly lighter dark
    fontFamily: 'Poppins-Medium', 
  },
  otpInputError: {
    borderColor: '#FF3B30', // iOS system red for errors
  },
  errorText: {
    color: '#FF3B30', 
    textAlign: 'center',
    marginBottom: 20, // Increased margin
    fontSize: 14,
    fontFamily: 'Poppins-Regular', 
  },
  resendText: {
    color: '#00FF7F', // Accent color
    textAlign: 'center',
    marginBottom: 25, // Increased margin
    fontFamily: 'Poppins-Medium', 
    fontSize: 15,
  },
  resendTextDisabled: {
    color: '#555555', // Darker grey when disabled
  },
  confirmButton: {
    backgroundColor: '#00FF7F',
    paddingVertical: 16, // More padding
    borderRadius: 12, // More rounded
    alignItems: 'center',
    minHeight: 56, // Standard height
    justifyContent: 'center',
    marginTop: 10, // Added some top margin
  },
  confirmButtonDisabled: {
    backgroundColor: '#008040', // Darker shade of accent for disabled
    opacity: 0.8,
  },
  confirmButtonText: {
    color: '#11150F', // Dark text
    fontSize: 16,
    fontFamily: 'Poppins-Bold', 
  },
  backLink: {
    color: '#AEAEAE',
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});

export default OTPScreen;