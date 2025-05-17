import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type WatchlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Watchlist'>;

const WatchlistScreen = () => {
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  const [watchlists, setWatchlists] = useState([
    {
      id: '1',
      name: 'My Watchlist',
      stocks: [
        { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2850.50, change: 1.25 },
        { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3800.75, change: -0.50 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1450.20, change: 0.80 },
      ],
    },
    {
      id: '2',
      name: 'Tech Stocks',
      stocks: [
        { symbol: 'INFY', name: 'Infosys', price: 1650.00, change: 2.10 },
        { symbol: 'TECHM', name: 'Tech Mahindra', price: 1350.00, change: 3.50 },
      ],
    },
  ]);

  const renderStockItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stockItem}
      onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
    >
      <View style={styles.stockInfo}>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
        <Text style={[styles.change, item.change >= 0 ? styles.positive : styles.negative]}>
          {item.change >= 0 ? '+' : ''}{item.change}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderWatchlist = ({ item }) => (
    <View style={styles.watchlistContainer}>
      <View style={styles.watchlistHeader}>
        <Text style={styles.watchlistName}>{item.name}</Text>
        <TouchableOpacity>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={item.stocks}
        renderItem={renderStockItem}
        keyExtractor={(stock) => stock.symbol}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlists</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={watchlists}
        renderItem={renderWatchlist}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#00FF7F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  watchlistContainer: {
    marginBottom: 24,
  },
  watchlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  watchlistName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#00FF7F',
    fontSize: 14,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    color: '#666666',
    fontSize: 14,
    marginTop: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 14,
    marginTop: 4,
  },
  positive: {
    color: '#00FF7F',
  },
  negative: {
    color: '#FF4444',
  },
});

export default WatchlistScreen; 