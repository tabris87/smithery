/**
 * @module featureUI5
 * @public
 */

"use strict";
var espree = require("espree");
var fs = require("fs");
var path = require("path");
var traverser = require('eslint/lib/shared/traverser');
var astUtils = require('eslint/lib/rules/utils/ast-utils');
var ownUtils = require('./lib/utils/ast-utils');
var events = require("events");
var generate = require("babel-core").generator;

var eventEmitter = new events.EventEmitter();


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
    /* var trav = new traverser();
    trav.traverse(test2, {
        enter: function (node, parent) {
            console.log('entered node: ' + node.type);
            node.parent = parent;
            if (astUtils.isFunction(node)) {
                this.skip();
                var sPath = this._parents.map((n) => n.type).reduce((a, b) => a + (a ? "." : "") + b, "") + "." + node.type;
                eventEmitter.emit("function", sPath, node);
            };
        }
    }); */

    /* var oVisitObj = new visitor();
    test.constructor.prototype.accept = fnAccept;
    debugger;
    test.accept(oVisitObj); */
    /* Object.values(ofunctions).forEach(function (fn) {
        if (ownUtils.containsOriginalCall(fn)) {
            fn.original = true;
            console.log('Preserve original call();')
        }
    });
    
    var baseTrav = new traverser();
    baseTrav.traverse(test, {
        enter: function (node, parent) {
            var sPath = "";
            if (this._parents.length > 0) {
                sPath += this._parents.map((n) => n.type).reduce((a, b) => a + (a ? "." : "") + b, "") + "." + node.type;
            } else {
                sPath += node.type;
            }
            if (Object.keys(ofunctions).some((key) => key === sPath)) {
                var fnOverwrite = ofunctions[sPath];
                if (fnOverwrite.original) {
                    console.log('PROBLEM!!!');
                    //replace original name to keep the old function
                    var newParentName = parent.id.name + '_base';
                    parent.id.name = newParentName;
                    //replace 'original' call with new function-base name
                    ownUtils.replaceOriginal(fnOverwrite, newParentName);

                    //add the new feature-function to the program body
                    fnOverwrite.parent.parent.parent = this._parents[0];
                    this._parents[0].body.push(fnOverwrite.parent.parent);
                    ownUtils.recalculateLocations(this._parents[0])
                    debugger;
                } else {
                    fnOverwrite.parent.parent.parent = this._parents[0];
                    node = fnOverwrite;
                }
            }
        }
    }); */

   /*  var output = generate(test, {}, result);
    console.log(output); */

    debugger;
}

module.exports = {
    run: run()
}