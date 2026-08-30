import { describe, it, expect, beforeEach } from 'vitest';
import { createHomuraDB, HomuraDB } from '../src';

describe('@homura-js/db — Core Operations & Time Travel', () => {
  let db: HomuraDB;

  beforeEach(() => {
    db = createHomuraDB({ name: 'test_store' });
  });

  it('creates tables, inserts rows, and executes query filters', () => {
    db.createTable('users', 'id');
    const u1 = db.insert('users', { name: 'Homura', role: 'Architect', level: 10 });
    const u2 = db.insert('users', { name: 'Madoka', role: 'Guardian', level: 99 });

    expect(u1.id).toBe(1);
    expect(u2.id).toBe(2);

    const found = db.find('users', { role: 'Guardian' });
    expect(found).toHaveLength(1);
    expect(found[0]?.name).toBe('Madoka');

    const byId = db.findById('users', 1);
    expect(byId?.name).toBe('Homura');
  });

  it('executes atomic transactions in a single history node', () => {
    db.createTable('orders');
    db.createTable('inventory');

    const { result, entry } = db.transaction(tx => {
      tx.insert('orders', { id: 'ord_1', total: 150, status: 'pending' });
      tx.insert('inventory', { sku: 'SHIELD-01', stock: 49 });
      return { orderCreated: true };
    }, { label: 'Order Placement Transaction' });

    expect(result.orderCreated).toBe(true);
    expect(entry.label).toBe('Order Placement Transaction');

    const orders = db.find('orders');
    const inv = db.find('inventory');
    expect(orders).toHaveLength(1);
    expect(inv).toHaveLength(1);
  });

  it('performs non-destructive time travel undo and redo on database records', () => {
    db.createTable('products');
    db.insert('products', { id: 'p1', name: 'Original Product', price: 50 });

    db.update('products', 'p1', { price: 75 });
    expect(db.findById('products', 'p1')?.price).toBe(75);

    // Step back
    db.undo();
    expect(db.findById('products', 'p1')?.price).toBe(50);

    // Step forward
    db.redo();
    expect(db.findById('products', 'p1')?.price).toBe(75);
  });

  it('calculates structural diffs between historical database states', () => {
    db.createTable('settings');
    db.insert('settings', { id: 'theme', mode: 'dark', fontSize: 14 });
    const e1 = db.getCore().getCurrentEntry();

    db.update('settings', 'theme', { fontSize: 16, telemetry: false });
    const e2 = db.getCore().getCurrentEntry();

    const diffs = db.diff(e1, e2);
    expect(diffs.length).toBeGreaterThan(0);
    const fontSizeDiff = diffs.find(d => d.path.includes('fontSize'));
    expect(fontSizeDiff).toBeDefined();
    expect(fontSizeDiff?.type).toBe('changed');
  });
});
