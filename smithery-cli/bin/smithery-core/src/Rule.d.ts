import { IRule } from './Interfaces';
import { Node } from './utils/Node';
import { Imposer } from './Imposer';
export declare class Rule {
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
