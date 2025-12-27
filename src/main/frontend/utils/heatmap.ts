/**
 * Heatmap Calculation Utilities
 * Functions for calculating price zone density and generating heatmap data
 */

import type {
    OHLCVBar,
    PriceZone,
    HeatmapData,
} from '../types/stock.types';

// ============================================================================
// Price Zone Calculation
// ============================================================================

/**
 * Divide price range into zones for heatmap
 * @param data - OHLCV data array
 * @param zoneHeight - Height of each zone in price units (auto-calculated if not provided)
 * @returns Array of price zones
 */
export function calculatePriceZones(
    data: OHLCVBar[],
    zoneHeight?: number
): PriceZone[] {
    if (data.length === 0) {
        return [];
    }

    // Find price range
    let minPrice = data[0].low;
    let maxPrice = data[0].high;

    for (const bar of data) {
        if (bar.low < minPrice) minPrice = bar.low;
        if (bar.high > maxPrice) maxPrice = bar.high;
    }

    const priceRange = maxPrice - minPrice;

    // Auto-calculate zone height if not provided (aim for ~50-100 zones)
    if (!zoneHeight) {
        const targetZones = 75;
        zoneHeight = priceRange / targetZones;
    }

    // Create zones
    const zones: PriceZone[] = [];
    let currentPrice = minPrice;

    while (currentPrice < maxPrice) {
        zones.push({
            priceStart: currentPrice,
            priceEnd: Math.min(currentPrice + zoneHeight, maxPrice),
            density: 0,
            normalizedDensity: 0,
        });
        currentPrice += zoneHeight;
    }

    return zones;
}

// ============================================================================
// Density Calculation
// ============================================================================

/**
 * Calculate density for each price zone based on price reactions
 * Density is measured by:
 * - Number of times price entered the zone
 * - Volume traded in the zone
 * - Time spent in the zone
 * - Reversals that occurred in the zone
 * @param data - OHLCV data array
 * @param zones - Array of price zones
 * @returns Zones with calculated density
 */
export function calculateZoneDensity(
    data: OHLCVBar[],
    zones: PriceZone[]
): PriceZone[] {
    if (data.length === 0 || zones.length === 0) {
        return zones;
    }

    // Initialize density counters
    const zoneDensities = zones.map(() => ({
        touches: 0,
        volume: 0,
        reversals: 0,
    }));

    // Calculate density for each bar
    for (let i = 0; i < data.length; i++) {
        const bar = data[i];
        const prevBar = i > 0 ? data[i - 1] : null;

        // Find which zones this bar touched
        for (let j = 0; j < zones.length; j++) {
            const zone = zones[j];

            // Check if bar's range intersects with zone
            const barTouchesZone =
                bar.low <= zone.priceEnd && bar.high >= zone.priceStart;

            if (barTouchesZone) {
                // Increment touch count
                zoneDensities[j].touches++;

                // Add volume (weighted by how much of the bar is in the zone)
                const overlapRatio = calculateOverlapRatio(bar, zone);
                zoneDensities[j].volume += bar.volume * overlapRatio;

                // Check for reversals in this zone
                if (prevBar && isReversal(prevBar, bar, zone)) {
                    zoneDensities[j].reversals += 2; // Weight reversals more heavily
                }
            }
        }
    }

    // Calculate final density (combination of touches, volume, and reversals)
    const updatedZones = zones.map((zone, i) => {
        const density =
            zoneDensities[i].touches +
            zoneDensities[i].reversals +
            (zoneDensities[i].volume / 1000000); // Normalize volume

        return {
            ...zone,
            density,
            normalizedDensity: 0, // Will be normalized later
        };
    });

    return updatedZones;
}

/**
 * Calculate how much of a bar overlaps with a zone (0-1)
 */
function calculateOverlapRatio(bar: OHLCVBar, zone: PriceZone): number {
    const barRange = bar.high - bar.low;
    if (barRange === 0) return 1;

    const overlapStart = Math.max(bar.low, zone.priceStart);
    const overlapEnd = Math.min(bar.high, zone.priceEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);

    return overlap / barRange;
}

/**
 * Check if a reversal occurred in a zone
 */
function isReversal(prevBar: OHLCVBar, currentBar: OHLCVBar, zone: PriceZone): boolean {
    // Bullish reversal: previous bar was bearish, current is bullish, and reversal happened in zone
    const bullishReversal =
        prevBar.close < prevBar.open &&
        currentBar.close > currentBar.open &&
        prevBar.low >= zone.priceStart &&
        prevBar.low <= zone.priceEnd;

    // Bearish reversal: previous bar was bullish, current is bearish, and reversal happened in zone
    const bearishReversal =
        prevBar.close > prevBar.open &&
        currentBar.close < currentBar.open &&
        prevBar.high >= zone.priceStart &&
        prevBar.high <= zone.priceEnd;

    return bullishReversal || bearishReversal;
}

// ============================================================================
// Normalization
// ============================================================================

/**
 * Normalize heatmap density values to 0-1 range
 * @param zones - Array of price zones with density
 * @returns Normalized zones and min/max density
 */
export function normalizeHeatmapData(zones: PriceZone[]): HeatmapData {
    if (zones.length === 0) {
        return {
            zones: [],
            maxDensity: 0,
            minDensity: 0,
        };
    }

    // Find min and max density
    let minDensity = zones[0].density;
    let maxDensity = zones[0].density;

    for (const zone of zones) {
        if (zone.density < minDensity) minDensity = zone.density;
        if (zone.density > maxDensity) maxDensity = zone.density;
    }

    const densityRange = maxDensity - minDensity;

    // Normalize density values
    const normalizedZones = zones.map((zone) => ({
        ...zone,
        normalizedDensity:
            densityRange > 0 ? (zone.density - minDensity) / densityRange : 0,
    }));

    return {
        zones: normalizedZones,
        maxDensity,
        minDensity,
    };
}

// ============================================================================
// Color Mapping
// ============================================================================

/**
 * Get heatmap color based on intensity (0-1)
 * @param intensity - Normalized density value (0-1)
 * @param colorScheme - Color scheme to use
 * @returns RGB color string
 */
export function getHeatmapColor(
    intensity: number,
    colorScheme: 'blue-red' | 'green-red' | 'grayscale' = 'blue-red'
): string {
    // Clamp intensity to 0-1
    intensity = Math.max(0, Math.min(1, intensity));

    switch (colorScheme) {
        case 'blue-red':
            return getBlueRedColor(intensity);
        case 'green-red':
            return getGreenRedColor(intensity);
        case 'grayscale':
            return getGrayscaleColor(intensity);
        default:
            return getBlueRedColor(intensity);
    }
}

/**
 * Blue (cold) to Red (hot) color gradient
 */
function getBlueRedColor(intensity: number): string {
    if (intensity < 0.5) {
        // Blue to Yellow
        const t = intensity * 2;
        const r = Math.round(0 + t * 255);
        const g = Math.round(0 + t * 255);
        const b = Math.round(255 - t * 255);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // Yellow to Red
        const t = (intensity - 0.5) * 2;
        const r = 255;
        const g = Math.round(255 - t * 255);
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
    }
}

/**
 * Green to Red color gradient
 */
function getGreenRedColor(intensity: number): string {
    const r = Math.round(intensity * 255);
    const g = Math.round((1 - intensity) * 255);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Grayscale color gradient
 */
function getGrayscaleColor(intensity: number): string {
    const value = Math.round(intensity * 255);
    return `rgb(${value}, ${value}, ${value})`;
}

/**
 * Get heatmap color with opacity
 */
export function getHeatmapColorWithOpacity(
    intensity: number,
    opacity: number,
    colorScheme: 'blue-red' | 'green-red' | 'grayscale' = 'blue-red'
): string {
    const rgb = getHeatmapColor(intensity, colorScheme);
    return rgb.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
}

// ============================================================================
// Complete Heatmap Generation
// ============================================================================

/**
 * Generate complete heatmap data from OHLCV data
 * @param data - OHLCV data array
 * @param zoneHeight - Optional zone height
 * @returns Complete heatmap data with normalized zones
 */
export function generateHeatmapData(
    data: OHLCVBar[],
    zoneHeight?: number
): HeatmapData {
    // Calculate price zones
    const zones = calculatePriceZones(data, zoneHeight);

    // Calculate density for each zone
    const zonesWithDensity = calculateZoneDensity(data, zones);

    // Normalize density values
    return normalizeHeatmapData(zonesWithDensity);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Find zone index for a given price
 */
export function findZoneForPrice(zones: PriceZone[], price: number): number {
    for (let i = 0; i < zones.length; i++) {
        if (price >= zones[i].priceStart && price <= zones[i].priceEnd) {
            return i;
        }
    }
    return -1;
}

/**
 * Get high-density zones (top N%)
 */
export function getHighDensityZones(
    heatmapData: HeatmapData,
    topPercentile: number = 0.2
): PriceZone[] {
    const sorted = [...heatmapData.zones].sort(
        (a, b) => b.normalizedDensity - a.normalizedDensity
    );
    const count = Math.ceil(sorted.length * topPercentile);
    return sorted.slice(0, count);
}

/**
 * Calculate average zone height
 */
export function calculateAverageZoneHeight(zones: PriceZone[]): number {
    if (zones.length === 0) return 0;

    const totalHeight = zones.reduce(
        (sum, zone) => sum + (zone.priceEnd - zone.priceStart),
        0
    );
    return totalHeight / zones.length;
}
