import { describe, expect, test } from "vitest";
import { uiConfirm, uiPrompt } from "../../src/ui/components/modal-dialog.js";

const modal = () => document.querySelector("dialog.vr-modal");

describe("modal dialog", () => {
  test("restores focus to the opener after close", async () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const result = uiConfirm("Löschen?");

    modal().querySelector('[data-action="cancel"]').click();
    await result;

    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  test("uiConfirm resolves true on confirm and cleans up", async () => {
    const result = uiConfirm("Endgültig ausführen?", { title: "COLD FORGE" });
    expect(modal().textContent).toContain("Endgültig ausführen?");
    expect(modal().textContent).toContain("COLD FORGE");
    modal().querySelector('[data-action="confirm"]').click();
    await expect(result).resolves.toBe(true);
    expect(modal()).toBeNull();
  });

  test("uiConfirm resolves false on cancel", async () => {
    const result = uiConfirm("Löschen?");
    modal().querySelector('[data-action="cancel"]').click();
    await expect(result).resolves.toBe(false);
    expect(modal()).toBeNull();
  });

  test("uiPrompt returns the edited value", async () => {
    const result = uiPrompt("Neuer Name", "Alt");
    const field = modal().querySelector('[data-role="input"]');
    expect(field.value).toBe("Alt");
    field.value = "Neu";
    modal().querySelector('[data-action="confirm"]').click();
    await expect(result).resolves.toBe("Neu");
  });

  test("uiPrompt renders an input even for a nullish default value", async () => {
    const result = uiPrompt("Neuer Name", null);
    const field = modal().querySelector('[data-role="input"]');
    expect(field).not.toBeNull();
    expect(field.value).toBe("");
    modal().querySelector('[data-action="cancel"]').click();
    await result;
  });

  test("uiPrompt returns null on cancel", async () => {
    const result = uiPrompt("Neuer Name", "Alt");
    modal().querySelector('[data-action="cancel"]').click();
    await expect(result).resolves.toBeNull();
  });

  test("escapes markup in labels and keeps message as text", async () => {
    const result = uiConfirm("<b>bold</b>", { title: "<i>x</i>" });
    expect(modal().querySelector("b")).toBeNull();
    expect(modal().querySelector("i")).toBeNull();
    modal().querySelector('[data-action="cancel"]').click();
    await result;
  });
});
