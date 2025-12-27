/**
 * Technical Indicator Calculation Utilities
 * Pure functions for calculating EMA, SMA, RSI, MACD, and VWAP
 */

import type {
    OHLCVBar,
    MovingAveragePoint,
    RSIPoint,
    MACDPoint,
    VWAPPoint,
} from '../types/stock.types';

// ============================================================================
// Simple Moving Average (SMA)
// ============================================================================

/**
 * Calculate Simple Moving Average
 * @param data - OHLCV data array
 * @param period - Number of periods for SMA
 * @param priceType - Which price to use (default: 'close')
 * @returns Array of SMA data points
 */
export function calculateSMA(
    data: OHLCVBar[],
    period: number,
    priceType: 'open' | 'high' | 'low' | 'close' = 'close'
): MovingAveragePoint[] {
    if (data.length < period) {
        return [];
    }

    const result: MovingAveragePoint[] = [];

    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j][priceType];
        }
        const average = sum / period;

        result.push({
            time: data[i].time,
            value: average,
        });
    }

    return result;
}

// ============================================================================
// Exponential Moving Average (EMA)
// ============================================================================

/**
 * Calculate Exponential Moving Average
 * @param data - OHLCV data array
 * @param period - Number of periods for EMA
 * @param priceType - Which price to use (default: 'close')
 * @returns Array of EMA data points
 */
export function calculateEMA(
    data: OHLCVBar[],
    period: number,
    priceType: 'open' | 'high' | 'low' | 'close' = 'close'
): MovingAveragePoint[] {
    if (data.length < period) {
        return [];
    }

    const result: MovingAveragePoint[] = [];
    const multiplier = 2 / (period + 1);

    // Calculate initial SMA as first EMA value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i][priceType];
    }
    let ema = sum / period;

    result.push({
        time: data[period - 1].time,
        value: ema,
    });

    // Calculate EMA for remaining data points
    for (let i = period; i < data.length; i++) {
        ema = (data[i][priceType] - ema) * multiplier + ema;
        result.push({
            time: data[i].time,
            value: ema,
        });
    }

    return result;
}

// ============================================================================
// Relative Strength Index (RSI)
// ============================================================================

/**
 * Calculate Relative Strength Index
 * @param data - OHLCV data array
 * @param period - Number of periods for RSI (default: 14)
 * @returns Array of RSI data points (values between 0-100)
 */
export function calculateRSI(
    data: OHLCVBar[],
    period: number = 14
): RSIPoint[] {
    if (data.length < period + 1) {
        return [];
    }

    const result: RSIPoint[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate first RSI
    let rs = avgGain / avgLoss;
    let rsi = 100 - 100 / (1 + rs);

    result.push({
        time: data[period].time,
        value: rsi,
    });

    // Calculate RSI for remaining data points using smoothed averages
    for (let i = period; i < gains.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

        rs = avgGain / avgLoss;
        rsi = 100 - 100 / (1 + rs);

        result.push({
            time: data[i + 1].time,
            value: rsi,
        });
    }

    return result;
}

// ============================================================================
// MACD (Moving Average Convergence Divergence)
// ============================================================================

/**
 * Calculate MACD indicator
 * @param data - OHLCV data array
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line period (default: 9)
 * @returns Array of MACD data points
 */
export function calculateMACD(
    data: OHLCVBar[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
): MACDPoint[] {
    if (data.length < slowPeriod + signalPeriod) {
        return [];
    }

    // Calculate fast and slow EMAs
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    // Calculate MACD line (fast EMA - slow EMA)
    const macdLine: MovingAveragePoint[] = [];
    const slowStartIndex = slowPeriod - fastPeriod;

    for (let i = 0; i < slowEMA.length; i++) {
        const fastValue = fastEMA[slowStartIndex + i].value;
        const slowValue = slowEMA[i].value;
        macdLine.push({
            time: slowEMA[i].time,
            value: fastValue - slowValue,
        });
    }

    // Calculate signal line (EMA of MACD line)
    const signalLine = calculateEMAFromValues(macdLine, signalPeriod);

    // Calculate histogram (MACD - Signal)
    const result: MACDPoint[] = [];
    for (let i = 0; i < signalLine.length; i++) {
        const macdValue = macdLine[signalPeriod - 1 + i].value;
        const signalValue = signalLine[i].value;

        result.push({
            time: signalLine[i].time,
            macd: macdValue,
            signal: signalValue,
            histogram: macdValue - signalValue,
        });
    }

    return result;
}

/**
 * Helper: Calculate EMA from pre-calculated values
 */
function calculateEMAFromValues(
    data: MovingAveragePoint[],
    period: number
): MovingAveragePoint[] {
    if (data.length < period) {
        return [];
    }

    const result: MovingAveragePoint[] = [];
    const multiplier = 2 / (period + 1);

    // Calculate initial SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].value;
    }
    let ema = sum / period;

    result.push({
        time: data[period - 1].time,
        value: ema,
    });

    // Calculate EMA for remaining points
    for (let i = period; i < data.length; i++) {
        ema = (data[i].value - ema) * multiplier + ema;
        result.push({
            time: data[i].time,
            value: ema,
        });
    }

    return result;
}

// ============================================================================
// VWAP (Volume Weighted Average Price)
// ============================================================================

/**
 * Calculate Volume Weighted Average Price
 * @param data - OHLCV data array
 * @returns Array of VWAP data points
 */
export function calculateVWAP(data: OHLCVBar[]): VWAPPoint[] {
    if (data.length === 0) {
        return [];
    }

    const result: VWAPPoint[] = [];
    let cumulativeTPV = 0; // Cumulative Typical Price * Volume
    let cumulativeVolume = 0;

    for (let i = 0; i < data.length; i++) {
        const bar = data[i];
        const typicalPrice = (bar.high + bar.low + bar.close) / 3;
        const tpv = typicalPrice * bar.volume;

        cumulativeTPV += tpv;
        cumulativeVolume += bar.volume;

        const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;

        result.push({
            time: bar.time,
            value: vwap,
        });
    }

    return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate typical price (HLC/3)
 */
export function calculateTypicalPrice(bar: OHLCVBar): number {
    return (bar.high + bar.low + bar.close) / 3;
}

/**
 * Calculate true range for ATR calculations
 */
export function calculateTrueRange(current: OHLCVBar, previous: OHLCVBar | null): number {
    if (!previous) {
        return current.high - current.low;
    }

    const range1 = current.high - current.low;
    const range2 = Math.abs(current.high - previous.close);
    const range3 = Math.abs(current.low - previous.close);

    return Math.max(range1, range2, range3);
}

/**
 * Validate indicator period
 */
export function validatePeriod(period: number, dataLength: number): boolean {
    return period > 0 && period <= dataLength;
}

/**
 * Get price array from OHLCV data
 */
export function getPriceArray(
    data: OHLCVBar[],
    priceType: 'open' | 'high' | 'low' | 'close'
): number[] {
    return data.map((bar) => bar[priceType]);
}
