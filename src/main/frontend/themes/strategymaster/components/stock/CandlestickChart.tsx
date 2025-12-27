/**
 * CandlestickChart Component
 * Main chart component using TradingView Lightweight Charts
 * Displays OHLCV candlestick data with volume bars
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    createChart,
    IChartApi,
    ISeriesApi,
    CandlestickData,
    HistogramData,
    Time,
    CrosshairMode,
    CandlestickSeries,
    HistogramSeries,
} from 'lightweight-charts';
import type { OHLCVBar, ChartTheme } from '../../../../types/stock.types';

interface CandlestickChartProps {
    data: OHLCVBar[];
    height?: number;
    theme?: ChartTheme;
    onCrosshairMove?: (price: number | null, time: number | null) => void;
    chartRef?: React.MutableRefObject<IChartApi | null>;
    seriesRef?: React.MutableRefObject<any>;
}

const defaultTheme: ChartTheme = {
    backgroundColor: '#ffffff',
    textColor: '#191919',
    gridColor: '#f0f0f0',
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderUpColor: '#22c55e',
    borderDownColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    data,
    height = 500,
    theme = defaultTheme,
    onCrosshairMove,
    chartRef: externalChartRef,
    seriesRef: externalSeriesRef,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<any>(null);
    const volumeSeriesRef = useRef<any>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart instance
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: height,
            layout: {
                background: { color: theme.backgroundColor },
                textColor: theme.textColor,
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: theme.gridColor },
                horzLines: { color: theme.gridColor },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: theme.gridColor,
            },
            timeScale: {
                borderColor: theme.gridColor,
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        // Add candlestick series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: theme.upColor,
            downColor: theme.downColor,
            borderUpColor: theme.borderUpColor,
            borderDownColor: theme.borderDownColor,
            wickUpColor: theme.wickUpColor,
            wickDownColor: theme.wickDownColor,
        });

        candlestickSeriesRef.current = candlestickSeries;

        // Populate external refs if provided
        if (externalChartRef) {
            externalChartRef.current = chart;
        }
        if (externalSeriesRef) {
            externalSeriesRef.current = candlestickSeries;
        }

        // Add volume series
        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '', // Create separate price scale for volume
        });

        // Position volume series below main chart
        chart.priceScale('').applyOptions({
            scaleMargins: {
                top: 0.8, // Volume takes bottom 20%
                bottom: 0,
            },
        });

        volumeSeriesRef.current = volumeSeries;

        // Subscribe to crosshair move events
        chart.subscribeCrosshairMove((param) => {
            if (onCrosshairMove) {
                if (param.time && param.seriesData.size > 0) {
                    const candleData = param.seriesData.get(candlestickSeries) as CandlestickData | undefined;
                    if (candleData) {
                        onCrosshairMove(candleData.close, param.time as number);
                    }
                } else {
                    onCrosshairMove(null, null);
                }
            }
        });

        // Setup resize observer
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length === 0 || !chartRef.current) return;
            const { width } = entries[0].contentRect;
            chartRef.current.applyOptions({ width });
        });

        resizeObserver.observe(chartContainerRef.current);
        resizeObserverRef.current = resizeObserver;

        // Cleanup
        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [height, theme]); // Removed onCrosshairMove from dependencies

    // Update data when it changes
    useEffect(() => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current || data.length === 0) {
            return;
        }

        // Convert OHLCV data to TradingView format
        const candleData: CandlestickData[] = data.map((bar) => ({
            time: bar.time as Time,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
        }));

        // Convert volume data with color based on price direction
        const volumeData: HistogramData[] = data.map((bar) => ({
            time: bar.time as Time,
            value: bar.volume,
            color: bar.close >= bar.open ? theme.upColor + '80' : theme.downColor + '80', // Add transparency
        }));

        // Set data
        candlestickSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        // Fit content to visible range
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    }, [data, theme]);

    return (
        <div
            ref={chartContainerRef}
            className="relative w-full"
            style={{ height: `${height}px` }}
        />
    );
};

export default CandlestickChart;
