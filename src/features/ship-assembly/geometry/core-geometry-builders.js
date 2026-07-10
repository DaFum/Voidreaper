const builders = new Map();
const polygon = points => ({ kind: "polygon", points });
const line = (from, to, width = 2) => ({ kind: "line", from, to, width });
const lens = (x, y, radiusX, radiusY, rotation = 0) => ({ kind: "lens", center: { x, y }, radiusX, radiusY, rotation });
const bounds = (minX, minY, maxX, maxY) => ({ minX, minY, maxX, maxY });
const core = ({
  hullPaths,
  armorPaths,
  lightPaths,
  cockpitPath,
  reactorPath,
  thrusterAnchors,
  portAnchors,
  bounds: coreBounds,
  structurePaths = [],
  detailPaths = [],
  voidPaths = []
}) => ({
  hullPaths,
  armorPaths,
  lightPaths,
  cockpitPath,
  reactorPath,
  thrusterAnchors,
  portAnchors,
  bounds: coreBounds,
  structurePaths,
  detailPaths,
  voidPaths
});

export function registerCoreGeometry(id, builder) { builders.set(id, builder); }
export function buildCoreGeometry(id, context = {}) { const builder = builders.get(id); if (!builder) throw new Error(`Unknown core geometry: ${id}`); return builder(context); }
export const getCoreGeometryIds = () => [...builders.keys()];

registerCoreGeometry("core-vesper-spear", () => core({
  hullPaths:[polygon([{x:0,y:-38},{x:18,y:10},{x:10,y:38},{x:-10,y:38},{x:-18,y:10}]),polygon([{x:-12,y:4},{x:-48,y:24},{x:-20,y:29},{x:0,y:16}]),polygon([{x:12,y:4},{x:48,y:24},{x:20,y:29},{x:0,y:16}])],
  armorPaths:[line({x:0,y:-30},{x:0,y:30},3),line({x:-14,y:14},{x:-40,y:24}),line({x:14,y:14},{x:40,y:24})], lightPaths:[line({x:0,y:-24},{x:0,y:24})], cockpitPath:lens(0,-9,7,12), reactorPath:lens(0,22,5,8), thrusterAnchors:[{x:-8,y:39},{x:8,y:39}], portAnchors:{"left-wing":{x:-46,y:23,rotation:-1.3},"right-wing":{x:46,y:23,rotation:1.3},dorsal:{x:0,y:-35,rotation:Math.PI},rear:{x:0,y:40,rotation:0}}, bounds:bounds(-50,-40,50,44)
}));
registerCoreGeometry("core-bastion-citadel", () => core({
  hullPaths:[polygon([{x:-34,y:-29},{x:34,y:-29},{x:43,y:-8},{x:38,y:35},{x:18,y:43},{x:-18,y:43},{x:-38,y:35},{x:-43,y:-8}]),polygon([{x:-48,y:-12},{x:-34,y:-22},{x:-34,y:31},{x:-55,y:22}]),polygon([{x:48,y:-12},{x:34,y:-22},{x:34,y:31},{x:55,y:22}])], armorPaths:[line({x:-29,y:-18},{x:29,y:-18},5),line({x:-32,y:5},{x:32,y:5},4),line({x:-27,y:28},{x:27,y:28},5)], lightPaths:[line({x:-22,y:-8},{x:22,y:-8},3),line({x:0,y:12},{x:0,y:31},3)], cockpitPath:lens(0,-15,14,7), reactorPath:lens(0,19,9,9), thrusterAnchors:[{x:-23,y:43},{x:0,y:46},{x:23,y:43}], portAnchors:{"left-bulwark":{x:-54,y:10,rotation:-Math.PI/2},"right-bulwark":{x:54,y:10,rotation:Math.PI/2},spine:{x:0,y:45,rotation:0}}, bounds:bounds(-58,-32,58,49)
}));
registerCoreGeometry("core-specter-phase", () => core({
  hullPaths:[polygon([{x:0,y:-44},{x:15,y:-5},{x:38,y:19},{x:12,y:14},{x:21,y:42},{x:0,y:29},{x:-21,y:42},{x:-12,y:14},{x:-38,y:19},{x:-15,y:-5}]),polygon([{x:-9,y:-11},{x:-43,y:5},{x:-24,y:9}]),polygon([{x:9,y:-11},{x:43,y:5},{x:24,y:9}])], armorPaths:[line({x:-31,y:14},{x:-8,y:4}),line({x:31,y:14},{x:8,y:4}),line({x:-13,y:30},{x:13,y:30})], lightPaths:[line({x:-7,y:-25},{x:6,y:15},2),line({x:9,y:19},{x:-4,y:33},2)], cockpitPath:lens(0,-10,6,13,-.2), reactorPath:lens(0,22,7,5), thrusterAnchors:[{x:-15,y:40},{x:15,y:40}], portAnchors:{"left-phase":{x:-40,y:15,rotation:-1.2},"right-phase":{x:40,y:15,rotation:1.2},keel:{x:0,y:37,rotation:0}}, bounds:bounds(-46,-46,46,45)
}));
registerCoreGeometry("core-furnace-kiln", () => core({
  hullPaths:[polygon([{x:-25,y:-35},{x:25,y:-35},{x:38,y:-7},{x:31,y:38},{x:13,y:45},{x:-13,y:45},{x:-31,y:38},{x:-38,y:-7}]),polygon([{x:-45,y:-16},{x:-30,y:-7},{x:-37,y:32},{x:-54,y:18}]),polygon([{x:45,y:-16},{x:30,y:-7},{x:37,y:32},{x:54,y:18}])], armorPaths:[line({x:-22,y:-23},{x:-29,y:29},3),line({x:22,y:-23},{x:29,y:29},3)], lightPaths:[line({x:-13,y:4},{x:-13,y:29},3),line({x:13,y:4},{x:13,y:29},3)], cockpitPath:lens(0,-20,10,8), reactorPath:lens(0,15,13,18), thrusterAnchors:[{x:-19,y:44},{x:19,y:44}], portAnchors:{"left-vent":{x:-51,y:11,rotation:-1.5},"right-vent":{x:51,y:11,rotation:1.5},"reactor-crown":{x:0,y:-35,rotation:Math.PI},"rear-spine":{x:0,y:46,rotation:0}}, bounds:bounds(-57,-38,57,50)
}));
registerCoreGeometry("core-reliquary-casket", () => core({
  hullPaths:[polygon([{x:0,y:-43},{x:25,y:-24},{x:31,y:22},{x:14,y:43},{x:-14,y:43},{x:-31,y:22},{x:-25,y:-24}]),polygon([{x:-25,y:-13},{x:-48,y:3},{x:-37,y:30},{x:-29,y:17}]),polygon([{x:25,y:-13},{x:48,y:3},{x:37,y:30},{x:29,y:17}])], armorPaths:[line({x:-18,y:-25},{x:18,y:31},3),line({x:18,y:-25},{x:-18,y:31},3)], lightPaths:[line({x:0,y:-35},{x:0,y:34},2)], cockpitPath:lens(0,-16,8,11), reactorPath:lens(0,20,11,14), thrusterAnchors:[{x:-11,y:43},{x:11,y:43}], portAnchors:{"left-relic":{x:-45,y:11,rotation:-1.4},"right-relic":{x:45,y:11,rotation:1.4},crown:{x:0,y:-42,rotation:Math.PI},tail:{x:0,y:44,rotation:0}}, bounds:bounds(-51,-46,51,48)
}));
registerCoreGeometry("core-shepherd-carrier", () => core({
  hullPaths:[polygon([{x:-24,y:-35},{x:24,y:-35},{x:34,y:-10},{x:31,y:39},{x:-31,y:39},{x:-34,y:-10}]),polygon([{x:-64,y:-8},{x:-31,y:-22},{x:-34,y:35},{x:-62,y:27}]),polygon([{x:64,y:-8},{x:31,y:-22},{x:34,y:35},{x:62,y:27}])], armorPaths:[line({x:-56,y:0},{x:-42,y:0},5),line({x:56,y:0},{x:42,y:0},5),line({x:-23,y:27},{x:23,y:27},4)], lightPaths:[line({x:-58,y:12},{x:-38,y:12},3),line({x:58,y:12},{x:38,y:12},3)], cockpitPath:lens(0,-19,12,8), reactorPath:lens(0,16,9,11), thrusterAnchors:[{x:-50,y:31},{x:-17,y:40},{x:17,y:40},{x:50,y:31}], portAnchors:{"left-bay":{x:-62,y:9,rotation:-Math.PI/2},"right-bay":{x:62,y:9,rotation:Math.PI/2},command:{x:0,y:-34,rotation:Math.PI},"carrier-spine":{x:0,y:40,rotation:0}}, bounds:bounds(-68,-38,68,44)
}));
registerCoreGeometry("core-harrow-scythe", () => core({
  hullPaths:[polygon([{x:0,y:-40},{x:19,y:-8},{x:13,y:39},{x:-13,y:39},{x:-19,y:-8}]),polygon([{x:-10,y:-5},{x:-54,y:-20},{x:-45,y:15},{x:-20,y:27}]),polygon([{x:10,y:-5},{x:54,y:-20},{x:45,y:15},{x:20,y:27}])], armorPaths:[line({x:-48,y:-13},{x:-21,y:19},3),line({x:48,y:-13},{x:21,y:19},3)], lightPaths:[{kind:"arc",center:{x:0,y:3},radius:36,start:3.5,end:5.92,width:3}], cockpitPath:lens(0,-17,6,11), reactorPath:lens(0,21,8,8), thrusterAnchors:[{x:-9,y:40},{x:9,y:40}], portAnchors:{"left-blade":{x:-51,y:-13,rotation:-2},"right-blade":{x:51,y:-13,rotation:2},stern:{x:0,y:40,rotation:0}}, bounds:bounds(-58,-42,58,44)
}));
registerCoreGeometry("core-vector-arrow", () => core({
  hullPaths:[polygon([{x:0,y:-49},{x:22,y:3},{x:14,y:45},{x:-14,y:45},{x:-22,y:3}]),polygon([{x:-15,y:8},{x:-43,y:30},{x:-17,y:25}]),polygon([{x:15,y:8},{x:43,y:30},{x:17,y:25}])], armorPaths:[line({x:0,y:-39},{x:0,y:36},3),line({x:-18,y:16},{x:-34,y:28}),line({x:18,y:16},{x:34,y:28})], lightPaths:[line({x:-6,y:-25},{x:-6,y:30},2),line({x:6,y:-25},{x:6,y:30},2)], cockpitPath:lens(0,-15,6,15), reactorPath:lens(0,25,5,9), thrusterAnchors:[{x:-9,y:46},{x:9,y:46}], portAnchors:{"left-fin":{x:-40,y:28,rotation:-1},"right-fin":{x:40,y:28,rotation:1},nose:{x:0,y:-47,rotation:Math.PI},engine:{x:0,y:46,rotation:0}}, bounds:bounds(-46,-51,46,50)
}));
registerCoreGeometry("core-gravewright-rig", () => core({
  hullPaths:[polygon([{x:-29,y:-32},{x:25,y:-38},{x:39,y:-5},{x:32,y:37},{x:-22,y:45},{x:-39,y:14}]),polygon([{x:-61,y:-8},{x:-31,y:-17},{x:-34,y:34},{x:-58,y:25}]),polygon([{x:61,y:-15},{x:34,y:-21},{x:36,y:29},{x:67,y:19}])], armorPaths:[line({x:-55,y:0},{x:-37,y:18},4),line({x:57,y:-5},{x:38,y:15},4),line({x:-20,y:31},{x:25,y:25},4)], lightPaths:[line({x:-50,y:12},{x:-38,y:12},2),line({x:43,y:5},{x:58,y:5},2)], cockpitPath:lens(-5,-17,12,8,.1), reactorPath:lens(8,18,10,12), thrusterAnchors:[{x:-17,y:43},{x:18,y:39}], portAnchors:{"left-rig":{x:-59,y:10,rotation:-1.5},"right-rig":{x:63,y:4,rotation:1.5},gantry:{x:-4,y:-35,rotation:Math.PI},"yard-spine":{x:4,y:42,rotation:0}}, bounds:bounds(-65,-41,70,49)
}));
registerCoreGeometry("core-null-choir-fracture", () => core({
  hullPaths:[polygon([{x:-4,y:-48},{x:29,y:-24},{x:20,y:4},{x:39,y:32},{x:7,y:43},{x:-13,y:25},{x:-35,y:37},{x:-28,y:2},{x:-42,y:-21}]),polygon([{x:8,y:-18},{x:53,y:-4},{x:31,y:13}]),polygon([{x:-17,y:-7},{x:-55,y:10},{x:-29,y:20}])], armorPaths:[line({x:-31,y:-16},{x:25,y:29},3),line({x:30,y:-18},{x:-17,y:27},2)], lightPaths:[line({x:-20,y:-24},{x:31,y:22},2),line({x:17,y:-31},{x:-24,y:14},2)], cockpitPath:lens(-5,-17,7,12,-.4), reactorPath:lens(7,19,13,9,.6), thrusterAnchors:[{x:-10,y:39},{x:15,y:42},{x:36,y:30}], portAnchors:{"left-voice":{x:-51,y:8,rotation:-1.8},"right-voice":{x:49,y:-3,rotation:1.2},aperture:{x:5,y:-43,rotation:2.9},"root-echo":{x:4,y:42,rotation:.2}}, bounds:bounds(-59,-51,57,47)
}));
