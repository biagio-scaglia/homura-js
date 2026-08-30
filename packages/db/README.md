# @homura-js/db 🗄️

> Versioned Database State & Full-Stack Forensic State Correlation for HomuraJS

`@homura-js/db` brings the Directed Acyclic Graph (DAG) time-travel architecture of HomuraJS to persistent and embedded database state.

---

## 🌟 Key Features

1. **Versioned Database State**: Every table insert, update, and delete is recorded as an immutable node in a state DAG.
2. **Reproducible Time-Travel**: `checkout()`, `undo()`, `redo()`, and `diff()` across database states.
3. **Branching & 3-Way Merging**: Fork alternative schema or data branches and reconcile them safely.
4. **Full-Stack State Correlation**: Seamlessly correlate client UI states (`node_client_184`), network requests, and database transactions (`db_node_52`) into a unified forensic bug report (`session.homura`).

---

## 📦 Installation

```bash
npm install @homura-js/db @homura-js/core
# or
pnpm add @homura-js/db @homura-js/core
```

---

## ⚡ Quick Start

```ts
import { createHomuraDB } from '@homura-js/db';

const db = createHomuraDB({ name: 'production_store' });

// 1. Create tables and insert records
db.createTable('users', 'id');
db.insert('users', { name: 'Homura', role: 'Architect' });

// 2. Atomic transactions
db.transaction(tx => {
  tx.insert('orders', { id: 'ord_1', total: 120 });
  tx.update('users', 1, { lastPurchase: 'ord_1' });
}, { label: 'Checkout Transaction' });

// 3. Time travel
db.undo(); // Rollback transaction
db.redo(); // Advance back to committed state

// 4. Branching
const branch = db.createBranch('experimental_pricing');
db.switchBranch(branch.id);
db.update('orders', 'ord_1', { total: 99 });
```

---

## 🔗 Full-Stack State Correlation

```ts
import { createForensicRecorder } from '@homura-js/db';

const recorder = createForensicRecorder({
  clientHomura, // Client-side Homura instance
  db            // HomuraDB instance
});

// Record API trace linking client action to DB state
recorder.recordNetworkTrace({
  url: '/api/orders',
  method: 'POST',
  statusCode: 200,
  requestBody: { items: ['item_1'] }
});

// Export unified full-stack bug report
const sessionData = recorder.exportJSON();
```

---

## 📄 License

MIT © Biagio Scaglia
