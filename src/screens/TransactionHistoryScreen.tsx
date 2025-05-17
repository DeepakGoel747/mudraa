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

type TransactionHistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionHistory'
>;

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<TransactionHistoryScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'buy', label: 'Buy' },
    { id: 'sell', label: 'Sell' },
    { id: 'dividend', label: 'Dividend' },
  ];

  const transactions = [
    {
      id: '1',
      type: 'buy',
      symbol: 'RELIANCE',
      name: 'Reliance Industries',
      quantity: 10,
      price: 2850.50,
      total: 28505.00,
      date: '2024-03-15 10:30 AM',
      status: 'completed',
    },
    {
      id: '2',
      type: 'sell',
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      quantity: 5,
      price: 3800.75,
      total: 19003.75,
      date: '2024-03-14 02:15 PM',
      status: 'completed',
    },
    {
      id: '3',
      type: 'dividend',
      symbol: 'HDFCBANK',
      name: 'HDFC Bank',
      amount: 250.00,
      date: '2024-03-13 09:00 AM',
      status: 'completed',
    },
  ];

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.stockInfo}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Text
          style={[
            styles.transactionType,
            item.type === 'buy' ? styles.buyType : item.type === 'sell' ? styles.sellType : styles.dividendType,
          ]}
        >
          {item.type.toUpperCase()}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        {item.type !== 'dividend' ? (
          <>
            <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
            <Text style={styles.price}>Price: ₹{item.price.toLocaleString()}</Text>
          </>
        ) : (
          <Text style={styles.amount}>Amount: ₹{item.amount.toLocaleString()}</Text>
        )}
        <Text style={styles.total}>Total: ₹{item.total?.toLocaleString() || item.amount.toLocaleString()}</Text>
      </View>

      <View style={styles.transactionFooter}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={[styles.status, item.status === 'completed' ? styles.completedStatus : styles.pendingStatus]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filters}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterButton, selectedFilter === filter.id && styles.selectedFilter]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[styles.filterText, selectedFilter === filter.id && styles.selectedFilterText]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  selectedFilter: {
    backgroundColor: '#00FF7F',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedFilterText: {
    color: '#000000',
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  transactionType: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buyType: {
    backgroundColor: '#00FF7F',
    color: '#000000',
  },
  sellType: {
    backgroundColor: '#FF4444',
    color: '#FFFFFF',
  },
  dividendType: {
    backgroundColor: '#4169E1',
    color: '#FFFFFF',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  quantity: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  total: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666666',
    fontSize: 12,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedStatus: {
    color: '#00FF7F',
  },
  pendingStatus: {
    color: '#FFA500',
  },
});

export default TransactionHistoryScreen; 