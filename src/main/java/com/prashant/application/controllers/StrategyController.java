package com.prashant.application.controllers;

import com.prashant.application.dto.strategy.BacktestResult;
import com.prashant.application.dto.strategy.StrategyRequest;
import com.prashant.application.entity.SavedStrategy;
import com.prashant.application.repository.StrategyRepository;
import com.prashant.application.services.BacktestService;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@BrowserCallable
@AnonymousAllowed
public class StrategyController {

    private final BacktestService backtestService;
    private final StrategyRepository strategyRepository;

    public StrategyController(BacktestService backtestService, StrategyRepository strategyRepository) {
        this.backtestService = backtestService;
        this.strategyRepository = strategyRepository;
    }

    public SavedStrategy getStrategy(String id) {
        return strategyRepository.findById(id).orElse(null);
    }

    public java.util.List<SavedStrategy> getSavedStrategies() {
        return strategyRepository.findAll();
    }

    public SavedStrategy saveStrategy(SavedStrategy strategy) {
        if (strategy.getSavedAt() == null) {
            strategy.setSavedAt(java.time.LocalDateTime.now());
        }
        return strategyRepository.save(strategy);
    }

    public void deleteStrategy(String id) {
        strategyRepository.deleteById(id);
    }

    public BacktestResult runBacktest(StrategyRequest request) {
        return backtestService.runBacktest(request);
    }
}
