/**
 * HomuraJS — Sensory & Behavioral Rage Detection ("Ghost Assist")
 * Detects user frustration, mass accidental deletions, and rage-clicks to offer instant recovery.
 */

export interface GhostAssistOptions {
  onRestoreSnapshot?: () => void;
  formName?: string;
  enableRageClicks?: boolean;
  enableMassErasure?: boolean;
  massErasureThreshold?: number; // percentage (e.g. 0.5 = 50%)
}

export class GhostAssistMonitor {
  private form: HTMLFormElement;
  private options: GhostAssistOptions;
  private clickTimestamps: number[] = [];
  private lastFieldValues: Map<string, { value: string; timestamp: number }> = new Map();
  private isToastVisible = false;
  private toastElement: HTMLElement | null = null;

  constructor(form: HTMLFormElement, options: GhostAssistOptions = {}) {
    this.form = form;
    this.options = {
      enableRageClicks: true,
      enableMassErasure: true,
      massErasureThreshold: 0.5,
      ...options
    };

    this.bindEvents();
  }

  private bindEvents(): void {
    if (this.options.enableMassErasure) {
      this.form.addEventListener('keydown', this.handleKeyDown.bind(this), { passive: true });
      this.form.addEventListener('input', this.handleInput.bind(this), { passive: true });
    }

    if (this.options.enableRageClicks) {
      this.form.addEventListener('click', this.handleClick.bind(this), { passive: true });
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (!target || !target.name || !('value' in target)) return;

    if (!this.lastFieldValues.has(target.name)) {
      this.lastFieldValues.set(target.name, {
        value: target.value,
        timestamp: Date.now()
      });
    }
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (!target || !target.name || !('value' in target)) return;

    const previous = this.lastFieldValues.get(target.name);
    const currentValue = target.value;
    const now = Date.now();

    if (previous && previous.value.length > 25) {
      const prevLen = previous.value.length;
      const currLen = currentValue.length;
      const timeDiff = now - previous.timestamp;

      // If more than threshold % erased in under 3 seconds
      if (currLen < prevLen * (1 - (this.options.massErasureThreshold || 0.5)) && timeDiff < 3000) {
        this.triggerGhostAssist(
          'Notice an accidental deletion?',
          `You just deleted a large paragraph in "${target.name}". I saved your previous version from moments ago.`
        );
      }
    }

    // Update tracked state periodically
    if (!previous || now - previous.timestamp > 2000) {
      this.lastFieldValues.set(target.name, {
        value: currentValue,
        timestamp: now
      });
    }
  }

  private handleClick(_e: MouseEvent): void {
    const now = Date.now();
    this.clickTimestamps.push(now);

    // Keep only timestamps within last 600ms
    this.clickTimestamps = this.clickTimestamps.filter(t => now - t < 600);

    if (this.clickTimestamps.length >= 4) {
      this.clickTimestamps = [];
      this.triggerGhostAssist(
        'Stuck or experiencing issues?',
        'We noticed rapid clicking. Would you like to step back or review the saved form timeline?'
      );
    }
  }

  /**
   * Displays the Ghost Assist floating proactive assistant.
   */
  public triggerGhostAssist(title: string, message: string): void {
    if (this.isToastVisible) return;
    this.isToastVisible = true;

    const toast = document.createElement('div');
    toast.className = 'homura-ghost-assist-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      max-width: 380px;
      background: #120921;
      border: 1px solid #a855f7;
      border-radius: 10px;
      padding: 16px 18px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(168, 85, 247, 0.3);
      color: #f5f3ff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      z-index: 99999;
      animation: homuraSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(168, 85, 247, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #c084fc;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path><circle cx="9" cy="10" r="1"></circle><circle cx="15" cy="10" r="1"></circle></svg>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: #fff; margin-bottom: 4px;">${title}</div>
          <div style="color: #c4b5fd; font-size: 12px; line-height: 1.4; margin-bottom: 12px;">${message}</div>
          <div style="display: flex; gap: 8px;">
            <button type="button" id="homura-ghost-restore-btn" style="background: #a855f7; color: #fff; border: none; padding: 6px 12px; border-radius: 5px; font-weight: 600; font-size: 11.5px; cursor: pointer;">
              ↩ Restore Previous
            </button>
            <button type="button" id="homura-ghost-dismiss-btn" style="background: rgba(255,255,255,0.08); color: #c4b5fd; border: 1px solid rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 5px; font-size: 11.5px; cursor: pointer;">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(toast);
    this.toastElement = toast;

    const restoreBtn = toast.querySelector('#homura-ghost-restore-btn');
    const dismissBtn = toast.querySelector('#homura-ghost-dismiss-btn');

    restoreBtn?.addEventListener('click', () => {
      this.options.onRestoreSnapshot?.();
      this.dismiss();
    });

    dismissBtn?.addEventListener('click', () => {
      this.dismiss();
    });

    // Auto dismiss after 15 seconds
    setTimeout(() => {
      this.dismiss();
    }, 15000);
  }

  public dismiss(): void {
    if (this.toastElement && this.toastElement.parentNode) {
      this.toastElement.parentNode.removeChild(this.toastElement);
    }
    this.isToastVisible = false;
    this.toastElement = null;
  }

  public destroy(): void {
    this.dismiss();
  }
}
