import { HistoryEntry } from '@homura-js/core';
import { DevToolsBridge } from '../types';

export class PlaybackControls {
  private element: HTMLElement;
  private bridge: DevToolsBridge;
  private isPlaying = false;
  private playTimer: any = null;
  private playSpeedMs = 600;
  private shortcutsEnabled = false;

  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(bridge: DevToolsBridge) {
    this.bridge = bridge;
    this.element = document.createElement('div');
    this.element.className = 'homura-playback-bar';
    this.element.tabIndex = -1;

    this.setupKeyboardShortcuts();
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Enables/disables global playback shortcuts.
   * Call with true only while the DevTools panel is open and interactive.
   */
  public setShortcutsEnabled(enabled: boolean): void {
    this.shortcutsEnabled = enabled;
  }

  public update(): void {
    this.render();
  }

  public destroy(): void {
    this.stopPlayback();
    if (this.keydownHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  private isPanelOpen(): boolean {
    const root = this.element.closest('.homura-devtools-root, .homura-floating-container');
    if (!root) return this.shortcutsEnabled;
    return !root.classList.contains('minimized');
  }

  private isShortcutContextActive(): boolean {
    if (!this.isPanelOpen() && !this.shortcutsEnabled) return false;

    const active = document.activeElement as HTMLElement | null;
    const activeTag = active?.tagName?.toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea' || active?.isContentEditable) {
      return false;
    }

    // Explicitly enabled by mount/open (panel is interactive)
    if (this.shortcutsEnabled && this.isPanelOpen()) {
      return true;
    }

    const root = this.element.closest('.homura-devtools-root, .homura-floating-container');
    if (root && active && root.contains(active)) {
      return true;
    }

    return false;
  }

  /** Active-branch linear timeline from root to branch head (not only to current cursor). */
  private getTimelineEntries(): HistoryEntry<any>[] {
    const homura = this.bridge.homura;
    const headId = homura.getCurrentBranch().headEntryId;
    const byId = new Map(
      homura.getHistory({ allBranches: true }).map(e => [e.id, e] as const)
    );

    const timeline: HistoryEntry<any>[] = [];
    let cur = byId.get(headId);
    const guard = new Set<string>();
    while (cur && !guard.has(cur.id)) {
      guard.add(cur.id);
      timeline.unshift(cur);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return timeline;
  }

  private setupKeyboardShortcuts(): void {
    if (typeof window === 'undefined') return;

    this.keydownHandler = (e: KeyboardEvent) => {
      if (!this.isShortcutContextActive()) return;

      const timeline = this.getTimelineEntries();

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.bridge.undo();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.bridge.redo();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (this.isPlaying) {
          this.stopPlayback();
        } else {
          this.startPlayback();
        }
      } else if (e.key === 'Home') {
        if (timeline.length > 0) {
          e.preventDefault();
          this.bridge.jumpTo(timeline[0]!.id);
        }
      } else if (e.key === 'End') {
        if (timeline.length > 0) {
          e.preventDefault();
          this.bridge.jumpTo(timeline[timeline.length - 1]!.id);
        }
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
  }

  private startPlayback(): void {
    this.isPlaying = true;
    this.updatePlayBtnState();

    const entries = this.getTimelineEntries();
    const snapshot = this.bridge.getSnapshot();
    const curIdx = entries.findIndex(e => e.id === snapshot.currentEntry.id);

    // If at the end, jump to beginning of active timeline first
    if (curIdx >= entries.length - 1 && entries.length > 1) {
      this.bridge.jumpTo(entries[0]!.id);
    }

    this.playTimer = setInterval(() => {
      const snap = this.bridge.getSnapshot();
      const currentEntries = this.getTimelineEntries();
      const index = currentEntries.findIndex(e => e.id === snap.currentEntry.id);

      if (index >= 0 && index < currentEntries.length - 1) {
        this.bridge.jumpTo(currentEntries[index + 1]!.id);
      } else if (this.bridge.homura.canRedo()) {
        this.bridge.redo();
      } else {
        this.stopPlayback();
      }
    }, this.playSpeedMs);
  }

  private stopPlayback(): void {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    this.updatePlayBtnState();
  }

  private updatePlayBtnState(): void {
    const playBtn = this.element.querySelector('.hm-btn-play');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
      if (this.isPlaying) {
        playBtn.classList.add('hm-btn-primary');
      } else {
        playBtn.classList.remove('hm-btn-primary');
      }
    }
  }

  private render(): void {
    const snapshot = this.bridge.getSnapshot();
    const entries = this.getTimelineEntries();
    const curIdx = entries.findIndex(e => e.id === snapshot.currentEntry.id);
    const maxIdx = Math.max(0, entries.length - 1);
    const currentPos = curIdx >= 0 ? curIdx : 0;

    this.element.innerHTML = `
      <div class="homura-controls-group">
        <button class="hm-btn hm-btn-icon hm-btn-start" title="Rewind to start (Home)">⏮</button>
        <button class="hm-btn hm-btn-icon hm-btn-rewind-10" title="Rewind 10 steps">-10</button>
        <button class="hm-btn hm-btn-icon hm-btn-rewind-5" title="Rewind 5 steps">-5</button>
        <button class="hm-btn hm-btn-icon hm-btn-undo" title="Undo 1 step (←)">◀ Undo</button>
      </div>

      <div style="flex: 1; display: flex; align-items: center; gap: 10px; margin: 0 10px;">
        <span style="font-family: var(--hm-font-mono); font-size: 11px; color: var(--hm-text-secondary); min-width: 45px;">
          #${currentPos + 1}/${entries.length}
        </span>
        <input type="range" class="homura-scrubber-slider" min="0" max="${maxIdx}" value="${currentPos}" />
      </div>

      <div class="homura-controls-group">
        <button class="hm-btn hm-btn-play" title="Play/Pause (Space)">${this.isPlaying ? '⏸ Pause' : '▶ Play'}</button>
        <select class="hm-select-speed" style="background: var(--hm-bg-card); color: var(--hm-text-primary); border: 1px solid var(--hm-border); border-radius: 4px; font-size: 11px; padding: 2px 4px;">
          <option value="1200"${this.playSpeedMs === 1200 ? ' selected' : ''}>0.5x</option>
          <option value="600"${this.playSpeedMs === 600 ? ' selected' : ''}>1x</option>
          <option value="300"${this.playSpeedMs === 300 ? ' selected' : ''}>2x</option>
          <option value="150"${this.playSpeedMs === 150 ? ' selected' : ''}>4x</option>
        </select>
        <button class="hm-btn hm-btn-icon hm-btn-redo" title="Redo 1 step (→)">Redo ▶</button>
        <button class="hm-btn hm-btn-icon hm-btn-ff-5" title="Forward 5 steps">+5</button>
        <button class="hm-btn hm-btn-icon hm-btn-ff-10" title="Forward 10 steps">+10</button>
        <button class="hm-btn hm-btn-icon hm-btn-end" title="Fast-forward to latest (End)">⏭</button>
      </div>
    `;

    const startBtn = this.element.querySelector('.hm-btn-start');
    startBtn?.addEventListener('click', () => {
      if (entries.length > 0) this.bridge.jumpTo(entries[0]!.id);
    });

    const rewind10 = this.element.querySelector('.hm-btn-rewind-10');
    rewind10?.addEventListener('click', () => this.bridge.rewind(10));

    const rewind5 = this.element.querySelector('.hm-btn-rewind-5');
    rewind5?.addEventListener('click', () => this.bridge.rewind(5));

    const undoBtn = this.element.querySelector('.hm-btn-undo');
    undoBtn?.addEventListener('click', () => this.bridge.undo());

    const playBtn = this.element.querySelector('.hm-btn-play');
    playBtn?.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stopPlayback();
      } else {
        this.startPlayback();
      }
    });

    const speedSelect = this.element.querySelector('.hm-select-speed') as HTMLSelectElement;
    speedSelect?.addEventListener('change', (e) => {
      this.playSpeedMs = parseInt((e.target as HTMLSelectElement).value, 10);
      if (this.isPlaying) {
        this.stopPlayback();
        this.startPlayback();
      }
    });

    const redoBtn = this.element.querySelector('.hm-btn-redo');
    redoBtn?.addEventListener('click', () => this.bridge.redo());

    const ff5 = this.element.querySelector('.hm-btn-ff-5');
    ff5?.addEventListener('click', () => this.bridge.fastForward(5));

    const ff10 = this.element.querySelector('.hm-btn-ff-10');
    ff10?.addEventListener('click', () => this.bridge.fastForward(10));

    const endBtn = this.element.querySelector('.hm-btn-end');
    endBtn?.addEventListener('click', () => {
      if (entries.length > 0) this.bridge.jumpTo(entries[entries.length - 1]!.id);
    });

    const slider = this.element.querySelector('.homura-scrubber-slider') as HTMLInputElement;
    slider?.addEventListener('input', e => {
      const idx = parseInt((e.target as HTMLInputElement).value, 10);
      if (entries[idx]) {
        this.bridge.jumpTo(entries[idx]!.id);
      }
    });
  }
}
