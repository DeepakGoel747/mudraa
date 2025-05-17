import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image, // Import Image
} from 'react-native';
// Icon import removed as it's no longer used
// import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { COLORS } from '../constants/colors';
type RootStackParamList = {
  KYC: undefined;
  BankConfirmation: undefined;
  SelfieVerification: undefined;
  // Add other relevant screens if needed
};

type BankConfirmationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BankConfirmation'>;

type BankConfirmationScreenProps = {
  navigation: BankConfirmationNavigationProp; // Use specific type
};

// --- Define Icon Path ---
// Adjust path if your assets folder is different relative to this file
const backIconSource = require('../assets/angle-left.png');

const BankConfirmationScreen: React.FC<BankConfirmationScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [hasBankDetails, setHasBankDetails] = useState(false);

  const handleContinue = () => {
    // Original navigation logic
    navigation.navigate('SelfieVerification');
  };

  // Added handler for consistency if button remains (original code had this)
  const handleAddBankDetails = () => {
      setHasBankDetails(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          {/* Replaced Icon with Image */}
          <Image
            source={backIconSource}
            style={[styles.backIconImage, { tintColor: COLORS.text.primary  }]} // Apply theme text color
           />
        </TouchableOpacity>
        {/* No title or other buttons in the original header snippet */}
      </View>

      {/* Progress Section */}
      {/* --- CONTENT REMAINS UNCHANGED FROM YOUR PROVIDED CODE --- */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: COLORS.text.primary  }]}>Bank Verification</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '41%' }]} />
        </View>

        <Text style={[styles.subtitle, { color: COLORS.text.primary  }]}>Add Bank Details</Text>
        <Text style={styles.description}>
          Please add your bank account details through UPI or manually to proceed with the verification.
        </Text>

        {/* Bank Details Card */}
        <View style={styles.bankCard}>
          <Text style={[styles.bankName, { color: COLORS.text.primary }]}>Bank Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Account Name</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Account Number</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>IFSC Code</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !hasBankDetails && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!hasBankDetails}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        {/* Add Bank Details */}
        {/* Conditionally render based on state */}
        {!hasBankDetails && (
           <TouchableOpacity
               style={styles.editButton}
               onPress={handleAddBankDetails} // Use the handler
           >
               <Text style={styles.editButtonText}>ADD BANK DETAILS</Text>
           </TouchableOpacity>
        )}
      </View>
      {/* --- END OF UNCHANGED CONTENT --- */}
    </SafeAreaView>
  );
};

// Styles from your provided code, with addition of backIconImage
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Original padding
    marginBottom: 8, // Original margin
    // JustifyContent left by default if only one item
    marginTop: 12, // Original margin
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Compensate padding for visual alignment
  },
  backIconImage: { // Added style for the image icon
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333', // Original color
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#25C866', // Original color
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#666666', // Original color
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  bankCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Original color
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  label: {
    color: '#666666', // Original color
    fontSize: 14,
    marginBottom: 8,
  },
  placeholder: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Original color
    borderRadius: 4,
  },
  continueButton: {
    backgroundColor: '#25C866', // Original color
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5, // Original opacity
  },
  buttonText: {
    color: '#FFFFFF', // Original color
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#25C866', // Original color
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BankConfirmationScreen;