/**
 * Data Service Layer
 * Handles data fetching, validation, normalization, and caching
 */

import type {
    OHLCVBar,
    OHLCVData,
    Timeframe,
    SymbolInfo,
    DataResult,
} from '../types/stock.types';

// ============================================================================
// Data Validation
// ============================================================================

/**
 * Validate OHLCV bar data
 * @param bar - Single OHLCV bar to validate
 * @returns True if valid
 */
export function validateOHLCVBar(bar: any): bar is OHLCVBar {
    return (
        typeof bar === 'object' &&
        bar !== null &&
        typeof bar.time === 'number' &&
        typeof bar.open === 'number' &&
        typeof bar.high === 'number' &&
        typeof bar.low === 'number' &&
        typeof bar.close === 'number' &&
        typeof bar.volume === 'number' &&
        bar.high >= bar.low &&
        bar.high >= bar.open &&
        bar.high >= bar.close &&
        bar.low <= bar.open &&
        bar.low <= bar.close &&
        bar.volume >= 0
    );
}

/**
 * Validate complete OHLCV dataset
 * @param data - OHLCV data to validate
 * @returns True if valid
 */
export function validateOHLCVData(data: any): data is OHLCVData {
    if (
        typeof data !== 'object' ||
        data === null ||
        typeof data.symbol !== 'string' ||
        typeof data.timeframe !== 'string' ||
        !Array.isArray(data.bars)
    ) {
        return false;
    }

    // Validate all bars
    return data.bars.every(validateOHLCVBar);
}

// ============================================================================
// Data Normalization
// ============================================================================

/**
 * Normalize OHLCV data to ensure consistent format
 * @param data - Raw OHLCV data
 * @returns Normalized OHLCV data
 */
export function normalizeOHLCVData(data: OHLCVData): OHLCVData {
    // Sort bars by time
    const sortedBars = [...data.bars].sort((a, b) => a.time - b.time);

    // Remove duplicates (same timestamp)
    const uniqueBars: OHLCVBar[] = [];
    let lastTime = -1;

    for (const bar of sortedBars) {
        if (bar.time !== lastTime) {
            uniqueBars.push(bar);
            lastTime = bar.time;
        }
    }

    return {
        ...data,
        bars: uniqueBars,
    };
}

/**
 * Convert timestamp formats to Unix seconds
 * @param timestamp - Timestamp in various formats
 * @returns Unix timestamp in seconds
 */
export function normalizeTimestamp(timestamp: number | string | Date): number {
    if (typeof timestamp === 'number') {
        // If timestamp is in milliseconds, convert to seconds
        return timestamp > 10000000000 ? Math.floor(timestamp / 1000) : timestamp;
    } else if (typeof timestamp === 'string') {
        return Math.floor(new Date(timestamp).getTime() / 1000);
    } else {
        return Math.floor(timestamp.getTime() / 1000);
    }
}

// ============================================================================
// Data Caching
// ============================================================================

interface CacheEntry {
    data: OHLCVData;
    timestamp: number;
}

class DataCache {
    private cache: Map<string, CacheEntry> = new Map();
    private maxAge: number = 5 * 60 * 1000; // 5 minutes

    /**
     * Get cache key for symbol and timeframe
     */
    private getKey(symbol: string, timeframe: Timeframe): string {
        return `${symbol}:${timeframe}`;
    }

    /**
     * Get data from cache
     */
    get(symbol: string, timeframe: Timeframe): OHLCVData | null {
        const key = this.getKey(symbol, timeframe);
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if cache is still valid
        const now = Date.now();
        if (now - entry.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache
     */
    set(symbol: string, timeframe: Timeframe, data: OHLCVData): void {
        const key = this.getKey(symbol, timeframe);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    /**
     * Clear cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Clear cache for specific symbol
     */
    clearSymbol(symbol: string): void {
        const keysToDelete: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${symbol}:`)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach((key) => this.cache.delete(key));
    }
}

// Global cache instance
const dataCache = new DataCache();

// ============================================================================
// Data Fetching (API Integration Ready)
// ============================================================================

/**
 * Fetch stock data from API (placeholder for backend integration)
 * @param symbol - Stock symbol
 * @param timeframe - Timeframe
 * @param useCache - Whether to use cached data
 * @returns Promise with OHLCV data
 */
export async function fetchStockData(
    symbol: string,
    timeframe: Timeframe,
    useCache: boolean = true
): Promise<DataResult<OHLCVData>> {
    try {
        // Check cache first
        if (useCache) {
            const cached = dataCache.get(symbol, timeframe);
            if (cached) {
                return {
                    status: 'success',
                    data: cached,
                    error: null,
                };
            }
        }

        // TODO: Replace with actual API call
        // Example: const response = await fetch(`/api/stock/${symbol}/${timeframe}`);
        // For now, return error indicating API not connected
        return {
            status: 'error',
            data: null,
            error: 'API not connected. Use sample data for testing.',
        };

        // Example implementation when API is ready:
        /*
        const response = await fetch(`/api/stock/${symbol}/${timeframe}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawData = await response.json();
        
        if (!validateOHLCVData(rawData)) {
          throw new Error('Invalid data format received from API');
        }
        
        const normalizedData = normalizeOHLCVData(rawData);
        
        // Cache the data
        dataCache.set(symbol, timeframe, normalizedData);
        
        return {
          status: 'success',
          data: normalizedData,
          error: null,
        };
        */
    } catch (error) {
        return {
            status: 'error',
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Search for symbols (placeholder for backend integration)
 * @param query - Search query
 * @returns Promise with array of symbol info
 */
export async function searchSymbols(query: string): Promise<DataResult<SymbolInfo[]>> {
    try {
        // TODO: Replace with actual API call
        // Example: const response = await fetch(`/api/symbols/search?q=${query}`);

        // For now, return mock data
        const mockSymbols: SymbolInfo[] = [
            { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'stock' as const },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'stock' as const },
            { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'stock' as const },
            { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'stock' as const },
            { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', type: 'stock' as const },
        ].filter((s) =>
            s.symbol.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase())
        );

        return {
            status: 'success',
            data: mockSymbols,
            error: null,
        };
    } catch (error) {
        return {
            status: 'error',
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// ============================================================================
// Popular Symbols
// ============================================================================

/**
 * Get list of popular symbols
 */
export function getPopularSymbols(): SymbolInfo[] {
    return [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'stock' as const },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'stock' as const },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'stock' as const },
        { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'stock' as const },
        { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', type: 'stock' as const },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'stock' as const },
        { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', type: 'stock' as const },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', exchange: 'NYSE', type: 'stock' as const },
    ];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all cached data
 */
export function clearCache(): void {
    dataCache.clear();
}

/**
 * Clear cache for specific symbol
 */
export function clearSymbolCache(symbol: string): void {
    dataCache.clearSymbol(symbol);
}

/**
 * Get timeframe in milliseconds
 */
export function getTimeframeMs(timeframe: Timeframe): number {
    const map: Record<Timeframe, number> = {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
        '1M': 30 * 24 * 60 * 60 * 1000,
    };
    return map[timeframe];
}

/**
 * Format timeframe for display
 */
export function formatTimeframe(timeframe: Timeframe): string {
    const map: Record<Timeframe, string> = {
        '1m': '1 Minute',
        '5m': '5 Minutes',
        '15m': '15 Minutes',
        '30m': '30 Minutes',
        '1h': '1 Hour',
        '4h': '4 Hours',
        '1d': '1 Day',
        '1w': '1 Week',
        '1M': '1 Month',
    };
    return map[timeframe];
}
