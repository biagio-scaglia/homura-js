import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { bindForm } from '../src/index';

describe('@homurajs/vanilla - Form Bindings', () => {
  let form: HTMLFormElement;
  let undoBtn: HTMLButtonElement;
  let redoBtn: HTMLButtonElement;

  beforeEach(() => {
    form = document.createElement('form');
    form.id = 'test-form';
    form.setAttribute('data-homura-form', 'test-form');

    form.innerHTML = `
      <input type="text" name="name" value="Initial Name" />
      <input type="email" name="email" value="test@example.com" />
      <button type="button" data-homura-undo="test-form">Undo</button>
      <button type="button" data-homura-redo="test-form">Redo</button>
    `;

    document.body.appendChild(form);
    undoBtn = form.querySelector('[data-homura-undo]')!;
    redoBtn = form.querySelector('[data-homura-redo]')!;
  });

  afterEach(() => {
    form.remove();
  });

  it('binds form inputs to state and supports undo/redo', async () => {
    vi.useFakeTimers();

    const controller = bindForm(form, { debounceMs: 50, persist: 'none' });

    expect(controller.homura.getState()).toEqual({
      name: 'Initial Name',
      email: 'test@example.com'
    });
    expect(undoBtn.disabled).toBe(true);
    expect(redoBtn.disabled).toBe(true);

    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    nameInput.value = 'Updated Name';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));

    vi.advanceTimersByTime(60);

    expect(controller.homura.getState().name).toBe('Updated Name');
    expect(undoBtn.disabled).toBe(false);
    expect(redoBtn.disabled).toBe(true);

    // Click Undo
    undoBtn.click();

    expect(controller.homura.getState().name).toBe('Initial Name');
    expect(nameInput.value).toBe('Initial Name');
    expect(undoBtn.disabled).toBe(true);
    expect(redoBtn.disabled).toBe(false);

    // Click Redo
    redoBtn.click();

    expect(controller.homura.getState().name).toBe('Updated Name');
    expect(nameInput.value).toBe('Updated Name');

    controller.destroy();
    vi.useRealTimers();
  });
});
