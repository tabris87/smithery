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
    setAttribute(attName: string, value: number | string | boolean | number[] | boolean[] | string[]): void;
    clone(): Node;
}
