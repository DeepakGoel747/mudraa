// src/screens/AdvancedChartScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation'; // Ensure this path is correct
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit'; // Using LineChart as a base
import { api } from '../services/authService'; // Using your API service

const screenWidth = Dimensions.get("window").width;

type AdvancedChartNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdvancedChartScreen'>;
type AdvancedChartRouteProp = RouteProp<RootStackParamList, 'AdvancedChartScreen'>;

// Data types
interface HistoricalDataPoint {
    date: string;       // "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS"
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

type ChartType = 'Line' | 'Candlestick';
type TimeInterval = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'Max';

interface ChartDataset {
    data: number[]; // For LineChart, this would be 'close' prices
    color?: (opacity: number) => string;
    strokeWidth?: number;
    // For Candlestick, dataset would be an array of {x, o, h, l, c}
}

interface DisplayChartData {
    labels: string[]; // X-axis labels (dates/times)
    datasets: ChartDataset[];
}

const AdvancedChartScreen = () => {
    const navigation = useNavigation<AdvancedChartNavigationProp>();
    const route = useRoute<AdvancedChartRouteProp>();
    const { symbol, companyName } = route.params;

    // --- Color Constants ---
    const screenBackgroundColor = '#000000';
    const cardBackgroundColor = '#1A1A1A';
    const textColor = '#FFFFFF';
    const secondaryTextColor = '#8E8E93'; // Corrected: camelCase
    const primaryColor = '#25C866';
    const chartLineColorHex = '#3B82F6';
    const chartLineColorRgb = '59, 130, 246';
    const secondaryTextColorRgb = '142, 142, 147'; // Corrected: camelCase


    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ohlcvData, setOhlcvData] = useState<HistoricalDataPoint[]>([]);
    const [displayChartData, setDisplayChartData] = useState<DisplayChartData | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('1M');
    const [selectedChartType, setSelectedChartType] = useState<ChartType>('Line');
    const [activeIndicators, setActiveIndicators] = useState<string[]>([]);


    const fetchHistoricalData = useCallback(async (currentSymbol: string, range: TimeInterval) => {
        if (!currentSymbol) return;
        setIsLoading(true);
        setError(null);
        setOhlcvData([]);
        setDisplayChartData(null);

        let period = '1mo';
        let interval = '1d';

        switch (range) {
            case '1D': period = '2d'; interval = '5m'; break;
            case '1W': period = '7d'; interval = '30m'; break;
            case '1M': period = '1mo'; interval = '1d'; break;
            case '3M': period = '3mo'; interval = '1d'; break;
            case '1Y': period = '1y'; interval = '1d'; break;
            case '5Y': period = '5y'; interval = '1wk'; break;
            case 'Max': period = 'max'; interval = '1mo'; break;
        }

        try {
            console.log(`AdvancedChart: Fetching for ${currentSymbol}, Period: ${period}, Interval: ${interval}`);
            const response = await api.get(`/stocks/history/${encodeURIComponent(currentSymbol)}?period=${period}&interval=${interval}`);
            // Axios places data directly in response.data
            const rawData: HistoricalDataPoint[] | { error?: string } = response.data; 

            if (Array.isArray(rawData) && rawData.length > 0) {
                const validData = rawData.filter(p =>
                    typeof p.close === 'number' && !isNaN(p.close) &&
                    typeof p.open === 'number' && !isNaN(p.open) &&
                    typeof p.high === 'number' && !isNaN(p.high) &&
                    typeof p.low === 'number' && !isNaN(p.low) &&
                    p.date
                ).map(p => ({ // Ensure all OHLCV are numbers
                    ...p,
                    open: Number(p.open),
                    high: Number(p.high),
                    low: Number(p.low),
                    close: Number(p.close),
                    volume: Number(p.volume)
                }));

                setOhlcvData(validData); // Store the full OHLCV data

                // Prepare data for LineChart (using close prices)
                if (validData.length >= 2) {
                    let labels = validData.map(p => p.date);
                    let closePrices = validData.map(p => p.close);

                    if (range === '1D') {
                        const lastDateDay = labels.length > 0 ? labels[labels.length - 1].split(' ')[0] : '';
                        const intradayLabels: string[] = [];
                        const intradayClosePrices: number[] = [];
                        if (lastDateDay) {
                            validData.forEach(p => {
                                if (p.date.startsWith(lastDateDay)) {
                                    intradayClosePrices.push(p.close);
                                    intradayLabels.push(p.date.split(' ')[1]?.substring(0,5) || '');
                                }
                            });
                        }
                        if (intradayClosePrices.length >= 2) {
                            labels = intradayLabels;
                            closePrices = intradayClosePrices;
                        }
                    }
                    
                    const numLabels = labels.length;
                    const maxLabelsToShow = 8;
                    const labelInterval = numLabels > 0 ? Math.max(1, Math.floor(numLabels / maxLabelsToShow)) : 1;
                    const filteredDisplayLabels = numLabels > 0 ? labels.filter((_, i) => i % labelInterval === 0 || i === numLabels -1 ) : [];

                    setDisplayChartData({
                        labels: filteredDisplayLabels,
                        datasets: [{
                            data: closePrices,
                            color: (opacity = 1) => `rgba(${chartLineColorRgb}, ${opacity})`,
                            strokeWidth: 2,
                        }],
                    });
                } else {
                     setDisplayChartData(null);
                }
            } else if (typeof rawData === 'object' && rawData && 'error' in rawData) {
                throw new Error(rawData.error || "Error fetching historical data.");
            } else {
                console.warn("No historical data or unexpected format received.");
                setOhlcvData([]);
                setDisplayChartData(null);
            }
        } catch (err: any) {
            console.error("Failed to fetch historical data for advanced chart:", err.response?.data || err.message || err);
            setError(err.response?.data?.error || err.message || "Could not load chart data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (symbol) {
            fetchHistoricalData(symbol, selectedInterval);
        } else {
            setError("Stock symbol not provided to Advanced Chart screen.");
            setIsLoading(false);
        }
    }, [symbol, selectedInterval, fetchHistoricalData]);

    const handleIntervalSelect = (interval: TimeInterval) => {
        setSelectedInterval(interval);
    };

    const handleChartTypeSelect = (type: ChartType) => {
        setSelectedChartType(type);
        if (type === 'Candlestick') {
            if (ohlcvData.length < 2) {
                Alert.alert("Not Enough Data", "Not enough data points to display a candlestick chart for the selected range.");
                return;
            }
            Alert.alert("Candlestick Chart", "Displaying Candlestick chart requires a specialized library (e.g., react-native-wagmi-charts, Victory Native, or react-native-gifted-charts). The OHLCV data is available in 'ohlcvData' state.");
            // Conceptual: If you had a candlestick library, you'd format ohlcvData and set it to a different state for that chart.
            // e.g., const candlestickFormattedData = ohlcvData.map(d => ({ x: new Date(d.date), open: d.open, high: d.high, low: d.low, close: d.close }));
            // setCandlestickChartData(candlestickFormattedData);
        }
        // If switching back to Line, displayChartData is already based on close prices from ohlcvData
    };

    const timeIntervals: TimeInterval[] = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'Max'];
    const chartTypes: ChartType[] = ['Line', 'Candlestick'];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={screenBackgroundColor} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={28} color={textColor} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{companyName || symbol}</Text>
                    <Text style={styles.headerSubtitle}>Advanced Chart</Text>
                </View>
                <View style={{width: 40}} /> {/* Spacer */}
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.selectorContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {timeIntervals.map(interval => (
                            <TouchableOpacity
                                key={interval}
                                style={[styles.selectorButton, selectedInterval === interval && styles.selectorButtonSelected]}
                                onPress={() => handleIntervalSelect(interval)}
                            >
                                <Text style={[styles.selectorText, selectedInterval === interval && styles.selectorTextSelected]}>
                                    {interval}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                 <View style={styles.selectorContainer}>
                    <Text style={styles.selectorLabel}>Chart Type:</Text>
                    {chartTypes.map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.selectorButton, selectedChartType === type && styles.selectorButtonSelected]}
                            onPress={() => handleChartTypeSelect(type)}
                        >
                            <Text style={[styles.selectorText, selectedChartType === type && styles.selectorTextSelected]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.chartView}>
                    {isLoading && <ActivityIndicator size="large" color={primaryColor} style={{flex: 1}} />}
                    {!isLoading && error && <Text style={styles.errorText}>{error}</Text>}
                    {!isLoading && !error && displayChartData && selectedChartType === 'Line' && (
                        <LineChart
                            data={displayChartData}
                            width={screenWidth}
                            height={Dimensions.get('window').height * 0.5}
                            yAxisLabel="₹"
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: screenBackgroundColor,
                                backgroundGradientFrom: screenBackgroundColor,
                                backgroundGradientTo: screenBackgroundColor,
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(${chartLineColorRgb}, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(${secondaryTextColorRgb}, ${opacity})`, // Corrected typo
                                style: { borderRadius: 0 },
                                propsForDots: { r: "1", strokeWidth: "1", stroke: chartLineColorHex },
                                propsForBackgroundLines: { stroke: cardBackgroundColor, strokeDasharray: "" }, // Grid lines
                                strokeWidth: 1.5,
                            }}
                            bezier
                            style={styles.chartStyle}
                        />
                    )}
                    {!isLoading && !error && selectedChartType === 'Candlestick' && (
                        <View style={styles.placeholderChart}>
                            <Text style={{color: secondaryTextColor}}>Candlestick Chart Placeholder.</Text>
                            <Text style={{color: secondaryTextColor, textAlign: 'center', marginTop: 10}}>
                                Data (OHLCV) is fetched and stored in 'ohlcvData'.
                                Integrate a library like 'react-native-wagmi-charts', 'Victory Native', or 'react-native-gifted-charts' to render candlesticks.
                            </Text>
                            {/* Example: <CandlestickChartComponent data={ohlcvData} /> */}
                        </View>
                    )}
                     {!isLoading && !error && !displayChartData && selectedChartType === 'Line' && (
                        <View style={styles.placeholderChart}>
                            <Text style={{color: secondaryTextColor}}>No data available for selected range to draw Line chart.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.indicatorSection}>
                    <Text style={styles.sectionTitle}>Technical Indicators (Placeholder)</Text>
                    <Text style={{color: secondaryTextColor, paddingHorizontal: 16}}>Controls for SMA, EMA, RSI, MACD etc. will appear here.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#000000' },
    container: { flex: 1, backgroundColor: '#000000' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1A1A1A',
    },
    backButton: { padding: 8, marginLeft: -8 },
    headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 12, color: '#8E8E93', marginTop: 2 }, // secondaryTextColor
    selectorContainer: {
        paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row',
        alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2C2C2E',
    },
    selectorLabel: { color: '#FFFFFF', fontSize: 14, marginRight: 10, },
    selectorButton: {
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
        backgroundColor: '#2C2C2E', marginRight: 10,
    },
    selectorButtonSelected: { backgroundColor: '#25C866' }, // primaryColor
    selectorText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', },
    selectorTextSelected: { color: '#FFFFFF', fontWeight: '600', },
    chartView: {
        height: Dimensions.get('window').height * 0.55, justifyContent: 'center',
        alignItems: 'center', backgroundColor: '#000000', paddingVertical: 10,
    },
    chartStyle: { marginVertical: 8, borderRadius: 0, },
    placeholderChart: {
        height: Dimensions.get('window').height * 0.5, width: '100%',
        justifyContent: 'center', alignItems: 'center', padding: 20,
    },
    indicatorSection: { marginTop: 20, paddingBottom: 20, },
    sectionTitle: {
        fontSize: 16, fontWeight: 'bold', color: '#FFFFFF',
        marginBottom: 10, paddingHorizontal: 16,
    },
    errorText: { color: '#FF4444', textAlign: 'center', padding: 20, }, // negativeColor
});

export default AdvancedChartScreen;
