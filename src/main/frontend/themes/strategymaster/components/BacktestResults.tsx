import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface BacktestResultsProps {
  results: {
    winRate: number;
    profitLoss: number;
    maxDrawdown: number;
    sharpeRatio: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    equityCurve: Array<{ day: number; value: number; date: string }>;
    trades: Array<{ id: number; entryDate: string; exitDate: string; profit: string; return: string }>;
  };
}

export function BacktestResults({ results }: BacktestResultsProps) {
  const metrics = [
    {
      label: 'Win Rate',
      value: `${results.winRate}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: results.winRate > 50 ? 'up' : 'down'
    },
    {
      label: 'Profit/Loss',
      value: `₹${results.profitLoss.toLocaleString()}`,
      icon: DollarSign,
      color: results.profitLoss > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: results.profitLoss > 0 ? 'bg-green-50' : 'bg-red-50',
      trend: results.profitLoss > 0 ? 'up' : 'down'
    },
    {
      label: 'Max Drawdown',
      value: `${results.maxDrawdown}%`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'down'
    },
    {
      label: 'Sharpe Ratio',
      value: results.sharpeRatio.toFixed(2),
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: results.sharpeRatio > 1 ? 'up' : 'neutral'
    },
    {
      label: 'Total Trades',
      value: results.totalTrades,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'neutral'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white">Backtest Results</h2>
            <p className="text-sm text-green-100">Strategy performance analysis</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="bg-white border border-slate-200 p-4 hover:border-blue-300 transition-all"
          >
            <div className={`inline-flex p-2 ${metric.bgColor} mb-2`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div className="text-sm text-slate-600 mb-1">{metric.label}</div>
            <div className={`text-slate-900 ${metric.color}`}>{metric.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Win/Loss Breakdown */}
      <div className="bg-white border border-slate-200 p-6">
        <h3 className="text-slate-900 mb-4">Trade Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50">
            <span className="text-sm text-green-700">Winning Trades</span>
            <span className="text-green-900">{results.winningTrades}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50">
            <span className="text-sm text-red-700">Losing Trades</span>
            <span className="text-red-900">{results.losingTrades}</span>
          </div>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="bg-white border border-slate-200 p-6">
        <h3 className="text-slate-900 mb-4">Equity Curve</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.equityCurve}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-slate-900">Recent Trades</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Trade ID</th>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Entry Date</th>
                <th className="px-6 py-3 text-left text-xs text-slate-600">Exit Date</th>
                <th className="px-6 py-3 text-right text-xs text-slate-600">Profit/Loss</th>
                <th className="px-6 py-3 text-right text-xs text-slate-600">Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900">#{trade.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{trade.entryDate}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{trade.exitDate}</td>
                  <td className={`px-6 py-4 text-sm text-right ${parseFloat(trade.profit) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    ₹{parseFloat(trade.profit).toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right ${parseFloat(trade.return) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {parseFloat(trade.return) > 0 ? '+' : ''}{trade.return}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}