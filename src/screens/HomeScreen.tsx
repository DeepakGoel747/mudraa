// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image, // Make sure Image is imported
    StatusBar,
    ActivityIndicator,
    FlatList,
    Linking,
    RefreshControl,
    Dimensions,
    Platform,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons'; // Still used for other non-header icons
import { api } from '../services/authService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Color Constants ---
const screenBackgroundColor = '#000000';
const cardBackgroundColor = '#1A1A1A'; // General card background
const marketCardBackgroundColorRef = '#2A2D3A'; // For Market Overview cards (dark desaturated blue-grey)
const textColor = '#FFFFFF';
const secondaryTextColor = '#8E8E93';
const primaryColor = '#25C866';
const negativeColor = '#FF4444';
const niftyGraphColor = '#C058F3';
const bankNiftyGraphColor = '#33D69F';
const sensexGraphColor = '#518CFF';

const { width: screenWidth } = Dimensions.get('window');

// --- Type Definitions ---
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface MarketIndexAPI {
    id: string; name: string; value: string; changePercent: string; error: string | null;
}
interface MarketData {
    id: string; name: string; value: string; changeDisplay: string;
    isPositive: boolean;
    graphImageUrl?: string;
    hasError?: boolean; errorMessage?: string | null;
    lineColor?: string;
}
interface NewsHighlightAPI {
    id: string; source_name: string; title: string; image_url: string | null;
    article_url: string; published_at: string; description?: string;
}
interface HighlightData {
    id: string; source: string; title: string; imageUrl?: string | null;
    articleUrl: string; date?: string; description?: string;
}
interface StockListItemAPI {
    price: string;
    id?: string; ticker_id?: string;
    symbol?: string;
    ric?: string;
    name?: string;
    company_name?: string;
    change?: string; changePercent?: string;
    net_change?: string; percent_change?: string;
    positive?: boolean;
    error?: string;
}
interface WatchlistStockDisplay {
    id: string;
    navigationIdentifier: string;
    displayName: string;
    displaySymbol: string;
    price: string;
    changeDisplay: string;
    isPositive: boolean;
}
type WatchlistTab = 'Watchlist' | 'Trending' | 'Popular';

// --- Main Component ---
const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isWatchlistTabLoading, setIsWatchlistTabLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [quickHighlights, setQuickHighlights] = useState<HighlightData[]>([]);
    const [watchlistDisplayData, setWatchlistDisplayData] = useState<WatchlistStockDisplay[]>([]);
    const [selectedWatchlistTab, setSelectedWatchlistTab] = useState<WatchlistTab>('Watchlist');

    const parseChange = (changeStr: string | undefined): number => {
        if (!changeStr) return 0;
        return parseFloat(String(changeStr).replace(/[+%]/g, '')) || 0;
    };

    const fetchMarketData = useCallback(async () => {
        try {
            const response = await api.get('/stocks/market/indices');
            const data: MarketIndexAPI[] = response.data;
            if (!Array.isArray(data)) {
                console.error("Market data API did not return an array:", data);
                setMarketData([]);
                setError( (data as any)?.error || (data as any)?.message || "Market data unavailable.");
                return;
            }
            const formattedData: MarketData[] = data.map(item => {
                const changeVal = parseChange(item.changePercent);
                const upperName = item.name.toUpperCase();
                let lineColor = secondaryTextColor;
                if (item.error) {/* no specific color */}
                else if (upperName.includes('NIFTY 50')) lineColor = niftyGraphColor;
                else if (upperName.includes('BANK NIFTY')) lineColor = bankNiftyGraphColor;
                else if (upperName.includes('SENSEX')) lineColor = sensexGraphColor;
                return {
                    id: item.id, name: item.name,
                    value: !item.error ? parseFloat(item.value).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0}) : "N/A",
                    changeDisplay: !item.error ? (item.changePercent || '0.00%') : "Error",
                    isPositive: !item.error ? (changeVal >= 0) : false,
                    graphImageUrl: !item.error ? `${api.defaults.baseURL}/stocks/market/index-minigraph/${encodeURIComponent(item.name)}.png?t=${Date.now()}` : undefined,
                    hasError: !!item.error, errorMessage: item.error, lineColor: lineColor,
                };
            });
            setMarketData(formattedData.slice(0, 3));
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to fetch market data";
            console.error("Failed to fetch market data:", errorMsg);
            setMarketData([]);
            setError(prev => prev ? `${prev}\n${errorMsg}` : errorMsg);
        }
    }, []);

    const fetchNewsHighlights = useCallback(async () => {
        try {
            const response = await api.get('/stocks/news/highlights?count=7');
            const dataFromApi: NewsHighlightAPI[] = response.data;
            if (!Array.isArray(dataFromApi)) {
                console.error("News highlights API did not return an array:", dataFromApi);
                setQuickHighlights([]); return;
            }
            const mappedData: HighlightData[] = dataFromApi
                .filter(article => article.article_url && article.title && article.image_url)
                .slice(0, 5)
                .map((article, index): HighlightData => ({
                    id: article.id || article.article_url || `news-${index}`,
                    source: article.source_name,
                    date: article.published_at ? new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A',
                    title: article.title, imageUrl: article.image_url, articleUrl: article.article_url,
                    description: article.description
                }));
            setQuickHighlights(mappedData);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to fetch news highlights";
            console.error("Failed to fetch news highlights:", errorMsg);
            setQuickHighlights([]);
            setError(prev => prev ? `${prev}\n${errorMsg}` : errorMsg);
        }
    }, []);

    const fetchWatchlistTabData = useCallback(async (tab: WatchlistTab) => {
        setIsWatchlistTabLoading(true);
        setWatchlistDisplayData([]);
        let endpoint = '';
        try {
            switch (tab) {
                case 'Watchlist': endpoint = '/stocks/watchlist/user'; break;
                case 'Trending': endpoint = '/stocks/market/top-gainers'; break;
                case 'Popular': endpoint = '/stocks/market/most-active'; break;
                default: setIsWatchlistTabLoading(false); return;
            }
            const response = await api.get(endpoint);
            const responseData = response.data;
            if (responseData && responseData.error) {
                const errorMsg = responseData.error || responseData.message || `Failed to load ${tab} stocks.`;
                console.error(`Error fetching data for tab ${tab} from API:`, errorMsg);
                setIsWatchlistTabLoading(false); return;
            }
            if (!Array.isArray(responseData)) {
                console.error(`Data for tab ${tab} is not an array:`, responseData);
                setIsWatchlistTabLoading(false); return;
            }
            const rawApiData: StockListItemAPI[] = responseData;
            const formattedData: WatchlistStockDisplay[] = rawApiData.map(apiItem => {
                const idForList = apiItem.ticker_id || apiItem.id || apiItem.company_name ||  apiItem.name || String(Date.now() * Math.random());
                const companyNameToDisplay = apiItem.company_name || apiItem.name || (apiItem as any).company || "Unknown Company";
                const tickerToDisplay = apiItem.ric || apiItem.symbol || "---";
                let navigationId: string | null = null;
                if (tab === 'Watchlist') navigationId = apiItem.symbol || apiItem.ric || companyNameToDisplay;
                else navigationId = companyNameToDisplay;
                if (!navigationId || navigationId.trim() === "") {
                    console.warn(`Stock item from ${tab} (Name: ${companyNameToDisplay}) is missing valid ID. Filtering out. API Item:`, apiItem);
                    return null;
                }
                const effectivePrice = apiItem.price;
                const effectivePercentChange = apiItem.percent_change || apiItem.changePercent;
                const effectiveNetChange = apiItem.net_change || apiItem.change;
                const changeVal = parseChange(effectivePercentChange || effectiveNetChange);
                return {
                    id: idForList, navigationIdentifier: navigationId, displayName: companyNameToDisplay,
                    displaySymbol: tickerToDisplay,
                    price: effectivePrice ? `₹${parseFloat(effectivePrice).toFixed(2)}` : "N/A",
                    changeDisplay: effectivePercentChange ? `${changeVal >= 0 ? '+' : ''}${parseFloat(effectivePercentChange.replace('%','')).toFixed(2)}%` : (effectiveNetChange || "N/A"),
                    isPositive: changeVal >= 0,
                };
            }).filter(item => item !== null) as WatchlistStockDisplay[];
            setWatchlistDisplayData(formattedData);
        } catch (err: any) {
            const errorMsg = err.message || `Failed to fetch data for tab ${tab}.`;
            console.error(`Network or other error fetching data for tab ${tab}:`, errorMsg);
            setWatchlistDisplayData([]);
            setError(prev => prev ? `${prev}\n${errorMsg}` : errorMsg);
        } finally {
            setIsWatchlistTabLoading(false);
        }
    }, []);

    const loadAllData = useCallback(async (refresh = false, currentTab: WatchlistTab) => {
        if (!refresh) setIsLoading(true); else setIsRefreshing(true);
        setError(null);
        try {
            await Promise.all([fetchMarketData(), fetchNewsHighlights(), fetchWatchlistTabData(currentTab)]);
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to load home screen data.';
            console.error("Error in loadAllData (Promise.all):", errorMsg);
            setError(prev => prev ? `${prev}\n${errorMsg}` : errorMsg);
        } finally {
            if (!refresh) setIsLoading(false); else setIsRefreshing(false);
        }
    }, [fetchMarketData, fetchNewsHighlights, fetchWatchlistTabData]);

    useEffect(() => {
        if (isFocused) loadAllData(false, selectedWatchlistTab);
    }, [isFocused, loadAllData, selectedWatchlistTab]);

    const isInitialTabLoadDone = useRef(false);
    const isInitialRender = useRef(true);
    useEffect(() => {
        if (!isFocused) { isInitialTabLoadDone.current = false; return; }
        if (isLoading || isInitialRender.current) { isInitialTabLoadDone.current = false; return; }
        if (!isInitialTabLoadDone.current ) { isInitialTabLoadDone.current = true; return; }
        if (isInitialTabLoadDone.current && !isLoading && !isRefreshing) fetchWatchlistTabData(selectedWatchlistTab);
    }, [selectedWatchlistTab, isFocused, isLoading, isRefreshing, fetchWatchlistTabData]);
    useEffect(() => { if(isInitialRender.current) isInitialRender.current = false; },[]);

    const renderMarketCard = ({ item }: { item: MarketData }) => {
        const changeColor = item.hasError ? secondaryTextColor : (item.isPositive ? primaryColor : negativeColor);
        const changeValueOnly = item.changeDisplay.replace(/[+%]/g, '');
        const formattedChange = item.hasError ? "Error" : `${parseFloat(changeValueOnly).toFixed(2)}%`;
        return (
            <TouchableOpacity style={styles.marketCardRef} activeOpacity={0.8}
                onPress={() => {
                    const knownIndices = ["NIFTY 50", "SENSEX", "BANK NIFTY"];
                    const isIndex = knownIndices.some(knownIndex => item.name.toUpperCase().includes(knownIndex.toUpperCase()));
                    if (isIndex) navigation.navigate('IndexDetailScreen', { symbol: item.name });
                    else navigation.navigate('StockDetailScreen', { symbol: item.id });
                }}>
                <Text style={styles.marketCardTitleRef} numberOfLines={1}>{item.name}</Text>
                {item.hasError ? <View style={styles.graphPlaceholderRef}><Text style={styles.marketCardErrorTextRef}>Data N/A</Text></View>
                 : item.graphImageUrl ? <Image source={{ uri: item.graphImageUrl }} style={styles.miniGraphImageRef} onError={(e) => console.log("Failed to load minigraph for " + item.id + ":", e.nativeEvent.error)} />
                 : <View style={styles.graphPlaceholderRef} />}
                <View style={styles.marketCardStatsRow}>
                    <Text style={styles.marketCardValueRef}>{item.value}</Text>
                    <View style={styles.marketCardChangeContainerRef}>
                        {!item.hasError && <Icon name={item.isPositive ? "caret-up-outline" : "caret-down-outline"} size={14} color={changeColor} style={styles.marketCardChangeArrowRef}/>}
                        <Text style={[styles.marketCardChangeRef, { color: changeColor }]}>{formattedChange}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHighlightCard = ({ item }: { item: HighlightData }) => (
        <TouchableOpacity style={styles.highlightCard} activeOpacity={0.8}
            onPress={() => {
                if (item.articleUrl && (item.articleUrl.startsWith('http://') || item.articleUrl.startsWith('https://'))) Linking.openURL(item.articleUrl).catch(err => console.error("Failed to open URL:", err));
                else console.warn("Invalid or missing article URL:", item.articleUrl);
            }}>
            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.highlightImage} resizeMode="cover" />
             : <View style={styles.highlightImagePlaceholder}><Icon name="newspaper-outline" size={40} color="#5A5A5A" /></View>}
            <View style={styles.highlightTextContainer}>
                <Text style={styles.highlightSource} numberOfLines={1}>{item.source}{item.date ? ` • ${item.date}` : ''}</Text>
                <Text style={styles.highlightTitle} numberOfLines={3}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderWatchlistRow = ({ item }: { item: WatchlistStockDisplay }) => (
        <TouchableOpacity style={styles.watchlistRow} activeOpacity={0.7}
            onPress={() => {
                if (!item.navigationIdentifier) { console.error("WatchlistRow: Navigating with undefined ID for item:", item); return; }
                navigation.navigate('StockDetailScreen', { symbol: item.navigationIdentifier });
            }}>
            <View style={styles.watchlistCompanyContainer}>
                <Text style={styles.watchlistCompany} numberOfLines={1}>{item.displayName}</Text>
                {item.displaySymbol && item.displaySymbol !== '---' && <Text style={styles.watchlistTicker}>{item.displaySymbol}</Text>}
            </View>
            <Text style={styles.watchlistPrice}>{item.price}</Text>
            <View style={[styles.changeBadge, { backgroundColor: item.isPositive ? 'rgba(37, 200, 102, 0.15)' : 'rgba(255, 68, 68, 0.15)' }]}>
                <Text style={[styles.changeText, { color: item.isPositive ? primaryColor : negativeColor }]}>{item.changeDisplay}</Text>
            </View>
        </TouchableOpacity>
    );

    const watchlistTabs: WatchlistTab[] = ['Watchlist', 'Trending', 'Popular'];
    const headerStyle = [ styles.header, {
            paddingTop: insets.top > 0 ? insets.top : (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20),
            paddingBottom: 12,
        }];

    const headerContent = (
        <View style={headerStyle}>
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                <Image source={require('../assets/user(1).png')} style={styles.headerIconUser} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchContainer} onPress={() => navigation.navigate('SearchScreen')}>
                {/* Replace Icon with Image for search */}
                <Image 
                    source={require('../assets/search.png')} // ADJUST PATH IF NEEDED
                    style={styles.searchIconImage} 
                />
                <Text style={styles.searchInputPlaceholder}>Search Stocks, ETFs...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('NotificationPermission')}>
                <Image source={require('../assets/bell(1).png')} style={styles.headerIconBell} /> 
                {/* Assumed bell.png from previous, original had bell(1).png, ensure correct name */}
            </TouchableOpacity>
        </View>
    );

    if (isLoading && !isRefreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={screenBackgroundColor} />
                {headerContent}
                <ActivityIndicator size="large" color={textColor} style={styles.fullScreenLoader} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={screenBackgroundColor} />
            {headerContent}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}
                refreshControl={ <RefreshControl refreshing={isRefreshing} onRefresh={() => loadAllData(true, selectedWatchlistTab)} tintColor={textColor} colors={[primaryColor]} progressBackgroundColor={cardBackgroundColor} /> } >
                {error && !isRefreshing && !isLoading && (
                    <View style={styles.fullScreenMessageContainer}>
                        <Icon name="cloud-offline-outline" size={60} color={secondaryTextColor} />
                        <Text style={styles.errorText}>{error.split('\n')[0]}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => loadAllData(false, selectedWatchlistTab)}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity>
                    </View>
                )}
                { (!error || isRefreshing || isLoading) && (
                    <>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginBottom: 16 }]}>MARKET</Text> 
                            <FlatList horizontal data={marketData} renderItem={renderMarketCard} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainerPadded}
                                ListEmptyComponent={ isLoading ? <View style={styles.emptyMarketListContainer}><ActivityIndicator color={textColor} /></View> : <View style={styles.emptyMarketListContainer}><Text style={styles.emptySectionText}>Market data unavailable.</Text></View>} />
                        </View>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, {paddingHorizontal: 0, marginBottom: 0}]}>QUICK HIGHLIGHTS</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('HotNews')}><Text style={styles.seeMoreText}>See More</Text></TouchableOpacity>
                            </View>
                            {quickHighlights.length > 0 ? <FlatList horizontal data={quickHighlights} renderItem={renderHighlightCard} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainerPadded} />
                             : isLoading ? <ActivityIndicator color={textColor} style={{height: 220}}/> :<View style={[styles.emptySectionContainer, {height: 220}]}><Icon name="newspaper-outline" size={40} color={secondaryTextColor} /><Text style={styles.emptySectionText}>No news highlights available.</Text></View>}
                        </View>
                        <View style={styles.section}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
                                {watchlistTabs.map(tab => (
                                    <TouchableOpacity key={tab} style={[styles.tabButton, selectedWatchlistTab === tab && styles.selectedTabButton]} onPress={() => setSelectedWatchlistTab(tab)} >
                                        <Text style={[styles.tabText, selectedWatchlistTab === tab && styles.selectedTabText]}>{tab}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <View style={styles.watchlistHeader}>
                                <Text style={[styles.watchlistHeaderText, { flex: 2.5 }]}>Company</Text>
                                <Text style={[styles.watchlistHeaderText, { flex: 1.5, textAlign: 'right' }]}>Market Price</Text>
                                <Text style={[styles.watchlistHeaderText, { flex: 1, textAlign: 'right' }]}>Change</Text>
                            </View>
                            {isWatchlistTabLoading ? <ActivityIndicator color={textColor} style={{marginVertical: 50, height: 100}}/>
                             : watchlistDisplayData.length > 0 ? <FlatList data={watchlistDisplayData} renderItem={renderWatchlistRow} keyExtractor={(item) => item.id} scrollEnabled={false} />
                             : <View style={styles.emptySectionContainer}>
                                 <Icon name="list-outline" size={40} color={secondaryTextColor} />
                                 <Text style={styles.emptySectionText}> {selectedWatchlistTab === 'Watchlist' ? 'Your watchlist is empty.' : `No ${selectedWatchlistTab.toLowerCase()} stocks found.`} </Text>
                                 {selectedWatchlistTab === 'Watchlist' && <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')} style={styles.addStockButton}><Text style={styles.addStockButtonText}>Add Stocks</Text></TouchableOpacity> }
                               </View>}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: screenBackgroundColor },
    scrollContentContainer: { paddingBottom: 20 },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        backgroundColor: cardBackgroundColor, borderBottomWidth: 1, borderBottomColor: '#2D2D2D',
    },
    profileButton: { padding: 5 },
    headerIconUser: { width: 32, height: 32, borderRadius: 16 },
    searchContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E',
        borderRadius: 10, paddingHorizontal: 12, marginHorizontal: 12, height: 40,
    },
    // Removed old searchIcon style if it was for vector icon, new one is searchIconImage
    searchIconImage: { // Style for the new search image
        width: 20, // Adjust as needed
        height: 20, // Adjust as needed
        marginRight: 8,
        // tintColor: secondaryTextColor, // Optional: if your search.png is a template
    },
    searchInputPlaceholder: { flex: 1, color: secondaryTextColor, fontSize: 15 },
    notificationButton: { padding: 8 },
    headerIconBell: { width: 26, height: 26 },
    fullScreenLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    fullScreenMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: '20%'},
    errorText: { color: negativeColor, textAlign: 'center', fontSize: 16, marginTop: 15 },
    retryButton: { marginTop: 20, backgroundColor: primaryColor, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    retryButtonText: { color: textColor, fontSize: 16, fontWeight: '600' },
    section: { marginTop: 24, marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { color: textColor, fontSize: 18, fontWeight: 'bold' },
    seeMoreText: { color: primaryColor, fontSize: 14, fontWeight: '600' },
    horizontalListContainerPadded: { paddingHorizontal: 16, paddingVertical: 4 },
    emptyMarketListContainer: { width: screenWidth - 32, height: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: marketCardBackgroundColorRef, borderRadius: 12, marginRight: 12 },
    emptySectionContainer: { paddingHorizontal: 16, paddingVertical: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: cardBackgroundColor, borderRadius: 12, marginHorizontal: 16, minHeight: 150 },
    emptySectionText: { color: secondaryTextColor, fontSize: 14, textAlign: 'center', marginTop: 8 },
    addStockButton: { marginTop: 15, backgroundColor: primaryColor, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    addStockButtonText: { color: textColor, fontWeight: '600' },
    marketCardRef: { width: 150, height: 140, borderRadius: 12, backgroundColor: marketCardBackgroundColorRef, padding: 12, marginRight: 12, justifyContent: 'space-between' },
    marketCardTitleRef: { color: textColor, fontSize: 15, fontWeight: '500', opacity: 0.9, marginBottom: 8 },
    miniGraphImageRef: { width: '100%', height: 50, marginBottom: 8 },
    graphPlaceholderRef: { width: '100%', height: 50, marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
    marketCardErrorTextRef: { color: secondaryTextColor, fontSize: 12 },
    marketCardStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    marketCardValueRef: { color: textColor, fontSize: 16, fontWeight: '600' },
    marketCardChangeContainerRef: { flexDirection: 'row', alignItems: 'center' },
    marketCardChangeArrowRef: { marginRight: 3 },
    marketCardChangeRef: { fontSize: 13, fontWeight: '500' },
    highlightCard: { width: 220, height: 230, borderRadius: 12, marginRight: 12, backgroundColor: cardBackgroundColor, overflow: 'hidden' },
    highlightImage: { width: '100%', height: 120, backgroundColor: '#2C2C2E' },
    highlightImagePlaceholder: { width: '100%', height: 120, backgroundColor: '#2C2C2E', justifyContent: 'center', alignItems: 'center' },
    highlightTextContainer: { padding: 12, flex: 1, justifyContent: 'flex-start' },
    highlightSource: { color: secondaryTextColor, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 5 },
    highlightTitle: { color: textColor, fontSize: 14, fontWeight: '500', lineHeight: 19 },
    tabContainer: { paddingHorizontal: 16, marginBottom: 16, paddingTop: 8 },
    tabButton: { paddingVertical: 10, paddingHorizontal: 18, marginRight: 10, borderRadius: 20, backgroundColor: cardBackgroundColor },
    selectedTabButton: { backgroundColor: primaryColor },
    tabText: { color: textColor, fontSize: 14, fontWeight: '600' },
    selectedTabText: { color: textColor, fontWeight: 'bold' },
    watchlistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', marginTop: 8 },
    watchlistHeaderText: { color: secondaryTextColor, fontSize: 13, fontWeight: '500' },
    watchlistRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
    watchlistCompanyContainer: { flex: 2.5, justifyContent: 'center' },
    watchlistCompany: { color: textColor, fontSize: 16, fontWeight: '500' },
    watchlistTicker: { color: secondaryTextColor, fontSize: 12, marginTop: 2 },
    watchlistPrice: { color: textColor, fontSize: 16, fontWeight: '500', flex: 1.5, textAlign: 'right' },
    changeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginLeft: 12, minWidth: 70, alignItems: 'center', justifyContent: 'center' },
    changeText: { fontSize: 14, fontWeight: '600' },
});

export default HomeScreen;
