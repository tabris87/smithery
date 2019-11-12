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

module.exports = {
    rawSelector: "VariableDeclaration FunctionExpression",
    type: constants.types.FUNCTION,
    create: function () {
        return {
            ":not(FunctionExpression) VariableDeclaration FunctionExpression": retrainFunctionParameter
        }
    }
}