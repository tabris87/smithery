/**
 * @fileoverview Expose the cli interface and featureJS to require
 * @author Adrian Marten
 */

"use strict";

const {FileMerger} = require("./file-merger");
const {CLI} = require("./cli");

module.exports = {
    FileMerger,
    CLI
};