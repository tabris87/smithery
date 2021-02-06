import { EventEmitter } from 'events';

export interface IWatcher {
  watch(watchPath: string): EventEmitter;
  stop(): void;
}

export interface IWatchMarker {
  unsubscribe(): void;
}

export enum EventName {
  changed = 'changed'
}