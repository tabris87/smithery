import { IRule } from './Interfaces';
import { fileImpose } from './rules';
import { Rule } from './Rule';
import { threadId } from 'worker_threads';

export class RuleSet {
  private _rules: Rule[] = [];

  constructor(rules?: Rule[]) {
    this._loadDefaultRules();
    if (rules && rules.length > 0) {
      this._rules = this._rules.concat(rules);
    }
  }

  private _loadDefaultRules(): void {
    const rulePatterns: IRule[] = [fileImpose];
    this._rules = rulePatterns.map((rp) => new Rule(rp));
  }

  public addRule(rule: IRule): void {
    this._rules.push(new Rule(rule));
  }

  public addMultipleRules(rules: IRule[]): void {
    this._rules = this._rules.concat(rules.map((rp) => new Rule(rp)));
  }

  public getRules(): Rule[] {
    return this._rules;
  }

  public getRule(ruleName: string): Rule | undefined {
    return this._rules.find(rule => rule.getID() === ruleName);
  }

  public copy(): RuleSet {
    //based on the constructor we can assume that the first rule is everytime the default rule
    return new RuleSet(this._rules.slice(1, this._rules.length).map(r => r.copy()));
  }
}
