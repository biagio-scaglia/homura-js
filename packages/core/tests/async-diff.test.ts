import { describe, it, expect } from 'vitest';
import { diffStatesAsync, createAsyncDiffer, diffStates } from '../src';

describe('Web Worker Off-Thread Async Diffing Engine', () => {
  it('computes identical structural diffs asynchronously for nested objects', async () => {
    const oldState = {
      user: { name: 'Alice', role: 'admin', age: 30 },
      tags: ['alpha', 'beta'],
      settings: { theme: 'dark', notifications: true }
    };

    const newState = {
      user: { name: 'Alice', role: 'editor', age: 31 },
      tags: ['alpha', 'gamma', 'delta'],
      settings: { theme: 'dark', notifications: false },
      extraField: 123
    };

    const asyncDiff = await diffStatesAsync(oldState, newState);
    const syncDiff = diffStates(oldState, newState);

    expect(asyncDiff).toEqual(syncDiff);
    expect(asyncDiff.length).toBeGreaterThan(0);
  });

  it('supports custom differ lifecycle with createAsyncDiffer and terminate', async () => {
    const differ = createAsyncDiffer();
    const changes = await differ.diff({ a: 1 }, { a: 2, b: 3 });
    expect(changes).toEqual([
      { path: ['a'], type: 'changed', oldValue: 1, newValue: 2 },
      { path: ['b'], type: 'added', value: 3 }
    ]);
    differ.terminate();
  });
});
