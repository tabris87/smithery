import { IParser } from '../Interfaces';
import { FileType } from '../enums';

import { lstatSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import * as pm from 'picomatch';
import { FSTNode } from '../utils/FSTNode';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';
import { FSTTerminal } from '../utils/FSTTerminal';
import { ParserFactory } from '../Parser';

export class DirectoryParser implements IParser {
  parse(sFilePath: string, options?: { parent?: FSTNonTerminal, exclude?: string[], parserFactory?: ParserFactory }): FSTNode {
    const route = sFilePath || '.';
    const stats = lstatSync(route);
    const parent = options?.parent;

    let name: string = 'root';
    let featureName = '';
    let type: string = "";
    let subfiles: string[] = [];

    let exclMatcher: (test: string) => boolean;
    if (options?.exclude) {
      exclMatcher = pm(options.exclude);
    } else {
      //this should be the empty default matcher
      exclMatcher = pm([]);
    }

    if (parent && parent.getName() === 'root') {
      name = 'feature';
      featureName = basename(sFilePath);
    } else if (parent && parent.getName() !== 'root') {
      name = basename(sFilePath);
      featureName = parent.getFeatureName();
    }

    //current assumption is that only direct childs should be excluded
    //otherwise an incomplete node will be created
    if (stats.isDirectory()) {
      type = FileType.Folder;
      subfiles = readdirSync(route);
      const node = new FSTNonTerminal(type, name);
      node.setFeatureName(featureName);
      const children = subfiles.filter((child: string) => {
        return !exclMatcher(join(route, child));
      }).map((child: string) => {
        return this.parse(join(route, child), { parent: node, exclude: options?.exclude });
      });
      node.addChildren(children);
      return node;
    } else {
      type = FileType.File;
      if (!parent) {
        name = basename(sFilePath);
      } else if (parent && parent.getName() === 'root') {
        name = basename(sFilePath);
      }

      const content = readFileSync(route, { encoding: 'utf-8' });
      const node = new FSTTerminal(type, name, content);
      node.setFeatureName(featureName);

      const fileName = basename(route);
      const suffixIndex = fileName.lastIndexOf('.');

      if (suffixIndex > -1) {
        node.setCodeLanguage(fileName.substring(suffixIndex).replace('.', '').trim());
        if (options?.parserFactory && options.parserFactory.getParser(node.getCodeLanguage())) {
          node.setMergeStrategy('fileCompose');
        } else {
          console.warn(`No plugin for ${fileName.substring(suffixIndex).replace('.', '').trim()} found, set strategy to 'override'.`);
          node.setMergeStrategy('override');
        }
      } else {
        node.setMergeStrategy('override');
      }

      return node;
    }
  }
}
