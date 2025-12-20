package com.prashant.application.services.indicator;

import com.prashant.application.dto.strategy.RuleParam;
import org.springframework.stereotype.Service;
import org.ta4j.core.Indicator;
import org.ta4j.core.indicators.*;
import org.ta4j.core.indicators.adx.ADXIndicator;
import org.ta4j.core.indicators.adx.MinusDIIndicator;
import org.ta4j.core.indicators.adx.PlusDIIndicator;
import org.ta4j.core.indicators.averages.*;
import org.ta4j.core.indicators.bollinger.*;
import org.ta4j.core.indicators.donchian.*;
import org.ta4j.core.indicators.helpers.*;
import org.ta4j.core.indicators.ichimoku.*;
import org.ta4j.core.indicators.keltner.*;
import org.ta4j.core.indicators.statistics.*;
import org.ta4j.core.indicators.supertrend.SuperTrendIndicator;
import org.ta4j.core.indicators.volume.*;
import org.ta4j.core.num.Num;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IndicatorRegistry {

    private final Map<String, IndicatorProvider> registry = new HashMap<>();

    public IndicatorRegistry() {
        initializeRegistry();
    }

    private void initializeRegistry() {
        // --- Core / Price Helpers ---
        register("CLOSE", (cp, p) -> cp);
        register("OPEN", (cp, p) -> new OpenPriceIndicator(cp.getBarSeries()));
        register("HIGH", (cp, p) -> new HighPriceIndicator(cp.getBarSeries()));
        register("LOW", (cp, p) -> new LowPriceIndicator(cp.getBarSeries()));
        register("VOLUME", (cp, p) -> new VolumeIndicator(cp.getBarSeries()));

        // --- Moving Averages ---
        register("SMA", (cp, p) -> new SMAIndicator(cp, getParamInt(p, "period", 50)));
        register("EMA", (cp, p) -> new EMAIndicator(cp, getParamInt(p, "period", 20)));
        register("WMA", (cp, p) -> new WMAIndicator(cp, getParamInt(p, "period", 20)));
        register("HMA", (cp, p) -> new HMAIndicator(cp, getParamInt(p, "period", 20)));

        // --- Momentum & Oscillators ---
        register("RSI", (cp, p) -> new RSIIndicator(cp, getParamInt(p, "period", 14)));
        register("MACD", (cp, p) -> new MACDIndicator(cp, getParamInt(p, "fast", 12), getParamInt(p, "slow", 26)));
        register("STOCHASTIC",
                (cp, p) -> new StochasticOscillatorKIndicator(cp.getBarSeries(), getParamInt(p, "kPeriod", 14)));
        register("ROC", (cp, p) -> new ROCIndicator(cp, getParamInt(p, "period", 12)));
        register("MOMENTUM", (cp, p) -> new ROCIndicator(cp, getParamInt(p, "period", 14)));
        register("CCI", (cp, p) -> new CCIIndicator(cp.getBarSeries(), getParamInt(p, "period", 20)));
        register("WILLIAMSR", (cp, p) -> new WilliamsRIndicator(cp.getBarSeries(), getParamInt(p, "period", 14)));
        register("AWESOMEOSCILLATOR", (cp, p) -> new AwesomeOscillatorIndicator(cp.getBarSeries()));

        // --- Trend Strength / ADX ---
        register("ADX", (cp, p) -> new ADXIndicator(cp.getBarSeries(), getParamInt(p, "period", 14)));
        register("PLUSDI", (cp, p) -> new PlusDIIndicator(cp.getBarSeries(), getParamInt(p, "period", 14)));
        register("MINUSDI", (cp, p) -> new MinusDIIndicator(cp.getBarSeries(), getParamInt(p, "period", 14)));

        // --- Volatility ---
        register("ATR", (cp, p) -> new ATRIndicator(cp.getBarSeries(), getParamInt(p, "period", 14)));
        register("TR", (cp, p) -> new TRIndicator(cp.getBarSeries()));
        register("STANDARDDEVIATION", (cp, p) -> new StandardDeviationIndicator(cp, getParamInt(p, "period", 20)));

        // --- Volume Based ---
        register("OBV", (cp, p) -> new OnBalanceVolumeIndicator(cp.getBarSeries()));
        register("VWAP", (cp, p) -> new VWAPIndicator(cp.getBarSeries(), getParamInt(p, "period", 14)));
        register("ADL", (cp, p) -> new AccumulationDistributionIndicator(cp.getBarSeries()));

        // --- Channels & Bands ---
        register("BOLLINGERUPPER", (cp, p) -> {
            int period = getParamInt(p, "period", 20);
            double stdDev = getParamDouble(p, "stdDev", 2.0);
            BollingerBandsMiddleIndicator middle = new BollingerBandsMiddleIndicator(new SMAIndicator(cp, period));
            StandardDeviationIndicator sd = new StandardDeviationIndicator(cp, period);
            return new BollingerBandsUpperIndicator(middle, sd, cp.getBarSeries().numFactory().numOf(stdDev));
        });
        register("BOLLINGERLOWER", (cp, p) -> {
            int period = getParamInt(p, "period", 20);
            double stdDev = getParamDouble(p, "stdDev", 2.0);
            BollingerBandsMiddleIndicator middle = new BollingerBandsMiddleIndicator(new SMAIndicator(cp, period));
            StandardDeviationIndicator sd = new StandardDeviationIndicator(cp, period);
            return new BollingerBandsLowerIndicator(middle, sd, cp.getBarSeries().numFactory().numOf(stdDev));
        });
        register("KELTNERUPPER", (cp, p) -> {
            KeltnerChannelMiddleIndicator middle = new KeltnerChannelMiddleIndicator(cp.getBarSeries(),
                    getParamInt(p, "period", 20));
            ATRIndicator atr = new ATRIndicator(cp.getBarSeries(), getParamInt(p, "atr", 10));
            return new KeltnerChannelUpperIndicator(middle, atr, getParamDouble(p, "multiplier", 2.0));
        });
        register("KELTNERLOWER", (cp, p) -> {
            KeltnerChannelMiddleIndicator middle = new KeltnerChannelMiddleIndicator(cp.getBarSeries(),
                    getParamInt(p, "period", 20));
            ATRIndicator atr = new ATRIndicator(cp.getBarSeries(), getParamInt(p, "atr", 10));
            return new KeltnerChannelLowerIndicator(middle, atr, getParamDouble(p, "multiplier", 2.0));
        });
        register("DONCHIANUPPER",
                (cp, p) -> new DonchianChannelUpperIndicator(cp.getBarSeries(), getParamInt(p, "period", 20)));
        register("DONCHIANLOWER",
                (cp, p) -> new DonchianChannelLowerIndicator(cp.getBarSeries(), getParamInt(p, "period", 20)));

        // --- Trend Reversal ---
        register("PARABOLICSAR", (cp, p) -> new ParabolicSarIndicator(cp.getBarSeries()));
        register("FISHER", (cp, p) -> new FisherIndicator(cp, getParamInt(p, "period", 10)));

        // --- Support / Resistance ---
        register("HIGHESTHIGH", (cp, p) -> new HighestValueIndicator(new HighPriceIndicator(cp.getBarSeries()),
                getParamInt(p, "period", 20)));
        register("LOWESTLOW", (cp, p) -> new LowestValueIndicator(new LowPriceIndicator(cp.getBarSeries()),
                getParamInt(p, "period", 20)));

        // --- Aliases & Backward Compatibility ---
        register("PRICE", registry.get("CLOSE"));
        register("SMA50", registry.get("SMA"));
        register("EMA20", registry.get("EMA"));
        register("BOLLINGER", registry.get("BOLLINGERUPPER"));
        register("BOLLINGERBANDS", registry.get("BOLLINGERUPPER"));
        register("BOLLINGERBANDSUPPER", registry.get("BOLLINGERUPPER"));
        register("BOLLINGERBANDSLOWER", registry.get("BOLLINGERLOWER"));
        register("KELTNER", registry.get("KELTNERUPPER"));
        register("KELTNERCHANNELS", registry.get("KELTNERUPPER"));
        register("KELTNERCHANNELUPPER", registry.get("KELTNERUPPER"));
        register("KELTNERCHANNELLOWER", registry.get("KELTNERLOWER"));
        register("DONCHIAN", registry.get("DONCHIANUPPER"));
        register("DONCHIANCHANNELS", registry.get("DONCHIANUPPER"));
        register("DONCHIANCHANNELUPPER", registry.get("DONCHIANUPPER"));
        register("DONCHIANCHANNELLOWER", registry.get("DONCHIANLOWER"));
        register("ICHIMOKU", (cp, p) -> new IchimokuTenkanSenIndicator(cp.getBarSeries(), getParamInt(p, "tenkan", 9)));
        register("ICHIMOKUCLOUD", registry.get("ICHIMOKU"));
        register("ICHIMOKUTENKAN", registry.get("ICHIMOKU"));
        register("ICHIMOKUTENKANSEN", registry.get("ICHIMOKU"));
        register("ICHIMOKUKIJUN",
                (cp, p) -> new IchimokuKijunSenIndicator(cp.getBarSeries(), getParamInt(p, "kijun", 26)));
        register("ICHIMOKUKIJUNSEN", registry.get("ICHIMOKUKIJUN"));
        register("SUPERTREND", (cp, p) -> new SuperTrendIndicator(cp.getBarSeries(), getParamInt(p, "period", 10),
                getParamDouble(p, "multiplier", 3.0)));
        register("STOCHASTICOSCILLATOR", registry.get("STOCHASTIC"));
        register("AVERAGETRUERANGE", registry.get("ATR"));
    }

    public void register(String name, IndicatorProvider provider) {
        registry.put(name.toUpperCase(), provider);
    }

    public Indicator<Num> getIndicator(String name, ClosePriceIndicator cp, List<RuleParam> params) {
        IndicatorProvider provider = registry.get(name.toUpperCase());
        if (provider == null) {
            throw new IllegalArgumentException("Unsupported indicator: " + name);
        }
        return provider.create(cp, params);
    }

    // Helper methods for parameter extraction
    private int getParamInt(List<RuleParam> params, String name, int defaultValue) {
        if (params == null)
            return defaultValue;
        return params.stream()
                .filter(p -> p.getName().equalsIgnoreCase(name))
                .map(p -> {
                    try {
                        return Integer.parseInt(p.getValue());
                    } catch (Exception e) {
                        return defaultValue;
                    }
                })
                .findFirst().orElse(defaultValue);
    }

    private double getParamDouble(List<RuleParam> params, String name, double defaultValue) {
        if (params == null)
            return defaultValue;
        return params.stream()
                .filter(p -> p.getName().equalsIgnoreCase(name))
                .map(p -> {
                    try {
                        return Double.parseDouble(p.getValue());
                    } catch (Exception e) {
                        return defaultValue;
                    }
                })
                .findFirst().orElse(defaultValue);
    }
}
