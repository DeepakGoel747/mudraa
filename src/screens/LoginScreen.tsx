// src/screens/LoginScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth

// Assuming RootStackParamList is defined in your types/navigation.ts
import type {RootStackParamList} from '../types/navigation';
import {COLORS} from '../constants/colors'; // Ensure this path is correct

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert('Login Error', 'Please fill in both email and password.');
      return;
    }

    console.log('[LoginScreen] Attempting login for:', trimmedEmail);
    setIsLoading(true);
    try {
      console.log('[LoginScreen] Calling Firebase signInWithEmailAndPassword...');
      await auth().signInWithEmailAndPassword(trimmedEmail, password);
      // On successful login, onAuthStateChanged in App.tsx will trigger navigation.
      console.log('[LoginScreen] Firebase signInWithEmailAndPassword successful for:', trimmedEmail);
      // setIsLoading(false) will be handled by the finally block, or screen unmount.
    } catch (error: any) {
      // setIsLoading(false) will be handled by the finally block.
      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'That email address is invalid!';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This user account has been disabled.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMessage = `Login failed: ${error.message || 'Please check your input.'}`;
            break;
        }
      } else {
        errorMessage = error.message || "Could not log in. Please check your credentials or network.";
      }
      console.error('[LoginScreen] Firebase handleLogin error:', error.code, error.message, error);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      // Ensure isLoading is always reset, unless the component unmounts first on success.
      // This helps if there's a delay before onAuthStateChanged triggers unmount.
      if (auth().currentUser === null) { // Only set to false if login actually failed or user is still null
          console.log('[LoginScreen] In finally block, setting isLoading to false.');
          setIsLoading(false);
      } else {
          console.log('[LoginScreen] In finally block, user is likely logged in, isLoading might be reset by unmount.');
          // If the screen doesn't unmount quickly, you might still want to set it to false:
          // setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = (platform: string) => {
    Alert.alert(
      'Social Login',
      `${platform} login functionality is not yet implemented with Firebase.`,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}>
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Login Mudraa</Text>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Facebook')}
            disabled={isLoading}>
            <Icon
              name="facebook-square"
              size={24}
              color="#1877F2"
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Google')}
            disabled={isLoading}>
            <Icon
              name="google"
              size={24}
              color="#DB4437"
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Apple')}
            disabled={isLoading}>
            <Icon
              name="apple"
              size={24}
              color={COLORS.text.primary}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.orText}>Or</Text>

        <View style={styles.inputForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Example@gmail.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ResetPassword')}
              disabled={isLoading}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Text style={styles.accountText}>
          Don't have an account?{' '}
          <Text
            style={styles.signupText}
            onPress={() => navigation.navigate('Register')}>
            Sign up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  scrollView: {flex: 1},
  scrollContent: {flexGrow: 1, padding: 20, justifyContent: 'center'},
  header: {alignSelf: 'flex-start'},
  backButton: {width: 40, height: 40, justifyContent: 'center'},
  backButtonText: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  socialButtons: {gap: 16, marginBottom: 20},
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 56,
  },
  socialIcon: {marginRight: 12},
  socialButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  orText: {
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '600',
  },
  inputForm: {width: '100%'},
  inputContainer: {marginBottom: 20},
  label: {color: COLORS.text.primary, fontSize: 14, marginBottom: 8},
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.text.primary,
    fontSize: 16,
    height: 52,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    height: 52,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.text.primary,
    fontSize: 16,
  },
  eyeIcon: {padding: 14},
  forgotPassword: {
    color: COLORS.text.primary,
    textAlign: 'right',
    marginTop: 12,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {opacity: 0.5},
  loginButtonText: {
    color: COLORS.background,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    marginTop: 20,
  },
  accountText: {
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontSize: 14,
  },
  signupText: {color: COLORS.text.primary, fontWeight: '600'},
});

export default LoginScreen;
