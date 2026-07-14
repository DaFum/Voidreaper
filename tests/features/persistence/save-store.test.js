import test from "node:test";
import assert from "node:assert/strict";
import { createSaveStore } from "../../../src/persistence/save-store.js";
import { createDefaultSave } from "../../../src/persistence/save-schema.js";

function createMemoryLocalStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data,
        getItem: key => data.get(key) ?? null,
        setItem(key, value) { data.set(key, String(value)); },
        removeItem(key) { data.delete(key); }
    };
}

const SAVE_KEY = "voidreaper-eternal-v2";
const PENDING_KEY = `${SAVE_KEY}-pending`;

test("save writes only the main key and leaves no pending duplicate", async () => {
    const storage = createMemoryLocalStorage();
    const store = createSaveStore(storage);
    await store.save(createDefaultSave());

    assert.equal(storage.data.has(SAVE_KEY), true);
    assert.equal(storage.data.has(PENDING_KEY), false);
});

test("load removes a stranded pending duplicate and keeps the main save", async () => {
    const mainSave = { ...createDefaultSave(), currencies: { voidShards: 42 } };
    const storage = createMemoryLocalStorage({
        [SAVE_KEY]: JSON.stringify(mainSave),
        [PENDING_KEY]: JSON.stringify(createDefaultSave())
    });
    const store = createSaveStore(storage);
    const loaded = await store.load();

    assert.equal(loaded.currencies.voidShards, 42);
    assert.equal(storage.data.has(PENDING_KEY), false);
});

test("load recovers from a stranded pending write when the main save is missing", async () => {
    const pendingSave = { ...createDefaultSave(), currencies: { voidShards: 7 } };
    const storage = createMemoryLocalStorage({ [PENDING_KEY]: JSON.stringify(pendingSave) });
    const store = createSaveStore(storage);
    const loaded = await store.load();

    assert.equal(loaded.currencies.voidShards, 7);
    assert.equal(storage.data.has(SAVE_KEY), true);
    assert.equal(storage.data.has(PENDING_KEY), false);
});

test("adapter without delete still clears the stranded pending duplicate", async () => {
    const data = new Map([[PENDING_KEY, JSON.stringify(createDefaultSave())]]);
    const storage = {
        async get(key) { return data.has(key) ? { value: data.get(key) } : null; },
        async set(key, value) { data.set(key, value); }
    };
    const store = createSaveStore(storage);
    await store.load();

    assert.equal(data.get(PENDING_KEY), "");
});

test("failed writes surface a warning instead of failing silently", async () => {
    const warnings = [];
    const storage = createMemoryLocalStorage();
    storage.setItem = () => { throw new Error("QuotaExceededError"); };
    const store = createSaveStore(storage, { onWarning: message => warnings.push(message) });

    await assert.rejects(() => store.save(createDefaultSave()));
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Speichern fehlgeschlagen/);

    await assert.rejects(() => store.update(save => { save.currencies.voidShards = 1; }));
    assert.equal(warnings.length, 2);
});

test("migration failures during save and update surface the write warning", async () => {
    const warnings = [];
    const store = createSaveStore(createMemoryLocalStorage(), { onWarning: message => warnings.push(message) });
    const circular = createDefaultSave();
    circular.profile.circular = circular;

    await assert.rejects(() => store.save(circular));
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Speichern fehlgeschlagen/);

    await assert.rejects(() => store.update(save => { save.profile.circular = save; }));
    assert.equal(warnings.length, 2);
});

test("a stranded pending save survives when the recovery write fails", async () => {
    const pendingSave = { ...createDefaultSave(), currencies: { voidShards: 3 } };
    const storage = createMemoryLocalStorage({ [PENDING_KEY]: JSON.stringify(pendingSave) });
    storage.setItem = () => { throw new Error("QuotaExceededError"); };
    const store = createSaveStore(storage);
    const loaded = await store.load();

    assert.equal(loaded.currencies.voidShards, 3);
    // The pending key is the only durable copy; it must not be removed.
    assert.equal(storage.data.has(PENDING_KEY), true);
});

test("a corrupt main save falls back to the stranded pending save, not defaults", async () => {
    const warnings = [];
    const pendingSave = { ...createDefaultSave(), currencies: { voidShards: 11 } };
    const storage = createMemoryLocalStorage({
        [SAVE_KEY]: "{ definitely not json",
        [PENDING_KEY]: JSON.stringify(pendingSave)
    });
    const store = createSaveStore(storage, { onWarning: message => warnings.push(message) });
    const loaded = await store.load();

    assert.equal(loaded.currencies.voidShards, 11);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /beschädigt/);
    // The corrupt copy is backed up, the recovered save becomes the main key,
    // and the pending key is cleaned up after the successful write.
    assert.ok([...storage.data.keys()].some(key => key.startsWith(`${SAVE_KEY}-corrupt-`)));
    assert.equal(JSON.parse(storage.data.get(SAVE_KEY)).currencies.voidShards, 11);
    assert.equal(storage.data.has(PENDING_KEY), false);
});

test("a corrupt main save without a pending copy still starts a default profile", async () => {
    const warnings = [];
    const storage = createMemoryLocalStorage({ [SAVE_KEY]: "{ definitely not json" });
    const store = createSaveStore(storage, { onWarning: message => warnings.push(message) });
    const loaded = await store.load();

    assert.equal(loaded.currencies.voidShards, createDefaultSave().currencies.voidShards);
    assert.match(warnings[0], /Standardprofil/);
});

test("a failed write during legacy migration still returns the migrated save", async () => {
    const legacySave = { ...createDefaultSave(), currencies: { voidShards: 9 } };
    const storage = createMemoryLocalStorage({ "voidreaper-eternal": JSON.stringify(legacySave) });
    storage.setItem = () => { throw new Error("QuotaExceededError"); };
    const store = createSaveStore(storage);
    const loaded = await store.load();

    assert.equal(loaded.currencies.voidShards, 9);
});
