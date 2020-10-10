export interface IGenerator {
    generate(oAST: {
        [key: string]: any;
    }, options?: {
        [key: string]: any;
    }): string;
    [key: string]: any;
}
export interface IParser {
    parse(content: string, options?: {
        [key: string]: any;
    }): Node;
    getVisitorKeys(): {
        [key: string]: string[];
    };
    [key: string]: any;
}
import { Imposer } from './Imposer';
export interface IRule {
    apply: (baseFST: Node, featureFST: Node, context: Imposer) => Node;
    target: string | string[];
    selector: string;
    selectorFeature?: string;
}
export interface IPlugin {
    name: string;
    generator: {
        generator: IGenerator;
        fileEnding: string[];
    };
    parser: {
        parser: IParser;
        fileEnding: string[];
    };
    rules: IRule[];
    config?: {
        parser?: {
            [key: string]: {
                [key: string]: any;
            };
        };
        generator?: {
            [key: string]: {
                [key: string]: any;
            };
        };
    };
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
    setAttribute(attName: string, value: number | string | boolean | number[] | boolean[] | string[]): void;
    clone(): Node;
}
