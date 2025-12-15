package com.prashant.application.dto.strategy;

import java.util.List;

public class RulesConfig {
    private String condition;
    private List<RuleConfig> rules;

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public List<RuleConfig> getRules() {
        return rules;
    }

    public void setRules(List<RuleConfig> rules) {
        this.rules = rules;
    }
}
