// src/navigation/MyCustomTabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native'; // Added Image import

// --- Color Constants (from your HomeScreen or theme) ---
const primaryColor = '#25C866';      // Active green (for text/icon if applicable)
const secondaryTextColor = '#8E8E93'; // Inactive grey (for text/icon)
const cardBackgroundColor = '#1A1A1A';  // Tab bar background
const textColor = '#FFFFFF';          // General text color (used for active text)

// Define the props your custom tab bar will receive from React Navigation
interface MyCustomTabBarProps {
  state: any; // Contains routes and current index: state.routes, state.index
  descriptors: any;
  navigation: any;
}

const MyCustomTabBar: React.FC<MyCustomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name; // Fallback to route name

        const isFocused = state.index === index;

        let iconPath; // Will hold the path to the image icon

        // Map route names to your image assets
        // These route names must match the names you give in Tab.Screen (e.g., "HomeTab")
        // IMPORTANT: Adjust the paths in require() to match your project structure and image names.
        if (route.name === 'HomeTab') {
          iconPath = isFocused
            ? require('../assets/Home.png') 
            : require('../assets/Home.png');       
        } else if (route.name === 'ExchangeTab') {
          iconPath = isFocused
            ? require('../assets/exhannge.png')
            : require('../assets/exhannge.png');
        } else if (route.name === 'ScreeningTab') {
          iconPath = isFocused
            ? require('../assets/Frame.png')
            : require('../assets/Frame.png');
        } else if (route.name === 'WalletTab') {
          iconPath = isFocused
            ? require('../assets/Icon.png')
            : require('../assets/Icon.png');
        }
        // Add more 'else if' blocks here if you have more tabs

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true, params: route.params });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.navItem, isFocused ? styles.activeNavItem : null]}
          >
            {iconPath && ( // Render the Image component if iconPath is set
              <Image
                source={iconPath}
                style={[
                  styles.navIconImage, // Use new style for image sizing
                  // If your images are single-color templates and you want to tint them:
                  // { tintColor: isFocused ? primaryColor : secondaryTextColor }
                ]}
                resizeMode="contain" // Or "cover", depending on your images
              />
            )}
            <Text style={[styles.navText, isFocused ? styles.activeNavText : null]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// --- Styles for your custom tab bar ---
const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 25 : 65,
    backgroundColor: cardBackgroundColor,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    alignItems: 'stretch',
    paddingBottom: Platform.OS === 'ios' ? 95 : 0,
    paddingTop: Platform.OS === 'ios' ? 15 : 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5, // Add some vertical padding inside the touchable area
  },
  activeNavItem: {
    // Styles for the entire active tab item, if needed (e.g., background highlight)
    // backgroundColor: '#252525', // Example subtle background change
  },
  navIconImage: { // New style specifically for the Image component
    width: 24, // Desired width for your icon
    height: 24, // Desired height for your icon
    marginBottom: 2, // Space between icon and text
  },
  navText: {
    fontSize: 11,
    color: secondaryTextColor, // Inactive text color
    marginTop: 2, // Adjust if navIconImage has marginBottom
    fontWeight: '500',
    textAlign: 'center', // Ensure text is centered if it wraps
  },
  activeNavText: {
    color: primaryColor, // Active text color (using your primaryColor)
    fontWeight: '600',
  },
});

export default MyCustomTabBar;
