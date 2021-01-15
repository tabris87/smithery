import { IWatcher } from "./IWatcher";
import { UnixWatchStrategy } from "./watchStrategies/UnixWatchStrategy";
import { WinWatchStrategy } from "./watchStrategies/WinWatchStrategy";
import { EventEmitter } from 'events';

export enum EventName {
  changed = 'Changed'
}
export class Watcher implements IWatcher {
  private watcher: EventEmitter | undefined;
  private informer: EventEmitter;
  private unixWStr: UnixWatchStrategy;
  private winWStr: WinWatchStrategy;

  constructor() {
    this.unixWStr = new UnixWatchStrategy();
    this.winWStr = new WinWatchStrategy();
    this.informer = new EventEmitter();
  }

  public watch(folderPath: string): EventEmitter {
    const os = process.platform;
    if (os === 'win32') {
      this.watcher = this.winWStr.execute(folderPath);
      this.watcher.on(EventName.changed, (changeInfo: { path: string, reason: string, type: string }) => { this.informer.emit(EventName.changed, changeInfo.path); })
    } else if (os === 'linux') {
      this.watcher = this.unixWStr.execute(folderPath);
      this.watcher.on(EventName.changed, (changeInfo: { path: string, reason: string, type: string }) => { this.informer.emit(EventName.changed, changeInfo.path); })
    } else {
      throw new Error('unknown OS watch mode can not be supported');
    }
    return this.informer;
  }

  public stop(): void {
    this.winWStr.stop();
    this.unixWStr.stop();
  }

  public on(eventName: EventName, callback: (path: string) => void): EventEmitter | undefined {
    if (eventName) {
      return this.informer.on(eventName, callback);
    }
  }
}