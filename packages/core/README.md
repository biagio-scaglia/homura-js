# @homura-js/core ⏳

Core Directed Acyclic Graph (DAG) state history and time-travel engine for JavaScript and TypeScript ("Git for application state").

## Installation

```bash
npm install @homura-js/core
```

## Quick Start

```ts
import { createHomura } from '@homura-js/core';

const homura = createHomura({
  initialState: { counter: 0 }
});

homura.update(d => { d.counter += 1; }, { label: 'Increment' });
homura.undo();
console.log(homura.getState()); // { counter: 0 }
```

## Documentation

Full documentation and examples: [https://github.com/biagio-scaglia/homura-js](https://github.com/biagio-scaglia/homura-js)

## License

MIT © Biagio Scaglia & HomuraJS Team
