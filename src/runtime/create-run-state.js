import { createIdService, createRuntimeId } from "../core/ids.js";
import { createRunRng } from "../core/rng.js";
import { createPlayerState } from "./create-player-state.js";
import { createCampaignState } from "../features/sectors/campaign-state.js";

export function createRunState({ seed = Date.now(), mode = "campaign", difficulty = "standard", player = {}, campaignPathId = "architect" } = {}) {
  const runId = createRuntimeId("run");
  return {
    id: runId,
    seed: seed >>> 0,
    rng: createRunRng(seed),
    ids: createIdService(runId),
    mode,
    difficulty,
    phase: "sector-map",
    assembly: null,
    pendingAssemblyItems: [],
    campaign: { ...createCampaignState(), pathId: campaignPathId },
    time: 0,
    score: 0,
    kills: 0,
    wave: 1,
    player: createPlayerState(player),
    enemies: [],
    projectiles: [],
    pickups: [],
    summons: [],
    zones: [],
    effects: [],
    pools: new Map(),
    camera: { x: 0, y: 0, shake: 0 },
    eventState: new Map(),
    build: {
      modifiers: [],
      tags: new Map(),
      synergies: [],
      evolutions: [],
      sources: []
    },
    resources: {
      scrap: 0,
      flux: 0
    },
    inventory: [],
    telemetry: {
      damageBySource: {},
      heatPeaks: [],
      faults: [],
      triggerCount: 0
    }
  };
}
