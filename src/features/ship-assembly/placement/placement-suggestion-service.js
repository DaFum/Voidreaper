import { scorePlacement, explainPlacement } from "./placement-score.js";
import { blueprintMatchBonus,findBlueprintTarget } from "../blueprints/blueprint-matcher.js";
import { rotationForPortDirection } from "../geometry/port-world-transform.js";
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
        // lateralImbalance is an absolute coordinate (tens of units); normalize it
        // to the 0-1 range of the other metrics so it doesn't dominate the score.
        const score = scorePlacement({ ...metrics, massAsymmetry: Math.min(1, Math.abs(flightDelta.lateralImbalance ?? 0) / 60) });
        const transform = {
          position: entry.port.localPosition ?? { x: (entry.port.direction?.x ?? 0) * 46, y: (entry.port.direction?.y ?? 0) * 46 },
          rotation: rotationForPortDirection(entry.port.direction)
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
