import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  // ImageBackground is removed
  Dimensions,
  Platform,
  Image, // Use Image component again
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// Assuming RootStackParamList is defined elsewhere
type RootStackParamList = {
  Register: undefined;
  OTP: undefined;
  Success: undefined;
  HotNews: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Success'>;

const SuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleDone = () => {
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'HotNews' }],
    // });
    navigation.navigate('Login')
    console.log('Navigated to HotNews and reset stack');
  };

  // const handleBack = () => {
  //   if (navigation.canGoBack()) {
  //       navigation.goBack();
  //   } else {
  //       console.log("Can't go back from Success screen");
  //   }
  // };

  return (
    // Use a standard View with black background
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </TouchableOpacity> */}

      {/* Main content area */}
      <View style={styles.content}>
        {/* Image container placed above text container */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/IMG4.png')} // Make sure path is correct
            style={styles.image} // Apply specific styles for size, blur, opacity
            resizeMode="contain"
            blurRadius={5} // Apply blur (adjust value as needed)
          />
        </View>

        {/* Text and button container */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Information received.</Text>
          <Text style={styles.subtitle}>
            Your information has been confirmed.
          </Text>
          <Text style={styles.welcomeText}>
            Welcome to Mudraa!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleDone}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11150F', // Dark background color
  },
  // backgroundImageStyle is removed
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 15,
    zIndex: 1,
    padding: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    // Text shadow removed as background is plain now
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Center image and text block vertically
    alignItems: 'center', // Center items horizontally
    paddingHorizontal: 20,
    paddingBottom: height * 0.05, // Adjust padding if needed
  },
  // Re-add and adjust imageContainer style
  imageContainer: {
    width: width * 0.8, // Adjust width as desired
    height: height * 0.4, // Adjust height as desired
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Space between image and text
  },
  // Re-add and adjust image style
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.4, // Make image semi-transparent to blend (adjust value 0.0-1.0)
  },
  textContainer: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensure no background
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
     // Text shadow removed
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
     // Text shadow removed
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
     // Text shadow removed
  },
  button: {
    backgroundColor: '#25C866',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    height: 56,
    justifyContent: 'center',
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, },
        android: { elevation: 3, },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default SuccessScreen;
