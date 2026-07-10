
    "use strict";
    /* =====================================================================
       VOIDREAPER: ETERNAL REDUX — full art & feel overhaul
       New rendering stack: pre-baked nebula layer + twinkling parallax
       starfield + hexagonal arena floor, enemy spawn telegraphs and
       scale-in births, velocity-stretched bullet trails, redesigned
       multi-part ship with live thruster flame, cinematic in-world wave
       titles, killstreak callouts, ghosted HP damage bar, low-HP
       heartbeat, rarity-staged upgrade cards, animated hangar pips.
       Gameplay: meta-progression, 5 evolutions, 11 enemy types + elites,
       3 rotating bosses, world events, pickups, combo, daily seed.
       ===================================================================== */

    /* ---------- utilities ---------- */
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const lerp = (a, b, t) => a + (b - a) * t;
    const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
    const fmtTime = s => `${String((s / 60) | 0).padStart(2, "0")}:${String((s | 0) % 60).padStart(2, "0")}`;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function mulberry32(seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    const todayKey = () => new Date().toISOString().slice(0, 10);

    /* ---------- persistence ---------- */
    const Persist = {
      data: { best: 0, dailyBest: {}, shards: 0, meta: {}, ach: [], totalKills: 0, totalRuns: 0 },
      async load() {
        try {
          if (window.storage) {
            const r = await window.storage.get("voidreaper-eternal");
            if (r && r.value) Object.assign(this.data, JSON.parse(r.value));
          }
        } catch (_) { }
      },
      async save() {
        try { if (window.storage) await window.storage.set("voidreaper-eternal", JSON.stringify(this.data)); } catch (_) { }
      }
    };

    /* ---------- procedural audio ---------- */
    const AudioSys = {
      ctx: null, master: null, unlocked: false,
      unlock() {
        if (this.unlocked) return;
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AC();
          this.master = this.ctx.createGain(); this.master.gain.value = 0.5;
          this.master.connect(this.ctx.destination);
          this.unlocked = true; this.startDrone();
        } catch (_) { }
      },
      resume() { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); },
      startDrone() {
        const g = this.ctx.createGain(); g.gain.value = 0.05; g.connect(this.master);
        const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 220; f.connect(g);
        [55, 55.7, 110.4].forEach(fr => { const o = this.ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr; o.connect(f); o.start(); });
        const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.07;
        const lg = this.ctx.createGain(); lg.gain.value = 90;
        lfo.connect(lg); lg.connect(f.frequency); lfo.start();
      },
      blip(freq, dur, type, vol, slide) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(freq, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
      },
      noise(dur, vol, freq) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime, sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, Math.max(1, sr * dur | 0), sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = this.ctx.createBufferSource(); src.buffer = buf;
        const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 0.8;
        const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f); f.connect(g); g.connect(this.master); src.start(t);
      },
      shoot() { this.blip(880 + Math.random() * 100, 0.07, "square", 0.05, 240); },
      laser() { this.blip(1400, 0.12, "sawtooth", 0.06, 300); },
      hit() { this.noise(0.07, 0.1, 1400); },
      kill() { this.noise(0.2, 0.18, 500); this.blip(160, 0.16, "sawtooth", 0.09, 40); },
      hurt() { this.blip(200, 0.25, "sawtooth", 0.22, 60); this.noise(0.2, 0.18, 300); },
      gem() { this.blip(1200 + Math.random() * 300, 0.1, "sine", 0.08, 2000); },
      shard() { this.blip(1800, 0.2, "triangle", 0.1, 2600); },
      pickup() { [700, 1050, 1400].forEach((f, i) => setTimeout(() => this.blip(f, 0.14, "triangle", 0.12), i * 60)); },
      freeze() { this.blip(2200, 0.7, "sine", 0.14, 400); this.noise(0.5, 0.08, 3000); },
      bomb() { this.noise(0.6, 0.3, 250); this.blip(70, 0.6, "sawtooth", 0.22, 25); },
      levelup() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.25, "triangle", 0.14), i * 90)); },
      evolve() { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.blip(f, 0.3, "triangle", 0.15), i * 80)); this.noise(0.8, 0.1, 900); },
      streak() { [880, 1174, 1568].forEach((f, i) => setTimeout(() => this.blip(f, 0.16, "square", 0.1), i * 55)); },
      event() { this.blip(330, 0.5, "square", 0.1, 660); },
      boss() { this.blip(80, 1.2, "sawtooth", 0.25, 30); this.noise(0.8, 0.15, 200); },
      combo(n) { this.blip(600 + n * 120, 0.08, "square", 0.07, 900 + n * 150); },
      gameover() { [400, 300, 200, 100].forEach((f, i) => setTimeout(() => this.blip(f, 0.5, "sawtooth", 0.18, f * 0.5), i * 180)); }
    };

    /* ---------- canvas ---------- */
    const cv = document.getElementById("game");
    const cx = cv.getContext("2d");
    let W = 0, H = 0, DPR = 1;
    function resize() {
      DPR = clamp(window.devicePixelRatio || 1, 1, 2.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = (W * DPR) | 0; cv.height = (H * DPR) | 0;
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    /* ---------- pre-baked nebula layer (drawn twice with slow drift) ---------- */
    const Nebula = {
      canvas: null,
      bake(rng) {
        const S = 900;
        const c = document.createElement("canvas");
        c.width = S; c.height = S;
        const n = c.getContext("2d");
        const blobs = [
          ["rgba(67,24,184,", 5], ["rgba(199,125,255,", 3],
          ["rgba(255,45,120,", 2], ["rgba(76,201,240,", 3], ["rgba(6,255,165,", 1]
        ];
        for (const [col, count] of blobs) {
          for (let i = 0; i < count; i++) {
            const x = rng() * S, y = rng() * S, r = 90 + rng() * 220;
            const g = n.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, col + (0.05 + rng() * 0.06) + ")");
            g.addColorStop(1, col + "0)");
            n.fillStyle = g;
            n.beginPath(); n.arc(x, y, r, 0, TAU); n.fill();
          }
        }
        this.canvas = c;
      },
      draw(camX, camY, t) {
        if (!this.canvas) return;
        const S = 900;
        // two layers, opposite slow drift, deep parallax
        for (let L = 0; L < 2; L++) {
          const par = L === 0 ? 0.12 : 0.2;
          const drift = (L === 0 ? 1 : -1) * t * 3;
          let ox = ((-camX * par + drift) % S + S) % S;
          let oy = ((-camY * par + drift * 0.6) % S + S) % S;
          cx.globalAlpha = L === 0 ? 0.9 : 0.55;
          for (let ix = -1; ix <= Math.ceil(W / S); ix++)
            for (let iy = -1; iy <= Math.ceil(H / S); iy++)
              cx.drawImage(this.canvas, ox + ix * S - S, oy + iy * S - S);
        }
        cx.globalAlpha = 1;
      }
    };

    /* ---------- spatial hash ---------- */
    class SpatialHash {
      constructor(cell) { this.cell = cell; this.map = new Map(); }
      clear() { this.map.clear(); }
      insert(e) {
        const k = ((e.x / this.cell) | 0) * 73856093 ^ ((e.y / this.cell) | 0) * 19349663;
        let b = this.map.get(k);
        if (!b) { b = []; this.map.set(k, b); }
        b.push(e);
      }
      query(x, y, r, out) {
        out.length = 0;
        const c = this.cell;
        const x0 = ((x - r) / c) | 0, x1 = ((x + r) / c) | 0;
        const y0 = ((y - r) / c) | 0, y1 = ((y + r) / c) | 0;
        for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) {
          const b = this.map.get(gx * 73856093 ^ gy * 19349663);
          if (b) for (let i = 0; i < b.length; i++) out.push(b[i]);
        }
        return out;
      }
    }

    /* ---------- pool ---------- */
    class Pool {
      constructor(factory, size) {
        this.factory = factory; this.items = []; this.live = [];
        for (let i = 0; i < size; i++) this.items.push(factory());
      }
      get() { const it = this.items.pop() || this.factory(); it.dead = false; this.live.push(it); return it; }
      update(fn) {
        const L = this.live;
        for (let i = L.length - 1; i >= 0; i--) {
          const it = L[i]; fn(it);
          if (it.dead) { L[i] = L[L.length - 1]; L.pop(); this.items.push(it); }
        }
      }
      releaseAll() { while (this.live.length) this.items.push(this.live.pop()); }
    }

    /* ---------- input ---------- */
    const Input = {
      keys: new Set(), stickActive: false, stickId: -1, sx: 0, sy: 0, dx: 0, dy: 0,
      el: document.getElementById("stick"), knob: document.getElementById("knob"),
      init() {
        window.addEventListener("keydown", e => {
          this.keys.add(e.code);
          if ((e.code === "KeyP" || e.code === "Escape") && Game.state === "run") Game.pause();
          else if ((e.code === "KeyP" || e.code === "Escape") && Game.state === "pause") Game.resume();
          if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
        });
        window.addEventListener("keyup", e => this.keys.delete(e.code));
        cv.addEventListener("pointerdown", e => this.onDown(e), { passive: false });
        window.addEventListener("pointermove", e => this.onMove(e), { passive: false });
        window.addEventListener("pointerup", e => this.onUp(e));
        window.addEventListener("pointercancel", e => this.onUp(e));
        cv.addEventListener("contextmenu", e => e.preventDefault());
      },
      onDown(e) {
        if (Game.state !== "run") return;
        e.preventDefault(); AudioSys.resume();
        if (this.stickActive) return;
        this.stickActive = true; this.stickId = e.pointerId;
        this.sx = e.clientX; this.sy = e.clientY; this.dx = 0; this.dy = 0;
        this.el.style.display = "block";
        this.el.style.left = (this.sx - 62) + "px"; this.el.style.top = (this.sy - 62) + "px";
        this.knob.style.transform = "translate(0,0)";
      },
      onMove(e) {
        if (!this.stickActive || e.pointerId !== this.stickId) return;
        e.preventDefault();
        let dx = e.clientX - this.sx, dy = e.clientY - this.sy;
        const len = Math.hypot(dx, dy), max = 52;
        if (len > max) { dx = dx / len * max; dy = dy / len * max; }
        this.dx = dx / max; this.dy = dy / max;
        this.knob.style.transform = `translate(${dx}px,${dy}px)`;
      },
      onUp(e) {
        if (e.pointerId !== this.stickId) return;
        this.stickActive = false; this.stickId = -1; this.dx = 0; this.dy = 0;
        this.el.style.display = "none";
      },
      axis() {
        let x = 0, y = 0;
        if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) x -= 1;
        if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) x += 1;
        if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) y -= 1;
        if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) y += 1;
        x += this.dx; y += this.dy;
        const l = Math.hypot(x, y);
        if (l > 1) { x /= l; y /= l; }
        return [x, y];
      }
    };

    /* ---------- META ---------- */
    const META = [
      { id: "mhp", nm: "Reinforced Hull", ds: "+12 starting max hull / lv", max: 8, cost: l => 25 + l * 20 },
      { id: "mdmg", nm: "War Core", ds: "+6% base damage / lv", max: 10, cost: l => 30 + l * 25 },
      { id: "mspd", nm: "Drift Engines", ds: "+4% move speed / lv", max: 6, cost: l => 25 + l * 20 },
      { id: "mxp", nm: "Core Refinery", ds: "+8% XP gain / lv", max: 8, cost: l => 35 + l * 25 },
      { id: "mshard", nm: "Shard Siphon", ds: "+10% shard gain / lv", max: 8, cost: l => 40 + l * 30 },
      { id: "mreroll", nm: "Signal Scrambler", ds: "+1 upgrade reroll per run / lv", max: 4, cost: l => 60 + l * 50 },
      { id: "mbanish", nm: "Void Censor", ds: "+1 upgrade banish per run / lv", max: 3, cost: l => 60 + l * 50 },
      { id: "mrevive", nm: "Phoenix Sigil", ds: "+1 revive at 50% hull per run / lv", max: 2, cost: l => 200 + l * 250 },
      { id: "mmag", nm: "Deep Gravity", ds: "+12% pickup radius / lv", max: 6, cost: l => 25 + l * 20 },
      { id: "mluck", nm: "Fate Splice", ds: "+4% elite drop chance / lv", max: 5, cost: l => 45 + l * 35 },
    ];

    /* ---------- run upgrades ---------- */
    const UPGRADES = [
      { id: "dmg", ico: "◈", nm: "Void Edge", ds: "+22% projectile damage", max: 8, apply: p => p.dmgMul *= 1.22 },
      { id: "rate", ico: "⌁", nm: "Overclock", ds: "+18% fire rate", max: 8, apply: p => p.fireRate *= 0.85 },
      { id: "multi", ico: "⋔", nm: "Split Signal", ds: "+1 projectile per volley", max: 5, apply: p => p.shots++ },
      { id: "pierce", ico: "⇶", nm: "Phase Rounds", ds: "projectiles pierce +1 enemy", max: 4, apply: p => p.pierce++ },
      { id: "speed", ico: "➤", nm: "Ion Thrusters", ds: "+14% movement speed", max: 6, apply: p => p.speed *= 1.14 },
      { id: "magnet", ico: "◎", nm: "Grav Well", ds: "+45% core pickup radius", max: 6, apply: p => p.magnet *= 1.45 },
      { id: "hp", ico: "▣", nm: "Hull Plating", ds: "+25 max hull, full repair", max: 6, apply: p => { p.maxHp += 25; p.hp = p.maxHp; } },
      { id: "regen", ico: "✚", nm: "Nanite Swarm", ds: "+0.8 hull regen / second", max: 5, apply: p => p.regen += 0.8 },
      { id: "crit", ico: "✦", nm: "Ruin Focus", ds: "+10% crit chance (x2.5 dmg)", max: 6, apply: p => p.crit += 0.10 },
      { id: "orbit", ico: "☄", nm: "Dead Moons", ds: "+1 orbital blade around you", max: 6, apply: p => p.orbitals++ },
      { id: "nova", ico: "✺", nm: "Nova Pulse", ds: "periodic shockwave (faster/lv)", max: 5, apply: p => { p.nova++; p.novaCd = Math.max(2.2, 6 - p.nova); } },
      { id: "bspeed", ico: "↯", nm: "Rail Coils", ds: "+20% projectile velocity", max: 5, apply: p => p.bulletSpeed *= 1.20 },
    ];

    /* ---------- evolutions ---------- */
    const EVOLUTIONS = [
      {
        id: "prism", ico: "⟁", nm: "PRISM LANCE", req: ["multi", "bspeed"],
        ds: "Volleys become hyper-velocity lances that pierce everything and refract on kill.",
        apply: p => { p.evoPrism = true; p.pierce += 99; p.bulletSpeed *= 1.5; }
      },
      {
        id: "singularity", ico: "◉", nm: "SINGULARITY", req: ["nova", "magnet"],
        ds: "Nova inverts: pulses drag enemies inward and leave a crushing gravity scar.",
        apply: p => { p.evoSing = true; p.novaCd = Math.max(2, p.novaCd * 0.8); }
      },
      {
        id: "bloodhalo", ico: "❂", nm: "BLOOD HALO", req: ["orbit", "regen"],
        ds: "Orbital blades drink. Every blade hit restores hull and blades grow larger.",
        apply: p => { p.evoHalo = true; p.orbitals += 2; }
      },
      {
        id: "reaperprot", ico: "☠", nm: "REAPER PROTOCOL", req: ["dmg", "crit"],
        ds: "Crits detonate in a void blast. Crit chance +15%, blast scales with damage.",
        apply: p => { p.evoReaper = true; p.crit += 0.15; }
      },
      {
        id: "tempest", ico: "※", nm: "ION TEMPEST", req: ["rate", "speed"],
        ds: "Movement charges a storm: while moving, +40% fire rate and sparks arc off you.",
        apply: p => { p.evoTempest = true; }
      },
    ];

    /* ---------- enemies ---------- */
    const ETYPES = {
      chaser: { r: 13, hp: 14, spd: 78, dmg: 10, xp: 1, color: "#ff2d78", score: 10, shape: "tri" },
      swarm: { r: 8, hp: 6, spd: 120, dmg: 6, xp: 1, color: "#ff6d9d", score: 8, shape: "tri" },
      tank: { r: 22, hp: 70, spd: 38, dmg: 18, xp: 4, color: "#c1121f", score: 40, shape: "hex" },
      orbiter: { r: 12, hp: 20, spd: 95, dmg: 9, xp: 2, color: "#d14ad9", score: 20, shape: "dia" },
      spitter: { r: 14, hp: 26, spd: 52, dmg: 8, xp: 3, color: "#8b30e8", score: 30, shape: "pent", ranged: true },
      splitter: { r: 17, hp: 34, spd: 60, dmg: 12, xp: 3, color: "#f9509b", score: 30, shape: "hex", splits: true },
      bomber: { r: 15, hp: 18, spd: 105, dmg: 24, xp: 3, color: "#ff8f1f", score: 35, shape: "dia", bomber: true },
      shield: { r: 18, hp: 45, spd: 55, dmg: 14, xp: 4, color: "#4f6df5", score: 45, shape: "pent", shielded: true },
      warper: { r: 12, hp: 22, spd: 70, dmg: 11, xp: 3, color: "#c77dff", score: 40, shape: "dia", warps: true },
      leech: { r: 14, hp: 30, spd: 65, dmg: 9, xp: 3, color: "#4ade4a", score: 35, shape: "hex", healer: true },
      boss: { r: 46, hp: 900, spd: 42, dmg: 28, xp: 40, color: "#ff2d78", score: 600, shape: "boss", ranged: true, boss: true },
    };

    const ELITES = [
      { id: "swift", tag: "SWIFT", tint: "#ffd60a", mod: e => { e.spd *= 1.7; } },
      { id: "bulwark", tag: "BULWARK", tint: "#4f6df5", mod: e => { e.hp *= 2.6; e.maxHp *= 2.6; e.r *= 1.25; } },
      { id: "volatile", tag: "VOLATILE", tint: "#ff8f1f", mod: e => { e.volatile = true; } },
      { id: "vampiric", tag: "VAMPIRIC", tint: "#4ade4a", mod: e => { e.vampiric = true; e.hp *= 1.6; e.maxHp *= 1.6; } },
    ];

    const BOSSES = [
      { kind: "architect", nm: "VOID ARCHITECT", color: "#ff2d78" },
      { kind: "hive", nm: "HIVE MOTHER", color: "#4ade4a" },
      { kind: "serpent", nm: "NULL SERPENT", color: "#c77dff" },
    ];

    const EVENTS = [
      { id: "meteor", nm: "⚠ METEOR STORM", dur: 8, color: "#ff8f1f" },
      { id: "rush", nm: "◇ CORE RUSH x2", dur: 10, color: "#06ffa5" },
      { id: "rift", nm: "✦ VOID RIFT", dur: 12, color: "#c77dff" },
      { id: "frenzy", nm: "↯ OVERDRIVE", dur: 8, color: "#ffd60a" },
      { id: "eclipse", nm: "● ECLIPSE", dur: 9, color: "#4f6df5" },
    ];

    const PICKUPS = [
      { id: "heal", ico: "✚", color: "#06ffa5" },
      { id: "bomb", ico: "✺", color: "#ff8f1f" },
      { id: "freeze", ico: "❄", color: "#4cc9f0" },
      { id: "shield", ico: "◈", color: "#4f6df5" },
      { id: "magnet", ico: "◎", color: "#c77dff" },
    ];

    const ACHIEVEMENTS = [
      { id: "w5", nm: "BREACH", ds: "reach wave 5", shards: 20, test: g => g.wave >= 5 },
      { id: "w10", nm: "DEEP VOID", ds: "reach wave 10", shards: 50, test: g => g.wave >= 10 },
      { id: "w20", nm: "ETERNAL", ds: "reach wave 20", shards: 150, test: g => g.wave >= 20 },
      { id: "k100", nm: "REAPER", ds: "100 kills in one run", shards: 25, test: g => g.kills >= 100 },
      { id: "k500", nm: "EXTINCTION", ds: "500 kills in one run", shards: 100, test: g => g.kills >= 500 },
      { id: "evo1", nm: "TRANSCEND", ds: "unlock an evolution", shards: 40, test: g => g.evolutions > 0 },
      { id: "c10", nm: "UNBROKEN", ds: "reach combo x5", shards: 30, test: g => g.maxCombo >= 5 },
      { id: "boss3", nm: "KINGSLAYER", ds: "kill 3 bosses in one run", shards: 120, test: g => g.bossKills >= 3 },
      { id: "lv15", nm: "ASCENDANT", ds: "reach level 15", shards: 60, test: g => g.player && g.player.lvl >= 15 },
    ];

    const STREAKS = [
      [12, "RAMPAGE", "#ffd60a"],
      [20, "CARNAGE", "#ff8f1f"],
      [30, "GODSPEED", "#ff2d78"],
    ];

    /* ---------- pooled factories ---------- */
    const mkBullet = () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 4, dmg: 0, pierce: 0, hostile: false, life: 0, dead: true, hitSet: null, prism: false });
    const mkParticle = () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: "#fff", dead: true, drag: 0.94, glow: true });
    const mkGem = () => ({ x: 0, y: 0, vx: 0, vy: 0, val: 1, r: 5, dead: true, t: 0, shard: false });
    const mkText = () => ({ x: 0, y: 0, vy: 0, txt: "", color: "#fff", life: 0, maxLife: 0.9, dead: true, size: 12, heavy: false });
    const mkPickup = () => ({ x: 0, y: 0, type: null, t: 0, dead: true, life: 18 });
    const mkZone = () => ({ x: 0, y: 0, r: 0, life: 0, maxLife: 1, dead: true, dps: 0, color: "#c77dff", pull: 0, telegraph: false });
    const mkSpawn = () => ({ x: 0, y: 0, t: 0, type: "", dead: true });

    /* ---------- game core ---------- */
    const Game = {
      state: "menu", mode: "standard",
      player: null, enemies: [],
      bullets: new Pool(mkBullet, 340),
      ebullets: new Pool(mkBullet, 200),
      parts: new Pool(mkParticle, 850),
      gems: new Pool(mkGem, 300),
      texts: new Pool(mkText, 90),
      pickups: new Pool(mkPickup, 24),
      zones: new Pool(mkZone, 24),
      spawnsQ: new Pool(mkSpawn, 40),
      hash: new SpatialHash(72), qbuf: [],
      cam: { x: 0, y: 0, shake: 0, sx: 0, sy: 0 },
      wave: 1, spawnTimer: 0, spawnBudget: 0,
      score: 0, kills: 0, time: 0, boss: null, bossKills: 0,
      arena: 1400, stars: [], seed: 1, rng: mulberry32(1), grng: mulberry32(1 ^ 0x9E3779B9),
      acc: 0, last: 0, STEP: 1 / 60, menuT: 0,
      upgradeCounts: {}, banished: new Set(), evolutions: 0,
      hitStop: 0, freezeT: 0, corruption: 0,
      combo: 0, comboT: 0, maxCombo: 0, streakIdx: 0,
      shardsRun: 0, rerolls: 0, banishes: 0, revives: 0,
      event: null, eventT: 0, nextEventT: 40, eventData: {},
      waveTitle: null, waveTitleT: 0,
      pendingOpts: null, banishMode: false,

      metaLv(id) { return Persist.data.meta[id] || 0; },
      grand(a, b) { return a + this.grng() * (b - a); },
      gpick(arr) { return arr[(this.grng() * arr.length) | 0]; },

      reset(mode) {
        this.mode = mode;
        const seed = mode === "daily"
          ? hashStr("VR-" + todayKey())
          : hashStr(`${Date.now()}-${performance.now()}-${crypto.getRandomValues(new Uint32Array(1))[0]}`);
        this.seed = seed;
        this.rng = mulberry32(seed);
        this.grng = mulberry32(seed ^ 0x9E3779B9);
        Nebula.bake(mulberry32(seed ^ 0x5F3759DF));
        this.stars = [];
        const palette = ["#4318b8", "#4cc9f0", "#8b30e8", "#efeaf7", "#c77dff"];
        for (let i = 0; i < 260; i++) this.stars.push({
          x: (this.rng() * 2 - 1) * this.arena * 1.4, y: (this.rng() * 2 - 1) * this.arena * 1.4,
          z: 0.3 + this.rng() * 0.7, s: 0.6 + this.rng() * 1.8,
          hue: palette[(this.rng() * palette.length) | 0],
          tw: this.rng() * TAU, tws: 0.5 + this.rng() * 2.5
        });
        const m = this.metaLv.bind(this);
        this.player = {
          x: 0, y: 0, vx: 0, vy: 0, r: 14,
          hp: 100 + m("mhp") * 12, maxHp: 100 + m("mhp") * 12, hpGhost: 1,
          speed: 190 * (1 + m("mspd") * 0.04),
          fireRate: 0.42, fireT: 0,
          dmgMul: 1 * (1 + m("mdmg") * 0.06),
          shots: 1, pierce: 0, bulletSpeed: 430,
          magnet: 70 * (1 + m("mmag") * 0.12),
          regen: 0, crit: 0.05, orbitals: 0, orbA: 0,
          nova: 0, novaCd: 6, novaT: 3,
          xpMul: 1 + m("mxp") * 0.08,
          xp: 0, xpNext: 6, lvl: 1, iframes: 0, angle: 0, trailT: 0, thr: 0,
          shield: 0, moveCharge: 0,
          evoPrism: false, evoSing: false, evoHalo: false, evoReaper: false, evoTempest: false
        };
        this.rerolls = m("mreroll"); this.banishes = m("mbanish"); this.revives = m("mrevive");
        this.enemies.length = 0;
        [this.bullets, this.ebullets, this.parts, this.gems, this.texts, this.pickups, this.zones, this.spawnsQ].forEach(p => p.releaseAll());
        this.wave = 1; this.spawnBudget = 0; this.spawnTimer = 0;
        this.score = 0; this.kills = 0; this.time = 0; this.boss = null; this.bossKills = 0;
        this.upgradeCounts = {}; this.banished = new Set(); this.evolutions = 0;
        this.cam.x = 0; this.cam.y = 0; this.cam.shake = 0;
        this.hitStop = 0; this.freezeT = 0; this.corruption = 0;
        this.combo = 0; this.comboT = 0; this.maxCombo = 0; this.streakIdx = 0; this.shardsRun = 0;
        this.event = null; this.eventT = 0; this.nextEventT = 40; this.eventData = {};
        this.waveTitle = null; this.waveTitleT = 0; this.banishMode = false;
        document.body.classList.remove("corrupted", "lowhp");
        UI.boss(false); UI.combo(0, 0, 0); UI.shield(0);
      },

      start(mode) {
        this.reset(mode);
        Persist.data.totalRuns++; Persist.save();
        this.state = "run";
        UI.show("hud");
        this.startWave(1);
        if (mode === "daily") UI.toast("DAILY SEED · " + todayKey());
      },
      pause() { if (this.state !== "run") return; this.state = "pause"; UI.pauseStats(this); UI.show("pausescr"); },
      resume() { if (this.state !== "pause") return; this.state = "run"; UI.show("hud"); AudioSys.resume(); },
      quit() { this.bankShards(); this.state = "menu"; UI.menu(); },

      startWave(n) {
        this.wave = n;
        this.spawnBudget = 6 + n * 4 + Math.floor(n * n * 0.4);
        this.spawnTimer = 0.4;
        this.waveTitle = n % 5 === 0 ? null : "WAVE " + String(n).padStart(2, "0");
        this.waveTitleT = 2.2;
        if (n >= 12) {
          this.corruption = clamp((n - 11) / 10, 0, 1);
          document.body.classList.add("corrupted");
          if (n === 12) { UI.eventBanner("▼ CORRUPTION RISING ▼", "#ff2d78"); AudioSys.event(); }
        }
        if (n % 5 === 0) this.spawnBoss(n);
      },

      spawnBoss(n) {
        const proto = BOSSES[((n / 5 - 1) | 0) % BOSSES.length];
        const a = this.grand(0, TAU), d = 620;
        const b = this.spawnEnemy("boss", this.player.x + Math.cos(a) * d, this.player.y + Math.sin(a) * d, true);
        const tier = 1 + (n / 5 - 1) * 0.9 + this.corruption * 1.5;
        b.hp = b.maxHp = ETYPES.boss.hp * tier;
        b.bossKind = proto.kind; b.color = proto.color; b.nm = proto.nm;
        b.phaseT = 0; b.dashT = 3; b.dashing = 0;
        this.boss = b;
        this.waveTitle = proto.nm; this.waveTitleT = 2.8;
        UI.boss(true, proto.nm, ((n / 5) | 0));
        AudioSys.boss(); this.shake(14);
      },

      spawnEnemy(type, x, y, immediate) {
        const t = ETYPES[type];
        const scale = (1 + (this.wave - 1) * 0.13) * (1 + this.corruption * 0.8);
        const e = {
          type, x, y, vx: 0, vy: 0, r: t.r,
          hp: t.hp * scale, maxHp: t.hp * scale,
          spd: t.spd * (1 + (this.wave - 1) * 0.02) * (1 + this.corruption * 0.25),
          dmg: t.dmg * (1 + this.corruption * 0.4), xp: t.xp, color: t.color, score: t.score, shape: t.shape,
          ranged: !!t.ranged, splits: !!t.splits, boss: !!t.boss,
          bomber: !!t.bomber, shielded: !!t.shielded, warps: !!t.warps, healer: !!t.healer,
          warpT: this.grand(2, 4), healT: 2,
          hitT: 0, fireT: this.grand(1, 2.5), wobble: this.grand(0, TAU),
          elite: null, volatile: false, vampiric: false, orbCd: 0, dotT: 0, wasSplit: false,
          birth: immediate ? 0.35 : 0.35, fusing: false
        };
        if (!e.boss && type !== "swarm" && this.wave >= 3) {
          const chance = 0.04 + this.wave * 0.008 + this.corruption * 0.1;
          if (this.grng() < chance) {
            e.elite = this.gpick(ELITES);
            e.elite.mod(e);
            e.xp *= 3; e.score *= 3;
          }
        }
        this.enemies.push(e);
        return e;
      },

      queueSpawn(type, x, y) {
        const s = this.spawnsQ.get();
        s.x = x; s.y = y; s.type = type; s.t = 0.7;
      },

      spawnFromBudget() {
        if (this.spawnBudget <= 0) return;
        const w = this.wave, roster = ["chaser", "chaser", "swarm"];
        if (w >= 2) roster.push("orbiter");
        if (w >= 3) roster.push("spitter", "swarm");
        if (w >= 4) roster.push("tank", "splitter");
        if (w >= 5) roster.push("bomber");
        if (w >= 6) roster.push("shield", "spitter");
        if (w >= 7) roster.push("warper", "tank");
        if (w >= 8) roster.push("leech", "bomber", "splitter");
        const type = this.gpick(roster);
        const a = this.grand(0, TAU);
        const d = Math.max(W, H) * 0.62 + this.grand(0, 120);
        const x = clamp(this.player.x + Math.cos(a) * d, -this.arena, this.arena);
        const y = clamp(this.player.y + Math.sin(a) * d, -this.arena, this.arena);
        this.queueSpawn(type, x, y);
        this.spawnBudget--;
      },

      /* ---------- events ---------- */
      triggerEvent() {
        const ev = this.gpick(EVENTS);
        this.event = ev; this.eventT = ev.dur; this.eventData = {};
        UI.eventBanner(ev.nm, ev.color);
        AudioSys.event();
        const p = this.player;
        switch (ev.id) {
          case "meteor": this.eventData.t = 0; break;
          case "rift": {
            const a = this.grand(0, TAU), d = 300;
            this.eventData.x = clamp(p.x + Math.cos(a) * d, -this.arena + 100, this.arena - 100);
            this.eventData.y = clamp(p.y + Math.sin(a) * d, -this.arena + 100, this.arena - 100);
            this.eventData.t = 0;
            break;
          }
          case "frenzy": this.eventData.saveRate = p.fireRate; p.fireRate *= 0.45; break;
        }
      },
      endEvent() {
        if (!this.event) return;
        if (this.event.id === "frenzy") this.player.fireRate = this.eventData.saveRate;
        this.event = null; UI.eventBanner(null);
      },
      updateEvent(dt) {
        this.nextEventT -= dt;
        if (!this.event && this.nextEventT <= 0 && !this.boss) {
          this.nextEventT = this.grand(35, 55);
          this.triggerEvent();
        }
        if (!this.event) return;
        this.eventT -= dt;
        if (this.eventT <= 0) { this.endEvent(); return; }
        const p = this.player;
        switch (this.event.id) {
          case "meteor": {
            this.eventData.t -= dt;
            if (this.eventData.t <= 0) {
              this.eventData.t = 0.5;
              const z = this.zones.get();
              z.x = p.x + this.grand(-320, 320); z.y = p.y + this.grand(-320, 320);
              z.r = 54; z.life = z.maxLife = 1.1; z.dps = 0; z.color = "#ff8f1f"; z.pull = 0; z.telegraph = true;
            }
            break;
          }
          case "rift": {
            this.eventData.t -= dt;
            if (this.eventData.t <= 0) {
              this.eventData.t = 0.7;
              const a = this.grand(0, TAU);
              this.spawnEnemy(this.gpick(["swarm", "chaser", "orbiter"]),
                this.eventData.x + Math.cos(a) * 40, this.eventData.y + Math.sin(a) * 40, true);
              this.burst(this.eventData.x, this.eventData.y, 6, "#c77dff", 160);
            }
            break;
          }
        }
      },

      /* ---------- combat ---------- */
      fire(p) {
        let target = null, best = 560 * 560;
        for (const e of this.enemies) {
          if (e.birth > 0) continue;
          const d = dist2(p.x, p.y, e.x, e.y);
          if (d < best) { best = d; target = e; }
        }
        if (!target) return;
        const base = Math.atan2(target.y - p.y, target.x - p.x);
        p.angle = base;
        const n = p.shots, spread = n > 1 ? (p.evoPrism ? 0.07 : 0.13) * (n - 1) : 0;
        for (let i = 0; i < n; i++) {
          const a = base - spread / 2 + (n > 1 ? spread * i / (n - 1) : 0) + this.grand(-0.02, 0.02);
          const b = this.bullets.get();
          b.x = p.x + Math.cos(a) * 16; b.y = p.y + Math.sin(a) * 16;
          b.vx = Math.cos(a) * p.bulletSpeed; b.vy = Math.sin(a) * p.bulletSpeed;
          b.dmg = 8 * p.dmgMul; b.pierce = p.pierce; b.life = 1.6; b.r = p.evoPrism ? 5 : 4;
          b.hostile = false; b.prism = p.evoPrism;
          b.hitSet = b.hitSet || new Set(); b.hitSet.clear();
        }
        // muzzle flash
        const mf = this.parts.get();
        mf.x = p.x + Math.cos(base) * 18; mf.y = p.y + Math.sin(base) * 18;
        mf.vx = Math.cos(base) * 60; mf.vy = Math.sin(base) * 60;
        mf.life = mf.maxLife = 0.08; mf.size = 7; mf.color = p.evoPrism ? "#fff6c9" : "#c9fff0"; mf.drag = 0.8;
        p.evoPrism ? AudioSys.laser() : AudioSys.shoot();
      },

      refract(x, y, dmg) {
        for (let i = 0; i < 3; i++) {
          const a = this.grand(0, TAU);
          const b = this.bullets.get();
          b.x = x; b.y = y; b.vx = Math.cos(a) * 520; b.vy = Math.sin(a) * 520;
          b.dmg = dmg * 0.5; b.pierce = 2; b.life = 0.5; b.r = 3; b.hostile = false; b.prism = true;
          b.hitSet = b.hitSet || new Set(); b.hitSet.clear();
        }
      },

      enemyFire(e, p) {
        const a = Math.atan2(p.y - e.y, p.x - e.x) + this.grand(-0.08, 0.08);
        const b = this.ebullets.get();
        const spd = e.boss ? 260 : 200;
        b.x = e.x; b.y = e.y; b.vx = Math.cos(a) * spd; b.vy = Math.sin(a) * spd;
        b.dmg = e.dmg * 0.8; b.life = 3.2; b.r = e.boss ? 7 : 5; b.hostile = true;
      },

      hurtPlayer(p, dmg) {
        if (p.iframes > 0) return;
        if (p.shield > 0) {
          p.shield--; p.iframes = 0.8;
          this.floatText(p.x, p.y - 30, "SHIELDED", "#4f6df5", 13);
          this.burst(p.x, p.y, 20, "#4f6df5", 260);
          AudioSys.pickup();
          UI.shield(p.shield);
          return;
        }
        p.hp -= dmg; p.iframes = 0.7;
        this.combo = 0; this.comboT = 0; this.streakIdx = 0; UI.combo(0, 0, 0);
        this.shake(9); this.glitch(); UI.flash(); AudioSys.hurt();
        this.burst(p.x, p.y, 14, "#ff2d78", 240);
        if (p.hp <= 0) {
          if (this.revives > 0) {
            this.revives--;
            p.hp = p.maxHp * 0.5; p.iframes = 2.5;
            this.floatText(p.x, p.y - 40, "PHOENIX SIGIL", "#ffd60a", 16, true);
            this.burst(p.x, p.y, 60, "#ffd60a", 420);
            this.bombBlast(p.x, p.y, 260, 0);
            AudioSys.evolve();
          } else { p.hp = 0; this.gameOver(); }
        }
      },

      damageEnemy(e, dmg, isCrit, fromAngle) {
        if (e.birth > 0) return;
        if (e.shielded && fromAngle !== undefined) {
          const facing = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          let diff = Math.abs(((fromAngle - facing + Math.PI) % TAU + TAU) % TAU - Math.PI);
          if (diff > 2.2) {
            this.floatText(e.x, e.y - e.r, "BLOCK", "#4f6df5", 10);
            this.burst(e.x, e.y, 4, "#4f6df5", 120);
            return;
          }
        }
        e.hp -= dmg; e.hitT = 0.08;
        this.floatText(e.x + this.grand(-8, 8), e.y - e.r, (dmg | 0) + "", isCrit ? "#ffd60a" : "#efeaf7", isCrit ? 16 : 11, isCrit);
        AudioSys.hit();
        if (isCrit && this.player.evoReaper) {
          const R = 70;
          this.burst(e.x, e.y, 10, "#ffd60a", 220);
          this.hash.query(e.x, e.y, R, this.qbuf);
          for (const o of this.qbuf) if (o !== e && dist2(e.x, e.y, o.x, o.y) < R * R) {
            o.hp -= dmg * 0.4; o.hitT = 0.08;
            if (o.hp <= 0) this.killEnemy(o);
          }
        }
        if (e.hp <= 0) this.killEnemy(e);
      },

      killEnemy(e) {
        const i = this.enemies.indexOf(e);
        if (i < 0) return;
        this.enemies[i] = this.enemies[this.enemies.length - 1]; this.enemies.pop();
        this.kills++;

        this.combo++; this.comboT = 2.4;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        const mult = 1 + Math.min(4, (this.combo / 6) | 0);
        if (this.combo % 6 === 0) AudioSys.combo(mult);
        UI.combo(mult, 1, this.combo);
        this.score += e.score * mult;

        // killstreak callouts
        if (this.streakIdx < STREAKS.length && this.combo >= STREAKS[this.streakIdx][0]) {
          const [, txt, col] = STREAKS[this.streakIdx];
          this.floatText(this.player.x, this.player.y - 70, txt, col, 24, true);
          AudioSys.streak();
          this.streakIdx++;
        }

        // death implosion: converging shards then burst
        this.implode(e.x, e.y, e.color, e.r);
        this.burst(e.x, e.y, e.boss ? 60 : 14, e.color, e.boss ? 420 : 190);
        this.hitStop = Math.max(this.hitStop, e.boss ? 0.12 : (e.r > 18 ? 0.045 : 0.02));
        AudioSys.kill();

        if (e.volatile) {
          this.bombBlast(e.x, e.y, 110, e.dmg);
          const p = this.player;
          if (dist2(e.x, e.y, p.x, p.y) < 110 * 110) this.hurtPlayer(p, e.dmg);
        }

        const gems = e.boss ? 14 : (e.xp > 2 ? 3 : 1);
        for (let g = 0; g < gems; g++) {
          const gem = this.gems.get();
          gem.x = e.x + this.grand(-14, 14); gem.y = e.y + this.grand(-14, 14);
          gem.vx = this.grand(-60, 60); gem.vy = this.grand(-60, 60);
          gem.val = Math.max(1, Math.round(e.xp / gems)); gem.t = 0; gem.shard = false;
        }
        const shardChance = e.boss ? 1 : (e.elite ? 0.9 : 0.04);
        if (this.grng() < shardChance) {
          const n = e.boss ? 8 : (e.elite ? 2 : 1);
          for (let s = 0; s < n; s++) {
            const gem = this.gems.get();
            gem.x = e.x + this.grand(-10, 10); gem.y = e.y + this.grand(-10, 10);
            gem.vx = this.grand(-50, 50); gem.vy = this.grand(-50, 50);
            gem.val = 1; gem.t = 0; gem.shard = true;
          }
        }
        if (e.elite && this.grng() < 0.35 + this.metaLv("mluck") * 0.04) this.dropPickup(e.x, e.y);

        if (e.splits && !e.wasSplit) {
          for (let s = 0; s < 3; s++) {
            const c = this.spawnEnemy("swarm", e.x + this.grand(-16, 16), e.y + this.grand(-16, 16), true);
            c.wasSplit = true;
          }
        }
        if (e.boss) {
          this.boss = null; this.bossKills++;
          UI.boss(false); this.shake(22); this.score += 200 * mult;
          this.dropPickup(e.x, e.y); this.dropPickup(e.x + 40, e.y);
        }
        this.checkAchievements();
      },

      killEnemyQuiet(e) {
        const i = this.enemies.indexOf(e);
        if (i >= 0) { this.enemies[i] = this.enemies[this.enemies.length - 1]; this.enemies.pop(); }
        this.kills++;
      },

      dropPickup(x, y) {
        const pk = this.pickups.get();
        pk.x = x; pk.y = y; pk.type = this.gpick(PICKUPS); pk.t = 0; pk.life = 18;
      },

      usePickup(pk) {
        const p = this.player;
        AudioSys.pickup();
        this.floatText(p.x, p.y - 34, pk.type.id.toUpperCase(), pk.type.color, 14, true);
        switch (pk.type.id) {
          case "heal": p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.35); this.burst(p.x, p.y, 20, "#06ffa5", 200); break;
          case "bomb": this.bombBlast(p.x, p.y, 320, 60 * p.dmgMul); AudioSys.bomb(); this.shake(16); break;
          case "freeze": this.freezeT = 4; AudioSys.freeze(); UI.freezeFlash(); break;
          case "shield": p.shield = Math.min(3, p.shield + 1); UI.shield(p.shield); break;
          case "magnet":
            for (const g of this.gems.live) { const a = Math.atan2(p.y - g.y, p.x - g.x); g.vx = Math.cos(a) * 900; g.vy = Math.sin(a) * 900; }
            break;
        }
      },

      bombBlast(x, y, R, dmg) {
        this.ring(x, y, R);
        this.burst(x, y, 50, "#ff8f1f", 400);
        for (const e of this.enemies.slice()) {
          if (dist2(x, y, e.x, e.y) < R * R) {
            const a = Math.atan2(e.y - y, e.x - x);
            e.vx += Math.cos(a) * 380; e.vy += Math.sin(a) * 380;
            if (dmg > 0) this.damageEnemy(e, dmg, false);
          }
        }
      },

      gainXP(p, v) {
        p.xp += v * p.xpMul * (this.event && this.event.id === "rush" ? 2 : 1);
        this.score += v;
        AudioSys.gem();
        while (p.xp >= p.xpNext) {
          p.xp -= p.xpNext; p.lvl++;
          p.xpNext = Math.round(6 + p.lvl * 4.5 + p.lvl * p.lvl * 0.7);
          this.levelUp();
        }
      },

      rollOptions() {
        const opts = [];
        for (const ev of EVOLUTIONS) {
          if (this.upgradeCounts["evo_" + ev.id]) continue;
          if (ev.req.every(r => (this.upgradeCounts[r] || 0) >= 3)) { opts.push({ evo: ev }); break; }
        }
        const avail = UPGRADES.filter(u => (this.upgradeCounts[u.id] || 0) < u.max && !this.banished.has(u.id));
        const src = avail.slice();
        while (opts.length < 3 && src.length) opts.push({ up: src.splice((this.grng() * src.length) | 0, 1)[0] });
        return opts;
      },

      levelUp() {
        AudioSys.levelup();
        this.burst(this.player.x, this.player.y, 40, "#06ffa5", 320);
        this.state = "levelup";
        this.pendingOpts = this.rollOptions();
        UI.levelup(this.pendingOpts);
      },

      applyChoice(o) {
        if (o.evo) {
          this.upgradeCounts["evo_" + o.evo.id] = 1;
          o.evo.apply(this.player);
          this.evolutions++;
          AudioSys.evolve();
          this.floatText(this.player.x, this.player.y - 50, o.evo.nm, "#ffd60a", 20, true);
          this.burst(this.player.x, this.player.y, 70, "#ffd60a", 420);
          this.glitch();
        } else {
          this.upgradeCounts[o.up.id] = (this.upgradeCounts[o.up.id] || 0) + 1;
          o.up.apply(this.player);
        }
        this.checkAchievements();
        this.state = "run";
        UI.show("hud");
      },

      reroll() {
        if (this.rerolls <= 0) return;
        this.rerolls--;
        this.pendingOpts = this.rollOptions();
        UI.levelup(this.pendingOpts);
      },
      banish(o) {
        if (this.banishes <= 0 || o.evo) return;
        this.banishes--;
        this.banished.add(o.up.id);
        this.pendingOpts = this.rollOptions();
        UI.levelup(this.pendingOpts);
      },

      novaBlast(p) {
        const R = 150 + p.nova * 32;
        this.burst(p.x, p.y, 46, p.evoSing ? "#c77dff" : "#4cc9f0", 380);
        this.shake(6); AudioSys.noise(0.35, 0.25, 700);
        this.ring(p.x, p.y, R);
        for (const e of this.enemies.slice()) {
          if (dist2(p.x, p.y, e.x, e.y) < R * R) {
            this.damageEnemy(e, 14 * p.dmgMul * p.nova, false);
            const a = Math.atan2(e.y - p.y, e.x - p.x);
            const dir = p.evoSing ? -1 : 1;
            e.vx += Math.cos(a) * 260 * dir; e.vy += Math.sin(a) * 260 * dir;
          }
        }
        if (p.evoSing) {
          const z = this.zones.get();
          z.x = p.x; z.y = p.y; z.r = R * 0.6; z.life = z.maxLife = 3; z.dps = 10 * p.dmgMul; z.color = "#c77dff"; z.pull = 140; z.telegraph = false;
        }
      },

      checkAchievements() {
        for (const a of ACHIEVEMENTS) {
          if (Persist.data.ach.includes(a.id)) continue;
          if (a.test(this)) {
            Persist.data.ach.push(a.id);
            Persist.data.shards += a.shards;
            Persist.save();
            UI.toast(`★ ${a.nm} — +${a.shards}◇`);
            AudioSys.evolve();
          }
        }
      },

      bankShards() {
        const gain = Math.round(this.shardsRun * (1 + this.metaLv("mshard") * 0.10));
        Persist.data.shards += gain;
        Persist.data.totalKills += this.kills;
        Persist.save();
        return gain;
      },

      /* ---- FX ---- */
      burst(x, y, n, color, spd) {
        for (let i = 0; i < n; i++) {
          const pt = this.parts.get();
          const a = Math.random() * TAU, v = spd * 0.2 + Math.random() * spd * 0.8;
          pt.x = x; pt.y = y; pt.vx = Math.cos(a) * v; pt.vy = Math.sin(a) * v;
          pt.life = pt.maxLife = 0.3 + Math.random() * 0.55; pt.size = 1.5 + Math.random() * 2.5; pt.color = color; pt.drag = 0.92;
        }
      },
      implode(x, y, color, r) {
        for (let i = 0; i < 10; i++) {
          const pt = this.parts.get();
          const a = Math.random() * TAU, d = r * 2 + Math.random() * r * 2;
          pt.x = x + Math.cos(a) * d; pt.y = y + Math.sin(a) * d;
          pt.vx = -Math.cos(a) * d * 6; pt.vy = -Math.sin(a) * d * 6;
          pt.life = pt.maxLife = 0.16; pt.size = 2; pt.color = color; pt.drag = 1;
        }
      },
      ring(x, y, R) {
        for (let i = 0; i < 36; i++) {
          const pt = this.parts.get(); const a = i / 36 * TAU;
          pt.x = x + Math.cos(a) * 20; pt.y = y + Math.sin(a) * 20;
          pt.vx = Math.cos(a) * R * 2.4; pt.vy = Math.sin(a) * R * 2.4;
          pt.life = pt.maxLife = 0.4; pt.size = 3; pt.color = "#4cc9f0"; pt.drag = 0.88;
        }
      },
      floatText(x, y, txt, color, size, heavy) {
        const t = this.texts.get();
        t.x = x; t.y = y; t.vy = -46; t.txt = txt; t.color = color;
        t.life = t.maxLife = heavy ? 1.3 : 0.9; t.size = size || 12; t.heavy = !!heavy;
      },
      shake(m) { if (!REDUCED) this.cam.shake = Math.max(this.cam.shake, m); },
      glitch() {
        document.body.classList.add("glitching", "hitfx");
        setTimeout(() => document.body.classList.remove("glitching", "hitfx"), 220);
      },

      gameOver() {
        this.state = "over";
        AudioSys.gameover(); this.shake(20);
        document.body.classList.remove("lowhp");
        const gained = this.bankShards();
        const best = this.mode === "daily" ? (Persist.data.dailyBest[todayKey()] || 0) : Persist.data.best;
        const isBest = this.score > best;
        if (this.mode === "daily") { if (isBest) Persist.data.dailyBest[todayKey()] = this.score; }
        else if (isBest) Persist.data.best = this.score;
        Persist.save();
        UI.gameOver(this, gained, isBest);
      },

      /* ---------- simulation ---------- */
      step(dt) {
        if (this.hitStop > 0) { this.hitStop -= dt; return; }
        const p = this.player;
        this.time += dt;
        this.freezeT = Math.max(0, this.freezeT - dt);
        this.waveTitleT = Math.max(0, this.waveTitleT - dt);
        const frozen = this.freezeT > 0;
        const eclipse = this.event && this.event.id === "eclipse";

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0 && this.spawnBudget > 0) {
          this.spawnFromBudget();
          this.spawnTimer = Math.max(0.12, 0.85 - this.wave * 0.05);
        }
        if (this.spawnBudget <= 0 && this.enemies.length === 0 && this.spawnsQ.live.length === 0) this.startWave(this.wave + 1);

        // resolve queued spawn telegraphs
        this.spawnsQ.update(s => {
          s.t -= dt;
          if (s.t <= 0) {
            s.dead = true;
            this.spawnEnemy(s.type, s.x, s.y);
            this.burst(s.x, s.y, 8, ETYPES[s.type].color, 160);
          }
        });

        this.updateEvent(dt);

        if (this.combo > 0) {
          this.comboT -= dt;
          UI.combo(1 + Math.min(4, (this.combo / 6) | 0), clamp(this.comboT / 2.4, 0, 1), this.combo);
          if (this.comboT <= 0) { this.combo = 0; this.streakIdx = 0; UI.combo(0, 0, 0); }
        }

        const [ax, ay] = Input.axis();
        const accel = 1400;
        p.vx = lerp(p.vx, ax * p.speed, clamp(accel * dt / p.speed, 0, 1));
        p.vy = lerp(p.vy, ay * p.speed, clamp(accel * dt / p.speed, 0, 1));
        p.x = clamp(p.x + p.vx * dt, -this.arena, this.arena);
        p.y = clamp(p.y + p.vy * dt, -this.arena, this.arena);
        p.iframes = Math.max(0, p.iframes - dt);
        if (p.regen > 0) p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
        // ghost hp bar chases real hp
        p.hpGhost = Math.max(p.hp / p.maxHp, lerp(p.hpGhost, p.hp / p.maxHp, clamp(1.6 * dt, 0, 1)));
        document.body.classList.toggle("lowhp", p.hp / p.maxHp < 0.3);

        const moving = (ax || ay);
        p.thr = lerp(p.thr, moving ? 1 : 0, clamp(8 * dt, 0, 1));
        if (p.evoTempest) {
          p.moveCharge = clamp(p.moveCharge + (moving ? dt * 1.5 : -dt * 2), 0, 1);
          if (p.moveCharge > 0.5 && Math.random() < dt * 8) {
            const pt = this.parts.get();
            pt.x = p.x + this.grand(-14, 14); pt.y = p.y + this.grand(-14, 14);
            pt.vx = this.grand(-120, 120); pt.vy = this.grand(-120, 120);
            pt.life = pt.maxLife = 0.2; pt.size = 2; pt.color = "#ffd60a"; pt.drag = 0.85;
          }
        }

        p.trailT -= dt;
        if (moving && p.trailT <= 0) {
          p.trailT = 0.03;
          const pt = this.parts.get();
          pt.x = p.x - p.vx * 0.04; pt.y = p.y - p.vy * 0.04;
          pt.vx = -p.vx * 0.4 + this.grand(-20, 20); pt.vy = -p.vy * 0.4 + this.grand(-20, 20);
          pt.life = pt.maxLife = 0.35; pt.size = 2.5; pt.color = "#06ffa5"; pt.drag = 0.9;
        }

        const rateMul = (p.evoTempest && p.moveCharge > 0.5) ? 0.6 : 1;
        p.fireT -= dt;
        if (p.fireT <= 0 && this.enemies.length) { p.fireT = p.fireRate * rateMul; this.fire(p); }

        if (p.nova > 0) {
          p.novaT -= dt;
          if (p.novaT <= 0) { p.novaT = p.novaCd; this.novaBlast(p); }
        }
        p.orbA += dt * 3.1;

        this.hash.clear();
        for (const e of this.enemies) this.hash.insert(e);

        if (p.orbitals > 0) {
          const oR = p.evoHalo ? 78 : 62, bladeR = p.evoHalo ? 17 : 12;
          for (let i = 0; i < p.orbitals; i++) {
            const a = p.orbA + i / p.orbitals * TAU;
            const ox = p.x + Math.cos(a) * oR, oy = p.y + Math.sin(a) * oR;
            this.hash.query(ox, oy, 34, this.qbuf);
            for (const e of this.qbuf) {
              if (dist2(ox, oy, e.x, e.y) < (bladeR + e.r) * (bladeR + e.r) && !e.orbCd) {
                e.orbCd = 0.25;
                const crit = this.grng() < p.crit;
                this.damageEnemy(e, 6 * p.dmgMul * (crit ? 2.5 : 1), crit);
                if (p.evoHalo) p.hp = Math.min(p.maxHp, p.hp + 0.8);
              }
            }
          }
        }

        this.zones.update(z => {
          z.life -= dt;
          if (z.life <= 0) {
            if (z.telegraph) {
              this.bombBlast(z.x, z.y, z.r + 14, 0);
              AudioSys.bomb(); this.shake(7);
              for (const e of this.enemies.slice())
                if (dist2(z.x, z.y, e.x, e.y) < (z.r + 14) * (z.r + 14)) this.damageEnemy(e, 50, false);
              if (dist2(z.x, z.y, p.x, p.y) < (z.r + 14) * (z.r + 14)) this.hurtPlayer(p, 22);
            }
            z.dead = true; return;
          }
          if (!z.telegraph) {
            this.hash.query(z.x, z.y, z.r + 30, this.qbuf);
            for (const e of this.qbuf) {
              if (dist2(z.x, z.y, e.x, e.y) < z.r * z.r) {
                e.dotT = (e.dotT || 0) - dt;
                if (e.dotT <= 0) { e.dotT = 0.35; this.damageEnemy(e, z.dps * 0.35, false); }
                if (z.pull) {
                  const a = Math.atan2(z.y - e.y, z.x - e.x);
                  e.vx += Math.cos(a) * z.pull * dt * 6; e.vy += Math.sin(a) * z.pull * dt * 6;
                }
              }
            }
          }
        });

        const eSlow = frozen ? 0 : (eclipse ? 0.55 : 1);
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const e = this.enemies[i];
          e.hitT = Math.max(0, e.hitT - dt);
          e.birth = Math.max(0, e.birth - dt);
          if (e.orbCd) e.orbCd = Math.max(0, e.orbCd - dt);
          e.wobble += dt * 4;
          if (e.birth > 0) continue; // still materialising
          const dxp = p.x - e.x, dyp = p.y - e.y;
          const dl = Math.hypot(dxp, dyp) || 1;
          let mvx = dxp / dl, mvy = dyp / dl;

          if (e.type === "orbiter" && dl < 240) {
            const s = Math.sin(e.wobble * 0.5) > 0 ? 1 : -1;
            mvx = mvx * 0.35 + -dyp / dl * 0.9 * s; mvy = mvy * 0.35 + dxp / dl * 0.9 * s;
          }
          if (e.ranged && dl < 260 && !e.boss) { mvx *= -0.6; mvy *= -0.6; }

          if (e.warps && !frozen) {
            e.warpT -= dt;
            if (e.warpT <= 0) {
              e.warpT = this.grand(2.5, 4);
              this.burst(e.x, e.y, 10, "#c77dff", 180);
              const a = this.grand(0, TAU), d = this.grand(120, 220);
              e.x = clamp(p.x + Math.cos(a) * d, -this.arena, this.arena);
              e.y = clamp(p.y + Math.sin(a) * d, -this.arena, this.arena);
              this.burst(e.x, e.y, 10, "#c77dff", 180);
            }
          }
          if (e.healer && !frozen) {
            e.healT -= dt;
            if (e.healT <= 0) {
              e.healT = 2;
              this.hash.query(e.x, e.y, 130, this.qbuf);
              for (const o of this.qbuf) if (o !== e && o.hp < o.maxHp) {
                o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.08);
                this.burst(o.x, o.y, 3, "#4ade4a", 90);
              }
            }
          }
          if (e.bomber && dl < 90 && e.fusing === false) e.fusing = 0.6;
          if (e.fusing !== false) {
            e.fusing -= dt;
            if (e.fusing <= 0) {
              this.burst(e.x, e.y, 26, "#ff8f1f", 300); AudioSys.bomb(); this.shake(6);
              if (dist2(e.x, e.y, p.x, p.y) < 110 * 110) this.hurtPlayer(p, e.dmg);
              this.killEnemyQuiet(e); continue;
            }
          }
          if (e.vampiric && dl < 120 && !frozen) {
            p.hp -= 3 * dt; e.hp = Math.min(e.maxHp, e.hp + 3 * dt);
            if (p.hp <= 0) { p.hp = 0.1; this.hurtPlayer(p, 1); }
          }

          if (e.boss && !frozen) {
            e.phaseT += dt;
            if (e.bossKind === "architect" && e.phaseT > 4.5) {
              e.phaseT = 0;
              const off = this.grand(0, TAU);
              for (let k = 0; k < 14; k++) {
                const a = off + k / 14 * TAU;
                const b = this.ebullets.get();
                b.x = e.x; b.y = e.y; b.vx = Math.cos(a) * 190; b.vy = Math.sin(a) * 190;
                b.dmg = e.dmg * 0.7; b.life = 3.5; b.r = 6; b.hostile = true;
              }
              AudioSys.noise(0.3, 0.22, 400);
            }
            if (e.bossKind === "hive" && e.phaseT > 3.5) {
              e.phaseT = 0;
              for (let k = 0; k < 4; k++) {
                const c = this.spawnEnemy("swarm", e.x + this.grand(-40, 40), e.y + this.grand(-40, 40), true);
                c.wasSplit = true;
              }
              const z = this.zones.get();
              z.x = e.x; z.y = e.y; z.r = 140; z.life = z.maxLife = 2.5; z.dps = 0; z.color = "#4ade4a"; z.pull = 0; z.telegraph = false;
              if (dist2(e.x, e.y, p.x, p.y) < 140 * 140) this.hurtPlayer(p, 10);
              this.burst(e.x, e.y, 30, "#4ade4a", 260);
            }
            if (e.bossKind === "serpent") {
              e.dashT -= dt;
              if (e.dashing > 0) {
                e.dashing -= dt;
                if (Math.random() < dt * 20) {
                  const pt = this.parts.get();
                  pt.x = e.x; pt.y = e.y; pt.vx = 0; pt.vy = 0;
                  pt.life = pt.maxLife = 0.5; pt.size = e.r * 0.7; pt.color = "#c77dff"; pt.drag = 1;
                }
              } else if (e.dashT <= 0) {
                e.dashT = this.grand(2.5, 3.8); e.dashing = 0.55;
                const a = Math.atan2(dyp, dxp);
                e.vx = Math.cos(a) * e.spd * 7; e.vy = Math.sin(a) * e.spd * 7;
                AudioSys.noise(0.25, 0.2, 600);
              }
            }
            UI.bossHp(e.hp / e.maxHp);
          }

          this.hash.query(e.x, e.y, e.r * 2, this.qbuf);
          let sx = 0, sy = 0;
          for (const o of this.qbuf) {
            if (o === e) continue;
            const d2 = dist2(e.x, e.y, o.x, o.y), rr = e.r + o.r;
            if (d2 < rr * rr && d2 > 0.001) {
              const d = Math.sqrt(d2), push = (rr - d) / rr;
              sx += (e.x - o.x) / d * push; sy += (e.y - o.y) / d * push;
            }
          }
          const dashLock = e.dashing > 0;
          if (!dashLock) {
            e.vx = lerp(e.vx, (mvx + sx * 1.4) * e.spd * eSlow, clamp(6 * dt, 0, 1));
            e.vy = lerp(e.vy, (mvy + sy * 1.4) * e.spd * eSlow, clamp(6 * dt, 0, 1));
          }
          e.x += e.vx * dt * (frozen && !dashLock ? 0 : 1); e.y += e.vy * dt * (frozen && !dashLock ? 0 : 1);

          if (e.ranged && !frozen) {
            e.fireT -= dt;
            if (e.fireT <= 0 && dl < 520) { e.fireT = e.boss ? 0.8 : this.grand(1.6, 2.6); this.enemyFire(e, p); }
          }
          const cr = e.r + p.r;
          if (dist2(e.x, e.y, p.x, p.y) < cr * cr) this.hurtPlayer(p, e.dmg);
        }

        this.bullets.update(b => {
          b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
          if (b.life <= 0) { b.dead = true; return; }
          this.hash.query(b.x, b.y, 30, this.qbuf);
          for (const e of this.qbuf) {
            if (b.hitSet.has(e) || e.birth > 0) continue;
            const rr = b.r + e.r;
            if (dist2(b.x, b.y, e.x, e.y) < rr * rr) {
              b.hitSet.add(e);
              const crit = this.grng() < p.crit;
              const hpBefore = e.hp;
              this.damageEnemy(e, b.dmg * (crit ? 2.5 : 1), crit, Math.atan2(b.vy, b.vx));
              if (b.prism && hpBefore > 0 && e.hp <= 0) this.refract(e.x, e.y, b.dmg);
              const pt = this.parts.get();
              pt.x = b.x; pt.y = b.y; pt.vx = this.grand(-90, 90); pt.vy = this.grand(-90, 90);
              pt.life = pt.maxLife = 0.2; pt.size = 2; pt.color = "#efeaf7"; pt.drag = 0.9;
              if (b.pierce-- <= 0) { b.dead = true; break; }
            }
          }
        });

        this.ebullets.update(b => {
          if (!frozen) { b.x += b.vx * dt; b.y += b.vy * dt; }
          b.life -= dt;
          if (b.life <= 0) { b.dead = true; return; }
          const rr = b.r + p.r;
          if (dist2(b.x, b.y, p.x, p.y) < rr * rr) { b.dead = true; this.hurtPlayer(p, b.dmg); }
        });

        this.gems.update(g => {
          g.t += dt;
          const d2p = dist2(g.x, g.y, p.x, p.y), mr = p.magnet;
          if (d2p < mr * mr) {
            const d = Math.sqrt(d2p) || 1;
            const pull = clamp((mr - d) / mr, 0, 1) * 640;
            g.vx += (p.x - g.x) / d * pull * dt * 8; g.vy += (p.y - g.y) / d * pull * dt * 8;
          }
          g.vx *= 0.92; g.vy *= 0.92;
          g.x += g.vx * dt; g.y += g.vy * dt;
          if (d2p < (p.r + g.r + 4) * (p.r + g.r + 4)) {
            g.dead = true;
            if (g.shard) { this.shardsRun++; AudioSys.shard(); this.floatText(p.x, p.y - 24, "+1◇", "#4cc9f0", 11); }
            else this.gainXP(p, g.val);
          }
        });

        this.pickups.update(pk => {
          pk.t += dt; pk.life -= dt;
          if (pk.life <= 0) { pk.dead = true; return; }
          if (dist2(pk.x, pk.y, p.x, p.y) < (p.r + 16) * (p.r + 16)) { pk.dead = true; this.usePickup(pk); }
        });

        this.parts.update(pt => {
          pt.life -= dt;
          if (pt.life <= 0) { pt.dead = true; return; }
          pt.vx *= pt.drag; pt.vy *= pt.drag;
          pt.x += pt.vx * dt; pt.y += pt.vy * dt;
        });
        this.texts.update(t => {
          t.life -= dt;
          if (t.life <= 0) { t.dead = true; return; }
          t.y += t.vy * dt;
        });

        this.cam.x = lerp(this.cam.x, p.x, clamp(5 * dt, 0, 1));
        this.cam.y = lerp(this.cam.y, p.y, clamp(5 * dt, 0, 1));
        this.cam.shake *= Math.pow(0.001, dt);
        if (this.cam.shake < 0.15) this.cam.shake = 0;
        this.cam.sx = (Math.random() * 2 - 1) * this.cam.shake;
        this.cam.sy = (Math.random() * 2 - 1) * this.cam.shake;

        UI.hud(p, this);
      },

      /* ---------- render ---------- */
      drawHexFloor() {
        // pointy-top hex lattice, only visible cells
        const s = 64, hstep = s * 1.5, vstep = s * Math.sqrt(3);
        const A = this.arena;
        const x0 = Math.max(-A, this.cam.x - W / 2 - s * 2), x1 = Math.min(A, this.cam.x + W / 2 + s * 2);
        const y0 = Math.max(-A, this.cam.y - H / 2 - s * 2), y1 = Math.min(A, this.cam.y + H / 2 + s * 2);
        const corr = this.corruption;
        cx.strokeStyle = corr > 0
          ? `rgba(${120 + corr * 80 | 0},20,${60 + corr * 30 | 0},${0.14 + corr * 0.1})`
          : "rgba(67,24,184,.16)";
        cx.lineWidth = 1;
        cx.beginPath();
        const ci = Math.floor(x0 / hstep), cj0 = Math.floor(y0 / vstep);
        for (let i = ci; i * hstep < x1; i++) {
          const cxx = i * hstep;
          const off = (i & 1) ? vstep / 2 : 0;
          for (let j = cj0 - 1; j * vstep < y1; j++) {
            const cyy = j * vstep + off;
            for (let k = 0; k < 6; k++) {
              const a1 = k / 6 * TAU, a2 = (k + 1) / 6 * TAU;
              if (k === 0) cx.moveTo(cxx + Math.cos(a1) * s * 0.94, cyy + Math.sin(a1) * s * 0.94);
              cx.lineTo(cxx + Math.cos(a2) * s * 0.94, cyy + Math.sin(a2) * s * 0.94);
            }
          }
        }
        cx.stroke();
      },

      drawShip(p) {
        const blink = p.iframes > 0 && ((p.iframes * 14) | 0) % 2 === 0;
        if (blink) return;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.angle + Math.PI / 2);
        // thruster flame
        if (p.thr > 0.08) {
          const fl = 10 + p.thr * (12 + Math.sin(this.time * 40) * 4);
          const g = cx.createLinearGradient(0, 10, 0, 10 + fl);
          g.addColorStop(0, "rgba(6,255,165,.9)");
          g.addColorStop(0.5, "rgba(76,201,240,.5)");
          g.addColorStop(1, "rgba(76,201,240,0)");
          cx.fillStyle = g;
          cx.beginPath(); cx.moveTo(-5, 10); cx.lineTo(0, 10 + fl); cx.lineTo(5, 10); cx.closePath(); cx.fill();
        }
        // aura
        cx.shadowColor = "#06ffa5"; cx.shadowBlur = 20;
        // wings (dark iridescent)
        cx.fillStyle = "#0d3b2e";
        cx.beginPath(); cx.moveTo(0, -6); cx.lineTo(14, 13); cx.lineTo(6, 9); cx.closePath(); cx.fill();
        cx.beginPath(); cx.moveTo(0, -6); cx.lineTo(-14, 13); cx.lineTo(-6, 9); cx.closePath(); cx.fill();
        // hull
        cx.fillStyle = "#06ffa5";
        cx.beginPath(); cx.moveTo(0, -17); cx.lineTo(8, 10); cx.lineTo(0, 5); cx.lineTo(-8, 10); cx.closePath(); cx.fill();
        // canopy
        cx.fillStyle = "#04010a";
        cx.beginPath(); cx.moveTo(0, -10); cx.lineTo(3.5, 3); cx.lineTo(-3.5, 3); cx.closePath(); cx.fill();
        cx.fillStyle = "#c9fff0";
        cx.fillRect(-1, -7, 2, 6);
        cx.restore();
        cx.shadowBlur = 0;
        if (p.shield > 0) {
          cx.strokeStyle = "#4f6df5"; cx.shadowColor = "#4f6df5"; cx.shadowBlur = 14; cx.lineWidth = 1.5;
          cx.beginPath(); cx.arc(p.x, p.y, p.r + 8 + Math.sin(this.time * 4) * 2, 0, TAU); cx.stroke();
          cx.shadowBlur = 0;
        }
      },

      draw() {
        // base gradient sky
        const bg = cx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#070212"); bg.addColorStop(0.6, "#04010a"); bg.addColorStop(1, "#060113");
        cx.fillStyle = bg;
        cx.fillRect(0, 0, W, H);

        const p = this.player;
        const t = this.state === "menu" ? this.menuT : this.time;
        const camX = p ? this.cam.x : Math.sin(this.menuT * 0.1) * 120;
        const camY = p ? this.cam.y : Math.cos(this.menuT * 0.08) * 90;

        Nebula.draw(camX, camY, t);

        cx.save();
        cx.translate(W / 2 - camX + (p ? this.cam.sx : 0), H / 2 - camY + (p ? this.cam.sy : 0));

        // twinkling parallax stars
        for (const s of this.stars) {
          const px = s.x + camX * (1 - s.z) * 0.4;
          const py = s.y + camY * (1 - s.z) * 0.4;
          const tw = 0.6 + Math.sin(t * s.tws + s.tw) * 0.4;
          cx.globalAlpha = (0.2 + s.z * 0.55) * tw;
          cx.fillStyle = s.hue;
          cx.fillRect(px, py, s.s, s.s);
        }
        cx.globalAlpha = 1;

        if (!p) { cx.restore(); return; } // menu ambient only

        const eclipse = this.event && this.event.id === "eclipse";
        const frozen = this.freezeT > 0;

        // hex floor + boundary
        this.drawHexFloor();
        const A = this.arena;
        cx.strokeStyle = "rgba(255,45,120,.75)"; cx.lineWidth = 3;
        cx.shadowColor = "#ff2d78"; cx.shadowBlur = 20;
        cx.strokeRect(-A, -A, A * 2, A * 2);
        cx.setLineDash([14, 10]);
        cx.strokeStyle = "rgba(255,45,120,.3)"; cx.lineWidth = 1;
        cx.strokeRect(-A + 16, -A + 16, (A - 16) * 2, (A - 16) * 2);
        cx.setLineDash([]);
        cx.shadowBlur = 0;

        // spawn telegraphs
        for (const s of this.spawnsQ.live) {
          const f = 1 - s.t / 0.7;
          const col = ETYPES[s.type].color;
          cx.strokeStyle = col; cx.globalAlpha = 0.25 + f * 0.6; cx.lineWidth = 1.5;
          cx.save(); cx.translate(s.x, s.y); cx.rotate(t * 3);
          const rr = 20 * (1 - f * 0.5);
          cx.beginPath();
          for (let k = 0; k < 4; k++) {
            const a = k / 4 * TAU;
            cx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
            cx.lineTo(Math.cos(a) * (rr + 8), Math.sin(a) * (rr + 8));
          }
          cx.stroke();
          cx.restore();
          cx.globalAlpha = 1;
        }

        // rift portal
        if (this.event && this.event.id === "rift") {
          const rx = this.eventData.x, ry = this.eventData.y;
          cx.strokeStyle = "#c77dff"; cx.shadowColor = "#c77dff"; cx.shadowBlur = 22; cx.lineWidth = 2;
          for (let k = 0; k < 3; k++) {
            cx.globalAlpha = 0.5 - k * 0.13;
            cx.beginPath(); cx.arc(rx, ry, 26 + k * 14 + Math.sin(t * 3 + k) * 5, 0, TAU); cx.stroke();
          }
          cx.globalAlpha = 1; cx.shadowBlur = 0;
        }

        // zones
        for (const z of this.zones.live) {
          const f = z.life / z.maxLife;
          if (z.telegraph) {
            cx.strokeStyle = "#ff8f1f"; cx.lineWidth = 2; cx.globalAlpha = 0.85;
            cx.beginPath(); cx.arc(z.x, z.y, z.r, 0, TAU); cx.stroke();
            cx.fillStyle = "rgba(255,143,31,.2)";
            cx.beginPath(); cx.arc(z.x, z.y, z.r * (1 - f), 0, TAU); cx.fill();
          } else {
            const rg = cx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
            rg.addColorStop(0, z.color + "33"); rg.addColorStop(1, z.color + "00");
            cx.fillStyle = rg; cx.globalAlpha = 0.6 * f + 0.2;
            cx.beginPath(); cx.arc(z.x, z.y, z.r, 0, TAU); cx.fill();
            cx.strokeStyle = z.color; cx.globalAlpha = 0.5 * f; cx.lineWidth = 1.5;
            cx.beginPath(); cx.arc(z.x, z.y, z.r, 0, TAU); cx.stroke();
          }
          cx.globalAlpha = 1;
        }

        // gems
        for (const gm of this.gems.live) {
          const pulse = 1 + Math.sin(gm.t * 7) * 0.18;
          cx.save(); cx.translate(gm.x, gm.y); cx.rotate(gm.t * 2); cx.scale(pulse, pulse);
          const col = gm.shard ? "#4cc9f0" : "#06ffa5";
          cx.fillStyle = col; cx.shadowColor = col; cx.shadowBlur = 12;
          if (gm.shard) { cx.beginPath(); cx.moveTo(0, -7); cx.lineTo(6, 2); cx.lineTo(0, 7); cx.lineTo(-6, 2); cx.closePath(); cx.fill(); }
          else { cx.beginPath(); cx.moveTo(0, -6); cx.lineTo(5, 0); cx.lineTo(0, 6); cx.lineTo(-5, 0); cx.closePath(); cx.fill(); }
          cx.restore();
        }
        cx.shadowBlur = 0;

        // pickups
        for (const pk of this.pickups.live) {
          const bob = Math.sin(pk.t * 4) * 4, blink = pk.life < 4 && ((pk.life * 6) | 0) % 2 === 0;
          if (blink) continue;
          cx.save(); cx.translate(pk.x, pk.y + bob); cx.rotate(Math.sin(pk.t * 2) * 0.1);
          cx.strokeStyle = pk.type.color; cx.shadowColor = pk.type.color; cx.shadowBlur = 16; cx.lineWidth = 1.5;
          cx.strokeRect(-11, -11, 22, 22);
          cx.strokeRect(-14, -14, 28, 28);
          cx.fillStyle = pk.type.color;
          cx.font = "14px 'Share Tech Mono',monospace"; cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.fillText(pk.type.ico, 0, 1);
          cx.restore();
        }
        cx.shadowBlur = 0; cx.textBaseline = "alphabetic";

        // enemy bullets (comet-tailed orbs)
        for (const b of this.ebullets.live) {
          const col = frozen ? "#8ecae6" : "#ff6d9d";
          cx.strokeStyle = col; cx.globalAlpha = 0.4; cx.lineWidth = b.r;
          cx.lineCap = "round";
          cx.beginPath(); cx.moveTo(b.x - b.vx * 0.05, b.y - b.vy * 0.05); cx.lineTo(b.x, b.y); cx.stroke();
          cx.globalAlpha = 1;
          cx.fillStyle = col; cx.shadowColor = frozen ? "#4cc9f0" : "#ff2d78"; cx.shadowBlur = 12;
          cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, TAU); cx.fill();
        }
        cx.shadowBlur = 0;

        // player bullets (velocity-stretched tracers)
        for (const b of this.bullets.live) {
          cx.save(); cx.translate(b.x, b.y); cx.rotate(Math.atan2(b.vy, b.vx));
          const L = b.prism ? 26 : 15;
          const g = cx.createLinearGradient(-L, 0, 6, 0);
          if (b.prism) { g.addColorStop(0, "rgba(255,207,63,0)"); g.addColorStop(1, "#fff6c9"); cx.shadowColor = "#ffd60a"; }
          else { g.addColorStop(0, "rgba(6,255,165,0)"); g.addColorStop(1, "#e8fff6"); cx.shadowColor = "#06ffa5"; }
          cx.shadowBlur = 12;
          cx.fillStyle = g;
          cx.fillRect(-L, b.prism ? -1.5 : -2, L + 6, b.prism ? 3 : 4);
          cx.restore();
        }
        cx.shadowBlur = 0;

        // enemies
        for (const e of this.enemies) this.drawEnemy(e, frozen);

        // orbitals
        if (p.orbitals > 0) {
          const oR = p.evoHalo ? 78 : 62;
          cx.strokeStyle = p.evoHalo ? "rgba(255,45,120,.3)" : "rgba(76,201,240,.25)"; cx.lineWidth = 1;
          cx.setLineDash([4, 6]);
          cx.beginPath(); cx.arc(p.x, p.y, oR, 0, TAU); cx.stroke();
          cx.setLineDash([]);
          for (let i = 0; i < p.orbitals; i++) {
            const a = p.orbA + i / p.orbitals * TAU;
            const ox = p.x + Math.cos(a) * oR, oy = p.y + Math.sin(a) * oR;
            const col = p.evoHalo ? "#ff6d9d" : "#4cc9f0";
            const sc = p.evoHalo ? 1.4 : 1;
            cx.save(); cx.translate(ox, oy); cx.rotate(a + p.orbA * 2); cx.scale(sc, sc);
            cx.fillStyle = col; cx.shadowColor = col; cx.shadowBlur = 12;
            cx.beginPath(); cx.moveTo(0, -11); cx.lineTo(6, 8); cx.lineTo(0, 4); cx.lineTo(-6, 8); cx.closePath(); cx.fill();
            cx.restore();
          }
          cx.shadowBlur = 0;
        }

        this.drawShip(p);

        cx.strokeStyle = "rgba(6,255,165,.07)";
        cx.beginPath(); cx.arc(p.x, p.y, p.magnet, 0, TAU); cx.stroke();

        // additive particles
        cx.globalCompositeOperation = "lighter";
        for (const pt of this.parts.live) {
          cx.globalAlpha = clamp(pt.life / pt.maxLife, 0, 1);
          cx.fillStyle = pt.color;
          cx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        }
        cx.globalCompositeOperation = "source-over";
        cx.globalAlpha = 1;

        // floating text (damage pops scale in)
        cx.textAlign = "center";
        for (const tx of this.texts.live) {
          const f = clamp(tx.life / tx.maxLife, 0, 1);
          const scale = tx.heavy ? (1 + (1 - f) * 0.15 + (f > 0.85 ? (f - 0.85) * 3 : 0)) : 1;
          cx.globalAlpha = f;
          cx.font = `${tx.heavy ? "italic " : ""}700 ${tx.size * scale | 0}px 'Chakra Petch','Courier New',monospace`;
          cx.fillStyle = tx.color; cx.shadowColor = tx.color; cx.shadowBlur = tx.heavy ? 14 : 6;
          cx.fillText(tx.txt, tx.x, tx.y);
        }
        cx.globalAlpha = 1; cx.shadowBlur = 0;

        // cinematic wave title (in-world, follows camera center)
        if (this.waveTitleT > 0 && this.waveTitle) {
          const f = this.waveTitleT / (this.wave % 5 === 0 ? 2.8 : 2.2);
          const inF = clamp((1 - f) * 6, 0, 1), outF = clamp(f * 6, 0, 1);
          const al = Math.min(inF, outF);
          cx.globalAlpha = al;
          const big = this.wave % 5 === 0;
          cx.font = `italic 700 ${big ? 46 : 34}px 'Chakra Petch','Courier New',monospace`;
          cx.fillStyle = big ? "#ff2d78" : "#ffd60a";
          cx.shadowColor = cx.fillStyle; cx.shadowBlur = 24;
          const spread = (1 - al) * 30;
          cx.save();
          cx.translate(this.cam.x, this.cam.y - 110);
          cx.scale(1 + spread * 0.004, 1);
          cx.fillText(this.waveTitle, 0, 0);
          cx.restore();
          // flanking rules
          cx.fillRect(this.cam.x - 170, this.cam.y - 104, 90 * al, 2);
          cx.fillRect(this.cam.x + 80, this.cam.y - 104, 90 * al, 2);
          cx.globalAlpha = 1; cx.shadowBlur = 0;
        }

        cx.restore();

        // eclipse mask
        if (eclipse) {
          cx.save();
          cx.fillStyle = "rgba(2,1,10,.74)";
          cx.beginPath();
          cx.rect(0, 0, W, H);
          const lx = W / 2 + (p.x - this.cam.x), ly = H / 2 + (p.y - this.cam.y);
          cx.arc(lx, ly, 170, 0, TAU, true);
          cx.fill("evenodd");
          // soft rim
          const rim = cx.createRadialGradient(lx, ly, 140, lx, ly, 190);
          rim.addColorStop(0, "rgba(79,109,245,.14)"); rim.addColorStop(1, "rgba(79,109,245,0)");
          cx.fillStyle = rim;
          cx.beginPath(); cx.arc(lx, ly, 190, 0, TAU); cx.fill();
          cx.restore();
        }
        if (frozen) {
          cx.fillStyle = "rgba(76,201,240,.08)";
          cx.fillRect(0, 0, W, H);
        }
      },

      drawEnemy(e, frozen) {
        cx.save();
        cx.translate(e.x, e.y);
        // birth scale-in
        if (e.birth > 0) {
          const bf = 1 - e.birth / 0.35;
          cx.scale(bf, bf);
          cx.globalAlpha = bf;
        }
        const flash = e.hitT > 0;
        const fusing = e.fusing !== false && e.fusing !== undefined && ((Math.max(0, e.fusing) * 10) | 0) % 2 === 0;
        const baseColor = frozen ? "#7bb8d4" : (fusing ? "#ffffff" : e.color);
        cx.shadowColor = e.elite ? e.elite.tint : e.color;
        cx.shadowBlur = e.boss ? 28 : (e.elite ? 20 : 13);
        const r = e.r, wob = Math.sin(e.wobble) * 0.12;
        cx.rotate(Math.atan2(e.vy, e.vx) + Math.PI / 2 + wob);
        // outline pass
        cx.strokeStyle = flash ? "#ffffff" : baseColor;
        cx.lineWidth = 2;
        cx.fillStyle = flash ? "#ffffff" : this.shade(baseColor);
        cx.beginPath();
        switch (e.shape) {
          case "tri": cx.moveTo(0, -r); cx.lineTo(r * 0.9, r * 0.8); cx.lineTo(-r * 0.9, r * 0.8); break;
          case "dia": cx.moveTo(0, -r); cx.lineTo(r * 0.7, 0); cx.lineTo(0, r); cx.lineTo(-r * 0.7, 0); break;
          case "hex": for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; i ? cx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : cx.moveTo(r, 0); } break;
          case "pent": for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; i ? cx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : cx.moveTo(Math.cos(-Math.PI / 2) * r, Math.sin(-Math.PI / 2) * r); } break;
          case "boss": for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, rr = i % 2 ? r * 0.55 : r; i ? cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : cx.moveTo(r, 0); } break;
        }
        cx.closePath(); cx.fill(); cx.stroke();
        // inner core glow
        cx.fillStyle = flash ? "#ffffff" : baseColor;
        cx.beginPath(); cx.arc(0, e.shape === "tri" ? r * 0.15 : 0, r * 0.28 + Math.sin(e.wobble * 2) * 1.5, 0, TAU); cx.fill();

        if (e.elite) {
          cx.strokeStyle = e.elite.tint; cx.lineWidth = 1.5; cx.globalAlpha *= 0.85;
          cx.setLineDash([5, 4]);
          cx.beginPath(); cx.arc(0, 0, r + 7 + Math.sin(e.wobble * 2) * 2, 0, TAU); cx.stroke();
          cx.setLineDash([]);
          cx.globalAlpha = 1;
        }
        if (e.boss) {
          cx.fillStyle = "#04010a";
          cx.beginPath(); cx.arc(0, 0, r * 0.35 + Math.sin(e.wobble * 2) * 3, 0, TAU); cx.fill();
          cx.fillStyle = "#ffd60a"; cx.shadowColor = "#ffd60a";
          cx.beginPath(); cx.arc(0, 0, r * 0.14, 0, TAU); cx.fill();
        }
        cx.restore();

        // front shield arc (screen-space)
        if (e.shielded && e.birth <= 0) {
          const facing = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          cx.strokeStyle = "#4cc9f0"; cx.lineWidth = 3; cx.shadowColor = "#4cc9f0"; cx.shadowBlur = 10;
          cx.beginPath(); cx.arc(e.x, e.y, e.r + 6, facing - 0.9, facing + 0.9); cx.stroke();
          cx.shadowBlur = 0;
        }
        cx.shadowBlur = 0;
        if (!e.boss && e.maxHp > 30 && e.hp < e.maxHp && e.birth <= 0) {
          cx.fillStyle = "rgba(0,0,0,.6)";
          cx.fillRect(e.x - 16, e.y - e.r - 11, 32, 4);
          cx.fillStyle = e.elite ? e.elite.tint : e.color;
          cx.fillRect(e.x - 15, e.y - e.r - 10, 30 * clamp(e.hp / e.maxHp, 0, 1), 2);
        }
      },

      // simple hex shade: darken a #rrggbb by 45% for fill bodies
      _shadeCache: {},
      shade(hex) {
        let c = this._shadeCache[hex];
        if (c) return c;
        const n = parseInt(hex.slice(1), 16);
        const r = ((n >> 16) & 255) * 0.42 | 0, g = ((n >> 8) & 255) * 0.42 | 0, b = (n & 255) * 0.42 | 0;
        c = `rgb(${r},${g},${b})`;
        this._shadeCache[hex] = c;
        return c;
      },

      loop(ts) {
        requestAnimationFrame(t => this.loop(t));
        if (!this.last) this.last = ts;
        let frame = (ts - this.last) / 1000;
        this.last = ts;
        if (frame > 0.25) frame = 0.25;
        if (this.state === "run") {
          this.acc += frame;
          let n = 0;
          while (this.acc >= this.STEP && n++ < 5) { this.step(this.STEP); this.acc -= this.STEP; }
        } else if (this.state === "menu") {
          this.menuT += frame;
        }
        this.draw(); // always draw: menus get ambient nebula/starfield behind them
        if (this.state === "run") {
          // ghost bar update (visual only)
          const p = this.player;
          UI.el("hpghost").style.transform = `scaleX(${clamp(p.hpGhost, 0, 1)})`;
        }
      }
    };

    /* ---------- UI ---------- */
    const UI = {
      el: id => document.getElementById(id),
      screens: ["start", "levelup", "pausescr", "over"],
      show(name) {
        for (const s of this.screens) this.el(s).classList.toggle("hidden", s !== name);
        const inGame = name === "hud";
        this.el("hud").style.display = inGame ? "block" : "none";
        this.el("pausebtn").style.display = inGame ? "block" : "none";
        if (inGame) for (const s of this.screens) this.el(s).classList.add("hidden");
      },
      menu() {
        this.show("start");
        if (!Nebula.canvas) Nebula.bake(mulberry32(7));
        if (!Game.stars.length) {
          const rng = mulberry32(7), palette = ["#4318b8", "#4cc9f0", "#8b30e8", "#efeaf7", "#c77dff"];
          for (let i = 0; i < 260; i++) Game.stars.push({
            x: (rng() * 2 - 1) * 1960, y: (rng() * 2 - 1) * 1960, z: 0.3 + rng() * 0.7, s: 0.6 + rng() * 1.8,
            hue: palette[(rng() * palette.length) | 0], tw: rng() * TAU, tws: 0.5 + rng() * 2.5
          });
        }
        this.el("shards0").textContent = Persist.data.shards;
        const b = Persist.data.best, db = Persist.data.dailyBest[todayKey()] || 0;
        this.el("best0").textContent =
          (b > 0 ? `BEST ${b}` : "") + (db > 0 ? ` · DAILY ${db}` : "") +
          (Persist.data.totalKills > 0 ? ` · ${Persist.data.totalKills} TOTAL KILLS` : "");
        this.renderHangar();
        document.body.classList.remove("corrupted", "lowhp");
        this.eventBanner(null); this.boss(false); this.combo(0, 0, 0); this.shield(0);
      },
      renderHangar() {
        const grid = this.el("metagrid");
        grid.innerHTML = "";
        for (const m of META) {
          const lv = Persist.data.meta[m.id] || 0;
          const cost = m.cost(lv);
          const maxed = lv >= m.max;
          const btn = document.createElement("button");
          btn.className = "meta";
          btn.disabled = maxed || Persist.data.shards < cost;
          const pips = Array.from({ length: m.max }, (_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("");
          btn.innerHTML = `<span class="mn">${m.nm}</span><div class="mp">${m.ds}</div><div class="pips">${pips}</div><div class="mc">${maxed ? "MAXED" : "◇ " + cost}</div>`;
          btn.addEventListener("click", () => {
            if (maxed || Persist.data.shards < cost) return;
            Persist.data.shards -= cost;
            Persist.data.meta[m.id] = lv + 1;
            Persist.save();
            AudioSys.unlock(); AudioSys.resume(); AudioSys.pickup();
            this.menu();
          });
          grid.appendChild(btn);
        }
      },
      hud(p, g) {
        this.el("hp-t").textContent = Math.ceil(p.hp);
        this.el("hpbar").querySelector("i").style.transform = `scaleX(${clamp(p.hp / p.maxHp, 0, 1)})`;
        this.el("lvl-t").textContent = p.lvl;
        this.el("xpbar").firstElementChild.style.transform = `scaleX(${clamp(p.xp / p.xpNext, 0, 1)})`;
        this.el("wave-t").textContent = g.wave;
        this.el("score-t").textContent = g.score;
        this.el("kill-t").textContent = g.kills;
        this.el("shard-t").textContent = g.shardsRun;
        this.el("time-t").textContent = fmtTime(g.time);
      },
      shield(n) {
        const s = this.el("shieldpip");
        s.style.display = n > 0 ? "block" : "none";
        s.textContent = "◈ ".repeat(n) + "SHIELD";
      },
      _lastMult: 0,
      combo(mult, frac, combo) {
        const c = this.el("combo");
        if (mult < 2) { c.style.opacity = "0"; this._lastMult = 0; return; }
        c.style.opacity = "1";
        c.classList.toggle("hot", combo >= 12 && combo < 24);
        c.classList.toggle("god", combo >= 24);
        this.el("combo-x").textContent = "x" + mult;
        this.el("combo-fill").style.transform = `scaleX(${frac})`;
        if (mult !== this._lastMult) {
          this._lastMult = mult;
          c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop");
          setTimeout(() => c.classList.remove("pop"), 130);
        }
      },
      eventBanner(txt, color) {
        const b = this.el("eventbanner");
        if (!txt) { b.style.opacity = "0"; return; }
        b.textContent = txt; b.style.color = color;
        b.style.textShadow = `0 0 18px ${color}`;
        b.style.opacity = "1";
        clearTimeout(this._evT);
        this._evT = setTimeout(() => { b.style.opacity = "0"; }, 3200);
      },
      toast(msg) {
        const t = document.createElement("div");
        t.className = "toast"; t.textContent = msg;
        this.el("toasts").appendChild(t);
        setTimeout(() => t.remove(), 3600);
      },
      boss(on, nm, tier) {
        this.el("bossbar").style.display = on ? "block" : "none";
        if (on) this.el("bossname").textContent = `${nm} · MK ${tier}`;
      },
      bossHp(f) { this.el("bossfill").style.transform = `scaleX(${clamp(f, 0, 1)})`; },
      flash() {
        const f = this.el("dmgflash");
        f.style.opacity = "1"; setTimeout(() => f.style.opacity = "0", 90);
      },
      freezeFlash() {
        const f = this.el("freezeflash");
        f.style.opacity = "1"; setTimeout(() => f.style.opacity = "0", 600);
      },
      levelup(opts) {
        const wrap = this.el("cards");
        wrap.innerHTML = "";
        for (const o of opts) {
          const btn = document.createElement("button");
          if (o.evo) {
            btn.className = "card evo";
            btn.innerHTML = `<span class="ico">${o.evo.ico}</span><span class="nm">${o.evo.nm}</span> <span class="lv" style="color:var(--gold)">EVOLUTION</span><div class="ds">${o.evo.ds}</div>`;
          } else {
            const lv = (Game.upgradeCounts[o.up.id] || 0) + 1;
            btn.className = "card";
            btn.innerHTML = `<span class="ico">${o.up.ico}</span><span class="nm">${o.up.nm}</span> <span class="lv">LV ${lv}/${o.up.max}</span><div class="ds">${o.up.ds}</div>`;
          }
          btn.addEventListener("click", () => {
            if (Game.banishMode && !o.evo) { Game.banishMode = false; Game.banish(o); return; }
            Game.banishMode = false;
            Game.applyChoice(o);
          });
          wrap.appendChild(btn);
        }
        this.el("reroll-n").textContent = Game.rerolls;
        this.el("banish-n").textContent = Game.banishes;
        this.el("rerollbtn").style.opacity = Game.rerolls > 0 ? "1" : ".35";
        this.el("banishbtn").style.opacity = Game.banishes > 0 ? "1" : ".35";
        this.el("banishbtn").style.background = Game.banishMode ? "rgba(255,45,120,.15)" : "";
        this.show("levelup");
        const first = wrap.querySelector(".card");
        if (first) first.focus();
      },
      pauseStats(g) {
        const p = g.player, rows = [];
        rows.push(["Wave", g.wave], ["Score", g.score], ["Kills", g.kills],
          ["Max combo", "x" + (1 + Math.min(4, (g.maxCombo / 6) | 0))], ["Shards", "◇ " + g.shardsRun],
          ["Damage", "x" + p.dmgMul.toFixed(2)], ["Fire rate", (1 / p.fireRate).toFixed(1) + "/s"],
          ["Projectiles", p.shots], ["Pierce", p.pierce > 50 ? "∞" : p.pierce], ["Crit", (p.crit * 100 | 0) + "%"],
          ["Orbitals", p.orbitals], ["Regen", p.regen.toFixed(1) + "/s"]);
        const evos = ["evoPrism", "evoSing", "evoHalo", "evoReaper", "evoTempest"].filter(k => p[k]).length;
        rows.push(["Evolutions", evos]);
        this.el("pausestats").innerHTML = rows.map(r => `<span>${r[0]}</span><b>${r[1]}</b>`).join("");
      },
      gameOver(g, shardsGained, isBest) {
        this.el("finalscore").textContent = "SCORE " + g.score;
        this.el("finalstats").textContent =
          `${g.mode === "daily" ? "DAILY · " : ""}WAVE ${g.wave} · ${g.kills} KILLS · ${fmtTime(g.time)} · MAX COMBO x${1 + Math.min(4, (g.maxCombo / 6) | 0)}`;
        this.el("finalshards").textContent = `+${shardsGained} ◇ VOID SHARDS (TOTAL ${Persist.data.shards})`;
        this.el("best1").textContent = isBest && g.score > 0 ? "▲ NEW BEST" :
          "BEST " + (g.mode === "daily" ? (Persist.data.dailyBest[todayKey()] || 0) : Persist.data.best);
        this.show("over");
      }
    };

    /* ---------- boot ---------- */
    Input.init();
    UI.el("startbtn").addEventListener("click", () => { AudioSys.unlock(); AudioSys.resume(); Game.start("standard"); });
    UI.el("dailybtn").addEventListener("click", () => { AudioSys.unlock(); AudioSys.resume(); Game.start("daily"); });
    UI.el("retrybtn").addEventListener("click", () => { AudioSys.resume(); Game.start(Game.mode); });
    UI.el("menubtn").addEventListener("click", () => { Game.state = "menu"; UI.menu(); });
    UI.el("resumebtn").addEventListener("click", () => Game.resume());
    UI.el("quitbtn").addEventListener("click", () => Game.quit());
    UI.el("pausebtn").addEventListener("click", () => Game.pause());
    UI.el("rerollbtn").addEventListener("click", () => Game.reroll());
    UI.el("banishbtn").addEventListener("click", () => {
      if (Game.banishes <= 0) return;
      Game.banishMode = !Game.banishMode;
      UI.el("banishbtn").style.background = Game.banishMode ? "rgba(255,45,120,.15)" : "";
      UI.toast(Game.banishMode ? "TAP A CARD TO BANISH IT" : "BANISH CANCELLED");
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden && Game.state === "run") Game.pause(); });

    Persist.load().then(() => UI.menu());
    requestAnimationFrame(t => Game.loop(t));
  
