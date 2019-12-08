"use strict";
const Traverser = require('eslint/lib/shared/traverser');
const esquery = require("esquery");

class Merger {
    constructor(oRules) {
        this._rules = oRules;
    }

    merge(baseAST, mergeAST) {

        Traverser.traverse(mergeAST, {
            enter(node, parent) {
                node.parent = parent;
                if (parent) {
                    node.completePath = parent.completePath || "";
                    node.completePath += "." + node.type;
                } else {
                    node.completePath = node.type;
                }
                node.featureName = "feature";
            }
        });

        var aFunctionsToInsert = [];
        this._rules.getFunctionRules().forEach((rule) => {
            const astSelector = esquery.parse(rule.rule.rawSelector);
            const fnResolve = rule.rule.resolve;
            var aRuleMapping = esquery.match(mergeAST, astSelector).map((oMatch) => {
                return {
                    node: oMatch,
                    resolve: fnResolve
                };
            });
            aFunctionsToInsert = [...aFunctionsToInsert, ...aRuleMapping];
        });

        /*-- Util functions --*/
        function matchesFunctionToInsert(sPath) {
            return aFunctionsToInsert.filter((oMap) => {
                return oMap.node.completePath === sPath
            });
        }

        function removeFunctionToInsert(sPath) {
            aFunctionsToInsert = aFunctionsToInsert.filter((oMap) => {
                return oMap.node.completePath !== sPath
            });
        }

        Traverser.traverse(baseAST, {
            enter(node, parent) {
                node.parent = parent;
                if (parent) {
                    node.completePath = parent.completePath || "";
                    node.completePath += "." + node.type;
                } else {
                    node.completePath = node.type;
                }

                var temp = matchesFunctionToInsert(node.completePath);
                if (temp.length > 0 && temp.length === 1) {
                    temp[0].resolve(node, temp[0].node);
                    removeFunctionToInsert(node.completePath);
                } else if (temp.length > 0 && temp.length > 1) {
                    console.log('More than one function is matching O_O');
                }
            }
        });

        return baseAST;
    }
}

module.exports = Merger;