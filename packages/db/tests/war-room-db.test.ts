import { describe, it, expect } from 'vitest';
import { HomuraDB } from '../src/homura-db';
import { createTableState, insertRow } from '../src/table';

describe('War-room DB reliability', () => {
  it('advances autoIncrement past numeric string primary keys', () => {
    const table = createTableState('items');
    const first = insertRow(table, { id: '1', name: 'manual' });
    const second = insertRow(first.table, { name: 'auto' });
    expect(second.inserted.id).toBe(2);
    expect(Object.keys(second.table.rows)).toEqual(['1', '2']);
  });

  it('does not create history for update/delete on missing tables', () => {
    const db = new HomuraDB({ name: 'test' });
    const before = db.getCore().getHistory().length;
    expect(db.update('missing', 1, { x: 1 })).toBe(0);
    expect(db.delete('missing', 1)).toBe(0);
    expect(db.getCore().getHistory().length).toBe(before);
  });

  it('returns inserted row with custom primary key field', () => {
    const db = new HomuraDB({ name: 'users-db' });
    db.createTable('users', 'uuid');
    const row = db.insert('users', { uuid: 'abc', name: 'Ada' });
    expect(row.uuid).toBe('abc');
    expect((row as any).id).toBeUndefined();
  });
});
