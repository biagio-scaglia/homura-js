/**
 * Checks if a value is a plain JavaScript object or array.
 */
export function isObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object';
}

/**
 * Checks if a value is a plain object (not Date, RegExp, Map, Set, Array, etc.)
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  if (!isObject(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deeply clones a state value.
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Handle native structuredClone if available and safe
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // Fallback if structuredClone fails on functions/symbols
    }
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as unknown as T;
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    for (let i = 0; i < value.length; i++) {
      copy[i] = deepClone(value[i]);
    }
    return copy as unknown as T;
  }

  if (value instanceof Set) {
    const copy = new Set();
    for (const item of value) {
      copy.add(deepClone(item));
    }
    return copy as unknown as T;
  }

  if (value instanceof Map) {
    const copy = new Map();
    for (const [k, v] of value) {
      copy.set(deepClone(k), deepClone(v));
    }
    return copy as unknown as T;
  }

  if (isPlainObject(value)) {
    const copy: Record<string, any> = {};
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]!;
      copy[k] = deepClone((value as Record<string, any>)[k]);
    }
    return copy as unknown as T;
  }

  return value;
}

/**
 * Deep equality comparison between two values.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  if (a.constructor !== b.constructor) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      let found = false;
      for (const other of b) {
        if (deepEqual(item, other)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      let found = false;
      for (const [otherKey, otherValue] of b) {
        if (deepEqual(key, otherKey) && deepEqual(value, otherValue)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]!;
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Recursively freezes a value to prevent accidental mutation of published state.
 */
export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  if (value instanceof Date || value instanceof RegExp) {
    return Object.freeze(value);
  }

  if (value instanceof Set) {
    for (const item of value) {
      deepFreeze(item);
    }
    return Object.freeze(value);
  }

  if (value instanceof Map) {
    for (const [k, v] of value) {
      deepFreeze(k);
      deepFreeze(v);
    }
    return Object.freeze(value);
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    const record = value as Record<string | number, unknown>;
    for (const key of Object.keys(record)) {
      deepFreeze(record[key]);
    }
  }

  return Object.freeze(value);
}

/**
 * Internal symbol for tracking draft proxies.
 */
const DRAFT_STATE = Symbol('HOMURA_DRAFT_STATE');

interface ProxyState<T = any> {
  base: T;
  copy: T | null;
  modified: boolean;
  proxies: Map<string | number | symbol, any>;
  parent: ProxyState | null;
  keyInParent: string | number | symbol | null;
}

/**
 * Creates a Copy-On-Write draft proxy for zero-dependency immutable state updates.
 */
export function createDraft<T>(baseState: T): {
  draft: T;
  finishDraft: () => { nextState: T; modified: boolean };
} {
  if (!isObject(baseState)) {
    let scalarValue = baseState;
    return {
      get draft() {
        return scalarValue;
      },
      finishDraft: () => ({ nextState: scalarValue, modified: false })
    };
  }

  // Frozen published state cannot be used as a Proxy target (invariant violations on get/set).
  // Draft against a mutable clone while still returning the original reference when unmodified.
  const publishedBase = baseState;
  const workingBase = Object.isFrozen(baseState) ? deepClone(baseState) : baseState;

  function markModified(state: ProxyState): void {
    if (!state.modified) {
      state.modified = true;
      if (!state.copy) {
        state.copy = Array.isArray(state.base)
          ? [...state.base]
          : ({ ...state.base } as any);
      }
      if (state.parent) {
        markModified(state.parent);
        if (state.keyInParent !== null && state.parent.copy) {
          (state.parent.copy as any)[state.keyInParent] = state.copy;
        }
      }
    }
  }

  function createProxy<O extends object>(
    base: O,
    parent: ProxyState | null,
    keyInParent: string | number | symbol | null
  ): O {
    const state: ProxyState = {
      base,
      copy: null,
      modified: false,
      proxies: new Map(),
      parent,
      keyInParent
    };

    const proxy = new Proxy(base, {
      get(target, prop, receiver) {
        if (prop === DRAFT_STATE) {
          return state;
        }

        const source = state.modified && state.copy ? state.copy : target;
        const value = Reflect.get(source, prop, receiver);

        if (typeof prop === 'symbol') {
          return value;
        }

        if (isObject(value)) {
          if (!state.proxies.has(prop)) {
            const childProxy = createProxy(value, state, prop);
            state.proxies.set(prop, childProxy);
          }
          return state.proxies.get(prop);
        }

        return value;
      },

      set(_target, prop, value, _receiver) {
        markModified(state);
        const targetObj = state.copy!;
        const currentVal = (targetObj as any)[prop];

        if (currentVal !== value) {
          (targetObj as any)[prop] = value;
          state.proxies.delete(prop);
        }

        return true;
      },

      deleteProperty(_target, prop) {
        markModified(state);
        const targetObj = state.copy!;
        delete (targetObj as any)[prop];
        state.proxies.delete(prop);
        return true;
      },

      has(target, prop) {
        const source = state.modified && state.copy ? state.copy : target;
        return Reflect.has(source, prop);
      },

      ownKeys(target) {
        const source = state.modified && state.copy ? state.copy : target;
        return Reflect.ownKeys(source);
      },

      getOwnPropertyDescriptor(target, prop) {
        const source = state.modified && state.copy ? state.copy : target;
        const desc = Reflect.getOwnPropertyDescriptor(source, prop);
        if (!desc) return desc;
        // Draft descriptors must remain configurable so Proxy invariants hold
        return { ...desc, configurable: true, writable: true };
      }
    });

    return proxy as O;
  }

  const rootProxy = createProxy(workingBase as unknown as object, null, null);
  const rootState = (rootProxy as any)[DRAFT_STATE] as ProxyState;

  function finalizeState(state: ProxyState): any {
    if (!state.modified) {
      return state.base;
    }

    const copy = state.copy!;
    for (const [key, childProxy] of state.proxies.entries()) {
      const childState = childProxy[DRAFT_STATE] as ProxyState | undefined;
      if (childState) {
        (copy as any)[key] = finalizeState(childState);
      }
    }

    return copy;
  }

  return {
    draft: rootProxy as T,
    finishDraft: () => {
      const modified = rootState.modified;
      if (!modified) {
        return { nextState: publishedBase, modified: false };
      }
      return { nextState: finalizeState(rootState) as T, modified: true };
    }
  };
}
