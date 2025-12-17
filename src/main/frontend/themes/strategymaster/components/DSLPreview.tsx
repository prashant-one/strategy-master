import { useState } from 'react';
import { Code, FileJson, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Rule, RuleGroup, Strategy } from '../../../views/@index';

interface DSLPreviewProps {
  strategy: Strategy;
}

export function DSLPreview({ strategy }: DSLPreviewProps) {
  const [activeFormat, setActiveFormat] = useState<'dsl' | 'json'>('dsl');
  const [copied, setCopied] = useState(false);

  const generateDSL = (group: RuleGroup, indent: string = ''): string => {
    if (!group.rules || group.rules.length === 0) {
      return indent + '// No rules defined';
    }

    const lines: string[] = [];

    const formatParams = (params?: Array<{ name: string; value: string }>) => {
      if (!params || !Array.isArray(params) || params.length === 0) return '';
      return `(${params.map(p => p.value).join(', ')})`;
    };

    group.rules.forEach((item, index) => {
      if (index > 0 && group.condition) {
        lines.push(indent + group.condition);
      }

      if (item.type === 'rule' && item.rule) {
        const rule = item.rule;
        const leftSide = `${rule.indicator}${formatParams(rule.params)}`;
        const rightSide = rule.compareType === 'indicator'
          ? `${rule.compareIndicator || 'SMA'}${formatParams(rule.compareParams)}`
          : rule.value;
        const ruleStr = `${leftSide} ${rule.operator} ${rightSide}`;
        lines.push(indent + ruleStr);
      } else if (item.type === 'group') {
        lines.push(indent + '(');
        lines.push(generateDSL(item as RuleGroup, indent + '  '));
        lines.push(indent + ')');
      }
    });

    return lines.join('\n');
  };

  const generateJSON = (group: RuleGroup): any => {
    if (!group.rules || group.rules.length === 0) {
      return null;
    }

    return {
      condition: group.condition,
      rules: group.rules.map((item) => {
        if (item.type === 'rule' && item.rule) {
          const rule = item.rule;
          const ruleData: any = {
            indicator: rule.indicator,
            params: rule.params,
            operator: rule.operator
          };

          // Add comparison data based on type
          if (rule.compareType === 'indicator') {
            ruleData.compareType = 'indicator';
            ruleData.compareIndicator = rule.compareIndicator;
            ruleData.compareParams = rule.compareParams;
          } else {
            ruleData.compareType = 'value';
            ruleData.value = rule.value;
          }

          return ruleData;
        } else {
          return generateJSON(item as RuleGroup);
        }
      })
    };
  };

  const dslEntry = generateDSL(strategy.entryRules);
  const dslExit = generateDSL(strategy.exitRules);

  const jsonOutput = {
    entry: generateJSON(strategy.entryRules),
    exit: generateJSON(strategy.exitRules)
  };

  const handleCopy = () => {
    const content = activeFormat === 'dsl'
      ? `ENTRY:\n${dslEntry}\n\nEXIT:\n${dslExit}`
      : JSON.stringify(jsonOutput, null, 2);

    // Fallback method that works without clipboard permissions
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
    >
      <div className="px-6 py-4 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-600" />
            <h2 className="text-slate-900">Strategy Preview</h2>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 text-slate-600 hover:bg-slate-100 transition-all"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Format Tabs */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="px-6 flex gap-1">
          <button
            onClick={() => setActiveFormat('dsl')}
            className={`px-4 py-2 text-sm transition-all ${activeFormat === 'dsl'
              ? 'text-purple-600 bg-white border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Code className="w-3 h-3 inline mr-1" />
            DSL
          </button>
          <button
            onClick={() => setActiveFormat('json')}
            className={`px-4 py-2 text-sm transition-all ${activeFormat === 'json'
              ? 'text-purple-600 bg-white border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <FileJson className="w-3 h-3 inline mr-1" />
            JSON
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeFormat === 'dsl' ? (
          <div className="space-y-4">
            {/* Entry Rules */}
            <div>
              <div className="text-xs text-green-600 mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-600"></div>
                ENTRY RULES
              </div>
              <pre className="bg-slate-900 text-green-400 p-4 text-sm overflow-x-auto font-mono">
                {dslEntry}
              </pre>
            </div>

            {/* Exit Rules */}
            <div>
              <div className="text-xs text-red-600 mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-600"></div>
                EXIT RULES
              </div>
              <pre className="bg-slate-900 text-red-400 p-4 text-sm overflow-x-auto font-mono">
                {dslExit}
              </pre>
            </div>
          </div>
        ) : (
          <div>
            <pre className="bg-slate-900 text-blue-400 p-4 text-sm overflow-x-auto font-mono">
              {JSON.stringify(jsonOutput, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}