// src/screens/ResetPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import authService from '../services/authService'; // Corrected import
import type { RootStackParamList } from '../types/navigation'; // Adjust path if needed

interface ResetPasswordScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: { params: { email: string; otp: string } };
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const email = route.params?.email;
  const otp = route.params?.otp;

  const handleResetPassword = async () => {
    if (!email || !otp) {
      Alert.alert('Error', 'Email or OTP is missing. Please try the forgot password process again.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    console.log(`[ResetPasswordScreen] Attempting to reset password for email: ${email} with OTP.`);
    console.log(`[ResetPasswordScreen] Calling authService.resetPasswordWithOTP with:`, { email, otp, new_password: newPassword });

    try {
      const response = await authService.resetPasswordWithOTP({ email, otp, new_password: newPassword });
      console.log('[ResetPasswordScreen] authService.resetPasswordWithOTP response:', response);
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      // --- SIMPLIFIED CATCH BLOCK FOR DEBUGGING ---
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.error("[ResetPasswordScreen] ERROR CAUGHT IN ResetPasswordScreen.tsx");
      
      let errorMessage = "Failed to reset password. Please try again.";

      if (error && typeof error === 'object' && error.message) {
        console.error("[ResetPasswordScreen] Error has a message property:", error.message);
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        console.error("[ResetPasswordScreen] Error is a string:", error);
        errorMessage = error;
      } else {
        console.error("[ResetPasswordScreen] Error is of an unknown type or has no message. Full error:", error);
        try {
          const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
          console.error("[ResetPasswordScreen] Attempted to stringify error:", errorString);
          errorMessage = `An unexpected error occurred. Details: ${errorString.substring(0, 100)}`; // Show first 100 chars
        } catch (stringifyError) {
          console.error("[ResetPasswordScreen] Could not stringify error object.");
          errorMessage = "An unexpected and unloggable error occurred.";
        }
      }
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Alert.alert('Error', errorMessage);
    } finally {
      console.log('[ResetPasswordScreen] In finally block, setting isLoading to false.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter and confirm your new password for {email || 'your account'}.</Text>
      
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        disabled={loading}
        autoCapitalize="none"
      />

      <TextInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        disabled={loading}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading || !newPassword || !confirmPassword}
      >
        {loading ? (
            <ActivityIndicator color="white" />
        ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;
