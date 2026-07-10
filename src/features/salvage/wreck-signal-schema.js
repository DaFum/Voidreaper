export function assertWreckSignal(signal) {
  for (const field of ["id", "itemSnapshot", "regionId", "corruption", "deathCause", "createdAtRun", "expiresAfterRun"]) if (signal[field] == null) throw new Error(`Invalid wreck signal: ${field}`);
  return signal;
}
