"use strict";

const Generators = require('./generators');

class Generator {
    constructor() {
        this._generator = {};
        this._loadDefaultGenerator();
    }

    _loadDefaultGenerator() {
        this._generator['JS'] = Generators.ECMAGenerator;
        this._generator['ECMA'] = Generators.ECMAGenerator;
        this._generator['DIR'] = Generators.DirectoryGenerator;
        this._generator['FILE'] = Generators.DirectoryGenerator;
    }

    generate(oOptions) {
        if (typeof oOptions !== "object") {
            throw new Error("No correct parsing object given");
        }


        return this._generator[oOptions.lang].generate(oOptions);
    }
}

module.exports = Generator;