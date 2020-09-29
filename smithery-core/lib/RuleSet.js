"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleSet = exports.Rule = void 0;
const cssWhat = require("css-what");
const rules_1 = require("./rules");
class Rule {
    constructor(rule) {
        if (Array.isArray(rule.target)) {
            this._targetNodes = rule.target;
        }
        else if (typeof rule.target === 'string') {
            this._targetNodes = [rule.target];
        }
        else {
            this._targetNodes = [];
        }
        this._selector = rule.selector;
        this._selectorFeature = (rule === null || rule === void 0 ? void 0 : rule.selectorFeature) || rule.selector;
        this._resolveCallback = rule.apply.bind(this);
        this._baseChecks = this._setupSelector(this._selector);
        this._featureChecks = this._setupSelector(this._selectorFeature);
    }
    supportsLanguage(lang) {
        return true;
    }
    isMatching(baseFST, featureFST) {
        // check if the path contains the correct form for the css selector
        const result = this._checkNodeMatching(baseFST, this._baseChecks) && this._checkNodeMatching(featureFST, this._featureChecks);
        return result;
    }
    apply(baseFST, featureFST, context) {
        return this._resolveCallback(baseFST, featureFST, context);
    }
    _setupSelector(selector) {
        const cssList = cssWhat.parse(selector, {
            lowerCaseTags: false,
            lowerCaseAttributeNames: false,
            xmlMode: false,
        });
        return cssList.map((cssPart) => this._createSelectorChecks(cssPart));
    }
    _createSelectorChecks(cssPart) {
        const temp = cssPart
            .map((token) => {
            if (token.type === 'tag') {
                return token.normalize;
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
        const pathRegExp = new RegExp(temp.join(''));
        let level = 0;
        const checks = {};
        cssPart
            .map((token) => {
            if (token.type === 'tag') {
                level++;
            }
            token.level = level;
            return token;
        })
            .forEach((token) => {
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
        Object.keys(checks).forEach((key) => {
            if (!checks[key].attributes) {
                delete checks[key];
            }
        });
        return {
            pathRegex: pathRegExp,
            propertyChecks: checks,
            attributes: [],
            name: '',
        };
    }
    _checkNodeMatching(node, checks) {
        return checks.some((check) => this._singleNodeCheck(node, check));
    }
    _singleNodeCheck(node, check) {
        if (node.path && check.pathRegex.exec(node.path) !== null) {
            // check if the properties or the properties of the parents match the css selector
            if (Object.keys(check.propertyChecks).length > 0) {
                // check bottom to top
                const checkKeys = Object.keys(check.propertyChecks).slice().reverse();
                let latestNode = node;
                for (const index of checkKeys) {
                    /* 0: {type: "tag", name: "file"}
                       1: {type: "attribute", name: "ending", action: "exists", value: "", ignoreCase: false} */
                    const checkProp = check.propertyChecks[index];
                    // iterate upwards until we found the correct one or the root node
                    while (latestNode.type !== check.name && latestNode.parent) {
                        if (latestNode.parent) {
                            latestNode = latestNode.parent;
                        }
                    }
                    for (const attCheck of checkProp.attributtes) {
                        const attName = attCheck.name;
                        if (attCheck.action === 'exists' && typeof latestNode.getAttribute(attName) === 'undefined') {
                            return false;
                        }
                        if (attCheck.action === 'equals' &&
                            !(typeof latestNode.getAttribute(attName) !== 'undefined' &&
                                this._attributeFits(latestNode.getAttribute(attName), attCheck.value))) {
                            return false;
                        }
                    }
                }
                // if everything matches we return with true;
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    _attributeFits(nodeAtt, expectedValue) {
        const objRegex = /\{(\w+)=(\w+)\}/;
        const m = objRegex.exec(expectedValue);
        if (m !== null) {
            // The result can be accessed through the 'm'-variable.
            if (typeof nodeAtt === 'object' && !Array.isArray(nodeAtt)) {
                const attribute = nodeAtt[m[1]];
                if (typeof attribute === 'object') {
                    return false;
                }
                else {
                    return attribute === m[2];
                }
            }
            else {
                return false;
            }
        }
        else {
            return nodeAtt === expectedValue;
        }
    }
}
exports.Rule = Rule;
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
        this._rules = rulePatterns.map((rp) => new Rule(rp));
    }
    addRule(rule) {
        this._rules.push(new Rule(rule));
    }
    addMultipleRules(rules) {
        this._rules = this._rules.concat(rules.map((rp) => new Rule(rp)));
    }
    getRules() {
        return this._rules;
    }
    copy() {
        return new RuleSet(this._rules);
    }
    limitToLanguage(lang) {
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