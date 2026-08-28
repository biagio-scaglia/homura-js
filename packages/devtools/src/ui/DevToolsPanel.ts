import { DevToolsBridge, DevToolsOptions, DevToolsTab } from '../types';
import { devtoolsStyles } from './styles';
import { TimelineView } from './TimelineView';
import { StateInspector } from './StateInspector';
import { DiffViewer } from './DiffViewer';
import { SnapshotsView } from './SnapshotsView';
import { BranchManagerView } from './BranchManagerView';
import { PlaybackControls } from './PlaybackControls';

export class DevToolsPanel {
  private element: HTMLElement;
  private bridge: DevToolsBridge;
  private options: DevToolsOptions;
  private activeTab: DevToolsTab = 'inspector';

  private timelineView: TimelineView;
  private stateInspector: StateInspector;
  private diffViewer: DiffViewer;
  private snapshotsView: SnapshotsView;
  private branchManagerView: BranchManagerView;
  private playbackControls: PlaybackControls;
  private unsubBridge: () => void;

  constructor(bridge: DevToolsBridge, options: DevToolsOptions = {}) {
    this.bridge = bridge;
    this.options = options;

    DevToolsPanel.injectStyles();

    this.element = document.createElement('div');
    this.element.className = 'homura-devtools-root homura-panel';

    const snapshot = this.bridge.getSnapshot();

    this.timelineView = new TimelineView(this.bridge, {
      onSelectEntry: entry => {
        this.stateInspector.setState(entry.state);
        this.updateViews();
      }
    });

    this.stateInspector = new StateInspector(snapshot.state);
    this.diffViewer = new DiffViewer(this.bridge);
    this.snapshotsView = new SnapshotsView(this.bridge);
    this.branchManagerView = new BranchManagerView(this.bridge);
    this.playbackControls = new PlaybackControls(this.bridge);

    this.render();

    // Subscribe to bridge events to auto-update
    this.unsubBridge = this.bridge.subscribe(() => {
      this.updateViews();
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public static injectStyles(): void {
    const styleId = 'homura-devtools-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = devtoolsStyles;
      document.head.appendChild(styleEl);
    }
  }

  public updateViews(): void {
    const snapshot = this.bridge.getSnapshot();
    this.timelineView.update();
    this.stateInspector.setState(snapshot.state);
    this.diffViewer.update();
    this.snapshotsView.update();
    this.branchManagerView.update();
    this.playbackControls.update();
    this.updateHeaderBranchSelector();
  }

  public destroy(): void {
    this.unsubBridge();
    this.playbackControls.destroy();
    this.element.remove();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="homura-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="homura-brand">
            <div class="homura-logo-icon">H</div>
            <span>${this.options.title ?? 'HOMURA'}</span>
          </div>
          <div class="homura-status-badge">
            <span class="homura-status-dot"></span>
            <span>Connected</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-left: 10px;">
            <span style="font-size: 11px; color: var(--hm-text-secondary);">Branch:</span>
            <select class="hm-select hm-header-branch-select"></select>
          </div>
        </div>

        <div class="homura-header-controls">
          <button class="hm-btn hm-btn-export" title="Export state history to JSON">Export</button>
          <button class="hm-btn hm-btn-import" title="Import state history from JSON">Import</button>
          <button class="hm-btn hm-btn-clear" title="Clear all history">Clear</button>
          ${
            this.options.position === 'floating' || !this.options.container
              ? `<button class="hm-btn hm-btn-icon hm-btn-close" title="Minimize DevTools">✕</button>`
              : ''
          }
        </div>
      </div>

      <div class="homura-body">
        <div class="homura-sidebar-slot"></div>
        <div class="homura-content-area">
          <div class="homura-tabs-nav">
            <button class="homura-tab-btn ${this.activeTab === 'inspector' ? 'active' : ''}" data-tab="inspector">State Inspector</button>
            <button class="homura-tab-btn ${this.activeTab === 'diff' ? 'active' : ''}" data-tab="diff">Diff Viewer</button>
            <button class="homura-tab-btn ${this.activeTab === 'snapshots' ? 'active' : ''}" data-tab="snapshots">Snapshots</button>
            <button class="homura-tab-btn ${this.activeTab === 'branches' ? 'active' : ''}" data-tab="branches">Branches</button>
          </div>
          <div class="homura-main-tab-view" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;"></div>
        </div>
      </div>

      <div class="homura-footer-slot"></div>
    `;

    // Mount sidebar
    const sidebarSlot = this.element.querySelector('.homura-sidebar-slot');
    sidebarSlot?.replaceWith(this.timelineView.getElement());

    // Mount footer playback
    const footerSlot = this.element.querySelector('.homura-footer-slot');
    footerSlot?.replaceWith(this.playbackControls.getElement());

    // Tab buttons
    const tabBtns = this.element.querySelectorAll('.homura-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset['tab'] as DevToolsTab;
        if (tab) {
          this.switchTab(tab);
        }
      });
    });

    // Header branch selector
    this.updateHeaderBranchSelector();

    // Export button
    this.element.querySelector('.hm-btn-export')?.addEventListener('click', () => {
      const data = this.bridge.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homura-state-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import button
    this.element.querySelector('.hm-btn-import')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => {
            try {
              const json = JSON.parse(ev.target?.result as string);
              this.bridge.importData(json);
            } catch (err) {
              alert('Invalid JSON state file: ' + err);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });

    // Clear history button
    this.element.querySelector('.hm-btn-clear')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all history entries? Current state will be preserved.')) {
        this.bridge.clearHistory();
      }
    });

    this.mountActiveTab();
  }

  private updateHeaderBranchSelector(): void {
    const select = this.element.querySelector('.hm-header-branch-select') as HTMLSelectElement;
    if (!select) return;

    const snapshot = this.bridge.getSnapshot();
    select.innerHTML = '';

    snapshot.branches.forEach(branch => {
      const opt = document.createElement('option');
      opt.value = branch.id;
      opt.textContent = branch.name;
      if (branch.id === snapshot.currentBranch.id) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    select.onchange = () => {
      this.bridge.switchBranch(select.value);
    };
  }

  private switchTab(tab: DevToolsTab): void {
    this.activeTab = tab;
    const tabBtns = this.element.querySelectorAll('.homura-tab-btn');
    tabBtns.forEach(btn => {
      const t = (btn as HTMLElement).dataset['tab'];
      if (t === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.mountActiveTab();
  }

  private mountActiveTab(): void {
    const tabView = this.element.querySelector('.homura-main-tab-view');
    if (!tabView) return;

    tabView.innerHTML = '';

    switch (this.activeTab) {
      case 'inspector':
        tabView.appendChild(this.stateInspector.getElement());
        break;
      case 'diff':
        tabView.appendChild(this.diffViewer.getElement());
        break;
      case 'snapshots':
        tabView.appendChild(this.snapshotsView.getElement());
        break;
      case 'branches':
        tabView.appendChild(this.branchManagerView.getElement());
        break;
    }
  }
}
