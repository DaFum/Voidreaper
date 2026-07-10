import { DIFFICULTY_PROFILES } from "../../content/difficulty/difficulty-profiles.js";

export function createDifficultySelector({ value = "standard", onChange = () => {} } = {}) {
  const root = document.createElement("div");
  root.className = "difficulty-selector";
  for (const profile of DIFFICULTY_PROFILES) {
    const button = document.createElement("button");
    button.type = "button"; button.className = "btn small"; button.textContent = profile.name; button.setAttribute("aria-pressed", String(profile.id === value));
    button.addEventListener("click", () => { value = profile.id; for (const sibling of root.children) sibling.setAttribute("aria-pressed", "false"); button.setAttribute("aria-pressed", "true"); onChange(profile); });
    root.append(button);
  }
  return root;
}
