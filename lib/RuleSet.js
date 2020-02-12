const constants = require('./utils/constants');
const cssWhat = require('css-what');


class Rule {
    constructor(oRuleInformation) {
        if (Array.isArray(oRuleInformation.target)) {
            this._targetNodes = oRuleInformation.target;
        } else if (typeof oRuleInformation.target === "string") {
            this._targetNodes = [oRuleInformation.target];
        } else {
            this._targetNodes = [];
        }
        this._selector = oRuleInformation.selector;
        this._resolveCallback = oRuleInformation.resolve.bind(this);
        this._setupSelector();
    }

    _setupSelector() {
        var cssList = cssWhat.parse(this._selector, {
            lowerCaseTags: false,
            lowerCaseAttributeNames: false,
            xmlMode: false
        })[0];
        //Test mit mehreren sollte zu Regex führen
        //File[ending]>Whatever Test,
        //File[ending=JS]>Whatever Test,
        //Resultat: File\.Whatever\.[\w.]*Text
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

        this._pathRegex = pathRegExp;
        this._propertyChecks = checks;
    }

    isMatching(oBaseFST, oFeatureFST) {
        //check if the path contains the correct form for the css selector
        if (oBaseFST.path && (this._pathRegex.exec(oBaseFST.path)) !== null) {
            //check if the properties or the properties of the parents match the css selector
            if (Object.keys(this._propertyChecks).length > 0) {
                //check bottom to top
                var aChecks = Object.keys(this._propertyChecks).slice().reverse();
                var oLatestNode = oBaseFST;
                for (var iIndex of aChecks) {
                    /* 0: {type: "tag", name: "file"}
                    1: {type: "attribute", name: "ending", action: "exists", value: "", ignoreCase: false} */
                    var oCheck = this._propertyChecks[iIndex];
                    //iterate upwards until we found the correct one or the root node
                    while (oLatestNode.type !== oCheck.name && oLatestNode.parent) {
                        if (oLatestNode.parent) {
                            oLatestNode = oLatestNode.parent;
                        }
                    }
                    for (var oAttributeCheck of oCheck.attributes) {
                        if (oAttributeCheck.action === "exists" && typeof oLatestNode[oAttributeCheck.name] === "undefined") {
                            return false;
                        }
                        if (oAttributeCheck.action === "equals" && !(typeof oLatestNode[oAttributeCheck.name] !== "undefined" && oLatestNode[oAttributeCheck.name] === oAttributeCheck.value)) {
                            return false;
                        }
                    }
                }
                // if everything matches we return with true;
                return true;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    resolve(baseFST, featureFST, oContext) {
        return this._resolveCallback(baseFST, featureFST, oContext);
    }

    supportsLanguage(sLang) {
        return this._targetNodes.includes(sLang);
    }
}

class RuleSet {
    constructor(aRules) {
        this._languageLimit = "";
        this._rules = [];
        if (!aRules || aRules.length === 0) {
            this._loadDefaultRules();
        } else {
            this._rules = aRules;
        }
    }

    _loadDefaultRules() {
        var aRulePatterns = require('./rules/') || [];
        this._rules = aRulePatterns.map(oRP => new Rule(oRP));
    }

    addRule(oRule) {
        this._rules.push(new Rule(oRule));
    }

    addMultipleRules(aRules) {
        this._rules = this._rules.concat(aRules.map(oRP => new Rule(oRP)));
    }

    getRules() {
        return this._rules;
    }

    copy() {
        return new RuleSet(this._rules);
    }

    limitToLanguage(sLang) {
        this._languageLimit = sLang;
    }

    ruleMatching(oBaseFST, oFeatureFST) {
        var aUsageRules = this._rules;
        if (this._languageLimit !== "") {
            aUsageRules = aUsageRules.filter(oRule => oRule.supportsLanguage(this._languageLimit));
        }

        var aResultingRules = aUsageRules.filter(oRule => oRule.isMatching(oBaseFST, oFeatureFST));
        if (aResultingRules > 1) {
            console.warn('More than one rule is matching! Taking the first one to proceed. Result can differ from expected Result.');
        }
        return aResultingRules[0]
    }
}

module.exports = RuleSet;