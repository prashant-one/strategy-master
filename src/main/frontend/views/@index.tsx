import { useState, useEffect } from 'react';
import { StockSelector } from '../themes/strategymaster/components/StockSelector';
import { StrategyBuilder } from '../themes/strategymaster/components/StrategyBuilder';
import { SaveStrategyDialog } from '../themes/strategymaster/components/SaveStrategyDialog';
import { DSLPreview } from '../themes/strategymaster/components/DSLPreview';
import { BacktestResults } from '../themes/strategymaster/components/BacktestResults';
import { useSearchParams } from 'react-router';
import { TrendingUp, Zap } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import "./index.css";
// @ts-ignore
import * as StrategyController from 'Frontend/generated/StrategyController';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';

export const config: ViewConfig = {
  menu: { order: 0, icon: 'line-awesome/svg/chart-line-solid.svg' },
  title: 'Strategy Builder',
};

export interface Rule {
  id: string;
  indicator: string;
  operator: string;
  value: string;
  params?: Array<{ name: string; value: string }>;
  compareType?: 'value' | 'indicator';
  compareIndicator?: string;
  compareParams?: Array<{ name: string; value: string }>;
}

export interface RuleGroup {
  id: string;
  type: 'group' | 'rule';
  condition?: 'AND' | 'OR';
  rules?: RuleGroup[];
  rule?: Rule;
}

export interface Strategy {
  entryRules: RuleGroup;
  exitRules: RuleGroup;
}

export default function App() {
  const [selectedStock, setSelectedStock] = useState('TCS.NS');
  const [range, setRange] = useState('1y');
  const [interval, setInterval] = useState('1d');
  // const [dataFetched, setDataFetched] = useState(false); // Removed
  const [strategy, setStrategy] = useState<Strategy>({
    entryRules: { id: '1', type: 'group', condition: 'AND', rules: [] },
    exitRules: { id: '2', type: 'group', condition: 'AND', rules: [] }
  });
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Persistence State
  const [searchParams] = useSearchParams();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  useEffect(() => {
    const strategyId = searchParams.get('strategyId');
    if (strategyId) {
      loadStrategy(strategyId);
    }
  }, [searchParams]);

  const loadStrategy = async (id: string) => {
    try {
      // @ts-ignore
      const saved = await StrategyController.getStrategy(id);
      if (saved && saved.strategyJson) {
        setStrategy(JSON.parse(saved.strategyJson));
      }
    } catch (e) {
      console.error("Failed to load strategy", e);
    }
  };

  const handleSaveStrategy = () => {
    setIsSaveDialogOpen(true);
  };

  const onSaveStrategy = async (name: string) => {
    // @ts-ignore
    await StrategyController.saveStrategy({
      name: name.trim(),
      strategyJson: JSON.stringify(strategy)
    });
  };

  // Removed handleFetchData

  const mapToBackendConfig = (node: RuleGroup): any => {
    if (node.type === 'group') {
      return {
        condition: node.condition,
        rules: node.rules?.map(mapToBackendConfig) || []
      };
    } else if (node.type === 'rule' && node.rule) {
      return {
        indicator: node.rule.indicator,
        operator: node.rule.operator,
        value: node.rule.value,
        params: node.rule.params,
        compareType: node.rule.compareType,
        compareIndicator: node.rule.compareIndicator,
        compareParams: node.rule.compareParams
      };
    }
    return {};
  };

  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const request = {
        stockSymbol: selectedStock,
        range: range,
        interval: interval,
        entry: mapToBackendConfig(strategy.entryRules),
        exit: mapToBackendConfig(strategy.exitRules)
      };
      // @ts-ignore
      const result = await StrategyController.runBacktest(request);
      setBacktestResults(result);
    } catch (error: any) {
      console.error("Backtest failed", error);
      toast.error(error.message || "Failed to run backtest. Please check your strategy and stock symbol.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportStrategy = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(strategy, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "strategy.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportStrategy = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsedStrategy = JSON.parse(content);
        if (parsedStrategy.entryRules && parsedStrategy.exitRules) {
          setStrategy(parsedStrategy);
          toast.success('Strategy imported successfully!');
        } else {
          toast.error('Invalid strategy file format. The file must contain "entryRules" and "exitRules".');
          console.error("Invalid strategy file format", parsedStrategy);
        }
      } catch (error) {
        toast.error('Failed to import strategy. The file is not valid JSON format.');
        console.error("Error parsing JSON", error);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read the file. Please try again.');
    };
    reader.readAsText(fileObj);
    event.target.value = '';
  };

  const generateEquityCurve = () => {
    const data = [];
    let value = 100000;
    const days = 250;

    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.45) * 2000;
      value += change;
      data.push({
        day: i + 1,
        value: Math.round(value),
        date: new Date(2024, 0, i + 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    return data;
  };


  return (
    <div className="min-h-screen bg-slate-50">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stock Selection & Strategy Builder */}
          <div className="lg:col-span-2 space-y-6">
            <StockSelector
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              range={range}
              setRange={setRange}
              interval={interval}
              setInterval={setInterval}
              onFetchData={() => { }} // No-op
              dataFetched={true} // Always match
            />

            {/* Removed dataFetched condition */}
            <>
              <StrategyBuilder
                strategy={strategy}
                setStrategy={setStrategy}
                onRunBacktest={handleRunBacktest}
                isRunning={isRunning}
                onExport={handleExportStrategy}
                onImport={handleImportStrategy}
                onSave={handleSaveStrategy}
              />
            </>

            {backtestResults && (
              <BacktestResults results={backtestResults} />
            )}
          </div>

          {/* Right Column - DSL Preview */}
          <div className="lg:col-span-1">
            {/* Removed dataFetched condition */}
            <div className="sticky top-24">
              <DSLPreview strategy={strategy} />
            </div>
          </div>
        </div>
      </main>
      <SaveStrategyDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={onSaveStrategy}
      />
      <Toaster position="top-right" richColors />
    </div>
  );
}