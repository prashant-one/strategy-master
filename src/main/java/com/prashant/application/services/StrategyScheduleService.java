package com.prashant.application.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prashant.application.dto.strategy.BacktestResult;
import com.prashant.application.dto.strategy.RuleConfig;
import com.prashant.application.dto.strategy.RulesConfig;
import com.prashant.application.dto.strategy.StrategyRequest;
import com.prashant.application.entity.SavedStrategy;
import com.prashant.application.entity.StrategyRunResult;
import com.prashant.application.repository.StrategyRepository;
import com.prashant.application.repository.StrategyRunResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StrategyScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(StrategyScheduleService.class);

    private final StrategyRepository strategyRepository;
    private final StrategyRunResultRepository resultRepository;
    private final BacktestService backtestService;
    private final ObjectMapper objectMapper;

    public StrategyScheduleService(StrategyRepository strategyRepository,
            StrategyRunResultRepository resultRepository,
            BacktestService backtestService,
            ObjectMapper objectMapper) {
        this.strategyRepository = strategyRepository;
        this.resultRepository = resultRepository;
        this.backtestService = backtestService;
        this.objectMapper = objectMapper;
    }

    // Run every day at 1 AM
    @Scheduled(cron = "0 0 1 * * *")
    public void runScheduledStrategies() {
        logger.info("Starting scheduled strategy runs at {}", LocalDateTime.now());
        List<SavedStrategy> strategies = strategyRepository.findAll();

        for (SavedStrategy saved : strategies) {
            try {
                runStrategy(saved);
            } catch (Exception e) {
                logger.error("Failed to run scheduled strategy: {}", saved.getName(), e);
            }
        }
        logger.info("Finished scheduled strategy runs");
    }

    public void runStrategy(SavedStrategy saved) throws JsonProcessingException {
        logger.info("Running scheduled strategy: {}", saved.getName());

        // Parse the frontend JSON structure
        Map<String, Object> strategyMap = objectMapper.readValue(saved.getStrategyJson(), Map.class);

        StrategyRequest request = new StrategyRequest();
        // Default parameters for scheduled runs
        request.setStockSymbol("TCS.NS");
        request.setRange("1y");
        request.setInterval("1d");

        request.setEntry(mapToRulesConfig((Map<String, Object>) strategyMap.get("entryRules")));
        request.setExit(mapToRulesConfig((Map<String, Object>) strategyMap.get("exitRules")));

        BacktestResult result = backtestService.runBacktest(request);
        saveRunResult(saved.getId(), saved.getName(), request, result);
    }

    public void saveRunResult(String strategyId, String strategyName, StrategyRequest request, BacktestResult result) {
        StrategyRunResult runResult = new StrategyRunResult();
        runResult.setStrategyId(strategyId);
        runResult.setStrategyName(strategyName);
        runResult.setSymbol(request.getStockSymbol());
        runResult.setRangeParam(request.getRange());
        runResult.setIntervalParam(request.getInterval());
        runResult.setProfitLoss(result.getProfitLoss());
        runResult.setTotalTrades(result.getTotalTrades());
        runResult.setWinRate(result.getWinRate());
        runResult.setRanAt(LocalDateTime.now());

        resultRepository.save(runResult);
        logger.info("Successfully saved run result for strategy: {}", strategyName);
    }

    private RulesConfig mapToRulesConfig(Map<String, Object> groupMap) {
        if (groupMap == null)
            return null;

        RulesConfig config = new RulesConfig();
        config.setCondition((String) groupMap.get("condition"));

        List<Map<String, Object>> rulesList = (List<Map<String, Object>>) groupMap.get("rules");
        if (rulesList != null) {
            config.setRules(rulesList.stream()
                    .map(this::mapToRuleConfig)
                    .collect(Collectors.toList()));
        }

        return config;
    }

    private RuleConfig mapToRuleConfig(Map<String, Object> nodeMap) {
        RuleConfig config = new RuleConfig();
        String type = (String) nodeMap.get("type");

        if ("group".equals(type)) {
            config.setCondition((String) nodeMap.get("condition"));
            List<Map<String, Object>> rulesList = (List<Map<String, Object>>) nodeMap.get("rules");
            if (rulesList != null) {
                config.setRules(rulesList.stream()
                        .map(this::mapToRuleConfig)
                        .collect(Collectors.toList()));
            }
        } else {
            Map<String, Object> ruleMap = (Map<String, Object>) nodeMap.get("rule");
            config.setCondition((String) nodeMap.get("condition"));
            config.setIndicator((String) ruleMap.get("indicator"));
            config.setOperator((String) ruleMap.get("operator"));
            config.setValue((String) ruleMap.get("value"));
            config.setCompareType((String) ruleMap.get("compareType"));
            config.setCompareIndicator((String) ruleMap.get("compareIndicator"));

            // Note: Parameters mapping might need more care if they are complex objects
            // For now assuming simple List of RuleParam
            config.setParams((List) ruleMap.get("params"));
            config.setCompareParams((List) ruleMap.get("compareParams"));
        }

        return config;
    }
}
