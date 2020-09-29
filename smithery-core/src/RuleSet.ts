import * as cssWhat from 'css-what';

import { Node, IRule } from './Interfaces';
import { fileImpose } from './rules';
import { Imposer } from './Imposer';

declare type SelectorCheck = {
  pathRegex: RegExp,
  propertyChecks: { [key: number]: ExtendedSelector },
  attributes: [],
  name: ''
}

declare type ExtendedSelector = cssWhat.Selector & { level: number, name?: string, action?: string, attributes?: ExtendedSelector[] };

class Rule {
  private _targetNodes: string[];
  private _selector: string;
  private _selectorFeature: string;
  private _baseChecks: SelectorCheck[];
  private _featureChecks: SelectorCheck[];
  private _resolveCallback: (baseFST: Node, featureFST: Node, context?: Imposer) => Node;

  constructor(rule: IRule) {
    if (Array.isArray(rule.target)) {
      this._targetNodes = rule.target;
    } else if (typeof rule.target === 'string') {
      this._targetNodes = [rule.target];
    } else {
      this._targetNodes = [];
    }

    this._selector = rule.selector;
    this._selectorFeature = rule?.selectorFeature || rule.selector;
    this._resolveCallback = rule.apply.bind(this);
    this._baseChecks = this._setupSelector(this._selector);
    this._featureChecks = this._setupSelector(this._selectorFeature);
  }

  public supportsLanguage(lang: string): boolean {
    return this._targetNodes.find((tar: string) => tar.toLowerCase() === lang.toLowerCase()) !== undefined;
  }

  public isMatching(baseFST: Node, featureFST: Node): boolean {
    // check if the path contains the correct form for the css selector
    const result: boolean =
      this._checkNodeMatching(baseFST, this._baseChecks) && this._checkNodeMatching(featureFST, this._featureChecks);
    return result;
  }

  public apply(baseFST: Node, featureFST: Node, context: Imposer): Node {
    return this._resolveCallback(baseFST, featureFST, context);
  }

  private _setupSelector(selector: string): SelectorCheck[] {
    const cssList: cssWhat.Selector[][] = cssWhat.parse(selector, {
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
      xmlMode: false,
    });

    return cssList.map((cssPart: cssWhat.Selector[]) => this._createSelectorChecks(cssPart));
  }

  private _createSelectorChecks(cssPart: cssWhat.Selector[]): SelectorCheck {
    // #region selectorBuildExplanation

    // Test mit mehreren sollte zu Regex führen
    // File[ending]>Whatever Test,
    // File[ending=JS]>Whatever Test,
    // Resultat: File\.Whatever\.[\w.]*Text
    /*
     * Array(6):
        0: {type: "tag", name: "file"}
        1: {type: "attribute", name: "ending", action: "exists", value: "", ignoreCase: false},
           {type: "attribute", name: "ending", action: "equals", value: "JS", ignoreCase: false}
        2: {type: "child"}
        3: {type: "tag", name: "whatever"}
        4: {type: "descendant"}
        5: {type: "tag", name: "test"}
     */
    /*
    var temp = cssList.map((oToken) => {
        if (oToken.type === "tag") {
            return oToken.name;
        }
        if (oToken.type === "child") {
            return "\\.";
        }
        if (oToken.type === "descendant") {
            return "\\.[\\w.]*"
        }
    }).filter(oPart => oPart);
    //the last tag has to be at the end of the string.
    temp[temp.length - 1] = "(" + temp[temp.length - 1] + ")$"
    var pathRegExp = new RegExp(temp.join(''));
    var level = 0;
    var checks = {};
    cssList.map((oToken) => {
        if (oToken.type === "tag") {
            level++;
        }
        oToken.level = level;
        return oToken;
    }).forEach((oToken) => {
        if (oToken.type === "tag") {
            checks[oToken.level] = oToken;
        }
        if (oToken.type === "attribute") {
            var attributes = checks[oToken.level]['attributes'];
            if (!attributes) {
                attributes = [];
            }
            attributes.push(oToken);
            checks[oToken.level]['attributes'] = attributes;
        }
    });
    Object.keys(checks).forEach((sKey) => {
        if (!checks[sKey].attributes) {
            delete checks[sKey]
        }
    });
    return {
        pathRegex: pathRegExp,
        propertyChecks: checks
    }*/
    //#endregion
    const temp = cssPart
      .map((token: cssWhat.Selector) => {
        if (token.type === 'tag') {
          return token.name;
        }
        if (token.type === 'child') {
          return '\\.';
        }
        if (token.type === 'descendant') {
          return '\\.[\\w.]*';
        }
      })
      .filter((part) => part);

    temp[temp.length - 1] = `(${temp[temp.length - 1]})$`;
    const pathRegExp: RegExp = new RegExp(temp.join(''));
    let level: number = 0;
    const checks: { [key: number]: ExtendedSelector } = {};
    cssPart
      .map((token: cssWhat.Selector) => {
        if (token.type === 'tag') {
          level++;
        }
        const refactoredToken: ExtendedSelector = { ...token, level: level };
        return refactoredToken;
      })
      .forEach((token: ExtendedSelector) => {
        if (token.type === 'tag') {
          checks[token.level] = token;
        }
        if (token.type === 'attribute') {
          let attributes = checks[token.level].attributes;
          if (!attributes) {
            attributes = [];
          }
          attributes.push(token);
          checks[token.level].attributes = attributes;
        }
      });

    Object.keys(checks).forEach((key: string) => {
      if (!checks[parseInt(key, 10)].attributes) {
        delete checks[parseInt(key, 10)];
      }
    });

    return {
      pathRegex: pathRegExp,
      propertyChecks: checks,
      attributes: [],
      name: ''
    };
  }

  private _checkNodeMatching(node: Node, checks: SelectorCheck[]) {
    return checks.some((check) => this._singleNodeCheck(node, check));
  }

  private _singleNodeCheck(node: Node, check: SelectorCheck): boolean {
    if (node.path && check.pathRegex.exec(node.path) !== null) {
      // check if the properties or the properties of the parents match the css selector
      if (Object.keys(check.propertyChecks).length > 0) {
        // check bottom to top
        const checkKeys: string[] = Object.keys(check.propertyChecks).slice().reverse();
        let latestNode: Node = node;
        for (const index of checkKeys) {
          /* 0: {type: "tag", name: "file"} 
             1: {type: "attribute", name: "ending", action: "exists", value: "", ignoreCase: false} */
          const checkProp = check.propertyChecks[parseInt(index, 10)];
          // iterate upwards until we found the correct one or the root node
          while (latestNode.type !== check.name && latestNode.parent) {
            if (latestNode.parent) {
              latestNode = latestNode.parent;
            }
          }

          //Just to ensure they are not undefined ... (Hello TypeScript -_-)
          if (typeof checkProp.attributes === 'undefined') {
            checkProp.attributes = [];
          }

          for (const attributeCheck of checkProp.attributes) {
            const attCheck = attributeCheck as cssWhat.AttributeSelector;
            if (!attCheck.name) {
              continue;
            }
            const attName: string = attCheck.name;
            if (attCheck.action === 'exists' && typeof latestNode.getAttribute(attName) === 'undefined') {
              return false;
            }
            if (attCheck.action === 'equals' &&
              !(typeof latestNode.getAttribute(attName) !== 'undefined' && this._attributeFits(latestNode.getAttribute(attName), attCheck.value))) {
              return false;
            }
          }
        }
        // if everything matches we return with true;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  private _attributeFits(nodeAtt: string, expectedValue: string): boolean {
    const objRegex: RegExp = /\{(\w+)=(\w+)\}/;
    const m = objRegex.exec(expectedValue);

    if (m !== null) {
      // The result can be accessed through the 'm'-variable.
      if (typeof nodeAtt === 'object' && !Array.isArray(nodeAtt)) {
        const attribute = nodeAtt[m[1]];
        if (typeof attribute === 'object') {
          return false;
        } else {
          return attribute === m[2];
        }
      } else {
        return false;
      }
    } else {
      return nodeAtt === expectedValue;
    }
  }
}

export class RuleSet {
  private _languageLimit: string = '';
  private _rules: Rule[] = [];

  constructor(rules?: Rule[]) {
    if (rules && rules.length > 0) {
      this._rules = rules;
    } else {
      this._loadDefaultRules();
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
    return new RuleSet(this._rules);
  }

  public limitToLanguage(lang: string): void {
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
