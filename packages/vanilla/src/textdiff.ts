/**
 * HomuraJS — Visual Copywriting Git Diff & Scrubber
 * Computes word-level differences and renders an interactive visual diff timeline for long text fields.
 */

export interface TextDiffResult {
  addedCount: number;
  removedCount: number;
  html: string;
}

/**
 * Computes a word-by-word visual diff between old text and new text.
 */
export function computeWordDiff(oldText: string, newText: string): TextDiffResult {
  const oldWords = oldText ? oldText.split(/(\s+)/) : [];
  const newWords = newText ? newText.split(/(\s+)/) : [];

  let addedCount = 0;
  let removedCount = 0;
  let resultHtml = '';

  let i = 0;
  let j = 0;

  while (i < oldWords.length || j < newWords.length) {
    if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
      resultHtml += escapeHtml(oldWords[i]!);
      i++;
      j++;
    } else if (j < newWords.length && (!oldWords.includes(newWords[j]!) || i >= oldWords.length)) {
      resultHtml += `<ins style="background: rgba(34, 197, 94, 0.25); color: #86efac; text-decoration: none; padding: 1px 4px; border-radius: 3px; border-bottom: 2px solid #22c55e;">${escapeHtml(newWords[j]!)}</ins>`;
      if (!/^\s+$/.test(newWords[j]!)) {
        addedCount++;
      }
      j++;
    } else if (i < oldWords.length) {
      resultHtml += `<del style="background: rgba(239, 68, 68, 0.25); color: #fca5a5; text-decoration: line-through; padding: 1px 4px; border-radius: 3px; border-bottom: 2px solid #ef4444;">${escapeHtml(oldWords[i]!)}</del>`;
      if (!/^\s+$/.test(oldWords[i]!)) {
        removedCount++;
      }
      i++;
    } else {
      break;
    }
  }

  return {
    addedCount,
    removedCount,
    html: resultHtml || '<span style="color: #a78bfa; font-style: italic;">No textual changes detected.</span>'
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Creates an interactive Visual Diff modal overlay with a timeline scrubber.
 */
export function createVisualDiffViewer(options: {
  fieldName: string;
  historyEntries: { id: string; timestamp: number; label: string; text: string }[];
  currentText: string;
  onJumpToEntry?: (entryId: string) => void;
}): void {
  const existing = document.getElementById('homura-visual-diff-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'homura-visual-diff-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const totalSteps = options.historyEntries.length;
  let activeIndex = Math.max(0, totalSteps - 2);

  function renderModalContent() {
    const historicalNode = options.historyEntries[activeIndex];
    const previousText = historicalNode ? historicalNode.text : '';
    const diff = computeWordDiff(previousText, options.currentText);

    modal.innerHTML = `
      <div style="background: #0f071a; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; width: 100%; max-width: 720px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); overflow: hidden; display: flex; flex-direction: column;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(168, 85, 247, 0.2); background: #160a26;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <strong style="color: #f5f3ff; font-size: 15px;">Visual Copywriting Git Diff: <code>${escapeHtml(options.fieldName)}</code></strong>
          </div>
          <button type="button" id="homura-diff-close" style="background: none; border: none; color: #c4b5fd; font-size: 20px; cursor: pointer; padding: 4px;">&times;</button>
        </div>

        <!-- Diff Stats & Timeline Scrubber -->
        <div style="padding: 14px 20px; background: #11071f; border-bottom: 1px solid rgba(168, 85, 247, 0.15); display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px;">
            <span style="color: #c4b5fd;">
              Comparing <strong>Step ${activeIndex + 1}</strong> (${historicalNode ? historicalNode.label : 'Initial'}) vs <strong>Current</strong>
            </span>
            <div style="display: flex; gap: 10px;">
              <span style="color: #86efac;">+${diff.addedCount} additions</span>
              <span style="color: #fca5a5;">-${diff.removedCount} deletions</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 11px; color: #8b5cf6;">T-0</span>
            <input type="range" id="homura-diff-scrubber" min="0" max="${Math.max(0, totalSteps - 1)}" value="${activeIndex}" style="flex: 1; accent-color: #a855f7; cursor: pointer;" />
            <span style="font-size: 11px; color: #8b5cf6;">NOW</span>
          </div>
        </div>

        <!-- Diff Content Viewer -->
        <div style="padding: 20px; max-height: 380px; overflow-y: auto; color: #f5f3ff; font-size: 14px; line-height: 1.7; white-space: pre-wrap; background: #08030e; font-family: 'Inter', system-ui, sans-serif;">
          ${diff.html}
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #160a26; border-top: 1px solid rgba(168, 85, 247, 0.2);">
          <button type="button" id="homura-diff-jump-btn" style="background: #a855f7; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;">
            ↩ Rollback to Step ${activeIndex + 1}
          </button>
          <button type="button" id="homura-diff-close-btn" style="background: rgba(255,255,255,0.08); color: #c4b5fd; border: 1px solid rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer;">
            Close Inspector
          </button>
        </div>
      </div>
    `;

    modal.querySelector('#homura-diff-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('#homura-diff-close-btn')?.addEventListener('click', () => modal.remove());

    const scrubber = modal.querySelector('#homura-diff-scrubber') as HTMLInputElement;
    scrubber?.addEventListener('input', (e) => {
      activeIndex = parseInt((e.target as HTMLInputElement).value, 10);
      renderModalContent();
    });

    modal.querySelector('#homura-diff-jump-btn')?.addEventListener('click', () => {
      if (historicalNode) {
        options.onJumpToEntry?.(historicalNode.id);
        modal.remove();
      }
    });
  }

  renderModalContent();
  document.body.appendChild(modal);
}
