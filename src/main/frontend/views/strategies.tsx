import { useState, useEffect } from 'react';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useNavigate } from 'react-router';
import { Trash2, Play, Clock, Search, FileText } from 'lucide-react';
// @ts-ignore
import * as StrategyController from 'Frontend/generated/StrategyController';
import { Strategy } from './@index';
import "./index.css";

export const config: ViewConfig = {
    menu: { order: 1, icon: 'line-awesome/svg/list-solid.svg' },
    title: 'Saved Strategies',
};

interface SavedStrategy {
    id: string;
    name: string;
    savedAt: string;
    strategyJson: string;
}

export default function StrategiesView() {
    const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStrategies(0);
    }, []);

    const fetchStrategies = async (pageToFetch: number) => {
        if (loading) return;
        setLoading(true);
        try {
            // @ts-ignore
            const data = await StrategyController.getSavedStrategies(pageToFetch);
            const newStrategies = (data || []).filter((s: any) => s != null) as SavedStrategy[];

            if (pageToFetch === 0) {
                setStrategies(newStrategies);
            } else {
                setStrategies(prev => [...prev, ...newStrategies]);
            }

            setHasMore(newStrategies.length === 20); // Assuming 20 items per page
            setPage(pageToFetch);
        } catch (error) {
            console.error('Failed to fetch strategies', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        fetchStrategies(page + 1);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const key = prompt('To delete this strategy, please enter the key:');
        if (key && key.toLowerCase() === 'prashant') {
            try {
                // @ts-ignore
                await StrategyController.deleteStrategy(id);
                setStrategies(strategies.filter(s => s && s.id !== id));
            } catch (error) {
                console.error('Failed to delete strategy', error);
            }
        } else if (key !== null) {
            alert('Invalid key. Deletion cancelled.');
        }
    };

    const handleLoad = (id: string) => {
        navigate(`/?strategyId=${id}`);
    };

    const filteredStrategies = strategies.filter(s =>
        s && s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Saved Strategies</h2>
                    <p className="text-slate-500">Manage your saved trading strategies</p>
                </div>
                <div className="relative">
                    {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="text-slate-400 w-4 h-4" />
                    </div> */}
                    <input
                        type="text"
                        placeholder="Search strategies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {strategies.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No saved strategies found.</p>
                        <p className="text-sm">Create and save a strategy in the Builder to see it here.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Created</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredStrategies.map((strategy) => (
                                <tr
                                    key={strategy.id}
                                    onClick={() => handleLoad(strategy.id)}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {strategy.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 opacity-50" />
                                            {new Date(strategy.savedAt).toLocaleDateString()} {new Date(strategy.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLoad(strategy.id);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Load Strategy"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(strategy.id, e)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Strategy"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {hasMore && strategies.length > 0 && (
                <div className="mt-8 text-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Loading...' : 'Load More Strategies'}
                    </button>
                </div>
            )}
        </div>
    );
}
