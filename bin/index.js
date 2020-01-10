#!/usr/bin/env node

/* const chalk = require("chalk");
const boxen = require("boxen");

const greeting = chalk.white.bold("Feature JS started");
const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
    backgroundColor: "#555555"
}

const msgBox = boxen(greeting, boxenOptions);
console.log(msgBox); */
//only needed for exact cmd environment

const cli = require('./cli');
console.log(JSON.stringify(process.argv));
console.log(JSON.stringify(process.execArgv));

const path = require('path');
const fs = require('fs');

console.log(path.join(process.argv[1].replace('index.js'), '../../../js2flowchart'));
var bExists = fs.existsSync(path.join(process.argv[1].replace('index.js'), '../../../js2flowchart'));
console.log('Exists: ' + bExists);
if (bExists) {
    const oModule = require(path.join(process.argv[1].replace('index.js'), '../../../js2flowchart'));
    console.log(Object.keys(oModule));
}

cli.run(process);
exports.api = require('./api');
// unsupported command
/* 
if (process.argv.length < 3) {
    program.help(function(helpInfo) {
        return colors.yellow(helpInfo);
    });
}; */