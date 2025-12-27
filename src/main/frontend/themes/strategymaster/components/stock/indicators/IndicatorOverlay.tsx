/**
 * IndicatorOverlay Component
 * Renders technical indicators (EMA, SMA, VWAP) as line series on the main chart
 */

import React, { useEffect, useRef } from 'react';
import { IChartApi, ISeriesApi, LineData, Time, LineSeries } from 'lightweight-charts';
import type { OHLCVBar, IndicatorsConfig, MovingAveragePoint } from '../../../../../types/stock.types';
import { calculateEMA, calculateSMA, calculateVWAP } from '../../../../../utils/indicators';

interface IndicatorOverlayProps {
    chartRef: React.MutableRefObject<IChartApi | null>;
    data: OHLCVBar[];
    config: IndicatorsConfig;
}

export const IndicatorOverlay: React.FC<IndicatorOverlayProps> = ({
    chartRef,
    data,
    config,
}) => {
    const ema20SeriesRef = useRef<any>(null);
    const ema50SeriesRef = useRef<any>(null);
    const ema200SeriesRef = useRef<any>(null);
    const smaSeriesRef = useRef<any>(null);
    const vwapSeriesRef = useRef<any>(null);

    // Initialize indicator series
    useEffect(() => {
        if (!chartRef.current) return;

        const chart = chartRef.current;

        // Create EMA 20 series
        if (config.ema20.visible && !ema20SeriesRef.current) {
            ema20SeriesRef.current = chart.addSeries(LineSeries, {
                color: config.ema20.color,
                lineWidth: 2,
                title: 'EMA 20',
            });
        }

        // Create EMA 50 series
        if (config.ema50.visible && !ema50SeriesRef.current) {
            ema50SeriesRef.current = chart.addSeries(LineSeries, {
                color: config.ema50.color,
                lineWidth: 2,
                title: 'EMA 50',
            });
        }

        // Create EMA 200 series
        if (config.ema200.visible && !ema200SeriesRef.current) {
            ema200SeriesRef.current = chart.addSeries(LineSeries, {
                color: config.ema200.color,
                lineWidth: 2,
                title: 'EMA 200',
            });
        }

        // Create SMA series
        if (config.sma.visible && !smaSeriesRef.current) {
            smaSeriesRef.current = chart.addSeries(LineSeries, {
                color: config.sma.color,
                lineWidth: 2,
                lineStyle: 2, // Dashed line
                title: `SMA ${config.sma.period}`,
            });
        }

        // Create VWAP series
        if (config.vwap.visible && !vwapSeriesRef.current) {
            vwapSeriesRef.current = chart.addSeries(LineSeries, {
                color: config.vwap.color,
                lineWidth: 2,
                lineStyle: 3, // Dotted line
                title: 'VWAP',
            });
        }

        // Cleanup function
        return () => {
            // Only cleanup if chart still exists
            if (!chartRef.current) return;

            const chart = chartRef.current;

            if (ema20SeriesRef.current) {
                try {
                    chart.removeSeries(ema20SeriesRef.current);
                } catch (e) {
                    // Series may have already been removed
                }
                ema20SeriesRef.current = null;
            }
            if (ema50SeriesRef.current) {
                try {
                    chart.removeSeries(ema50SeriesRef.current);
                } catch (e) {
                    // Series may have already been removed
                }
                ema50SeriesRef.current = null;
            }
            if (ema200SeriesRef.current) {
                try {
                    chart.removeSeries(ema200SeriesRef.current);
                } catch (e) {
                    // Series may have already been removed
                }
                ema200SeriesRef.current = null;
            }
            if (smaSeriesRef.current) {
                try {
                    chart.removeSeries(smaSeriesRef.current);
                } catch (e) {
                    // Series may have already been removed
                }
                smaSeriesRef.current = null;
            }
            if (vwapSeriesRef.current) {
                try {
                    chart.removeSeries(vwapSeriesRef.current);
                } catch (e) {
                    // Series may have already been removed
                }
                vwapSeriesRef.current = null;
            }
        };
    }, [chartRef, config]);

    // Update indicator data
    useEffect(() => {
        if (data.length === 0) return;

        // Helper to convert to LineData
        const toLineData = (points: MovingAveragePoint[]): LineData[] =>
            points.map((p) => ({ time: p.time as Time, value: p.value }));

        // Update EMA 20
        if (config.ema20.visible && ema20SeriesRef.current) {
            const ema20Data = calculateEMA(data, config.ema20.period);
            ema20SeriesRef.current.setData(toLineData(ema20Data));
        }

        // Update EMA 50
        if (config.ema50.visible && ema50SeriesRef.current) {
            const ema50Data = calculateEMA(data, config.ema50.period);
            ema50SeriesRef.current.setData(toLineData(ema50Data));
        }

        // Update EMA 200
        if (config.ema200.visible && ema200SeriesRef.current) {
            const ema200Data = calculateEMA(data, config.ema200.period);
            ema200SeriesRef.current.setData(toLineData(ema200Data));
        }

        // Update SMA
        if (config.sma.visible && smaSeriesRef.current) {
            const smaData = calculateSMA(data, config.sma.period);
            smaSeriesRef.current.setData(toLineData(smaData));
        }

        // Update VWAP
        if (config.vwap.visible && vwapSeriesRef.current) {
            const vwapData = calculateVWAP(data);
            vwapSeriesRef.current.setData(toLineData(vwapData));
        }
    }, [data, config]);

    // Handle visibility changes
    useEffect(() => {
        if (ema20SeriesRef.current) {
            ema20SeriesRef.current.applyOptions({
                visible: config.ema20.visible,
                color: config.ema20.color,
            });
        }
        if (ema50SeriesRef.current) {
            ema50SeriesRef.current.applyOptions({
                visible: config.ema50.visible,
                color: config.ema50.color,
            });
        }
        if (ema200SeriesRef.current) {
            ema200SeriesRef.current.applyOptions({
                visible: config.ema200.visible,
                color: config.ema200.color,
            });
        }
        if (smaSeriesRef.current) {
            smaSeriesRef.current.applyOptions({
                visible: config.sma.visible,
                color: config.sma.color,
            });
        }
        if (vwapSeriesRef.current) {
            vwapSeriesRef.current.applyOptions({
                visible: config.vwap.visible,
                color: config.vwap.color,
            });
        }
    }, [config]);

    return null; // This component doesn't render anything directly
};

export default IndicatorOverlay;
