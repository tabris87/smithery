import { Node } from './interfaces';
export declare class Rule {
    private _targetNodes;
    private _selector;
    private _selectorFeature;
    private _baseChecks;
    private _featureChecks;
    private _resolveCallback;
    constructor(rule: RulePattern);
    supportsLanguage(lang: string): boolean;
    isMatching(baseFST: Node, featureFST: Node): boolean;
    apply(baseFST: Node, featureFST: Node, context: any): Node;
    private _setupSelector;
    private _createSelectorChecks;
    private _checkNodeMatching;
    private _singleNodeCheck;
    private _attributeFits;
}
export interface RulePattern {
    apply: (baseFST: Node, featureFST: Node, context?: {}) => Node | Node[];
    target: string | string[];
    selector: string;
    selectorFeature?: string;
}
export declare class RuleSet {
    private _languageLimit;
    private _rules;
    constructor(rules?: Rule[]);
    private _loadDefaultRules;
    addRule(rule: RulePattern): void;
    addMultipleRules(rules: RulePattern[]): void;
    getRules(): Rule[];
    copy(): RuleSet;
    limitToLanguage(lang: string): void;
    getMatchingRule(baseFST: Node, featureFST: Node): Rule | undefined;
}
