# AssetMaster 🚀

AssetMaster is a powerful, modern platform for building, backtesting, and analyzing algorithmic trading strategies. Built with Spring Boot and Hilla (React), it provides a seamless interface to turn trading ideas into verifiable results using real-market data.

## ✨ Key Features

- **Dynamic Strategy Builder**: Build complex entry and exit rules using technical indicators (SMA, EMA, RSI, etc.) and price action.
- **Yahoo Finance Integration**: Fetch real historical data for stocks (e.g., TCS.NS, NIFTY) across various timeframes and intervals.
- **Backtesting Engine**: Powered by the robust `ta4j` library to provide accurate performance analysis.
- **Visual Analytics**: 
  - **Equity Curve**: Interactive charts showing capital growth over time.
  - **Performance Metrics**: Win rate, Total Profit/Loss, Sharpe Ratio, and Drawdown.
  - **Trade Breakdown**: Detailed view of winning vs. losing trades.
- **Strategy Management**: 
  - **DSL Preview**: View your strategy in a custom Domain Specific Language or JSON format.
  - **Import/Export**: Save and load strategies locally.
  - **Cloud Sync**: Save strategies to your account for access anywhere.

## 🛠 Technology Stack

- **Backend**: Java, Spring Boot, Spring Web, Maven.
- **Quant Library**: [ta4j](https://github.com/ta4j/ta4j) (Technical Analysis library for Java).
- **Frontend**: 
  - [Hilla](https://hilla.dev/) (React + Spring Boot integration).
  - [Tailwind CSS](https://tailwindcss.com/) for a modern, high-contrast card-style UI.
  - [Motion](https://motion.dev/) for smooth animations.
  - [Recharts](https://recharts.org/) for data visualization.
  - [Lucide React](https://lucide.dev/) for beautiful iconography.

## 🚀 Getting Started

### Prerequisites

- Java 17 or later.
- Maven 3.6+.

### Running the application

1. Clone the repository.
2. Run the application using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Open [http://localhost:8080](http://localhost:8080) in your browser.

### Creating a Production Build

To create an optimized production JAR:
```bash
./mvnw clean package -Pproduction
```
The resulting JAR will be available in the `target/` directory.

## 🎨 UI & Design

AssetMaster features a premium "Card-Style" UI characterized by:
- **High Contrast**: Dark borders (`slate-400`) and 2px border widths for clear definition.
- **Clean Aesthetics**: A soft `#F4F7FB` background that minimizes eye strain.
- **Responsiveness**: Fully functional on desktop and mobile browsers.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

