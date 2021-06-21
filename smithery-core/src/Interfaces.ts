import { Imposer } from './Imposer';
import { FSTNode } from './utils/FSTNode';

export interface IGenerator {
  generate(fst: FSTNode, options?: { [key: string]: unknown }): string;
}

export interface IParser {
  parse(content: string, options?: { [key: string]: unknown }): FSTNode;
}

export interface IRule {
  apply: (baseFST: FSTNode, featureFST: FSTNode, context: Imposer) => FSTNode;
  target: string | string[];
  selector: string;
  selectorFeature?: string;
}

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
    parser?: { [key: string]: { [key: string]: any } }
    generator?: { [key: string]: { [key: string]: any } }
  };
}
