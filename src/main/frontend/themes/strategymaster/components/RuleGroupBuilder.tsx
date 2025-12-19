import { Plus, Folder } from 'lucide-react';
import { motion } from 'motion/react';
import { RuleBlock } from './RuleBlock';
import { Rule, RuleGroup } from '../../../views/@index';

interface RuleGroupBuilderProps {
  group: RuleGroup;
  onChange: (group: RuleGroup) => void;
  depth: number;
}

export function RuleGroupBuilder({ group, onChange, depth }: RuleGroupBuilderProps) {
  const addRule = () => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      indicator: 'RSI',
      operator: '<',
      value: '30',
      params: [{ name: 'period', value: '14' }],
      compareType: 'value'  // NEW: Default to comparing with value
    };

    const newRules = [...(group.rules || []), { id: `wrapper-${Date.now()}`, type: 'rule' as const, rule: newRule }];
    onChange({ ...group, rules: newRules });
  };

  const addGroup = () => {
    const newGroup: RuleGroup = {
      id: `group-${Date.now()}`,
      type: 'group',
      condition: 'AND',
      rules: []
    };

    const newRules = [...(group.rules || []), newGroup];
    onChange({ ...group, rules: newRules });
  };

  const updateRule = (index: number, updatedItem: Rule | RuleGroup) => {
    const newRules = [...(group.rules || [])];
    const item = newRules[index];
    if ('type' in item && item.type === 'rule') {
      newRules[index] = { ...item, rule: updatedItem as Rule };
    } else {
      newRules[index] = updatedItem as RuleGroup;
    }
    onChange({ ...group, rules: newRules });
  };

  const deleteRule = (index: number) => {
    const newRules = (group.rules || []).filter((_, i) => i !== index);
    onChange({ ...group, rules: newRules });
  };

  const toggleCondition = () => {
    onChange({ ...group, condition: group.condition === 'AND' ? 'OR' : 'AND' });
  };

  const bgColor = depth === 0 ? 'bg-white' : depth === 1 ? 'bg-blue-50' : 'bg-purple-50';
  const borderColor = depth === 0 ? 'border-slate-400' : depth === 1 ? 'border-blue-200' : 'border-purple-200';

  return (
    <div className={`${bgColor} ${borderColor} border-l-2 p-4`}>
      {/* Group Header */}
      {depth > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-slate-600">Nested Group</span>
        </div>
      )}

      {/* Rules */}
      <div className="space-y-3">
        {group.rules?.map((item, index) => (
          <div key={item.id}>
            {index > 0 && (
              <div className="flex justify-center my-2">
                <button
                  onClick={toggleCondition}
                  className="px-4 py-1 bg-white border border-slate-400 text-sm hover:bg-slate-50 transition-all"
                >
                  {group.condition}
                </button>
              </div>
            )}

            {'type' in item && item.type === 'rule' && item.rule ? (
              <RuleBlock
                rule={item.rule}
                onChange={(updatedRule) => updateRule(index, updatedRule)}
                onDelete={() => deleteRule(index)}
              />
            ) : (
              <RuleGroupBuilder
                group={item as RuleGroup}
                onChange={(updatedGroup) => updateRule(index, updatedGroup)}
                depth={depth + 1}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add Buttons */}
      <div className="flex gap-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addRule}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </motion.button>

        {depth < 2 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addGroup}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
          >
            <Folder className="w-4 h-4" />
            Add Group
          </motion.button>
        )}
      </div>
    </div>
  );
}