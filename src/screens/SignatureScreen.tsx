import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image, // Import Image
  ScrollView,
} from 'react-native';
// Removed Icon import as all icons are now images
// import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native'; // Keep useTheme if colors are used
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { COLORS } from '../constants/colors';
// --- Navigation Setup ---
type RootStackParamList = {
  KYC: undefined;
  BankConfirmation: undefined;
  SelfieVerification: undefined;
  SelfiePreview: { imageUri: string };
  SignatureScreen: undefined;
  SignatureDrawingScreen: undefined;
};

// Define Navigation Prop Type using the correct screen name
type SignatureScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignatureScreen'>;

type SignatureScreenProps = {
  navigation: SignatureScreenNavigationProp; // Use the specific navigation prop type
};

// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
const helpIconSource = require('../assets/exclamation.png');
const checkCircleIconSource = require('../assets/check-circle.png');
const signatureIllustrationSource = require('../assets/preview.png');
const drawSignatureIconSource = require('../assets/your-draw-icon.png'); // ** Placeholder: You need an icon for the button **

const SignatureScreen: React.FC<SignatureScreenProps> = ({ navigation }) => {
  const { colors } = useTheme(); // Get theme colors
  const primaryColor = '#25C866'; // Your primary green color

  const handleDrawSignature = () => {
    navigation.navigate('SignatureDrawingScreen');
  };

  return (
    // Use theme background color, fallback to white or black depending on theme intention
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background || '#000000' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           {/* Replaced Icon with Image */}
          <Image
            source={backIconSource}
            // Tint color based on theme text color, fallback to white
            style={[styles.headerIconImage, { tintColor: COLORS.text.primary  || '#FFFFFF' }]}
           />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
           {/* Replaced Icon with Image */}
          <Image source={helpIconSource} style={styles.headerIconImage} />
          <Text style={[styles.helpText, { color: primaryColor }]}>NEED HELP?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Use theme text color, fallback to white */}
        <Text style={[styles.title, { color: COLORS.text.primary  || '#FFFFFF' }]}>KYC Verification</Text>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '58%', backgroundColor: primaryColor }]} />
        </View>

        {/* Use theme text color, fallback to white */}
        <Text style={[styles.subtitle, { color: COLORS.text.primary  || '#FFFFFF' }]}>Submit your signature</Text>

        {/* Instruction Box - Moved before Illustration */}
        <View style={styles.instructionBox}>
           {/* Replaced Icon with Image */}
           <Image source={checkCircleIconSource} style={styles.instructionIconImage} />
           {/* Changed text color to white */}
           <Text style={styles.instructionTextContent}>
             Use your finger to draw your signature on the screen
           </Text>
        </View>

        {/* Illustration (Signature Sample) - Centered and Enlarged */}
        <View style={styles.illustrationContainer}>
          <Image
            source={signatureIllustrationSource} // Use the correct source
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Spacer removed, natural flow with flexGrow in content container */}

      </ScrollView>

      {/* Bottom Action Button - Fixed */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
           style={[styles.actionButton, { backgroundColor: primaryColor }]}
           onPress={handleDrawSignature}
         >
          {/* ** Placeholder: Replace with your draw icon Image component ** */}
          {/* <Image source={drawSignatureIconSource} style={styles.actionButtonIcon} /> */}
          <Text style={styles.actionButtonText}>DRAW YOUR SIGNATURE</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color set inline
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10, // Pushes header down slightly
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Compensate padding
  },
  headerIconImage: { // Style for header image icons
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: -8, // Compensate padding
  },
  helpText: {
    // color set inline
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1, // Takes available space between header and footer
  },
  scrollContentContainer: {
     flexGrow: 1, // Ensures content can grow, pushing button down
     paddingHorizontal: 16,
     paddingBottom: 20, // Padding at the bottom of scrollable area
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8, // Space below header
    // color set inline
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333', // Dark background for bar
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    // backgroundColor set inline
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    // color set inline
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 200, 102, 0.1)', // Light green background
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20, // Space before the illustration
  },
  instructionIconImage: { // Style for check-circle image
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
    // tintColor: '#25C866', // Optional: Tint if check-circle.png is single color
  },
  instructionTextContent: {
     flex: 1,
     color: '#FFFFFF', // Changed text color to white
     fontSize: 15,
     lineHeight: 22,
  },
  illustrationContainer: {
    alignItems: 'center', // Center the image horizontally
    // Removed marginBottom, spacing handled by instructionBox marginBottom and bottomButtonContainer paddingTop
    flex: 1, // Allow container to grow vertically if needed
    justifyContent: 'center', // Center image vertically in available space
    minHeight: 250, // Ensure minimum height for the illustration area
  },
  illustration: {
    width: '300%', // Make illustration wider
    // height: 250, // Let height be determined by aspect ratio or flex container
    aspectRatio: 0.8, // Adjust aspect ratio based on preview.png (width/height)
    maxWidth: 1000, // Set a max width if needed
  },
  // spacer removed
  bottomButtonContainer: {
     paddingHorizontal: 16,
     paddingBottom: Platform.OS === 'ios' ? 30 : 24, // Bottom safe area padding
     paddingTop: 10, // Space above button
     // borderTopWidth: 1, // Optional separator
     // borderTopColor: '#333333', // Optional separator color
     // backgroundColor: colors.background || '#000000', // Match background
   },
  actionButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    // backgroundColor set inline
  },
  actionButtonIcon: { // Style for the draw icon on the button (if you add one)
     width: 24,
     height: 24,
     resizeMode: 'contain',
     tintColor: '#FFFFFF', // Make it white
     marginRight: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignatureScreen;