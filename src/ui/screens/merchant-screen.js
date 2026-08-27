import { escapeHtml } from "../escape-html.js";
export function canAffordOffer(resources, offer) {
  if (offer.corrupted) return true;
  const balance = offer.currency === "flux" ? resources.flux : resources.scrap;
  return (balance ?? 0) >= offer.price;
}

export function renderMerchantScreen(root, { offers, resources, onBuy, onReroll, onLeave }) {
  if (!root) return;
  const canReroll = (resources.scrap ?? 0) >= 5;
  const rerollDisabled = !canReroll ? ' disabled' : '';
  const rerollAriaTitle = !canReroll ? ' aria-label="Angebote neu würfeln – nicht genügend Scrap" title="Angebote neu würfeln – nicht genügend Scrap"' : '';
  const rerollReason = !canReroll ? ' <small aria-hidden="true">(nicht genügend Scrap)</small>' : '';
  root.innerHTML = `<section class="service-screen"><header>VOID BROKER <b>${escapeHtml(resources.scrap)} SCRAP · ${escapeHtml(resources.flux)} FLUX</b></header><div class="item-catalog" data-tutorial-id="merchant-offers"></div><div class="service-screen__actions"><button type="button" class="btn small" data-reroll${rerollDisabled}${rerollAriaTitle}>⟲ Angebote neu würfeln (5 S)${rerollReason}</button><button type="button" class="btn small" data-leave>ZURÜCK ZUR KARTE</button></div></section>`;
  const catalog = root.querySelector(".item-catalog");
  for (const offer of offers) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-card";
    button.innerHTML = `<span class="item-card__slot">${offer.corrupted ? "CORRUPTED" : escapeHtml(offer.slot ?? "SERVICE")}</span><strong>${escapeHtml(offer.name)}</strong><small>${escapeHtml(offer.description ?? "Einmaliger Sektordienst")}</small><b>${escapeHtml(offer.price)} ${offer.currency === "flux" ? "F" : "S"}</b>`;
    const affordable = canAffordOffer(resources, offer);
    button.disabled = !affordable;
    if (!affordable) {
      button.setAttribute("aria-label", `${offer.name} – nicht genügend ${offer.currency === "flux" ? "Flux" : "Scrap"}`);
      button.title = `${offer.name} – nicht genügend ${offer.currency === "flux" ? "Flux" : "Scrap"}`;
    }
    button.addEventListener("click", () => onBuy(offer));
    catalog.append(button);
  }
  root.querySelector("[data-reroll]").addEventListener("click", onReroll);
  root.querySelector("[data-leave]").addEventListener("click", onLeave);
}
