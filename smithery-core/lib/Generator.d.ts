import { Generator } from './interfaces';
/**
 * GeneratorFactory, the factory implementation for the set of generators
 * to deliver the correct generator implementation for each type of source code
 */
export declare class GeneratorFactory {
    private _generatorMap;
    constructor();
    /**
     * Used at the constructor to load the directory generator for files and folders
     */
    private _loadDefaultGenerators;
    /**
     * Add a new generator instance together with the correct source code assignment
     *
     * @param generator the generator instance to add
     * @param sourceAssignment the source code type to distinguish between other generators
     */
    addGenerator(generator: Generator, sourceAssignment: string): void;
    /**
     * Retrieve a code generator for a given code type
     *
     * @param sourceAssignment the identifier (file ending) for which type of source code the generator is needed
     */
    getGenerator(sourceAssignment: string): Generator | undefined;
}
