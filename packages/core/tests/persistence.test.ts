import { describe, it, expect } from 'vitest';
import { createHomura, MemoryAdapter, LocalStorageAdapter } from '../src/index';

describe('@homurajs/core - Persistence', () => {
  it('MemoryAdapter persists and loads state history', async () => {
    const memory = new MemoryAdapter<{ text: string }>();

    const homura1 = createHomura({
      initialState: { text: 'hello' },
      persistence: { adapter: memory, autoSave: true, debounceMs: 0 }
    });

    homura1.update(d => {
      d.text = 'world';
    }, { label: 'Changed text' });
    await homura1.save();

    // Create a new instance pointing to same memory storage
    const homura2 = createHomura({
      initialState: { text: 'dummy' },
      persistence: { adapter: memory }
    });

    const loaded = await homura2.load();
    expect(loaded).toBe(true);
    expect(homura2.getState().text).toBe('world');
    expect(homura2.getCurrentEntry().label).toBe('Changed text');
  });

  it('LocalStorageAdapter persists and recovers state in browser-like environment', async () => {
    const storageKey = 'test_homura_persistence';
    const adapter = new LocalStorageAdapter<{ score: number }>(storageKey);

    const homura1 = createHomura({
      initialState: { score: 100 },
      persistence: { adapter, autoSave: true, debounceMs: 0 }
    });

    homura1.update(d => {
      d.score = 500;
    });
    await homura1.save();

    const homura2 = createHomura({
      initialState: { score: 0 },
      persistence: { adapter }
    });

    await homura2.load();
    expect(homura2.getState().score).toBe(500);

    adapter.clear();
  });
});
