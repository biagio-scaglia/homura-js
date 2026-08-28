import { describe, it, expect } from 'vitest';
import { createHomura, HomuraSnapshotError } from '../src/index';

describe('@homurajs/core - Snapshots', () => {
  it('creates, lists, restores, and deletes snapshots', () => {
    const homura = createHomura({ initialState: { stage: 1, bossDefeated: false } });

    homura.update(d => {
      d.stage = 2;
    });

    // Take snapshot
    const snap1 = homura.snapshot('Before Boss 2');
    expect(snap1.name).toBe('Before Boss 2');
    expect(snap1.state.stage).toBe(2);
    expect(snap1.state.bossDefeated).toBe(false);

    // Progress further
    homura.update(d => {
      d.bossDefeated = true;
      d.stage = 3;
    });

    expect(homura.getState().stage).toBe(3);

    // Restore snapshot
    const restoredEntry = homura.restore(snap1.id);
    expect(restoredEntry.state.stage).toBe(2);
    expect(restoredEntry.state.bossDefeated).toBe(false);
    expect(homura.getState().stage).toBe(2);

    // List snapshots
    const snaps = homura.getSnapshots();
    expect(snaps).toHaveLength(1);
    expect(snaps[0]?.id).toBe(snap1.id);

    // Delete snapshot
    homura.deleteSnapshot(snap1.id);
    expect(homura.getSnapshots()).toHaveLength(0);

    // Deleting again throws
    expect(() => homura.deleteSnapshot(snap1.id)).toThrow(HomuraSnapshotError);
  });
});
