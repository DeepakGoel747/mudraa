import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type SecurityScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Security'
>;

type SecurityScreenProps = {
  navigation: SecurityScreenNavigationProp;
};

function SecurityScreen({ navigation }: SecurityScreenProps) {
  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy will be displayed here.');
  };

  const handleTermsPress = () => {
    Alert.alert('Terms of Use', 'Terms of Use will be displayed here.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.background}>
        <LinearGradient
          colors={['#11150F', 'rgba(69, 39, 160, 0.15)', '#11150F']}
          style={styles.gradientBackground}
        />
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/images/IMG2.png')}
              style={styles.decorativeImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Top-notch Security{'\n'}and Safety!</Text>
          <Text style={styles.subtitle}>
            With advanced encryption technology, your{'\n'}
            information and assets are protected with{'\n'}
            utmost security.
          </Text>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('Experience')}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you're agree to our{' '}
              <Text style={styles.termsLink} onPress={handlePrivacyPress}>
                Privacy policy
              </Text>
              {' '}and{' '}
              <Text style={styles.termsLink} onPress={handleTermsPress}>
                Term of use
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11150F',
  },
  background: {
    flex: 1,
    backgroundColor: '#11150F',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    position: 'absolute',
    top: height * 0.08,
    alignSelf: 'center',
    width: width,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  decorativeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: height * 0.08,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9B9B9B',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#25C866',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    color: '#9B9B9B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});

export default SecurityScreen; 