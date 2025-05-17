import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView, // Using SafeAreaView from react-native
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
// Note: If you want edge-specific control, import from 'react-native-safe-area-context' instead
// import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
type PaymentMethod = 'phonepe' | 'gpay' | 'manual';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
const helpIconSource = require('../assets/exclamation.png');
const manualBankIconSource = require('../assets/bank.png');
const infoIconSource = require('../assets/exclamation(1).png');
const secureIconSource = require('../assets/shield-check(1).png');
const phonePeIconSource = require('../assets/phonepe.png');
const gpayIconSource = require('../assets/gpay.png');
const upiLogoSource = require('../assets/upi.png');

const BankVerificationScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('phonepe');

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleVerify = () => {
    navigation.navigate('BankConfirmation');
  };

  return (
    // SafeAreaView wraps the entire screen content
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={backIconSource}
            style={[styles.backIconImage, { tintColor: COLORS.text.primary }]}
           />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
          <Image source={helpIconSource} style={styles.helpIconImage} />
          <Text style={styles.helpText}>NEED HELP?</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        style={styles.scrollView} // Added style for ScrollView flex
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled" // Good practice for forms in ScrollView
      >
        {/* Removed contentPadding View, padding applied by contentContainerStyle */}
        <Text style={[styles.title, { color: COLORS.text.primary }]}>Bank Verification</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '17%' }]} />
        </View>

        <Text style={[styles.subtitle, { color: COLORS.text.primary }]}>Bank account verification</Text>
        <Text style={styles.description}>Bank Account is required to securely add or withdraw funds.</Text>

        {/* Payment Options */}
        <View style={styles.optionsContainer}>
          {/* PhonePe Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedMethod === 'phonepe' && styles.selectedOption
            ]}
            onPress={() => handleMethodSelect('phonepe')}
          >
            <View style={styles.optionContent}>
              <View style={styles.radioButton}>
                {selectedMethod === 'phonepe' && <View style={styles.radioButtonInner} />}
              </View>
              <Image source={phonePeIconSource} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: COLORS.text.primary }]}>Phone Pe</Text>
            </View>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          </TouchableOpacity>

          {/* GPay Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedMethod === 'gpay' && styles.selectedOption
            ]}
            onPress={() => handleMethodSelect('gpay')}
          >
            <View style={styles.optionContent}>
              <View style={styles.radioButton}>
                {selectedMethod === 'gpay' && <View style={styles.radioButtonInner} />}
              </View>
              <Image source={gpayIconSource} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: COLORS.text.primary }]}>GPay</Text>
            </View>
          </TouchableOpacity>

          {/* Manual Bank Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedMethod === 'manual' && styles.selectedOption
            ]}
            onPress={() => handleMethodSelect('manual')}
          >
            <View style={styles.optionContent}>
              <View style={styles.radioButton}>
                {selectedMethod === 'manual' && <View style={styles.radioButtonInner} />}
              </View>
              <Image source={manualBankIconSource} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: COLORS.text.primary  }]}>Add Bank Details Manually</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* InfoBox, Verify Button, Security Note are MOVED outside ScrollView */}
      </ScrollView>

      {/* Fixed Bottom Action Area */}
      <View style={styles.bottomActionContainer}>
         {/* Info Box */}
        <View style={styles.infoBox}>
          <Image source={infoIconSource} style={styles.infoIconImage} />
          <Text style={styles.infoText}>
            We will debit ₹1 from your bank account, which will be refunded after verification within 48 hours.
          </Text>
        </View>

        {/* Verify Button */}
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>VERIFY WITH</Text>
          <Image source={upiLogoSource} style={styles.upiLogo} />
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Image source={secureIconSource} style={styles.secureIconImage} />
          <Text style={styles.securityText}>Your bank account details are safe and secure with us.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure SafeAreaView takes full screen
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10, // Added margin to push header down slightly from notch/status bar
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  helpText: {
    color: '#25C866',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
      flex: 1, // Allows ScrollView to take available space above bottom container
  },
  scrollContentContainer: { // Changed from contentPadding
    paddingHorizontal: 16,
    paddingBottom: 16, // Padding at the end of scrollable content
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
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
  },
  description: {
    color: '#666666',
    marginBottom: 24,
    fontSize: 14,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24, // Space before end of ScrollView or start of bottom content
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(37, 200, 102, 0.1)',
    borderColor: '#25C866',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#25C866',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25C866',
  },
  optionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  recommendedBadge: {
    backgroundColor: 'rgba(37, 200, 102, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    color: '#25C866',
    fontSize: 12,
    fontWeight: '500',
  },
  // Styles for bottom fixed elements moved outside ScrollView
  bottomActionContainer: {
      paddingHorizontal: 16, // Match content padding
      paddingTop: 8, // Add some space above the info box
      // Bottom padding is handled by SafeAreaView automatically
      // If using SafeAreaView from 'react-native' and not 'react-native-safe-area-context',
      // you might need manual bottom padding:
      // paddingBottom: Platform.select({ ios: 34, default: 16 }),
  },
  infoBox: {
    backgroundColor: 'rgba(37, 200, 102, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16, // Adjusted margin for spacing within bottom container
  },
  infoIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: '#25C866',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16, // Adjusted margin
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  upiLogo: {
    height: 28,
    width: 48,
    resizeMode: 'contain',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 20, // Add some final padding at the bottom
  },
  secureIconImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  securityText: {
    color: '#666666',
    fontSize: 14,
    
  },
  // Removed TextInput style if TextInput isn't used - Re-added based on original code.
  input: {
    // This style was missing in the provided snippet, but needed if TextInput exists
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
    // Remember to set borderColor and color using theme, e.g.,
    // borderColor: colors.border, color: colors.text
  },
});


export default BankVerificationScreen;