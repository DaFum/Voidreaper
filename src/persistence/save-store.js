import { createDefaultSave } from "./save-schema.js";
import { migrateSave } from "./migrations.js";

const SAVE_KEY = "voidreaper-eternal-v2";
const LEGACY_KEY = "voidreaper-eternal";

function createStorageAdapter(storage) {
  if (storage?.get && storage?.set) {
    return {
      async get(key) {
        const result = await storage.get(key);
        return result?.value ?? null;
      },
      async set(key, value) {
        await storage.set(key, value);
      },
      async remove(key) {
        if (storage.delete) await storage.delete(key);
        else await storage.set(key, "");
      }
    };
  }
  const local = storage ?? globalThis.localStorage;
  return {
    async get(key) { return local?.getItem(key) ?? null; },
    async set(key, value) { local?.setItem(key, value); },
    async remove(key) { local?.removeItem(key); }
  };
}

export function createSaveStore(storage = globalThis.storage ?? globalThis.localStorage, { onWarning } = {}) {
  const adapter = createStorageAdapter(storage);
  let queue = Promise.resolve();
  let pendingRecovered = false;

  function enqueue(operation) {
    const current = queue.catch(() => undefined).then(operation);
    queue = current.catch(() => undefined);
    return current;
  }

  async function readRaw(key) {
    const raw = await adapter.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  // A single-key set is atomic in localStorage (it either replaces the value
  // or throws quota and leaves the old one intact), so no write-ahead copy is
  // kept — a pending key would only double the peak storage footprint.
  async function write(data) {
    await adapter.set(SAVE_KEY, JSON.stringify(data));
    return data;
  }

  async function persist(data) {
    try {
      return await write(data);
    } catch (error) {
      onWarning?.("Speichern fehlgeschlagen – Fortschritt wurde nicht gesichert.", error);
      throw error;
    }
  }

  // Earlier builds wrote a `${SAVE_KEY}-pending` copy before the main key and
  // could strand it (as a stale duplicate, or as the only surviving write when
  // the main set hit the quota). Recover it once, then remove it.
  async function recoverPending() {
    if (pendingRecovered) return null;
    pendingRecovered = true;
    const pendingKey = `${SAVE_KEY}-pending`;
    let pending = null;
    try {
      pending = await readRaw(pendingKey);
    } catch {
      pending = null;
    }
    await adapter.remove(pendingKey).catch(() => {});
    return pending;
  }

  return {
    key: SAVE_KEY,
    async load() {
      const pending = await recoverPending();
      try {
        const current = await readRaw(SAVE_KEY);
        if (current) return migrateSave(current);
        if (pending) {
          const migrated = migrateSave(pending);
          await write(migrated).catch(() => {});
          return migrated;
        }
        const legacy = await readRaw(LEGACY_KEY);
        if (legacy) {
          const migrated = migrateSave(legacy);
          await write(migrated).catch(() => {});
          return migrated;
        }
        return createDefaultSave();
      } catch (error) {
        const corruptKey = `${SAVE_KEY}-corrupt-${Date.now()}`;
        const raw = await adapter.get(SAVE_KEY).catch(() => null);
        if (raw) await adapter.set(corruptKey, raw).catch(() => {});
        onWarning?.("Speicherstand beschädigt – Sicherung angelegt und Standardprofil gestartet.", error);
        return createDefaultSave();
      }
    },
    async save(data) {
      return enqueue(() => persist(migrateSave(data)));
    },
    async update(mutator) {
      return enqueue(async () => {
        const current = await this.load();
        const draft = structuredClone(current);
        const result = await mutator(draft);
        return persist(migrateSave(result ?? draft));
      });
    },
    async getCheckpoint() { return (await this.load()).checkpoint ?? null; },
    async setCheckpoint(checkpoint) { return this.update(save => { save.checkpoint = checkpoint; }); },
    async clearCheckpoint() { return this.update(save => { save.checkpoint = null; }); }
  };
}
