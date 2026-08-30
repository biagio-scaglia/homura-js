export type Language = 'en' | 'it';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    it: string;
  };
}

export const translations: TranslationDictionary = {
  // Sidebar & Search
  'sidebar.search_placeholder': {
    en: 'Search documentation... [/]',
    it: 'Cerca nella documentazione... [/]'
  },
  'sidebar.spec': {
    en: '01.0 // SPECIFICATION',
    it: '01.0 // SPECIFICHE TECNICHE'
  },
  'sidebar.overview': {
    en: 'Overview',
    it: 'Panoramica'
  },
  'sidebar.problem': {
    en: 'The Linear Stack Flaw',
    it: 'Il Limite dello Stack Lineare'
  },
  'sidebar.dag': {
    en: 'DAG Branching Model',
    it: 'Modello a Grafo DAG'
  },
  'sidebar.engine': {
    en: '02.0 // ENGINE CORE',
    it: '02.0 // ARCHITETTURA CORE'
  },
  'sidebar.install': {
    en: 'Installation',
    it: 'Installazione'
  },
  'sidebar.quickstart': {
    en: 'Quick Start',
    it: 'Guida Rapida'
  },
  'sidebar.architecture': {
    en: 'Monorepo Packages',
    it: 'Pacchetti Monorepo'
  },
  'sidebar.immutability': {
    en: 'Proxy Draft Engine',
    it: 'Motore Proxy Immutabile'
  },
  'sidebar.diffing': {
    en: 'Structural Diffing',
    it: 'Diffing Strutturale'
  },
  'sidebar.ecosystem': {
    en: '03.0 // ECOSYSTEM',
    it: '03.0 // ECOSISTEMA'
  },
  'sidebar.vanilla': {
    en: 'Vanilla & Static Forms',
    it: 'Moduli Vanilla & Statici'
  },
  'sidebar.wordpress': {
    en: 'WordPress & WooCommerce',
    it: 'WordPress & WooCommerce'
  },
  'sidebar.react': {
    en: 'React 18+ Binding',
    it: 'Integrazione React 18+'
  },
  'sidebar.vue': {
    en: 'Vue 3 Composition',
    it: 'Integrazione Vue 3'
  },
  'sidebar.devtools': {
    en: 'Diagnostic DevTools',
    it: 'DevTools Diagnostiche'
  },
  'sidebar.bugreport': {
    en: 'Forensic Bug Reporting (.homura)',
    it: 'Diagnostica & Bug Reporting (.homura)'
  },
  'sidebar.reference': {
    en: '04.0 // REFERENCE',
    it: '04.0 // RIFERIMENTO API'
  },
  'sidebar.matrix': {
    en: 'Comparison Matrix',
    it: 'Matrice Comparativa'
  },
  'sidebar.api': {
    en: 'API Matrix',
    it: 'Matrice API'
  },
  'sidebar.benchmarks': {
    en: 'Engine Specs',
    it: 'Specifiche e Prestazioni'
  },
  'sidebar.faq': {
    en: 'FAQ',
    it: 'Domande Frequenti'
  },

  // Hero Section
  'hero.title': {
    en: 'The Directed Acyclic Graph State Engine for JavaScript.',
    it: 'Il motore di gestione dello stato a Grafo Aciclico Diretto (DAG) per JavaScript.'
  },
  'hero.p1': {
    en: 'Conventional state managers treat history as a flat stack. When you undo and mutate, future steps are permanently destroyed. HomuraJS forks non-destructive timeline branches — Git for application state.',
    it: 'I gestori di stato tradizionali trattano la cronologia come uno stack lineare piatto. Quando annulli e modifichi, i passaggi futuri vengono distrutti. HomuraJS crea rami temporali non distruttivi — Git per lo stato applicativo.'
  },
  'hero.copy': {
    en: 'COPY',
    it: 'COPIA'
  },
  'hero.cta_docs': {
    en: 'Read Specification',
    it: 'Leggi le Specifiche'
  },
  'hero.cta_demo': {
    en: 'Launch Interactive Studio',
    it: 'Apri lo Studio Interattivo'
  },

  // Live Runtime Sandbox
  'sandbox.title': {
    en: 'LIVE RUNTIME CONSOLE',
    it: 'CONSOLE RUNTIME DAL VIVO'
  },
  'sandbox.btn_inc': {
    en: '+10 Increment',
    it: '+10 Incrementa'
  },
  'sandbox.btn_user': {
    en: 'Switch User',
    it: 'Cambia Utente'
  },
  'sandbox.btn_undo': {
    en: 'Undo Step',
    it: 'Annulla Step'
  },
  'sandbox.btn_redo': {
    en: 'Redo Step',
    it: 'Ripeti Step'
  },
  'sandbox.btn_fork': {
    en: 'Fork Timeline',
    it: 'Biforca Ramo'
  },
  'sandbox.btn_snap': {
    en: 'Create Snapshot',
    it: 'Crea Snapshot'
  },
  'sandbox.btn_tx': {
    en: 'Atomic Tx',
    it: 'Transazione Atomica'
  },
  'sandbox.btn_replay': {
    en: 'Timeline Replay',
    it: 'Riproduci Timeline'
  },
  'sandbox.btn_export': {
    en: 'Export .homura',
    it: 'Esporta .homura'
  },
  'sandbox.btn_import': {
    en: 'Import Session',
    it: 'Importa Sessione'
  },

  // Section 01.1: Linear History Problem
  'problem.title': {
    en: 'The Fundamental Flaw of Linear History',
    it: 'Il Limite Strutturale della Cronologia Lineare'
  },
  'problem.p1': {
    en: 'Every standard undo/redo implementation (from Redux-Undo to naive history arrays) uses a 1D linear stack. This model creates silent, permanent data loss during real-world user interaction:',
    it: "Tutte le implementazioni standard di annulla/ripeti (da Redux-Undo agli array di cronologia) utilizzano uno stack lineare monodimensionale. Questo modello causa la perdita silenziosa e permanente dei dati durante l'interazione:"
  },

  // Section 01.2: DAG Model
  'dag.title': {
    en: 'Directed Acyclic Graph (DAG) Topology',
    it: 'Topologia a Grafo Aciclico Diretto (DAG)'
  },
  'dag.p1': {
    en: 'Each state in HomuraJS is an immutable node containing state snapshots, parent-child links, timestamps, and semantic metadata:',
    it: 'Ogni stato in HomuraJS e un nodo immutabile contenente istantanee di stato, collegamenti genitore-figlio, timestamp e metadati semantici:'
  },

  // Section 02.0: Installation
  'install.title': {
    en: 'Package Installation',
    it: 'Installazione dei Pacchetti'
  },
  'install.p1': {
    en: 'Install the unified meta-package or individual modular packages according to your project requirements:',
    it: 'Installa il meta-pacchetto unificato o i singoli pacchetti modulari in base alle esigenze del tuo progetto:'
  },

  // Section 02.1: Quickstart
  'quickstart.title': {
    en: 'Quick Start Specification',
    it: 'Guida Rapida alle Specifiche'
  },
  'quickstart.p1': {
    en: 'Initialize the engine, perform mutations via Copy-On-Write draft proxies, and execute non-destructive time travel:',
    it: 'Inizializza il motore, esegui mutazioni tramite proxy draft Copy-On-Write ed effettua viaggi temporali non distruttivi:'
  },

  // Section 02.2: Architecture
  'architecture.title': {
    en: 'Monorepo Package Architecture',
    it: 'Architettura dei Pacchetti Monorepo'
  },

  // Section 02.3: Immutability
  'immutability.title': {
    en: 'Copy-On-Write Proxy Immutability',
    it: 'Immutabilita tramite Proxy Copy-On-Write'
  },
  'immutability.p1': {
    en: 'HomuraJS intercepts state writes using JavaScript Proxies. Mutations are isolated in a temporary draft and applied with structural sharing:',
    it: 'HomuraJS intercetta le scritture di stato tramite Proxy JavaScript. Le mutazioni vengono isolate in una bozza temporanea e applicate con condivisione strutturale:'
  },

  // Section 02.4: Diffing
  'diffing.title': {
    en: 'Structural Diff Engine & Replay',
    it: 'Motore di Diffing Strutturale & Riproduzione'
  },
  'diffing.p1': {
    en: 'Calculate recursive JSON difference sets between any two nodes in the DAG with exact dot-paths and types:',
    it: 'Calcola insiemi ricorsivi di differenze JSON tra due nodi qualsiasi del DAG con dot-path esatti e tipologie:'
  },

  // Section 03.1: Vanilla JS & Static Sites
  'vanilla.title': {
    en: 'Vanilla JS & Zero-JS Static Site Form Engine',
    it: 'Motore Moduli Vanilla JS & Siti Statici Senza JavaScript'
  },
  'vanilla.p1': {
    en: 'Turn any static HTML form (Webflow, Shopify, Squarespace, Static HTML) into a time-travel crash-recovery machine without writing JavaScript:',
    it: 'Trasforma qualsiasi form HTML statico (Webflow, Shopify, Squarespace, HTML puro) in un sistema di recupero dati con cronologia temporale senza scrivere codice JavaScript:'
  },
  'vanilla.h3_wizard': {
    en: 'Multi-Step Form Wizard (data-homura-wizard)',
    it: 'Wizard di Moduli a Piu Fasi (data-homura-wizard)'
  },

  // Section 03.2: WordPress & WooCommerce
  'wordpress.title': {
    en: 'WordPress & WooCommerce Integration',
    it: 'Integrazione WordPress & WooCommerce'
  },
  'wordpress.p1': {
    en: 'The official HomuraJS WordPress plugin brings DAG state history, checkout recovery, and form crash protection to WordPress:',
    it: 'Il plugin ufficiale di HomuraJS per WordPress porta la cronologia DAG, il recupero del carrello/checkout e la protezione da crash dei moduli su WordPress:'
  },
  'wordpress.h3_autohook': {
    en: 'Automatic Hooks for Top Form Engines',
    it: 'Rilevamento Automatico per i Principali Form Engine'
  },

  // Section 03.3: React
  'react.title': {
    en: 'React 18+ Integration (@homura-js/react)',
    it: 'Integrazione React 18+ (@homura-js/react)'
  },

  // Section 03.4: Vue
  'vue.title': {
    en: 'Vue 3 Composition API (@homura-js/vue)',
    it: 'Integrazione Vue 3 Composition API (@homura-js/vue)'
  },

  // Section 03.5: DevTools
  'devtools.title': {
    en: 'Embedded Diagnostic DevTools',
    it: 'DevTools Diagnostiche Integrate'
  },
  'devtools.p1': {
    en: 'Zero-dependency diagnostic panel with visual DAG tree, state inspector, and diff scrubber:',
    it: "Pannello diagnostico a zero dipendenze con albero DAG visivo, ispettore di stato e scrubber di differenze:"
  },

  // Section 03.6: Forensic Bug Reporting
  'bugreport.title': {
    en: 'Forensic Bug Reporting & Session Playback (.homura)',
    it: 'Diagnostica Forense & Riproduzione Sessioni (.homura)'
  },
  'bugreport.p1': {
    en: 'Debug application state like you debug source code. Export entire DAG timelines from production or QA sessions and replay them step-by-step on any developer machine:',
    it: 'Effettua il debug dello stato applicativo come esegui il debug del codice sorgente. Esporta l\'intera cronologia DAG da sessioni di produzione o QA e riproducila passo dopo passo su qualsiasi macchina di sviluppo:'
  },

  // Section 04.0: Comparison Matrix
  'matrix.title': {
    en: 'Competitive Architecture Comparison',
    it: 'Confronto Architetturale Competitivo'
  },
  'matrix.p1': {
    en: 'How HomuraJS Directed Acyclic Graph (DAG) state topology compares to linear history stacks and alternative engines:',
    it: 'Come si confronta la topologia di stato a Grafo Aciclico Diretto (DAG) di HomuraJS rispetto agli stack di cronologia lineare tradizionali e ad altri motori:'
  },

  // Section 04.1: API Matrix
  'api.title': {
    en: 'Complete Homura<T> API Matrix',
    it: 'Matrice Completa API Homura<T>'
  },

  // Section 04.1: Benchmarks
  'benchmarks.title': {
    en: 'Engine Performance Specs',
    it: 'Specifiche e Benchmark di Prestazione'
  },

  // Section 04.2: FAQ
  'faq.title': {
    en: 'Frequently Asked Questions',
    it: 'Domande Frequenti (FAQ)'
  },
  'faq.q1': {
    en: 'How does HomuraJS prevent memory leaks with large DAG histories?',
    it: 'Come previene HomuraJS i memory leak con grafi di cronologia molto ampi?'
  },
  'faq.a1': {
    en: 'HomuraJS uses Copy-On-Write structural sharing: unmodified parts of the state tree share memory references across all nodes. Additionally, compact() and pruneHistory() allow pruning redundant linear steps while preserving named snapshots and branch junctions.',
    it: 'HomuraJS utilizza la condivisione strutturale Copy-On-Write: le porzioni non modificate dell\'albero di stato condividono i puntatori di memoria tra tutti i nodi. Inoltre, compact() e pruneHistory() consentono di pulire i passaggi lineari ridondanti preservando snapshot e bivi di diramazione.'
  },
  'faq.q2': {
    en: 'Can HomuraJS be used without React or Vue?',
    it: 'HomuraJS puo essere utilizzato senza React o Vue?'
  },
  'faq.a2': {
    en: 'Yes. @homura-js/core has zero dependencies. You can use it in Vanilla JS, Node.js, Svelte, Solid, Angular, or in static HTML/WordPress sites via @homura-js/vanilla or shortcodes.',
    it: 'Certamente. @homura-js/core non ha alcuna dipendenza esterna. Puo essere impiegato in Vanilla JS, Node.js, Svelte, Solid, Angular o in pagine HTML statiche e siti WordPress tramite @homura-js/vanilla o shortcode.'
  },
  'faq.q3': {
    en: 'How does HomuraJS protect WooCommerce checkout & WordPress forms?',
    it: 'Come protegge HomuraJS il checkout di WooCommerce e i moduli WordPress?'
  },
  'faq.a3': {
    en: 'The official WordPress plugin auto-hooks into .woocommerce-checkout, .wpcf7, .wpforms-form, .gform_wrapper, and .elementor-form, saving input to LocalStorage in real-time. If the browser crashes, refreshes, or loses connection, customer input is seamlessly recovered.',
    it: 'Il plugin ufficiale per WordPress si aggancia automaticamente a .woocommerce-checkout, .wpcf7, .wpforms-form, .gform_wrapper ed .elementor-form, salvando i dati inseriti in LocalStorage in tempo reale. In caso di crash, ricaricamento o chiusura della scheda, tutti i campi vengono ripristinati istantaneamente.'
  },
  'faq.q4': {
    en: 'Can HomuraJS be used on static sites without npm (CDN)?',
    it: 'HomuraJS puo essere usato su siti statici senza npm tramite CDN?'
  },
  'faq.a4': {
    en: 'Yes. Include unpkg.com/@biagioscaglia/homurajs/dist/index.global.js via script tag and declare data-homura-form="form_id" data-homura-persist="localstorage" on your HTML forms.',
    it: 'Si. Basta includere unpkg.com/@biagioscaglia/homurajs/dist/index.global.js tramite tag script e inserire gli attributi data-homura-form="form_id" data-homura-persist="localstorage" nei tuoi form HTML.'
  },

  // Toasts
  'toast.copied': {
    en: 'Copied to clipboard',
    it: 'Copiato negli appunti'
  },
  'toast.cmd_copied': {
    en: 'Command copied to clipboard',
    it: 'Comando copiato negli appunti'
  }
};
