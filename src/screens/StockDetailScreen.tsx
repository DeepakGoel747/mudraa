// src/screens/StockDetailScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
    Platform,
    StatusBar,
    Alert,
    Share,
    ActionSheetIOS,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../services/authService'; // Your API service

const screenWidth = Dimensions.get("window").width;
const backIconSource = require('../assets/angle-left.png');

// --- Color Constants ---
const screenBackgroundColor = '#000000';
const cardBackgroundColor = '#1A1A1A';
const textColor = '#FFFFFF';
const secondaryTextColor = '#8E8E93';
const primaryColor = '#25C866'; // Green
const negativeColor = '#FF4444'; // Red
const chartAreaBackgroundColor = '#0F0F0F';
const stockGraphColorRgb = '59, 130, 246';
const indexGraphColorRgb = '147, 112, 219';

// --- Type Definitions ---
interface ApiBasicInfo {
    symbol: string; company_name: string; industry?: string; description?: string;
    exchange?: string; exchange_nse?: string; exchange_bse?: string; isin?: string;
    market_cap?: string; pe_ratio?: string; forward_pe_ratio?: string;
    book_value_per_share?: string; price_to_book?: string; dividend_yield?: string;
    roe?: string; beta?: string; "52_week_high"?: string; "52_week_low"?: string;
    current_price: string; previous_close?: string; open_price?: string;
    day_high?: string; day_low?: string; volume?: string;
    last_trade_time?: string | number;
}

interface ApiStockFinancialMapEntry {
    displayName: string;
    key: string;
    qoQComp: string | null;
    value: string;
    yqoQComp: string | null;
}

interface ApiStockFinancialMap {
    BAL: ApiStockFinancialMapEntry[];
    CAS: ApiStockFinancialMapEntry[];
    INC: ApiStockFinancialMapEntry[];
}

interface ApiFinancialStatement {
    EndDate: string;
    FiscalYear: string;
    StatementDate: string;
    Type: 'Annual' | 'Quarterly' | string;
    fiscalPeriodNumber: number;
    stockFinancialMap: ApiStockFinancialMap;
}

interface ApiFinancialsResponse {
    source: string;
    statements: ApiFinancialStatement[];
    error?: string;
    message?: string;
    symbol?: string; // From your Postman example, to help track if data is for current ticker
}
interface ApiStockDetailResponse {
    basic_info: ApiBasicInfo;
    candlestick_data?: Array<{ date: string; price: number }>;
    fetch_status?: string; fetch_errors?: string[]; error?: string;
}

interface ApiHistoricalDataPoint { date: string; open?: number; high?: number; low?: number; close: number; volume?: number; }
type AngelHistoricalDataEntry = [string, number, number, number, number, number];
interface ApiAngelIndexHistoryResponse { data?: AngelHistoricalDataEntry[]; status?: boolean; message?: string; error?: string; }
interface WatchlistItemAPI { id: string; symbol: string; name: string; }

type StockDetailsState = {
    name: string; fullName: string; tag?: string; price: string;
    changeAbsolute: string; changePercent: string; isPositive: boolean;
    exchange: string; lastUpdated: string;
};
type PerformanceDataState = { todayLow: string; todayHigh: string; week52Low: string; week52High: string; open: string; prevClose: string; volume: string; avgVolume?: string; };
type KeyStatsState = { marketCap: string; peRatio?: string; eps?: string; divYield?: string; beta?: string; bookValue?: string; roe?: string; };
type FinancialHighlight = { label: string; value: string; };
type ChartData = {
    labels: string[]; displayLabels: string[];
    datasets: { data: number[]; fullData?: ApiHistoricalDataPoint[]; color?: (opacity: number) => string; strokeWidth?: number; }[];
};
type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'Max';
type OverviewTab = 'Overview' | 'Fundamentals' | 'Financial';
interface TooltipData { x: number; y: number; visible: boolean; value?: number; date?: string; index?: number; }

const StockDetailScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'StockDetailScreen'>>();
    const initialIdentifierFromRoute = route.params?.symbol;

    const getGraphLineColorFn = useCallback((symbolForColor: string | undefined | null) => {
        const normalizedSymbol = symbolForColor?.toUpperCase() || "";
        const isIndexSymbol = normalizedSymbol === 'NIFTY 50' || normalizedSymbol === 'SENSEX' || normalizedSymbol === 'BANK NIFTY' || normalizedSymbol.startsWith('^');
        const RgbToUse = isIndexSymbol ? indexGraphColorRgb : stockGraphColorRgb;
        return (opacity = 1) => `rgba(${RgbToUse}, ${opacity})`;
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [isFinancialsLoading, setIsFinancialsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stockDetails, setStockDetails] = useState<StockDetailsState | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceDataState | null>(null);
    const [keyStats, setKeyStats] = useState<KeyStatsState | null>(null);
    const [financialHighlights, setFinancialHighlights] = useState<FinancialHighlight[]>([]);
    const [financialsMessage, setFinancialsMessage] = useState<string | null>(null);
    const [detailedFinancials, setDetailedFinancials] = useState<ApiFinancialsResponse | null>(null);
    const [stockDescription, setStockDescription] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1D');
    const [selectedOverviewTab, setSelectedOverviewTab] = useState<OverviewTab>('Overview');
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [tooltipData, setTooltipData] = useState<TooltipData>({ x: 0, y: 0, visible: false });
    const [resolvedTicker, setResolvedTicker] = useState<string | null>(null);
    const [currentChartColor, setCurrentChartColor] = useState(() => getGraphLineColorFn(initialIdentifierFromRoute));
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isWatchlistUpdating, setIsWatchlistUpdating] = useState(false);

    // --- Helper Formatters (keep these as they are) ---
    const safeParseFloat = (value: any): number | null => { /* ... same as before ... */ 
        if (value === null || value === undefined || String(value).trim() === '' || String(value).toUpperCase() === 'N/A' || String(value).trim() === '--') return null;
        const valStr = String(value).replace(/[₹,]/g, '').toUpperCase()
            .replace(/CR$/i, 'E7').replace(/LAKH$/i, 'E5').replace(/L$/, 'E5')
            .replace(/T$/, 'E12').replace(/B$/, 'E9').replace(/M$/, 'E6').replace(/K$/i, 'E3');
        const num = parseFloat(valStr);
        return isNaN(num) ? null : num;
    };
    const formatDisplayString = (value: any, defaultVal = '--'): string => ((value !== null && value !== undefined && String(value).trim() !== "" && String(value).toUpperCase() !== 'N/A') ? String(value) : defaultVal);
    const formatPriceForDisplay = (value: any, prefix = '₹'): string => { /* ... same as before ... */ 
        const num = safeParseFloat(value);
        if (num === null) return '--';
        return `${prefix}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const formatChangeValue = (value: any, prefix = '₹'): string => { /* ... same as before ... */ 
        const num = safeParseFloat(value);
        if (num === null) return '--';
        const sign = num > 0 ? '+' : num < 0 ? '-' : '';
        return `${sign}${prefix}${Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const formatChangePercent = (value: any): string => { /* ... same as before ... */ 
        const num = safeParseFloat(value);
        if (num === null) return '--';
        const sign = num > 0 ? '+' : num < 0 ? '-' : '';
        return `${sign}${Math.abs(num).toFixed(2)}%`;
    };
    const formatDisplayLargeNumber = (value: any, prefix = '₹'): string => { /* ... same as before ... */ 
        const num = safeParseFloat(value);
        if (num === null) return '--';
        if (Math.abs(num) >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T`;
        if (Math.abs(num) >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`;
        if (Math.abs(num) >= 1e7) return `${prefix}${(num / 1e7).toFixed(2)} Cr`;
        if (Math.abs(num) >= 1e5) return `${prefix}${(num / 1e5).toFixed(2)} L`;
        return `${prefix}${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };
    const formatDisplayVolume = (value: any): string => { /* ... same as before ... */ 
        const num = safeParseFloat(value);
        if (num === null) return '--';
        if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return String(Math.round(num));
    };
    const formatMarketTime = (timestamp: string | number | undefined): string => { /* ... same as before ... */ 
        const fallbackTime = `As of ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
        if (!timestamp || timestamp === "N/A") return fallbackTime;
        try {
            let dateObj: Date;
            if (typeof timestamp === 'number') { dateObj = new Date(timestamp * (String(timestamp).length === 10 ? 1000 : 1)); }
            else if (typeof timestamp === 'string') {
                if (/^\d{2}:\d{2}(:\d{2})? (AM|PM) IST$/.test(timestamp)) {
                    const today = new Date(); const parts = timestamp.split(/[:\s]/);
                    let hours = parseInt(parts[0], 10); const minutes = parseInt(parts[1], 10);
                    const ampm = parts[parts.length - 2];
                    if (ampm === 'PM' && hours < 12) hours += 12; if (ampm === 'AM' && hours === 12) hours = 0;
                    today.setHours(hours, minutes, parts[2] && parts[2] !== ampm ? parseInt(parts[2], 10) : 0, 0);
                    dateObj = today;
                } else { dateObj = new Date(timestamp); }
            } else { return fallbackTime; }
            if (isNaN(dateObj.getTime())) return fallbackTime;
            return `As of ${dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
        } catch (formatTimeError: any) { console.warn("Failed to parse last_trade_time:", timestamp, formatTimeError); return fallbackTime; }
    };

    const fetchGraphData = useCallback(async (symbolToFetch: string, range: TimeRange) => { /* ... same as before ... */ 
        if (!symbolToFetch) return;
        setIsGraphLoading(true); setChartData(null); setTooltipData({ visible: false, x: 0, y: 0 });
        let period = '1mo'; let interval = '1d';
        switch (range) {
            case '1D': period = '1d'; interval = '5m'; break;
            case '1W': period = '7d'; interval = '30m'; break;
            case '1M': period = '1mo'; interval = '1d'; break;
            case '3M': period = '3mo'; interval = '1d'; break;
            case '1Y': period = '1y'; interval = '1d'; break;
            case '5Y': period = '5y'; interval = '1wk'; break;
            case 'Max': period = 'max'; interval = '1mo'; break;
        }
        const determinedColorFn = getGraphLineColorFn(symbolToFetch);
        setCurrentChartColor(() => determinedColorFn);
        try {
            const response = await api.get(`/stocks/history/${encodeURIComponent(symbolToFetch)}?period=${period}&interval=${interval}`);
            const rawApiResponse: ApiHistoricalDataPoint[] | ApiAngelIndexHistoryResponse | { error?: string } = response.data;
            let processedHistoricalData: ApiHistoricalDataPoint[] = [];
            if (Array.isArray(rawApiResponse)) { processedHistoricalData = rawApiResponse as ApiHistoricalDataPoint[]; }
            else if (typeof rawApiResponse === 'object' && rawApiResponse && 'data' in rawApiResponse && Array.isArray((rawApiResponse as ApiAngelIndexHistoryResponse).data)) {
                if ((rawApiResponse as ApiAngelIndexHistoryResponse).status === false || !(rawApiResponse as ApiAngelIndexHistoryResponse).data) {
                    console.warn("Graph data API (Angel) status false or no data:", (rawApiResponse as ApiAngelIndexHistoryResponse).message);
                } else {
                    processedHistoricalData = ((rawApiResponse as ApiAngelIndexHistoryResponse).data || []).map((item: AngelHistoricalDataEntry) => ({
                        date: item[0].split('T')[0], open: item[1], high: item[2], low: item[3], close: item[4], volume: item[5],
                    }));
                }
            } else if (typeof rawApiResponse === 'object' && rawApiResponse && 'error' in rawApiResponse) {
                throw new Error((rawApiResponse as { error: string }).error || "Unknown error in graph data structure.");
            }
            if (processedHistoricalData.length > 0) {
                let dataPoints = processedHistoricalData.map(p => p.close).filter(p => typeof p === 'number' && !isNaN(p));
                let originalFullLabels = processedHistoricalData.map(p => p.date);
                if (dataPoints.length < 2) { setChartData(null); console.warn("Not enough valid data points for chart."); }
                else { setChartData({ labels: originalFullLabels, displayLabels: [], datasets: [{ data: dataPoints, fullData: processedHistoricalData, color: determinedColorFn, strokeWidth: 2 }], }); }
            } else { console.warn("No graph data points available."); setChartData(null); }
        } catch (graphFetchError: any) {
            let graphErrorMessage = "Graph data unavailable.";
            if (graphFetchError?.response?.data?.error) graphErrorMessage = graphFetchError.response.data.error;
            else if (graphFetchError?.response?.data?.message) graphErrorMessage = graphFetchError.response.data.message;
            else if (graphFetchError?.message) graphErrorMessage = graphFetchError.message;
            setError(prev => { const graphErr = `Graph: ${graphErrorMessage}`; if (prev && !prev.includes(graphErr)) return `${prev}\n${graphErr}`; return graphErr; });
            setChartData(null);
        } finally { setIsGraphLoading(false); }
    }, [getGraphLineColorFn]);

    // ======== DEBUG LOGS AND SAFEGUARDS ADDED TO THIS FUNCTION ========
    const fetchDetailedFinancials = useCallback(async (symbolToFetch: string) => {
        if (!symbolToFetch) {
            console.log('[DEBUG] fetchDetailedFinancials: symbolToFetch is missing, returning.');
            return;
        }

        console.log(`[DEBUG] fetchDetailedFinancials: Attempting for symbol: ${symbolToFetch}. Current loading state: ${isFinancialsLoading}`);
        
        // Safeguard against multiple simultaneous fetches for the same symbol
        if (isFinancialsLoading) {
            console.log(`[DEBUG] fetchDetailedFinancials: Already loading for ${symbolToFetch}. Aborting duplicate call.`);
            return;
        }
        // Safeguard: If data for this specific symbol is already in detailedFinancials, and no error message is set, consider it fetched.
        // This helps if the effect re-runs but data is already good.
        if (detailedFinancials && detailedFinancials.symbol === symbolToFetch && !financialsMessage) {
            console.log(`[DEBUG] fetchDetailedFinancials: Data for ${symbolToFetch} already present and no error. Skipping refetch.`);
            // Ensure highlights are still set from this existing data if they somehow got cleared.
            if (financialHighlights.length === 0 && detailedFinancials.statements && detailedFinancials.statements.length > 0) {
                 // Re-process if highlights are missing but data is there
                const latestStatement = detailedFinancials.statements.find(s => s.Type === 'Annual') || detailedFinancials.statements[0];
                if (latestStatement && latestStatement.stockFinancialMap) {
                    const highlights: FinancialHighlight[] = [];
                    const periodLabel = `${latestStatement.Type} ${latestStatement.FiscalYear}`;
                     if (latestStatement.stockFinancialMap.INC) {
                        const incomeStatementItems = latestStatement.stockFinancialMap.INC;
                        const revenueItem = incomeStatementItems.find(item => item.key === 'TotalRevenue');
                        if (revenueItem) highlights.push({ label: `Total Revenue (${periodLabel})`, value: formatDisplayLargeNumber(revenueItem.value, '₹') });
                        const netIncomeItem = incomeStatementItems.find(item => item.key === 'NetIncome');
                        if (netIncomeItem) highlights.push({ label: `Net Income (${periodLabel})`, value: formatDisplayLargeNumber(netIncomeItem.value, '₹') });
                        const epsItem = incomeStatementItems.find(item => item.key === 'DilutedEPSExcludingExtraOrdItems');
                        if (epsItem) highlights.push({ label: `Diluted EPS (${periodLabel})`, value: formatPriceForDisplay(epsItem.value, '₹') });
                    }
                    if (highlights.length > 0) setFinancialHighlights(highlights);
                }
            }
            return;
        }


        setIsFinancialsLoading(true);
        setFinancialsMessage(null);
        setFinancialHighlights([]);
        // setDetailedFinancials(null); // Reset only if fetching for a new symbol or retrying after error

        try {
            console.log(`[DEBUG] fetchDetailedFinancials: Calling API for ${symbolToFetch}. URL: /api/stocks/financials/${encodeURIComponent(symbolToFetch)}`);
            const response = await api.get(`/stocks/financials/${encodeURIComponent(symbolToFetch)}`);
            const data: ApiFinancialsResponse = response.data;

            console.log('[DEBUG] fetchDetailedFinancials: Raw API Response Status:', response.status);
            console.log('[DEBUG] fetchDetailedFinancials: Raw API Response Data (first 500 chars):', JSON.stringify(data, null, 2)?.substring(0, 500) + "...");

            if (response.status !== 200 || data.error || !data.statements || data.statements.length === 0) {
                const errorMsg = data.error || data.message || "Failed to load financial statements or no statements found.";
                console.error('[DEBUG] fetchDetailedFinancials: API error or no statements:', errorMsg, 'Full data:', JSON.stringify(data, null, 2));
                throw new Error(errorMsg);
            }

            setDetailedFinancials({...data, symbol: symbolToFetch}); // Tag data with the symbol it was fetched for

            let sortedStatements = [...data.statements].sort((a, b) => new Date(b.EndDate).getTime() - new Date(a.EndDate).getTime());
            let latestStatement = sortedStatements.find(s => s.Type === 'Annual') || sortedStatements[0];
            
            console.log('[DEBUG] fetchDetailedFinancials: Selected Statement:', JSON.stringify(latestStatement, null, 2));

            if (latestStatement && latestStatement.stockFinancialMap) {
                const highlights: FinancialHighlight[] = [];
                const periodLabel = `${latestStatement.Type} ${latestStatement.FiscalYear}`;
                console.log(`[DEBUG] fetchDetailedFinancials: Period Label: ${periodLabel}`);

                if (latestStatement.stockFinancialMap.INC) { /* ... same INC processing with logs ... */ }
                if (latestStatement.stockFinancialMap.BAL) { /* ... same BAL processing with logs ... */ }
                if (latestStatement.stockFinancialMap.CAS) { /* ... same CAS processing with logs ... */ }
                // For brevity, assuming the detailed item.key find logs are still there from my previous versions

                 // --- Income Statement (INC) ---
                if (latestStatement.stockFinancialMap.INC) {
                    console.log('[DEBUG] fetchDetailedFinancials: Processing INC data. Keys available:', JSON.stringify(latestStatement.stockFinancialMap.INC.map(i => i.key)));
                    const incomeStatementItems = latestStatement.stockFinancialMap.INC;

                    const revenueItem = incomeStatementItems.find(item => item.key === 'TotalRevenue');
                    console.log('[DEBUG] fetchDetailedFinancials: Revenue Item Found:', JSON.stringify(revenueItem));
                    if (revenueItem) highlights.push({ label: `Total Revenue (${periodLabel})`, value: formatDisplayLargeNumber(revenueItem.value, '₹') });

                    const netIncomeItem = incomeStatementItems.find(item => item.key === 'NetIncome');
                    console.log('[DEBUG] fetchDetailedFinancials: Net Income Item Found:', JSON.stringify(netIncomeItem));
                    if (netIncomeItem) highlights.push({ label: `Net Income (${periodLabel})`, value: formatDisplayLargeNumber(netIncomeItem.value, '₹') });
                    
                    const epsItem = incomeStatementItems.find(item => item.key === 'DilutedEPSExcludingExtraOrdItems');
                    console.log('[DEBUG] fetchDetailedFinancials: EPS Item Found:', JSON.stringify(epsItem));
                    if (epsItem) highlights.push({ label: `Diluted EPS (${periodLabel})`, value: formatPriceForDisplay(epsItem.value, '₹') });
                } else { console.log('[DEBUG] fetchDetailedFinancials: No INC data in stockFinancialMap.'); }

                // --- Balance Sheet (BAL) ---
                if (latestStatement.stockFinancialMap.BAL) {
                    console.log('[DEBUG] fetchDetailedFinancials: Processing BAL data. Keys available:', JSON.stringify(latestStatement.stockFinancialMap.BAL.map(i => i.key)));
                    const balanceSheetItems = latestStatement.stockFinancialMap.BAL;
                    const totalAssetsItem = balanceSheetItems.find(item => item.key === 'TotalAssets');
                    console.log('[DEBUG] fetchDetailedFinancials: Total Assets Item Found:', JSON.stringify(totalAssetsItem));
                    if (totalAssetsItem) highlights.push({ label: `Total Assets (${periodLabel})`, value: formatDisplayLargeNumber(totalAssetsItem.value, '₹') });

                    const totalDebtItem = balanceSheetItems.find(item => item.key === 'TotalDebt');
                    console.log('[DEBUG] fetchDetailedFinancials: Total Debt Item Found:', JSON.stringify(totalDebtItem));
                    if (totalDebtItem) highlights.push({ label: `Total Debt (${periodLabel})`, value: formatDisplayLargeNumber(totalDebtItem.value, '₹') });
                } else { console.log('[DEBUG] fetchDetailedFinancials: No BAL data in stockFinancialMap.'); }

                // --- Cash Flow Statement (CAS) ---
                if (latestStatement.stockFinancialMap.CAS) {
                     console.log('[DEBUG] fetchDetailedFinancials: Processing CAS data. Keys available:', JSON.stringify(latestStatement.stockFinancialMap.CAS.map(i => i.key)));
                     const cashFlowItems = latestStatement.stockFinancialMap.CAS;
                     const cashFromOpsItem = cashFlowItems.find(item => item.key === 'CashfromOperatingActivities');
                     console.log('[DEBUG] fetchDetailedFinancials: Cash From Ops Item Found:', JSON.stringify(cashFromOpsItem));
                     if (cashFromOpsItem) highlights.push({ label: `Cash from Ops (${periodLabel})`, value: formatDisplayLargeNumber(cashFromOpsItem.value, '₹') });
                } else { console.log('[DEBUG] fetchDetailedFinancials: No CAS data in stockFinancialMap.'); }


                console.log('[DEBUG] fetchDetailedFinancials: Generated Highlights (count):', highlights.length, JSON.stringify(highlights));

                if (highlights.length > 0) {
                    setFinancialHighlights(highlights);
                    setFinancialsMessage(null); // Explicitly clear message on success
                    console.log('[DEBUG] fetchDetailedFinancials: Successfully set financialHighlights. Message is null.');
                } else {
                    console.log('[DEBUG] fetchDetailedFinancials: No highlights generated, setting "No specific items" message.');
                    setFinancialsMessage(`No specific financial line items found for ${periodLabel}.`);
                }
            } else {
                console.log('[DEBUG] fetchDetailedFinancials: latestStatement or stockFinancialMap is missing after selection.');
                setFinancialsMessage("Financial statement data is incomplete or in an unexpected format.");
            }

        } catch (finError: any) {
            // THIS IS WHERE "caughterror in url" IS COMING FROM
            // PLEASE PROVIDE THE FULL 'finError' OBJECT OR AT LEAST 'finError.message'
            console.error("[DEBUG] fetchDetailedFinancials: CAUGHT ERROR IN URL (OR OTHER):", JSON.stringify(finError, Object.getOwnPropertyNames(finError)));
            const errorMsg = finError.response?.data?.error || finError.response?.data?.message || finError.message || "Could not load financials.";
            setFinancialsMessage(errorMsg);
            setFinancialHighlights([]);
        } finally {
            setIsFinancialsLoading(false);
            console.log('[DEBUG] fetchDetailedFinancials: fetchDetailedFinancials finished.');
        }
    }, [formatDisplayLargeNumber, formatPriceForDisplay, isFinancialsLoading, detailedFinancials, financialHighlights.length, financialsMessage]); // Added isFinancialsLoading and detailedFinancials
    // =====================================================

    const checkWatchlistStatus = useCallback(async (symbolToCheck: string | null) => { /* ... same as before ... */ 
        if (!symbolToCheck) return;
        try {
            const response = await api.get(`/stocks/watchlist/user`);
            const watchlist: WatchlistItemAPI[] = response.data;
            if (Array.isArray(watchlist)) { setIsInWatchlist(watchlist.some(item => item.symbol === symbolToCheck)); }
            else { setIsInWatchlist(false); console.warn("Watchlist response not an array:", watchlist); }
        } catch (e: any) { setIsInWatchlist(false); console.error("Error checking watchlist:", e.message); }
    }, []);

    useEffect(() => {
        const initialId = initialIdentifierFromRoute;
        if (!initialId) { setError('Stock identifier not provided.'); setIsLoading(false); return; }
        const fetchStockOrIndexDetails = async () => {
            setIsLoading(true); setError(null);
            setStockDetails(null); setPerformanceData(null); setKeyStats(null);
            setChartData(null); setStockDescription(null); setIsInWatchlist(false);
            setResolvedTicker(null);
            // Reset financials states when new stock is fetched
            setFinancialHighlights([]);
            setFinancialsMessage(null);
            setDetailedFinancials(null); // Important: reset detailedFinancials too
            setIsFinancialsLoading(false);

            let endpoint = '';
            const upperIdentifier = initialId.toUpperCase();
            const knownIndexDisplayNames = ["NIFTY 50", "SENSEX", "BANK NIFTY"];
            const isDirectlyProcessable = initialId.includes('.') || initialId.startsWith('^') || knownIndexDisplayNames.includes(upperIdentifier);
            endpoint = isDirectlyProcessable ? `/stocks/details/${encodeURIComponent(initialId)}` : `/stocks/details-by-name/${encodeURIComponent(initialId)}`;
            console.log(`StockDetailScreen: Using main details endpoint: ${endpoint}`);

            try {
                const response = await api.get(endpoint);
                const data: ApiStockDetailResponse = response.data;
                if (response.status !== 200 || data.error || !data.basic_info || !data.basic_info.symbol) {
                    throw new Error(data.error || (response.data && (response.data.error || response.data.message)) || "Failed to load stock details or symbol missing.");
                }
                const bi = data.basic_info;
                const canonicalTicker = bi.symbol;
                setResolvedTicker(canonicalTicker); // This will trigger the financials useEffect
                setCurrentChartColor(() => getGraphLineColorFn(canonicalTicker));
                // ... (rest of the state settings for stockDetails, performanceData, keyStats, stockDescription)
                const currentPriceNum = safeParseFloat(bi.current_price);
                const prevCloseNum = safeParseFloat(bi.previous_close);
                let changeAbsNum: number | null = null, changePercNum: number | null = null, isPositiveData = false;
                if (currentPriceNum !== null && prevCloseNum !== null) {
                    changeAbsNum = currentPriceNum - prevCloseNum; isPositiveData = changeAbsNum >= 0;
                    if (prevCloseNum !== 0) changePercNum = (changeAbsNum / prevCloseNum) * 100;
                }
                let displayExchange = 'N/A';
                if (bi.exchange_nse && bi.exchange_nse !== 'N/A') displayExchange = 'NSE';
                else if (bi.exchange_bse && bi.exchange_bse !== 'N/A') displayExchange = 'BSE';
                else if (bi.exchange && bi.exchange !== 'N/A') displayExchange = formatDisplayString(bi.exchange.toUpperCase());

                setStockDetails({
                    name: canonicalTicker.replace(/\.NS$|\.BO$/i, '').replace(/^\^/, ''),
                    fullName: formatDisplayString(bi.company_name),
                    tag: bi.industry && bi.industry !== 'N/A' ? bi.industry : undefined,
                    price: formatPriceForDisplay(currentPriceNum),
                    changeAbsolute: formatChangeValue(changeAbsNum),
                    changePercent: formatChangePercent(changePercNum),
                    isPositive: isPositiveData, exchange: displayExchange,
                    lastUpdated: formatMarketTime(bi.last_trade_time),
                });
                setPerformanceData({ 
                    todayLow: formatPriceForDisplay(bi.day_low), todayHigh: formatPriceForDisplay(bi.day_high),
                    week52Low: formatPriceForDisplay(bi["52_week_low"]), week52High: formatPriceForDisplay(bi["52_week_high"]),
                    open: formatPriceForDisplay(bi.open_price), prevClose: formatPriceForDisplay(bi.previous_close),
                    volume: formatDisplayVolume(bi.volume), 
                });
                setKeyStats({ 
                    marketCap: formatDisplayLargeNumber(bi.market_cap, '₹'),
                    peRatio: formatDisplayString(bi.pe_ratio), eps: formatDisplayString(bi.book_value_per_share, '--'),
                    divYield: bi.dividend_yield && bi.dividend_yield !== "N/A" ? `${formatDisplayString(bi.dividend_yield, '0')}%` : '--',
                    beta: formatDisplayString(bi.beta), bookValue: formatPriceForDisplay(bi.book_value_per_share),
                    roe: bi.roe && bi.roe !== "N/A" ? `${formatDisplayString(bi.roe, '0')}%` : '--', 
                });
                setStockDescription(bi.description && bi.description !== 'N/A' ? bi.description : 'No company description available.');

                if (canonicalTicker) { checkWatchlistStatus(canonicalTicker); }
            } catch (detailFetchError: any) {
                console.error("Error processing stock details response:", detailFetchError.message, detailFetchError);
                setError(detailFetchError.message || "Failed to load details.");
            } finally { setIsLoading(false); } // This will trigger the financials useEffect
        };
        fetchStockOrIndexDetails();
    }, [initialIdentifierFromRoute, checkWatchlistStatus, getGraphLineColorFn]);

    useEffect(() => {
        if (resolvedTicker && !isLoading) { fetchGraphData(resolvedTicker, selectedTimeRange); }
        else if (!resolvedTicker && !isLoading) { setChartData(null); setIsGraphLoading(false); }
    }, [resolvedTicker, selectedTimeRange, fetchGraphData, isLoading]);

    // ======== THIS USEEFFECT TRIGGERS THE DETAILED FINANCIALS FETCH ========
    useEffect(() => {
        const isIndex = resolvedTicker?.startsWith('^') || ["NIFTY 50", "SENSEX", "BANK NIFTY"].includes(resolvedTicker?.toUpperCase() || "");
        console.log(`[FINANCIALS_EFFECT_CHECK] Triggered. resolvedTicker: ${resolvedTicker}, isLoading (main): ${isLoading}, isIndex: ${isIndex}, isFinancialsLoading: ${isFinancialsLoading}, detailedFinancials for this symbol: ${detailedFinancials?.symbol === resolvedTicker}`);

        if (resolvedTicker && !isLoading && !isIndex) {
            // Safeguard conditions
            if (isFinancialsLoading) {
                 console.log(`[FINANCIALS_EFFECT_CHECK] Skipping fetch: financials already loading for ${resolvedTicker}.`);
                 return;
            }
            // If financialsMessage is already set for this ticker (e.g. from a previous failed attempt),
            // you might not want to retry immediately, or implement a retry strategy.
            // For now, if detailedFinancials exists for this symbol AND there's no message, we assume success.
            if (detailedFinancials && detailedFinancials.symbol === resolvedTicker && !financialsMessage) {
                console.log(`[FINANCIALS_EFFECT_CHECK] Skipping fetch: data already present for ${resolvedTicker} and no error message.`);
                // If highlights are somehow empty but we have data, attempt to re-populate them. This is defensive.
                if (financialHighlights.length === 0 && detailedFinancials.statements && detailedFinancials.statements.length > 0) {
                    console.log('[FINANCIALS_EFFECT_CHECK] Re-populating highlights from existing detailedFinancials.');
                     const latestStatement = detailedFinancials.statements.find(s => s.Type === 'Annual') || detailedFinancials.statements[0];
                     if (latestStatement && latestStatement.stockFinancialMap) { /* ... abbreviated processing ... */ }
                }
                return;
            }
            
            console.log('[FINANCIALS_EFFECT_CHECK] Conditions MET. Calling fetchDetailedFinancials for:', resolvedTicker);
            fetchDetailedFinancials(resolvedTicker);
        } else if (isIndex && resolvedTicker && !isLoading) {
            console.log('[FINANCIALS_EFFECT_CHECK] Is an index. Setting N/A message for financials.');
            setFinancialsMessage("Financial statements are not applicable for indices.");
            setFinancialHighlights([]);
            setDetailedFinancials(null);
            setIsFinancialsLoading(false);
        } else {
            console.log('[FINANCIALS_EFFECT_CHECK] Conditions NOT MET to fetch financials or handle index (or still loading main details).');
        }
    // Added isFinancialsLoading and detailedFinancials to deps because they are used in the logic.
    // Also added financialHighlights.length and financialsMessage to re-evaluate if defensive highlight re-population is needed.
    }, [resolvedTicker, isLoading, fetchDetailedFinancials, isFinancialsLoading, detailedFinancials, financialHighlights.length, financialsMessage]);
    // =====================================================================

    const handleTimeRangeSelect = (range: TimeRange) => { setSelectedTimeRange(range); };
    const handleToggleWatchlist = async () => { /* ... same as before ... */ 
        if (!stockDetails || !resolvedTicker) { Alert.alert("Error", "Stock details not available."); return; }
        setIsWatchlistUpdating(true); setTooltipData(prev => ({ ...prev, visible: false }));
        const action = isInWatchlist ? 'remove' : 'add';
        const endpointUrl = `/stocks/watchlist/user/${action}`;
        const payload = { id: resolvedTicker, symbol: resolvedTicker, name: stockDetails.fullName };
        try {
            const response = await api.post(endpointUrl, payload);
            const result = response.data;
            if (response.status === 200 && result.status === true) { setIsInWatchlist(!isInWatchlist); Alert.alert('Success', result.message || `Successfully ${action}ed to watchlist.`);}
            else { Alert.alert('Watchlist Error', result.message || result.error || 'Failed to update watchlist.'); }
        } catch (toggleError: any) {
            const errorData = toggleError.isAxiosError ? toggleError.response?.data : null;
            const errorMessage = errorData?.error || errorData?.message || toggleError.message || "Could not update watchlist.";
            console.error(`Error toggling watchlist:`, errorMessage, toggleError.isAxiosError ? toggleError.toJSON() : toggleError);
            Alert.alert('Update Error', errorMessage);
        } finally { setIsWatchlistUpdating(false); }
    };
    const handleOverviewTabSelect = (tab: OverviewTab) => setSelectedOverviewTab(tab);
    const handleBuy = () => Alert.alert('Coming Soon', 'Buy functionality will be available soon!');
    const handleShareStock = async () => { /* ... same as before ... */ 
        if (!stockDetails || !resolvedTicker) return;
        try { await Share.share({ message: `Check out ${stockDetails.fullName} (${resolvedTicker}) on Mudraa Invest! Current Price: ${stockDetails.price}` }); }
        catch (shareError: any) { Alert.alert('Share Error', shareError.message || "Could not share."); }
    };
    const handleAdvancedChart = () => { /* ... same as before ... */ 
        if (!stockDetails || !resolvedTicker) return;
        navigation.navigate('AdvancedChartScreen', { symbol: resolvedTicker, companyName: stockDetails.fullName });
    };
    const handleMoreOptions = () => { /* ... same as before ... */ 
        const options = ['Share Stock', 'Advanced Chart / Technicals', 'Cancel'];
        const cancelButtonIndex = 2;
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options, cancelButtonIndex, title: 'More Options', tintColor: textColor },
                (buttonIndex) => { if (buttonIndex === 0) handleShareStock(); else if (buttonIndex === 1) handleAdvancedChart(); }
            );
        } else {
            Alert.alert('More Options', 'Select an action:',
                [{ text: 'Share Stock', onPress: handleShareStock }, { text: 'Advanced Chart', onPress: handleAdvancedChart }, { text: 'Cancel', style: 'cancel' }],
                { cancelable: true }
            );
        }
    };
    const overviewTabsToDisplay = useMemo(() => { /* ... same as before ... */ 
        const normalizedSymbol = resolvedTicker?.toUpperCase() || initialIdentifierFromRoute?.toUpperCase() || "";
        const isActuallyIndex = normalizedSymbol === 'NIFTY 50' || normalizedSymbol === 'SENSEX' || normalizedSymbol === 'BANK NIFTY' || normalizedSymbol.startsWith('^');
        if (isActuallyIndex) return ['Overview', 'Fundamentals'] as OverviewTab[];
        return ['Overview', 'Fundamentals', 'Financial'] as OverviewTab[];
    }, [resolvedTicker, initialIdentifierFromRoute]);
    const renderDetailRow = (label: string, value: string | undefined | null, isFullWidthValue = false) => ( /* ... same as before ... */ 
        <View style={styles.detailRow} key={label}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, isFullWidthValue && styles.detailValueFullWidth]}>{formatDisplayString(value)}</Text>
        </View>
    );

    if (isLoading && !stockDetails) { return <SafeAreaView style={styles.container}><View style={styles.loadingIndicator}><ActivityIndicator size="large" color={primaryColor} /></View></SafeAreaView>; }
    if (error && !stockDetails && !isLoading) { return <SafeAreaView style={styles.container}><View style={styles.messageContainer}><Text style={styles.errorText}>{error}</Text></View></SafeAreaView>; }
    if (!stockDetails && !isLoading) { return <SafeAreaView style={styles.container}><View style={styles.messageContainer}><Text style={styles.errorText}>Stock details not found.</Text></View></SafeAreaView>; }
    if (!stockDetails) return null;

    return (
        <SafeAreaView style={styles.container}>
            {/* ... same JSX structure as before ... */}
            <StatusBar barStyle="light-content" backgroundColor={screenBackgroundColor} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Image source={backIconSource} style={[styles.headerIcon, { tintColor: textColor }]} /></TouchableOpacity>
                <View style={styles.headerTitleContainer}><Text style={styles.headerTitle} numberOfLines={1}>{stockDetails.name}</Text><Text style={styles.headerSubtitle} numberOfLines={1}>{stockDetails.fullName}</Text></View>
                <TouchableOpacity onPress={handleMoreOptions} style={styles.moreButton}><Icon name="ellipsis-vertical" size={24} color={textColor} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} onTouchStart={() => { if (tooltipData.visible) setTooltipData(prev => ({ ...prev, visible: false })); }} scrollEventThrottle={16}>
                <View style={styles.priceSection}>
                    <Text style={styles.priceText}>{stockDetails.price}</Text>
                    <View style={styles.changeRow}>
                        <Icon name={stockDetails.isPositive ? "caret-up" : "caret-down"} size={18} color={stockDetails.isPositive ? primaryColor : negativeColor} />
                        <Text style={[styles.changeTextAbsolute, { color: stockDetails.isPositive ? primaryColor : negativeColor }]}>{stockDetails.changeAbsolute}</Text>
                        <Text style={[styles.changeTextPercent, { color: stockDetails.isPositive ? primaryColor : negativeColor }]}> ({stockDetails.changePercent})</Text>
                    </View>
                    <Text style={styles.metaText}>{stockDetails.exchange}{stockDetails.tag ? ` • ${stockDetails.tag}` : ''} • {stockDetails.lastUpdated}</Text>
                </View>

                <View style={styles.graphContainer}>
                    {isGraphLoading && <ActivityIndicator color={primaryColor} style={styles.graphActivityIndicator} />}
                    {!isGraphLoading && chartData && chartData.datasets[0].data.length > 1 ? (
                        <LineChart
                            data={{ labels: chartData.displayLabels, datasets: chartData.datasets }}
                            width={screenWidth} height={230} withHorizontalLabels={false} withVerticalLabels={false}
                            withInnerLines={false} withOuterLines={false} withShadow={true} bezier
                            chartConfig={{
                                backgroundColor: chartAreaBackgroundColor, backgroundGradientFrom: chartAreaBackgroundColor,
                                backgroundGradientTo: chartAreaBackgroundColor, backgroundGradientFromOpacity: 0.5,
                                backgroundGradientToOpacity: 0.1, decimalPlaces: 0, color: currentChartColor,
                                propsForDots: { r: "0" }, propsForBackgroundLines: { strokeWidth: 0 }, strokeWidth: 2.5,
                            }}
                            style={styles.chartStyle}
                            onDataPointClick={({ value, x, y, index }) => {
                                const originalLabel = chartData.labels[index] || "";
                                let displayDate = originalLabel;
                                if (selectedTimeRange === '1D' && originalLabel.includes(" ")) { displayDate = originalLabel.split(" ")[1]?.substring(0,5) || originalLabel; }
                                else if (originalLabel.includes(" ")) { displayDate = originalLabel.split(" ")[0]; }
                                setTooltipData({ x, y, visible: true, value, date: displayDate, index });
                            }}
                        />
                    ) : (!isGraphLoading && <View style={styles.graphPlaceholder}><Text style={styles.graphPlaceholderText}>{error && error.includes("Graph:") ? error.split("Graph:")[1]?.trim() : `No chart data for ${selectedTimeRange}.`}</Text></View>)}
                </View>
                {tooltipData.visible && (
                    <View style={[ styles.tooltipAbsoluteContainer, { top: tooltipData.y - 70, left: Math.max(10, Math.min(tooltipData.x - 60, screenWidth - 130)) } ]}>
                        <Text style={styles.tooltipText}>{`${tooltipData.date}`}</Text>
                        <Text style={styles.tooltipText}>{`${formatPriceForDisplay(tooltipData.value)}`}</Text>
                    </View>
                )}

                <View style={styles.timeRangeContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        {['1D', '1W', '1M', '3M', '1Y', '5Y', 'Max'].map((range) => (
                            <TouchableOpacity key={range} style={[styles.timeRangeButton, selectedTimeRange === range && styles.timeRangeButtonSelected]} onPress={() => handleTimeRangeSelect(range as TimeRange)}>
                                <Text style={[styles.timeRangeText, selectedTimeRange === range && styles.timeRangeTextSelected]}>{range}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.actionButtonContainer}>
                     {!(resolvedTicker?.startsWith('^') || ["NIFTY 50", "SENSEX", "BANK NIFTY"].includes(resolvedTicker?.toUpperCase() || "")) && (
                        <TouchableOpacity style={[styles.actionButton, styles.buyButton]} onPress={handleBuy}>
                            <Text style={[styles.actionButtonText, styles.buyButtonText]}>Buy</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.actionButton, isInWatchlist ? styles.watchlistButtonAdded : styles.watchlistButton,
                        (resolvedTicker?.startsWith('^') || ["NIFTY 50", "SENSEX", "BANK NIFTY"].includes(resolvedTicker?.toUpperCase() || "")) && { flex: 2 }]}
                        onPress={handleToggleWatchlist} disabled={isWatchlistUpdating}>
                        {isWatchlistUpdating ? <ActivityIndicator size="small" color={isInWatchlist ? primaryColor : textColor} />
                            : <Text style={[styles.actionButtonText, isInWatchlist ? styles.watchlistButtonTextAdded : styles.watchlistButtonText]}>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.overviewTabOuterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.overviewTabContainer} contentContainerStyle={{ paddingRight: 16 }}>
                        {overviewTabsToDisplay.map(tab => (
                            <TouchableOpacity key={tab} style={[styles.overviewTabButton, selectedOverviewTab === tab && styles.overviewTabButtonSelected]} onPress={() => handleOverviewTabSelect(tab)}>
                                <Text style={[styles.overviewTabText, selectedOverviewTab === tab && styles.overviewTabTextSelected]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.tabContentContainer}>
                    {selectedOverviewTab === 'Overview' && (
                        <View style={styles.overviewContent}>
                            {stockDescription && stockDetails && (<View style={styles.sectionPadding}><Text style={styles.subSectionTitle}>About {stockDetails.name}</Text><Text style={styles.descriptionText} numberOfLines={5}>{stockDescription}</Text></View>)}
                            {performanceData && (
                                <View style={styles.sectionPadding}>
                                    <Text style={styles.subSectionTitle}>Performance</Text>
                                    <View style={styles.perfRangeContainer}><View style={styles.perfRow}><Text style={styles.perfLabel}>Today's Low</Text><Text style={styles.perfValue}>{performanceData.todayLow}</Text></View><View style={styles.sliderPlaceholder}><View style={[styles.sliderInnerPlaceholder, {backgroundColor: primaryColor}]} /></View><View style={styles.perfRow}><Text style={styles.perfLabel}>Today's High</Text><Text style={styles.perfValue}>{performanceData.todayHigh}</Text></View></View>
                                    <View style={styles.perfRangeContainer}><View style={styles.perfRow}><Text style={styles.perfLabel}>52 Week Low</Text><Text style={styles.perfValue}>{performanceData.week52Low}</Text></View><View style={styles.sliderPlaceholder}><View style={[styles.sliderInnerPlaceholder, {backgroundColor: primaryColor}]} /></View><View style={styles.perfRow}><Text style={styles.perfLabel}>52 Week High</Text><Text style={styles.perfValue}>{performanceData.week52High}</Text></View></View>
                                    <View style={styles.keyStatsGrid}>{renderDetailRow('Open', performanceData.open)}{renderDetailRow('Prev. Close', performanceData.prevClose)}{renderDetailRow('Volume', performanceData.volume)}</View>
                                </View>
                            )}
                        </View>
                    )}
                    {selectedOverviewTab === 'Fundamentals' && keyStats && (
                        <View style={[styles.overviewContent, styles.sectionPadding]}>
                            <Text style={styles.subSectionTitle}>Key Statistics</Text>
                            <View style={styles.keyStatsGrid}>
                                {(resolvedTicker?.startsWith('^') || ["NIFTY 50", "SENSEX", "BANK NIFTY"].includes(resolvedTicker?.toUpperCase() || "")) ? (<>{renderDetailRow('Volume', performanceData?.volume)}</>)
                                : (<>{renderDetailRow('Market Cap', keyStats.marketCap)}{renderDetailRow('P/E Ratio', keyStats.peRatio)}{renderDetailRow('EPS', keyStats.eps)}{renderDetailRow('Div. Yield', keyStats.divYield)}{renderDetailRow('Beta', keyStats.beta)}{renderDetailRow('Book Value/Share', keyStats.bookValue)}{renderDetailRow('ROE (Return on Equity)', keyStats.roe)}</>)}
                            </View>
                        </View>
                    )}
                    {selectedOverviewTab === 'Financial' && (
                        <View style={[styles.overviewContent, styles.sectionPadding]}>
                            <Text style={styles.subSectionTitle}>Financial Highlights</Text>
                            {isFinancialsLoading ? (<ActivityIndicator color={primaryColor} style={{ marginVertical: 20 }} />)
                            : financialsMessage ? (<Text style={styles.financialsMessageText}>{financialsMessage}</Text>)
                            : financialHighlights.length > 0 ? (financialHighlights.map(item => renderDetailRow(item.label, item.value, true)))
                            : (<Text style={styles.financialsMessageText}>No financial highlights available to display.</Text>)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles (Keep existing styles as provided)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: screenBackgroundColor },
    messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: negativeColor, textAlign: 'center', fontSize: 16, paddingHorizontal: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: cardBackgroundColor, borderBottomWidth: 1, borderBottomColor: "#2D2D2D" },
    backButton: { padding: 8, marginLeft: -8 },
    headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
    headerTitleContainer: { alignItems: 'flex-start', flex: 1, marginHorizontal: 10, },
    headerTitle: { fontSize: 18, fontWeight: '600', color: textColor },
    headerSubtitle: { fontSize: 12, color: secondaryTextColor, marginTop: 2 },
    moreButton: { padding: 8, marginRight: -8 },
    priceSection: { paddingHorizontal: 16, paddingVertical: 20, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
    priceText: { fontSize: 36, fontWeight: 'bold', color: textColor, marginBottom: 4 },
    changeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    changeTextAbsolute: { fontSize: 18, fontWeight: '500', marginLeft: 4 },
    changeTextPercent: { fontSize: 18, fontWeight: '500', marginLeft: 6 },
    metaText: { fontSize: 12, color: secondaryTextColor },
    graphContainer: { minHeight: 250, justifyContent: 'center', alignItems: 'center', backgroundColor: chartAreaBackgroundColor },
    graphActivityIndicator: { position: 'absolute', height: 230, width: '100%', justifyContent: 'center', alignItems: 'center'},
    graphPlaceholder: { height: 230, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    graphPlaceholderText: { color: secondaryTextColor, textAlign:'center' },
    chartStyle: { paddingRight: 0, paddingLeft:0, marginVertical: 0, },
    tooltipAbsoluteContainer: { position: 'absolute', backgroundColor: 'rgba(50, 50, 50, 0.95)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, zIndex: 1000, },
    tooltipText: { color: textColor, fontSize: 12, lineHeight: 18, },
    timeRangeContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', backgroundColor: screenBackgroundColor },
    timeRangeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: cardBackgroundColor, marginRight: 10, },
    timeRangeButtonSelected: { backgroundColor: textColor, },
    timeRangeText: { color: textColor, fontSize: 13, fontWeight: '500', },
    timeRangeTextSelected: { color: screenBackgroundColor, fontWeight: '600', },
    actionButtonContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 20, gap: 12, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
    actionButton: { flex: 1, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    buyButton: { backgroundColor: primaryColor, },
    watchlistButton: { backgroundColor: cardBackgroundColor, },
    watchlistButtonAdded: { backgroundColor: '#2C2C2E', borderWidth:1, borderColor: primaryColor,},
    actionButtonText: { fontSize: 16, fontWeight: '600', },
    buyButtonText: { color: textColor, },
    watchlistButtonText: { color: textColor, },
    watchlistButtonTextAdded: { color: primaryColor, },
    overviewTabOuterContainer: { borderBottomWidth: 1, borderBottomColor: '#2C2C2E', backgroundColor: screenBackgroundColor },
    overviewTabContainer: { paddingLeft: 16, },
    overviewTabButton: { paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: 16, },
    overviewTabButtonSelected: { borderBottomColor: textColor, },
    overviewTabText: { color: secondaryTextColor, fontSize: 15, fontWeight: '500', },
    overviewTabTextSelected: { color: textColor, fontWeight: '600', },
    tabContentContainer: { paddingVertical: 16, backgroundColor: screenBackgroundColor },
    sectionPadding: { paddingHorizontal: 16, marginBottom: 20, },
    overviewContent: {},
    subSectionTitle: { fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16, },
    descriptionText: { fontSize: 14, color: '#B0B0B0', lineHeight: 21, marginBottom: 16, },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E', },
    detailLabel: { fontSize: 14, color: secondaryTextColor, flexShrink: 1, marginRight: 8, },
    detailValue: { fontSize: 14, color: textColor, fontWeight: '500', textAlign: 'right', },
    detailValueFullWidth: {flexBasis: 'auto', flexGrow:1, textAlign:'left'},
    perfRangeContainer: { marginBottom: 24, },
    perfRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, },
    perfLabel: { fontSize: 13, color: secondaryTextColor, },
    perfValue: { fontSize: 13, color: textColor, fontWeight: '500', },
    sliderPlaceholder: { height: 6, backgroundColor: '#333333', borderRadius: 3, marginVertical: 8, overflow: 'hidden' },
    sliderInnerPlaceholder: { height: '100%', backgroundColor: primaryColor, borderRadius: 3, width: '50%' },
    keyStatsGrid: { },
    financialsMessageText: { color: secondaryTextColor, textAlign: 'center', marginTop: 20, fontStyle: 'italic', paddingHorizontal:16 },
});

export default StockDetailScreen;
