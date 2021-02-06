import { EventName } from '../IWatcher';
import { ContainerWatchMarker } from './ContainerWatchMarker';
import { existsSync, lstatSync, readdirSync, readFileSync, watch as fsWatch } from 'fs';
import { join as pJoin } from 'path';
import { FSWatcher } from 'fs';
import md5 from 'md5';
import { EventEmitter } from 'events';

export class UnixWatchStrategy {
  private fileHashes: { [key: string]: string } = {};
  private folderSizes: { [key: string]: number } = {};
  private fsWait: boolean | NodeJS.Timeout = false;
  private rootFolder: string = '';
  private markerContainer: ContainerWatchMarker = new ContainerWatchMarker([]);
  private emitter: EventEmitter = new EventEmitter();

  private indexing(filePath: string): boolean {
    if (existsSync(filePath)) {
      const fileStat = lstatSync(filePath);
      if (fileStat.isDirectory()) {
        const childs = readdirSync(filePath);
        this.folderSizes[filePath] = childs.length;
        this.markerContainer.addWatcher(this.watchFolder(filePath));
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
    let pathStat;
    //check for delete linux-way
    try {
      pathStat = lstatSync(eventPath);
      if (pathStat.isDirectory()) {
        readdirSync(eventPath);
      } else {
        readFileSync(eventPath);
      }
    } catch (_) {
      if (typeof this.fileHashes[eventPath] !== 'undefined') {
        /* console.log(`File ${eventPath} deleted;`); */
        this.emitter.emit(EventName.changed, { path: eventPath, reason: 'deleted', type: 'File' });
        delete this.fileHashes[eventPath];
      } else if (typeof this.folderSizes[eventPath] !== 'undefined') {
        /* console.log(`Folder ${eventPath} deleted;`); */
        this.emitter.emit(EventName.changed, { path: eventPath, reason: 'deleted', type: 'Folder' })
      }
      return;
    }

    //debouncing
    this.fsWait = setTimeout(() => {
      this.fsWait = false;
    }, 100);

    if (pathStat.isDirectory()) {
      //maybe it is created or deleted
      if (event === 'rename') {
        //if it was created we have to create base information
        if (typeof this.folderSizes[eventPath] === 'undefined') {
          this.indexing(eventPath);
          /* console.log(`Folder: ${eventPath} created.`); */
          this.emitter.emit(EventName.changed, { path: eventPath, reason: 'created', type: 'Folder' });
        } else {
          const curCount = readdirSync(eventPath).length;
          if (this.folderSizes[eventPath] !== curCount) {
            this.folderSizes[eventPath] = curCount;
            if (existsSync(eventPath)) {
              /* console.log(`Folder: ${eventPath} changed.`); */
              this.emitter.emit(EventName.changed, { path: eventPath, reason: 'changed', type: 'Folder' });
            } else {
              /* console.log(`Folder: ${eventPath} content deleted.`); */
              this.emitter.emit(EventName.changed, { path: eventPath, reason: 'changed', type: 'Folder' });
            }
          }
        }
      } else if (event === 'change') {
        /* console.log(`event 'change' for folder ${eventPath} triggered`); */
        this.emitter.emit(EventName.changed, { path: eventPath, reason: 'changed', type: 'Folder' });
      }
    }

    if (pathStat.isFile()) {
      if (event === 'rename') {
        if (typeof this.fileHashes[eventPath] !== 'undefined') {
          //it is deleted
          delete this.fileHashes[eventPath];
          /* console.log(`File ${eventPath} deleted`); */
          this.emitter.emit(EventName.changed, { path: eventPath, reason: 'deleted', type: 'File' });
        } else {
          //it is created

          this.fileHashes[eventPath] = md5(readFileSync(eventPath));
          /* console.log(`File ${eventPath} created`); */
          this.emitter.emit(EventName.changed, { path: eventPath, reason: 'created', type: 'File' });
        }
      }
      if (event === 'change') {
        const currentHash = md5(readFileSync(eventPath));
        if (this.fileHashes[eventPath] !== currentHash) {
          this.fileHashes[eventPath] = currentHash;
          /* console.log(`File ${eventPath} changed`); */
          this.emitter.emit(EventName.changed, { path: eventPath, reason: 'changed', type: 'File' });
        }
      }
    }
  }

  private watchFolder(folderPath: string): FSWatcher {
    return fsWatch(folderPath, { recursive: true }, this.watching.bind(this));
  }

  public stop(): void {
    this.markerContainer.unsubscribe();
    this.emitter.removeAllListeners();
  }

  public execute(watchPath: string): EventEmitter {
    this.rootFolder = watchPath;
    this.indexing(watchPath);
    return this.emitter;
  }
}