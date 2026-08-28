import {
  Branch,
  DiffChange,
  HistoryEntry,
  Homura,
  SerializedHomura,
  Snapshot
} from '@homura-js/core';
import {
  DevToolsBridge,
  DevToolsBridgeMessage,
  DevToolsBridgeSnapshot
} from './types';

/**
 * Creates a decoupled bridge between any Homura instance and the DevTools UI.
 */
export function createDevtoolsBridge<T>(homura: Homura<T>): DevToolsBridge {
  const listeners = new Set<(message: DevToolsBridgeMessage) => void>();
  const unsubs: (() => void)[] = [];

  function broadcast(message: DevToolsBridgeMessage): void {
    for (const listener of Array.from(listeners)) {
      try {
        listener(message);
      } catch (err) {
        console.error('[HomuraJS DevTools Bridge] Listener error:', err);
      }
    }
  }

  // Subscribe to Homura core events
  unsubs.push(
    homura.on('state:change', event => {
      broadcast({
        type: 'state:change',
        data: {
          state: event.state,
          entry: event.entry,
          action: event.action
        }
      });
      broadcast({
        type: 'history:update',
        data: {
          entries: homura.getHistory({ allBranches: true }),
          currentEntryId: event.entry.id
        }
      });
    })
  );

  unsubs.push(
    homura.on('history:add', () => {
      broadcast({
        type: 'history:update',
        data: {
          entries: homura.getHistory({ allBranches: true }),
          currentEntryId: homura.getCurrentEntry().id
        }
      });
    })
  );

  unsubs.push(
    homura.on('history:jump', event => {
      broadcast({
        type: 'history:update',
        data: {
          entries: homura.getHistory({ allBranches: true }),
          currentEntryId: event.toEntry.id
        }
      });
    })
  );

  unsubs.push(
    homura.on('branch:create', () => {
      broadcast({
        type: 'branch:update',
        data: {
          branches: homura.getBranches(),
          currentBranchId: homura.getCurrentBranch().id
        }
      });
    })
  );

  unsubs.push(
    homura.on('branch:switch', () => {
      broadcast({
        type: 'branch:update',
        data: {
          branches: homura.getBranches(),
          currentBranchId: homura.getCurrentBranch().id
        }
      });
    })
  );

  unsubs.push(
    homura.on('branch:delete', () => {
      broadcast({
        type: 'branch:update',
        data: {
          branches: homura.getBranches(),
          currentBranchId: homura.getCurrentBranch().id
        }
      });
    })
  );

  unsubs.push(
    homura.on('snapshot:create', () => {
      broadcast({
        type: 'snapshot:update',
        data: {
          snapshots: homura.getSnapshots()
        }
      });
    })
  );

  unsubs.push(
    homura.on('snapshot:delete', () => {
      broadcast({
        type: 'snapshot:update',
        data: {
          snapshots: homura.getSnapshots()
        }
      });
    })
  );

  const bridge: DevToolsBridge = {
    homura,

    subscribe(listener) {
      listeners.add(listener);
      // Immediately send current snapshot
      listener({
        type: 'init',
        data: this.getSnapshot()
      });
      return () => {
        listeners.delete(listener);
      };
    },

    getSnapshot(): DevToolsBridgeSnapshot {
      return {
        state: homura.getState(),
        currentEntry: homura.getCurrentEntry(),
        currentBranch: homura.getCurrentBranch(),
        entries: homura.getHistory({ allBranches: true }),
        branches: homura.getBranches(),
        snapshots: homura.getSnapshots()
      };
    },

    jumpTo(entryId: string) {
      homura.jumpTo(entryId);
    },

    undo() {
      homura.undo();
    },

    redo() {
      homura.redo();
    },

    rewind(steps: number) {
      homura.rewind(steps);
    },

    fastForward(steps: number) {
      homura.fastForward(steps);
    },

    createBranch(name: string, fromEntryId?: string): Branch {
      return homura.createBranch(name, fromEntryId);
    },

    switchBranch(branchId: string) {
      homura.switchBranch(branchId);
    },

    deleteBranch(branchId: string) {
      homura.deleteBranch(branchId);
    },

    takeSnapshot(name?: string): Snapshot<any> {
      return homura.snapshot(name);
    },

    restoreSnapshot(snapshotId: string) {
      homura.restore(snapshotId);
    },

    deleteSnapshot(snapshotId: string) {
      homura.deleteSnapshot(snapshotId);
    },

    clearHistory() {
      homura.clearHistory(true);
    },

    diff(entryA: string | HistoryEntry<any>, entryB: string | HistoryEntry<any>): DiffChange[] {
      return homura.diff(entryA as any, entryB as any);
    },

    exportData(): SerializedHomura<any> {
      return homura.export();
    },

    importData(data: SerializedHomura<any>) {
      homura.import(data);
    },

    destroy() {
      for (const unsub of unsubs) {
        unsub();
      }
      listeners.clear();
    }
  };

  return bridge;
}
