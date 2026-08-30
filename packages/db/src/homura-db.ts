/**
 * @homura-js/db — Core Database Class
 * Directed Acyclic Graph Versioned Database Engine
 */

import {
  createHomura,
  type Homura,
  type HistoryEntry,
  type Branch,
  type Snapshot,
  type DiffChange,
  type SerializedHomura
} from '@homura-js/core';
import type {
  DatabaseState,
  TableState,
  DBRecord,
  PrimaryKey,
  MutationOptions,
  QueryFilter,
  QueryOptions,
  DBTransactionContext
} from './types';
import { createTableState, insertRow, updateRows, deleteRows, queryRows } from './table';

export interface HomuraDBOptions {
  name?: string;
  maxHistory?: number;
  initialTables?: string[];
}

export class HomuraDB {
  private homura: Homura<DatabaseState>;

  constructor(options: HomuraDBOptions = {}) {
    const initialTables: Record<string, ReturnType<typeof createTableState>> = {};
    if (options.initialTables) {
      for (const t of options.initialTables) {
        initialTables[t] = createTableState(t);
      }
    }

    const initialState: DatabaseState = {
      version: 1,
      tables: initialTables,
      metadata: {
        name: options.name || 'homura_db',
        createdAt: Date.now()
      }
    };

    this.homura = createHomura<DatabaseState>({
      initialState,
      maxHistory: options.maxHistory || 10000
    });
  }

  /**
   * Returns underlying Homura state core instance
   */
  public getCore(): Homura<DatabaseState> {
    return this.homura;
  }

  /**
   * Creates a new table if it does not exist
   */
  public createTable(name: string, primaryKey = 'id', options: MutationOptions = {}): void {
    const currentState = this.homura.getState();
    if (currentState.tables[name]) {
      return;
    }

    this.homura.update(draft => {
      draft.tables[name] = createTableState(name, primaryKey);
    }, {
      label: options.label || `CREATE TABLE ${name}`,
      metadata: {
        operation: 'createTable',
        table: name,
        clientStateId: options.clientStateId,
        traceId: options.traceId,
        ...options.metadata
      }
    });
  }

  /**
   * Inserts a record into a table
   */
  public insert<T extends DBRecord>(
    tableName: string,
    row: T,
    options: MutationOptions = {}
  ): T & { id: PrimaryKey } {
    let insertedRecord: (T & { id: PrimaryKey }) | null = null;

    this.homura.update(draft => {
      let table = draft.tables[tableName];
      if (!table) {
        table = createTableState(tableName);
        draft.tables[tableName] = table;
      }

      const res = insertRow<T>(table as any, row);
      draft.tables[tableName] = res.table as any;
      insertedRecord = res.inserted;
      if (options.clientStateId) {
        draft.metadata.lastCorrelatedClientId = options.clientStateId;
      }
    }, {
      label: options.label || `INSERT INTO ${tableName}`,
      metadata: {
        operation: 'insert',
        table: tableName,
        clientStateId: options.clientStateId,
        traceId: options.traceId,
        ...options.metadata
      }
    });

    return insertedRecord!;
  }

  /**
   * Updates rows matching filter or primary key
   */
  public update<T extends DBRecord>(
    tableName: string,
    filterOrId: PrimaryKey | QueryFilter<T>,
    updates: Partial<T>,
    options: MutationOptions = {}
  ): number {
    let updatedCount = 0;

    this.homura.update(draft => {
      const table = draft.tables[tableName];
      if (!table) return;

      const res = updateRows(table as any, filterOrId as any, updates);
      draft.tables[tableName] = res.table;
      updatedCount = res.updatedCount;
      if (options.clientStateId) {
        draft.metadata.lastCorrelatedClientId = options.clientStateId;
      }
    }, {
      label: options.label || `UPDATE ${tableName}`,
      metadata: {
        operation: 'update',
        table: tableName,
        clientStateId: options.clientStateId,
        traceId: options.traceId,
        ...options.metadata
      }
    });

    return updatedCount;
  }

  /**
   * Deletes rows matching filter or primary key
   */
  public delete<T extends DBRecord>(
    tableName: string,
    filterOrId: PrimaryKey | QueryFilter<T>,
    options: MutationOptions = {}
  ): number {
    let deletedCount = 0;

    this.homura.update(draft => {
      const table = draft.tables[tableName];
      if (!table) return;

      const res = deleteRows(table as any, filterOrId as any);
      draft.tables[tableName] = res.table;
      deletedCount = res.deletedCount;
      if (options.clientStateId) {
        draft.metadata.lastCorrelatedClientId = options.clientStateId;
      }
    }, {
      label: options.label || `DELETE FROM ${tableName}`,
      metadata: {
        operation: 'delete',
        table: tableName,
        clientStateId: options.clientStateId,
        traceId: options.traceId,
        ...options.metadata
      }
    });

    return deletedCount;
  }

  /**
   * Queries records in a table
   */
  public find<T extends DBRecord>(
    tableName: string,
    filter?: QueryFilter<T>,
    options?: QueryOptions<T>
  ): T[] {
    const state = this.homura.getState();
    const table = state.tables[tableName];
    if (!table) return [];

    return queryRows(table as any, filter, options);
  }

  /**
   * Finds a single record by primary key
   */
  public findById<T extends DBRecord>(tableName: string, id: PrimaryKey): T | null {
    const state = this.homura.getState();
    const table = state.tables[tableName];
    if (!table) return null;

    return (table.rows[String(id)] as T) || null;
  }

  /**
   * Atomic Transaction batching multiple operations into a single DAG node
   */
  public transaction<R>(
    fn: (tx: DBTransactionContext) => R,
    options: MutationOptions = {}
  ): { result: R; entry: HistoryEntry<DatabaseState> } {
    let transactionResult: R;

    const entry = this.homura.transaction(draft => {
      const txContext: DBTransactionContext = {
        insert: <T extends DBRecord>(tableName: string, row: T) => {
          let table = draft.tables[tableName];
          if (!table) {
            table = createTableState(tableName);
            draft.tables[tableName] = table;
          }
          const res = insertRow<T>(table as any, row);
          draft.tables[tableName] = res.table as any;
          return res.inserted;
        },
        insertMany: <T extends DBRecord>(tableName: string, rows: T[]) => {
          let currentTable: TableState = draft.tables[tableName] ?? createTableState(tableName);
          const inserted: (T & { id: PrimaryKey })[] = [];
          for (const r of rows) {
            const res = insertRow<T>(currentTable as any, r);
            currentTable = res.table as any;
            inserted.push(res.inserted);
          }
          draft.tables[tableName] = currentTable;
          return inserted;
        },
        update: (tableName, filterOrId, updates) => {
          const table = draft.tables[tableName];
          if (!table) return 0;
          const res = updateRows(table as any, filterOrId as any, updates);
          draft.tables[tableName] = res.table;
          return res.updatedCount;
        },
        delete: (tableName, filterOrId) => {
          const table = draft.tables[tableName];
          if (!table) return 0;
          const res = deleteRows(table as any, filterOrId as any);
          draft.tables[tableName] = res.table;
          return res.deletedCount;
        },
        find: (tableName, filter, opts) => {
          const table = draft.tables[tableName];
          if (!table) return [];
          return queryRows(table as any, filter, opts);
        },
        findById: (tableName, id) => {
          const table = draft.tables[tableName];
          if (!table) return null;
          return (table.rows[String(id)] as any) || null;
        }
      };

      transactionResult = fn(txContext);
      if (options.clientStateId) {
        draft.metadata.lastCorrelatedClientId = options.clientStateId;
      }
    }, {
      label: options.label || 'BEGIN TRANSACTION',
      metadata: {
        operation: 'transaction',
        clientStateId: options.clientStateId,
        traceId: options.traceId,
        ...options.metadata
      }
    });

    return {
      result: transactionResult!,
      entry
    };
  }

  /**
   * Time Travel: Check out any historical DB snapshot node or branch
   */
  public checkout(nodeIdOrBranchName: string): HistoryEntry<DatabaseState> | null {
    const branches = this.homura.getBranches();
    const matchingBranch = branches.find(b => b.name === nodeIdOrBranchName || b.id === nodeIdOrBranchName);

    if (matchingBranch) {
      this.homura.switchBranch(matchingBranch.id);
      return this.homura.getCurrentEntry();
    }

    return this.homura.jumpTo(nodeIdOrBranchName);
  }

  public undo(): HistoryEntry<DatabaseState> | null {
    return this.homura.undo();
  }

  public redo(): HistoryEntry<DatabaseState> | null {
    return this.homura.redo();
  }

  public createBranch(name: string, fromEntryId?: string): Branch {
    return this.homura.createBranch(name, fromEntryId);
  }

  public switchBranch(nameOrId: string): HistoryEntry<DatabaseState> {
    return this.homura.switchBranch(nameOrId);
  }

  public merge(sourceBranchId: string, options?: { strategy?: 'theirs' | 'ours' | 'manual' }): HistoryEntry<DatabaseState> {
    return this.homura.merge(sourceBranchId, options);
  }

  public diff(entryA: string | HistoryEntry<DatabaseState>, entryB?: string | HistoryEntry<DatabaseState>): DiffChange[] {
    return this.homura.diff(entryA, entryB);
  }

  public snapshot(name?: string, metadata?: Record<string, unknown>): Snapshot<DatabaseState> {
    return this.homura.snapshot(name, metadata);
  }

  public async replay(options?: { speed?: number; stepDelayMs?: number; onStep?: (entry: HistoryEntry<DatabaseState>, step: number, total: number) => void }): Promise<void> {
    return this.homura.replay(options);
  }

  public export(): SerializedHomura<DatabaseState> {
    return this.homura.export();
  }

  public import(serializedData: SerializedHomura<DatabaseState> | string): void {
    const parsed = typeof serializedData === 'string' ? JSON.parse(serializedData) : serializedData;
    this.homura.import(parsed);
  }
}

export function createHomuraDB(options?: HomuraDBOptions): HomuraDB {
  return new HomuraDB(options);
}
