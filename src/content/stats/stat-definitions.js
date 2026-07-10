const stat = (id, name, baseValue, minimum = 0, maximum = Infinity, displayFormat = "number") => ({
  id, name, displayName: name, category: "combat", baseValue, minimum, maximum, rounding: "none", displayFormat, stackingRule: "ordered"
});

export const STAT_DEFINITIONS = Object.freeze([
  stat("max-hull", "Hull", 100, 1, 9999, "integer"),
  stat("move-speed", "Geschwindigkeit", 190, 40, 600, "integer"),
  stat("damage-multiplier", "Schaden", 1, 0.1, 20, "multiplier"),
  stat("fire-rate", "Feuerrate", 1, 0.1, 20, "per-second"),
  stat("projectile-speed", "Projektiltempo", 1, 0.2, 8, "multiplier"),
  stat("crit-chance", "Krit-Chance", 0.05, 0, 2, "percent"),
  stat("crit-multiplier", "Krit-Multiplikator", 2, 1, 8, "multiplier"),
  stat("pierce", "Durchschlag", 0, 0, 99, "integer"),
  stat("pickup-radius", "Magnetradius", 90, 20, 1000, "integer"),
  stat("regeneration", "Regeneration", 0, 0, 100, "per-second"),
  stat("energy-capacity", "Energiekapazität", 100, 1, 1000, "integer"),
  stat("energy-regeneration", "Energierückgewinnung", 12, 0, 200, "per-second"),
  stat("heat-generation", "Hitzeerzeugung", 1, 0, 10, "multiplier"),
  stat("cooling-rate", "Kühlung", 10, 0, 200, "per-second"),
  stat("corruption-gain", "Korruptionsgewinn", 1, 0, 10, "multiplier"),
  stat("dodge-cooldown", "Ausweich-Cooldown", 1.2, 0.25, 8, "seconds"),
  stat("fault-resistance", "Fehlerresistenz", 0, 0, 0.9, "percent")
]);
