import { IGenerator } from '../Interfaces';
import { Node } from '../utils/Node';
import { FileType } from '../enums';

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Implementation of the Generator interface to generate files and directories
 */
export class DirectoryGenerator implements IGenerator {
  /**
   * @override
   */
  public generate(oAST: Node, options?: { filePath: string }): string {
    const route = options?.filePath || '.';


    this._processFiles([oAST], route);
    // Sry for this, but it is the only class not delivering a correct source code.
    return 'Done';
  }

  /**
   * Recursive file and folder generation
   *
   * @param aNodesToProcess the tree nodes to process
   * @param sTargetPath the path of the parent element
   */
  private _processFiles(aNodesToProcess: Node[], sTargetPath: string) {
    for (const oNode of aNodesToProcess) {
      if (oNode.type === FileType.Folder) {
        if (oNode.name !== 'root' && !existsSync(join(sTargetPath, oNode.name))) {
          mkdirSync(join(sTargetPath, oNode.name));
        }
        this._processFiles(oNode.children || [], join(sTargetPath, oNode.name !== 'root' ? oNode.name : ''));
      } else {
        //we will write the file even if no content is provided!
        if (!existsSync(join(sTargetPath, oNode.name))) {
          writeFileSync(join(sTargetPath, oNode.name), oNode?.content || '');
        }
      }
    }
  }
}
