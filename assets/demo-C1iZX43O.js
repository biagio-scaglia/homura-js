var V=Object.defineProperty;var R=(r,e,t)=>e in r?V(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var h=(r,e,t)=>R(r,typeof e!="symbol"?e+"":e,t);import{f as F,c as J}from"./homura-BDYZmBD4.js";function U(r){const e=new Set,t=[];function a(n){for(const i of Array.from(e))try{i(n)}catch(o){console.error("[HomuraJS DevTools Bridge] Listener error:",o)}}return t.push(r.on("state:change",n=>{a({type:"state:change",data:{state:n.state,entry:n.entry,action:n.action}}),a({type:"history:update",data:{entries:r.getHistory({allBranches:!0}),currentEntryId:n.entry.id}})})),t.push(r.on("history:add",()=>{a({type:"history:update",data:{entries:r.getHistory({allBranches:!0}),currentEntryId:r.getCurrentEntry().id}})})),t.push(r.on("history:jump",n=>{a({type:"history:update",data:{entries:r.getHistory({allBranches:!0}),currentEntryId:n.toEntry.id}})})),t.push(r.on("branch:create",()=>{a({type:"branch:update",data:{branches:r.getBranches(),currentBranchId:r.getCurrentBranch().id}})})),t.push(r.on("branch:switch",()=>{a({type:"branch:update",data:{branches:r.getBranches(),currentBranchId:r.getCurrentBranch().id}})})),t.push(r.on("branch:delete",()=>{a({type:"branch:update",data:{branches:r.getBranches(),currentBranchId:r.getCurrentBranch().id}})})),t.push(r.on("snapshot:create",()=>{a({type:"snapshot:update",data:{snapshots:r.getSnapshots()}})})),t.push(r.on("snapshot:delete",()=>{a({type:"snapshot:update",data:{snapshots:r.getSnapshots()}})})),{homura:r,subscribe(n){return e.add(n),n({type:"init",data:this.getSnapshot()}),()=>{e.delete(n)}},getSnapshot(){return{state:r.getState(),currentEntry:r.getCurrentEntry(),currentBranch:r.getCurrentBranch(),entries:r.getHistory({allBranches:!0}),branches:r.getBranches(),snapshots:r.getSnapshots()}},jumpTo(n){r.jumpTo(n)},undo(){r.undo()},redo(){r.redo()},rewind(n){r.rewind(n)},fastForward(n){r.fastForward(n)},createBranch(n,i){return r.createBranch(n,i)},switchBranch(n){r.switchBranch(n)},deleteBranch(n){r.deleteBranch(n)},takeSnapshot(n){return r.snapshot(n)},restoreSnapshot(n){r.restore(n)},deleteSnapshot(n){r.deleteSnapshot(n)},clearHistory(){r.clearHistory(!0)},diff(n,i){return r.diff(n,i)},exportData(){return r.export()},importData(n){r.import(n)},destroy(){for(const n of t)n();e.clear()}}}const _=`
:root, .homura-devtools-root {
  --hm-bg-base: #08060c;
  --hm-bg-surface: #0f0b18;
  --hm-bg-surface-elevated: #171124;
  --hm-bg-card: #140e20;
  --hm-bg-card-hover: #1f1632;
  --hm-bg-active: rgba(168, 85, 247, 0.15);
  --hm-border: rgba(192, 132, 252, 0.12);
  --hm-border-focus: rgba(168, 85, 247, 0.5);
  --hm-border-subtle: rgba(255, 255, 255, 0.05);
  
  --hm-accent: #a855f7;
  --hm-accent-glow: rgba(168, 85, 247, 0.35);
  --hm-accent-hover: #c084fc;
  --hm-cyan: #00d2d3;
  --hm-cyan-glow: rgba(0, 210, 211, 0.25);
  --hm-purple: #c084fc;
  --hm-green: #34d399;
  --hm-amber: #fbbf24;
  --hm-red: #9333ea;

  --hm-text-primary: #f3e8ff;
  --hm-text-secondary: #c4b5fd;
  --hm-text-muted: #7c6f9e;
  
  --hm-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --hm-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;

  --hm-radius-sm: 4px;
  --hm-radius-md: 8px;
  --hm-radius-lg: 12px;
  --hm-shadow-lg: 0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.15);
  --hm-transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.homura-devtools-root {
  font-family: var(--hm-font-sans);
  color: var(--hm-text-primary);
  background-color: var(--hm-bg-base);
  box-sizing: border-box;
  font-size: 13px;
  line-height: 1.4;
  user-select: none;
}

.homura-devtools-root * {
  box-sizing: border-box;
}

/* Floating Launcher Button */
.homura-launcher-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: #fff;
  font-family: var(--hm-font-sans);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  z-index: 999999;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 71, 87, 0.3);
  transition: var(--hm-transition);
}

.homura-launcher-btn:hover {
  transform: translateY(-2px) scale(1.02);
  border-color: var(--hm-accent);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6), 0 0 22px var(--hm-accent-glow);
}

.homura-launcher-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--hm-accent);
  box-shadow: 0 0 8px var(--hm-accent);
  animation: hmPulse 2s infinite;
}

@keyframes hmPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(255, 71, 87, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
}

/* DevTools Container */
.homura-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--hm-bg-base);
  border: 1px solid var(--hm-border);
  overflow: hidden;
  position: relative;
}

.homura-floating-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: min(840px, calc(100vw - 32px));
  height: min(480px, calc(100vh - 80px));
  min-width: 320px;
  min-height: 280px;
  border-radius: var(--hm-radius-lg);
  box-shadow: var(--hm-shadow-lg);
  z-index: 999999;
  overflow: hidden;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
  resize: both;
}

.homura-floating-container.minimized {
  transform: translateY(120%) scale(0.9);
  opacity: 0;
  pointer-events: none;
}

/* Header */
.homura-header {
  height: 48px;
  background: var(--hm-bg-surface);
  border-bottom: 1px solid var(--hm-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  flex-shrink: 0;
}

.homura-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 14px;
}

.homura-logo-icon {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, var(--hm-accent), var(--hm-purple));
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  box-shadow: 0 0 10px var(--hm-accent-glow);
}

.homura-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: var(--hm-font-mono);
  color: var(--hm-green);
  background: rgba(46, 213, 115, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(46, 213, 115, 0.2);
}

.homura-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--hm-green);
  box-shadow: 0 0 6px var(--hm-green);
}

.homura-header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Buttons */
.hm-btn {
  background: var(--hm-bg-surface-elevated);
  border: 1px solid var(--hm-border);
  color: var(--hm-text-primary);
  font-family: var(--hm-font-sans);
  font-size: 12px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: var(--hm-radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: var(--hm-transition);
}

.hm-btn:hover {
  background: var(--hm-bg-card-hover);
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.hm-btn-primary {
  background: linear-gradient(135deg, var(--hm-accent), #e84118);
  border-color: rgba(255, 71, 87, 0.4);
  color: #fff;
}

.hm-btn-primary:hover {
  background: linear-gradient(135deg, var(--hm-accent-hover), #ff4757);
  box-shadow: 0 0 12px var(--hm-accent-glow);
}

.hm-btn-icon {
  padding: 5px 7px;
}

.hm-select {
  background: var(--hm-bg-surface-elevated);
  border: 1px solid var(--hm-border);
  color: var(--hm-text-primary);
  font-family: var(--hm-font-sans);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--hm-radius-sm);
  outline: none;
  cursor: pointer;
}

.hm-select:focus {
  border-color: var(--hm-accent);
}

/* Main Split View */
.homura-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.homura-sidebar {
  width: clamp(210px, 30%, 270px);
  min-width: 190px;
  border-right: 1px solid var(--hm-border);
  display: flex;
  flex-direction: column;
  background: var(--hm-bg-surface);
  flex-shrink: 0;
}

.homura-content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--hm-bg-base);
  overflow: hidden;
}

/* Sidebar Timeline */
.homura-sidebar-header {
  padding: 10px 14px;
  border-bottom: 1px solid var(--hm-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.homura-sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--hm-text-secondary);
}

.homura-search-input {
  width: 100%;
  background: var(--hm-bg-surface-elevated);
  border: 1px solid var(--hm-border);
  color: var(--hm-text-primary);
  font-family: var(--hm-font-sans);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: var(--hm-radius-sm);
  outline: none;
}

.homura-search-input:focus {
  border-color: var(--hm-accent);
}

.homura-timeline-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.homura-timeline-card {
  padding: 8px 10px;
  border-radius: var(--hm-radius-md);
  background: var(--hm-bg-card);
  border: 1px solid var(--hm-border-subtle);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  transition: var(--hm-transition);
}

.homura-timeline-card:hover {
  background: var(--hm-bg-card-hover);
  border-color: var(--hm-border);
}

.homura-timeline-card.active {
  background: var(--hm-bg-active);
  border-color: var(--hm-accent);
  box-shadow: 0 0 12px rgba(255, 71, 87, 0.2);
}

.homura-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.homura-card-label {
  font-weight: 600;
  font-size: 12.5px;
  color: var(--hm-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.homura-card-index {
  font-family: var(--hm-font-mono);
  font-size: 10px;
  color: var(--hm-text-muted);
}

.homura-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--hm-text-secondary);
}

.homura-branch-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.15);
  color: var(--hm-purple);
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-family: var(--hm-font-mono);
}

.homura-card-time {
  font-size: 10.5px;
  color: var(--hm-text-muted);
}

/* Tabs Bar */
.homura-tabs-nav {
  height: 38px;
  background: var(--hm-bg-surface);
  border-bottom: 1px solid var(--hm-border);
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 4px;
}

.homura-tab-btn {
  background: transparent;
  border: none;
  color: var(--hm-text-secondary);
  font-family: var(--hm-font-sans);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--hm-radius-sm);
  cursor: pointer;
  transition: var(--hm-transition);
}

.homura-tab-btn:hover {
  color: var(--hm-text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.homura-tab-btn.active {
  color: #fff;
  background: var(--hm-bg-surface-elevated);
  border-bottom: 2px solid var(--hm-accent);
}

.homura-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

/* JSON Tree Inspector */
.homura-json-tree {
  font-family: var(--hm-font-mono);
  font-size: 12px;
  line-height: 1.6;
}

.homura-tree-node {
  margin-left: 16px;
}

.homura-tree-key {
  color: #e2e8f0;
  font-weight: 600;
}

.homura-tree-colon {
  color: var(--hm-text-muted);
  margin-right: 4px;
}

.homura-val-string { color: var(--hm-green); }
.homura-val-number { color: var(--hm-cyan); }
.homura-val-boolean { color: var(--hm-purple); }
.homura-val-null { color: var(--hm-text-muted); }
.homura-val-badge {
  font-size: 10px;
  color: var(--hm-text-muted);
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 6px;
}

/* Diff Viewer */
.homura-diff-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.homura-diff-item {
  background: var(--hm-bg-surface);
  border: 1px solid var(--hm-border);
  border-radius: var(--hm-radius-md);
  padding: 10px 12px;
  font-family: var(--hm-font-mono);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.homura-diff-item.added { border-left: 3px solid var(--hm-green); }
.homura-diff-item.removed { border-left: 3px solid var(--hm-red); }
.homura-diff-item.changed { border-left: 3px solid var(--hm-amber); }

.homura-diff-path {
  font-weight: 700;
  color: var(--hm-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.homura-diff-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 700;
}

.homura-diff-tag.added { background: rgba(46, 213, 115, 0.15); color: var(--hm-green); }
.homura-diff-tag.removed { background: rgba(255, 71, 87, 0.15); color: var(--hm-red); }
.homura-diff-tag.changed { background: rgba(255, 165, 2, 0.15); color: var(--hm-amber); }

.homura-diff-values {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 8px;
}

.homura-diff-old {
  color: #ff6b81;
  background: rgba(255, 71, 87, 0.08);
  padding: 2px 6px;
  border-radius: 3px;
}

.homura-diff-new {
  color: #2ed573;
  background: rgba(46, 213, 115, 0.08);
  padding: 2px 6px;
  border-radius: 3px;
}

/* Playback & Scrubber Controls */
.homura-playback-bar {
  height: 52px;
  background: var(--hm-bg-surface);
  border-top: 1px solid var(--hm-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  gap: 12px;
}

.homura-controls-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.homura-scrubber-slider {
  flex: 1;
  accent-color: var(--hm-accent);
  cursor: pointer;
}
`;class Q{constructor(e,t){h(this,"element");h(this,"bridge");h(this,"filterQuery","");h(this,"onSelectEntry");this.bridge=e,this.onSelectEntry=t==null?void 0:t.onSelectEntry,this.element=document.createElement("div"),this.element.className="homura-sidebar",this.render()}getElement(){return this.element}update(){this.render()}setFilter(e){this.filterQuery=e.toLowerCase(),this.renderList()}render(){this.element.innerHTML=`
      <div class="homura-sidebar-header">
        <span class="homura-sidebar-title">Timeline (${this.bridge.getSnapshot().entries.length})</span>
      </div>
      <div style="padding: 8px 10px 0 10px;">
        <input type="text" class="homura-search-input" placeholder="Search entries..." value="${this.filterQuery}" />
      </div>
      <div class="homura-timeline-list"></div>
    `;const e=this.element.querySelector(".homura-search-input");e&&e.addEventListener("input",t=>{this.setFilter(t.target.value)}),this.renderList()}renderList(){const e=this.element.querySelector(".homura-timeline-list");if(!e)return;e.innerHTML="";const t=this.bridge.getSnapshot(),a=t.currentEntry.id;let s=t.entries;if(this.filterQuery&&(s=s.filter(n=>n.label.toLowerCase().includes(this.filterQuery)||n.id.toLowerCase().includes(this.filterQuery)||n.branchId.toLowerCase().includes(this.filterQuery))),s.length===0){e.innerHTML=`
        <div style="padding: 20px; text-align: center; color: var(--hm-text-muted);">
          No matching history entries
        </div>
      `;return}s.forEach((n,i)=>{const o=document.createElement("div"),l=n.id===a;o.className=`homura-timeline-card ${l?"active":""}`;const d=new Date(n.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});o.innerHTML=`
        <div class="homura-card-header">
          <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${l?"var(--hm-accent)":"var(--hm-text-muted)"};"></span>
            <span class="homura-card-label" title="${n.label}">${n.label}</span>
          </div>
          <span class="homura-card-index">#${i+1}</span>
        </div>
        <div class="homura-card-meta">
          <span class="homura-branch-badge">${n.branchId}</span>
          <span class="homura-card-time">${d}</span>
        </div>
      `,o.addEventListener("click",()=>{this.bridge.jumpTo(n.id),this.onSelectEntry&&this.onSelectEntry(n)}),e.appendChild(o)})}}class K{constructor(e){h(this,"element");h(this,"stateData");h(this,"filterQuery","");h(this,"expandedPaths",new Set);this.stateData=e,this.element=document.createElement("div"),this.element.className="homura-tab-content",this.expandedPaths.add(""),this.render()}getElement(){return this.element}setState(e){this.stateData=e,this.render()}render(){this.element.innerHTML=`
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px;">
        <input type="text" class="homura-search-input" placeholder="Search state keys & values..." value="${this.filterQuery}" style="max-width: 280px;" />
        <div style="display: flex; gap: 6px;">
          <button class="hm-btn hm-btn-expand">Expand All</button>
          <button class="hm-btn hm-btn-collapse">Collapse All</button>
          <button class="hm-btn hm-btn-copy">Copy JSON</button>
        </div>
      </div>
      <div class="homura-json-tree"></div>
    `;const e=this.element.querySelector(".homura-search-input");e&&e.addEventListener("input",n=>{this.filterQuery=n.target.value.toLowerCase(),this.renderTree()});const t=this.element.querySelector(".hm-btn-expand");t&&t.addEventListener("click",()=>{this.expandAll(this.stateData,""),this.renderTree()});const a=this.element.querySelector(".hm-btn-collapse");a&&a.addEventListener("click",()=>{this.expandedPaths.clear(),this.renderTree()});const s=this.element.querySelector(".hm-btn-copy");s&&s.addEventListener("click",()=>{try{navigator.clipboard.writeText(JSON.stringify(this.stateData,null,2)),s.textContent="Copied!",setTimeout(()=>{s.textContent="Copy JSON"},1500)}catch{}}),this.renderTree()}expandAll(e,t){if(e!==null&&typeof e=="object"){this.expandedPaths.add(t);for(const[a,s]of Object.entries(e)){const n=t?`${t}.${a}`:a;this.expandAll(s,n)}}}renderTree(){const e=this.element.querySelector(".homura-json-tree");if(!e)return;e.innerHTML="";const t=this.buildNode(this.stateData,"","state");e.appendChild(t)}buildNode(e,t,a){const s=document.createElement("div");if(s.className="homura-tree-node",e===null)return s.innerHTML=`
        ${a!==void 0?`<span class="homura-tree-key">${a}</span><span class="homura-tree-colon">:</span>`:""}
        <span class="homura-val-null">null</span>
      `,s;const n=typeof e;if(n==="string")return s.innerHTML=`
        ${a!==void 0?`<span class="homura-tree-key">${a}</span><span class="homura-tree-colon">:</span>`:""}
        <span class="homura-val-string">"${e}"</span>
      `,s;if(n==="number")return s.innerHTML=`
        ${a!==void 0?`<span class="homura-tree-key">${a}</span><span class="homura-tree-colon">:</span>`:""}
        <span class="homura-val-number">${e}</span>
      `,s;if(n==="boolean")return s.innerHTML=`
        ${a!==void 0?`<span class="homura-tree-key">${a}</span><span class="homura-tree-colon">:</span>`:""}
        <span class="homura-val-boolean">${e}</span>
      `,s;if(n==="object"){const i=Array.isArray(e),o=this.expandedPaths.has(t),l=Object.entries(e),d=l.length,m=document.createElement("div");if(m.style.cursor="pointer",m.style.display="flex",m.style.alignItems="center",m.style.gap="4px",m.innerHTML=`
        <span style="color: var(--hm-text-muted); font-size: 10px;">${o?"▼":"▶"}</span>
        ${a!==void 0?`<span class="homura-tree-key">${a}</span><span class="homura-tree-colon">:</span>`:""}
        <span style="color: var(--hm-text-secondary);">${i?"[":"{"}</span>
        <span class="homura-val-badge">${d} ${i?"items":"keys"}</span>
        ${o?"":`<span style="color: var(--hm-text-secondary);">${i?"]":"}"}</span>`}
      `,m.addEventListener("click",()=>{this.expandedPaths.has(t)?this.expandedPaths.delete(t):this.expandedPaths.add(t),this.renderTree()}),s.appendChild(m),o){const u=document.createElement("div");u.style.marginLeft="14px",u.style.borderLeft="1px solid var(--hm-border-subtle)",u.style.paddingLeft="6px";for(const[f,c]of l){const y=t?`${t}.${f}`:f;u.appendChild(this.buildNode(c,y,f))}const g=document.createElement("div");g.style.color="var(--hm-text-secondary)",g.textContent=i?"]":"}",s.appendChild(u),s.appendChild(g)}return s}return s.textContent=String(e),s}}class W{constructor(e){h(this,"element");h(this,"bridge");h(this,"entryAId",null);h(this,"entryBId",null);this.bridge=e,this.element=document.createElement("div"),this.element.className="homura-tab-content";const t=this.bridge.getSnapshot(),a=t.entries;if(a.length>=2){const s=a.findIndex(n=>n.id===t.currentEntry.id);s>0?(this.entryAId=a[s-1].id,this.entryBId=a[s].id):(this.entryAId=a[0].id,this.entryBId=a[1].id)}else a.length===1&&(this.entryAId=a[0].id,this.entryBId=a[0].id);this.render()}getElement(){return this.element}update(){this.render()}setCompareEntries(e,t){this.entryAId=e,this.entryBId=t,this.render()}render(){const e=this.bridge.getSnapshot(),t=e.entries;if(t.length===0){this.element.innerHTML='<div style="color: var(--hm-text-muted);">No history entries available for comparison.</div>';return}!this.entryAId&&t.length>0&&(this.entryAId=t[0].id),!this.entryBId&&t.length>0&&(this.entryBId=e.currentEntry.id),this.element.innerHTML=`
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; background: var(--hm-bg-surface); padding: 10px 14px; border-radius: var(--hm-radius-md); border: 1px solid var(--hm-border);">
        <span style="font-weight: 600; font-size: 12px; color: var(--hm-text-secondary);">Compare:</span>
        <select class="hm-select hm-select-a"></select>
        <span style="color: var(--hm-accent); font-weight: 700;">➔</span>
        <select class="hm-select hm-select-b"></select>
        <button class="hm-btn hm-btn-prev-cur" style="margin-left: auto;">Compare with Previous</button>
      </div>
      <div class="homura-diff-container"></div>
    `;const a=this.element.querySelector(".hm-select-a"),s=this.element.querySelector(".hm-select-b");t.forEach((i,o)=>{const l=document.createElement("option");l.value=i.id,l.textContent=`#${o+1} - ${i.label}`,i.id===this.entryAId&&(l.selected=!0),a.appendChild(l);const d=document.createElement("option");d.value=i.id,d.textContent=`#${o+1} - ${i.label}`,i.id===this.entryBId&&(d.selected=!0),s.appendChild(d)}),a.addEventListener("change",()=>{this.entryAId=a.value,this.renderDiffList()}),s.addEventListener("change",()=>{this.entryBId=s.value,this.renderDiffList()});const n=this.element.querySelector(".hm-btn-prev-cur");n&&n.addEventListener("click",()=>{const i=t.findIndex(o=>o.id===e.currentEntry.id);i>0&&(this.entryAId=t[i-1].id,this.entryBId=t[i].id,this.render())}),this.renderDiffList()}renderDiffList(){const e=this.element.querySelector(".homura-diff-container");if(!e)return;if(e.innerHTML="",!this.entryAId||!this.entryBId){e.innerHTML='<div style="color: var(--hm-text-muted);">Select two entries to compare.</div>';return}const t=this.bridge.getSnapshot().entries.find(i=>i.id===this.entryAId),a=this.bridge.getSnapshot().entries.find(i=>i.id===this.entryBId);if(!t||!a){e.innerHTML='<div style="color: var(--hm-text-muted);">Selected entries not found.</div>';return}const s=this.bridge.diff(t,a);if(s.length===0){e.innerHTML=`
        <div style="padding: 24px; text-align: center; color: var(--hm-green); background: rgba(46, 213, 115, 0.05); border-radius: var(--hm-radius-md); border: 1px solid rgba(46, 213, 115, 0.2);">
          ✓ Identical States (0 differences detected)
        </div>
      `;return}const n=document.createElement("div");n.style.fontSize="12px",n.style.color="var(--hm-text-secondary)",n.style.marginBottom="8px",n.textContent=`Found ${s.length} change${s.length>1?"s":""}:`,e.appendChild(n),s.forEach(i=>{const o=document.createElement("div");o.className=`homura-diff-item ${i.type}`;const l=F(i.path);let d="";i.type==="changed"?d=`
          <div class="homura-diff-values">
            <div class="homura-diff-old">- ${JSON.stringify(i.oldValue)}</div>
            <div class="homura-diff-new">+ ${JSON.stringify(i.newValue)}</div>
          </div>
        `:i.type==="added"?d=`
          <div class="homura-diff-values">
            <div class="homura-diff-new">+ ${JSON.stringify(i.value)}</div>
          </div>
        `:i.type==="removed"&&(d=`
          <div class="homura-diff-values">
            <div class="homura-diff-old">- ${JSON.stringify(i.value)}</div>
          </div>
        `),o.innerHTML=`
        <div class="homura-diff-path">
          <span class="homura-diff-tag ${i.type}">${i.type}</span>
          <span>${l}</span>
        </div>
        ${d}
      `,e.appendChild(o)})}}class G{constructor(e){h(this,"element");h(this,"bridge");this.bridge=e,this.element=document.createElement("div"),this.element.className="homura-tab-content",this.render()}getElement(){return this.element}update(){this.render()}render(){const t=this.bridge.getSnapshot().snapshots;this.element.innerHTML=`
      <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
        <input type="text" class="homura-search-input hm-snap-input" style="flex: 1; min-width: 140px;" placeholder="Snapshot label..." />
        <button class="hm-btn hm-btn-primary hm-btn-take-snap" style="white-space: nowrap;">Capture</button>
      </div>
      <div class="homura-snapshots-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
    `;const a=this.element.querySelector(".hm-snap-input"),s=this.element.querySelector(".hm-btn-take-snap");s==null||s.addEventListener("click",()=>{const i=a==null?void 0:a.value.trim();this.bridge.takeSnapshot(i||void 0),a&&(a.value="")});const n=this.element.querySelector(".homura-snapshots-list");if(n){if(t.length===0){n.innerHTML=`
        <div style="padding: 24px; text-align: center; color: var(--hm-text-muted);">
          No saved snapshots yet. Take a snapshot to bookmark any state point in time!
        </div>
      `;return}t.forEach(i=>{var d,m;const o=document.createElement("div");o.style.background="var(--hm-bg-surface)",o.style.border="1px solid var(--hm-border)",o.style.borderRadius="var(--hm-radius-md)",o.style.padding="10px 14px",o.style.display="flex",o.style.alignItems="center",o.style.justifyContent="space-between";const l=new Date(i.timestamp).toLocaleString();o.innerHTML=`
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-weight: 700; font-size: 13px; color: var(--hm-text-primary);">${i.name}</span>
          <span style="font-size: 11px; color: var(--hm-text-muted);">${l}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="hm-btn hm-btn-restore" style="color: var(--hm-green);">Restore</button>
          <button class="hm-btn hm-btn-delete" style="color: var(--hm-red);">Delete</button>
        </div>
      `,(d=o.querySelector(".hm-btn-restore"))==null||d.addEventListener("click",()=>{this.bridge.restoreSnapshot(i.id)}),(m=o.querySelector(".hm-btn-delete"))==null||m.addEventListener("click",()=>{this.bridge.deleteSnapshot(i.id)}),n.appendChild(o)})}}}class Y{constructor(e){h(this,"element");h(this,"bridge");this.bridge=e,this.element=document.createElement("div"),this.element.className="homura-tab-content",this.render()}getElement(){return this.element}update(){this.render()}render(){const e=this.bridge.getSnapshot(),t=e.branches,a=e.currentBranch.id;this.element.innerHTML=`
      <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
        <input type="text" class="homura-search-input hm-branch-input" style="flex: 1; min-width: 140px;" placeholder="New branch name..." />
        <button class="hm-btn hm-btn-primary hm-btn-create-branch" style="white-space: nowrap;">Create Branch</button>
      </div>
      <div class="homura-branches-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
    `;const s=this.element.querySelector(".hm-branch-input"),n=this.element.querySelector(".hm-btn-create-branch");n==null||n.addEventListener("click",()=>{const o=s==null?void 0:s.value.trim();o&&(this.bridge.createBranch(o),s&&(s.value=""))});const i=this.element.querySelector(".homura-branches-list");i&&t.forEach(o=>{var m,u;const l=o.id===a,d=document.createElement("div");d.style.background=l?"var(--hm-bg-active)":"var(--hm-bg-surface)",d.style.border=`1px solid ${l?"var(--hm-accent)":"var(--hm-border)"}`,d.style.borderRadius="var(--hm-radius-md)",d.style.padding="10px 14px",d.style.display="flex",d.style.alignItems="center",d.style.justifyContent="space-between",d.innerHTML=`
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${l?"var(--hm-accent)":"var(--hm-text-muted)"};"></span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700; font-size: 13px; color: var(--hm-text-primary);">${o.name}</span>
            <span style="font-family: var(--hm-font-mono); font-size: 10.5px; color: var(--hm-text-muted);">id: ${o.id}</span>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          ${l?'<span style="font-size: 11px; font-weight: 600; color: var(--hm-accent); padding: 4px 8px;">Active</span>':`<button class="hm-btn hm-btn-switch">Switch</button>
                 ${o.id!=="main"?'<button class="hm-btn hm-btn-delete" style="color: var(--hm-red);">Delete</button>':""}`}
        </div>
      `,(m=d.querySelector(".hm-btn-switch"))==null||m.addEventListener("click",()=>{this.bridge.switchBranch(o.id)}),(u=d.querySelector(".hm-btn-delete"))==null||u.addEventListener("click",()=>{this.bridge.deleteBranch(o.id)}),i.appendChild(d)})}}class X{constructor(e){h(this,"element");h(this,"bridge");h(this,"isPlaying",!1);h(this,"playTimer",null);h(this,"playSpeedMs",600);this.bridge=e,this.element=document.createElement("div"),this.element.className="homura-playback-bar",this.render()}getElement(){return this.element}update(){this.render()}destroy(){this.stopPlayback()}startPlayback(){this.isPlaying=!0,this.updatePlayBtnState();const e=this.bridge.getSnapshot(),t=e.entries;t.findIndex(s=>s.id===e.currentEntry.id)>=t.length-1&&t.length>1&&this.bridge.jumpTo(t[0].id),this.playTimer=setInterval(()=>{const s=this.bridge.getSnapshot(),n=s.entries,i=n.findIndex(o=>o.id===s.currentEntry.id);i<n.length-1?this.bridge.jumpTo(n[i+1].id):this.stopPlayback()},this.playSpeedMs)}stopPlayback(){this.isPlaying=!1,this.playTimer&&(clearInterval(this.playTimer),this.playTimer=null),this.updatePlayBtnState()}updatePlayBtnState(){const e=this.element.querySelector(".hm-btn-play");e&&(e.textContent=this.isPlaying?"⏸ Pause":"▶ Play",this.isPlaying?e.classList.add("hm-btn-primary"):e.classList.remove("hm-btn-primary"))}render(){const e=this.bridge.getSnapshot(),t=e.entries,a=t.findIndex(v=>v.id===e.currentEntry.id),s=Math.max(0,t.length-1),n=a>=0?a:0;this.element.innerHTML=`
      <div class="homura-controls-group">
        <button class="hm-btn hm-btn-icon hm-btn-start" title="Rewind to start">⏮</button>
        <button class="hm-btn hm-btn-icon hm-btn-rewind-10" title="Rewind 10 steps">-10</button>
        <button class="hm-btn hm-btn-icon hm-btn-rewind-5" title="Rewind 5 steps">-5</button>
        <button class="hm-btn hm-btn-icon hm-btn-undo" title="Undo 1 step">◀ Undo</button>
      </div>

      <div style="flex: 1; display: flex; align-items: center; gap: 10px; margin: 0 10px;">
        <span style="font-family: var(--hm-font-mono); font-size: 11px; color: var(--hm-text-secondary); min-width: 45px;">
          #${n+1}/${t.length}
        </span>
        <input type="range" class="homura-scrubber-slider" min="0" max="${s}" value="${n}" />
      </div>

      <div class="homura-controls-group">
        <button class="hm-btn hm-btn-play">${this.isPlaying?"⏸ Pause":"▶ Play"}</button>
        <button class="hm-btn hm-btn-icon hm-btn-redo" title="Redo 1 step">Redo ▶</button>
        <button class="hm-btn hm-btn-icon hm-btn-ff-5" title="Forward 5 steps">+5</button>
        <button class="hm-btn hm-btn-icon hm-btn-ff-10" title="Forward 10 steps">+10</button>
        <button class="hm-btn hm-btn-icon hm-btn-end" title="Fast-forward to latest">⏭</button>
      </div>
    `;const i=this.element.querySelector(".hm-btn-start");i==null||i.addEventListener("click",()=>{t.length>0&&this.bridge.jumpTo(t[0].id)});const o=this.element.querySelector(".hm-btn-rewind-10");o==null||o.addEventListener("click",()=>this.bridge.rewind(10));const l=this.element.querySelector(".hm-btn-rewind-5");l==null||l.addEventListener("click",()=>this.bridge.rewind(5));const d=this.element.querySelector(".hm-btn-undo");d==null||d.addEventListener("click",()=>this.bridge.undo());const m=this.element.querySelector(".hm-btn-play");m==null||m.addEventListener("click",()=>{this.isPlaying?this.stopPlayback():this.startPlayback()});const u=this.element.querySelector(".hm-btn-redo");u==null||u.addEventListener("click",()=>this.bridge.redo());const g=this.element.querySelector(".hm-btn-ff-5");g==null||g.addEventListener("click",()=>this.bridge.fastForward(5));const f=this.element.querySelector(".hm-btn-ff-10");f==null||f.addEventListener("click",()=>this.bridge.fastForward(10));const c=this.element.querySelector(".hm-btn-end");c==null||c.addEventListener("click",()=>{t.length>0&&this.bridge.jumpTo(t[t.length-1].id)});const y=this.element.querySelector(".homura-scrubber-slider");y==null||y.addEventListener("input",v=>{const L=parseInt(v.target.value,10);t[L]&&this.bridge.jumpTo(t[L].id)})}}class w{constructor(e,t={}){h(this,"element");h(this,"bridge");h(this,"options");h(this,"activeTab","inspector");h(this,"timelineView");h(this,"stateInspector");h(this,"diffViewer");h(this,"snapshotsView");h(this,"branchManagerView");h(this,"playbackControls");h(this,"unsubBridge");this.bridge=e,this.options=t,w.injectStyles(),this.element=document.createElement("div"),this.element.className="homura-devtools-root homura-panel";const a=this.bridge.getSnapshot();this.timelineView=new Q(this.bridge,{onSelectEntry:s=>{this.stateInspector.setState(s.state),this.updateViews()}}),this.stateInspector=new K(a.state),this.diffViewer=new W(this.bridge),this.snapshotsView=new G(this.bridge),this.branchManagerView=new Y(this.bridge),this.playbackControls=new X(this.bridge),this.render(),this.unsubBridge=this.bridge.subscribe(()=>{this.updateViews()})}getElement(){return this.element}static injectStyles(){const e="homura-devtools-styles";if(!document.getElementById(e)){const t=document.createElement("style");t.id=e,t.textContent=_,document.head.appendChild(t)}}updateViews(){const e=this.bridge.getSnapshot();this.timelineView.update(),this.stateInspector.setState(e.state),this.diffViewer.update(),this.snapshotsView.update(),this.branchManagerView.update(),this.playbackControls.update(),this.updateHeaderBranchSelector()}destroy(){this.unsubBridge(),this.playbackControls.destroy(),this.element.remove()}render(){var s,n,i;this.element.innerHTML=`
      <div class="homura-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="homura-brand">
            <div class="homura-logo-icon">H</div>
            <span>${this.options.title??"HOMURA"}</span>
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
          ${this.options.position==="floating"||!this.options.container?'<button class="hm-btn hm-btn-icon hm-btn-close" title="Minimize DevTools">✕</button>':""}
        </div>
      </div>

      <div class="homura-body">
        <div class="homura-sidebar-slot"></div>
        <div class="homura-content-area">
          <div class="homura-tabs-nav">
            <button class="homura-tab-btn ${this.activeTab==="inspector"?"active":""}" data-tab="inspector">State Inspector</button>
            <button class="homura-tab-btn ${this.activeTab==="diff"?"active":""}" data-tab="diff">Diff Viewer</button>
            <button class="homura-tab-btn ${this.activeTab==="snapshots"?"active":""}" data-tab="snapshots">Snapshots</button>
            <button class="homura-tab-btn ${this.activeTab==="branches"?"active":""}" data-tab="branches">Branches</button>
          </div>
          <div class="homura-main-tab-view" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;"></div>
        </div>
      </div>

      <div class="homura-footer-slot"></div>
    `;const e=this.element.querySelector(".homura-sidebar-slot");e==null||e.replaceWith(this.timelineView.getElement());const t=this.element.querySelector(".homura-footer-slot");t==null||t.replaceWith(this.playbackControls.getElement()),this.element.querySelectorAll(".homura-tab-btn").forEach(o=>{o.addEventListener("click",()=>{const l=o.dataset.tab;l&&this.switchTab(l)})}),this.updateHeaderBranchSelector(),(s=this.element.querySelector(".hm-btn-export"))==null||s.addEventListener("click",()=>{const o=this.bridge.exportData(),l=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),d=URL.createObjectURL(l),m=document.createElement("a");m.href=d,m.download=`homura-state-export-${Date.now()}.json`,m.click(),URL.revokeObjectURL(d)}),(n=this.element.querySelector(".hm-btn-import"))==null||n.addEventListener("click",()=>{const o=document.createElement("input");o.type="file",o.accept="application/json",o.onchange=l=>{var m;const d=(m=l.target.files)==null?void 0:m[0];if(d){const u=new FileReader;u.onload=g=>{var f;try{const c=JSON.parse((f=g.target)==null?void 0:f.result);this.bridge.importData(c)}catch(c){alert("Invalid JSON state file: "+c)}},u.readAsText(d)}},o.click()}),(i=this.element.querySelector(".hm-btn-clear"))==null||i.addEventListener("click",()=>{confirm("Are you sure you want to clear all history entries? Current state will be preserved.")&&this.bridge.clearHistory()}),this.mountActiveTab()}updateHeaderBranchSelector(){const e=this.element.querySelector(".hm-header-branch-select");if(!e)return;const t=this.bridge.getSnapshot();e.innerHTML="",t.branches.forEach(a=>{const s=document.createElement("option");s.value=a.id,s.textContent=a.name,a.id===t.currentBranch.id&&(s.selected=!0),e.appendChild(s)}),e.onchange=()=>{this.bridge.switchBranch(e.value)}}switchTab(e){this.activeTab=e,this.element.querySelectorAll(".homura-tab-btn").forEach(a=>{a.dataset.tab===e?a.classList.add("active"):a.classList.remove("active")}),this.mountActiveTab()}mountActiveTab(){const e=this.element.querySelector(".homura-main-tab-view");if(e)switch(e.innerHTML="",this.activeTab){case"inspector":e.appendChild(this.stateInspector.getElement());break;case"diff":e.appendChild(this.diffViewer.getElement());break;case"snapshots":e.appendChild(this.snapshotsView.getElement());break;case"branches":e.appendChild(this.branchManagerView.getElement());break}}}function Z(r,e={}){w.injectStyles();const t=U(r),a=!e.container||e.position==="floating";let s,n=null,i=null;if(a)n=document.createElement("div"),n.className=`homura-devtools-root homura-floating-container ${e.defaultOpen?"":"minimized"}`,document.body.appendChild(n),s=n,i=document.createElement("button"),i.className="homura-launcher-btn",i.innerHTML=`
      <span class="homura-launcher-pulse"></span>
      <span>HOMURA</span>
    `,document.body.appendChild(i),i.addEventListener("click",()=>{u()});else if(typeof e.container=="string"){const c=document.querySelector(e.container);if(!c)throw new Error(`[HomuraJS DevTools] Container "${e.container}" not found in DOM`);s=c}else s=e.container;const o=new w(t,e);s.appendChild(o.getElement());const l=o.getElement().querySelector(".hm-btn-close");l&&l.addEventListener("click",()=>{m()});function d(){n&&n.classList.remove("minimized")}function m(){n&&n.classList.add("minimized")}function u(){n&&(n.classList.contains("minimized")?d():m())}const g=c=>{var v;const y=(((v=document.activeElement)==null?void 0:v.tagName)||"").toLowerCase();if(!(y==="input"||y==="textarea")){if(c.altKey&&c.code==="KeyH"||c.ctrlKey&&c.shiftKey&&c.code==="KeyH"){c.preventDefault(),u();return}n&&!n.classList.contains("minimized")&&(c.key==="Escape"?(c.preventDefault(),m()):c.shiftKey&&c.key==="ArrowLeft"?(c.preventDefault(),r.rewind(5)):c.shiftKey&&c.key==="ArrowRight"?(c.preventDefault(),r.fastForward(5)):c.altKey&&c.key==="ArrowLeft"?(c.preventDefault(),r.undo()):c.altKey&&c.key==="ArrowRight"&&(c.preventDefault(),r.redo()))}};window.addEventListener("keydown",g);function f(){window.removeEventListener("keydown",g),o.destroy(),t.destroy(),n&&n.remove(),i&&i.remove()}return{panel:o,open:d,close:m,toggle:u,unmount:f}}const ee=[{id:"tsk_1",title:"Implement DAG Non-Destructive History",priority:"high",column:"done",assignee:"Biagio"},{id:"tsk_2",title:"3-Way Merge & Conflict Resolution Engine",priority:"high",column:"progress",assignee:"Biagio"},{id:"tsk_3",title:"Interactive Live DevTools GUI & Scrubbing",priority:"med",column:"todo",assignee:"Dev Team"},{id:"tsk_4",title:"IndexedDB Offline Persistence Adapter",priority:"low",column:"todo",assignee:"Dev Team"}],p=J({initialState:{projectName:"CyberFlow Engine v1.2",tasks:ee},maxHistory:500}),te=Z(p,{position:"floating",theme:"dark",defaultOpen:!1}),B=document.getElementById("list-todo"),C=document.getElementById("list-progress"),$=document.getElementById("list-done"),ne=document.getElementById("count-todo"),re=document.getElementById("count-progress"),ae=document.getElementById("count-done"),se=document.getElementById("active-branch-label"),E=document.getElementById("event-log"),ie=document.getElementById("event-count"),S=document.getElementById("toast");let T=0;function b(r,e=""){S.innerHTML=e?`${e} <span>${r}</span>`:r,S.classList.add("show"),setTimeout(()=>S.classList.remove("show"),2200)}function k(){const r=p.getState(),e=p.getCurrentBranch();se.textContent=e.name,B.innerHTML="",C.innerHTML="",$.innerHTML="";let t=0,a=0,s=0;for(const n of r.tasks){const i=document.createElement("div");i.className="task-card",i.title="Click to advance task to next column";const o=n.priority==="high"?"tag-priority-high":n.priority==="med"?"tag-priority-med":"tag-priority-low";i.innerHTML=`
      <div class="task-card-title">${n.title}</div>
      <div class="task-card-meta">
        <span class="tag-priority ${o}">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          <span>${n.priority.toUpperCase()}</span>
        </span>
        <span class="tag-assignee">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>${n.assignee}</span>
        </span>
      </div>
    `,i.addEventListener("click",()=>{oe(n.id)}),n.column==="todo"?(B.appendChild(i),t++):n.column==="progress"?(C.appendChild(i),a++):($.appendChild(i),s++)}ne.textContent=t.toString(),re.textContent=a.toString(),ae.textContent=s.toString()}function oe(r){p.update(e=>{const t=e.tasks.find(a=>a.id===r);t&&(t.column==="todo"?t.column="progress":t.column==="progress"?t.column="done":t.column="todo")},{label:`Advance task ${r}`})}var I;(I=document.getElementById("btn-add-task"))==null||I.addEventListener("click",()=>{const r=["Refactor Structural Diff Algorithm","Add Web Worker Benchmark Profiler","Write Comprehensive Stress Tests","Design Cyberpunk Obsidian Theme Tokens","Optimize Copy-On-Write Proxy Trap Latency"],e=r[Math.floor(Math.random()*r.length)],t=["high","med","low"],a=t[Math.floor(Math.random()*t.length)];p.update(s=>{s.tasks.push({id:`tsk_${Date.now().toString(36)}`,title:e,priority:a,column:"todo",assignee:"Biagio"})},{label:`Add task: ${e}`}),b(`Added task: "${e}"`)});var M;(M=document.getElementById("btn-batch-tx"))==null||M.addEventListener("click",()=>{p.transaction(r=>{r.tasks.push({id:`tx_${Date.now()}_1`,title:"Batch Item Alpha: Security Audit",priority:"high",column:"todo",assignee:"SecOps"}),r.tasks.push({id:`tx_${Date.now()}_2`,title:"Batch Item Beta: Memory Compaction",priority:"med",column:"progress",assignee:"Core Team"}),r.tasks.push({id:`tx_${Date.now()}_3`,title:"Batch Item Gamma: E2E Pipeline",priority:"low",column:"done",assignee:"CI/CD"})},{label:"Atomic Transaction: Sprint 4 Sprint Tasks"}),b("Atomic transaction committed (3 tasks in 1 node)!")});var H;(H=document.getElementById("btn-undo"))==null||H.addEventListener("click",()=>{const r=p.undo();b(r?`Undone to: ${r.label}`:"No further undo history in this branch")});var D;(D=document.getElementById("btn-redo"))==null||D.addEventListener("click",()=>{const r=p.redo();b(r?`Redone to: ${r.label}`:"Already at newest state in this branch")});let de=1;var A;(A=document.getElementById("btn-fork"))==null||A.addEventListener("click",()=>{const r=`feature-branch-${de++}`,e=p.createBranch(r);p.switchBranch(e.id),p.update(t=>{t.projectName=`CyberFlow [Branch: ${r}]`,t.tasks.push({id:`branch_tsk_${Date.now()}`,title:`Experimental Feature for ${r}`,priority:"high",column:"progress",assignee:"Experiment Lead"})},{label:`Initialize ${r}`}),b(`Forked & switched to "${r}"`)});var z;(z=document.getElementById("btn-merge"))==null||z.addEventListener("click",()=>{const r=p.getBranches(),e=p.getCurrentBranch(),t=r.find(a=>a.id!==e.id);if(!t){b('Create a parallel branch with "Fork Branch" first!');return}p.merge(t.id,{strategy:"theirs",label:`Merge branch '${t.name}' into '${e.name}'`}),b(`Merged '${t.name}' into '${e.name}'!`)});var q;(q=document.getElementById("btn-snap"))==null||q.addEventListener("click",()=>{const r=p.snapshot(`Milestone Checkpoint #${Date.now().toString(36)}`,{taskCount:p.getState().tasks.length});b(`Snapshot "${r.name}" captured!`)});var P;(P=document.getElementById("btn-replay"))==null||P.addEventListener("click",async()=>{b("Starting step-by-step history replay (2x speed)..."),await p.replay({speed:2,onStep:(r,e,t)=>{b(`Replaying step [${e+1}/${t}]: ${r.label}`),k()}}),b("Replay finished!")});var N;(N=document.getElementById("btn-toggle-devtools"))==null||N.addEventListener("click",()=>{te.toggle()});var j;(j=document.getElementById("btn-export-session"))==null||j.addEventListener("click",()=>{const r=p.export(),e=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),t=URL.createObjectURL(e),a=document.createElement("a");a.href=t,a.download=`homura-session-${Date.now()}.homura`,a.click(),URL.revokeObjectURL(t),b("Exported session file (.homura)!")});const x=document.getElementById("file-input-session");var O;(O=document.getElementById("btn-import-session"))==null||O.addEventListener("click",()=>{x.click()});x.addEventListener("change",async()=>{var t;const r=(t=x.files)==null?void 0:t[0];if(!r)return;const e=await r.text();try{const a=JSON.parse(e);p.import(a),k(),b("Session successfully imported and restored!")}catch{b("Invalid .homura session file")}x.value=""});p.on("*",(r,e)=>{var a;T++,ie.textContent=`${T} events`;const t=document.createElement("div");for(t.className="log-item",t.innerHTML=`
    <span class="log-action">${r}</span>
    <span class="log-time">${new Date().toLocaleTimeString()}</span>
  `,E.prepend(t);E.children.length>40;)(a=E.lastElementChild)==null||a.remove();k()});k();
