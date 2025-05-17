import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const MarketScreen = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'under100', label: 'Under ₹100' },
    { id: 'under500', label: 'Under ₹500' },
    { id: '52high', label: '52W High' },
    { id: '52low', label: '52W Low' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Mudraa</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Market Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.selectedTab]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text style={[styles.tabText, selectedTab === tab.id && styles.selectedTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content area for stock list */}
      <View style={styles.contentContainer} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1616',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },
  tabsContainer: {
    marginTop: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4169E1',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#4169E1',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
});

export default MarketScreen; 