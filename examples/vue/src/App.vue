<template>
  <div style="max-width: 640px; margin: 40px auto; padding: 24px; background: #161b22; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1)">
    <h1 style="color: #42b883; margin: 0 0 16px 0">HomuraJS + Vue 3</h1>
    <p style="color: #94a3b8; font-size: 13px">Active Commit: <b>{{ currentEntry.label }}</b> (Branch: {{ currentBranch.name }})</p>

    <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0; padding: 14px; background: rgba(0,0,0,0.3); border-radius: 8px">
      <span style="font-size: 20px; font-weight: 700">Count: <span style="color: #42b883">{{ state.count }}</span></span>
      <div style="display: flex; gap: 8px">
        <button :disabled="!canUndo" @click="undo" style="padding: 6px 12px; border-radius: 4px; background: #ff4757; color: #fff; border: none; font-weight: 600; cursor: pointer">Undo</button>
        <button :disabled="!canRedo" @click="redo" style="padding: 6px 12px; border-radius: 4px; background: #30363d; color: #fff; border: none; font-weight: 600; cursor: pointer">Redo</button>
        <button @click="takeSnapshot" style="padding: 6px 12px; border-radius: 4px; background: #a855f7; color: #fff; border: none; font-weight: 600; cursor: pointer">Snapshot</button>
      </div>
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 20px">
      <button @click="increment" style="padding: 8px 14px; background: #42b883; color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer">+1 Increment</button>
      <button @click="decrement" style="padding: 8px 14px; background: #21262d; color: #fff; border: 1px solid #30363d; border-radius: 6px; font-weight: 600; cursor: pointer">-1 Decrement</button>
      <button @click="addRandom" style="padding: 8px 14px; background: #21262d; color: #fff; border: 1px solid #30363d; border-radius: 6px; font-weight: 600; cursor: pointer">+ Random (1..50)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { createHomura } from '@homurajs/core';
import { useHomura } from '@homurajs/vue';
import { mountDevTools } from '@homurajs/devtools';

const homura = createHomura({
  initialState: { count: 0, tag: 'Vue-Demo' }
});

const { state, update, undo, redo, canUndo, canRedo, currentEntry, currentBranch, snapshot } = useHomura(homura);

function increment() {
  update(d => { d.count += 1; }, { label: 'Increment' });
}

function decrement() {
  update(d => { d.count -= 1; }, { label: 'Decrement' });
}

function addRandom() {
  const rand = Math.floor(Math.random() * 50) + 1;
  update(d => { d.count += rand; }, { label: `Add +${rand}` });
}

function takeSnapshot() {
  snapshot(`Vue Checkpoint #${state.value.count}`);
}

onMounted(() => {
  mountDevTools(homura, {
    position: 'floating',
    defaultOpen: true
  });
});
</script>
