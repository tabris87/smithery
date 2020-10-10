"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rules_1 = require("./rules");
const Rule_1 = require("./Rule");
class RuleSet {
    constructor(rules) {
        this._languageLimit = '';
        this._rules = [];
        if (rules && rules.length > 0) {
            this._rules = rules;
        }
        else {
            this._loadDefaultRules();
        }
    }
    _loadDefaultRules() {
        const rulePatterns = [rules_1.fileImpose];
        this._rules = rulePatterns.map((rp) => new Rule_1.Rule(rp));
    }
    addRule(rule) {
        this._rules.push(new Rule_1.Rule(rule));
    }
    addMultipleRules(rules) {
        this._rules = this._rules.concat(rules.map((rp) => new Rule_1.Rule(rp)));
    }
    getRules() {
        return this._rules;
    }
    copy() {
        return new RuleSet(this._rules);
    }
    limitToLanguage(lang = '') {
        this._languageLimit = lang;
    }
    getMatchingRule(baseFST, featureFST) {
        let aUsageRules = this._rules;
        if (this._languageLimit !== '') {
            aUsageRules = aUsageRules.filter((rule) => rule.supportsLanguage(this._languageLimit));
        }
        const resultingRules = aUsageRules.filter((rule) => rule.isMatching(baseFST, featureFST));
        if (resultingRules.length > 1) {
            // tslint:disable-next-line: no-console
            console.warn('More than one rule is matching! Taking the first one to proceed. Result can differ from expected Result.');
        }
        return resultingRules[0];
    }
}
exports.RuleSet = RuleSet;
//# sourceMappingURL=RuleSet.js.map