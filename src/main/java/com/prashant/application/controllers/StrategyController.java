package com.prashant.application.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prashant.application.dto.strategy.BacktestResult;
import com.prashant.application.dto.strategy.StrategyRequest;
import com.prashant.application.services.BacktestService;
import com.prashant.application.services.StrategyScheduleService;

@RestController
@RequestMapping("/strategy")
public class StrategyController {

    private final BacktestService backtestService;
    private final StrategyScheduleService scheduleService;

    public StrategyController(BacktestService backtestService, StrategyScheduleService scheduleService) {
        this.backtestService = backtestService;
        this.scheduleService = scheduleService;
    }

    @PostMapping("/run")
    public BacktestResult runBacktest(@RequestBody StrategyRequest request) {
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
