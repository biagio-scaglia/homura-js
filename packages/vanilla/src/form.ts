import {
  createHomura,
  diffStates,
  DiffChange,
  HistoryEntry,
  Homura,
  LocalStorageAdapter
} from '@homura-js/core';

export interface FormBindingOptions<T = Record<string, any>> {
  /** Initial form state if overriding DOM defaults */
  initialState?: T;
  /** Storage key for persistence */
  storageKey?: string;
  /** Persistence type */
  persist?: 'localstorage' | 'sessionstorage' | 'none';
  /** Input change debounce delay in ms (default: 200) */
  debounceMs?: number;
  /** Max history entries (default: 200) */
  maxHistory?: number;
  /** Form schema version for migration (default: 1) */
  schemaVersion?: string | number;
  /** Custom sensitive field name patterns or attributes to exclude from persistence */
  excludeFields?: (string | RegExp)[];
  /** Custom callback when schema mismatch is detected */
  onSchemaMismatch?: (savedVersion: string | number, currentVersion: string | number, savedState: T) => T;
  /** Callback fired on state update */
  onChange?: (state: T, entryId: string) => void;
  /** Enable smart recovery prompt banner instead of immediate blind restore */
  smartRecovery?: boolean;
}

export interface FormDiffItem {
  field: string;
  label: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'updated';
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
  /** Inspect diff between current state and previous state or DOM */
  getDiff: (fromEntryId?: string, toEntryId?: string) => DiffChange[];
  /** Get user-friendly form diff between current DOM values and target/saved state */
  getDiffFromDom: (targetState?: T) => FormDiffItem[];
  /** Verifies DOM integrity against current state and restores any fields wiped by AJAX */
  verifyIntegrityAndRestore: () => { restoredFields: string[]; hadConflict: boolean };
  /** Export sanitized JSON debug payload with masked PII for troubleshooting */
  exportDebugSnapshot: (options?: { maskPII?: boolean }) => Record<string, any>;
}

const SENSITIVE_NAME_PATTERNS = /(password|passwd|pwd|cvv|cvc|card[_-]?number|credit[_-]?card|cc[_-]?num|expir|secret|nonce|token|stripe|auth[_-]?token)/i;

/**
 * Checks if a form element holds sensitive information that should never be persisted.
 */
export function isFieldSensitive(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  customExclusions: (string | RegExp)[] = []
): boolean {
  if (el.dataset.homuraSensitive === 'true' || el.dataset.homuraPersist === 'false') {
    return true;
  }
  if (el instanceof HTMLInputElement) {
    if (el.type === 'password' || el.type === 'file') return true;
    if (el.type === 'hidden' && SENSITIVE_NAME_PATTERNS.test(el.name)) return true;
  }
  const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();
  if (['one-time-code', 'cc-number', 'cc-csc', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'current-password', 'new-password'].includes(autocomplete)) {
    return true;
  }
  const nameOrId = `${el.name || ''} ${el.id || ''}`;
  if (SENSITIVE_NAME_PATTERNS.test(nameOrId)) {
    return true;
  }
  for (const pattern of customExclusions) {
    if (typeof pattern === 'string') {
      if (el.name === pattern || el.id === pattern) return true;
    } else if (pattern instanceof RegExp && (pattern.test(el.name) || pattern.test(el.id))) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts form field values into a key-value object while filtering sensitive fields.
 */
export function extractFormData(
  form: HTMLFormElement,
  customExclusions: (string | RegExp)[] = []
): Record<string, any> {
  const data: Record<string, any> = {};
  const elements = Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

  for (const el of elements) {
    if (!el.name || el.disabled || isFieldSensitive(el, customExclusions)) continue;

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
export function populateFormData(
  form: HTMLFormElement,
  state: Record<string, any>,
  customExclusions: (string | RegExp)[] = []
): void {
  const elements = Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

  for (const el of elements) {
    if (!el.name || !(el.name in state) || isFieldSensitive(el, customExclusions)) continue;
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
 * Masks Personally Identifiable Information for safe debugging exports.
 */
export function maskPIIValue(key: string, val: any): any {
  if (val === null || val === undefined || typeof val === 'boolean' || typeof val === 'number') {
    return val;
  }
  const str = String(val);
  if (!str) return str;

  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('email') || str.includes('@')) {
    const parts = str.split('@');
    if (parts.length === 2) {
      const name = parts[0] || '';
      const domain = parts[1] || '';
      const domainExt = domain.split('.').pop() || 'com';
      return `${name.charAt(0)}***@${domain.charAt(0)}***.${domainExt}`;
    }
  }

  if (lowerKey.includes('phone') || lowerKey.includes('tel') || /^\+?[0-9\s-]{6,}$/.test(str)) {
    return str.slice(0, 3) + ' **** ' + str.slice(-2);
  }

  if (str.length <= 3) return '***';
  return str.charAt(0) + '*'.repeat(Math.min(str.length - 2, 6)) + str.slice(-1);
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
  const customExclusions = options.excludeFields || [];
  const schemaVersion = options.schemaVersion ?? (form.getAttribute('data-homura-schema-version') || 1);

  const initialData = (options.initialState ?? extractFormData(form, customExclusions)) as T;

  const persistenceConfig = options.persist === 'localstorage' || (options.persist !== 'none' && options.persist !== 'sessionstorage')
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

  // 1. Linked Action Buttons
  function getActionButtons() {
    const undoBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(
      `[data-homura-undo="${formId}"], [data-homura-undo=""], form[data-homura-form="${formId}"] [data-homura-undo]`
    ));
    const redoBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(
      `[data-homura-redo="${formId}"], [data-homura-redo=""], form[data-homura-form="${formId}"] [data-homura-redo]`
    ));
    const clearBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(
      `[data-homura-clear="${formId}"], [data-homura-clear=""], [data-homura-reset="${formId}"], [data-homura-reset=""], form[data-homura-form="${formId}"] [data-homura-clear], form[data-homura-form="${formId}"] [data-homura-reset]`
    ));
    return { undoBtns, redoBtns, clearBtns };
  }

  // 2. Status Badges
  function updateStatusBadges(message: string, type: 'saved' | 'editing' | 'restored' | 'action' = 'saved') {
    const badges = document.querySelectorAll<HTMLElement>(
      `[data-homura-status="${formId}"], [data-homura-status=""], form[data-homura-form="${formId}"] [data-homura-status]`
    );
    badges.forEach(b => {
      b.textContent = message;
      b.setAttribute('data-status-type', type);
    });
  }

  // 3. Breadcrumbs
  function updateBreadcrumbs() {
    const containers = document.querySelectorAll<HTMLElement>(
      `[data-homura-breadcrumbs="${formId}"], [data-homura-breadcrumbs=""], form[data-homura-form="${formId}"] [data-homura-breadcrumbs]`
    );
    if (containers.length === 0) return;

    const timeline = homura.getHistory();
    const currentEntry = homura.getCurrentEntry();

    containers.forEach(c => {
      c.innerHTML = '';
      timeline.forEach((entry: HistoryEntry<T>, idx) => {
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

  // 5. Input Event Handling with Conditional Memory
  function handleInput(e: Event) {
    if (isSyncingFromState) return;
    const targetEl = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!targetEl || !targetEl.name || isFieldSensitive(targetEl, customExclusions)) return;

    updateStatusBadges('✏️ Editing...', 'editing');
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const currentDomValues = extractFormData(form, customExclusions);
      homura.update(draft => {
        Object.assign(draft, currentDomValues);
        (draft as Record<string, any>).__schemaVersion = schemaVersion;
      }, { label: `Field: ${targetEl.name}` });

      updateStatusBadges('💾 Draft saved', 'saved');
      options.onChange?.(homura.getState(), homura.getCurrentEntry().id);
    }, debounceMs);
  }

  form.addEventListener('input', handleInput);
  form.addEventListener('change', handleInput);

  // 6. DOM Sync & Event Subscriptions
  const unsubState = homura.on('state:change', ({ state, entry, action }) => {
    isSyncingFromState = true;
    populateFormData(form, state, customExclusions);
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
    } else if (action === 'clearHistory') {
      updateStatusBadges('🗑️ Draft cleared', 'action');
    } else {
      updateStatusBadges('💾 Draft saved', 'saved');
    }

    options.onChange?.(state, entry.id);
  });

  const unsubBranch = homura.on('branch:switch', () => {
    isSyncingFromState = true;
    const currentState = homura.getState();
    const currentEntry = homura.getCurrentEntry();
    populateFormData(form, currentState, customExclusions);
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

  // 7. Button Listeners
  function onUndoClick(e: MouseEvent) {
    e.preventDefault();
    homura.undo();
  }

  function onRedoClick(e: MouseEvent) {
    e.preventDefault();
    homura.redo();
  }

  function onClearClick(e: MouseEvent) {
    e.preventDefault();
    try {
      form.reset();
    } catch (_) {}
    const emptyData = extractFormData(form, customExclusions) as T;
    homura.clearHistory(false);
    if (persistenceConfig && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (_) {}
    }
    isSyncingFromState = true;
    populateFormData(form, emptyData, customExclusions);
    isSyncingFromState = false;
    updateButtonsState();
    updateStatusBadges('🗑️ Draft cleared', 'action');
  }

  const { undoBtns, redoBtns, clearBtns } = getActionButtons();
  undoBtns.forEach(btn => btn.addEventListener('click', onUndoClick));
  redoBtns.forEach(btn => btn.addEventListener('click', onRedoClick));
  clearBtns.forEach(btn => btn.addEventListener('click', onClearClick));

  // 8. Diff Engine helpers
  function getDiff(fromEntryId?: string, toEntryId?: string): DiffChange[] {
    const history = homura.getHistory();
    if (history.length === 0) return [];
    const from = fromEntryId ? history.find(e => e.id === fromEntryId)?.state : (history[0] ? history[0].state : undefined);
    const to = toEntryId ? history.find(e => e.id === toEntryId)?.state : homura.getState();
    if (!from || !to) return [];
    return diffStates(from, to);
  }

  function getDiffFromDom(targetState?: T): FormDiffItem[] {
    const domValues = extractFormData(form, customExclusions);
    const state = targetState || homura.getState();
    const diffs: FormDiffItem[] = [];

    const allKeys = Array.from(new Set([...Object.keys(domValues), ...Object.keys(state)]));
    for (const key of allKeys) {
      if (key.startsWith('__')) continue;
      const domVal = domValues[key];
      const stateVal = state[key];

      if (domVal === undefined && stateVal !== undefined) {
        diffs.push({ field: key, label: formatFieldLabel(key), oldValue: undefined, newValue: stateVal, type: 'added' });
      } else if (domVal !== undefined && stateVal === undefined) {
        diffs.push({ field: key, label: formatFieldLabel(key), oldValue: domVal, newValue: undefined, type: 'removed' });
      } else if (JSON.stringify(domVal) !== JSON.stringify(stateVal)) {
        diffs.push({ field: key, label: formatFieldLabel(key), oldValue: domVal, newValue: stateVal, type: 'updated' });
      }
    }
    return diffs;
  }

  function formatFieldLabel(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }

  // 9. Conflict Recovery & DOM-State Integrity Check
  function verifyIntegrityAndRestore(): { restoredFields: string[]; hadConflict: boolean } {
    const state = homura.getState();
    const domValues = extractFormData(form, customExclusions);
    const restoredFields: string[] = [];

    for (const [key, stateVal] of Object.entries(state)) {
      if (key.startsWith('__') || stateVal === '' || stateVal === null || stateVal === undefined) continue;
      const domVal = domValues[key];
      if (domVal === '' || domVal === null || domVal === undefined) {
        const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (input && !isFieldSensitive(input, customExclusions)) {
          if (input instanceof HTMLInputElement && input.type === 'checkbox') {
            input.checked = Boolean(stateVal);
          } else if (input instanceof HTMLInputElement && input.type === 'radio') {
            input.checked = input.value === String(stateVal);
          } else {
            input.value = String(stateVal);
          }
          restoredFields.push(key);
        }
      }
    }

    if (restoredFields.length > 0) {
      updateStatusBadges(`🛡️ Recovered ${restoredFields.length} field(s) after refresh`, 'action');
    }
    return { restoredFields, hadConflict: restoredFields.length > 0 };
  }

  // 10. Sanitized Debug Snapshot Export
  function exportDebugSnapshot(debugOptions: { maskPII?: boolean } = { maskPII: true }): Record<string, any> {
    const history = homura.getHistory();
    const currentState = homura.getState();
    const mask = debugOptions.maskPII !== false;

    const sanitizeState = (st: Record<string, any>) => {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(st)) {
        out[k] = mask ? maskPIIValue(k, v) : v;
      }
      return out;
    };

    return {
      formId,
      schemaVersion,
      timestamp: Date.now(),
      historyLength: history.length,
      currentState: sanitizeState(currentState),
      timeline: history.map(h => ({
        id: h.id,
        label: h.label,
        timestamp: h.timestamp,
        state: sanitizeState(h.state)
      }))
    };
  }

  // 11. Smart Recovery Banner Handlers
  function setupSmartRecoveryBanner(savedState: T) {
    const banners = document.querySelectorAll<HTMLElement>(
      `[data-homura-banner="${formId}"], [data-homura-banner=""], form[data-homura-form="${formId}"] [data-homura-banner]`
    );
    if (banners.length === 0) return;

    banners.forEach(banner => {
      banner.style.display = '';
      banner.classList.add('homura-banner-visible');

      const restoreBtns = banner.querySelectorAll<HTMLButtonElement>('[data-homura-restore]');
      const diffBtns = banner.querySelectorAll<HTMLButtonElement>('[data-homura-diff]');
      const dismissBtns = banner.querySelectorAll<HTMLButtonElement>('[data-homura-dismiss]');

      restoreBtns.forEach(btn => {
        btn.onclick = () => {
          isSyncingFromState = true;
          populateFormData(form, savedState, customExclusions);
          isSyncingFromState = false;
          banner.style.display = 'none';
          updateButtonsState();
          updateStatusBadges('📦 Restored draft', 'restored');
        };
      });

      diffBtns.forEach(btn => {
        btn.onclick = () => {
          const diffs = getDiffFromDom(savedState);
          renderDiffModal(diffs, savedState, banner);
        };
      });

      dismissBtns.forEach(btn => {
        btn.onclick = () => {
          banner.style.display = 'none';
          updateStatusBadges('💾 New session', 'saved');
        };
      });
    });
  }

  function renderDiffModal(diffs: FormDiffItem[], savedState: T, bannerEl: HTMLElement) {
    let modal = document.querySelector<HTMLElement>('.homura-diff-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'homura-diff-modal';
      document.body.appendChild(modal);
    }

    const rows = diffs.map(d => `
      <tr>
        <td><strong>${d.label}</strong></td>
        <td class="homura-diff-old">${d.oldValue === undefined || d.oldValue === '' ? '<em>(empty)</em>' : String(d.oldValue)}</td>
        <td class="homura-diff-new">${d.newValue === undefined || d.newValue === '' ? '<em>(empty)</em>' : String(d.newValue)}</td>
      </tr>
    `).join('');

    modal.innerHTML = `
      <div class="homura-diff-backdrop"></div>
      <div class="homura-diff-content">
        <h3>🧬 State Diff — Changes Found in Saved Draft</h3>
        <table class="homura-diff-table">
          <thead>
            <tr><th>Field</th><th>Current DOM</th><th>Saved Draft</th></tr>
          </thead>
          <tbody>${rows.length > 0 ? rows : '<tr><td colspan="3">No differences found.</td></tr>'}</tbody>
        </table>
        <div class="homura-diff-footer">
          <button type="button" class="homura-btn-modal-restore">Apply Saved Draft</button>
          <button type="button" class="homura-btn-modal-close">Close</button>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('.homura-btn-modal-close');
    const restoreBtn = modal.querySelector('.homura-btn-modal-restore');
    const backdrop = modal.querySelector('.homura-diff-backdrop');

    const closeModal = () => modal?.remove();
    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    restoreBtn?.addEventListener('click', () => {
      isSyncingFromState = true;
      populateFormData(form, savedState, customExclusions);
      isSyncingFromState = false;
      bannerEl.style.display = 'none';
      closeModal();
      updateButtonsState();
      updateStatusBadges('📦 Restored draft from Diff', 'restored');
    });
  }

  // Initial populate & button status
  updateButtonsState();
  updateStatusBadges('💾 Ready', 'saved');

  // Load persistence and handle Schema Versioning & Smart Recovery
  if (persistenceConfig) {
    homura.load().then(loaded => {
      if (loaded) {
        let loadedState = homura.getState();
        const savedSchemaVersion = (loadedState as Record<string, any>).__schemaVersion;

        // Handle Schema Version mismatch
        if (savedSchemaVersion !== undefined && String(savedSchemaVersion) !== String(schemaVersion)) {
          if (options.onSchemaMismatch) {
            loadedState = options.onSchemaMismatch(savedSchemaVersion, schemaVersion, loadedState);
          } else {
            updateStatusBadges(`🔄 Migrated schema v${savedSchemaVersion} ➔ v${schemaVersion}`, 'action');
          }
        }

        if (options.smartRecovery) {
          const diffs = getDiffFromDom(loadedState);
          if (diffs.length > 0) {
            setupSmartRecoveryBanner(loadedState);
            updateStatusBadges('📦 Saved draft available', 'restored');
            return;
          }
        }

        populateFormData(form, loadedState, customExclusions);
        if (typeof (loadedState as Record<string, any>).__step === 'number') {
          currentStepIndex = (loadedState as Record<string, any>).__step;
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
      onClearClick(new MouseEvent('click'));
    },
    nextStep,
    prevStep,
    setStep,
    getDiff,
    getDiffFromDom,
    verifyIntegrityAndRestore,
    exportDebugSnapshot,
    destroy: () => {
      form.removeEventListener('input', handleInput);
      form.removeEventListener('change', handleInput);
      undoBtns.forEach(btn => btn.removeEventListener('click', onUndoClick));
      redoBtns.forEach(btn => btn.removeEventListener('click', onRedoClick));
      clearBtns.forEach(btn => btn.removeEventListener('click', onClearClick));
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
    const smartRecovery = form.getAttribute('data-homura-smart-recovery') === 'true';
    const schemaVersion = form.getAttribute('data-homura-schema-version') || 1;

    return bindForm(form, {
      persist,
      debounceMs,
      smartRecovery,
      schemaVersion
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
