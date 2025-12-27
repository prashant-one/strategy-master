/**
 * Core TypeScript type definitions for stock analysis application
 * Defines data structures for OHLCV data, technical indicators, and chart configurations
 */

// ============================================================================
// OHLCV Data Types
// ============================================================================

/**
 * Single candlestick bar with OHLCV data
 */
export interface OHLCVBar {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/**
 * Complete OHLCV dataset for a symbol
 */
export interface OHLCVData {
    symbol: string;
    timeframe: string;
    bars: OHLCVBar[];
}

// ============================================================================
// Technical Indicator Types
// ============================================================================

/**
 * Moving Average data point
 */
export interface MovingAveragePoint {
    time: number;
    value: number;
}

/**
 * EMA (Exponential Moving Average) configuration
 */
export interface EMAConfig {
    period: number;
    color: string;
    visible: boolean;
}

/**
 * SMA (Simple Moving Average) configuration
 */
export interface SMAConfig {
    period: number;
    color: string;
    visible: boolean;
}

/**
 * RSI (Relative Strength Index) data point
 */
export interface RSIPoint {
    time: number;
    value: number; // 0-100
}

/**
 * RSI configuration
 */
export interface RSIConfig {
    period: number;
    overbought: number; // Default 70
    oversold: number; // Default 30
    visible: boolean;
    color: string;
}

/**
 * MACD data point
 */
export interface MACDPoint {
    time: number;
    macd: number;
    signal: number;
    histogram: number;
}

/**
 * MACD configuration
 */
export interface MACDConfig {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    visible: boolean;
    macdColor: string;
    signalColor: string;
    histogramColor: string;
}

/**
 * VWAP (Volume Weighted Average Price) data point
 */
export interface VWAPPoint {
    time: number;
    value: number;
}

/**
 * VWAP configuration
 */
export interface VWAPConfig {
    visible: boolean;
    color: string;
}

/**
 * All technical indicators configuration
 */
export interface IndicatorsConfig {
    ema20: EMAConfig;
    ema50: EMAConfig;
    ema200: EMAConfig;
    sma: SMAConfig;
    rsi: RSIConfig;
    macd: MACDConfig;
    vwap: VWAPConfig;
}

// ============================================================================
// Support & Resistance Types
// ============================================================================

/**
 * Swing point (high or low)
 */
export interface SwingPoint {
    time: number;
    price: number;
    type: 'high' | 'low';
    index: number;
}

/**
 * Support or Resistance level
 */
export interface SupportResistanceLevel {
    price: number;
    type: 'support' | 'resistance';
    strength: number; // Number of touches
    touchPoints: number[]; // Timestamps of touches
    color: string;
}

/**
 * Support & Resistance configuration
 */
export interface SRConfig {
    visible: boolean;
    leftBars: number; // Bars to left for swing detection
    rightBars: number; // Bars to right for swing detection
    tolerance: number; // Price tolerance for clustering (percentage)
    minStrength: number; // Minimum touches to show level
    showSupport: boolean;
    showResistance: boolean;
}

// ============================================================================
// Heatmap Types
// ============================================================================

/**
 * Price zone for heatmap
 */
export interface PriceZone {
    priceStart: number;
    priceEnd: number;
    density: number; // Number of touches/reactions
    normalizedDensity: number; // 0-1 for color mapping
}

/**
 * Heatmap data structure
 */
export interface HeatmapData {
    zones: PriceZone[];
    maxDensity: number;
    minDensity: number;
}

/**
 * Heatmap configuration
 */
export interface HeatmapConfig {
    visible: boolean;
    opacity: number; // 0-1
    zoneHeight: number; // Price units per zone
    colorScheme: 'blue-red' | 'green-red' | 'grayscale';
}

// ============================================================================
// Drawing Tools Types
// ============================================================================

/**
 * Point on chart
 */
export interface ChartPoint {
    time: number;
    price: number;
}

/**
 * Trendline drawing
 */
export interface Trendline {
    id: string;
    type: 'trendline';
    point1: ChartPoint;
    point2: ChartPoint;
    color: string;
    lineWidth: number;
    extend: boolean; // Extend line beyond points
}

/**
 * Price channel drawing
 */
export interface PriceChannel {
    id: string;
    type: 'channel';
    point1: ChartPoint;
    point2: ChartPoint;
    width: number; // Distance between parallel lines
    color: string;
    lineWidth: number;
}

/**
 * Rectangle zone (supply/demand)
 */
export interface RectangleZone {
    id: string;
    type: 'rectangle';
    topLeft: ChartPoint;
    bottomRight: ChartPoint;
    color: string;
    fillOpacity: number;
    borderWidth: number;
    label?: string;
}

/**
 * Union type for all drawings
 */
export type Drawing = Trendline | PriceChannel | RectangleZone;

/**
 * Active drawing tool
 */
export type DrawingTool = 'cursor' | 'trendline' | 'channel' | 'rectangle';

/**
 * Drawing state
 */
export interface DrawingState {
    activeTool: DrawingTool;
    drawings: Drawing[];
    tempPoints: ChartPoint[]; // Points being drawn
    selectedDrawing: string | null; // ID of selected drawing
}

// ============================================================================
// Chart Configuration Types
// ============================================================================

/**
 * Timeframe options
 */
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

/**
 * Chart theme
 */
export interface ChartTheme {
    backgroundColor: string;
    textColor: string;
    gridColor: string;
    upColor: string; // Bullish candle
    downColor: string; // Bearish candle
    borderUpColor: string;
    borderDownColor: string;
    wickUpColor: string;
    wickDownColor: string;
}

/**
 * Main chart configuration
 */
export interface ChartConfig {
    symbol: string;
    timeframe: Timeframe;
    height: number;
    theme: ChartTheme;
    indicators: IndicatorsConfig;
    supportResistance: SRConfig;
    heatmap: HeatmapConfig;
    crosshair: boolean;
    volume: boolean;
}

// ============================================================================
// Data Service Types
// ============================================================================

/**
 * Data fetch status
 */
export type DataStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Data fetch result
 */
export interface DataResult<T> {
    status: DataStatus;
    data: T | null;
    error: string | null;
}

/**
 * Symbol info
 */
export interface SymbolInfo {
    symbol: string;
    name: string;
    exchange: string;
    type: 'stock' | 'crypto' | 'forex' | 'commodity';
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Price range
 */
export interface PriceRange {
    min: number;
    max: number;
}

/**
 * Time range
 */
export interface TimeRange {
    start: number;
    end: number;
}

/**
 * Chart dimensions
 */
export interface ChartDimensions {
    width: number;
    height: number;
}
