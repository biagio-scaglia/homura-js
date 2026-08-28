import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { createHomura, Homura } from '@homurajs/core';
import { useHomura } from '../src/index';

// Minimal component for testing
function CounterComponent({ homura }: { homura: Homura<{ count: number }> }) {
  const { state, update, undo, redo } = useHomura(homura);
  return (
    <div>
      <span data-testid="count">{state.count}</span>
      <button onClick={() => update(d => { d.count++; })}>Increment</button>
      <button onClick={() => undo()}>Undo</button>
      <button onClick={() => redo()}>Redo</button>
    </div>
  );
}

describe('@homurajs/react - useHomura Hook', () => {
  it('renders initial state correctly via server/client snapshot', () => {
    const homura = createHomura({ initialState: { count: 42 } });
    const html = renderToString(<CounterComponent homura={homura} />);
    expect(html).toContain('42');
  });

  it('provides working time-travel methods', () => {
    const homura = createHomura({ initialState: { count: 0 } });
    let hookResult: any;

    function TestHook() {
      hookResult = useHomura(homura);
      return <div>{hookResult.state.count}</div>;
    }

    renderToString(<TestHook />);
    expect(hookResult.state.count).toBe(0);

    act(() => {
      hookResult.update((d: any) => {
        d.count = 5;
      });
    });

    expect(homura.getState().count).toBe(5);

    act(() => {
      hookResult.undo();
    });

    expect(homura.getState().count).toBe(0);
  });
});
