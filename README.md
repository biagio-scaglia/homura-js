<div align="center">

<p align="center">
  <img src="https://raw.githubusercontent.com/biagio-scaglia/homura-js/main/assets/homura-banner.png" alt="HomuraJS — Git for Application State" width="100%" />
</p>

[![CI Tests](https://img.shields.io/badge/tests-52%2F52%20passed-7c3aed)](https://github.com/biagio-scaglia/homura-js)
[![Version](https://img.shields.io/badge/version-v1.2.6-9333ea)](https://www.npmjs.com/package/@biagioscaglia/homurajs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-581c87)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-3b0764)](LICENSE)
[![NPM](https://img.shields.io/badge/npm-%40biagioscaglia%2Fhomurajs-a855f7)](https://www.npmjs.com/package/@biagioscaglia/homurajs)

**"Git for application state"** — Directed Acyclic Graph (DAG) state management, non-destructive branching, time travel, zero-JS static site form recovery, and WordPress plugin.

[Documentation Portal](https://biagio-scaglia.github.io/homura-js/) &nbsp;•&nbsp; [GitHub Repository](https://github.com/biagio-scaglia/homura-js) &nbsp;•&nbsp; [WordPress Plugin](https://wordpress.org/plugins/homura-time-travel-form-recovery/)

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
| **`@homura-js/vanilla`** | Lightweight reactive DOM binding (`bindState`) and Zero-JS form recovery engine (`bindForm`, `autoInitForms`). |
| **`@biagioscaglia/homurajs`** | Unified meta-package providing all modules in a single dependency + Standalone Browser IIFE bundle. |

---

## 3. Installation

### Unified Meta-Package (Recommended)
```bash
npm install @biagioscaglia/homurajs
```

### Modular Packages
```bash
# Core DAG Engine only (0 dependencies)
npm install @homura-js/core

# React 18+ integration & DevTools
npm install @homura-js/core @homura-js/react @homura-js/devtools

# Vue 3 integration & DevTools
npm install @homura-js/core @homura-js/vue @homura-js/devtools

# Vanilla DOM & Static Forms
npm install @homura-js/vanilla
```

### Standalone Browser CDN Tag (No Build Tools Required)
```html
<script src="https://unpkg.com/@biagioscaglia/homurajs/dist/index.global.js"></script>
```

---

## 4. Quick Start

Initialize and mutate state with full time-travel capabilities in under 10 lines of code:

```ts
import { createHomura } from '@biagioscaglia/homurajs';

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
```

---

## 5. Zero-JS Static Site Form Engine (`data-homura-*`)

Turn any static HTML form (Webflow, Shopify, Squarespace, Static HTML) into a time-travel crash-recovery machine without writing a single line of JavaScript:

```html
<!-- Load HomuraJS Standalone Bundle from CDN -->
<script src="https://unpkg.com/@biagioscaglia/homurajs/dist/index.global.js"></script>

<!-- Declarative Form Auto-Binding -->
<form data-homura-form="lead_form" data-homura-persist="localstorage">
  <!-- Live status badge and clickable history breadcrumbs -->
  <span data-homura-status></span>
  <div data-homura-breadcrumbs></div>

  <input type="text" name="fullName" placeholder="Full Name" />
  <input type="email" name="email" placeholder="Email Address" />
  <textarea name="notes" placeholder="Notes..."></textarea>

  <button type="button" data-homura-undo>↩ Undo</button>
  <button type="button" data-homura-redo>↪ Redo</button>
  <button type="submit">Submit</button>
</form>
```

### Multi-Step Form Wizard (`data-homura-wizard`)
```html
<form data-homura-wizard="quote_wizard" data-homura-persist="localstorage">
  <!-- Step 1 -->
  <div data-homura-step="1">
    <label>Budget</label>
    <input type="number" name="budget" placeholder="Budget" />
    <button type="button" data-homura-next>Next ➔</button>
  </div>

  <!-- Step 2 -->
  <div data-homura-step="2">
    <label>Contact</label>
    <input type="email" name="email" placeholder="Email" />
    <button type="button" data-homura-prev>⬅ Back</button>
    <button type="submit" data-homura-next data-submit-label="Finish">Complete</button>
  </div>
</form>
```

---

## 6. WordPress & WooCommerce Integration

HomuraJS provides an official WordPress plugin located in [`examples/wordpress-plugin`](examples/wordpress-plugin/):

* **Zero Data Loss**: Prevents form abandonment across page refreshes and tab closures.
* **Auto-Hooks**: Automatically protects WooCommerce Checkout (`.woocommerce-checkout`), Contact Form 7 (`.wpcf7 form`), WPForms (`.wpforms-form`), and Elementor Forms (`.elementor-form`).
* **Shortcodes**:
  * `[homura_form id="my_form" persist="localstorage"] ... [/homura_form]`
  * `[homura_undo form="my_form" label="↩ Undo"]`
  * `[homura_redo form="my_form" label="↪ Redo"]`
  * `[homura_status form="my_form"]`
  * `[homura_breadcrumbs form="my_form"]`
  * `[homura_wizard id="my_wizard"]`

---

## 7. Directed Acyclic Graph (DAG) History & Branching

Every state in HomuraJS is an immutable node:

```ts
interface HistoryEntry<T> {
  id: string;              // Unique entry identifier
  parentId: string | null; // Direct ancestor node
  childrenIds: string[];   // Successor nodes (branch forks)
  branchId: string;        // Branch identifier
  timestamp: number;       // Unix epoch timestamp
  label: string;           // Descriptive message
  state: T;                // Frozen state snapshot
  metadata?: Record<string, unknown>;
}
```

### Branching & Merging
```ts
// Create alternative branch from current state
const featureBranch = homura.createBranch('experimental-layout');

homura.update(d => {
  d.theme = 'neon';
}, { label: 'Apply neon palette' });

// Compare branches (find Lowest Common Ancestor & structural diff)
const comparison = homura.compare('main', 'experimental-layout');

// 3-way recursive merge back into main
homura.switchBranch('main');
homura.merge('experimental-layout', { strategy: 'theirs' });
```

---

## 8. Embedded Diagnostic DevTools

Attach a diagnostic panel to any web application in 2 lines of code:

```ts
import { mountDevTools } from '@homura-js/devtools';

mountDevTools(homura, {
  position: 'floating', // 'floating' | 'embedded'
  theme: 'dark',
  defaultOpen: true
});
```

* **Timeline Tree**: Interactive DAG visualizer displaying all branches, commits, and timestamps.
* **JSON State Inspector**: Live searchable property tree.
* **Diff Viewer**: Side-by-side and unified semantic diffing.
* **Playback Controls**: Step-by-step time scrubbing and animated replay.

---

## 9. Framework Integrations

### React 18+ (`@homura-js/react`)
```tsx
import React from 'react';
import { useHomura, HomuraDevTools } from '@homura-js/react';
import { homura } from './store';

export function UserDashboard() {
  const { state: user, update, undo, redo, canUndo, canRedo } = useHomura(
    homura,
    s => s.user
  );

  return (
    <div>
      <h2>User: {user.name}</h2>
      <button onClick={() => update(d => { d.user.name = 'Daisy'; }, { label: 'Rename' })}>Rename</button>
      <button disabled={!canUndo} onClick={() => undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => redo()}>Redo</button>
      <HomuraDevTools homura={homura} position="floating" />
    </div>
  );
}
```

### Vue 3 (`@homura-js/vue`)
```vue
<template>
  <div>
    <h2>Count: {{ state.count }}</h2>
    <button @click="increment">+1</button>
    <button :disabled="!canUndo" @click="undo">Undo</button>
    <button :disabled="!canRedo" @click="redo">Redo</button>
  </div>
</template>

<script setup lang="ts">
import { useHomura } from '@homura-js/vue';
import { homura } from './store';

const { state, update, undo, redo, canUndo, canRedo } = useHomura(homura);

function increment() {
  update(d => { d.count += 1; }, { label: 'Increment' });
}
</script>
```

---

## 10. Complete API Reference (`Homura<T>`)

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `getState()` | `T` | Returns the current immutable state snapshot. |
| `setState(nextState, options?)` | `HistoryEntry<T>` | Directly sets state and commits a new history entry. |
| `update(updater, options?)` | `HistoryEntry<T>` | Mutates state via Copy-On-Write draft proxy. |
| `transaction(fn, options?)` | `HistoryEntry<T>` | Batches multiple mutations into a single atomic history entry. |
| `undo()` | `HistoryEntry<T> \| null` | Steps back to the parent entry in the DAG. |
| `redo()` | `HistoryEntry<T> \| null` | Steps forward to the next child entry on the active branch. |
| `canUndo()` | `boolean` | Returns true if an undo operation is possible from current state. |
| `canRedo()` | `boolean` | Returns true if a redo operation is possible from current state. |
| `rewind(steps)` | `HistoryEntry<T> \| null` | Rewinds N entries backward. |
| `fastForward(steps)` | `HistoryEntry<T> \| null` | Advances N entries forward. |
| `jumpTo(entryId)` | `HistoryEntry<T>` | Jumps directly to any node in the graph. |
| `snapshot(name?, metadata?)` | `Snapshot<T>` | Creates a named restore point at the current node. |
| `restore(snapshotId)` | `HistoryEntry<T>` | Restores state to a snapshot. |
| `deleteSnapshot(snapshotId)` | `void` | Removes a snapshot. |
| `getSnapshots()` | `Snapshot<T>[]` | Returns all registered snapshots. |
| `getHistory(options?)` | `HistoryEntry<T>[]` | Returns history entries for current branch or all branches. |
| `getCurrentEntry()` | `HistoryEntry<T>` | Returns the active history entry node. |
| `getBranches()` | `Branch[]` | Returns all timeline branches. |
| `getCurrentBranch()` | `Branch` | Returns the currently active branch. |
| `createBranch(name, fromEntryId?)` | `Branch` | Creates a new named branch. |
| `switchBranch(branchId)` | `HistoryEntry<T>` | Switches active branch to the target branch head. |
| `merge(sourceBranchId, options?)` | `HistoryEntry<T>` | Merges a branch into the active branch. |
| `compare(branchA, branchB)` | `BranchComparison` | Compares two branches (LCA, ahead count, diff). |
| `compact(options?)` | `number` | Prunes intermediate redundant nodes while preserving snapshots. |
| `diff(entryA, entryB?)` | `DiffChange[]` | Calculates structural diff between two entries or states. |
| `export()` | `SerializedHomura<T>` | Exports the entire DAG history to a serializable JSON object. |
| `import(data)` | `void` | Imports and rehydrates a serialized history graph. |
| `save()` | `Promise<void>` | Saves state through configured persistence adapter. |
| `load()` | `Promise<boolean>` | Loads persisted state into engine. |

---

## 11. License & Authors

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

Copyright (c) 2026 Biagio Scaglia & HomuraJS Team.
