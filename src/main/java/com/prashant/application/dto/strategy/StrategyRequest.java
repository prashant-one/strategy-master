package com.prashant.application.dto.strategy;

public class StrategyRequest {
    private String stockSymbol;
    private String range;
    private String interval;
    private RulesConfig entry;
    private RulesConfig exit;

    public String getStockSymbol() {
        return stockSymbol;
    }

    public void setStockSymbol(String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }

    public RulesConfig getEntry() {
        return entry;
    }

    public void setEntry(RulesConfig entry) {
        this.entry = entry;
    }

    public RulesConfig getExit() {
        return exit;
    }

    public void setExit(RulesConfig exit) {
        this.exit = exit;
    }
}
