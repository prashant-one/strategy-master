package com.prashant.application.services;

import com.prashant.application.dto.strategy.RuleConfig;
import com.prashant.application.dto.strategy.RulesConfig;
import com.prashant.application.dto.strategy.StrategyRequest;
import com.prashant.application.services.indicator.IndicatorRegistry;
import org.springframework.stereotype.Service;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.Rule;
import org.ta4j.core.Strategy;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.num.Num;
import org.ta4j.core.rules.*;

@Service
public class StrategyParserService {

    private final IndicatorRegistry indicatorRegistry;

    public StrategyParserService(IndicatorRegistry indicatorRegistry) {
        this.indicatorRegistry = indicatorRegistry;
    }

    public Strategy parse(StrategyRequest request, BarSeries series) {
        Rule entryRule = parseRulesGroup(request.getEntry(), series);
        Rule exitRule = parseRulesGroup(request.getExit(), series);
        return new BaseStrategy("GeneratedStrategy", entryRule, exitRule);
    }

    private Rule parseRulesGroup(RulesConfig config, BarSeries series) {
        if (config == null || config.getRules() == null || config.getRules().isEmpty()) {
            return new BooleanRule(false);
        }

        Rule combinedRule = null;
        for (RuleConfig ruleConfig : config.getRules()) {
            Rule currentRule;
            if (ruleConfig.isGroup()) {
                currentRule = parseNestedGroup(ruleConfig, series);
            } else {
                currentRule = parseSingleRule(ruleConfig, series);
            }

            if (combinedRule == null) {
                combinedRule = currentRule;
            } else {
                // Use rule-level condition if available, fallback to group condition
                String operator = ruleConfig.getCondition();
                if (operator == null || operator.isEmpty()) {
                    operator = config.getCondition();
                }

                if ("OR".equalsIgnoreCase(operator)) {
                    combinedRule = combinedRule.or(currentRule);
                } else {
                    combinedRule = combinedRule.and(currentRule);
                }
            }
        }
        return combinedRule != null ? combinedRule : new BooleanRule(false);
    }

    private Rule parseNestedGroup(RuleConfig groupConfig, BarSeries series) {
        RulesConfig nestedConfig = new RulesConfig();
        nestedConfig.setCondition(groupConfig.getCondition());
        nestedConfig.setRules(groupConfig.getRules());
        return parseRulesGroup(nestedConfig, series);
    }

    private Rule parseSingleRule(RuleConfig rule, BarSeries series) {
        ClosePriceIndicator closePrice = new ClosePriceIndicator(series);

        // 1. Resolve Indicators
        var leftIndicator = indicatorRegistry.getIndicator(rule.getIndicator(), closePrice, rule.getParams());

        // 2. Resolve Comparison
        if ("value".equalsIgnoreCase(rule.getCompareType())) {
            double value = Double.parseDouble(rule.getValue());
            Num numValue = series.numFactory().numOf(value);
            return createValueRule(leftIndicator, rule.getOperator(), numValue);
        } else {
            var rightIndicator = indicatorRegistry.getIndicator(rule.getCompareIndicator(), closePrice,
                    rule.getCompareParams());
            return createIndicatorRule(leftIndicator, rule.getOperator(), rightIndicator);
        }
    }

    private Rule createValueRule(org.ta4j.core.Indicator<Num> indicator, String operator, Num value) {
        switch (operator) {
            case "<":
                return new UnderIndicatorRule(indicator, value);
            case ">":
                return new OverIndicatorRule(indicator, value);
            case "<=":
                return new OrRule(
                        new UnderIndicatorRule(indicator, value),
                        new IsEqualRule(indicator, value));
            case ">=":
                return new OrRule(
                        new OverIndicatorRule(indicator, value),
                        new IsEqualRule(indicator, value));
            case "=":
            case "==":
                return new IsEqualRule(indicator, value);
            case "crossesUp":
                return new CrossedUpIndicatorRule(indicator, value);
            case "crossesDown":
                return new CrossedDownIndicatorRule(indicator, value);
            default:
                throw new IllegalArgumentException("Unknown operator: " + operator);
        }
    }

    private Rule createIndicatorRule(org.ta4j.core.Indicator<Num> left, String operator,
            org.ta4j.core.Indicator<Num> right) {
        switch (operator) {
            case "<":
                return new UnderIndicatorRule(left, right);
            case ">":
                return new OverIndicatorRule(left, right);
            case "<=":
                return new OrRule(
                        new UnderIndicatorRule(left, right),
                        new IsEqualRule(left, right));
            case ">=":
                return new OrRule(
                        new OverIndicatorRule(left, right),
                        new IsEqualRule(left, right));
            case "=":
            case "==":
                return new IsEqualRule(left, right);
            case "crossesUp":
                return new CrossedUpIndicatorRule(left, right);
            case "crossesDown":
                return new CrossedDownIndicatorRule(left, right);
            default:
                throw new IllegalArgumentException("Unknown operator: " + operator);
        }
    }
}
