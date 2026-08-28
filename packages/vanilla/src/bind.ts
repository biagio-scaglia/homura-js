import { Homura } from '@homura-js/core';

export type DOMTarget = HTMLElement | string;

export interface StateBinding<T, S = any> {
  /** Selector function extracting value from state */
  selector: (state: T) => S;
  /** DOM element or selector string */
  target: DOMTarget;
  /** Property on DOM element to update (default: 'textContent') */
  property?: 'textContent' | 'innerHTML' | 'value' | string;
  /** Formatter callback before updating DOM */
  format?: (value: S) => string;
}

/**
 * Helper to resolve DOM target.
 */
function resolveElement(target: DOMTarget): HTMLElement | null {
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target;
}

/**
 * Binds Homura state updates directly to DOM elements for Vanilla JS applications.
 *
 * @param homura - The Homura state instance
 * @param bindings - Array or single binding configuration
 * @returns Cleanup function to unbind DOM listeners
 */
export function bindState<T>(
  homura: Homura<T>,
  bindings: StateBinding<T>[] | StateBinding<T>
): () => void {
  const bindingList = Array.isArray(bindings) ? bindings : [bindings];

  function updateDOM(): void {
    const state = homura.getState();

    for (const binding of bindingList) {
      const el = resolveElement(binding.target);
      if (!el) continue;

      const rawVal = binding.selector(state);
      const formatted = binding.format ? binding.format(rawVal) : String(rawVal ?? '');
      const prop = binding.property ?? 'textContent';

      if (prop === 'textContent') {
        el.textContent = formatted;
      } else if (prop === 'innerHTML') {
        el.innerHTML = formatted;
      } else if (prop === 'value' && ('value' in el)) {
        (el as HTMLInputElement).value = formatted;
      } else {
        (el as any)[prop] = formatted;
      }
    }
  }

  // Initial update
  updateDOM();

  // Listen to changes
  const unsubState = homura.on('state:change', () => updateDOM());
  const unsubBranch = homura.on('branch:switch', () => updateDOM());

  return () => {
    unsubState();
    unsubBranch();
  };
}
