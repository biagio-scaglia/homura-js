import { describe, it, expect } from 'vitest';
import { createHomura } from '@homurajs/core';
import { createDevtoolsBridge } from '../src/index';

describe('@homurajs/devtools - Bridge System', () => {
  it('bridges state updates and history to listeners', () => {
    const homura = createHomura({ initialState: { count: 0 } });
    const bridge = createDevtoolsBridge(homura);

    const messages: any[] = [];
    const unsub = bridge.subscribe(msg => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('init');
    expect(messages[0].data.state).toEqual({ count: 0 });

    homura.update(d => {
      d.count = 10;
    }, { label: 'Add 10' });

    expect(messages.length).toBeGreaterThan(1);
    const lastChange = messages.find(m => m.type === 'state:change');
    expect(lastChange.data.state.count).toBe(10);

    unsub();
    bridge.destroy();
  });

  it('bridge commands invoke Homura operations', () => {
    const homura = createHomura({ initialState: { hp: 100 } });
    const bridge = createDevtoolsBridge(homura);

    homura.update(d => {
      d.hp = 80;
    }, { label: 'Damage' });

    expect(homura.getState().hp).toBe(80);

    // Bridge undo
    bridge.undo();
    expect(homura.getState().hp).toBe(100);

    // Bridge redo
    bridge.redo();
    expect(homura.getState().hp).toBe(80);

    // Bridge snapshot
    const snap = bridge.takeSnapshot('Check 80');
    expect(snap.name).toBe('Check 80');
    expect(homura.getSnapshots()).toHaveLength(1);

    // Bridge create branch
    const branch = bridge.createBranch('New-Path');
    expect(branch.name).toBe('New-Path');
    expect(homura.getCurrentBranch().name).toBe('New-Path');

    bridge.destroy();
  });
});
