import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const PortfolioScreen = () => {
  const [selectedTab, setSelectedTab] = useState('positions');

  const tabs = [
    { id: 'positions', label: 'Positions' },
    { id: 'holdings', label: 'Holdings' },
    { id: 'orders', label: 'Orders' },
  ];

  const marketIndices = [
    {
      name: 'NIFTY 50',
      value: '23,851.65',
      change: '+414.45',
      percentChange: '1.76%',
      isPositive: true,
    },
    {
      name: 'SENSEX',
      value: '78,553.20',
      change: '+1508.91',
      percentChange: '1.95%',
      isPositive: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Mudraa</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addMoneyButton}>
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tabs */}
      <View style={styles.tabsContainer}>
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
      </View>

      <ScrollView style={styles.content}>
        {/* Market Indices Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Indices</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.indicesContainer}
        >
          {marketIndices.map((index) => (
            <View key={index.name} style={styles.indexCard}>
              <Text style={styles.indexName}>{index.name}</Text>
              <Text style={styles.indexValue}>{index.value}</Text>
              <Text style={[styles.indexChange, { color: index.isPositive ? '#77CA35' : '#FF5252' }]}>
                {index.change} ({index.percentChange})
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Your Positions Section */}
        <View style={styles.positionsSection}>
          <Text style={styles.positionsTitle}>Your Positions</Text>
          <View style={styles.emptyPositions}>
            <View style={styles.emptyContent}>
              <View style={styles.textContainer}>
                <Text style={styles.buildWealthTitle}>Build Your Wealth</Text>
                <Text style={styles.emptyPositionsText}>
                  You don't have any positions in your portfolio.
                </Text>
                <TouchableOpacity style={styles.activateButton}>
                  <Text style={styles.activateButtonText}>Activate F&O</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  addMoneyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  tab: {
    marginRight: 24,
    paddingVertical: 12,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#77CA35',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  viewAll: {
    color: '#77CA35',
    fontSize: 14,
    fontWeight: '500',
  },
  indicesContainer: {
    paddingLeft: 16,
    marginBottom: 24,
  },
  indexCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 180,
  },
  indexName: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 8,
  },
  indexValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  indexChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  positionsSection: {
    paddingHorizontal: 16,
  },
  positionsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyPositions: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
  },
  emptyContent: {
    alignItems: 'flex-start',
  },
  textContainer: {
    width: '100%',
  },
  buildWealthTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyPositionsText: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 24,
  },
  activateButton: {
    backgroundColor: '#77CA35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PortfolioScreen; 