import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image, // Import Image
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
// Icon import removed as all icons are now replaced by images
// import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Optional
import { COLORS } from '../constants/colors';
// --- Navigation Setup ---
type RootStackParamList = {
  PersonalDetailsScreen: undefined;
  EmploymentDetailsScreen: undefined;
  AdditionalDetailsScreen: undefined;
  TradingBackgroundScreen: undefined; // Added for link navigation
};

// --- Prop Types ---
type EmploymentDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmploymentDetailsScreen'>;

type EmploymentDetailsScreenProps = {
  navigation: EmploymentDetailsNavigationProp;
};

// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
const dropdownIconSource = require('../assets/angle-down.png');
const checkboxCheckedIconSource = require('../assets/checkbox.png');
const tradingLinkIconSource = require('../assets/angle-right.png');
const checkCircleIconSource = require('../assets/check-circle.png'); // For modal
// NOTE: Update this path when you have the illustration
const incomeIllustrationSource = require('../assets/income-illustration.png');

// --- Component ---
const EmploymentDetailsScreen: React.FC<EmploymentDetailsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const primaryColor = '#25C866';
  const screenBackgroundColor = COLORS.background || '#F8F9FA';
  const defaultTextColor = COLORS.text.primary  || '#000000';
  const secondaryTextColor = COLORS.text.primary   ? `rgba(${parseInt(colors.text.slice(1,3), 16)}, ${parseInt(colors.text.slice(3,5), 16)}, ${parseInt(colors.text.slice(5,7), 16)}, 0.6)` : '#555';
  const borderColor = COLORS.border || '#CCCCCC';
  const selectedButtonBackgroundColor = 'rgba(37, 200, 102, 0.1)';
  const buttonBackgroundColor = 'transparent';

  const [selectedEmployment, setSelectedEmployment] = useState<string | null>(null);
  const [otherEmploymentText, setOtherEmploymentText] = useState('');
  const settlementOptions = ['Monthly', 'Quarterly'];
  const [settlementFrequency, setSettlementFrequency] = useState(settlementOptions[1]);
  const [isSettlementPickerVisible, setIsSettlementPickerVisible] = useState(false);
  const [marginConsent, setMarginConsent] = useState(true);

  const employmentTypes = ['Government', 'Private', 'Business', 'Others'];


  const handleSelectEmployment = (type: string) => {
    setSelectedEmployment(type);
    if (type !== 'Others') {
      setOtherEmploymentText('');
    }
  };

  const handleOpenSettlementPicker = () => {
    setIsSettlementPickerVisible(true);
  };

  const handleSelectSettlementFrequency = (frequency: string) => {
    setSettlementFrequency(frequency);
    setIsSettlementPickerVisible(false);
  };

  const handleToggleMarginConsent = () => {
    setMarginConsent(!marginConsent);
  };

  const handleNavigateTradingBackground = () => {
    console.log('Navigate to Trading Background');
    // navigation.navigate('TradingBackgroundScreen');
  };

  const handleContinue = () => {
    if (!selectedEmployment) {
       console.log('Employment type selection required');
       return;
     }
    if (selectedEmployment === 'Others' && !otherEmploymentText.trim()) {
        console.log('Specification required for Others');
        return;
    }
    console.log('Selected Employment:', selectedEmployment);
    if (selectedEmployment === 'Others') {
       console.log('Other Specification:', otherEmploymentText);
    }
    console.log('Settlement Frequency:', settlementFrequency);
    console.log('Margin Consent:', marginConsent);
    console.log('Navigate to Additional Details Screen');
    navigation.navigate('AdditionalDetailsScreen');
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBackgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           {/* === Back Icon Updated === */}
          <Image
            source={backIconSource}
            style={[styles.headerIconImage, { tintColor: defaultTextColor }]}
           />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: defaultTextColor }]} numberOfLines={1}>
             Personal Details {/* Or Employment Details */}
          </Text>
        </View>
        {/* Placeholder to balance back button (Help button removed) */}
        <View style={styles.headerPlaceholder} />
        {/* Help Button Removed */}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: primaryColor }]}>82%</Text>
              <View style={[styles.progressBar, {backgroundColor: borderColor}]}>
              <View style={[styles.progressFill, { width: '82%', backgroundColor: primaryColor }]} />
              </View>
          </View>

          <Text style={[styles.sectionTitle, { color: defaultTextColor }]}>Select Employment Type</Text>
          <Text style={[styles.description, { color: COLORS.text.secondary }]}>
              If others, please specify
          </Text>

          {/* Employment Type Selection */}
          <View style={styles.selectionGrid}>
          {employmentTypes.map((type) => (
              <TouchableOpacity
              key={type}
              style={[
                  styles.selectionButton,
                  { backgroundColor: selectedEmployment === type ? selectedButtonBackgroundColor : (COLORS.background|| '#FFFFFF'), borderColor: selectedEmployment === type ? primaryColor : borderColor },
                  selectedEmployment === type && styles.selectionButtonSelected,
              ]}
              onPress={() => handleSelectEmployment(type)}
              >
              {/* Original Optional Checkmark Icon (Vector) Kept */}
              {selectedEmployment === type && (
                  <Image source={checkCircleIconSource} style={styles.selectedIcon} />
                  // Or use vector icon if preferred:
                  // <Icon name="checkmark-circle" size={18} color={primaryColor} style={styles.selectedIcon} />
              )}
              <Text style={[
                  styles.selectionButtonText,
                  { color: selectedEmployment === type ? primaryColor : COLORS.text.primary  },
                  selectedEmployment === type && styles.selectionButtonTextSelected,
              ]}>
                  {type}
              </Text>
              </TouchableOpacity>
          ))}
          </View>

          {/* 'Others' Specification Input */}
          {selectedEmployment === 'Others' && (
              <TextInput
                  style={[styles.input, { borderColor: borderColor, color: defaultTextColor, backgroundColor: COLORS.background || '#FFFFFF' }]}
                  placeholder="Please specify employment type"
                  placeholderTextColor={secondaryTextColor + '80'}
                  value={otherEmploymentText}
                  onChangeText={setOtherEmploymentText}
                  autoCapitalize="sentences"
              />
          )}

          {/* Fund Settlement Info */}
           <View style={styles.infoSection}>
              <Text style={[styles.infoTitle, { color: defaultTextColor }]}>Fund Settlement Frequency</Text>
              <View style={styles.settlementRow}>
                  <Text style={[styles.settlementStaticText, { color: COLORS.text.secondary }]}>
                     I want my unused funds to be settled after every{' '}
                  </Text>
                  <TouchableOpacity
                      style={[
                          styles.dropdownTouchable,
                          { borderColor: borderColor, backgroundColor: buttonBackgroundColor }
                      ]}
                      onPress={handleOpenSettlementPicker}
                  >
                      <Text style={[styles.dropdownText, { color: defaultTextColor}]}>
                          {settlementFrequency}
                      </Text>
                       {/* === Dropdown Icon Updated === */}
                      <Image
                          source={dropdownIconSource}
                          style={[styles.dropdownIconImage, { tintColor: COLORS.text.secondary  }]}
                      />
                  </TouchableOpacity>
              </View>
          </View>
        </View>

        {/* Consent Checkbox Area */}
        <TouchableOpacity
            style={[styles.consentContainer, styles.checkboxContainer]}
            onPress={handleToggleMarginConsent}
            >
             {/* === Checkbox Icon Updated === */}
            <View style={[styles.checkboxBase, {borderColor: marginConsent ? primaryColor : borderColor}]}>
                {marginConsent ? (
                    <Image source={checkboxCheckedIconSource} style={styles.checkboxIconImage} />
                ) : (
                    null // Empty view for unchecked state
                )}
            </View>
            <Text style={[styles.consentText, styles.checkboxLabel, { color: COLORS.text.secondary }]}>
                I hereby give my consent to enable Margin Trading Facility
            </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={[styles.bottomButtonContainer, { borderTopColor: borderColor, backgroundColor: screenBackgroundColor }]}>
        <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleContinue}
          >
          <Text style={styles.actionButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>

      {/* Settlement Frequency Picker Modal */}
      <Modal
        transparent={true}
        visible={isSettlementPickerVisible}
        animationType="fade"
        onRequestClose={() => setIsSettlementPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsSettlementPickerVisible(false)}>
          <View style={[styles.pickerModalContent, { backgroundColor: COLORS.background || '#FFFFFF' }]}>
            <Text style={[styles.pickerTitle, { color: defaultTextColor}]}>Select Frequency</Text>
            {settlementOptions.map(option => (
              <TouchableOpacity
                  key={option}
                  onPress={() => handleSelectSettlementFrequency(option)}
                  style={[styles.pickerOption, { borderBottomColor: borderColor }]}
                  >
                <Text style={[styles.pickerOptionText, { color: defaultTextColor}]}>{option}</Text>
                {settlementFrequency === option && (
                   // Using Image for consistency
                   <Image source={checkCircleIconSource} style={styles.pickerCheckIcon} />
                )}
              </TouchableOpacity>
            ))}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsSettlementPickerVisible(false)}
             >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles ---
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Kept original padding
    borderBottomWidth: 1,
    marginTop: 12, // Original margin
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerIconImage: { // For Back icon (and removed Help icon)
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 10,
  },
  headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
  },
  headerPlaceholder: { // Placeholder to balance back button
      width: 24 + 8 + 8, // Approx width of back button touchable
      height: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  mainContent: {
    paddingHorizontal: 16,
  },
  progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 24,
  },
  progressBar: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      marginLeft: 10,
      overflow: 'hidden',
  },
  progressFill: {
      height: '100%',
      borderRadius: 3,
  },
  progressText: {
      fontSize: 14,
      fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  selectionButton: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // Kept from original
  },
  selectionButtonSelected: {
    borderWidth: 1.5,
  },
  selectionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center', // Kept from original
  },
  selectionButtonTextSelected: {
    fontWeight: 'bold', // Reverted to original 'bold' if specified
  },
  selectedIcon: { // Style for optional checkmark inside selection buttons
     width: 18,
     height: 18,
     resizeMode: 'contain',
     marginRight: 5,
  },
  input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      marginBottom: 30,
  },
  infoSection: {
      marginBottom: 25,
  },
  infoTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
  },
  settlementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
  },
  settlementStaticText: {
      fontSize: 16,
      lineHeight: 24,
      marginRight: 5,
  },
  dropdownTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
  },
  dropdownText: {
      fontSize: 16,
      fontWeight: '500',
  },
  dropdownIconImage: { // Style for the angle-down image
      width: 18,
      height: 18,
      resizeMode: 'contain',
      marginLeft: 8,
  },
  consentContainer: {
      paddingHorizontal: 16,
  },
  checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      marginBottom: 5,
  },
  checkboxBase: { // Container for visual part of checkbox
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  checkboxIconImage: { // For the checked image
      width: 20,
      height: 20,
      resizeMode: 'contain',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  consentText: {
      fontSize: 14,
      lineHeight: 20,
  },
  linkButton: { // Style kept from previous version if needed
      marginBottom: 30,
      paddingVertical: 10,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16, // Needs padding if mainContent doesn't have it
  },
  linkButtonText: { // Kept from previous
      fontSize: 16,
      fontWeight: '500',
      marginRight: 4,
  },
  linkIconImage: { // Style for the angle-right image
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  bottomButtonContainer: {
     paddingHorizontal: 16,
     paddingBottom: Platform.OS === 'ios' ? 30 : 24,
     paddingTop: 10,
     borderTopWidth: 1,
   },
  actionButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles kept exactly as original
  modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerModalContent: {
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      paddingTop: 10,
      paddingBottom: Platform.OS === 'ios' ? 30 : 20,
      maxHeight: '50%',
  },
  pickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
  },
  pickerOption: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  pickerOptionText: {
      fontSize: 16,
  },
  pickerCheckIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
  },
  cancelButton: {
      marginTop: 10,
      paddingVertical: 15,
      alignItems: 'center',
  },
  cancelButtonText: {
      fontSize: 16,
      color: '#D32F2F',
      fontWeight: '600',
  },
});


export default EmploymentDetailsScreen;