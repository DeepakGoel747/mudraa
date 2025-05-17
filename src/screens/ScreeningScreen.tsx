import React from 'react';
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

type RootStackParamList = {
  Screen: undefined;
  Create: undefined;
};

type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Screen'>;

const ScreeningScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const screenCategories = [
    {
      title: 'POPULAR THEMES',
      description: 'Popular investing themes',
      items: [
        'Low on 10 year average earnings',
        'Capacity expansion',
        'Debt reduction...',
        'Companies creating new high',
        'Growth without dilution',
        'FII Buying',
        'Popular formulas'
      ]
    },
    {
      title: 'SCREENING FORMULAS',
      description: 'Screening formulas based on books',
      items: [
        'Piotroski Scan',
        'Magic Formula',
        'Coffee Can Portfolio'
      ]
    },
    {
      title: 'PRICE OR VOLUME',
      description: 'Screens based on price or volume action',
      items: [
        'Darvas Scan',
        'Golden Crossover',
        'Bearish Crossovers',
        'Price Volume Action',
        'RSI - Oversold Stocks'
      ]
    },
    {
      title: 'QUARTERLY RESULTS',
      description: 'Screens around latest quarterly results',
      items: [
        'The Bull Cartel',
        'Quarterly Growers',
        'Best of latest quarter',
        'All Latest QTR Results [Date Wise]'
      ]
    },
    {
      title: 'VALUATION SCREENS',
      description: 'Screens based on stock valuations',
      items: [
        'Highest Dividend Yield Shares',
        'Loss to Profit Companies',
        'FCF yield',
        'High Ratio of Market Value of Investments',
        'Book value over 5 times price'
      ]
    },
    {
      title: 'POPULAR STOCK SCREENS',
      description: 'Popular screens commonly used by investors',
      items: [
        'FII Buying',
        'The Bull Cartel',
        'Magic Formula',
        'Low on 10 year average earnings',
        'Growth Stocks',
        'Highest Dividend Yield Shares',
        'Companies creating new high',
        'Piotroski Scan',
        'Capacity expansion'
      ]
    }
  ];

  const renderThemeItem = (text: string) => (
    <TouchableOpacity style={styles.themeItem} key={text}>
      <Text style={styles.themeText}>{text}</Text>
      <Text style={styles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stock screens</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('Create')}
        >
          <Text style={styles.createButtonText}>CREATE NEW</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {screenCategories.map((category, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{category.title}</Text>
            <Text style={styles.sectionDescription}>{category.description}</Text>
            {category.items.map(item => renderThemeItem(item))}
          </View>
        ))}
        <TouchableOpacity style={styles.showAllButton}>
          <Text style={styles.showAllText}>Show all screens</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💱</Text>
          <Text style={styles.navText}>Exchange</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>🔍</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👛</Text>
          <Text style={styles.navText}>Wallet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#00FF7F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    marginBottom: 76,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 16,
  },
  themeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  arrowIcon: {
    color: '#666666',
    fontSize: 20,
  },
  showAllButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    alignItems: 'center',
  },
  showAllText: {
    color: '#00FF7F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    height: 60,
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  activeNavItem: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#666666',
  },
  activeNavIcon: {
    color: '#00FF7F',
  },
  navText: {
    color: '#666666',
    fontSize: 12,
  },
  activeNavText: {
    color: '#00FF7F',
  },
});

export default ScreeningScreen; 