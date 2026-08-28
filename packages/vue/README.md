# @homura-js/vue 🟢

Vue 3 Composition API hook and plugin for HomuraJS.

## Installation

```bash
npm install @homura-js/vue @homura-js/core @homura-js/devtools
```

## Quick Start

```vue
<template>
  <div>
    <h1>Count: {{ state.count }}</h1>
    <button @click="increment">+1</button>
    <button @click="undo">Undo</button>
  </div>
</template>

<script setup lang="ts">
import { createHomura } from '@homura-js/core';
import { useHomura } from '@homura-js/vue';

const homura = createHomura({ initialState: { count: 0 } });
const { state, update, undo } = useHomura(homura);

function increment() {
  update(d => { d.count++; });
}
</script>
```

## License

MIT © Biagio Scaglia & HomuraJS Team
