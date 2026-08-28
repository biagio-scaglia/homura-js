import { HistoryEntry, Snapshot, Branch, DiffChange, Homura, SerializedHomura } from '@homura-js/core';

export type DevToolsTheme = 'dark' | 'light';

export interface DevToolsOptions {
  /** Target DOM element or selector to mount DevTools into */
  container?: HTMLElement | string;
  /** Positioning mode when mounted as overlay (default: 'floating') */
  position?: 'bottom' | 'right' | 'floating' | 'embedded';
  /** Whether the floating DevTools drawer is open by default (default: false) */
  defaultOpen?: boolean;
  /** Initial height or width (e.g. 360, '400px') */
  initialSize?: number | string;
  /** UI theme */
  theme?: DevToolsTheme;
  /** Max entries to display in timeline (default: 500) */
  maxEntries?: number;
  /** Title label for DevTools header (default: 'HOMURA DEVTOOLS') */
  title?: string;
}

export type DevToolsTab = 'inspector' | 'diff' | 'snapshots' | 'branches';

export type DevToolsBridgeMessage =
  | { type: 'init'; data: DevToolsBridgeSnapshot }
  | { type: 'state:change'; data: { state: any; entry: HistoryEntry<any>; action: string } }
  | { type: 'history:update'; data: { entries: HistoryEntry<any>[]; currentEntryId: string } }
  | { type: 'branch:update'; data: { branches: Branch[]; currentBranchId: string } }
  | { type: 'snapshot:update'; data: { snapshots: Snapshot<any>[] } };

export interface DevToolsBridgeSnapshot {
  state: any;
  currentEntry: HistoryEntry<any>;
  currentBranch: Branch;
  entries: HistoryEntry<any>[];
  branches: Branch[];
  snapshots: Snapshot<any>[];
}

export interface DevToolsBridge {
  /** Homura instance connected to */
  homura: Homura<any>;
  /** Subscribes to bridge updates */
  subscribe(listener: (message: DevToolsBridgeMessage) => void): () => void;
  /** Retrieves a full snapshot of current state and history */
  getSnapshot(): DevToolsBridgeSnapshot;
  /** Command: Jump to entry */
  jumpTo(entryId: string): void;
  /** Command: Undo */
  undo(): void;
  /** Command: Redo */
  redo(): void;
  /** Command: Rewind */
  rewind(steps: number): void;
  /** Command: Fast forward */
  fastForward(steps: number): void;
  /** Command: Create branch */
  createBranch(name: string, fromEntryId?: string): Branch;
  /** Command: Switch branch */
  switchBranch(branchId: string): void;
  /** Command: Delete branch */
  deleteBranch(branchId: string): void;
  /** Command: Take snapshot */
  takeSnapshot(name?: string): Snapshot<any>;
  /** Command: Restore snapshot */
  restoreSnapshot(snapshotId: string): void;
  /** Command: Delete snapshot */
  deleteSnapshot(snapshotId: string): void;
  /** Command: Clear history */
  clearHistory(): void;
  /** Command: Diff entries */
  diff(entryA: string | HistoryEntry<any>, entryB: string | HistoryEntry<any>): DiffChange[];
  /** Command: Export */
  exportData(): SerializedHomura<any>;
  /** Command: Import */
  importData(data: SerializedHomura<any>): void;
  /** Disconnect bridge */
  destroy(): void;
}
