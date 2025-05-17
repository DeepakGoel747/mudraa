import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  ScrollView,
  TextInput, // Keep TextInput if it's used elsewhere or planned
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
// --- Navigation Setup ---
type RootStackParamList = {
  KYC: undefined;
  BankConfirmation: undefined;
  SelfieVerification: undefined;
  SelfiePreview: { imageUri: string };
  SignatureScreen: undefined;
  SignatureDrawingScreen: undefined;
  PersonalDetailsScreen: undefined;
  EmploymentDetailsScreen: undefined;
  TradingBackgroundScreen: undefined;
};

type PersonalDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonalDetailsScreen'>;

type PersonalDetailsScreenProps = {
  navigation: PersonalDetailsNavigationProp;
};

// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
// helpIconSource is removed as the button is removed
const checkboxCheckedIconSource = require('../assets/checkbox.png');
const tradingLinkIconSource = require('../assets/angle-right.png');
const incomeIllustrationSource = require('../assets/salary.png'); // UPDATE PATH

// --- Component ---
const PersonalDetailsScreen: React.FC<PersonalDetailsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const primaryColor = '#25C866';
  const screenBackgroundColor = COLORS.background || '#F8F9FA';
  const defaultTextColor = COLORS.text.primary  || '#000000';
  const secondaryTextColor = colors.text ? `rgba(${parseInt(colors.text.slice(1,3), 16)}, ${parseInt(colors.text.slice(3,5), 16)}, ${parseInt(colors.text.slice(5,7), 16)}, 0.6)` : '#555';
  const borderColor = colors.border || '#CCCCCC';
  const selectedButtonBackgroundColor = 'rgba(37, 200, 102, 0.1)';

  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const incomeRanges = ['₹ 1-5 lakh', '₹ 5-10 lakh', '₹ 10-25 lakh', 'Above ₹25 lakh'];

  const handleSelectIncome = (income: string) => {
    setSelectedIncome(income);
  };

  const handleToggleWhatsapp = () => {
    setWhatsappUpdates(!whatsappUpdates);
  };

  const handleNavigateTradingBackground = () => {
    console.log('Navigate to Trading Background');
    // navigation.navigate('TradingBackgroundScreen');
  };

  const handleNext = () => {
    if (!selectedIncome) {
      console.log('Income range selection required');
      return;
    }
    console.log('Selected Income:', selectedIncome);
    console.log('WhatsApp Updates:', whatsappUpdates);
    navigation.navigate('EmploymentDetailsScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBackgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={backIconSource}
            style={[styles.headerIconImage, { tintColor: COLORS.text.primary  }]}
           />
        </TouchableOpacity>
         <Text style={[styles.headerTitle, { color: defaultTextColor }]}>Personal Details</Text>
         {/* Placeholder to balance back button and center title */}
         <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
             <Text style={[styles.progressText, { color: primaryColor }]}>76%</Text>
             <View style={[styles.progressBar, {backgroundColor: borderColor}]}>
             <View style={[styles.progressFill, { width: '76%', backgroundColor: primaryColor }]} />
             </View>
         </View>

        <Text style={[styles.sectionTitle, { color: defaultTextColor }]}>Annual Income Details</Text>
        <Text style={[styles.description, { color: secondaryTextColor}]}>
             Select your annual earning range
        </Text>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={incomeIllustrationSource}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Income Range Selection */}
        <View style={styles.incomeGrid}>
          {incomeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.incomeButton,
                {
                    backgroundColor: selectedIncome === range ? selectedButtonBackgroundColor : (COLORS.background  || '#FFFFFF'),
                    borderColor: selectedIncome === range ? primaryColor : borderColor
                },
                selectedIncome === range && styles.incomeButtonSelected,
              ]}
              onPress={() => handleSelectIncome(range)}
            >
              <Text style={[
                styles.incomeButtonText,
                { color: selectedIncome === range ? primaryColor : defaultTextColor },
                selectedIncome === range && styles.incomeButtonTextSelected,
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* WhatsApp Checkbox */}
        <TouchableOpacity style={styles.checkboxContainer} onPress={handleToggleWhatsapp}>
           <View style={[styles.checkboxBase, {borderColor: whatsappUpdates ? primaryColor : borderColor}]}>
               {whatsappUpdates ? (
                   <Image source={checkboxCheckedIconSource} style={styles.checkboxIconImage} />
               ) : (
                   null // Empty view for unchecked state
               )}
           </View>
          <Text style={[styles.checkboxLabel, { color: defaultTextColor}]}>
            Get updates and notifications on WhatsApp
          </Text>
        </TouchableOpacity>

        {/* Trading Background Link */}
        <TouchableOpacity onPress={handleNavigateTradingBackground} style={styles.linkButton}>
            <Text style={[styles.linkButtonText, { color: secondaryTextColor}]}>
              Your trading and regulatory background
            </Text>
            <Image
                source={tradingLinkIconSource}
                style={[styles.linkIconImage, { tintColor: secondaryTextColor }]}
            />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={[styles.bottomButtonContainer, { borderTopColor: borderColor, backgroundColor: screenBackgroundColor }]}>
        <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleNext}
          >
          <Text style={styles.actionButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between', // Key for centering title with placeholders
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12, // Added requested margin
    borderBottomWidth: 1,
    // borderBottomColor set inline
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
  headerTitle: {
     fontSize: 18,
     fontWeight: '600',
     textAlign: 'center', // Ensure title text itself is centered if needed
     // color set inline
  },
  headerPlaceholder: { // To balance the back button for title centering
      width: 24 + 8 + 8, // Match approx width of back button icon + padding
      height: 24, // Match icon height
  },
  // helpButton style removed
  // helpText style removed
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
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
      // backgroundColor set inline
  },
  progressFill: {
      height: '100%',
      borderRadius: 3,
      // backgroundColor set inline
  },
  progressText: {
      fontSize: 14,
      fontWeight: '600',
      // color set inline
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    // color set inline
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    // color set inline
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 30,
    height: 150,
    justifyContent: 'center',
  },
  illustration: {
    width: '50%',
    height: '100%',
  },
  incomeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  incomeButton: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeButtonSelected: {
    borderWidth: 1.5,
  },
  incomeButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  incomeButtonTextSelected: {
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  checkboxBase: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  checkboxIconImage: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
    // color set inline
  },
  linkButton: {
      marginBottom: 30,
      paddingVertical: 10,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
  },
  linkButtonText: {
      fontSize: 16,
      fontWeight: '500',
      marginRight: 4,
      // color set inline
  },
  linkIconImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    // tintColor set inline
  },
  bottomButtonContainer: {
     paddingHorizontal: 16,
     paddingBottom: Platform.OS === 'ios' ? 30 : 24,
     paddingTop: 10,
     borderTopWidth: 1,
     // borderTopColor, backgroundColor set dynamically
   },
  actionButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // backgroundColor set dynamically
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalDetailsScreen;