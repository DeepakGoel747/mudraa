// src/screens/ResetPasswordScreen.tsx 
// (This screen is for initiating the password reset by entering email)
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    SafeAreaView,
    Platform,
    StatusBar
} from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import authService from '../services/authService'; // Your existing authService
import type { RootStackParamList } from '../types/navigation'; 
import { COLORS } from '../constants/colors'; 

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const paperTheme = useTheme(); 

  const handleSendResetLink = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
    }

    setLoading(true);
    console.log(`[ResetPasswordScreen] Requesting password reset link for email: ${trimmedEmail}`);
    try {
      // This function in authService should call your backend's /forgot-password endpoint,
      // which in turn uses Firebase Admin SDK to send the reset link.
      const response = await authService.requestPasswordResetOTP(trimmedEmail); // Naming can be updated if confusing

      console.log('[ResetPasswordScreen] Password reset link request response:', response);
      Alert.alert(
        'Reset Link Sent',
        response?.message || 'A password reset link has been sent to your email address. Please check your inbox (and spam folder) to continue.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') } // Navigate to Login after user acknowledges
        ]
      );
      // No navigation to NewPasswordScreen here, as user will use the email link.

    } catch (error: any) {
      console.error("[ResetPasswordScreen] Failed to request password reset link:", error.response?.data || error.message || error);
      Alert.alert(
        'Error', 
        error.response?.data?.error || error.message || 'Failed to send password reset link. Please check the email address or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={loading}>
                <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email address below. We'll send you a link to reset your password.</Text>
            
            <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.input} 
                mode="outlined" 
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                disabled={loading}
                textColor={COLORS.text.primary} 
                theme={{ 
                    ...paperTheme, 
                    colors: { 
                        ...paperTheme.colors, 
                        text: COLORS.text.primary,       
                        placeholder: '#666666',         
                        primary: COLORS.primary,          
                        background: COLORS.card,          
                        onSurfaceVariant: '#666666',     
                    } 
                }}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendResetLink} // Updated handler name
                disabled={loading || !email.trim()}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.background} />
                ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text> // Updated button text
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLinkContainer} disabled={loading}>
                <Text style={styles.loginText}>Remember password? <Text style={styles.loginLink}>Login</Text></Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 + 20 : 20,
        justifyContent: 'flex-start', 
    },
    backButton: {
        marginBottom: 20,
        padding: 5,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 30,
        color: COLORS.text.primary,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: 12,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text.secondary,
        marginBottom: 30,
        textAlign: 'left',
        lineHeight: 22,
    },
    input: { 
        marginBottom: 25,
        backgroundColor: COLORS.card, 
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        height: 52,
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.background, 
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLinkContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    loginText: {
        color: COLORS.text.secondary,
        fontSize: 14,
    },
    loginLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default ResetPasswordScreen;
