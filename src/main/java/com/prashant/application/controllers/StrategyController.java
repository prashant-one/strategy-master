package com.prashant.application.controllers;

import com.prashant.application.dto.strategy.BacktestResult;
import com.prashant.application.dto.strategy.StrategyRequest;
import com.prashant.application.services.BacktestService;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@BrowserCallable
@AnonymousAllowed
public class StrategyController {

    private final BacktestService backtestService;

    public StrategyController(BacktestService backtestService) {
        this.backtestService = backtestService;
    }

    public BacktestResult runBacktest(StrategyRequest request) {
        return backtestService.runBacktest(request);
    }
}
