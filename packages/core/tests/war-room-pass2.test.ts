import { describe, it, expect } from 'vitest';
import { createHomura, deepEqual, applyDiff, diffStates, HistoryGraph } from '../src/index';

describe('War-room pass 2 — cross-feature & adversarial', () => {
  it('state consistency: getState matches current entry after mixed ops', () => {
    const h = createHomura({ initialState: { n: 0, tags: [] as string[] } });
    h.transaction(d => {
      d.n = 1;
      d.tags.push('a');
    });
    h.update(d => {
      d.n = 2;
    });
    const snap = h.snapshot('mid');
    h.update(d => {
      d.n = 3;
    });
    h.undo();
    h.restore(snap.id);
    expect(h.getState()).toEqual(h.getCurrentEntry().state);
    expect(h.getState().n).toBe(2);
  });

  it('replay does not create extra history entries', async () => {
    const h = createHomura({ initialState: { n: 0 } });
    for (let i = 1; i <= 5; i++) {
      h.setState({ n: i }, { label: `s${i}` });
    }
    const before = h.getHistory({ allBranches: true }).length;
    await h.replay({ stepDelayMs: 0, speed: 10 });
    const after = h.getHistory({ allBranches: true }).length;
    expect(after).toBe(before);
    expect(h.getState().n).toBe(5);
  });

  it('compare is deterministic and does not mutate operands', () => {
    const h = createHomura({ initialState: { x: 1 } });
    const a = h.createBranch('a');
    h.setState({ x: 2 });
    h.switchBranch('main');
    h.setState({ x: 3 });
    const beforeA = structuredClone(h.getBranches().find(b => b.id === a.id));
    const c1 = h.compare('main', a.id);
    const c2 = h.compare('main', a.id);
    expect(c1).toEqual(c2);
    expect(h.getBranches().find(b => b.id === a.id)).toEqual(beforeA);
  });

  it('compact preserves snapshot restore behavior', () => {
    const h = createHomura({ initialState: { v: 0 }, maxHistory: 100 });
    for (let i = 1; i <= 20; i++) {
      h.setState({ v: i });
      if (i === 10) h.snapshot('ten');
    }
    h.compact({ maxEntries: 5, preserveSnapshots: true });
    h.restore('ten');
    expect(h.getState().v).toBe(10);
  });

  it('listener unsubscribe prevents further callbacks; self-unsubscribe is safe', () => {
    const h = createHomura({ initialState: { n: 0 } });
    const calls: number[] = [];
    const unsub = h.on('state:change', () => {
      calls.push(1);
      unsub();
    });
    h.setState({ n: 1 });
    h.setState({ n: 2 });
    expect(calls).toEqual([1]);
  });

  it('listener throw does not break subsequent listeners or state', () => {
    const h = createHomura({ initialState: { n: 0 } });
    const seen: string[] = [];
    h.on('state:change', () => {
      seen.push('a');
      throw new Error('listener boom');
    });
    h.on('state:change', () => {
      seen.push('b');
    });
    expect(() => h.setState({ n: 1 })).not.toThrow();
    expect(h.getState().n).toBe(1);
    expect(seen).toEqual(['a', 'b']);
  });

  it('merge + compact + replay remain consistent', async () => {
    const h = createHomura({ initialState: { a: 0, b: 0 } });
    h.setState({ a: 1, b: 0 });
    const feat = h.createBranch('feat');
    h.setState({ a: 1, b: 5 });
    h.switchBranch('main');
    h.setState({ a: 2, b: 0 });
    h.merge(feat.id, { strategy: 'theirs' });
    expect(h.getState()).toEqual({ a: 2, b: 5 });
    h.compact({ maxEntries: 4 });
    await h.replay({ stepDelayMs: 0 });
    expect(h.getState()).toEqual(h.getCurrentEntry().state);
  });

  it('invalid jumpTo / restore throw without corrupting state', () => {
    const h = createHomura({ initialState: { n: 1 } });
    h.setState({ n: 2 });
    const before = h.export();
    expect(() => h.jumpTo('missing')).toThrow();
    expect(() => h.restore('missing-snap')).toThrow();
    expect(h.export()).toEqual(before);
  });

  it('deepEqual distinguishes unequal Maps that share empty Object.keys', () => {
    expect(deepEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
    expect(deepEqual(new Map(), new Map([['a', 1]]))).toBe(false);
  });

  it('applyDiff round-trips structural object diffs', () => {
    const base = { user: { name: 'A', age: 1 }, tags: ['x', 'y', 'z'] };
    const target = { user: { name: 'B', age: 1 }, tags: ['x', 'z'], extra: true };
    const diffs = diffStates(base, target);
    expect(applyDiff(base, diffs)).toEqual(target);
  });

  it('HistoryGraph import rejects incomplete payloads', () => {
    const g = new HistoryGraph({ n: 0 });
    expect(() =>
      g.importData({
        version: 1,
        rootEntryId: '',
        currentEntryId: '',
        currentBranchId: '',
        entries: {},
        branches: {},
        snapshots: {}
      } as any)
    ).toThrow();
  });

  it('manual merge without resolver throws on conflict', () => {
    const h = createHomura({ initialState: { score: 1 } });
    const feat = h.createBranch('feat');
    h.setState({ score: 9 });
    h.switchBranch('main');
    h.setState({ score: 3 });
    expect(() => h.merge(feat.id, { strategy: 'manual' })).toThrow(/Unresolved merge conflict/);
  });

  it('unmodified update() does not create a history entry', () => {
    const h = createHomura({ initialState: { n: 1 } });
    const before = h.getHistory().length;
    const beforeId = h.getCurrentEntry().id;
    const entry = h.update(() => {
      /* no mutations */
    });
    expect(entry.id).toBe(beforeId);
    expect(h.getHistory().length).toBe(before);
  });
});
