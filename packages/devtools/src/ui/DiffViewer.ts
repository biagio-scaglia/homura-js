import { formatDiffPath } from '@homura-js/core';
import { DevToolsBridge } from '../types';

export class DiffViewer {
  private element: HTMLElement;
  private bridge: DevToolsBridge;
  private entryAId: string | null = null;
  private entryBId: string | null = null;

  constructor(bridge: DevToolsBridge) {
    this.bridge = bridge;
    this.element = document.createElement('div');
    this.element.className = 'homura-tab-content';

    const snapshot = this.bridge.getSnapshot();
    const entries = snapshot.entries;
    if (entries.length >= 2) {
      const curIdx = entries.findIndex(e => e.id === snapshot.currentEntry.id);
      if (curIdx > 0) {
        this.entryAId = entries[curIdx - 1]!.id;
        this.entryBId = entries[curIdx]!.id;
      } else {
        this.entryAId = entries[0]!.id;
        this.entryBId = entries[1]!.id;
      }
    } else if (entries.length === 1) {
      this.entryAId = entries[0]!.id;
      this.entryBId = entries[0]!.id;
    }

    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public update(): void {
    this.render();
  }

  public setCompareEntries(entryAId: string, entryBId: string): void {
    this.entryAId = entryAId;
    this.entryBId = entryBId;
    this.render();
  }

  private render(): void {
    const snapshot = this.bridge.getSnapshot();
    const entries = snapshot.entries;

    if (entries.length === 0) {
      this.element.innerHTML = '<div style="color: var(--hm-text-muted);">No history entries available for comparison.</div>';
      return;
    }

    if (!this.entryAId && entries.length > 0) {
      this.entryAId = entries[0]!.id;
    }
    if (!this.entryBId && entries.length > 0) {
      this.entryBId = snapshot.currentEntry.id;
    }

    this.element.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; background: var(--hm-bg-surface); padding: 10px 14px; border-radius: var(--hm-radius-md); border: 1px solid var(--hm-border);">
        <span style="font-weight: 600; font-size: 12px; color: var(--hm-text-secondary);">Compare:</span>
        <select class="hm-select hm-select-a"></select>
        <span style="color: var(--hm-accent); font-weight: 700;">➔</span>
        <select class="hm-select hm-select-b"></select>
        <button class="hm-btn hm-btn-prev-cur" style="margin-left: auto;">Compare with Previous</button>
      </div>
      <div class="homura-diff-container"></div>
    `;

    const selectA = this.element.querySelector('.hm-select-a') as HTMLSelectElement;
    const selectB = this.element.querySelector('.hm-select-b') as HTMLSelectElement;

    entries.forEach((e, idx) => {
      const optA = document.createElement('option');
      optA.value = e.id;
      optA.textContent = `#${idx + 1} - ${e.label}`;
      if (e.id === this.entryAId) optA.selected = true;
      selectA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = e.id;
      optB.textContent = `#${idx + 1} - ${e.label}`;
      if (e.id === this.entryBId) optB.selected = true;
      selectB.appendChild(optB);
    });

    selectA.addEventListener('change', () => {
      this.entryAId = selectA.value;
      this.renderDiffList();
    });

    selectB.addEventListener('change', () => {
      this.entryBId = selectB.value;
      this.renderDiffList();
    });

    const prevCurBtn = this.element.querySelector('.hm-btn-prev-cur');
    if (prevCurBtn) {
      prevCurBtn.addEventListener('click', () => {
        const curIdx = entries.findIndex(e => e.id === snapshot.currentEntry.id);
        if (curIdx > 0) {
          this.entryAId = entries[curIdx - 1]!.id;
          this.entryBId = entries[curIdx]!.id;
          this.render();
        }
      });
    }

    this.renderDiffList();
  }

  private renderDiffList(): void {
    const diffContainer = this.element.querySelector('.homura-diff-container');
    if (!diffContainer) return;

    diffContainer.innerHTML = '';

    if (!this.entryAId || !this.entryBId) {
      diffContainer.innerHTML = '<div style="color: var(--hm-text-muted);">Select two entries to compare.</div>';
      return;
    }

    const entryA = this.bridge.getSnapshot().entries.find(e => e.id === this.entryAId);
    const entryB = this.bridge.getSnapshot().entries.find(e => e.id === this.entryBId);

    if (!entryA || !entryB) {
      diffContainer.innerHTML = '<div style="color: var(--hm-text-muted);">Selected entries not found.</div>';
      return;
    }

    const diffs = this.bridge.diff(entryA, entryB);

    if (diffs.length === 0) {
      diffContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--hm-green); background: rgba(46, 213, 115, 0.05); border-radius: var(--hm-radius-md); border: 1px solid rgba(46, 213, 115, 0.2);">
          ✓ Identical States (0 differences detected)
        </div>
      `;
      return;
    }

    const summary = document.createElement('div');
    summary.style.fontSize = '12px';
    summary.style.color = 'var(--hm-text-secondary)';
    summary.style.marginBottom = '8px';
    summary.textContent = `Found ${diffs.length} change${diffs.length > 1 ? 's' : ''}:`;
    diffContainer.appendChild(summary);

    diffs.forEach(change => {
      const item = document.createElement('div');
      item.className = `homura-diff-item ${change.type}`;

      const pathStr = formatDiffPath(change.path);

      let valuesHtml = '';
      if (change.type === 'changed') {
        valuesHtml = `
          <div class="homura-diff-values">
            <div class="homura-diff-old">- ${JSON.stringify(change.oldValue)}</div>
            <div class="homura-diff-new">+ ${JSON.stringify(change.newValue)}</div>
          </div>
        `;
      } else if (change.type === 'added') {
        valuesHtml = `
          <div class="homura-diff-values">
            <div class="homura-diff-new">+ ${JSON.stringify(change.value)}</div>
          </div>
        `;
      } else if (change.type === 'removed') {
        valuesHtml = `
          <div class="homura-diff-values">
            <div class="homura-diff-old">- ${JSON.stringify(change.value)}</div>
          </div>
        `;
      }

      item.innerHTML = `
        <div class="homura-diff-path">
          <span class="homura-diff-tag ${change.type}">${change.type}</span>
          <span>${pathStr}</span>
        </div>
        ${valuesHtml}
      `;

      diffContainer.appendChild(item);
    });
  }
}
