/**
 * ChartContainer Component
 * Wrapper component that manages chart lifecycle and provides context
 */

import React, { createContext, useContext, useRef } from 'react';
import { IChartApi } from 'lightweight-charts';

interface ChartContextValue {
    chartRef: React.MutableRefObject<IChartApi | null>;
}

const ChartContext = createContext<ChartContextValue | null>(null);

export const useChartContext = () => {
    const context = useContext(ChartContext);
    if (!context) {
        throw new Error('useChartContext must be used within ChartContainer');
    }
    return context;
};

interface ChartContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
    children,
    className = '',
}) => {
    const chartRef = useRef<IChartApi | null>(null);

    return (
        <ChartContext.Provider value={{ chartRef }}>
            <div className={`chart-container ${className}`}>
                {children}
            </div>
        </ChartContext.Provider>
    );
};

export default ChartContainer;
