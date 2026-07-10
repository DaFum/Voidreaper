export function attemptMerchantPurchase({ merchant, run, offer, finish, onRejected = () => {} }) {
  const bought = merchant.buy(run, offer);
  if (!bought) {
    onRejected(offer);
    return false;
  }
  finish();
  return true;
}

export function attemptWorkshopAction({ workshop, session, action, target, payload, finish, onContinue = () => {} }) {
  const applied = workshop.apply(session, action, target, payload);
  if (!applied) return false;
  if (session.used >= session.actionPoints) finish();
  else onContinue();
  return true;
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
