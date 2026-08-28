export type Language = 'en' | 'it';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    it: string;
  };
}

export const translations: TranslationDictionary = {
  // Brand & Header
  'brand.subtitle': {
    en: 'Time Travel State & History Engine',
    it: 'Motore di Time Travel State & Cronologia'
  },
  'header.search_placeholder': {
    en: 'Search documentation...',
    it: 'Cerca nella documentazione...'
  },
  'header.copy_install': {
    en: 'Copy Install',
    it: 'Copia Installazione'
  },
  'toast.copied': {
    en: 'Copied to clipboard',
    it: 'Copiato negli appunti'
  },
  'toast.cmd_copied': {
    en: 'Command "npm install @homura-js/core" copied',
    it: 'Comando "npm install @homura-js/core" copiato'
  },

  // Navigation Groups & Links
  'nav.intro': {
    en: 'Introduction',
    it: 'Introduzione'
  },
  'nav.overview': {
    en: 'Overview',
    it: 'Panoramica'
  },
  'nav.why_homura': {
    en: 'Why HomuraJS',
    it: 'Perche HomuraJS'
  },
  'nav.installation': {
    en: 'Installation',
    it: 'Installazione'
  },
  'nav.quickstart': {
    en: 'Quickstart',
    it: 'Guida Rapida'
  },
  'nav.concepts': {
    en: 'Core Concepts',
    it: 'Concetti Fondamentali'
  },
  'nav.state_engine': {
    en: 'State Engine & Immutability',
    it: 'Gestione Stato & Immutabilita'
  },
  'nav.dag_graph': {
    en: 'DAG Graph & Branching',
    it: 'Grafo DAG & Branching'
  },
  'nav.time_travel': {
    en: 'Time Travel Navigation',
    it: 'Viaggio Temporale'
  },
  'nav.snapshots': {
    en: 'Snapshots & Milestones',
    it: 'Snapshot & Milestone'
  },
  'nav.diff_engine': {
    en: 'Structural Diff Engine',
    it: 'Motore di Diff Strutturale'
  },
  'nav.advanced': {
    en: 'Advanced Features',
    it: 'Funzionalita Avanzate'
  },
  'nav.persistence': {
    en: 'Persistence & Storage',
    it: 'Persistenza & Storage'
  },
  'nav.middleware': {
    en: 'Middleware & Pipeline',
    it: 'Middleware & Pipeline'
  },
  'nav.events': {
    en: 'Event System',
    it: 'Sistema Eventi'
  },
  'nav.integrations': {
    en: 'UI Integrations',
    it: 'Integrazioni UI'
  },
  'nav.react': {
    en: 'React 18+',
    it: 'React 18+'
  },
  'nav.vue': {
    en: 'Vue 3',
    it: 'Vue 3'
  },
  'nav.vanilla': {
    en: 'Vanilla JS',
    it: 'Vanilla JS'
  },
  'nav.tools': {
    en: 'Tools & Diagnostics',
    it: 'Strumenti & Diagnostica'
  },
  'nav.devtools': {
    en: 'Embedded DevTools',
    it: 'DevTools Integrati'
  },
  'nav.sandbox': {
    en: 'Live Interactive Sandbox',
    it: 'Sandbox Interattivo Live'
  },
  'nav.faq': {
    en: 'Frequently Asked Questions (FAQ)',
    it: 'Domande Frequenti (FAQ)'
  },
  'nav.api_reference': {
    en: 'API Reference',
    it: 'API Reference'
  },
  'nav.author': {
    en: 'Author & Project',
    it: 'Autore & Progetto'
  },

  // Overview Section
  'overview.title': {
    en: 'HomuraJS',
    it: 'HomuraJS'
  },
  'overview.lead': {
    en: 'High-performance time-travel debugging and state history management engine for JavaScript and TypeScript. A Directed Acyclic Graph (DAG) architecture conceived as "Git for application state".',
    it: 'Motore di time-travel debugging e state history management ad alte prestazioni per JavaScript e TypeScript. Un\'architettura a Grafo Aciclico Diretto (DAG) concepita come "Git for application state".'
  },
  'overview.tldr_title': {
    en: 'Direct Answer / TL;DR',
    it: 'Risposta Diretta / TL;DR'
  },
  'overview.tldr_text': {
    en: 'HomuraJS is a zero-dependency TypeScript library that records application state evolution as an immutable tree graph. It enables rewinding, fast-forwarding, creating parallel branch forks without destroying historical past/future timelines, deep semantic diffing, and inspecting states via native embedded DevTools.',
    it: 'HomuraJS e una libreria TypeScript zero-dependency che registra l\'evoluzione dello stato come grafo ad albero immutabile. Consente di retrocedere nel tempo (rewind), avanzare (fast-forward), creare rami paralleli (branching) senza mai distruggere la cronologia passata/futura, confrontare due stati con diff semantico profondo e ispezionarli con DevTools integrati.'
  },
  'feature.dag.title': {
    en: 'Non-Destructive DAG Graph',
    it: 'Grafo DAG Non Distruttivo'
  },
  'feature.dag.desc': {
    en: 'Every state mutation diverges into a timeline branch without ever truncating previous historical branches.',
    it: 'Ogni mutazione diverge in un ramo senza mai cancellare le linee temporali storiche precedenti.'
  },
  'feature.proxy.title': {
    en: 'Immutable Draft Proxy',
    it: 'Proxy Draft Immutabile'
  },
  'feature.proxy.desc': {
    en: 'Direct mutation syntax powered by zero-dependency Copy-On-Write proxies with structural sharing.',
    it: 'Modifica diretta tramite sintassi ergonomica con Copy-On-Write puro a zero dipendenze.'
  },
  'feature.diff.title': {
    en: 'Deep Structural Diffing',
    it: 'Diffing Strutturale Profondo'
  },
  'feature.diff.desc': {
    en: 'Recursive diffing algorithm with precise dot-path tracking of added, removed, and modified properties.',
    it: 'Algoritmo di confronto ricorsivo con tracciamento esatto dei percorsi semantici dot-path.'
  },
  'feature.devtools.title': {
    en: 'Full Diagnostic DevTools',
    it: 'DevTools Completi'
  },
  'feature.devtools.desc': {
    en: 'Visual graph timeline, collapsible JSON tree inspector, side-by-side diff viewer, and time scrubber.',
    it: 'Visualizzatore di timeline, ispettore dello stato ad albero, comparatore diff e scrubber temporale.'
  },

  // Why Homura
  'why.title': {
    en: 'Why HomuraJS?',
    it: 'Perche HomuraJS?'
  },
  'why.p1': {
    en: 'In conventional state managers, history is maintained as a flat linear stack. When you travel back in time and perform a new update, all future states are irreversibly destroyed.',
    it: 'Nei gestori di stato tradizionali, la cronologia e gestita come uno stack lineare piatto. Quando si retrocede indietro nel tempo ed avviene una nuova modifica, tutti gli stati futuri vengono distrutti in modo irreversibile.'
  },
  'why.p2': {
    en: 'HomuraJS removes this limitation by modeling every state transition as a node in a Directed Acyclic Graph (DAG). Rewinding and applying a new change creates an alternative branch, preserving both past and future history forever.',
    it: 'HomuraJS elimina questa limitazione memorizzando ogni transizione come nodo di un grafo ad albero (DAG). Quando si retrocede e si applica una modifica, il motore genera automaticamente un nuovo ramo parallelo, mantenendo intatta la storia passata e futura.'
  },

  // Installation
  'install.title': {
    en: 'Installation',
    it: 'Installazione'
  },
  'install.lead': {
    en: 'Select your preferred package manager:',
    it: 'Seleziona il tuo gestore di pacchetti preferito:'
  },
  'install.framework_title': {
    en: 'Installation for Specific Frameworks',
    it: 'Installazione per Framework Specifici'
  },
  'install.framework_lead': {
    en: 'Integrate HomuraJS into your favorite UI framework:',
    it: 'Per integrare HomuraJS nel tuo framework UI preferito:'
  },

  // Quickstart
  'quickstart.title': {
    en: 'Quickstart',
    it: 'Guida Rapida'
  },
  'quickstart.lead': {
    en: 'Initialize a store and execute controlled time-travel mutations in seconds:',
    it: 'Inizializza un\'istanza ed esegui mutazioni controllate nel tempo in poche righe:'
  },

  // State Engine
  'state_engine.title': {
    en: 'State Management & Immutability',
    it: 'Gestione dello Stato & Immutabilita'
  },
  'state_engine.p1': {
    en: 'HomuraJS guarantees immutability via Copy-On-Write Proxy Drafts. Inside update(draft => ...), you write direct mutations: the engine applies changes only to modified paths while structurally sharing untouched state.',
    it: 'HomuraJS garantisce l\'immutabilita tramite Proxy Drafts basati su Copy-On-Write. All\'interno della funzione update(draft => ...) puoi modificare le proprieta direttamente: il motore applichera le modifiche solo ai percorsi toccati, condividendo la struttura immutata con lo stato precedente.'
  },

  // DAG & Branching
  'dag.title': {
    en: 'DAG Graph & Branching ("Git for State")',
    it: 'Grafo DAG & Branching ("Git for State")'
  },
  'dag.p1': {
    en: 'Every state transition produces an immutable HistoryEntry indexed in the DAG graph:',
    it: 'Ogni operazione produce un oggetto HistoryEntry indicizzato nel grafo:'
  },
  'dag.p2': {
    en: 'If you travel back in history and dispatch a new update, HomuraJS automatically forks an alternative timeline branch without discarding prior history:',
    it: 'Se retrocedi nella cronologia ed esegui un nuovo update, HomuraJS crea in automatico un nuovo ramo senza cancellare la storia precedente:'
  },

  // Time Travel
  'time_travel.title': {
    en: 'Time Travel Navigation',
    it: 'Navigazione Temporale'
  },
  'time_travel.lead': {
    en: 'Deterministic commands for traversing your application history:',
    it: 'Comandi deterministici per viaggiare lungo la cronologia:'
  },
  'time_travel.th_method': {
    en: 'Method',
    it: 'Metodo'
  },
  'time_travel.th_desc': {
    en: 'Description',
    it: 'Descrizione'
  },
  'time_travel.undo_desc': {
    en: 'Rewinds to the parent node in the timeline graph.',
    it: 'Retrocede al nodo genitore precedente.'
  },
  'time_travel.redo_desc': {
    en: 'Advances to the next child node in the active branch.',
    it: 'Avanza al nodo figlio successivo nel ramo attivo.'
  },
  'time_travel.rewind_desc': {
    en: 'Fast-rewinds backwards by N history steps.',
    it: 'Retrocede velocemente di N passi nella cronologia.'
  },
  'time_travel.ff_desc': {
    en: 'Fast-forwards forward by N history steps.',
    it: 'Avanza velocemente di N passi nella cronologia.'
  },
  'time_travel.jump_desc': {
    en: 'Jumps directly to any node ID in the DAG graph.',
    it: 'Salta direttamente a qualsiasi nodo del grafo DAG.'
  },

  // Snapshots
  'snapshots.title': {
    en: 'Snapshots & Milestones',
    it: 'Snapshot & Milestone'
  },
  'snapshots.p1': {
    en: 'Create named immutable checkpoints of your application state and restore them instantly:',
    it: 'Crea segnalibri persistenti per salvare pietre miliari dell\'applicazione e ripristinarle istantaneamente:'
  },

  // Diff Engine
  'diff.title': {
    en: 'Structural Diff Engine',
    it: 'Motore di Diff Strutturale'
  },
  'diff.p1': {
    en: 'The pure-function diffing engine computes exact semantic delta changes between any two states:',
    it: 'Il motore pure-function identifica le differenze semantiche esatte tra due stati:'
  },

  // Transaction
  'nav.transaction': {
    en: 'Transactions & Batching',
    it: 'Transazioni & Batching'
  },
  'transaction.title': {
    en: 'Atomic Transactions & Batching',
    it: 'Transazioni Atomiche & Batching'
  },
  'transaction.p1': {
    en: 'Combine multiple state updates into a single atomic history commit instead of cluttering your timeline with intermediate states:',
    it: 'Raggruppa piu modifiche dello stato in un unico commit di cronologia atomico anziche intasare la timeline con stati intermedi:'
  },

  // Replay Engine
  'nav.replay': {
    en: 'Replay Engine & Bug Reports',
    it: 'Replay Engine & Bug Report'
  },
  'replay.title': {
    en: 'Timeline Replay Engine & Bug Reports',
    it: 'Timeline Replay Engine & Bug Report'
  },
  'replay.p1': {
    en: 'Step-by-step automated time-travel replay engine for live debugging, QA testing, and exporting reproducible session bug reports:',
    it: 'Motore di riproduzione automatica passo-passo per live debugging, QA testing ed esportazione di bug report di sessione riproducibili:'
  },

  // Branch Management (Merge & Compare)
  'nav.branch_mgmt': {
    en: 'Branch Merge & Compare',
    it: 'Branch Merge & Compare'
  },
  'branch_mgmt.title': {
    en: 'Branch Merging & Comparison ("Git for State")',
    it: 'Merge e Confronto tra Rami ("Git for State")'
  },
  'branch_mgmt.p1': {
    en: 'Compare parallel branches to discover divergence points (Lowest Common Ancestor), diffs, and merge alternative feature timelines:',
    it: 'Confronta rami paralleli per scoprire punti di divergenza (LCA), differenze strutturali e unisci linee temporali alternative:'
  },

  // Compaction & IndexedDB
  'nav.compaction': {
    en: 'Compaction & IndexedDB',
    it: 'Compattazione & IndexedDB'
  },
  'compaction.title': {
    en: 'History Compaction & Enterprise Storage',
    it: 'Compattazione Cronologia & Storage Enterprise'
  },
  'compaction.p1': {
    en: 'Keep your memory footprint optimal with intelligent graph compaction and high-capacity storage backends like IndexedDB:',
    it: 'Mantieni l\'impronta di memoria ottimale grazie alla compattazione intelligente del grafo e agli storage backend ad alta capacita come IndexedDB:'
  },

  // Persistence
  'persistence.title': {
    en: 'Data Persistence & Storage',
    it: 'Persistenza dei Dati'
  },
  'persistence.p1': {
    en: 'Out-of-the-box storage adapters to save the entire DAG history to LocalStorage or Memory with automated debouncing:',
    it: 'Adattatori pronti all\'uso per salvare l\'intero grafo in LocalStorage o in memoria con debouncing:'
  },

  // React
  'react.title': {
    en: 'React 18+ Integration',
    it: 'Integrazione React 18+'
  },
  'react.p1': {
    en: 'The useHomura hook leverages native useSyncExternalStore APIs, ensuring zero tearing and fine-grained selector re-render optimizations:',
    it: 'L\'hook useHomura sfrutta le API native useSyncExternalStore garantendo assenza di tearing e rendering ottimale tramite selettori:'
  },

  // Vue
  'vue.title': {
    en: 'Vue 3 Integration',
    it: 'Integrazione Vue 3'
  },

  // DevTools
  'devtools.title': {
    en: 'Embedded Diagnostic DevTools',
    it: 'DevTools Diagnostici Integrati'
  },
  'devtools.p1': {
    en: 'The @homura-js/devtools package provides a high-performance visual GUI with zero external runtime dependencies:',
    it: 'Il pacchetto @homura-js/devtools offre un pannello grafico moderno a zero dipendenze esterne:'
  },

  // Sandbox Live
  'sandbox.title': {
    en: 'Live Interactive Sandbox',
    it: 'Sandbox Interattivo Live'
  },
  'sandbox.p1': {
    en: 'Test and interact with a live HomuraJS engine running directly inside this documentation page:',
    it: 'Interagisci direttamente con un\'istanza reale di HomuraJS integrata in questa pagina:'
  },
  'sandbox.btn_inc': {
    en: '+10 Counter',
    it: '+10 Contatore'
  },
  'sandbox.btn_user': {
    en: 'Change User',
    it: 'Cambia Utente'
  },
  'sandbox.btn_undo': {
    en: 'Undo',
    it: 'Undo'
  },
  'sandbox.btn_redo': {
    en: 'Redo',
    it: 'Redo'
  },
  'sandbox.btn_fork': {
    en: 'Fork Branch',
    it: 'Fork Ramo'
  },
  'sandbox.btn_snap': {
    en: 'Snapshot',
    it: 'Segnalibro'
  },
  'sandbox.btn_transaction': {
    en: 'Transaction Batch',
    it: 'Transazione Batch'
  },
  'sandbox.btn_replay': {
    en: '▶ Replay (2x)',
    it: '▶ Replay (2x)'
  },
  'sandbox.state_label': {
    en: 'Live State Output:',
    it: 'Stato Attuale in Tempo Reale:'
  },

  // FAQ
  'faq.title': {
    en: 'Frequently Asked Questions (FAQ)',
    it: 'Domande Frequenti (FAQ)'
  },
  'faq.q1': {
    en: 'What is HomuraJS?',
    it: 'Che cos\'e HomuraJS?'
  },
  'faq.a1': {
    en: 'HomuraJS is a JavaScript/TypeScript state management and time-travel debugging engine modeled as a Directed Acyclic Graph (DAG), conceived as "Git for application state".',
    it: 'HomuraJS e una libreria JavaScript/TypeScript per il time-travel debugging e la gestione della cronologia dello stato basata su Grafi Aciclici Diretti (DAG), concepita come "Git per lo stato dell\'applicazione".'
  },
  'faq.q2': {
    en: 'How is HomuraJS different from standard Undo/Redo systems?',
    it: 'In cosa differisce HomuraJS da un normale sistema Undo/Redo?'
  },
  'faq.a2': {
    en: 'Standard Undo/Redo systems use a flat linear array stack that irrevocably destroys future states whenever a new mutation occurs in the past. HomuraJS forks non-destructive timeline branches, preserving all past and future states forever.',
    it: 'I sistemi standard di Undo/Redo usano uno stack lineare che distrugge permanentemente gli stati futuri quando si torna indietro e si applica una nuova modifica. HomuraJS crea rami paralleli (Branching) senza mai eliminare la cronologia passata o futura.'
  },
  'faq.q3': {
    en: 'Which UI frameworks are supported?',
    it: 'Quali framework UI supporta HomuraJS?'
  },
  'faq.a3': {
    en: 'HomuraJS core is framework-agnostic (@homura-js/core) and provides official packages for React 18+ (@homura-js/react), Vue 3 (@homura-js/vue), and Vanilla JavaScript (@homura-js/vanilla).',
    it: 'HomuraJS e framework-agnostic nel core (@homura-js/core) e include pacchetti dedicati con integrazioni native per React 18+ (@homura-js/react), Vue 3 (@homura-js/vue) e Vanilla JavaScript (@homura-js/vanilla).'
  },
  'faq.q4': {
    en: 'How to install HomuraJS?',
    it: 'Come si installa HomuraJS?'
  },
  'faq.a4': {
    en: 'Install the core package via `npm install @homura-js/core` or use the unified meta-package `npm install @biagioscaglia/homurajs`.',
    it: 'E possibile installare il core tramite `npm install @homura-js/core` oppure installare il meta-package unificato `npm install @biagioscaglia/homurajs`.'
  },

  // API Reference
  'api.title': {
    en: 'Complete API Reference',
    it: 'Riferimento Completo delle API'
  },
  'api.th_method': {
    en: 'Method',
    it: 'Metodo'
  },
  'api.th_params': {
    en: 'Parameters',
    it: 'Parametri'
  },
  'api.th_return': {
    en: 'Return',
    it: 'Ritorno'
  },
  'api.th_desc': {
    en: 'Description',
    it: 'Descrizione'
  },
  'api.get_state_desc': {
    en: 'Returns the current immutable state tree.',
    it: 'Restituisce l\'albero di stato immutabile corrente.'
  },
  'api.update_desc': {
    en: 'Executes a Copy-On-Write draft mutation.',
    it: 'Esegue una modifica bozza Copy-On-Write.'
  },
  'api.undo_desc': {
    en: 'Rewinds to the parent node in the timeline graph.',
    it: 'Retrocede al nodo genitore nella timeline.'
  },
  'api.redo_desc': {
    en: 'Advances to the next child node in the active branch.',
    it: 'Avanza al nodo figlio nel ramo attivo.'
  },
  'api.rewind_desc': {
    en: 'Fast-rewinds backwards by N history steps.',
    it: 'Retrocede velocemente di N passi.'
  },
  'api.ff_desc': {
    en: 'Fast-forwards forward by N history steps.',
    it: 'Avanza velocemente di N passi.'
  },
  'api.jump_desc': {
    en: 'Jumps directly to any node ID in the DAG graph.',
    it: 'Salta a qualsiasi nodo del grafo DAG.'
  },
  'api.snap_desc': {
    en: 'Creates a named immutable checkpoint of the state.',
    it: 'Crea un segnalibro immutabile dello stato.'
  },
  'api.restore_desc': {
    en: 'Restores the state stored in the snapshot checkpoint.',
    it: 'Ripristina lo stato memorizzato nello snapshot.'
  },
  'api.transaction_desc': {
    en: 'Batches multiple mutations into a single atomic history commit.',
    it: 'Raggruppa piu modifiche in un unico commit atomico di cronologia.'
  },
  'api.replay_desc': {
    en: 'Replays timeline history step-by-step with configurable speed and hooks.',
    it: 'Riproduce la cronologia passo-passo con velocita e hook configurabili.'
  },
  'api.merge_desc': {
    en: 'Merges another branch timeline into the current active branch.',
    it: 'Fonde la cronologia di un altro ramo nel ramo attivo corrente.'
  },
  'api.compare_desc': {
    en: 'Compares two branches calculating common ancestor and structural diff.',
    it: 'Confronta due rami calcolando antenato comune e diff strutturale.'
  },
  'api.compact_desc': {
    en: 'Compacts history by pruning non-essential nodes to save RAM/disk.',
    it: 'Compatta la cronologia eliminando i nodi intermedi non essenziali per risparmiare memoria.'
  },
  'api.diff_desc': {
    en: 'Calculates the deep recursive structural delta diff.',
    it: 'Calcola il diff ricorsivo strutturale profondo.'
  },

  // Benchmarks Section
  'nav.benchmarks': {
    en: 'Benchmarks & Performance',
    it: 'Benchmark & Prestazioni'
  },
  'benchmarks.title': {
    en: 'Performance Benchmarks',
    it: 'Benchmark & Metriche di Efficienza'
  },
  'benchmarks.lead': {
    en: 'Engineered for sub-millisecond execution times and zero-copy memory efficiency using structural sharing:',
    it: 'Progettato per tempi di esecuzione sub-millisecondo ed efficienza di memoria zero-copy grazie allo structural sharing:'
  },
  'benchmarks.th_operation': {
    en: 'Operation (10,000 Nodes)',
    it: 'Operazione (10.000 Nodi)'
  },
  'benchmarks.th_homura': {
    en: 'HomuraJS (DAG Engine)',
    it: 'HomuraJS (Motore DAG)'
  },
  'benchmarks.th_naive': {
    en: 'Naive Deep Clone / Stack',
    it: 'Deep Clone Tradizionale'
  },
  'benchmarks.th_diff': {
    en: 'Improvement',
    it: 'Miglioramento'
  },
  'benchmarks.op_draft': {
    en: 'Draft Mutation (Copy-on-Write)',
    it: 'Mutazione Draft (Copy-on-Write)'
  },
  'benchmarks.op_branch': {
    en: 'Branch Creation & Divergence',
    it: 'Creazione Branch & Bivio'
  },
  'benchmarks.op_diff': {
    en: 'Deep Structural Diffing',
    it: 'Diffing Strutturale Profondo'
  },
  'benchmarks.op_timetravel': {
    en: 'Time Travel Jump (Any State)',
    it: 'Salto Temporale (JumpTo)'
  },

  // Real-World Use Cases
  'nav.usecases': {
    en: 'Real-World Use Cases',
    it: 'Casi d\'Uso Reali'
  },
  'usecases.title': {
    en: 'Real-World Architecture Patterns',
    it: 'Pattern Architetturali & Casi d\'Uso'
  },
  'usecases.lead': {
    en: 'Explore practical application blueprints leveraging DAG state history:',
    it: 'Esempi e blueprint pratici basati sulla gestione dello stato a grafo DAG:'
  },
  'usecases.case1_title': {
    en: '1. Multi-Step Form with Alternative Decision Paths',
    it: '1. Form Multi-Step con Percorsi Decisionali Alternativi'
  },
  'usecases.case1_desc': {
    en: 'Allow users to backtrack to step 2, modify preferences to explore alternative quote estimates, without discarding previously calculated checkout paths.',
    it: 'Permette all\'utente di tornare al passo 2 per esplorare preventivi alternativi senza distruggere i dati inseriti nei passaggi successivi.'
  },
  'usecases.case2_title': {
    en: '2. Canvas & Graphic Editor Non-Destructive History',
    it: '2. Editor Grafico con Cronologia Non Distruttiva'
  },
  'usecases.case2_desc': {
    en: 'Enable digital designers to branch different color schemes or layout variations from any historical layer checkpoint.',
    it: 'Consente a designer e creativi di creare varianti di layout o palette colore ramificate da qualsiasi livello storico.'
  },

  // Author Section
  'author.title': {
    en: 'Author & Project Philosophy',
    it: 'Autore & Filosofia del Progetto'
  },
  'author.role': {
    en: 'Creator & Lead Architect of HomuraJS',
    it: 'Creatore & Lead Architect di HomuraJS'
  },
  'author.p1': {
    en: 'HomuraJS was created and engineered by Biagio Scaglia to overcome the historical limitations of linear state management in modern web architecture.',
    it: 'HomuraJS e stato ideato e sviluppato da Biagio Scaglia per superare i limiti storici della gestione dello stato lineare nel web moderno.'
  },
  'author.p2': {
    en: 'Unlike conventional Undo/Redo patterns that discard history whenever a past state is branched, HomuraJS introduces "Git for application state" powered by a pure Directed Acyclic Graph (DAG) state machine, Copy-On-Write semantic diffing, and zero-dependency diagnostic tools.',
    it: 'A differenza dei convenzionali pattern Undo/Redo che distruggono la cronologia non appena viene generata una deviazione nel passato, HomuraJS introduce il concetto di "Git for application state" grazie a una struttura a Grafo Aciclico Diretto (DAG), diffing semantico Copy-On-Write e suite diagnostica nativa a zero dipendenze esterne.'
  },

  // Footer
  'footer.copy': {
    en: 'HomuraJS (c) 2026 Biagio Scaglia & HomuraJS Team. Released under the MIT License.',
    it: 'HomuraJS (c) 2026 Biagio Scaglia & HomuraJS Team. Distribuito sotto licenza MIT.'
  },
  'footer.desc': {
    en: 'Directed Acyclic Graph (DAG) Time Travel State Architecture for JavaScript & TypeScript.',
    it: 'Architettura Time Travel State basata su Grafi Aciclici Diretti (DAG) per JavaScript e TypeScript.'
  }
};
