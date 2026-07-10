export const MODULE_VISUAL_PROFILES = Object.freeze([
  ["weapon-linear","core-linear-weapon","M",["axial","lateral"]], ["weapon-missile","core-missile-rack","L",["lateral","dorsal"]], ["weapon-beam","core-beam-emitter","L",["axial","dorsal"]], ["weapon-mine","core-mine-bay","M",["ventral","structural"]],
  ["drone-bay","core-drone-dock","L",["lateral","dorsal"]], ["shield-emitter","core-shield-ring","M",["lateral","radial"]], ["cooling-array","core-cooling-ribs","M",["structural","dorsal"]], ["reactor-aux","core-reactor-chamber","L",["structural","dorsal"]],
  ["sensor-array","core-sensor-lens","S",["dorsal","axial"]], ["utility-node","core-utility-cluster","S",["dorsal","ventral","lateral"]], ["structure-spine","core-structural-spine","L",["structural"]], ["void-anomaly","core-void-aperture","L",["dorsal","radial"]],
  ["orbit-hub","core-orbit-bearing","M",["radial","dorsal"]], ["corrupted-node","core-corrupted-organ","M",["structural","dorsal"]]
].map(([id,rendererId,sizeClass,preferredMounts]) => Object.freeze({ id, rendererId, sizeClass, preferredMounts })));
export const MODULE_VISUAL_PROFILE_BY_ID = new Map(MODULE_VISUAL_PROFILES.map(profile => [profile.id, profile]));
