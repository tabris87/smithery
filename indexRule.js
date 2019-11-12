/**
 * @module featureUI5
 * @public
 */

"use strict";
var espree = require("espree");
var Traverser = require('eslint/lib/shared/traverser');
var ownUtils = require('./lib/utils/ast-utils');

var rules = require('./lib/rules/rules');
const esquery = require("esquery");
const escodegen = require("escodegen");


function createAST(sScriptString) {
    var originAst = espree.parse(sScriptString, {
        //attach range information to each node
        range: false,
        //attach line/column location information to each node
        loc: true,
        //create a top-level comments array containing all comments
        comment: true,
        //create a top-level tokens array containing all tokens
        tokens: false,
        // Set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use.
        // You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), or 2019 (same as 10) to use the year-based naming.
        ecmaVersion: 5,
    });
    return originAst;
};

function run() {
    const test = createAST("var test = function(){console.log('Whatever')}; test()");
    const test2 = createAST("var text = ' WAT'; var test = function(){original(); console.log(text)};");
    var result = "";

    Traverser.traverse(test2, {
        enter(node, parent) {
            node.parent = parent;
            if (parent) {
                node.completePath = parent.completePath || "";
                node.completePath += "." + node.type;
            } else {
                node.completePath = node.type;
            }
        }
        /*,

                 leave(node) {
                } */
    });

    var aFunctionsToInsert = [];
    rules.getFunctionRules().forEach((rule) => {
        //parse the css-like selector
        const astSelector = esquery.parse(rule.rule.rawSelector);
        aFunctionsToInsert = [...aFunctionsToInsert, ...esquery.match(test2,astSelector)];
    });

    debugger;

    function matchesFunctionToInsert(sPath) {
        return aFunctionsToInsert.filter((node) => {return node.completePath === sPath});
    }

    function removeFunctionToInsert(sPath) {
        return aFunctionsToInsert.filter((node) => {return node.completePath !== sPath});
    }

    Traverser.traverse(test, {
        enter(node, parent) {
            node.parent = parent;
            if (parent) {
                node.completePath = parent.completePath || "";
                node.completePath += "." + node.type;
            } else {
                node.completePath = node.type;
            }

            var temp = matchesFunctionToInsert(node.completePath);
            if(temp.length > 0 && temp.length === 1) {
                var oFnNode = temp[0];
                if(ownUtils.containsOriginalCall(oFnNode)) {
                    console.log('PROBLEM!!!');
                    //replace original name to keep the old function
                    var newParentName = parent.id.name + '_base';
                    parent.id.name = newParentName;
                    //replace 'original' call with new function-base name
                    ownUtils.replaceOriginal(oFnNode, newParentName);
                    //need method to retrieve next level to add functions or variables
                    //add the variable declaration to the program body
                    oFnNode.parent.parent.parent = parent.parent.parent;
                    parent.parent.parent.body.push(oFnNode.parent.parent);
                    //remove the function from the function array to ensure no duplicates used
                    aFunctionsToInsert = removeFunctionToInsert(node.completePath);
                } else {
                    oFnNode.body.forEach((subNode) => {subNode.parent = node;});
                    node.body = oFnNode.body;
                }
            } else if (temp.length > 0 && temp.length > 1) {
                console.log('More than one function is matching O_O');
            }
        }
    });
    
    var output = escodegen.generate(test);
    console.log(output);
}

module.exports = {
    run: run()
}