// This file is required for cross-screen event communication (like syncing likes between community details and feed).
// If you want to remove this functionality, you must also remove all imports and usage of `emitter` in your codebase.
// Otherwise, keep this file as is for global event handling.
type Listener = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

const emitter = new EventEmitter();
export default emitter;
