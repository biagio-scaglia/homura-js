# @homura-js/vanilla 🍦

Vanilla JavaScript DOM helpers and standalone exports for HomuraJS.

## Installation

```bash
npm install @homura-js/vanilla @homura-js/core @homura-js/devtools
```

## Quick Start

```ts
import { createHomura, bindState, mountDevTools } from '@homura-js/vanilla';

const homura = createHomura({ initialState: { count: 0 } });

// Bind to DOM
bindState(homura, { selector: s => s.count, target: '#count' });

// Mount DevTools
mountDevTools(homura, { position: 'floating' });
```

## License

MIT © Biagio Scaglia & HomuraJS Team
