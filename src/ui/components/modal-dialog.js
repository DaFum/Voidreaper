import { escapeHtml } from "../escape-html.js";

function openModal({ title, message, input = null, confirmLabel, cancelLabel }) {
  return new Promise(resolve => {
    const opener = document.activeElement;
    const host = document.createElement("div");
    const dialog = document.createElement("dialog");
    dialog.className = "vr-modal";
    dialog.innerHTML = `<header><small>${escapeHtml(title)}</small></header><p data-role="message"></p>${input === null ? "" : '<input data-role="input" type="text" spellcheck="false">'}<footer><button type="button" data-action="cancel">${escapeHtml(cancelLabel)}</button><button type="button" data-action="confirm">${escapeHtml(confirmLabel)}</button></footer>`;
    dialog.querySelector('[data-role="message"]').textContent = message;
    const field = dialog.querySelector('[data-role="input"]');
    if (field) field.value = input;
    let settled = false;
    const settle = value => {
      if (settled) return;
      settled = true;
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      host.remove();
      if (opener?.isConnected) opener.focus?.();
      resolve(value);
    };
    dialog.querySelector('[data-action="cancel"]').addEventListener("click", () => settle(null));
    dialog.querySelector('[data-action="confirm"]').addEventListener("click", () => settle(field ? field.value : true));
    // Escape and other out-of-band closes count as cancel.
    dialog.addEventListener("close", () => settle(null));
    dialog.addEventListener("cancel", () => settle(null));
    field?.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); settle(field.value); } });
    host.append(dialog);
    document.body.append(host);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    const focusTarget = field ?? dialog.querySelector('[data-action="confirm"]');
    focusTarget.focus?.();
    field?.select?.();
  });
}

export function uiConfirm(message, { title = "BESTÄTIGUNG", confirmLabel = "AUSFÜHREN", cancelLabel = "ABBRECHEN" } = {}) {
  return openModal({ title, message, confirmLabel, cancelLabel }).then(value => value === true);
}

export function uiPrompt(message, defaultValue = "", { title = "EINGABE", confirmLabel = "ÜBERNEHMEN", cancelLabel = "ABBRECHEN" } = {}) {
  return openModal({ title, message, input: defaultValue ?? "", confirmLabel, cancelLabel });
}
