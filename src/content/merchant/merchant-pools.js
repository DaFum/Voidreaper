export const MERCHANT_SERVICES = Object.freeze([
  { id: "repair", name: "Hull-Reparatur", basePrice: 35, currency: "scrap" },
  { id: "stabilize", name: "Korruption stabilisieren", basePrice: 3, currency: "flux" },
  { id: "reveal", name: "Kartensignatur aufdecken", basePrice: 25, currency: "scrap" },
  { id: "reserve", name: "Angebot reservieren", basePrice: 2, currency: "flux" }
]);

export const CORRUPT_OFFER = Object.freeze({ id: "choir-credit", name: "Kredit des Chors", description: "Kein Preis. +15 Korruption.", corrupted: true, basePrice: 0 });
