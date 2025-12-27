/**
 * RSIPane Component
 * Separate chart pane for RSI indicator with overbought/oversold levels
 */

import React, { useEffect, useRef } from 'react';
import {
    createChart,
    IChartApi,
    ISeriesApi,
    LineData,
    Time,
    LineSeries,
} from 'lightweight-charts';
import type { OHLCVBar, RSIConfig } from '../../../../../types/stock.types';
import { calculateRSI } from '../../../../../utils/indicators';

interface RSIPaneProps {
    data: OHLCVBar[];
    config: RSIConfig;
    height?: number;
}

export const RSIPane: React.FC<RSIPaneProps> = ({
    data,
    config,
    height = 150,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiSeriesRef = useRef<any>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Initialize RSI chart
    useEffect(() => {
        if (!containerRef.current || !config.visible) return;

        // Create chart
        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: height,
            layout: {
                background: { color: '#ffffff' },
                textColor: '#191919',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
            },
            rightPriceScale: {
                borderColor: '#f0f0f0',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: '#f0f0f0',
                visible: false, // Hide time scale (synced with main chart)
            },
        });

        chartRef.current = chart;

        // Add RSI line series
        const rsiSeries = chart.addSeries(LineSeries, {
            color: config.color,
            lineWidth: 2,
            title: `RSI (${config.period})`,
        });

        rsiSeriesRef.current = rsiSeries;

        // Add overbought level (70)
        rsiSeries.createPriceLine({
            price: config.overbought,
            color: '#ef4444',
            lineWidth: 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: 'Overbought',
        });

        // Add oversold level (30)
        rsiSeries.createPriceLine({
            price: config.oversold,
            color: '#22c55e',
            lineWidth: 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: 'Oversold',
        });

        // Add middle level (50)
        rsiSeries.createPriceLine({
            price: 50,
            color: '#6b7280',
            lineWidth: 1,
            lineStyle: 3, // Dotted
            axisLabelVisible: false,
        });

        // Setup resize observer
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length === 0 || !chartRef.current) return;
            const { width } = entries[0].contentRect;
            chartRef.current.applyOptions({ width });
        });

        resizeObserver.observe(containerRef.current);
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
    }, [config.visible, config.period, config.overbought, config.oversold, config.color, height]);

    // Update RSI data
    useEffect(() => {
        if (!rsiSeriesRef.current || data.length === 0 || !config.visible) return;

        // Calculate RSI
        const rsiData = calculateRSI(data, config.period);

        // Convert to LineData format
        const lineData: LineData[] = rsiData.map((point) => ({
            time: point.time as Time,
            value: point.value,
        }));

        // Set data
        rsiSeriesRef.current.setData(lineData);

        // Fit content
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    }, [data, config.period, config.visible]);

    if (!config.visible) {
        return null;
    }

    return (
        <div className="rsi-pane mt-2">
            <div className="text-sm font-medium mb-1 px-2">RSI ({config.period})</div>
            <div
                ref={containerRef}
                className="relative w-full border border-gray-200 rounded"
                style={{ height: `${height}px` }}
            />
        </div>
    );
};

export default RSIPane;
