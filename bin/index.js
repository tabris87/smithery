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

const cli = require ('./cli');

cli.run(process);