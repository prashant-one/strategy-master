import { useState, useRef } from 'react';
import { Layers, Plus, Play, Upload, Download, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RuleGroupBuilder } from './RuleGroupBuilder';
import { Rule, RuleGroup, Strategy } from '../../../views/@index';

interface StrategyBuilderProps {
  strategy: Strategy;
  setStrategy: (strategy: Strategy) => void;
  onRunBacktest: () => void;
  isRunning: boolean;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave?: () => void;
}

export function StrategyBuilder({ strategy, setStrategy, onRunBacktest, isRunning, onExport, onImport, onSave }: StrategyBuilderProps) {
  const [activeTab, setActiveTab] = useState<'entry' | 'exit'>('entry');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateEntryRules = (rules: RuleGroup) => {
    setStrategy({ ...strategy, entryRules: rules });
  };

  const updateExitRules = (rules: RuleGroup) => {
    setStrategy({ ...strategy, exitRules: rules });
  };

  const hasRules = () => {
    return (strategy.entryRules.rules && strategy.entryRules.rules.length > 0) ||
      (strategy.exitRules.rules && strategy.exitRules.rules.length > 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white border-b border-slate-200"
    >
      <div className="px-4 sm:px-6 py-4 bg-slate-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-slate-900 text-base sm:text-lg">Strategy Rules Builder</h3>
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={onSave}
                title="Save Strategy"
                className="text-slate-600 hover:text-blue-600 px-3 py-2 transition-all flex items-center gap-2 text-sm border border-slate-200 bg-white rounded"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Strategy"
              className="text-slate-600 hover:text-blue-600 px-3 py-2 transition-all flex items-center gap-2 text-sm border border-slate-200 bg-white rounded"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={onExport}
              title="Export Strategy"
              className="text-slate-600 hover:text-blue-600 px-3 py-2 transition-all flex items-center gap-2 text-sm border border-slate-200 bg-white rounded"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={onRunBacktest}
              disabled={!hasRules() || isRunning}
              title="Run Backtest"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-4 py-2 hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
              <span className="sm:hidden">{isRunning ? '...' : 'Run'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('entry')}
            className={`px-6 py-3 transition-all relative ${activeTab === 'entry'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Entry Rules
            {activeTab === 'entry' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('exit')}
            className={`px-6 py-3 transition-all relative ${activeTab === 'exit'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Exit Rules
            {activeTab === 'exit' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'entry' && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <RuleGroupBuilder
                group={strategy.entryRules}
                onChange={updateEntryRules}
                depth={0}
              />
            </motion.div>
          )}

          {activeTab === 'exit' && (
            <motion.div
              key="exit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <RuleGroupBuilder
                group={strategy.exitRules}
                onChange={updateExitRules}
                depth={0}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}