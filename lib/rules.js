const fs = require('fs');
const constants = require('./utils/constants');


class Rules {
    constructor(aRules) {
        this._rules = [];
        if (!aRules || aRules.length === 0) {
            this._loadDefaultRules();
        } else {
            this._rules = aRules;
        }
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

    getRulesByLanguage(sLang) {
        return new Rules(this._rules.filter(rule => rule.rule.language.includes(sLang)));
    }
}

module.exports = Rules;