export function createTutorialCallout(step, { onDismiss = () => {}, onSkip = () => {} } = {}) {
  const root = document.createElement("aside"); root.className = "tutorial-callout"; root.innerHTML = `<span>RUN ${step.run}/5 · ONBOARDING</span><h3>${step.title}</h3><p>${step.message}</p><button class="btn small" data-dismiss>Verstanden</button><button class="btn small" data-skip>Onboarding überspringen</button>`;
  root.querySelector("[data-dismiss]").addEventListener("click", onDismiss); root.querySelector("[data-skip]").addEventListener("click", onSkip); return root;
}
