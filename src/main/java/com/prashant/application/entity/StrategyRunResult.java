package com.prashant.application.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class StrategyRunResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String strategyId;
    private String strategyName;
    private String symbol;
    private String rangeParam;
    private String intervalParam;

    private double profitLoss;
    private int totalTrades;
    private double winRate;

    private LocalDateTime ranAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStrategyId() {
        return strategyId;
    }

    public void setStrategyId(String strategyId) {
        this.strategyId = strategyId;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public void setStrategyName(String strategyName) {
        this.strategyName = strategyName;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getRangeParam() {
        return rangeParam;
    }

    public void setRangeParam(String rangeParam) {
        this.rangeParam = rangeParam;
    }

    public String getIntervalParam() {
        return intervalParam;
    }

    public void setIntervalParam(String intervalParam) {
        this.intervalParam = intervalParam;
    }

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

    public double getWinRate() {
        return winRate;
    }

    public void setWinRate(double winRate) {
        this.winRate = winRate;
    }

    public LocalDateTime getRanAt() {
        return ranAt;
    }

    public void setRanAt(LocalDateTime ranAt) {
        this.ranAt = ranAt;
    }
}
