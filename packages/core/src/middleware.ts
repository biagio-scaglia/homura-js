import { HomuraMiddleware, MiddlewareContext } from './types';

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
   * Executes the middleware chain for a given context.
   * Returns true if execution was completed, or false if cancelled.
   */
  public run(
    context: MiddlewareContext<T>,
    finalCallback: () => void
  ): boolean {
    let isCancelled = false;
    let index = -1;

    // Enhance context with cancel method
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
        fn(context, () => dispatch(i + 1));
      } catch (err) {
        console.error('[HomuraJS] Error in middleware execution:', err);
        throw err;
      }
    };

    dispatch(0);
    return !isCancelled;
  }
}
