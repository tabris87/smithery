import { IRule } from './Interfaces';
import { Node } from './utils/Node';
import { Rule } from './Rule';
export declare class RuleSet {
    private _languageLimit;
    private _rules;
    constructor(rules?: Rule[]);
    private _loadDefaultRules;
    addRule(rule: IRule): void;
    addMultipleRules(rules: IRule[]): void;
    getRules(): Rule[];
    copy(): RuleSet;
    limitToLanguage(lang?: string): void;
    getMatchingRule(baseFST: Node, featureFST: Node): Rule | undefined;
}
