import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Checkbox } from 'react-native-paper';
import { RootStackParamList } from '../types/navigation';
type PrivacyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrivacyScreen'>;
const PrivacyScreen = ({ navigation }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Privacy</Text>
          <Text style={styles.paragraph}>
            A mobile app privacy policy is a legal statement that must be clear,
            conspicuous, and consented to by all users. It must disclose how a mobile app
            gathers, stores, and uses the personally identifiable information it collects
            from its users.
          </Text>

          <Text style={styles.paragraph}>
            A mobile privacy app is developed and presented to users so that mobile app
            developers stay compliant with state, federal, and international laws. As a
            result, they fulfill the legal requirement to safeguard user privacy while
            protecting the company itself from legal challenges.
          </Text>

          <Text style={styles.sectionTitle}>Authorized Users</Text>

          <Text style={styles.paragraph}>
            A mobile app privacy policy is a legal statement that must be clear,
            conspicuous, and consented to by all users. It must disclose how a mobile app
            gathers, stores, and uses the personally identifiable information it collects
            from its users.
          </Text>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={isChecked ? 'checked' : 'unchecked'}
              onPress={() => setIsChecked(!isChecked)}
              color="#22C55E"
            />
            <Text style={styles.checkboxText}>
              I agree to the Term of service and Privacy policy
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              !isChecked && styles.acceptButtonDisabled
            ]}
            onPress={() => {
              if (isChecked) {
                // Handle acceptance
                navigation.navigate('Market');
              }
            }}
            disabled={!isChecked}
          >
            <Text style={styles.acceptButtonText}>I Accept</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  checkboxText: {
    color: '#9CA3AF',
    marginLeft: 8,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#374151',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PrivacyScreen; 