// src/components/StockHistoryChart.tsx
import React, { useState, useEffect, useRef,useCallback } from 'react';
import { View, Text, Dimensions, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';
import { useIsFocused } from '@react-navigation/native'; // Import useIsFocused
import { COLORS } from '../constants/colors'; // Adjust path if needed

// Interface for data points expected from the /history endpoint
interface HistoricalDataPoint {
    date: string;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null; // Use this for line chart price
    price?: number | null; // Fallback if 'close' isn't present
    volume?: number | null;
}

interface StockHistoryChartProps {
    symbol: string;
    period?: string; // API compatible value (e.g., "1m", "1d", "7d")
    interval?: string; // API compatible value (e.g., "1d", "15m")
    apiBaseUrl: string;
}

const screenWidth = Dimensions.get("window").width;
// !!! WARNING: 1 second is extremely frequent and not recommended! !!!
// Consider 15000 (15s) or 30000 (30s) or 60000 (1min) for better performance/less load.
const POLLING_INTERVAL_MS = 1000; // Update interval as requested (1 second)

const StockHistoryChart: React.FC<StockHistoryChartProps> = ({
    symbol,
    period = "1m",
    interval = "1d", // Default interval (backend might override based on period)
    apiBaseUrl,
}) => {
    const [chartKitData, setChartKitData] = useState<{ labels: string[]; datasets: { data: number[] }[] } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const isFocused = useIsFocused(); // Hook to check if the screen is focused
    const appState = useRef(AppState.currentState);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null); // Ref to store interval ID

    // Function to fetch data
    const fetchChartData = useCallback(async (isPolling = false) => {
        if (!symbol) {
            setError("Stock symbol is missing.");
            setLoading(false);
            return;
        }
        // Only show main loader on initial load, not for polling updates
        if (!isPolling) {
            setLoading(true);
        }
        // Keep previous error until successful fetch, or clear if polling
        if (isPolling) setError(null);

        try {
            const historyUrl = `${apiBaseUrl}/history/${symbol.toUpperCase()}?period=${period}&interval=${interval}`;
            console.log(`StockHistoryChart: Fetching ${historyUrl}`);
            const response = await fetch(historyUrl);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || `Failed to fetch historical data (${response.status})`);
            }

            const historicalData = responseData?.historical_data;

            if (historicalData && Array.isArray(historicalData) && historicalData.length > 1) {
                const labels: string[] = [];
                const prices: number[] = [];
                const numPoints = historicalData.length;
                const maxLabels = 7;
                const labelStep = Math.max(1, Math.floor(numPoints / (maxLabels - 1)));

                historicalData.forEach((point: HistoricalDataPoint, index: number) => {
                    const priceToUse = point.close ?? point.price;
                    if (priceToUse != null && point.date != null) {
                        prices.push(priceToUse);
                        if (index === 0 || index === numPoints - 1 || (index + 1) % labelStep === 0) {
                            const dateStr = point.date;
                            const dateObj = new Date(dateStr.replace(' ', 'T') + 'Z'); // Handle TZ offset if needed
                             const label = dateStr.includes(':')
                                ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
                                : `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
                            labels.push(label);
                        } else {
                            labels.push("");
                        }
                    }
                });

                if (prices.length < 2) {
                    setError('Not enough data points for chart.');
                    setChartKitData(null); // Clear chart data
                } else {
                    setChartKitData({ labels: labels, datasets: [{ data: prices }] });
                    setError(null); // Clear error on successful fetch
                }
            } else {
                // Handle empty but successful response
                if (chartKitData) { // Keep existing chart if already rendered? Or show error?
                     console.warn("Received empty historical_data array, keeping previous chart data.");
                     // setError('No new data points received.'); // Optional: inform user
                } else {
                    setError('No historical data available for this period.');
                    setChartKitData(null);
                }
            }
        } catch (e: any) {
            console.error("Failed to fetch or process chart data:", e);
            // Keep previous chart data if polling fails? Or show error?
            if (!chartKitData) { // Only set error if there's no chart displayed yet
                 setError(e.message || "Failed to load chart data.");
            } else {
                console.warn("Polling failed, keeping existing chart data:", e.message);
            }
        } finally {
            // Only set initial loading to false
            if (loading && !isPolling) {
                setLoading(false);
            }
        }
    }, [symbol, period, interval, apiBaseUrl, chartKitData]); // Include chartKitData to potentially decide on error display

    // Effect for initial fetch and setting up polling
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
             if (appState.current.match(/inactive|background/) && nextAppState === 'active' && isFocused) {
                console.log('Chart: App has come to the foreground! Fetching chart data.');
                fetchChartData(); // Fetch fresh data when app returns to foreground
             }
             appState.current = nextAppState;
        };

        // Subscribe to app state changes
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        if (isFocused) {
            console.log(`Chart: Screen focused for ${symbol}. Fetching initial data and starting polling.`);
            fetchChartData(); // Fetch data immediately when screen is focused

            // Clear any existing interval before starting a new one
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }

            // Start new polling interval
            intervalIdRef.current = setInterval(() => {
                fetchChartData(true); // Pass true to indicate it's a polling update
            }, POLLING_INTERVAL_MS); // Use the defined interval

        } else {
            // Screen is not focused, clear interval
            if (intervalIdRef.current) {
                console.log(`Chart: Screen blurred for ${symbol}. Stopping polling.`);
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        }

        // Cleanup function
        return () => {
            console.log(`Chart: Cleaning up for ${symbol}. Clearing interval.`);
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            appStateSubscription.remove();
        };
    }, [isFocused, fetchChartData, symbol]); // Rerun effect if focus or fetch function changes

    // --- Render Logic ---
    if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary || "#007AFF"} style={styles.loader} />;
    }
    if (error && !chartKitData) { // Show error only if there's no chart data to display
        return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!chartKitData || chartKitData.datasets[0].data.length < 2) {
        // Show error if there was no explicit fetch error, but data is insufficient
        return <Text style={styles.errorText}>{error || 'Insufficient data to draw chart.'}</Text>;
    }

    // Chart Config (same as before)
    const chartConfig: AbstractChartConfig = {
        backgroundColor: "#1e2923", backgroundGradientFrom: "#1A1E1B", backgroundGradientTo: "#11150F",
        decimalPlaces: 2, color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(174, 174, 178, ${opacity})`, style: { borderRadius: 16 },
        propsForDots: { r: "3", strokeWidth: "1", stroke: "#007AFF" },
        propsForBackgroundLines: { strokeDasharray: "", stroke: "rgba(255, 255, 255, 0.1)" }
    };

    return (
        <View style={styles.container}>
            {/* Display a subtle message if polling failed but chart is showing old data */}
            {error && chartKitData && <Text style={styles.pollingErrorText}>Could not update chart. {error}</Text>}
            <LineChart
                data={chartKitData}
                width={screenWidth - 32}
                height={250}
                yAxisLabel="₹"
                yAxisSuffix=""
                yAxisInterval={4}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 10, paddingHorizontal: 0 },
    chartStyle: { marginVertical: 8, borderRadius: 16 },
    loader: { height: 250, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: COLORS.error || 'red', textAlign: 'center', marginTop: 20, paddingHorizontal: 20, height: 250, textAlignVertical: 'center', fontSize: 15 },
    pollingErrorText: { // Style for non-blocking polling errors
        color: COLORS.text?.secondary || '#aaa',
        fontSize: 10,
        textAlign: 'center',
        position: 'absolute', // Overlay slightly on top
        top: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 5,
        borderRadius: 4,
        zIndex: 1,
    }
});

export default StockHistoryChart;
