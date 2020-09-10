import { Parser, } from './interfaces';
import { DirectoryParser } from './parsers';
import { FileType } from './enums';

/**
 * ParserFactory, the factory implementation for the set of Parsers
 * to deliver the correct parser implementation for each type of source code
 */
export class ParserFactory {
  private _parserMap: { [key: string]: Parser } = {};

  constructor() {
    this._loadDefaultParser();
  }

  /**
   * Used at the constructor to load the directory generator for files and folders
   */
  private _loadDefaultParser(): void {
    const dirParser = new DirectoryParser();
    this.addParser(dirParser, FileType.File);
    this.addParser(dirParser, FileType.Folder);
  }

  /**
   * Add a new parser instance together with the correct source code assignment
   * 
   * @param parser the parser instance to add
   * @param sourceAssignment the source code type to distinguish between other generators
   */
  public addParser(parser: Parser, sourceAssignment: string) {
    this._parserMap[sourceAssignment.toUpperCase()] = parser;
  }

  /**
   * Retrieve a code generator for a given code type
   * 
   * @param sourceAssignment the identifier (file ending) for which type of source code the generator is needed
   */
  public getParser(sourceAssignment: string): Parser | undefined {
    return this._parserMap[sourceAssignment.toUpperCase()];
  }
}