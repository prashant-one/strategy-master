package com.prashant.application.broker;

import java.time.LocalDate;

public record StockDataRecord(LocalDate timeStamp, Double high, Double low, Double open, Double close, Double adjClose,
        Double volume) {
}
