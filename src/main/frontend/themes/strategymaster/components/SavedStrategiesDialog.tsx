import { Trash2, FileText, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Strategy } from '../../../views/@index';

export interface SavedStrategy {
    id: string;
    name: string;
    timestamp: number;
    strategy: Strategy;
}

interface SavedStrategiesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    strategies: SavedStrategy[];
    onLoad: (strategy: Strategy) => void;
    onDelete: (id: string) => void;
}

export function SavedStrategiesDialog({ isOpen, onClose, strategies, onLoad, onDelete }: SavedStrategiesDialogProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-400 flex items-center justify-between bg-slate-50">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Saved Strategies
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {strategies.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No saved strategies found.</p>
                                <p className="text-sm mt-1">Save your current strategy to see it here.</p>
                            </div>
                        ) : (
                            strategies.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-white border border-slate-400 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                                    onClick={() => {
                                        onLoad(item.strategy);
                                        onClose();
                                    }}
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                            <span>
                                                {item.strategy.entryRules.rules?.length || 0} Entry Rules
                                            </span>
                                            <span>
                                                {item.strategy.exitRules.rules?.length || 0} Exit Rules
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const key = prompt('To delete this strategy, please enter the key:');
                                            if (key && key.toLowerCase() === 'prashant') {
                                                onDelete(item.id);
                                            } else if (key !== null) {
                                                alert('Invalid key. Deletion cancelled.');
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Strategy"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-400 bg-white flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
