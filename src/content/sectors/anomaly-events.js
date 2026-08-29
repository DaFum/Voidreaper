import { changeRunCorruption } from "../../features/corruption/run-corruption.js";
import { addRunHeat } from "../../features/heat/run-heat.js";

const choice = ({ id, label, cost, reward, unknown, apply }) => ({
  id,
  label,
  cost,
  reward,
  unknown,
  apply,
});
const event = (id, name, description, choices) => ({
  id,
  name,
  description,
  choices,
});

export const ANOMALY_EVENTS = Object.freeze([
  event(
    "choir-answers",
    "The Choir Answers",
    "Eine Antwort wartet hinter dem Rauschen.",
    [
      choice({
        id: "listen",
        label: "Zuhören",
        cost: "+12 Korruption",
        reward: "+3 Flux",
        unknown: "Der Chor merkt sich dich",
        apply: (run) => {
          changeRunCorruption(run, 12, "anomaly-choir-answers");
          run.resources.flux += 3;
        },
      }),
      choice({
        id: "silence",
        label: "Signal löschen",
        cost: "20 Scrap",
        reward: "Korruption -5",
        unknown: "Keine",
        apply: (run) => {
          run.resources.scrap -= 20;
          changeRunCorruption(run, -5, "anomaly-choir-silence");
        },
      }),
    ],
  ),
  event("cold-forge", "Cold Forge", "Eine Werkstatt arbeitet ohne Besatzung.", [
    choice({
      id: "temper",
      label: "Prototyp härten",
      cost: "+8 Hitze",
      reward: "+10 Item Power",
      unknown: "Affix kann brechen",
      apply: (run) => {
        addRunHeat(run, 8, "anomaly-cold-forge");
      },
    }),
    choice({
      id: "drain",
      label: "Kühlmittel bergen",
      cost: "Keine",
      reward: "+25 Scrap",
      unknown: "Forge erlischt",
      apply: (run) => {
        run.resources.scrap += 25;
      },
    }),
  ]),
  event("dead-pilot", "Dead Pilot", "Der Flugschreiber sendet noch.", [
    choice({
      id: "recover",
      label: "Log bergen",
      cost: "+5 Korruption",
      reward: "Karte aufdecken",
      unknown: "Unbekannter Verfolger",
      apply: (run) => {
        changeRunCorruption(run, 5, "anomaly-dead-pilot");
      },
    }),
    choice({
      id: "salute",
      label: "Weiterziehen",
      cost: "Keine",
      reward: "+5 Hull",
      unknown: "Keine",
      apply: (run) => {
        run.player.hull = Math.min(run.player.maxHull, run.player.hull + 5);
      },
    }),
  ]),
  event(
    "mirror-tax",
    "Mirror Tax",
    "Dein Spiegelbild verlangt einen Teil des Builds.",
    [
      choice({
        id: "pay",
        label: "Affix opfern",
        cost: "1 Affix",
        reward: "+5 Flux",
        unknown: "Spiegelkopie im Bosskampf",
        apply: (run) => {
          run.resources.flux += 5;
        },
      }),
      choice({
        id: "break",
        label: "Spiegel brechen",
        cost: "+15 Korruption",
        reward: "+40 Scrap",
        unknown: "Scherben folgen",
        apply: (run) => {
          changeRunCorruption(run, 15, "anomaly-mirror-tax");
          run.resources.scrap += 40;
        },
      }),
    ],
  ),
  ...[
    ["silent-orbit", "Silent Orbit"],
    ["rust-prayer", "Rust Prayer"],
    ["gravity-debt", "Gravity Debt"],
    ["hollow-sun", "Hollow Sun"],
    ["borrowed-time", "Borrowed Time"],
    ["black-vault", "Black Vault"],
    ["echo-market", "Echo Market"],
    ["sleeping-gun", "Sleeping Gun"],
    ["red-lattice", "Red Lattice"],
    ["last-beacon", "Last Beacon"],
    ["fracture-garden", "Fracture Garden"],
    ["architects-draft", "Architect's Draft"],
  ].map(([id, name], index) =>
    event(
      id,
      name,
      "Ein instabiles Signal bietet einen klaren Preis und eine unklare Konsequenz.",
      [
        choice({
          id: "accept",
          label: "Annehmen",
          cost: `+${5 + index} Korruption`,
          reward: `+${15 + index * 2} Scrap`,
          unknown: "Eine spätere Begegnung verändert sich",
          apply: (run) => {
            changeRunCorruption(run, 5 + index, `anomaly-${id}`);
            run.resources.scrap += 15 + index * 2;
          },
        }),
        choice({
          id: "decline",
          label: "Ignorieren",
          cost: "Keine",
          reward: "+1 Stabilität",
          unknown: "Signal bleibt im Codex",
          apply: () => {},
        }),
      ],
    ),
  ),
]);
