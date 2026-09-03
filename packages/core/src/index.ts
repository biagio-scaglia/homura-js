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
  IndexedDBAdapter,
  createLocalStorageAdapter,
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
  deepClone,
  deepEqual,
  createDraft,
  isObject,
  isPlainObject
} from './immutability';


export { HistoryGraph } from './history';
export { SnapshotManager } from './snapshots';
export { EventEmitter } from './events';
export { MiddlewarePipeline } from './middleware';
