import { IGenerator } from '../Interfaces';
import { Node } from '../utils/Node';
/**
 * Implementation of the Generator interface to generate files and directories
 */
export declare class DirectoryGenerator implements IGenerator {
    /**
     * @override
     */
    generate(oAST: Node, options?: {
        filePath: string;
    }): string;
    /**
     * Recursive file and folder generation
     *
     * @param aNodesToProcess the tree nodes to process
     * @param sTargetPath the path of the parent element
     */
    private _processFiles;
}
