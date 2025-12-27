/**
 * Sample Data Generator
 * Generates realistic OHLCV data for testing and development
 */

import type { OHLCVBar, OHLCVData, Timeframe } from '../types/stock.types';

// ============================================================================
// Random Walk with Drift
// ============================================================================

/**
 * Generate realistic OHLCV data using random walk with drift
 * @param symbol - Stock symbol
 * @param days - Number of days of data
 * @param timeframe - Timeframe for bars
 * @param startPrice - Starting price
 * @param trend - Trend direction (-1 to 1, 0 = neutral)
 * @param volatility - Price volatility (0-1, default 0.02 = 2%)
 * @returns Complete OHLCV dataset
 */
export function generateRealisticOHLCV(
    symbol: string,
    days: number = 365,
    timeframe: Timeframe = '1d',
    startPrice: number = 100,
    trend: number = 0,
    volatility: number = 0.02
): OHLCVData {
    const barsPerDay = getBarsPerDay(timeframe);
    const totalBars = days * barsPerDay;
    const bars: OHLCVBar[] = [];

    // Calculate time increment in seconds
    const timeIncrement = getTimeframeSeconds(timeframe);
    const startTime = Math.floor(Date.now() / 1000) - totalBars * timeIncrement;

    let currentPrice = startPrice;
    let currentTime = startTime;

    for (let i = 0; i < totalBars; i++) {
        // Generate OHLC for this bar
        const bar = generateSingleBar(
            currentTime,
            currentPrice,
            trend,
            volatility
        );

        bars.push(bar);

        // Update for next bar
        currentPrice = bar.close;
        currentTime += timeIncrement;
    }

    return {
        symbol,
        timeframe,
        bars,
    };
}

/**
 * Generate a single OHLCV bar
 */
function generateSingleBar(
    time: number,
    startPrice: number,
    trend: number,
    volatility: number
): OHLCVBar {
    // Calculate drift (trend component)
    const drift = trend * volatility;

    // Generate random price movements
    const open = startPrice;
    const change1 = randomNormal() * volatility * startPrice;
    const change2 = randomNormal() * volatility * startPrice;
    const change3 = randomNormal() * volatility * startPrice;

    // Calculate OHLC
    const price1 = open + change1;
    const price2 = open + change1 + change2;
    const close = open + change1 + change2 + change3 + drift * startPrice;

    const high = Math.max(open, price1, price2, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, price1, price2, close) * (1 - Math.random() * volatility * 0.5);

    // Generate volume (higher volume on larger price movements)
    const priceChange = Math.abs(close - open) / open;
    const baseVolume = 1000000;
    const volume = Math.floor(
        baseVolume * (1 + priceChange * 10) * (0.5 + Math.random())
    );

    return {
        time,
        open: roundPrice(open),
        high: roundPrice(high),
        low: roundPrice(low),
        close: roundPrice(close),
        volume,
    };
}

// ============================================================================
// Preset Patterns
// ============================================================================

/**
 * Generate data with specific pattern characteristics
 */
export function generatePatternData(
    symbol: string,
    pattern: 'bullish' | 'bearish' | 'ranging' | 'volatile',
    days: number = 180
): OHLCVData {
    switch (pattern) {
        case 'bullish':
            return generateRealisticOHLCV(symbol, days, '1d', 100, 0.3, 0.015);
        case 'bearish':
            return generateRealisticOHLCV(symbol, days, '1d', 100, -0.3, 0.015);
        case 'ranging':
            return generateRealisticOHLCV(symbol, days, '1d', 100, 0, 0.01);
        case 'volatile':
            return generateRealisticOHLCV(symbol, days, '1d', 100, 0, 0.04);
        default:
            return generateRealisticOHLCV(symbol, days);
    }
}

/**
 * Generate data with clear support and resistance levels
 */
export function generateSupportResistanceData(
    symbol: string,
    days: number = 180
): OHLCVData {
    const data = generateRealisticOHLCV(symbol, days, '1d', 100, 0, 0.015);

    // Add artificial support at 95 and resistance at 110
    const supportLevel = 95;
    const resistanceLevel = 110;
    const tolerance = 2;

    data.bars = data.bars.map((bar) => {
        let { open, high, low, close } = bar;

        // Bounce off support
        if (low < supportLevel + tolerance && low > supportLevel - tolerance) {
            low = supportLevel + Math.random() * tolerance;
            if (close < low) close = low + Math.random() * 2;
        }

        // Bounce off resistance
        if (high > resistanceLevel - tolerance && high < resistanceLevel + tolerance) {
            high = resistanceLevel - Math.random() * tolerance;
            if (close > high) close = high - Math.random() * 2;
        }

        return { ...bar, open, high, low, close };
    });

    return data;
}

/**
 * Generate intraday data (1-minute bars for a single day)
 */
export function generateIntradayData(
    symbol: string,
    startPrice: number = 100
): OHLCVData {
    // Generate 6.5 hours of trading (390 minutes)
    return generateRealisticOHLCV(symbol, 1, '1m', startPrice, 0, 0.001);
}

// ============================================================================
// Multiple Symbols
// ============================================================================

/**
 * Generate data for multiple symbols with different characteristics
 */
export function generateMultiSymbolData(): Map<string, OHLCVData> {
    const symbols = new Map<string, OHLCVData>();

    symbols.set('AAPL', generateRealisticOHLCV('AAPL', 365, '1d', 150, 0.2, 0.02));
    symbols.set('GOOGL', generateRealisticOHLCV('GOOGL', 365, '1d', 2800, 0.15, 0.025));
    symbols.set('MSFT', generateRealisticOHLCV('MSFT', 365, '1d', 300, 0.25, 0.018));
    symbols.set('TSLA', generateRealisticOHLCV('TSLA', 365, '1d', 200, 0.1, 0.05));
    symbols.set('AMZN', generateRealisticOHLCV('AMZN', 365, '1d', 3200, 0.1, 0.03));

    return symbols;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get number of bars per day for a timeframe
 */
function getBarsPerDay(timeframe: Timeframe): number {
    const map: Record<Timeframe, number> = {
        '1m': 390, // 6.5 hours of trading
        '5m': 78,
        '15m': 26,
        '30m': 13,
        '1h': 6.5,
        '4h': 1.625,
        '1d': 1,
        '1w': 1 / 5,
        '1M': 1 / 21,
    };
    return map[timeframe];
}

/**
 * Get timeframe in seconds
 */
function getTimeframeSeconds(timeframe: Timeframe): number {
    const map: Record<Timeframe, number> = {
        '1m': 60,
        '5m': 5 * 60,
        '15m': 15 * 60,
        '30m': 30 * 60,
        '1h': 60 * 60,
        '4h': 4 * 60 * 60,
        '1d': 24 * 60 * 60,
        '1w': 7 * 24 * 60 * 60,
        '1M': 30 * 24 * 60 * 60,
    };
    return map[timeframe];
}

/**
 * Generate random number from normal distribution (Box-Muller transform)
 */
function randomNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Round price to 2 decimal places
 */
function roundPrice(price: number): number {
    return Math.round(price * 100) / 100;
}

/**
 * Add noise to data (for testing robustness)
 */
export function addNoise(data: OHLCVData, noiseLevel: number = 0.01): OHLCVData {
    return {
        ...data,
        bars: data.bars.map((bar) => ({
            ...bar,
            open: bar.open * (1 + (Math.random() - 0.5) * noiseLevel),
            high: bar.high * (1 + (Math.random() - 0.5) * noiseLevel),
            low: bar.low * (1 + (Math.random() - 0.5) * noiseLevel),
            close: bar.close * (1 + (Math.random() - 0.5) * noiseLevel),
        })),
    };
}

/**
 * Slice data to specific date range
 */
export function sliceDataByDate(
    data: OHLCVData,
    startTime: number,
    endTime: number
): OHLCVData {
    return {
        ...data,
        bars: data.bars.filter((bar) => bar.time >= startTime && bar.time <= endTime),
    };
}

/**
 * Get last N bars
 */
export function getLastBars(data: OHLCVData, count: number): OHLCVData {
    return {
        ...data,
        bars: data.bars.slice(-count),
    };
}
