export interface Generator {
    generate(oAST: {
        [key: string]: any;
    }, options?: {
        [key: string]: any;
    }): string;
    [key: string]: any;
}
/**
 * @todo remove later on or take it to the core implementation
 */
export declare class Node {
    type: string;
    start: number | undefined;
    end: number;
    name: string;
    path: string;
    sourcePath: string;
    parent: Node | undefined;
    children?: Node[];
    ending?: string;
    content?: string;
    featureName?: string;
    [key: string]: any;
    private attributes;
    constructor(pos?: number);
    getAttribute(attName: string): any | undefined;
    setAttribute(attName: string, value: any): void;
    clone(): Node;
}
export interface Parser {
    parse(content: string, options?: {
        [key: string]: any;
    }): Node;
    getVisitorKeys(): {
        [key: string]: string[];
    };
    [key: string]: any;
}
