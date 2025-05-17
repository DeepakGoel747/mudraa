// src/screens/WalletScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// --- Color Constants (Consistent with HomeScreen) ---
const screenBackgroundColor = '#000000';
const cardBackgroundColor = '#1A1A1A';
const textColor = '#FFFFFF';
const secondaryTextColor = '#8E8E93';
const primaryColor = '#25C866'; // Green for positive actions
const accentColorBlue = '#0A84FF'; // Blue for general actions

const WalletScreen: React.FC = () => {
    // Dummy data - replace with actual data fetching
    const portfolioValue = "1,25,678.50";
    const availableFunds = "50,234.10";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={screenBackgroundColor} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Wallet</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
                    <Text style={styles.balanceValue}>₹{portfolioValue}</Text>
                    <View style={styles.separatorLine} />
                    <Text style={styles.balanceLabel}>Available Funds</Text>
                    <Text style={styles.balanceSmallValue}>₹{availableFunds}</Text>
                    
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={[styles.actionButton, {backgroundColor: primaryColor}]}>
                            <Icon name="add-circle-outline" size={20} color={textColor} style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}>Deposit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, {backgroundColor: accentColorBlue}]}>
                             <Icon name="arrow-down-circle-outline" size={20} color={textColor} style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Assets</Text>
                    {/* Replace with a FlatList of assets */}
                    <View style={styles.assetItemCard}>
                        <View style={styles.assetInfo}>
                            <Icon name="logo-bitcoin" size={30} color={primaryColor} style={{marginRight: 12}} />
                            <View>
                                <Text style={styles.assetName}>Bitcoin (BTC)</Text>
                                <Text style={styles.assetQuantity}>0.0056 BTC</Text>
                            </View>
                        </View>
                        <View style={styles.assetValue}>
                            <Text style={styles.assetName}>₹75,230.10</Text>
                            <Text style={[styles.assetChange, {color: primaryColor}]}>+5.20%</Text>
                        </View>
                    </View>
                     <View style={styles.assetItemCard}>
                        <View style={styles.assetInfo}>
                             <Icon name="cash-outline" size={30} color={textColor} style={{marginRight: 12}} />
                            <View>
                                <Text style={styles.assetName}>Indian Rupee (INR)</Text>
                                <Text style={styles.assetQuantity}>Available Balance</Text>
                            </View>
                        </View>
                        <View style={styles.assetValue}>
                            <Text style={styles.assetName}>₹{availableFunds}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.seeAllButton}>
                        <Text style={styles.seeAllButtonText}>View All Assets</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                     <View style={styles.card}>
                        <Text style={styles.cardText}>Transaction History Coming Soon...</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: screenBackgroundColor,
    },
    header: {
        backgroundColor: cardBackgroundColor,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D2D',
        alignItems: 'center',
    },
    headerTitle: {
        color: textColor,
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContentContainer: {
        paddingBottom: 20,
    },
    balanceCard: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 20,
        alignItems: 'center',
    },
    balanceLabel: {
        color: secondaryTextColor,
        fontSize: 14,
        marginBottom: 4,
    },
    balanceValue: {
        color: textColor,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    balanceSmallValue: {
        color: textColor,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    separatorLine: {
        height: 1,
        width: '50%',
        backgroundColor: '#2D2D2D',
        marginVertical: 15,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    actionButtonIcon: {
        marginRight: 8,
    },
    actionButtonText: {
        color: textColor,
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginTop: 30,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: textColor,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    assetItemCard: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    assetInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assetName: {
        color: textColor,
        fontSize: 16,
        fontWeight: '500',
    },
    assetQuantity: {
        color: secondaryTextColor,
        fontSize: 13,
    },
    assetValue: {
        alignItems: 'flex-end',
    },
    assetChange: {
        fontSize: 13,
        fontWeight: '500',
    },
    seeAllButton: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    seeAllButtonText: {
        color: primaryColor,
        fontSize: 15,
        fontWeight: '600',
    },
    card: { // Generic card for "coming soon"
        backgroundColor: cardBackgroundColor,
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardText: {
        color: secondaryTextColor,
        fontSize: 14,
    }
});

export default WalletScreen;
