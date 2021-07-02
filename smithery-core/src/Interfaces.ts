import { Imposer } from './Imposer';
import { FSTNode } from './utils/FSTNode';
import { FSTNonTerminal } from './utils/FSTNonTerminal';

export interface IGenerator {
  generate(fst: FSTNode, options?: { [key: string]: unknown }): string;
}

export interface IParser {
  parse(content: string, options?: { [key: string]: unknown }): FSTNode;
}

export interface IRule {
  apply: (baseFST: FSTNode, featureFST: FSTNode, targetNode: FSTNode, parent: FSTNonTerminal | undefined, context: Imposer) => void;
  id: string;
  package: string;
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
