export function createCampaignState() {
  return {
    regionIndex: 0,
    currentNodeId: null,
    visitedNodeIds: [],
    map: null,
    elapsedCampaignTime: 0,
    bossProgress: 0,
    extractionWindowsUsed: 0,
    abyssDepth: 0
  };
}
