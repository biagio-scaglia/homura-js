import { createHomura } from '@homurajs/core';
import { mountDevTools } from '@homurajs/devtools';

interface PlaygroundState {
  user: {
    name: string;
    role: string;
    verified: boolean;
  } | null;
  settings: {
    theme: 'dark' | 'light';
    notifications: boolean;
  };
  tasks: { id: string; title: string; done: boolean }[];
  metrics: {
    counter: number;
    lastUpdated: number;
  };
}

const initialState: PlaygroundState = {
  user: {
    name: 'Mario Rossi',
    role: 'Lead Architect',
    verified: true
  },
  settings: {
    theme: 'dark',
    notifications: true
  },
  tasks: [
    { id: '1', title: 'Implement DAG history graph', done: true },
    { id: '2', title: 'Build interactive Diff Viewer', done: true },
    { id: '3', title: 'Write unit tests and documentation', done: false }
  ],
  metrics: {
    counter: 100,
    lastUpdated: Date.now()
  }
};

const homura = createHomura<PlaygroundState>({
  initialState,
  maxHistory: 500,
  enableBranches: true
});

// Mount DevTools in the right pane
mountDevTools(homura, {
  container: '#devtools-container',
  position: 'embedded',
  title: 'HOMURA DEVTOOLS'
});

// UI event handlers
const names = ['Luigi Verdi', 'Peach Toadstool', 'Bowser Koopa', 'Yoshi Dino', 'Rosalina Star'];
let nameIdx = 0;

document.getElementById('btn-add-user')?.addEventListener('click', () => {
  homura.update(d => {
    d.user = {
      name: 'Princess Daisy',
      role: 'Sarasaland Ruler',
      verified: true
    };
  }, { label: 'Added User: Princess Daisy' });
});

document.getElementById('btn-rename-user')?.addEventListener('click', () => {
  nameIdx = (nameIdx + 1) % names.length;
  const nextName = names[nameIdx]!;
  homura.update(d => {
    if (d.user) {
      d.user.name = nextName;
    } else {
      d.user = { name: nextName, role: 'Member', verified: false };
    }
  }, { label: `Renamed User to ${nextName}` });
});

let taskCounter = 4;
document.getElementById('btn-add-task')?.addEventListener('click', () => {
  homura.update(d => {
    d.tasks.push({
      id: String(taskCounter++),
      title: `Deploy release build #${taskCounter}`,
      done: false
    });
  }, { label: `Pushed Task #${taskCounter - 1}` });
});

document.getElementById('btn-toggle-task')?.addEventListener('click', () => {
  homura.update(d => {
    const uncompleted = d.tasks.find(t => !t.done);
    if (uncompleted) {
      uncompleted.done = true;
    } else if (d.tasks.length > 0) {
      d.tasks[0]!.done = false;
    }
  }, { label: 'Toggled Task Status' });
});

document.getElementById('btn-toggle-theme')?.addEventListener('click', () => {
  homura.update(d => {
    d.settings.theme = d.settings.theme === 'dark' ? 'light' : 'dark';
  }, { label: `Switched Theme to ${d.settings.theme === 'dark' ? 'light' : 'dark'}` });
});

document.getElementById('btn-inc-metric')?.addEventListener('click', () => {
  homura.update(d => {
    d.metrics.counter += 10;
    d.metrics.lastUpdated = Date.now();
  }, { label: 'Incremented Counter +10' });
});

document.getElementById('btn-undo')?.addEventListener('click', () => homura.undo());
document.getElementById('btn-redo')?.addEventListener('click', () => homura.redo());
document.getElementById('btn-rewind-3')?.addEventListener('click', () => homura.rewind(3));
document.getElementById('btn-fast-forward-3')?.addEventListener('click', () => homura.fastForward(3));

document.getElementById('btn-snapshot')?.addEventListener('click', () => {
  const name = prompt('Snapshot label:', `Snapshot #${homura.getSnapshots().length + 1}`);
  if (name) homura.snapshot(name);
});

document.getElementById('btn-fork')?.addEventListener('click', () => {
  const branchName = prompt('New Branch Name:', `experiment-${Date.now().toString(36)}`);
  if (branchName) {
    homura.createBranch(branchName);
    homura.update(d => {
      d.user = { name: 'Alternative Entity', role: 'Quantum Divergence', verified: true };
      d.metrics.counter = 9999;
    }, { label: 'Divergent Branch Genesis' });
  }
});
