package com.prashant.application.services;

import com.prashant.application.dto.strategy.BacktestResult;
import com.prashant.application.dto.strategy.StrategyRequest;
import com.prashant.application.dto.strategy.TradeResult;
import org.springframework.stereotype.Service;
import org.ta4j.core.*;
import org.ta4j.core.BarSeries;
import org.ta4j.core.backtest.BarSeriesManager;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class BacktestService {

    private final StrategyParserService strategyParserService;

    public BacktestService(StrategyParserService strategyParserService) {
        this.strategyParserService = strategyParserService;
    }

    public BacktestResult runBacktest(StrategyRequest request) {
        // 1. Generate Mock Data
        BarSeries series = generateMockSeries();

        // 2. Parse Strategy
        Strategy strategy = strategyParserService.parse(request, series);

        // 3. Run Backtest
        BarSeriesManager seriesManager = new BarSeriesManager(series);
        TradingRecord tradingRecord = seriesManager.run(strategy);

        // 4. Build Result
        return buildResult(series, tradingRecord);
    }

    private BacktestResult buildResult(BarSeries series, TradingRecord tradingRecord) {
        BacktestResult result = new BacktestResult();

        // Calculate basic stats
        // Note: ta4j 0.14+ uses Criteria for calculations usually, keeping it simple
        // here
        result.setTotalTrades(tradingRecord.getPositionCount());

        int winning = 0;
        int losing = 0;
        double totalProfit = 0;

        // Calculate manually to fill trade details list
        for (Position position : tradingRecord.getPositions()) {

            // Simplified PnL calculation: (Exit - Entry)

            double entryPrice = position.getEntry().getNetPrice().doubleValue();
            double exitPrice = position.getExit().getNetPrice().doubleValue();
            // Assuming Long only for now
            double tradeProfit = exitPrice - entryPrice; // Simplified absolute profit per share

            if (tradeProfit > 0)
                winning++;
            else
                losing++;

            totalProfit += tradeProfit;

            TradeResult tr = new TradeResult();
            tr.setType(position.getEntry().getType().toString());
            tr.setEntryPrice(entryPrice);
            tr.setExitPrice(exitPrice);
            tr.setProfit(tradeProfit);
            double returnPct = (entryPrice != 0) ? (tradeProfit / entryPrice) * 100 : 0.0;
            tr.setReturn(String.format("%.2f", returnPct));
            // Dates
            tr.setEntryDate(series.getBar(position.getEntry().getIndex()).getEndTime().toString());
            tr.setExitDate(series.getBar(position.getExit().getIndex()).getEndTime().toString());

            result.getTrades().add(tr);
        }

        result.setWinningTrades(winning);
        result.setLosingTrades(losing);
        result.setProfitLoss(totalProfit);
        if (result.getTotalTrades() > 0) {
            result.setWinRate((double) winning / result.getTotalTrades() * 100);
        }

        // Mock additional metrics to satisfy frontend
        result.setMaxDrawdown(12.5);
        result.setSharpeRatio(1.8);

        // Generate dummy equity curve
        List<Map<String, Object>> equityCurve = new ArrayList<>();
        double equity = 100000; // Start capital
        for (int i = 0; i < series.getBarCount(); i++) {
            // Add random noise + trend based on profit
            equity += (totalProfit / series.getBarCount()) + (Math.random() - 0.5) * 200;
            Map<String, Object> point = new HashMap<>();
            point.put("day", i + 1);
            point.put("value", equity);
            // Simple date format
            point.put("date",
                    series.getBar(i).getEndTime().atZone(ZoneId.systemDefault()).getMonth().name().substring(0, 3) + " "
                            + series.getBar(i).getEndTime().atZone(ZoneId.systemDefault()).getDayOfMonth());
            equityCurve.add(point);
        }
        result.setEquityCurve(equityCurve);

        return result;
    }

    private BarSeries generateMockSeries() {
        BarSeries series = new BaseBarSeriesBuilder().withName("mock_data").build();
        ZonedDateTime endTime = ZonedDateTime.now(ZoneId.of("UTC"));
        double price = 100.0;
        Random random = new Random();

        for (int i = 0; i < 200; i++) {
            price = price + (random.nextDouble() - 0.5) * 5; // Random walk
            if (price < 10)
                price = 10; // Floor

            // Simple OHLC generation
            double open = price;
            double close = price + (random.nextDouble() - 0.5) * 2;
            double high = Math.max(open, close) + random.nextDouble();
            double low = Math.min(open, close) - random.nextDouble();
            double volume = 1000 + random.nextInt(500);

            // series.addBar(endTime.minusDays(200 - i), open, high, low, close, volume);
            // ta4j 0.22 uses Duration/ZonedDateTime for addBar
            series.barBuilder()
                    .timePeriod(java.time.Duration.ofDays(1))
                    .endTime(endTime.minusDays(200 - i).toInstant())
                    .openPrice(open)
                    .highPrice(high)
                    .lowPrice(low)
                    .closePrice(close)
                    .volume(volume)
                    .amount(0)
                    .add();
        }
        return series;
    }
}
