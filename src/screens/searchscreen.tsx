// src/screens/SearchScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Keyboard,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Still used for some icons
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Image Asset Paths (IMPORTANT: Adjust if your paths or filenames are different) ---
// Assuming your assets folder is one level up from a 'screens' folder where SearchScreen.tsx might be
const searchIconPath = require('../assets/search.png');
const backArrowIconPath = require('../assets/angle-left.png'); // ** ADD YOUR BACK ARROW IMAGE TO ASSETS **

// --- Color Constants (Consider moving to a central theme file) ---
const screenBackgroundColor = '#000000';
const headerBackgroundColor = '#1A1A1A';
const searchInputBackgroundColor = '#2C2C2E';
const primaryColor = '#25C866'; // Green for clear button and other primary actions
const textColor = '#FFFFFF';
const secondaryTextColor = '#8E8E93';
const errorColor = '#FF4444';
const borderColor = '#2D2D2D'; // General border color for header
const listItemBorderColor = '#2C2C2E'; // DEFINED: Border color for list items
const placeholderTextColor = '#8E8E93';
const promptIconColor = '#4A4A4A';

interface StockSearchResultAPIItem {
    id: string | number;
    commonName: string;
    exchangeCodeNsi?: string;
    exchangeCodeBse?: string;
    nseRic?: string;
    bseRic?: string;
}

interface StockSearchResult {
    id: string;
    navigationIdentifier: string;
    companyName: string;
}

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchScreen'>;

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_ITEMS = 7;

const SearchScreen: React.FC = () => {
    const navigation = useNavigation<SearchScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(true);

    // API Base URL - move to a config file or environment variable in a real app
    const API_BASE_URL = 'http://192.168.1.7:3001/api'; // Replace with your actual API URL

    useEffect(() => {
        loadSearchHistory();
    }, []);

    const loadSearchHistory = async () => {
        try {
            const historyString = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
            if (historyString) {
                setSearchHistory(JSON.parse(historyString));
            }
        } catch (e) {
            console.error("Failed to load search history:", e);
        }
    };

    const saveSearchQuery = async (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        try {
            const lowerCaseQuery = trimmedQuery.toLowerCase();
            const updatedHistory = [
                trimmedQuery,
                ...searchHistory.filter(item => item.toLowerCase() !== lowerCaseQuery)
            ].slice(0, MAX_HISTORY_ITEMS);
            await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
            setSearchHistory(updatedHistory);
        } catch (e) {
            console.error("Failed to save search query:", e);
        }
    };

    const clearSearchHistory = async () => {
        try {
            await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
            setSearchHistory([]);
        } catch (e) {
            console.error("Failed to clear search history:", e);
        }
    };
    
    const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
        let timeout: NodeJS.Timeout | null = null;
        const debounced = (...args: Parameters<F>) => {
            if (timeout !== null) clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), waitFor);
        };
        return debounced as (...args: Parameters<F>) => void;
    };

    const performSearch = async (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setSearchResults([]); setIsLoading(false); setHasSearched(false); setError(null);
            return;
        }
        setIsLoading(true); setError(null); setHasSearched(true);
        Keyboard.dismiss();

        try {
            const response = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(trimmedQuery)}`);
            const responseBody = await response.json();
            
            if (!response.ok) {
                const errorMsg = responseBody?.error || responseBody?.message || `Search failed with status: ${response.status}`;
                throw new Error(errorMsg);
            }

            if (Array.isArray(responseBody)) {
                const mappedResults: StockSearchResult[] = responseBody.map((apiItem: StockSearchResultAPIItem) => {
                    let ticker = apiItem.nseRic || apiItem.exchangeCodeNsi || apiItem.bseRic || apiItem.exchangeCodeBse || null;
                    const navigationId = ticker || apiItem.commonName;
                    return {
                        id: String(apiItem.id || apiItem.commonName),
                        navigationIdentifier: navigationId,
                        companyName: apiItem.commonName || "Unknown Company",
                    };
                }).filter(item => item.navigationIdentifier && item.navigationIdentifier.trim() !== '');
                setSearchResults(mappedResults);
                if (trimmedQuery.length > 0) saveSearchQuery(trimmedQuery);
            } else if (responseBody && (responseBody.error || responseBody.message)) {
                throw new Error(responseBody.error || responseBody.message);
            } else {
                console.warn("Unexpected search data format from server:", responseBody);
                throw new Error('Unexpected data format from server.');
            }
        } catch (e: any) {
            console.error("Search failed:", e);
            setError(e.message || 'Failed to fetch search results.');
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const debouncedSearch = useCallback(debounce(performSearch, 400), [searchHistory]); // searchHistory is a dependency for saveSearchQuery


    const handleInputChange = (text: string) => {
        setSearchQuery(text);
        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
            setSearchResults([]);
            setHasSearched(false);
            setIsLoading(false);
            setError(null);
        } else if (trimmedText.length > 1) {
            setIsLoading(true);
            debouncedSearch(trimmedText);
        } else { // if length is 1, don't search, clear results
            setIsLoading(false);
            setSearchResults([]);
        }
    };

    const handleStockPress = (item: StockSearchResult) => {
        if (item.navigationIdentifier) {
            console.log(`SearchScreen: Navigating to StockDetailScreen with identifier: ${item.navigationIdentifier}`);
            navigation.navigate('StockDetailScreen', { symbol: item.navigationIdentifier });
        } else {
            console.warn("Cannot navigate: No valid navigationIdentifier found for search item:", item);
        }
    };

    const handleHistoryItemPress = (historyQuery: string) => {
        setSearchQuery(historyQuery);
        performSearch(historyQuery);
        setIsInputFocused(false); // Hide history after selection
    };

    const renderResultItem = ({ item }: { item: StockSearchResult }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleStockPress(item)}>
            <View style={styles.resultItemTextContainer}>
                <Text style={styles.resultName} numberOfLines={1}>{item.companyName}</Text>
            </View>
            <Icon name="chevron-forward-outline" size={22} color={promptIconColor} />
        </TouchableOpacity>
    );

    const renderHistoryItem = ({ item }: { item: string }) => (
        <TouchableOpacity style={styles.historyItem} onPress={() => handleHistoryItemPress(item)}>
            <Icon name="time-outline" size={20} color={secondaryTextColor} style={styles.historyIcon} />
            <Text style={styles.historyText}>{item}</Text>
        </TouchableOpacity>
    );
    
    const showSearchResults = !isLoading && !error && hasSearched && searchResults.length > 0;
    const showHistory = !isLoading && !error && !hasSearched && searchHistory.length > 0 && isInputFocused && searchQuery.length === 0;
    const showNoResultsMessage = !isLoading && !error && hasSearched && searchResults.length === 0;
    const showInitialPrompt = !isLoading && !error && !hasSearched && !showHistory && searchQuery.length === 0;

    // Dynamic header style using insets for notch/status bar handling
    const headerDynamicStyle = [
        styles.header,
        { paddingTop: insets.top > 0 ? insets.top + 5 : (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 10 }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={screenBackgroundColor} />
            <View style={styles.container}>
                <View style={headerDynamicStyle}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Image source={backArrowIconPath} style={styles.backButtonIcon} />
                    </TouchableOpacity>
                    <View style={styles.searchInputContainer}>
                        <Image 
                            source={searchIconPath} // Using imported image source
                            style={styles.searchIconInInputImage} 
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for stocks, ETFs..."
                            placeholderTextColor={placeholderTextColor}
                            value={searchQuery}
                            onChangeText={handleInputChange}
                            autoFocus={true}
                            returnKeyType="search"
                            onSubmitEditing={() => performSearch(searchQuery)}
                            onFocus={() => {
                                setIsInputFocused(true);
                                // If query is empty when focusing, allow history to show
                                if (searchQuery.trim().length === 0) {
                                    setHasSearched(false); 
                                    setSearchResults([]);
                                }
                            }}
                            onBlur={() => setIsInputFocused(false)} // Consider UX: maybe don't hide history immediately on blur
                            clearButtonMode="while-editing" // iOS clear button
                        />
                    </View>
                </View>

                {isLoading && <ActivityIndicator size="large" color={textColor} style={styles.loader} />}

                {!isLoading && error && (
                    <View style={styles.messageContainer}>
                        <Icon name="cloud-offline-outline" size={60} color={errorColor} style={{marginBottom:10}}/>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {showSearchResults && (
                    <FlatList
                        data={searchResults}
                        renderItem={renderResultItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContentContainer}
                        keyboardShouldPersistTaps="handled" // Important for tappable items in scroll view
                    />
                )}

                {showHistory && (
                    <View>
                        <View style={styles.historyHeader}>
                            <Text style={styles.historyHeaderText}>Recent Searches</Text>
                            {searchHistory.length > 0 && ( // Only show clear if there's history
                                <TouchableOpacity onPress={clearSearchHistory}>
                                    <Text style={styles.clearHistoryText}>Clear</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <FlatList
                            data={searchHistory}
                            renderItem={renderHistoryItem}
                            keyExtractor={(item, index) => `${item}-${index}`} // More robust key for history
                            contentContainerStyle={styles.listContentContainer}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                )}

                {showNoResultsMessage && (
                    <View style={styles.messageContainer}>
                         <Image source={searchIconPath} style={styles.promptSearchIcon} />
                        <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                        <Text style={styles.promptSubText}>Try a different keyword or check your spelling.</Text>
                    </View>
                )}
                
                {showInitialPrompt && (
                     <View style={styles.messageContainer}>
                        <Image source={searchIconPath} style={styles.promptSearchIcon} />
                        <Text style={styles.promptText}>Search for companies or symbols.</Text>
                        <Text style={styles.promptSubText}>E.g., "Infosys", "RELIANCE.NS", "Nifty 50"</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: screenBackgroundColor,
    },
    container: {
        flex: 1,
        backgroundColor: screenBackgroundColor,
    },
    header: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10, 
        paddingVertical: 8,    
        backgroundColor: headerBackgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        // paddingTop is handled by headerDynamicStyle
    },
    backButton: {
        padding: 8, 
        marginRight: 8, 
    },
    backButtonIcon: {
        width: 24, 
        height: 24, 
        tintColor: textColor, 
    },
    searchInputContainer: { 
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: searchInputBackgroundColor,
        borderRadius: 10,
        height: 48, 
        paddingLeft: 12, 
        paddingRight: 15, 
    },
    searchIconInInputImage: { 
        width: 20,
        height: 20,
        marginRight: 10,
        // tintColor: secondaryTextColor, // Optional: if search.png is a template image
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: textColor,
        fontSize: 17,
    },
    loader: {
        marginTop: 30,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    promptSearchIcon: { 
        width: 60, 
        height: 60,
        marginBottom: 20,
        tintColor: promptIconColor, 
    },
    errorText: {
        color: errorColor,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    noResultsText: {
        color: secondaryTextColor,
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        // marginTop: 15, // Margin now effectively comes from promptSearchIcon
    },
    promptText: {
        color: '#E0E0E0', // Slightly lighter than secondaryTextColor
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        // marginTop: 15, // Margin now effectively comes from promptSearchIcon
    },
    promptSubText: {
        color: secondaryTextColor,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    listContentContainer: {
        paddingBottom: 10, // Ensure last item isn't cut off
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: listItemBorderColor, // Using defined constant
    },
    resultItemTextContainer: {
        flex: 1, // Allow text to take available space
        marginRight: 10, // Space before the chevron
    },
    resultName: {
        color: textColor, 
        fontSize: 16, 
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20, 
        paddingBottom: 10,
    },
    historyHeaderText: {
        color: textColor,
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearHistoryText: {
        color: primaryColor, // Using defined green color
        fontSize: 15,
        fontWeight: '500',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: listItemBorderColor, // Using defined constant
    },
    historyIcon: {
        marginRight: 15,
    },
    historyText: {
        color: '#E0E0E0', 
        fontSize: 16,
        flex: 1, // Allow text to take available space
    },
});

export default SearchScreen;
