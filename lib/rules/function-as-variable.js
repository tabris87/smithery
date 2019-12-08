/**
 * @fileoverview Rule to merge functions defined within variables
 * @author Adrian Marten
 */
"use strict";
const astUtils = require('../utils/ast-utils');
const constants = require('../utils/constants');

function retrainFunctionParameter(node) {
    var sCompletePath = node.completePath;
    var sFunctionName = astUtils.getParentByType(node, "VariableDeclarator").name;
    return {
        path: sCompletePath,
        functionName: sFunctionName,
        node: node
    }
}

function resolve(baseNode, featureNode) {
    var parent = baseNode.parent;
    if (astUtils.containsOriginalCall(featureNode)) {
        //replace original name to keep the old function
        var newParentName = parent.id.name + '_base';
        parent.id.name = newParentName;
        //replace 'original' call with new function-base name
        astUtils.replaceOriginal(featureNode, newParentName);
        //need method to retrieve next level to add functions or variables
        //add the variable declaration to the program body
        featureNode.parent.parent.parent = parent.parent.parent;
        parent.parent.parent.body.push(featureNode.parent.parent);
    } else {
        featureNode.body.forEach((subNode) => {
            subNode.parent = baseNode;
        });
        baseNode.body = featureNode.body;
    }
}

function create() {
    return {
        ":not(FunctionExpression) VariableDeclaration FunctionExpression": retrainFunctionParameter
    }
}

module.exports = {
    rawSelector: ":not(FunctionExpression) VariableDeclaration FunctionExpression",
    type: constants.types.FUNCTION,
    create: create,
    resolve: resolve
}