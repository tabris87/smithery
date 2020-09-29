import { Parser, Node } from '../interfaces';
export declare class DirectoryParser implements Parser {
    private static visitorKeys;
    parse(sFilePath: string, options?: {
        [key: string]: any;
    }): Node;
    getVisitorKeys(): {
        [key: string]: string[];
    };
}
