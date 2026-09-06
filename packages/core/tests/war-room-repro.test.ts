import { describe, it, expect } from 'vitest';
import { createHomura } from '../src/homura';
import { HistoryGraph } from '../src/history';
import { deepEqual } from '../src/immutability';
import { applyDiff, diffStates } from '../src/diff';
import { PersistenceController } from '../src/persistence';
import type { SerializedHomura } from '../src/types';

describe('War-room bug reproductions', () => {
  it('BUG-A: merge state:change prevState should be pre-merge state', () => {
    const h = createHomura({ initialState: { a: 1, b: 1 } });
    h.setState({ a: 2, b: 1 }, { label: 'main change' });
    const feature = h.createBranch('feat');
    h.setState({ a: 2, b: 9 }, { label: 'feat change' });
    h.switchBranch('main');

    const beforeMerge = structuredClone(h.getState());
    let prevFromEvent: unknown = null;
    h.on('state:change', e => {
      if (e.action === 'merge') prevFromEvent = e.prevState;
    });

    h.merge(feature.id, { strategy: 'theirs' });
    const afterMerge = h.getState();

    expect(prevFromEvent).toEqual(beforeMerge);
    expect(prevFromEvent).not.toEqual(afterMerge);
  });

  it('BUG-B: prune must preserve parent/child topology', () => {
    const g = new HistoryGraph({ n: 0 }, { maxHistory: 100 });
    for (let i = 1; i <= 6; i++) {
      g.addEntry({ n: i }, `e${i}`);
    }
    // Leave intermediates off the active path but keep branch head protected
    g.undo();
    g.undo();
    g.prune(4);

    for (const e of g.getAllEntries()) {
      if (e.parentId) {
        const parent = g.getEntry(e.parentId);
        expect(parent, `parent missing for ${e.id}`).toBeDefined();
        expect(parent!.childrenIds).toContain(e.id);
      }
      for (const childId of e.childrenIds) {
        const child = g.getEntry(childId);
        expect(child, `dangling child ${childId}`).toBeDefined();
        expect(child!.parentId).toBe(e.id);
      }
    }
  });

  it('BUG-C: cancelled transaction must not emit transaction:commit', () => {
    const h = createHomura({
      initialState: { x: 1 },
      middleware: [
        (ctx, _next) => {
          ctx.cancel();
        }
      ]
    });

    let committed = false;
    h.on('transaction:commit', () => {
      committed = true;
    });

    const beforeId = h.getCurrentEntry().id;
    const entry = h.transaction(d => {
      d.x = 99;
    });

    expect(entry.id).toBe(beforeId);
    expect(h.getState().x).toBe(1);
    expect(committed).toBe(false);
  });

  it('BUG-D: silent:true should not create a history entry', () => {
    const h = createHomura({ initialState: { x: 1 } });
    const beforeLen = h.getHistory().length;
    const beforeId = h.getCurrentEntry().id;

    h.setState({ x: 2 }, { silent: true, label: 'silent bump' });

    expect(h.getState().x).toBe(2);
    expect(h.getHistory().length).toBe(beforeLen);
    expect(h.getCurrentEntry().id).toBe(beforeId);
  });

  it('BUG-E: deepEqual should treat equal Maps and Sets as equal', () => {
    expect(deepEqual(new Map([['k', 1]]), new Map([['k', 1]]))).toBe(true);
    expect(deepEqual(new Set([1, 2]), new Set([1, 2]))).toBe(true);
    expect(deepEqual(new Map([['k', 1]]), new Map([['k', 2]]))).toBe(false);
    expect(deepEqual(new Set([1]), new Set([1, 2]))).toBe(false);
  });

  it('BUG-F: mutating getState() must not corrupt history', () => {
    const h = createHomura({ initialState: { x: 1 } });
    const s = h.getState() as { x: number };
    expect(() => {
      s.x = 999;
    }).toThrow();
    expect(h.getCurrentEntry().state.x).toBe(1);
    expect(h.getState().x).toBe(1);
  });

  it('BUG-I: PersistenceController.save should surface adapter errors', async () => {
    const bad = {
      save: async () => {
        throw new Error('disk full');
      },
      load: async () => null,
      clear: async () => {}
    };
    const pc = new PersistenceController(bad);
    const payload = {
      version: 1,
      rootEntryId: 'r',
      currentEntryId: 'r',
      currentBranchId: 'main',
      entries: {},
      branches: {},
      snapshots: {}
    } as SerializedHomura<unknown>;

    await expect(pc.save(payload)).rejects.toThrow(/disk full|Persistence/);
  });

  it('BUG-H: applyDiff handles multiple array removals without index shift corruption', () => {
    const base = { arr: ['a', 'b', 'c', 'd'] };
    const target = { arr: ['a', 'c'] };
    const diffs = diffStates(base, target);
    const result = applyDiff(base, diffs);
    expect(result).toEqual(target);
  });

  it('BUG-J: transaction throwing mid-fn must leave state unchanged', () => {
    const h = createHomura({ initialState: { x: 1, y: 1 } });
    expect(() =>
      h.transaction(d => {
        d.x = 50;
        throw new Error('boom');
      })
    ).toThrow('boom');
    expect(h.getState()).toEqual({ x: 1, y: 1 });
    expect(h.getHistory()).toHaveLength(1);
  });

  it('BUG-K: fast-forward merge strategy should not create merge commit when ancestor', () => {
    const h = createHomura({ initialState: { v: 0 } });
    h.setState({ v: 1 }, { label: 'main-1' });
    const feature = h.createBranch('feature');
    // feature is at same point as main head; advance main further
    h.switchBranch('main');
    h.setState({ v: 2 }, { label: 'main-2' });
    // feature is ancestor of main — merging main into feature should FF
    h.switchBranch(feature.id);
    const beforeLen = h.getHistory().length;
    const entry = h.merge('main', { strategy: 'fast-forward' });
    expect(entry.state).toEqual({ v: 2 });
    // fast-forward should move head without an extra merge node when possible
    expect(h.getCurrentEntry().label).not.toMatch(/^Merge branch/i);
    expect(h.getHistory().length).toBeGreaterThanOrEqual(beforeLen);
  });
});
