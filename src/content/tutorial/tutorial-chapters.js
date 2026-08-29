import {
  TUTORIAL_EVENTS as E,
  isTutorialEvent,
} from "../../features/tutorial/tutorial-events.js";
const explain = (id, title, body, target, hint) => ({
  id,
  kind: "explanation",
  title,
  body,
  target,
  hint,
});
const act = ({ id, title, body, target, event, matches, hint }) => ({
  id,
  kind: "action",
  title,
  body,
  target,
  event,
  matches,
  hint,
});
const optionalAct = (options) => ({
  ...act(options),
  optional: true,
});

const foundations = [
  explain(
    "welcome",
    "TRAININGSSIGNAL",
    "Hier lernst du Steuerung, Kampf und Ressourcen ohne Risiko: Im Training wird dein Schiff nicht zerstört und nichts zählt für deinen Fortschritt.",
    "game-canvas",
  ),
  act({
    id: "move",
    title: "BEWEGUNG",
    body: "Bewege das Schiff. Positionierung hält dich am Leben.",
    target: "game-canvas",
    event: E.MOVEMENT_USED,
    matches: (p) => p?.magnitude > 0.25,
    hint: "WASD oder Touch-Stick",
  }),
  explain(
    "fire",
    "AUTOMATISCHES FEUER",
    "Deine Waffen erfassen Ziele in Reichweite automatisch. Halte Abstand und lass den Feuerkanal arbeiten.",
    "game-canvas",
  ),
  act({
    id: "dodge",
    title: "AUSWEICHEN",
    body: "Weiche durch eine Gefahrenzone aus.",
    target: "hud-dodge",
    event: E.DODGE_USED,
  }),
  explain(
    "active",
    "AKTIVMODULE",
    "Q und E aktivieren ausgerüstete Module, sobald ihre Kosten gedeckt sind.",
    "hud-active-modules",
  ),
  explain(
    "resources",
    "DEIN SCHIFF",
    "Hull und Schild halten dich im Run. Energie, Hitze und Korruption begrenzen deine Leistung.",
    "hud-resources",
  ),
  act({
    id: "pause",
    title: "PAUSE",
    body: "Öffne die Pause. Dort kannst du den Run sicher unterbrechen.",
    target: "hud-pause",
    event: E.PAUSE_OPENED,
  }),
  act({
    id: "resume",
    title: "WEITERFLIEGEN",
    body: "Setze den Trainingslauf fort, bevor du wieder in den Kampf eingreifst.",
    target: "pause-resume",
    event: E.RUN_RESUMED,
  }),
  act({
    id: "enemy",
    title: "GEGNER",
    body: "Besiege ein Ziel; Belohnungen erscheinen erst nach dem bestätigten Abschuss.",
    target: "game-canvas",
    event: E.ENEMY_DEFEATED,
  }),
  act({
    id: "reward",
    title: "BELOHNUNG",
    body: "Sammle die Beute ein.",
    target: "game-canvas",
    event: E.REWARD_COLLECTED,
  }),
  act({
    id: "evolution",
    title: "EVOLUTION",
    body: "Wähle eine Verbesserung. Sie verändert den laufenden Build.",
    target: "levelup-options",
    event: E.EVOLUTION_SELECTED,
  }),
  explain(
    "complete",
    "SIGNAL VERSTANDEN",
    "Die Grundlagen sind abgeschlossen. Alle Kapitel bleiben wiederholbar.",
    "hangar-tab-tutorials",
  ),
];
const navigation = [
  explain(
    "map",
    "SEKTORKARTE",
    "Knoten zeigen Gefahr, Belohnung und Informationsstand.",
    "sector-map",
  ),
  act({
    id: "select",
    title: "SIGNAL WÄHLEN",
    body: "Wähle einen erreichbaren Knoten einmal zur Prüfung.",
    target: "sector-map",
    event: E.SECTOR_SELECTED,
  }),
  act({
    id: "enter",
    title: "ROUTE BESTÄTIGEN",
    body: "Bestätige denselben Knoten erneut.",
    target: "sector-detail",
    event: E.SECTOR_ENTERED,
  }),
  explain(
    "merchant",
    "HÄNDLER",
    "Scrap und Flux kaufen unterschiedliche Angebote. Fehlende Mittel beenden den Besuch nicht.",
    "merchant-offers",
  ),
  optionalAct({
    id: "buy",
    title: "KAUF ABSCHLIESSEN",
    body: "Kaufe ein bezahlbares Angebot. Ohne erreichbaren Händler kannst du den Schritt fortsetzen.",
    target: "merchant-offers",
    event: E.MERCHANT_PURCHASED,
    matches: (p) => p?.success,
  }),
  explain(
    "workshop",
    "WERKSTATT",
    "Werkstattknoten bieten AP-Aktionen und zeigen ihre endgültige Folge vor der Bestätigung.",
    "workshop-actions",
  ),
  optionalAct({
    id: "forge",
    title: "AKTION ANWENDEN",
    body: "Bestätige eine verfügbare Werkstattaktion oder setze ohne erreichbare Werkstatt fort.",
    target: "workshop-actions",
    event: E.WORKSHOP_APPLIED,
    matches: (p) => p?.success,
  }),
  optionalAct({
    id: "checkpoint",
    title: "CHECKPOINT",
    body: "Setze einen gespeicherten Run fort oder fahre ohne vorhandenen Checkpoint fort.",
    target: "checkpoint-resume",
    event: E.CHECKPOINT_RESUMED,
  }),
  optionalAct({
    id: "anomaly",
    title: "ANOMALIE",
    body: "Wähle einen Tausch oder setze ohne erreichbaren Anomalieknoten fort.",
    target: "anomaly-choices",
    event: E.ANOMALY_RESOLVED,
  }),
];
const assembly = [
  explain(
    "loadout",
    "LOADOUT",
    "Schiff, Waffe, Reaktor und Module bestimmen Energie, Last, Hitze und Tags.",
    "loadout-screen",
  ),
  explain(
    "catalogs",
    "KATALOGE",
    "Schiffe, Waffen und Module zeigen verfügbare und noch gesperrte Definitionen.",
    "catalog-grid",
  ),
  explain(
    "quick",
    "QUICK-MOUNT",
    "Vergleiche Position, Masse, Balance und Risiko eines neuen Moduls.",
    "quick-mount-preview",
  ),
  optionalAct({
    id: "quick-action",
    title: "MONTAGE",
    body: "Montiere oder lagere den Vorschlag; ohne neue Beute kannst du fortsetzen.",
    target: "quick-mount-actions",
    event: E.QUICK_MOUNT_ACTION,
    matches: (p) => p?.success !== false,
  }),
  explain(
    "workbench",
    "WERKBANK",
    "Wähle Inventar, Port oder verbautes Modul. Gold markiert kompatible Ports.",
    "workbench-stage",
  ),
  optionalAct({
    id: "workbench-action",
    title: "KONSTRUKTION ÄNDERN",
    body: "Führe eine Werkbankaktion aus oder setze ohne Run-Inventar fort.",
    target: "workbench-actions",
    event: E.WORKBENCH_ACTION,
    matches: (p) => p?.success,
  }),
  explain(
    "blueprints",
    "BAUPLÄNE",
    "Speichere Konstruktionen, aktiviere Varianten und teile geprüfte Codes.",
    "blueprint-library",
  ),
  optionalAct({
    id: "blueprint-action",
    title: "BAUPLAN VERWENDEN",
    body: "Verwende eine Bauplanaktion oder setze ohne gespeicherten Bauplan fort.",
    target: "blueprint-actions",
    event: E.BLUEPRINT_ACTION,
    matches: (p) => p?.success,
  }),
];
const meta = [
  explain(
    "research",
    "FORSCHUNG",
    "Forschung verbraucht Metawährungen und schaltet reguläre Inhalte frei.",
    "research-grid",
  ),
  act({
    id: "research-buy",
    title: "FORSCHEN",
    body: "Kaufe einen verfügbaren Forschungsknoten.",
    target: "research-grid",
    event: E.RESEARCH_PURCHASED,
  }),
  explain(
    "prototypes",
    "PROTOTYPEN",
    "Stabilität, Filter und Kapazität bestimmen, welche Funde du langfristig behältst.",
    "prototype-vault",
  ),
  explain(
    "codex",
    "CODEX",
    "Filtere bekannte Signale nach Kategorie, Status, Tag oder Quelle.",
    "codex-filters",
  ),
  act({
    id: "codex-filter",
    title: "SIGNAL FILTERN",
    body: "Ändere einen Codexfilter.",
    target: "codex-filters",
    event: E.CODEX_FILTERED,
  }),
  explain(
    "challenges",
    "HERAUSFORDERUNGEN",
    "Challenges öffnen spezialisierte Ausrüstung und belohnen Meisterschaft.",
    "challenge-list",
  ),
  explain(
    "campaigns",
    "KAMPAGNEN",
    "Pfade ordnen Regionen und Regeln neu.",
    "campaign-path-list",
  ),
  explain(
    "salvage",
    "BERGUNG",
    "Wracksignale führen zu Bergungsmissionen mit Stabilitätsrisiko.",
    "salvage-signals",
  ),
  act({
    id: "simulator",
    title: "SIMULATOR",
    body: "Starte eine reproduzierbare Simulation und lies DPS, Trigger und Fehler.",
    target: "simulator-start",
    event: E.SIMULATION_COMPLETED,
  }),
  explain(
    "statistics",
    "STATISTIKEN",
    "Lokale Telemetrie fasst Runs, Siege, Kills und Rekorde zusammen.",
    "statistics-summary",
  ),
];
const advanced = [
  explain(
    "load",
    "ÜBERLASTUNG",
    "Laststufen verändern Bewegung, Energie und Fehlerdruck.",
    "hud-load",
  ),
  explain(
    "heat",
    "HITZE",
    "Hohe Hitze erhöht Fehlerdruck; Kühlung und Feuerdisziplin stabilisieren den Build.",
    "hud-heat",
  ),
  explain(
    "corruption",
    "KORRUPTION",
    "Korruption öffnet mächtige Regeln und verschärft Risiken.",
    "hud-corruption",
  ),
  explain(
    "faults",
    "SYSTEMFEHLER",
    "Das Fehlerprotokoll zeigt Ursache, Dauer und betroffene Komponente.",
    "fault-log",
  ),
  explain(
    "bosses",
    "BOSSE",
    "Beobachte Schadensfenster und Phasen statt dauerhaft zu feuern.",
    "boss-health",
  ),
  optionalAct({
    id: "extract",
    title: "EXTRAKTION",
    body: "Schließe eine Extraktion ab oder setze fort, wenn kein Extraktionsfenster verfügbar ist.",
    target: "extraction-options",
    event: E.EXTRACTION_COMPLETED,
  }),
  optionalAct({
    id: "summary",
    title: "ZUSAMMENFASSUNG",
    body: "Prüfe die Run-Zusammenfassung oder setze ohne beendeten Run fort.",
    target: "run-summary",
    event: E.RUN_SUMMARY_OPENED,
  }),
];
const controls = [
  explain(
    "bindings",
    "TASTENBELEGUNG",
    "Dodge und Aktivmodule lassen sich über physische Tastencodes neu belegen.",
    "settings-bindings",
  ),
  act({
    id: "setting",
    title: "ANZEIGE ANPASSEN",
    body: "Ändere UI-Skalierung oder eine Anzeigeoption.",
    target: "settings-controls",
    event: E.SETTING_CHANGED,
  }),
  explain(
    "reduced",
    "REDUZIERTE BEWEGUNG",
    "Reduzierte Bewegung deaktiviert intensive Tutorial- und Spieleffekte.",
    "settings-reduced-motion",
  ),
  explain(
    "patterns",
    "ZUSTANDSMUSTER",
    "Muster ergänzen Farben, damit Zustände eindeutig bleiben.",
    "settings-color-patterns",
  ),
  explain(
    "touch",
    "TOUCH",
    "Stick, Ausweichen und Aktivmodule verwenden dieselben Spielregeln wie Tastatur und Maus.",
    "touch-controls",
  ),
];
const chapter = (
  id,
  title,
  description,
  capabilities,
  steps,
  availabilityId = null,
) =>
  Object.freeze({
    id,
    title,
    description,
    capabilities: Object.freeze(capabilities),
    steps: Object.freeze(steps),
    availabilityId,
    lockedReason: availabilityId
      ? "Dieses System muss zuerst im Spiel entdeckt werden."
      : null,
  });
export const TUTORIAL_CHAPTERS = Object.freeze([
  chapter(
    "foundations",
    "Grundlagen-Training",
    "Steuerung, Kampf und Ressourcen",
    [
      "movement",
      "aim-fire",
      "dodge",
      "active-modules",
      "hud-resources",
      "pause",
      "enemy",
      "reward",
      "evolution",
    ],
    foundations,
  ),
  chapter(
    "run-navigation",
    "Run-Navigation",
    "Sektorkarte, Händler, Werkstatt und Checkpoints",
    ["sector-map", "merchant", "workshop", "checkpoint", "anomalies"],
    navigation,
    "campaign-map",
  ),
  chapter(
    "ship-and-equipment",
    "Schiff und Ausrüstung",
    "Loadout, Montage, Werkbank und Baupläne",
    [
      "loadout",
      "ships",
      "weapons",
      "reactors",
      "modules",
      "energy-load",
      "heat",
      "synergies",
      "quick-mount",
      "workbench",
      "blueprints",
    ],
    assembly,
    "loadout",
  ),
  chapter(
    "meta-progression",
    "Metafortschritt",
    "Forschung, Codex, Bergung und Simulator",
    [
      "research",
      "prototypes",
      "codex",
      "challenges",
      "campaign-paths",
      "salvage",
      "simulator",
      "statistics",
    ],
    meta,
    "research",
  ),
  chapter(
    "advanced-run",
    "Fortgeschrittener Run",
    "Überlastung, Anomalien, Bosse und Extraktion",
    [
      "overload",
      "faults",
      "corruption",
      "anomalies",
      "bosses",
      "extraction",
      "summaries",
    ],
    advanced,
    "corruption",
  ),
  chapter(
    "controls-accessibility",
    "Bedienung und Barrierefreiheit",
    "Tasten, Touch und Anzeigeoptionen",
    ["bindings", "ui-scale", "reduced-motion", "state-patterns", "touch"],
    controls,
  ),
]);
export function validateTutorialChapters(chapters) {
  const issues = [],
    chapterIds = new Set();
  for (const chapter of chapters) {
    if (!chapter.id || chapterIds.has(chapter.id))
      issues.push(`duplicate chapter: ${chapter.id}`);
    chapterIds.add(chapter.id);
    const steps = new Set();
    for (const step of chapter.steps ?? []) {
      if (!step.id || steps.has(step.id))
        issues.push(`duplicate step: ${chapter.id}/${step.id}`);
      steps.add(step.id);
      if (!["explanation", "action"].includes(step.kind))
        issues.push(`invalid kind: ${chapter.id}/${step.id}`);
      if (step.kind === "action" && !isTutorialEvent(step.event))
        issues.push(`invalid event: ${chapter.id}/${step.id}`);
      if (step.target && !/^[a-z0-9-]+$/.test(step.target))
        issues.push(`invalid target: ${chapter.id}/${step.id}`);
    }
  }
  return { valid: issues.length === 0, issues };
}
