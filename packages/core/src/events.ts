import {
  HomuraEventMap,
  HomuraListener,
  HomuraUnsubscribe
} from './types';

/**
 * Type-safe event emitter for Homura events.
 */
export class EventEmitter<T> {
  private listeners = new Map<keyof HomuraEventMap<T>, Set<Function>>();

  /**
   * Subscribes a listener to a specific event.
   */
  public on<K extends keyof HomuraEventMap<T>>(
    event: K,
    listener: HomuraListener<T, K>
  ): HomuraUnsubscribe {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as unknown as Function);

    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Unsubscribes a listener from an event.
   */
  public off<K extends keyof HomuraEventMap<T>>(
    event: K,
    listener: HomuraListener<T, K>
  ): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener as unknown as Function);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emits an event to all registered listeners.
   */
  public emit<K extends keyof HomuraEventMap<T>>(
    event: K,
    payload: HomuraEventMap<T>[K]
  ): void {
    const set = this.listeners.get(event);
    if (set) {
      // Iterate over a copy to avoid mutation during dispatch
      for (const listener of Array.from(set)) {
        try {
          (listener as HomuraListener<T, K>)(payload);
        } catch (err) {
          console.error(`[HomuraJS] Error in event listener for "${event}":`, err);
        }
      }
    }
  }

  /**
   * Clears all listeners.
   */
  public clear(): void {
    this.listeners.clear();
  }
}
