import { FSTNode } from "../utils";

export interface IGenerator {
    generate(fst: FSTNode, options?: { [key: string]: unknown }): string;
}