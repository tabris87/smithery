export interface Generator {
  generate(oAST: { [key: string]: any }, options?: { [key: string]: any }): string
}

/**
 * @todo remove later on or take it to the core implementation
 */
export class Node {
  public type: string = "";
  public start: number | undefined = 0;
  public end: number = 0;

  /*intermediate definitions */
  public name: string = "";
  public path: string = "";
  public sourcePath: string = "";
  public parent: Node | undefined = undefined;
  public children?: Node[];
  public ending?: string;
  public content?: string;

  constructor(pos?: number) {
    this.start = pos;
  }
}

export interface Parser {
  parse(content: string, options?: { [key: string]: any }): Node;
  getVisitorKeys(): { [key: string]: string[] };
}