import { createHomura, Homura, LocalStorageAdapter } from '@homura-js/core';

export interface FormBindingOptions<T = Record<string, any>> {
  /** Initial form state if overriding DOM defaults */
  initialState?: T;
  /** Storage key for persistence */
  storageKey?: string;
  /** Persistence type */
  persist?: 'localstorage' | 'none';
  /** Input change debounce delay in ms (default: 200) */
  debounceMs?: number;
  /** Max history entries (default: 200) */
  maxHistory?: number;
  /** Callback fired on state update */
  onChange?: (state: T, entryId: string) => void;
}

export interface FormBindingController<T = Record<string, any>> {
  homura: Homura<T>;
  form: HTMLFormElement;
  destroy: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  nextStep?: () => void;
  prevStep?: () => void;
  setStep?: (stepIndex: number) => void;
}

/**
 * Extracts form field values into a key-value object.
 */
function extractFormData(form: HTMLFormElement): Record<string, any> {
  const data: Record<string, any> = {};
  const elements = Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

  for (const el of elements) {
    if (!el.name || el.disabled) continue;

    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') {
        data[el.name] = el.checked;
      } else if (el.type === 'radio') {
        if (el.checked) {
          data[el.name] = el.value;
        } else if (!(el.name in data)) {
          data[el.name] = '';
        }
      } else if (el.type === 'number') {
        data[el.name] = el.value === '' ? null : Number(el.value);
      } else {
        data[el.name] = el.value;
      }
    } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      data[el.name] = el.value;
    }
  }

  return data;
}

/**
 * Populates form fields from a state object.
 */
function populateFormData(form: HTMLFormElement, state: Record<string, any>): void {
  const elements = Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

  for (const el of elements) {
    if (!el.name || !(el.name in state)) continue;
    const val = state[el.name];

    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') {
        el.checked = Boolean(val);
      } else if (el.type === 'radio') {
        el.checked = el.value === String(val);
      } else {
        el.value = val === null || val === undefined ? '' : String(val);
      }
    } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      el.value = val === null || val === undefined ? '' : String(val);
    }
  }
}

/**
 * Binds a DOM HTML form to a Homura time-travel state engine.
 */
export function bindForm<T extends Record<string, any> = Record<string, any>>(
  target: HTMLFormElement | string,
  options: FormBindingOptions<T> = {}
): FormBindingController<T> {
  const resolved = typeof target === 'string' ? document.querySelector<HTMLFormElement>(target) : target;
  if (!resolved) {
    throw new Error(`[HomuraJS] Form element not found: ${target}`);
  }
  const form: HTMLFormElement = resolved;

  const formId = form.getAttribute('data-homura-form') || form.id || form.name || 'homura_form';
  const storageKey = options.storageKey || `homura_form_${formId}`;
  const debounceMs = options.debounceMs ?? 200;

  const initialData = (options.initialState ?? extractFormData(form)) as T;

  const persistenceConfig = options.persist === 'localstorage'
    ? {
        adapter: new LocalStorageAdapter<T>(storageKey),
        autoSave: true,
        debounceMs: 300
      }
    : undefined;

  const homura = createHomura<T>({
    initialState: initialData,
    maxHistory: options.maxHistory ?? 200,
    enableBranches: true,
    persistence: persistenceConfig
  });

  let isSyncingFromState = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // 1. Linked Undo/Redo/Reset Buttons
  function getActionButtons() {
    const undoBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(
      `[data-homura-undo="${formId}"], [data-homura-undo=""], form[data-homura-form="${formId}"] [data-homura-undo]`
    ));
    const redoBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(
      `[data-homura-redo="${formId}"], [data-homura-redo=""], form[data-homura-form="${formId}"] [data-homura-redo]`
    ));
    return { undoBtns, redoBtns };
  }

  // 2. Linked Status Badges
  function updateStatusBadges(message: string, type: 'saved' | 'editing' | 'restored' | 'action' = 'saved') {
    const badges = document.querySelectorAll<HTMLElement>(
      `[data-homura-status="${formId}"], [data-homura-status=""], form[data-homura-form="${formId}"] [data-homura-status]`
    );
    badges.forEach(b => {
      b.textContent = message;
      b.setAttribute('data-status-type', type);
    });
  }

  // 3. Linked Breadcrumbs Container
  function updateBreadcrumbs() {
    const containers = document.querySelectorAll<HTMLElement>(
      `[data-homura-breadcrumbs="${formId}"], [data-homura-breadcrumbs=""], form[data-homura-form="${formId}"] [data-homura-breadcrumbs]`
    );
    if (containers.length === 0) return;

    const timeline = homura.getHistory();
    const currentEntry = homura.getCurrentEntry();

    containers.forEach(c => {
      c.innerHTML = '';
      timeline.forEach((entry, idx) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `homura-breadcrumb-item ${entry.id === currentEntry.id ? 'active' : ''}`;
        item.textContent = `${idx + 1}. ${entry.label}`;
        item.addEventListener('click', () => {
          homura.jumpTo(entry.id);
        });
        c.appendChild(item);
      });
    });
  }

  // 4. Multi-Step Form Wizard Support
  const steps = Array.from(form.querySelectorAll<HTMLElement>('[data-homura-step]'));
  let currentStepIndex = 0;

  function renderWizardStep() {
    if (steps.length === 0) return;
    steps.forEach((stepEl, idx) => {
      if (idx === currentStepIndex) {
        stepEl.style.display = '';
        stepEl.classList.add('active-step');
      } else {
        stepEl.style.display = 'none';
        stepEl.classList.remove('active-step');
      }
    });

    // Update next/prev buttons
    const prevBtns = form.querySelectorAll<HTMLButtonElement>('[data-homura-prev]');
    const nextBtns = form.querySelectorAll<HTMLButtonElement>('[data-homura-next]');

    prevBtns.forEach(b => {
      b.disabled = currentStepIndex === 0;
    });
    nextBtns.forEach(b => {
      b.textContent = currentStepIndex === steps.length - 1 ? (b.getAttribute('data-submit-label') || 'Submit') : (b.getAttribute('data-next-label') || 'Next ➔');
    });
  }

  function nextStep() {
    if (currentStepIndex < steps.length - 1) {
      currentStepIndex++;
      renderWizardStep();
      homura.update(draft => {
        (draft as Record<string, any>).__step = currentStepIndex;
      }, { label: `Wizard Step ${currentStepIndex + 1}` });
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      renderWizardStep();
      homura.update(draft => {
        (draft as Record<string, any>).__step = currentStepIndex;
      }, { label: `Wizard Step ${currentStepIndex + 1}` });
    }
  }

  function setStep(idx: number) {
    if (idx >= 0 && idx < steps.length) {
      currentStepIndex = idx;
      renderWizardStep();
    }
  }

  // Bind wizard button listeners
  const nextBtns = form.querySelectorAll<HTMLButtonElement>('[data-homura-next]');
  const prevBtns = form.querySelectorAll<HTMLButtonElement>('[data-homura-prev]');
  nextBtns.forEach(b => b.addEventListener('click', nextStep));
  prevBtns.forEach(b => b.addEventListener('click', prevStep));

  renderWizardStep();

  function updateButtonsState() {
    const { undoBtns, redoBtns } = getActionButtons();
    const canUndo = homura.canUndo();
    const canRedo = homura.canRedo();

    undoBtns.forEach(btn => {
      btn.disabled = !canUndo;
      btn.classList.toggle('disabled', !canUndo);
    });
    redoBtns.forEach(btn => {
      btn.disabled = !canRedo;
      btn.classList.toggle('disabled', !canRedo);
    });

    updateBreadcrumbs();
  }

  // Handle Input Changes from User
  function handleInput(e: Event) {
    if (isSyncingFromState) return;
    const targetEl = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!targetEl || !targetEl.name) return;

    updateStatusBadges('✏️ Editing...', 'editing');
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const currentFormValues = extractFormData(form);
      homura.update(draft => {
        Object.assign(draft, currentFormValues);
      }, { label: `Field: ${targetEl.name}` });

      updateStatusBadges('💾 Draft saved', 'saved');
      options.onChange?.(homura.getState(), homura.getCurrentEntry().id);
    }, debounceMs);
  }

  form.addEventListener('input', handleInput);
  form.addEventListener('change', handleInput);

  // Sync state changes to Form DOM
  const unsubState = homura.on('state:change', ({ state, entry, action }) => {
    isSyncingFromState = true;
    populateFormData(form, state);
    if (steps.length > 0) {
      const stepVal = (state as Record<string, any>).__step;
      currentStepIndex = typeof stepVal === 'number' ? stepVal : 0;
      renderWizardStep();
    }
    isSyncingFromState = false;
    updateButtonsState();

    if (action === 'undo') {
      updateStatusBadges(`↩ Undone: ${entry.label}`, 'action');
    } else if (action === 'redo') {
      updateStatusBadges(`↪ Redone: ${entry.label}`, 'action');
    } else {
      updateStatusBadges('💾 Draft saved', 'saved');
    }

    options.onChange?.(state, entry.id);
  });

  const unsubBranch = homura.on('branch:switch', () => {
    isSyncingFromState = true;
    const currentState = homura.getState();
    const currentEntry = homura.getCurrentEntry();
    populateFormData(form, currentState);
    if (steps.length > 0) {
      const stepVal = (currentState as Record<string, any>).__step;
      currentStepIndex = typeof stepVal === 'number' ? stepVal : 0;
      renderWizardStep();
    }
    isSyncingFromState = false;
    updateButtonsState();
    updateStatusBadges('🌿 Switched timeline branch', 'action');
    options.onChange?.(currentState, currentEntry.id);
  });

  // Attach button click listeners
  function onUndoClick(e: MouseEvent) {
    e.preventDefault();
    homura.undo();
  }

  function onRedoClick(e: MouseEvent) {
    e.preventDefault();
    homura.redo();
  }

  const { undoBtns, redoBtns } = getActionButtons();
  undoBtns.forEach(btn => btn.addEventListener('click', onUndoClick));
  redoBtns.forEach(btn => btn.addEventListener('click', onRedoClick));

  // Initial populate & button status
  updateButtonsState();
  updateStatusBadges('💾 Ready', 'saved');

  // If persistence is active, attempt loading previous state
  if (options.persist === 'localstorage') {
    homura.load().then(loaded => {
      if (loaded) {
        populateFormData(form, homura.getState());
        if (typeof (homura.getState() as Record<string, any>).__step === 'number') {
          currentStepIndex = (homura.getState() as Record<string, any>).__step;
          renderWizardStep();
        }
        updateButtonsState();
        updateStatusBadges('📦 Restored previous session', 'restored');
      }
    });
  }

  return {
    homura,
    form,
    undo: () => { homura.undo(); },
    redo: () => { homura.redo(); },
    reset: () => {
      homura.update(draft => {
        Object.assign(draft, initialData);
      }, { label: 'Reset Form to Initial' });
    },
    nextStep,
    prevStep,
    setStep,
    destroy: () => {
      form.removeEventListener('input', handleInput);
      form.removeEventListener('change', handleInput);
      undoBtns.forEach(btn => btn.removeEventListener('click', onUndoClick));
      redoBtns.forEach(btn => btn.removeEventListener('click', onRedoClick));
      nextBtns.forEach(b => b.removeEventListener('click', nextStep));
      prevBtns.forEach(b => b.removeEventListener('click', prevStep));
      unsubState();
      unsubBranch();
      if (debounceTimer) clearTimeout(debounceTimer);
    }
  };
}

/**
 * Automatically scans and initializes all [data-homura-form] and [data-homura-wizard] in document.
 */
export function autoInitForms(): FormBindingController[] {
  if (typeof document === 'undefined') return [];

  const forms = Array.from(document.querySelectorAll<HTMLFormElement>('[data-homura-form], [data-homura-wizard]'));
  return forms.map(form => {
    const persistAttr = form.getAttribute('data-homura-persist');
    const persist = persistAttr === 'none' ? 'none' : 'localstorage';
    const debounceAttr = form.getAttribute('data-homura-debounce');
    const debounceMs = debounceAttr ? parseInt(debounceAttr, 10) : 200;

    return bindForm(form, {
      persist,
      debounceMs
    });
  });
}

// Auto-run in browser when DOM is ready
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoInitForms());
  } else {
    autoInitForms();
  }
}
