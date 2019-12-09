"use strict";

const baseCode = "var test = function(){console.log('Whatever')}; test()";
const featureCode = "var text = ' WAT'; var test = function(){original(); console.log(text)};";

const ParserCL = require('./lib/Parser');
const RulesCL = require('./lib/Rules');
const MergerCL = require('./lib/Merger');

const escodegen = require("escodegen");

let Parser = new ParserCL();
let Rules = new RulesCL();

//real merge function
var featureAst = Parser.parse({
    code: featureCode,
    lang: 'JS',
    version: 5
});

var baseAST = Parser.parse({
    code: baseCode,
    lang: 'JS',
    version: 5
});

//Just to limit the number of rules applied and ensure only js used for javascript/ECMA
let Merger = new MergerCL(Rules.getRulesByLanguage('JS'));

var temp = Merger.merge(baseAST, featureAst);

var output = escodegen.generate(temp);
console.log(output);