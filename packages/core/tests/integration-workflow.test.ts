import { describe, it, expect } from 'vitest';
import { createHomura, MemoryAdapter } from '../src';

describe('Combined Enterprise Workflow Integration', () => {
  it('seamlessly combines transactions, branching, snapshots, merge, compaction, replay, and export/import', async () => {
    const memoryAdapter = new MemoryAdapter<{ title: string; count: number; items: string[] }>();
    const homura = createHomura({
      initialState: {
        title: 'Project Alpha',
        count: 0,
        items: ['task-1']
      },
      persistence: memoryAdapter
    });

    // 1. Transaction (atomic batch)
    homura.transaction(draft => {
      draft.count += 10;
      draft.items.push('task-2');
    }, { label: 'Batch initial tasks' });

    expect(homura.getState().count).toBe(10);
    expect(homura.getState().items).toHaveLength(2);

    // 2. Snapshot
    const v1Snapshot = homura.snapshot('v1.0-milestone', { release: true });
    expect(v1Snapshot.id).toBeDefined();

    // 3. Parallel Branching
    const expBranch = homura.createBranch('experimental');
    homura.switchBranch(expBranch.id);

    homura.update(draft => {
      draft.title = 'Project Alpha (Experimental)';
      draft.items.push('exp-feature');
    }, { label: 'Add experimental feature' });

    // 4. Switch back to main and diverge
    homura.switchBranch('main');
    homura.update(draft => {
      draft.count = 25;
      draft.items.push('main-feature');
    }, { label: 'Mainstream improvement' });

    // 5. Compare branches (LCA diff)
    const comparison = homura.compare('main', expBranch.id);
    expect(comparison.commonAncestorId).toBeDefined();
    expect(comparison.aheadCount).toBe(1);
    expect(comparison.behindCount).toBe(1);
    expect(comparison.diff.length).toBeGreaterThan(0);

    // 6. 3-Way Merge with conflict resolution
    const mergeEntry = homura.merge(expBranch.id, {
      strategy: 'theirs',
      label: 'Merge experimental into main'
    });

    expect(mergeEntry.state.title).toBe('Project Alpha (Experimental)');
    expect(mergeEntry.state.count).toBe(25); // preserved from main (no collision)
    expect(homura.getState().items).toContain('exp-feature');

    // 7. Compaction while preserving milestones and heads
    const pruned = homura.compact({
      preserveSnapshots: true,
      retainBranchHeads: true
    });
    expect(pruned).toBeGreaterThanOrEqual(0);

    // 8. Replay Engine step-by-step
    const replaySteps: number[] = [];
    await homura.replay({
      speed: 100, // fast replay for test
      onStep: (entry, idx, total) => {
        replaySteps.push(idx);
        expect(entry).toBeDefined();
      }
    });
    expect(replaySteps.length).toBeGreaterThan(0);

    // 9. Export complete .homura bug report / session file
    const exportedSession = homura.export();
    expect(exportedSession.version).toBe(1);
    expect(Object.keys(exportedSession.entries).length).toBeGreaterThan(0);

    // 10. Import into fresh instance
    const freshHomura = createHomura({
      initialState: { title: '', count: 0, items: [] }
    });
    freshHomura.import(exportedSession);

    expect(freshHomura.getState()).toEqual(homura.getState());
    expect(freshHomura.getBranches()).toHaveLength(homura.getBranches().length);
    expect(freshHomura.getSnapshots()).toHaveLength(1);
  });
});
