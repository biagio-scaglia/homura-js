import { describe, it, expect, beforeEach } from 'vitest';
import { createHomuraDB, HomuraDB } from '../src';

describe('@homura-js/db — Branching & Merging', () => {
  let db: HomuraDB;

  beforeEach(() => {
    db = createHomuraDB();
    db.createTable('users');
    db.insert('users', { id: 'u1', name: 'Alice', status: 'active' });
  });

  it('forks alternative database timeline branches without overwriting main data', () => {
    const branch = db.createBranch('experiment-branch');
    db.switchBranch(branch.id);

    db.update('users', 'u1', { status: 'suspended' });
    expect(db.findById('users', 'u1')?.status).toBe('suspended');

    // Switch back to main
    db.switchBranch('main');
    expect(db.findById('users', 'u1')?.status).toBe('active');
  });

  it('performs 3-way merge between database timeline branches', () => {
    const branch = db.createBranch('feature-catalog');
    db.switchBranch(branch.id);

    db.createTable('catalog');
    db.insert('catalog', { id: 'cat_1', title: 'Cyberpunk Shield' });

    // Switch back to main and apply an independent mutation
    db.switchBranch('main');
    db.insert('users', { id: 'u2', name: 'Bob', status: 'active' });

    // Merge feature-catalog into main
    const mergeEntry = db.merge(branch.id, { strategy: 'theirs' });
    expect(mergeEntry).toBeDefined();

    // Verify main now has both the catalog table and user u2
    expect(db.findById('users', 'u2')?.name).toBe('Bob');
    expect(db.findById('catalog', 'cat_1')?.title).toBe('Cyberpunk Shield');
  });
});
