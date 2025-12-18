import { Calendar, TrendingUp, Database, Clock, BarChart } from 'lucide-react';
import { motion } from 'motion/react';

interface StockSelectorProps {
  selectedStock: string;
  setSelectedStock: (stock: string) => void;
  range: string;
  setRange: (range: string) => void;
  interval: string;
  setInterval: (interval: string) => void;
  onFetchData: () => void;
  dataFetched: boolean;
}

export function StockSelector({
  selectedStock,
  setSelectedStock,
  range,
  setRange,
  interval,
  setInterval,
  onFetchData,
  dataFetched
}: StockSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
    >
      <div className="px-6 py-4 bg-slate-50">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-slate-500">Select Stock & Data Range</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stock Selection */}
          <div className="md:col-span-1">
            <label className="block text-sm text-slate-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Stock Symbol
            </label>
            <input
              type="text"
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
              placeholder="Enter symbol (e.g. TCS.NS)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition-all"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Range
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="1d">1 Day</option>
              <option value="5d">5 Days</option>
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
              <option value="10y">10 Years</option>
              <option value="ytd">Year to Date</option>
              <option value="max">Max</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Interval
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="1m">1 Minute</option>
              <option value="2m">2 Minutes</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="60m">60 Minutes</option>
              <option value="90m">90 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="5d">5 Days</option>
              <option value="1wk">1 Week</option>
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}