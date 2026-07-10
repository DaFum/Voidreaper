export function createEventBus() {
  const listeners = new Map();

  return {
    on(eventName, listener) {
      const bucket = listeners.get(eventName) ?? new Set();
      bucket.add(listener);
      listeners.set(eventName, bucket);
      return () => bucket.delete(listener);
    },
    emit(eventName, payload) {
      for (const listener of listeners.get(eventName) ?? []) {
        try {
          listener(payload);
        } catch (error) {
          console.error(`[event:${eventName}]`, error);
        }
      }
    },
    clear() {
      listeners.clear();
    }
  };
}
