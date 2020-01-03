"use strict";

class Generator {
    constructor() {
        this._generator = {};
        this._loadJSGenerator();
    }

    _loadJSGenerator() {
        this._generator['JS'] = {
            generate: require('escodegen').generate
        };
    }

    generate(oOptions) {
        if (typeof oOptions !== "object") {
            throw new Error("No correct parsing object given");
        }

        return this._generator[oOptions.lang].generate(oOptions.codeAst);
    }
}

module.exports = Generator;