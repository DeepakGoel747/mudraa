// src/screens/SettingsScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// import type {RootStackParamList} from '../types/navigation';
import {COLORS} from '../constants/colors';
type RootStackParamList = {
  Register: undefined;
  OTP: undefined;
  NewPassword: undefined;
  Success: undefined;
  Settings:undefined;
  
};
// Update ParamList to include the new ChangePasswordScreen
// This should ideally be part of your global RootStackParamList in types/navigation.ts
// import type {RootStackParamList} from '../types/navigation';
type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

// Icon Path Assumptions
const backIconSource = require('../assets/angle-left.png');
const darkModeIcon = require('../assets/moon.png');
const changePasswordIcon = require('../assets/lock.png');
const changePinIcon = require('../assets/otp.png');
const activeDevicesIcon = require('../assets/devices.png');
const notificationsIcon = require('../assets/Background(2).png');

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const isFocused = useIsFocused();

  const [currentUser, setCurrentUser] =
    useState<FirebaseAuthTypes.User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (isFocused) {
        console.log('[SettingsScreen] Fetching user settings...');
        setIsLoadingSettings(true);
        const user = auth().currentUser;
        setCurrentUser(user);

        if (user) {
          try {
            const userDoc = await firestore()
              .collection('users')
              .doc(user.uid)
              .get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              if (userData?.themePreference) { // Corrected field name from previous context
                setIsDarkMode(userData.themePreference === 'dark');
                console.log(
                  '[SettingsScreen] Theme preference loaded:',
                  userData.themePreference,
                );
              }
              if (userData?.notificationsEnabled !== undefined) {
                setIsNotificationsEnabled(userData.notificationsEnabled);
                console.log(
                  '[SettingsScreen] Notifications preference loaded:',
                  userData.notificationsEnabled,
                );
              }
            } else {
              console.log(
                '[SettingsScreen] No user settings document found in Firestore for UID:',
                user.uid,
              );
            }
          } catch (error: any) {
            console.error(
              '[SettingsScreen] Failed to fetch user settings from Firestore:',
              error.message,
            );
            Alert.alert('Error', 'Could not load your settings.');
          }
        } else {
          console.log('[SettingsScreen] No authenticated user found.');
        }
        setIsLoadingSettings(false);
      }
    };

    fetchUserSettings();
  }, [isFocused]);

  const handleThemeToggle = async (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    setIsDarkMode(value); 

    if (currentUser) {
      console.log(`[SettingsScreen] Updating theme to ${newTheme} in Firestore...`);
      try {
        await firestore().collection('users').doc(currentUser.uid).update({
          themePreference: newTheme, // Corrected field name
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `[SettingsScreen] Theme successfully updated to ${newTheme} in Firestore.`,
        );
      } catch (error: any) {
        console.error(
          '[SettingsScreen] Failed to update theme preference in Firestore:',
          error.message,
        );
        Alert.alert(
          'Error',
          'Could not save your theme preference. Please try again.',
        );
        setIsDarkMode(!value); 
      }
    } else {
      Alert.alert('Error', 'You must be logged in to change settings.');
      setIsDarkMode(!value); 
    }
  };

  const toggleAppNotifications = async (value: boolean) => {
    setIsNotificationsEnabled(value); 
    if (currentUser) {
      console.log(`[SettingsScreen] Updating app notifications to ${value} in Firestore...`);
      try {
        await firestore().collection('users').doc(currentUser.uid).update({
          notificationsEnabled: value,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `[SettingsScreen] App notifications preference updated to ${value} in Firestore.`,
        );
      } catch (error: any) {
        console.error(
          '[SettingsScreen] Failed to update app notifications preference in Firestore:',
          error.message,
        );
        Alert.alert(
          'Error',
          'Could not save your notification preference. Please try again.',
        );
        setIsNotificationsEnabled(!value); 
      }
    } else {
      Alert.alert('Error', 'You must be logged in to change settings.');
      setIsNotificationsEnabled(!value);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
        {text: 'Cancel', style: 'cancel'},
        {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
                setIsLoggingOut(true);
                try {
                    console.log('[SettingsScreen] Attempting Firebase logout...');
                    await auth().signOut();
                    console.log('[SettingsScreen] Firebase logout successful.');
                } catch (error: any) {
                    console.error('[SettingsScreen] Firebase logout error:', error.message);
                    Alert.alert('Logout Failed', error.message || 'Could not log out. Please try again.');
                } finally {
                    // setIsLoggingOut(false); // Handled by screen unmount via onAuthStateChanged
                }
            }
        }
    ]);
  };

  const navigateToChangePassword = () => {
    console.log("[SettingsScreen] Navigating to ChangePasswordScreen");
    navigation.navigate('NewPassword'); // Navigate to the new dedicated screen
  };

  const navigateToChangePIN = () => {
    Alert.alert("Navigate", "Manage PIN screen (to be implemented with Firestore).");
    // navigation.navigate('ManagePINScreen');
  };

  const navigateToActiveDevices = () => {
    Alert.alert("Navigate", "Active Devices screen (backend feature pending).");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={backIconSource} style={styles.backIconImage} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuContent}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Image source={darkModeIcon} style={styles.menuImageStyle} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Dark Mode</Text>
                  <Text style={styles.menuSubtitle}>Toggle dark/light theme</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                {isLoadingSettings ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Switch
                    value={isDarkMode}
                    onValueChange={handleThemeToggle}
                    trackColor={{false: '#767577', true: COLORS.primary}}
                    thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={navigateToChangePassword}> {/* Updated onPress handler */}
            <View style={styles.menuContent}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Image source={changePasswordIcon} style={styles.menuImageStyle} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Change Password</Text>
                  <Text style={styles.menuSubtitle}>Update your account password</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={navigateToChangePIN}>
            <View style={styles.menuContent}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Image source={changePinIcon} style={styles.menuImageStyle} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Manage PIN</Text>
                  <Text style={styles.menuSubtitle}>Set or update your security PIN</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devices</Text>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={navigateToActiveDevices}>
            <View style={styles.menuContent}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Image source={activeDevicesIcon} style={styles.menuImageStyle} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Active Devices</Text>
                  <Text style={styles.menuSubtitle}>Manage your logged in devices</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuContent}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Image source={notificationsIcon} style={styles.menuImageStyle} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>App Notifications</Text>
                  <Text style={styles.menuSubtitle}>Manage push notifications</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                {isLoadingSettings ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Switch
                        trackColor={{false: '#767577', true: COLORS.primary}}
                        thumbColor={isNotificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleAppNotifications}
                        value={isNotificationsEnabled}
                    />
                )}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 12,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 24 + 16,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  menuCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuContent: { 
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  menuLeft: { 
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuImageStyle: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuTextContainer: {
    flex: 1, 
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 3,
  },
  menuSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
  },
  menuRight: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuArrow: { 
    color: '#8E8E93',
    fontSize: 20,
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#FF4444', 
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
