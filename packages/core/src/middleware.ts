import { HomuraMiddleware, MiddlewareContext } from './types';

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/**
 * Executes a pipeline of middleware functions.
 */
export class MiddlewarePipeline<T> {
  private middlewares: HomuraMiddleware<T>[] = [];

  constructor(initialMiddlewares: HomuraMiddleware<T>[] = []) {
    this.middlewares = [...initialMiddlewares];
  }

  /**
   * Registers a new middleware in the pipeline.
   */
  public use(middleware: HomuraMiddleware<T>): void {
    this.middlewares.push(middleware);
  }

  /**
   * Returns a copy of the registered middlewares.
   */
  public getMiddlewares(): HomuraMiddleware<T>[] {
    return [...this.middlewares];
  }

  /**
   * Executes the middleware chain synchronously.
   * Mutations must happen in `finalCallback` (invoked when the chain completes).
   * Returns true if execution completed, or false if cancelled.
   * Throws if a middleware returns a Promise — use {@link runAsync} instead.
   */
  public run(
    context: MiddlewareContext<T>,
    finalCallback: () => void
  ): boolean {
    let isCancelled = false;
    let index = -1;

    context.cancel = () => {
      isCancelled = true;
    };

    const dispatch = (i: number): void => {
      if (isCancelled) return;
      if (i <= index) {
        throw new Error('[HomuraJS] next() called multiple times in middleware');
      }
      index = i;

      const fn = this.middlewares[i];
      if (!fn) {
        if (!isCancelled) {
          finalCallback();
        }
        return;
      }

      try {
        const result = fn(context, () => dispatch(i + 1));
        if (isThenable(result)) {
          throw new Error(
            '[HomuraJS] Middleware returned a Promise. Use MiddlewarePipeline.runAsync() so async middleware can be awaited.'
          );
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.message.includes('Middleware returned a Promise')
        ) {
          throw err;
        }
        console.error('[HomuraJS] Error in middleware execution:', err);
        throw err;
      }
    };

    dispatch(0);
    return !isCancelled;
  }

  /**
   * Executes the middleware chain, awaiting Promise-returning middleware.
   * Call `next()` after async work to continue the chain (Express-style).
   */
  public async runAsync(
    context: MiddlewareContext<T>,
    finalCallback: () => void
  ): Promise<boolean> {
    let isCancelled = false;
    let index = -1;

    context.cancel = () => {
      isCancelled = true;
    };

    const dispatch = async (i: number): Promise<void> => {
      if (isCancelled) return;
      if (i <= index) {
        throw new Error('[HomuraJS] next() called multiple times in middleware');
      }
      index = i;

      const fn = this.middlewares[i];
      if (!fn) {
        if (!isCancelled) {
          finalCallback();
        }
        return;
      }

      let nextPromise: Promise<void> | null = null;
      const next = (): void => {
        nextPromise = dispatch(i + 1);
      };

      try {
        const result = fn(context, next);
        if (isThenable(result)) {
          await result;
        }
        if (nextPromise) {
          await nextPromise;
        }
      } catch (err) {
        console.error('[HomuraJS] Error in middleware execution:', err);
        throw err;
      }
    };

    await dispatch(0);
    return !isCancelled;
  }
}
