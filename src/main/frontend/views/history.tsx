import { useState, useEffect } from 'react';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useNavigate } from 'react-router';
import { Clock, TrendingUp, AlertTriangle, PlayCircle, ExternalLink } from 'lucide-react';
// @ts-ignore
import * as StrategyEndpint from 'Frontend/generated/StrategyEndpint';
import "./index.css";

export const config: ViewConfig = {
    menu: { order: 2, icon: 'line-awesome/svg/history-solid.svg' },
    title: 'Execution History',
};

interface RunResult {
    id: number;
    strategyId: string;
    strategyName: string;
    symbol: string;
    rangeParam: string;
    intervalParam: string;
    profitLoss: number;
    totalTrades: number;
    winRate: number;
    ranAt: string;
}

export default function HistoryView() {
    const [results, setResults] = useState<RunResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async (pageToFetch: number = 0, append: boolean = false) => {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await StrategyEndpint.getRunResults(pageToFetch);
            const validResults = (data || []).filter((item: any) => item != null) as RunResult[];

            if (append) {
                setResults(prev => [...prev, ...validResults]);
            } else {
                setResults(validResults);
            }

            setHasMore(validResults.length === 20);
        } catch (error) {
            console.error('Failed to fetch run history', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage, true);
    };

    // const handleRunNow = async () => {
    //     if (!confirm('This will trigger a run for all saved strategies. Continue?')) return;
    //     try {
    //         // @ts-ignore
    //         await StrategyEndpint.runScheduledNow();
    //         fetchHistory();
    //     } catch (error) {
    //         console.error('Manual run failed', error);
    //     }
    // };

    const handleRowClick = (result: RunResult) => {
        if (result.strategyId && result.strategyId !== 'Manual') {
            navigate(`/?strategyId=${result.strategyId}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Execution History</h2>
                    <p className="text-slate-500">Track the performance of your automated strategy runs</p>
                </div>
                {/* <button
                    onClick={handleRunNow}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" />
                    Run All Now
                </button> */}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {results.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        {loading ? (
                            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        ) : (
                            <>
                                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No execution history found.</p>
                                <p className="text-sm">Scheduled runs will appear here once they are completed.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Strategy</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Symbol / Period</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Run Date</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trades</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Win Rate</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Profit/Loss</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {results.map((result) => (
                                    <tr
                                        key={result.id}
                                        onClick={() => handleRowClick(result)}
                                        className={`transition-colors ${result.strategyId && result.strategyId !== 'Manual'
                                            ? 'hover:bg-slate-50 cursor-pointer group'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {result.strategyName}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono">{result.strategyId.substring(0, 8)}...</div>
                                                </div>
                                                {result.strategyId && result.strategyId !== 'Manual' && (
                                                    <ExternalLink className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-700">{result.symbol}</div>
                                            <div className="text-xs text-slate-500">{result.rangeParam} / {result.intervalParam}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 opacity-50" />
                                                {new Date(result.ranAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                                            {result.totalTrades}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${result.winRate >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {result.winRate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`font-bold ${result.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {result.profitLoss >= 0 ? '+' : ''}{result.profitLoss.toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {hasMore && (
                <div className="mt-6 text-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all font-medium shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
