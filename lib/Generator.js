'use strict';

const Generators = require('./generators');

class Generator {
    constructor() {
        this._generator = {};
        this._loadDefaultGenerator();
    }

    _loadDefaultGenerator() {
        this.addGenerator(Generators.ECMAGenerator, 'JS');
        this.addGenerator(Generators.ECMAGenerator, 'ECMA');
        this.addGenerator(Generators.DirectoryGenerator, 'DIR');
        this.addGenerator(Generators.DirectoryGenerator, 'FILE');
    }

    /**
     * Adds a new generator for source code generation to the factory
     * The generator object should contain a function called 'generate', taking the fst or ast object and maybe additonal options via a map
     * @param {object} oGenerator the generator object
     * @param {string} sLang the language or file ending the generator is intended for
     */
    addGenerator(oGenerator, sLang) {
        this._generator[sLang.toUpperCase()] = oGenerator;
    }

    /**
     * Initiates the generation process of a FST/AST, by the given language
     * 
     * @param {object} oFAST the AST/FST object the generation should produce a valid code string
     * @param {string} sLang the language/file ending for the generator to use
     * @param {map} [oOptions] additional options for the generator
     */
    generate(oFAST, sLang, oOptions) {
        return this._generator[sLang.toUpperCase()].generate(oFAST, oOptions);
    }
}

module.exports = Generator;