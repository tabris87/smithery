"use strict";

const {
    Node
} = require('featureCLI-commons').types;
const Logger = require('./utils/Logger');

class Imposer {
    /**
     * 
     * @param {map} oMap containing several instances for imposing, like parser and or generator, as well as the rules
     */
    constructor(oMap) {
        if (oMap) {
            this._parser = oMap.parser;
            this._generator = oMap.generator;
            this._rules = oMap.rules;
        }
    }

    setParser(oParser) {
        this._parser = oParser;
    }

    getParser() {
        return this._parser;
    }

    setGenerator(oGenerator) {
        this._generator = oGenerator;
    }

    getGenerator() {
        return this._generator;
    }

    setRuleSet(oRuleSet) {
        this._rules = oRuleSet;
    }

    getRuleSet() {
        return this._rules;
    }

    impose(baseFST, featureFST, mVisitorKeys) {
        var oMatch = this._rules.ruleMatching(baseFST, featureFST);
        if (oMatch) {
            return oMatch.resolve(baseFST, featureFST, this);
        }
        //new strategy:
        // 1. check if rule is matching
        // 2. otherwise traverse deeper
        // 3. comparison by id and path


        var aBaseKeys = Object.keys(baseFST).sort((a, b) => {
            return a.localeCompare(b);
        });

        mVisitorKeys[baseFST.type].forEach((sChildKeys) => {
            var iIndex = aBaseKeys.indexOf(sChildKeys);
            if (iIndex > -1) {
                aBaseKeys.splice(iIndex, 1);
            }
        });

        var oNewNode = new Node();
        //just add all necessary informations to the resulting node
        for (var key of aBaseKeys) {
            oNewNode[key] = baseFST[key];
        }

        oNewNode.featureName = featureFST.featureName;

        var aChildKeys = mVisitorKeys[baseFST.type];
        //check all childs and include all childs

        aChildKeys.forEach((sChildKey) => {
            var aBaseChilds = baseFST[sChildKey];
            var aFeatureChilds = featureFST[sChildKey];
            var aResultingChilds = [];


            if (typeof aBaseChilds === "object" && Array.isArray(aBaseChilds)) {
                aBaseChilds.forEach((oChildB) => {
                    var iChildIndex = [];
                    var oChildF = aFeatureChilds.filter((oCF, index) => {
                        if (oCF.path === oChildB.path && oCF.name === oChildB.name) {
                            iChildIndex.push(index);
                            return true;
                        } else {
                            return false;
                        }
                    });

                    //if no child for the feature can be found take the base one
                    if (oChildF.length === 0) {
                        oChildB.featureName = featureFST.featureName;
                        aResultingChilds.push(oChildB);
                    }

                    //if a feature child is matching
                    if (oChildF.length === 1) {
                        oChildF = oChildF[0];
                        aResultingChilds.push(this.impose(oChildB, oChildF, mVisitorKeys));

                        //remove the feature childs afterwards
                        aFeatureChilds.splice(iChildIndex[0], 1);
                    }

                    if (oChildF.length > 1) {
                        Logger.warn('more than one child is matching find a rule to merge this node and its children more precisly.');
                        console.group('moreThanOne');
                        Logger.warn('Path: ' + baseFST.path);
                        Logger.warn('Name: ' + baseFST.name);
                        Logger.warn('PropertyKey: ' + sChildKey);
                        console.group('childs');
                        oChildF.forEach((oCh) => {
                            Logger.warn(oCh.path + "' '" + oCh.name);
                        })
                        console.groupEnd('childs');
                        console.groupEnd('moreThanOne');
                        oChildF = oChildF[0];
                        aResultingChilds.push(this.impose(oChildB, oChildF, mVisitorKeys));

                        //remove the feature childs afterwards
                        aFeatureChilds.splice(iChildIndex[0], 1);
                    }
                });

                //add missing 'new' feature childs
                aResultingChilds = aResultingChilds.concat(aFeatureChilds);
                oNewNode[sChildKey] = aResultingChilds;
            } else {
                if (typeof aBaseChilds === typeof aFeatureChilds && typeof aBaseChilds === "undefined") {
                    oNewNode[sChildKey] = undefined;
                } else if (typeof aBaseChilds === typeof aFeatureChilds && !Array.isArray(aFeatureChilds)) {
                    oNewNode[sChildKey] = this.impose(aBaseChilds, aFeatureChilds, mVisitorKeys);
                } else {
                    throw new Error('Non array children differ!')
                }
            }
        });

        return oNewNode;
    }

    _removeEntry(sEntry, aArray) {
        var iIndex = aArray.indexOf(sEntry);
        if (iIndex > -1) {
            aArray.splice(iIndex, 1);
        }
    }

    static sortByType(aValue, bValue) {
        return aValue.type.localeCompare(bValue.type);
    }
}

module.exports = Imposer;