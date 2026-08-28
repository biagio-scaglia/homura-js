import { describe, it, expect, vi } from 'vitest';
import { createHomura } from '../src';

describe('Homura Advanced Features', () => {
  describe('transaction() / Batching', () => {
    it('batches multiple property changes into a single atomic history entry', () => {
      const homura = createHomura({
        initialState: { name: 'Mario', age: 20, role: 'guest' }
      });

      const initialEntry = homura.getCurrentEntry();

      const commitEntry = homura.transaction(
        draft => {
          draft.name = 'Biagio';
          draft.age = 21;
          draft.role = 'developer';
        },
        { label: 'Update Profile' }
      );

      expect(homura.getState()).toEqual({
        name: 'Biagio',
        age: 21,
        role: 'developer'
      });
      expect(commitEntry.label).toBe('Update Profile');
      expect(commitEntry.parentId).toBe(initialEntry.id);

      // Only 2 entries total (initial + transaction)
      const history = homura.getHistory();
      expect(history.length).toBe(2);

      // Single undo reverts all 3 fields back to initial
      homura.undo();
      expect(homura.getState()).toEqual({
        name: 'Mario',
        age: 20,
        role: 'guest'
      });
    });
  });

  describe('replay() Engine', () => {
    it('sequentially replays state history from root to current entry', async () => {
      const homura = createHomura({
        initialState: { count: 0 }
      });

      homura.update(draft => { draft.count = 10; }, { label: 'Step 1' });
      homura.update(draft => { draft.count = 20; }, { label: 'Step 2' });
      homura.update(draft => { draft.count = 30; }, { label: 'Step 3' });

      const stepsVisited: number[] = [];

      await homura.replay({
        speed: 100, // fast replay for testing
        stepDelayMs: 5,
        onStep: (entry) => {
          stepsVisited.push(entry.state.count);
        }
      });

      expect(stepsVisited).toEqual([0, 10, 20, 30]);
      expect(homura.getState().count).toBe(30);
    });
  });

  describe('Branch Merge & Compare', () => {
    it('compares two divergent branches and computes common ancestor + diff', () => {
      const homura = createHomura({
        initialState: { title: 'v1', theme: 'dark', items: [1] }
      });

      // Main branch change
      homura.update(draft => { draft.title = 'v1.1'; }, { label: 'Main edit' });

      // Create feature branch
      const featureBranch = homura.createBranch('feature');
      homura.switchBranch(featureBranch.id);
      homura.update(draft => { draft.theme = 'neon'; draft.items.push(2); }, { label: 'Feature edit' });

      // Switch back to main and make a commit so both branches are 1 commit ahead of ancestor
      homura.switchBranch('main');
      homura.update(draft => { draft.title = 'v1.2'; }, { label: 'Main edit 2' });

      const comparison = homura.compare('main', featureBranch.id);

      expect(comparison.aheadCount).toBe(1);
      expect(comparison.behindCount).toBe(1);
      expect(comparison.diff.length).toBeGreaterThan(0);
    });

    it('merges a feature branch into the main branch', () => {
      const homura = createHomura({
        initialState: { color: 'blue', size: 10 }
      });

      const feature = homura.createBranch('experimental');
      homura.switchBranch(feature.id);
      homura.update(draft => { draft.color = 'violet'; draft.size = 25; });

      // Switch back to main
      homura.switchBranch('main');
      expect(homura.getState().color).toBe('blue');

      // Merge experimental branch
      const merged = homura.merge(feature.id, { label: 'Merge experimental' });

      expect(homura.getState()).toEqual({ color: 'violet', size: 25 });
      expect(merged.label).toBe('Merge experimental');
    });
  });

  describe('compact() & Memory Optimization', () => {
    it('prunes intermediate non-snapshot nodes when compacted', () => {
      const homura = createHomura({
        initialState: { val: 0 },
        maxHistory: 100
      });

      for (let i = 1; i <= 10; i++) {
        homura.update(draft => { draft.val = i; }, { label: `Val ${i}` });
        if (i === 5) {
          homura.snapshot('checkpoint-5');
        }
      }

      expect(homura.getHistory({ allBranches: true }).length).toBe(11);

      // Compact down to 5 max entries, preserving snapshot checkpoint
      const pruned = homura.compact({ maxEntries: 4, preserveSnapshots: true });
      expect(pruned).toBeGreaterThan(0);

      // Snapshot checkpoint is preserved
      const snap = homura.getSnapshots().find(s => s.name === 'checkpoint-5');
      expect(snap).toBeDefined();
    });
  });

  describe('Wildcard Event Listener (*)', () => {
    it('captures all events through on("*")', () => {
      const homura = createHomura({
        initialState: { active: false }
      });

      const capturedEvents: string[] = [];
      homura.on('*', (eventName) => {
        capturedEvents.push(eventName);
      });

      homura.setState({ active: true }, { label: 'Activate' });
      homura.undo();
      homura.redo();

      expect(capturedEvents).toContain('history:add');
      expect(capturedEvents).toContain('state:change');
      expect(capturedEvents).toContain('history:undo');
      expect(capturedEvents).toContain('history:redo');
    });
  });
});
