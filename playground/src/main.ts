import { createHomura } from '@homura-js/core';
import { mountDevTools } from '@homura-js/devtools';
import { translations, Language } from './i18n';

// 1. Language Controller (Synced with localStorage, default: 'en')
let currentLang: Language = (localStorage.getItem('homura_playground_lang') as Language) ||
                            (localStorage.getItem('homura_docs_lang') as Language) || 'en';

export function setLanguage(lang: Language): void {
  currentLang = lang;
  localStorage.setItem('homura_playground_lang', lang);
  document.documentElement.lang = lang;

  // Update text for elements with data-i18n
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[key] && translations[key][lang]) {
      el.textContent = translations[key][lang];
    }
  });

  // Update active state on language buttons
  const btnEn = document.getElementById('btn-lang-en');
  const btnIt = document.getElementById('btn-lang-it');
  if (btnEn && btnIt) {
    if (lang === 'en') {
      btnEn.classList.add('active');
      btnIt.classList.remove('active');
    } else {
      btnIt.classList.add('active');
      btnEn.classList.remove('active');
    }
  }
}

// Attach listeners to language buttons
document.getElementById('btn-lang-en')?.addEventListener('click', () => setLanguage('en'));
document.getElementById('btn-lang-it')?.addEventListener('click', () => setLanguage('it'));

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
  }, { label: currentLang === 'it' ? 'Aggiunto Utente: Princess Daisy' : 'Added User: Princess Daisy' });
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
  }, { label: currentLang === 'it' ? `Rinominato Utente in ${nextName}` : `Renamed User to ${nextName}` });
});

let taskCounter = 4;
document.getElementById('btn-add-task')?.addEventListener('click', () => {
  const currentTaskNum = taskCounter++;
  homura.update(d => {
    d.tasks.push({
      id: String(currentTaskNum),
      title: `Deploy release build #${currentTaskNum}`,
      done: false
    });
  }, { label: currentLang === 'it' ? `Aggiunto Task #${currentTaskNum}` : `Pushed Task #${currentTaskNum}` });
});

document.getElementById('btn-toggle-task')?.addEventListener('click', () => {
  homura.update(d => {
    const uncompleted = d.tasks.find(t => !t.done);
    if (uncompleted) {
      uncompleted.done = true;
    } else if (d.tasks.length > 0) {
      d.tasks[0]!.done = false;
    }
  }, { label: currentLang === 'it' ? 'Stato Task Aggiornato' : 'Toggled Task Status' });
});

document.getElementById('btn-toggle-theme')?.addEventListener('click', () => {
  homura.update(d => {
    d.settings.theme = d.settings.theme === 'dark' ? 'light' : 'dark';
  }, { label: currentLang === 'it' ? `Cambiato Tema in ${d.settings.theme === 'dark' ? 'light' : 'dark'}` : `Switched Theme to ${d.settings.theme === 'dark' ? 'light' : 'dark'}` });
});

document.getElementById('btn-inc-metric')?.addEventListener('click', () => {
  homura.update(d => {
    d.metrics.counter += 10;
    d.metrics.lastUpdated = Date.now();
  }, { label: currentLang === 'it' ? 'Incremento Contatore +10' : 'Incremented Counter +10' });
});

// Advanced: Transaction Batching
document.getElementById('btn-transaction')?.addEventListener('click', () => {
  homura.transaction(d => {
    d.user = { name: 'Biagio Scaglia', role: 'Homura Author', verified: true };
    d.metrics.counter += 100;
    d.settings.notifications = true;
    d.tasks.push({ id: String(taskCounter++), title: 'Publish Homura v1.2.2', done: true });
  }, { label: currentLang === 'it' ? 'Transazione Atomica Profilo & Task' : 'Atomic Profile & Task Batch' });
});

// Advanced: Replay Engine
document.getElementById('btn-replay')?.addEventListener('click', async () => {
  const replayBtn = document.getElementById('btn-replay') as HTMLButtonElement | null;
  if (replayBtn) replayBtn.disabled = true;
  await homura.replay({ speed: 2, stepDelayMs: 300 });
  if (replayBtn) replayBtn.disabled = false;
});

// Advanced: Branch Compare & Merge
document.getElementById('btn-compare-merge')?.addEventListener('click', () => {
  const branches = homura.getBranches();
  const otherBranch = branches.find(b => b.id !== homura.getCurrentBranch().id);
  if (otherBranch) {
    const comp = homura.compare(homura.getCurrentBranch().id, otherBranch.id);
    const msg = currentLang === 'it'
      ? `Confronto con "${otherBranch.name}":\nIn anticipo: ${comp.aheadCount}, In ritardo: ${comp.behindCount}, Differenze: ${comp.diff.length}`
      : `Comparison with "${otherBranch.name}":\nAhead: ${comp.aheadCount}, Behind: ${comp.behindCount}, Diff Changes: ${comp.diff.length}`;
    alert(msg);
    homura.merge(otherBranch.id, { label: currentLang === 'it' ? `Fuso ramo ${otherBranch.name}` : `Merged branch ${otherBranch.name}` });
  } else {
    alert(currentLang === 'it'
      ? 'Crea prima un ramo alternativo per confrontare e unire i rami!'
      : 'Please fork an alternative timeline branch first to compare and merge!');
  }
});

// Advanced: History Compaction
document.getElementById('btn-compact')?.addEventListener('click', () => {
  const before = homura.getHistory({ allBranches: true }).length;
  const pruned = homura.compact({ maxEntries: 10, preserveSnapshots: true });
  const after = homura.getHistory({ allBranches: true }).length;
  const msg = currentLang === 'it'
    ? `Cronologia compattata:\nRimossi ${pruned} nodi intermedi.\nNodi totali ridotti da ${before} a ${after}.`
    : `History compacted:\nPruned ${pruned} intermediate nodes.\nTotal nodes reduced from ${before} to ${after}.`;
  alert(msg);
});

// Navigation & Actions
document.getElementById('btn-undo')?.addEventListener('click', () => homura.undo());
document.getElementById('btn-redo')?.addEventListener('click', () => homura.redo());
document.getElementById('btn-rewind-3')?.addEventListener('click', () => homura.rewind(3));
document.getElementById('btn-fast-forward-3')?.addEventListener('click', () => homura.fastForward(3));

document.getElementById('btn-snapshot')?.addEventListener('click', () => {
  const promptText = currentLang === 'it' ? 'Etichetta Snapshot:' : 'Snapshot label:';
  const defaultLabel = currentLang === 'it' ? `Snapshot #${homura.getSnapshots().length + 1}` : `Snapshot #${homura.getSnapshots().length + 1}`;
  const name = prompt(promptText, defaultLabel);
  if (name) homura.snapshot(name);
});

document.getElementById('btn-fork')?.addEventListener('click', () => {
  const promptText = currentLang === 'it' ? 'Nome del Nuovo Ramo:' : 'New Branch Name:';
  const branchName = prompt(promptText, `experiment-${Date.now().toString(36)}`);
  if (branchName) {
    homura.createBranch(branchName);
    homura.update(d => {
      d.user = { name: 'Alternative Entity', role: 'Quantum Divergence', verified: true };
      d.metrics.counter = 9999;
    }, { label: currentLang === 'it' ? 'Genesi Ramo Divergente' : 'Divergent Branch Genesis' });
  }
});

// Initial language set
setLanguage(currentLang);
