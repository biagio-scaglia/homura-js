import { Homura } from '@homura-js/core';
import { createDevtoolsBridge } from './bridge';
import { DevToolsOptions } from './types';
import { DevToolsPanel } from './ui/DevToolsPanel';

/**
 * Mounts Homura DevTools into the application.
 *
 * @param homura - The Homura state instance to inspect
 * @param options - Mounting and visual options
 * @returns Object with control methods and unmount cleanup
 */
export function mountDevTools<T>(
  homura: Homura<T>,
  options: DevToolsOptions = {}
): {
  panel: DevToolsPanel;
  open: () => void;
  close: () => void;
  toggle: () => void;
  unmount: () => void;
} {
  DevToolsPanel.injectStyles();

  const bridge = createDevtoolsBridge(homura);
  const isFloating = !options.container || options.position === 'floating';

  let targetContainer: HTMLElement;
  let floatingWrapper: HTMLElement | null = null;
  let launcherBtn: HTMLElement | null = null;

  if (isFloating) {
    // Create floating modal container
    floatingWrapper = document.createElement('div');
    floatingWrapper.className = `homura-devtools-root homura-floating-container ${
      options.defaultOpen ? '' : 'minimized'
    }`;
    document.body.appendChild(floatingWrapper);

    targetContainer = floatingWrapper;

    // Create floating trigger launcher button
    launcherBtn = document.createElement('button');
    launcherBtn.className = 'homura-launcher-btn';
    launcherBtn.innerHTML = `
      <span class="homura-launcher-pulse"></span>
      <span>HOMURA</span>
    `;
    document.body.appendChild(launcherBtn);

    launcherBtn.addEventListener('click', () => {
      toggle();
    });
  } else {
    if (typeof options.container === 'string') {
      const el = document.querySelector(options.container);
      if (!el) {
        throw new Error(`[HomuraJS DevTools] Container "${options.container}" not found in DOM`);
      }
      targetContainer = el as HTMLElement;
    } else {
      targetContainer = options.container!;
    }
  }

  const panel = new DevToolsPanel(bridge, options);
  targetContainer.appendChild(panel.getElement());

  // Close button handler for floating mode
  const closeBtn = panel.getElement().querySelector('.hm-btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      close();
    });
  }

  function open(): void {
    if (floatingWrapper) {
      floatingWrapper.classList.remove('minimized');
    }
  }

  function close(): void {
    if (floatingWrapper) {
      floatingWrapper.classList.add('minimized');
    }
  }

  function toggle(): void {
    if (floatingWrapper) {
      if (floatingWrapper.classList.contains('minimized')) {
        open();
      } else {
        close();
      }
    }
  }

  // Keyboard shortcut listener: Alt+H (toggle), Escape (close), and Arrow time-travel controls
  const keyHandler = (e: KeyboardEvent) => {
    // Ignore keystrokes in active input fields
    const activeTag = (document.activeElement?.tagName || '').toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea') return;

    if ((e.altKey && e.code === 'KeyH') || (e.ctrlKey && e.shiftKey && e.code === 'KeyH')) {
      e.preventDefault();
      toggle();
      return;
    }

    if (floatingWrapper && !floatingWrapper.classList.contains('minimized')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.shiftKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        homura.rewind(5);
      } else if (e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault();
        homura.fastForward(5);
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        homura.undo();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        homura.redo();
      }
    }
  };

  window.addEventListener('keydown', keyHandler);

  function unmount(): void {
    window.removeEventListener('keydown', keyHandler);
    panel.destroy();
    bridge.destroy();
    if (floatingWrapper) floatingWrapper.remove();
    if (launcherBtn) launcherBtn.remove();
  }

  return {
    panel,
    open,
    close,
    toggle,
    unmount
  };
}
