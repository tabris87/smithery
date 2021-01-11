import { FSWatcher } from 'fs';
import { IWatchMarker } from '../IWatcher';

export class SingleWatchMarker implements IWatchMarker {

  constructor(private watcher: FSWatcher) { }

  public getWatcher(): FSWatcher {
    return this.watcher;
  }

  public unsubscribe(): void {
    this.watcher.close();
  }
}