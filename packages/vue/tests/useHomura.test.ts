import { describe, it, expect } from 'vitest';
import { createHomura } from '@homurajs/core';
import { useHomura } from '../src/index';

describe('@homurajs/vue - useHomura Hook', () => {
  it('binds reactive state and updates on state change', () => {
    const homura = createHomura({ initialState: { count: 10, name: 'Alice' } });
    const { state, update, undo, redo, canUndo, canRedo } = useHomura(homura);

    expect(state.value.count).toBe(10);
    expect(canUndo.value).toBe(false);

    update(d => {
      d.count = 25;
    });

    expect(state.value.count).toBe(25);
    expect(canUndo.value).toBe(true);

    undo();
    expect(state.value.count).toBe(10);
    expect(canRedo.value).toBe(true);

    redo();
    expect(state.value.count).toBe(25);
  });

  it('supports selector for derived reactive slice', () => {
    const homura = createHomura({
      initialState: { player: { hp: 100, mp: 50 }, gold: 200 }
    });

    const { state: hpRef } = useHomura(homura, s => s.player.hp);
    expect(hpRef.value).toBe(100);

    homura.update(d => {
      d.player.hp = 85;
    });

    expect(hpRef.value).toBe(85);
  });
});
