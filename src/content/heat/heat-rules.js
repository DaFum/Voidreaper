export const HEAT_THRESHOLDS = Object.freeze([
  { id: "warm", value: 60, icon: "△", label: "WARM", modifiers: [] },
  { id: "unstable", value: 85, icon: "⚠", label: "UNSTABLE", modifiers: [{ targetStat: "energy-regeneration", operation: "multiply", value: 0.9 }] },
  { id: "overheated", value: 100, icon: "✕", label: "OVERHEATED", modifiers: [] }
]);
