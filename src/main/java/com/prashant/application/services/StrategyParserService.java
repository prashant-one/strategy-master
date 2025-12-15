package com.prashant.application.services;

import com.prashant.application.dto.strategy.RuleConfig;
import com.prashant.application.dto.strategy.RuleParam;
import com.prashant.application.dto.strategy.RulesConfig;
import com.prashant.application.dto.strategy.StrategyRequest;
import org.springframework.stereotype.Service;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.Rule;
import org.ta4j.core.Strategy;
import org.ta4j.core.indicators.ATRIndicator;
import org.ta4j.core.indicators.MACDIndicator;
import org.ta4j.core.indicators.RSIIndicator;
import org.ta4j.core.indicators.StochasticOscillatorKIndicator;
import org.ta4j.core.indicators.StochasticOscillatorDIndicator;
import org.ta4j.core.indicators.averages.EMAIndicator;
import org.ta4j.core.indicators.averages.SMAIndicator;
import org.ta4j.core.indicators.bollinger.BollingerBandsLowerIndicator;
import org.ta4j.core.indicators.bollinger.BollingerBandsMiddleIndicator;
import org.ta4j.core.indicators.bollinger.BollingerBandsUpperIndicator;
import org.ta4j.core.indicators.donchian.DonchianChannelLowerIndicator;
import org.ta4j.core.indicators.donchian.DonchianChannelUpperIndicator;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.indicators.helpers.VolumeIndicator;
import org.ta4j.core.indicators.ichimoku.IchimokuKijunSenIndicator;
import org.ta4j.core.indicators.ichimoku.IchimokuTenkanSenIndicator;
import org.ta4j.core.indicators.keltner.KeltnerChannelLowerIndicator;
import org.ta4j.core.indicators.keltner.KeltnerChannelMiddleIndicator;
import org.ta4j.core.indicators.keltner.KeltnerChannelUpperIndicator;
import org.ta4j.core.indicators.statistics.StandardDeviationIndicator;
import org.ta4j.core.indicators.supertrend.SuperTrendIndicator;
import org.ta4j.core.num.Num;
import org.ta4j.core.rules.*;

import java.util.List;

@Service
public class StrategyParserService {

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
                if ("OR".equalsIgnoreCase(config.getCondition())) {
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
        ClosePriceIndicator closePrice = new ClosePriceIndicator(series); // Default for simplicity, effectively
                                                                          // standard param

        // 1. Resolve Indicators
        // note: For more complex strategies, we'd need a way to share indicators
        // instances
        var leftIndicator = createIndicator(rule.getIndicator(), rule.getParams(), closePrice);

        // 2. Resolve Comparison
        if ("value".equalsIgnoreCase(rule.getCompareType())) {
            double value = Double.parseDouble(rule.getValue());
            Num numValue = series.numFactory().numOf(value);
            return createValueRule(leftIndicator, rule.getOperator(), numValue);
        } else {
            var rightIndicator = createIndicator(rule.getCompareIndicator(), rule.getCompareParams(), closePrice);
            return createIndicatorRule(leftIndicator, rule.getOperator(), rightIndicator);
        }
    }

    private org.ta4j.core.Indicator<Num> createIndicator(String name, List<RuleParam> params,
            ClosePriceIndicator closePrice) {
        String normalizedName = name.replace(" ", "").toUpperCase();

        switch (normalizedName) {
            case "RSI":
                return new RSIIndicator(closePrice, getParamInt(params, "period", 14));
            case "SMA":
                return new SMAIndicator(closePrice, getParamInt(params, "period", 50));
            case "EMA":
                return new EMAIndicator(closePrice, getParamInt(params, "period", 20));
            case "MACD":
                int fast = getParamInt(params, "fast", 12);
                int slow = getParamInt(params, "slow", 26);
                return new MACDIndicator(closePrice, fast, slow);
            case "STOCHASTIC":
            case "STOCHASTICOSCILLATOR":
                return new StochasticOscillatorKIndicator(closePrice.getBarSeries(),
                        getParamInt(params, "kPeriod", 14));
            case "BOLLINGER":
            case "BOLLINGERBANDS":
                int bPeriod = getParamInt(params, "period", 20);
                double bStdDev = getParamDouble(params, "stdDev", 2.0);
                SMAIndicator smaB = new SMAIndicator(closePrice, bPeriod);
                StandardDeviationIndicator sdB = new StandardDeviationIndicator(closePrice, bPeriod);
                BollingerBandsMiddleIndicator middleB = new BollingerBandsMiddleIndicator(smaB);
                return new BollingerBandsUpperIndicator(middleB, sdB,
                        closePrice.getBarSeries().numFactory().numOf(String.valueOf(bStdDev)));
            case "KELTNER":
            case "KELTNERCHANNELS":
                int kElePeriod = getParamInt(params, "period", 20);
                int kAtrPeriod = getParamInt(params, "atr", 10);
                double kMultiplier = getParamDouble(params, "multiplier", 2.0);
                KeltnerChannelMiddleIndicator middleK = new KeltnerChannelMiddleIndicator(closePrice.getBarSeries(),
                        kElePeriod);
                ATRIndicator atrK = new ATRIndicator(closePrice.getBarSeries(), kAtrPeriod);
                return new KeltnerChannelUpperIndicator(middleK, atrK, kMultiplier);
            case "DONCHIAN":
            case "DONCHIANCHANNELS":
                return new DonchianChannelUpperIndicator(closePrice.getBarSeries(), getParamInt(params, "period", 20));
            case "ICHIMOKU":
            case "ICHIMOKUCLOUD":
                return new IchimokuTenkanSenIndicator(closePrice.getBarSeries(), getParamInt(params, "tenkan", 9));
            case "SUPERTREND":
                int stPeriod = getParamInt(params, "period", 10);
                double stMultiplier = getParamDouble(params, "multiplier", 3.0);
                return new SuperTrendIndicator(closePrice.getBarSeries(), stPeriod, stMultiplier);
            case "ATR":
            case "AVERAGETRUERANGE":
                return new ATRIndicator(closePrice.getBarSeries(), getParamInt(params, "period", 14));
            case "VOLUME":
                return new VolumeIndicator(closePrice.getBarSeries());
            case "PRICE":
            case "CLOSE":
                return closePrice;

            // Keep aliases for specific bands if needed, matching logic roughly
            case "BOLLINGERBANDSUPPER":
            case "BOLLINGERUPPER":
                return createIndicator("BOLLINGER", params, closePrice); // Reuse logic
            case "BOLLINGERBANDSLOWER":
            case "BOLLINGERLOWER":
                // For lower band, we need to explicitly create it.
                // The generic "BOLLINGER" defaults to upper.
                int bLPeriod = getParamInt(params, "period", 20);
                double bLStdDev = getParamDouble(params, "stdDev", 2.0);
                SMAIndicator smaBL = new SMAIndicator(closePrice, bLPeriod);
                StandardDeviationIndicator sdBL = new StandardDeviationIndicator(closePrice, bLPeriod);
                BollingerBandsMiddleIndicator middleBL = new BollingerBandsMiddleIndicator(smaBL);
                return new BollingerBandsLowerIndicator(middleBL, sdBL,
                        closePrice.getBarSeries().numFactory().numOf(String.valueOf(bLStdDev)));
            case "KELTNERCHANNELUPPER":
            case "KELTNERUPPER":
                return createIndicator("KELTNER", params, closePrice);
            case "KELTNERCHANNELLOWER":
            case "KELTNERLOWER":
                // For lower band, we need to explicitly create it.
                // The generic "KELTNER" defaults to upper.
                int kLElePeriod = getParamInt(params, "period", 20);
                int kLAtrPeriod = getParamInt(params, "atr", 10);
                double kLMultiplier = getParamDouble(params, "multiplier", 2.0);
                KeltnerChannelMiddleIndicator middleKL = new KeltnerChannelMiddleIndicator(closePrice.getBarSeries(),
                        kLElePeriod);
                ATRIndicator atrKL = new ATRIndicator(closePrice.getBarSeries(), kLAtrPeriod);
                return new KeltnerChannelLowerIndicator(middleKL, atrKL, kLMultiplier);
            case "DONCHIANCHANNELUPPER":
            case "DONCHIANUPPER":
                return createIndicator("DONCHIAN", params, closePrice);
            case "DONCHIANCHANNELLOWER":
            case "DONCHIANLOWER":
                // For lower band, we need to explicitly create it.
                // The generic "DONCHIAN" defaults to upper.
                return new DonchianChannelLowerIndicator(closePrice.getBarSeries(), getParamInt(params, "period", 20));
            case "ICHIMOKUTENKANSEN":
                return createIndicator("ICHIMOKU", params, closePrice);
            case "ICHIMOKUKIJUNSEN":
                return new IchimokuKijunSenIndicator(closePrice.getBarSeries(), getParamInt(params, "kijun", 26));

            default:
                throw new IllegalArgumentException("Unknown indicator: " + name);
        }
    }

    private Rule createValueRule(org.ta4j.core.Indicator<Num> indicator, String operator, Num value) {
        switch (operator) {
            case "<":
                return new UnderIndicatorRule(indicator, value);
            case ">":
                return new OverIndicatorRule(indicator, value);
            case "=":
                return new IsEqualRule(indicator, value); // Not standard, maybe use Crossing
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
            case "crossesUp":
                return new CrossedUpIndicatorRule(left, right);
            case "crossesDown":
                return new CrossedDownIndicatorRule(left, right);
            default:
                throw new IllegalArgumentException("Unknown operator: " + operator);
        }
    }

    private int getParamInt(List<RuleParam> params, String name, int defaultValue) {
        if (params == null)
            return defaultValue;
        for (RuleParam p : params) {
            if (name.equalsIgnoreCase(p.getName())) {
                try {
                    return Integer.parseInt(p.getValue());
                } catch (NumberFormatException e) {
                    return defaultValue;
                }
            }
        }
        return defaultValue;
    }

    private double getParamDouble(List<RuleParam> params, String name, double defaultValue) {
        if (params == null)
            return defaultValue;
        for (RuleParam p : params) {
            if (name.equalsIgnoreCase(p.getName())) {
                try {
                    return Double.parseDouble(p.getValue());
                } catch (NumberFormatException e) {
                    return defaultValue;
                }
            }
        }
        return defaultValue;
    }
}
