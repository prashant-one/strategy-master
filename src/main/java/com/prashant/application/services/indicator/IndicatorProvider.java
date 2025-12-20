package com.prashant.application.services.indicator;

import com.prashant.application.dto.strategy.RuleParam;
import org.ta4j.core.Indicator;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.num.Num;

import java.util.List;

@FunctionalInterface
public interface IndicatorProvider {
    Indicator<Num> create(ClosePriceIndicator closePrice, List<RuleParam> params);
}
