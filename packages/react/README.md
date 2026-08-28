# @homura-js/react ⚛️

React 18+ Integration for HomuraJS Time Travel State Engine with `useSyncExternalStore` and selector optimization.

## Installation

```bash
npm install @homura-js/react @homura-js/core @homura-js/devtools
```

## Quick Start

```tsx
import { createHomura } from '@homura-js/core';
import { useHomura, HomuraDevTools } from '@homura-js/react';

const homura = createHomura({ initialState: { count: 0 } });

export function Counter() {
  const { state: count, update, undo, redo } = useHomura(homura, s => s.count);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => update(d => { d.count++; })}>+1</button>
      <button onClick={() => undo()}>Undo</button>
      <HomuraDevTools homura={homura} position="floating" />
    </div>
  );
}
```

## License

MIT © Biagio Scaglia & HomuraJS Team
