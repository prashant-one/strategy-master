package com.prashant.application.dto.strategy;

import java.util.ArrayList;
import java.util.List;

public class BacktestResult {
    private double profitLoss;
    private int totalTrades;
    private int winningTrades;
    private int losingTrades;
    private double winRate;
    private double maxDrawdown;
    private double sharpeRatio;
    private List<java.util.Map<String, Object>> equityCurve;
    private List<TradeResult> trades = new ArrayList<>();

    public double getProfitLoss() {
        return profitLoss;
    }

    public void setProfitLoss(double profitLoss) {
        this.profitLoss = profitLoss;
    }

    public int getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(int totalTrades) {
        this.totalTrades = totalTrades;
    }

    public int getWinningTrades() {
        return winningTrades;
    }

    public void setWinningTrades(int winningTrades) {
        this.winningTrades = winningTrades;
    }

    public int getLosingTrades() {
        return losingTrades;
    }

    public void setLosingTrades(int losingTrades) {
        this.losingTrades = losingTrades;
    }

    public double getWinRate() {
        return winRate;
    }

    public void setWinRate(double winRate) {
        this.winRate = winRate;
    }

    public double getMaxDrawdown() {
        return maxDrawdown;
    }

    public void setMaxDrawdown(double maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
    }

    public double getSharpeRatio() {
        return sharpeRatio;
    }

    public void setSharpeRatio(double sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }

    public List<java.util.Map<String, Object>> getEquityCurve() {
        return equityCurve;
    }

    public void setEquityCurve(List<java.util.Map<String, Object>> equityCurve) {
        this.equityCurve = equityCurve;
    }

    public List<TradeResult> getTrades() {
        return trades;
    }

    public void setTrades(List<TradeResult> trades) {
        this.trades = trades;
    }
}
