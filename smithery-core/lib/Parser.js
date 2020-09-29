"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserFactory = void 0;
const parsers_1 = require("./parsers");
const enums_1 = require("./enums");
/**
 * ParserFactory, the factory implementation for the set of Parsers
 * to deliver the correct parser implementation for each type of source code
 */
class ParserFactory {
    constructor() {
        this._parserMap = {};
        this._loadDefaultParser();
    }
    /**
     * Used at the constructor to load the directory generator for files and folders
     */
    _loadDefaultParser() {
        const dirParser = new parsers_1.DirectoryParser();
        this.addParser(dirParser, enums_1.FileType.File);
        this.addParser(dirParser, enums_1.FileType.Folder);
    }
    /**
     * Add a new parser instance together with the correct source code assignment
     *
     * @param parser the parser instance to add
     * @param sourceAssignment the source code type to distinguish between other generators
     */
    addParser(parser, sourceAssignment) {
        this._parserMap[sourceAssignment.toUpperCase()] = parser;
    }
    /**
     * Retrieve a code generator for a given code type
     *
     * @param sourceAssignment the identifier (file ending) for which type of source code the generator is needed
     */
    getParser(sourceAssignment) {
        return this._parserMap[sourceAssignment.toUpperCase()];
    }
}
exports.ParserFactory = ParserFactory;
//# sourceMappingURL=Parser.js.map