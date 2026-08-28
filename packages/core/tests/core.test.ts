import { describe, it, expect } from 'vitest';
import { createHomura } from '../src/index';

interface AppState {
  counter: number;
  user: { name: string; email: string } | null;
  cart: { id: string; qty: number }[];
}

const initial: AppState = {
  counter: 0,
  user: null,
  cart: []
};

describe('@homurajs/core - Core Engine', () => {
  it('initializes with the provided state', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    expect(homura.getState()).toEqual(initial);
    const entry = homura.getCurrentEntry();
    expect(entry.label).toBe('Initial state');
    expect(entry.parentId).toBeNull();
    expect(entry.state).toEqual(initial);
  });

  it('setState creates a new entry and updates state', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    const nextState: AppState = { ...initial, counter: 10 };
    const entry = homura.setState(nextState, { label: 'Set counter to 10' });

    expect(homura.getState().counter).toBe(10);
    expect(entry.label).toBe('Set counter to 10');
    expect(entry.state.counter).toBe(10);
    expect(entry.parentId).toBeDefined();
  });

  it('update supports mutating draft proxy', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    homura.update(
      draft => {
        draft.counter += 5;
        draft.cart.push({ id: 'item-1', qty: 2 });
      },
      { label: 'Draft update' }
    );

    expect(homura.getState().counter).toBe(5);
    expect(homura.getState().cart).toEqual([{ id: 'item-1', qty: 2 }]);
    expect(homura.getCurrentEntry().label).toBe('Draft update');
  });

  it('update supports returning a new state directly', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    homura.update(
      state => ({
        ...state,
        user: { name: 'Mario', email: 'mario@mushroom.kingdom' }
      }),
      { label: 'Set user' }
    );

    expect(homura.getState().user).toEqual({
      name: 'Mario',
      email: 'mario@mushroom.kingdom'
    });
  });

  it('commit records current state with label and metadata', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    homura.commit('Milestone checkpoint', { author: 'Admin' });
    const entry = homura.getCurrentEntry();
    expect(entry.label).toBe('Milestone checkpoint');
    expect(entry.metadata?.author).toBe('Admin');
  });

  it('undo and redo navigate back and forth in linear history', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    homura.update(d => {
      d.counter = 1;
    }, { label: 'Step 1' });
    homura.update(d => {
      d.counter = 2;
    }, { label: 'Step 2' });
    homura.update(d => {
      d.counter = 3;
    }, { label: 'Step 3' });

    expect(homura.getState().counter).toBe(3);

    const step2 = homura.undo();
    expect(step2?.label).toBe('Step 2');
    expect(homura.getState().counter).toBe(2);

    const step1 = homura.undo();
    expect(step1?.label).toBe('Step 1');
    expect(homura.getState().counter).toBe(1);

    const root = homura.undo();
    expect(root?.label).toBe('Initial state');
    expect(homura.getState().counter).toBe(0);

    // Cannot undo further
    expect(homura.undo()).toBeNull();

    // Redo back up
    homura.redo();
    expect(homura.getState().counter).toBe(1);
    homura.redo();
    expect(homura.getState().counter).toBe(2);
    homura.redo();
    expect(homura.getState().counter).toBe(3);

    // Cannot redo further
    expect(homura.redo()).toBeNull();
  });

  it('rewind and fastForward navigate multiple steps at once', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    for (let i = 1; i <= 10; i++) {
      homura.update(d => {
        d.counter = i;
      }, { label: `Step ${i}` });
    }

    expect(homura.getState().counter).toBe(10);

    // Rewind 5 steps
    const rewound = homura.rewind(5);
    expect(rewound?.state.counter).toBe(5);
    expect(homura.getState().counter).toBe(5);

    // Rewind 3 more steps
    homura.rewind(3);
    expect(homura.getState().counter).toBe(2);

    // Fast forward 4 steps
    const ff = homura.fastForward(4);
    expect(ff?.state.counter).toBe(6);
    expect(homura.getState().counter).toBe(6);

    // Fast forward beyond head
    homura.fastForward(100);
    expect(homura.getState().counter).toBe(10);
  });

  it('jumpTo moves directly to any arbitrary history entry', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    const e1 = homura.update(d => {
      d.counter = 1;
    }, { label: 'Step 1' });
    homura.update(d => {
      d.counter = 2;
    }, { label: 'Step 2' });
    const e3 = homura.update(d => {
      d.counter = 3;
    }, { label: 'Step 3' });

    expect(homura.getState().counter).toBe(3);

    homura.jumpTo(e1.id);
    expect(homura.getState().counter).toBe(1);
    expect(homura.getCurrentEntry().id).toBe(e1.id);

    homura.jumpTo(e3.id);
    expect(homura.getState().counter).toBe(3);
  });

  it('clearHistory resets history graph while keeping current state', () => {
    const homura = createHomura<AppState>({ initialState: initial });
    homura.update(d => {
      d.counter = 99;
    });
    homura.clearHistory(true);

    expect(homura.getState().counter).toBe(99);
    expect(homura.getHistory()).toHaveLength(1);
    expect(homura.undo()).toBeNull();
  });
});
