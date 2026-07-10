export function canAffordOffer(resources, offer) {
  if (offer.corrupted) return true;
  const balance = offer.currency === "flux" ? resources.flux : resources.scrap;
  return (balance ?? 0) >= offer.price;
}

export function renderMerchantScreen(root, { offers, resources, onBuy, onReroll, onLeave }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen"><header>VOID BROKER <b>${resources.scrap} SCRAP · ${resources.flux} FLUX</b></header><div class="item-catalog"></div><div class="service-screen__actions"><button class="btn small" data-reroll>⟲ Angebote neu würfeln</button><button class="btn small" data-leave>ZURÜCK ZUR KARTE</button></div></section>`;
  const catalog = root.querySelector(".item-catalog");
  for (const offer of offers) {
    const button = document.createElement("button");
    button.className = "item-card";
    button.innerHTML = `<span class="item-card__slot">${offer.corrupted ? "CORRUPTED" : offer.slot ?? "SERVICE"}</span><strong>${offer.name}</strong><small>${offer.description ?? "Einmaliger Sektordienst"}</small><b>${offer.price} ${offer.currency === "flux" ? "F" : "S"}</b>`;
    const affordable = canAffordOffer(resources, offer);
    button.disabled = !affordable;
    if (!affordable) button.setAttribute("aria-label", `${offer.name} – nicht genügend ${offer.currency === "flux" ? "Flux" : "Scrap"}`);
    button.addEventListener("click", () => onBuy(offer));
    catalog.append(button);
  }
  root.querySelector("[data-reroll]").addEventListener("click", onReroll);
  root.querySelector("[data-leave]").addEventListener("click", onLeave);
}
