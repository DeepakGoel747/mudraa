// src/screens/ProfileScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth'; // Import Firebase Auth
import firestore from '@react-native-firebase/firestore'; // Import Firebase Firestore

import type {RootStackParamList} from '../types/navigation';
import {COLORS} from '../constants/colors';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

// Icon Paths (ensure these paths are correct relative to this file if not using a central asset manager)
const backIconSource = require('../assets/angle-left.png');
const personalInfoIcon = require('../assets/Overlay.png');
const privacySecurityIcon = require('../assets/Background(4).png');
const paymentMethodsIcon = require('../assets/Background.png');
const documentsKycIcon = require('../assets/Notes.png');
const appSettingsIcon = require('../assets/Background(1).png');
const notificationsIcon = require('../assets/Background(2).png');
const ordersTradesIcon = require('../assets/trading(1).png');
const plReportIcon = require('../assets/growth-chart-invest(1).png');
const taxIcon = require('../assets/tax.png');
const transactionHistoryIcon = require('../assets/receipt.png');
const supportIcon = require('../assets/user-headset.png');
// const logoutIcon = require('../assets/sign-out-alt.png'); // Logout icon, can be removed if button is removed

// Interface for user profile data stored in Firestore
interface UserFirestoreData {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt: firestore.Timestamp;
  theme?: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const isFocused = useIsFocused();

  const [currentUser, setCurrentUser] =
    useState<FirebaseAuthTypes.User | null>(null);
  const [userFirestoreProfile, setUserFirestoreProfile] =
    useState<UserFirestoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isFocused) {
        console.log('[ProfileScreen] Screen focused. Fetching user data...');
        setIsLoading(true);
        setError(null);

        const firebaseUser = auth().currentUser;
        setCurrentUser(firebaseUser);

        if (firebaseUser) {
          console.log(
            '[ProfileScreen] Firebase user found:',
            firebaseUser.uid,
            firebaseUser.displayName,
            firebaseUser.email,
          );
          try {
            const userDoc = await firestore()
              .collection('users')
              .doc(firebaseUser.uid)
              .get();

            if (userDoc.exists) {
              const firestoreData = userDoc.data() as UserFirestoreData;
              setUserFirestoreProfile(firestoreData);
              console.log(
                '[ProfileScreen] Firestore profile loaded:',
                firestoreData,
              );
              if (firestoreData.theme !== undefined) {
                // Example: setIsNotificationsEnabled(firestoreData.notificationsEnabled);
              }
            } else {
              console.warn(
                '[ProfileScreen] No Firestore profile found for UID:',
                firebaseUser.uid,
              );
              setError(
                'Profile details not found. Please complete your profile.',
              );
            }
          } catch (err: any) {
            console.error(
              '[ProfileScreen] Failed to fetch Firestore profile:',
              err,
            );
            setError(
              'Could not load your profile details. Please try again.',
            );
          }
        } else {
          console.log('[ProfileScreen] No Firebase user currently authenticated.');
          setError('You are not logged in.');
        }
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isFocused]);

  const userName = currentUser?.displayName || userFirestoreProfile?.name || 'User Name';
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = currentUser?.email || userFirestoreProfile?.email || 'No email';

  let activeSince = 'Active since...';
  if (currentUser?.metadata?.creationTime) {
    activeSince = `Joined ${new Date(
      currentUser.metadata.creationTime,
    ).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}`;
  } else if (userFirestoreProfile?.createdAt) {
    activeSince = `Joined ${userFirestoreProfile.createdAt
      .toDate()
      .toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}`;
  }

  const navigateTo = (screenName: keyof RootStackParamList, params?: any) => {
    try {
      navigation.navigate(screenName as any, params as any);
    } catch (navError) {
      console.error(
        `[ProfileScreen] Navigation error for screen "${screenName}":`,
        navError,
      );
      Alert.alert(
        'Navigation Error',
        `Could not navigate to ${screenName}. Please ensure the screen is defined.`,
      );
    }
  };

  // handleLogout function remains, in case you want to use it elsewhere (e.g. Settings screen)
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // It's good practice to show a loader if logout takes time,
            // but often it's quick and onAuthStateChanged handles navigation.
            // setIsLoading(true); 
            console.log('[ProfileScreen] Attempting Firebase logout...');
            await auth().signOut();
            console.log('[ProfileScreen] Firebase logout successful.');
            // onAuthStateChanged in App.tsx will handle navigation to AuthNavigator
          } catch (e) {
            // setIsLoading(false); // Reset loader if shown
            console.error('[ProfileScreen] Firebase logout error:', e);
            Alert.alert('Logout Failed', 'Could not log out. Please try again.');
          }
        },
      },
    ]);
  };

  const toggleNotifications = async (value: boolean) => {
    setIsNotificationsEnabled(value);
    console.log('[ProfileScreen] Notifications toggled (client-side):', value);
    // TODO: Save this preference to Firestore if needed
  };

  if (isLoading && !currentUser && !userFirestoreProfile) {
    return (
      <SafeAreaView
        style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{color: COLORS.text.primary, marginTop: 10}}>
          Loading Profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (error && !currentUser && !userFirestoreProfile) {
    return (
      <SafeAreaView
        style={[styles.container, {justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20}]}>
        <Text style={{color: COLORS.error, textAlign: 'center', fontSize: 16, marginBottom: 20}}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => { // Simplified: directly trigger logout logic or navigate
            if (currentUser) { // If user object exists, means logout is possible
                handleLogout();
            } else { // If no user, likely means "not logged in" error, navigate to Login
                navigation.reset({ index: 0, routes: [{name: 'Login'}] });
            }
          }}
          style={{padding: 10, backgroundColor: COLORS.primary, borderRadius: 5}}>
          <Text style={{color: COLORS.text.primary, fontSize: 16}}>
            Go to Login
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />

      <View style={styles.topNavControls}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topNavButton}>
          <Image source={backIconSource} style={[styles.topNavIconImage, {tintColor: COLORS.text.primary}]} />
        </TouchableOpacity>
        <View style={styles.topNavButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, {backgroundColor: currentUser ? COLORS.primary : COLORS.card}]}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <View style={[styles.onlineIndicator, {backgroundColor: currentUser ? COLORS.success : COLORS.card}]} />
          </View>
          <Text style={styles.userNameText}>{userName}</Text>
          <Text style={styles.userEmailText}>{userEmail}</Text>
          <Text style={styles.activeSinceText}>{activeSince}</Text>
        </View>

        {/* ACCOUNT Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigateTo('PersonalInformationScreen')}
          >
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}><Image source={personalInfoIcon} style={styles.menuImageNew} /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Personal Information</Text>
                <Text style={styles.menuSubtitle}>Update your profile details</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuCard} onPress={() => Alert.alert("Navigate", "Privacy & Security screen to be implemented")}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}><Image source={privacySecurityIcon} style={styles.menuImageNew} /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Privacy & Security</Text>
                <Text style={styles.menuSubtitle}>Manage your security preferences</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuCard} onPress={() => Alert.alert("Navigate", "Payment Methods screen to be implemented")}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}><Image source={paymentMethodsIcon} style={styles.menuImageNew} /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Payment Methods</Text>
                <Text style={styles.menuSubtitle}>Manage your linked accounts</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuCard} onPress={() => navigateTo('KYC')}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}>
                <Image source={documentsKycIcon} style={styles.menuImageNew} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Documents & KYC</Text>
                <Text style={styles.menuSubtitle}>Your verification documents</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <TouchableOpacity style={styles.menuCard} onPress={() => navigateTo('Settings')}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}><Image source={appSettingsIcon} style={styles.menuImageNew} /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>App Settings</Text>
                <Text style={styles.menuSubtitle}>Manage app themes and preferences</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
          <View style={styles.menuCard}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}><Image source={notificationsIcon} style={styles.menuImageNew} /></View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>Configure notification preferences</Text>
              </View>
            </View>
            <View style={styles.menuRight}>
              <Switch
                trackColor={{false: '#767577', true: COLORS.primary}}
                thumbColor={isNotificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleNotifications}
                value={isNotificationsEnabled}
              />
            </View>
          </View>
        </View>

        {/* TRADING Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRADING</Text>
          <TouchableOpacity style={styles.menuCard} onPress={() => navigateTo('TransactionHistory')}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}>
                <Image source={ordersTradesIcon} style={styles.menuImageNew} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Orders & Trades</Text>
                <Text style={styles.menuSubtitle}>View your order history</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* REPORTS Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REPORTS</Text>
          <TouchableOpacity style={styles.menuCard} onPress={() => Alert.alert("Navigate", "P&L Report (To be implemented)")}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}>
                <Image source={plReportIcon} style={styles.menuImageNew} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>P&L Report</Text>
                <Text style={styles.menuSubtitle}>View your profit and loss statement</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuCard} onPress={() => Alert.alert("Navigate", "Tax Reports (To be implemented)")}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}>
                <Image source={taxIcon} style={styles.menuImageNew} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Tax Reports</Text>
                <Text style={styles.menuSubtitle}>Download tax statements</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuCard} onPress={() => navigateTo('TransactionHistory')}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}>
                <Image source={transactionHistoryIcon} style={styles.menuImageNew} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Transaction History</Text>
                <Text style={styles.menuSubtitle}>View all your transactions</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* SUPPORT Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <TouchableOpacity style={styles.menuCard} onPress={() => Alert.alert("Navigate", "Customer Support (To be implemented)")}>
            <View style={styles.menuContent}>
              <View style={styles.menuIconContainer}>
                <Image source={supportIcon} style={styles.menuImageNew} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Customer Support</Text>
                <Text style={styles.menuSubtitle}>Chat with us 24/7</Text>
              </View>
              <Image source={require('../assets/angle-right.png')} style={styles.menuArrowIcon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button REMOVED from here */}

        <View style={styles.versionContainer}>
          <TouchableOpacity onPress={() => Alert.alert("Navigate", "About Us (To be implemented)")}>
            <Text style={styles.aboutUsText}>About Us</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same, but the logoutButton and logoutIconStyle are no longer used by this screen's JSX
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  topNavControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 0) + (Platform.OS === 'ios' ? 10 : 16),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.background,
  },
  topNavButton: {
    padding: 8,
  },
  topNavIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  topNavButtonPlaceholder: {
    width: 24 + 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 0) + 70,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
    width: 100,
    height: 100,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.text.primary,
    fontSize: 40,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userNameText: {
    color: COLORS.text.primary,
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 6,
  },
  userEmailText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginBottom: 4,
  },
  activeSinceText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom:10,
  },
  sectionTitle: {
    color: COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  menuCard: {
    backgroundColor: COLORS.card,
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
  menuIconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuImageNew: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    borderRadius: 6,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 3,
  },
  menuSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 13,
  },
  menuRight: {
    marginLeft: 'auto',
    paddingLeft: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  menuArrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: COLORS.text.secondary,
    marginLeft: 10,
  },
  // Styles for logoutButton, logoutIconStyle, logoutButtonText are kept in case
  // you want to use them elsewhere, but they are not used in this screen's JSX anymore.
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
  },
  logoutIconStyle: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: COLORS.text.primary,
    marginRight: 10,
  },
  logoutButtonText: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  versionContainer: {
    paddingTop: 30,
    paddingBottom: (StatusBar.currentHeight || 0) + 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutUsText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  versionText: {
    color: COLORS.text.tertiary,
    fontSize: 14,
  },
});

export default ProfileScreen;
