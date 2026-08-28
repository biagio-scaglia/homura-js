import { describe, it, expect } from 'vitest';
import { diffStates, applyDiff, createHomura } from '../src/index';

describe('@homurajs/core - Diff Engine', () => {
  it('detects primitive value changes', () => {
    const oldState = { count: 0, name: 'Mario' };
    const newState = { count: 1, name: 'Luigi' };

    const diff = diffStates(oldState, newState);
    expect(diff).toEqual([
      {
        path: ['count'],
        type: 'changed',
        oldValue: 0,
        newValue: 1
      },
      {
        path: ['name'],
        type: 'changed',
        oldValue: 'Mario',
        newValue: 'Luigi'
      }
    ]);

    // Test applyDiff
    expect(applyDiff(oldState, diff)).toEqual(newState);
  });

  it('detects added and removed properties on nested objects', () => {
    const oldState = {
      user: {
        name: 'Mario',
        settings: { theme: 'dark', sound: true }
      },
      legacyField: 123
    };

    const newState = {
      user: {
        name: 'Mario',
        email: 'mario@test.com',
        settings: { theme: 'light' }
      },
      cart: ['potion']
    };

    const diff = diffStates(oldState, newState);

    expect(diff).toContainEqual({
      path: ['user', 'email'],
      type: 'added',
      value: 'mario@test.com'
    });

    expect(diff).toContainEqual({
      path: ['user', 'settings', 'theme'],
      type: 'changed',
      oldValue: 'dark',
      newValue: 'light'
    });

    expect(diff).toContainEqual({
      path: ['user', 'settings', 'sound'],
      type: 'removed',
      value: true
    });

    expect(diff).toContainEqual({
      path: ['legacyField'],
      type: 'removed',
      value: 123
    });

    expect(diff).toContainEqual({
      path: ['cart'],
      type: 'added',
      value: ['potion']
    });

    expect(applyDiff(oldState, diff)).toEqual(newState);
  });

  it('detects array modifications, additions, and removals', () => {
    const oldState = {
      items: [{ id: 1, qty: 2 }, { id: 2, qty: 5 }]
    };

    const newState = {
      items: [{ id: 1, qty: 3 }, { id: 2, qty: 5 }, { id: 3, qty: 1 }]
    };

    const diff = diffStates(oldState, newState);

    expect(diff).toContainEqual({
      path: ['items', 0, 'qty'],
      type: 'changed',
      oldValue: 2,
      newValue: 3
    });

    expect(diff).toContainEqual({
      path: ['items', 2],
      type: 'added',
      value: { id: 3, qty: 1 }
    });

    expect(applyDiff(oldState, diff)).toEqual(newState);
  });

  it('works directly via homura.diff() instance method', () => {
    const homura = createHomura({
      initialState: { user: { name: 'Mario' }, gold: 100 }
    });

    const entry1 = homura.getCurrentEntry();

    homura.update(d => {
      d.user.name = 'Luigi';
      d.gold += 50;
    });
    const entry2 = homura.getCurrentEntry();

    const diff = homura.diff(entry1, entry2);
    expect(diff).toEqual([
      {
        path: ['user', 'name'],
        type: 'changed',
        oldValue: 'Mario',
        newValue: 'Luigi'
      },
      {
        path: ['gold'],
        type: 'changed',
        oldValue: 100,
        newValue: 150
      }
    ]);
  });
});
