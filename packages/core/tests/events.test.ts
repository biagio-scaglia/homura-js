import { describe, it, expect, vi } from 'vitest';
import { createHomura } from '../src/index';

describe('@homurajs/core - Events', () => {
  it('emits state:change and history:add on update', () => {
    const homura = createHomura({ initialState: { count: 0 } });

    const stateChangeSpy = vi.fn();
    const historyAddSpy = vi.fn();

    const unsubState = homura.on('state:change', stateChangeSpy);
    const unsubAdd = homura.on('history:add', historyAddSpy);

    homura.update(d => {
      d.count += 1;
    });

    expect(stateChangeSpy).toHaveBeenCalledTimes(1);
    expect(stateChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        state: { count: 1 },
        prevState: { count: 0 },
        action: 'setState'
      })
    );

    expect(historyAddSpy).toHaveBeenCalledTimes(1);

    // Unsubscribe
    unsubState();
    homura.update(d => {
      d.count += 1;
    });

    expect(stateChangeSpy).toHaveBeenCalledTimes(1); // Not called again
    expect(historyAddSpy).toHaveBeenCalledTimes(2);

    unsubAdd();
  });

  it('emits history:undo and history:redo on time travel', () => {
    const homura = createHomura({ initialState: { count: 0 } });
    homura.update(d => {
      d.count = 1;
    });

    const undoSpy = vi.fn();
    const redoSpy = vi.fn();

    homura.on('history:undo', undoSpy);
    homura.on('history:redo', redoSpy);

    homura.undo();
    expect(undoSpy).toHaveBeenCalledTimes(1);

    homura.redo();
    expect(redoSpy).toHaveBeenCalledTimes(1);
  });
});
