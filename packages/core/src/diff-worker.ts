import { DiffChange } from './types';
import { diffStates } from './diff';

export interface AsyncDiffOptions {
  /** Optional timeout in milliseconds before falling back to sync diff */
  timeoutMs?: number;
  /** Custom base path for the diff */
  basePath?: (string | number)[];
}

/**
 * Worker script code string for inline Blob execution.
 */
const WORKER_CODE = `
function isObj(v) { return v !== null && typeof v === 'object'; }

function diff(oldVal, newVal, path) {
  path = path || [];
  if (Object.is(oldVal, newVal)) return [];
  var changes = [];

  if (!isObj(oldVal) || !isObj(newVal) || Array.isArray(oldVal) !== Array.isArray(newVal)) {
    return [{ path: path, type: 'changed', oldValue: oldVal, newValue: newVal }];
  }

  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    var minLen = Math.min(oldVal.length, newVal.length);
    for (var i = 0; i < minLen; i++) {
      var n = diff(oldVal[i], newVal[i], path.concat([i]));
      for (var j = 0; j < n.length; j++) changes.push(n[j]);
    }
    if (newVal.length > oldVal.length) {
      for (var a = minLen; a < newVal.length; a++) {
        changes.push({ path: path.concat([a]), type: 'added', value: newVal[a] });
      }
    } else if (oldVal.length > newVal.length) {
      for (var r = minLen; r < oldVal.length; r++) {
        changes.push({ path: path.concat([r]), type: 'removed', value: oldVal[r] });
      }
    }
    return changes;
  }

  var oldKeys = Object.keys(oldVal);
  var newKeys = Object.keys(newVal);
  var newSet = new Set(newKeys);
  var oldSet = new Set(oldKeys);

  for (var k = 0; k < oldKeys.length; k++) {
    var key = oldKeys[k];
    var curPath = path.concat([key]);
    if (!newSet.has(key)) {
      changes.push({ path: curPath, type: 'removed', value: oldVal[key] });
    } else {
      var sub = diff(oldVal[key], newVal[key], curPath);
      for (var s = 0; s < sub.length; s++) changes.push(sub[s]);
    }
  }

  for (var m = 0; m < newKeys.length; m++) {
    var nKey = newKeys[m];
    if (!oldSet.has(nKey)) {
      changes.push({ path: path.concat([nKey]), type: 'added', value: newVal[nKey] });
    }
  }

  return changes;
}

self.onmessage = function(e) {
  var id = e.data.id;
  try {
    var result = diff(e.data.oldVal, e.data.newVal, e.data.basePath);
    self.postMessage({ id: id, changes: result, error: null });
  } catch (err) {
    self.postMessage({ id: id, changes: [], error: err ? (err.message || String(err)) : 'Diff worker error' });
  }
};
`;

export class AsyncDiffer {
  private worker: Worker | null = null;
  private messageCounter = 0;
  private pending = new Map<number, { resolve: (res: DiffChange[]) => void; reject: (err: any) => void }>();

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (
      typeof window !== 'undefined' &&
      typeof window.Worker === 'function' &&
      typeof window.Blob === 'function' &&
      typeof window.URL?.createObjectURL === 'function'
    ) {
      try {
        const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        this.worker = new Worker(url);
        URL.revokeObjectURL(url);

        this.worker.onmessage = (event: MessageEvent) => {
          const { id, changes, error } = event.data;
          const handler = this.pending.get(id);
          if (handler) {
            this.pending.delete(id);
            if (error) {
              handler.reject(new Error(error));
            } else {
              handler.resolve(changes || []);
            }
          }
        };

        this.worker.onerror = () => {
          // If worker fails, fallback to sync
          this.terminate();
        };
      } catch {
        this.worker = null;
      }
    }
  }

  /**
   * Computes differences between two states off-thread if WebWorker is supported,
   * otherwise transparently executes synchronously without breaking.
   */
  public async diff(
    oldVal: unknown,
    newVal: unknown,
    options: AsyncDiffOptions = {}
  ): Promise<DiffChange[]> {
    if (!this.worker) {
      return diffStates(oldVal, newVal, options.basePath);
    }

    const id = ++this.messageCounter;
    const timeoutMs = options.timeoutMs ?? 5000;

    return new Promise<DiffChange[]>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        // Fallback to sync on timeout
        try {
          resolve(diffStates(oldVal, newVal, options.basePath));
        } catch (err) {
          reject(err);
        }
      }, timeoutMs);

      this.pending.set(id, {
        resolve: (changes) => {
          clearTimeout(timer);
          resolve(changes);
        },
        reject: (err) => {
          clearTimeout(timer);
          // On worker rejection fallback to sync
          try {
            resolve(diffStates(oldVal, newVal, options.basePath));
          } catch {
            reject(err);
          }
        }
      });

      this.worker!.postMessage({
        id,
        oldVal,
        newVal,
        basePath: options.basePath || []
      });
    });
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    for (const [, handler] of this.pending) {
      handler.resolve([]);
    }
    this.pending.clear();
  }
}

// Singleton async differ instance for quick convenience
let defaultDiffer: AsyncDiffer | null = null;

/**
 * Asynchronously computes structural diff between two states off the UI thread.
 */
export async function diffStatesAsync(
  oldVal: unknown,
  newVal: unknown,
  options: AsyncDiffOptions = {}
): Promise<DiffChange[]> {
  if (!defaultDiffer) {
    defaultDiffer = new AsyncDiffer();
  }
  return defaultDiffer.diff(oldVal, newVal, options);
}

/**
 * Creates a standalone instance of the AsyncDiffer with dedicated Worker lifecycle.
 */
export function createAsyncDiffer(): AsyncDiffer {
  return new AsyncDiffer();
}
