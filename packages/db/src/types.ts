/**
 * @homura-js/db — Type Definitions
 * Versioned database state and full-stack forensic state correlation
 */

import type { SerializedHomura } from '@homura-js/core';

export type PrimaryKey = string | number;

export interface DBRecord {
  id?: PrimaryKey;
  [key: string]: unknown;
}

export interface TableState<T extends DBRecord = DBRecord> {
  name: string;
  primaryKey: string;
  rows: Record<string, T>;
  indexes: Record<string, Record<string, string[]>>; // indexName -> indexedValue -> [primaryKey]
  autoIncrement: number;
}

export interface DatabaseState {
  version: number;
  tables: Record<string, TableState>;
  metadata: {
    name: string;
    createdAt: number;
    lastCorrelatedClientId?: string;
  };
}

export type QueryFilter<T extends DBRecord = DBRecord> = {
  [K in keyof T]?: T[K] | ((val: T[K]) => boolean);
} | ((row: T) => boolean);

export interface QueryOptions<T extends DBRecord = DBRecord> {
  sort?: { [K in keyof T]?: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

export interface MutationOptions {
  label?: string;
  clientStateId?: string; // Correlated client-side Homura node ID
  traceId?: string;       // Distributed HTTP/Network Trace ID
  metadata?: Record<string, unknown>;
}

export interface DBTransactionContext {
  insert<T extends DBRecord = DBRecord>(tableName: string, row: T): T & { id: PrimaryKey };
  insertMany<T extends DBRecord = DBRecord>(tableName: string, rows: T[]): (T & { id: PrimaryKey })[];
  update<T extends DBRecord = DBRecord>(tableName: string, filterOrId: PrimaryKey | QueryFilter<T>, updates: Partial<T>): number;
  delete<T extends DBRecord = DBRecord>(tableName: string, filterOrId: PrimaryKey | QueryFilter<T>): number;
  find<T extends DBRecord = DBRecord>(tableName: string, filter?: QueryFilter<T>, options?: QueryOptions<T>): T[];
  findById<T extends DBRecord = DBRecord>(tableName: string, id: PrimaryKey): T | null;
}

export interface NetworkTraceEntry {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  timestamp: number;
  clientStateId?: string;
  dbStateId?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: string;
}

export interface CorrelatedSessionPayload {
  version: string;
  sessionId: string;
  exportedAt: number;
  clientHistory?: SerializedHomura<any>;
  databaseHistory: SerializedHomura<DatabaseState>;
  networkTraces: NetworkTraceEntry[];
  forensicSummary: {
    totalClientNodes: number;
    totalDbNodes: number;
    totalTraces: number;
    reproductionPointId?: string;
  };
}
