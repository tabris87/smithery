"use strict";
const Traverser = require('eslint/lib/shared/traverser');
const esquery = require("esquery");

class FileMerger {
    constructor(oRules) {
        this._rules = oRules;
    }

    merge(baseAST, mergeAST) {
        var mergeFeatureName = mergeAST.featureName;
        Traverser.traverse(mergeAST, {
            enter(node, parent) {
                node.parent = parent;
                if (parent) {
                    node.completePath = parent.completePath || "";
                    node.completePath += "." + node.type;
                    node.featureName = node.featureName ? node.featureName : node.parent.featureName;
                } else {
                    node.completePath = node.type;
                    node.featureName = mergeFeatureName;
                }
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
                    node.featureName = node.featureName ? node.featureName : node.parent.featureName;
                } else {
                    node.completePath = node.type;
                }

                var temp = matchesFunctionToInsert(node.completePath);
                if (temp.length > 0 && temp.length === 1) {
                    temp[0].resolve(node, temp[0].node);
                    removeFunctionToInsert(node.completePath);
                } else if (temp.length > 0 && temp.length > 1) {
                    throw new Error('More than one function is matching O_O');
                }
            }
        });

        Traverser.traverse(baseAST, {
            enter(node, parent) {
                if (typeof node.body !== "undefined" && Array.isArray(node.body)) {
                    node.body.sort((a, b) => {
                        if (a.type === "VariableDeclaration" && a.type === b.type) {
                            return a.start - b.start;
                        } else if (a.type === "VariableDeclaration" && b.type !== "VariableDeclaration") {
                            return -1;
                        } else if (a.type !== "VariableDeclaration" && b.type === "VariableDeclaration") {
                            return 1;
                        } else {
                            return 0;
                        }
                    })
                }
            }
        });

        return baseAST;
    }
}

module.exports = FileMerger