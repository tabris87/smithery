export interface IWatcher {
  watch(watchPath: string): IWatchMarker | undefined
}

export interface IWatchMarker {
  unsubscribe(): void;
}