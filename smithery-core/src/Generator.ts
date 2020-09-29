import { DirectoryGenerator } from './generators';
import { Generator } from './Interfaces';
import { FileType } from './enums';

/**
 * GeneratorFactory, the factory implementation for the set of generators
 * to deliver the correct generator implementation for each type of source code
 */
export class GeneratorFactory {
  private _generatorMap: { [key: string]: Generator } = {};

  constructor() {
    this._loadDefaultGenerators();
  }

  /**
   * Used at the constructor to load the directory generator for files and folders
   */
  private _loadDefaultGenerators(): void {
    const dirGenerator = new DirectoryGenerator();
    this.addGenerator(dirGenerator, FileType.File);
    this.addGenerator(dirGenerator, FileType.Folder);
  }

  /**
   * Add a new generator instance together with the correct source code assignment
   *
   * @param generator the generator instance to add
   * @param sourceAssignment the source code type to distinguish between other generators
   */
  public addGenerator(generator: Generator, sourceAssignment: string): void {
    this._generatorMap[sourceAssignment.toUpperCase()] = generator;
  }

  /**
   * Retrieve a code generator for a given code type
   *
   * @param sourceAssignment the identifier (file ending) for which type of source code the generator is needed
   */
  public getGenerator(sourceAssignment: string = ""): Generator | undefined {
    return this._generatorMap[sourceAssignment.toUpperCase()];
  }
}
