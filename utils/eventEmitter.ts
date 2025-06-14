/*
 * EVENT EMITTER - REACT NATIVE COMPATIBLE
 * 
 * A simple event emitter implementation for React Native that provides
 * the same interface as Node.js EventEmitter but without Node.js dependencies.
 * 
 * Features:
 * - Event registration with on()
 * - Event removal with off()
 * - Event emission with emit()
 * - Error handling in listeners
 * - Cleanup with removeAllListeners()
 * 
 * Usage:
 * class MyService extends SimpleEventEmitter {
 *   doSomething() {
 *     this.emit('somethingHappened', data);
 *   }
 * }
 * 
 * const service = new MyService();
 * service.on('somethingHappened', (data) => console.log(data));
 */

export class SimpleEventEmitter {
  private listeners: { [event: string]: Function[] } = {};

  /**
   * Register an event listener
   * @param event Event name
   * @param listener Function to call when event is emitted
   */
  on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param listener Function to remove
   */
  off(event: string, listener: Function): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  /**
   * Emit an event to all listeners
   * @param event Event name
   * @param args Arguments to pass to listeners
   */
  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event, or all listeners for all events
   * @param event Optional event name. If not provided, removes all listeners for all events
   */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Get the number of listeners for an event
   * @param event Event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    return this.listeners[event]?.length || 0;
  }

  /**
   * Get all event names that have listeners
   * @returns Array of event names
   */
  eventNames(): string[] {
    return Object.keys(this.listeners);
  }
} 