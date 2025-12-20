import { Trash2, Activity, ArrowLeftRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Rule } from '../../../views/@index';

interface RuleBlockProps {
  rule: Rule;
  onChange: (rule: Rule) => void;
  onDelete: () => void;
}

const INDICATORS = [
  // --- Price Helpers ---
  { value: 'Price', label: 'Price (Close)', params: [] },
  { value: 'Open', label: 'Price (Open)', params: [] },
  { value: 'High', label: 'Price (High)', params: [] },
  { value: 'Low', label: 'Price (Low)', params: [] },

  // --- Trend Strength ---
  { value: 'ADX', label: 'ADX - Average Directional Index', params: [{ name: 'period', label: 'Period', default: '14' }] },
  { value: 'PlusDI', label: 'Plus DI (+DI)', params: [{ name: 'period', label: 'Period', default: '14' }] },
  { value: 'MinusDI', label: 'Minus DI (-DI)', params: [{ name: 'period', label: 'Period', default: '14' }] },

  // --- Momentum & Oscillators ---
  { value: 'RSI', label: 'RSI - Relative Strength Index', params: [{ name: 'period', label: 'Period', default: '14' }] },
  {
    value: 'MACD', label: 'MACD - Moving Average Convergence Divergence', params: [
      { name: 'fast', label: 'Fast', default: '12' },
      { name: 'slow', label: 'Slow', default: '26' }
    ]
  },
  { value: 'Stochastic', label: 'Stochastic Oscillator', params: [{ name: 'kPeriod', label: 'K Period', default: '14' }] },
  { value: 'ROC', label: 'ROC - Rate of Change', params: [{ name: 'period', label: 'Period', default: '12' }] },
  { value: 'Momentum', label: 'Momentum', params: [{ name: 'period', label: 'Period', default: '14' }] },
  { value: 'CCI', label: 'CCI - Commodity Channel Index', params: [{ name: 'period', label: 'Period', default: '20' }] },
  { value: 'WilliamsR', label: 'Williams %R', params: [{ name: 'period', label: 'Period', default: '14' }] },
  { value: 'AwesomeOscillator', label: 'Awesome Oscillator', params: [] },

  // --- Volatility ---
  { value: 'StandardDeviation', label: 'Standard Deviation', params: [{ name: 'period', label: 'Period', default: '20' }] },
  { value: 'ATR', label: 'ATR - Average True Range', params: [{ name: 'period', label: 'Period', default: '14' }] },
  { value: 'TR', label: 'True Range', params: [] },

  // --- Volume Based ---
  { value: 'Volume', label: 'Volume', params: [] },
  { value: 'OBV', label: 'OBV - On-Balance Volume', params: [] },
  { value: 'VWAP', label: 'VWAP - Volume Weighted Average Price', params: [{ name: 'period', label: 'Period', default: '14' }] },
  { value: 'ADL', label: 'ADL - Accumulation/Distribution Line', params: [] },

  // --- Moving Averages ---
  { value: 'SMA', label: 'SMA - Simple Moving Average', params: [{ name: 'period', label: 'Period', default: '50' }] },
  { value: 'EMA', label: 'EMA - Exponential Moving Average', params: [{ name: 'period', label: 'Period', default: '20' }] },
  { value: 'WMA', label: 'WMA - Weighted Moving Average', params: [{ name: 'period', label: 'Period', default: '20' }] },
  { value: 'HMA', label: 'HMA - Hull Moving Average', params: [{ name: 'period', label: 'Period', default: '20' }] },

  // --- Support / Resistance & Channels ---
  { value: 'HighestHigh', label: 'Highest High', params: [{ name: 'period', label: 'Period', default: '20' }] },
  { value: 'LowestLow', label: 'Lowest Low', params: [{ name: 'period', label: 'Period', default: '20' }] },
  {
    value: 'BollingerUpper', label: 'Bollinger Bands Upper', params: [
      { name: 'period', label: 'Period', default: '20' },
      { name: 'stdDev', label: 'Std Dev', default: '2' }
    ]
  },
  {
    value: 'BollingerLower', label: 'Bollinger Bands Lower', params: [
      { name: 'period', label: 'Period', default: '20' },
      { name: 'stdDev', label: 'Std Dev', default: '2' }
    ]
  },
  {
    value: 'KeltnerUpper', label: 'Keltner Channel Upper', params: [
      { name: 'period', label: 'Period', default: '20' },
      { name: 'atr', label: 'ATR Period', default: '10' },
      { name: 'multiplier', label: 'Multiplier', default: '2' }
    ]
  },
  {
    value: 'KeltnerLower', label: 'Keltner Channel Lower', params: [
      { name: 'period', label: 'Period', default: '20' },
      { name: 'atr', label: 'ATR Period', default: '10' },
      { name: 'multiplier', label: 'Multiplier', default: '2' }
    ]
  },
  { value: 'DonchianUpper', label: 'Donchian Channel Upper', params: [{ name: 'period', label: 'Period', default: '20' }] },
  { value: 'DonchianLower', label: 'Donchian Channel Lower', params: [{ name: 'period', label: 'Period', default: '20' }] },

  // --- Trend Reversal ---
  { value: 'ParabolicSar', label: 'Parabolic SAR', params: [] },
  { value: 'Fisher', label: 'Fisher Transform', params: [{ name: 'period', label: 'Period', default: '10' }] },

  // --- Cloud & Others ---
  {
    value: 'SuperTrend', label: 'SuperTrend', params: [
      { name: 'period', label: 'Period', default: '10' },
      { name: 'multiplier', label: 'Multiplier', default: '3' }
    ]
  },
  { value: 'IchimokuTenkan', label: 'Ichimoku Tenkan-Sen', params: [{ name: 'tenkan', label: 'Tenkan', default: '9' }] },
  { value: 'IchimokuKijun', label: 'Ichimoku Kijun-Sen', params: [{ name: 'kijun', label: 'Kijun', default: '26' }] }
];

const OPERATORS = [
  { value: '>', label: '> Greater Than' },
  { value: '<', label: '< Less Than' },
  { value: '>=', label: '>= Greater Than or Equal' },
  { value: '<=', label: '<= Less Than or Equal' },
  { value: '==', label: '== Equal To' },
  { value: 'crossesUp', label: 'crossesUp' },
  { value: 'crossesDown', label: 'crossesDown' }
];

export function RuleBlock({ rule, onChange, onDelete }: RuleBlockProps) {
  const selectedIndicator = INDICATORS.find(ind => ind.value === rule.indicator);
  const selectedCompareIndicator = INDICATORS.find(ind => ind.value === rule.compareIndicator);
  const compareType = rule.compareType || 'value';

  const handleIndicatorChange = (newIndicator: string) => {
    const indicator = INDICATORS.find(ind => ind.value === newIndicator);
    onChange({
      ...rule,
      indicator: newIndicator,
      params: indicator?.params.map(param => ({ name: param.name, value: param.default }))
    });
  };

  const handleCompareIndicatorChange = (newIndicator: string) => {
    const indicator = INDICATORS.find(ind => ind.value === newIndicator);
    onChange({
      ...rule,
      compareIndicator: newIndicator,
      compareParams: indicator?.params.map(param => ({ name: param.name, value: param.default }))
    });
  };

  const toggleCompareType = () => {
    const newType = compareType === 'value' ? 'indicator' : 'value';
    const smaIndicator = INDICATORS.find(ind => ind.value === 'SMA');
    onChange({
      ...rule,
      compareType: newType,
      // Set defaults when switching to indicator mode
      compareIndicator: newType === 'indicator' && !rule.compareIndicator ? 'SMA' : rule.compareIndicator,
      compareParams: newType === 'indicator' && !rule.compareParams
        ? smaIndicator?.params.map(param => ({ name: param.name, value: param.default }))
        : rule.compareParams
    });
  };

  const updateParam = (index: number, value: string) => {
    const newParams = [...(rule.params || [])];
    newParams[index] = { ...newParams[index], value };
    onChange({ ...rule, params: newParams });
  };

  const updateCompareParam = (index: number, value: string) => {
    const newParams = [...(rule.compareParams || [])];
    newParams[index] = { ...newParams[index], value };
    onChange({ ...rule, compareParams: newParams });
  };

  const generatePreview = () => {
    const formatParams = (params?: Array<{ name: string; value: string }>) => {
      if (!params || !Array.isArray(params) || params.length === 0) return '';
      return `(${params.map(p => p.value).join(', ')})`;
    };

    const leftSide = `${rule.indicator}${formatParams(rule.params)}`;
    const rightSide = compareType === 'indicator'
      ? `${rule.compareIndicator || 'SMA'}${formatParams(rule.compareParams)}`
      : rule.value;
    return `${leftSide} ${rule.operator} ${rightSide}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border-l-2 border-slate-400 p-4 hover:border-blue-400 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="mt-2 p-2 bg-gradient-to-br from-blue-50 to-indigo-50">
          <Activity className="w-4 h-4 text-blue-600" />
        </div>

        <div className="flex-1 space-y-3">
          {/* First Row: Left Indicator */}
          <div className="grid grid-cols-1 gap-3">
            {/* Left Indicator */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Indicator</label>
              <select
                value={rule.indicator}
                onChange={(e) => handleIndicatorChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-400 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {INDICATORS.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Left Indicator Parameters */}
            {selectedIndicator && selectedIndicator.params.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedIndicator.params.map((paramDef, index) => (
                  <div key={paramDef.name}>
                    <label className="block text-xs text-slate-600 mb-1">{paramDef.label}</label>
                    <input
                      type="text"
                      value={rule.params?.[index]?.value || paramDef.default}
                      onChange={(e) => updateParam(index, e.target.value)}
                      placeholder={paramDef.default}
                      className="w-full px-3 py-2 border border-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Operator */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Operator</label>
              <select
                value={rule.operator}
                onChange={(e) => onChange({ ...rule, operator: e.target.value })}
                className="w-full px-3 py-2 border border-slate-400 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Row: Compare Type Toggle + Value/Indicator */}
          <div className="border-t border-slate-100 pt-3">
            {/* Toggle Button */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-slate-600">Compare to:</span>
              <button
                onClick={toggleCompareType}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${compareType === 'value'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
              >
                <ArrowLeftRight className="w-3 h-3" />
                {compareType === 'value' ? 'Static Value' : 'Another Indicator'}
              </button>
            </div>

            {/* Conditional Input */}
            {compareType === 'value' ? (
              <div className="max-w-xs">
                <label className="block text-xs text-slate-600 mb-1">Value</label>
                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => onChange({ ...rule, value: e.target.value })}
                  placeholder="30"
                  className="w-full px-3 py-2 border border-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Right Indicator */}
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Compare Indicator</label>
                  <select
                    value={rule.compareIndicator || 'SMA'}
                    onChange={(e) => handleCompareIndicatorChange(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {INDICATORS.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right Indicator Parameters */}
                {selectedCompareIndicator && selectedCompareIndicator.params.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedCompareIndicator.params.map((paramDef, index) => (
                      <div key={paramDef.name}>
                        <label className="block text-xs text-slate-600 mb-1">{paramDef.label}</label>
                        <input
                          type="text"
                          value={rule.compareParams?.[index]?.value || paramDef.default}
                          onChange={(e) => updateCompareParam(index, e.target.value)}
                          placeholder={paramDef.default}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="mt-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Rule Preview */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className={`text-xs font-mono px-3 py-2 rounded ${compareType === 'value'
          ? 'bg-slate-50 text-slate-700'
          : 'bg-purple-50 text-purple-700'
          }`}>
          {generatePreview()}
        </div>
      </div>
    </motion.div>
  );
}