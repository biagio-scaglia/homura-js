export { createHomura, HomuraInstance } from './homura';

export type {
  Homura,
  HomuraConfig,
  HistoryEntry,
  Branch,
  Snapshot,
  DiffChange,
  DiffType,
  PersistenceAdapter,
  SerializedHomura,
  HomuraMiddleware,
  MiddlewareContext,
  HomuraEventMap,
  HomuraEventName,
  HomuraListener,
  HomuraWildcardListener,
  HomuraUnsubscribe,
  StateUpdater,
  StateUpdateOptions,
  ReplayOptions,
  BranchMergeOptions,
  BranchComparison,
  MergeConflict,
  CompactionOptions
} from './types';

export {
  HomuraError,
  HomuraHistoryError,
  HomuraSnapshotError,
  HomuraBranchError,
  HomuraSerializationError,
  HomuraPersistenceError,
  HomuraMiddlewareError
} from './errors';

export {
  MemoryAdapter,
  LocalStorageAdapter,
  SessionStorageAdapter,
  IndexedDBAdapter,
  createLocalStorageAdapter,
  createSessionStorageAdapter,
  createIndexedDBAdapter,
  createMemoryAdapter,
  PersistenceController,
  serializeRichState,
  deserializeRichState
} from './persistence';

export {
  diffStates,
  diffEntries,
  applyDiff,
  formatDiffPath
} from './diff';

export {
  diffStatesAsync,
  createAsyncDiffer,
  AsyncDiffer
} from './diff-worker';
export type { AsyncDiffOptions } from './diff-worker';

export {
  deepClone,
  deepEqual,
  deepFreeze,
  createDraft,
  isObject,
  isPlainObject
} from './immutability';


export { HistoryGraph } from './history';
export { SnapshotManager } from './snapshots';
export { EventEmitter } from './events';
export { MiddlewarePipeline } from './middleware';
