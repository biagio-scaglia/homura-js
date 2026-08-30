<div align="center">

# HOMURAJS
### Time Travel State & History Engine for JavaScript

**"Git for application state"**

[![CI Tests](https://img.shields.io/badge/tests-49%2F49%20passed-7c3aed)](https://github.com/biagio-scaglia/homura-js)
[![Version](https://img.shields.io/badge/version-v1.2.3-9333ea)](https://www.npmjs.com/package/@biagioscaglia/homurajs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-581c87)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-3b0764)](LICENSE)
[![NPM](https://img.shields.io/badge/npm-%40biagioscaglia%2Fhomurajs-a855f7)](https://www.npmjs.com/package/@biagioscaglia/homurajs)

</div>

---

## 1. What is HomuraJS?

**HomuraJS** is a time-travel state management and history engine for JavaScript and TypeScript applications.

Unlike traditional state managers or standard Undo/Redo stacks based on a linear array, HomuraJS models every mutation as a **Directed Acyclic Graph (DAG)** of immutable states.

### The Problem with Traditional Undo/Redo
In conventional undo/redo systems:
1. The user performs: Action A -> Action B -> Action C.
2. The user steps back 2 steps to Action A.
3. If the user performs a new operation (Action D), the entire future history (Action B and Action C) is **permanently destroyed**.

### The HomuraJS Solution ("Git for State")
HomuraJS prevents data loss through **non-destructive branch divergence**:
1. When navigating back in time and applying a mutation, HomuraJS automatically forks into a new parallel branch.
2. The original timeline remains intact, navigable, and inspectable at any time.
3. The engine provides deep structural diffing between any two states, instant restore points (Snapshots), atomic transactions, timeline replay, and persistence adapters for LocalStorage and IndexedDB.

---

## 2. Package Architecture

HomuraJS is structured as a modular TypeScript monorepo:

| Package | Description |
| :--- | :--- |
| **`@homura-js/core`** | Core engine: DAG graph, Proxy draft immutability, structural diffing, snapshots, persistence, and middleware pipeline. |
| **`@homura-js/devtools`** | Diagnostic UI: Visual timeline tree, JSON state tree inspector, side-by-side diff viewer, and playback scrubber. |
| **`@homura-js/react`** | React 18+ integration with `useSyncExternalStore` and selector optimization to eliminate unnecessary re-renders. |
| **`@homura-js/vue`** | Vue 3 integration via Composition API (`useHomura`) and dedicated plugin. |
| **`@homura-js/vanilla`** | Lightweight two-way reactive DOM binding for frameworkless applications. |
| **`@biagioscaglia/homurajs`** | Unified meta-package providing all modules in a single dependency. |

---

## 3. Installation

### Core Engine
```bash
npm install @homura-js/core
```

### With React
```bash
npm install @homura-js/core @homura-js/react @homura-js/devtools
```

### With Vue 3
```bash
npm install @homura-js/core @homura-js/vue @homura-js/devtools
```

### With Vanilla JS
```bash
npm install @homura-js/vanilla
```

### Unified Bundle
```bash
npm install @biagioscaglia/homurajs
```

---

## 4. Quick Start

Initialize and mutate state with full time-travel capabilities in under 10 lines of code:

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

## 5. State Management & Immutability

### Copy-On-Write Draft Proxies
HomuraJS provides a built-in Proxy-based draft mechanism without external dependencies. Mutations are recorded on a virtual draft and finalized into a new frozen state tree with structural sharing.

```ts
// 1. Direct mutation on the draft proxy
homura.update(draft => {
  draft.user = 'Akemi';
  draft.counter += 5;
}, { label: 'Update User Profile' });

// 2. Pure functional return
homura.update(state => ({
  ...state,
  counter: state.counter + 1
}), { label: 'Pure Increment' });

// 3. Direct replacement
homura.setState({ counter: 100, user: 'Homura' }, { label: 'Global Reset' });
```

---

## 6. DAG History Graph & Branching

Every committed update creates an immutable history node:

```ts
interface HistoryEntry<T> {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  branchId: string;
  timestamp: number;
  label: string;
  state: T;
  metadata?: Record<string, unknown>;
}
```

### Automatic Branch Divergence

When modifying state from a historical node, HomuraJS automatically forks the timeline without overwriting or truncating existing child nodes:

```text
Root Node (v1)
     │
     ├─── Action 1 (Main Branch) ────── Action 2 (v2)
     │
     └─── Alt Action (New Branch) ───── Action 3 (v3)
```

```ts
// Jump back to an earlier entry
homura.jumpTo("past-entry-id");

// Mutating state here creates a new branch without discarding the future
homura.update(draft => {
  draft.counter = 999;
}, { label: 'Alternative Timeline' });

// Retrieve all branches
const branches = homura.getBranches();

// Switch active branch
homura.switchBranch(branches[0].id);
```

---

## 7. Time Travel Navigation

Navigate deterministically across the state timeline:

```ts
// Step backward or forward
homura.undo();
homura.redo();

// Step N nodes at once
homura.rewind(5);       // 5 nodes back
homura.fastForward(3);  // 3 nodes forward

// Direct jump to any node in the DAG
homura.jumpTo("specific-entry-id");
```

---

## 8. Snapshots & Milestones

Snapshots are immutable named bookmarks anchored to a specific history node, ideal for checkpoints and game saves:

```ts
// Create a snapshot
const checkpoint = homura.snapshot('Pre-Boss Fight', { level: 5 });

// Retrieve all snapshots
const snapshots = homura.getSnapshots();

// Instantly restore state to snapshot
homura.restore(checkpoint.id);

// Delete a snapshot
homura.deleteSnapshot(checkpoint.id);
```

---

## 9. Atomic Transactions & Batching (`transaction`)

In complex forms or interactive canvases, applying multiple sequential mutations creates noisy intermediate history entries. Use `transaction()` to batch updates into a **single atomic commit**:

```ts
// Batches multiple property updates into 1 history node
homura.transaction(draft => {
  draft.user.name = "Biagio";
  draft.user.age = 21;
  draft.user.role = "developer";
}, { label: "Complete Profile Update" });

// History: Initial -> Complete Profile Update (instead of 3 separate nodes)
// A single homura.undo() reverts the entire transaction.
```

---

## 10. Timeline Replay & Bug Reporting

HomuraJS includes an automated replay engine that reproduces state history step-by-step for debugging, live demos, and QA testing:

```ts
// Replay history at 2x speed with step callbacks
await homura.replay({
  from: "login-entry-id",
  to: "checkout-entry-id",
  speed: 2,
  stepDelayMs: 300,
  onStep: (entry, step, total) => {
    console.log(`[Replay] Step ${step}/${total}: "${entry.label}"`);
  }
});

// Export serialized state history for bug reports
const bugReport = homura.export();

// Rehydrate and inspect on another machine
homura.import(bugReport);
```

---

## 11. Branch Comparison & Merging (`merge` & `compare`)

Compare parallel branches, find their Lowest Common Ancestor (LCA), and merge them seamlessly:

```ts
// Compare main branch with a feature branch
const comparison = homura.compare('main', 'feature-branch');
console.log(comparison.commonAncestorId); // Divergence entry ID
console.log(comparison.aheadCount);       // Commits ahead
console.log(comparison.diff);             // Structural diff array

// Merge feature branch into active branch
homura.merge('feature-branch', {
  label: "Merge feature-branch into main"
});
```

---

## 12. Graph Compaction & Storage (`compact`)

To optimize memory during long-running sessions, `compact()` prunes non-essential intermediate nodes while preserving all snapshots and branch heads:

```ts
import { createHomura, createIndexedDBAdapter } from '@biagioscaglia/homurajs';

// High-performance IndexedDB persistence for browser applications
const homura = createHomura({
  initialState: { canvas: [] },
  persistence: {
    adapter: createIndexedDBAdapter({ dbName: 'homura_app', storeName: 'state_history' }),
    autoSave: true,
    debounceMs: 200
  }
});

// Compact history to a maximum of 100 entries while keeping all snapshots
const prunedCount = homura.compact({ maxEntries: 100, preserveSnapshots: true });
console.log(`Pruned ${prunedCount} intermediate nodes.`);
```

---

## 13. Deep Structural Diff Engine

HomuraJS provides a recursive structural diff engine that analyzes objects, arrays, and primitives, returning precise dot-paths:

```ts
import { diffStates } from '@homura-js/core';

const stateA = { profile: { name: 'Homura', level: 1 }, items: ['Shield'] };
const stateB = { profile: { name: 'Homura', level: 2 }, items: ['Shield', 'Bow'] };

const changes = diffStates(stateA, stateB);
```

Result:
```json
[
  {
    "path": ["profile", "level"],
    "type": "changed",
    "oldValue": 1,
    "newValue": 2
  },
  {
    "path": ["items", 1],
    "type": "added",
    "value": "Bow"
  }
]
```

Diff directly between two history nodes:
```ts
const nodeDiff = homura.diff(entryA, entryB);
```

---

## 14. Persistence Adapters

Plug-and-play persistence with synchronous or asynchronous storage and automatic debouncing:

```ts
import { createHomura, LocalStorageAdapter } from '@homura-js/core';

const homura = createHomura({
  initialState: { activeTab: 'dashboard' },
  persistence: {
    adapter: new LocalStorageAdapter('homura_storage_key'),
    autoSave: true,
    debounceMs: 200
  }
});

// Explicit save & load
await homura.save();
await homura.load();
```

---

## 15. Middleware Pipeline & Typed Events

### Middleware (Onion Pipeline)
Intercept, enrich, validate, or cancel state transitions before they are committed:

```ts
homura.use((context, next) => {
  console.log(`Action: ${context.action}, Label: ${context.label}`);

  // Validation: reject invalid state mutations
  if (context.action === 'setState' && (context.nextState as any).counter < 0) {
    console.warn('Operation cancelled: counter cannot be negative.');
    context.cancel();
    return;
  }

  next();
});
```

### Typed Event Subscriptions
```ts
const unsubscribe = homura.on('state:change', ({ state, prevState, entry, action }) => {
  console.log(`Transition [${action}]:`, state);
});

// Unsubscribe when done
unsubscribe();
```

---

## 16. Embedded DevTools UI

Diagnose and inspect state in real time:
- **DAG Timeline**: Visual interactive tree with branching nodes.
- **JSON Tree Inspector**: Searchable state viewer with type highlighting.
- **Diff Viewer**: Side-by-side and unified diff visualization.
- **Playback HUD**: Automated time scrubber with variable playback speeds.
- **Floating Launcher**: Built-in toggle button with keyboard shortcut (`Alt + H`).

```ts
import { mountDevTools } from '@homura-js/devtools';

// Mount floating launcher overlay
mountDevTools(homura, {
  position: 'floating',
  theme: 'dark',
  defaultOpen: true
});

// Mount in an embedded container element
mountDevTools(homura, {
  container: '#devtools-container',
  position: 'embedded'
});
```

---

## 17. UI Framework Integrations

### React 18+
```tsx
import { createHomura } from '@homura-js/core';
import { useHomura, HomuraDevTools } from '@homura-js/react';

const homura = createHomura({
  initialState: { count: 0, user: 'Homura' }
});

export function Counter() {
  // Selective subscription to 'count' avoids re-renders on 'user' changes
  const { state: count, update, undo, redo, canUndo, canRedo } = useHomura(
    homura,
    s => s.count
  );

  return (
    <div style={{ background: '#0a0710', color: '#e9d5ff', padding: 24, borderRadius: 8 }}>
      <h2>Count: {count}</h2>
      <button onClick={() => update(d => { d.count++; }, { label: 'Increment' })}>+1</button>
      <button disabled={!canUndo} onClick={() => undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => redo()}>Redo</button>

      <HomuraDevTools homura={homura} position="floating" />
    </div>
  );
}
```

### Vue 3
```vue
<template>
  <div style="background: #0a0710; color: #e9d5ff; padding: 24px; border-radius: 8px;">
    <h2>Count: {{ state.count }}</h2>
    <button @click="increment">+1</button>
    <button :disabled="!canUndo" @click="undo">Undo</button>
    <button :disabled="!canRedo" @click="redo">Redo</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { createHomura } from '@homura-js/core';
import { useHomura } from '@homura-js/vue';
import { mountDevTools } from '@homura-js/devtools';

const homura = createHomura({
  initialState: { count: 0 }
});

const { state, update, undo, redo, canUndo, canRedo } = useHomura(homura);

function increment() {
  update(d => { d.count += 1; }, { label: 'Increment' });
}

onMounted(() => {
  mountDevTools(homura, { position: 'floating' });
});
</script>
```

### Vanilla JS
```ts
import { createHomura, bindState, mountDevTools } from '@homura-js/vanilla';

const homura = createHomura({
  initialState: { score: 100 }
});

// Automatic two-way DOM synchronization
bindState(homura, [
  { selector: s => s.score, target: '#score-display', format: v => `Score: ${v}` }
]);

mountDevTools(homura, { position: 'floating' });
```

---

## 18. API Reference (`Homura<T>`)

| Method | Description |
| :--- | :--- |
| `getState(): T` | Returns the current immutable state snapshot. |
| `setState(nextState, options?): HistoryEntry<T>` | Directly sets state and commits a new history entry. |
| `update(updater, options?): HistoryEntry<T>` | Mutates state via Copy-On-Write draft proxy. |
| `transaction(fn, options?): HistoryEntry<T>` | Batches multiple mutations into a single atomic history entry. |
| `replay(options?): Promise<void>` | Reproduces history step-by-step with configurable speed and hooks. |
| `undo(): HistoryEntry<T> \| null` | Steps back to the parent entry in the DAG. |
| `redo(): HistoryEntry<T> \| null` | Steps forward to the next child entry on the active branch. |
| `rewind(steps): HistoryEntry<T> \| null` | Rewinds N entries backward. |
| `fastForward(steps): HistoryEntry<T> \| null` | Advances N entries forward. |
| `jumpTo(entryId): HistoryEntry<T>` | Jumps directly to any node in the graph. |
| `snapshot(name?, metadata?): Snapshot<T>` | Creates a named restore point at the current node. |
| `restore(snapshotId): HistoryEntry<T>` | Restores state to a snapshot. |
| `deleteSnapshot(snapshotId): void` | Removes a snapshot. |
| `getSnapshots(): Snapshot<T>[]` | Returns all registered snapshots. |
| `getHistory(options?): HistoryEntry<T>[]` | Returns history entries for current branch or all branches. |
| `getCurrentEntry(): HistoryEntry<T>` | Returns the active history entry node. |
| `getBranches(): Branch[]` | Returns all timeline branches. |
| `getCurrentBranch(): Branch` | Returns the currently active branch. |
| `createBranch(name, fromEntryId?): Branch` | Creates a new named branch. |
| `switchBranch(branchId): HistoryEntry<T>` | Switches active branch to the target branch head. |
| `deleteBranch(branchId): void` | Deletes a non-main branch. |
| `merge(sourceBranchId, options?): HistoryEntry<T>` | Merges a branch into the active branch. |
| `compare(branchA, branchB): BranchComparison` | Compares two branches (LCA, ahead count, diff). |
| `compact(options?): number` | Prunes intermediate redundant nodes while preserving snapshots. |
| `diff(entryOrStateA, entryOrStateB?): DiffChange[]` | Calculates structural diff between two entries or states. |
| `export(): SerializedHomura<T>` | Exports the entire DAG history to a serializable JSON object. |
| `import(data): void` | Imports and rehydrates a serialized history graph. |
| `pruneHistory(maxEntries?): number` | Prunes oldest nodes exceeding capacity limit. |
| `use(middleware): void` | Registers an onion middleware. |
| `on(event, listener): HomuraUnsubscribe` | Subscribes to lifecycle events (`state:change`, `branch:create`, etc.). |
| `save(): Promise<void>` | Saves state through configured persistence adapter. |
| `load(): Promise<boolean>` | Loads persisted state into engine. |

---

## 19. License & Authors

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

Copyright (c) 2026 Biagio Scaglia & HomuraJS Team.
