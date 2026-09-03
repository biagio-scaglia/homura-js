import {
  createHomura,
  diffStates,
  DiffChange,
  Homura,
  LocalStorageAdapter,
  PersistenceAdapter,
  SerializedHomura
} from '@homura-js/core';
import { encryptPayload, decryptPayload } from './crypto';
import { buildHandoffUrl, extractHandoffFromLocation, generateQrSvg } from './qr';
import { GhostAssistMonitor } from './ghost';
import { createVisualDiffViewer } from './textdiff';

export interface FormBindingOptions<T = Record<string, any>> {
  /** Initial form state if overriding DOM defaults */
  initialState?: T;
  /** Storage key for persistence */
  storageKey?: string;
  /** Persistence type */
  persist?: 'localstorage' | 'sessionstorage' | 'none';
  /** Privacy-First WebCrypto AES-GCM 256-bit encryption (default: false or 'aes-gcm') */
  crypto?: 'aes-gcm' | 'none' | boolean;
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
  /** Enable Behavioral / Rage-Detection Ghost Assist (default: true) */
  enableGhostAssist?: boolean;
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
  /** Generates cross-device handoff URL and SVG QR code modal */
  openHandoffModal: () => void;
  /** Opens visual copywriting word diff viewer for a specific field */
  openVisualDiff: (fieldName: string) => void;
  /** Ghost Assist behavioral monitor instance */
  ghostAssist?: GhostAssistMonitor;
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
export function maskPIIValue(_key: string, val: unknown): unknown {
  if (typeof val !== 'string') return val;
  const str = val.trim();
  if (str.length === 0) return '';

  if (str.includes('@')) {
    const [local, domain] = str.split('@');
    if (!local || !domain) return '***@***';
    const domainParts = domain.split('.');
    if (domainParts.length > 1) {
      const dName = domainParts[0] || '';
      const dExt = domainParts.slice(1).join('.');
      return `${local.charAt(0)}***@${dName.charAt(0)}***.${dExt}`;
    }
    return `${local.charAt(0)}***@${domain}`;
  }

  if (/^[\d+\-\s()]{7,}$/.test(str)) {
    return str.slice(0, 3) + ' **** ' + str.slice(-2);
  }

  if (str.length <= 3) return '***';
  return str.charAt(0) + '*'.repeat(Math.min(str.length - 2, 6)) + str.slice(-1);
}

/**
 * Encrypted WebCrypto LocalStorage Adapter for Zero-Knowledge Local Vault.
 */
class EncryptedLocalStorageAdapter<T> implements PersistenceAdapter<T> {
  private key: string;
  private useCrypto: boolean;

  constructor(key: string, useCrypto = true) {
    this.key = key;
    this.useCrypto = useCrypto;
  }

  async save(data: SerializedHomura<T>): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const raw = JSON.stringify(data);
    const payload = this.useCrypto ? await encryptPayload(raw) : raw;
    try {
      localStorage.setItem(this.key, payload);
    } catch (e) {
      console.warn('[HomuraJS] Storage save warning:', e);
    }
  }

  async load(): Promise<SerializedHomura<T> | null> {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;

    try {
      const decrypted = this.useCrypto ? await decryptPayload(raw) : raw;
      if (!decrypted) return null;
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.key);
    } catch (_) {}
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
  const customExclusions = options.excludeFields || [];
  const schemaVersion = options.schemaVersion ?? (form.getAttribute('data-homura-schema-version') || 1);
  const useCrypto = options.crypto === true || options.crypto === 'aes-gcm' || form.getAttribute('data-homura-crypto') === 'aes-gcm';
  const enableGhost = options.enableGhostAssist ?? form.getAttribute('data-homura-ghost-assist') !== 'false';

  const initialData = (options.initialState ?? extractFormData(form, customExclusions)) as T;

  const persistenceConfig = options.persist === 'localstorage' || (options.persist !== 'none' && options.persist !== 'sessionstorage')
    ? {
        adapter: useCrypto ? new EncryptedLocalStorageAdapter<T>(storageKey, true) : new LocalStorageAdapter<T>(storageKey),
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
    const handoffBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(
      `[data-homura-handoff="${formId}"], [data-homura-handoff=""], form[data-homura-form="${formId}"] [data-homura-handoff]`
    ));
    const visualDiffBtns = Array.from(document.querySelectorAll<HTMLButtonElement>(
      `[data-homura-visual-diff="${formId}"], [data-homura-visual-diff=""], form[data-homura-form="${formId}"] [data-homura-visual-diff]`
    ));

    return { undoBtns, redoBtns, clearBtns, handoffBtns, visualDiffBtns };
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

  // 5. Input Handler
  function handleInput(e: Event) {
    if (isSyncingFromState) return;
    const targetEl = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!targetEl || !targetEl.name || isFieldSensitive(targetEl, customExclusions)) return;

    updateStatusBadges('✏️ Editing...', 'editing');
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const currentFormValues = extractFormData(form, customExclusions);
      homura.update(draft => {
        Object.assign(draft, currentFormValues);
        (draft as Record<string, any>).__schemaVersion = schemaVersion;
      }, { label: `Field: ${targetEl.name}` });

      updateStatusBadges('💾 Draft saved', 'saved');
      options.onChange?.(homura.getState(), homura.getCurrentEntry().id);
    }, debounceMs);
  }

  form.addEventListener('input', handleInput);
  form.addEventListener('change', handleInput);

  // 6. Sync state changes to Form DOM
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
      updateStatusBadges(useCrypto ? '🔒 Encrypted draft saved' : '💾 Draft saved', 'saved');
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

  // 8. Handoff Modal
  function openHandoffModal() {
    const serialized = JSON.stringify(homura.export());
    const handoffUrl = buildHandoffUrl(serialized);
    const qrSvg = generateQrSvg(handoffUrl, 200);

    const modal = document.createElement('div');
    modal.className = 'homura-handoff-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 999999; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #0f071a; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; width: 100%; max-width: 440px; padding: 24px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <strong style="color: #f5f3ff; font-size: 16px;">📱 Continue on Mobile</strong>
          <button type="button" id="homura-modal-close" style="background: none; border: none; color: #c4b5fd; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <p style="font-size: 13px; color: #c4b5fd; line-height: 1.5; margin-bottom: 20px;">
          Scan this QR code with your phone's camera to instantly resume this form with its exact timeline history!
        </p>
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
          ${qrSvg}
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" id="homura-copy-handoff-btn" style="flex: 1; background: #a855f7; color: #fff; border: none; padding: 10px 14px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;">
            📋 Copy Handoff Link
          </button>
          <button type="button" id="homura-dismiss-handoff-btn" style="background: rgba(255,255,255,0.08); color: #c4b5fd; border: 1px solid rgba(255,255,255,0.15); padding: 10px 14px; border-radius: 6px; font-size: 13px; cursor: pointer;">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#homura-modal-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('#homura-dismiss-handoff-btn')?.addEventListener('click', () => modal.remove());
    modal.querySelector('#homura-copy-handoff-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(handoffUrl).then(() => {
        const btn = modal.querySelector('#homura-copy-handoff-btn') as HTMLButtonElement;
        if (btn) btn.textContent = '✅ Copied to Clipboard!';
      });
    });
  }

  // 9. Visual Copywriting Diff Viewer
  function openVisualDiff(fieldName: string) {
    const history = homura.getHistory();
    const historyEntries = history.map((e, idx) => ({
      id: e.id,
      timestamp: e.timestamp,
      label: e.label || `Step ${idx + 1}`,
      text: String((e.state as Record<string, any>)[fieldName] || '')
    }));

    const currentText = String((homura.getState() as Record<string, any>)[fieldName] || '');
    createVisualDiffViewer({
      fieldName,
      historyEntries,
      currentText,
      onJumpToEntry: (id) => {
        homura.jumpTo(id);
      }
    });
  }

  const { undoBtns, redoBtns, clearBtns, handoffBtns, visualDiffBtns } = getActionButtons();
  undoBtns.forEach(btn => btn.addEventListener('click', onUndoClick));
  redoBtns.forEach(btn => btn.addEventListener('click', onRedoClick));
  clearBtns.forEach(btn => btn.addEventListener('click', onClearClick));
  handoffBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openHandoffModal();
  }));

  visualDiffBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    const fieldName = btn.getAttribute('data-homura-visual-diff') || btn.getAttribute('data-field') || 'message';
    openVisualDiff(fieldName);
  }));

  // 10. Ghost Assist Behavioral Monitor
  let ghostAssist: GhostAssistMonitor | undefined;
  if (enableGhost) {
    ghostAssist = new GhostAssistMonitor(form, {
      formName: formId,
      onRestoreSnapshot: () => {
        homura.undo();
        updateStatusBadges('👻 Ghost Assist restored previous state', 'action');
      }
    });
  }

  // 11. Diff Engine helpers
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

  // 12. Conflict Recovery & DOM-State Integrity Check
  function verifyIntegrityAndRestore(): { restoredFields: string[]; hadConflict: boolean } {
    const state = homura.getState();
    const domValues = extractFormData(form, customExclusions);
    const restoredFields: string[] = [];

    for (const [key, stateVal] of Object.entries(state)) {
      if (key.startsWith('__') || stateVal === '' || stateVal === null || stateVal === undefined) continue;
      const currentDomVal = domValues[key];

      if (currentDomVal === '' || currentDomVal === null || currentDomVal === undefined) {
        const el = form.elements.namedItem(key);
        if (el && !isFieldSensitive(el as any, customExclusions)) {
          if (el instanceof HTMLInputElement) {
            if (el.type === 'checkbox') el.checked = Boolean(stateVal);
            else if (el.type === 'radio') el.checked = el.value === String(stateVal);
            else el.value = String(stateVal);
          } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
            el.value = String(stateVal);
          }
          restoredFields.push(key);
        }
      }
    }

    if (restoredFields.length > 0) {
      updateStatusBadges(`🛡️ Recovered ${restoredFields.length} field(s) from AJAX conflict`, 'restored');
    }

    return {
      restoredFields,
      hadConflict: restoredFields.length > 0
    };
  }

  // 13. WooCommerce AJAX Mutation Observer
  function setupWooCommerceAjaxObserver() {
    const isWooCheckout = form.classList.contains('woocommerce-checkout') || form.id === 'woocommerce-checkout' || formId.includes('woocommerce');
    if (!isWooCheckout || typeof MutationObserver === 'undefined') return;

    let ajaxDebounce: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (isSyncingFromState) return;
      if (ajaxDebounce) clearTimeout(ajaxDebounce);
      ajaxDebounce = setTimeout(() => {
        verifyIntegrityAndRestore();
      }, 150);
    });

    observer.observe(form, { childList: true, subtree: true });
    const jq = typeof window !== 'undefined' ? (window as any).jQuery : undefined;
    if (typeof jq !== 'undefined') {
      try {
        jq(document.body).on('updated_checkout updated_shipping_method payment_method_selected', () => {
          setTimeout(() => verifyIntegrityAndRestore(), 100);
        });
      } catch (_) {}
    }
  }

  setupWooCommerceAjaxObserver();

  // 14. Export Debug Snapshot with PII Masking
  function exportDebugSnapshot(debugOptions: { maskPII?: boolean } = {}): Record<string, any> {
    const shouldMask = debugOptions.maskPII !== false;
    const currentState = homura.getState();
    const history = homura.getHistory();

    const sanitizedState: Record<string, any> = {};
    for (const [k, v] of Object.entries(currentState)) {
      sanitizedState[k] = shouldMask ? maskPIIValue(k, v) : v;
    }

    const sanitizedHistory = history.map(entry => {
      const entryState: Record<string, any> = {};
      for (const [k, v] of Object.entries(entry.state as Record<string, any>)) {
        entryState[k] = shouldMask ? maskPIIValue(k, v) : v;
      }
      return {
        id: entry.id,
        label: entry.label,
        timestamp: entry.timestamp,
        branchId: entry.branchId,
        state: entryState
      };
    });

    return {
      version: 1,
      formId,
      schemaVersion,
      exportedAt: new Date().toISOString(),
      piiMasked: shouldMask,
      activeBranch: homura.getCurrentBranch().name,
      currentState: sanitizedState,
      history: sanitizedHistory
    };
  }

  // 15. Check incoming Multidevice Handoff URL token
  const incomingHandoff = extractHandoffFromLocation();
  if (incomingHandoff) {
    try {
      const parsed = JSON.parse(incomingHandoff);
      homura.import(parsed);
      isSyncingFromState = true;
      populateFormData(form, homura.getState(), customExclusions);
      isSyncingFromState = false;
      updateButtonsState();
      updateStatusBadges('📱 Handoff state transferred from mobile/device', 'restored');
      // Clear hash safely
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (e) {
      console.warn('[HomuraJS] Failed to restore handoff token:', e);
    }
  }

  // Initial populate & button status
  updateButtonsState();
  updateStatusBadges(useCrypto ? '🔒 Zero-Knowledge Vault Active' : '💾 Ready', 'saved');

  // Load persistence
  if (persistenceConfig && !incomingHandoff) {
    homura.load().then(loaded => {
      if (loaded) {
        let loadedState = homura.getState();
        const savedSchemaVersion = (loadedState as Record<string, any>).__schemaVersion;

        if (savedSchemaVersion !== undefined && String(savedSchemaVersion) !== String(schemaVersion)) {
          if (options.onSchemaMismatch) {
            loadedState = options.onSchemaMismatch(savedSchemaVersion, schemaVersion, loadedState);
          } else {
            updateStatusBadges(`🔄 Migrated schema v${savedSchemaVersion} ➔ v${schemaVersion}`, 'action');
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
    openHandoffModal,
    openVisualDiff,
    ghostAssist,
    destroy: () => {
      form.removeEventListener('input', handleInput);
      form.removeEventListener('change', handleInput);
      undoBtns.forEach(btn => btn.removeEventListener('click', onUndoClick));
      redoBtns.forEach(btn => btn.removeEventListener('click', onRedoClick));
      clearBtns.forEach(btn => btn.removeEventListener('click', onClearClick));
      nextBtns.forEach(b => b.removeEventListener('click', nextStep));
      prevBtns.forEach(b => b.removeEventListener('click', prevStep));
      ghostAssist?.destroy();
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
    const crypto = form.getAttribute('data-homura-crypto') === 'aes-gcm';
    const enableGhostAssist = form.getAttribute('data-homura-ghost-assist') !== 'false';

    return bindForm(form, {
      persist,
      debounceMs,
      smartRecovery,
      schemaVersion,
      crypto,
      enableGhostAssist
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
