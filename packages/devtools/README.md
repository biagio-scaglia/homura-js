# @homura-js/devtools 🛠️

Modern, standalone DevTools UI and bridge for HomuraJS state history graphs.

## Installation

```bash
npm install @homura-js/devtools @homura-js/core
```

## Quick Start

```ts
import { createHomura } from '@homura-js/core';
import { mountDevTools } from '@homura-js/devtools';

const homura = createHomura({ initialState: { count: 0 } });

// Mount floating launcher (Alt + H)
mountDevTools(homura, { position: 'floating', defaultOpen: true });
```

## Features
- **Visual DAG Timeline**
- **Collapsible JSON State Inspector**
- **Side-by-Side & Unified Diff Viewer**
- **Playback & Scrubber HUD**

## License

MIT © Biagio Scaglia & HomuraJS Team
