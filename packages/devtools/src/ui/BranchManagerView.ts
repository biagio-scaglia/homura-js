import { DevToolsBridge } from '../types';

export class BranchManagerView {
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
    const branches = snapshot.branches;
    const currentBranchId = snapshot.currentBranch.id;

    this.element.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <input type="text" class="homura-search-input hm-branch-input" placeholder="New branch name (e.g. experiment-quest)..." />
        <button class="hm-btn hm-btn-primary hm-btn-create-branch">Create Branch</button>
      </div>
      <div class="homura-branches-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
    `;

    const input = this.element.querySelector('.hm-branch-input') as HTMLInputElement;
    const createBtn = this.element.querySelector('.hm-btn-create-branch');

    createBtn?.addEventListener('click', () => {
      const name = input?.value.trim();
      if (name) {
        this.bridge.createBranch(name);
        if (input) input.value = '';
      }
    });

    const list = this.element.querySelector('.homura-branches-list');
    if (!list) return;

    branches.forEach(branch => {
      const isCurrent = branch.id === currentBranchId;
      const card = document.createElement('div');
      card.style.background = isCurrent ? 'var(--hm-bg-active)' : 'var(--hm-bg-surface)';
      card.style.border = `1px solid ${isCurrent ? 'var(--hm-accent)' : 'var(--hm-border)'}`;
      card.style.borderRadius = 'var(--hm-radius-md)';
      card.style.padding = '10px 14px';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${
            isCurrent ? 'var(--hm-accent)' : 'var(--hm-text-muted)'
          };"></span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700; font-size: 13px; color: var(--hm-text-primary);">${branch.name}</span>
            <span style="font-family: var(--hm-font-mono); font-size: 10.5px; color: var(--hm-text-muted);">id: ${branch.id}</span>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          ${
            !isCurrent
              ? `<button class="hm-btn hm-btn-switch">Switch</button>
                 ${branch.id !== 'main' ? `<button class="hm-btn hm-btn-delete" style="color: var(--hm-red);">Delete</button>` : ''}`
              : `<span style="font-size: 11px; font-weight: 600; color: var(--hm-accent); padding: 4px 8px;">Active</span>`
          }
        </div>
      `;

      card.querySelector('.hm-btn-switch')?.addEventListener('click', () => {
        this.bridge.switchBranch(branch.id);
      });

      card.querySelector('.hm-btn-delete')?.addEventListener('click', () => {
        this.bridge.deleteBranch(branch.id);
      });

      list.appendChild(card);
    });
  }
}
