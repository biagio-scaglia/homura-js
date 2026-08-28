import { createHomura } from '@homura-js/core';
import { translations, Language } from './i18n';

// 1. Language State & i18n Controller (Default: 'en')
let currentLang: Language = (localStorage.getItem('homura_docs_lang') as Language) || 'en';

export function setLanguage(lang: Language): void {
  currentLang = lang;
  localStorage.setItem('homura_docs_lang', lang);
  document.documentElement.lang = lang;

  // Update text content for data-i18n
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[key] && translations[key][lang]) {
      el.textContent = translations[key][lang];
    }
  });

  // Update placeholders
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && translations[key] && translations[key][lang]) {
      el.placeholder = translations[key][lang];
    }
  });

  // Update Toggle Button Label
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = lang.toUpperCase();
  }

  // Refresh Sandbox State display with language
  renderSandbox();
}

// 2. Language Switcher Button Listener
const btnLangToggle = document.getElementById('btn-lang-toggle');
btnLangToggle?.addEventListener('click', () => {
  const nextLang: Language = currentLang === 'en' ? 'it' : 'en';
  setLanguage(nextLang);
  showToast(nextLang === 'en' ? 'Language switched to English' : 'Lingua impostata su Italiano');
});

// 3. Toast Notification Helper
const toast = document.getElementById('toast')!;
const toastText = document.getElementById('toast-text') || toast;

function showToast(message: string): void {
  toastText.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// 4. Code Copy Buttons
document.querySelectorAll('.code-copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pre = btn.closest('.code-container')?.querySelector('pre code');
    if (pre) {
      navigator.clipboard.writeText(pre.textContent || '');
      showToast(translations['toast.copied'][currentLang]);
    }
  });
});

// Quick install copy in header
document.getElementById('btn-copy-install')?.addEventListener('click', () => {
  navigator.clipboard.writeText('npm install @homura-js/core');
  showToast(translations['toast.cmd_copied'][currentLang]);
});

// 5. Package Manager Tabs
const installCommands: Record<string, string> = {
  npm: 'npm install @homura-js/core',
  pnpm: 'pnpm add @homura-js/core',
  yarn: 'yarn add @homura-js/core',
  bun: 'bun add @homura-js/core'
};

const installCmdEl = document.getElementById('install-cmd');
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab') || 'npm';
    if (installCmdEl && installCommands[tab]) {
      installCmdEl.textContent = installCommands[tab];
    }
  });
});

// 6. Real-time Search Filter
const searchBar = document.getElementById('search-bar') as HTMLInputElement | null;
searchBar?.addEventListener('input', e => {
  const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
  const sections = document.querySelectorAll('.docs-content section');

  sections.forEach(section => {
    const text = section.textContent?.toLowerCase() || '';
    if (!query || text.includes(query)) {
      (section as HTMLElement).style.display = 'block';
    } else {
      (section as HTMLElement).style.display = 'none';
    }
  });
});

// 7. Interactive Live Homura Sandbox in Docs
interface SandboxState {
  counter: number;
  user: string;
  branch: string;
  historyLog: string[];
}

const homuraSandbox = createHomura<SandboxState>({
  initialState: {
    counter: 0,
    user: 'Homura',
    branch: 'main',
    historyLog: ['Initialized']
  }
});

const sbDisplay = document.getElementById('sb-state-display');
const sbStatus = document.getElementById('sb-status');

function renderSandbox(): void {
  const state = homuraSandbox.getState();
  const entry = homuraSandbox.getCurrentEntry();
  const branch = homuraSandbox.getCurrentBranch();

  if (sbDisplay) {
    sbDisplay.textContent = JSON.stringify(
      {
        ...state,
        _activeNode: entry.label,
        _activeBranch: branch.name,
        _nodeId: entry.id.slice(0, 8) + '...'
      },
      null,
      2
    );
  }

  if (sbStatus) {
    const nodeLabel = currentLang === 'en' ? 'Active Node' : 'Nodo Attivo';
    const branchLabel = currentLang === 'en' ? 'Branch' : 'Ramo';
    sbStatus.textContent = `${nodeLabel}: "${entry.label}" (${branchLabel}: ${branch.name})`;
  }
}

homuraSandbox.on('state:change', renderSandbox);
homuraSandbox.on('branch:switch', renderSandbox);

// Sandbox Controls
document.getElementById('sb-btn-inc')?.addEventListener('click', () => {
  const incLabel = currentLang === 'en' ? 'Increment +10' : 'Incremento +10';
  homuraSandbox.update(d => {
    d.counter += 10;
    d.historyLog.push(`+10 (Total: ${d.counter})`);
  }, { label: incLabel });
});

const users = ['Akemi', 'Madoka', 'Sayaka', 'Kyoko', 'Mami'];
let uIdx = 0;
document.getElementById('sb-btn-user')?.addEventListener('click', () => {
  uIdx = (uIdx + 1) % users.length;
  const nextUser = users[uIdx]!;
  const userLabel = currentLang === 'en' ? `Switch User -> ${nextUser}` : `Cambio Utente -> ${nextUser}`;
  homuraSandbox.update(d => {
    d.user = nextUser;
    d.historyLog.push(`User: ${nextUser}`);
  }, { label: userLabel });
});

document.getElementById('sb-btn-undo')?.addEventListener('click', () => {
  homuraSandbox.undo();
});

document.getElementById('sb-btn-redo')?.addEventListener('click', () => {
  homuraSandbox.redo();
});

document.getElementById('sb-btn-fork')?.addEventListener('click', () => {
  const branchName = `timeline-${Date.now().toString(36).slice(-4)}`;
  homuraSandbox.createBranch(branchName);
  const forkLabel = currentLang === 'en' ? 'Forked Alternative Timeline' : 'Inizio Linea Temporale Alternativa';
  homuraSandbox.update(d => {
    d.user = 'Chronos Entity';
    d.branch = branchName;
    d.counter = 999;
  }, { label: forkLabel });
  showToast(currentLang === 'en' ? `Created new branch: ${branchName}` : `Creato nuovo ramo: ${branchName}`);
});

document.getElementById('sb-btn-snap')?.addEventListener('click', () => {
  const count = homuraSandbox.getSnapshots().length + 1;
  const snapName = currentLang === 'en' ? `Milestone #${count}` : `Punto di Controllo #${count}`;
  const s = homuraSandbox.snapshot(snapName);
  showToast(currentLang === 'en' ? `Snapshot created: ${s.name}` : `Snapshot creato: ${s.name}`);
});

// Initialize default language
setLanguage(currentLang);
