import { describe, it, expect } from 'vitest';
import { createHomura } from '../src/index';
import { MiddlewarePipeline } from '../src/middleware';

describe('@homurajs/core - Middleware', () => {
  it('middleware can observe actions and enrich metadata', () => {
    const homura = createHomura({ initialState: { count: 0 } });

    homura.use((context, next) => {
      if (context.setMetadata) {
        context.setMetadata({ trackedBy: 'audit-logger' });
      }
      next();
    });

    homura.update(d => {
      d.count = 10;
    }, { label: 'Audit test' });

    expect(homura.getCurrentEntry().metadata?.trackedBy).toBe('audit-logger');
  });

  it('middleware can cancel an operation', () => {
    const homura = createHomura({ initialState: { count: 0 } });

    homura.use((context, next) => {
      if (context.action === 'setState' && (context.nextState as any)?.count > 100) {
        context.cancel(); // Block values > 100
        return;
      }
      next();
    });

    // Allowed
    homura.update(d => {
      d.count = 50;
    });
    expect(homura.getState().count).toBe(50);

    // Blocked
    homura.update(d => {
      d.count = 200;
    });
    expect(homura.getState().count).toBe(50); // Kept 50!
  });

  it('runAsync awaits Promise-returning middleware before applying state', async () => {
    const order: string[] = [];
    const pipeline = new MiddlewarePipeline<{ n: number }>();
    pipeline.use(async (_ctx, next) => {
      order.push('mw-start');
      await Promise.resolve();
      order.push('mw-before-next');
      next();
      order.push('mw-after-next');
    });

    let applied = false;
    const ok = await pipeline.runAsync(
      {
        action: 'setState',
        currentState: { n: 0 },
        currentEntry: {} as any,
        cancel: () => {}
      },
      () => {
        order.push('apply');
        applied = true;
      }
    );

    expect(ok).toBe(true);
    expect(applied).toBe(true);
    expect(order).toEqual(['mw-start', 'mw-before-next', 'apply', 'mw-after-next']);
  });

  it('setStateAsync awaits async middleware before committing', async () => {
    const homura = createHomura({ initialState: { count: 0 } });
    let gate = false;

    homura.use(async (_ctx, next) => {
      await new Promise(r => setTimeout(r, 10));
      gate = true;
      next();
    });

    expect(() => homura.setState({ count: 1 })).toThrow(/Promise/);

    const entry = await homura.setStateAsync({ count: 7 });
    expect(gate).toBe(true);
    expect(entry.state.count).toBe(7);
    expect(homura.getState().count).toBe(7);
  });
});
