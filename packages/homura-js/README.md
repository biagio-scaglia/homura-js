<div align="center">

# @biagioscaglia/homurajs ⏳
### Unified Time Travel State & History Engine for JavaScript

**"Git for application state"**

[![CI Tests](https://img.shields.io/badge/tests-49%2F49%20passed-7c3aed)](https://github.com/biagio-scaglia/homura-js)
[![Version](https://img.shields.io/badge/version-v1.2.1-9333ea)](https://www.npmjs.com/package/@biagioscaglia/homurajs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-581c87)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-3b0764)](LICENSE)
[![NPM](https://img.shields.io/badge/npm-%40biagioscaglia%2Fhomurajs-a855f7)](https://www.npmjs.com/package/@biagioscaglia/homurajs)

</div>

---

## Installation

```bash
npm install @biagioscaglia/homurajs
```

`@biagioscaglia/homurajs` is the all-in-one meta-package including `@homura-js/core`, `@homura-js/devtools`, and `@homura-js/vanilla`.

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

## Features

- **Non-Destructive DAG Branching**: Diverge into parallel timeline branches without truncating historical states.
- **Zero-Dependency Draft Proxy**: Mutable ergonomics with guaranteed immutable output and structural sharing.
- **Deep Structural Diffing**: Recursive property-level difference calculation with exact dot-paths.
- **Snapshots & Restore Points**: Named state bookmarks for checkpoints and game saves.
- **Atomic Transactions**: Batch multiple changes into a single history entry.
- **Timeline Replay**: Automated step-by-step playback with configurable speeds.
- **Branch Merging & Diffing**: Compare branches (LCA, commits ahead, diffs) and merge them deterministically.
- **Compaction & Persistence**: Memory pruning with `compact()`, plus `LocalStorage` and `IndexedDB` adapters.
- **Embedded DevTools UI**: Visual graph tree, JSON state inspector, diff viewer, and HUD playback controls.

---

## License

MIT © Biagio Scaglia & HomuraJS Team
