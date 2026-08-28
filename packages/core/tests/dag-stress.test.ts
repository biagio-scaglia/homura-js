import { describe, it, expect } from 'vitest';
import { createHomura } from '../src';

describe('DAG Stress & Branch Density Tests', () => {
  it('handles 2,000 updates across 20 concurrent parallel branches with 0 data corruption', () => {
    const homura = createHomura({
      initialState: {
        counter: 0,
        tags: [] as string[]
      },
      maxHistory: 5000
    });

    const branchCount = 20;
    const updatesPerBranch = 100;
    const branches: string[] = ['main'];

    // Create 20 branches
    for (let i = 1; i < branchCount; i++) {
      const b = homura.createBranch(`branch-${i}`);
      branches.push(b.id);
    }

    // Mutate state concurrently across all branches
    for (let step = 0; step < updatesPerBranch; step++) {
      for (const branchId of branches) {
        homura.switchBranch(branchId);
        homura.update(draft => {
          draft.counter += 1;
          draft.tags.push(`${branchId}-step-${step}`);
        });
      }
    }

    // Verify all branches maintain perfect distinct integrity
    for (const branchId of branches) {
      homura.switchBranch(branchId);
      const state = homura.getState();
      expect(state.counter).toBe(updatesPerBranch);
      expect(state.tags).toHaveLength(updatesPerBranch);
      expect(state.tags[0]).toBe(`${branchId}-step-0`);
    }

    // Verify DAG statistics
    const allEntries = homura.getHistory({ allBranches: true });
    expect(allEntries.length).toBe(branchCount * updatesPerBranch + 1); // +1 root
  });
});
