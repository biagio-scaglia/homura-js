import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createHomura } from '@homurajs/core';
import { mountDevTools } from '../src/index';

describe('@homurajs/devtools - UI & Mounting', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'devtools-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('mounts DevTools in embedded container and renders panels', () => {
    const homura = createHomura({
      initialState: { player: { name: 'Hero', hp: 100 } }
    });

    const devtools = mountDevTools(homura, {
      container,
      position: 'embedded'
    });

    expect(container.querySelector('.homura-devtools-root')).not.toBeNull();
    expect(container.querySelector('.homura-header')).not.toBeNull();
    expect(container.querySelector('.homura-sidebar')).not.toBeNull();
    expect(container.querySelector('.homura-playback-bar')).not.toBeNull();

    // Trigger state change and verify UI updates
    homura.update(d => {
      d.player.hp = 70;
    }, { label: 'Take 30 Damage' });

    const timelineCards = container.querySelectorAll('.homura-timeline-card');
    expect(timelineCards.length).toBe(2);

    devtools.unmount();
    expect(container.querySelector('.homura-devtools-root')).toBeNull();
  });

  it('mounts in floating mode with toggle controller', () => {
    const homura = createHomura({
      initialState: { counter: 0 }
    });

    const devtools = mountDevTools(homura, {
      position: 'floating',
      defaultOpen: false
    });

    const launcher = document.querySelector('.homura-launcher-btn');
    expect(launcher).not.toBeNull();

    const floatingContainer = document.querySelector('.homura-floating-container');
    expect(floatingContainer?.classList.contains('minimized')).toBe(true);

    devtools.open();
    expect(floatingContainer?.classList.contains('minimized')).toBe(false);

    devtools.close();
    expect(floatingContainer?.classList.contains('minimized')).toBe(true);

    devtools.unmount();
  });
});
