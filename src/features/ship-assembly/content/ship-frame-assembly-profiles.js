const port = (key, sizeClass, mountType, x, y, loadCapacity, energyClass = "standard", preferredRoles = []) => ({ key, sizeClass, mountType, direction: { x, y }, loadCapacity, energyClass, acceptedEnergyClasses: [energyClass, "standard"], preferredRoles, blockedRoles: [], branchDepth: 0 });
const FRAME_PALETTES = Object.freeze({
  vesper: { hull:"#0b1620",armor:"#456b78",energy:"#48e5c2" },
  bastion: { hull:"#111922",armor:"#71818a",energy:"#ffd166" },
  specter: { hull:"#111124",armor:"#535284",energy:"#a995ff",void:"#35145c" },
  furnace: { hull:"#1b100d",armor:"#764331",energy:"#ff8a42",thruster:"#ff5d2e" },
  reliquary: { hull:"#140d1a",armor:"#674b70",energy:"#dd63ff",void:"#431354",corrupted:true },
  shepherd: { hull:"#0d1820",armor:"#496c78",energy:"#72dfd1" },
  harrow: { hull:"#180d15",armor:"#784356",energy:"#ff4d6d" },
  vector: { hull:"#091720",armor:"#3b7180",energy:"#88f7ff" },
  gravewright: { hull:"#101516",armor:"#59675e",energy:"#a8d8bd" },
  "null-choir": { hull:"#130916",armor:"#60396b",energy:"#dd63ff",void:"#24042e",fault:"#ff7de9",corrupted:true }
});
const BASE_PALETTE = Object.freeze({ hull:"#101c2b",armor:"#59778b",energy:"#33e6ff",thruster:"#ffb047" });
const frame = (id, coreGeometryId, width, length, armorFamily, initialPorts, coreHitZone = { shape: "capsule", length: 40, radius: 15 }) => ({ id, coreGeometryId, coreHitZone, maxBranchDepth: 4, maxVisibleSegments: 18, dimensionLimits: { width, length }, initialPorts, style: { armorFamily, palette: { ...BASE_PALETTE, ...FRAME_PALETTES[id] } } });
export const SHIP_FRAME_ASSEMBLY_PROFILES = Object.freeze([
  frame("vesper", "core-vesper-spear", 280, 340, "tapered-blade", [port("left-wing","M","lateral",-1,.15,8),port("right-wing","M","lateral",1,.15,8),port("dorsal","S","dorsal",0,-1,4,"precision"),port("rear","L","structural",0,1,12)]),
  frame("bastion", "core-bastion-citadel", 350, 330, "heavy-block", [port("left-bulwark","L","lateral",-1,0,15,"heavy",["Shield"]),port("right-bulwark","L","lateral",1,0,15,"heavy",["Shield"]),port("spine","XL","structural",0,1,20,"heavy")], { shape:"capsule",length:46,radius:20 }),
  frame("specter", "core-specter-phase", 300, 360, "phase-shard", [port("left-phase","M","radial",-.9,-.2,7,"precision"),port("right-phase","M","radial",.9,-.2,7,"precision"),port("keel","S","ventral",0,.8,4,"precision")]),
  frame("furnace", "core-furnace-kiln", 330, 350, "thermal-open", [port("left-vent","L","lateral",-1,.25,12,"thermal",["Cooling"]),port("right-vent","L","lateral",1,.25,12,"thermal",["Cooling"]),port("reactor-crown","L","dorsal",0,-1,14,"thermal"),port("rear-spine","XL","structural",0,1,18,"thermal")]),
  frame("reliquary", "core-reliquary-casket", 320, 370, "void-organic", [port("left-relic","M","radial",-1,-.1,9,"void"),port("right-relic","M","radial",1,-.1,9,"void"),port("crown","L","dorsal",0,-1,11,"void"),port("tail","L","structural",0,1,13,"void")]),
  frame("shepherd", "core-shepherd-carrier", 380, 340, "carrier-frame", [port("left-bay","L","lateral",-1,.1,14,"standard",["Drone"]),port("right-bay","L","lateral",1,.1,14,"standard",["Drone"]),port("command","M","dorsal",0,-1,8,"precision"),port("carrier-spine","XL","structural",0,1,18)]),
  frame("harrow", "core-harrow-scythe", 340, 360, "reaper-curve", [port("left-blade","L","radial",-1,-.15,12,"standard",["Orbit"]),port("right-blade","L","radial",1,-.15,12,"standard",["Orbit"]),port("stern","M","structural",0,1,10)]),
  frame("vector", "core-vector-arrow", 290, 390, "streamline", [port("left-fin","M","lateral",-1,.3,8,"precision"),port("right-fin","M","lateral",1,.3,8,"precision"),port("nose","S","axial",0,-1,5,"precision"),port("engine","L","structural",0,1,14)]),
  frame("gravewright", "core-gravewright-rig", 390, 370, "industrial-truss", [port("left-rig","L","lateral",-1,.2,15,"heavy"),port("right-rig","L","lateral",1,.2,15,"heavy"),port("gantry","L","dorsal",0,-1,12,"standard"),port("yard-spine","XL","structural",0,1,20,"heavy")]),
  frame("null-choir", "core-null-choir-fracture", 350, 390, "null-fracture", [port("left-voice","M","radial",-.8,-.5,9,"void"),port("right-voice","L","lateral",1,.1,12,"void"),port("aperture","L","dorsal",.15,-1,13,"void"),port("root-echo","XL","structural",-.1,1,17,"void")])
]);
