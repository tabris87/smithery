import { Node } from './utils/Node';
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IGenerator {
  generate(oAST: { [key: string]: any }, options?: { [key: string]: any }): string;
  [key: string]: any;
}

export interface IParser {
  parse(content: string, options?: { [key: string]: any }): Node;
  getVisitorKeys(): { [key: string]: string[] };
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
