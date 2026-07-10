const toBase64 = value => btoa(String.fromCharCode(...new TextEncoder().encode(value))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const fromBase64 = value => new TextDecoder().decode(Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), char => char.charCodeAt(0)));
const FIELDS = ["ship", "weapon", "reactor", "modules", "evolutions", "tags", "seed"];

export function encodeBuildCode(build) { return `VR4.${toBase64(JSON.stringify(Object.fromEntries(FIELDS.map(field => [field, build[field]]))) )}`; }
export function decodeBuildCode(code, validIds = new Set()) {
  if (!code.startsWith("VR4.")) throw new Error("Unsupported build code");
  const build = JSON.parse(fromBase64(code.slice(4)));
  const ids = [build.ship, build.weapon, build.reactor, ...(build.modules ?? []), ...(build.evolutions ?? [])].filter(Boolean);
  return { build, missing: validIds.size ? ids.filter(id => !validIds.has(id)) : [] };
}
