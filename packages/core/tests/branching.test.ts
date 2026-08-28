import { describe, it, expect } from 'vitest';
import { createHomura } from '../src/index';

describe('@homurajs/core - DAG History Graph & Branching', () => {
  it('preserves historical timeline when modifying after an undo (automatic branching)', () => {
    const homura = createHomura({ initialState: { count: 0, text: 'start' } });

    // A -> B -> C -> D
    homura.update(d => {
      d.count = 1;
      d.text = 'B';
    }, { label: 'B' });
    const entryB = homura.getCurrentEntry();

    homura.update(d => {
      d.count = 2;
      d.text = 'C';
    }, { label: 'C' });

    homura.update(d => {
      d.count = 3;
      d.text = 'D';
    }, { label: 'D' });
    const entryD = homura.getCurrentEntry();

    expect(homura.getHistory({ allBranches: true })).toHaveLength(4); // Start, B, C, D

    // Jump back to B
    homura.jumpTo(entryB.id);
    expect(homura.getState().text).toBe('B');

    // Create alternative path E -> F
    homura.update(d => {
      d.count = 20;
      d.text = 'E';
    }, { label: 'E' });

    homura.update(d => {
      d.count = 30;
      d.text = 'F';
    }, { label: 'F' });

    // Verify all entries still exist in DAG graph (no destructive overwriting!)
    const allEntries = homura.getHistory({ allBranches: true });
    expect(allEntries).toHaveLength(6); // Start, B, C, D, E, F

    // Branches should exist
    const branches = homura.getBranches();
    expect(branches.length).toBeGreaterThanOrEqual(2);

    // Active timeline should be Start -> B -> E -> F
    const activeTimeline = homura.getHistory();
    expect(activeTimeline.map(e => e.label)).toEqual([
      'Initial state',
      'B',
      'E',
      'F'
    ]);

    // We can jump back to D from the original branch!
    homura.jumpTo(entryD.id);
    expect(homura.getState().text).toBe('D');
    expect(homura.getState().count).toBe(3);

    // Timeline for D branch
    const dTimeline = homura.getHistory();
    expect(dTimeline.map(e => e.label)).toEqual([
      'Initial state',
      'B',
      'C',
      'D'
    ]);
  });

  it('supports explicit branch creation, switching, and deletion', () => {
    const homura = createHomura({ initialState: { hero: 'Knight', level: 1 } });

    homura.update(d => {
      d.level = 2;
    }, { label: 'Level 2' });

    // Explicitly create branch "Mage-Path"
    const mageBranch = homura.createBranch('Mage-Path');
    expect(mageBranch.name).toBe('Mage-Path');
    expect(homura.getCurrentBranch().name).toBe('Mage-Path');

    homura.update(d => {
      d.hero = 'Wizard';
      d.level = 3;
    }, { label: 'Class change to Wizard' });

    expect(homura.getState().hero).toBe('Wizard');

    // Switch back to main branch
    const mainBranch = homura.getBranches().find(b => b.name === 'main')!;
    homura.switchBranch(mainBranch.id);

    expect(homura.getState().hero).toBe('Knight');
    expect(homura.getState().level).toBe(2);

    // Continue main branch
    homura.update(d => {
      d.hero = 'Paladin';
      d.level = 4;
    }, { label: 'Class change to Paladin' });

    expect(homura.getState().hero).toBe('Paladin');

    // Switch back to Mage-Path
    homura.switchBranch(mageBranch.id);
    expect(homura.getState().hero).toBe('Wizard');
    expect(homura.getState().level).toBe(3);

    // Deleting non-active branch
    homura.switchBranch(mainBranch.id);
    homura.deleteBranch(mageBranch.id);
    expect(homura.getBranches().find(b => b.id === mageBranch.id)).toBeUndefined();
  });
});
