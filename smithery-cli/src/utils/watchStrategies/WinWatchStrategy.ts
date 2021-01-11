import { IWatcher, IWatchMarker } from '../IWatcher';
import { SingleWatchMarker } from './SingleWatchMarker';
import { existsSync, lstatSync, readdirSync, readFileSync, watch as fsWatch } from 'fs';
import { join as pJoin } from 'path';
import md5 from 'md5';
import { EventEmitter } from 'events';

export class WinWatchStrategy {
  private fileHashes: { [key: string]: string } = {};
  private folderSizes: { [key: string]: number } = {};
  private fsWait: boolean | NodeJS.Timeout = false;
  private rootFolder: string = '';
  private watchMarker: SingleWatchMarker | undefined;
  private emitter: EventEmitter = new EventEmitter();

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
        /* console.log(`File ${eventPath} deleted;`); */
        this.emitter.emit('changed', { path: eventPath, reason: 'deleted', type: 'File' });
        delete this.fileHashes[eventPath];
      }
      if (typeof this.folderSizes[eventPath] !== 'undefined') {
        /* console.log(`Folder ${eventPath} deleted;`); */
        this.emitter.emit('changed', { path: eventPath, reason: 'deleted', type: 'Folder' });
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
          /* console.log(`Folder ${eventPath} deleted;`); */
          this.emitter.emit('changed', { path: eventPath, reason: 'deleted', type: 'Folder' });
        } else {
          //if it was created we have to create base information
          this.folderSizes[eventPath] = readdirSync(eventPath).length;
          /* console.log(`Folder ${eventPath} created;`); */
          this.emitter.emit('changed', { path: eventPath, reason: 'created', type: 'Folder' });
        }
      } else if (event === 'change') {
        const current = readdirSync(eventPath).length;
        if (this.folderSizes[eventPath] !== current) {
          this.folderSizes[eventPath] = current;
          /* console.log(`Folder ${eventPath} changed`); */
          this.emitter.emit('changed', { path: eventPath, reason: 'changed', type: 'Folder' });
        }
      }
    }

    if (pathStat.isFile()) {
      if (event === 'rename') {
        if (typeof this.fileHashes[eventPath] !== 'undefined') {
          //it is deleted
          delete this.fileHashes[eventPath];
          /* console.log(`File ${eventPath} deleted`); */
          this.emitter.emit('changed', { path: eventPath, reason: 'deleted', type: 'File' });
        } else {
          //it is created
          this.fileHashes[eventPath] = md5(readFileSync(eventPath));
          /* console.log(`File ${eventPath} created`); */
          this.emitter.emit('changed', { path: eventPath, reason: 'created', type: 'File' });
        }
      }

      if (event === 'change') {
        const currentHash = md5(readFileSync(eventPath));
        if (this.fileHashes[eventPath] !== currentHash) {
          this.fileHashes[eventPath] = currentHash;
          console.log(`File ${eventPath} changed`);
          this.emitter.emit('changed', { path: eventPath, reason: 'changed', type: 'File' });
        }
      }
    }
  }

  public stop(): void {
    this.watchMarker?.unsubscribe();
    this.emitter.removeAllListeners();
  }

  public execute(watchPath: string): EventEmitter {
    this.rootFolder = watchPath;
    if (this.indexing(watchPath)) {
      const watcher = fsWatch(watchPath, { recursive: true }, this.watching.bind(this));
      this.watchMarker = new SingleWatchMarker(watcher);
      return this.emitter;
    } else {
      return this.emitter;
    }
  }
}