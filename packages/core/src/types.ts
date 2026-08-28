/**
 * History Entry representing a point in the DAG state history.
 */
export interface HistoryEntry<T> {
  /** Unique identifier for the history entry (UUID or nanoid-like) */
  id: string;
  /** ID of the parent entry in the DAG, or null for the initial root entry */
  parentId: string | null;
  /** IDs of child entries branching or continuing from this node */
  childrenIds: string[];
  /** ID of the branch this entry belongs to */
  branchId: string;
  /** Timestamp when this entry was created (ms epoch) */
  timestamp: number;
  /** Descriptive human-readable label */
  label: string;
  /** The snapshot of the state at this point */
  state: T;
  /** Arbitrary metadata attached to this entry */
  metadata?: Record<string, unknown>;
}

/**
 * Branch representing an independent timeline of entries.
 */
export interface Branch {
  /** Unique branch ID */
  id: string;
  /** Human-readable branch name */
  name: string;
  /** Creation timestamp */
  createdAt: number;
  /** Entry ID where this branch originated */
  rootEntryId: string;
  /** Entry ID of the latest node in this branch */
  headEntryId: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Named snapshot bookmarking a specific state in history.
 */
export interface Snapshot<T> {
  /** Unique snapshot ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Timestamp when snapshot was taken */
  timestamp: number;
  /** Captured state */
  state: T;
  /** Corresponding history entry ID */
  historyEntryId: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Type of difference detected in diff engine.
 */
export type DiffType = 'added' | 'removed' | 'changed';

/**
 * Diff change item representing a granular change between two states.
 */
export interface DiffChange {
  /** Property path array (e.g. ['user', 'name'] or ['cart', 0, 'qty']) */
  path: (string | number)[];
  /** Operation type */
  type: DiffType;
  /** Value before change (for 'changed' or 'removed') */
  oldValue?: unknown;
  /** Value after change (for 'changed' or 'added') */
  newValue?: unknown;
  /** Value for 'added' or 'removed' */
  value?: unknown;
}

/**
 * Persistence adapter interface for custom storage backends.
 */
export interface PersistenceAdapter<T> {
  /** Persist serialized state */
  save(data: SerializedHomura<T>): Promise<void> | void;
  /** Load serialized state */
  load(): Promise<SerializedHomura<T> | null> | SerializedHomura<T> | null;
  /** Clear persisted state */
  clear(): Promise<void> | void;
}

/**
 * Full serialized payload of a Homura instance.
 */
export interface SerializedHomura<T> {
  version: number;
  rootEntryId: string;
  currentEntryId: string;
  currentBranchId: string;
  entries: Record<string, HistoryEntry<T>>;
  branches: Record<string, Branch>;
  snapshots: Record<string, Snapshot<T>>;
}

/**
 * Context passed to middleware functions.
 */
export interface MiddlewareContext<T> {
  /** Action being executed */
  action:
    | 'setState'
    | 'update'
    | 'commit'
    | 'undo'
    | 'redo'
    | 'rewind'
    | 'fastForward'
    | 'jumpTo'
    | 'restore'
    | 'branch'
    | 'switchBranch'
    | 'deleteBranch';
  /** Current state before action */
  currentState: T;
  /** Proposed next state (if applicable) */
  nextState?: T;
  /** Label for the operation */
  label?: string;
  /** Operation metadata */
  metadata?: Record<string, unknown>;
  /** Current active history entry */
  currentEntry: HistoryEntry<T>;
  /** Abort the operation */
  cancel: () => void;
  /** Set or override next state */
  setNextState?: (state: T) => void;
  /** Set or enrich metadata */
  setMetadata?: (metadata: Record<string, unknown>) => void;
}

/**
 * Middleware function signature.
 */
export type HomuraMiddleware<T> = (
  context: MiddlewareContext<T>,
  next: () => void
) => void | Promise<void>;

/**
 * Replay engine options for automated time-travel playback.
 */
export interface ReplayOptions<T> {
  /** Entry ID to start replay from (defaults to branch root or oldest entry) */
  from?: string;
  /** Entry ID to end replay at (defaults to current entry or branch head) */
  to?: string;
  /** Playback speed multiplier (1 = 1x, 2 = 2x, 5 = 5x, etc., default: 1) */
  speed?: number;
  /** Base delay between steps in milliseconds (default: 300ms) */
  stepDelayMs?: number;
  /** Callback fired before each state transition during replay */
  onStep?: (entry: HistoryEntry<T>, stepIndex: number, totalSteps: number) => void;
}

/**
 * Context passed to manual merge conflict resolvers.
 */
export interface MergeConflict<V = unknown> {
  /** Dot/array path to the conflicting property */
  path: (string | number)[];
  /** Conflicting value in current (target/ours) branch */
  ours: V;
  /** Conflicting value in source (theirs) branch */
  theirs: V;
  /** Value at the Lowest Common Ancestor (base) entry, if found */
  base?: V;
}

/**
 * Options for merging two branches.
 */
export interface BranchMergeOptions {
  /** Custom label for the merge commit */
  label?: string;
  /** Metadata to attach to merge commit */
  metadata?: Record<string, unknown>;
  /**
   * Conflict resolution strategy:
   * - 'theirs': Source branch values override active branch on conflicts (default)
   * - 'ours': Active branch retains its values on conflicts
   * - 'manual': Custom resolver callback is invoked for each field conflict
   * - 'three-way': Standard 3-way merge
   * - 'fast-forward': Fast-forward if ancestor
   */
  strategy?: 'theirs' | 'ours' | 'manual' | 'three-way' | 'fast-forward';
  /**
   * Custom conflict resolver function when strategy is 'manual' or to override specific collisions.
   */
  resolveConflict?: (conflict: MergeConflict) => any;
}

/**
 * Result of comparing two branches in the DAG.
 */
export interface BranchComparison {
  /** Source branch ID */
  branchA: string;
  /** Target branch ID */
  branchB: string;
  /** Common ancestor entry ID in the DAG (if any) */
  commonAncestorId: string | null;
  /** Number of entries branchA has ahead of common ancestor */
  aheadCount: number;
  /** Number of entries branchB has ahead of common ancestor */
  behindCount: number;
  /** Deep structural diff changes between both heads */
  diff: DiffChange[];
}

/**
 * Options for history compaction and memory optimization.
 */
export interface CompactionOptions {
  /** Target maximum number of entries to retain */
  maxEntries?: number;
  /** Whether to preserve entries referenced by snapshots (default: true) */
  preserveSnapshots?: boolean;
  /** Whether to preserve branch head entries (default: true) */
  retainBranchHeads?: boolean;
}

/**
 * Typed Homura event map.
 */
export interface HomuraEventMap<T> {
  'state:change': {
    state: T;
    prevState: T;
    entry: HistoryEntry<T>;
    action: string;
  };
  'history:add': {
    entry: HistoryEntry<T>;
  };
  'history:remove': {
    entryIds: string[];
  };
  'history:jump': {
    fromEntry: HistoryEntry<T>;
    toEntry: HistoryEntry<T>;
  };
  'history:undo': {
    fromEntry: HistoryEntry<T>;
    toEntry: HistoryEntry<T>;
  };
  'history:redo': {
    fromEntry: HistoryEntry<T>;
    toEntry: HistoryEntry<T>;
  };
  'snapshot:create': {
    snapshot: Snapshot<T>;
  };
  'snapshot:restore': {
    snapshot: Snapshot<T>;
    entry: HistoryEntry<T>;
  };
  'snapshot:delete': {
    snapshotId: string;
  };
  'branch:create': {
    branch: Branch;
  };
  'branch:switch': {
    fromBranch: Branch;
    toBranch: Branch;
  };
  'branch:delete': {
    branchId: string;
  };
  'branch:merge': {
    sourceBranchId: string;
    targetBranchId: string;
    entry: HistoryEntry<T>;
  };
  'transaction:commit': {
    entry: HistoryEntry<T>;
    label: string;
  };
  'replay:start': {
    fromEntryId: string;
    toEntryId: string;
    totalSteps: number;
  };
  'replay:step': {
    entry: HistoryEntry<T>;
    stepIndex: number;
    totalSteps: number;
  };
  'replay:end': {
    finalEntry: HistoryEntry<T>;
  };
  'history:compact': {
    prunedCount: number;
    remainingCount: number;
  };
}

export type HomuraEventName = keyof HomuraEventMap<any> | '*';
export type HomuraListener<T, K extends keyof HomuraEventMap<T>> = (
  event: HomuraEventMap<T>[K]
) => void;
export type HomuraWildcardListener<T> = (
  eventName: keyof HomuraEventMap<T>,
  eventData: HomuraEventMap<T>[keyof HomuraEventMap<T>]
) => void;
export type HomuraUnsubscribe = () => void;

/**
 * Options when setting state or updating.
 */
export interface StateUpdateOptions {
  /** Custom label for the commit / history entry */
  label?: string;
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>;
  /** Whether to skip creating a history entry (silent update) */
  silent?: boolean;
}

/**
 * Configuration options for createHomura.
 */
export interface HomuraConfig<T> {
  /** Initial state of the application */
  initialState: T;
  /** Max history entries to keep in graph before pruning (default: 1000, 0 = unlimited) */
  maxHistory?: number;
  /** Whether branching is enabled when updating from historical states (default: true) */
  enableBranches?: boolean;
  /** Auto create branch when updating from historical node (default: true) */
  autoBranchOnDivergence?: boolean;
  /** Persistence configuration */
  persistence?:
    | PersistenceAdapter<T>
    | {
        adapter: PersistenceAdapter<T>;
        autoSave?: boolean;
        debounceMs?: number;
      };
  /** Middleware array */
  middleware?: HomuraMiddleware<T>[];
  /** Custom state cloner */
  clone?: (state: T) => T;
  /** Custom equality checker */
  equalityCheck?: (a: T, b: T) => boolean;
}

/**
 * State updater function for homura.update(updater)
 */
export type StateUpdater<T> = (state: T) => T | void;

/**
 * Public Homura instance interface.
 */
export interface Homura<T> {
  /** Returns current application state */
  getState(): T;

  /** Replaces state and commits new history entry */
  setState(nextState: T, options?: StateUpdateOptions): HistoryEntry<T>;

  /** Updates state via draft or returned state and commits */
  update(updater: StateUpdater<T>, options?: StateUpdateOptions): HistoryEntry<T>;

  /** Batches multiple state updates into a single atomic history entry */
  transaction<R = void>(
    fn: (draft: T) => R,
    options?: StateUpdateOptions
  ): HistoryEntry<T>;

  /** Commits current state with a custom label & metadata */
  commit(label: string, metadata?: Record<string, unknown>): HistoryEntry<T>;

  /** Undoes one step to parent node */
  undo(): HistoryEntry<T> | null;

  /** Redoes one step to child node */
  redo(): HistoryEntry<T> | null;

  /** Rewinds N steps in history */
  rewind(steps: number): HistoryEntry<T> | null;

  /** Fast-forwards N steps in history */
  fastForward(steps: number): HistoryEntry<T> | null;

  /** Jumps directly to any history entry by ID */
  jumpTo(entryId: string): HistoryEntry<T>;

  /** Replays timeline history sequentially with configurable speed */
  replay(options?: ReplayOptions<T>): Promise<void>;

  /** Creates a snapshot at the current entry */
  snapshot(name?: string, metadata?: Record<string, unknown>): Snapshot<T>;

  /** Restores a snapshot by ID */
  restore(snapshotId: string): HistoryEntry<T>;

  /** Deletes a snapshot by ID */
  deleteSnapshot(snapshotId: string): void;

  /** Returns all snapshots */
  getSnapshots(): Snapshot<T>[];

  /** Clears all history, retaining current or initial state */
  clearHistory(resetToCurrent?: boolean): void;

  /** Returns all history entries as a list or active branch list */
  getHistory(options?: { allBranches?: boolean }): HistoryEntry<T>[];

  /** Returns the current active history entry */
  getCurrentEntry(): HistoryEntry<T>;

  /** Returns all branches */
  getBranches(): Branch[];

  /** Returns the current active branch */
  getCurrentBranch(): Branch;

  /** Creates a new branch from current or given entry */
  createBranch(name: string, fromEntryId?: string): Branch;

  /** Switches active branch to another branch */
  switchBranch(branchId: string): HistoryEntry<T>;

  /** Merges another branch into the current active branch */
  merge(sourceBranchId: string, options?: BranchMergeOptions): HistoryEntry<T>;

  /** Compares two branches returning diff and common ancestor */
  compare(branchOrEntryA: string, branchOrEntryB: string): BranchComparison;

  /** Deletes a branch */
  deleteBranch(branchId: string): void;

  /** Computes deep structural diff between two entries or states */
  diff(
    entryOrStateA: HistoryEntry<T> | T | string,
    entryOrStateB?: HistoryEntry<T> | T | string
  ): DiffChange[];

  /** Exports complete serialized state graph (can be saved to bug-report.homura) */
  export(): SerializedHomura<T>;

  /** Imports and replaces state graph from serialized payload */
  import(data: SerializedHomura<T>): void;

  /** Compacts and optimizes history graph by pruning non-essential nodes */
  compact(options?: CompactionOptions): number;

  /** Prunes old history entries to fit within max entries */
  pruneHistory(maxEntries?: number): number;

  /** Subscribes to Homura events */
  on<K extends keyof HomuraEventMap<T>>(
    event: K,
    listener: HomuraListener<T, K>
  ): HomuraUnsubscribe;

  /** Subscribes to all Homura events via wildcard */
  on(
    event: '*',
    listener: HomuraWildcardListener<T>
  ): HomuraUnsubscribe;

  /** Registers middleware */
  use(middleware: HomuraMiddleware<T>): void;

  /** Manually triggers persistence save if adapter is configured */
  save(): Promise<void>;

  /** Manually triggers persistence load if adapter is configured */
  load(): Promise<boolean>;
}
