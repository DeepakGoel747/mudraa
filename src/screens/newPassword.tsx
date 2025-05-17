// src/screens/ChangePasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { TextInput as PaperTextInput, useTheme } from 'react-native-paper'; // Using Paper TextInput
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Assuming authService is correctly imported and configured
// It will need a new method: changeAuthenticatedUserPassword
import authService from '../services/authService'; 
import { COLORS } from '../constants/colors'; // Assuming you have this
import type { RootStackParamList } from '../types/navigation'; // Adjust path if needed

// Ensure 'PasswordChanged' is in your RootStackParamList
type ChangePasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewPassword'>;

const NewPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const paperTheme = useTheme();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setError(''); // Clear previous errors
    if (!currentPassword.trim()) {
        setError('Please enter your current password.');
        return;
    }
    if (!newPassword || !confirmNewPassword) {
      setError('Please fill in both new password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) { // Or your desired password policy from backend
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword === currentPassword) {
        setError('New password cannot be the same as the current password.');
        return;
    }

    setLoading(true);
    console.log('[ChangePasswordScreen] Attempting to change password...');
    try {
      // This service method will call your backend's /api/users/settings/change-password
      // The backend will verify currentPassword and then update to newPassword using Firebase Admin SDK.
      const response = await authService.changeAuthenticatedUserPassword(currentPassword, newPassword);

      console.log('[ChangePasswordScreen] Backend response for password change:', response);
      Alert.alert(
        'Success',
        response?.message || 'Your password has been changed successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('PasswordChanged') }] 
      );

    } catch (err: any) {
      console.error("[ChangePasswordScreen] Failed to change password:", err.message || err.response?.data || err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      // Alert.alert('Error', errorMessage); // Error is shown via the error state
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (!loading) {
        navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background}/>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} disabled={loading}>
            <Icon name="arrow-back-outline" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInner}>
            <Text style={styles.subtitle}>
                Your new password must be different from your previous password.
            </Text>

            {/* Current Password Input */}
            <PaperTextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={(text) => { setCurrentPassword(text); setError(''); }}
                secureTextEntry={!showCurrentPassword}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                disabled={loading}
                right={
                    <PaperTextInput.Icon 
                        icon={showCurrentPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        color={COLORS.text.secondary}
                    />
                }
                theme={{ colors: { primary: COLORS.primary, text: COLORS.text.primary, placeholder: COLORS.text.secondary, background: COLORS.card, onSurfaceVariant: COLORS.border } }}
                textColor={COLORS.text.primary}
            />

            {/* New Password Input */}
            <PaperTextInput
                label="New Password"
                value={newPassword}
                onChangeText={(text) => { setNewPassword(text); setError(''); }}
                secureTextEntry={!showNewPassword}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                disabled={loading}
                right={
                    <PaperTextInput.Icon 
                        icon={showNewPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        color={COLORS.text.secondary}
                    />
                }
                theme={{ colors: { primary: COLORS.primary, text: COLORS.text.primary, placeholder: COLORS.text.secondary, background: COLORS.card, onSurfaceVariant: COLORS.border } }}
                textColor={COLORS.text.primary}
            />

            {/* Confirm New Password Input */}
            <PaperTextInput
                label="Confirm New Password"
                value={confirmNewPassword}
                onChangeText={(text) => { setConfirmNewPassword(text); setError(''); }}
                secureTextEntry={!showConfirmNewPassword}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                disabled={loading}
                right={
                    <PaperTextInput.Icon 
                        icon={showConfirmNewPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        color={COLORS.text.secondary}
                    />
                }
                theme={{ colors: { primary: COLORS.primary, text: COLORS.text.primary, placeholder: COLORS.text.secondary, background: COLORS.card, onSurfaceVariant: COLORS.border } }}
                textColor={COLORS.text.primary}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.button, (loading || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword) && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
            >
            {loading ? (
                <ActivityIndicator color={COLORS.background} />
            ) : (
                <Text style={styles.buttonText}>Change Password</Text>
            )}
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // To align icon better
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerPlaceholder: { // To balance the back button for centering title
    width: 24 + 16, // Approx width of icon + padding
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentInner: {
    padding: 24,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    marginBottom: 30,
    textAlign: 'left',
    lineHeight: 22,
  },
  input: {
    marginBottom: 20,
    backgroundColor: COLORS.card, 
  },
  errorText: {
    color: COLORS.error, 
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: COLORS.primary, 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 10,
    height: 52, 
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5, 
  },
  buttonText: {
    color: COLORS.background, 
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewPasswordScreen;
