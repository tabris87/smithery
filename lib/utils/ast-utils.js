"use strict";

const traverser = require('eslint/lib/shared/traverser');
const astUtils = require('eslint/lib/rules/utils/ast-utils');

/**
 * Checks whether or not a node is callee. (Improved version from the eslint tooling)
 * @param {ASTNode} node A node to check.
 * @returns {boolean} Whether or not the node is callee.
 */
function isCallee(node) {
    return node.parent && node.parent.type === "CallExpression" && node.parent.callee === node;
}

/**
 * Checks if the node has a valid parent
 */
function hasParent(node) {
    return typeof node.parent !== "undefined";
}

function containsOriginalCall(node) {
    const oTraverser = new traverser();
    var bHasOriginal = false;
    oTraverser.traverse(node, {
        enter: function(node, parent) {
            if(parent){
                node.parent = parent;
            }
            if(isCallee(node)) {
                var sCalleeName = "";
                const oTrav = new traverser();
                oTrav.traverse(node, {
                    enter: function(node) {
                        if(node.type === "Identifier"){
                            sCalleeName+= node.name;
                        }
                    }
                })
                if(sCalleeName.indexOf('original') > -1){
                    bHasOriginal = true;
                }
            }
        }
    });
    return bHasOriginal;
}

function replaceOriginal(node, sReplacement) {
    const oTraverser = new traverser();
    oTraverser.traverse(node, {
        enter: function(node, parent) {
            if(parent){
                node.parent = parent;
            }
            if(isCallee(node)) {
                const oTrav = new traverser();
                oTrav.traverse(node, {
                    enter: function(node) {
                        if(node.type === "Identifier" && node.name === "original"){
                            node.name = sReplacement;
                        }
                    }
                })
            }
        }
    });
}

function recalculateLocations(node){
    const oTraverser = new traverser();
    var startIndex = 0;
    var endIndex = 0;
    var currentIndex = 0;
    oTraverser.traverse(node,{
        enter: function(node, parent) {
            var nodeStart = node.start;
            var nodeEnd = node.end; 
            var nodeLoc = node.loc;
        }
    })
}

module.exports = {
    isCallee,
    hasParent,
    containsOriginalCall,
    replaceOriginal,
    recalculateLocations
}