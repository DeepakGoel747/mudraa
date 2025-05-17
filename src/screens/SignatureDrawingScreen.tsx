import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Image, // Import Image
  // Icon import removed
} from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons'; // Removed Icon import
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import SignatureScreen, {
  SignatureViewRef,
} from 'react-native-signature-canvas';

// --- Navigation Setup ---
type RootStackParamList = {
  KYC: undefined;
  BankConfirmation: undefined;
  SelfieVerification: undefined;
  SelfiePreview: { imageUri: string };
  SignatureScreen: undefined;
  SignatureDrawingScreen: undefined;
  PersonalDetailsScreen: undefined;
};
import { COLORS } from '../constants/colors';
// Define Navigation Prop Type using the correct screen name
type SignatureDrawingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignatureDrawingScreen'>;

type SignatureDrawingScreenProps = {
  navigation: SignatureDrawingNavigationProp; // Use the specific navigation prop type
};

// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
const helpIconSource = require('../assets/exclamation.png');
const clearIconSource = require('../assets/clear-alt.png');
const undoIconSource = require('../assets/undo-alt.png');
const confirmIconSource = require('../assets/check-circle.png');

// --- Component ---
const SignatureDrawingScreen: React.FC<SignatureDrawingScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const signatureRef = useRef<SignatureViewRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const primaryColor = '#25C866'; // Green color

  // --- Handlers ---
  const handleClear = () => {
    if (isLoading) return;
    signatureRef.current?.clearSignature();
  };

  const handleUndo = () => {
     if (isLoading) return;
     signatureRef.current?.undo();
  }

  const handleConfirm = () => {
    if (isLoading) return;
    // Optional: Read signature data if needed before navigating
    // signatureRef.current?.readSignature(); // Would trigger onOK/onEmpty if defined
    console.log('Navigating to PersonalDetailsScreen...');
    navigation.navigate('PersonalDetailsScreen');
  };

  // --- Styles for the Canvas ---
  const canvasStyle = `
    .m-signature-pad { box-shadow: none; border: none; margin: 0; background-color: #FFFFFF; }
    .m-signature-pad--body { border: 1px dashed #CCCCCC; border-radius: 8px; margin: 10px; height: ${Dimensions.get('window').height * 0.65}px; box-sizing: border-box; }
    .m-signature-pad--footer { display: none; }
  `;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background || '#F4F4F4' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           {/* Replaced Icon with Image */}
          <Image
            source={backIconSource}
            style={[styles.headerIconImage, { tintColor: COLORS.text.primary  || '#000000' }]}
           />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text.primary  || '#000000' }]}>Draw Signature</Text>
        <TouchableOpacity style={styles.helpButton}>
           {/* Replaced Icon with Image */}
          <Image source={helpIconSource} style={styles.headerIconImage} />
          <Text style={[styles.helpText, { color: primaryColor }]}>NEED HELP?</Text>
        </TouchableOpacity>
      </View>

      {/* Instruction Text */}
      <Text style={[styles.instructionText, { color: COLORS.text.primary  || '#333'}]}>
        Please sign in the box below (optional), then press CONFIRM.
      </Text>

      {/* Signature Canvas */}
      <View style={styles.canvasContainer}>
        <SignatureScreen
          ref={signatureRef}
          onDraw={() => console.log('onDrawEnd called')}
          descriptionText=""
          clearText="Clear" // Still needed internally by library?
          confirmText="Confirm" // Still needed internally by library?
          webStyle={canvasStyle}
          backgroundColor={"rgba(0,0,0,0)"}
          penColor={'#000000'}
          minWidth={2}
          maxWidth={4}
          dataURL={'image/png'}
          autoClear={false}
        />
      </View>

      {/* Action Buttons (Clear, Undo, Confirm) */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClear}
          disabled={isLoading}
        >
           {/* Replaced Icon with Image */}
          <Image source={clearIconSource} style={[styles.buttonIconImage, { tintColor: primaryColor }]} />
          <Text style={[styles.actionButtonText, styles.clearButtonText]}>CLEAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.actionButton, styles.undoButton]}
            onPress={handleUndo}
            disabled={isLoading}
            >
             {/* Replaced Icon with Image */}
            <Image source={undoIconSource} style={[styles.buttonIconImage, { tintColor: '#555' }]} />
            <Text style={[styles.actionButtonText, styles.undoButtonText]}>UNDO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.confirmButton,
            { backgroundColor: primaryColor },
          ]}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
               {/* Replaced Icon with Image */}
              <Image source={confirmIconSource} style={styles.buttonIconImage} />
              <Text style={[styles.actionButtonText, styles.confirmButtonText]}>CONFIRM</Text>
            </>
          )}
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
    paddingTop: Platform.OS === 'ios' ? 15 : 10, // Reduced top padding
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop:12
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Compensate padding
  },
  headerIconImage: { // Style for header icons
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
    // color set inline
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: -8, // Compensate padding
  },
  helpText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    // color set inline
  },
  instructionText: {
     fontSize: 15,
     textAlign: 'center',
     lineHeight: 22,
     marginVertical: 10,
     paddingHorizontal: 16,
     // color set inline
  },
  canvasContainer: {
    flex: 1,
    minHeight: Dimensions.get('window').height * 0.5,
    marginHorizontal: 16,
    marginBottom: 10,
    // Removed border/borderRadius from container as it's applied to canvas body via webStyle
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
    // borderRadius: 8,
    // overflow: 'hidden', // Keep if needed for webview clipping
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 30 : 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 10,
    elevation: 1, // Reduced elevation slightly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#25C866',
  },
  undoButton: {
     backgroundColor: '#F0F0F0',
     borderWidth: 1,
     borderColor: '#CCCCCC',
  },
  confirmButton: {
    // backgroundColor set inline
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButtonText: {
    color: '#25C866',
  },
  undoButtonText: {
     color: '#555',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
  buttonIconImage: { // Style for icons on bottom buttons
     width: 20, // Match original vector icon size
     height: 20,
     resizeMode: 'contain',
     marginRight: 6,
     // tintColor applied inline where needed
  },
});

export default SignatureDrawingScreen;