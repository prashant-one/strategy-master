package com.prashant.application.controllers;

import com.prashant.application.dto.strategy.BacktestResult;
import com.prashant.application.dto.strategy.StrategyRequest;
import com.prashant.application.entity.SavedStrategy;
import com.prashant.application.repository.StrategyRepository;
import com.prashant.application.services.BacktestService;
import com.prashant.application.entity.StrategyRunResult;
import com.prashant.application.repository.StrategyRunResultRepository;
import com.prashant.application.services.StrategyScheduleService;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;

@BrowserCallable
@AnonymousAllowed
public class StrategyEndpint {

    private final BacktestService backtestService;
    private final StrategyRepository strategyRepository;
    private final StrategyRunResultRepository resultRepository;
    private final StrategyScheduleService scheduleService;

    public StrategyEndpint(BacktestService backtestService, StrategyRepository strategyRepository,
            StrategyRunResultRepository resultRepository, StrategyScheduleService scheduleService) {
        this.backtestService = backtestService;
        this.strategyRepository = strategyRepository;
        this.resultRepository = resultRepository;
        this.scheduleService = scheduleService;
    }

    public List<StrategyRunResult> getRunResults(int page) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "ranAt"));
        return resultRepository.findAll(pageable).getContent();
    }

    public void runScheduledNow() {
        scheduleService.runScheduledStrategies();
    }

    public SavedStrategy getStrategy(String id) {
        return strategyRepository.findById(id).orElse(null);
    }

    public List<SavedStrategy> getSavedStrategies(int page) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "savedAt"));
        return strategyRepository.findAll(pageable).getContent();
    }

    public SavedStrategy saveStrategy(SavedStrategy strategy) {
        if (strategy.getSavedAt() == null) {
            strategy.setSavedAt(java.time.LocalDateTime.now());
        }
        return strategyRepository.save(strategy);
    }

    public void runSavedStrategy(String id) throws Exception {
        SavedStrategy strategy = strategyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Strategy not found"));
        scheduleService.runStrategy(strategy);
    }

    public BacktestResult runBacktest(StrategyRequest request) {
        BacktestResult result = backtestService.runBacktest(request);

        String sId = request.getStrategyId() != null && !request.getStrategyId().isEmpty()
                ? request.getStrategyId()
                : "Manual";
        String sName = request.getStrategyName() != null && !request.getStrategyName().isEmpty()
                ? request.getStrategyName()
                : "Manual Builder Run";

        scheduleService.saveRunResult(sId, sName, request, result);
        return result;
    }
}
