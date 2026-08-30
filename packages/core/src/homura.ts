import {
  Branch,
  BranchComparison,
  BranchMergeOptions,
  CompactionOptions,
  DiffChange,
  HistoryEntry,
  Homura,
  HomuraConfig,
  HomuraEventMap,
  HomuraListener,
  HomuraMiddleware,
  HomuraUnsubscribe,
  HomuraWildcardListener,
  ReplayOptions,
  SerializedHomura,
  Snapshot,
  StateUpdater,
  StateUpdateOptions
} from './types';
import {
  HomuraError,
  HomuraHistoryError,
  HomuraSerializationError,
  HomuraSnapshotError
} from './errors';
import { createDraft, isObject } from './immutability';
import { diffStates } from './diff';
import { EventEmitter } from './events';
import { HistoryGraph } from './history';
import { MiddlewarePipeline } from './middleware';
import { PersistenceController } from './persistence';
import { SnapshotManager } from './snapshots';

/**
 * Core Homura instance class managing DAG state history, branching, diffs, snapshots, and events.
 */
export class HomuraInstance<T> implements Homura<T> {
  private history: HistoryGraph<T>;
  private snapshots: SnapshotManager<T>;
  private events: EventEmitter<T>;
  private middleware: MiddlewarePipeline<T>;
  private persistence: PersistenceController<T>;
  private config: HomuraConfig<T>;

  constructor(config: HomuraConfig<T>) {
    this.config = config;
    this.history = new HistoryGraph<T>(config.initialState, {
      maxHistory: config.maxHistory ?? 1000,
      autoBranchOnDivergence: config.autoBranchOnDivergence ?? true
    });
    this.snapshots = new SnapshotManager<T>();
    this.events = new EventEmitter<T>();
    this.middleware = new MiddlewarePipeline<T>(config.middleware ?? []);
    this.persistence = new PersistenceController<T>(config.persistence);
  }

  /**
   * Returns current application state.
   */
  public getState(): T {
    return this.history.getCurrentEntry().state;
  }

  /**
   * Replaces current state and records a history entry.
   */
  public setState(nextState: T, options?: StateUpdateOptions): HistoryEntry<T> {
    const currentState = this.getState();
    const currentEntry = this.history.getCurrentEntry();

    let targetNextState = nextState;
    let targetLabel = options?.label ?? 'Set state';
    let targetMetadata = options?.metadata ? { ...options.metadata } : {};

    let cancelled = false;

    // Run middleware pipeline
    const middlewareRan = this.middleware.run(
      {
        action: 'setState',
        currentState,
        nextState: targetNextState,
        label: targetLabel,
        metadata: targetMetadata,
        currentEntry,
        cancel: () => {
          cancelled = true;
        },
        setNextState: s => {
          targetNextState = s;
        },
        setMetadata: m => {
          targetMetadata = { ...targetMetadata, ...m };
        }
      },
      () => {
        // Proceed with state change
      }
    );

    if (cancelled || !middlewareRan) {
      return currentEntry;
    }

    const { entry, newBranchCreated } = this.history.addEntry(
      targetNextState,
      targetLabel,
      targetMetadata
    );

    if (newBranchCreated) {
      this.events.emit('branch:create', { branch: newBranchCreated });
    }

    this.events.emit('history:add', { entry });
    this.events.emit('state:change', {
      state: entry.state,
      prevState: currentState,
      entry,
      action: 'setState'
    });

    this.persistence.scheduleAutoSave(() => this.export());
    return entry;
  }

  /**
   * Updates state using either a mutable draft or a pure state return function.
   */
  public update(updater: StateUpdater<T>, options?: StateUpdateOptions): HistoryEntry<T> {
    const currentState = this.getState();

    // If state is an object, try draft proxy first
    if (isObject(currentState)) {
      const { draft, finishDraft } = createDraft<T>(currentState);
      const returnedValue = updater(draft);

      let nextState: T;
      if (returnedValue !== undefined) {
        nextState = returnedValue;
      } else {
        const { nextState: draftNextState } = finishDraft();
        nextState = draftNextState;
      }

      return this.setState(nextState, {
        label: options?.label ?? 'Update state',
        metadata: options?.metadata
      });
    }

    // Scalar/primitive state update
    const returnedValue = updater(currentState);
    const nextState = returnedValue !== undefined ? returnedValue : currentState;

    return this.setState(nextState, {
      label: options?.label ?? 'Update state',
      metadata: options?.metadata
    });
  }

  /**
   * Batches multiple mutations atomically into a single consolidated history commit.
   */
  public transaction<R = void>(
    fn: (draft: T) => R,
    options?: StateUpdateOptions
  ): HistoryEntry<T> {
    const currentState = this.getState();

    if (isObject(currentState)) {
      const { draft, finishDraft } = createDraft<T>(currentState);
      fn(draft);
      const { nextState } = finishDraft();

      const label = options?.label ?? 'Transaction';
      const entry = this.setState(nextState, {
        ...options,
        label,
        metadata: { ...options?.metadata, transaction: true }
      });

      this.events.emit('transaction:commit', { entry, label });
      return entry;
    }

    // Primitive state update
    let nextState = currentState;
    const res = fn(nextState);
    if (res !== undefined) {
      nextState = res as unknown as T;
    }

    const label = options?.label ?? 'Transaction';
    const entry = this.setState(nextState, {
      ...options,
      label,
      metadata: { ...options?.metadata, transaction: true }
    });

    this.events.emit('transaction:commit', { entry, label });
    return entry;
  }

  /**
   * Commits the current state with a descriptive message and metadata.
   */
  public commit(label: string, metadata?: Record<string, unknown>): HistoryEntry<T> {
    return this.setState(this.getState(), { label, metadata });
  }

  /**
   * Navigates 1 step backwards in history.
   */
  public undo(): HistoryEntry<T> | null {
    const fromEntry = this.history.getCurrentEntry();
    let cancelled = false;

    this.middleware.run(
      {
        action: 'undo',
        currentState: fromEntry.state,
        label: 'Undo',
        currentEntry: fromEntry,
        cancel: () => {
          cancelled = true;
        }
      },
      () => {}
    );

    if (cancelled) return null;

    const toEntry = this.history.undo();
    if (!toEntry) return null;

    this.events.emit('history:undo', { fromEntry, toEntry });
    this.events.emit('state:change', {
      state: toEntry.state,
      prevState: fromEntry.state,
      entry: toEntry,
      action: 'undo'
    });

    this.persistence.scheduleAutoSave(() => this.export());
    return toEntry;
  }

  /**
   * Returns true if an undo operation is possible from current state.
   */
  public canUndo(): boolean {
    return this.history.canUndo();
  }

  /**
   * Returns true if a redo operation is possible from current state.
   */
  public canRedo(): boolean {
    return this.history.canRedo();
  }

  /**
   * Navigates 1 step forward in history.
   */
  public redo(): HistoryEntry<T> | null {
    const fromEntry = this.history.getCurrentEntry();
    let cancelled = false;

    this.middleware.run(
      {
        action: 'redo',
        currentState: fromEntry.state,
        label: 'Redo',
        currentEntry: fromEntry,
        cancel: () => {
          cancelled = true;
        }
      },
      () => {}
    );

    if (cancelled) return null;

    const toEntry = this.history.redo();
    if (!toEntry) return null;

    this.events.emit('history:redo', { fromEntry, toEntry });
    this.events.emit('state:change', {
      state: toEntry.state,
      prevState: fromEntry.state,
      entry: toEntry,
      action: 'redo'
    });

    this.persistence.scheduleAutoSave(() => this.export());
    return toEntry;
  }

  /**
   * Rewinds N steps back in history.
   */
  public rewind(steps: number): HistoryEntry<T> | null {
    const fromEntry = this.history.getCurrentEntry();
    let cancelled = false;

    this.middleware.run(
      {
        action: 'rewind',
        currentState: fromEntry.state,
        label: `Rewind ${steps} steps`,
        currentEntry: fromEntry,
        metadata: { steps },
        cancel: () => {
          cancelled = true;
        }
      },
      () => {}
    );

    if (cancelled) return null;

    const toEntry = this.history.rewind(steps);
    if (!toEntry) return null;

    if (toEntry.id !== fromEntry.id) {
      this.events.emit('history:jump', { fromEntry, toEntry });
      this.events.emit('state:change', {
        state: toEntry.state,
        prevState: fromEntry.state,
        entry: toEntry,
        action: 'rewind'
      });
      this.persistence.scheduleAutoSave(() => this.export());
    }

    return toEntry;
  }

  /**
   * Fast-forwards N steps forward in history.
   */
  public fastForward(steps: number): HistoryEntry<T> | null {
    const fromEntry = this.history.getCurrentEntry();
    let cancelled = false;

    this.middleware.run(
      {
        action: 'fastForward',
        currentState: fromEntry.state,
        label: `Fast forward ${steps} steps`,
        currentEntry: fromEntry,
        metadata: { steps },
        cancel: () => {
          cancelled = true;
        }
      },
      () => {}
    );

    if (cancelled) return null;

    const toEntry = this.history.fastForward(steps);
    if (!toEntry) return null;

    if (toEntry.id !== fromEntry.id) {
      this.events.emit('history:jump', { fromEntry, toEntry });
      this.events.emit('state:change', {
        state: toEntry.state,
        prevState: fromEntry.state,
        entry: toEntry,
        action: 'fastForward'
      });
      this.persistence.scheduleAutoSave(() => this.export());
    }

    return toEntry;
  }

  /**
   * Jumps directly to any entry in history.
   */
  public jumpTo(entryId: string): HistoryEntry<T> {
    const fromEntry = this.history.getCurrentEntry();
    const target = this.history.getEntry(entryId);
    if (!target) {
      throw new HomuraHistoryError(`History entry "${entryId}" not found`, entryId);
    }

    let cancelled = false;

    this.middleware.run(
      {
        action: 'jumpTo',
        currentState: fromEntry.state,
        nextState: target.state,
        label: `Jump to "${target.label}"`,
        currentEntry: fromEntry,
        metadata: { targetEntryId: entryId },
        cancel: () => {
          cancelled = true;
        }
      },
      () => {}
    );

    if (cancelled) return fromEntry;

    const toEntry = this.history.jumpTo(entryId);

    if (toEntry.id !== fromEntry.id) {
      this.events.emit('history:jump', { fromEntry, toEntry });
      this.events.emit('state:change', {
        state: toEntry.state,
        prevState: fromEntry.state,
        entry: toEntry,
        action: 'jumpTo'
      });
      this.persistence.scheduleAutoSave(() => this.export());
    }

    return toEntry;
  }

  /**
   * Replays timeline history sequentially with configurable speed and step hooks.
   */
  public async replay(options?: ReplayOptions<T>): Promise<void> {
    const currentEntry = this.history.getCurrentEntry();
    const fromId = options?.from ?? this.history.getCurrentBranch().rootEntryId;
    const toId = options?.to ?? currentEntry.id;

    const path = this.history.getPathBetween(fromId, toId);
    if (path.length === 0) return;

    const speed = Math.max(0.1, options?.speed ?? 1);
    const baseDelay = options?.stepDelayMs ?? 300;
    const delayMs = baseDelay / speed;

    this.events.emit('replay:start', {
      fromEntryId: fromId,
      toEntryId: toId,
      totalSteps: path.length
    });

    for (let i = 0; i < path.length; i++) {
      const entryId = path[i]!;
      const entry = this.jumpTo(entryId);

      if (options?.onStep) {
        options.onStep(entry, i + 1, path.length);
      }

      this.events.emit('replay:step', {
        entry,
        stepIndex: i + 1,
        totalSteps: path.length
      });

      if (i < path.length - 1 && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    this.events.emit('replay:end', {
      finalEntry: this.history.getCurrentEntry()
    });
  }

  /**
   * Creates a snapshot of the current state.
   */
  public snapshot(name?: string, metadata?: Record<string, unknown>): Snapshot<T> {
    const currentEntry = this.history.getCurrentEntry();
    const snap = this.snapshots.createSnapshot(currentEntry, name, metadata);
    this.events.emit('snapshot:create', { snapshot: snap });
    this.persistence.scheduleAutoSave(() => this.export());
    return snap;
  }

  /**
   * Restores a snapshot by ID or name.
   */
  public restore(snapshotIdOrName: string): HistoryEntry<T> {
    const snap = this.snapshots.getSnapshot(snapshotIdOrName);
    if (!snap) {
      throw new HomuraSnapshotError(
        `Snapshot "${snapshotIdOrName}" not found`,
        snapshotIdOrName
      );
    }

    // Check if the history entry still exists in graph
    const existingEntry = this.history.getEntry(snap.historyEntryId);
    if (existingEntry) {
      const restored = this.jumpTo(existingEntry.id);
      this.events.emit('snapshot:restore', { snapshot: snap, entry: restored });
      return restored;
    }

    // If historical entry was pruned, commit the snapshot state as a new entry
    const newEntry = this.setState(snap.state, {
      label: `Restored snapshot: ${snap.name}`,
      metadata: { restoredFromSnapshotId: snap.id }
    });

    this.events.emit('snapshot:restore', { snapshot: snap, entry: newEntry });
    return newEntry;
  }

  /**
   * Deletes a snapshot by ID.
   */
  public deleteSnapshot(snapshotId: string): void {
    this.snapshots.deleteSnapshot(snapshotId);
    this.events.emit('snapshot:delete', { snapshotId });
    this.persistence.scheduleAutoSave(() => this.export());
  }

  /**
   * Returns all snapshots.
   */
  public getSnapshots(): Snapshot<T>[] {
    return this.snapshots.getSnapshots();
  }

  /**
   * Clears all history, retaining the current or initial state.
   */
  public clearHistory(resetToCurrent: boolean = true): void {
    const stateToKeep = resetToCurrent ? this.getState() : this.config.initialState;
    const removedIds = this.history.getAllEntries().map(e => e.id);
    this.history.clear(stateToKeep);
    this.snapshots.clear();

    this.events.emit('history:remove', { entryIds: removedIds });
    this.events.emit('state:change', {
      state: stateToKeep,
      prevState: stateToKeep,
      entry: this.history.getCurrentEntry(),
      action: 'clearHistory'
    });

    this.persistence.scheduleAutoSave(() => this.export());
  }

  /**
   * Returns history entries (either linear active timeline or entire DAG array).
   */
  public getHistory(options?: { allBranches?: boolean }): HistoryEntry<T>[] {
    if (options?.allBranches) {
      return this.history.getAllEntries();
    }
    return this.history.getTimeline();
  }

  /**
   * Returns current active history entry.
   */
  public getCurrentEntry(): HistoryEntry<T> {
    return this.history.getCurrentEntry();
  }

  /**
   * Returns all branches.
   */
  public getBranches(): Branch[] {
    return this.history.getBranches();
  }

  /**
   * Returns active branch.
   */
  public getCurrentBranch(): Branch {
    return this.history.getCurrentBranch();
  }

  /**
   * Creates a new branch.
   */
  public createBranch(name: string, fromEntryId?: string): Branch {
    const branch = this.history.createBranch(name, fromEntryId);
    this.events.emit('branch:create', { branch });
    this.persistence.scheduleAutoSave(() => this.export());
    return branch;
  }

  /**
   * Switches active branch.
   */
  public switchBranch(branchId: string): HistoryEntry<T> {
    const fromBranch = this.history.getCurrentBranch();
    const fromEntry = this.history.getCurrentEntry();

    const toEntry = this.history.switchBranch(branchId);
    const toBranch = this.history.getCurrentBranch();

    this.events.emit('branch:switch', { fromBranch, toBranch });
    this.events.emit('state:change', {
      state: toEntry.state,
      prevState: fromEntry.state,
      entry: toEntry,
      action: 'switchBranch'
    });

    this.persistence.scheduleAutoSave(() => this.export());
    return toEntry;
  }

  /**
   * Merges another branch into current active branch.
   */
  public merge(sourceBranchId: string, options?: BranchMergeOptions): HistoryEntry<T> {
    const targetBranch = this.history.getCurrentBranch();
    const mergedEntry = this.history.mergeBranch(sourceBranchId, options);
    this.events.emit('branch:merge', {
      sourceBranchId,
      targetBranchId: targetBranch.id,
      entry: mergedEntry
    });
    this.events.emit('state:change', {
      state: mergedEntry.state,
      prevState: this.getState(),
      entry: mergedEntry,
      action: 'merge'
    });
    this.persistence.scheduleAutoSave(() => this.export());
    return mergedEntry;
  }

  /**
   * Compares two branches and calculates their common ancestor and structural diff.
   */
  public compare(branchOrEntryA: string, branchOrEntryB: string): BranchComparison {
    const res = this.history.compareBranches(branchOrEntryA, branchOrEntryB);
    const diff = diffStates(res.headA.state, res.headB.state);
    return {
      branchA: res.branchA,
      branchB: res.branchB,
      commonAncestorId: res.commonAncestorId,
      aheadCount: res.aheadCount,
      behindCount: res.behindCount,
      diff
    };
  }

  /**
   * Deletes a branch.
   */
  public deleteBranch(branchId: string): void {
    this.history.deleteBranch(branchId);
    this.events.emit('branch:delete', { branchId });
    this.persistence.scheduleAutoSave(() => this.export());
  }

  /**
   * Computes deep diff between two entries or states.
   */
  public diff(
    entryOrStateA: HistoryEntry<T> | T | string,
    entryOrStateB?: HistoryEntry<T> | T | string
  ): DiffChange[] {
    const resolveState = (val: unknown): unknown => {
      if (typeof val === 'string') {
        const found = this.history.getEntry(val);
        if (found) return found.state;
      }
      if (isObject(val) && 'state' in val && 'id' in val) {
        return (val as HistoryEntry<T>).state;
      }
      return val;
    };

    if (entryOrStateB === undefined) {
      // Diff against current state
      const stateA = resolveState(entryOrStateA);
      const stateB = this.getState();
      return diffStates(stateA, stateB);
    }

    const stateA = resolveState(entryOrStateA);
    const stateB = resolveState(entryOrStateB);
    return diffStates(stateA, stateB);
  }

  /**
   * Exports full state graph for JSON serialization, backups, or bug report sharing.
   */
  public export(): SerializedHomura<T> {
    const graphData = this.history.exportData();
    const snapshotData = this.snapshots.exportData();

    return {
      version: 1,
      ...graphData,
      snapshots: snapshotData
    };
  }

  /**
   * Imports a serialized state graph.
   */
  public import(data: SerializedHomura<T>): void {
    try {
      this.history.importData(data);
      if (data.snapshots) {
        this.snapshots.importData(data.snapshots);
      }
      const cur = this.history.getCurrentEntry();
      this.events.emit('state:change', {
        state: cur.state,
        prevState: cur.state,
        entry: cur,
        action: 'import'
      });
      this.persistence.scheduleAutoSave(() => this.export());
    } catch (err) {
      throw new HomuraSerializationError('Failed to import Homura data', err);
    }
  }

  /**
   * Compacts and optimizes history graph by pruning non-essential nodes while preserving snapshot and branch checkpoints.
   */
  public compact(options?: CompactionOptions): number {
    const snapshotEntryIds = new Set(this.snapshots.getSnapshots().map(s => s.historyEntryId));
    const count = this.history.compact({
      maxEntries: options?.maxEntries,
      preserveSnapshots: options?.preserveSnapshots ?? true,
      snapshotEntryIds
    });
    if (count > 0) {
      this.events.emit('history:compact', {
        prunedCount: count,
        remainingCount: this.history.getAllEntries().length
      });
      this.persistence.scheduleAutoSave(() => this.export());
    }
    return count;
  }

  /**
   * Prunes oldest history entries.
   */
  public pruneHistory(maxEntries?: number): number {
    const count = this.history.prune(maxEntries ?? this.config.maxHistory ?? 1000);
    if (count > 0) {
      this.persistence.scheduleAutoSave(() => this.export());
    }
    return count;
  }

  /**
   * Subscribes to Homura events.
   */
  public on<K extends keyof HomuraEventMap<T>>(
    event: K,
    listener: HomuraListener<T, K>
  ): HomuraUnsubscribe;
  public on(
    event: '*',
    listener: HomuraWildcardListener<T>
  ): HomuraUnsubscribe;
  public on(event: any, listener: any): HomuraUnsubscribe {
    return this.events.on(event, listener);
  }

  /**
   * Registers a middleware.
   */
  public use(middleware: HomuraMiddleware<T>): void {
    this.middleware.use(middleware);
  }

  /**
   * Manually triggers persistent save.
   */
  public async save(): Promise<void> {
    await this.persistence.save(this.export());
  }

  /**
   * Manually triggers persistent load and hydrates graph if found.
   */
  public async load(): Promise<boolean> {
    const data = await this.persistence.load();
    if (data) {
      this.import(data);
      return true;
    }
    return false;
  }
}

/**
 * Factory function to create a new Homura instance.
 */
export function createHomura<T>(config: HomuraConfig<T>): Homura<T> {
  if (!config || typeof config !== 'object') {
    throw new HomuraError('createHomura requires a configuration object with initialState');
  }

  return new HomuraInstance<T>(config);
}
