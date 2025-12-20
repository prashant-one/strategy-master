# 🚀 StrategyMaster: Advanced Visual Trading Strategy Builder

StrategyMaster is a powerful, web-based platform designed for traders to build, test, and refine algorithmic trading strategies without writing code. Leveraging the robust `ta4j` library and a modern stack (Vaadin Hilla, Spring Boot, React), it provides a seamless experience from strategy conception to backtest analysis.

![App Screenshot](file:///Users/prashantkushwaha/IdeaProjects/strategymaster/src/main/resources/static/screenshots/main_app.png) 
*(Note: Replace with actual screenshot path if available)*

## ✨ Key Features

### 🛠️ Visual Strategy Builder
- **Deep Nesting**: Create complex strategies with nested rule groups.
- **Independent Logic Gates**: Mix `AND` and `OR` conditions at any level for precise entry/exit logic.
- **Dynamic Parameters**: Configure period, multiplier, and other indicator parameters on the fly.

### 📈 Technical Indicators (70+)
Comprehensive support for a wide range of indicators:
- **Trend**: SMA, EMA, WMA, HMA, ADX, Parabolic SAR, etc.
- **Momentum**: RSI, MACD, Stochastic, CCI, ROC, Williams %R, etc.
- **Volatility**: Bollinger Bands, Keltner Channels, ATR, Standard Deviation.
- **Volume**: VWAP, OBV, Volume SMA, Money Flow Index (MFI).
- **Price Helpers**: High/Low/Open price indicators for comparison.

### 🧪 Professional Backtesting
- **Real-time Data**: Integrated with Yahoo Finance for 1-day interval historical data.
- **Performance Metrics**: Detailed results including Total Trades, Win Rate, Profit/Loss, and Return on Capital.
- **Equity Curve**: Visual representation of your strategy's performance over time.
- **Trade Logs**: Granular logs of every entry and exit point.

### � Performance & Persistence
- **H2 Local Database**: All strategies are saved locally in a file-based database.
- **Pagination & Sorting**: Efficiently manage hundreds of strategies with built-in pagination, always sorted by the latest changes.
- **Import/Export**: Share your strategies as JSON files or back them up easily.

## 🚀 Getting Started

### Prerequisites
- Java 21
- Maven 3.9+
- Node.js 20+

### Installation & Running
1. Clone the repository.
2. Build and run the application:
   ```bash
   mvn spring-boot:run
   ```
3. Open your browser and navigate to `http://localhost:8080`.

## 🛠️ Technology Stack
- **Backend**: Spring Boot, Spring Data JPA, H2 Database.
- **Frontend**: Vaadin Hilla (React + TypeScript), Tailwind CSS.
- **Trading Logic**: [ta4j](https://github.com/ta4j/ta4j) - Technical Analysis for Java.
- **Icons**: Lucide React / Line Awesome.
