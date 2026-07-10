export function renderMerchantScreen(root, { offers, resources, onBuy, onReroll }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen"><header>VOID BROKER <b>${resources.scrap} SCRAP · ${resources.flux} FLUX</b></header><div class="item-catalog"></div><button class="btn small" data-reroll>⟲ Angebote neu würfeln</button></section>`;
  const catalog = root.querySelector(".item-catalog");
  for (const offer of offers) {
    const button = document.createElement("button");
    button.className = "item-card";
    button.innerHTML = `<span class="item-card__slot">${offer.corrupted ? "CORRUPTED" : offer.slot ?? "SERVICE"}</span><strong>${offer.name}</strong><small>${offer.description ?? "Einmaliger Sektordienst"}</small><b>${offer.price} ${offer.currency === "flux" ? "F" : "S"}</b>`;
    button.addEventListener("click", () => onBuy(offer));
    catalog.append(button);
  }
  root.querySelector("[data-reroll]").addEventListener("click", onReroll);
}
