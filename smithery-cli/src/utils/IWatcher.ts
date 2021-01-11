export interface IWatcher {
  watch(watchPath: string): IWatchMarker | undefined;
  stop(): void;
}

export interface IWatchMarker {
  unsubscribe(): void;
}