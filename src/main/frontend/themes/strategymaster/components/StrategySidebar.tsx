import { Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Strategy } from '../../../views/@index';

export interface SavedStrategy {
    id: string;
    name: string;
    timestamp: number;
    strategy: Strategy;
}

interface StrategySidebarProps {
    strategies: SavedStrategy[];
    onLoad: (strategy: Strategy) => void;
    onDelete: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export function StrategySidebar({ strategies, onLoad, onDelete, isOpen, onToggle }: StrategySidebarProps) {
    return (
        <>
            {/* Toggle Button (when closed) */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="fixed left-0 top-24 z-30 bg-white border border-slate-400 p-2 rounded-r-md shadow-md hover:bg-slate-50 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            )}

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-slate-400 shadow-xl z-[60] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-400 flex items-center justify-between bg-slate-50">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Saved Strategies
                            </h2>
                            <button
                                onClick={onToggle}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {strategies.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No saved strategies yet.
                                    <br />
                                    Save your first one!
                                </div>
                            ) : (
                                strategies.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group bg-white border border-slate-400 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer relative"
                                        onClick={() => onLoad(item.strategy)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(item.timestamp).toLocaleDateString()} at{' '}
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
                                                title="Delete Strategy"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-400 bg-slate-50 text-xs text-slate-500 text-center">
                            {strategies.length} strategies saved
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay for mobile (optional) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={onToggle}
                />
            )}
        </>
    );
}
