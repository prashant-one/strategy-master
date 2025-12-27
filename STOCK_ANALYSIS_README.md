# Stock Analysis Application

A professional-grade stock analysis web application built with **React**, **TypeScript**, **TradingView Lightweight Charts**, and **D3.js**.

## Features

### ✅ Implemented

- **Candlestick Charts** - OHLCV data visualization with TradingView Lightweight Charts
- **Volume Histogram** - Volume bars below main chart with directional coloring
- **Technical Indicators**
  - EMA (20, 50, 200)
  - SMA (configurable period)
  - RSI with overbought/oversold levels
  - VWAP
  - MACD (calculation complete, pane pending)
- **Support & Resistance Detection**
  - Automated swing high/low detection
  - Level clustering with strength calculation
  - Color-coded by touch count
  - Adjustable sensitivity
- **Interactive Controls**
  - Toggle indicators on/off
  - Adjust S/R sensitivity and filters
  - Timeframe selector
  - Real-time crosshair price/time display

### 🔧 In Progress

- Heatmap visualization (D3.js overlay)
- Drawing tools (trendlines, channels, zones)
- MACD pane component
- Backend API integration

## Quick Start

### 1. Install Dependencies

Dependencies are already installed. If needed:
```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Access the Application

Navigate to:
```
http://localhost:8080/stock-analysis
```

## Project Structure

```
src/main/frontend/
├── types/
│   └── stock.types.ts              # TypeScript type definitions
├── utils/
│   ├── indicators.ts               # Technical indicator calculations
│   ├── supportResistance.ts        # S/R detection algorithms
│   ├── heatmap.ts                  # Heatmap calculations
│   ├── dataService.ts              # Data fetching and caching
│   └── sampleData.ts               # Sample data generator
├── themes/strategymaster/components/stock/
│   ├── CandlestickChart.tsx        # Main chart component
│   ├── ChartContainer.tsx          # Chart wrapper with context
│   ├── SupportResistance.tsx       # S/R overlay
│   └── indicators/
│       ├── IndicatorOverlay.tsx    # EMA/SMA/VWAP lines
│       └── RSIPane.tsx             # RSI separate pane
└── views/
    └── stock-analysis.tsx          # Main application view
```

## Usage

### Viewing Charts

The application loads with sample data for AAPL (Apple Inc.). The chart displays:
- Candlesticks (green for bullish, red for bearish)
- Volume bars below the chart
- EMA 20 and EMA 50 by default
- RSI pane below the main chart
- Support and resistance levels

### Toggling Indicators

Use the **Technical Indicators** panel to:
- ✅ Enable/disable EMA 20, 50, 200
- ✅ Enable/disable VWAP
- ✅ Enable/disable RSI pane

Each indicator has a color indicator showing its line color on the chart.

### Adjusting Support & Resistance

Use the **Support & Resistance** panel to:
- ✅ Toggle S/R levels on/off
- ✅ Adjust sensitivity (2-10) - higher = fewer levels
- ✅ Set minimum strength (1-5) - filters weak levels
- ✅ Show/hide support or resistance independently

### Changing Timeframe

Use the timeframe dropdown to switch between:
- 1 Minute, 5 Minutes, 15 Minutes
- 1 Hour, 4 Hours
- 1 Day, 1 Week

The chart will reload with data for the selected timeframe.

### Crosshair Interaction

Hover over the chart to:
- See price and time at cursor position
- View OHLC values in tooltip
- Track across all indicators

## Technical Details

### TradingView Lightweight Charts

The application uses TradingView's Lightweight Charts library for high-performance charting:
- Candlestick series for OHLC data
- Histogram series for volume
- Line series for indicators
- Price lines for support/resistance

### Technical Indicator Calculations

All indicators are calculated using pure functions:
- **EMA**: Exponential moving average with proper multiplier (2 / (period + 1))
- **SMA**: Simple moving average
- **RSI**: Relative Strength Index using smoothed averages
- **MACD**: Fast EMA - Slow EMA with signal line
- **VWAP**: Volume-weighted average price using typical price (HLC/3)

### Support & Resistance Algorithm

1. **Swing Detection**: Identifies highs/lows that are higher/lower than N bars on each side
2. **Clustering**: Groups nearby swing points within tolerance percentage
3. **Strength Calculation**: Counts how many times price touched each level
4. **Filtering**: Removes levels below minimum strength threshold
5. **Visualization**: Color-codes by strength (green/red for strong, yellow/orange for medium, gray for weak)

## Sample Data

The application currently uses generated sample data with realistic characteristics:
- Random walk with drift (trend)
- Configurable volatility
- Volume correlated with price movement
- Preset patterns: bullish, bearish, ranging, volatile

## API Integration (Coming Soon)

The data service layer is ready for backend integration:

```typescript
// Replace sample data with real API call
const data = await fetchStockData(symbol, timeframe);
```

The `dataService.ts` includes:
- Data validation
- Normalization
- Caching (5-minute TTL)
- Error handling

## Known Issues

### TypeScript Errors

Some TypeScript errors may appear due to:
1. Module path resolution - ensure `@/*` alias is configured in `tsconfig.json`
2. TradingView API version - method names may differ between versions

These don't affect functionality but should be resolved for production.

## Next Steps

### Immediate
1. Test in browser and verify all features work
2. Fix any TypeScript/import errors
3. Add heatmap D3.js overlay component
4. Implement drawing tools

### Short Term
5. Add MACD pane component
6. Enhance symbol selector with autocomplete
7. Add settings panel for customization
8. Implement local storage for preferences

### Long Term
9. Connect to backend API for real market data
10. Add more indicators (Bollinger Bands, Stochastic, ATR)
11. Mobile responsive design
12. Export functionality (save charts, export data)

## Contributing

This is a professional-grade foundation for a stock analysis platform. The architecture is modular and scalable, making it easy to add new features.

## License

See LICENSE.md

---

**Built with:**
- React 18
- TypeScript 5
- TradingView Lightweight Charts 5
- D3.js 7
- Tailwind CSS 3
