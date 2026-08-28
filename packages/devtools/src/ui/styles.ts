/**
 * Pure CSS stylesheet for HomuraJS DevTools.
 * Engineered with a modern dark-first aesthetic, crisp cyber-slate colors,
 * glassmorphic surfaces, fluid micro-interactions, and zero external runtime styling dependencies.
 */
export const devtoolsStyles = `
:root, .homura-devtools-root {
  --hm-bg-base: #0a0d14;
  --hm-bg-surface: #111722;
  --hm-bg-surface-elevated: #182232;
  --hm-bg-card: #141c2b;
  --hm-bg-card-hover: #1e293b;
  --hm-bg-active: rgba(255, 71, 87, 0.12);
  --hm-border: rgba(255, 255, 255, 0.08);
  --hm-border-focus: rgba(255, 71, 87, 0.4);
  --hm-border-subtle: rgba(255, 255, 255, 0.04);
  
  --hm-accent: #ff4757;
  --hm-accent-glow: rgba(255, 71, 87, 0.35);
  --hm-accent-hover: #ff6b81;
  --hm-cyan: #00d2d3;
  --hm-cyan-glow: rgba(0, 210, 211, 0.25);
  --hm-purple: #a855f7;
  --hm-green: #2ed573;
  --hm-amber: #ffa502;
  --hm-red: #ff4757;

  --hm-text-primary: #f1f5f9;
  --hm-text-secondary: #94a3b8;
  --hm-text-muted: #64748b;
  
  --hm-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --hm-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;

  --hm-radius-sm: 4px;
  --hm-radius-md: 8px;
  --hm-radius-lg: 12px;
  --hm-shadow-lg: 0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 71, 87, 0.1);
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
  width: 900px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 40px);
  border-radius: var(--hm-radius-lg);
  box-shadow: var(--hm-shadow-lg);
  z-index: 999999;
  overflow: hidden;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
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
  width: 320px;
  min-width: 260px;
  border-right: 1px solid var(--hm-border);
  display: flex;
  flex-direction: column;
  background: var(--hm-bg-surface);
  flex-shrink: 0;
}

.homura-content-area {
  flex: 1;
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
`;
