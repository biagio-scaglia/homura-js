import { describe, it, expect } from 'vitest';
import { createDraft, deepClone } from '../src/index';

describe('@homurajs/core - Immutability & Drafts', () => {
  it('deepClone creates independent copies', () => {
    const original = {
      nested: { num: 42, list: [1, 2, 3] },
      date: new Date('2026-01-01')
    };

    const clone = deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.nested).not.toBe(original.nested);
    expect(clone.nested.list).not.toBe(original.nested.list);

    clone.nested.num = 99;
    expect(original.nested.num).toBe(42);
  });

  it('createDraft modifies state without mutating original', () => {
    const base = {
      player: {
        hp: 100,
        inventory: ['Potion', 'Shield']
      },
      gold: 50
    };

    const { draft, finishDraft } = createDraft(base);
    draft.player.hp -= 20;
    draft.player.inventory.push('Elixir');
    draft.gold += 100;

    const { nextState, modified } = finishDraft();

    expect(modified).toBe(true);
    expect(nextState.player.hp).toBe(80);
    expect(nextState.player.inventory).toEqual(['Potion', 'Shield', 'Elixir']);
    expect(nextState.gold).toBe(150);

    // Original base object is untouched!
    expect(base.player.hp).toBe(100);
    expect(base.player.inventory).toEqual(['Potion', 'Shield']);
    expect(base.gold).toBe(50);
  });

  it('createDraft preserves references if no modifications occur', () => {
    const base = { a: 1, b: { c: 2 } };
    const { draft, finishDraft } = createDraft(base);

    // Read only
    const read = draft.b.c;
    expect(read).toBe(2);

    const { nextState, modified } = finishDraft();
    expect(modified).toBe(false);
    expect(nextState).toBe(base);
  });
});
