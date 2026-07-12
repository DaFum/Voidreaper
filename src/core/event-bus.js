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
      const currentListeners = listeners.get(eventName);
      if (!currentListeners) return;
      for (const listener of [...currentListeners]) {
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
