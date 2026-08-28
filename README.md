# ⏳ HOMURAJS — Time Travel State & History Engine for JavaScript

> **"Git for application state."**

[![CI Tests](https://img.shields.io/badge/tests-38%2F38%20passed-success)](https://github.com/biagio-scaglia/homura-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![NPM Packages](https://img.shields.io/badge/npm-%40homurajs-red)](https://www.npmjs.com/settings/homura-js/packages)

**HomuraJS** is a next-generation, high-performance time-travel state management and history engine for JavaScript and TypeScript. Unlike simple undo/redo stacks that destructively discard future states when you travel back in time and make a change, HomuraJS models state evolution as a **Directed Acyclic Graph (DAG)** of immutable commits—bringing true branching, tree visualization, deep structural diffing, persistent milestones, and decoupled developer tooling to any frontend or Node.js application.

Named after the concept of manipulating time, HomuraJS is framework-agnostic at its core, with first-class integrations for **React 18+**, **Vue 3**, and **Vanilla JS**.

---

## 📑 Table of Contents

1. [Why HomuraJS?](#-why-homurajs)
2. [Packages Architecture](#-packages-architecture)
3. [Installation](#-installation)
4. [Quick Start (Under 10 Lines)](#-quick-start-under-10-lines)
5. [Core State Engine](#-core-state-engine)
6. [DAG History & Branching ("Git for State")](#-dag-history--branching-git-for-state)
7. [Time Travel: Rewind, Fast-Forward & Jump](#-time-travel-rewind-fast-forward--jump)
8. [Snapshots & Milestones](#-snapshots--milestones)
9. [Deep Structural Diff Engine](#-deep-structural-diff-engine)
10. [Persistence Adapters](#-persistence-adapters)
11. [Event System & Middleware Pipeline](#-event-system--middleware-pipeline)
12. [Modern DevTools UI](#-modern-devtools-ui)
13. [React 18+ Integration](#-react-18-integration)
14. [Vue 3 Integration](#-vue-3-integration)
15. [Vanilla JS & DOM Binding](#-vanilla-js--dom-binding)
16. [Performance & Immutability Architecture](#-performance--immutability-architecture)
17. [Full API Reference](#-full-api-reference)
18. [Typed Error Handling](#-typed-error-handling)
19. [Showcase RPG Demo](#-showcase-rpg-demo)
20. [Roadmap](#-roadmap)

---

## ⚡ Why HomuraJS?

Traditional state libraries treat history as a flat stack:

```text
[Stack-based Undo/Redo]:
Step 1 ── Step 2 ── Step 3 (Undo to Step 2, then modify) ── Step 3 is PERMANENTLY DESTROYED!
```

**HomuraJS** treats state evolution as a **Graph**:

```text
[HomuraJS DAG Graph]:
                  Login (v1)
                     │
Start ── Cart ── Product ── Quantity (v3) [Head: main]
                  │
                  └──── Product Removed ── Alternative Checkout [Head: branch-2]
```

* **Zero Data Loss**: Diverging from a past node creates a new branch; your old timeline remains fully accessible and traversable.
* **Structural Diffing**: Built-in diff engine instantly tells you what changed (`added`, `removed`, `changed`) with exact dot-paths.
* **Zero Runtime Dependencies**: The core engine is 100% standalone, lightweight, and framework-agnostic.
* **Modern Developer Tooling**: Includes `@homurajs/devtools` with DAG visual timeline, interactive scrubber, JSON tree inspector, side-by-side diffing, and floating overlay launcher.

---

## 📦 Packages Architecture

HomuraJS is structured as a modular TypeScript monorepo:

| Package | Description | Version |
| :--- | :--- | :--- |
| [`@homurajs/core`](#core-state-engine) | Core DAG history engine, immutability, diffs, snapshots, persistence & middleware | `1.0.0` |
| [`@homurajs/devtools`](#modern-devtools-ui) | Modern cyberpunk DevTools UI, DAG timeline, JSON inspector, diff viewer, playback HUD | `1.0.0` |
| [`@homurajs/react`](#react-18-integration) | React 18+ hooks (`useHomura`, selectors, Provider, `<HomuraDevTools />`) | `1.0.0` |
| [`@homurajs/vue`](#vue-3-integration) | Vue 3 Composition API hook (`useHomura`) and Vue plugin | `1.0.0` |
| [`@homurajs/vanilla`](#vanilla-js--dom-binding) | Vanilla DOM bindings (`bindState`) and standalone helpers | `1.0.0` |

---

## 🚀 Installation

```bash
# Core engine
npm install @homurajs/core

# DevTools UI
npm install @homurajs/devtools

# React 18+ Integration
npm install @homurajs/react

# Vue 3 Integration
npm install @homurajs/vue

# Vanilla JS Integration
npm install @homurajs/vanilla
```

---

## ⚡ Quick Start (Under 10 Lines)

```ts
import { createHomura } from '@homurajs/core';

const homura = createHomura({ initialState: { count: 0 } });

homura.update(d => { d.count += 10; }, { label: 'Add 10' });
homura.update(d => { d.count *= 2; }, { label: 'Double' });

homura.undo(); // count is 10
homura.redo(); // count is 20
console.log(homura.getState()); // { count: 20 }
```

---

## 🧠 Core State Engine

Create a strongly-typed Homura instance:

```ts
import { createHomura } from '@homurajs/core';

interface AppState {
  player: {
    name: string;
    hp: number;
    inventory: string[];
  };
  gold: number;
}

const homura = createHomura<AppState>({
  initialState: {
    player: { name: 'Homura', hp: 100, inventory: ['Potion'] },
    gold: 500
  },
  maxHistory: 1000,
  enableBranches: true
});
```

### Mutating State (Draft Proxy & Direct State)

Homura provides zero-dependency copy-on-write proxy updates:

```ts
// 1. Mutating Draft Proxy (Immer-style ergonomics)
homura.update(draft => {
  draft.player.hp -= 25;
  draft.player.inventory.push('Magic Staff');
  draft.gold += 150;
}, { label: 'Defeated Goblin & Looted Staff' });

// 2. Pure state return
homura.update(state => ({
  ...state,
  gold: state.gold + 50
}), { label: 'Found gold coins' });

// 3. Direct setState
homura.setState(nextState, { label: 'Reset level' });
```

---

## 🌳 DAG History & Branching ("Git for State")

Every state modification produces a typed `HistoryEntry<T>` in the history graph:

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

### Automatic Branching on Divergence

When you navigate backward in history and make a new commit, Homura automatically creates a new branch, preserving the historical timeline:

```ts
// A ── B ── C ── D
homura.jumpTo("B");

// Updating from B creates a new branch!
// A ── B ── C ── D (original branch 'main')
//      \
//       E ── F    (new branch 'branch-2')
homura.update(d => { d.player.hp = 50; }, { label: 'Alternative path' });
```

### Explicit Branch Management

```ts
// Create branch explicitly
const mageBranch = homura.createBranch('Mage-Path');

// List branches
const branches = homura.getBranches();

// Switch active branch
homura.switchBranch(mageBranch.id);

// Delete branch
homura.deleteBranch('old-branch');
```

---

## ⏪ Time Travel: Rewind, Fast-Forward & Jump

```ts
// 1 step back
homura.undo();

// 1 step forward
homura.redo();

// Rewind N steps
homura.rewind(5);

// Fast forward N steps
homura.fastForward(3);

// Jump directly to any entry in the DAG
homura.jumpTo(entry.id);
```

---

## 📷 Snapshots & Milestones

Snapshots are persistent, named bookmarks pointing to specific milestones in your history graph:

```ts
// Capture snapshot
const snap = homura.snapshot('Before Boss Battle', { stage: 4 });

// List snapshots
const snapshots = homura.getSnapshots();

// Restore snapshot anytime
homura.restore(snap.id);

// Delete snapshot
homura.deleteSnapshot(snap.id);
```

---

## 🔍 Deep Structural Diff Engine

Homura contains an independent, pure diff engine that compares nested objects, arrays, and primitive values:

```ts
import { diffStates } from '@homurajs/core';

const oldState = { user: { name: 'Mario', gold: 100 }, items: ['Potion'] };
const newState = { user: { name: 'Luigi', gold: 150 }, items: ['Potion', 'Shield'] };

const diff = diffStates(oldState, newState);
```

Output:
```json
[
  {
    "path": ["user", "name"],
    "type": "changed",
    "oldValue": "Mario",
    "newValue": "Luigi"
  },
  {
    "path": ["user", "gold"],
    "type": "changed",
    "oldValue": 100,
    "newValue": 150
  },
  {
    "path": ["items", 1],
    "type": "added",
    "value": "Shield"
  }
]
```

Instance method:
```ts
// Diff between two entries
homura.diff(entryA, entryB);

// Diff an entry against current state
homura.diff(historicalEntry);
```

---

## 💾 Persistence Adapters

Homura includes pluggable persistence adapters with debounced auto-saving:

```ts
import { createHomura, LocalStorageAdapter, MemoryAdapter } from '@homurajs/core';

// Browser LocalStorage persistence
const homura = createHomura({
  initialState,
  persistence: {
    adapter: new LocalStorageAdapter('my_app_state'),
    autoSave: true,
    debounceMs: 150
  }
});

// Hydrate saved state
await homura.load();

// Manual save
await homura.save();
```

---

## 📡 Event System & Middleware Pipeline

### Events

```ts
// Listen to state changes
const unsubscribe = homura.on('state:change', ({ state, prevState, entry, action }) => {
  console.log(`[${action}] State evolved to:`, state);
});

// Listen to branching
homura.on('branch:create', ({ branch }) => {
  console.log('Created branch:', branch.name);
});

// Clean up
unsubscribe();
```

### Middleware Pipeline

```ts
homura.use((context, next) => {
  console.log(`Action: ${context.action}, Label: ${context.label}`);
  
  // Enrich metadata
  context.setMetadata?.({ timestamp: Date.now(), userId: 'admin' });

  // Guard / intercept / cancel invalid mutations
  if (context.action === 'setState' && (context.nextState as any).hp < 0) {
    console.warn('Preventing negative HP');
    context.cancel();
    return;
  }

  next();
});
```

---

## 🛠️ Modern DevTools UI

Homura DevTools is a developer-focused, dark-themed diagnostic panel with:
- **Visual DAG Timeline**: Click-to-jump, branch markers, search filter, relative timestamps.
- **Collapsible JSON State Inspector**: Expand/collapse all, filter search, syntax highlighting, copy values.
- **Diff Viewer**: Side-by-side & unified diff comparator between any two historical commits.
- **Playback & Scrubber HUD**: Automatic cinematic playback (Play/Pause), scrubbing slider, `±1`, `±5`, `±10` step navigation.
- **Floating Overlay Launcher**: Sleek glowing badge in the bottom-right corner of your screen (toggle with `Alt + H`).

```ts
import { mountDevTools } from '@homurajs/devtools';

// Mount floating dock launcher
mountDevTools(homura, {
  position: 'floating',
  defaultOpen: true
});

// Or embed into a specific DOM element
mountDevTools(homura, {
  container: '#devtools-container',
  position: 'embedded'
});
```

---

## ⚛️ React 18+ Integration

```tsx
import { createHomura } from '@homurajs/core';
import { useHomura, HomuraDevTools } from '@homurajs/react';

const homura = createHomura({
  initialState: { counter: 0, user: { name: 'Mario' } }
});

export function Counter() {
  // Select fine-grained slice for optimal performance without unnecessary re-renders
  const { state: count, update, undo, redo, canUndo, canRedo } = useHomura(
    homura,
    state => state.counter
  );

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => update(d => { d.counter++; }, { label: 'Increment' })}>+1</button>
      <button disabled={!canUndo} onClick={() => undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => redo()}>Redo</button>

      {/* Embedded or Floating DevTools */}
      <HomuraDevTools homura={homura} position="floating" defaultOpen={true} />
    </div>
  );
}
```

---

## 🟢 Vue 3 Integration

```vue
<template>
  <div>
    <h1>Count: {{ state.count }}</h1>
    <button @click="increment">+1</button>
    <button :disabled="!canUndo" @click="undo">Undo</button>
    <button :disabled="!canRedo" @click="redo">Redo</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { createHomura } from '@homurajs/core';
import { useHomura } from '@homurajs/vue';
import { mountDevTools } from '@homurajs/devtools';

const homura = createHomura({ initialState: { count: 0 } });
const { state, update, undo, redo, canUndo, canRedo } = useHomura(homura);

function increment() {
  update(d => { d.count++; }, { label: 'Increment' });
}

onMounted(() => {
  mountDevTools(homura, { position: 'floating', defaultOpen: true });
});
</script>
```

---

## 🍦 Vanilla JS & DOM Binding

```ts
import { createHomura, bindState, mountDevTools } from '@homurajs/vanilla';

const homura = createHomura({
  initialState: { score: 100, player: 'Mario' }
});

// Automatically bind state slices to DOM elements
const unbind = bindState(homura, [
  { selector: s => s.score, target: '#score-display', format: v => `Score: ${v}` },
  { selector: s => s.player, target: '#player-display' }
]);

mountDevTools(homura, { position: 'floating' });
```

---

## ⚡ Performance & Immutability Architecture

* **Structural Sharing**: Unmodified state branches retain their object references across commits.
* **Zero Clones on Read**: `getState()` returns the current state node without cloning overhead.
* **Copy-on-Write Proxy Drafts**: Mutations inside `update(draft => ...)` only create shallow copies along the modified path.
* **Configurable History Pruning**: Limit total DAG size via `maxHistory` or manually call `pruneHistory(limit)`.

---

## 📖 Full API Reference

### `createHomura<T>(config: HomuraConfig<T>): Homura<T>`

#### Methods:
* `getState(): T`
* `setState(nextState: T, options?: StateUpdateOptions): HistoryEntry<T>`
* `update(updater: StateUpdater<T>, options?: StateUpdateOptions): HistoryEntry<T>`
* `commit(label: string, metadata?: Record<string, unknown>): HistoryEntry<T>`
* `undo(): HistoryEntry<T> | null`
* `redo(): HistoryEntry<T> | null`
* `rewind(steps: number): HistoryEntry<T> | null`
* `fastForward(steps: number): HistoryEntry<T> | null`
* `jumpTo(entryId: string): HistoryEntry<T>`
* `snapshot(name?: string, metadata?: Record<string, unknown>): Snapshot<T>`
* `restore(snapshotId: string): HistoryEntry<T>`
* `deleteSnapshot(snapshotId: string): void`
* `getSnapshots(): Snapshot<T>[]`
* `getHistory(options?: { allBranches?: boolean }): HistoryEntry<T>[]`
* `getCurrentEntry(): HistoryEntry<T>`
* `getBranches(): Branch[]`
* `getCurrentBranch(): Branch`
* `createBranch(name: string, fromEntryId?: string): Branch`
* `switchBranch(branchId: string): HistoryEntry<T>`
* `deleteBranch(branchId: string): void`
* `diff(entryOrStateA, entryOrStateB?): DiffChange[]`
* `export(): SerializedHomura<T>`
* `import(data: SerializedHomura<T>): void`
* `pruneHistory(maxEntries?: number): number`
* `on(event, listener): HomuraUnsubscribe`
* `use(middleware: HomuraMiddleware<T>): void`
* `save(): Promise<void>`
* `load(): Promise<boolean>`

---

## 🛡️ Typed Error Handling

```ts
import {
  HomuraError,
  HomuraHistoryError,
  HomuraSnapshotError,
  HomuraBranchError,
  HomuraSerializationError,
  HomuraPersistenceError,
  HomuraMiddlewareError
} from '@homurajs/core';
```

---

## 🎮 Showcase RPG Demo

Run the interactive Mini RPG Inventory & Time Machine demo:

```bash
pnpm --filter "@homurajs/example-rpg-inventory" run dev
```

Or test the Playground:

```bash
pnpm --filter "@homurajs/playground" run dev
```

---

## 🗺️ Roadmap

- [x] Core DAG State & History Graph Engine
- [x] Non-destructive automatic branching
- [x] Zero-dependency copy-on-write draft proxies
- [x] Deep structural Diff Engine with path tracking
- [x] Persistent Snapshots & Milestones
- [x] LocalStorage & Memory Persistence Adapters
- [x] Middleware pipeline & typed event system
- [x] Standalone DevTools UI (Timeline, Inspector, Diff Viewer, Scrubber, Floating Launcher)
- [x] React 18+ Integration (`useHomura`, selectors, Provider, `<HomuraDevTools />`)
- [x] Vue 3 Integration (`useHomura`, Composition API, plugin)
- [x] Vanilla JS integration (`bindState`)
- [x] Complete test suite (38/38 unit tests passing)
- [ ] Browser DevTools Extension package (Chrome & Firefox manifest v3)
- [ ] WebWorker & IndexedDB offloaded background persistence adapter
- [ ] Time-travel collaborative multi-user state synchronization (CRDT/OT)

---

## 📜 License

MIT © [HomuraJS Team](https://github.com/biagio-scaglia/homura-js)
