import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  ScrollView,
  // Clipboard, // Import if implementing copy functionality
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation'; // Adjust path if needed

// --- Define Icon Paths ---
const backIconSource = require('../assets/angle-left.png');
const forwardIconSource = require('../assets/angle-right.png');
// const copyIconSource = require('../assets/copy-icon.png'); // Path if copy icon is added

// Define Navigation Prop Type for this screen
// Ensure RootStackParamList includes 'Profile'
type PersonalInfoNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonalInformationScreen'>;

type PersonalInformationScreenProps = {
  navigation: PersonalInfoNavigationProp;
};

// --- Reusable Row Component ---
interface DetailRowProps {
  label: string;
  value?: string | null;
  showArrow?: boolean;
  showCopy?: boolean;
  onPress?: () => void;
  onCopy?: (value: string) => void;
  isLink?: boolean;
  showBottomBorder?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  showArrow,
  showCopy,
  onPress,
  onCopy,
  isLink = false,
  showBottomBorder = false,
}) => {
  const handleCopy = () => {
    if (value && onCopy) {
      onCopy(value);
      console.log('Copied:', value);
    }
  };

  const rowStyle = [
      styles.detailRowContainer,
      showBottomBorder && styles.detailRowBorder
  ];

  const content = (
    <View style={rowStyle}>
      <Text style={isLink ? styles.linkLabel : styles.detailLabel}>{label}</Text>
      {value ? <Text style={styles.detailValue}>{value}</Text> : <View style={styles.valuePlaceholder} />}
      {showArrow && !showCopy && (
        <Image source={forwardIconSource} style={styles.arrowIcon} />
      )}
      {/* Copy icon logic remains commented out */}
      {/* {showCopy && value && !showArrow && (
        <TouchableOpacity onPress={handleCopy}>
          <Image source={copyIconSource} style={styles.copyIcon} />
        </TouchableOpacity>
      )} */}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
  ) : (
    content
  );
};


// --- Main Screen Component ---
const PersonalInformationScreen: React.FC<PersonalInformationScreenProps> = ({ navigation }) => {
  // --- Data Cleared ---
  const userData = {
    profilePictureAction: () => console.log('Navigate to Profile Picture Edit'),
    fullName: null,
    dob: null,
    mobile: null,
    mobileAction: () => console.log('Navigate to Mobile Edit'),
    email: null,
    emailAction: () => console.log('Navigate to Email Edit'),
    pan: null,
    gender: null,
    maritalStatus: null,
    maritalStatusAction: () => console.log('Navigate to Marital Status Edit'),
    incomeRange: null,
  };

  const dematData = {
    uid: null,
    boid: null,
    dpId: null,
    dpName: null,
    depositoryName: null,
    nominees: null,
    nomineesAction: () => console.log('Navigate to Nominees'),
  };

  const closeAccountAction = () => console.log('Navigate to Close Account');

  const handleCopyToClipboard = (textToCopy: string) => {
    console.log(`Copied: ${textToCopy}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         {/* === Updated Back Button Navigation === */}
        <TouchableOpacity
            onPress={() => navigation.navigate('Profile')} // Explicitly navigate to 'Profile'
            // Note: navigation.goBack() is usually preferred for back buttons
            style={styles.backButton}
            >
          <Image source={backIconSource} style={styles.headerIconImage} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
         {/* Personal Details Section */}
         <DetailRow label="Profile picture" showArrow onPress={userData.profilePictureAction} isLink />
         <DetailRow label="Full Name (as on PAN card)" value={userData.fullName} />
         <DetailRow label="Date of Birth" value={userData.dob} />
         <DetailRow label="Mobile Number" value={userData.mobile} showArrow onPress={userData.mobileAction} />
         <DetailRow label="Email" value={userData.email} showArrow onPress={userData.emailAction} />
         <DetailRow label="PAN number" value={userData.pan} />
         <DetailRow label="Gender" value={userData.gender} />
         <DetailRow label="Marital Status" value={userData.maritalStatus} showArrow onPress={userData.maritalStatusAction}/>
         <DetailRow label="Income Range" value={userData.incomeRange} showBottomBorder={true} />

         {/* Demat Details Section */}
         <View style={styles.sectionContainer}>
             <Text style={styles.sectionTitle}>Demat details</Text>
             <DetailRow label="UID" value={dematData.uid} showCopy onCopy={handleCopyToClipboard} />
             <DetailRow label="Demat Acc Number/ BOID" value={dematData.boid} showCopy onCopy={handleCopyToClipboard} />
             <DetailRow label="DP ID" value={dematData.dpId} showCopy onCopy={handleCopyToClipboard} />
             <DetailRow label="Depository Participant(DP)" value={dematData.dpName} showCopy onCopy={handleCopyToClipboard} />
             <DetailRow label="Depository Name" value={dematData.depositoryName} showCopy onCopy={handleCopyToClipboard} />
             <DetailRow label="Nominees" value={dematData.nominees} showCopy onCopy={handleCopyToClipboard} showBottomBorder={true} />
         </View>

          {/* Close Account Link */}
         <View style={styles.sectionContainer}>
             <DetailRow label="Close Mudraa demat & trading account" showArrow onPress={closeAccountAction} isLink />
         </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles --- (Copied from previous version)
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
    marginTop: 18,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 24 + 8 + 8,
    height: 24,
  },
  detailRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  detailRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: '#1e1e1e',
  },
  detailLabel: {
    fontSize: 15,
    color: '#8E8E93',
    flexShrink: 1,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'right',
    flex: 1,
  },
  valuePlaceholder: {
      flex: 1,
      height: 18,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#8E8E93',
    marginLeft: 12,
  },
  copyIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      tintColor: '#8E8E93',
      marginLeft: 12,
  },
  linkLabel: {
      fontSize: 15,
      color: '#FFFFFF',
      flex: 1,
  },
  sectionContainer: {
      marginTop: 24,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
    paddingHorizontal: 16,
  },
});

export default PersonalInformationScreen;