import { IWatcher, IWatchMarker } from "./IWatcher";
import { UnixWatchStrategy } from "./watchStrategies/UnixWatchStrategy";
import { WinWatchStrategy } from "./watchStrategies/WinWatchStrategy";

export class Watcher implements IWatcher {
  private watchMark: IWatchMarker | undefined;

  constructor(private unixWStr: UnixWatchStrategy, private winWStr: WinWatchStrategy) {
    this.unixWStr = new UnixWatchStrategy();
    this.winWStr = new WinWatchStrategy();
  }

  watch(folderPath: string): IWatchMarker | undefined {
    const os = process.platform;
    if (os === 'win32') {
      this.watchMark = this.winWStr.execute(folderPath);
    } else if (os === 'linux') {
      this.watchMark = this.unixWStr.execute(folderPath);
    } else {
      throw new Error('unknown OS watch mode can not be supported');
    }
    return;
  }
}