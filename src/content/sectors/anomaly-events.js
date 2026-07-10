import { changeRunCorruption } from "../../features/corruption/run-corruption.js";
import { addRunHeat } from "../../features/heat/run-heat.js";

const choice = (id, label, cost, reward, unknown, apply) => ({ id, label, cost, reward, unknown, apply });
const event = (id, name, description, choices) => ({ id, name, description, choices });

export const ANOMALY_EVENTS = Object.freeze([
  event("choir-answers", "The Choir Answers", "Eine Antwort wartet hinter dem Rauschen.", [choice("listen", "Zuhören", "+12 Korruption", "+3 Flux", "Der Chor merkt sich dich", run => { changeRunCorruption(run, 12, "anomaly-choir-answers"); run.resources.flux += 3; }), choice("silence", "Signal löschen", "20 Scrap", "Korruption -5", "Keine", run => { run.resources.scrap -= 20; changeRunCorruption(run, -5, "anomaly-choir-silence"); })]),
  event("cold-forge", "Cold Forge", "Eine Werkstatt arbeitet ohne Besatzung.", [choice("temper", "Prototyp härten", "+8 Hitze", "+10 Item Power", "Affix kann brechen", run => { addRunHeat(run, 8, "anomaly-cold-forge"); }), choice("drain", "Kühlmittel bergen", "Keine", "+25 Scrap", "Forge erlischt", run => { run.resources.scrap += 25; })]),
  event("dead-pilot", "Dead Pilot", "Der Flugschreiber sendet noch.", [choice("recover", "Log bergen", "+5 Korruption", "Karte aufdecken", "Unbekannter Verfolger", run => { changeRunCorruption(run, 5, "anomaly-dead-pilot"); }), choice("salute", "Weiterziehen", "Keine", "+5 Hull", "Keine", run => { run.player.hull = Math.min(run.player.maxHull, run.player.hull + 5); })]),
  event("mirror-tax", "Mirror Tax", "Dein Spiegelbild verlangt einen Teil des Builds.", [choice("pay", "Affix opfern", "1 Affix", "+5 Flux", "Spiegelkopie im Bosskampf", run => { run.resources.flux += 5; }), choice("break", "Spiegel brechen", "+15 Korruption", "+40 Scrap", "Scherben folgen", run => { changeRunCorruption(run, 15, "anomaly-mirror-tax"); run.resources.scrap += 40; })]),
  ...[
    ["silent-orbit", "Silent Orbit"], ["rust-prayer", "Rust Prayer"], ["gravity-debt", "Gravity Debt"], ["hollow-sun", "Hollow Sun"],
    ["borrowed-time", "Borrowed Time"], ["black-vault", "Black Vault"], ["echo-market", "Echo Market"], ["sleeping-gun", "Sleeping Gun"],
    ["red-lattice", "Red Lattice"], ["last-beacon", "Last Beacon"], ["fracture-garden", "Fracture Garden"], ["architects-draft", "Architect's Draft"]
  ].map(([id, name], index) => event(id, name, "Ein instabiles Signal bietet einen klaren Preis und eine unklare Konsequenz.", [
    choice("accept", "Annehmen", `+${5 + index} Korruption`, `+${15 + index * 2} Scrap`, "Eine spätere Begegnung verändert sich", run => { changeRunCorruption(run, 5 + index, `anomaly-${id}`); run.resources.scrap += 15 + index * 2; }),
    choice("decline", "Ignorieren", "Keine", "+1 Stabilität", "Signal bleibt im Codex", () => {})
  ]))
]);
