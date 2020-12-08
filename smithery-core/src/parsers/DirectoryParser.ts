import { IParser } from '../Interfaces';
import { Node } from '../utils/Node';
import { FileType } from '../enums';

import { lstatSync, readdirSync, readFileSync } from 'fs';
import { join, extname, basename } from 'path';
import * as pm from 'picomatch';

export class DirectoryParser implements IParser {
  private static visitorKeys: { [key: string]: string[] } = {
    Folder: ['children'],
    File: []
  };

  parse(sFilePath: string, options?: { parent?: Node, exclude?: string[] }): Node {
    const route = sFilePath || '.';
    const stats = lstatSync(route);
    const oToken = new Node();

    oToken.name = basename(route);
    oToken.sourcePath = route;

    if (stats.isDirectory()) {
      oToken.type = FileType.Folder;
    } else {
      oToken.type = FileType.File;
    }

    if (options?.parent) {
      oToken.path = options?.parent?.path !== '' ? `${options.parent.path}.${oToken.type}` : oToken.type;
      oToken.parent = options?.parent;
    } else {
      oToken.path = '';
      oToken.parent = undefined;
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
      oToken.children = readdirSync(route).filter((child: string) => {
        return !exclMatcher(join(route, child));
      }).map((child: string) => {
        return this.parse(join(route, child), { parent: oToken, exclude: options?.exclude });
      });
    } else {
      oToken.ending = extname(route).replace('.', '').toUpperCase();
      oToken.content = readFileSync(route, { encoding: 'utf-8' });
    }

    return oToken;
  }

  getVisitorKeys(): { [key: string]: string[] } {
    return DirectoryParser.visitorKeys;
  }
}
