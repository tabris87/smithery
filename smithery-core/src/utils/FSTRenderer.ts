import { FSTNode, FSTNonTerminal, FSTTerminal } from './index';

type DrawFSTNonTerminal = FSTNonTerminal & {
  prefix?: string;
};

/* type DrawFSTTerminal = FSTTerminal & {
  prefix?: string;
}; */

type DrawFSTNode = FSTNode & {
  prefix?: string;
};

export default class FSTRenderer {
  private _linesDrawn: number;

  constructor(private _fst: FSTNode) {
    this._linesDrawn = 0;
  }

  public render(): number {
    this._linesDrawn = 0;
    this._traverse(this._fst);
    return this._linesDrawn;
  }

  private _traverse(
    node: DrawFSTNode,
    level: number = 0,
    childIndex: number = -1
  ): void {
    node.prefix = ' ';
    const parentPrefix = this._createParentPrefix(node);
    const prefix = node.getParent()
      ? this._firstPrefix(
          (node?.getParent()?.getChildren() || []).length - 1 === childIndex
        )
      : node.prefix;
    const output = node.getName();
    const nodeSubtype = node.getType();
    const outputString = `${parentPrefix}${
      level !== 0 ? prefix : ''
    }${output} (${nodeSubtype})`;
    node.prefix = prefix;

    console.log(`${outputString}        `);
    this._linesDrawn++;
    level++;
    if (node instanceof FSTNonTerminal) {
      node.getChildren()?.forEach((subNode: FSTNode, index: number) => {
        if (
          subNode instanceof FSTNonTerminal ||
          subNode instanceof FSTTerminal
        ) {
          this._traverse(subNode, level === 0 ? 0 : level, index);
        }
      });
    }
  }

  private _createParentPrefix(node?: DrawFSTNode): string {
    if (node?.getParent()) {
      const sParentPrefix = this._createParentPrefix(node.getParent());

      let sCurPrefix = (node?.getParent() as DrawFSTNonTerminal)?.prefix;

      switch (sCurPrefix) {
        case String.fromCharCode(9562):
          sCurPrefix = ' ';
          break;
        case String.fromCharCode(9492):
          sCurPrefix = ' ';
          break;
        case String.fromCharCode(9568):
          sCurPrefix = String.fromCharCode(9553);
          break;
        case String.fromCharCode(9500):
          sCurPrefix = '|';
          break;
        default:
        //use sCurPrefix
      }

      return sParentPrefix + (sCurPrefix ? sCurPrefix : '');
    } else {
      return '';
    }
  }

  private _firstPrefix(bLastIndex: boolean) {
    if (bLastIndex) {
      return String.fromCharCode(9492); //"˪"
    } else {
      return String.fromCharCode(9500); //"⊢"
    }
  }
}
