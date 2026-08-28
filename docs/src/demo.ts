import { createHomura, HistoryEntry } from '@homura-js/core';
import { mountDevTools } from '@homura-js/devtools';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'med' | 'low';
  column: 'todo' | 'progress' | 'done';
  assignee: string;
}

interface KanbanState {
  projectName: string;
  tasks: Task[];
}

const initialTasks: Task[] = [
  { id: 'tsk_1', title: 'Implement DAG Non-Destructive History', priority: 'high', column: 'done', assignee: 'Biagio' },
  { id: 'tsk_2', title: '3-Way Merge & Conflict Resolution Engine', priority: 'high', column: 'progress', assignee: 'Biagio' },
  { id: 'tsk_3', title: 'Interactive Live DevTools GUI & Scrubbing', priority: 'med', column: 'todo', assignee: 'Dev Team' },
  { id: 'tsk_4', title: 'IndexedDB Offline Persistence Adapter', priority: 'low', column: 'todo', assignee: 'Dev Team' }
];

// Initialize HomuraJS State Engine
const homura = createHomura<KanbanState>({
  initialState: {
    projectName: 'CyberFlow Engine v1.2',
    tasks: initialTasks
  },
  maxHistory: 500
});

// Mount embedded diagnostic DevTools in floating mode
const devtools = mountDevTools(homura, {
  position: 'floating',
  theme: 'dark',
  defaultOpen: false
});

// DOM Elements
const listTodo = document.getElementById('list-todo')!;
const listProgress = document.getElementById('list-progress')!;
const listDone = document.getElementById('list-done')!;
const countTodo = document.getElementById('count-todo')!;
const countProgress = document.getElementById('count-progress')!;
const countDone = document.getElementById('count-done')!;
const activeBranchLabel = document.getElementById('active-branch-label')!;
const eventLog = document.getElementById('event-log')!;
const eventCountEl = document.getElementById('event-count')!;
const toastEl = document.getElementById('toast')!;

let totalEvents = 0;

function showToast(msg: string, iconSvg: string = '') {
  toastEl.innerHTML = iconSvg ? `${iconSvg} <span>${msg}</span>` : msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function renderBoard() {
  const state = homura.getState();
  const currentBranch = homura.getCurrentBranch();
  activeBranchLabel.textContent = currentBranch.name;

  listTodo.innerHTML = '';
  listProgress.innerHTML = '';
  listDone.innerHTML = '';

  let cTodo = 0;
  let cProg = 0;
  let cDone = 0;

  for (const task of state.tasks) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.title = 'Click to advance task to next column';

    const priorityClass = 
      task.priority === 'high' ? 'tag-priority-high' :
      task.priority === 'med' ? 'tag-priority-med' : 'tag-priority-low';

    card.innerHTML = `
      <div class="task-card-title">${task.title}</div>
      <div class="task-card-meta">
        <span class="tag-priority ${priorityClass}">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          <span>${task.priority.toUpperCase()}</span>
        </span>
        <span class="tag-assignee">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>${task.assignee}</span>
        </span>
      </div>
    `;

    card.addEventListener('click', () => {
      advanceTask(task.id);
    });

    if (task.column === 'todo') {
      listTodo.appendChild(card);
      cTodo++;
    } else if (task.column === 'progress') {
      listProgress.appendChild(card);
      cProg++;
    } else {
      listDone.appendChild(card);
      cDone++;
    }
  }

  countTodo.textContent = cTodo.toString();
  countProgress.textContent = cProg.toString();
  countDone.textContent = cDone.toString();
}

function advanceTask(taskId: string) {
  homura.update(draft => {
    const t = draft.tasks.find(x => x.id === taskId);
    if (!t) return;
    if (t.column === 'todo') t.column = 'progress';
    else if (t.column === 'progress') t.column = 'done';
    else t.column = 'todo';
  }, { label: `Advance task ${taskId}` });
}

// 1. Add Single Task
document.getElementById('btn-add-task')?.addEventListener('click', () => {
  const taskTitles = [
    'Refactor Structural Diff Algorithm',
    'Add Web Worker Benchmark Profiler',
    'Write Comprehensive Stress Tests',
    'Design Cyberpunk Obsidian Theme Tokens',
    'Optimize Copy-On-Write Proxy Trap Latency'
  ];
  const randTitle = taskTitles[Math.floor(Math.random() * taskTitles.length)];
  const randPrio: ('high' | 'med' | 'low')[] = ['high', 'med', 'low'];
  const prio = randPrio[Math.floor(Math.random() * randPrio.length)];

  homura.update(draft => {
    draft.tasks.push({
      id: `tsk_${Date.now().toString(36)}`,
      title: randTitle,
      priority: prio,
      column: 'todo',
      assignee: 'Biagio'
    });
  }, { label: `Add task: ${randTitle}` });

  showToast(`Added task: "${randTitle}"`);
});

// 2. Atomic Transaction (Batch 3 tasks at once as 1 commit)
document.getElementById('btn-batch-tx')?.addEventListener('click', () => {
  homura.transaction(draft => {
    draft.tasks.push({
      id: `tx_${Date.now()}_1`,
      title: 'Batch Item Alpha: Security Audit',
      priority: 'high',
      column: 'todo',
      assignee: 'SecOps'
    });
    draft.tasks.push({
      id: `tx_${Date.now()}_2`,
      title: 'Batch Item Beta: Memory Compaction',
      priority: 'med',
      column: 'progress',
      assignee: 'Core Team'
    });
    draft.tasks.push({
      id: `tx_${Date.now()}_3`,
      title: 'Batch Item Gamma: E2E Pipeline',
      priority: 'low',
      column: 'done',
      assignee: 'CI/CD'
    });
  }, { label: 'Atomic Transaction: Sprint 4 Sprint Tasks' });

  showToast('Atomic transaction committed (3 tasks in 1 node)!');
});

// 3. Undo / Redo
document.getElementById('btn-undo')?.addEventListener('click', () => {
  const res = homura.undo();
  if (res) showToast(`Undone to: ${res.label}`);
  else showToast('No further undo history in this branch');
});

document.getElementById('btn-redo')?.addEventListener('click', () => {
  const res = homura.redo();
  if (res) showToast(`Redone to: ${res.label}`);
  else showToast('Already at newest state in this branch');
});

// 4. Fork Parallel Branch
let branchCounter = 1;
document.getElementById('btn-fork')?.addEventListener('click', () => {
  const name = `feature-branch-${branchCounter++}`;
  const branch = homura.createBranch(name);
  homura.switchBranch(branch.id);
  homura.update(draft => {
    draft.projectName = `CyberFlow [Branch: ${name}]`;
    draft.tasks.push({
      id: `branch_tsk_${Date.now()}`,
      title: `Experimental Feature for ${name}`,
      priority: 'high',
      column: 'progress',
      assignee: 'Experiment Lead'
    });
  }, { label: `Initialize ${name}` });

  showToast(`Forked & switched to "${name}"`);
});

// 5. 3-Way Merge
document.getElementById('btn-merge')?.addEventListener('click', () => {
  const branches = homura.getBranches();
  const current = homura.getCurrentBranch();
  const other = branches.find(b => b.id !== current.id);

  if (!other) {
    showToast('Create a parallel branch with "Fork Branch" first!');
    return;
  }

  homura.merge(other.id, {
    strategy: 'theirs',
    label: `Merge branch '${other.name}' into '${current.name}'`
  });

  showToast(`Merged '${other.name}' into '${current.name}'!`);
});

// 6. Snapshot
document.getElementById('btn-snap')?.addEventListener('click', () => {
  const snap = homura.snapshot(`Milestone Checkpoint #${Date.now().toString(36)}`, {
    taskCount: homura.getState().tasks.length
  });
  showToast(`Snapshot "${snap.name}" captured!`);
});

// 7. Time-Travel Replay
document.getElementById('btn-replay')?.addEventListener('click', async () => {
  showToast('Starting step-by-step history replay (2x speed)...');
  await homura.replay({
    speed: 2,
    onStep: (entry: HistoryEntry<KanbanState>, idx: number, total: number) => {
      showToast(`Replaying step [${idx + 1}/${total}]: ${entry.label}`);
      renderBoard();
    }
  });
  showToast('Replay finished!');
});

// Toggle DevTools button
document.getElementById('btn-toggle-devtools')?.addEventListener('click', () => {
  devtools.toggle();
});

// Export session
document.getElementById('btn-export-session')?.addEventListener('click', () => {
  const data = homura.export();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `homura-session-${Date.now()}.homura`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported session file (.homura)!');
});

// Import session
const fileInput = document.getElementById('file-input-session') as HTMLInputElement;
document.getElementById('btn-import-session')?.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    homura.import(data);
    renderBoard();
    showToast('Session successfully imported and restored!');
  } catch (err) {
    showToast('Invalid .homura session file');
  }
  fileInput.value = '';
});

// Wildcard DAG event listener to stream real-time events to the UI
homura.on('*', (eventName, _eventData: any) => {
  totalEvents++;
  eventCountEl.textContent = `${totalEvents} events`;

  const item = document.createElement('div');
  item.className = 'log-item';
  
  item.innerHTML = `
    <span class="log-action">${eventName}</span>
    <span class="log-time">${new Date().toLocaleTimeString()}</span>
  `;
  eventLog.prepend(item);

  // Keep log at max 40 items
  while (eventLog.children.length > 40) {
    eventLog.lastElementChild?.remove();
  }

  renderBoard();
});

// Initial render
renderBoard();
