import {
  HomuraEventMap,
  HomuraListener,
  HomuraUnsubscribe
} from './types';

/**
 * Type-safe event emitter for Homura events.
 */
export class EventEmitter<T> {
  private listeners = new Map<keyof HomuraEventMap<T> | '*', Set<Function>>();

  /**
   * Subscribes a listener to a specific event or wildcard '*'.
   */
  public on<K extends keyof HomuraEventMap<T>>(
    event: K,
    listener: HomuraListener<T, K>
  ): HomuraUnsubscribe;
  public on(
    event: '*',
    listener: (eventName: keyof HomuraEventMap<T>, payload: any) => void
  ): HomuraUnsubscribe;
  public on(
    event: any,
    listener: any
  ): HomuraUnsubscribe {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener);

    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Unsubscribes a listener from an event.
   */
  public off(
    event: keyof HomuraEventMap<T> | '*',
    listener: Function
  ): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emits an event to all registered listeners (and wildcard listeners).
   */
  public emit<K extends keyof HomuraEventMap<T>>(
    event: K,
    payload: HomuraEventMap<T>[K]
  ): void {
    const specificSet = this.listeners.get(event);
    if (specificSet) {
      for (const listener of Array.from(specificSet)) {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[HomuraJS] Error in event listener for "${event}":`, err);
        }
      }
    }

    const wildcardSet = this.listeners.get('*');
    if (wildcardSet) {
      for (const listener of Array.from(wildcardSet)) {
        try {
          listener(event, payload);
        } catch (err) {
          console.error(`[HomuraJS] Error in wildcard listener for "${event}":`, err);
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
