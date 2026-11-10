
/* =========================================================
   그림: 굵은 잉크 선 + 납작한 색. 하늘·도시 파노라마·대원·먼지몬·자동차
   ========================================================= */
const INK = '#12142b', LW = 2.6;
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const rgba = (h, a) => { const c = hx(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function fin(col, lw = LW) { if (col) { g.fillStyle = col; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = g.lineCap = 'round'; g.stroke(); } }
function rr(x, y, w, h, r = 0) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const box = (x, y, w, h, r, col, lw) => { rr(x, y, w, h, r); fin(col, lw); };
const circ = (x, y, r, col, lw) => { g.beginPath(); g.arc(x, y, r, 0, TAU); fin(col, lw); };
const ell = (x, y, rx, ry, col, lw, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); fin(col, lw); };
const poly = (p, col, lw) => { g.beginPath(); for (let i = 0; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); fin(col, lw); };
const line = (x1, y1, x2, y2, col = INK, w = LW) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.stroke(); };
const limb = (x1, y1, x2, y2, w, col) => { line(x1, y1, x2, y2, INK, w + LW * 2); line(x1, y1, x2, y2, col, w); };
const FONT_D = "'Black Han Sans','Noto Sans KR','Malgun Gothic',sans-serif", FONT_B = "'Noto Sans KR','Malgun Gothic',sans-serif";
function text(s, x, y, size, col = INK, align = 'center', body = false, stroke = 0) { g.font = `${body ? 900 : 400} ${size}px ${body ? FONT_B : FONT_D}`; g.textAlign = align; g.textBaseline = 'middle'; if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = 'round'; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); }
function blob(P, col) { g.lineWidth = LW * 2; g.strokeStyle = INK; for (const [x, y, r] of P) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); } for (const [x, y, r, c] of P) { g.fillStyle = c || col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
function starPath(x, y, r, rot = -Math.PI / 2, n = 5, inner = 0.46) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const rr2 = i % 2 ? r * inner : r, a = rot + i * Math.PI / n; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); }

/* ---------- 하늘 ---------- */
const GY = 440, DW = 420;   // 땅 높이, 작전지 사이 거리
const TOD = { day: ['#1b78e2', '#6ec2ff', '#dff5ff'], sunset: ['#35277a', '#e85d8a', '#ffc46b'], night: ['#060a26', '#16245e', '#3c4496'] };
const STARS = Array.from({ length: 70 }, (_, i) => [rnd(i), rnd(i + 99), rnd(i + 7)]);
const CLOUDS = Array.from({ length: 9 }, (_, i) => ({ x: rnd(i + 20) * 1600, y: 64 + i * 36 + rnd(i + 40) * 22, s: 0.5 + rnd(i + 60) * 0.85, v: 5 + rnd(i + 80) * 10 }));
const hazeCol = (tod) => (tod === 'night' ? '#35323f' : tod === 'sunset' ? '#a8826e' : '#b9aa8c');
function skyCols(tod, cl) { const c = TOD[tod], hz = hazeCol(tod), k = (1 - cl) * 0.8; return [mix(c[0], hz, k * 0.75), mix(c[1], hz, k), mix(c[2], hz, k)]; }
function cloud(x, y, s, col, a = 1) { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.moveTo(x - 34 * s, y + 7 * s); g.arc(x - 30 * s, y - 8 * s, 16 * s, Math.PI * 0.6, Math.PI * 1.5); g.arc(x - 8 * s, y - 22 * s, 20 * s, Math.PI * 1.1, Math.PI * 1.9); g.arc(x + 18 * s, y - 14 * s, 17 * s, Math.PI * 1.35, Math.PI * 0.1); g.arc(x + 34 * s, y - 4 * s, 11 * s, Math.PI * 1.5, Math.PI * 0.5); g.closePath(); g.fill(); g.globalAlpha = 1; }
function drawSky(tod, cl, camX = 0) {
  const c = skyCols(tod, cl), gr = g.createLinearGradient(0, V.T, 0, GY); gr.addColorStop(0, c[0]); gr.addColorStop(0.62, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4);
  if (tod === 'night') { g.fillStyle = '#fff'; for (const [a, b, p] of STARS) { g.globalAlpha = (0.35 + 0.65 * Math.abs(Math.sin(T * (0.6 + p) + p * 9))) * (0.25 + cl * 0.75); const r = 0.8 + p * 1.4; g.fillRect(V.L + a * V.W, V.T + b * (GY - V.T - 70), r, r); } g.globalAlpha = 1; }
  const sun = tod === 'sunset', sx = sun ? 180 : V.R - 60, sy = sun ? GY - 74 : 150, R = sun ? 48 : 30, sc = tod === 'night' ? '#fff3c4' : mix(sun ? '#ffe9a0' : '#fff6c8', '#e58f6a', (1 - cl) * 0.85);
  if (tod !== 'night') { g.save(); g.translate(sx, sy); g.rotate(T * 0.1); g.fillStyle = rgba('#ffffff', 0.07 + cl * 0.1); for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(R * 6, -R * 0.75); g.lineTo(R * 6, R * 0.75); g.closePath(); g.fill(); } g.restore(); }
  circ(sx, sy, R * 1.9, rgba(sc, 0.16), 0); circ(sx, sy, R * 1.42, rgba(sc, 0.28), 0); circ(sx, sy, R, sc, 0);
  if (tod === 'night') circ(sx + 11, sy - 7, R * 0.84, c[0], 0);
  const cc = mix(tod === 'night' ? '#aab4e8' : sun ? '#ffd9d0' : '#ffffff', hazeCol(tod), (1 - cl) * 0.55), span = V.W + 320;
  for (const k of CLOUDS) cloud(V.L - 160 + ((((k.x - camX * 0.12 + T * k.v) % span) + span) % span), k.y, k.s, cc, tod === 'night' ? 0.35 : 0.92);
}

/* ---------- 도시: 먼 산, 건물 두 겹, 땅과 길 ---------- */
function hills(par, camX, base, amp, col, seed) { g.fillStyle = col; g.beginPath(); g.moveTo(V.L - 2, GY + 2); for (let x = V.L - 2; x <= V.R + 14; x += 12) { const wx = x + camX * par; g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(wx * 0.006 + seed)) - amp * 0.4 * Math.sin(wx * 0.017 + seed * 2)); } g.lineTo(V.R + 14, GY + 2); g.closePath(); g.fill(); }
function skyline(par, camX, col, win, seed, hMin, hMax) {
  const unit = 44, off = camX * par, i0 = Math.floor((V.L + off) / unit) - 1, i1 = Math.ceil((V.R + off) / unit) + 1;
  for (let i = i0; i <= i1; i++) { const r = rnd(i + seed), w = 24 + rnd(i * 3 + seed) * 24, h = hMin + r * r * (hMax - hMin), x = i * unit - off; g.fillStyle = col; g.fillRect(x, GY - h, w, h + 2); if (r > 0.62) g.fillRect(x + w * 0.3, GY - h - 9, w * 0.4, 9); if (r < 0.2) { g.beginPath(); g.moveTo(x, GY - h); g.lineTo(x + w / 2, GY - h - 14); g.lineTo(x + w, GY - h); g.fill(); }
    if (win) { g.fillStyle = win; for (let ri = 0, yy = GY - h + 8; yy < GY - 9; yy += 12, ri++) for (let ci = 0, xx = x + 5; xx < x + w - 7; xx += 9, ci++) if (rnd(i * 31 + ri * 7 + ci * 13 + seed) > 0.42) g.fillRect(xx, yy, 4, 6); } }
}
function drawCity(tod, cl, camX) {
  const c = skyCols(tod, cl), dk = tod === 'night' ? 0.5 : tod === 'sunset' ? 0.25 : 0;
  hills(0.1, camX, GY - 70, 80, mix(c[1], mix('#3f69b5', hazeCol(tod), (1 - cl) * 0.5), 0.45), 1.3);
  hills(0.18, camX, GY - 34, 60, mix(c[2], mix('#2f8f6c', hazeCol(tod), (1 - cl) * 0.6), 0.55 + dk * 0.3), 4.1);
  skyline(0.32, camX, mix(c[2], mix('#4a64b8', hazeCol(tod), (1 - cl) * 0.6), 0.6 + dk * 0.25), tod === 'day' ? null : '#ffe9a8', 11, 40, 150);
  skyline(0.58, camX, mix(mix('#34439a', hazeCol(tod), (1 - cl) * 0.45), '#0b1030', dk), tod === 'day' ? 'rgba(255,255,255,.28)' : '#ffd98a', 53, 26, 100);
  const gc = mix(mix('#58c46c', '#9ba27e', (1 - cl) * 0.65), '#0b1030', dk);
  g.fillStyle = gc; g.fillRect(V.L - 2, GY, V.W + 4, V.B - GY + 2);
  g.fillStyle = mix('#3b4162', '#0b1030', dk * 0.8); g.fillRect(V.L - 2, GY + 16, V.W + 4, 46);
  g.fillStyle = '#ffe9a8'; const off = ((camX % 44) + 44) % 44; for (let x = V.L - 44 - off; x < V.R + 44; x += 44) g.fillRect(x, GY + 37, 22, 4);
  g.fillStyle = mix('#ece7d2', '#0b1030', dk); g.fillRect(V.L - 2, GY + 62, V.W + 4, 7);
  g.fillStyle = mix(gc, '#0b1030', 0.12); for (let x = V.L - 60 - (((camX * 1.25) % 60) + 60) % 60; x < V.R + 60; x += 60) { g.beginPath(); g.ellipse(x + 30, GY + 100, 26, 6, 0, 0, TAU); g.fill(); }
  line(V.L - 2, GY, V.R + 2, GY, INK, 3);
  // 앞쪽: 가로수와 덤불 (가까울수록 빨리 지나감)
  const tc = mix(mix('#3fbf5a', '#8f9a72', (1 - cl) * 0.6), '#0b1030', dk), tl = mix(tc, '#ffffff', 0.25);
  for (let i = Math.floor((V.L + camX * 1.12) / 150) - 1; i <= Math.ceil((V.R + camX * 1.12) / 150); i++) { const x = i * 150 + 60 - camX * 1.12, r = 15 + rnd(i + 3) * 6, y = GY + 108; box(x - 3.5, y - 22, 7, 24, 2, mix('#8a5a3c', '#0b1030', dk)); circ(x, y - 22 - r * 0.7, r, tc); circ(x - r * 0.35, y - 22 - r * 0.95, r * 0.28, tl, 0); }
  const by = Math.max(GY + 160, V.B - 24), bc = mix(mix('#2f9e4f', '#7f8a66', (1 - cl) * 0.6), '#0b1030', dk);
  for (let i = Math.floor((V.L + camX * 1.4) / 64) - 1; i <= Math.ceil((V.R + camX * 1.4) / 64); i++) { const x = i * 64 - camX * 1.4, r = 22 + rnd(i + 17) * 14; circ(x, by + 10, r, bc); if (rnd(i + 41) > 0.5) { circ(x - 6, by - r * 0.45 + 10, 3.2, ['#ffd23f', '#ff8fb1', '#ffffff'][i & 1 ? 0 : (i % 3 + 3) % 3], 1.5); } }
}
function hazeOver(cl, tod = 'day') { if (cl > 0.97) return; const gr = g.createLinearGradient(0, GY + 60, 0, V.T), h = hazeCol(tod), a = (1 - cl) * 0.5; gr.addColorStop(0, rgba(h, a)); gr.addColorStop(0.55, rgba(h, a * 0.6)); gr.addColorStop(1, rgba(h, a * 0.25)); g.fillStyle = gr; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4); }

/* ---------- 작전지 여섯 곳 (땅 위 (0,0) 기준) ---------- */
const INV = ['..X..X..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '.X.XX.X.'];
const LM = [
  (t) => { // 먼지 연구소
    line(-64, -84, -64, -150, INK, 4); box(-100, -180, 72, 32, 8, INK, 0); text('PM2.5', -64, -163, 17, '#19d3a2');
    g.save(); g.translate(14, -120); g.rotate(-0.75 + Math.sin(t * 0.6) * 0.1); box(-7, -40, 14, 46, 4, '#fff'); box(-10, -46, 20, 10, 3, '#ffd23f'); g.restore();
    g.beginPath(); g.arc(4, -84, 50, Math.PI, 0); g.closePath(); fin('#7fe9e0'); g.beginPath(); g.arc(4, -84, 50, Math.PI * 1.08, Math.PI * 1.3); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 5; g.stroke();
    box(-76, -84, 156, 84, 6, '#f2f6ff'); box(-76, -84, 156, 15, 6, '#19c9a0'); for (let i = 0; i < 4; i++) box(-62 + i * 34, -58, 24, 22, 4, i === 1 ? '#ffd23f' : '#9fe3ff'); box(-10, -30, 26, 30, 3, '#2f9bff');
    for (let k = 0; k < 3; k++) circ(62 + Math.cos(t * 1.2 + k * 2.1) * 16, -150 + Math.sin(t * 1.2 + k * 2.1) * 12, 7 - k * 1.5, ['#5b586f', '#ff8a5c', '#7b5cff'][k], 2);
  },
  (t, done, bare) => { // 5등급 검문소
    box(-100, -150, 13, 150, 3, '#cfd6e6'); box(87, -150, 13, 150, 3, '#cfd6e6'); box(-108, -162, 216, 17, 4, '#8f9bb8');
    box(-82, -220, 164, 54, 9, '#2f9bff'); text('5등급 운행제한', 0, -201, 18, '#fff'); text('평일 06~21시', 0, -180, 12.5, '#ffd23f', 'center', true);
    for (const x of [-52, 0, 52]) { box(x - 10, -147, 20, 13, 3, INK, 0); circ(x, -139, 3.4, ((t * 2 + x) | 0) % 2 ? '#ff5a5f' : '#7fe9ff', 0); }
    if (!bare) drawCar(((t * 70) % 420) - 210, 52, 0.6, { col: '#ffd23f' });
  },
  (t, done) => { // 비상 상황실
    box(-36, -200, 72, 200, 6, '#27306b'); for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) box(-27 + c * 20, -152 + r * 20, 14, 12, 2, rnd(r * 3 + c + 5) > 0.35 ? '#ffe9a8' : '#3c4a9a', 0);
    box(-58, -238, 116, 42, 10, '#ff5a5f'); box(-47, -230, 94, 24, 5, INK, 0);
    for (let i = 0; i < 6; i++) { const h = 4 + 14 * Math.abs(Math.sin(t * 1.3 + i)); g.fillStyle = i > 3 ? '#ff5a5f' : '#19d3a2'; g.fillRect(-41 + i * 14.5, -209 - h, 9, h); }
    line(0, -238, 0, -262, INK, 3.4); const on = !done && ((t * 2) | 0) % 2;
    if (!done) { g.fillStyle = 'rgba(255,90,95,.22)'; for (const a of [t * 3, t * 3 + Math.PI]) { g.beginPath(); g.moveTo(0, -268); g.arc(0, -268, 90, a, a + 0.5); g.closePath(); g.fill(); } }
    circ(0, -268, 10, on ? '#ff5a5f' : '#ffd23f'); box(-54, -9, 108, 9, 2, '#8f9bb8');
  },
  (t, done) => { // 굴뚝 공단
    for (const [x, s] of [[-66, 1], [-10, 0.84]]) { g.save(); g.translate(x, 0); g.scale(s, s); g.beginPath(); g.moveTo(-31, 0); g.quadraticCurveTo(-12, -62, -23, -116); g.lineTo(23, -116); g.quadraticCurveTo(12, -62, 31, 0); g.closePath(); fin('#e8ecf5'); line(-20, -102, 20, -102, '#ff5a5f', 6); g.restore(); for (let i = 0; i < 3; i++) { const p = (t * 0.25 + i / 3) % 1; g.globalAlpha = (1 - p) * 0.8; circ(x + Math.sin(p * 4 + i) * 8, -122 * s - p * 60, 10 + p * 16, '#fff', 0); } g.globalAlpha = 1; }
    box(18, -50, 82, 50, 3, '#ffb020'); for (let i = 0; i < 3; i++) poly([18 + i * 27.3, -50, 18 + i * 27.3, -70, 45.3 + i * 27.3, -50], '#e08a10'); box(30, -30, 16, 16, 2, '#9fe3ff'); box(54, -30, 16, 16, 2, '#9fe3ff');
    box(60, -196, 24, 196, 3, '#fff'); for (let i = 0; i < 4; i++) { g.fillStyle = '#ff5a5f'; g.fillRect(61.3, -194 + i * 50, 21.4, 24); } box(60, -196, 24, 196, 3, null);
    if (!done) { for (let i = 0; i < 6; i++) { const p = (t * 0.3 + i / 6) % 1; g.globalAlpha = (1 - p) * 0.8; circ(72 + Math.sin(p * 5 + i) * 12 + p * 34, -202 - p * 100, 9 + p * 24, '#5b586f', 0); } g.globalAlpha = 1; }
  },
  (t) => { // 우리 동네
    for (const x of [-128, 112]) { box(x - 4.5, -36, 9, 36, 2, '#8a5a3c'); circ(x, -56, 23, '#3fbf5a'); circ(x - 8, -62, 6, '#7fe08f', 0); }
    line(36, -108, 36, -164, INK, 3.4); poly([36, -164, 60 + Math.sin(t * 5) * 3, -156 + Math.sin(t * 5 + 1) * 2, 36, -147], '#19d3a2');
    box(-18, -94, 108, 94, 4, '#fff3d6'); box(-25, -107, 122, 15, 4, '#ff5a5f'); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) if (!(r === 1 && (c === 1 || c === 2))) box(-8 + c * 25, -82 + r * 32, 16, 18, 2, '#9fe3ff');
    box(24, -34, 24, 34, 2, '#8a5a3c'); circ(36, -120, 12, '#fff'); line(36, -120, 36, -127, INK, 2); line(36, -120, 41, -118, INK, 2);
    box(-100, -58, 66, 58, 4, '#ffd23f'); poly([-109, -56, -67, -96, -25, -56], '#2f9bff'); box(-76, -30, 18, 30, 2, '#8a5a3c'); box(-95, -46, 15, 15, 2, '#9fe3ff'); box(-52, -46, 15, 15, 2, '#9fe3ff');
  },
  (t) => { // 오락실
    box(-72, -152, 144, 152, 12, '#5b3fd6'); box(-60, -142, 120, 32, 7, INK); text('ARCADE', 0, -125, 21, ((t * 2.5) | 0) % 2 ? '#ffd23f' : '#ff5a5f');
    box(-50, -102, 100, 64, 7, '#0b1030'); const f = ((t * 3) | 0) % 2; g.fillStyle = '#19d3a2'; INV.concat([f ? '.X....X.' : 'X......X']).forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') g.fillRect(-24 + i * 6, -90 + j * 6 + (f ? 2 : 0), 6, 6); }));
    g.fillStyle = '#ffd23f'; g.fillRect(-3, -50 - ((t * 20) % 16), 3, 6);
    box(-60, -34, 120, 16, 5, '#3c2a9a'); line(-32, -34, -32, -47, INK, 4); circ(-32, -49, 6, '#ff5a5f'); circ(8, -26, 4.5, '#ffd23f', 2); circ(26, -26, 4.5, '#19d3a2', 2);
    for (let i = 0; i < 5; i++) { const a = t * 1.5 + i * 1.26; g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4 + i * 2); starPath(Math.cos(a) * 96, -168 + Math.sin(a) * 26 - 20, 6); fin(['#ffd23f', '#ff5a5f', '#19d3a2'][i % 3], 1.6); } g.globalAlpha = 1;
  },
];

/* ---------- 대원 (구름보드를 탄 주인공) ---------- */
const SKIN = ['#ffdcc0', '#f6c49c', '#d69a6e', '#8f5c3d'];
const HAIRC = ['#2b2440', '#6a4326', '#f2c230', '#ff7b54', '#3aa0ff', '#19c9a0', '#f478b6', '#f4f4ff'];
const SUITC = ['#2f9bff', '#19c9a0', '#3fbf5a', '#ff5a5f', '#ffb020', '#7b5cff', '#f478b6', '#3d4466', '#ffffff'];
const SCARFC = ['#ffd23f', '#ff5a5f', '#ffffff', '#19d3a2', '#2f9bff', '#f478b6', '#7b5cff', '#12142b'];
const TYPES = [{ n: '바람', d: '바람처럼 빠른 대원', suit: 0, scarf: 0 }, { n: '이슬', d: '맑은 물방울 대원', suit: 1, scarf: 2 }, { n: '새싹', d: '숲을 지키는 대원', suit: 2, scarf: 0 }, { n: '햇살', d: '따뜻한 햇살 대원', suit: 4, scarf: 1 }];
const HAIRN = ['삐죽', '단발', '포니테일', '양갈래', '곱슬', '후드'], EYEN = ['동글', '또렷', '반짝'], GEARN = ['없음', '고글', '바이저', '헤드셋', '새싹'], BOARDN = ['구름', '번개', '잎사귀', '별'];
const cap = (y) => { g.beginPath(); g.moveTo(-25.5, y); g.quadraticCurveTo(-28, -113.5, 0, -113.5); g.quadraticCurveTo(28, -113.5, 25.5, y); };
const HAIR = [
  [(t, c) => poly([-27, -82, -34, -100, -24, -99, -27, -116, -12, -108, -5, -122, 6, -109, 17, -119, 19, -104, 32, -106, 27, -82], c),
    (t, c) => poly([-25, -89, -23, -104, 0, -111, 23, -104, 25, -89, 17, -97, 12, -88, 5, -98, 0, -89, -7, -98, -13, -88, -18, -97], c)],
  [(t, c) => box(-29.5, -114, 59, 55, 24, c),
    (t, c) => { cap(-87); g.quadraticCurveTo(13, -99, 0, -97); g.quadraticCurveTo(-13, -99, -25.5, -87); g.closePath(); fin(c); }],
  [(t, c) => { ell(32, -97 + Math.sin(t * 4) * 1.5, 9, 22, c, LW, 0.55 + Math.sin(t * 4) * 0.12); box(-27, -113.5, 54, 30, 20, c); },
    (t, c) => { cap(-88); g.quadraticCurveTo(15, -105, -6, -100); g.quadraticCurveTo(-19, -98, -25.5, -88); g.closePath(); fin(c); circ(23.5, -107, 4, '#ff5a5f', 1.8); }],
  [(t, c) => { circ(-22, -110, 11.5, c); circ(22, -110, 11.5, c); box(-27, -113.5, 54, 30, 20, c); },
    (t, c) => { cap(-88); g.quadraticCurveTo(16, -98, 0, -104); g.quadraticCurveTo(-16, -98, -25.5, -88); g.closePath(); fin(c); }],
  [(t, c) => { const P = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.98 + i * 0.13); P.push([Math.cos(a) * 25, -88 + Math.sin(a) * 24, 10.5]); } blob(P, c); },
    (t, c) => blob([[-17, -101, 8], [-6, -106, 8.5], [6, -106, 8.5], [17, -101, 8]], c)],
  [(t, c, s) => { poly([-25, -104, -21, -125, -7, -112], s); poly([25, -104, 21, -125, 7, -112], s); ell(0, -88, 29.5, 27.5, s); },
    (t, c, s) => { cap(-86); g.quadraticCurveTo(14, -103, 0, -103); g.quadraticCurveTo(-14, -103, -25.5, -86); g.closePath(); fin(s); poly([-9, -102.5, 1, -93, 8, -102.5], c, 1.8); }],
];
function drawGear(gi, t) {
  if (gi === 1) { g.beginPath(); g.moveTo(-24.5, -98); g.quadraticCurveTo(0, -109, 24.5, -98); g.lineCap = 'round'; g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.6; g.strokeStyle = '#4a5072'; g.stroke(); for (const x of [-15.5, 2.5]) { box(x, -110.5, 13, 11, 4.5, '#7fe9ff', 2.2); line(x + 3.2, -106.5, x + 6, -103.5, '#fff', 1.7); } }
  else if (gi === 2) { line(-22, -86, -27, -89, INK, 3.4); line(22, -86, 27, -89, INK, 3.4); box(-22.5, -93, 45, 14.5, 7, 'rgba(90,235,255,.52)', 2.3); line(-16, -89.5, -6, -89.5, 'rgba(255,255,255,.95)', 2.2); line(-2, -89.5, 1, -89.5, 'rgba(255,255,255,.95)', 2.2); }
  else if (gi === 3) { g.beginPath(); g.arc(0, -88, 27.5, Math.PI * 1.1, Math.PI * 1.9); g.lineCap = 'round'; g.lineWidth = 7.5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.2; g.strokeStyle = '#ff5a5f'; g.stroke(); box(-32, -96, 9.5, 17, 4, '#3d4466'); box(22.5, -96, 9.5, 17, 4, '#3d4466'); line(-27, -80, -15, -71.5, INK, 2.3); circ(-14, -71.5, 2.8, INK, 0); }
  else if (gi === 4) { const s = Math.sin(t * 3) * 0.12; line(0, -111, 0, -122, INK, 5.6); line(0, -111, 0, -122, '#1f8f3f', 2.6); ell(-6.5, -125, 7, 3.8, '#3fbf5a', 2, -0.5 + s); ell(6.5, -126, 7, 3.8, '#7fe08f', 2, 0.5 - s); }
}
function drawBoard(b, t) {
  if (b === 0) blob([[-27, 3, 12, '#d5e9ff'], [27, 3, 11, '#d5e9ff'], [-12, 6, 12, '#d5e9ff'], [12, 6, 12, '#d5e9ff'], [-18, -3, 12], [0, -5, 14], [18, -3, 12]], '#ffffff');
  else if (b === 1) { const f = Math.sin(t * 30) * 1.5; ell(-22, 11, 8, 4 + f, '#7fe9ff', 0); ell(20, 11, 8, 4 - f, '#7fe9ff', 0); g.save(); g.rotate(-0.04); box(-42, -5, 84, 12, 6, '#ffd23f'); box(28, -7, 17, 9, 4.5, '#ff5a5f'); poly([-12, -4, 0, -4, -5, 0, 6, 0, -8, 6, -5, 1, -14, 1], INK, 0); g.restore(); }
  else if (b === 2) { g.beginPath(); g.moveTo(-44, 3); g.quadraticCurveTo(-8, -17, 44, -3); g.quadraticCurveTo(6, 17, -44, 3); fin('#3fbf5a'); line(-36, 2.5, 32, -1.5, '#1f8f3f', 2.2); for (const x of [-18, 0, 16]) { line(x, 1, x + 7, -5, '#1f8f3f', 1.6); line(x, 1, x + 8, 5, '#1f8f3f', 1.6); } }
  else { for (let i = 0; i < 3; i++) { g.globalAlpha = 0.75 - i * 0.22; starPath(-50 - i * 13, 2 + Math.sin(t * 6 + i) * 3, 5 - i); fin('#ffd23f', 0); } g.globalAlpha = 1; box(-40, -5, 80, 12, 6, '#7b5cff'); starPath(0, 0.5, 8); fin('#ffd23f', 1.8); circ(-24, 1, 2.5, '#fff', 0); circ(24, 1, 2.5, '#fff', 0); }
}
function emblem(ty, c) {
  if (ty === 0) { g.beginPath(); g.arc(0, -52, 3.2, 0.3, Math.PI * 1.7); g.lineWidth = 2; g.strokeStyle = c; g.lineCap = 'round'; g.stroke(); }
  else if (ty === 1) { g.beginPath(); g.moveTo(0, -56.5); g.quadraticCurveTo(4.6, -50.5, 0, -48.2); g.quadraticCurveTo(-4.6, -50.5, 0, -56.5); fin(c, 0); }
  else if (ty === 2) { ell(-2.2, -52, 3, 1.7, c, 0, -0.7); ell(2.2, -52.6, 3, 1.7, c, 0, 0.7); }
  else { circ(0, -52, 2.2, c, 0); for (let i = 0; i < 6; i++) { const a = i * TAU / 6; line(Math.cos(a) * 3.4, -52 + Math.sin(a) * 3.4, Math.cos(a) * 4.8, -52 + Math.sin(a) * 4.8, c, 1.3); } }
}
const ARMS = { idle: [-23, -43, 22, -44], cheer: [-29, -80, 29, -80], fly: [-30, -50, 28, -68], point: [-23, -43, 31, -75], sad: [-18, -40, 18, -40], hold: [-20, -52, 20, -52] };
function drawHero(x, y, k, L, t, o = {}) { // (x, y) = 보드 가운데. o: pose, face, lean, flip, wind(0~1), noBoard, still
  const face = o.face || 'smile', skin = SKIN[L.skin], suit = SUITC[L.suit], sdk = mix(suit, INK, 0.32), hair = HAIRC[L.hairCol], sc = SCARFC[L.scarf], wind = o.wind === undefined ? 0.6 : o.wind, A = ARMS[o.pose] || ARMS.idle;
  g.save(); g.translate(x, y + (o.still ? 0 : Math.sin(t * 3.2) * 3 * k)); g.scale(k * (o.flip ? -1 : 1), k); g.rotate(o.lean || 0);
  if (!o.noBoard) drawBoard(L.board, t);
  g.beginPath(); g.moveTo(-9, -62); for (let i = 1; i <= 6; i++) g.lineTo(-9 - i * 7.5 * (0.5 + 0.5 * wind), -62 + i * 3 * (1 - wind) + Math.sin(t * 7 - i * 0.9) * (0.6 + i * 0.75)); g.lineJoin = g.lineCap = 'round'; g.lineWidth = 11.5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 6.4; g.strokeStyle = sc; g.stroke();
  HAIR[L.hair][0](t, hair, suit);
  limb(-7, -36, -10, -15, 9, sdk); limb(7, -36, 10, -15, 9, sdk); box(-18.5, -17, 16, 10.5, 5, '#fff'); box(2.5, -17, 16, 10.5, 5, '#fff');
  box(-15, -65, 30, 33, 10, suit); box(-15, -41, 30, 6.5, 2, INK, 0); box(-4, -42, 8, 8.5, 2, '#ffd23f', 1.6); circ(0, -52, 6.3, '#fff', 1.8); emblem(L.type, suit);
  box(-13.5, -68.5, 27, 9, 4.5, sc);
  limb(-14, -58, A[0], A[1], 8, suit); limb(14, -58, A[2], A[3], 8, suit); circ(A[0], A[1], 5.2, skin); circ(A[2], A[3], 5.2, skin);
  ell(0, -86, 24.5, 22.5, skin);
  const blink = !o.still && t % 3.7 < 0.12, ey = -85;
  for (const s of [-1, 1]) { const ex = s * 9.5;
    if (blink || face === 'happy') { g.beginPath(); g.arc(ex, ey + 1.5, 4.2, Math.PI * 1.15, Math.PI * 1.85); g.lineWidth = 2.5; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
    else { const big = L.eye === 2; ell(ex, ey, big ? 4.7 : 3.9, big ? 6.1 : 5.3, INK, 0); circ(ex + 1.3, ey - 2, big ? 1.9 : 1.45, '#fff', 0); if (big) circ(ex - 1.5, ey + 2.2, 0.95, '#fff', 0); }
    if (face === 'sad') line(ex - s * 5.5, ey - 10.5, ex + s * 4.5, ey - 7.5, INK, 2.4); else if (L.eye === 1 && !blink && face !== 'happy') line(ex - s * 5.5, ey - 7.6, ex + s * 4.5, ey - 9.8, INK, 2.4);
    ell(s * 16, -77.5, 4.3, 2.5, 'rgba(255,105,130,.42)', 0); }
  if (face === 'open' || face === 'happy') { g.beginPath(); g.arc(0, -77.5, 5.2, 0, Math.PI); g.closePath(); fin('#b8323a', 2); }
  else if (face === 'wow') circ(0, -74.5, 2.9, '#b8323a', 2);
  else { g.beginPath(); if (face === 'sad') g.arc(0, -70.5, 4.6, Math.PI * 1.2, Math.PI * 1.8); else g.arc(0, -78.5, 4.6, Math.PI * 0.2, Math.PI * 0.8); g.lineWidth = 2.3; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
  HAIR[L.hair][1](t, hair, suit); drawGear(L.gear, t);
  g.restore();
}
function faceTo(c, L) { const old = g, x = c.getContext('2d'), k = c.width / 64; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); g = x; drawHero(c.width / 2, c.height * 0.56 + 86 * k, k, L, 1, { noBoard: 1, still: 1, wind: 0.2 }); g = old; }

/* ---------- 먼지몬 · 자동차 ---------- */
const MONC = { smog: ['#4b4860', '#6d6a88'], soot: ['#34313f', '#55526a'], fire: ['#ff6a2b', '#ffc93c'], dust: ['#c9a66b', '#e6cf9c'], gas: ['#7a5cc0', '#a58cf0'] };
function drawMon(x, y, r, kind, t, o = {}) { // o: ph, mood('angry'|'scared'|'laugh'), look(-1~1), a
  const [c1, c2] = MONC[kind] || MONC.smog, ph = o.ph || 0, lk = o.look || 0;
  g.save(); g.translate(x, y); if (o.a !== undefined) g.globalAlpha = o.a;
  g.beginPath(); for (let i = 0; i <= 44; i++) { const a = i / 44 * TAU; let q = r * (1 + 0.09 * Math.sin(a * 3 + t * 2.2 + ph) + 0.06 * Math.sin(a * 5 - t * 3.1 + ph * 2)); if (kind === 'fire') q *= 1 + 0.55 * Math.max(0, Math.cos(a + Math.PI / 2 + Math.sin(t * 5 + ph) * 0.25)) ** 6; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); fin(c1, Math.max(1.8, Math.min(LW, r * 0.14)));
  ell(-r * 0.28, -r * 0.38, r * 0.34, r * 0.2, rgba(c2, 0.8), 0, -0.5);
  if (kind === 'dust') for (let i = 0; i < 5; i++) circ(Math.cos(i * 2.4 + ph) * r * 0.6, Math.sin(i * 2.4 + ph) * r * 0.6 + r * 0.15, r * 0.07, '#9a7a44', 0);
  const er = r * 0.23, ex = r * 0.36, ey = -r * 0.05, lw = Math.max(1.4, r * 0.1);
  for (const s of [-1, 1]) { ell(s * ex, ey, er, er * 1.12, '#fff', lw * 0.8); circ(s * ex + lk * er * 0.45, ey + er * 0.2, er * 0.46, INK, 0);
    if (o.mood === 'scared') line(s * (ex + er), ey - er * 0.9, s * (ex - er * 0.9), ey - er * 1.7, INK, lw * 1.2); else line(s * (ex + er * 1.1), ey - er * 1.7, s * (ex - er * 0.9), ey - er * 0.75, INK, lw * 1.3); }
  g.lineWidth = lw; g.strokeStyle = INK; g.lineCap = 'round'; g.beginPath();
  if (o.mood === 'scared') { g.ellipse(0, r * 0.52, r * 0.14, r * 0.18, 0, 0, TAU); g.fillStyle = INK; g.fill(); }
  else if (o.mood === 'laugh') { g.arc(0, r * 0.36, r * 0.3, 0.1, Math.PI - 0.1); g.closePath(); g.fillStyle = '#2a1830'; g.fill(); g.stroke(); }
  else { g.arc(0, r * 0.72, r * 0.3, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  g.restore();
}
function drawCar(x, y, k, o = {}) { // (x, y) = 바퀴가 닿는 바닥 가운데. 오른쪽을 보고 달림. o: col, kind('car'|'truck'|'bus'|'amb'|'ev'), dir, smoke, t
  const c = o.col || '#ffd23f', kind = o.kind || 'car', t = o.t || T, bob = Math.sin(t * 18 + x * 0.05) * 0.6;
  g.save(); g.translate(x, y); g.scale(k * (o.dir || 1), k);
  if (o.smoke) for (let i = 0; i < 3; i++) { const p = (t * 1.2 + i / 3) % 1; g.globalAlpha = (1 - p) * 0.7; circ(-52 - p * 30, -12 - p * 16, 5 + p * 10, '#4b4860', 0); } g.globalAlpha = 1;
  g.translate(0, bob);
  if (kind === 'bus') { box(-56, -56, 112, 48, 9, c); box(-48, -48, 96, 18, 4, '#bfeaff'); for (const xx of [-24, 0, 24]) line(xx, -48, xx, -30, INK, 2.2); box(-56, -22, 112, 6, 0, '#fff', 0); box(40, -30, 12, 20, 3, '#bfeaff', 2); }
  else if (kind === 'truck') { box(-54, -46, 70, 38, 3, mix(c, '#ffffff', 0.25)); box(16, -40, 36, 32, 7, c); box(28, -34, 18, 13, 3, '#bfeaff', 2.2); box(-60, -16, 8, 5, 2, '#5b586f', 2); }
  else { g.beginPath(); g.moveTo(-26, -24); g.lineTo(-16, -44); g.lineTo(18, -44); g.lineTo(32, -24); g.closePath(); fin(c); g.beginPath(); g.moveTo(-18, -25); g.lineTo(-11, -39); g.lineTo(-1, -39); g.lineTo(-1, -25); g.closePath(); fin('#bfeaff', 2); g.beginPath(); g.moveTo(4, -25); g.lineTo(4, -39); g.lineTo(15, -39); g.lineTo(24, -25); g.closePath(); fin('#bfeaff', 2); box(-46, -27, 92, 21, 9, c); circ(40, -18, 3, '#fff3b0', 1.6);
    if (kind === 'amb') { box(-12, -24, 15, 5, 0, '#ff5a5f', 0); box(-7, -29, 5, 15, 0, '#ff5a5f', 0); box(-2, -52, 12, 8, 3, ((t * 5) | 0) % 2 ? '#ff5a5f' : '#7fe9ff', 2); }
    if (kind === 'ev') poly([-6, -24, 2, -24, -1, -18, 5, -18, -6, -8, -3, -15, -9, -15], '#fff', 1.4); }
  for (const xx of kind === 'bus' ? [-34, 34] : kind === 'truck' ? [-32, 32] : [-26, 26]) { circ(xx, -8 - bob, 9, INK, 0); circ(xx, -8 - bob, 4, '#cfd6e6', 0); }
  g.restore();
}
