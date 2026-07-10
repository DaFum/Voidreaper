export function renderAnomalyScreen(root, { event, onChoose }) {
  if (!root) return;
  root.innerHTML = `<section class="service-screen anomaly"><header>UNKNOWN SIGNATURE <b>RISK EVENT</b></header><h2>${event.name}</h2><p>${event.description}</p><div class="anomaly__choices"></div></section>`;
  const choices = root.querySelector(".anomaly__choices");
  for (const choice of event.choices) {
    const button = document.createElement("button");
    button.className = "item-card";
    button.innerHTML = `<strong>${choice.label}</strong><small><i>KOSTEN</i> ${choice.cost}</small><small><i>BEKANNTE BELOHNUNG</i> ${choice.reward}</small><small><i>MÖGLICHE FOLGE</i> ${choice.unknown}</small>`;
    button.addEventListener("click", () => onChoose(choice.id));
    choices.append(button);
  }
}
