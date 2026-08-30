<div align="center">

<p align="center">
  <img src="https://raw.githubusercontent.com/biagio-scaglia/homura-js/main/assets/homura-banner.png" alt="HomuraJS — Reproducible State History Across the Full Stack" width="100%" />
</p>

[![CI Tests](https://img.shields.io/badge/tests-59%2F59%20passed-7c3aed)](https://github.com/biagio-scaglia/homura-js)
[![Version](https://img.shields.io/badge/version-v1.2.6-9333ea)](https://www.npmjs.com/package/@biagioscaglia/homurajs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-581c87)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-3b0764)](LICENSE)
[![NPM](https://img.shields.io/badge/npm-%40biagioscaglia%2Fhomurajs-a855f7)](https://www.npmjs.com/package/@biagioscaglia/homurajs)

**Reproducible state history across the full stack.**
Non-destructive DAG branching, time travel, forensic bug reporting (`.homura`), zero-JS form recovery, and versioned database state.

[Documentation Portal](https://biagio-scaglia.github.io/homura-js/) &nbsp;•&nbsp; [GitHub Repository](https://github.com/biagio-scaglia/homura-js) &nbsp;•&nbsp; [WordPress Plugin](https://wordpress.org/plugins/homura-time-travel-form-recovery/)

</div>

---

## 1. What is HomuraJS?

**HomuraJS** is a reproducible state history and time-travel infrastructure for JavaScript, TypeScript, and Full-Stack applications.

Instead of conventional 1D linear undo/redo stacks that destroy future history, HomuraJS models every mutation as an immutable node in a **Directed Acyclic Graph (DAG)**.

```text
Traditional 1D Stack (Destructive)
A ───▶ B ───▶ C ──(undo to A)──▶ D    (B and C are permanently lost)

HomuraJS Directed Acyclic Graph (Non-Destructive)
A ───▶ B ───▶ C
 └───▶ D ───▶ E                        (All timeline branches are preserved)
```

---

## 2. The Grand Unified Architecture

HomuraJS unifies state evolution from the client browser down to the database:

```text
                        HOMURA
                           │
                  ┌────────┴────────┐
                  │                 │
            Application          Database
               State               State
            (#node_184)         (#db_node_52)
                  │                 │
                  └───────┬─────────┘
                          │
                     Network Trace
                     (POST /api/...)
                          │
                          ▼
                .homura Forensic Session
```

---

## 3. Package Architecture

HomuraJS is structured as a modular TypeScript monorepo with zero external dependencies in the core:

| Package | Description |
| :--- | :--- |
| **`@homura-js/core`** | Core DAG engine: Copy-On-Write Proxy immutability, structural diffing, snapshot registry, and middleware pipeline. |
| **`@homura-js/db`** | Versioned database state engine (SQLite / In-Memory) and full-stack causal state correlation (UI ↔ Network ↔ DB). |
| **`@homura-js/devtools`** | Embedded diagnostic GUI: Interactive DAG timeline tree, JSON state inspector, diff scrubber, and playback controls. |
| **`@homura-js/vanilla`** | Lightweight reactive DOM binding (`bindState`) and Zero-JS declarative form recovery engine (`bindForm`, `data-homura-form`). |
| **`@homura-js/react`** | React 18+ integration with `useSyncExternalStore` and selector optimization to eliminate unnecessary re-renders. |
| **`@homura-js/vue`** | Vue 3 integration via Composition API (`useHomura`) and dedicated plugin. |
| **`@biagioscaglia/homurajs`** | Unified meta-package providing all modules in a single dependency + Standalone Browser CDN bundle. |

---

## 4. Installation

### Unified Meta-Package (Recommended)
```bash
npm install @biagioscaglia/homurajs
# or
pnpm add @biagioscaglia/homurajs
```

### Modular Packages
```bash
# Core DAG Engine
npm install @homura-js/core

# Versioned Database & Full-Stack Forensics
npm install @homura-js/db

# React 18+ integration & DevTools
npm install @homura-js/core @homura-js/react @homura-js/devtools

# Vue 3 integration & DevTools
npm install @homura-js/core @homura-js/vue @homura-js/devtools

# Vanilla DOM & Static Forms
npm install @homura-js/vanilla
```

### Standalone Browser CDN Tag (Zero Build Tools)
```html
<script src="https://unpkg.com/@biagioscaglia/homurajs/dist/index.global.js"></script>
```

---

## 5. Quick Start

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

## 6. Full-Stack State Correlation & Forensic Bug Reporting (`.homura`)

Debug application state like you debug source code. Export entire DAG timelines from production or QA sessions and replay them step-by-step on any developer machine:

```ts
import { createHomura } from '@homura-js/core';
import { createHomuraDB, createForensicRecorder } from '@homura-js/db';

// 1. Client State
const clientHomura = createHomura({ initialState: { cart: ['shield_01'] } });

// 2. Versioned Database State
const db = createHomuraDB({ name: 'store_db' });
db.createTable('orders');

// 3. Full-Stack Recorder
const recorder = createForensicRecorder({ clientHomura, db });

// Record network interaction linking UI state to DB transaction
recorder.recordNetworkTrace({
  url: '/api/checkout',
  method: 'POST',
  statusCode: 200,
  requestBody: { items: ['shield_01'] }
});

db.transaction(tx => {
  tx.insert('orders', { id: 'ord_99', total: 250 });
}, {
  label: 'Checkout Transaction',
  clientStateId: clientHomura.getCurrentEntry().id
});

// 4. Export full forensic report
const sessionJSON = recorder.exportJSON();
// sessionJSON contains: Client UI DAG + Network Trace Timeline + Database Mutation DAG
```

---

## 7. Versioned Database State (`@homura-js/db`)

```ts
import { createHomuraDB } from '@homura-js/db';

const db = createHomuraDB({ name: 'production_store' });

// Create tables and insert records
db.createTable('users', 'id');
db.insert('users', { name: 'Homura', role: 'Architect' });

// Atomic transactions in a single history node
db.transaction(tx => {
  tx.insert('orders', { id: 'ord_1', total: 120 });
  tx.update('users', 1, { lastPurchase: 'ord_1' });
}, { label: 'Checkout Transaction' });

// Non-destructive time travel
db.undo(); // Rollback transaction
db.redo(); // Advance back to committed state

// Branching on database state
const branch = db.createBranch('experimental_pricing');
db.switchBranch(branch.id);
db.update('orders', 'ord_1', { total: 99 });
```

---

## 8. Zero-JS Static Site Form Engine (`data-homura-*`)

Turn any static HTML form (Webflow, Shopify, Squarespace, Static HTML) into a crash-resilient time-travel form without writing JavaScript:

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

---

## 9. WordPress & WooCommerce Integration

HomuraJS provides an official WordPress plugin located in [`examples/wordpress-plugin`](examples/wordpress-plugin/):

* **Zero Data Loss**: Prevents form abandonment across page refreshes and tab closures.
* **Auto-Hooks**: Automatically protects WooCommerce Checkout (`.woocommerce-checkout`), Contact Form 7 (`.wpcf7 form`), WPForms (`.wpforms-form`), Gravity Forms (`.gform_wrapper`), and Elementor Forms (`.elementor-form`).
* **Shortcodes**:
  * `[homura_form id="my_form" persist="localstorage"] ... [/homura_form]`
  * `[homura_undo form="my_form" label="↩ Undo"]`
  * `[homura_redo form="my_form" label="↪ Redo"]`
  * `[homura_status form="my_form"]`
  * `[homura_breadcrumbs form="my_form"]`
  * `[homura_wizard id="my_wizard"]`

---

## 10. Embedded Diagnostic DevTools

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
* **Playback Controls**: Step-by-step time scrubbing and automated replay.

---

## 11. Framework Integrations

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

## 12. Reproducible Benchmarks

All performance metrics can be verified locally on your machine:

```bash
git clone https://github.com/biagio-scaglia/homura-js.git
cd homura-js && pnpm install
pnpm run bench
```

| Operation | Throughput | Latency (10,000 Nodes) | Complexity |
| :--- | :--- | :--- | :--- |
| **Node Mutation (Proxy Commit)** | `~185,000 ops/sec` | `0.005 ms` | $O(k)$ modified keys |
| **DAG Timeline Jump (`jumpTo`)** | `~420,000 ops/sec` | `0.002 ms` | $O(1)$ Hash Map Lookup |
| **Deep Structural Diff (500 keys)**| `~95,000 ops/sec` | `0.010 ms` | $O(n)$ tree diff |
| **3-Way Branch Merge** | `~205 ops/sec` | `4.87 ms` | $O(n)$ recursive 3-way |

---

## 13. License & Authors

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

Copyright (c) 2026 Biagio Scaglia & HomuraJS Team.
