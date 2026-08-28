<div align="center">

# HOMURAJS
### Time Travel State and History Engine for JavaScript

**"Git for application state"**

[![CI Tests](https://img.shields.io/badge/tests-49%2F49%20passed-7c3aed)](https://github.com/biagio-scaglia/homura-js)
[![Version](https://img.shields.io/badge/version-v1.2.1-9333ea)](https://www.npmjs.com/package/@biagioscaglia/homurajs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-581c87)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-3b0764)](LICENSE)
[![NPM](https://img.shields.io/badge/npm-%40biagioscaglia%2Fhomurajs-a855f7)](https://www.npmjs.com/package/@biagioscaglia/homurajs)

</div>

---

## 1. Cos'e HomuraJS e cosa fa esattamente

HomuraJS e un motore di gestione dello stato e della cronologia temporale per applicazioni JavaScript e TypeScript.

A differenza dei tradizionali gestori di stato o dei semplici sistemi Undo/Redo basati su uno stack lineare, HomuraJS modella ogni mutazione dell'applicazione come un **Grafo Aciclico Diretto (DAG - Directed Acyclic Graph)** di stati immutabili.

### Il Problema dei Sistemi Tradizionali
Nei sistemi Undo/Redo convenzionali:
1. L'utente esegue: Azione A -> Azione B -> Azione C.
2. L'utente torna indietro di 2 passi fino ad Azione A.
3. Se l'utente esegue una nuova operazione (Azione D), l'intera cronologia futura (Azione B e Azione C) viene **distrutta permanentemente**.

### La Soluzione di HomuraJS ("Git for State")
HomuraJS impedisce qualsiasi perdita di dati attraverso la divergenza non distruttiva dei rami (Branching):
1. Quando ci si sposta indietro nel tempo e si applica una modifica, HomuraJS crea automaticamente un nuovo ramo parallelo.
2. La cronologia originale rimane intatta, navigabile e ispezionabile in qualsiasi momento.
3. Il motore consente di confrontare due stati qualsiasi tramite un algoritmo di Diff strutturale profondo, di creare punti di ripristino istantanei (Snapshot) e di persistere i dati in memoria o nel LocalStorage.

---

## 2. Architettura dei Pacchetti

Il progetto e strutturato come un monorepo TypeScript suddiviso in pacchetti modulari:

| Pacchetto | Descrizione |
| :--- | :--- |
| **`@homura-js/core`** | Motore centrale: Grafo DAG, Immutabilita tramite Proxy Draft, Diff strutturale, Snapshot, Persistenza e Middleware. |
| **`@homura-js/devtools`** | Interfaccia grafica diagnostica: Visualizzatore temporale ad albero, Ispettore JSON dello stato, Confrontatore Diff e Scrubber di riproduzione temporale. |
| **`@homura-js/react`** | Integrazione per React 18+ basata su `useSyncExternalStore` con selettori ottimizzati per evitare re-render non necessari. |
| **`@homura-js/vue`** | Integrazione per Vue 3 tramite Composition API e plugin dedicato. |
| **`@homura-js/vanilla`** | Binding bidirezionale reattivo per elementi DOM senza framework. |
| **`@biagioscaglia/homurajs`** | Bundle unificato per installazione diretta. |

---

## 3. Installazione

### Motore Core
```bash
npm install @homura-js/core
```

### Con React
```bash
npm install @homura-js/core @homura-js/react @homura-js/devtools
```

### Con Vue 3
```bash
npm install @homura-js/core @homura-js/vue @homura-js/devtools
```

### Con Vanilla JS
```bash
npm install @homura-js/vanilla
```

---

## 4. Guida Rapida

Inizializzazione e manipolazione dello stato in meno di dieci righe di codice:

```ts
import { createHomura } from '@homura-js/core';

const homura = createHomura({
  initialState: { counter: 0, user: 'Homura' }
});

// Mutazione tramite Proxy Draft
homura.update(draft => {
  draft.counter += 10;
}, { label: 'Incremento di 10' });

// Viaggio nel tempo
homura.undo(); // Il contatore torna a 0
homura.redo(); // Il contatore torna a 10

console.log(homura.getState()); // { counter: 10, user: 'Homura' }
```

---

## 5. Come Funziona la Gestione dello Stato

### Immutabilita e Aggiornamento a Bozza (Draft Proxy)
HomuraJS include un meccanismo di Copy-On-Write basato su Proxy senza dipendenze esterne. Le modifiche vengono registrate su una bozza virtuale e finalizzate in un nuovo albero di stato immutabile che condivide la struttura non modificata con gli stati precedenti.

```ts
// 1. Modifica diretta della bozza
homura.update(draft => {
  draft.user = 'Akemi';
  draft.counter += 5;
}, { label: 'Aggiornamento Utente' });

// 2. Modifica funzionale pura (ritorno del nuovo stato)
homura.update(state => ({
  ...state,
  counter: state.counter + 1
}), { label: 'Incremento Puro' });

// 3. Assegnazione diretta
homura.setState({ counter: 100, user: 'Homura' }, { label: 'Reset Globale' });
```

---

## 6. Il Grafo Cronologico DAG e il Branching

Ogni modifica genera un nodo di cronologia immutabile:

```ts
interface HistoryEntry<T> {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  branchId: string;
  timestamp: number;
  label: string;
  state: T;
  metadata?: Record<string, unknown>;
}
```

### Divergenza Automatica dei Rami

Se l'applicazione si trova su un nodo passato e viene eseguito un nuovo aggiornamento, HomuraJS crea un nuovo ramo logico senza sovrascrivere o cancellare i nodi figli preesistenti:

```text
Nodo Iniziale (v1)
       │
       ├─── Azione 1 (Ramo Principale) ─── Azione 2 (v2)
       │
       └─── Azione Alternativa (Nuovo Ramo) ─── Azione 3 (v3)
```

```ts
// Ritorno al passato
homura.jumpTo("entry-id-passato");

// Questa operazione non distrugge il futuro: crea un nuovo ramo
homura.update(draft => {
  draft.counter = 999;
}, { label: 'Linea Temporale Alternativa' });

// Elenco di tutti i rami
const branches = homura.getBranches();

// Cambio esplicito di ramo
homura.switchBranch(branches[0].id);
```

---

## 7. Navigazione Temporale: Rewind, Fast-Forward e Jump

HomuraJS permette di spostarsi in modo deterministico lungo la linea temporale:

```ts
// Singolo passo indietro o avanti
homura.undo();
homura.redo();

// Spostamento di N passi
homura.rewind(5);       // Indietro di 5 nodi
homura.fastForward(3);  // Avanti di 3 nodi

// Salto diretto a qualsiasi nodo del grafo
homura.jumpTo("id-nodo-specifico");
```

---

## 8. Snapshot e Punti di Ripristino

Gli Snapshot sono segnalibri immutabili associati a un nodo temporale specifico, utili per salvare pietre miliari dell'applicazione:

```ts
// Creazione di uno snapshot
const checkpoint = homura.snapshot('Stato Pre-Battaglia', { livello: 5 });

// Elenco degli snapshot esistenti
const snapshots = homura.getSnapshots();

// Ripristino istantaneo dello stato al momento dello snapshot
homura.restore(checkpoint.id);

// Eliminazione di uno snapshot
homura.deleteSnapshot(checkpoint.id);
```

---

## 9. Transazioni Atomiche e Batching (`transaction`)

Nei form complessi o negli editor grafici, l'applicazione di mutazioni multiple su più proprietà rischia di generare passaggi intermedi inutili nella cronologia. HomuraJS fornisce `transaction()` per consolidare tutte le modifiche in un **singolo commit atomico**:

```ts
// Raggruppa 3 modifiche in 1 singolo nodo di cronologia
homura.transaction(draft => {
  draft.user.name = "Biagio";
  draft.user.age = 21;
  draft.user.role = "developer";
}, { label: "Aggiornamento Profilo Completo" });

// Risultato nella cronologia:
// Initial -> Aggiornamento Profilo Completo (anziché 3 nodi separati)
// Con un singolo homura.undo() si torna all'istante iniziale.
```

---

## 10. Replay Engine Temporale e Bug Report

HomuraJS include un motore di riproduzione automatizzata sequenziale della cronologia passo-passo, ideale per live debugging, test QA ed esportazione di sessioni:

```ts
// Riproduzione controllata della timeline a velocita 2x
await homura.replay({
  from: "login-node",
  to: "checkout-node",
  speed: 2,
  stepDelayMs: 300,
  onStep: (entry, step, total) => {
    console.log(`[Replay] Avanzamento ${step}/${total}: "${entry.label}"`);
  }
});

// Esportazione bug report per riproduzione istantanea su un'altra macchina
const bugReport = homura.export();
// Salva in un file "bug-report.homura" per il team di sviluppo
```

---

## 11. Fusione e Confronto tra Rami (`merge` & `compare`)

Come in Git, HomuraJS permette di confrontare due rami paralleli, identificare il loro antenato comune (*Lowest Common Ancestor - LCA*) e fonderli:

```ts
// Confronta il ramo principale con un ramo sperimentale
const comparison = homura.compare('main', 'experimental-feature');
console.log(comparison.commonAncestorId); // ID del nodo di bivio
console.log(comparison.aheadCount);       // Commit in anticipo
console.log(comparison.diff);             // Differenze strutturali

// Fonde il ramo sperimentale nel ramo attivo
homura.merge('experimental-feature', {
  label: "Merge experimental-feature into main"
});
```

---

## 12. Compattazione del Grafo (`compact`) e Storage Enterprise (IndexedDB)

Per prevenire l'eccessivo consumo di RAM o spazio su disco in sessioni prolungate, `compact()` rimuove i nodi intermedi ridondanti preservando sempre snapshot e capi dei rami:

```ts
import { createHomura, createIndexedDBAdapter } from '@biagioscaglia/homurajs';

// Persistenza ad alte prestazioni su browser tramite IndexedDB
const homura = createHomura({
  initialState: { canvas: [] },
  persistence: {
    adapter: createIndexedDBAdapter({ dbName: 'homura_app', storeName: 'state_history' }),
    autoSave: true,
    debounceMs: 200
  }
});

// Compatta la cronologia a 100 nodi massimi, preservando tutti gli snapshot
const nodiEliminati = homura.compact({ maxEntries: 100, preserveSnapshots: true });
console.log(`Eliminati ${nodiEliminati} nodi intermedi non essenziali.`);
```

---

## 13. Motore di Diff Strutturale

HomuraJS include un motore di calcolo delle differenze ricorsivo e puro. Il motore confronta oggetti, array e valori primitivi, identificando le modifiche esatte con il percorso semantico:

```ts
import { diffStates } from '@homura-js/core';

const statoA = { profilo: { nome: 'Homura', livello: 1 }, oggetti: ['Scudo'] };
const statoB = { profilo: { nome: 'Homura', livello: 2 }, oggetti: ['Scudo', 'Arco'] };

const differenze = diffStates(statoA, statoB);
```

Risultato prodotto:
```json
[
  {
    "path": ["profilo", "livello"],
    "type": "changed",
    "oldValue": 1,
    "newValue": 2
  },
  {
    "path": ["oggetti", 1],
    "type": "added",
    "value": "Arco"
  }
]
```

E possibile calcolare il diff anche direttamente tra due nodi di cronologia:
```ts
const diff = homura.diff(nodoA, nodoB);
```

---

## 10. Persistenza dei Dati

Il motore supporta adattatori di persistenza sincroni e asincroni con debouncing automatico:

```ts
import { createHomura, LocalStorageAdapter } from '@homura-js/core';

const homura = createHomura({
  initialState: { configurazione: 'attiva' },
  persistence: {
    adapter: new LocalStorageAdapter('homura_storage_key'),
    autoSave: true,
    debounceMs: 200
  }
});

// Salvataggio esplicito
await homura.save();

// Caricamento manuale
await homura.load();
```

---

## 11. Pipeline di Middleware ed Eventi

### Middleware (Stile Onion)
I middleware permettono di intercettare, arricchire o bloccare qualsiasi transizione di stato prima che venga applicata:

```ts
homura.use((context, next) => {
  console.log(`Azione: ${context.action}, Etichetta: ${context.label}`);

  // Esempio: blocco delle transizioni non valide
  if (context.action === 'setState' && (context.nextState as any).counter < 0) {
    console.warn('Operazione annullata: il contatore non puo essere negativo.');
    context.cancel();
    return;
  }

  next();
});
```

### Eventi Tipizzati
```ts
const unsubscribe = homura.on('state:change', ({ state, prevState, entry, action }) => {
  console.log(`Transizione [${action}]:`, state);
});

// Disiscrizione
unsubscribe();
```

---

## 12. DevTools UI

I DevTools offrono una suite visiva integrata per monitorare l'evoluzione dello stato:
- **Timeline DAG**: Ispezione visiva di tutti i nodi e rami della cronologia.
- **Ispettore JSON**: Vista ad albero con ricerca testuale, evidenziazione tipi e copia rapida.
- **Diff Viewer**: Confronto affiancato e unificato tra versioni storiche.
- **Playback HUD**: Controllo di riproduzione automatica e scrubbing manuale.
- **Floating Overlay**: Pulsante fluttuante con scorciatoia `Alt + H`.

```ts
import { mountDevTools } from '@homura-js/devtools';

// Montaggio come overlay fluttuante
mountDevTools(homura, {
  position: 'floating',
  theme: 'dark',
  defaultOpen: true
});

// Montaggio all'interno di un contenitore specifico
mountDevTools(homura, {
  container: '#devtools-container',
  position: 'embedded'
});
```

---

## 13. Integrazione con React 18+

L'integrazione per React utilizza `useSyncExternalStore` per garantire la sincronizzazione esente da tearing e supporta i selettori per ottimizzare le prestazioni:

```tsx
import { createHomura } from '@homura-js/core';
import { useHomura, HomuraDevTools } from '@homura-js/react';

const homura = createHomura({
  initialState: { contatore: 0, utente: 'Homura' }
});

export function ComponenteContatore() {
  // Sottoscrizione mirata alla sola proprieta 'contatore'
  const { state: contatore, update, undo, redo, canUndo, canRedo } = useHomura(
    homura,
    s => s.contatore
  );

  return (
    <div style={{ background: '#0a0710', color: '#e9d5ff', padding: 24, borderRadius: 8 }}>
      <h2>Valore: {contatore}</h2>
      <button onClick={() => update(d => { d.contatore++; }, { label: 'Incremento' })}>+1</button>
      <button disabled={!canUndo} onClick={() => undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => redo()}>Redo</button>

      <HomuraDevTools homura={homura} position="floating" />
    </div>
  );
}
```

---

## 14. Integrazione con Vue 3

```vue
<template>
  <div style="background: #0a0710; color: #e9d5ff; padding: 24px; border-radius: 8px;">
    <h2>Contatore: {{ state.contatore }}</h2>
    <button @click="incrementa">+1</button>
    <button :disabled="!canUndo" @click="undo">Undo</button>
    <button :disabled="!canRedo" @click="redo">Redo</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { createHomura } from '@homura-js/core';
import { useHomura } from '@homura-js/vue';
import { mountDevTools } from '@homura-js/devtools';

const homura = createHomura({
  initialState: { contatore: 0 }
});

const { state, update, undo, redo, canUndo, canRedo } = useHomura(homura);

function incrementa() {
  update(d => { d.contatore += 1; }, { label: 'Incremento' });
}

onMounted(() => {
  mountDevTools(homura, { position: 'floating' });
});
</script>
```

---

## 15. Integrazione Vanilla JS

```ts
import { createHomura, bindState, mountDevTools } from '@homura-js/vanilla';

const homura = createHomura({
  initialState: { punteggio: 100 }
});

// Sincronizzazione automatica con elementi DOM
bindState(homura, [
  { selector: s => s.punteggio, target: '#punteggio-display', format: v => `Punteggio: ${v}` }
]);

mountDevTools(homura, { position: 'floating' });
```

---

## 16. Riferimento Completo delle API

### Metodi di Istanza `Homura<T>`

* `getState(): T` — Restituisce lo stato immutabile corrente.
* `setState(nextState: T, options?: StateUpdateOptions): HistoryEntry<T>` — Imposta direttamente il nuovo stato.
* `update(updater: StateUpdater<T>, options?: StateUpdateOptions): HistoryEntry<T>` — Esegue una mutazione tramite bozza Copy-On-Write.
* `transaction(fn: (draft: T) => void, options?: StateUpdateOptions): HistoryEntry<T>` — Raggruppa mutazioni multiple in un unico commit di cronologia atomico.
* `replay(options?: ReplayOptions<T>): Promise<void>` — Riproduce la cronologia passo-passo con velocita e hook configurabili.
* `undo(): HistoryEntry<T> | null` — Torna al nodo genitore nella cronologia.
* `redo(): HistoryEntry<T> | null` — Avanza al nodo figlio successivo nel ramo attivo.
* `rewind(steps: number): HistoryEntry<T> | null` — Retrocede di N passi.
* `fastForward(steps: number): HistoryEntry<T> | null` — Avanza di N passi.
* `jumpTo(entryId: string): HistoryEntry<T>` — Salta a qualsiasi nodo del grafo.
* `snapshot(name?: string, metadata?: Record<string, unknown>): Snapshot<T>` — Cattura uno snapshot del nodo corrente.
* `restore(snapshotId: string): HistoryEntry<T>` — Ripristina lo stato memorizzato nello snapshot.
* `deleteSnapshot(snapshotId: string): void` — Rimuove uno snapshot.
* `getSnapshots(): Snapshot<T>[]` — Restituisce l'elenco degli snapshot.
* `getHistory(options?: { allBranches?: boolean }): HistoryEntry<T>[]` — Restituisce i nodi di cronologia.
* `getCurrentEntry(): HistoryEntry<T>` — Restituisce il nodo attivo.
* `getBranches(): Branch[]` — Restituisce l'elenco dei rami.
* `getCurrentBranch(): Branch` — Restituisce il ramo attivo.
* `createBranch(name: string, fromEntryId?: string): Branch` — Crea un nuovo ramo esplicito.
* `switchBranch(branchId: string): HistoryEntry<T>` — Passa a un altro ramo.
* `deleteBranch(branchId: string): void` — Elimina un ramo.
* `merge(sourceBranchId: string, options?: BranchMergeOptions): HistoryEntry<T>` — Fonde un ramo nel ramo attivo.
* `compare(branchA: string, branchB: string): BranchComparison` — Confronta due rami calcolando antenato comune (*LCA*) e diff.
* `compact(options?: CompactionOptions): number` — Pota i nodi intermedi non essenziali preservando gli snapshot.
* `diff(entryOrStateA, entryOrStateB?): DiffChange[]` — Calcola le differenze strutturali tra due stati o nodi.
* `export(): SerializedHomura<T>` — Esporta l'intero grafo in formato serializzabile (file report .homura).
* `import(data: SerializedHomura<T>): void` — Importa e reidrata un grafo salvato.
* `pruneHistory(maxEntries?: number): number` — Pota i nodi piu vecchi per ottimizzare l'uso della memoria.
* `use(middleware: HomuraMiddleware<T>): void` — Registra una funzione middleware.
* `on(event, listener): HomuraUnsubscribe` — Sottoscrive un listener a un evento specifico o a tutti gli eventi (`on('*')`).
* `save(): Promise<void>` — Salva lo stato tramite l'adattatore configurato.
* `load(): Promise<boolean>` — Carica lo stato dall'adattatore.

---

## 17. Avvio Locale dei Test e delle Demo

Per testare tutte le funzionalita e le demo incluse:

```bash
# Esecuzione script interattivo (Windows)
./start.bat

# Esecuzione diretta suite di test Vitest
pnpm test

# Avvio demo Mini RPG Inventory
pnpm --filter "@homurajs/example-rpg-inventory" run dev

# Avvio Playground Interattivo
pnpm --filter "@homurajs/playground" run dev
```

---

## 18. Licenza

Distribuito sotto licenza **MIT**. Consulta il file [LICENSE](LICENSE) per ulteriori dettagli.

Copyright (c) 2026 Biagio Scaglia & HomuraJS Team.
