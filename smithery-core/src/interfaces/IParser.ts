import { FSTNode } from "../utils/FSTNode";

export interface IParser {
    parse(content: string, options?: { [key: string]: unknown }): FSTNode;
}