import { escapeHtml } from "../escape-html.js";
import { animate, animateListStagger, animatePressFeedback, MOTION_TIMINGS, MOTION_EASINGS } from "../motion/motion.js";
import { isReducedMotion } from "../motion/reduced-motion.js";

export function canAffordOffer(resources, offer) {
  if (offer.corrupted) return true;
  const balance = offer.currency === "flux" ? resources.flux : resources.scrap;
  return (balance ?? 0) >= offer.price;
}

export function renderMerchantScreen(
  root,
  {
    offers,
    resources,
    canReroll = true,
    rerollCost = { scrap: 5 },
    onBuy,
    onReroll,
    onLeave,
  },
) {
  if (!root) return;
  const rerollDisabled = !canReroll ? " disabled" : "";
  const costLabel = rerollCost.scrap
    ? `${rerollCost.scrap} S`
    : rerollCost.flux
      ? `${rerollCost.flux} F`
      : "Kostenlos";
  const shortCurrency = rerollCost.scrap
    ? "Scrap"
    : rerollCost.flux
      ? "Flux"
      : "";
  const rerollAriaTitle = !canReroll
    ? ` aria-label="Angebote neu würfeln (${costLabel}) – nicht genügend ${shortCurrency}" title="Angebote neu würfeln (${costLabel}) – nicht genügend ${shortCurrency}"`
    : ` aria-label="Angebote neu würfeln (${costLabel})"`;
  const rerollReason = !canReroll
    ? ` <small aria-hidden="true">(nicht genügend ${shortCurrency})</small>`
    : "";
  root.innerHTML = `<section class="service-screen"><header>VOID BROKER <b>${escapeHtml(resources.scrap)} SCRAP · ${escapeHtml(resources.flux)} FLUX</b></header><div class="item-catalog" data-tutorial-id="merchant-offers"></div><div class="service-screen__actions"><button type="button" class="btn small" data-reroll${rerollDisabled}${rerollAriaTitle}>⟲ Angebote neu würfeln (${costLabel})${rerollReason}</button><button type="button" class="btn small" data-leave>ZURÜCK ZUR KARTE</button></div></section>`;
  const catalog = root.querySelector(".item-catalog");
  for (const offer of offers) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-card";
    button.innerHTML = `<span class="item-card__slot">${offer.corrupted ? "CORRUPTED" : escapeHtml(offer.slot ?? "SERVICE")}</span><strong>${escapeHtml(offer.name)}</strong><small>${escapeHtml(offer.description ?? "Einmaliger Sektordienst")}</small><b>${escapeHtml(offer.price)} ${offer.currency === "flux" ? "F" : "S"}</b>`;
    const affordable = canAffordOffer(resources, offer);
    button.disabled = !affordable;
    if (!affordable) {
      button.setAttribute(
        "aria-label",
        `${offer.name} – nicht genügend ${offer.currency === "flux" ? "Flux" : "Scrap"}`,
      );
      button.title = `${offer.name} – nicht genügend ${offer.currency === "flux" ? "Flux" : "Scrap"}`;
    }
    button.addEventListener("click", () => {
      animatePressFeedback(button);
      onBuy(offer);
    });
    catalog.append(button);
  }

  if (catalog.children.length > 0) {
    animateListStagger(catalog.children, { staggerDelay: 0.04, yOffset: 8 });
  }

  const rerollBtn = root.querySelector("[data-reroll]");
  const leaveBtn = root.querySelector("[data-leave]");
  let rerolling = false;
  let rerollCancelled = false;

  rerollBtn.addEventListener("click", (e) => {
    if (rerolling) return;
    rerolling = true;
    rerollBtn.disabled = true;
    for (const card of catalog.children) card.disabled = true;
    animatePressFeedback(rerollBtn);
    const oldCards = Array.from(catalog.children);
    if (!isReducedMotion() && oldCards.length > 0 && typeof oldCards[0].animate === "function") {
      const anims = oldCards.map((card) => {
        const anim = animate(
          card,
          { opacity: [1, 0], transform: ["translateY(0px)", "translateY(-8px)"] },
          { duration: MOTION_TIMINGS.fast, ease: MOTION_EASINGS.exit }
        );
        return anim?.finished ? anim.finished.catch(() => {}) : Promise.resolve();
      });
      Promise.all(anims)
        .then(() => {
          if (!rerollCancelled) {
            onReroll(e);
          }
        })
        .catch(() => {});
    } else {
      if (!rerollCancelled) {
        onReroll(e);
      }
    }
  });

  leaveBtn.addEventListener("click", (e) => {
    rerollCancelled = true;
    animatePressFeedback(leaveBtn);
    onLeave(e);
  });
}
