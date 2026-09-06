import { describe, it, expect, vi } from 'vitest';
import { GhostAssistMonitor } from '../src/ghost';
import { bindForm } from '../src/form';

describe('War-room vanilla reliability', () => {
  it('GhostAssistMonitor.destroy removes DOM listeners', () => {
    const form = document.createElement('form');
    document.body.appendChild(form);
    const addSpy = vi.spyOn(form, 'addEventListener');
    const removeSpy = vi.spyOn(form, 'removeEventListener');

    const monitor = new GhostAssistMonitor(form);
    expect(addSpy.mock.calls.length).toBeGreaterThan(0);

    monitor.destroy();
    expect(removeSpy.mock.calls.length).toBeGreaterThan(0);

    // After destroy, further input should not throw / reattach
    form.dispatchEvent(new Event('input', { bubbles: true }));
    form.remove();
  });

  it('verifyIntegrityAndRestore restores radio groups via RadioNodeList', () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <input type="radio" name="plan" value="free" />
      <input type="radio" name="plan" value="pro" />
    `;
    document.body.appendChild(form);

    const binding = bindForm(form, {
      persist: 'none',
      enableGhostAssist: false,
      initialState: { plan: 'pro' }
    });

    // Clear radios as if AJAX wiped them
    form.querySelectorAll<HTMLInputElement>('input[name="plan"]').forEach(r => {
      r.checked = false;
    });

    const result = binding.verifyIntegrityAndRestore();
    expect(result.hadConflict).toBe(true);
    expect(result.restoredFields).toContain('plan');
    const pro = form.querySelector<HTMLInputElement>('input[name="plan"][value="pro"]');
    expect(pro?.checked).toBe(true);

    binding.destroy();
    form.remove();
  });

  it('persist: sessionstorage wires a real sessionStorage adapter', async () => {
    sessionStorage.clear();
    const form = document.createElement('form');
    form.innerHTML = `<input name="email" value="a@b.com" />`;
    document.body.appendChild(form);

    const binding = bindForm(form, {
      persist: 'sessionstorage',
      storageKey: 'warroom_session_form',
      enableGhostAssist: false
    });

    binding.homura.setState({ email: 'saved@test.com' } as any);
    await binding.homura.save();

    const raw = sessionStorage.getItem('warroom_session_form');
    expect(raw).toBeTruthy();

    binding.destroy();
    form.remove();
  });
});
