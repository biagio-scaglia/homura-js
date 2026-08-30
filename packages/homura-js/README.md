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
Directed Acyclic Graph (DAG) state management, non-destructive branching, time travel, forensic bug reporting (`.homura`), zero-JS form recovery, and versioned database state.

</div>

---

## Installation

```bash
npm install @biagioscaglia/homurajs
```

`@biagioscaglia/homurajs` is the all-in-one meta-package bundling `@homura-js/core`, `@homura-js/db`, `@homura-js/devtools`, and `@homura-js/vanilla`.

### Standalone Browser CDN
```html
<script src="https://unpkg.com/@biagioscaglia/homurajs/dist/index.global.js"></script>
```

---

## Quick Start

```ts
import { createHomura, mountDevTools } from '@biagioscaglia/homurajs';

const homura = createHomura({
  initialState: { counter: 0, user: 'Homura' }
});

// Mutate via Copy-On-Write draft proxy
homura.update(draft => {
  draft.counter += 10;
}, { label: 'Increment counter' });

// Time travel
homura.undo();
homura.redo();

// Mount diagnostic DevTools (Alt + H)
mountDevTools(homura, { position: 'floating', defaultOpen: true });
```

---

## Zero-JS Static Site Form Engine (`data-homura-*`)

```html
<script src="https://unpkg.com/@biagioscaglia/homurajs/dist/index.global.js"></script>

<form data-homura-form="quote_form" data-homura-persist="localstorage">
  <span data-homura-status></span>
  <div data-homura-breadcrumbs></div>

  <input type="text" name="name" placeholder="Name" />
  <input type="email" name="email" placeholder="Email" />

  <button type="button" data-homura-undo>↩ Undo</button>
  <button type="button" data-homura-redo>↪ Redo</button>
  <button type="submit">Submit</button>
</form>
```

---

## Features

- **Non-Destructive DAG Branching**: Diverge into parallel timeline branches without truncating historical states.
- **Zero-Dependency Draft Proxy**: Mutable ergonomics with guaranteed immutable output and structural sharing.
- **Deep Structural Diffing**: Recursive property-level difference calculation with exact dot-paths.
- **Snapshots & Restore Points**: Named state bookmarks for checkpoints and game saves.
- **Atomic Transactions**: Batch multiple changes into a single history entry.
- **Timeline Replay**: Automated step-by-step playback with configurable speeds.
- **Branch Merging & Diffing**: Compare branches (LCA, commits ahead, diffs) and merge them deterministically.
- **Zero-JS Form Recovery**: Instant undo/redo, crash recovery, and multi-step wizard for static websites & WordPress.
- **Embedded DevTools**: Floating and embedded visual DAG timeline tree and JSON inspector.

---

## License

MIT © Biagio Scaglia & HomuraJS Team
