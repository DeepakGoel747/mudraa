// src/screens/NotificationPermissionScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput, // This is present but seems unused for the permission dialog itself
  Platform,
  Linking, // For opening app settings
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';

type NotificationPermissionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NotificationPermission'
>;

// Define a target screen to navigate to after handling permissions
// This should be the main part of your app or the next step in onboarding
const NEXT_SCREEN_AFTER_PERMISSION = 'HomeScreen'; // EXAMPLE: Replace with your actual next screen

const NotificationPermissionScreen = () => {
  const navigation = useNavigation<NotificationPermissionScreenNavigationProp>();

  const navigateToNextScreen = () => {
    // Replace 'HomeScreen' with the actual next screen in your app flow
    // For example, if this is part of onboarding, navigate to the next onboarding step
    // or to the main app screen if onboarding is complete.
    navigation.replace(NEXT_SCREEN_AFTER_PERMISSION); // Using replace to prevent going back to this screen
  };

  const requestNotificationPermission = async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.NOTIFICATIONS,
      android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS, // For Android 13+
    });

    if (!permission) {
      console.warn('Notification permission not applicable on this platform.');
      navigateToNextScreen(); // Still proceed even if platform doesn't support/need it
      return;
    }

    try {
      const result = await request(permission);
      console.log(`Notification permission request result: ${result}`);
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('This feature is not available (on this device / in this context)');
          // You might inform the user or just proceed
          break;
        case RESULTS.DENIED:
          console.log('The permission has not been requested / is denied but requestable');
          // User denied the OS prompt. You might show a message explaining how to enable later.
          break;
        case RESULTS.LIMITED:
          console.log('The permission is limited: some actions are possible');
          // Handle as granted for basic notifications
          break;
        case RESULTS.GRANTED:
          console.log('The permission is granted');
          // Permission granted! You can now send notifications.
          break;
        case RESULTS.BLOCKED:
          console.log('The permission is denied and not requestable anymore');
          // User has blocked notifications. Guide them to settings if they want to enable.
          // Example: Alert.alert("Notifications Blocked", "Please enable notifications in your app settings.", [{ text: "Open Settings", onPress: () => Linking.openSettings() }, { text: "OK" }]);
          break;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      // Regardless of the outcome, navigate to the next screen.
      // The app should function even if notifications are denied.
      navigateToNextScreen();
    }
  };

  const handleAllow = () => {
    // User tapped "Allow" on YOUR custom dialog.
    // Now, request the actual OS permission.
    console.log('User tapped "Allow" on custom dialog. Requesting OS permission...');
    requestNotificationPermission();
  };

  const handleDontAllow = () => {
    // User tapped "Don't Allow" on YOUR custom dialog.
    console.log("User tapped 'Don't Allow' on custom dialog.");
    // You might log this choice or simply proceed without requesting OS permission.
    // The app should still be usable.
    navigateToNextScreen();
  };

  // Check current permission status on screen load (optional, for debugging or specific logic)
  useEffect(() => {
    const checkCurrentPermission = async () => {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.NOTIFICATIONS,
        android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      });
      if (permission) {
        const status = await check(permission);
        console.log(`Initial notification permission status: ${status}`);
        // If already granted or blocked, you might decide to skip showing this screen
        // For example: if (status === RESULTS.GRANTED || status === RESULTS.BLOCKED) navigateToNextScreen();
      }
    };
    // checkCurrentPermission(); // Uncomment to run check on load
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* The Header and Market Section are part of the background.
        For a focused permission request, you might want to remove these
        or ensure this dialog is presented modally over a simpler screen.
      */}
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <View style={styles.avatar} />
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Searching For Stocks"
            placeholderTextColor="#666666"
            editable={false} // Typically, background elements are not interactive during a modal dialog
          />
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <Text style={styles.notificationDot}>•</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.marketSection}>
        <Text style={styles.sectionTitle}>MARKET</Text>
        {/* Market cards would go here */}
      </View>

      {/* Notification Permission Dialog */}
      <View style={styles.dialogContainer}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>"Mudraa" Would Like To Send You Notifications</Text>
          <Text style={styles.dialogMessage}>
            Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.dontAllowButton}
              onPress={handleDontAllow}
            >
              <Text style={styles.dontAllowText}>Don't Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.allowButton}
              onPress={handleAllow}
            >
              <Text style={styles.allowText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    // Consider adding zIndex: -1 if you want to ensure dialog is always on top
    // and this header is truly just background.
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#666666',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 12,
    height: 36,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchInput: {
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    color: '#FF3B30',
    fontSize: 24,
  },
  marketSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    // Consider adding zIndex: -1
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dialogContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 10, // Ensure dialog is on top of other content
  },
  dialog: {
    backgroundColor: '#2C2C2E', // Slightly different dark color for dialog
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 320, // Max width for the dialog
    alignItems: 'center', // Center content within the dialog
  },
  dialogTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    color: '#E0E0E0', // Lighter grey for better readability on dark dialog
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Buttons will take full width due to flex:1
    marginTop: 8,
    width: '100%', // Ensure button container takes full width of dialog
  },
  dontAllowButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 6, // Half of the space for better separation
    borderRadius: 8,
    backgroundColor: '#48484A', // Darker grey for "Don't Allow"
  },
  allowButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 6, // Half of the space
    borderRadius: 8,
    backgroundColor: '#0A84FF', // Standard iOS blue for "Allow"
  },
  dontAllowText: {
    color: '#FFFFFF',
    fontSize: 17, // Standard iOS dialog button size
    // fontWeight: '600', // System default is often regular for "Don't Allow"
    textAlign: 'center',
  },
  allowText: {
    color: '#FFFFFF', // White text on blue button
    fontSize: 17,
    fontWeight: '600', // Bolder for primary action
    textAlign: 'center',
  },
});

export default NotificationPermissionScreen;
