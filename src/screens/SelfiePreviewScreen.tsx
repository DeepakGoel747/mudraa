import React from 'react'; // Removed useState as it's not used in this snippet
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image, // Added Image import
  ScrollView,
} from 'react-native';
// Removed Icon import
// import Icon from 'react-native-vector-icons/Ionicons';
// Removed useTheme import as colors aren't used
// import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation } from '@react-navigation/native'; // Import useNavigation here
import { COLORS } from '../constants/colors';
// --- Define Icon Paths ---
// Adjust paths if your assets folder is different relative to this file
const backIconSource = require('../assets/angle-left.png');
const helpIconSource = require('../assets/exclamation.png');

// Ensure this type includes the SignatureScreen and SelfiePreview params
type RootStackParamList = {
  KYC: undefined;
  BankConfirmation: undefined;
  SelfieVerification: undefined;
  SelfiePreview: { imageUri: string }; // Expects imageUri param
  SignatureScreen: undefined;
  // ... other screens if any
};

// Define the route prop type more specifically
type SelfiePreviewRouteProp = RouteProp<RootStackParamList, 'SelfiePreview'>;

// Define Navigation Prop Type using the correct screen name
type SelfiePreviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelfiePreview'>;

type SelfiePreviewScreenProps = {
  navigation: SelfiePreviewNavigationProp; // Use the specific navigation prop type
  route: SelfiePreviewRouteProp;
};

const SelfiePreviewScreen: React.FC<SelfiePreviewScreenProps> = ({ navigation, route }) => {
  const { imageUri } = route.params; // Get imageUri passed from previous screen

  const handleSubmit = () => {
    console.log('Submitting selfie:', imageUri);
    // Navigate to the Signature Screen after submission
    navigation.navigate('SignatureScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          {/* Replaced Icon with Image, applied white tintColor */}
          <Image
            source={backIconSource}
            style={[styles.headerIconImage, { tintColor: '#FFFFFF' }]}
           />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
           {/* Replaced Icon with Image */}
          <Image source={helpIconSource} style={styles.headerIconImage} />
          <Text style={styles.helpText}>NEED HELP?</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.content}>
        <Text style={styles.title}>KYC Verification</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '52%' }]} />
        </View>

        <Text style={styles.subtitle}>Selfie Verification</Text>
        <Text style={styles.description}>
          Great shot! Your selfie is successfully captured. Please proceed to Continue
        </Text>

        {/* Selfie Preview */}
        <View style={styles.selfieContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.selfieImage}
            resizeMode="cover" // Cover might be better for selfie preview
          />
        </View>
       </ScrollView>

       {/* Submit Button kept outside ScrollView to stick to bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    // Removed platform-specific paddingTop, rely on SafeAreaView
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
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
    color: '#25C866',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
      flex: 1, // Allow scrollview to take space
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
    marginTop: 16, // Add some space below header
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
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
    color: '#FFFFFF',
  },
  description: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  selfieContainer: {
     flex: 1, // Allows image container to grow
     minHeight: 300,
     maxHeight: 500, // Optional: constrain max height
     width: '100%', // Take full width within padding
     marginVertical: 24,
     borderRadius: 12,
     overflow: 'hidden',
     backgroundColor: '#1A1A1A',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
    // resizeMode is set inline now
  },
  buttonContainer: {
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      paddingTop: 10,
      backgroundColor: '#000000', // Match container background
  },
  submitButton: {
    backgroundColor: '#25C866',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelfiePreviewScreen;