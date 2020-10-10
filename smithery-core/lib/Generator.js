"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorFactory = void 0;
const generators_1 = require("./generators");
const enums_1 = require("./enums");
/**
 * GeneratorFactory, the factory implementation for the set of generators
 * to deliver the correct generator implementation for each type of source code
 */
class GeneratorFactory {
    constructor() {
        this._generatorMap = {};
        this._loadDefaultGenerators();
    }
    /**
     * Used at the constructor to load the directory generator for files and folders
     */
    _loadDefaultGenerators() {
        const dirGenerator = new generators_1.DirectoryGenerator();
        this.addGenerator(dirGenerator, enums_1.FileType.File);
        this.addGenerator(dirGenerator, enums_1.FileType.Folder);
    }
    /**
     * Add a new generator instance together with the correct source code assignment
     *
     * @param generator the generator instance to add
     * @param sourceAssignment the source code type to distinguish between other generators
     */
    addGenerator(generator, sourceAssignment) {
        this._generatorMap[sourceAssignment.toUpperCase()] = generator;
    }
    /**
     * Retrieve a code generator for a given code type
     *
     * @param sourceAssignment the identifier (file ending) for which type of source code the generator is needed
     */
    getGenerator(sourceAssignment = "") {
        return this._generatorMap[sourceAssignment.toUpperCase()];
    }
}
exports.GeneratorFactory = GeneratorFactory;
//# sourceMappingURL=Generator.js.map