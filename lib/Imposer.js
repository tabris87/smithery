"use strict";

const FOLDER_TYPE = "Folder";
const FILE_TYPE = "File";

const ParserCL = require('./Parser');
const RulesCL = require('./Rules');
const MergerCL = require('./Merger');
const GeneratorCL = require('./Generator');

class Imposer {
    constructor() {}

    impose(baseFST, featureFST) {
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
            var baseAST = new ParserCL().parse({
                code: baseFST.content,
                lang: baseFST.ending,
                version: 5
            });

            var featureAST = new ParserCL().parse({
                code: featureFST.content,
                lang: featureFST.ending,
                version: 5
            });

            baseAST.featureName = "base";
            featureAST.featureName = "feature";

            var temp = new MergerCL(new RulesCL().getRulesByLanguage(baseFST.ending)).merge(baseAST, featureAST);

            returnFST.content = new GeneratorCL().generate({
                lang: baseFST.ending,
                codeAst: temp
            });
        }
        return returnFST;
    }
}

module.exports = Imposer;