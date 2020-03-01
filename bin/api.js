/**
 * @fileoverview Expose the cli interface and featureJS to require
 * @author Adrian Marten
 */

"use strict";

module.exports = {
    Project: require('../lib/Project'),
    ParserFactory: require('../lib/Parser'),
    GeneratorFactory: require('../lib/Generator'),
    RuleSetFactory: require('../lib/RuleSet'),
    Imposer: require('../lib/Imposer')
};