import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { bindForm } from '../src/index';

describe('@homurajs/vanilla - Form Bindings', () => {
  let form: HTMLFormElement;
  let undoBtn: HTMLButtonElement;
  let redoBtn: HTMLButtonElement;
  let statusBadge: HTMLElement;
  let breadcrumbs: HTMLElement;

  beforeEach(() => {
    form = document.createElement('form');
    form.id = 'test-form';
    form.setAttribute('data-homura-form', 'test-form');

    form.innerHTML = `
      <div data-homura-status="test-form"></div>
      <div data-homura-breadcrumbs="test-form"></div>
      <input type="text" name="name" value="Initial Name" />
      <input type="email" name="email" value="test@example.com" />
      <button type="button" data-homura-undo="test-form">Undo</button>
      <button type="button" data-homura-redo="test-form">Redo</button>
    `;

    document.body.appendChild(form);
    undoBtn = form.querySelector('[data-homura-undo]')!;
    redoBtn = form.querySelector('[data-homura-redo]')!;
    statusBadge = form.querySelector('[data-homura-status]')!;
    breadcrumbs = form.querySelector('[data-homura-breadcrumbs]')!;
  });

  afterEach(() => {
    form.remove();
  });

  it('binds form inputs to state, updates status badge and supports undo/redo', async () => {
    vi.useFakeTimers();

    const controller = bindForm(form, { debounceMs: 50, persist: 'none' });

    expect(controller.homura.getState()).toEqual({
      name: 'Initial Name',
      email: 'test@example.com'
    });
    expect(undoBtn.disabled).toBe(true);
    expect(redoBtn.disabled).toBe(true);
    expect(statusBadge.textContent).toBe('💾 Ready');

    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    nameInput.value = 'Updated Name';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(statusBadge.textContent).toBe('✏️ Editing...');

    vi.advanceTimersByTime(60);

    expect(controller.homura.getState().name).toBe('Updated Name');
    expect(undoBtn.disabled).toBe(false);
    expect(redoBtn.disabled).toBe(true);
    expect(statusBadge.textContent).toBe('💾 Draft saved');

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

  it('supports multi-step wizard navigation with state preservation', () => {
    const wizardForm = document.createElement('form');
    wizardForm.innerHTML = `
      <div data-homura-step="1">
        <input type="text" name="step1_field" value="Step 1 val" />
      </div>
      <div data-homura-step="2">
        <input type="text" name="step2_field" value="Step 2 val" />
      </div>
      <button type="button" data-homura-prev>Prev</button>
      <button type="button" data-homura-next>Next</button>
    `;
    document.body.appendChild(wizardForm);

    const controller = bindForm(wizardForm, { persist: 'none' });
    const step1El = wizardForm.querySelector('[data-homura-step="1"]') as HTMLElement;
    const step2El = wizardForm.querySelector('[data-homura-step="2"]') as HTMLElement;
    const nextBtn = wizardForm.querySelector('[data-homura-next]') as HTMLButtonElement;
    const prevBtn = wizardForm.querySelector('[data-homura-prev]') as HTMLButtonElement;

    expect(step1El.style.display).toBe('');
    expect(step2El.style.display).toBe('none');
    expect(prevBtn.disabled).toBe(true);

    // Advance to Step 2
    nextBtn.click();

    expect(step1El.style.display).toBe('none');
    expect(step2El.style.display).toBe('');
    expect(prevBtn.disabled).toBe(false);

    // Undo moves back to Step 1
    controller.undo();
    expect(step1El.style.display).toBe('');
    expect(step2El.style.display).toBe('none');

    controller.destroy();
    wizardForm.remove();
  });
});
