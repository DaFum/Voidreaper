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
    game.bullets = { get: vi.fn(() => bullet) };
    game.parts = { get: vi.fn(() => particle) };
    game.hash = { query: (x, y, r, buf) => { buf.length = 0; if(game.enemies.length > 0) buf.push(game.enemies[0]); } };
    game.qbuf = [];
    legacyRuntime.configureShotFiredReporter(reportShotFired);

    game.fire(player);

    expect(game.bullets.get).toHaveBeenCalledTimes(3);
    expect(reportShotFired).toHaveBeenCalledOnce();
    expect(reportShotFired).toHaveBeenCalledWith({ shots: 3 });

    game.enemies = [];
    game.fire(player);
    expect(reportShotFired).toHaveBeenCalledOnce();
  });
});
