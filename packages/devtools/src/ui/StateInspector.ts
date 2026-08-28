export class StateInspector {
  private element: HTMLElement;
  private stateData: any;
  private filterQuery = '';
  private expandedPaths = new Set<string>();

  constructor(initialState: any) {
    this.stateData = initialState;
    this.element = document.createElement('div');
    this.element.className = 'homura-tab-content';
    this.expandedPaths.add(''); // Root expanded

    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public setState(state: any): void {
    this.stateData = state;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px;">
        <input type="text" class="homura-search-input" placeholder="Search state keys & values..." value="${this.filterQuery}" style="max-width: 280px;" />
        <div style="display: flex; gap: 6px;">
          <button class="hm-btn hm-btn-expand">Expand All</button>
          <button class="hm-btn hm-btn-collapse">Collapse All</button>
          <button class="hm-btn hm-btn-copy">Copy JSON</button>
        </div>
      </div>
      <div class="homura-json-tree"></div>
    `;

    const searchInput = this.element.querySelector('.homura-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        this.filterQuery = (e.target as HTMLInputElement).value.toLowerCase();
        this.renderTree();
      });
    }

    const expandBtn = this.element.querySelector('.hm-btn-expand');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        this.expandAll(this.stateData, '');
        this.renderTree();
      });
    }

    const collapseBtn = this.element.querySelector('.hm-btn-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.expandedPaths.clear();
        this.renderTree();
      });
    }

    const copyBtn = this.element.querySelector('.hm-btn-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        try {
          navigator.clipboard.writeText(JSON.stringify(this.stateData, null, 2));
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy JSON';
          }, 1500);
        } catch {
          // fallback
        }
      });
    }

    this.renderTree();
  }

  private expandAll(obj: any, currentPath: string): void {
    if (obj !== null && typeof obj === 'object') {
      this.expandedPaths.add(currentPath);
      for (const [k, v] of Object.entries(obj)) {
        const nextPath = currentPath ? `${currentPath}.${k}` : k;
        this.expandAll(v, nextPath);
      }
    }
  }

  private renderTree(): void {
    const treeContainer = this.element.querySelector('.homura-json-tree');
    if (!treeContainer) return;

    treeContainer.innerHTML = '';
    const rootNode = this.buildNode(this.stateData, '', 'state');
    treeContainer.appendChild(rootNode);
  }

  private buildNode(value: any, path: string, keyLabel?: string): HTMLElement {
    const node = document.createElement('div');
    node.className = 'homura-tree-node';

    if (value === null) {
      node.innerHTML = `
        ${keyLabel !== undefined ? `<span class="homura-tree-key">${keyLabel}</span><span class="homura-tree-colon">:</span>` : ''}
        <span class="homura-val-null">null</span>
      `;
      return node;
    }

    const valType = typeof value;

    if (valType === 'string') {
      node.innerHTML = `
        ${keyLabel !== undefined ? `<span class="homura-tree-key">${keyLabel}</span><span class="homura-tree-colon">:</span>` : ''}
        <span class="homura-val-string">"${value}"</span>
      `;
      return node;
    }

    if (valType === 'number') {
      node.innerHTML = `
        ${keyLabel !== undefined ? `<span class="homura-tree-key">${keyLabel}</span><span class="homura-tree-colon">:</span>` : ''}
        <span class="homura-val-number">${value}</span>
      `;
      return node;
    }

    if (valType === 'boolean') {
      node.innerHTML = `
        ${keyLabel !== undefined ? `<span class="homura-tree-key">${keyLabel}</span><span class="homura-tree-colon">:</span>` : ''}
        <span class="homura-val-boolean">${value}</span>
      `;
      return node;
    }

    if (valType === 'object') {
      const isArr = Array.isArray(value);
      const isExpanded = this.expandedPaths.has(path);
      const entries = Object.entries(value);
      const count = entries.length;

      const header = document.createElement('div');
      header.style.cursor = 'pointer';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.gap = '4px';

      header.innerHTML = `
        <span style="color: var(--hm-text-muted); font-size: 10px;">${isExpanded ? '▼' : '▶'}</span>
        ${keyLabel !== undefined ? `<span class="homura-tree-key">${keyLabel}</span><span class="homura-tree-colon">:</span>` : ''}
        <span style="color: var(--hm-text-secondary);">${isArr ? '[' : '{'}</span>
        <span class="homura-val-badge">${count} ${isArr ? 'items' : 'keys'}</span>
        ${!isExpanded ? `<span style="color: var(--hm-text-secondary);">${isArr ? ']' : '}'}</span>` : ''}
      `;

      header.addEventListener('click', () => {
        if (this.expandedPaths.has(path)) {
          this.expandedPaths.delete(path);
        } else {
          this.expandedPaths.add(path);
        }
        this.renderTree();
      });

      node.appendChild(header);

      if (isExpanded) {
        const body = document.createElement('div');
        body.style.marginLeft = '14px';
        body.style.borderLeft = '1px solid var(--hm-border-subtle)';
        body.style.paddingLeft = '6px';

        for (const [k, v] of entries) {
          const childPath = path ? `${path}.${k}` : k;
          body.appendChild(this.buildNode(v, childPath, k));
        }

        const footer = document.createElement('div');
        footer.style.color = 'var(--hm-text-secondary)';
        footer.textContent = isArr ? ']' : '}';

        node.appendChild(body);
        node.appendChild(footer);
      }

      return node;
    }

    node.textContent = String(value);
    return node;
  }
}
