/**
 * Support & Resistance Detection Utilities
 * Algorithms for detecting swing highs/lows and calculating support/resistance levels
 */

import type {
    OHLCVBar,
    SwingPoint,
    SupportResistanceLevel,
} from '../types/stock.types';

// ============================================================================
// Swing Point Detection
// ============================================================================

/**
 * Detect swing highs in price data
 * A swing high is a high that is higher than N bars to the left and right
 * @param data - OHLCV data array
 * @param leftBars - Number of bars to the left
 * @param rightBars - Number of bars to the right
 * @returns Array of swing high points
 */
export function detectSwingHighs(
    data: OHLCVBar[],
    leftBars: number = 5,
    rightBars: number = 5
): SwingPoint[] {
    const swingHighs: SwingPoint[] = [];

    // Need enough bars on both sides
    for (let i = leftBars; i < data.length - rightBars; i++) {
        const currentHigh = data[i].high;
        let isSwingHigh = true;

        // Check left bars
        for (let j = 1; j <= leftBars; j++) {
            if (data[i - j].high >= currentHigh) {
                isSwingHigh = false;
                break;
            }
        }

        // Check right bars
        if (isSwingHigh) {
            for (let j = 1; j <= rightBars; j++) {
                if (data[i + j].high >= currentHigh) {
                    isSwingHigh = false;
                    break;
                }
            }
        }

        if (isSwingHigh) {
            swingHighs.push({
                time: data[i].time,
                price: currentHigh,
                type: 'high',
                index: i,
            });
        }
    }

    return swingHighs;
}

/**
 * Detect swing lows in price data
 * A swing low is a low that is lower than N bars to the left and right
 * @param data - OHLCV data array
 * @param leftBars - Number of bars to the left
 * @param rightBars - Number of bars to the right
 * @returns Array of swing low points
 */
export function detectSwingLows(
    data: OHLCVBar[],
    leftBars: number = 5,
    rightBars: number = 5
): SwingPoint[] {
    const swingLows: SwingPoint[] = [];

    // Need enough bars on both sides
    for (let i = leftBars; i < data.length - rightBars; i++) {
        const currentLow = data[i].low;
        let isSwingLow = true;

        // Check left bars
        for (let j = 1; j <= leftBars; j++) {
            if (data[i - j].low <= currentLow) {
                isSwingLow = false;
                break;
            }
        }

        // Check right bars
        if (isSwingLow) {
            for (let j = 1; j <= rightBars; j++) {
                if (data[i + j].low <= currentLow) {
                    isSwingLow = false;
                    break;
                }
            }
        }

        if (isSwingLow) {
            swingLows.push({
                time: data[i].time,
                price: currentLow,
                type: 'low',
                index: i,
            });
        }
    }

    return swingLows;
}

/**
 * Detect all swing points (both highs and lows)
 * @param data - OHLCV data array
 * @param leftBars - Number of bars to the left
 * @param rightBars - Number of bars to the right
 * @returns Array of all swing points sorted by time
 */
export function detectSwingPoints(
    data: OHLCVBar[],
    leftBars: number = 5,
    rightBars: number = 5
): SwingPoint[] {
    const highs = detectSwingHighs(data, leftBars, rightBars);
    const lows = detectSwingLows(data, leftBars, rightBars);

    return [...highs, ...lows].sort((a, b) => a.time - b.time);
}

// ============================================================================
// Level Clustering & Calculation
// ============================================================================

/**
 * Cluster nearby swing points into support/resistance levels
 * @param swings - Array of swing points
 * @param tolerance - Price tolerance as percentage (e.g., 0.5 for 0.5%)
 * @returns Array of support/resistance levels
 */
export function calculateLevels(
    swings: SwingPoint[],
    tolerance: number = 0.5
): SupportResistanceLevel[] {
    if (swings.length === 0) {
        return [];
    }

    const levels: SupportResistanceLevel[] = [];
    const used = new Set<number>();

    // Sort swings by price
    const sortedSwings = [...swings].sort((a, b) => a.price - b.price);

    for (let i = 0; i < sortedSwings.length; i++) {
        if (used.has(i)) continue;

        const swing = sortedSwings[i];
        const cluster: SwingPoint[] = [swing];
        used.add(i);

        // Find nearby swings within tolerance
        const toleranceRange = swing.price * (tolerance / 100);

        for (let j = i + 1; j < sortedSwings.length; j++) {
            if (used.has(j)) continue;

            const otherSwing = sortedSwings[j];
            if (Math.abs(otherSwing.price - swing.price) <= toleranceRange) {
                cluster.push(otherSwing);
                used.add(j);
            } else if (otherSwing.price > swing.price + toleranceRange) {
                break; // No more swings in range
            }
        }

        // Calculate average price for the level
        const avgPrice = cluster.reduce((sum, s) => sum + s.price, 0) / cluster.length;

        // Determine if support or resistance based on swing types
        const highCount = cluster.filter((s) => s.type === 'high').length;
        const lowCount = cluster.filter((s) => s.type === 'low').length;
        const type = highCount > lowCount ? 'resistance' : 'support';

        levels.push({
            price: avgPrice,
            type,
            strength: cluster.length,
            touchPoints: cluster.map((s) => s.time),
            color: getLevelColor(cluster.length, type),
        });
    }

    return levels;
}

/**
 * Calculate level strength based on how many times price touched the level
 * @param level - Support/resistance level
 * @param data - OHLCV data array
 * @param tolerance - Price tolerance as percentage
 * @returns Updated level with recalculated strength
 */
export function calculateLevelStrength(
    level: SupportResistanceLevel,
    data: OHLCVBar[],
    tolerance: number = 0.5
): SupportResistanceLevel {
    const toleranceRange = level.price * (tolerance / 100);
    const touchPoints: number[] = [];

    for (const bar of data) {
        // Check if price touched the level
        const touched =
            level.type === 'support'
                ? bar.low <= level.price + toleranceRange && bar.low >= level.price - toleranceRange
                : bar.high >= level.price - toleranceRange && bar.high <= level.price + toleranceRange;

        if (touched) {
            touchPoints.push(bar.time);
        }
    }

    return {
        ...level,
        strength: touchPoints.length,
        touchPoints,
        color: getLevelColor(touchPoints.length, level.type),
    };
}

/**
 * Filter levels by minimum strength
 * @param levels - Array of support/resistance levels
 * @param minStrength - Minimum number of touches
 * @returns Filtered array of significant levels
 */
export function filterSignificantLevels(
    levels: SupportResistanceLevel[],
    minStrength: number = 2
): SupportResistanceLevel[] {
    return levels.filter((level) => level.strength >= minStrength);
}

/**
 * Get only support levels
 */
export function getSupportLevels(
    levels: SupportResistanceLevel[]
): SupportResistanceLevel[] {
    return levels.filter((level) => level.type === 'support');
}

/**
 * Get only resistance levels
 */
export function getResistanceLevels(
    levels: SupportResistanceLevel[]
): SupportResistanceLevel[] {
    return levels.filter((level) => level.type === 'resistance');
}

// ============================================================================
// Level Analysis
// ============================================================================

/**
 * Find nearest support level below current price
 * @param levels - Array of support/resistance levels
 * @param currentPrice - Current price
 * @returns Nearest support level or null
 */
export function findNearestSupport(
    levels: SupportResistanceLevel[],
    currentPrice: number
): SupportResistanceLevel | null {
    const supports = getSupportLevels(levels).filter((level) => level.price < currentPrice);

    if (supports.length === 0) return null;

    return supports.reduce((nearest, level) =>
        level.price > nearest.price ? level : nearest
    );
}

/**
 * Find nearest resistance level above current price
 * @param levels - Array of support/resistance levels
 * @param currentPrice - Current price
 * @returns Nearest resistance level or null
 */
export function findNearestResistance(
    levels: SupportResistanceLevel[],
    currentPrice: number
): SupportResistanceLevel | null {
    const resistances = getResistanceLevels(levels).filter(
        (level) => level.price > currentPrice
    );

    if (resistances.length === 0) return null;

    return resistances.reduce((nearest, level) =>
        level.price < nearest.price ? level : nearest
    );
}

/**
 * Check if price is near a level
 * @param price - Price to check
 * @param level - Support/resistance level
 * @param tolerance - Price tolerance as percentage
 * @returns True if price is near the level
 */
export function isPriceNearLevel(
    price: number,
    level: SupportResistanceLevel,
    tolerance: number = 0.5
): boolean {
    const toleranceRange = level.price * (tolerance / 100);
    return Math.abs(price - level.price) <= toleranceRange;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get color for level based on strength
 * @param strength - Number of touches
 * @param type - Support or resistance
 * @returns Color string
 */
function getLevelColor(strength: number, type: 'support' | 'resistance'): string {
    if (strength >= 5) {
        // Strong level
        return type === 'support' ? '#22c55e' : '#ef4444'; // Green / Red
    } else if (strength >= 3) {
        // Medium level
        return type === 'support' ? '#eab308' : '#f97316'; // Yellow / Orange
    } else {
        // Weak level
        return '#6b7280'; // Gray
    }
}

/**
 * Sort levels by strength (descending)
 */
export function sortLevelsByStrength(
    levels: SupportResistanceLevel[]
): SupportResistanceLevel[] {
    return [...levels].sort((a, b) => b.strength - a.strength);
}

/**
 * Sort levels by price
 */
export function sortLevelsByPrice(
    levels: SupportResistanceLevel[],
    ascending: boolean = true
): SupportResistanceLevel[] {
    return [...levels].sort((a, b) => (ascending ? a.price - b.price : b.price - a.price));
}

/**
 * Get price range from OHLCV data
 */
export function getPriceRange(data: OHLCVBar[]): { min: number; max: number } {
    if (data.length === 0) {
        return { min: 0, max: 0 };
    }

    let min = data[0].low;
    let max = data[0].high;

    for (const bar of data) {
        if (bar.low < min) min = bar.low;
        if (bar.high > max) max = bar.high;
    }

    return { min, max };
}
