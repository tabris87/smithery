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

/**
 * @todo remove later on or take it to the core implementation
 */
export class Node {
  public type: string = '';
  public start: number | undefined = 0;
  public end: number = 0;

  /*intermediate definitions */
  public name: string = '';
  public path: string = '';
  public sourcePath: string = '';
  public parent: Node | undefined = undefined;
  public children?: Node[];
  public ending?: string;
  public content?: string;
  public featureName?: string;
  [key: string]: any;

  private attributes: { [key: string]: any } = {};

  constructor(pos?: number) {
    this.start = pos;
  }

  getAttribute(attName: string): any | undefined {
    return this.attributes[attName];
  }

  setAttribute(attName: string, value: number | string | boolean | number[] | boolean[] | string[]): void {
    this.attributes[attName] = value;
  }

  public clone(): Node {
    const clone = new Node();
    clone.type = this.type;
    clone.start = this.start;
    clone.end = this.end;

    clone.name = this.name;
    clone.path = this.path;
    clone.sourcePath = this.sourcePath;
    clone.parent = this.parent;
    clone.children = this.children;
    clone.ending = this.ending;
    clone.content = this.content;
    clone.featureName = this.featureName;
    Object.keys(this.attributes).forEach((key) => {
      clone.setAttribute(key, this.getAttribute(key));
    });
    return clone;
  }
}