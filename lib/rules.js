const fs = require('fs');
const constants = require('./utils/constants');


class Rules {
    constructor() {
        this._rules = [];
        this._loadDefaultRules();
    }

    _loadDefaultRules() {
        this._rules = require('./rules/');
    }

    getRules() {
        return this._rules;
    }

    getFunctionRules() {
        return this._rules.filter(rule => rule.rule.type === constants.types.FUNCTION);
    }
}

module.exports = Rules;