package com.prashant.application.dto.strategy;

public class TradeResult {
    private String type; // BUY or SELL
    private String entryDate;
    private double entryPrice;
    private String exitDate;
    private double exitPrice;
    private double profit;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(String entryDate) {
        this.entryDate = entryDate;
    }

    public double getEntryPrice() {
        return entryPrice;
    }

    public void setEntryPrice(double entryPrice) {
        this.entryPrice = entryPrice;
    }

    public String getExitDate() {
        return exitDate;
    }

    public void setExitDate(String exitDate) {
        this.exitDate = exitDate;
    }

    public double getExitPrice() {
        return exitPrice;
    }

    public void setExitPrice(double exitPrice) {
        this.exitPrice = exitPrice;
    }

    public double getProfit() {
        return profit;
    }

    public void setProfit(double profit) {
        this.profit = profit;
    }

    private String returnVal;

    public String getReturn() {
        return returnVal;
    }

    public void setReturn(String returnVal) {
        this.returnVal = returnVal;
    }
}
