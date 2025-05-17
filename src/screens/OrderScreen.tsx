import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type OrderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderScreen'>;

const OrderScreen = () => {
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const route = useRoute();
  const [transactionType, setTransactionType] = useState('buy'); // 'buy' or 'sell'
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState('market'); // 'market' or 'limit'

  const stockData = {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    currentPrice: 2850.50,
    change: 1.25,
  };

  const handleOrder = () => {
    if (!quantity || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // TODO: Implement order placement logic
    Alert.alert(
      'Order Placed',
      `${transactionType.toUpperCase()} order placed for ${quantity} shares of ${stockData.symbol} at ₹${price}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {transactionType === 'buy' ? 'Buy' : 'Sell'} {stockData.symbol}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Stock Info */}
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{stockData.name}</Text>
          <Text style={styles.currentPrice}>₹{stockData.currentPrice.toLocaleString()}</Text>
          <Text style={[styles.change, stockData.change >= 0 ? styles.positive : styles.negative]}>
            {stockData.change >= 0 ? '+' : ''}{stockData.change}%
          </Text>
        </View>

        {/* Order Type Toggle */}
        <View style={styles.orderTypeContainer}>
          <TouchableOpacity
            style={[styles.orderTypeButton, transactionType === 'buy' && styles.selectedOrderType]}
            onPress={() => setTransactionType('buy')}
          >
            <Text
              style={[styles.orderTypeText, transactionType === 'buy' && styles.selectedOrderTypeText]}
            >
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderTypeButton, transactionType === 'sell' && styles.selectedOrderType]}
            onPress={() => setTransactionType('sell')}
          >
            <Text
              style={[styles.orderTypeText, transactionType === 'sell' && styles.selectedOrderTypeText]}
            >
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Enter price"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[styles.orderTypeButton, orderType === 'market' && styles.selectedOrderType]}
              onPress={() => setOrderType('market')}
            >
              <Text
                style={[styles.orderTypeText, orderType === 'market' && styles.selectedOrderTypeText]}
              >
                Market
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.orderTypeButton, orderType === 'limit' && styles.selectedOrderType]}
              onPress={() => setOrderType('limit')}
            >
              <Text
                style={[styles.orderTypeText, orderType === 'limit' && styles.selectedOrderTypeText]}
              >
                Limit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>
                ₹{((Number(quantity) || 0) * (Number(price) || 0)).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            style={[styles.placeOrderButton, transactionType === 'buy' ? styles.buyButton : styles.sellButton]}
            onPress={handleOrder}
          >
            <Text style={styles.placeOrderButtonText}>
              {transactionType === 'buy' ? 'Buy' : 'Sell'} {stockData.symbol}
            </Text>
          </TouchableOpacity>
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
  stockInfo: {
    padding: 16,
    alignItems: 'center',
  },
  stockName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  currentPrice: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 16,
    marginTop: 4,
  },
  positive: {
    color: '#00FF7F',
  },
  negative: {
    color: '#FF4444',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 4,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedOrderType: {
    backgroundColor: '#00FF7F',
  },
  orderTypeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedOrderTypeText: {
    color: '#000000',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  summary: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#666666',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeOrderButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buyButton: {
    backgroundColor: '#00FF7F',
  },
  sellButton: {
    backgroundColor: '#FF4444',
  },
  placeOrderButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderScreen; 