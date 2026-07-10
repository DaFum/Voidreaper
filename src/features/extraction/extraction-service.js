export function createExtractionService({ prototypeService, saveStore, eventBus } = {}) {
  return {
    createWindow(run, reason = "mid-boss") { const marked = Array.isArray(run.inventory) ? run.inventory.filter(item => item.marked && !item.secured) : prototypeService.selected(run.inventory); const corruption = run.corruption?.value ?? 0; return { reason, marked, duration: Math.min(75, Math.max(45, 45 + marked.length * 5 + corruption * .15)), elapsed: 0, complete: false }; },
    update(window, dt, holding) { if (holding) window.elapsed = Math.min(window.duration, window.elapsed + dt); window.complete = window.elapsed >= window.duration; return window.complete; },
    async secure(run, window) {
      if (!window.complete) return false;
      const items = window.marked.map(item => ({ ...item, secured: true, prototypeStatus: "extracted" }));
      await saveStore.update(save => { save.inventory ??= []; const known = new Set(save.inventory.map(item => item.instanceId)); for (const item of items) if (!known.has(item.instanceId)) save.inventory.push(item); });
      for (const item of window.marked) { item.secured = true; item.prototypeStatus = "extracted"; }
      eventBus?.emit("prototype-extracted", { instanceIds: items.map(item => item.instanceId) });
      return true;
    }
  };
}
