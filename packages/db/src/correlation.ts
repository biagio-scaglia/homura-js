/**
 * @homura-js/db — Full-Stack Forensic State Correlation
 * Unifies Client Application State, HTTP Network Traces, and Database State DAGs
 */

import type { Homura } from '@homura-js/core';
import type { HomuraDB } from './homura-db';
import type { NetworkTraceEntry, CorrelatedSessionPayload } from './types';

export interface ForensicRecorderOptions {
  sessionId?: string;
  clientHomura?: Homura<any>;
  db: HomuraDB;
}

export class CorrelatedForensicRecorder {
  public readonly sessionId: string;
  private clientHomura?: Homura<any>;
  private db: HomuraDB;
  private networkTraces: NetworkTraceEntry[] = [];

  constructor(options: ForensicRecorderOptions) {
    this.sessionId = options.sessionId || `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    this.clientHomura = options.clientHomura;
    this.db = options.db;
  }

  /**
   * Attaches or updates the client-side Homura state instance
   */
  public attachClient(clientHomura: Homura<any>): void {
    this.clientHomura = clientHomura;
  }

  /**
   * Records an HTTP/API request correlating client state and database state
   */
  public recordNetworkTrace(trace: Omit<NetworkTraceEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): NetworkTraceEntry {
    const fullTrace: NetworkTraceEntry = {
      id: trace.id || `trace-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: trace.timestamp || Date.now(),
      clientStateId: trace.clientStateId || this.clientHomura?.getCurrentEntry()?.id,
      dbStateId: trace.dbStateId || this.db.getCore().getCurrentEntry()?.id,
      ...trace
    };

    this.networkTraces.push(fullTrace);
    return fullTrace;
  }

  /**
   * Returns all recorded network trace entries
   */
  public getTraces(): NetworkTraceEntry[] {
    return [...this.networkTraces];
  }

  /**
   * Generates a unified full-stack forensic session payload (.homura)
   */
  public exportFullStackSession(reproductionPointId?: string): CorrelatedSessionPayload {
    const clientHistory = this.clientHomura ? this.clientHomura.export() : undefined;
    const databaseHistory = this.db.getCore().export();

    return {
      version: '1.3.0',
      sessionId: this.sessionId,
      exportedAt: Date.now(),
      clientHistory,
      databaseHistory,
      networkTraces: [...this.networkTraces],
      forensicSummary: {
        totalClientNodes: clientHistory ? Object.keys(clientHistory.entries).length : 0,
        totalDbNodes: Object.keys(databaseHistory.entries).length,
        totalTraces: this.networkTraces.length,
        reproductionPointId: reproductionPointId || clientHistory?.currentEntryId || databaseHistory.currentEntryId
      }
    };
  }

  /**
   * Exports session payload as serialized JSON string
   */
  public exportJSON(reproductionPointId?: string): string {
    return JSON.stringify(this.exportFullStackSession(reproductionPointId), null, 2);
  }

  /**
   * Imports a correlated session payload into client Homura and HomuraDB instances
   */
  public importFullStackSession(payload: CorrelatedSessionPayload | string): void {
    const data: CorrelatedSessionPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;

    if (data.databaseHistory) {
      this.db.getCore().import(data.databaseHistory);
    }

    if (data.clientHistory && this.clientHomura) {
      this.clientHomura.import(data.clientHistory);
    }

    if (data.networkTraces) {
      this.networkTraces = [...data.networkTraces];
    }
  }
}

export function createForensicRecorder(options: ForensicRecorderOptions): CorrelatedForensicRecorder {
  return new CorrelatedForensicRecorder(options);
}
