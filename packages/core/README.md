<div align="center">

# @homura-js/core ⏳
### Core Time Travel State & DAG History Engine for JavaScript

**"Git for application state"**

[![CI Tests](https://img.shields.io/badge/tests-49%2F49%20passed-7c3aed)](https://github.com/biagio-scaglia/homura-js)
[![Version](https://img.shields.io/badge/version-v1.2.3-9333ea)](https://www.npmjs.com/package/@biagioscaglia/homurajs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-581c87)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-3b0764)](LICENSE)
[![NPM](https://img.shields.io/badge/npm-%40biagioscaglia%2Fhomurajs-a855f7)](https://www.npmjs.com/package/@biagioscaglia/homurajs)

</div>

---

## Installation

```bash
npm install @homura-js/core
```

---

## Quick Start

```ts
import { createHomura } from '@homura-js/core';

const homura = createHomura({
  initialState: { counter: 0, user: 'Homura' }
});

// Mutate via Copy-On-Write draft proxy
homura.update(draft => {
  draft.counter += 10;
}, { label: 'Increment counter by 10' });

// Time travel
homura.undo(); // Counter reverts to 0
homura.redo(); // Counter returns to 10

console.log(homura.getState()); // { counter: 10, user: 'Homura' }
```

---

## Features

- **Directed Acyclic Graph (DAG) History**: Non-destructive branching prevents timeline truncation on historical edits.
- **Copy-On-Write Draft Proxies**: Zero-dependency mutable syntax that produces deeply frozen immutable states with structural sharing.
- **Deep Structural Diffing**: Fast recursive diffing engine with exact dot-paths (`added`, `removed`, `changed`).
- **Snapshots & Restore Points**: Immutable named checkpoints for saving and restoring application states.
- **Atomic Transactions**: Batch multiple operations into a single history entry with `homura.transaction()`.
- **Automated Replay Engine**: Step-by-step playback with configurable speed and hooks.
- **Branch Management**: Compare branches (LCA, commits ahead, diffs) and merge them deterministically.
- **Graph Compaction**: Prune intermediate redundant nodes with `homura.compact()` while preserving branch heads and snapshots.
- **Persistence Adapters**: Built-in support for `LocalStorageAdapter`, `IndexedDBAdapter`, and custom storage backends with auto-save and debouncing.
- **Middleware & Events**: Extensible onion-style middleware pipeline and typed event subscriptions.

---

## API Reference (`Homura<T>`)

| Method | Description |
| :--- | :--- |
| `getState(): T` | Returns current immutable state snapshot. |
| `setState(nextState, options?): HistoryEntry<T>` | Directly replaces state and commits history entry. |
| `update(updater, options?): HistoryEntry<T>` | Mutates state via Copy-On-Write draft proxy. |
| `transaction(fn, options?): HistoryEntry<T>` | Batches multiple updates into one atomic entry. |
| `replay(options?): Promise<void>` | Reproduces history step-by-step with hooks. |
| `undo(): HistoryEntry<T> \| null` | Moves back to parent node in DAG. |
| `redo(): HistoryEntry<T> \| null` | Moves forward to child node in active branch. |
| `rewind(steps): HistoryEntry<T> \| null` | Rewinds N steps back. |
| `fastForward(steps): HistoryEntry<T> \| null` | Advances N steps forward. |
| `jumpTo(entryId): HistoryEntry<T>` | Jumps directly to any node in the graph. |
| `snapshot(name?, metadata?): Snapshot<T>` | Creates a named restore point at current entry. |
| `restore(snapshotId): HistoryEntry<T>` | Restores state from snapshot. |
| `deleteSnapshot(snapshotId): void` | Deletes a snapshot. |
| `getSnapshots(): Snapshot<T>[]` | Returns all snapshots. |
| `getHistory(options?): HistoryEntry<T>[]` | Returns history entries. |
| `getCurrentEntry(): HistoryEntry<T>` | Returns current active entry. |
| `getBranches(): Branch[]` | Returns all branches. |
| `getCurrentBranch(): Branch` | Returns active branch. |
| `createBranch(name, fromEntryId?): Branch` | Creates a new branch. |
| `switchBranch(branchId): HistoryEntry<T>` | Switches active branch. |
| `deleteBranch(branchId): void` | Deletes a branch. |
| `merge(sourceBranchId, options?): HistoryEntry<T>` | Merges branch into active branch. |
| `compare(branchA, branchB): BranchComparison` | Compares two branches. |
| `compact(options?): number` | Prunes intermediate nodes. |
| `diff(entryOrStateA, entryOrStateB?): DiffChange[]` | Calculates structural diff. |
| `export(): SerializedHomura<T>` | Exports serializable DAG graph. |
| `import(data): void` | Imports and rehydrates DAG graph. |
| `use(middleware): void` | Adds onion middleware. |
| `on(event, listener): HomuraUnsubscribe` | Subscribes to events. |
| `save(): Promise<void>` | Persists state to storage. |
| `load(): Promise<boolean>` | Loads persisted state. |

---

## License

MIT © Biagio Scaglia & HomuraJS Team
