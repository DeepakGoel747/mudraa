import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Linking,
  Image, // <-- Import Image component
} from 'react-native';

// Icon component is no longer needed for this screen if only used for share
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// If you still need Icon for other things, keep the import

// Import navigation types
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation'; // Adjust path if needed
//import { NewsArticle } from '../newsScreen/news'; // Adjust path if needed

// Define Props type for this screen
type Props = NativeStackScreenProps<RootStackParamList, 'NewsDetail'>;

const NewsDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { article } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title}\n${article.articleUrl}`,
        url: article.articleUrl,
        title: article.title,
      });
    } catch (error: any) {
      console.error('Error sharing article:', error.message);
    }
  };

  const estimateReadTime = (text: string | undefined): string => {
    if (!text) {return 'N/A';}
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes === 1 ? `${minutes} Min Read` : `${minutes} Mins Read`;
  };

  const readTime = estimateReadTime(article.summary);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={styles.header.backgroundColor} />
      {/* Custom Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>&lt;</Text>
        </TouchableOpacity>
        {/* Share Button - Use Image */}
        <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
          {/* Use Image component with require */}
          <Image
             // *** IMPORTANT: Adjust this path if your structure differs ***
            source={require('../../assets/images/sharebutton.png')}
            style={styles.shareIconImage} // Apply specific style for the image
          />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Tag */}
        {article.category && (
             <View style={styles.tagContainer}>
                 <Text style={styles.tagText}>{article.category.charAt(0).toUpperCase() + article.category.slice(1)}</Text>
             </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Author / Read Time */}
        <View style={styles.metaContainer}>
             <View style={styles.authorImagePlaceholder} />
             <Text style={styles.metaText}>
                by {article.sourceName || 'Unknown Source'} <Text style={styles.dotSeparator}>•</Text> {readTime}
             </Text>
        </View>

        {/* Body Content (Using Summary) */}
        <Text style={styles.bodyText}>
            {article.summary?.trim() || 'Summary not available for this article.'}
        </Text>

         {/* Optional: Add a link to view the full article */}
         <TouchableOpacity onPress={() => Linking.openURL(article.articleUrl).catch(err => console.error("Couldn't load page", err))}>
            <Text style={styles.fullArticleLink}>Read Full Article Online...</Text>
         </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const screenPadding = 16;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
    paddingHorizontal: screenPadding,
    backgroundColor: '#1c1c1e',
  },
  iconButton: {
    padding: 10, // Keep increased padding
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  iconText: {
      color: '#ffffff',
      fontSize: 28,
      fontWeight: 'bold',
  },
  // Update style for the share image icon
  shareIconImage: {
      width: 24, // Adjust size as needed
      height: 24, // Adjust size as needed
      resizeMode: 'contain',
      tintColor: '#ffffff' // <-- Apply white tint color
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: screenPadding,
    paddingBottom: 40,
  },
  tagContainer: {
    backgroundColor: '#25C866',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authorImagePlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#555558',
      marginRight: 8,
  },
  metaText: {
    color: '#a0a0a5',
    fontSize: 13,
  },
  dotSeparator: {
      marginHorizontal: 4,
      color: '#a0a0a5',
  },
  bodyText: {
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 24,
  },
   fullArticleLink: {
      color: '#25C866',
      marginTop: 20,
      fontSize: 15,
   },
});

export default NewsDetailScreen;
