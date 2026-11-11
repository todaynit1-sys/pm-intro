'use strict';
/* =========================================================
   하늘 수비대 — 미세먼지 계절관리제 대작전
   그림은 모두 코드로 그린 벡터 모션그래픽(캔버스), 글자는 그 위에 또렷하게 얹음. 그림 파일·게임 엔진 없음.
   이 파일(index.html)은 src/ 의 조각들을 build.mjs 로 이어 붙여 만든 것 — 고칠 때는 src/ 를 고치고 `node src/build.mjs`.
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a), pick = (a) => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, TAU = Math.PI * 2;
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const E = { out: (t) => 1 - (1 - t) ** 3, io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2), back: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2, expo: (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)), lin: (t) => t };

/* ---------- 수치 (제7차 계절관리제 자료 기준) · 저장 ---------- */
const F = { start: 33, now: 20, goal: 19, round: '제7차(’25.12~’26.3)' };
const ORG = '';                 // 인증서 아래에 넣을 기관 이름 (비우면 넣지 않음)
const KEY = 'sky-hq-v1';
const LOOK0 = { type: 0, hair: 0, hairCol: 0, skin: 0, eye: 1, suit: 0, scarf: 0, gear: 1, board: 0 };
const S = { name: '', look: { ...LOOK0 }, made: 0, stars: {}, best: {}, fin: 0, mute: 0, sel: 0 };
try { const o = JSON.parse(localStorage.getItem(KEY)); if (o) { Object.assign(S, o); S.look = { ...LOOK0, ...(o.look || {}) }; } } catch (e) { /* 저장 못 하는 환경 */ }
const save = () => { if (EMBED) return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
const MIDS = ['lab', 'road', 'room', 'plant', 'town'];
const starSum = () => MIDS.reduce((a, k) => a + (S.stars[k] || 0), 0), doneN = () => MIDS.filter((k) => S.stars[k]).length;
const pmNow = () => Math.round(F.start - 2 * doneN() - 0.4 * (starSum() - doneN()));   // 작전을 마칠수록 33 → 19
const cleanNow = () => clamp((F.start - pmNow()) / (F.start - F.goal), 0, 1);
const gradeOf = (v) => (v <= 15 ? ['좋음', '#2f7de1'] : v <= 35 ? ['보통', '#1fae6e'] : v <= 75 ? ['나쁨', '#e59a00'] : ['매우 나쁨', '#e5484d']);
const rankOf = () => { const n = starSum(); return n >= 15 ? '푸른하늘 수비대장' : n >= 11 ? '하늘 지킴이' : n >= 6 ? '든든한 수비대원' : n >= 1 ? '새내기 수비대원' : '수습 대원'; };
const starHtml = (n, max = 3) => '<b>' + '★'.repeat(n) + '</b>' + '★'.repeat(max - n);

/* ---------- 소리: 부드러운 합성음 (파일 없음) ---------- */
const AU = (() => {
  let ctx = null, muted = !!S.mute, nz = null, song = null, step = 0, nextT = 0;
  const init = () => { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); nz = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); const d = nz.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } else if (ctx.state === 'suspended') ctx.resume(); };
  const live = () => ctx && !muted && ctx.state === 'running';
  const tone = (f, dur, { type = 'triangle', vol = 0.07, to = f, at = 0, a = 0.006 } = {}) => { if (!live()) return; const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to !== f) o.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.03); };
  const noise = (dur, vol = 0.08, at = 0, hp = 0) => { if (!live()) return; const t = ctx.currentTime + at, s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = nz; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); if (hp) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; s.connect(f).connect(g); } else s.connect(g); g.connect(ctx.destination); s.start(t); s.stop(t + dur); };
  const hz = (n) => 261.63 * Math.pow(2, n / 12);
  const SONGS = { hub: { bpm: 100, ch: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]] }, game: { bpm: 140, ch: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], hat: 1 }, calm: { bpm: 54, ch: [[0, 4, 7, 11], [-7, -3, 0, 4], [-3, 0, 4, 7], [-5, -1, 2, 5]], pad: 1 } };
  setInterval(() => {
    if (!live() || !song) return; const now = ctx.currentTime; if (nextT < now) nextT = now + 0.05; const beat = 60 / song.bpm / 2;
    while (nextT < now + 0.3) {
      const c = song.ch[(step >> 3) % 4], i = step & 7, at = nextT - now;
      if (song.pad) { if (i === 0) c.forEach((n, k) => tone(hz(n), beat * 9, { type: 'sine', vol: 0.03, at: at + k * 0.09, a: 0.5 })); if (i === 4 || i === 6) tone(hz(c[(step >> 1) % c.length] + 12), beat * 3, { type: 'sine', vol: 0.022, at, a: 0.04 }); }
      else { tone(hz(c[[0, 1, 2, 1, 0, 2, 1, 2][i]] + 12), beat * 0.95, { vol: 0.03, at }); if (i % 4 === 0) tone(hz(c[0] - 12), beat * 3.2, { type: 'sine', vol: 0.085, at }); if (song.hat && i % 2) noise(0.03, 0.022, at, 6000); if (song.hat && i === 4) noise(0.08, 0.03, at, 1500); }
      step++; nextT += beat;
    }
  }, 100);
  const seq = (ns, d, o = {}) => ns.forEach((n, i) => tone(hz(n), d * 1.6, { ...o, at: i * d }));
  return {
    init, get muted() { return muted; }, toggle() { muted = !muted; S.mute = muted ? 1 : 0; save(); return muted; },
    music(k) { const s = k ? SONGS[k] : null; if (s !== song) { song = s; step = 0; } },
    tap() { tone(660, 0.05, { vol: 0.05 }); }, pop() { tone(420, 0.09, { vol: 0.06, to: 880 }); }, tick() { tone(1200, 0.025, { type: 'square', vol: 0.02 }); },
    ok() { tone(784, 0.09, { vol: 0.07 }); tone(1175, 0.16, { vol: 0.07, at: 0.08 }); }, bad() { tone(196, 0.2, { type: 'sawtooth', vol: 0.05, to: 110 }); },
    star() { seq([12, 16, 19, 24], 0.07, { vol: 0.06 }); }, whoosh() { noise(0.32, 0.05, 0, 900); tone(300, 0.3, { type: 'sine', vol: 0.03, to: 900 }); },
    win() { seq([0, 4, 7, 12, 16, 19, 24], 0.09, { vol: 0.07 }); }, lose() { seq([7, 3, 0, -5], 0.2, { vol: 0.06 }); },
    siren() { for (let i = 0; i < 3; i++) { tone(880, 0.14, { type: 'square', vol: 0.035, at: i * 0.3 }); tone(660, 0.14, { type: 'square', vol: 0.035, at: i * 0.3 + 0.15 }); } },
    boom() { noise(0.25, 0.09); tone(150, 0.25, { type: 'sine', vol: 0.09, to: 45 }); },
  };
})();

/* ---------- 화면 틀: 가운데 360×640 이 항상 보이고, 남는 곳은 풍경으로 채움 ---------- */
const cv = $('#cv'), mainG = cv.getContext('2d');
let g = mainG;
const V = { w: 1, h: 1, s: 1, d: 1, L: 0, R: 360, T: 0, B: 640, W: 360, H: 640 };
function fit() {
  V.w = innerWidth; V.h = innerHeight; V.d = clamp(Math.sqrt(2.6e6 / (V.w * V.h)), 1, Math.max(1, Math.min(2, devicePixelRatio || 1)));
  cv.width = Math.round(V.w * V.d); cv.height = Math.round(V.h * V.d); V.s = Math.min(V.w / 360, V.h / 640); V.W = V.w / V.s; V.H = V.h / V.s;
  V.L = (360 - V.W) / 2; V.R = 360 - V.L; V.T = (640 - V.H) / 2; V.B = 640 - V.T;
  document.documentElement.style.setProperty('--u', V.s + 'px'); document.body.classList.toggle('wide', V.W > 560);
}
addEventListener('resize', fit); fit();
const begin = () => mainG.setTransform(V.d * V.s, 0, 0, V.d * V.s, V.d * (V.w / 2 - 180 * V.s), V.d * (V.h / 2 - 320 * V.s));

/* ---------- 장면 · 시간 · 트윈 ---------- */
let scene = { update() {}, draw() {} }, T = 0, timers = [], tweens = [], paused = false;
function setScene(sc) { timers = []; tweens = []; scene = sc; if (sc.enter) sc.enter(); }
const after = (s, fn) => timers.push({ t: s, fn });
function tw(o, to, d = 0.5, e = E.out, delay = 0, done) { tweens.push({ o, to, d, e, t: -delay, done }); }
function tick(dt) {
  T += dt; if (paused) return;
  for (const m of timers.slice()) if ((m.t -= dt) <= 0) { timers.splice(timers.indexOf(m), 1); m.fn(); }
  for (const w of tweens.slice()) { const was = w.t; w.t += dt; if (w.t < 0) continue; if (was < 0 || !w.from) { w.from = {}; for (const k in w.to) w.from[k] = w.o[k]; } const p = Math.min(1, w.t / w.d), q = w.e(p); for (const k in w.to) w.o[k] = w.from[k] + (w.to[k] - w.from[k]) * q; if (p >= 1) { tweens.splice(tweens.indexOf(w), 1); if (w.done) w.done(); } }
  scene.update(dt); updFx(dt);
}

/* ---------- 반짝이 · 연기 · 색종이 ---------- */
let fx = [];
function burst(x, y, n, o = {}) { for (let i = 0; i < n; i++) { const a = rand(0, TAU), v = rand(0.3, 1) * (o.sp || 170), life = rand(0.45, 0.95) * (o.life || 1); fx.push({ k: o.kind || 'dot', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), gr: o.g === undefined ? 260 : o.g, life, max: life, col: pick(o.cols || ['#ffffff']), r: rand(2, 5) * (o.size || 1), rot: rand(0, TAU), vr: rand(-9, 9) }); } }
const ring = (x, y, col = '#fff', r = 46) => fx.push({ k: 'ring', x, y, vx: 0, vy: 0, gr: 0, life: 0.45, max: 0.45, col, r });
const puff = (x, y, col, r = 10, vy = -30, life = 1.2) => fx.push({ k: 'puff', x, y, vx: rand(-10, 10), vy, gr: 0, life, max: life, col, r });
const CONF = ['#ffd23f', '#ff5a5f', '#19d3a2', '#2f9bff', '#ffffff', '#7b5cff'];
function confetti(n = 70) { for (let i = 0; i < n; i++) { const life = rand(1.6, 3); fx.push({ k: 'conf', x: rand(V.L, V.R), y: V.T - rand(10, 160), vx: rand(-30, 30), vy: rand(60, 150), gr: 40, life, max: life, col: pick(CONF), r: rand(4, 7), rot: rand(0, TAU), vr: rand(-10, 10) }); } }
const sparkle = (x, y, n = 10, cols = ['#ffd23f', '#ffffff']) => { burst(x, y, n, { kind: 'star', cols, sp: 190, g: 120, size: 1.5 }); ring(x, y, cols[0]); };
function updFx(dt) { for (const p of fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.gr * dt; p.life -= dt; if (p.rot !== undefined) p.rot += (p.vr || 0) * dt; } if (fx.length) fx = fx.filter((p) => p.life > 0); }
function drawFx() {
  for (const p of fx) {
    const q = p.life / p.max; g.fillStyle = g.strokeStyle = p.col;
    if (p.k === 'ring') { g.globalAlpha = q; g.lineWidth = 4 * q + 1; g.beginPath(); g.arc(p.x, p.y, p.r * (1 - q * q) + 6, 0, TAU); g.stroke(); }
    else if (p.k === 'puff') { g.globalAlpha = q * 0.6; g.beginPath(); g.arc(p.x, p.y, p.r * (1.9 - q), 0, TAU); g.fill(); }
    else if (p.k === 'conf') { g.globalAlpha = Math.min(1, q * 3); g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, Math.cos(p.rot * 1.7)); g.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); g.restore(); }
    else if (p.k === 'star') { g.globalAlpha = Math.min(1, q * 2); const r = p.r * (0.5 + q); g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.38 : r, a = i / 8 * TAU; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill(); g.restore(); }
    else { g.globalAlpha = Math.min(1, q * 2); g.beginPath(); g.arc(p.x, p.y, p.r * (0.4 + q * 0.6), 0, TAU); g.fill(); }
  }
  g.globalAlpha = 1;
}

/* ---------- 덮는 판 · 알림 · 움직이는 글자 · 화면 넘김 ---------- */
const ovl = $('#ovl');
function show(html, cls = '') { ovl.className = 'show ' + cls; ovl.innerHTML = html; ovl.scrollTop = 0; const f = ovl.querySelector('.b.go,.b.mint'); if (f && !matchMedia('(pointer: coarse)').matches) f.focus({ preventScroll: true }); }
function hide() { ovl.className = ''; ovl.innerHTML = ''; }
function toast(text) { const box = $('#toast'), d = document.createElement('div'); d.innerHTML = text; box.appendChild(d); setTimeout(() => d.remove(), 3500); while (box.children.length > 2) box.firstChild.remove(); }
function kin(text, sub, cls = '') { $('#kin').innerHTML = `<div class="${cls}">${text}${sub ? `<small><span>${sub}</span></small>` : ''}</div>`; }
let wiping = false;
function wipe(o, mid) { // 세 가지 색 띠가 비스듬히 지나가며 화면을 바꿈. o = { k: 작은 글자, t: 큰 글자, s: 설명 } 를 주면 가운데서 잠깐 보여 줌
  if (wiping) return; wiping = true; const w = $('#wipe'); $('em', w).textContent = (o && o.k) || ''; $('b', w).textContent = (o && o.t) || ''; $('span', w).textContent = (o && o.s) || '';
  w.className = 'in'; AU.whoosh();
  setTimeout(() => { mid(); if (o) w.classList.add('hold'); setTimeout(() => { w.className = 'out'; AU.whoosh(); setTimeout(() => { w.className = ''; wiping = false; }, 640); }, o ? 1100 : 60); }, 640);
}

/* ---------- 조작 ---------- */
const ptr = { x: 0, y: 0, sx: 0, sy: 0, down: false };
const toV = (e) => [(e.clientX - (V.w / 2 - 180 * V.s)) / V.s, (e.clientY - (V.h / 2 - 320 * V.s)) / V.s];
cv.addEventListener('pointerdown', (e) => { AU.init(); const [x, y] = toV(e); Object.assign(ptr, { x, y, sx: x, sy: y, down: true }); if (scene.down) scene.down(x, y); });
addEventListener('pointermove', (e) => { const [x, y] = toV(e); ptr.x = x; ptr.y = y; if (scene.move) scene.move(x, y, ptr.down); });
addEventListener('pointerup', (e) => { if (!ptr.down) return; ptr.down = false; const [x, y] = toV(e); if (scene.up) scene.up(x, y, x - ptr.sx, y - ptr.sy); });
addEventListener('pointercancel', () => { ptr.down = false; });
addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) { if (e.key === 'Enter') { const b = ovl.querySelector('.b.go'); if (b) b.click(); } return; }
  AU.init();
  if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat && ovl.classList.contains('show')) { if (!(e.target instanceof HTMLButtonElement)) { const b = ovl.querySelector('.b.go,.b.mint'); if (b) { e.preventDefault(); b.click(); } } return; }
  if (e.code === 'Escape' && ovl.classList.contains('show')) { const b = ovl.querySelector('.xx'); if (b) b.click(); return; }
  if (!ovl.classList.contains('show') && scene.key && !e.repeat) { if (scene.key(e.code) !== false && (e.code.startsWith('Arrow') || e.code === 'Space')) e.preventDefault(); }
});
document.addEventListener('pointerdown', () => AU.init(), true);
