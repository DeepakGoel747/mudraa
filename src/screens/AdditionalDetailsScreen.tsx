// src/screens/AdditionalDetailsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput,
  Modal,       // Kept if you plan to use the settlement modal later
  Pressable,   // Kept for modal
  Image,
  Alert,       // Added Alert for validation messages
} from 'react-native';
// Removed Icon from react-native-vector-icons/Ionicons as we are replacing it with an Image for the checkmark
// import Icon from 'react-native-vector-icons/Ionicons'; 
import { useTheme } from '@react-navigation/native'; // Still useful if your COLORS are tied to theme
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors'; // Using your COLORS constant

// --- Navigation Setup ---
// Ensure this matches your actual navigation setup
type RootStackParamList = {
  EmploymentDetailsScreen: undefined;
  AdditionalDetailsScreen: undefined;
  NextKYCStepScreen3: undefined; // Example, adjust as needed
  // ... other screens
  Home:undefined;
};

type AdditionalDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdditionalDetailsScreen'>;
};

// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
const incomeIllustrationSource = require('../assets/income-illustration.png'); // Ensure this path is correct
const checkboxCheckedIconSource = require('../assets/checkbox.png'); // For selected state, ensure this asset exists

// --- Component ---
const AdditionalDetailsScreen: React.FC<AdditionalDetailsScreenProps> = ({ navigation }) => {
  // Using COLORS directly for explicitness as requested for dark theme matching
  const primaryColor = COLORS.primary; 
  const screenBackgroundColor = COLORS.background; 
  const cardBackgroundColor = COLORS.card; 
  const defaultTextColor = COLORS.text.primary; 
  const secondaryTextColor = COLORS.text.secondary; 
  const tertiaryTextColor = COLORS.text.tertiary; 
  const borderColor = COLORS.border; 
  const selectedButtonBackgroundColor = 'rgba(37, 200, 102, 0.1)'; // Light green tint for selection

  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string | null>(null);
  const [fatherName, setFatherName] = useState('');
  
  // The following states were in your provided code, uncomment if needed for other sections
  // const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  // const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  // const [settlementFrequency, setSettlementFrequency] = useState('Quarterly'); 
  // const [isSettlementPickerVisible, setIsSettlementPickerVisible] = useState(false);
  // const [marginConsent, setMarginConsent] = useState(true); 

  const genderOptions = ['Female', 'Male', 'Other'];
  const maritalStatusOptions = ['Unmarried', 'Married', 'Divorced'];

  const handleSelectGender = (gender: string) => {
    setSelectedGender(gender === selectedGender ? null : gender); // Allow toggle
  };

  const handleSelectMaritalStatus = (status: string) => {
    setSelectedMaritalStatus(status === selectedMaritalStatus ? null : status); // Allow toggle
  };

  const handleContinue = () => {
    if (!selectedGender) {
        Alert.alert('Selection Required', 'Please select your gender.');
        return;
    }
    if (!selectedMaritalStatus) {
        Alert.alert('Selection Required', 'Please select your marital status.');
        return;
    }
    if (!fatherName.trim()) {
        Alert.alert('Input Required', "Please enter your father's full name.");
        return;
    }
    console.log('Selected Gender:', selectedGender);
    console.log('Selected Marital Status:', selectedMaritalStatus);
    console.log("Father's Name:", fatherName);
    // navigation.navigate('NextKYCStepScreen3'); // Your actual next screen
    //Alert.alert("Progress Saved (Placeholder)", "Navigating to EmploymentDetailsScreen...");
    navigation.navigate('Home'); // Example navigation
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBackgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={backIconSource}
            style={[styles.headerIconImage, { tintColor: defaultTextColor }]}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: defaultTextColor }]} numberOfLines={1}>
            Personal Details
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: primaryColor }]}>100%</Text>
            <View style={[styles.progressBar, {backgroundColor: cardBackgroundColor }]}>
              <View style={[styles.progressFill, { width: '100%', backgroundColor: primaryColor }]} />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: defaultTextColor }]}>Additional Details</Text>

          {/* --- Gender Selection --- */}
          <Text style={[styles.subSectionTitle, { color: secondaryTextColor }]}>Select Gender</Text>
          <View style={styles.selectionRow}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectionButton,
                  styles.genderButton,
                  { 
                    backgroundColor: selectedGender === option ? selectedButtonBackgroundColor : cardBackgroundColor,
                    borderColor: selectedGender === option ? primaryColor : borderColor 
                  },
                ]}
                onPress={() => handleSelectGender(option)}
              >
                {selectedGender === option && (
                  // MODIFIED: Using Image for checkmark
                  <Image source={checkboxCheckedIconSource} style={[styles.selectedIconImage, { tintColor: primaryColor }]} />
                )}
                <Text style={[
                  styles.selectionButtonText,
                  { color: selectedGender === option ? primaryColor : defaultTextColor },
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- Marital Status Selection --- */}
          <Text style={[styles.subSectionTitle, { color: secondaryTextColor }]}>Select Marital Status</Text>
          <View style={styles.selectionRow}>
            {maritalStatusOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectionButton, 
                  styles.maritalButton,
                  { 
                    backgroundColor: selectedMaritalStatus === option ? selectedButtonBackgroundColor : cardBackgroundColor,
                    borderColor: selectedMaritalStatus === option ? primaryColor : borderColor
                  },
                ]}
                onPress={() => handleSelectMaritalStatus(option)}
              >
                 {selectedMaritalStatus === option && (
                  // MODIFIED: Using Image for checkmark
                  <Image source={checkboxCheckedIconSource} style={[styles.selectedIconImage, { tintColor: primaryColor }]} />
                )}
                <Text style={[
                  styles.selectionButtonText,
                  { color: selectedMaritalStatus === option ? primaryColor : defaultTextColor },
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- Father's Name Input --- */}
          <Text style={[styles.subSectionTitle, { color: secondaryTextColor }]}>Father's Name</Text>
          <TextInput
            style={[styles.input, { 
                borderColor: borderColor, 
                color: defaultTextColor, 
                backgroundColor: cardBackgroundColor 
            }]}
            placeholder="Enter Father's Full Name"
            placeholderTextColor={tertiaryTextColor} // Use a more muted placeholder color
            value={fatherName}
            onChangeText={setFatherName}
            autoCapitalize="words"
          />
          
          {/* Other sections like Annual Income, WhatsApp, Trading Background, Modal for Settlement were commented out */}
          {/* in your provided code, so I've kept them out of the main flow unless you need to add them back. */}

        </View>
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
    </SafeAreaView>
  );
};

// --- Styles (Adapted for Dark Theme based on the image and your constants) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.background, // Applied inline via screenBackgroundColor
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 20 : 10, // Consistent with previous version
    borderBottomWidth: 1,
    // borderBottomColor: COLORS.border, // Applied inline
  },
  backButton: {
    padding: 8,
    marginLeft: -8, 
  },
  headerIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    // tintColor: COLORS.text.primary, // Applied inline
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center', 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color: COLORS.text.primary, // Applied inline
  },
  headerPlaceholder: { 
    width: 24 + 16, 
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, 
  },
  mainContent: {
    paddingHorizontal: 20, 
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24, 
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 7, 
    borderRadius: 3.5,
    marginLeft: 10,
    overflow: 'hidden',
    // backgroundColor: COLORS.card, // Applied inline
  },
  progressFill: {
    height: '100%',
    borderRadius: 3.5,
    // backgroundColor: COLORS.primary, // Applied inline
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold', 
    // color: COLORS.primary, // Applied inline
  },
  sectionTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 20, 
    // color: COLORS.text.primary, // Applied inline
  },
  subSectionTitle: {
    fontSize: 16, 
    fontWeight: '500', 
    marginBottom: 12, 
    // color: COLORS.text.secondary, // Applied inline
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginBottom: 25, 
  },
  selectionButton: {
    borderWidth: 1.5, 
    borderRadius: 8,
    paddingVertical: 15, 
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', 
    // backgroundColor, borderColor applied inline based on selection
  },
  genderButton: { 
    flex: 1, 
    marginHorizontal: 4, 
  },
  maritalButton: { 
    flex: 1, 
    marginHorizontal: 4, 
  },
  selectionButtonText: {
    fontSize: 14, 
    fontWeight: '600', 
    // color applied inline based on selection
  },
  selectedIconImage: { // Style for the Image based checkmark
    width: 18, // Or your preferred size
    height: 18,
    resizeMode: 'contain',
    marginRight: 8, 
    // tintColor: COLORS.primary, // Applied inline
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 30, 
    // borderColor, color, backgroundColor applied inline
  },
  bottomButtonContainer: {
    paddingHorizontal: 20, 
    paddingVertical: 15,   
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, 
    borderTopWidth: 1,
    // borderTopColor, backgroundColor applied inline
  },
  actionButton: {
    height: 50, 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // backgroundColor applied inline
  },
  actionButtonText: {
    color: COLORS.text.primary, // White text on green button
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdditionalDetailsScreen;
