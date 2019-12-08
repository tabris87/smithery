"use strict"

class Parser {
    constructor() {
        this._parser = {};
        this._loadJSParser();
    }

    _loadJSParser() {
        this._parser['JS'] = { parse: require('./parser/ASTParserJS').parse};
    }

    parse(oOptions) {
        if(typeof oOptions !== "object") {
            throw new Error("No correct parsing object given");
        }

        return this._parser[oOptions.lang].parse(oOptions);
    }
}

module.exports = Parser;