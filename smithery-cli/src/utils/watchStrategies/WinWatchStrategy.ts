import { IWatcher, IWatchMarker } from '../IWatcher';
import { SingleWatchMarker } from './SingleWatchMarker';
import { existsSync, lstatSync, readdirSync, readFileSync, watch as fsWatch } from 'fs';
import { join as pJoin } from 'path';
import md5 from 'md5';

export class WinWatchStrategy {
  private fileHashes: { [key: string]: string } = {};
  private folderSizes: { [key: string]: number } = {};
  private fsWait: boolean | NodeJS.Timeout = false;
  private rootFolder: string = '';

  private indexing(filePath: string): boolean {
    if (existsSync(filePath)) {
      const fileStat = lstatSync(filePath);
      if (fileStat.isDirectory()) {
        const childs = readdirSync(filePath);
        this.folderSizes[filePath] = childs.length;
        childs.forEach((c: string) => { this.indexing(pJoin(filePath, c)) });
      }
      if (fileStat.isFile()) {
        this.fileHashes[filePath] = md5(readFileSync(filePath));
      }
      return true;
    } else {
      return false;
    }
  }

  private watching(event: string, filename: string): void {
    if (typeof filename === 'undefined') { return; }
    if (this.fsWait) { return; }

    const eventPath: string = pJoin(this.rootFolder, filename);
    //used to check if a file was deleted, as well as subfiles/subfolder
    if (event === 'rename' && !existsSync(eventPath)) {
      if (typeof this.fileHashes[eventPath] !== 'undefined') {
        console.log(`File ${eventPath} deleted;`);
        delete this.fileHashes[eventPath];
      }
      if (typeof this.folderSizes[eventPath] !== 'undefined') {
        console.log(`Folder ${eventPath} deleted;`);
        delete this.folderSizes[eventPath];
      }
      return;
    }

    const pathStat = lstatSync(eventPath);

    //debouncing
    this.fsWait = setTimeout(() => {
      this.fsWait = false;
    }, 100);

    if (pathStat.isDirectory()) {
      //maybe it's created or deleted
      if (event === 'rename') {
        if (typeof this.folderSizes[eventPath] !== 'undefined') {
          //it was deleted
          delete this.folderSizes[eventPath];
          console.log(`Folder ${eventPath} deleted;`)
        } else {
          //if it was created we have to create base information
          this.folderSizes[eventPath] = readdirSync(eventPath).length;
          console.log(`Folder ${eventPath} created;`);
        }
      } else if (event === 'change') {
        const current = readdirSync(eventPath).length;
        if (this.folderSizes[eventPath] !== current) {
          this.folderSizes[eventPath] = current;
          console.log(`Folder ${eventPath} changed`);
        }
      }
    }

    if (pathStat.isFile()) {
      if (event === 'rename') {
        if (typeof this.fileHashes[eventPath] !== 'undefined') {
          //it is deleted
          delete this.fileHashes[eventPath];
          console.log(`File ${eventPath} deleted`);
        } else {
          //it is created
          this.fileHashes[eventPath] = md5(readFileSync(eventPath));
          console.log(`File ${eventPath} created`);
        }
      }

      if (event === 'change') {
        const currentHash = md5(readFileSync(eventPath));
        if (this.fileHashes[eventPath] !== currentHash) {
          this.fileHashes[eventPath] = currentHash;
          console.log(`File ${eventPath} changed`);
        }
      }
    }
  }

  public execute(watchPath: string): IWatchMarker | undefined {
    this.rootFolder = watchPath;
    if (this.indexing(watchPath)) {
      const watcher = fsWatch(watchPath, { recursive: true }, this.watching.bind(this));
      return new SingleWatchMarker(watcher);
    } else {
      return;
    }
  }
}