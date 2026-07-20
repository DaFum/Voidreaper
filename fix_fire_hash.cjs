const fs = require('fs');

let code = fs.readFileSync('src/legacy/legacy-runtime.js', 'utf8');

// The CI feedback indicates `this.fire(p)` is called BEFORE the hash is rebuilt for the frame!
// "Because step() calls this.fire(p) before the spatial hash is rebuilt (the fire branch runs before the hash.clear()/insert pass), iterating this.qbuf here uses the previous frame's hash... "
// I will move `this.hash.clear(); for (const e of this.enemies) this.hash.insert(e);` to be right before `p.fireT -= dt;`.

code = code.replace(
  /p\.fireT -= dt;\s*if \(p\.fireT <= 0 && this\.enemies\.length\) \{ p\.fireT = p\.fireRate \* rateMul; this\.fire\(p\); \}\s*if \(p\.nova > 0\) \{\s*p\.novaT -= dt;\s*if \(p\.novaT <= 0\) \{ p\.novaT = p\.novaCd; this\.novaBlast\(p\); \}\s*\}\s*p\.orbA \+= dt \* 3\.1;\s*this\.hash\.clear\(\);\s*for \(const e of this\.enemies\) this\.hash\.insert\(e\);/,
  `this.hash.clear();
        for (const e of this.enemies) this.hash.insert(e);

        p.fireT -= dt;
        if (p.fireT <= 0 && this.enemies.length) { p.fireT = p.fireRate * rateMul; this.fire(p); }

        if (p.nova > 0) {
          p.novaT -= dt;
          if (p.novaT <= 0) { p.novaT = p.novaCd; this.novaBlast(p); }
        }
        p.orbA += dt * 3.1;`
);

fs.writeFileSync('src/legacy/legacy-runtime.js', code);
console.log("Updated fire() hash rebuild order");
