import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  Modal,
  Pressable,
} from 'react-native';

// Import Icon component (only needed for filter icon now)
import Icon from 'react-native-vector-icons/Ionicons';

// Import navigation types
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// Adjust path if your types file is elsewhere
import { RootStackParamList } from '../types/navigation';

// --- Data Structure (Export for use in navigation types) ---
export interface NewsArticle { // <-- Export interface
  id: string;
  sourceName?: string;
  date: string; // ISO String format
  title: string;
  imageUrl?: string | null;
  articleUrl: string;
  summary?: string;
  // Add category if available from API mapping (Finnhub provides it)
  category?: string;
}

// --- Reusable News Card Component ---
interface NewsCardProps {
  item: NewsArticle;
  onPress: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
    {item.imageUrl ? (
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
    ) : (
      <View style={styles.cardImagePlaceholder}>
         <Text style={styles.placeholderText}>No Image</Text>
      </View>
    )}
    <View style={styles.cardContent}>
       <Text style={styles.cardMeta} numberOfLines={1}>
         {`${item.sourceName || 'Unknown Source'} - ${new Date(item.date).toLocaleDateString()}`}
       </Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </View>
  </TouchableOpacity>
);

// --- Define Props type for this screen including navigation ---
type HotNewsScreenProps = NativeStackScreenProps<RootStackParamList, 'HotNews'>;

// --- Filter Options ---
const TIME_FILTERS = ['All', '1 Hour', '24 Hour', 'This week', 'This Month', '6 Month'];
const CATEGORY_FILTERS = ['All', 'Global', 'Market', 'Economy', 'Earnings', 'Policy'];
const DEFAULT_TIME_FILTER = 'All';
const DEFAULT_CATEGORY_FILTER = 'All';


// --- Main Screen Component ---
const HotNewsScreen: React.FC<HotNewsScreenProps> = ({ navigation }) => { // Ensure navigation prop is received
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [appliedTimeFilter, setAppliedTimeFilter] = useState<string>(DEFAULT_TIME_FILTER);
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState<string>(DEFAULT_CATEGORY_FILTER);
  const [tempTimeFilter, setTempTimeFilter] = useState<string>(appliedTimeFilter);
  const [tempCategoryFilter, setTempCategoryFilter] = useState<string>(appliedCategoryFilter);

  const FINNHUB_API_KEY = 'cvvtahhr01qud9qkhap0cvvtahhr01qud9qkhapg'; // ⚠️ Store securely!
  const API_ENDPOINT_BASE = `https://finnhub.io/api/v1/news`;

  const fetchStockNews = async (category = 'general') => {
      setIsLoading(true);
      setError(null);
      const API_ENDPOINT = `${API_ENDPOINT_BASE}?category=${category}&token=${FINNHUB_API_KEY}`;
      console.log("Fetching news from:", API_ENDPOINT);
      try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
          let errorBody = 'Unknown API error';
          try { const errorData = await response.json(); errorBody = errorData.error || `HTTP error! status: ${response.status}`; }
          catch (parseError) { errorBody = `HTTP error! status: ${response.status}`; }
          throw new Error(errorBody);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
             const mappedData: NewsArticle[] = data
                .filter(article => article.url && article.headline)
                .map((article: any) => ({
                    id: article.id.toString(),
                    sourceName: article.source,
                    date: new Date(article.datetime * 1000).toISOString(),
                    title: article.headline,
                    imageUrl: article.image || null,
                    articleUrl: article.url,
                    summary: article.summary,
                    category: article.category, // <-- Map category from Finnhub
                }));
             setNewsData(mappedData);
        } else { throw new Error("Received unexpected data format from API."); }
      } catch (err: any) {
        console.error("Failed to fetch news:", err);
        setError(err.message || 'Failed to fetch news. Check connection or API key.');
      } finally { setIsLoading(false); }
    };

  useEffect(() => { fetchStockNews(); }, []);

  const openFilterModal = () => {
    setTempTimeFilter(appliedTimeFilter);
    setTempCategoryFilter(appliedCategoryFilter);
    setIsFilterModalVisible(true);
  };

  const handleApplyFilters = () => {
    setAppliedTimeFilter(tempTimeFilter);
    setAppliedCategoryFilter(tempCategoryFilter);
    setIsFilterModalVisible(false);
    console.log("Applying Filters - Time:", tempTimeFilter, "Category:", tempCategoryFilter);
    console.warn("API Refetch based on selected Time/detailed Category filters is NOT implemented due to Finnhub API limitations.");
    // Example: Map UI category to API category if needed
    let apiCategory = tempCategoryFilter === 'All' ? 'general' : tempCategoryFilter.toLowerCase();
     // Finnhub specific categories are limited, adjust mapping as needed
     if (!['general', 'forex', 'crypto', 'merger'].includes(apiCategory)) {
        apiCategory = 'general'; // Fallback if UI category doesn't match API
        console.warn(`Category '${tempCategoryFilter}' not directly supported by Finnhub /news endpoint, fetching 'general'.`);
     }
    fetchStockNews(apiCategory);
  };

  const handleResetFilters = () => {
    setTempTimeFilter(DEFAULT_TIME_FILTER);
    setTempCategoryFilter(DEFAULT_CATEGORY_FILTER);
  };

  // Navigate to Detail Screen on Card Press
  const handleCardPress = (item: NewsArticle) => {
     console.log("Navigating to NewsDetail with article:", item.title);
     navigation.navigate('NewsDetail', { article: item });
  };


   const renderHeader = () => (
     <View style={styles.header}>
      {/* Back Button - Changed to '<' */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
        <Text style={styles.iconText}>&lt;</Text> {/* Changed from > to < */}
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Hot News</Text>

      {/* Filter Button */}
      <TouchableOpacity onPress={openFilterModal} style={styles.iconButton}>
         <Icon name="options-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
   );

  const renderContent = () => {
    // ... (loading/error/empty logic remains the same) ...
    if (isLoading) { return <ActivityIndicator size="large" color="#ffffff" style={styles.centered} />; }
    if (error) { return <Text style={[styles.centered, styles.errorText]}>Error: {error}</Text>; }
    if (newsData.length === 0) { return <Text style={styles.centered}>No news articles found.</Text>; }
    return ( <FlatList data={newsData} renderItem={({ item }) => ( <NewsCard item={item} onPress={() => handleCardPress(item)} /> )} keyExtractor={(item) => item.id} numColumns={2} style={styles.listContainer} contentContainerStyle={styles.listContentContainer} columnWrapperStyle={styles.rowWrapper} /> );
  };

  const renderFilterButton = ( text: string, selectedValue: string, onPress: () => void ) => {
        const isSelected = text === selectedValue;
        return ( <Pressable style={[styles.filterButton, isSelected && styles.filterButtonSelected]} onPress={onPress} > <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}> {text} </Text> </Pressable> );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={styles.container.backgroundColor} />
      {renderHeader()}
      {renderContent()}
      <Modal animationType="slide" transparent={true} visible={isFilterModalVisible} onRequestClose={() => { setIsFilterModalVisible(!isFilterModalVisible); }}>
        {/* ... Modal JSX remains the same ... */}
         <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.modalCloseButton}>
                <Icon name="close-outline" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.filterSectionTitle}>Time</Text>
            <View style={styles.filterGroup}>
              {TIME_FILTERS.map((time) => renderFilterButton(time, tempTimeFilter, () => setTempTimeFilter(time)))}
            </View>
             <Text style={styles.filterSectionTitle}>Categories</Text>
             <View style={styles.filterGroup}>
                {CATEGORY_FILTERS.map((category) => renderFilterButton(category, tempCategoryFilter, () => setTempCategoryFilter(category)))}
             </View>
             <View style={styles.modalActionButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.resetButton]} onPress={handleResetFilters}>
                    <Text style={styles.modalButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={handleApplyFilters}>
                    <Text style={[styles.modalButtonText, styles.applyButtonText]}>Apply</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles ---
const screenPadding = 16;
const cardGap = 16;
const availableWidth = Dimensions.get('window').width - (screenPadding * 2);
const cardWidth = (availableWidth / 2) - (cardGap / 2);

const styles = StyleSheet.create({
  // ... styles remain the same ...
  safeArea: { flex: 1, backgroundColor: '#1c1c1e', },
  container: { backgroundColor: '#1c1c1e', },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Platform.OS === 'ios' ? 10 : 12, paddingHorizontal: screenPadding, backgroundColor: '#1c1c1e', },
  headerTitle: { color: '#ffffff', fontSize: 19, fontWeight: '700', },
  iconButton: { padding: 10, justifyContent: 'center', alignItems: 'center', minWidth: 40, minHeight: 40, },
  iconText: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', },
  listContainer: { flex: 1, },
  listContentContainer: { paddingHorizontal: screenPadding, paddingVertical: screenPadding, },
  rowWrapper: { justifyContent: 'space-between', },
  cardContainer: { backgroundColor: '#2c2c2e', borderRadius: 12, marginBottom: cardGap, width: cardWidth, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, }, android: { elevation: 3, }, }), },
  cardImagePlaceholder: { height: 120, backgroundColor: '#555558', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12, },
  placeholderText: { color: '#a0a0a5', fontSize: 12, },
  cardImage: { height: 120, width: '100%', backgroundColor: '#444', borderTopLeftRadius: 12, borderTopRightRadius: 12, },
  cardContent: { padding: 12, flex: 1, },
  cardMeta: { fontSize: 11, color: '#a0a0a5', marginBottom: 6, },
  date: {},
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#ffffff', lineHeight: 20, marginBottom: 4, },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, textAlign: 'center', color: '#ccc', },
  errorText: { color: '#ff6b6b', },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)', },
  modalContent: { backgroundColor: '#1c1c1e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: screenPadding, paddingBottom: Platform.OS === 'ios' ? 30 : screenPadding, },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', },
  modalCloseButton: { padding: 5, },
  filterSectionTitle: { color: '#a0a0a5', fontSize: 14, fontWeight: '500', marginBottom: 10, marginTop: 10, },
  filterGroup: { flexDirection: 'row', flexWrap: 'wrap', },
  filterButton: { backgroundColor: '#3a3a3c', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: 'transparent', },
  filterButtonSelected: { backgroundColor: '#2c2c2e', borderColor: '#25C866', },
  filterButtonText: { color: '#ffffff', fontSize: 14, },
  filterButtonTextSelected: { color: '#25C866', fontWeight: '600', },
  modalActionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', },
  resetButton: { backgroundColor: '#3a3a3c', marginRight: 10, },
  applyButton: { backgroundColor: '#25C866', marginLeft: 10, },
  modalButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600', },
  applyButtonText: { color: '#ffffff', },
});

export default HotNewsScreen;
