import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createHomura, bindState } from '../src/index';

describe('@homurajs/vanilla - DOM Bindings', () => {
  let countEl: HTMLElement;
  let nameEl: HTMLElement;

  beforeEach(() => {
    countEl = document.createElement('span');
    countEl.id = 'counter';
    nameEl = document.createElement('div');
    nameEl.id = 'username';
    document.body.appendChild(countEl);
    document.body.appendChild(nameEl);
  });

  afterEach(() => {
    countEl.remove();
    nameEl.remove();
  });

  it('automatically syncs state changes to DOM elements', () => {
    const homura = createHomura({
      initialState: { counter: 0, user: { name: 'Mario' } }
    });

    const unbind = bindState(homura, [
      {
        selector: s => s.counter,
        target: countEl,
        format: val => `Count: ${val}`
      },
      {
        selector: s => s.user.name,
        target: '#username'
      }
    ]);

    expect(countEl.textContent).toBe('Count: 0');
    expect(nameEl.textContent).toBe('Mario');

    homura.update(d => {
      d.counter = 5;
      d.user.name = 'Luigi';
    });

    expect(countEl.textContent).toBe('Count: 5');
    expect(nameEl.textContent).toBe('Luigi');

    homura.undo();

    expect(countEl.textContent).toBe('Count: 0');
    expect(nameEl.textContent).toBe('Mario');

    unbind();
  });
});
