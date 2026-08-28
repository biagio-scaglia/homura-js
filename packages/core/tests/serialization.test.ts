import { describe, it, expect } from 'vitest';
import { createHomura } from '../src/index';

describe('@homurajs/core - Serialization & Export/Import', () => {
  it('exports and imports complete history state graph', () => {
    const homura1 = createHomura({
      initialState: { level: 1, inventory: ['stick'] }
    });

    homura1.update(d => {
      d.level = 2;
      d.inventory.push('wooden sword');
    }, { label: 'Got wooden sword' });

    homura1.snapshot('After training');

    homura1.update(d => {
      d.level = 5;
      d.inventory.push('iron armor');
    }, { label: 'Level 5 reached' });

    const exported = homura1.export();
    expect(exported.version).toBe(1);
    expect(Object.keys(exported.entries)).toHaveLength(3);
    expect(Object.keys(exported.snapshots)).toHaveLength(1);

    // Create fresh instance and import
    const homura2 = createHomura<{ level: number; inventory: string[] }>({
      initialState: { level: 0, inventory: [] }
    });

    homura2.import(exported);

    expect(homura2.getState().level).toBe(5);
    expect(homura2.getState().inventory).toEqual(['stick', 'wooden sword', 'iron armor']);
    expect(homura2.getSnapshots()).toHaveLength(1);

    // Can time travel in imported instance
    const stepBack = homura2.undo();
    expect(stepBack?.state.level).toBe(2);
  });
});
