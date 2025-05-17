import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image, // Import Image
  // Icon removed as it's no longer used
} from 'react-native';
// Removed Icon import if not used elsewhere
// import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation'; // Assuming this path is correct
import { COLORS } from '../constants/colors';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define path for the check icon (adjust relative path if needed)
const checkIconSource = require('../../src/assets/check.png');

const KYCSuccessScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Ensure 'BankVerification' is a valid screen name in RootStackParamList
      navigation.replace('BankVerification');
    }, 2000); // Redirect after 2 seconds

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/* Replaced Icon with Image */}
          <Image
            source={checkIconSource}
            style={styles.checkIconImage}
           />
        </View>
        <Text style={[styles.title, { color: COLORS.text.primary }]}>KYC process completed</Text>
        <Text style={styles.subtitle}>Do not close the window. You will be redirected.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color set inline using theme
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: { // The green circle
    width: 80,
    height: 80,
    borderRadius: 40, // Makes it a circle
    backgroundColor: '#25C866', // Your green color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkIconImage: { // Style for the checkmark image inside the circle
    width: 50, // Size of the checkmark image
    height: 50, // Size of the checkmark image
    resizeMode: 'contain',
    tintColor: '#FFFFFF', // Ensure the checkmark is white
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    // color set inline using theme
  },
  subtitle: {
    fontSize: 16,
    color: '#666666', // Consider using theme color like colors.text with opacity
    textAlign: 'center',
  },
});

export default KYCSuccessScreen;
