import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView, // Using SafeAreaView from react-native
  Platform,
  Image,
  ScrollView,
  // TextInput, // Not used in this specific component code
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
const helpIconSource = require('../assets/exclamation.png');
const mainIllustrationSource = require('../assets/wmremove-transformed-removebg-preview.png');
const permissionIconSource = require('../assets/marker(1).png');
const cameraButtonIconSource = require('../assets/camera.png');
// If the retake button icon needs replacing too:
// const cameraReverseIconSource = require('../assets/your-camera-reverse-icon.png');


type SelfieVerificationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelfieVerification'>;
};

const SelfieVerificationScreen: React.FC<SelfieVerificationScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const handleTakeSelfie = () => {
    const dummyImageUri = 'https://via.placeholder.com/300x400.png?text=Selfie+Preview';
    navigation.navigate('SelfiePreview', { imageUri: dummyImageUri });
    // setSelfieImage(dummyImageUri); // Uncomment to show preview here
  };

  const handleRetake = () => {
    setSelfieImage(null);
  };

  // const handleSubmit = () => { ... };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={backIconSource}
            style={[styles.headerIconImage, { tintColor: COLORS.text.primary  }]}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
          <Image source={helpIconSource} style={styles.headerIconImage} />
          <Text style={styles.helpText}>NEED HELP?</Text>
        </TouchableOpacity>
      </View>

      {/* Apply contentContainerStyle for padding */}
      <ScrollView
         style={styles.scrollView} // Use basic flex style
         contentContainerStyle={styles.scrollContentContainer} // Apply padding here
         showsVerticalScrollIndicator={false}
         keyboardShouldPersistTaps="handled"
        >
        <Text style={[styles.title, { color: COLORS.text.primary  }]}>KYC Verification</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '52%' }]} />
        </View>

        <Text style={[styles.subtitle, { color: COLORS.text.primary }]}>Click a Selfie</Text>
        <Text style={styles.description}>
          Click a selfie for your KYC verification.
        </Text>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={mainIllustrationSource}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Conditional Rendering: Show preview OR guidelines/button */}
        {/* Based on original code, preview is likely handled on SelfiePreview screen */}
        {/* So we show the bottom part */}
         <View style={styles.bottomContentContainer}>
            <View style={styles.guidelinesSection}>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>1</Text>
                <Text style={styles.instructionText}>Make sure you are in a well lit area.</Text>
              </View>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>2</Text>
                <Text style={styles.instructionText}>Take off your mask, glasses and cap.</Text>
              </View>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>Make sure you are taking your own selfie. Avoid crowded places.</Text>
              </View>
            </View>

            <View style={styles.permissionNote}>
              <Image source={permissionIconSource} style={styles.permissionIconImage} />
              <Text style={styles.permissionText}>
                Please allow LOCATION and CAMERA permissions when requested. You need to do this only ONCE as per SEBI regulations, to open a Demat account.
              </Text>
            </View>

            <TouchableOpacity style={styles.cameraButton} onPress={handleTakeSelfie}>
              <Image source={cameraButtonIconSource} style={styles.cameraIconImage} />
              <Text style={styles.cameraButtonText}>OPEN CAMERA</Text>
            </TouchableOpacity>
          </View>
        {/* End conditional rendering part */}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10, // Added margin to push header down
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: -8,
  },
  helpText: {
    color: '#25C866',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: { // Style for ScrollView component itself
    flex: 1,
  },
  scrollContentContainer: { // Style for the content *inside* ScrollView
      paddingHorizontal: 16, // Apply horizontal padding here
      paddingBottom: 24, // Ensure spacing at the bottom
      flexGrow: 1, // Important for content alignment when it's short
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#25C866',
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#666666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  illustration: {
    width: '80%',
    aspectRatio: 1.2,
    height: undefined,
    maxWidth: 250,
  },
  bottomContentContainer: {
      // Removed flex: 1 and justifyContent: 'flex-end'
      // Content now flows naturally within the scroll view
      marginTop: 20,
  },
  guidelinesSection: {
      marginBottom: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(37, 200, 102, 0.1)',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 24 : 26,
    color: '#25C866',
    marginRight: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    color: '#666666',
    fontSize: 16,
    lineHeight: 24,
  },
  permissionNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  permissionIconImage: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
      // tintColor: '#666666' // Optional tint
  },
  permissionText: {
    flex: 1,
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  cameraButton: {
    backgroundColor: '#25C866',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cameraIconImage: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  // Styles related to image preview if implemented on this screen
  // imagePreviewContainer: { ... },
  // imagePreview: { ... },
  // selfieImage: { ... },
  // retakeButton: { ... },
  // retakeText: { ... },
});

export default SelfieVerificationScreen;