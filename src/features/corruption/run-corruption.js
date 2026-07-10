export function changeRunCorruption(run, amount, sourceId) {
  const system = run.services?.corruption;
  if (!system) throw new Error(`Corruption system unavailable for ${sourceId}`);
  return system.change(run.corruption, amount, sourceId, run.time, { allowAbyss: run.mode === "abyss" });
}
