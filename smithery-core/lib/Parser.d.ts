import { Parser } from './interfaces';
/**
 * ParserFactory, the factory implementation for the set of Parsers
 * to deliver the correct parser implementation for each type of source code
 */
export declare class ParserFactory {
    private _parserMap;
    constructor();
    /**
     * Used at the constructor to load the directory generator for files and folders
     */
    private _loadDefaultParser;
    /**
     * Add a new parser instance together with the correct source code assignment
     *
     * @param parser the parser instance to add
     * @param sourceAssignment the source code type to distinguish between other generators
     */
    addParser(parser: Parser, sourceAssignment: string): void;
    /**
     * Retrieve a code generator for a given code type
     *
     * @param sourceAssignment the identifier (file ending) for which type of source code the generator is needed
     */
    getParser(sourceAssignment: string): Parser | undefined;
}
