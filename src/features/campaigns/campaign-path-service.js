export function createCampaignPathService(paths) {
  const byId = new Map(paths.map(path => [path.id, path]));
  return {
    available(save) { return paths.filter(path => !path.unlock || save.unlocks[path.unlock]); },
    select(save, id) { const path = byId.get(id); if (!path || (path.unlock && !save.unlocks[path.unlock])) return null; save.selectedCampaignPath = id; save.campaignPaths[id] ??= { unlocked: true, completions: 0 }; return path; },
    complete(save, id) { save.campaignPaths[id] ??= { unlocked: true, completions: 0 }; save.campaignPaths[id].completions += 1; }
  };
}
