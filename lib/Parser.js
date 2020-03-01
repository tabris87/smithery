"use strict"

const parsers = require('./parsers');

class Parser {
    constructor() {
        this._parser = {};
        this._loadDirectoryParser();
    }

    _loadDirectoryParser() {
        this.addParser(parsers.PATHParser, 'DIR');
        this.addParser(parsers.PATHParser, 'FILE');
    }

    /**
     * Adds a new parser for code parsing to the factory
     * The parser object should contain a function called 'parse', taking the source string and maybe additonal options via a map
     * @param {object} oParser the parser object
     * @param {string} sLang the language or file ending the parser is intended for
     */
    addParser(oParser, sEnding) {
        this._parser[sEnding.toUpperCase()] = oParser;
    }

    /**
     * Initiates the parsing process of a source code string, by the given language
     * 
     * @param {object} sSource the source code string the parser should generate a AST from
     * @param {string} sLang the language/file ending for the parser to use
     * @param {map} [oOptions] additional options for the parser
     */
    parse(sSource, sLang, oOptions) {
        var oParser = this._parser[sLang.toUpperCase()];
        if (!oParser) {
            throw new Error(`No Parser found for ${sLang}, try to find a available Plugin supporting ${sLang}.\nOr try to write your own ;).`);
        }
        return oParser.parse(sSource, oOptions);
    }

    getVisitorKeys(sLang) {
        return this._parser[sLang.toUpperCase()].visitorKeys;
    }
}

module.exports = Parser;