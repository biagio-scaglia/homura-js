import { describe, it, expect } from 'vitest';
import { createHomura } from '@homura-js/core';
import { createHomuraDB, createForensicRecorder } from '../src';

describe('@homura-js/db — Full-Stack Forensic State Correlation', () => {
  it('correlates client-side UI mutations with database mutations and network traces', () => {
    // 1. Client State
    const clientHomura = createHomura({
      initialState: { cart: [] as string[], user: 'Homura' }
    });
    clientHomura.update(d => { d.cart.push('item_1'); }, { label: 'Add Item to Cart' });
    const clientNode = clientHomura.getCurrentEntry();

    // 2. Database State
    const db = createHomuraDB({ name: 'store_db' });
    db.createTable('orders');

    // 3. Full-Stack Forensic Recorder
    const recorder = createForensicRecorder({
      sessionId: 'test_session_001',
      clientHomura,
      db
    });

    // Record Network Trace + Correlated DB Transaction
    const trace = recorder.recordNetworkTrace({
      url: '/api/checkout',
      method: 'POST',
      statusCode: 200,
      clientStateId: clientNode.id,
      requestBody: { cart: ['item_1'] },
      responseBody: { orderId: 'ord_99' }
    });

    db.transaction(tx => {
      tx.insert('orders', { id: 'ord_99', user: 'Homura', items: ['item_1'], total: 99 });
    }, {
      label: 'Create Order #99',
      clientStateId: clientNode.id,
      traceId: trace.id
    });

    // 4. Export Full-Stack Forensic Session
    const session = recorder.exportFullStackSession();
    expect(session.sessionId).toBe('test_session_001');
    expect(Object.keys(session.clientHistory?.entries || {}).length).toBeGreaterThan(0);
    expect(Object.keys(session.databaseHistory.entries).length).toBeGreaterThan(0);
    expect(session.networkTraces).toHaveLength(1);
    expect(session.networkTraces[0]?.clientStateId).toBe(clientNode.id);

    // 5. Serialize and Re-import into a clean environment
    const json = recorder.exportJSON();
    const cleanDb = createHomuraDB();
    const cleanClient = createHomura({ initialState: {} });
    const cleanRecorder = createForensicRecorder({ db: cleanDb, clientHomura: cleanClient });

    cleanRecorder.importFullStackSession(json);
    expect(cleanRecorder.getTraces()).toHaveLength(1);
    expect(cleanDb.findById('orders', 'ord_99')?.total).toBe(99);
  });
});
