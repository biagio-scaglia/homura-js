import { DevToolsBridge } from '../types';

export class SnapshotsView {
  private element: HTMLElement;
  private bridge: DevToolsBridge;

  constructor(bridge: DevToolsBridge) {
    this.bridge = bridge;
    this.element = document.createElement('div');
    this.element.className = 'homura-tab-content';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public update(): void {
    this.render();
  }

  private render(): void {
    const snapshot = this.bridge.getSnapshot();
    const snapshots = snapshot.snapshots;

    this.element.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <input type="text" class="homura-search-input hm-snap-input" placeholder="Snapshot label (e.g. Before Boss Battle)..." />
        <button class="hm-btn hm-btn-primary hm-btn-take-snap">Capture Snapshot</button>
      </div>
      <div class="homura-snapshots-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
    `;

    const input = this.element.querySelector('.hm-snap-input') as HTMLInputElement;
    const takeBtn = this.element.querySelector('.hm-btn-take-snap');

    takeBtn?.addEventListener('click', () => {
      const name = input?.value.trim();
      this.bridge.takeSnapshot(name || undefined);
      if (input) input.value = '';
    });

    const list = this.element.querySelector('.homura-snapshots-list');
    if (!list) return;

    if (snapshots.length === 0) {
      list.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--hm-text-muted);">
          No saved snapshots yet. Take a snapshot to bookmark any state point in time!
        </div>
      `;
      return;
    }

    snapshots.forEach(snap => {
      const card = document.createElement('div');
      card.style.background = 'var(--hm-bg-surface)';
      card.style.border = '1px solid var(--hm-border)';
      card.style.borderRadius = 'var(--hm-radius-md)';
      card.style.padding = '10px 14px';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';

      const timeStr = new Date(snap.timestamp).toLocaleString();

      card.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-weight: 700; font-size: 13px; color: var(--hm-text-primary);">${snap.name}</span>
          <span style="font-size: 11px; color: var(--hm-text-muted);">${timeStr}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="hm-btn hm-btn-restore" style="color: var(--hm-green);">Restore</button>
          <button class="hm-btn hm-btn-delete" style="color: var(--hm-red);">Delete</button>
        </div>
      `;

      card.querySelector('.hm-btn-restore')?.addEventListener('click', () => {
        this.bridge.restoreSnapshot(snap.id);
      });

      card.querySelector('.hm-btn-delete')?.addEventListener('click', () => {
        this.bridge.deleteSnapshot(snap.id);
      });

      list.appendChild(card);
    });
  }
}
