import { IParser, Node } from '../Interfaces';
export declare class DirectoryParser implements IParser {
    private static visitorKeys;
    parse(sFilePath: string, options?: {
        parent?: Node;
    }): Node;
    getVisitorKeys(): {
        [key: string]: string[];
    };
}
