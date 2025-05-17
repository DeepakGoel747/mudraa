/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, {useState, useEffect} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Dimensions,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MainTabNavigator from './src/navigation/MainTabNavigator';
// Import existing screens (ensure all paths are correct)
import SecurityScreen from './src/screens/SecurityScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OTPScreen from './src/screens/OTPScreen';
import ExperienceScreen from './src/screens/ExperienceScreen';
import LoginScreen from './src/screens/LoginScreen';
import NewsDetailScreen from './src/newsScreen/NewsDetail';
import ResetPasswordScreen from './src/screens/resetscreen';
import NewPasswordScreen from './src/screens/newPassword';
import NotificationPermissionScreen from './src/screens/notifypermission';
import PasswordChangedScreen from './src/screens/passwordChange';
import SuccessScreen from './src/screens/SuccessScreen';
import PrivacyScreen from './src/screens/privacyScreen';
import KYCScreen from './src/screens/KYCScreen';
import KYCSuccessScreen from './src/screens/KYCSuccessScreen';
import BankVerificationScreen from './src/screens/BankVerificationScreen';
import BankConfirmationScreen from './src/screens/BankConfirmationScreen';
import SelfieVerificationScreen from './src/screens/SelfieVerificationScreen';
import SelfiePreviewScreen from './src/screens/SelfiePreviewScreen';
import SignatureScreen from './src/screens/SignatureScreen';
import SignatureDrawingScreen from './src/screens/SignatureDrawingScreen';
import PersonalDetailsScreen from './src/screens/PersonalDetailsScreen';
import EmploymentDetailsScreen from './src/screens/EmploymentDetailsScreen';
import AdditionalDetailsScreen from './src/screens/AdditionalDetailsScreen';
import MarketScreen from './src/screens/MarketScreen';
import HomeScreen from './src/screens/HomeScreen';
import StockDetailScreen from './src/screens/StockDetailScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import OrderScreen from './src/screens/OrderScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ScreeningScreen from './src/screens/ScreeningScreen';
import CreateScreen from './src/screens/CreateScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HotNewsScreen from './src/newsScreen/news';
import PopularSearchScreen from './src/screens/PopularSearchScreen';
import PersonalInformationScreen from './src/screens/PersonalInformationScreen';
import SearchScreen from './src/screens/searchscreen';
import AdvancedChartScreen from './src/screens/advancechart';
import IndexDetailScreen from './src/screens/indexdetailscreen';

import {RootStackParamList} from './src/types/navigation';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;
type WelcomeScreenProps = {
  navigation: WelcomeScreenNavigationProp;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function WelcomeScreen({navigation}: WelcomeScreenProps) {
  const handlePrivacyPress = () => {
    console.log('Privacy Policy clicked');
    navigation.navigate('PrivacyScreen');
  };
  const handleTermsPress = () => {
    console.log('Terms of Use clicked');
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
              source={require('./assets/images/IMG.png')}
              style={styles.decorativeImage}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome to Mudraa</Text>
          <Text style={styles.subtitle}>
            Discover the world of stock market and{'\n'}
            manage your assets securely and{'\n'}
            conveniently.
          </Text>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('Security')}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you're agree to our{' '}
              <Text style={styles.termsLink} onPress={handlePrivacyPress}>
                Privacy policy
              </Text>{' '}
              and{' '}
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

const AuthStack = createNativeStackNavigator<RootStackParamList>();
function AuthNavigator() {
  console.log('[App.tsx] Rendering AuthNavigator'); // Log when AuthNavigator renders
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Security" component={SecurityScreen} />
      <AuthStack.Screen name="Experience" component={ExperienceScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Success" component={SuccessScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="NewPassword" component={NewPasswordScreen} />
      <AuthStack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
      <AuthStack.Screen name="PrivacyScreen" component={PrivacyScreen} />
      <AuthStack.Screen name="NotificationPermission" component={NotificationPermissionScreen}/>
    </AuthStack.Navigator>
  );
}

const AppStack = createNativeStackNavigator<RootStackParamList>();
function AppNavigator() {
  console.log('[App.tsx] Rendering AppNavigator'); // Log when AppNavigator renders
  return (
    <AppStack.Navigator
      initialRouteName="MainAppTabs"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
        <Stack.Screen name="MainAppTabs" component={MainTabNavigator}  />
      {/* <AppStack.Screen name="Home" component={HomeScreen} /> */}
      <AppStack.Screen name="Market" component={MarketScreen} />
      <AppStack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
      <AppStack.Screen name="StockDetailScreen" component={StockDetailScreen} />
      <AppStack.Screen name="Watchlist" component={WatchlistScreen} />
      <AppStack.Screen name="Order" component={OrderScreen} />
      <AppStack.Screen name="TransactionHistory" component={TransactionHistoryScreen}/>
      <AppStack.Screen name="TransactionDetail" component={TransactionDetailScreen}/>
      <AppStack.Screen name="Portfolio" component={PortfolioScreen} />
      <AppStack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="Screening" component={ScreeningScreen} />
      <AppStack.Screen name="Create" component={CreateScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="NewPassword" component={NewPasswordScreen} />
      {/* It seems Search and PopularSearchScreen might be the same or related. Ensure correct component is used. */}
      <AppStack.Screen name="Search" component={SearchScreen} />
      <AppStack.Screen name="PopularSearchScreen" component={PopularSearchScreen} />
      <AppStack.Screen name="PersonalInformationScreen" component={PersonalInformationScreen} />
      <AppStack.Screen name="SearchScreen" component={SearchScreen} />
      <AppStack.Screen name="AdvancedChartScreen" component={AdvancedChartScreen} />
      <AppStack.Screen name="KYC" component={KYCScreen} />
      <AppStack.Screen name="KYCSuccess" component={KYCSuccessScreen} />
      <AppStack.Screen name="BankVerification" component={BankVerificationScreen} />
      <AppStack.Screen name="BankConfirmation" component={BankConfirmationScreen} />
      <AppStack.Screen name="SelfieVerification" component={SelfieVerificationScreen} />
      <AppStack.Screen name="SelfiePreview" component={SelfiePreviewScreen} />
      <AppStack.Screen name="SignatureScreen" component={SignatureScreen} />
      <AppStack.Screen name="SignatureDrawingScreen" component={SignatureDrawingScreen} />
      <AppStack.Screen name="PersonalDetailsScreen" component={PersonalDetailsScreen} />
      <AppStack.Screen name="EmploymentDetailsScreen" component={EmploymentDetailsScreen} />
      <AppStack.Screen name="AdditionalDetailsScreen" component={AdditionalDetailsScreen} />
      <AppStack.Screen name="IndexDetailScreen" component={IndexDetailScreen}/>
      <AppStack.Screen name="HotNews" component={HotNewsScreen} />
      <AppStack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </AppStack.Navigator>
  );
}

function App(): React.JSX.Element {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  console.log('[App.tsx] App component rendering. Initializing:', initializing, 'User:', user ? user.uid : null);

  function onAuthStateChangedCallback(authUser: FirebaseAuthTypes.User | null) {
    console.log('[App.tsx] onAuthStateChanged CALLED. Auth User:', authUser ? authUser.uid : 'null');
    setUser(authUser);
    if (initializing) {
      console.log('[App.tsx] onAuthStateChanged: Setting initializing to false.');
      setInitializing(false);
    }
  }

  useEffect(() => {
    console.log('[App.tsx] useEffect for onAuthStateChanged is MOUNTING.');
    const subscriber = auth().onAuthStateChanged(onAuthStateChangedCallback);
    return () => {
      console.log('[App.tsx] useEffect for onAuthStateChanged is UNMOUNTING. Unsubscribing.');
      subscriber();
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#11150F',
    },
  };

  if (initializing) {
    console.log('[App.tsx] Rendering Loading Indicator because initializing is true.');
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#25C866" />
        <Text style={styles.loadingText}>Loading Mudraa...</Text>
      </View>
    );
  }

  console.log('[App.tsx] Rendering NavigationContainer. User state:', user ? user.uid : 'null');
  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11150F',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
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

export default App;
