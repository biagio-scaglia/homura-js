import { describe, it, expect } from 'vitest';
import { createHomura } from '../src/homura';

describe('Branch Merging & 3-Way Conflict Strategies', () => {
  it('performs standard 3-way merge with strategy="theirs"', () => {
    const homura = createHomura({
      initialState: {
        user: { name: 'Initial', age: 20 },
        score: 10
      }
    });

    // Fork feature branch
    const featureBranch = homura.createBranch('feature');
    homura.switchBranch(featureBranch.id);
    homura.update(state => {
      state.user.name = 'Biagio';
      state.score = 20; // conflict with main
    });

    // Switch back to main and make changes
    homura.switchBranch('main');
    homura.update(state => {
      state.user.age = 25;
      state.score = 15; // conflict with feature
    });

    // Merge feature into main with strategy 'theirs' (default)
    const mergeEntry = homura.merge(featureBranch.id, { strategy: 'theirs' });

    expect(mergeEntry.state).toEqual({
      user: { name: 'Biagio', age: 25 },
      score: 20 // theirs won conflict
    });
    expect(homura.getState()).toEqual({
      user: { name: 'Biagio', age: 25 },
      score: 20
    });
  });

  it('performs 3-way merge with strategy="ours"', () => {
    const homura = createHomura({
      initialState: {
        user: { name: 'Initial', age: 20 },
        score: 10
      }
    });

    const featureBranch = homura.createBranch('feature');
    homura.switchBranch(featureBranch.id);
    homura.update(state => {
      state.user.name = 'Biagio';
      state.score = 20; // conflict with main
    });

    homura.switchBranch('main');
    homura.update(state => {
      state.user.age = 25;
      state.score = 15; // conflict with feature
    });

    // Merge with strategy 'ours'
    const mergeEntry = homura.merge(featureBranch.id, { strategy: 'ours' });

    expect(mergeEntry.state).toEqual({
      user: { name: 'Biagio', age: 25 },
      score: 15 // ours retained
    });
  });

  it('performs 3-way merge with custom resolveConflict handler', () => {
    const homura = createHomura({
      initialState: {
        user: { name: 'Initial', age: 20 },
        score: 10
      }
    });

    const featureBranch = homura.createBranch('feature');
    homura.switchBranch(featureBranch.id);
    homura.update(state => {
      state.user.name = 'Biagio';
      state.score = 20;
    });

    homura.switchBranch('main');
    homura.update(state => {
      state.user.age = 25;
      state.score = 15;
    });

    // Merge with custom resolver
    const mergeEntry = homura.merge(featureBranch.id, {
      strategy: 'manual',
      resolveConflict: conflict => {
        if (conflict.path.join('.') === 'score') {
          return Number(conflict.ours) + Number(conflict.theirs); // 15 + 20 = 35
        }
        return conflict.theirs;
      }
    });

    expect(mergeEntry.state).toEqual({
      user: { name: 'Biagio', age: 25 },
      score: 35
    });
  });
});
