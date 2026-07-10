import { scorePlacement, explainPlacement } from "./placement-score.js";
import { blueprintMatchBonus,findBlueprintTarget } from "../blueprints/blueprint-matcher.js";
export function createPlacementSuggestionService({ compatibilityService, geometryService, flightProfileService }) {
  return {
    suggest({ state, moduleProfile, blueprint }) {
      const geometry = geometryService.getSnapshot();
      const evaluated = Object.values(state.portsById).map(port => ({
        port,
        result: compatibilityService.evaluate({ state, moduleProfile, port, geometrySnapshot: geometry })
      }));
      const compatible = evaluated.filter(entry => entry.result.compatible);
      const suggestions = compatible.map(entry => {
        const target = findBlueprintTarget(blueprint, entry.port, moduleProfile);
        const metrics = {
          ...geometryService.measurePlacement(entry.port, moduleProfile, blueprint),
          blueprintMatch: blueprintMatchBonus(target?.match)
        };
        const flightDelta = flightProfileService.previewPlacement(entry.port, moduleProfile);
        const score = scorePlacement({ ...metrics, massAsymmetry: Math.abs(flightDelta.lateralImbalance ?? 0) });
        const candidate = entry.result.candidate;
        const transform = {
          position: candidate.center ?? { x: (candidate.minX + candidate.maxX) / 2, y: (candidate.minY + candidate.maxY) / 2 },
          rotation: Math.atan2(entry.port.direction?.y ?? 0, entry.port.direction?.x ?? 1)
        };
        return {
          portId: entry.port.portId,
          score,
          metrics,
          flightDelta,
          blueprintMatch: target?.match ?? null,
          blueprintNodeId: target?.node.blueprintNodeId ?? null,
          reasons: explainPlacement(metrics, flightDelta),
          transform
        };
      });
      return suggestions.sort((a, b) => b.score - a.score || a.portId.localeCompare(b.portId)).slice(0, 3);
    }
  };
}
