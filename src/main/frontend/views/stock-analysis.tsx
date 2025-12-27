/**
 * Stock Analysis View
 * Main view that integrates all stock analysis components
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import CandlestickChart from '../themes/strategymaster/components/stock/CandlestickChart';
import IndicatorOverlay from '../themes/strategymaster/components/stock/indicators/IndicatorOverlay';
import RSIPane from '../themes/strategymaster/components/stock/indicators/RSIPane';
import SupportResistance from '../themes/strategymaster/components/stock/SupportResistance';
import type {
    OHLCVData,
    Timeframe,
    IndicatorsConfig,
    SRConfig,
    RSIConfig,
} from '../types/stock.types';
import { generateRealisticOHLCV } from '../utils/sampleData';

// Default configurations
const defaultIndicators: IndicatorsConfig = {
    ema20: { period: 20, color: '#3b82f6', visible: true },
    ema50: { period: 50, color: '#f59e0b', visible: true },
    ema200: { period: 200, color: '#ef4444', visible: false },
    sma: { period: 50, color: '#8b5cf6', visible: false },
    rsi: { period: 14, overbought: 70, oversold: 30, visible: true, color: '#8b5cf6' },
    macd: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        visible: false,
        macdColor: '#3b82f6',
        signalColor: '#ef4444',
        histogramColor: '#6b7280',
    },
    vwap: { visible: false, color: '#10b981' },
};

const defaultSRConfig: SRConfig = {
    visible: true,
    leftBars: 5,
    rightBars: 5,
    tolerance: 0.5,
    minStrength: 2,
    showSupport: true,
    showResistance: true,
};

export default function StockAnalysisView() {
    // State
    const [symbol, setSymbol] = useState('AAPL');
    const [timeframe, setTimeframe] = useState<Timeframe>('1d');
    const [indicators, setIndicators] = useState<IndicatorsConfig>(defaultIndicators);
    const [srConfig, setSRConfig] = useState<SRConfig>(defaultSRConfig);
    const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null);
    const [crosshairTime, setCrosshairTime] = useState<number | null>(null);

    // Refs
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<any>(null);

    // Generate sample data (replace with actual API call later)
    const data = useMemo(() => {
        const ohlcvData = generateRealisticOHLCV(symbol, 365, timeframe, 150, 0.2, 0.02);
        return ohlcvData.bars;
    }, [symbol, timeframe]);

    // Handle crosshair move
    const handleCrosshairMove = useCallback((price: number | null, time: number | null) => {
        setCrosshairPrice(price);
        setCrosshairTime(time);
    }, []);

    // Toggle indicator visibility
    const toggleIndicator = (indicator: keyof IndicatorsConfig) => {
        setIndicators((prev) => ({
            ...prev,
            [indicator]: {
                ...prev[indicator],
                visible: !prev[indicator].visible,
            },
        }));
    };

    return (
        <div className="stock-analysis-view p-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-4 bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{symbol}</h1>
                        <p className="text-sm text-gray-500">Stock Analysis</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Timeframe Selector */}
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1m">1 Minute</option>
                            <option value="5m">5 Minutes</option>
                            <option value="15m">15 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="4h">4 Hours</option>
                            <option value="1d">1 Day</option>
                            <option value="1w">1 Week</option>
                        </select>
                    </div>
                </div>

                {/* Crosshair Info */}
                {crosshairPrice && crosshairTime && (
                    <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Price: ${crosshairPrice.toFixed(2)}</span>
                        <span className="ml-4">
                            Time: {new Date(crosshairTime * 1000).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Main Chart Area */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="relative">
                    <CandlestickChart
                        data={data}
                        height={500}
                        onCrosshairMove={handleCrosshairMove}
                        chartRef={chartRef}
                        seriesRef={candlestickSeriesRef}
                    />

                    {/* Overlays (these don't render DOM, just add to chart) */}
                    <IndicatorOverlay
                        chartRef={chartRef}
                        data={data}
                        config={indicators}
                    />

                    <SupportResistance
                        chartRef={chartRef}
                        candlestickSeriesRef={candlestickSeriesRef}
                        data={data}
                        config={srConfig}
                    />
                </div>

                {/* RSI Pane */}
                <RSIPane
                    data={data}
                    config={indicators.rsi}
                />
            </div>

            {/* Control Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Indicators Panel */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-3">Technical Indicators</h3>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={indicators.ema20.visible}
                                onChange={() => toggleIndicator('ema20')}
                                className="w-4 h-4"
                            />
                            <span className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: indicators.ema20.color }}
                                />
                                EMA 20
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={indicators.ema50.visible}
                                onChange={() => toggleIndicator('ema50')}
                                className="w-4 h-4"
                            />
                            <span className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: indicators.ema50.color }}
                                />
                                EMA 50
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={indicators.ema200.visible}
                                onChange={() => toggleIndicator('ema200')}
                                className="w-4 h-4"
                            />
                            <span className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: indicators.ema200.color }}
                                />
                                EMA 200
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={indicators.vwap.visible}
                                onChange={() => toggleIndicator('vwap')}
                                className="w-4 h-4"
                            />
                            <span className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: indicators.vwap.color }}
                                />
                                VWAP
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={indicators.rsi.visible}
                                onChange={() => toggleIndicator('rsi')}
                                className="w-4 h-4"
                            />
                            <span className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: indicators.rsi.color }}
                                />
                                RSI ({indicators.rsi.period})
                            </span>
                        </label>
                    </div>
                </div>

                {/* Support & Resistance Panel */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-3">Support & Resistance</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={srConfig.visible}
                                onChange={() => setSRConfig({ ...srConfig, visible: !srConfig.visible })}
                                className="w-4 h-4"
                            />
                            <span>Show Levels</span>
                        </label>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sensitivity: {srConfig.leftBars}
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="10"
                                value={srConfig.leftBars}
                                onChange={(e) =>
                                    setSRConfig({
                                        ...srConfig,
                                        leftBars: parseInt(e.target.value),
                                        rightBars: parseInt(e.target.value),
                                    })
                                }
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Strength: {srConfig.minStrength}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={srConfig.minStrength}
                                onChange={(e) =>
                                    setSRConfig({ ...srConfig, minStrength: parseInt(e.target.value) })
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={srConfig.showSupport}
                                    onChange={() =>
                                        setSRConfig({ ...srConfig, showSupport: !srConfig.showSupport })
                                    }
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Support</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={srConfig.showResistance}
                                    onChange={() =>
                                        setSRConfig({ ...srConfig, showResistance: !srConfig.showResistance })
                                    }
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Resistance</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-3">Chart Info</h3>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="font-medium">Symbol:</span> {symbol}
                        </div>
                        <div>
                            <span className="font-medium">Timeframe:</span> {timeframe}
                        </div>
                        <div>
                            <span className="font-medium">Bars:</span> {data.length}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                            <p className="text-xs text-blue-800">
                                <strong>Note:</strong> This is a demo using generated sample data.
                                Connect to your backend API to load real market data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
