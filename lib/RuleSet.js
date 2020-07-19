const constants = require('./utils/constants');
const cssWhat = require('css-what');

/**
 * @class Rule
 * A single rule, build as strategy to handle a specific AST pattern in a correct way, by a css like selector and a callback function to 
 * handle the AST structure in an intendet way.
 */
class Rule {
  /**
   * Constructor of the Rule class
   * @param {object} oRuleInformation configuration object to setup the Rule object
   * @param {Array<string>|string} oRuleInformation.target the type of files or languages the rule is intendet for
   * @param {string} oRuleInformation.selector the css like selector for a correct match of an AST pattern
   * @param {string} [oRuleInformation.selectorFeature] the css like selector for a correct match of an AST pattern used for the Feature AST. If not given the default selector will be used
   * @param {function} oRuleInformation.resolve the callback function to resolve a specific AST pattern
   */
  constructor(oRuleInformation) {
    if (Array.isArray(oRuleInformation.target)) {
      this._targetNodes = oRuleInformation.target;
    } else if (typeof oRuleInformation.target === "string") {
      this._targetNodes = [oRuleInformation.target];
    } else {
      this._targetNodes = [];
    }
    this._selector = oRuleInformation.selector;
    this._selectorFeature = oRuleInformation.selectorFeature ? oRuleInformation.selectorFeature : oRuleInformation.selector;
    this._resolveCallback = oRuleInformation.resolve.bind(this);
    this._baseChecks = this._setupSelector(this._selector);
    this._featureChecks = this._setupSelector(this._selectorFeature);
  }

  /**
   * Transform a css-like selector string into an object-expression to check for a matching AST position.
   * @private
   * @param {string} sSelector the css-like selector for a specific AST position
   * 
   * @returns {Array<{pathRegex: RegExp, propertyChecks: object}>} Array of checks by regex and property checks
   */
  _setupSelector(sSelector) {
    var cssList = cssWhat.parse(sSelector, {
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
      xmlMode: false
    });

    return cssList.map(cssPart => this._createSelectorChecks(cssPart));
  }

  /**
   * Transformation from css-selector string to appropriate regex and attribute checks
   * @private
   * @param {Array<object>} aSelector parsed css-selector object for relevant informations
   * 
   * @returns {{pathRegExp: RegExp, propertyChecks: object}} the transformed check object with a regular expression to check the path of the AST node and further property checks
   */
  _createSelectorChecks(aSelector) {
    var temp = aSelector.map((oToken) => {
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
    aSelector.map((oToken) => {
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
    }
  }

  /**
   * Check function if a given Base AST node and a Feature AST node is targeted by this rule
   * 
   * @public
   * @param {Node} oBaseFST AST node of the base AST 
   * @param {Node} oFeatureFST AST node of the feature AST
   * 
   * @returns {boolean} true if the given nodes targeted by this rule
   */
  isMatching(oBaseFST, oFeatureFST) {
    //check if the path contains the correct form for the css selector
    const bResult = this._checkNodeMatching(oBaseFST, this._baseChecks) && this._checkNodeMatching(oFeatureFST, this._featureChecks);
    return bResult;
  }

  /**
   * Checks a single AST node if the given selector checks matches the place of the node
   * 
   * @private
   * @param {Node} oNode AST node to check
   * @param {Array<{pathRegExp: RegExp, propertyChecks: object}>} aChecks the check object with regex and attribute checks
   * 
   * @returns {boolean} true if the node is matching the selector
   */
  _checkNodeMatching(oNode, aChecks) {
    return aChecks.some(oCheck => this._singleNodeCheck(oNode, oCheck));
  }

  /**
   * Checks a single AST node with a single check object
   * 
   * @private
   * @param {Node} oNode the AST node match the check
   * @param {{pathRegExp: RegExp, propertyChecks: object}} oChecks the check object given
   * 
   * @returns {boolean} true if the node is matching the given check
   */
  _singleNodeCheck(oNode, oChecks) {
    if (oNode.path && (oChecks.pathRegex.exec(oNode.path)) !== null) {
      //check if the properties or the properties of the parents match the css selector
      if (Object.keys(oChecks.propertyChecks).length > 0) {
        //check bottom to top
        var aChecks = Object.keys(oChecks.propertyChecks).slice().reverse();
        var oLatestNode = oNode;
        for (var iIndex of aChecks) {
          /* 0: {type: "tag", name: "file"}
          1: {type: "attribute", name: "ending", action: "exists", value: "", ignoreCase: false} */
          var oCheck = oChecks.propertyChecks[iIndex];
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
            if (oAttributeCheck.action === "equals" && !(typeof oLatestNode[oAttributeCheck.name] !== "undefined" && this._attributeFits(oLatestNode[oAttributeCheck.name], oAttributeCheck.value))) {
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

  /**
   * Checks a node attribute for a specific given value
   * 
   * @private
   * @param {any} nodeAttribute 
   * @param {any} expectedValue 
   * 
   * @returns {boolean} true if a given attribute of a node fits to a given value.
   */
  _attributeFits(nodeAttribute, expectedValue) {
    const objRegex = /\{(\w+)\=(\w+)\}/;
    let m;

    if ((m = objRegex.exec(expectedValue)) !== null) {
      // The result can be accessed through the `m`-variable.
      if (typeof nodeAttribute === "object" && !Array.isArray(nodeAttribute)) {
        var attribute = nodeAttribute[m[1]];
        if (typeof attribute === "object") {
          return false;
        } else {
          return attribute === m[2];
        }
      } else {
        return false;
      }
    } else {
      return nodeAttribute === expectedValue;
    }
  }

  /**
   * The resolve function for the Rule strategy. 
   * 
   * @public
   * @param {Node} baseFST base AST to process
   * @param {Node} featureFST feature AST to process
   * @param {Imposer} oContext the execution context
   * 
   * @returns {Array<Node> | Node} the processed and merged node
   */
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