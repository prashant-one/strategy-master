/**
 * SupportResistance Component
 * Renders support and resistance levels as horizontal lines on the chart
 */

import React, { useEffect, useRef } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import type { OHLCVBar, SRConfig } from '../../../../types/stock.types';
import {
    detectSwingPoints,
    calculateLevels,
    filterSignificantLevels,
    getSupportLevels,
    getResistanceLevels,
} from '../../../../utils/supportResistance';

interface SupportResistanceProps {
    chartRef: React.MutableRefObject<IChartApi | null>;
    candlestickSeriesRef: React.MutableRefObject<any>;
    data: OHLCVBar[];
    config: SRConfig;
}

export const SupportResistance: React.FC<SupportResistanceProps> = ({
    chartRef,
    candlestickSeriesRef,
    data,
    config,
}) => {
    const priceLinesRef = useRef<any[]>([]);

    // Calculate and render support/resistance levels
    useEffect(() => {
        if (!chartRef.current || !candlestickSeriesRef.current || !config.visible || data.length === 0) {
            return;
        }

        const chart = chartRef.current;
        const series = candlestickSeriesRef.current;

        // Remove existing price lines
        priceLinesRef.current.forEach((line) => {
            try {
                series.removePriceLine(line);
            } catch (e) {
                // Price line may have already been removed
            }
        });
        priceLinesRef.current = [];

        // Detect swing points
        const swingPoints = detectSwingPoints(data, config.leftBars, config.rightBars);

        // Calculate levels
        let levels = calculateLevels(swingPoints, config.tolerance);

        // Filter by minimum strength
        levels = filterSignificantLevels(levels, config.minStrength);

        // Filter by type if needed
        if (!config.showSupport) {
            levels = getResistanceLevels(levels);
        }
        if (!config.showResistance) {
            levels = getSupportLevels(levels);
        }

        // Add price lines for each level
        levels.forEach((level) => {
            const priceLine = series.createPriceLine({
                price: level.price,
                color: level.color,
                lineWidth: level.strength >= 5 ? 2 : 1,
                lineStyle: level.strength >= 3 ? 0 : 2, // Solid for strong, dashed for weak
                axisLabelVisible: true,
                title: `${level.type === 'support' ? 'S' : 'R'} (${level.strength})`,
            });

            priceLinesRef.current.push(priceLine);
        });

        // Cleanup function
        return () => {
            priceLinesRef.current.forEach((line) => {
                try {
                    series.removePriceLine(line);
                } catch (e) {
                    // Ignore errors during cleanup
                }
            });
            priceLinesRef.current = [];
        };
    }, [chartRef, candlestickSeriesRef, data, config]);

    return null; // This component doesn't render anything directly
};

export default SupportResistance;
