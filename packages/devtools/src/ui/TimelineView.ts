import { HistoryEntry } from '@homura-js/core';
import { DevToolsBridge } from '../types';

export class TimelineView {
  private element: HTMLElement;
  private bridge: DevToolsBridge;
  private filterQuery = '';
  private onSelectEntry?: (entry: HistoryEntry<any>) => void;

  constructor(
    bridge: DevToolsBridge,
    options?: { onSelectEntry?: (entry: HistoryEntry<any>) => void }
  ) {
    this.bridge = bridge;
    this.onSelectEntry = options?.onSelectEntry;

    this.element = document.createElement('div');
    this.element.className = 'homura-sidebar';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public update(): void {
    this.render();
  }

  public setFilter(query: string): void {
    this.filterQuery = query.toLowerCase();
    this.renderList();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="homura-sidebar-header">
        <span class="homura-sidebar-title">Timeline (${this.bridge.getSnapshot().entries.length})</span>
      </div>
      <div style="padding: 8px 10px 0 10px;">
        <input type="text" class="homura-search-input" placeholder="Search entries..." value="${this.filterQuery}" />
      </div>
      <div class="homura-timeline-list"></div>
    `;

    const searchInput = this.element.querySelector('.homura-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        this.setFilter((e.target as HTMLInputElement).value);
      });
    }

    this.renderList();
  }

  private renderList(): void {
    const listContainer = this.element.querySelector('.homura-timeline-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const snapshot = this.bridge.getSnapshot();
    const currentId = snapshot.currentEntry.id;
    let entries = snapshot.entries;

    if (this.filterQuery) {
      entries = entries.filter(
        e =>
          e.label.toLowerCase().includes(this.filterQuery) ||
          e.id.toLowerCase().includes(this.filterQuery) ||
          e.branchId.toLowerCase().includes(this.filterQuery)
      );
    }

    if (entries.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--hm-text-muted);">
          No matching history entries
        </div>
      `;
      return;
    }

    entries.forEach((entry, idx) => {
      const card = document.createElement('div');
      const isActive = entry.id === currentId;
      card.className = `homura-timeline-card ${isActive ? 'active' : ''}`;

      const timeFormatted = new Date(entry.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      card.innerHTML = `
        <div class="homura-card-header">
          <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${
              isActive ? 'var(--hm-accent)' : 'var(--hm-text-muted)'
            };"></span>
            <span class="homura-card-label" title="${entry.label}">${entry.label}</span>
          </div>
          <span class="homura-card-index">#${idx + 1}</span>
        </div>
        <div class="homura-card-meta">
          <span class="homura-branch-badge">${entry.branchId}</span>
          <span class="homura-card-time">${timeFormatted}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.bridge.jumpTo(entry.id);
        if (this.onSelectEntry) {
          this.onSelectEntry(entry);
        }
      });

      listContainer.appendChild(card);
    });
  }
}
