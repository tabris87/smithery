import { IGenerator } from '../Interfaces';

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { FSTNode } from '../utils/FSTNode';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';
import { FSTTerminal } from '../utils/FSTTerminal';
import { FileType } from '../enums';

/**
 * Implementation of the Generator interface to generate files and directories
 */
export class DirectoryGenerator implements IGenerator {
  /**
   * @override
   */
  public generate(fst: FSTNode, options?: { filePath: string }): string {
    const route = options?.filePath || '.';

    if (fst instanceof FSTNonTerminal && fst.getName() === 'root' && fst.getType() === FileType.Folder) {
      this._processFiles(fst.getChildren(), route);
    } else if (fst instanceof FSTNonTerminal && fst.getName() === 'feature' && fst.getType() === FileType.Folder) {
      this._processFiles(fst.getChildren(), route);
    } else {
      this._processFiles([fst], route);
    }
    // Sry for this, but it is the only class not delivering a correct source code.
    return 'Done';
  }

  /**
   * Recursive file and folder generation
   *
   * @param nodes the tree nodes to process
   * @param sTargetPath the path of the parent element
   */
  private _processFiles(nodes: FSTNode[], sTargetPath: string) {
    for (const node of nodes) {
      if (node instanceof FSTNonTerminal) {
        //a non-terminal node can only be a folder within the DirectoryGeneration and Parsing
        if (node.getName() !== 'root' && !existsSync(join(sTargetPath, node.getName()))) {
          mkdirSync(join(sTargetPath, node.getName()));
        }
        this._processFiles(node.getChildren() || [], join(sTargetPath, node.getName() !== 'root' ? node.getName() : ''));
      } else {
        if (node instanceof FSTTerminal && node.getType() === FileType.File) {
          //we will write the file even if no content is provided!
          if (!existsSync(join(sTargetPath, node.getName()))) {
            writeFileSync(join(sTargetPath, node.getName()), (node as FSTTerminal)?.getContent() || '');
          }
        } else if (node instanceof FSTTerminal && node.getType() === FileType.Folder) {
          if (node.getName() !== 'root' && !existsSync(join(sTargetPath, node.getName()))) {
            mkdirSync(join(sTargetPath, node.getName()));
          }
        }
      }
    }
  }
}
