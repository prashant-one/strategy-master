package com.prashant.application.dto.strategy;

import java.util.List;

public class RuleConfig {
    private String indicator;
    private List<RuleParam> params;
    private String operator;
    private String compareType;
    private String value;
    private String compareIndicator;
    private List<RuleParam> compareParams;

    // For nested groups
    private String condition;
    private List<RuleConfig> rules;

    public String getIndicator() {
        return indicator;
    }

    public void setIndicator(String indicator) {
        this.indicator = indicator;
    }

    public List<RuleParam> getParams() {
        return params;
    }

    public void setParams(List<RuleParam> params) {
        this.params = params;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getCompareType() {
        return compareType;
    }

    public void setCompareType(String compareType) {
        this.compareType = compareType;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getCompareIndicator() {
        return compareIndicator;
    }

    public void setCompareIndicator(String compareIndicator) {
        this.compareIndicator = compareIndicator;
    }

    public List<RuleParam> getCompareParams() {
        return compareParams;
    }

    public void setCompareParams(List<RuleParam> compareParams) {
        this.compareParams = compareParams;
    }

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

    public boolean isGroup() {
        return rules != null && !rules.isEmpty();
    }
}
