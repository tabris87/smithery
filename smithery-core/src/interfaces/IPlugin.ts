import { IGenerator } from "./IGenerator";
import { IParser } from "./IParser";
import { IRule } from "./IRule";


export interface IPlugin {
    name: string,
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
        parser?: { [key: string]: { [key: string]: unknown } }
        generator?: { [key: string]: { [key: string]: unknown } }
    };
}