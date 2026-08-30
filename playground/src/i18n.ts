export type Language = 'en' | 'it';

export interface PlaygroundTranslations {
  [key: string]: {
    en: string;
    it: string;
  };
}

export const translations: PlaygroundTranslations = {
  // Brand & Header
  'header.badge': {
    en: 'v1.2.2',
    it: 'v1.2.2'
  },
  'header.subtitle': {
    en: 'State and History Playground',
    it: 'Playground Stato & Cronologia'
  },
  'header.github': {
    en: 'GitHub Repo',
    it: 'Repository GitHub'
  },

  // Sandbox Card
  'sandbox.title': {
    en: 'State Sandbox',
    it: 'Sandbox dello Stato'
  },
  'sandbox.desc': {
    en: 'Execute updates on the Homura engine below. Notice how every state mutation is recorded in the Directed Acyclic Graph on the right, allowing non-destructive time travel, branch forks, and structural diffing.',
    it: 'Esegui modifiche sul motore Homura qui sotto. Ogni mutazione viene registrata nel Grafo Aciclico Diretto (DAG) a destra, consentendo viaggi temporali non distruttivi, bivi e confronto strutturale diff in tempo reale.'
  },
  'btn.add_user': {
    en: 'Add User',
    it: 'Aggiungi Utente'
  },
  'btn.rename_user': {
    en: 'Rename Active User',
    it: 'Rinomina Utente Attivo'
  },
  'btn.add_task': {
    en: 'Push Todo Task',
    it: 'Aggiungi Todo Task'
  },
  'btn.toggle_task': {
    en: 'Toggle Task Complete',
    it: 'Completa/Riapri Task'
  },
  'btn.toggle_theme': {
    en: 'Toggle Theme',
    it: 'Cambia Tema'
  },
  'btn.inc_metric': {
    en: 'Increment Metric',
    it: 'Incrementa Metrica'
  },

  // Advanced Features Card
  'advanced.title': {
    en: 'Advanced State & History Features',
    it: 'Funzionalità Avanzate di Stato & Cronologia'
  },
  'btn.transaction': {
    en: 'Atomic Transaction Batch',
    it: 'Transazione Atomica Batch'
  },
  'btn.replay': {
    en: '▶ Replay Timeline (2x)',
    it: '▶ Riproduci Timeline (2x)'
  },
  'btn.compare_merge': {
    en: 'Compare & Merge Branch',
    it: 'Confronta & Fondi Ramo'
  },
  'btn.compact': {
    en: 'Compact History (Prune Nodes)',
    it: 'Compatta Cronologia (Pota Nodi)'
  },

  // Time Travel Card
  'timetravel.title': {
    en: 'Time-Travel Actions',
    it: 'Azioni di Viaggio Temporale'
  },
  'btn.undo': {
    en: 'Undo 1 Step',
    it: 'Annulla 1 Passo (Undo)'
  },
  'btn.redo': {
    en: 'Redo 1 Step',
    it: 'Ripeti 1 Passo (Redo)'
  },
  'btn.rewind_3': {
    en: 'Rewind 3 Steps',
    it: 'Riavvolgi 3 Passi'
  },
  'btn.fast_forward_3': {
    en: 'Fast-Forward 3 Steps',
    it: 'Avanza 3 Passi'
  },
  'btn.snapshot': {
    en: 'Take Snapshot',
    it: 'Cattura Snapshot'
  },

  // Branching Card
  'branching.title': {
    en: 'Branching Simulator ("Git for State")',
    it: 'Simulatore di Branching ("Git for State")'
  },
  'branching.desc': {
    en: 'Click "Fork Alternative Timeline" after rewinding. Homura will create a new branch without discarding previous history.',
    it: 'Clicca "Crea Linea Temporale Alternativa" dopo essere tornato indietro. Homura creerà un nuovo ramo senza cancellare la cronologia precedente.'
  },
  'btn.fork': {
    en: 'Fork Alternative Timeline',
    it: 'Crea Linea Temporale Alternativa'
  }
};
