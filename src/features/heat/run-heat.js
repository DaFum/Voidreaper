export function addRunHeat(run, amount, sourceId) {
  const system = run.services?.heat;
  if (!system) throw new Error(`Heat system unavailable for ${sourceId}`);
  system.add(run.heat, amount, sourceId);
  return run.heat.value;
}
