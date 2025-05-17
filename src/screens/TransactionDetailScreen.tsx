import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type TransactionDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionDetail'
>;

type TransactionDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetail'
>;

const TransactionDetailScreen = () => {
  const navigation = useNavigation<TransactionDetailScreenNavigationProp>();
  const route = useRoute<TransactionDetailScreenRouteProp>();
  const { transactionId } = route.params;

  // Mock transaction data - in a real app, this would be fetched from an API
  const transaction = {
    id: transactionId,
    type: 'buy',
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    quantity: 10,
    price: 2850.50,
    total: 28505.00,
    date: '2024-03-15 10:30 AM',
    status: 'completed',
    orderId: 'ORD123456',
    exchange: 'NSE',
    segment: 'EQ',
    brokerage: 20.00,
    taxes: 28.50,
    totalCharges: 48.50,
    netAmount: 28553.50,
  };

  const renderDetailRow = (label: string, value: string | number) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.transactionHeader}>
            <View style={styles.stockInfo}>
              <Text style={styles.symbol}>{transaction.symbol}</Text>
              <Text style={styles.name}>{transaction.name}</Text>
            </View>
            <Text
              style={[
                styles.transactionType,
                transaction.type === 'buy' ? styles.buyType : styles.sellType,
              ]}
            >
              {transaction.type.toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Transaction Information</Text>
            {renderDetailRow('Order ID', transaction.orderId)}
            {renderDetailRow('Date & Time', transaction.date)}
            {renderDetailRow('Exchange', transaction.exchange)}
            {renderDetailRow('Segment', transaction.segment)}
            {renderDetailRow('Status', transaction.status.toUpperCase())}
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Trade Details</Text>
            {renderDetailRow('Quantity', transaction.quantity)}
            {renderDetailRow('Price', `₹${transaction.price.toLocaleString()}`)}
            {renderDetailRow('Total Amount', `₹${transaction.total.toLocaleString()}`)}
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Charges</Text>
            {renderDetailRow('Brokerage', `₹${transaction.brokerage.toLocaleString()}`)}
            {renderDetailRow('Taxes', `₹${transaction.taxes.toLocaleString()}`)}
            {renderDetailRow('Total Charges', `₹${transaction.totalCharges.toLocaleString()}`)}
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Net Amount</Text>
            {renderDetailRow('Net Amount', `₹${transaction.netAmount.toLocaleString()}`)}
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockInfo: {
    flex: 1,
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    color: '#666666',
    fontSize: 16,
    marginTop: 4,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  detailsSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666666',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TransactionDetailScreen; 