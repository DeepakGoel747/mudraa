// RegisterScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

// --- Type Definitions ---
export type RootStackParamList = {
    Register: undefined;
    OTP: {
        email: string;
        name: string;
        phoneNumber: string; // This will be the formatted phone number
        password?: string;
    };
    Success: undefined;
    Login: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

// --- Configuration ---
const API_BASE_URL = 'http://192.168.1.7:3001/api/users'; // Ensure this IP is correct and reachable

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>(''); // User input for phone
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const formatPhoneNumber = (number: string): string => {
        let cleanedNumber = number.trim().replace(/\s+/g, ''); // Remove spaces

        if (cleanedNumber.startsWith('+')) {
            // If it already starts with '+', assume it's internationally formatted.
            // For strict +91, you could add: if (cleanedNumber.startsWith('+91') && cleanedNumber.length === 13) return cleanedNumber;
            // For now, we'll let the backend validate if it's not +91 but starts with +.
            return cleanedNumber;
        }s
        // Remove leading '0' if present (common for local dialing in India)
        if (cleanedNumber.startsWith('0')) {
            cleanedNumber = cleanedNumber.substring(1);
        }

        // If it's now a 10-digit number (typical for India), prepend +91
        if (cleanedNumber.length === 10 && /^\d{10}$/.test(cleanedNumber)) {
            return `+91${cleanedNumber}`;
        }
        // If it already starts with '91' and is 12 digits long (e.g. 9198xxxxxxxx)
        if (cleanedNumber.startsWith('91') && cleanedNumber.length === 12 && /^\d{12}$/.test(cleanedNumber)) {
            return `+${cleanedNumber}`;
        }

        // Fallback: if it doesn't match typical Indian formats to prepend +91,
        // you might choose to return it as is for backend validation,
        // or enforce a specific input. For now, we'll prepend +91 if it looks like
        // it could be a candidate after stripping leading 0.
        // This ensures Firebase gets E.164 format.
        if (/^\d+$/.test(cleanedNumber)) { // If it's all digits after cleaning
             return `+91${cleanedNumber}`; // This might be too aggressive for non-10-digit numbers
        }                                   // but Firebase expects E.164.

        return number; // Return original if formatting is uncertain, let backend validate
    };

    const handleRegister = async (): Promise<void> => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const Fpassword = password;
        const FconfirmPassword = confirmPassword;

        // Format the phone number before validation and sending
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        // Frontend Validation
        if (!termsAccepted) {
            Alert.alert('Terms & Conditions', 'Please accept the terms and conditions to proceed.');
            return;
        }
        if (!trimmedName || !trimmedEmail || !formattedPhoneNumber || !Fpassword || !FconfirmPassword) {
            Alert.alert('Missing Information', 'Please fill in all required fields.');
            return;
        }
        // Basic check for formatted phone number (Firebase expects E.164 format like +91XXXXXXXXXX)
        // A more robust validation might be needed depending on requirements
        if (!formattedPhoneNumber.startsWith('+') || formattedPhoneNumber.length < 11) { // Simple check
            Alert.alert('Invalid Phone Number', 'Please enter a valid phone number. It will be formatted with +91 if needed.');
            return;
        }
        if (Fpassword !== FconfirmPassword) {
            Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
             Alert.alert('Invalid Email', 'Please enter a valid email address.');
             return;
        }
        if (Fpassword.length < 8) {
             Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
             return;
        }

        setIsLoading(true);
        const requestData = {
            name: trimmedName,
            email: trimmedEmail,
            phoneNumber: formattedPhoneNumber, // Send the formatted phone number
            password: Fpassword,
        };

        const targetUrl = `${API_BASE_URL}/request-otp`;
        console.log('Requesting OTP from:', targetUrl);
        console.log('Sending data:', JSON.stringify(requestData, null, 2));

        try {
            const response = await axios.post(targetUrl, requestData, {
                headers: { 'Content-Type': 'application/json' }
            });

            setIsLoading(false);
            console.log('OTP Request Success Status:', response.status);
            console.log('OTP Request Success Data:', response.data);
            Alert.alert('OTP Sent', response.data.message || 'An OTP has been sent to your email address.');

            navigation.navigate('OTP', {
                email: trimmedEmail,
                name: trimmedName,
                phoneNumber: formattedPhoneNumber, // Pass the formatted phone number
                password: Fpassword 
            });

        } catch (error: any) {
            setIsLoading(false);
            console.error('API Request Failed (Request OTP):', error);
            if (error.response) {
                console.error("Error Response Data:", error.response.data);
                console.error("Error Response Status:", error.response.status);
                const serverError = error.response.data;
                const errorMessage = serverError?.error || serverError?.message || 'Failed to request OTP. Please try again.';
                
                if (serverError?.type === 'ConflictError') {
                     Alert.alert('Registration Failed', 'This email address is already registered. Please login.');
                } else if (serverError?.type === 'InvalidInputError') {
                     Alert.alert('Validation Failed', errorMessage);
                } else {
                    Alert.alert('Request Failed', errorMessage);
                }
            } else if (error.request) {
                console.error("Error Request (No Response):", error.request);
                Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection and try again.');
            } else {
                console.error('Axios Setup Error Message:', error.message);
                Alert.alert('Application Error', 'An unexpected error occurred while preparing your request.');
            }
        }
    };

    // --- JSX for the screen (no changes to the structure, only to how phoneNumber is processed) ---
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>{'<'}</Text>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Register Mudraa</Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            textContentType="name"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Example@gmail.com"
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(text) => setEmail(text.toLowerCase())}
                            autoCapitalize="none"
                            textContentType="emailAddress"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Phone Number Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your 10-digit mobile number" // Updated placeholder
                            placeholderTextColor="#666"
                            keyboardType="phone-pad" // Or number-pad
                            value={phoneNumber}
                            onChangeText={setPhoneNumber} // User enters their number naturally
                            textContentType="telephoneNumber"
                            maxLength={15} // Allow for potential existing + or country codes initially
                            editable={!isLoading}
                        />
                    </View>

                    {/* Password Inputs and Terms remain the same as your provided code */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Min. 8 characters"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            textContentType="newPassword"
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            textContentType="newPassword"
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.termsContainer}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setTermsAccepted(!termsAccepted)}
                            disabled={isLoading}
                        >
                            {termsAccepted && <View style={styles.checkboxCheckedIndicator} />}
                        </TouchableOpacity>
                        <Text style={styles.termsText}>
                            I agree to{' '}
                            <Text style={styles.termsLink} onPress={() => Alert.alert('Terms', 'Link to terms and conditions pressed.')}>
                                Terms and condition
                            </Text>
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.button, 
                        (!termsAccepted || isLoading || !name.trim() || !email.trim() || !phoneNumber.trim() || !password || !confirmPassword) && styles.buttonDisabled
                    ]}
                    onPress={handleRegister}
                    disabled={!termsAccepted || isLoading || !name.trim() || !email.trim() || !phoneNumber.trim() || !password || !confirmPassword}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000000" />
                    ) : (
                        <Text style={styles.buttonText}>Request OTP</Text>
                    )}
                </TouchableOpacity>

                 <View style={styles.loginContainer}>
                       <Text style={styles.loginText}>
                           Already have an account?{' '}
                       </Text>
                       <TouchableOpacity
                           onPress={() => navigation.navigate('Login')}
                           disabled={isLoading}
                       >
                           <Text style={styles.loginLink}>Login</Text>
                       </TouchableOpacity>
                  </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// --- Styles (Using the slightly adjusted ones from the previous response for better UI) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#11150F', 
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 10, 
        justifyContent: 'space-between',
    },
    backButton: {
        marginTop: Platform.OS === 'ios' ? 40 : 20, 
        marginBottom: 10, 
        alignSelf: 'flex-start',
        padding: 10, 
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold', 
    },
    titleContainer: {
        marginBottom: 20, 
        alignItems: 'flex-start', 
    },
    title: {
        fontSize: 28, 
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    formContainer: {
        marginVertical: 20, 
    },
    inputContainer: {
        marginBottom: 15, 
    },
    label: {
        color: '#AEAEAE', 
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: '#1E1E1E', 
        borderRadius: 8,
        paddingVertical: 12, 
        paddingHorizontal: 15,
        color: '#FFFFFF',
        height: 50, 
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333333', 
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20, 
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1.5,
        borderColor: '#00FF7F', 
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxCheckedIndicator: {
        width: 12,
        height: 12,
        backgroundColor: '#00FF7F',
        borderRadius: 2,
    },
    termsText: {
        color: '#AEAEAE',
        flexShrink: 1,
        fontSize: 13, 
    },
    termsLink: {
        color: '#00FF7F',
        textDecorationLine: 'underline', 
    },
    button: {
        backgroundColor: '#00FF7F', 
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        height: 56, 
        justifyContent: 'center',
        marginTop: 10, 
    },
    buttonDisabled: {
        backgroundColor: '#007F40', 
        opacity: 0.7,
    },
    buttonText: {
        color: '#11150F', 
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20, 
        paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    },
    loginText: {
        color: '#AEAEAE',
        fontSize: 14,
    },
    loginLink: {
        color: '#00FF7F',
        fontSize: 14,
        fontWeight: 'bold', 
    },
});

export default RegisterScreen;