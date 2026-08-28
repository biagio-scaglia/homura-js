import { describe, it, expect } from 'vitest';
import {
  createHomura,
  HomuraHistoryError,
  HomuraSnapshotError
} from '../src/index';

describe('@homurajs/core - Error Handling', () => {
  it('throws HomuraHistoryError when jumping to invalid entry ID', () => {
    const homura = createHomura({ initialState: { v: 1 } });
    expect(() => homura.jumpTo('non_existent_entry_id')).toThrow(HomuraHistoryError);
  });

  it('throws HomuraSnapshotError when restoring or deleting invalid snapshot', () => {
    const homura = createHomura({ initialState: { v: 1 } });
    expect(() => homura.restore('invalid_snap_id')).toThrow(HomuraSnapshotError);
    expect(() => homura.deleteSnapshot('invalid_snap_id')).toThrow(HomuraSnapshotError);
  });

  it('throws HomuraHistoryError / HomuraBranchError when deleting active or main branch', () => {
    const homura = createHomura({ initialState: { v: 1 } });
    expect(() => homura.deleteBranch('main')).toThrow(HomuraHistoryError);
  });
});
