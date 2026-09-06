import { useCallback, useRef, useSyncExternalStore } from 'react';
import {
  Branch,
  HistoryEntry,
  Homura,
  Snapshot,
  StateUpdater,
  StateUpdateOptions
} from '@homura-js/core';

export interface UseHomuraReturn<T, S = T> {
  /** The selected or root state */
  state: S;
  /** Current active history entry */
  currentEntry: HistoryEntry<T>;
  /** Update state via draft proxy or returned state */
  update: (updater: StateUpdater<T>, options?: StateUpdateOptions) => HistoryEntry<T>;
  /** Directly set next state */
  setState: (nextState: T, options?: StateUpdateOptions) => HistoryEntry<T>;
  /** Commit current state */
  commit: (label: string, metadata?: Record<string, unknown>) => HistoryEntry<T>;
  /** Undo 1 step */
  undo: () => HistoryEntry<T> | null;
  /** Redo 1 step */
  redo: () => HistoryEntry<T> | null;
  /** Rewind N steps */
  rewind: (steps: number) => HistoryEntry<T> | null;
  /** Fast-forward N steps */
  fastForward: (steps: number) => HistoryEntry<T> | null;
  /** Jump directly to entry */
  jumpTo: (entryId: string) => HistoryEntry<T>;
  /** Create snapshot */
  snapshot: (name?: string, metadata?: Record<string, unknown>) => Snapshot<T>;
  /** Restore snapshot */
  restore: (snapshotId: string) => HistoryEntry<T>;
  /** All snapshots */
  snapshots: Snapshot<T>[];
  /** All branches */
  branches: Branch[];
  /** Current active branch */
  currentBranch: Branch;
  /** Underlying Homura instance */
  homura: Homura<T>;
  /** Whether undo is possible */
  canUndo: boolean;
  /** Whether redo is possible */
  canRedo: boolean;
}

interface HomuraStoreSnapshot<T, S> {
  state: S;
  currentEntry: HistoryEntry<T>;
  snapshots: Snapshot<T>[];
  branches: Branch[];
  currentBranch: Branch;
  canUndo: boolean;
  canRedo: boolean;
  /** Opaque revision so metadata-only changes still invalidate the store */
  revision: string;
}

/**
 * Custom React hook for subscribing to Homura state and time-travel operations.
 *
 * @param homura - The Homura instance
 * @param selector - Optional state selector function for fine-grained re-renders
 * @param equalityFn - Optional custom equality function for selector output
 */
export function useHomura<T, S = T>(
  homura: Homura<T>,
  selector?: (state: T) => S,
  equalityFn: (a: S, b: S) => boolean = Object.is
): UseHomuraReturn<T, S> {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const equalityFnRef = useRef(equalityFn);
  equalityFnRef.current = equalityFn;

  const cacheRef = useRef<HomuraStoreSnapshot<T, S> | null>(null);
  const lastSelectedRef = useRef<S | undefined>(undefined);

  const buildSnapshot = useCallback((): HomuraStoreSnapshot<T, S> => {
    const currentState = homura.getState();
    const currentEntry = homura.getCurrentEntry();
    const snapshots = homura.getSnapshots();
    const branches = homura.getBranches();
    const currentBranch = homura.getCurrentBranch();
    const canUndo = homura.canUndo();
    const canRedo = homura.canRedo();

    let selected: S;
    if (!selectorRef.current) {
      selected = currentState as unknown as S;
    } else {
      const nextSelected = selectorRef.current(currentState);
      if (
        lastSelectedRef.current !== undefined &&
        equalityFnRef.current(lastSelectedRef.current, nextSelected)
      ) {
        selected = lastSelectedRef.current;
      } else {
        selected = nextSelected;
        lastSelectedRef.current = nextSelected;
      }
    }

    const revision = [
      currentEntry.id,
      snapshots.length,
      branches.map(b => `${b.id}:${b.headEntryId}`).join(','),
      currentBranch.id,
      canUndo ? '1' : '0',
      canRedo ? '1' : '0'
    ].join('|');

    const prev = cacheRef.current;
    if (
      prev &&
      prev.revision === revision &&
      equalityFnRef.current(prev.state, selected)
    ) {
      return prev;
    }

    const next: HomuraStoreSnapshot<T, S> = {
      state: selected,
      currentEntry,
      snapshots,
      branches,
      currentBranch,
      canUndo,
      canRedo,
      revision
    };
    cacheRef.current = next;
    return next;
  }, [homura]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubs = [
        homura.on('state:change', onStoreChange),
        homura.on('branch:switch', onStoreChange),
        homura.on('branch:create', onStoreChange),
        homura.on('branch:delete', onStoreChange),
        homura.on('branch:merge', onStoreChange),
        homura.on('snapshot:create', onStoreChange),
        homura.on('snapshot:delete', onStoreChange),
        homura.on('snapshot:restore', onStoreChange)
      ];

      return () => {
        for (const unsub of unsubs) unsub();
      };
    },
    [homura]
  );

  const store = useSyncExternalStore(subscribe, buildSnapshot, buildSnapshot);

  const update = useCallback(
    (updater: StateUpdater<T>, options?: StateUpdateOptions) => homura.update(updater, options),
    [homura]
  );

  const setState = useCallback(
    (nextState: T, options?: StateUpdateOptions) => homura.setState(nextState, options),
    [homura]
  );

  const commit = useCallback(
    (label: string, metadata?: Record<string, unknown>) => homura.commit(label, metadata),
    [homura]
  );

  const undo = useCallback(() => homura.undo(), [homura]);
  const redo = useCallback(() => homura.redo(), [homura]);
  const rewind = useCallback((steps: number) => homura.rewind(steps), [homura]);
  const fastForward = useCallback((steps: number) => homura.fastForward(steps), [homura]);
  const jumpTo = useCallback((entryId: string) => homura.jumpTo(entryId), [homura]);
  const snapshot = useCallback(
    (name?: string, metadata?: Record<string, unknown>) => homura.snapshot(name, metadata),
    [homura]
  );
  const restore = useCallback((snapshotId: string) => homura.restore(snapshotId), [homura]);

  return {
    state: store.state,
    currentEntry: store.currentEntry,
    update,
    setState,
    commit,
    undo,
    redo,
    rewind,
    fastForward,
    jumpTo,
    snapshot,
    restore,
    snapshots: store.snapshots,
    branches: store.branches,
    currentBranch: store.currentBranch,
    homura,
    canUndo: store.canUndo,
    canRedo: store.canRedo
  };
}
