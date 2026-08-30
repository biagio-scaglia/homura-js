/**
 * @homura-js/db — Table Engine
 * Copy-On-Write Table Operations & Indexing
 */

import type { DBRecord, PrimaryKey, TableState, QueryFilter, QueryOptions } from './types';

export function createTableState(name: string, primaryKey = 'id'): TableState {
  return {
    name,
    primaryKey,
    rows: {},
    indexes: {},
    autoIncrement: 1
  };
}

export function insertRow<T extends DBRecord>(
  table: TableState<T>,
  row: T
): { table: TableState<T>; inserted: T & { id: PrimaryKey } } {
  let id = row[table.primaryKey as keyof T] as PrimaryKey | undefined;

  let nextAutoInc = table.autoIncrement;
  if (id === undefined || id === null) {
    id = nextAutoInc;
    nextAutoInc += 1;
  } else if (typeof id === 'number' && id >= nextAutoInc) {
    nextAutoInc = id + 1;
  }

  const stringId = String(id);
  if (table.rows[stringId]) {
    throw new Error(`[HomuraDB] Duplicate primary key "${stringId}" in table "${table.name}"`);
  }

  const recordWithId = {
    ...row,
    [table.primaryKey]: id
  } as T & { id: PrimaryKey };

  const updatedRows = {
    ...table.rows,
    [stringId]: recordWithId
  };

  return {
    table: {
      ...table,
      rows: updatedRows,
      autoIncrement: nextAutoInc
    },
    inserted: recordWithId
  };
}

export function updateRows<T extends DBRecord>(
  table: TableState<T>,
  filterOrId: PrimaryKey | QueryFilter<T>,
  updates: Partial<T>
): { table: TableState<T>; updatedCount: number } {
  const updatedRows = { ...table.rows };
  let count = 0;

  if (typeof filterOrId === 'string' || typeof filterOrId === 'number') {
    const stringId = String(filterOrId);
    const existing = updatedRows[stringId];
    if (existing) {
      updatedRows[stringId] = {
        ...existing,
        ...updates,
        [table.primaryKey]: existing[table.primaryKey as keyof T] // Primary key is immutable
      };
      count = 1;
    }
  } else {
    for (const [key, row] of Object.entries(table.rows)) {
      if (matchesFilter(row, filterOrId)) {
        updatedRows[key] = {
          ...row,
          ...updates,
          [table.primaryKey]: row[table.primaryKey as keyof T]
        };
        count++;
      }
    }
  }

  return {
    table: {
      ...table,
      rows: updatedRows
    },
    updatedCount: count
  };
}

export function deleteRows<T extends DBRecord>(
  table: TableState<T>,
  filterOrId: PrimaryKey | QueryFilter<T>
): { table: TableState<T>; deletedCount: number } {
  const updatedRows = { ...table.rows };
  let count = 0;

  if (typeof filterOrId === 'string' || typeof filterOrId === 'number') {
    const stringId = String(filterOrId);
    if (updatedRows[stringId]) {
      delete updatedRows[stringId];
      count = 1;
    }
  } else {
    for (const [key, row] of Object.entries(table.rows)) {
      if (matchesFilter(row, filterOrId)) {
        delete updatedRows[key];
        count++;
      }
    }
  }

  return {
    table: {
      ...table,
      rows: updatedRows
    },
    deletedCount: count
  };
}

export function queryRows<T extends DBRecord>(
  table: TableState<T>,
  filter?: QueryFilter<T>,
  options?: QueryOptions<T>
): T[] {
  let results: T[] = [];

  for (const row of Object.values(table.rows)) {
    if (!filter || matchesFilter(row, filter)) {
      results.push(row);
    }
  }

  // Sort
  if (options?.sort) {
    const sortKeys = Object.keys(options.sort) as (keyof T)[];
    results.sort((a, b) => {
      for (const k of sortKeys) {
        const order = options.sort![k] === 'desc' ? -1 : 1;
        const valA = a[k];
        const valB = b[k];
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
      }
      return 0;
    });
  }

  // Offset & Limit
  if (options?.offset) {
    results = results.slice(options.offset);
  }
  if (options?.limit !== undefined) {
    results = results.slice(0, options.limit);
  }

  return results;
}

function matchesFilter<T extends DBRecord>(row: T, filter: QueryFilter<T>): boolean {
  if (typeof filter === 'function') {
    return filter(row);
  }

  for (const [key, expected] of Object.entries(filter)) {
    const actual = row[key as keyof T];
    if (typeof expected === 'function') {
      if (!(expected as (v: unknown) => boolean)(actual)) return false;
    } else if (actual !== expected) {
      return false;
    }
  }

  return true;
}
