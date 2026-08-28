import { shallowRef, computed, onScopeDispose, ComputedRef, ShallowRef, getCurrentScope } from 'vue';
import { Homura, HistoryEntry, Branch, Snapshot, StateUpdater, StateUpdateOptions } from '@homura-js/core';

export interface UseHomuraVueReturn<T, S = T> {
  /** Reactive state ref or computed slice */
  state: S extends T ? ShallowRef<T> : ComputedRef<S>;
  /** Reactive active history entry */
  currentEntry: ShallowRef<HistoryEntry<T>>;
  /** Reactive active branch */
  currentBranch: ShallowRef<Branch>;
  /** Reactive list of snapshots */
  snapshots: ShallowRef<Snapshot<T>[]>;
  /** Reactive list of branches */
  branches: ShallowRef<Branch[]>;
  /** Computed: whether undo is available */
  canUndo: ComputedRef<boolean>;
  /** Computed: whether redo is available */
  canRedo: ComputedRef<boolean>;
  /** Update state */
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
  /** Fast forward N steps */
  fastForward: (steps: number) => HistoryEntry<T> | null;
  /** Jump directly to entry */
  jumpTo: (entryId: string) => HistoryEntry<T>;
  /** Create snapshot */
  snapshot: (name?: string, metadata?: Record<string, unknown>) => Snapshot<T>;
  /** Restore snapshot */
  restore: (snapshotId: string) => HistoryEntry<T>;
  /** Underlying Homura instance */
  homura: Homura<T>;
}

/**
 * Vue 3 Composition API hook for HomuraJS time-travel state management.
 *
 * @param homura - The Homura instance
 * @param selector - Optional selector function to compute a derived reactive state slice
 */
export function useHomura<T, S = T>(
  homura: Homura<T>,
  selector?: (state: T) => S
): UseHomuraVueReturn<T, S> {
  const rawStateRef = shallowRef<T>(homura.getState());
  const currentEntryRef = shallowRef<HistoryEntry<T>>(homura.getCurrentEntry());
  const currentBranchRef = shallowRef<Branch>(homura.getCurrentBranch());
  const snapshotsRef = shallowRef<Snapshot<T>[]>(homura.getSnapshots());
  const branchesRef = shallowRef<Branch[]>(homura.getBranches());

  const unsubs: (() => void)[] = [];

  unsubs.push(
    homura.on('state:change', event => {
      rawStateRef.value = event.state;
      currentEntryRef.value = event.entry;
      currentBranchRef.value = homura.getCurrentBranch();
      branchesRef.value = homura.getBranches();
    })
  );

  unsubs.push(
    homura.on('branch:switch', () => {
      currentBranchRef.value = homura.getCurrentBranch();
      branchesRef.value = homura.getBranches();
    })
  );

  unsubs.push(
    homura.on('branch:create', () => {
      branchesRef.value = homura.getBranches();
    })
  );

  unsubs.push(
    homura.on('branch:delete', () => {
      branchesRef.value = homura.getBranches();
    })
  );

  unsubs.push(
    homura.on('snapshot:create', () => {
      snapshotsRef.value = homura.getSnapshots();
    })
  );

  unsubs.push(
    homura.on('snapshot:delete', () => {
      snapshotsRef.value = homura.getSnapshots();
    })
  );

  if (getCurrentScope()) {
    onScopeDispose(() => {
      for (const unsub of unsubs) {
        unsub();
      }
    });
  }

  const stateComputed = selector
    ? computed(() => selector(rawStateRef.value))
    : rawStateRef;

  const canUndo = computed(() => currentEntryRef.value.parentId !== null);
  const canRedo = computed(() => currentEntryRef.value.childrenIds.length > 0);

  return {
    state: stateComputed as any,
    currentEntry: currentEntryRef,
    currentBranch: currentBranchRef,
    snapshots: snapshotsRef,
    branches: branchesRef,
    canUndo,
    canRedo,
    update: (updater, options) => homura.update(updater, options),
    setState: (nextState, options) => homura.setState(nextState, options),
    commit: (label, metadata) => homura.commit(label, metadata),
    undo: () => homura.undo(),
    redo: () => homura.redo(),
    rewind: steps => homura.rewind(steps),
    fastForward: steps => homura.fastForward(steps),
    jumpTo: entryId => homura.jumpTo(entryId),
    snapshot: (name, metadata) => homura.snapshot(name, metadata),
    restore: snapshotId => homura.restore(snapshotId),
    homura
  };
}
