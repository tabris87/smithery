import { IRule } from './Interfaces';
import { Node } from './utils/Node';
import { fileImpose } from './rules';
import { Rule } from './Rule';

export class RuleSet {
  private _languageLimit: string = '';
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

  public copy(): RuleSet {
    //based on the constructor we can assume that the first rule is everytime the default rule
    return new RuleSet(this._rules.slice(1, this._rules.length).map(r => r.copy()));
  }

  public limitToLanguage(lang: string = ''): void {
    this._languageLimit = lang;
  }

  public getMatchingRule(baseFST: Node, featureFST: Node): Rule | undefined {
    let aUsageRules = this._rules;
    if (this._languageLimit !== '') {
      aUsageRules = aUsageRules.filter((rule) => rule.supportsLanguage(this._languageLimit));
    }

    const resultingRules = aUsageRules.filter((rule) => rule.isMatching(baseFST, featureFST));
    if (resultingRules.length > 1) {
      // tslint:disable-next-line: no-console
      console.warn(
        'More than one rule is matching! Taking the first one to proceed. Result can differ from expected Result.',
      );
    }

    return resultingRules[0];
  }
}
