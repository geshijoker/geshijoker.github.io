/*
  The sandbox world behind the site.
  A procedurally generated pixel island with three zones (About, Research, Life)
  and a handful of agent bots that plan paths with A* and run little "tool calls".
  Exposes window.World = { init, focus, setTheme, setPaused }.
*/
(function () {
  'use strict';

  const TILE = 16, W = 96, H = 64;
  const DEEP = 0, WATER = 1, SAND = 2, GRASS = 3, FOREST = 4, PATH = 5, WALL = 6, DOCK = 7, PLAZA = 8, PROP = 9;
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const PALETTES = {
    day: {
      night: false,
      deep: '#2C6A7B', deepLight: '#3A7D8D', water: '#3F8E9B', waterLight: '#5BA6AF', foam: '#CBE8E2',
      sand: '#E2CE9A', sandDark: '#CCB57F', grass: '#8CB86F', grass2: '#97C27A', grassDark: '#73A05A', grassLight: '#ADD08C',
      canopy: '#4E8B52', canopyDark: '#3A6D41', canopyLight: '#6CA766', trunk: '#6B4A33',
      path: '#D2B98C', pathDark: '#B99F72', plaza: '#D9D3C4', plazaLine: '#BDB4A2',
      wall: '#EFE8D8', wallShade: '#CDC2AB', roof: '#C25A4B', roofDark: '#9C4439', roofLight: '#D77A68',
      labWall: '#DCE3E6', labShade: '#AEBBC2', glass: '#6B9DB3', window: '#A7D0DC',
      solar: '#2E4A6B', solarLine: '#6F90B8', wood: '#A47349', woodDark: '#7A5235',
      rock: '#A5ABA8', rockDark: '#7F8683', rack: '#36424A', led: '#7CF0A6', ledOff: '#2B5A42',
      ink: '#1F2B30', flower1: '#F2B33D', flower2: '#EE7F6D',
      labelBg: '#F6F8F7', labelInk: '#1F2B30', accent: '#F2B33D', shadow: 'rgba(20,40,45,0.22)'
    },
    night: {
      night: true,
      deep: '#0E2131', deepLight: '#14293B', water: '#163648', waterLight: '#204A5E', foam: '#3D6F7E',
      sand: '#6B6553', sandDark: '#5B5646', grass: '#2E4C3D', grass2: '#33533F', grassDark: '#263F33', grassLight: '#3B5D4A',
      canopy: '#1E3B30', canopyDark: '#152D24', canopyLight: '#2A4C3D', trunk: '#2D2119',
      path: '#57523F', pathDark: '#4A4535', plaza: '#4B4D49', plazaLine: '#3D3F3B',
      wall: '#77746C', wallShade: '#5E5B55', roof: '#5E3030', roofDark: '#472424', roofLight: '#6E3B38',
      labWall: '#5B646D', labShade: '#46505A', glass: '#F2C46A', window: '#F5CC72',
      solar: '#1A283A', solarLine: '#30466A', wood: '#4F3A28', woodDark: '#3B2B1E',
      rock: '#5A605E', rockDark: '#474D4B', rack: '#1E252A', led: '#7CF0A6', ledOff: '#1D3A2B',
      ink: '#0B141A', flower1: '#9C7A35', flower2: '#8E5248',
      labelBg: '#142430', labelInk: '#E8EFEE', accent: '#F2B33D', shadow: 'rgba(0,0,0,0.3)'
    }
  };
  let pal = PALETTES.day;

  // ---------- noise ----------
  function hash(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, s) {
    let t = 0, amp = 0.5, f = 1;
    for (let i = 0; i < 4; i++) { t += amp * vnoise(x * f, y * f, s + i * 17); f *= 2; amp *= 0.5; }
    return t / 0.9375;
  }

  // ---------- map ----------
  const ZONES = {
    about: { x: 30, y: 30, label: 'About' },
    research: { x: 50, y: 24, label: 'Research' },
    life: { x: 41, y: 38, label: 'Life' }
  };
  const grid = new Uint8Array(W * H);
  const deco = new Uint8Array(W * H);
  const I = (x, y) => y * W + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const at = (x, y) => (inb(x, y) ? grid[I(x, y)] : DEEP);
  const isWater = t => t === DEEP || t === WATER;

  const buildings = [];
  const props = [];
  const pois = [];
  const pathTiles = [];
  const sparkles = [];
  const glows = [];
  let village = { x: 0, y: 0, w: W * TILE, h: H * TILE };

  function astar(sx, sy, gx, gy, cost) {
    const N = W * H, start = I(sx, sy), goal = I(gx, gy);
    if (start === goal) return [start];
    const g = new Float32Array(N).fill(Infinity);
    const from = new Int32Array(N).fill(-1);
    const closed = new Uint8Array(N);
    const heap = [];
    const push = (f, i) => {
      heap.push([f, i]);
      let k = heap.length - 1;
      while (k > 0) {
        const p = (k - 1) >> 1;
        if (heap[p][0] <= heap[k][0]) break;
        [heap[p], heap[k]] = [heap[k], heap[p]]; k = p;
      }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        let k = 0;
        for (;;) {
          const l = 2 * k + 1, r = l + 1;
          let m = k;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === k) break;
          [heap[m], heap[k]] = [heap[k], heap[m]]; k = m;
        }
      }
      return top;
    };
    g[start] = 0; push(0, start);
    while (heap.length) {
      const cur = pop()[1];
      if (closed[cur]) continue;
      if (cur === goal) break;
      closed[cur] = 1;
      const cx = cur % W, cy = (cur / W) | 0;
      for (const [dx, dy] of DIRS) {
        const nx = cx + dx, ny = cy + dy;
        if (!inb(nx, ny)) continue;
        const ni = I(nx, ny);
        if (closed[ni]) continue;
        const c = ni === goal ? 1 : cost(grid[ni], nx, ny);
        if (!isFinite(c)) continue;
        const ng = g[cur] + c;
        if (ng < g[ni]) {
          g[ni] = ng; from[ni] = cur;
          push(ng + Math.abs(nx - gx) + Math.abs(ny - gy), ni);
        }
      }
    }
    if (from[goal] === -1) return null;
    const out = [];
    for (let i = goal; i !== -1; i = from[i]) { out.push(i); if (i === start) break; }
    return out.reverse();
  }

  function carveCost(t, x, y) {
    const wiggle = fbm(x / 6, y / 6, 91) * 7;
    if (t === PATH || t === PLAZA || t === DOCK) return 1;
    if (t === GRASS) return 2 + wiggle;
    if (t === SAND) return 3 + wiggle;
    if (t === FOREST) return 12 + wiggle;
    return Infinity;
  }
  function walkCost(t) {
    if (t === PATH || t === PLAZA || t === DOCK) return 1;
    if (t === GRASS) return 2.5;
    if (t === SAND) return 3;
    return Infinity;
  }

  function stampBuilding(kind, x0, y0, w, h, doorX) {
    for (let y = y0 - 1; y <= y0 + h; y++)
      for (let x = x0 - 1; x <= x0 + w; x++)
        if (inb(x, y) && grid[I(x, y)] === FOREST) grid[I(x, y)] = GRASS;
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++) grid[I(x, y)] = WALL;
    const doorY = y0 + h - 1;
    grid[I(doorX, doorY)] = PATH;
    const b = { kind, x0, y0, w, h, doorX, doorY };
    buildings.push(b);
    return b;
  }
  function stampProp(kind, x, y) {
    grid[I(x, y)] = PROP;
    props.push({ kind, x, y });
  }

  function nearestWalkable(x, y) {
    if (inb(x, y) && isFinite(walkCost(grid[I(x, y)]))) return [x, y];
    const seen = new Set([I(x, y)]);
    let q = [[x, y]];
    for (let d = 0; d < 6 && q.length; d++) {
      const nq = [];
      for (const [cx, cy] of q) for (const [dx, dy] of DIRS) {
        const nx = cx + dx, ny = cy + dy;
        if (!inb(nx, ny) || seen.has(I(nx, ny))) continue;
        seen.add(I(nx, ny));
        if (isFinite(walkCost(grid[I(nx, ny)]))) return [nx, ny];
        nq.push([nx, ny]);
      }
      q = nq;
    }
    return [x, y];
  }
  function poi(zone, x, y, action) {
    const [px, py] = nearestWalkable(x, y);
    pois.push({ zone, x: px, y: py, action });
  }

  function generate() {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const nx = (x - W / 2) / (W / 2), ny = (y - H / 2) / (H / 2);
        const d = Math.sqrt(nx * nx * 0.9 + ny * ny * 1.1);
        let e = fbm(x / 12, y / 12, 11) * 0.7 + 0.62 - d * 0.75;
        for (const k in ZONES) {
          const z = ZONES[k], dd = (x - z.x) ** 2 + (y - z.y) ** 2;
          e += 0.4 * Math.exp(-dd / 98);
        }
        let t = e < 0.32 ? DEEP : e < 0.42 ? WATER : e < 0.47 ? SAND : GRASS;
        if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) t = DEEP;
        if (t === GRASS) {
          const f = fbm(x / 7, y / 7, 51);
          if ((f > 0.53 && e > 0.52) || hash(x, y, 3) > 0.975) t = FOREST;
        }
        grid[I(x, y)] = t;
      }
    }

    // Clear land around each zone.
    for (const k in ZONES) {
      const z = ZONES[k];
      for (let y = z.y - 8; y <= z.y + 8; y++) for (let x = z.x - 9; x <= z.x + 9; x++) {
        if (!inb(x, y)) continue;
        const dist = Math.hypot((x - z.x) / 1.15, y - z.y);
        const i = I(x, y);
        if (dist < 5.5 && grid[i] !== GRASS) grid[i] = GRASS;
        else if (dist < 7.5 && grid[i] === FOREST) grid[i] = GRASS;
      }
    }

    // A lake for the harbor.
    const L = ZONES.life, lcx = L.x + 1, lcy = L.y + 8, rx = 9, ry = 4;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const q = ((x - lcx) / rx) ** 2 + ((y - lcy) / ry) ** 2;
      const i = I(x, y);
      if (q < 0.45) grid[i] = DEEP;
      else if (q < 1) grid[i] = isWater(grid[i]) ? grid[i] : WATER;
      else if (q < 1.35 && (grid[i] === GRASS || grid[i] === FOREST)) grid[i] = SAND;
    }

    // Plazas.
    for (const k in ZONES) {
      const z = ZONES[k];
      for (let y = z.y - 3; y <= z.y + 3; y++) for (let x = z.x - 3; x <= z.x + 3; x++)
        if (Math.hypot(x - z.x, y - z.y) <= 3.2 && !isWater(grid[I(x, y)])) grid[I(x, y)] = PLAZA;
    }

    // Base camp (About)
    const A = ZONES.about;
    const cottage = stampBuilding('cottage', A.x - 3, A.y - 6, 6, 4, A.x);
    stampProp('campfire', A.x + 3, A.y + 1);
    stampProp('sign', A.x - 3, A.y + 1);

    // The lab (Research)
    const R = ZONES.research;
    const lab = stampBuilding('lab', R.x - 5, R.y - 7, 10, 5, R.x);
    stampProp('rack', R.x + 6, R.y - 4);
    stampProp('rack', R.x + 7, R.y - 4);
    stampProp('rack', R.x + 8, R.y - 4);
    stampProp('dish', R.x - 7, R.y - 3);

    // Harbor (Life)
    const boathouse = stampBuilding('boathouse', L.x - 7, L.y - 5, 4, 3, L.x - 5);
    stampProp('easel', L.x + 4, L.y - 1);
    let dockEnd = L.y + 3;
    for (let y = L.y + 4; y <= L.y + 8; y++) { grid[I(L.x, y)] = DOCK; dockEnd = y; }
    props.push({ kind: 'boat', x: L.x + 1, y: dockEnd, noGrid: true });

    // The rectangle that holds all three zones, used to fit them in view.
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (ax, ay, bx, by) => { x0 = Math.min(x0, ax); y0 = Math.min(y0, ay); x1 = Math.max(x1, bx); y1 = Math.max(y1, by); };
    for (const b of buildings) grow(b.x0, b.y0 - 2, b.x0 + b.w, b.y0 + b.h);
    for (const p of props) grow(p.x, p.y - 1, p.x + 1, p.y + 1);
    for (const k in ZONES) grow(ZONES[k].x - 3, ZONES[k].y - 3, ZONES[k].x + 4, ZONES[k].y + 4);
    village = { x: (x0 - 1) * TILE, y: (y0 - 1) * TILE, w: (x1 - x0 + 2) * TILE, h: (y1 - y0 + 2) * TILE };

    // Connect everything with paths.
    const carve = (ax, ay, bx, by) => {
      const p = astar(ax, ay, bx, by, carveCost);
      if (!p) return;
      for (const i of p) {
        const t = grid[i];
        if (t === GRASS || t === SAND || t === FOREST) grid[i] = PATH;
      }
    };
    for (const b of buildings) {
      const z = b.kind === 'cottage' ? A : b.kind === 'lab' ? R : L;
      carve(b.doorX, b.doorY, z.x, z.y);
    }
    carve(A.x, A.y, R.x, R.y);
    carve(A.x, A.y, L.x, L.y);
    carve(R.x, R.y, L.x, L.y);

    // Ground decorations, path list, water sparkles.
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = I(x, y), t = grid[i];
      if (t === GRASS) {
        const r = hash(x, y, 21);
        deco[i] = r > 0.95 ? 1 : r > 0.92 ? 2 : r > 0.905 ? 3 : 0;
      }
      if (t === PATH) pathTiles.push([x, y]);
      if (isWater(t) && hash(x, y, 31) > 0.86) {
        sparkles.push({ x: x * TILE + Math.floor(hash(x, y, 32) * 12), y: y * TILE + Math.floor(hash(x, y, 33) * 14), p: hash(x, y, 34) * 6.28 });
      }
    }

    // Places the bots go and what they do there.
    poi('about', A.x, A.y - 1, 'write("bio.md")');
    poi('about', A.x + 2, A.y + 1, 'think()');
    poi('about', A.x - 2, A.y + 1, 'greet(visitor)');
    poi('about', A.x, A.y + 2, 'plan(today)');
    poi('research', R.x, R.y - 1, 'run("SOP-42")');
    poi('research', R.x + 7, R.y - 3, 'self_improve()');
    poi('research', R.x - 6, R.y - 3, 'fetch("arxiv")');
    poi('research', R.x + 2, R.y + 1, 'eval(agent)');
    poi('research', R.x - 2, R.y + 1, 'write("paper.tex")');
    poi('life', L.x, dockEnd, 'photo(sunset)');
    poi('life', L.x + 3, L.y - 1, 'sketch(trip)');
    poi('life', L.x - 5, L.y - 2, 'pack(bag)');
    poi('life', L.x - 1, L.y + 1, 'plan(trip)');

    // Night lights.
    const cx = cottage.x0 * TILE, cy = cottage.y0 * TILE;
    glows.push({ x: cx + 15, y: cy + 42, r: 26 }, { x: cx + cottage.w * TILE - 15, y: cy + 42, r: 26 });
    glows.push({ x: (A.x + 3) * TILE + 8, y: (A.y + 1) * TILE + 6, r: 46, fire: true });
    glows.push({ x: lab.x0 * TILE + lab.w * 8, y: lab.y0 * TILE + 52, r: 70 });
    glows.push({ x: boathouse.doorX * TILE + 8, y: boathouse.y0 * TILE + 38, r: 26 });
    glows.push({ x: L.x * TILE + 8, y: dockEnd * TILE + 4, r: 30 });
  }

  // ---------- static terrain rendering ----------
  const terrain = document.createElement('canvas');
  terrain.width = W * TILE;
  terrain.height = H * TILE;

  function fill(c, col, x, y, w = 1, h = 1) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function disc(c, cx, cy, r, col) {
    c.fillStyle = col;
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
      c.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
    }
  }

  function drawGrassBase(c, x, y) {
    const X = x * TILE, Y = y * TILE;
    const base = fbm(x / 5, y / 5, 77) > 0.56 ? pal.grass2 : pal.grass;
    fill(c, base, X, Y, TILE, TILE);
    for (let k = 0; k < 5; k++) fill(c, pal.grassDark, X + Math.floor(hash(x, y, 40 + k) * 15), Y + Math.floor(hash(x, y, 50 + k) * 15), 1, 2);
    for (let k = 0; k < 2; k++) fill(c, pal.grassLight, X + Math.floor(hash(x, y, 60 + k) * 14), Y + Math.floor(hash(x, y, 70 + k) * 15), 2, 1);
  }

  function drawFoam(c, x, y) {
    const X = x * TILE, Y = y * TILE;
    const land = (t) => !isWater(t);
    if (land(at(x, y - 1))) for (let i = 0; i < 16; i++) if (hash(X + i, Y, 9) > 0.3) fill(c, pal.foam, X + i, Y, 1, 2);
    if (land(at(x, y + 1))) for (let i = 0; i < 16; i++) if (hash(X + i, Y, 10) > 0.3) fill(c, pal.foam, X + i, Y + 14, 1, 2);
    if (land(at(x - 1, y))) for (let i = 0; i < 16; i++) if (hash(X, Y + i, 11) > 0.3) fill(c, pal.foam, X, Y + i, 2, 1);
    if (land(at(x + 1, y))) for (let i = 0; i < 16; i++) if (hash(X, Y + i, 12) > 0.3) fill(c, pal.foam, X + 14, Y + i, 2, 1);
  }

  function drawGround(c, x, y) {
    const t = grid[I(x, y)], X = x * TILE, Y = y * TILE, r = k => hash(x, y, k);
    switch (t) {
      case DEEP:
        fill(c, pal.deep, X, Y, TILE, TILE);
        if (r(1) > 0.7) fill(c, pal.deepLight, X + Math.floor(r(2) * 10), Y + Math.floor(r(3) * 14), 5, 1);
        drawFoam(c, x, y);
        break;
      case WATER:
        fill(c, pal.water, X, Y, TILE, TILE);
        if (r(1) > 0.55) fill(c, pal.waterLight, X + Math.floor(r(2) * 11), Y + Math.floor(r(3) * 14), 4, 1);
        drawFoam(c, x, y);
        break;
      case SAND:
        fill(c, pal.sand, X, Y, TILE, TILE);
        for (let k = 0; k < 4; k++) fill(c, pal.sandDark, X + Math.floor(r(40 + k) * 15), Y + Math.floor(r(50 + k) * 15));
        break;
      case PATH: {
        fill(c, pal.path, X, Y, TILE, TILE);
        for (let k = 0; k < 3; k++) fill(c, pal.pathDark, X + 2 + Math.floor(r(40 + k) * 12), Y + 2 + Math.floor(r(50 + k) * 12), 2, 1);
        const soft = (n) => n === GRASS || n === FOREST;
        if (soft(at(x, y - 1))) for (let i = 0; i < 16; i++) if (hash(X + i, Y, 13) > 0.5) fill(c, pal.grass, X + i, Y);
        if (soft(at(x, y + 1))) for (let i = 0; i < 16; i++) if (hash(X + i, Y, 14) > 0.5) fill(c, pal.grass, X + i, Y + 15);
        if (soft(at(x - 1, y))) for (let i = 0; i < 16; i++) if (hash(X, Y + i, 15) > 0.5) fill(c, pal.grass, X, Y + i);
        if (soft(at(x + 1, y))) for (let i = 0; i < 16; i++) if (hash(X, Y + i, 16) > 0.5) fill(c, pal.grass, X + 15, Y + i);
        break;
      }
      case PLAZA: {
        fill(c, pal.plaza, X, Y, TILE, TILE);
        fill(c, pal.plazaLine, X, Y + 7, TILE, 1);
        fill(c, pal.plazaLine, X, Y + 15, TILE, 1);
        fill(c, pal.plazaLine, X + ((y & 1) ? 4 : 11), Y, 1, 7);
        fill(c, pal.plazaLine, X + ((y & 1) ? 11 : 4), Y + 8, 1, 7);
        break;
      }
      case DOCK: {
        const under = [at(x - 1, y), at(x + 1, y)].some(isWater);
        fill(c, under ? pal.water : pal.sand, X, Y, TILE, TILE);
        if (under) drawFoam(c, x, y);
        fill(c, pal.woodDark, X + 1, Y + 10, 2, 6);
        fill(c, pal.woodDark, X + 13, Y + 10, 2, 6);
        fill(c, pal.wood, X + 2, Y, 12, TILE);
        for (let k = 3; k < 16; k += 4) fill(c, pal.woodDark, X + 2, Y + k, 12, 1);
        break;
      }
      default: {
        drawGrassBase(c, x, y);
        if (t === GRASS) {
          const d = deco[I(x, y)];
          const dx = X + 3 + Math.floor(r(80) * 9), dy = Y + 3 + Math.floor(r(81) * 9);
          if (d === 1) { fill(c, pal.flower1, dx, dy, 2, 2); fill(c, pal.flower1, dx + 4, dy + 3, 2, 2); }
          if (d === 2) { fill(c, pal.flower2, dx, dy, 2, 2); fill(c, pal.flower2, dx + 3, dy + 4, 2, 2); }
          if (d === 3) { fill(c, pal.rockDark, dx, dy + 1, 6, 3); fill(c, pal.rock, dx, dy, 5, 2); }
        }
      }
    }
  }

  function drawTree(c, x, y) {
    const cx = x * TILE + 8, base = y * TILE + 14, r = 6 + Math.floor(hash(x, y, 5) * 2.99);
    fill(c, pal.shadow, cx - 6, base - 1, 13, 3);
    fill(c, pal.trunk, cx - 1, base - 6, 3, 6);
    const top = base - 4 - r;
    disc(c, cx, top, r, pal.canopyDark);
    disc(c, cx - 1, top - 1, r - 1, pal.canopy);
    disc(c, cx - 3, top - 3, Math.max(2, r - 4), pal.canopyLight);
  }

  function windowAt(c, x, y) {
    fill(c, pal.ink, x, y, 10, 8);
    fill(c, pal.window, x + 1, y + 1, 8, 6);
    fill(c, pal.ink, x + 5, y + 1, 1, 6);
  }

  function drawBuilding(c, b) {
    const X = b.x0 * TILE, Y = b.y0 * TILE, w = b.w * TILE, h = b.h * TILE, dx = b.doorX * TILE;
    fill(c, pal.shadow, X + 4, Y + h - 2, w, 5);
    if (b.kind === 'cottage') {
      const roofH = 35;
      fill(c, pal.wall, X + 1, Y + roofH - 2, w - 2, h - roofH + 2);
      fill(c, pal.wallShade, X + 1, Y + h - 3, w - 2, 3);
      fill(c, pal.wallShade, X + w - 16, Y - 6, 7, 12);
      fill(c, pal.ink, X + w - 16, Y - 6, 7, 2);
      fill(c, pal.roofDark, X - 2, Y + roofH - 5, w + 4, 4);
      fill(c, pal.roof, X - 1, Y + 2, w + 2, roofH - 7);
      fill(c, pal.roofLight, X - 1, Y, w + 2, 3);
      for (let i = Y + 6; i < Y + roofH - 6; i += 5) fill(c, pal.roofDark, X - 1, i, w + 2, 1);
      windowAt(c, X + 10, Y + roofH + 5);
      windowAt(c, X + w - 20, Y + roofH + 5);
      fill(c, pal.ink, dx + 3, Y + h - 15, 10, 15);
      fill(c, pal.woodDark, dx + 4, Y + h - 14, 8, 14);
      fill(c, pal.flower1, dx + 10, Y + h - 8, 1, 2);
    } else if (b.kind === 'lab') {
      const roofH = 34;
      fill(c, pal.labShade, X, Y, w, roofH);
      fill(c, pal.ink, X, Y, w, 1);
      for (let i = 0; i < 5; i++) {
        const sx = X + 6 + i * 31;
        fill(c, pal.solar, sx, Y + 6, 26, 22);
        for (let k = 6; k < 22; k += 7) fill(c, pal.solarLine, sx, Y + 6 + k, 26, 1);
        fill(c, pal.solarLine, sx + 13, Y + 6, 1, 22);
      }
      fill(c, pal.ink, X, Y + roofH, w, 2);
      fill(c, pal.labWall, X, Y + roofH + 2, w, h - roofH - 2);
      fill(c, pal.labShade, X, Y + h - 3, w, 3);
      fill(c, pal.ink, X + 6, Y + roofH + 8, w - 12, 14);
      fill(c, pal.glass, X + 7, Y + roofH + 9, w - 14, 12);
      for (let k = X + 22; k < X + w - 8; k += 16) fill(c, pal.ink, k, Y + roofH + 9, 1, 12);
      fill(c, pal.accent, dx - 8, Y + roofH + 26, 32, 3);
      fill(c, pal.ink, dx + 2, Y + h - 16, 12, 16);
      fill(c, pal.glass, dx + 3, Y + h - 15, 10, 15);
      fill(c, pal.ink, dx + 8, Y + h - 15, 1, 15);
    } else {
      const roofH = 22;
      fill(c, pal.wood, X + 1, Y + roofH - 2, w - 2, h - roofH + 2);
      for (let k = X + 4; k < X + w - 2; k += 4) fill(c, pal.woodDark, k, Y + roofH, 1, h - roofH);
      fill(c, pal.roofDark, X - 2, Y + roofH - 4, w + 4, 3);
      fill(c, pal.roof, X - 1, Y + 1, w + 2, roofH - 5);
      fill(c, pal.roofLight, X - 1, Y, w + 2, 2);
      for (let i = Y + 5; i < Y + roofH - 5; i += 5) fill(c, pal.roofDark, X - 1, i, w + 2, 1);
      fill(c, pal.ink, dx + 3, Y + h - 14, 10, 14);
      windowAt(c, X + w - 16, Y + roofH + 6);
    }
  }

  function drawPropStatic(c, p) {
    const X = p.x * TILE, Y = p.y * TILE;
    switch (p.kind) {
      case 'campfire':
        for (let a = 0; a < 8; a++) {
          const ang = a / 8 * Math.PI * 2;
          fill(c, pal.rockDark, X + 7 + Math.round(Math.cos(ang) * 6), Y + 9 + Math.round(Math.sin(ang) * 4), 3, 2);
        }
        fill(c, pal.woodDark, X + 4, Y + 9, 9, 2);
        fill(c, pal.wood, X + 6, Y + 7, 2, 5);
        break;
      case 'sign':
        fill(c, pal.woodDark, X + 7, Y + 6, 2, 10);
        fill(c, pal.ink, X, Y + 1, 16, 9);
        fill(c, pal.wood, X + 1, Y + 2, 14, 7);
        fill(c, pal.woodDark, X + 3, Y + 4, 9, 1);
        fill(c, pal.woodDark, X + 3, Y + 6, 6, 1);
        break;
      case 'rack':
        fill(c, pal.shadow, X + 2, Y + 14, 14, 3);
        fill(c, pal.ink, X + 1, Y - 8, 14, 23);
        fill(c, pal.rack, X + 2, Y - 7, 12, 21);
        for (let k = -5; k < 13; k += 4) fill(c, pal.ink, X + 3, Y + k, 10, 1);
        break;
      case 'dish':
        fill(c, pal.rockDark, X + 7, Y + 4, 2, 11);
        fill(c, pal.rockDark, X + 4, Y + 14, 8, 2);
        disc(c, X + 8, Y + 2, 6, pal.ink);
        disc(c, X + 8, Y + 2, 5, pal.labWall);
        disc(c, X + 7, Y + 1, 3, pal.labShade);
        fill(c, pal.ink, X + 8, Y - 4, 1, 6);
        break;
      case 'easel':
        fill(c, pal.woodDark, X + 3, Y + 4, 2, 12);
        fill(c, pal.woodDark, X + 11, Y + 4, 2, 12);
        fill(c, pal.ink, X + 2, Y - 3, 12, 10);
        fill(c, '#BFE0E6', X + 3, Y - 2, 10, 5);
        fill(c, '#8CB86F', X + 3, Y + 3, 10, 3);
        fill(c, '#F2B33D', X + 9, Y - 1, 2, 2);
        break;
      case 'boat':
        fill(c, pal.ink, X + 1, Y + 4, 14, 8);
        fill(c, pal.wood, X + 2, Y + 5, 12, 6);
        fill(c, pal.woodDark, X + 4, Y + 7, 8, 2);
        fill(c, pal.foam, X + 1, Y + 12, 14, 1);
        break;
    }
  }

  function renderTerrain() {
    const c = terrain.getContext('2d');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) drawGround(c, x, y);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (grid[I(x, y)] === FOREST) drawTree(c, x, y);
    for (const b of buildings) drawBuilding(c, b);
    for (const p of props) drawPropStatic(c, p);
  }

  // ---------- agents ----------
  const AGENTS = [
    { name: 'scout', color: '#F2B33D' },
    { name: 'planner', color: '#E8705C' },
    { name: 'coder', color: '#62BFD0' },
    { name: 'critic', color: '#B790DE' },
    { name: 'runner', color: '#9CD46A' },
    { name: 'scribe', color: '#F4F1E8' }
  ];
  const agents = [];
  let onEvent = () => {};

  function spawnAgents() {
    const start = ['about', 'research', 'life', 'research', 'about', 'life'];
    AGENTS.forEach((a, n) => {
      const choices = pois.filter(p => p.zone === start[n]);
      const p = choices[n % choices.length];
      agents.push({
        ...a, tx: p.x, ty: p.y, x: p.x * TILE + 8, y: p.y * TILE + 13,
        path: [], wait: 0.5 + Math.random() * 3, bubble: 0, action: '', goal: p, facing: 0, phase: Math.random() * 6
      });
    });
  }

  function pickTask(a) {
    const busy = new Set(agents.filter(o => o !== a && o.goal).map(o => o.goal));
    let goal;
    if (Math.random() < 0.22 && pathTiles.length) {
      const [x, y] = pathTiles[Math.floor(Math.random() * pathTiles.length)];
      goal = { x, y, action: 'explore()', zone: null };
    } else {
      const options = pois.filter(p => !busy.has(p) && p !== a.goal);
      goal = options[Math.floor(Math.random() * options.length)];
    }
    if (!goal) { a.wait = 1; return; }
    const p = astar(a.tx, a.ty, goal.x, goal.y, walkCost);
    if (!p) { a.wait = 1; return; }
    a.path = p.slice(1);
    a.goal = goal;
    a.action = goal.action;
  }

  const SPEED = 28;
  function updateAgent(a, dt) {
    if (a.bubble > 0) a.bubble -= dt;
    if (a.path.length) {
      const i = a.path[0], gx = (i % W) * TILE + 8, gy = ((i / W) | 0) * TILE + 13;
      const dx = gx - a.x, dy = gy - a.y, d = Math.hypot(dx, dy), step = SPEED * dt;
      if (Math.abs(dx) > 0.1) a.facing = dx > 0 ? 1 : -1;
      if (d <= step) {
        a.x = gx; a.y = gy; a.tx = i % W; a.ty = (i / W) | 0; a.path.shift();
        if (!a.path.length) {
          a.bubble = 2.8;
          a.wait = 2.8 + Math.random() * 2.5;
          onEvent(a.name, a.action, a.color);
        }
      } else {
        a.x += dx / d * step; a.y += dy / d * step;
      }
    } else if ((a.wait -= dt) <= 0) {
      pickTask(a);
    }
  }

  function drawBot(c, a, t) {
    const moving = a.path.length > 0;
    const bob = moving ? (Math.floor(t * 8 + a.phase) & 1) : (Math.sin(t * 2 + a.phase) > 0.6 ? 1 : 0);
    const X = Math.round(a.x) - 5, Y = Math.round(a.y) - 12 - bob;
    fill(c, pal.shadow, X + 1, Math.round(a.y) - 1, 9, 2);
    // legs
    const step = moving ? (Math.floor(t * 8 + a.phase) & 1) : 0;
    fill(c, pal.ink, X + 2, Y + 10, 2, 2 + (step ? 0 : 1) + bob);
    fill(c, pal.ink, X + 6, Y + 10, 2, 2 + (step ? 1 : 0) + bob);
    // body
    fill(c, pal.ink, X - 1, Y + 2, 12, 9);
    fill(c, a.color, X, Y + 3, 10, 7);
    // face screen
    fill(c, pal.ink, X + 2, Y + 4, 6, 4);
    const blink = Math.sin(t * 1.3 + a.phase * 3) > 0.97;
    const fx = a.facing > 0 ? 1 : a.facing < 0 ? -1 : 0;
    if (!blink) {
      fill(c, '#BFFFE0', X + 3 + fx, Y + 5, 1, 2);
      fill(c, '#BFFFE0', X + 6 + fx, Y + 5, 1, 2);
    }
    // antenna
    fill(c, pal.ink, X + 4, Y - 1, 1, 3);
    const lit = a.bubble > 0 || Math.sin(t * 3 + a.phase) > 0.4;
    fill(c, lit ? '#FFE38A' : pal.ink, X + 3, Y - 2, 3, 2);
  }

  // ---------- frame ----------
  let canvas, ctx, dpr = 1, S = 3, cw = 0, ch = 0;
  const cam = { x: 0, y: 0 }, camTarget = { x: 0, y: 0 };
  let focusZone = 'about', paused = false, dirty = true, last = 0, getFocus, onZoneClick;
  let labelRects = [], hoverZone = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.width = Math.round(window.innerWidth * dpr);
    ch = canvas.height = Math.round(window.innerHeight * dpr);
    computeTarget();
    Object.assign(cam, camTarget);
    dirty = true;
  }

  // The page tells us which part of the screen shows the map (CSS px) and which
  // rects to keep labels out of. The active building is always centered in that area.
  // Zoom depends only on the window size, so switching tabs never changes it.
  let area = { x: 0, y: 0, w: 0, h: 0, avoid: [] };
  function computeTarget() {
    const vw = window.innerWidth, vh = window.innerHeight;
    area = getFocus ? getFocus() : { x: 0, y: 0, w: vw, h: vh, avoid: [] };
    area.avoid = area.avoid || [];
    const fit = Math.min(area.w / village.w, area.h / village.h);
    const css = vw < 760 ? 2 : Math.max(1.5, Math.min(2.5, fit * 1.2));
    S = dpr >= 2 ? Math.max(2, Math.round(css * dpr)) : css;
    const b = buildings.find(bb => bb.kind === KIND[focusZone]);
    camTarget.x = (b.x0 + b.w / 2) * TILE - ((area.x + area.w / 2) * dpr) / S;
    camTarget.y = (b.y0 + b.h / 2 + 0.5) * TILE - ((area.y + area.h / 2) * dpr) / S;
  }

  const KIND = { about: 'cottage', research: 'lab', life: 'boathouse' };

  // Corner brackets around the active building, like a selected unit.
  function drawSelection(t) {
    const b = buildings.find(bb => bb.kind === KIND[focusZone]);
    if (!b) return;
    const off = 4 + (paused ? 0 : Math.round((Math.sin(t * 3) + 1)));
    const x0 = b.x0 * TILE - off, y0 = b.y0 * TILE - off - 4, x1 = (b.x0 + b.w) * TILE + off, y1 = (b.y0 + b.h) * TILE + off;
    const L = 7;
    for (const [col, d] of [[pal.ink, 1], [pal.accent, 0]]) {
      ctx.fillStyle = col;
      const X0 = x0 + d, Y0 = y0 + d, X1 = x1 + d, Y1 = y1 + d;
      ctx.fillRect(X0, Y0, L, 2); ctx.fillRect(X0, Y0, 2, L);
      ctx.fillRect(X1 - L, Y0, L, 2); ctx.fillRect(X1 - 2, Y0, 2, L);
      ctx.fillRect(X0, Y1 - 2, L, 2); ctx.fillRect(X0, Y1 - L, 2, L);
      ctx.fillRect(X1 - L, Y1 - 2, L, 2); ctx.fillRect(X1 - 2, Y1 - L, 2, L);
    }
  }

  // Each building has a label. If a building is off screen, its label is pinned to the
  // edge of the map area with an arrow pointing toward it. Labels are clickable.
  function drawLabels(tx, ty) {
    labelRects = [];
    const fs = Math.round(13 * dpr);
    ctx.font = `600 ${fs}px "Instrument Sans", system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    const m = 14 * dpr;
    const ax0 = area.x * dpr + m, ay0 = area.y * dpr + m, ax1 = (area.x + area.w) * dpr - m, ay1 = (area.y + area.h) * dpr - m;
    for (const k in ZONES) {
      const b = buildings.find(bb => bb.kind === KIND[k]);
      const sx = (b.x0 * TILE + b.w * TILE / 2) * S + tx, sy = (b.y0 * TILE - 12) * S + ty;
      const label = ZONES[k].label;
      const arrowW = 12 * dpr;
      const tw = ctx.measureText(label).width, padX = 9 * dpr, hgt = 24 * dpr, bw = 2 * dpr;
      let w = Math.round(tw + padX * 2);
      let x0 = Math.round(sx - w / 2), y0 = Math.round(sy - hgt);
      const off = x0 < ax0 || y0 < ay0 || x0 + w > ax1 || y0 + hgt > ay1;
      let dir = null;
      if (off) {
        // Pin to the edge, pointing toward the building's center.
        const bx = (b.x0 + b.w / 2) * TILE * S + tx, by = (b.y0 + b.h / 2) * TILE * S + ty;
        const cx = (ax0 + ax1) / 2, cy = (ay0 + ay1) / 2;
        const dx = bx - cx, dy = by - cy;
        dir = Math.abs(dx) / (ax1 - ax0) > Math.abs(dy) / (ay1 - ay0) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
        w += arrowW;
        x0 = Math.round(Math.min(Math.max(bx - w / 2, ax0), ax1 - w));
        y0 = Math.round(Math.min(Math.max(by - hgt / 2, ay0), ay1 - hgt));
        if (dir === 'l') x0 = Math.round(ax0);
        if (dir === 'r') x0 = Math.round(ax1 - w);
        if (dir === 'u') y0 = Math.round(ay0);
        if (dir === 'd') y0 = Math.round(ay1 - hgt);
        for (const r of area.avoid) {
          const rx0 = r.left * dpr - 8 * dpr, ry0 = r.top * dpr - 8 * dpr, rx1 = r.right * dpr + 8 * dpr, ry1 = r.bottom * dpr + 8 * dpr;
          if (x0 < rx1 && x0 + w > rx0 && y0 < ry1 && y0 + hgt > ry0) {
            if (dir === 'l' || dir === 'r') {
              // Move above or below the obstacle, whichever stays on screen.
              const above = ry0 - hgt, below = ry1;
              y0 = Math.round(below + hgt <= ay1 ? (above >= ay0 && y0 + hgt / 2 < (ry0 + ry1) / 2 ? above : below) : above);
            } else {
              x0 = Math.round(rx1);
            }
          }
        }
      }
      const active = k === focusZone, hot = k === hoverZone;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x0 + 3 * dpr, y0 + 3 * dpr, w, hgt);
      ctx.fillStyle = pal.night ? '#0B141A' : '#1F2B30';
      ctx.fillRect(x0, y0, w, hgt);
      ctx.fillStyle = active ? pal.accent : hot ? '#FCE3A4' : pal.labelBg;
      ctx.fillRect(x0 + bw, y0 + bw, w - bw * 2, hgt - bw * 2);
      const ink = active || hot ? '#1F2B30' : pal.labelInk;
      ctx.fillStyle = ink;
      const textX = x0 + padX + (dir === 'l' || dir === 'u' ? arrowW : 0);
      ctx.fillText(label, textX, y0 + hgt / 2 + dpr);
      if (dir) {
        // Small pixel triangle pointing toward the building.
        const u = Math.max(1, Math.round(dpr));
        const ax = dir === 'l' || dir === 'u' ? x0 + padX - 2 * u : x0 + w - padX - 6 * u, ay = y0 + hgt / 2;
        for (let i = 0; i < 4; i++) {
          if (dir === 'r') ctx.fillRect(ax + i * u * 2, ay - (4 - i) * u, 2 * u, (4 - i) * 2 * u);
          if (dir === 'l') ctx.fillRect(ax + (3 - i) * u * 2, ay - (4 - i) * u, 2 * u, (4 - i) * 2 * u);
          if (dir === 'd') ctx.fillRect(ax + i * u, ay - 3 * u + i * u * 2, (8 - i * 2) * u, 2 * u);
          if (dir === 'u') ctx.fillRect(ax + i * u, ay + 3 * u - i * u * 2, (8 - i * 2) * u, 2 * u);
        }
      }
      labelRects.push({ zone: k, x: x0 / dpr, y: y0 / dpr, w: w / dpr, h: hgt / dpr });
    }
  }

  function drawBubble(a, tx, ty) {
    const fs = Math.round(11.5 * dpr);
    ctx.font = `500 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'middle';
    const text = a.action;
    const tw = ctx.measureText(text).width, pad = 6 * dpr, hgt = 20 * dpr, bw = 1.5 * dpr;
    const sx = Math.round(a.x * S + tx), sy = Math.round((a.y - 18) * S + ty);
    const x0 = Math.round(sx - tw / 2 - pad), y0 = sy - hgt - 6 * dpr, w = Math.round(tw + pad * 2);
    ctx.fillStyle = pal.night ? '#E8EFEE' : '#1F2B30';
    ctx.fillRect(x0 - bw, y0 - bw, w + bw * 2, hgt + bw * 2);
    ctx.fillRect(sx - 4 * dpr, y0 + hgt, 8 * dpr, 4 * dpr);
    ctx.fillStyle = pal.night ? '#142430' : '#F6F8F7';
    ctx.fillRect(x0, y0, w, hgt);
    ctx.fillRect(sx - 2.5 * dpr, y0 + hgt, 5 * dpr, 2.5 * dpr);
    ctx.fillStyle = pal.night ? '#E8EFEE' : '#1F2B30';
    ctx.fillText(text, x0 + pad, y0 + hgt / 2 + dpr * 0.5);
  }

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = pal.deep;
    ctx.fillRect(0, 0, cw, ch);
    const tx = -Math.round(cam.x * S), ty = -Math.round(cam.y * S);
    ctx.setTransform(S, 0, 0, S, tx, ty);
    ctx.drawImage(terrain, 0, 0);

    for (const s of sparkles) if (Math.sin(t * 1.6 + s.p) > 0.9) fill(ctx, pal.foam, s.x, s.y, 3, 1);

    for (const p of props) {
      const X = p.x * TILE, Y = p.y * TILE;
      if (p.kind === 'campfire') {
        const f = Math.floor(t * 9);
        const h1 = 4 + Math.floor(hash(f, 1, 7) * 4), h2 = 3 + Math.floor(hash(f, 2, 7) * 3);
        fill(ctx, '#FF8A3D', X + 5, Y + 9 - h1, 6, h1);
        fill(ctx, '#FFD36B', X + 6, Y + 9 - h2, 3, h2);
        if (hash(f, 3, 7) > 0.6) fill(ctx, '#FFD36B', X + 7 + Math.floor(hash(f, 4, 7) * 3), Y - 1, 1, 1);
      } else if (p.kind === 'rack') {
        for (let k = 0; k < 4; k++) {
          const on = hash(Math.floor(t * 3 + k * 1.7), p.x * 7 + k, 9) > 0.35;
          fill(ctx, on ? pal.led : pal.ledOff, X + 4 + (k & 1) * 6, Y - 4 + k * 4, 2, 1);
        }
      } else if (p.kind === 'boat') {
        const bob = Math.sin(t * 1.5) > 0 ? 0 : 1;
        if (bob) fill(ctx, pal.foam, X + 3, Y + 13, 10, 1);
      }
    }

    const sorted = agents.slice().sort((a, b) => a.y - b.y);
    for (const a of sorted) drawBot(ctx, a, t);
    drawSelection(t);

    if (pal.night) {
      ctx.globalCompositeOperation = 'lighter';
      for (const g of glows) {
        const flick = g.fire ? 0.85 + Math.sin(t * 11) * 0.08 + Math.sin(t * 7.3) * 0.07 : 1;
        const gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * flick);
        gr.addColorStop(0, 'rgba(255,186,90,0.32)');
        gr.addColorStop(1, 'rgba(255,186,90,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawLabels(tx, ty);
    for (const a of sorted) if (a.bubble > 0) drawBubble(a, tx, ty);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    const t = now / 1000;
    let moving = false;
    const dx = camTarget.x - cam.x, dy = camTarget.y - cam.y;
    if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
      if (reduceMotion.matches) { cam.x = camTarget.x; cam.y = camTarget.y; }
      else {
        const k = 1 - Math.exp(-dt * 3.2);
        cam.x += dx * k; cam.y += dy * k;
      }
      moving = true;
    }
    if (!paused) for (const a of agents) updateAgent(a, dt);
    if (!paused || moving || dirty) { render(paused ? 0 : t); dirty = false; }
    requestAnimationFrame(frame);
  }

  function zoneAt(clientX, clientY) {
    for (const r of labelRects) {
      if (clientX >= r.x && clientX <= r.x + r.w && clientY >= r.y && clientY <= r.y + r.h) return r.zone;
    }
    const wx = (clientX * dpr + Math.round(cam.x * S)) / S / TILE;
    const wy = (clientY * dpr + Math.round(cam.y * S)) / S / TILE;
    for (const b of buildings) {
      if (wx >= b.x0 - 0.5 && wx <= b.x0 + b.w + 0.5 && wy >= b.y0 - 1 && wy <= b.y0 + b.h + 0.5) {
        return b.kind === 'cottage' ? 'about' : b.kind === 'lab' ? 'research' : 'life';
      }
    }
    return null;
  }

  window.World = {
    init(el, opts = {}) {
      canvas = el;
      ctx = canvas.getContext('2d');
      getFocus = opts.getFocus;
      onZoneClick = opts.onZoneClick || (() => {});
      onEvent = opts.onEvent || (() => {});
      generate();
      renderTerrain();
      spawnAgents();
      resize();
      window.addEventListener('resize', resize);
      canvas.addEventListener('click', e => { const z = zoneAt(e.clientX, e.clientY); if (z) onZoneClick(z); });
      canvas.addEventListener('pointermove', e => {
        const z = zoneAt(e.clientX, e.clientY);
        canvas.style.cursor = z ? 'pointer' : 'default';
        if (z !== hoverZone) { hoverZone = z; dirty = true; }
      });
      canvas.addEventListener('pointerleave', () => { if (hoverZone) { hoverZone = null; dirty = true; } });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dirty = true; });
      requestAnimationFrame(frame);
    },
    focus(zone, instant) {
      if (!ZONES[zone]) return;
      focusZone = zone;
      computeTarget();
      if (instant) Object.assign(cam, camTarget);
      dirty = true;
    },
    setTheme(name) {
      pal = PALETTES[name] || PALETTES.day;
      if (ctx) { renderTerrain(); dirty = true; }
    },
    setPaused(p) { paused = !!p; dirty = true; }
  };
})();
