// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import ScreeningScreen from '../screens/ScreeningScreen';
import WalletScreen from '../screens/WalletScreen';

import MyCustomTabBar from './MyCustomTabBar'; // Import your custom tab bar

export type BottomTabParamList = {
  HomeTab: undefined;
  ExchangeTab: undefined;
  ScreeningTab: undefined;
  WalletTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      // Pass your custom component to the tabBar prop
      tabBar={props => <MyCustomTabBar {...props} />}
      // screenOptions can be minimal now, as MyCustomTabBar handles appearance
      screenOptions={{
        headerShown: false, // Keep this if your screens manage their own headers
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }} // Label used in MyCustomTabBar
      />
      <Tab.Screen
        name="ExchangeTab"
        component={ExchangeScreen}
        options={{ tabBarLabel: 'Exchange' }}
      />
      <Tab.Screen
        name="ScreeningTab"
        component={ScreeningScreen}
        options={{ tabBarLabel: 'Screen' }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{ tabBarLabel: 'Wallet' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
