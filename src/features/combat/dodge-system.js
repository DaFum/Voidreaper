export function createDodgeSystem({ eventBus } = {}) {
  return {
    update(player, dt) {
      player.dodge.remaining = Math.max(0, player.dodge.remaining - dt);
      player.dodge.activeRemaining = Math.max(0, player.dodge.activeRemaining - dt);
      player.dodge.invulnerableRemaining = Math.max(0, player.dodge.invulnerableRemaining - dt);
    },
    use(player, axis) {
      if (player.dodge.remaining > 0 || (!axis.x && !axis.y)) return false;
      const flight=player.flightProfile??{};
      player.dodge.remaining = player.dodge.cooldown*(flight.dodgeCooldownMultiplier??1);
      player.dodge.activeRemaining = player.dodge.duration;
      player.dodge.invulnerableRemaining = player.dodge.invulnerability;
      player.vx += axis.x * 620*(flight.dodgeDistanceMultiplier??1);
      player.vy += axis.y * 620*(flight.dodgeDistanceMultiplier??1);
      eventBus?.emit("dodge-used", { player, axis });
      return true;
    },
    canCollide(player, collisionKind = "damage") {
      return collisionKind === "arena" || player.dodge.invulnerableRemaining <= 0;
    },
    ratio(player) {
      return player.dodge.cooldown > 0 ? 1 - player.dodge.remaining / player.dodge.cooldown : 1;
    }
  };
}
