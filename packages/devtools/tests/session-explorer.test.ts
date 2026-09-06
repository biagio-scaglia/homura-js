import { describe, it, expect } from 'vitest';
import { createHomura } from '@homurajs/core';
import { createDevtoolsBridge } from '../src/index';
import { PlaybackControls } from '../src/ui/PlaybackControls';
import { DevToolsPanel } from '../src/ui/DevToolsPanel';

describe('DevTools Visual Time Machine & Session Explorer', () => {
  it('supports keyboard navigation shortcuts (ArrowLeft, ArrowRight, Home, End)', () => {
    const homura = createHomura({
      initialState: { count: 0 }
    });

    homura.update(d => { d.count = 1; }, { label: 'Step 1' });
    homura.update(d => { d.count = 2; }, { label: 'Step 2' });
    homura.update(d => { d.count = 3; }, { label: 'Step 3' });

    const bridge = createDevtoolsBridge(homura);
    const controls = new PlaybackControls(bridge);
    controls.setShortcutsEnabled(true);

    // Attach to an open panel root so shortcut gating treats DevTools as active
    const root = document.createElement('div');
    root.className = 'homura-devtools-root';
    root.appendChild(controls.getElement());
    document.body.appendChild(root);

    // Simulate ArrowLeft (Undo)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(homura.getState().count).toBe(2);

    // Simulate Home (Jump to start)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(homura.getState().count).toBe(0);

    // Simulate End (Jump to latest)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(homura.getState().count).toBe(3);

    // Simulate ArrowLeft then ArrowRight
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(homura.getState().count).toBe(2);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(homura.getState().count).toBe(3);

    controls.destroy();
    root.remove();
  });

  it('mounts DevToolsPanel with drag-and-drop session file support', () => {
    const homura = createHomura({ initialState: { count: 10 } });
    const bridge = createDevtoolsBridge(homura);
    const panel = new DevToolsPanel(bridge);

    const el = panel.getElement();
    expect(el.classList.contains('homura-devtools-root')).toBe(true);

    // Simulate dragover and dragleave
    el.dispatchEvent(new Event('dragover'));
    expect(el.style.outline).toContain('dashed');

    el.dispatchEvent(new Event('dragleave'));
    expect(el.style.outline).toBe('none');

    panel.destroy();
  });
});
