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
 * LocalStorage persistence adapter for browser environments.
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
      const json = JSON.stringify(data);
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
      return JSON.parse(json) as SerializedHomura<T>;
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
