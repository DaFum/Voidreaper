import { scorePlacement, explainPlacement } from "./placement-score.js";
import {
  blueprintMatchBonus,
  findBlueprintTarget,
} from "../blueprints/blueprint-matcher.js";
import { rotationForPortDirection } from "../geometry/port-world-transform.js";
export function createPlacementSuggestionService({
  compatibilityService,
  geometryService,
  flightProfileService,
}) {
  return {
    suggest({ state, moduleProfile, blueprint }) {
      const geometry = geometryService.getSnapshot();
      const suggestions = [];

      // ⚡ Bolt: Avoid intermediate array allocations from Object.values(), .map(), and .filter()
      // in the hot path of placement suggestions by using a single-pass imperative loop.
      for (const key in state.portsById) {
        if (!Object.hasOwn(state.portsById, key)) continue;
        const port = state.portsById[key];

        const result = compatibilityService.evaluate({
          state,
          moduleProfile,
          port,
          geometrySnapshot: geometry,
        });

        if (!result.compatible) continue;

        const target = findBlueprintTarget(blueprint, port, moduleProfile);
        const metrics = {
          ...geometryService.measurePlacement(port, moduleProfile, blueprint),
          blueprintMatch: blueprintMatchBonus(target?.match),
        };
        const flightDelta = flightProfileService.previewPlacement(
          {
            ...port,
            worldPosition: result.candidate?.center,
          },
          moduleProfile,
        );
        // lateralImbalance is an absolute coordinate (tens of units); normalize it
        // to the 0-1 range of the other metrics so it doesn't dominate the score.
        const score = scorePlacement({
          ...metrics,
          massAsymmetry: Math.min(
            1,
            Math.abs(flightDelta.lateralImbalance ?? 0) / 60,
          ),
        });
        const transform = {
          position: port.localPosition ?? {
            x: (port.direction?.x ?? 0) * 46,
            y: (port.direction?.y ?? 0) * 46,
          },
          rotation: rotationForPortDirection(port.direction),
        };
        suggestions.push({
          portId: port.portId,
          score,
          metrics,
          flightDelta,
          blueprintMatch: target?.match ?? null,
          blueprintNodeId: target?.node.blueprintNodeId ?? null,
          reasons: explainPlacement(metrics, flightDelta),
          transform,
        });
      }

      return suggestions
        .sort((a, b) => b.score - a.score || a.portId.localeCompare(b.portId))
        .slice(0, 3);
    },
  };
}
