import { DiffChange, HistoryEntry } from './types';
import { isObject, deepClone } from './immutability';

/**
 * Computes the deep structural differences between two states.
 *
 * @param oldVal - Original state/value
 * @param newVal - New state/value
 * @param basePath - Current traversal path
 * @returns Array of DiffChange objects
 */
export function diffStates(
  oldVal: unknown,
  newVal: unknown,
  basePath: (string | number)[] = []
): DiffChange[] {
  // If identical primitives or references
  if (Object.is(oldVal, newVal)) {
    return [];
  }

  const changes: DiffChange[] = [];

  // If one is primitive or types differ
  if (
    !isObject(oldVal) ||
    !isObject(newVal) ||
    Array.isArray(oldVal) !== Array.isArray(newVal)
  ) {
    changes.push({
      path: basePath,
      type: 'changed',
      oldValue: oldVal,
      newValue: newVal
    });
    return changes;
  }

  // Both are Arrays
  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    const minLen = Math.min(oldVal.length, newVal.length);

    for (let i = 0; i < minLen; i++) {
      const nested = diffStates(oldVal[i], newVal[i], [...basePath, i]);
      changes.push(...nested);
    }

    if (newVal.length > oldVal.length) {
      for (let i = minLen; i < newVal.length; i++) {
        changes.push({
          path: [...basePath, i],
          type: 'added',
          value: newVal[i]
        });
      }
    } else if (oldVal.length > newVal.length) {
      for (let i = minLen; i < oldVal.length; i++) {
        changes.push({
          path: [...basePath, i],
          type: 'removed',
          value: oldVal[i]
        });
      }
    }

    return changes;
  }

  // Both are Objects
  const oldKeys = Object.keys(oldVal as object);
  const newKeys = Object.keys(newVal as object);
  const newKeysSet = new Set(newKeys);
  const oldKeysSet = new Set(oldKeys);

  // Check existing and modified keys
  for (const key of oldKeys) {
    const currentPath = [...basePath, key];
    if (!newKeysSet.has(key)) {
      changes.push({
        path: currentPath,
        type: 'removed',
        value: (oldVal as Record<string, unknown>)[key]
      });
    } else {
      const nested = diffStates(
        (oldVal as Record<string, unknown>)[key],
        (newVal as Record<string, unknown>)[key],
        currentPath
      );
      changes.push(...nested);
    }
  }

  // Check added keys
  for (const key of newKeys) {
    if (!oldKeysSet.has(key)) {
      changes.push({
        path: [...basePath, key],
        type: 'added',
        value: (newVal as Record<string, unknown>)[key]
      });
    }
  }

  return changes;
}

/**
 * Computes the diff between two HistoryEntry objects.
 */
export function diffEntries<T>(
  entryA: HistoryEntry<T>,
  entryB: HistoryEntry<T>
): DiffChange[] {
  return diffStates(entryA.state, entryB.state);
}

/**
 * Applies a list of DiffChange objects to a base state to produce the updated state.
 */
export function applyDiff<T>(baseState: T, diffs: DiffChange[]): T {
  if (diffs.length === 0) {
    return baseState;
  }

  const result = deepClone(baseState);

  for (const change of diffs) {
    if (change.path.length === 0) {
      if (change.type === 'changed') {
        return deepClone(change.newValue as T);
      }
      if (change.type === 'added') {
        return deepClone(change.value as T);
      }
      return undefined as unknown as T;
    }

    let current: any = result;
    for (let i = 0; i < change.path.length - 1; i++) {
      const segment = change.path[i]!;
      if (current[segment] === undefined) {
        // If next segment is numeric index, create array, else object
        const nextSegment = change.path[i + 1]!;
        current[segment] = typeof nextSegment === 'number' ? [] : {};
      }
      current = current[segment];
    }

    const lastKey = change.path[change.path.length - 1]!;

    switch (change.type) {
      case 'added':
        current[lastKey] = deepClone(change.value);
        break;
      case 'changed':
        current[lastKey] = deepClone(change.newValue);
        break;
      case 'removed':
        if (Array.isArray(current) && typeof lastKey === 'number') {
          current.splice(lastKey, 1);
        } else {
          delete current[lastKey];
        }
        break;
    }
  }

  return result;
}

/**
 * Formats a diff path into a dot-separated string (e.g. "user.cart[0].price")
 */
export function formatDiffPath(path: (string | number)[]): string {
  if (path.length === 0) return '(root)';
  return path
    .map((seg, idx) => {
      if (typeof seg === 'number') {
        return `[${seg}]`;
      }
      return idx === 0 ? seg : `.${seg}`;
    })
    .join('');
}
