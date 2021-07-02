import { IParser } from '../Interfaces';
import { FileType } from '../enums';

import { lstatSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import * as pm from 'picomatch';
import { FSTNode } from '../utils/FSTNode';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';
import { FSTTerminal } from '../utils/FSTTerminal';

export class DirectoryParser implements IParser {
  parse(sFilePath: string, options?: { parent?: FSTNonTerminal, exclude?: string[] }): FSTNode {
    const route = sFilePath || '.';
    const stats = lstatSync(route);

    const name: string = basename(sFilePath);
    let type: string = "";

    if (stats.isDirectory()) {
      type = FileType.Folder;
    } else {
      type = FileType.File;
    }

    let exclMatcher: (test: string) => boolean;
    if (options?.exclude) {
      exclMatcher = pm(options.exclude);
    } else {
      //this should be the empty default matcher
      exclMatcher = pm([]);
    }
    //current assumption is that only direct childs should be excluded
    //otherwise an incomplete node will be created
    if (stats.isDirectory()) {
      const node = new FSTNonTerminal(type, name);

      const children = readdirSync(route).filter((child: string) => {
        return !exclMatcher(join(route, child));
      }).map((child: string) => {
        return this.parse(join(route, child), { parent: node, exclude: options?.exclude });
      });
      node.addChildren(children);
      if (options?.parent) {
        node.setParent(options?.parent);
      }
      return node;
    } else {
      const content = readFileSync(route, { encoding: 'utf-8' });
      const node = new FSTTerminal(type, name, content);
      const fileName = basename(route);
      const suffixIndex = fileName.lastIndexOf('.');

      if (options?.parent) {
        node.setParent(options.parent);
      }

      if (suffixIndex > -1) {
        node.setCodeLanguage(fileName.substring(suffixIndex).replace('.', '').trim());
      } else {
        node.setMergeStrategy('fileOverride');
      }

      return node;
    }
  }
}
