"use strict";

const FOLDER_TYPE = "Folder";
const FILE_TYPE = "File";

const MergerCL = require('./Merger');
const {
    Node,
    SourceLocation
} = require('featureCLI-commons').types;
const astUtils = require('./utils/ast-utils');

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

    imposeB(baseFST, featureFST) {
        /* if (!this._parser) {
            throw new Error('No parser factory given, no imposing possible!')
        }
        if (!this._generator) {
            throw new Error('No generator factory given, no imposing possible!')
        }
        if (!this._rules) {
            throw new Error('No rules factory given, no imposing possible!')
        }

        var returnFST = JSON.parse(JSON.stringify(baseFST));

        if (featureFST.type === FOLDER_TYPE) {
            //Folder CASE
            for (var oFeatureChild of featureFST.children) {
                //Just ensure we do not copy children without any content
                if (oFeatureChild.type === FOLDER_TYPE && oFeatureChild.children.length === 0) {
                    console.warn(" - Warning: Feature folder " + oFeatureChild.name + " is empty, therefore skipped. (FullPath: " + oFeatureChild.path + ")")
                } else {
                    //We can be sure the path should be the same, because we are on the same level of the FST.
                    var iIndex = returnFST.children.findIndex(file => file.type === oFeatureChild.type && file.name === oFeatureChild.name);
                    if (iIndex !== -1) {
                        //if the returnFST/baseFST contains this child already, use superimposition on both nodes
                        returnFST.children[iIndex] = this.impose(returnFST.children[iIndex], oFeatureChild);
                    } else {
                        //if the returnFST/baseFST not contains the feature child, add it to the structure
                        //create a deep copy just to ensure independance from the feature FST
                        returnFST.children.push(JSON.parse(JSON.stringify(oFeatureChild)));
                    }
                }
            }
        } else {
            //FILE CASE
            var baseAST = this._parser.parse(baseFST.content, baseFST.ending, {
                version: 5
            });

            var featureAST = this._parser.parse(featureFST.content, featureFST.ending, {
                version: 5
            });

            baseAST.featureName = "base";
            featureAST.featureName = "feature";

            debugger;
            var temp = new MergerCL(this._rules.getRulesByLanguage(baseFST.ending)).merge(baseAST, featureAST);

            returnFST.content = this._generator.generate(temp, baseFST.ending);
        }
        return returnFST; */
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
                        console.warn('more than one child is matching find a rule to merge this node and its children more precisly.')
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