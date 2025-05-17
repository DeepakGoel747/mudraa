// src/screens/ExchangeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    StatusBar,
    RefreshControl,
    Platform,
    Dimensions, // Import Dimensions
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation'; // Adjust path
import { api } from '../services/authService'; // Your API service instance
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

// --- Color Constants (Adapted from ExperienceScreen and existing ExchangeScreen) ---
const screenBaseColor = '#11150F'; // Base from ExperienceScreen
const gradientColors = ['#11150F', 'rgba(69, 39, 160, 0.15)', '#11150F']; // Gradient from ExperienceScreen
const cardBackgroundColor = '#1A1A1A'; // Kept for cards
const textColor = '#FFFFFF';
const secondaryTextColor = '#8E8E93';
const primaryColor = '#25C866'; // Green for positive, selected tabs
const negativeColor = '#FF4444'; // Red for negative
const separatorColor = '#2D2D2D'; // Separator color

// --- Type Definitions ---
type ExchangeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExchangeScreen'>;

interface StockAPIResponseItem {
    ticker_id: string;
    ric?: string; // For display, but not primary for navigation
    symbol?: string; // Alternative for display
    company_name: string; // Primary for navigation
    name?: string; // Fallback for company_name
    price: string;
    net_change: string;
    percent_change: string;
}

interface StockDisplayItem {
    id: string;                       // Unique key for FlatList (from ticker_id)
    navigationIdentifier: string;     // Company Name, for navigating to StockDetailScreen
    displaySymbol: string;            // Ticker like RIC to show in the list (e.g., "TISC.NS" or "---")
    displayName: string;              // Company Name to show in the list
    priceDisplay: string;
    changeDisplay: string;
    isPositive: boolean;
}

const ExchangeScreen: React.FC = () => {
    const navigation = useNavigation<ExchangeScreenNavigationProp>();
    const isFocused = useIsFocused();

    const [selectedTab, setSelectedTab] = useState('all');
    const [stocks, setStocks] = useState<StockDisplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tabs = [
        { id: 'all', label: 'All Stocks' },
        { id: 'gainers', label: 'Top Gainers' },
        { id: 'losers', label: 'Top Losers' }
    ];

    const parseNumericValue = (value: string | number | undefined): number => {
        if (value === undefined || value === null || String(value).trim() === "" || String(value).toLowerCase() === "n/a") return 0;
        const cleanedString = String(value).replace(/[+%₹,]/g, '');
        const num = parseFloat(cleanedString);
        return isNaN(num) ? 0 : num;
    };

    const formatPrice = (price: string | number | undefined): string => {
        const numPrice = parseNumericValue(price);
        if (numPrice === 0 && (price === undefined || price === null || String(price).toLowerCase() === "n/a")) return "N/A";
        return `₹${numPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const fetchStocksForTab = useCallback(async (tabId: string, isRefresh: boolean = false) => {
        if (!isRefresh) setIsLoading(true);
        setError(null);
        if (!isRefresh) setStocks([]);

        let endpoint = '';
        switch (tabId) {
            case 'all': endpoint = '/stocks/list'; break;
            case 'gainers': endpoint = '/stocks/market/top-gainers'; break;
            case 'losers': endpoint = '/stocks/market/top-losers'; break;
            default:
                setIsLoading(false); setIsRefreshing(false); return;
        }

        try {
            const response = await api.get(endpoint); // Removed type assertion for more flexible error handling
            const responseData = response.data;

            if (responseData && responseData.error) { // Backend proxied an error
                const errorMsg = responseData.error || responseData.message || `Failed to load ${tabId} stocks.`;
                console.error(`Error fetching data for tab ${tabId} from API:`, errorMsg);
                setError(errorMsg);
                setStocks([]);
                setIsLoading(false); setIsRefreshing(false);
                return;
            }
            
            if (!Array.isArray(responseData)) {
                console.error(`Data for tab ${tabId} is not an array:`, responseData);
                setError(`Unexpected data format for ${tabId}.`);
                setStocks([]);
                setIsLoading(false); setIsRefreshing(false);
                return;
            }
            
            const rawApiData: StockAPIResponseItem[] = responseData;
            const formattedData: StockDisplayItem[] = rawApiData.map((item) => {
                const companyName = item.company_name || item.name || "Unknown Company";
                const tickerForDisplay = item.ric || item.symbol || "---"; // For UI display

                const numericNetChange = parseNumericValue(item.net_change);
                const numericPercentChange = parseNumericValue(item.percent_change);
                const isPositive = numericNetChange >= 0;

                let changeDisplayStr = "N/A";
                if (item.percent_change !== undefined && item.net_change !== undefined) {
                    changeDisplayStr = `${isPositive ? '+' : ''}${numericPercentChange.toFixed(2)}% (${isPositive ? '+' : ''}${numericNetChange.toFixed(2)})`;
                } else if (item.percent_change !== undefined) {
                    changeDisplayStr = `${isPositive ? '+' : ''}${numericPercentChange.toFixed(2)}%`;
                } else if (item.net_change !== undefined) {
                    changeDisplayStr = `${isPositive ? '+' : ''}${numericNetChange.toFixed(2)}`;
                }
                return {
                    id: item.ticker_id || companyName, // Use ticker_id, fallback to companyName
                    navigationIdentifier: companyName, // **CRUCIAL: Use company name for navigation**
                    displaySymbol: tickerForDisplay,
                    displayName: companyName,
                    priceDisplay: formatPrice(item.price),
                    changeDisplay: changeDisplayStr,
                    isPositive: isPositive,
                };
            }).filter(item => item.navigationIdentifier && item.navigationIdentifier.trim() !== '');
            
            setStocks(formattedData);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch stock data.';
            console.error(`Error fetching stocks for tab ${tabId}:`, errorMessage);
            setError(errorMessage);
            setStocks([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused || isRefreshing) { // Fetch when screen is focused or when refresh is triggered
            fetchStocksForTab(selectedTab, isRefreshing);
        }
    }, [selectedTab, isFocused, isRefreshing, fetchStocksForTab]); // Added isRefreshing

    const handleTabPress = (tabId: string) => {
        setSelectedTab(tabId); // This will trigger the useEffect above
    };
    
    const onRefresh = () => {
        setIsRefreshing(true); // This will trigger data fetch in useEffect
    };

    const renderStockItem = ({ item }: { item: StockDisplayItem }) => (
        <TouchableOpacity
            style={styles.stockItem}
            onPress={() => {
                // Navigate with the company name (navigationIdentifier)
                // StockDetailScreen will use its logic to call /details-by-name/
                navigation.navigate('StockDetailScreen', { symbol: item.navigationIdentifier })
            }}
            activeOpacity={0.7}
        >
            <View style={styles.stockInfo}>
                <Text style={styles.stockName} numberOfLines={1}>{item.displayName}</Text>
                {item.displaySymbol && item.displaySymbol !== "---" && 
                    <Text style={styles.stockSymbolSubtitle} numberOfLines={1}>{item.displaySymbol}</Text>
                }
            </View>
            <View style={styles.stockPriceInfoContainer}>
                <Text style={styles.stockPrice}>{item.priceDisplay}</Text>
                <View style={[
                    styles.changeBadge,
                    { backgroundColor: item.isPositive ? 'rgba(37, 200, 102, 0.2)' : 'rgba(255, 68, 68, 0.2)' }
                ]}>
                    <Text style={[
                        styles.stockChangeText,
                        { color: item.isPositive ? primaryColor : negativeColor }
                    ]}>
                        {item.changeDisplay}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View style={styles.listHeaderRow}>
            <Text style={[styles.listHeaderText, styles.listHeaderCompany]}>Company</Text>
            <Text style={[styles.listHeaderText, styles.listHeaderPriceAndChange]}>Last Price / Change</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.baseContainer}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient colors={gradientColors} style={styles.gradientBackground} />
            <View style={styles.contentWrapper}>
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Markets</Text>
                    <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('SearchScreen')}>
                        <Icon name="search-outline" size={24} color={textColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabsContainerWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, selectedTab === tab.id && styles.selectedTab]}
                                onPress={() => handleTabPress(tab.id)}
                            >
                                <Text style={[styles.tabText, selectedTab === tab.id && styles.selectedTabText]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {isLoading && !isRefreshing ? (
                    <View style={styles.centeredView}><ActivityIndicator size="large" color={primaryColor} /></View>
                ) : error && !isRefreshing ? (
                    <View style={styles.centeredView}>
                        <Icon name="cloud-offline-outline" size={50} color={secondaryTextColor} />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => fetchStocksForTab(selectedTab, true)}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={stocks}
                        renderItem={renderStockItem}
                        keyExtractor={(item) => item.id}
                        style={styles.stockList}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListHeaderComponent={stocks.length > 0 ? <ListHeader /> : null}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                                tintColor={textColor} colors={[primaryColor]}
                                progressBackgroundColor={cardBackgroundColor}
                            />
                        }
                        ListEmptyComponent={
                            !isLoading && !isRefreshing && ( // Only show if not loading
                                <View style={styles.centeredView}>
                                    <Icon name="list-circle-outline" size={60} color={secondaryTextColor} />
                                    <Text style={styles.emptyListText}>No data found for {tabs.find(t => t.id === selectedTab)?.label || 'this category'}.</Text>
                                </View>
                            )
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

// --- Styles (incorporating ExperienceScreen's theme) ---
const styles = StyleSheet.create({
    baseContainer: { // Outermost container for gradient
        flex: 1,
        backgroundColor: screenBaseColor, // Base color from ExperienceScreen
    },
    gradientBackground: { // Gradient from ExperienceScreen
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    contentWrapper: { // To ensure content is above gradient
        flex: 1,
        // backgroundColor: 'transparent', // Content sits on gradient
    },
    container: { // Old main container, now for specific content sections if needed
        flex: 1, 
        backgroundColor: 'transparent', // Let gradient show through
    },
    pageHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, 
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 + 10 : 50, // Adjust for translucent status bar
        paddingBottom: 12,
        backgroundColor: 'rgba(26, 26, 26, 0.5)', // Semi-transparent card color for header to sit on gradient
        // borderBottomWidth: 1, // Optional: if you want a separator for header
        // borderBottomColor: separatorColor,
    },
    pageTitle: { color: textColor, fontSize: 22, fontWeight: 'bold' },
    searchButton: { padding: 6 },
    tabsContainerWrapper: { 
        backgroundColor: 'rgba(26, 26, 26, 0.3)', // Semi-transparent tabs background
        // borderBottomWidth: 1, // Optional
        // borderBottomColor: separatorColor,
    },
    tabsContent: { paddingHorizontal: 12, paddingVertical: 10 },
    tab: {
        marginRight: 10, paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20, backgroundColor: 'rgba(44, 44, 46, 0.7)', // Darker, distinct tab background, semi-transparent
    },
    selectedTab: { backgroundColor: primaryColor },
    tabText: { color: secondaryTextColor, fontSize: 14, fontWeight: '600' },
    selectedTabText: { color: textColor, fontWeight: 'bold' },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'transparent' },
    errorText: { color: negativeColor, fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 15 },
    retryButton: { backgroundColor: primaryColor, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, marginTop:15 },
    retryButtonText: { color: textColor, fontSize: 15, fontWeight: 'bold' },
    emptyListText: { color: secondaryTextColor, fontSize: 16, textAlign: 'center', marginTop: 10 },
    stockList: { flex: 1, backgroundColor: 'transparent' },
    listHeaderRow: {
        flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: 'rgba(13, 13, 13, 0.8)', // Darker, semi-transparent header for list
        borderBottomWidth: 1, borderBottomColor: separatorColor,
    },
    listHeaderText: { color: secondaryTextColor, fontSize: 13, fontWeight: '500' },
    listHeaderCompany: { flex: 2.5, marginRight: 8 },
    listHeaderPriceAndChange: { flex: 2, textAlign: 'right' },
    stockItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 16, paddingHorizontal: 16,
        backgroundColor: 'rgba(26, 26, 26, 0.7)', // Semi-transparent card background for items
    },
    stockInfo: { flex: 2.5, marginRight: 8 },
    stockName: { color: textColor, fontSize: 16, fontWeight: '600' }, // Main name
    stockSymbolSubtitle: { color: secondaryTextColor, fontSize: 12, marginTop: 3 }, // For RIC/Symbol display
    stockPriceInfoContainer: { flex: 2, alignItems: 'flex-end' },
    stockPrice: { color: textColor, fontSize: 16, fontWeight: '500', textAlign: 'right', marginBottom: 4 },
    changeBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
        minWidth: 90, alignItems: 'center', justifyContent: 'center',
    },
    stockChangeText: { fontSize: 13, fontWeight: '600' },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: separatorColor },
});

export default ExchangeScreen;
