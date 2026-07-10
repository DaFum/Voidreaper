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

  async function writeAtomic(data) {
    const serialized = JSON.stringify(data);
    const temporaryKey = `${SAVE_KEY}-pending`;
    await adapter.set(temporaryKey, serialized);
    await adapter.set(SAVE_KEY, serialized);
    await adapter.remove(temporaryKey);
    return data;
  }

  return {
    key: SAVE_KEY,
    async load() {
      try {
        const current = await readRaw(SAVE_KEY);
        if (current) return migrateSave(current);
        const legacy = await readRaw(LEGACY_KEY);
        if (legacy) {
          const migrated = migrateSave(legacy);
          await writeAtomic(migrated);
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
      return enqueue(() => writeAtomic(migrateSave(data)));
    },
    async update(mutator) {
      return enqueue(async () => {
        const current = await this.load();
        const draft = structuredClone(current);
        const result = await mutator(draft);
        return writeAtomic(migrateSave(result ?? draft));
      });
    },
    async getCheckpoint() { return (await this.load()).checkpoint ?? null; },
    async setCheckpoint(checkpoint) { return this.update(save => { save.checkpoint = checkpoint; }); },
    async clearCheckpoint() { return this.update(save => { save.checkpoint = null; }); }
  };
}
