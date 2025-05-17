import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image, // Ensure Image is imported
  // Icon is no longer needed here
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
// Removed Icon import if it's not used elsewhere in this file
// import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation'; // Assuming this path is correct
import { COLORS } from '../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList,'KYC'>;

// Define paths for the icons (adjust relative path if needed)
const exclamationIcon = require('../../src/assets/exclamation.png');
const shieldCheckIcon = require('../../src/assets/shield-check(1).png');
const backIconImageSource = require('../../src/assets/angle-left.png'); // Added back icon image

const KYCScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleProceed = () => {
    navigation.navigate('KYCSuccess');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          {/* Replaced Icon with Image */}
          <Image
             source={backIconImageSource}
             style={[styles.backIconImage, { tintColor: COLORS.text.primary }]} // Apply tintColor from theme
           />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton} onPress={()=>navigation.navigate('Home')}>
          <Image source={exclamationIcon} style={styles.helpIconImage} />
          <Text style={styles.helpText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, { color: COLORS.text.primary }]}>Pan Verification</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '5%' }]} />
          </View>
        </View>

        <Text style={[styles.subtitle, { color: COLORS.text.primary }]}>Add your PAN Card Details</Text>
        <Text style={styles.description}>PAN Card is mandatory for investing in India</Text>

        {/* PAN Card Preview */}
        <View style={styles.panCardContainer}>
          <View style={styles.panCard}>
            {/* ... (PAN Card content remains the same) ... */}
             <View style={styles.panCardHeader}>
               <View style={styles.avatarPlaceholder} />
               <View style={styles.headerText}>
                 <Text style={styles.panCardTitle}>Permanent Account Number Card</Text>
                 <Text style={styles.panCardNumber}>XXXXX XXXX XXXX</Text>
               </View>
             </View>

             <View style={styles.panCardDetails}>
               <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Name</Text>
                 <Text style={styles.detailValue}>XXXXX XXXX XXXX</Text>
               </View>
               <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Father's Name</Text>
                 <Text style={styles.detailValue}>XXXX XXXX XXXX</Text>
               </View>
               <View style={styles.lastRow}>
                 <View style={styles.dobSection}>
                   <Text style={styles.detailLabel}>Date of birth</Text>
                   <Text style={styles.detailValue}>DD/MM/YYYY</Text>
                 </View>
                 <View style={styles.signatureSection}>
                   <View style={styles.signatureLine} />
                   <Text style={styles.signatureText}>Applicant Signature</Text>
                 </View>
               </View>
             </View>
          </View>
        </View>

        {/* Input Field */}
        <TextInput
          style={[styles.input, { borderColor: COLORS.border, color: COLORS.text.primary }]}
          placeholder="Enter PAN Number"
          placeholderTextColor={colors.text}
          autoCapitalize="characters"
        />

        {/* DigiLocker Notice */}
        <View style={styles.digiLockerNotice}>
          <Image source={shieldCheckIcon} style={styles.digiLockerIconImage} />
          <Text style={[styles.digiLockerText, { color: COLORS.text.primary }]}>
            You will be redirected to <Text style={styles.highlight}>DigiLocker</Text>, a secure Government of India-recommended platform, to fetch your PAN and Aadhar documents digitally.
          </Text>
        </View>
      </ScrollView>

      {/* Proceed Button - Fixed at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
          <Text style={styles.proceedButtonText}>PROCEED TO DIGILOCKER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIconImage: { // Style for the back icon image
    width: 24,
    height: 24,
    resizeMode: 'contain',
    // tintColor is applied inline using theme colors.text
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
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
  panCardContainer: {
    marginBottom: 24,
    width: '100%',
    aspectRatio: 1.586,
  },
  panCard: {
    backgroundColor: 'rgba(240, 247, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    height: '100%',
    width: '100%',
  },
  panCardHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(221, 221, 221, 0.1)',
    borderRadius: 21,
  },
  panCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  panCardNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  panCardDetails: {
    flex: 1,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    color: '#999999',
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dobSection: {
    flex: 1,
  },
  signatureSection: {
    alignItems: 'center',
    width: 120,
  },
  signatureLine: {
    width: 80,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
  },
  signatureText: {
    color: '#999999',
    fontSize: 11,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  digiLockerNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37, 200, 102, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  digiLockerIconImage: {
     width: 24,
     height: 24,
     resizeMode: 'contain',
  },
  digiLockerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    color: '#25C866',
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: Platform.select({ ios: 34, default: 16 }),
    backgroundColor: 'transparent',
  },
  proceedButton: {
    backgroundColor: '#25C866',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KYCScreen;
