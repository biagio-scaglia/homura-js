import { createHomura } from '@homura-js/core';

// 1. Toast Notification Helper
const toast = document.getElementById('toast')!;
function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// 2. Code Copy Buttons
document.querySelectorAll('.code-copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pre = btn.closest('.code-container')?.querySelector('pre code');
    if (pre) {
      navigator.clipboard.writeText(pre.textContent || '');
      showToast('Codice copiato negli appunti');
    }
  });
});

// Quick install copy in header
document.getElementById('btn-copy-install')?.addEventListener('click', () => {
  navigator.clipboard.writeText('npm install @homura-js/core');
  showToast('Comando "npm install @homura-js/core" copiato');
});

// 3. Package Manager Tabs
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

// 4. Real-time Search Filter
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

// 5. Interactive Live Homura Sandbox in Docs
interface SandboxState {
  contatore: number;
  utente: string;
  ramo: string;
  cronologia: string[];
}

const homuraSandbox = createHomura<SandboxState>({
  initialState: {
    contatore: 0,
    utente: 'Homura',
    ramo: 'main',
    cronologia: ['Inizializzazione']
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
        _nodoAttivo: entry.label,
        _ramoAttivo: branch.name,
        _idNodo: entry.id.slice(0, 8) + '...'
      },
      null,
      2
    );
  }

  if (sbStatus) {
    sbStatus.textContent = `Nodo: "${entry.label}" (Ramo: ${branch.name})`;
  }
}

homuraSandbox.on('state:change', renderSandbox);
homuraSandbox.on('branch:switch', renderSandbox);
renderSandbox();

// Sandbox Controls
document.getElementById('sb-btn-inc')?.addEventListener('click', () => {
  homuraSandbox.update(d => {
    d.contatore += 10;
    d.cronologia.push(`+10 (Totale: ${d.contatore})`);
  }, { label: 'Incremento +10' });
});

const users = ['Akemi', 'Madoka', 'Sayaka', 'Kyoko', 'Mami'];
let uIdx = 0;
document.getElementById('sb-btn-user')?.addEventListener('click', () => {
  uIdx = (uIdx + 1) % users.length;
  const nextUser = users[uIdx]!;
  homuraSandbox.update(d => {
    d.utente = nextUser;
    d.cronologia.push(`Utente: ${nextUser}`);
  }, { label: `Cambio Utente -> ${nextUser}` });
});

document.getElementById('sb-btn-undo')?.addEventListener('click', () => {
  homuraSandbox.undo();
});

document.getElementById('sb-btn-redo')?.addEventListener('click', () => {
  homuraSandbox.redo();
});

document.getElementById('sb-btn-fork')?.addEventListener('click', () => {
  const branchName = `ramo-alternativo-${Date.now().toString(36).slice(-4)}`;
  homuraSandbox.createBranch(branchName);
  homuraSandbox.update(d => {
    d.utente = 'Entita Temporale';
    d.ramo = branchName;
    d.contatore = 999;
  }, { label: 'Inizio Linea Temporale Alternativa' });
  showToast(`Creato nuovo ramo: ${branchName}`);
});

document.getElementById('sb-btn-snap')?.addEventListener('click', () => {
  const s = homuraSandbox.snapshot(`Milestone #${homuraSandbox.getSnapshots().length + 1}`);
  showToast(`Snapshot creato: ${s.name}`);
});
