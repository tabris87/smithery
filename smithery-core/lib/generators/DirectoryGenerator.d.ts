import { Generator } from '../interfaces';
/**
 * Implementation of the Generator interface to generate files and directories
 */
export declare class DirectoryGenerator implements Generator {
    /**
     * @override
     */
    generate(oAST: {
        [key: string]: any;
    }, options?: {
        [key: string]: any;
    }): string;
    /**
     * Recursive file and folder generation
     *
     * @param aNodesToProcess the tree nodes to process
     * @param sTargetPath the path of the parent element
     */
    private _processFiles;
}
