import { afterEach, describe, expect, test, vi } from "vitest";
import { legacyRuntime } from "../../src/legacy/legacy-runtime.js";

describe("legacy runtime combat reporting", () => {
  afterEach(() => legacyRuntime.configureShotFiredReporter(null));

  test("reports each valid firing action once, including volleys", () => {
    const game = legacyRuntime.game;
    const reportShotFired = vi.fn();
    const player = { x: 0, y: 0, shots: 3, bulletSpeed: 500, dmgMul: 1, pierce: 0, evoPrism: false };
    const bullet = {};
    const particle = {};
    game.enemies = [{ x: 10, y: 0, birth: 0 }];
    game.qbuf = [...game.enemies];
    game.hash = { query: vi.fn() };
    game.bullets = { get: vi.fn(() => bullet) };
    game.parts = { get: vi.fn(() => particle) };
    legacyRuntime.configureShotFiredReporter(reportShotFired);

    game.fire(player);

    expect(game.bullets.get).toHaveBeenCalledTimes(3);
    expect(reportShotFired).toHaveBeenCalledOnce();
    expect(reportShotFired).toHaveBeenCalledWith({ shots: 3 });

    game.enemies = [];
    game.qbuf = [];
    game.fire(player);
    expect(reportShotFired).toHaveBeenCalledOnce();
  });
});
