import { DevToolsBridge } from '../types';

export class PlaybackControls {
  private element: HTMLElement;
  private bridge: DevToolsBridge;
  private isPlaying = false;
  private playTimer: any = null;
  private playSpeedMs = 600;

  constructor(bridge: DevToolsBridge) {
    this.bridge = bridge;
    this.element = document.createElement('div');
    this.element.className = 'homura-playback-bar';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public update(): void {
    this.render();
  }

  public destroy(): void {
    this.stopPlayback();
  }

  private startPlayback(): void {
    this.isPlaying = true;
    this.updatePlayBtnState();

    const snapshot = this.bridge.getSnapshot();
    const entries = snapshot.entries;
    const curIdx = entries.findIndex(e => e.id === snapshot.currentEntry.id);

    // If at the end, jump to beginning first
    if (curIdx >= entries.length - 1 && entries.length > 1) {
      this.bridge.jumpTo(entries[0]!.id);
    }

    this.playTimer = setInterval(() => {
      const snap = this.bridge.getSnapshot();
      const currentEntries = snap.entries;
      const index = currentEntries.findIndex(e => e.id === snap.currentEntry.id);

      if (index < currentEntries.length - 1) {
        this.bridge.jumpTo(currentEntries[index + 1]!.id);
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
    const entries = snapshot.entries;
    const curIdx = entries.findIndex(e => e.id === snapshot.currentEntry.id);
    const maxIdx = Math.max(0, entries.length - 1);
    const currentPos = curIdx >= 0 ? curIdx : 0;

    this.element.innerHTML = `
      <div class="homura-controls-group">
        <button class="hm-btn hm-btn-icon hm-btn-start" title="Rewind to start">⏮</button>
        <button class="hm-btn hm-btn-icon hm-btn-rewind-10" title="Rewind 10 steps">-10</button>
        <button class="hm-btn hm-btn-icon hm-btn-rewind-5" title="Rewind 5 steps">-5</button>
        <button class="hm-btn hm-btn-icon hm-btn-undo" title="Undo 1 step">◀ Undo</button>
      </div>

      <div style="flex: 1; display: flex; align-items: center; gap: 10px; margin: 0 10px;">
        <span style="font-family: var(--hm-font-mono); font-size: 11px; color: var(--hm-text-secondary); min-width: 45px;">
          #${currentPos + 1}/${entries.length}
        </span>
        <input type="range" class="homura-scrubber-slider" min="0" max="${maxIdx}" value="${currentPos}" />
      </div>

      <div class="homura-controls-group">
        <button class="hm-btn hm-btn-play">${this.isPlaying ? '⏸ Pause' : '▶ Play'}</button>
        <button class="hm-btn hm-btn-icon hm-btn-redo" title="Redo 1 step">Redo ▶</button>
        <button class="hm-btn hm-btn-icon hm-btn-ff-5" title="Forward 5 steps">+5</button>
        <button class="hm-btn hm-btn-icon hm-btn-ff-10" title="Forward 10 steps">+10</button>
        <button class="hm-btn hm-btn-icon hm-btn-end" title="Fast-forward to latest">⏭</button>
      </div>
    `;

    // Hook events
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
