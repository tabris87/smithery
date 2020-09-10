import { Generator } from '../interfaces';
import { FileType } from '../enums';

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Implementation of the Generator interface to generate files and directories
 */
export class DirectoryGenerator implements Generator {

  /**
   * @override
   */
  public generate(oAST: { [key: string]: any }, options?: { [key: string]: any }): string {
    const route = options?.filePath || '.';

    const aItems = oAST.children;
    if (aItems) {
      this._processFiles(aItems, route);
    }
    // Sry for this but this is the only class not delivering a correct source code.
    return 'Done';
  }

  /**
   * Recursive file and folder generation
   * 
   * @param aNodesToProcess the tree nodes to process
   * @param sTargetPath the path of the parent element
   */
  private _processFiles(aNodesToProcess: [{ [key: string]: any }], sTargetPath: string) {
    for (const oNode of aNodesToProcess) {
      if (oNode.type === FileType.Folder) {
        mkdirSync(join(sTargetPath, oNode.name));
        this._processFiles(oNode.children, join(sTargetPath, oNode.name));
      } else {
        writeFileSync(join(sTargetPath, oNode.name), oNode.content);
      }
    }
  }
}