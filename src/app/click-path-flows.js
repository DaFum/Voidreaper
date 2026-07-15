export function attemptMerchantPurchase({ merchant, run, offer, finish, onRejected = () => {}, onApplied = () => {} }) {
  const bought = merchant.buy(run, offer);
  if (!bought) {
    onRejected(offer);
    return false;
  }
  onApplied(offer); finish();
  return true;
}

export function attemptWorkshopAction({ workshop, session, action, target, payload, finish, onContinue = () => {}, onApplied = () => {} }) {
  const applied = workshop.apply(session, action, target, payload);
  if (!applied) return false;
  onApplied({ action, target });
  if (session.used >= session.actionPoints) finish();
  else onContinue();
  return true;
}

export function canResumeCampaignCombat(game) {
  return game?.state === "sector-map"
    && game.mode === "standard"
    && game.wave > 0
    && game.player?.hp > 0;
}

export function prepareCheckpointResume({ services, controller, game, run }) {
  services.resumeRun = run;
  controller.attachLegacy(game, { sync: false });
  services.resumeRun = run;
  return run;
}

export function syncLegacyVoidShards({ persistence, root, currencies }) {
  const value = currencies.voidShards ?? 0;
  persistence.data.shards = value;
  const counter = root.querySelector("#shards0");
  if (counter) counter.textContent = String(value);
  return value;
}

export function syncMetaFromLegacy(metaSave, legacyData) {
  if (!metaSave || !legacyData) return metaSave;
  metaSave.currencies ??= {};
  metaSave.profile ??= {};
  if (legacyData.shards !== undefined) metaSave.currencies.voidShards = legacyData.shards;
  if (legacyData.totalKills !== undefined) metaSave.profile.totalKills = legacyData.totalKills;
  if (legacyData.totalRuns !== undefined) metaSave.profile.totalRuns = legacyData.totalRuns;
  return metaSave;
}

export const canUseWorkbenchPort = port => Boolean(port && !port.occupiedByNodeId);

export function openReplacingQuickMount({ active, close, open }) {
  if (active) close();
  return open();
}

export function subscribeWorkbenchGeometry({ events, isActive, render }) {
  return events.on("assembly:geometry-ready", () => {
    if (isActive()) render();
  });
}

export function resetCampaignResume(services) {
  delete services.resumeRun;
  return null;
}

export function startFreshCampaign({ services, game }) {
  resetCampaignResume(services);
  game.state = "start";
  return null;
}

// Combat nodes play out in a separate run created by controller.attachLegacy,
// while campaign checkpoints are serialized from the map's preview run. Pull
// the combat run's build back into the preview run before writing a
// checkpoint, or mounted modules and run items are lost across a restart.
export function adoptCombatRunState(previewRun, combatRun) {
  if (!previewRun || !combatRun || previewRun === combatRun) return previewRun;
  previewRun.assembly = combatRun.assembly;
  previewRun.inventory = combatRun.inventory;
  previewRun.pendingAssemblyItems = combatRun.pendingAssemblyItems ?? [];
  previewRun.resources = combatRun.resources;
  previewRun.rewardedNodeIds = combatRun.rewardedNodeIds ?? [];
  previewRun.heat = combatRun.heat ?? previewRun.heat;
  previewRun.corruption = combatRun.corruption ?? previewRun.corruption;
  previewRun.activeBlueprintId = combatRun.activeBlueprintId ?? previewRun.activeBlueprintId ?? null;
  previewRun.activeBlueprintVariantId = combatRun.activeBlueprintVariantId ?? previewRun.activeBlueprintVariantId ?? null;
  return previewRun;
}
