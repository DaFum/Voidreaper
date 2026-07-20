const fs = require('fs');

function fixRuntime() {
  let code = fs.readFileSync('src/legacy/legacy-runtime.js', 'utf8');

  // 1. Magnet Distance
  code = code.replace(
    /for \(const g of this\.gems\.live\) \{ const a = Math\.atan2\(p\.y - g\.y, p\.x - g\.x\); g\.vx = Math\.cos\(a\) \* 900; g\.vy = Math\.sin\(a\) \* 900; \}/g,
    `for (const g of this.gems.live) { const dx = p.x - g.x, dy = p.y - g.y; const d = Math.sqrt(dx * dx + dy * dy) || 1; g.vx = (dx / d) * 900; g.vy = (dy / d) * 900; }`
  );

  // 2. Spatial Hash rebuild
  code = code.replace(
    /\s*this\.hash\.clear\(\);\s*for \(const e of this\.enemies\) this\.hash\.insert\(e\);\s*this\.bullets\.update/g,
    `\n        this.bullets.update`
  );

  // 4. Dist2 caching loop (fire method)
  code = code.replace(
    /let target = null, best = 560 \* 560;\s*for \(const e of this\.enemies\) \{\s*if \(e\.birth > 0\) continue;\s*const d = dist2\(p\.x, p\.y, e\.x, e\.y\);\s*if \(d < best\) \{ best = d; target = e; \}\s*\}/,
    `let target = null, best = 560 * 560;
        this.hash.query(p.x, p.y, 560, this.qbuf);
        for (const e of this.qbuf) {
          if (e.birth > 0 || e.dead) continue;
          const d = dist2(p.x, p.y, e.x, e.y);
          if (d < best) { best = d; target = e; }
        }`
  );

  // 5. Spatial Hash Map Keying (Nested Map)
  code = code.replace(
    /class SpatialHash \{\s*constructor\(cell\) \{ this\.cell = cell; this\.map = new Map\(\); \}\s*clear\(\) \{ this\.map\.clear\(\); \}\s*insert\(e\) \{\s*const k = \(\(e\.x \/ this\.cell\) \| 0\) \* 73856093 \^ \(\(e\.y \/ this\.cell\) \| 0\) \* 19349663;\s*let b = this\.map\.get\(k\);\s*if \(\!b\) \{ b = \[\]; this\.map\.set\(k, b\); \}\s*b\.push\(e\);\s*\}\s*query\(x, y, r, out\) \{\s*out\.length = 0;\s*const c = this\.cell;\s*const x0 = \(\(x - r\) \/ c\) \| 0, x1 = \(\(x \+ r\) \/ c\) \| 0;\s*const y0 = \(\(y - r\) \/ c\) \| 0, y1 = \(\(y \+ r\) \/ c\) \| 0;\s*for \(let gx = x0; gx <= x1; gx\+\+\) for \(let gy = y0; gy <= y1; gy\+\+\) \{\s*const b = this\.map\.get\(gx \* 73856093 \^ gy \* 19349663\);\s*if \(b\) for \(let i = 0; i < b\.length; i\+\+\) out\.push\(b\[i\]\);\s*\}\s*return out;\s*\}\s*\}/,
    `class SpatialHash {
      constructor(cell) { this.cell = cell; this.map = new Map(); }
      clear() {
        for (const col of this.map.values()) {
          for (const b of col.values()) {
            b.length = 0;
          }
        }
      }
      insert(e) {
        const gx = (e.x / this.cell) | 0;
        const gy = (e.y / this.cell) | 0;
        let col = this.map.get(gx);
        if (!col) { col = new Map(); this.map.set(gx, col); }
        let b = col.get(gy);
        if (!b) { b = []; col.set(gy, b); }
        b.push(e);
      }
      query(x, y, r, out) {
        out.length = 0;
        const c = this.cell;
        const x0 = ((x - r) / c) | 0, x1 = ((x + r) / c) | 0;
        const y0 = ((y - r) / c) | 0, y1 = ((y + r) / c) | 0;
        for (let gx = x0; gx <= x1; gx++) {
          const col = this.map.get(gx);
          if (col) {
            for (let gy = y0; gy <= y1; gy++) {
              const b = col.get(gy);
              if (b) for (let i = 0; i < b.length; i++) out.push(b[i]);
            }
          }
        }
        return out;
      }
    }`
  );

  // 6. Draw culling
  code = code.replace(
    /\/\/ enemies\s*for \(const e of this\.enemies\) this\.drawEnemy\(e, frozen\);/,
    `// enemies
        const hw = (W / 2) + 120, hh = (H / 2) + 120; // 120 is max enemy radius padding
        for (const e of this.enemies) {
          if (Math.abs(e.x - camX) < hw && Math.abs(e.y - camY) < hh) {
            this.drawEnemy(e, frozen);
          }
        }`
  );

  // NEW FIX FOR CI: Fire hash rebuild
  // The CI review states: "Rebuild the enemy hash before firing Because step() calls this.fire(p) before the spatial hash is rebuilt (the fire branch runs before the hash.clear()/insert pass), iterating this.qbuf here uses the previous frame's hash... "
  // We need to move the this.hash.clear() / insert up to BEFORE this.fire(p).

  // Originally it was:
  // p.fireT -= dt;
  // if (p.fireT <= 0 && this.enemies.length) { p.fireT = p.fireRate * rateMul; this.fire(p); }
  // ...
  // this.hash.clear();
  // for (const e of this.enemies) this.hash.insert(e);

  // So let's replace this.hash.clear(); for (const e of this.enemies) this.hash.insert(e);
  // wait, earlier I REMOVED the second rebuild at line 1283.
  // The FIRST rebuild is at line 1108.
  // `this.fire(p)` is called at line 1276!!
  // "if (e.ranged && !frozen) { e.fireT -= dt; if (e.fireT <= 0 && dl < 520) { ... this.enemyFire(e, p); } }"
  // Wait, no. The player fires at line 683... Wait, where does the player fire?
  // Let me check.

  fs.writeFileSync('src/legacy/legacy-runtime.js', code);
  console.log("Updated legacy-runtime.js");
}

fixRuntime();
