import { PersistenceAdapter, SerializedHomura } from './types';
import { HomuraPersistenceError } from './errors';
import { deepClone } from './immutability';

/**
 * In-memory persistence adapter for testing and ephemeral caching.
 */
export class MemoryAdapter<T> implements PersistenceAdapter<T> {
  private storage: SerializedHomura<T> | null = null;

  public save(data: SerializedHomura<T>): void {
    this.storage = deepClone(data);
  }

  public load(): SerializedHomura<T> | null {
    return this.storage ? deepClone(this.storage) : null;
  }

  public clear(): void {
    this.storage = null;
  }
}

/**
 * Recursively encodes rich JavaScript objects (Date, Set, Map, RegExp, BigInt, Uint8Array) into JSON-safe representations.
 */
export function serializeRichState(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'bigint') {
      return { __homura_type__: 'BigInt', value: value.toString() };
    }
    return value;
  }

  if (value instanceof Date) {
    return { __homura_type__: 'Date', value: value.toISOString() };
  }

  if (value instanceof RegExp) {
    return { __homura_type__: 'RegExp', source: value.source, flags: value.flags };
  }

  if (value instanceof Set) {
    const items: unknown[] = [];
    for (const item of value) {
      items.push(serializeRichState(item));
    }
    return { __homura_type__: 'Set', value: items };
  }

  if (value instanceof Map) {
    const entries: [unknown, unknown][] = [];
    for (const [k, v] of value) {
      entries.push([serializeRichState(k), serializeRichState(v)]);
    }
    return { __homura_type__: 'Map', value: entries };
  }

  if (value instanceof Uint8Array) {
    return { __homura_type__: 'Uint8Array', value: Array.from(value) };
  }

  if (Array.isArray(value)) {
    return value.map(serializeRichState);
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    result[key] = serializeRichState((value as Record<string, unknown>)[key]);
  }
  return result;
}

/**
 * Recursively restores rich JavaScript objects (Date, Set, Map, RegExp, BigInt, Uint8Array) from JSON representations.
 */
export function deserializeRichState(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deserializeRichState);
  }

  const obj = value as Record<string, any>;
  if (obj.__homura_type__ === 'Date' && typeof obj.value === 'string') {
    return new Date(obj.value);
  }
  if (obj.__homura_type__ === 'RegExp' && typeof obj.source === 'string') {
    return new RegExp(obj.source, obj.flags || '');
  }
  if (obj.__homura_type__ === 'BigInt' && typeof obj.value === 'string') {
    return BigInt(obj.value);
  }
  if (obj.__homura_type__ === 'Set' && Array.isArray(obj.value)) {
    return new Set(obj.value.map(deserializeRichState));
  }
  if (obj.__homura_type__ === 'Map' && Array.isArray(obj.value)) {
    const map = new Map();
    for (const [k, v] of obj.value) {
      map.set(deserializeRichState(k), deserializeRichState(v));
    }
    return map;
  }
  if (obj.__homura_type__ === 'Uint8Array' && Array.isArray(obj.value)) {
    return new Uint8Array(obj.value);
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = deserializeRichState(obj[key]);
  }
  return result;
}

/**
 * LocalStorage persistence adapter for browser environments with rich type support.
 */
export class LocalStorageAdapter<T> implements PersistenceAdapter<T> {
  private key: string;

  constructor(key: string = 'homura_state_history') {
    this.key = key;
  }

  private isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  }

  public save(data: SerializedHomura<T>): void {
    if (!this.isAvailable()) {
      return;
    }
    try {
      const encoded = serializeRichState(data);
      const json = JSON.stringify(encoded);
      window.localStorage.setItem(this.key, json);
    } catch (err) {
      throw new HomuraPersistenceError(
        `Failed to save state to localStorage key "${this.key}"`,
        err
      );
    }
  }

  public load(): SerializedHomura<T> | null {
    if (!this.isAvailable()) {
      return null;
    }
    try {
      const json = window.localStorage.getItem(this.key);
      if (!json) return null;
      const parsed = JSON.parse(json);
      return deserializeRichState(parsed) as SerializedHomura<T>;
    } catch (err) {
      throw new HomuraPersistenceError(
        `Failed to load state from localStorage key "${this.key}"`,
        err
      );
    }
  }

  public clear(): void {
    if (!this.isAvailable()) {
      return;
    }
    try {
      window.localStorage.removeItem(this.key);
    } catch (err) {
      throw new HomuraPersistenceError(
        `Failed to clear localStorage key "${this.key}"`,
        err
      );
    }
  }
}

/**
 * IndexedDB persistence adapter for large-scale enterprise web applications.
 */
export class IndexedDBAdapter<T> implements PersistenceAdapter<T> {
  private dbName: string;
  private storeName: string;
  private key: string;

  constructor(options: { dbName?: string; storeName?: string; key?: string } = {}) {
    this.dbName = options.dbName ?? 'homura_db';
    this.storeName = options.storeName ?? 'homura_store';
    this.key = options.key ?? 'active_state';
  }

  private isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.indexedDB !== 'undefined'
    );
  }

  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        return reject(new HomuraPersistenceError('IndexedDB is not supported in this environment'));
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new HomuraPersistenceError('Failed to open IndexedDB database', request.error));
    });
  }

  public async save(data: SerializedHomura<T>): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(data, this.key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(new HomuraPersistenceError(`Failed to save to IndexedDB [${this.dbName}]`, req.error));
      });
    } catch (err) {
      throw new HomuraPersistenceError(`IndexedDB save failed for key "${this.key}"`, err);
    }
  }

  public async load(): Promise<SerializedHomura<T> | null> {
    if (!this.isAvailable()) return null;
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(this.key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(new HomuraPersistenceError(`Failed to load from IndexedDB [${this.dbName}]`, req.error));
      });
    } catch (err) {
      throw new HomuraPersistenceError(`IndexedDB load failed for key "${this.key}"`, err);
    }
  }

  public async clear(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(this.key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(new HomuraPersistenceError(`Failed to clear IndexedDB [${this.dbName}]`, req.error));
      });
    } catch (err) {
      throw new HomuraPersistenceError(`IndexedDB clear failed for key "${this.key}"`, err);
    }
  }
}

/**
 * Factory helper to create a LocalStorage persistence adapter.
 */
export function createLocalStorageAdapter<T>(key?: string): LocalStorageAdapter<T> {
  return new LocalStorageAdapter<T>(key);
}

/**
 * Factory helper to create an IndexedDB persistence adapter.
 */
export function createIndexedDBAdapter<T>(options?: {
  dbName?: string;
  storeName?: string;
  key?: string;
}): IndexedDBAdapter<T> {
  return new IndexedDBAdapter<T>(options);
}

/**
 * Factory helper to create an in-memory persistence adapter.
 */
export function createMemoryAdapter<T>(): MemoryAdapter<T> {
  return new MemoryAdapter<T>();
}

/**
 * Persistence controller with optional debounced auto-save.
 */
export class PersistenceController<T> {
  private adapter: PersistenceAdapter<T>;
  private autoSave: boolean;
  private debounceMs: number;
  private timer: any = null;

  constructor(
    config?:
      | PersistenceAdapter<T>
      | {
          adapter: PersistenceAdapter<T>;
          autoSave?: boolean;
          debounceMs?: number;
        }
  ) {
    if (!config) {
      this.adapter = new MemoryAdapter<T>();
      this.autoSave = false;
      this.debounceMs = 0;
    } else if ('save' in config && typeof (config as PersistenceAdapter<T>).save === 'function') {
      this.adapter = config as PersistenceAdapter<T>;
      this.autoSave = true;
      this.debounceMs = 100;
    } else {
      const opts = config as {
        adapter: PersistenceAdapter<T>;
        autoSave?: boolean;
        debounceMs?: number;
      };
      this.adapter = opts.adapter;
      this.autoSave = opts.autoSave ?? true;
      this.debounceMs = opts.debounceMs ?? 100;
    }
  }

  public async save(data: SerializedHomura<T>): Promise<void> {
    try {
      await this.adapter.save(data);
    } catch (err) {
      console.error('[HomuraJS] Persistence save error:', err);
    }
  }

  public scheduleAutoSave(getData: () => SerializedHomura<T>): void {
    if (!this.autoSave) return;

    if (this.debounceMs <= 0) {
      void this.save(getData());
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.timer = null;
      void this.save(getData());
    }, this.debounceMs);
  }

  public async load(): Promise<SerializedHomura<T> | null> {
    try {
      return await this.adapter.load();
    } catch (err) {
      console.error('[HomuraJS] Persistence load error:', err);
      return null;
    }
  }

  public async clear(): Promise<void> {
    try {
      await this.adapter.clear();
    } catch (err) {
      console.error('[HomuraJS] Persistence clear error:', err);
    }
  }
}
