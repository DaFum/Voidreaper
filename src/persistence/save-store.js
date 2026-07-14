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

  function migrateForWrite(data) {
    try {
      return migrateSave(data);
    } catch (error) {
      onWarning?.("Speichern fehlgeschlagen – Fortschritt wurde nicht gesichert.", error);
      throw error;
    }
  }

  // Earlier builds wrote a `${SAVE_KEY}-pending` copy before the main key and
  // could strand it (as a stale duplicate, or as the only surviving write when
  // the main set hit the quota). Read it once; it is only removed after the
  // main key is known-good, since it may be the sole durable copy of the save.
  const pendingKey = `${SAVE_KEY}-pending`;
  let pendingChecked = false;
  let pendingSave = null;
  async function readPending() {
    if (pendingChecked) return pendingSave;
    pendingChecked = true;
    try {
      pendingSave = await readRaw(pendingKey);
    } catch {
      pendingSave = null;
      await adapter.remove(pendingKey).catch(() => {});
    }
    return pendingSave;
  }
  async function discardPending() {
    pendingSave = null;
    await adapter.remove(pendingKey).catch(() => {});
  }

  return {
    key: SAVE_KEY,
    async load() {
      const pending = await readPending();
      let mainError = null;
      try {
        const current = await readRaw(SAVE_KEY);
        if (current) {
          const migrated = migrateSave(current);
          if (pending) await discardPending();
          return migrated;
        }
      } catch (error) {
        mainError = error;
      }
      // A corrupt main key must not skip pending/legacy recovery: back it up,
      // warn, and fall through to the remaining sources.
      if (mainError) {
        const corruptKey = `${SAVE_KEY}-corrupt-${Date.now()}`;
        const raw = await adapter.get(SAVE_KEY).catch(() => null);
        if (raw) await adapter.set(corruptKey, raw).catch(() => {});
        const message = pending
          ? "Speicherstand beschädigt – Sicherung angelegt und letzte Sicherungskopie wiederhergestellt."
          : "Speicherstand beschädigt – Sicherung angelegt und Standardprofil gestartet.";
        onWarning?.(message, mainError);
      }
      if (pending) {
        try {
          const migrated = migrateSave(pending);
          // Keep the pending copy until the recovery write lands — if the write
          // fails (quota, private mode) it stays the only persisted save.
          try { await write(migrated); await discardPending(); } catch { /* retried on next load */ }
          return migrated;
        } catch { await discardPending().catch(() => {}); }
      }
      try {
        const legacy = await readRaw(LEGACY_KEY);
        if (legacy) {
          const migrated = migrateSave(legacy);
          await write(migrated).catch(() => {});
          return migrated;
        }
      } catch { /* unreadable legacy save — fall through to defaults */ }
      return createDefaultSave();
    },
    async save(data) {
      return enqueue(() => persist(migrateForWrite(data)));
    },
    async update(mutator) {
      return enqueue(async () => {
        const current = await this.load();
        const draft = structuredClone(current);
        const result = await mutator(draft);
        return persist(migrateForWrite(result ?? draft));
      });
    },
    async getCheckpoint() { return (await this.load()).checkpoint ?? null; },
    async setCheckpoint(checkpoint) { return this.update(save => { save.checkpoint = checkpoint; }); },
    async clearCheckpoint() { return this.update(save => { save.checkpoint = null; }); }
  };
}
