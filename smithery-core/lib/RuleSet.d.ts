import { Node, IRule } from './Interfaces';
import { Imposer } from './Imposer';
declare class Rule {
    private _targetNodes;
    private _selector;
    private _selectorFeature;
    private _baseChecks;
    private _featureChecks;
    private _resolveCallback;
    constructor(rule: IRule);
    supportsLanguage(lang: string): boolean;
    isMatching(baseFST: Node, featureFST: Node): boolean;
    apply(baseFST: Node, featureFST: Node, context: Imposer): Node;
    private _setupSelector;
    private _createSelectorChecks;
    private _checkNodeMatching;
    private _singleNodeCheck;
    private _attributeFits;
}
export declare class RuleSet {
    private _languageLimit;
    private _rules;
    constructor(rules?: Rule[]);
    private _loadDefaultRules;
    addRule(rule: IRule): void;
    addMultipleRules(rules: IRule[]): void;
    getRules(): Rule[];
    copy(): RuleSet;
    limitToLanguage(lang: string): void;
    getMatchingRule(baseFST: Node, featureFST: Node): Rule | undefined;
}
export {};
