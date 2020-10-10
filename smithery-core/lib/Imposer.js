"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Imposer = void 0;
class Imposer {
    constructor(parser, generator, rules) {
        this.parserFactory = parser;
        this.generatorFactory = generator;
        this.ruleSet = rules;
    }
    impose(baseFST, featureFST, visitorKeys) {
        const match = this.ruleSet.getMatchingRule(baseFST, featureFST);
        if (match) {
            return match.apply(baseFST, featureFST, this);
        }
        /* new strategy:
         * 1. check if rule is matching
         * 2. otherwise traverse deeper
         * 3. comparison by id and path
         */
        const baseKeys = Object.keys(baseFST).sort((a, b) => a.localeCompare(b));
        visitorKeys[baseFST.type].forEach((childKeys) => {
            const index = baseKeys.indexOf(childKeys);
            if (index > -1) {
                baseKeys.splice(index, 1);
            }
        });
        const newNode = baseFST.clone();
        //just add all necessary informations to the resulting node
        /* JS-Way ;)
          for (var key of aBaseKeys) {
           oNewNode[key] = baseFST[key];
          }
        */
        newNode.featureName = featureFST.featureName;
        const childKeys = visitorKeys[baseFST.type];
        // check all childs and include all childs
        childKeys.forEach((childKey) => {
            const baseChilds = baseFST[childKey];
            const featureChilds = featureFST[childKey];
            let resultingChilds = [];
            if (typeof baseChilds === 'object' && Array.isArray(baseChilds)) {
                baseChilds.forEach((childBase) => {
                    childBase.featureName = baseFST.featureName;
                    const childIndex = [];
                    const childFeature = featureChilds.filter((featureChild, index) => {
                        if (featureChild.path === childBase.path && featureChild.name === childBase.name) {
                            childIndex.push(index);
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    // if no child for the feature can be found take the base one
                    if (childFeature.length === 0) {
                        childBase.featureName = featureFST.featureName;
                        resultingChilds.push(childBase);
                    }
                    // if a feature child is matching
                    if (childFeature.length === 1) {
                        const newChild = childFeature[0];
                        newChild.featureName = featureFST.featureName;
                        const subImposeChildOne = this.impose(childBase, newChild, visitorKeys);
                        if (Array.isArray(subImposeChildOne)) {
                            resultingChilds = resultingChilds.concat(subImposeChildOne);
                        }
                        else {
                            resultingChilds.push(subImposeChildOne);
                        }
                        //remove the feature childs afterwards
                        childFeature.splice(childIndex[0], 1);
                    }
                    if (childFeature.length > 1) {
                        console.warn('more than one child is matching find a rule to merge this node and its children more precisly.');
                        console.group();
                        console.warn('Path: ' + baseFST.path);
                        console.warn('Name: ' + baseFST.name);
                        console.warn('PropertyKey: ' + childKey);
                        console.group();
                        childFeature.forEach((featureChild) => {
                            console.warn(featureChild.path + "' '" + featureChild.name);
                        });
                        console.groupEnd();
                        console.groupEnd();
                        const firstFeatureChild = childFeature[0];
                        const oSubImposeChildMany = this.impose(childBase, firstFeatureChild, visitorKeys);
                        /* aResultingChilds.push(this.impose(oChildB, oChildF, mVisitorKeys)); */
                        if (Array.isArray(oSubImposeChildMany)) {
                            resultingChilds = resultingChilds.concat(oSubImposeChildMany);
                        }
                        else {
                            resultingChilds.push(oSubImposeChildMany);
                        }
                        //remove the feature childs afterwards
                        featureChilds.splice(childIndex[0], 1);
                    }
                });
                // add missing 'new' feature childs
                resultingChilds = resultingChilds.concat(featureChilds);
                newNode[childKey] = resultingChilds;
            }
            else {
                if (typeof baseChilds === typeof featureChilds && typeof baseChilds === 'undefined') {
                    newNode[childKey] = resultingChilds;
                }
                else if (typeof baseChilds === typeof featureChilds && !Array.isArray(featureChilds)) {
                    baseChilds.featureName = baseFST.featureName;
                    featureChilds.featureName = featureFST.featureName;
                    // Keep it without result distinguish
                    newNode[childKey] = this.impose(baseChilds, featureChilds, visitorKeys);
                }
                else {
                    throw new Error('Non array children differ');
                }
            }
        });
        return newNode;
    }
    //#region getter/setter
    setParserFactory(parser) {
        this.parserFactory = parser;
    }
    setGeneratorFactory(generator) {
        this.generatorFactory = generator;
    }
    setRuleSet(rules) {
        this.ruleSet = rules;
    }
    getParserFactory() {
        return this.parserFactory;
    }
    getGeneratorFactory() {
        return this.generatorFactory;
    }
    getRuleSet() {
        return this.ruleSet;
    }
}
exports.Imposer = Imposer;
//# sourceMappingURL=Imposer.js.map