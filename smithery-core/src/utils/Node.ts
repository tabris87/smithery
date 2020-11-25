

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