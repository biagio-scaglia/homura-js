import { describe, it, expect } from 'vitest';
import { createHomura } from '../src/index';

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
});
