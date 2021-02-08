import { FSWatcher } from 'fs';
import { IWatchMarker } from '../IWatcher';

export class ContainerWatchMarker implements IWatchMarker {
  constructor(private watcher: FSWatcher[]) { }

  public getWatcher(index?: number): FSWatcher | FSWatcher[] {
    if (typeof index !== 'undefined') {
      return this.watcher[index];
    } else {
      return this.watcher;
    }
  }

  public unsubscribe(): void {
    this.watcher.forEach(w => w.close());
  }

  public addWatcher(watcher: FSWatcher): void {
    this.watcher.push(watcher);
  }
}