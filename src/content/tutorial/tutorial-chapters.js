import { TUTORIAL_EVENTS as E, isTutorialEvent } from "../../features/tutorial/tutorial-events.js";
const explain=(id,title,body,target,hint)=>({id,kind:"explanation",title,body,target,hint});
const act=(id,title,body,target,event,matches,hint)=>({id,kind:"action",title,body,target,event,matches,hint});
const optionalAct=(id,title,body,target,event,matches,hint)=>({ ...act(id,title,body,target,event,matches,hint), optional:true });

const foundations=[
  explain("welcome","TRAININGSSIGNAL","Hier lernst du Steuerung, Kampf und Ressourcen ohne Risiko.","game-canvas"),
  act("move","BEWEGUNG","Bewege das Schiff. Positionierung hält dich am Leben.","game-canvas",E.MOVEMENT_USED,p=>p?.magnitude>.25,"WASD oder Touch-Stick"),
  act("fire","ZIELEN UND FEUERN","Halte den Feuerkanal auf ein Ziel.","game-canvas",E.SHOT_FIRED,null,"Maus oder primäre Feuersteuerung"),
  act("dodge","AUSWEICHEN","Weiche durch eine Gefahrenzone aus.","hud-dodge",E.DODGE_USED),
  explain("active","AKTIVMODULE","Q und E aktivieren ausgerüstete Module, sobald ihre Kosten gedeckt sind.","hud-active-modules"),
  explain("resources","DEIN SCHIFF","Hull und Schild halten dich im Run. Energie, Hitze und Korruption begrenzen deine Leistung.","hud-resources"),
  act("pause","PAUSE","Öffne die Pause. Dort kannst du den Run sicher unterbrechen.","hud-pause",E.PAUSE_OPENED),
  act("resume","WEITERFLIEGEN","Setze den Trainingslauf fort, bevor du wieder in den Kampf eingreifst.","pause-resume",E.RUN_RESUMED),
  act("enemy","GEGNER","Besiege ein Ziel; Belohnungen erscheinen erst nach dem bestätigten Abschuss.","game-canvas",E.ENEMY_DEFEATED),
  act("reward","BELOHNUNG","Sammle die Beute ein.","game-canvas",E.REWARD_COLLECTED),
  act("evolution","EVOLUTION","Wähle eine Verbesserung. Sie verändert den laufenden Build.","levelup-options",E.EVOLUTION_SELECTED),
  explain("complete","SIGNAL VERSTANDEN","Die Grundlagen sind abgeschlossen. Alle Kapitel bleiben wiederholbar.","hangar-tab-tutorials")
];
const navigation=[
  explain("map","SEKTORKARTE","Knoten zeigen Gefahr, Belohnung und Informationsstand.","sector-map"),
  act("select","SIGNAL WÄHLEN","Wähle einen erreichbaren Knoten einmal zur Prüfung.","sector-map",E.SECTOR_SELECTED),
  act("enter","ROUTE BESTÄTIGEN","Bestätige denselben Knoten erneut.","sector-detail",E.SECTOR_ENTERED),
  explain("merchant","HÄNDLER","Scrap und Flux kaufen unterschiedliche Angebote. Fehlende Mittel beenden den Besuch nicht.","merchant-offers"),
  optionalAct("buy","KAUF ABSCHLIESSEN","Kaufe ein bezahlbares Angebot. Ohne erreichbaren Händler kannst du den Schritt fortsetzen.","merchant-offers",E.MERCHANT_PURCHASED,p=>p?.success),
  explain("workshop","WERKSTATT","Werkstattknoten bieten AP-Aktionen und zeigen ihre endgültige Folge vor der Bestätigung.","workshop-actions"),
  optionalAct("forge","AKTION ANWENDEN","Bestätige eine verfügbare Werkstattaktion oder setze ohne erreichbare Werkstatt fort.","workshop-actions",E.WORKSHOP_APPLIED,p=>p?.success),
  optionalAct("checkpoint","CHECKPOINT","Setze einen gespeicherten Run fort oder fahre ohne vorhandenen Checkpoint fort.","checkpoint-resume",E.CHECKPOINT_RESUMED),
  optionalAct("anomaly","ANOMALIE","Wähle einen Tausch oder setze ohne erreichbaren Anomalieknoten fort.","anomaly-choices",E.ANOMALY_RESOLVED)
];
const assembly=[
  explain("loadout","LOADOUT","Schiff, Waffe, Reaktor und Module bestimmen Energie, Last, Hitze und Tags.","loadout-screen"),
  explain("catalogs","KATALOGE","Schiffe, Waffen und Module zeigen verfügbare und noch gesperrte Definitionen.","catalog-grid"),
  explain("quick","QUICK-MOUNT","Vergleiche Position, Masse, Balance und Risiko eines neuen Moduls.","quick-mount-preview"),
  optionalAct("quick-action","MONTAGE","Montiere oder lagere den Vorschlag; ohne neue Beute kannst du fortsetzen.","quick-mount-actions",E.QUICK_MOUNT_ACTION,p=>p?.success!==false),
  explain("workbench","WERKBANK","Wähle Inventar, Port oder verbautes Modul. Gold markiert kompatible Ports.","workbench-stage"),
  optionalAct("workbench-action","KONSTRUKTION ÄNDERN","Führe eine Werkbankaktion aus oder setze ohne Run-Inventar fort.","workbench-actions",E.WORKBENCH_ACTION,p=>p?.success),
  explain("blueprints","BAUPLÄNE","Speichere Konstruktionen, aktiviere Varianten und teile geprüfte Codes.","blueprint-library"),
  optionalAct("blueprint-action","BAUPLAN VERWENDEN","Verwende eine Bauplanaktion oder setze ohne gespeicherten Bauplan fort.","blueprint-actions",E.BLUEPRINT_ACTION,p=>p?.success)
];
const meta=[
  explain("research","FORSCHUNG","Forschung verbraucht Metawährungen und schaltet reguläre Inhalte frei.","research-grid"),
  act("research-buy","FORSCHEN","Kaufe einen verfügbaren Forschungsknoten.","research-grid",E.RESEARCH_PURCHASED),
  explain("prototypes","PROTOTYPEN","Stabilität, Filter und Kapazität bestimmen, welche Funde du langfristig behältst.","prototype-vault"),
  explain("codex","CODEX","Filtere bekannte Signale nach Kategorie, Status, Tag oder Quelle.","codex-filters"),
  act("codex-filter","SIGNAL FILTERN","Ändere einen Codexfilter.","codex-filters",E.CODEX_FILTERED),
  explain("challenges","HERAUSFORDERUNGEN","Challenges öffnen spezialisierte Ausrüstung und belohnen Meisterschaft.","challenge-list"),
  explain("campaigns","KAMPAGNEN","Pfade ordnen Regionen und Regeln neu.","campaign-path-list"),
  explain("salvage","BERGUNG","Wracksignale führen zu Bergungsmissionen mit Stabilitätsrisiko.","salvage-signals"),
  act("simulator","SIMULATOR","Starte eine reproduzierbare Simulation und lies DPS, Trigger und Fehler.","simulator-start",E.SIMULATION_COMPLETED),
  explain("statistics","STATISTIKEN","Lokale Telemetrie fasst Runs, Siege, Kills und Rekorde zusammen.","statistics-summary")
];
const advanced=[
  explain("load","ÜBERLASTUNG","Laststufen verändern Bewegung, Energie und Fehlerdruck.","hud-load"),
  explain("heat","HITZE","Hohe Hitze erhöht Fehlerdruck; Kühlung und Feuerdisziplin stabilisieren den Build.","hud-heat"),
  explain("corruption","KORRUPTION","Korruption öffnet mächtige Regeln und verschärft Risiken.","hud-corruption"),
  explain("faults","SYSTEMFEHLER","Das Fehlerprotokoll zeigt Ursache, Dauer und betroffene Komponente.","fault-log"),
  explain("bosses","BOSSE","Beobachte Schadensfenster und Phasen statt dauerhaft zu feuern.","boss-health"),
  optionalAct("extract","EXTRAKTION","Schließe eine Extraktion ab oder setze fort, wenn kein Extraktionsfenster verfügbar ist.","extraction-options",E.EXTRACTION_COMPLETED),
  optionalAct("summary","ZUSAMMENFASSUNG","Prüfe die Run-Zusammenfassung oder setze ohne beendeten Run fort.","run-summary",E.RUN_SUMMARY_OPENED)
];
const controls=[
  explain("bindings","TASTENBELEGUNG","Dodge und Aktivmodule lassen sich über physische Tastencodes neu belegen.","settings-bindings"),
  act("setting","ANZEIGE ANPASSEN","Ändere UI-Skalierung oder eine Anzeigeoption.","settings-controls",E.SETTING_CHANGED),
  explain("reduced","REDUZIERTE BEWEGUNG","Reduzierte Bewegung deaktiviert intensive Tutorial- und Spieleffekte.","settings-reduced-motion"),
  explain("patterns","ZUSTANDSMUSTER","Muster ergänzen Farben, damit Zustände eindeutig bleiben.","settings-color-patterns"),
  explain("touch","TOUCH","Stick, Ausweichen und Aktivmodule verwenden dieselben Spielregeln wie Tastatur und Maus.","touch-controls")
];
const chapter=(id,title,description,capabilities,steps,availabilityId=null)=>Object.freeze({id,title,description,capabilities:Object.freeze(capabilities),steps:Object.freeze(steps),availabilityId,lockedReason:availabilityId?"Dieses System muss zuerst im Spiel entdeckt werden.":null});
export const TUTORIAL_CHAPTERS=Object.freeze([
  chapter("foundations","Grundlagen-Training","Steuerung, Kampf und Ressourcen",["movement","aim-fire","dodge","active-modules","hud-resources","pause","enemy","reward","evolution"],foundations),
  chapter("run-navigation","Run-Navigation","Sektorkarte, Händler, Werkstatt und Checkpoints",["sector-map","merchant","workshop","checkpoint","anomalies"],navigation,"campaign-map"),
  chapter("ship-and-equipment","Schiff und Ausrüstung","Loadout, Montage, Werkbank und Baupläne",["loadout","ships","weapons","reactors","modules","energy-load","heat","synergies","quick-mount","workbench","blueprints"],assembly,"loadout"),
  chapter("meta-progression","Metafortschritt","Forschung, Codex, Bergung und Simulator",["research","prototypes","codex","challenges","campaign-paths","salvage","simulator","statistics"],meta,"research"),
  chapter("advanced-run","Fortgeschrittener Run","Überlastung, Anomalien, Bosse und Extraktion",["overload","faults","corruption","anomalies","bosses","extraction","summaries"],advanced,"corruption"),
  chapter("controls-accessibility","Bedienung und Barrierefreiheit","Tasten, Touch und Anzeigeoptionen",["bindings","ui-scale","reduced-motion","state-patterns","touch"],controls)
]);
export function validateTutorialChapters(chapters){const issues=[],chapterIds=new Set();for(const chapter of chapters){if(!chapter.id||chapterIds.has(chapter.id))issues.push(`duplicate chapter: ${chapter.id}`);chapterIds.add(chapter.id);const steps=new Set();for(const step of chapter.steps??[]){if(!step.id||steps.has(step.id))issues.push(`duplicate step: ${chapter.id}/${step.id}`);steps.add(step.id);if(!["explanation","action"].includes(step.kind))issues.push(`invalid kind: ${chapter.id}/${step.id}`);if(step.kind==="action"&&!isTutorialEvent(step.event))issues.push(`invalid event: ${chapter.id}/${step.id}`);if(step.target&&!/^[a-z0-9-]+$/.test(step.target))issues.push(`invalid target: ${chapter.id}/${step.id}`);}}return{valid:issues.length===0,issues};}
