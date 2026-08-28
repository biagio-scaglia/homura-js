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

  const lastSelectedStateRef = useRef<S | undefined>(undefined);
  const lastRawStateRef = useRef<T | undefined>(undefined);

  const getSnapshot = useCallback(() => {
    const currentState = homura.getState();

    if (!selectorRef.current) {
      return currentState as unknown as S;
    }

    if (currentState === lastRawStateRef.current && lastSelectedStateRef.current !== undefined) {
      return lastSelectedStateRef.current;
    }

    const nextSelected = selectorRef.current(currentState);
    if (
      lastSelectedStateRef.current !== undefined &&
      equalityFnRef.current(lastSelectedStateRef.current, nextSelected)
    ) {
      return lastSelectedStateRef.current;
    }

    lastRawStateRef.current = currentState;
    lastSelectedStateRef.current = nextSelected;
    return nextSelected;
  }, [homura]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubState = homura.on('state:change', () => onStoreChange());
      const unsubBranch = homura.on('branch:switch', () => onStoreChange());
      const unsubSnap = homura.on('snapshot:create', () => onStoreChange());
      const unsubSnapDel = homura.on('snapshot:delete', () => onStoreChange());

      return () => {
        unsubState();
        unsubBranch();
        unsubSnap();
        unsubSnapDel();
      };
    },
    [homura]
  );

  const selectedState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const currentEntry = homura.getCurrentEntry();

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

  const canUndo = currentEntry.parentId !== null;
  const canRedo = currentEntry.childrenIds.length > 0;

  return {
    state: selectedState,
    currentEntry,
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
    snapshots: homura.getSnapshots(),
    branches: homura.getBranches(),
    currentBranch: homura.getCurrentBranch(),
    homura,
    canUndo,
    canRedo
  };
}
