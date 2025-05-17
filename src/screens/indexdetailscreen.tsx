// src/screens/IndexDetailScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, Dimensions, Platform, StatusBar, Alert, FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../services/authService';

const screenWidth = Dimensions.get("window").width;
const backIconSource = require('../assets/angle-left.png');

// --- Color Constants ---
const primaryColor = '#25C866';
const negativeColor = '#FF4444';
const screenBackgroundColor = '#000000';
const cardBackgroundColor = '#1A1A1A';
const textColor = '#FFFFFF';
const secondaryTextColor = '#8E8E93';
const indexGraphColorRgb = '147, 112, 219'; // Purple
const chartAreaBackgroundColor = '#0F0F0F';

// --- Type Definitions ---
interface AngelIndexTickData { change: number; change_percent: number; close: number; exchange_timestamp: number; high: number; last_traded_timestamp: number; low: number; ltp: number; open: number; symbol: string; token: string; volume: number; }
interface AngelIndexTickResponse { data?: AngelIndexTickData; status: boolean; message?: string; error?: string; is_stream_running?: boolean; }
interface YFinanceIndexDetails { symbol?: string; company_name?: string; description?: string; "52_week_high"?: string; "52_week_low"?: string; current_price?: string; previous_close?: string; open_price?: string; day_high?: string; day_low?: string; volume?: string; last_trade_time?: string | number; exchange?: string; change?: string; changePercent?: string;}
interface ApiYFinanceDetailResponse { basic_info?: YFinanceIndexDetails; error?: string; fetch_status?: string; }

// This interface is what we transform the API's array data INTO
interface ApiHistoricalDataPoint { date: string; open?: number; high?: number; low?: number; close: number; volume?: number; }
// This interface reflects the actual API response structure for history
interface ApiHistoryResponse { data?: any[][]; error?: string; errorcode?: string; message?: string; status?: boolean; status_code?: number; }


interface IndexDetailsState { name: string; fullName: string; price: string; changeAbsolute: string; changePercent: string; isPositive: boolean; lastUpdated: string; exchange?: string; }
interface IndexKeyDataState { open: string; high: string; low: string; prevClose: string; week52High: string; week52Low: string; volume?: string; }
interface IndexConstituent { id: string; symbol: string; name: string; last_price?: string | number; change_percent?: string | number; is_positive?: boolean; }
type ChartData = { labels: string[]; displayLabels: string[]; datasets: [{ data: number[]; color?: (opacity: number) => string; strokeWidth?: number; }] };
type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'Max';
type OverviewTab = 'Overview' | 'Fundamentals' | 'Constituents';
interface TooltipData { x: number; y: number; visible: boolean; value?: number; date?: string; }

type IndexDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IndexDetailScreen'>;
type IndexDetailScreenRouteProp = RouteProp<RootStackParamList, 'IndexDetailScreen'>;

const INITIAL_CONSTITUENTS_TO_SHOW = 7;

// --- Helper Formatters ---
const safeParseFloat = (value: any): number | null => {
    if (value === null || value === undefined || String(value).trim() === '' || String(value).toUpperCase() === 'N/A' || String(value).trim() === '--') return null;
    const valStr = String(value).replace(/[₹,%]/g, '');
    const num = parseFloat(valStr);
    return isNaN(num) ? null : num;
};
const formatDisplayString = (value: any, defaultVal = '--'): string => ((value !== null && value !== undefined && String(value).trim() !== "" && String(value).toUpperCase() !== 'N/A') ? String(value) : defaultVal);
const formatPriceForDisplay = (value: any, prefix = ''): string => {
    const num = safeParseFloat(value);
    if (num === null) return '--';
    return `${prefix}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatChangeValue = (value: any, prefix = ''): string => {
    const num = safeParseFloat(value);
    if (num === null) return '--';
    const sign = num > 0 ? '+' : num < 0 ? '-' : '';
    return `${sign}${prefix}${Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatChangePercent = (value: any): string => {
    const num = safeParseFloat(value);
    if (num === null) return '--';
    const sign = num > 0 ? '+' : num < 0 ? '-' : '';
    return `${sign}${Math.abs(num).toFixed(2)}%`;
};
const formatDisplayVolume = (value: any): string => {
    const num = safeParseFloat(value);
    if (num === null) return '--';
    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return String(Math.round(num));
};
const formatMarketTimeFromTimestamp = (timestamp: number | string | undefined): string => {
    if (!timestamp || timestamp === "N/A" || timestamp === 0) return `As of ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    try {
        let dateObj: Date;
        if (typeof timestamp === 'number') { dateObj = new Date(timestamp); }
        else if (typeof timestamp === 'string') {
            if (/^\d{2}:\d{2}(:\d{2})? (AM|PM) IST$/.test(timestamp)) {
                const today = new Date(); const parts = timestamp.split(/[:\s]/);
                let hours = parseInt(parts[0], 10); const minutes = parseInt(parts[1], 10);
                const ampm = parts[parts.length - 2];
                if (ampm === 'PM' && hours < 12) hours += 12; if (ampm === 'AM' && hours === 12) hours = 0;
                today.setHours(hours, minutes, parts[2] && parts[2] !== ampm ? parseInt(parts[2], 10) : 0);
                dateObj = today;
            } else { dateObj = new Date(timestamp); }
        } else { return `As of ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`; }
        if (isNaN(dateObj.getTime())) { throw new Error("Invalid date from timestamp/string"); }
        return `As of ${dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } catch (caughtError: any) {
        console.warn("Failed to parse last_trade_time/exchange_timestamp:", timestamp, caughtError.message);
        return `As of ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
};


const IndexDetailScreen: React.FC = () => {
    const navigation = useNavigation<IndexDetailScreenNavigationProp>();
    const route = useRoute<IndexDetailScreenRouteProp>();
    const indexDisplaySymbol = route.params?.symbol;

    const [isLoading, setIsLoading] = useState(true);
    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [isConstituentsLoading, setIsConstituentsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [indexDetails, setIndexDetails] = useState<IndexDetailsState | null>(null);
    const [indexKeyData, setIndexKeyData] = useState<IndexKeyDataState | null>(null);
    const [indexDescription, setIndexDescription] = useState<string | null>('Loading description...');
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1D');
    const [selectedOverviewTab, setSelectedOverviewTab] = useState<OverviewTab>('Overview');
    const [tooltipData, setTooltipData] = useState<TooltipData>({ x: 0, y: 0, visible: false });
    const [constituents, setConstituents] = useState<IndexConstituent[]>([]);
    const [showAllConstituents, setShowAllConstituents] = useState(false);

    const graphColorFn = useCallback((opacity = 1) => `rgba(${indexGraphColorRgb}, ${opacity})`, []);

    const fetchIndexTickDataInternal = useCallback(async (symbol: string) => {
        console.log(`[TICK FETCH for ${symbol}] Initiating...`);
        try {
            const response = await api.get<AngelIndexTickResponse>(`/stocks/angel/realtime/indices/tick?name=${encodeURIComponent(symbol)}`);
            const responseBody = response.data;

            console.log(`[TICK FETCH for ${symbol}] Backend Raw Full Response:`, JSON.stringify(response, null, 2));
            console.log(`[TICK FETCH for ${symbol}] Backend Response Body:`, JSON.stringify(responseBody, null, 2));

            if (!responseBody) {
                console.error(`[TICK FETCH for ${symbol}] No response body received.`);
                throw new Error(`No data in response for ${symbol} tick (empty body).`);
            }

            if (responseBody.status === false) {
                console.warn(`[TICK FETCH for ${symbol}] Backend reported status:false. Message: ${responseBody.message || 'N/A'}, Error: ${responseBody.error || 'N/A'}`);
                throw new Error(responseBody.message || responseBody.error || `Tick data request failed for ${symbol} (status false).`);
            }

            if (!responseBody.data) {
                console.warn(`[TICK FETCH for ${symbol}] Backend status:true but no 'data' payload. Message: ${responseBody.message || 'N/A'}`);
                throw new Error(responseBody.message || `Tick data currently unavailable for ${symbol} (no payload).`);
            }
            
            console.log(`[TICK FETCH for ${symbol}] Success, data received.`);
            return responseBody.data;

        } catch (caughtError: any) {
            console.error(`[TICK FETCH for ${symbol}] Error during API call or processing:`, caughtError.message);
            let errorMessage = `Failed to fetch tick data for ${symbol}.`;
            if (caughtError.response && caughtError.response.data) {
                const serverError = caughtError.response.data;
                errorMessage = serverError.message || serverError.error || JSON.stringify(serverError);
            } else if (caughtError.message) {
                errorMessage = caughtError.message;
            }
            throw new Error(`Tick (${symbol}): ${errorMessage}`);
        }
    }, []);

    const fetchYFinanceDetailsInternal = useCallback(async (symbol: string) => {
        const detailResponse = await api.get<ApiYFinanceDetailResponse>(`/stocks/details/${encodeURIComponent(symbol)}`);
        if (detailResponse.data?.basic_info) {
            return detailResponse.data.basic_info;
        } else if (detailResponse.data?.error) {
            throw new Error(detailResponse.data.error);
        }
        console.warn(`No basic_info or error in yfinance details for ${symbol}, response:`, detailResponse.data);
        return null;
    }, []);

    const fetchGraphDataInternal = useCallback(async (symbol: string, range: TimeRange) => {
        setIsGraphLoading(true);
        console.log(`[GRAPH FETCH for ${symbol}] Range: ${range}. Initiating...`);
        const toDate = new Date();
        const fromDate = new Date(toDate);

        switch (range) {
            case '1D': fromDate.setHours(0, 0, 0, 0); break;
            case '1W': fromDate.setDate(toDate.getDate() - 7); break;
            case '1M': fromDate.setMonth(toDate.getMonth() - 1); break;
            case '3M': fromDate.setMonth(toDate.getMonth() - 3); break;
            case '1Y': fromDate.setFullYear(toDate.getFullYear() - 1); break;
            case '5Y': fromDate.setFullYear(toDate.getFullYear() - 5); break;
            case 'Max': fromDate.setFullYear(toDate.getFullYear() - 20); break;
        }

        const formatDateInternal = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const from = formatDateInternal(fromDate);
        const to = formatDateInternal(toDate);

        let interval = '1d';
        if (range === '1D') interval = '1m';
        else if (range === '1W') interval = '1h';
        else if (range === 'Max') interval = '1mo';

        const apiUrl = `/stocks/history/${encodeURIComponent(symbol)}?fromdate=${from}&todate=${to}&interval=${interval}`;
        console.log(`[GRAPH FETCH for ${symbol}] API URL: ${apiUrl}`);

        try {
            const response = await api.get<ApiHistoryResponse>(apiUrl);
            const historyResponseObject = response.data; // This is the object like {"data": [...arrays...], "status": true, ...}
            console.log(`[GRAPH FETCH for ${symbol}] Raw API Response Object:`, JSON.stringify(historyResponseObject, null, 2));

            // Prioritize error check based on the provided API sample structure
            if (historyResponseObject && historyResponseObject.status === false) {
                const errorMsg = historyResponseObject.message || `API Error (Code: ${historyResponseObject.errorcode || 'Unknown'})`;
                console.error(`[GRAPH FETCH for ${symbol}] API returned status:false. Message: ${errorMsg}`);
                throw new Error(errorMsg);
            }
            // Fallback for other error structures
            if (historyResponseObject && typeof historyResponseObject === 'object' && 'error' in historyResponseObject && historyResponseObject.error) {
                console.error(`[GRAPH FETCH for ${symbol}] API returned an error (alt structure): ${historyResponseObject.error}`);
                throw new Error(historyResponseObject.error || `Failed to fetch history for ${symbol}`);
            }

            const rawDataArrays: any[][] = (historyResponseObject && Array.isArray(historyResponseObject.data)) ? historyResponseObject.data : [];
            console.log(`[GRAPH FETCH for ${symbol}] Extracted rawDataArrays (array of arrays) length: ${rawDataArrays.length}`);

            // Transform array-of-arrays into array-of-objects (ApiHistoricalDataPoint)
            const transformedData: ApiHistoricalDataPoint[] = rawDataArrays.map((pointArray, arrIndex) => {
                if (!Array.isArray(pointArray) || pointArray.length < 5) { // Expecting at least date, o, h, l, c
                    console.warn(`[GRAPH FETCH for ${symbol}] Invalid point array at index ${arrIndex}:`, JSON.stringify(pointArray));
                    return null; // This will be filtered out
                }
                // Assuming structure: [dateStr (index 0), open (1), high (2), low (3), close (4), volume (5)]
                const dateValue = pointArray[0];
                const closeValue = pointArray[4];

                return {
                    date: typeof dateValue === 'string' ? dateValue : String(dateValue), // Ensure date is a string
                    open: typeof pointArray[1] === 'number' ? pointArray[1] : undefined,
                    high: typeof pointArray[2] === 'number' ? pointArray[2] : undefined,
                    low: typeof pointArray[3] === 'number' ? pointArray[3] : undefined,
                    close: typeof closeValue === 'number' ? closeValue : NaN, // Mark as NaN if not number, to be filtered
                    volume: typeof pointArray[5] === 'number' ? pointArray[5] : undefined,
                };
            }).filter(p => p !== null) as ApiHistoricalDataPoint[]; // Remove nulls from mapping invalid arrays

            console.log(`[GRAPH FETCH for ${symbol}] Transformed to ApiHistoricalDataPoint objects, length: ${transformedData.length}`);

            // Filter for valid date strings and numeric close values
            const validProcessedHistoricalData = transformedData.filter(p => {
                const isValid = typeof p.date === 'string' && p.date.trim() !== '' && typeof p.close === 'number' && !isNaN(p.close);
                if (!isValid) {
                    console.warn(`[GRAPH FETCH for ${symbol}] Filtering out invalid data point after transformation/validation:`, JSON.stringify(p));
                }
                return isValid;
            });
            console.log(`[GRAPH FETCH for ${symbol}] validProcessedHistoricalData length after object validation: ${validProcessedHistoricalData.length}`);

            if (validProcessedHistoricalData.length > 0) {
                let dataPoints = validProcessedHistoricalData.map(p => p.close as number); 
                let originalFullLabels = validProcessedHistoricalData.map(p => p.date as string); 
                
                console.log(`[GRAPH FETCH for ${symbol}] Initial dataPoints length: ${dataPoints.length}, originalFullLabels length: ${originalFullLabels.length}`);

                if (range === '1D' && interval === '1m' && originalFullLabels.length > 0) {
                    console.log(`[GRAPH FETCH for ${symbol}] Applying 1D intraday filter.`);
                    const lastLabelForFilter = originalFullLabels[originalFullLabels.length - 1];
                    const lastDateDay = new Date(lastLabelForFilter.split('T')[0] + "T00:00:00Z").toDateString();
                    
                    const intradayPoints: number[] = [];
                    const intradayOriginalLabels: string[] = [];

                    validProcessedHistoricalData.forEach(p_obj => { 
                        const pointDateObj = new Date(p_obj.date); 
                        if (isNaN(pointDateObj.getTime())) {
                            console.warn(`[GRAPH FETCH for ${symbol}] Could not parse date string in 1D filter: ${p_obj.date}`);
                            return; 
                        }
                        const pointDateDay = new Date(pointDateObj.toISOString().split('T')[0] + "T00:00:00Z").toDateString();
                        if (pointDateDay === lastDateDay) {
                            intradayPoints.push(p_obj.close as number);
                            intradayOriginalLabels.push(p_obj.date as string);
                        }
                    });

                    if (intradayPoints.length > 1) {
                        dataPoints = intradayPoints;
                        originalFullLabels = intradayOriginalLabels;
                        console.log(`[GRAPH FETCH for ${symbol}] After 1D filter - dataPoints: ${dataPoints.length}, labels: ${originalFullLabels.length}`);
                    } else {
                        console.log(`[GRAPH FETCH for ${symbol}] 1D filter resulted in < 2 points (${intradayPoints.length}), using original data if sufficient.`);
                    }
                }

                if (dataPoints.length < 2) {
                    console.warn(`[GRAPH FETCH for ${symbol}] Not enough data points to draw chart (${dataPoints.length}) after all processing. Returning null.`);
                    return null;
                }
                console.log(`[GRAPH FETCH for ${symbol}] Success, chart data prepared with ${dataPoints.length} points.`);
                return { labels: originalFullLabels, displayLabels: [], datasets: [{ data: dataPoints, color: graphColorFn, strokeWidth: 2 }] };
            }
            
            console.warn(`[GRAPH FETCH for ${symbol}] No valid historical data points found after all filtering. Returning null.`);
            return null;

        } catch (caughtError: any) {
            console.error(`[GRAPH FETCH for ${symbol}] Error: ${caughtError.message}`);
            throw caughtError;
        }
        finally {
            setIsGraphLoading(false);
            console.log(`[GRAPH FETCH for ${symbol}] Loading finished.`);
        }
    }, [graphColorFn]);

    const fetchConstituentsInternal = useCallback(async (symbol: string): Promise<IndexConstituent[]> => {
        if (!symbol) return [];
        setIsConstituentsLoading(true);
        try {
            const response = await api.get(`/stocks/index/${encodeURIComponent(symbol)}/constituents`);
            if (Array.isArray(response.data)) {
                const processedData = response.data.map((c: any, index: number) => {
                    const apiPrice = c.price;
                    const apiChangePercent = c.changePercent;
                    const changeNum = safeParseFloat(apiChangePercent); 
                    const isPositiveDefault = changeNum !== null ? changeNum >= 0 : false;
                    return {
                        id: String(c.symbol || `constituent_${index}_${Date.now()}`), 
                        symbol: String(c.symbol || 'UNKNOWN'),
                        name: String(c.name || 'Unknown Company'),
                        last_price: apiPrice,
                        change_percent: apiChangePercent,
                        is_positive: isPositiveDefault,
                    };
                });
                return processedData;
            } else {
                console.warn("[Constituents] Data is not an array:", response.data);
                const newError = `Constituents: Data format error.`;
                setError(prev => prev ? (prev.includes(newError) ? prev : `${prev}\n${newError}`) : newError);
                return [];
            }
        } catch (caughtError:any) {
            console.error(`[Constituents] Failed to fetch for ${symbol}:`, caughtError);
            const newError = `Constituents: ${caughtError.message || 'Failed to load.'}`;
            setError(prev => prev ? (prev.includes(newError) ? prev : `${prev}\n${newError}`) : newError);
            return [];
        } finally {
            setIsConstituentsLoading(false);
        }
    }, []); 

    useEffect(() => {
        if (!indexDisplaySymbol) {
            setError('Index symbol not provided.'); setIsLoading(false); return;
        }
        const loadAllIndexData = async () => {
            console.log(`[loadAllIndexData for ${indexDisplaySymbol}] Initiating. Selected time range: ${selectedTimeRange}`);
            setIsLoading(true); setError(null);
            setIndexDetails(null); setIndexKeyData(null); 
            setConstituents([]); setIndexDescription('Loading description...');
            
            let cumulativeErrorMessages: string[] = [];
            let tempIndexDetailsState: Partial<IndexDetailsState> = { name: indexDisplaySymbol, fullName: indexDisplaySymbol, price:'--', changeAbsolute:'--', changePercent:'--', isPositive:false, lastUpdated:'N/A'};
            let tempIndexKeyDataState: Partial<IndexKeyDataState> = { open:'--', high:'--', low:'--', prevClose:'--', week52High:'--', week52Low:'--', volume: '--'};
            let tickDataLoadedSuccessfully = false;

            try {
                const tick = await fetchIndexTickDataInternal(indexDisplaySymbol);
                tempIndexDetailsState = {
                    name: tick.symbol, fullName: formatDisplayString(tick.symbol, tick.symbol),
                    price: formatPriceForDisplay(tick.ltp, ''), changeAbsolute: formatChangeValue(tick.change, ''),
                    changePercent: formatChangePercent(tick.change_percent), isPositive: tick.change >= 0,
                    lastUpdated: formatMarketTimeFromTimestamp(tick.exchange_timestamp),
                    exchange: tick.symbol.includes("NIFTY") ? "NSE" : tick.symbol.includes("SENSEX") ? "BSE" : "N/A",
                };
                tempIndexKeyDataState = { ...tempIndexKeyDataState, open: formatPriceForDisplay(tick.open, ''), high: formatPriceForDisplay(tick.high, ''), low: formatPriceForDisplay(tick.low, ''), prevClose: formatPriceForDisplay(tick.close, ''), volume: formatDisplayVolume(tick.volume)};
                tickDataLoadedSuccessfully = true;
            } catch (caughtError: any) {
                console.error(`[loadAllIndexData for ${indexDisplaySymbol}] Error from fetchIndexTickDataInternal:`, caughtError.message);
                cumulativeErrorMessages.push(caughtError.message || `Failed to load live data for ${indexDisplaySymbol}.`);
            }

            try {
                const yfDetails = await fetchYFinanceDetailsInternal(indexDisplaySymbol);
                if (yfDetails) {
                    tempIndexKeyDataState = { ...tempIndexKeyDataState, week52High: formatPriceForDisplay(yfDetails["52_week_high"], ''), week52Low: formatPriceForDisplay(yfDetails["52_week_low"], '')};
                    if (yfDetails.description && yfDetails.description !== 'N/A') setIndexDescription(yfDetails.description);
                    else if (indexDescription === 'Loading description...') setIndexDescription('No description available.');
                    
                    if (yfDetails.company_name && (tempIndexDetailsState.fullName === tempIndexDetailsState.name || tempIndexDetailsState.fullName === '--')) {
                        tempIndexDetailsState.fullName = formatDisplayString(yfDetails.company_name, tempIndexDetailsState.fullName);
                    }

                    if (!tickDataLoadedSuccessfully && yfDetails.current_price) {
                        console.log(`[loadAllIndexData for ${indexDisplaySymbol}] Using YFinance details as fallback for primary display.`);
                        const currentPriceNum = safeParseFloat(yfDetails.current_price);
                        const prevCloseNum = safeParseFloat(yfDetails.previous_close);
                        let changeAbsNum : number | null = null; let changePercNum : number | null = null;
                        if(currentPriceNum !== null && prevCloseNum !== null) {
                            changeAbsNum = currentPriceNum - prevCloseNum;
                            if(prevCloseNum !== 0) changePercNum = (changeAbsNum / prevCloseNum) * 100;
                        }
                        tempIndexDetailsState = {
                            name: yfDetails.symbol || indexDisplaySymbol, fullName: formatDisplayString(yfDetails.company_name, yfDetails.symbol || indexDisplaySymbol),
                            price: formatPriceForDisplay(yfDetails.current_price, ''), changeAbsolute: formatChangeValue(changeAbsNum, ''),
                            changePercent: formatChangePercent(changePercNum), isPositive: changeAbsNum !== null ? changeAbsNum >= 0 : false,
                            lastUpdated: formatMarketTimeFromTimestamp(yfDetails.last_trade_time),
                            exchange: formatDisplayString(yfDetails.exchange, tempIndexDetailsState.exchange || 'N/A')
                        };
                        tempIndexKeyDataState = { ...tempIndexKeyDataState, open: formatPriceForDisplay(yfDetails.open_price, ''), high: formatPriceForDisplay(yfDetails.day_high, ''), low: formatPriceForDisplay(yfDetails.day_low, ''), prevClose: formatPriceForDisplay(yfDetails.previous_close, ''), volume: formatDisplayVolume(yfDetails.volume)};
                    }
                }
            } catch (caughtError: any) {
                console.warn(`[loadAllIndexData for ${indexDisplaySymbol}] Error from fetchYFinanceDetailsInternal:`, caughtError.message);
                const yfErrorMsg = `Supplementary Data: ${caughtError.message || 'Failed to load.'}`;
                if (!cumulativeErrorMessages.some(msg => msg.startsWith('Tick'))) {
                    cumulativeErrorMessages.push(yfErrorMsg);
                }
                if(indexDescription === 'Loading description...') setIndexDescription('Description not available.');
            }
            
            setIndexDetails(tempIndexDetailsState as IndexDetailsState);
            setIndexKeyData(tempIndexKeyDataState as IndexKeyDataState);

            try {
                setChartData(null); 
                console.log(`[loadAllIndexData for ${indexDisplaySymbol}] About to call fetchGraphDataInternal with range: ${selectedTimeRange}`);
                const newChartData = await fetchGraphDataInternal(indexDisplaySymbol, selectedTimeRange);
                setChartData(newChartData);
                if (!newChartData) {
                     console.log(`[loadAllIndexData for ${indexDisplaySymbol}] fetchGraphDataInternal returned null, no chart will be displayed.`);
                }
            } catch (graphError: any) {
                console.error(`[loadAllIndexData for ${indexDisplaySymbol}] Error from fetchGraphDataInternal:`, graphError.message);
                const graphErrorMsg = `Graph: ${graphError.message || 'Failed to load chart.'}`;
                cumulativeErrorMessages.push(graphErrorMsg);
            }
            
            try {
                const fetchedConstituents = await fetchConstituentsInternal(indexDisplaySymbol);
                setConstituents(fetchedConstituents);
            } catch (constituentsError: any) { 
                console.error(`[loadAllIndexData for ${indexDisplaySymbol}] Error from fetchConstituentsInternal (should be handled within):`, constituentsError.message);
            }
            
            if (cumulativeErrorMessages.length > 0) {
                setError(cumulativeErrorMessages.join('\n'));
            }
            setIsLoading(false);
            console.log(`[loadAllIndexData for ${indexDisplaySymbol}] Finished.`);
        };

        loadAllIndexData();
    }, [indexDisplaySymbol, selectedTimeRange, fetchIndexTickDataInternal, fetchYFinanceDetailsInternal, fetchGraphDataInternal, fetchConstituentsInternal]);
    
    const renderKeyDataRow = (label: string, value: string | undefined | null) => (
        <View style={styles.detailRow} key={label}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{formatDisplayString(value)}</Text>
        </View>
    );

    const handleTimeRangeSelect = useCallback((range: TimeRange) => {
        if (selectedTimeRange === range && chartData) return; 
        console.log(`[handleTimeRangeSelect] New range: ${range}. Current range: ${selectedTimeRange}`);
        setTooltipData(prev => ({ ...prev, visible: false })); 
        setSelectedTimeRange(range);
    }, [selectedTimeRange, chartData]);
    
    const renderListItem = ({ item }: { item: IndexConstituent }) => {
        const hasPrice = item.last_price !== undefined && item.last_price !== null && String(item.last_price).trim() !== '';
        const hasChange = item.change_percent !== undefined && item.change_percent !== null && String(item.change_percent).trim() !== '';

        return (
            <TouchableOpacity
                style={styles.listItemContainer}
                onPress={() => navigation.navigate('StockDetailScreen', { symbol: item.symbol })}
            >
                <View style={styles.listItemTextContainer}>
                    <Text style={styles.listItemSymbol}>{item.symbol.replace(/\.NS$|\.BO$/i, '')}</Text>
                    <Text style={styles.listItemName} numberOfLines={1}>{item.name}</Text>
                </View>
                {hasPrice || hasChange ? (
                    <View style={styles.listItemPriceContainer}>
                        {hasPrice ? (
                            <Text style={styles.listItemPrice}>{formatPriceForDisplay(item.last_price, "₹")}</Text>
                        ) : (
                            <Text style={styles.listItemPrice}>--</Text>
                        )}
                        {hasChange && (
                            <Text style={[styles.listItemChange, { color: item.is_positive ? primaryColor : negativeColor }]}>
                                {formatChangePercent(item.change_percent)}
                            </Text>
                        )}
                    </View>
                ) : (
                     <View style={styles.listItemPriceContainer}> 
                        <Text style={styles.listItemPrice}>--</Text> 
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // --- JSX ---
    if (isLoading && !indexDetails) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={primaryColor} style={styles.loadingIndicator} /></SafeAreaView>;
    }
    if (error && !indexDetails && isLoading) { 
        return <SafeAreaView style={styles.container}><View style={styles.messageContainer}><Text style={styles.errorText}>{error.split('\n')[0]}</Text></View></SafeAreaView>;
    }
    if (!indexDetails) { 
        return <SafeAreaView style={styles.container}><View style={styles.messageContainer}><Text style={styles.errorText}>Index details could not be loaded.</Text></View></SafeAreaView>;
    }

    const displayedConstituents = showAllConstituents ? constituents : constituents.slice(0, INITIAL_CONSTITUENTS_TO_SHOW);
    const overviewTabs: OverviewTab[] = ['Overview', 'Constituents']; 

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={screenBackgroundColor} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image source={backIconSource} style={styles.headerIcon} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{indexDetails.name}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{indexDetails.fullName}</Text>
                </View>
                <View style={{width: 40}} /> 
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                onTouchStart={() => { if (tooltipData.visible) setTooltipData(prev => ({ ...prev, visible: false })); }}
                scrollEventThrottle={16}
            >
                <View style={styles.priceSection}>
                    <Text style={styles.priceText}>{indexDetails.price}</Text>
                    <View style={styles.changeRow}>
                        {(indexDetails.price !== '--' && indexDetails.changeAbsolute !== '--') &&
                            <Icon name={indexDetails.isPositive ? "caret-up" : "caret-down"} size={18} color={indexDetails.isPositive ? primaryColor : negativeColor} />
                        }
                        <Text style={[styles.changeTextAbsolute, { color: indexDetails.isPositive ? primaryColor : negativeColor }]}>{indexDetails.changeAbsolute}</Text>
                        <Text style={[styles.changeTextPercent, { color: indexDetails.isPositive ? primaryColor : negativeColor }]}> ({indexDetails.changePercent})</Text>
                    </View>
                    <Text style={styles.metaText}>{(indexDetails.exchange && indexDetails.exchange !== 'N/A' ? `${indexDetails.exchange} • ` : '') + indexDetails.lastUpdated}</Text>
                </View>

                <View style={styles.graphContainer}>
                    {isGraphLoading && <ActivityIndicator color={primaryColor} style={styles.graphActivityIndicator} />}
                    {!isGraphLoading && chartData && chartData.datasets[0].data.length > 1 ? (
                        <LineChart
                            data={{ labels: chartData.displayLabels, datasets: chartData.datasets }}
                            width={screenWidth} height={230} withHorizontalLabels={false} withVerticalLabels={false}
                            withInnerLines={true} withOuterLines={false} withShadow={false} bezier
                            chartConfig={{
                                backgroundColor: chartAreaBackgroundColor, backgroundGradientFrom: chartAreaBackgroundColor,
                                backgroundGradientTo: chartAreaBackgroundColor, 
                                backgroundGradientFromOpacity: 0, backgroundGradientToOpacity: 0,
                                decimalPlaces: 2, color: graphColorFn,
                                labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`, 
                                propsForDots: { r: "0" }, 
                                propsForBackgroundLines: { stroke: '#2C2C2E', strokeDasharray: '' }, 
                                strokeWidth: 2,
                            }}
                            style={styles.chartStyle}
                            onDataPointClick={({ value, x, y, index }) => {
                                const originalLabel = (chartData && chartData.labels && typeof chartData.labels[index] === 'string') 
                                                      ? chartData.labels[index] 
                                                      : ""; 
                                
                                let displayDate = "N/A";

                                if (originalLabel) {
                                    try {
                                        if (originalLabel.includes('T')) {
                                            displayDate = originalLabel.split('T')[0];
                                        } else {
                                            displayDate = originalLabel.substring(0, 10); 
                                        }

                                        if (selectedTimeRange === '1D') {
                                            const dateObj = new Date(originalLabel);
                                            if (!isNaN(dateObj.getTime())) { 
                                                displayDate = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                            } else if (originalLabel.includes(" ") && originalLabel.includes(":")) { 
                                                const parts = originalLabel.split(" ");
                                                if (parts.length > 1 && parts[1].includes(":")) {
                                                     displayDate = parts[1].substring(0,5);
                                                } else {
                                                    displayDate = originalLabel.includes('T') ? originalLabel.split('T')[0] : originalLabel;
                                                }
                                            } else {
                                                displayDate = displayDate || originalLabel;
                                            }
                                        }
                                    } catch (e) {
                                        console.warn("[onDataPointClick] Error processing originalLabel for tooltip:", originalLabel, e);
                                        displayDate = originalLabel || "N/A"; 
                                    }
                                } else {
                                    console.warn(`[onDataPointClick] originalLabel is empty or invalid for index ${index}.`);
                                }
                                setTooltipData({ x, y, visible: true, value, date: displayDate });
                            }}
                        />
                    ) : (
                        !isGraphLoading && <View style={styles.graphPlaceholder}><Text style={styles.graphPlaceholderText}>{error && error.includes("Graph:") ? error.split("Graph:")[1]?.split('\n')[0].trim() : `No chart data for ${selectedTimeRange}.`}</Text></View>
                    )}
                </View>
                {tooltipData.visible && (
                    <View style={[ styles.tooltipAbsoluteContainer, { top: tooltipData.y - 60, left: Math.max(5, Math.min(tooltipData.x - 50, screenWidth - 105)) } ]}>
                        <Text style={styles.tooltipTextValue}>{`${formatPriceForDisplay(tooltipData.value, '')}`}</Text>
                        <Text style={styles.tooltipTextDate}>{`${tooltipData.date}`}</Text>
                    </View>
                )}

                <View style={styles.timeRangeContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        {(['1D', '1W', '1M', '3M', '1Y', '5Y', 'Max'] as TimeRange[]).map((range) => (
                            <TouchableOpacity
                                key={range}
                                style={[styles.timeRangeButton, selectedTimeRange === range && styles.timeRangeButtonSelected]}
                                onPress={() => handleTimeRangeSelect(range)}>
                                <Text style={[styles.timeRangeText, selectedTimeRange === range && styles.timeRangeTextSelected]}>{range}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                
                <View style={styles.overviewTabOuterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.overviewTabContainer} contentContainerStyle={{ paddingRight: 16 }}>
                        {overviewTabs.map(tab => (
                            <TouchableOpacity key={tab} style={[styles.overviewTabButton, selectedOverviewTab === tab && styles.overviewTabButtonSelected]} onPress={() => setSelectedOverviewTab(tab)}>
                                <Text style={[styles.overviewTabText, selectedOverviewTab === tab && styles.overviewTabTextSelected]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.tabContentContainer}>
                    {selectedOverviewTab === 'Overview' && (
                        <View style={styles.overviewContent}>
                            {indexKeyData && (
                                <View style={styles.sectionPadding}>
                                    <Text style={styles.subSectionTitle}>Key Data</Text>
                                    <View style={styles.keyStatsGrid}>
                                        {renderKeyDataRow('Open', indexKeyData.open)}
                                        {renderKeyDataRow('High', indexKeyData.high)}
                                        {renderKeyDataRow('Low', indexKeyData.low)}
                                        {renderKeyDataRow('Prev. Close', indexKeyData.prevClose)}
                                        {renderKeyDataRow('52W High', indexKeyData.week52High)}
                                        {renderKeyDataRow('52W Low', indexKeyData.week52Low)}
                                        {renderKeyDataRow('Volume', indexKeyData.volume)}
                                    </View>
                                </View>
                            )}
                             {indexDescription && indexDetails && (
                                <View style={styles.sectionPadding}>
                                    <Text style={styles.subSectionTitle}>About {indexDetails.name}</Text>
                                    <Text style={styles.descriptionText}>{indexDescription}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    {selectedOverviewTab === 'Fundamentals' && ( 
                         <View style={[styles.overviewContent, styles.sectionPadding]}>
                            <Text style={styles.subSectionTitle}>Index Information</Text>
                             <Text style={styles.notApplicableText}>Fundamental ratios like P/E, EPS, Dividend Yield, etc., are generally not applicable to market indices. Key performance data is available in the Overview tab.</Text>
                        </View>
                    )}
                    {selectedOverviewTab === 'Constituents' && indexDetails && (
                         <View style={[styles.overviewContent, styles.sectionPadding]}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.subSectionTitle}>{`${indexDetails.name} Companies`}</Text>
                                {constituents.length > INITIAL_CONSTITUENTS_TO_SHOW && (
                                    <TouchableOpacity onPress={() => setShowAllConstituents(!showAllConstituents)}>
                                        <Text style={styles.seeMoreText}>{showAllConstituents ? 'See Less' : 'See All'}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {isConstituentsLoading ? <ActivityIndicator color={primaryColor} style={{marginTop: 20}} /> :
                                displayedConstituents.length > 0 ? (
                                    <FlatList 
                                        data={displayedConstituents} 
                                        renderItem={renderListItem} 
                                        keyExtractor={(item) => item.id}
                                        scrollEnabled={false} 
                                        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                                    />
                                ) : <Text style={styles.emptyListText}>{error && error.includes("Constituents:") ? error.split("Constituents:")[1]?.trim() : 'Constituents data not available or empty.'}</Text>
                            }
                        </View>
                    )}
                </View>
                {/* {error && (isLoading || indexDetails) && (
                    <View style={{paddingHorizontal: 16, paddingBottom: 16}}>
                        <Text style={[styles.errorText, {textAlign: 'left', color: '#FFA0A0'}]}>
                            Errors: {'\n'}
                            {error.split('\n').map((errLine, idx) => <Text key={idx}>{errLine}{'\n'}</Text>)}
                        </Text>
                    </View>
                )} */}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: screenBackgroundColor },
    loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: negativeColor, textAlign: 'center', fontSize: 14, paddingHorizontal: 10 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: cardBackgroundColor, borderBottomWidth:1, borderBottomColor:'#2C2C2E' },
    backButton: { padding: 8, marginLeft: -8 },
    headerIcon: { width: 24, height: 24, resizeMode: 'contain', tintColor: textColor },
    headerTitleContainer: { alignItems: 'flex-start', flex: 1, marginHorizontal: 10 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: textColor },
    headerSubtitle: { fontSize: 12, color: secondaryTextColor, marginTop: 2 },
    priceSection: { paddingHorizontal: 16, paddingVertical: 20, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
    priceText: { fontSize: 36, fontWeight: 'bold', color: textColor, marginBottom: 4 },
    changeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    changeTextAbsolute: { fontSize: 18, fontWeight: '500', marginLeft: 4 },
    changeTextPercent: { fontSize: 18, fontWeight: '500', marginLeft: 6 },
    metaText: { fontSize: 12, color: secondaryTextColor },
    graphContainer: { minHeight: 230, justifyContent: 'center', alignItems: 'center', backgroundColor: chartAreaBackgroundColor },
    graphActivityIndicator: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,15,15,0.5)', zIndex:1 },
    graphPlaceholder: { height: 230, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal:20 },
    graphPlaceholderText: { color: secondaryTextColor, textAlign:'center' },
    chartStyle: { paddingRight: 0, paddingLeft: 0, marginVertical: 0 },
    tooltipAbsoluteContainer: { position: 'absolute', backgroundColor: 'rgba(50, 50, 50, 0.95)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, zIndex: 1000, },
    tooltipTextValue: { color: textColor, fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
    tooltipTextDate: { color: secondaryTextColor, fontSize: 11, },
    timeRangeContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', backgroundColor: screenBackgroundColor },
    timeRangeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: cardBackgroundColor, marginRight: 10 },
    timeRangeButtonSelected: { backgroundColor: textColor },
    timeRangeText: { color: textColor, fontSize: 13, fontWeight: '500' },
    timeRangeTextSelected: { color: screenBackgroundColor, fontWeight: '600' },
    overviewTabOuterContainer: { borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
    overviewTabContainer: { paddingLeft: 16 },
    overviewTabButton: { paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: 16 },
    overviewTabButtonSelected: { borderBottomColor: textColor },
    overviewTabText: { color: secondaryTextColor, fontSize: 15, fontWeight: '500' },
    overviewTabTextSelected: { color: textColor, fontWeight: '600' },
    tabContentContainer: { paddingBottom: 16 }, 
    sectionPadding: { paddingHorizontal: 16, paddingTop:16, marginBottom: 4 }, 
    overviewContent: {},
    subSectionTitle: { fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16 },
    descriptionText: { fontSize: 14, color: '#B0B0B0', lineHeight: 21, marginBottom:16 }, 
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
    detailLabel: { fontSize: 14, color: secondaryTextColor, flexShrink: 1, marginRight: 8 },
    detailValue: { fontSize: 14, color: textColor, fontWeight: '500', textAlign: 'right' },
    keyStatsGrid: {}, 
    notApplicableText: { color: secondaryTextColor, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20}, 
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, }, 
    seeMoreText: { color: primaryColor, fontSize: 14, fontWeight: '600', },
    listItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12,}, 
    listItemTextContainer: { flex: 1, marginRight: 10 },
    listItemSymbol: { fontSize: 15, fontWeight: '600', color: textColor },
    listItemName: { fontSize: 12, color: secondaryTextColor, marginTop: 2 },
    listItemPriceContainer: { alignItems: 'flex-end', minWidth: 80 }, 
    listItemPrice: { fontSize: 15, fontWeight: '500', color: textColor },
    listItemChange: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    listSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: '#2C2C2E', marginLeft: 0 }, 
    emptyListText: { color: secondaryTextColor, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic',}, 
});

export default IndexDetailScreen;