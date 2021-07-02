import { IRule } from './Interfaces';
import { Imposer } from './Imposer';
import { FSTNode } from './utils/FSTNode';
import { FSTNonTerminal } from './utils/FSTNonTerminal';

export class Rule {
  private _setupParameter: IRule;
  private _id: string;
  private _resolveCallback: IRule["apply"];

  constructor(rule: IRule) {
    this._setupParameter = rule;

    this._resolveCallback = rule.apply.bind(this);
    this._id = rule.id;
  }

  public apply(baseFST: FSTNode, featureFST: FSTNode, targetNode: FSTNode, parent: FSTNonTerminal | undefined, context: Imposer): void {
    return this._resolveCallback(baseFST, featureFST, targetNode, parent, context);
  }

  public copy(): Rule {
    return new Rule(this._setupParameter);
  }

  public getID(): string {
    return this._id;
  }
}