
/* =========================================================
   작전 1 · 먼지 연구소 — 얼마나 작을까(확대) → 몸속에서는(거름망) → 오늘 공기는 무슨 색(등급 빨리 맞히기)
   ========================================================= */
const GR = [['좋음', '#2f7de1', '0~15', '마음껏 뛰어놀아요!'], ['보통', '#1fae6e', '16~35', '평소처럼 지내요. 몸이 약하면 살살.'], ['나쁨', '#e59a00', '36~75', '바깥 활동을 줄이고, 나갈 땐 보건용 마스크!'], ['매우 나쁨', '#e5484d', '76 이상', '바깥 활동을 피하고 실내에서 지내요.']];
const gradeIdx = (v) => (v <= 15 ? 0 : v <= 35 ? 1 : v <= 75 ? 2 : 3);
GAME.lab = () => {
  const STEPS = [
    { z: 1.6, say: '<b>모래알</b>은 지름 약 90㎛, <b>머리카락</b> 굵기는 50~70㎛예요. (1㎛는 1mm의 천 분의 1) 그런데 가운데 저 작은 점은 뭘까요?', btn: '확대!' },
    { z: 8, say: '<em>미세먼지(PM10)</em>예요! 지름 <b>10㎛ 이하</b>, 머리카락 굵기의 6분의 1쯤. 그 옆에 더 작은 게 있어요.', btn: '더 확대!' },
    { z: 30, say: '<em>초미세먼지(PM2.5)</em>! 지름 <b>2.5㎛ 이하</b>. 머리카락 굵기의 <b>20~30분의 1</b>밖에 안 돼요.', btn: '몸속에 들어오면?' },
    { say: '큰 먼지는 코털과 기관지에서 걸러지지만, 초미세먼지는 너무 작아서 <b>폐 깊숙이</b> 들어가요. 그래서 농도를 꼭 확인해야 해요!', btn: '오늘 공기는 무슨 색?' },
  ];
  const Z = { z: 1.6 }, Q = { v: 20, pop: 1, cl: 0.8 }; let ph = 'zoom', step = 0, busy = false, ps = [], spT = 0, dirt = 0, ri = -1, score = 0, tl = 0, lock = true, mood = 'smile';
  const N = 10, vals = shuffle([0, 1, 2, 3, 0, 1, 2, 3, pick([1, 2]), pick([0, 3])]).map((k, i) => (i > 5 && Math.random() < 0.5 ? [15, 35, 75, 76][k] : [(3 + Math.random() * 13) | 0, (16 + Math.random() * 20) | 0, (36 + Math.random() * 40) | 0, (76 + Math.random() * 70) | 0][k]));
  const sayStep = () => { const s = STEPS[step]; gBot(`<div class="say pn">${s.say}</div><button class="b go big" id="lNext">${s.btn}</button>`); $('#lNext').onclick = nextStep; gScore(`${step + 1} / 4`); };
  function nextStep() { if (busy) return; AU.tap(); step++; if (step < 3) { busy = true; AU.whoosh(); tw(Z, { z: STEPS[step].z }, 1.5, E.io, 0, () => { busy = false; AU.pop(); sparkle(180, 300, 8, ['#7fe9e0', '#ffffff']); }); sayStep(); } else if (step === 3) { ph = 'filter'; sayStep(); } else startQuiz(); }
  function startQuiz() { ph = 'quiz'; kin('오늘 공기는?', '숫자를 보고 등급을 빨리 골라요', 's'); AU.pop(); gBot(''); after(1.6, round); }
  function round() {
    ri++; if (ri >= N) return endGame('lab', score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0, { head: `${N}문제 가운데 ${score}개!`, stat: '초미세먼지(PM2.5) 예보 등급', facts: ['초미세먼지는 지름 <b>2.5㎛ 이하</b>. 머리카락 굵기의 20~30분의 1이라 폐 깊숙이 들어가요.', '<b>좋음</b> 0~15 · <b>보통</b> 16~35 · <b>나쁨</b> 36~75 · <b>매우 나쁨</b> 76 이상 (㎍/㎥)', '나쁨 이상이면 바깥 활동을 줄이고 <b>보건용 마스크</b>를 써요.'] });
    Q.v = vals[ri]; Q.pop = 0; tw(Q, { pop: 1 }, 0.45, E.back); tw(Q, { cl: 1 - clamp((Q.v - 8) / 80, 0, 1) }, 0.6); tl = ri < 4 ? 6 : 4.5; lock = false; mood = 'smile'; gScore(`${ri + 1} / ${N}`); AU.pop();
    gBot(`<div class="opts">${GR.map((r, i) => `<button class="b" data-g="${i}" style="background:${r[1]};color:#fff">${r[0]}<small>${ri < 4 ? r[2] : '?'}</small></button>`).join('')}</div>`);
    $$('#gb [data-g]').forEach((b) => (b.onclick = () => answer(+b.dataset.g)));
  }
  function answer(k) {
    if (lock) return; lock = true; const ok = gradeIdx(Q.v), good = k === ok; gTime(null);
    $$('#gb [data-g]').forEach((b) => { const i = +b.dataset.g; b.querySelector('small').textContent = GR[i][2]; if (i === ok) b.classList.add('ok'); else if (i === k) b.classList.add('no'); else b.style.opacity = 0.45; });
    if (good) { score++; AU.ok(); sparkle(180, 210, 10); mood = ok < 2 ? 'happy' : 'wow'; } else { AU.bad(); mood = 'sad'; }
    toast(`${good ? '정답!' : k < 0 ? '시간 초과!' : '아쉬워요!'} <b>${Q.v}</b>는 <b>${GR[ok][0]}</b> · ${GR[ok][3]}`); after(good ? 1.3 : 2.1, round);
  }
  const lab = (s, x, y, sz = 13) => text(s, x, y, sz, '#fff', 'center', true, 4);
  return {
    enter() { sayStep(); },
    update(dt) {
      if (ph === 'filter') { if ((spT -= dt) <= 0) { spT = 0.16; const r = Math.random(); ps.push({ x: rand(70, 290), y: 100, vx: 0, vy: rand(80, 110), k: r < 0.35 ? 0 : r < 0.65 ? 1 : 2, life: 1 }); }
        for (const p of ps) { p.x += p.vx * dt; p.y += p.vy * dt; const rad = [13, 7, 3][p.k]; if (p.k < 2 && p.vy > 0 && p.y > 248 - rad) { p.vy = -rand(50, 90); p.vx = rand(-90, 90); p.b = 1; } if (p.b) { p.life -= dt * 1.3; p.vy += 120 * dt; } if (p.k === 2 && p.y > 250) p.x += ((p.x < 180 ? 148 : 212) - p.x) * dt * 2.4; if (p.k === 2 && p.y > 372) { p.life = 0; dirt = Math.min(1, dirt + 0.018); } } ps = ps.filter((p) => p.life > 0); }
      if (ph === 'quiz' && !lock) { tl -= dt; gTime(tl / (ri < 4 ? 6 : 4.5)); if (tl <= 0) answer(-1); }
    },
    draw() {
      if (ph === 'quiz') { drawSky('day', Q.cl, 300); drawCity('day', Q.cl, 300); hazeOver(Q.cl * 0.9); const gi = gradeIdx(Q.v);
        drawHero(180, 430, 1.05, S.look, T, { face: lock ? mood : 'smile', pose: lock && mood === 'happy' ? 'cheer' : lock && mood === 'sad' ? 'sad' : 'idle' });
        if (ri >= 0) { g.save(); g.translate(180, 200); g.scale(Q.pop, Q.pop); g.rotate(-0.04); box(-118, -74, 236, 148, 22, lock ? GR[gi][1] : '#fffdf4', 4); text('초미세먼지', 0, -48, 15, lock ? '#fff' : '#5b6080', 'center', true); text(String(Q.v), -8, 8, 86, lock ? '#fff' : INK); text('㎍/㎥', 0, 56, 15, lock ? '#fff' : '#5b6080', 'center', true); g.restore(); }
        return; }
      const gr = g.createLinearGradient(0, V.T, 0, V.B); gr.addColorStop(0, '#0d4350'); gr.addColorStop(1, '#0a1a33'); g.fillStyle = gr; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4);
      if (ph === 'filter') {
        text('코 · 입', 180, 84, 15, '#7fe9e0', 'center', true); for (let x = 44; x <= 316; x += 13) line(x, 241, x + 7, 259, '#ffd9b8', 3.4); line(34, 250, 326, 250, 'rgba(255,255,255,.25)', 2); lab('코털 · 기관지 (거름망)', 180, 272, 12);
        const lc = mix('#ffb3c1', '#7d6672', dirt); box(174, 288, 12, 60, 5, '#ffc9d3'); ell(146, 398, 40, 58, lc, LW, 0.18); ell(214, 398, 40, 58, lc, LW, -0.18); lab('폐', 180, 402, 20);
        for (const p of ps) { g.globalAlpha = clamp(p.life, 0, 1); if (p.k === 0) circ(p.x, p.y, 13, '#e2b45e', 2); else if (p.k === 1) drawMon(p.x, p.y, 8, 'dust', T, { ph: p.x }); else circ(p.x, p.y, 3.2, '#a58cf0', 1.2); } g.globalAlpha = 1;
        lab('큰 먼지 → 걸러짐', 92, 204, 12); lab('초미세먼지 → 통과!', 274, 318, 12); return; }
      const z = Z.z, cx = 180, cy = 300, u = 10 * z; g.strokeStyle = 'rgba(127,233,224,.13)'; g.lineWidth = 1; g.beginPath(); for (let x = cx - Math.ceil((cx - V.L) / u) * u; x < V.R; x += u) { g.moveTo(x, V.T); g.lineTo(x, V.B); } for (let y = cy - Math.ceil((cy - V.T) / u) * u; y < V.B; y += u) { g.moveTo(V.L, y); g.lineTo(V.R, y); } g.stroke();
      const hy = cy + 18 * z, hh = 60 * z; if (hy < V.B) { g.fillStyle = '#6a4326'; g.fillRect(V.L - 2, hy, V.W + 4, hh); g.fillStyle = '#8a5a34'; g.fillRect(V.L - 2, hy + hh * 0.14, V.W + 4, hh * 0.1); line(V.L - 2, hy, V.R + 2, hy, INK, 3); if (hy + hh < V.B) line(V.L - 2, hy + hh, V.R + 2, hy + hh, INK, 3); if (z < 4) lab('머리카락 굵기 50~70㎛', 180, hy + hh * 0.55); }
      const sx = cx - 72 * z, sy = cy - 16 * z, sr = 45 * z; if (sx + sr > V.L) { circ(sx, sy, sr, '#e2b45e', 3); for (let i = 0; i < 7; i++) circ(sx + Math.cos(i * 1.9) * sr * 0.55, sy + Math.sin(i * 2.7) * sr * 0.55, sr * 0.06, '#c9973f', 0); circ(sx - sr * 0.3, sy - sr * 0.35, sr * 0.16, '#f2d08a', 0); if (z < 4) lab('모래알 90㎛', sx, sy); }
      const px = cx + 9.5 * z, py = cy - 2.5 * z, pr = 5 * z, qr = 1.25 * z;
      if (pr > 11) { drawMon(px, py, pr, 'dust', T, { look: -0.6 }); if (px - pr < V.R && z < 16) lab('미세먼지 PM10', px, py + pr + 16); } else circ(px, py, Math.max(1.6, pr), '#c9a66b', pr > 4 ? 1.6 : 0);
      if (qr > 11) { drawMon(cx, cy, qr, 'gas', T); lab('초미세먼지 PM2.5', cx, cy + qr + 18, 14); } else circ(cx, cy, Math.max(1.3, qr), '#a58cf0', qr > 4 ? 1.4 : 0);
      if (z < 6) { g.strokeStyle = '#ffd23f'; g.lineWidth = 2.5; g.setLineDash([6, 5]); g.beginPath(); g.arc(cx + 5 * z, cy, 22 + Math.sin(T * 5) * 3, 0, TAU); g.stroke(); g.setLineDash([]); text('?', cx + 5 * z, cy - 36, 22, '#ffd23f', 'center', false, 5); }
      const su = z < 3 ? 50 : z < 15 ? 10 : 2.5; line(V.L + 20, 150, V.L + 20 + su * z, 150, '#7fe9e0', 4); text(su + '㎛', V.L + 20, 134, 13, '#7fe9e0', 'left', true); text('×' + Math.round(z * 62), V.R - 20, 140, 22, 'rgba(127,233,224,.8)', 'right');
    },
  };
};

/* =========================================================
   작전 2 · 5등급 검문소 — 평일 06~21시에만, 저감장치·긴급차는 빼고
   ========================================================= */
GAME.road = () => {
  const SH = [{ day: '1월 14일 수요일', wk: 1, h0: 7.6, h1: 9.4, n: 9, kin: '수요일 아침', sub: '5등급 차량을 눌러서 단속!' }, { day: '1월 17일 토요일', wk: 0, h0: 13, h1: 14.2, n: 6, kin: '토요일 낮', sub: '오늘도 단속할까요?' }, { day: '1월 19일 월요일', wk: 1, h0: 19.4, h1: 22.1, n: 11, kin: '월요일 저녁', sub: '시계를 잘 봐요!' }];
  let cars = [], si = -1, st = 0, dur = 1, left = 0, spT = 0, lane = 0, hour = 8, caught = 0, missed = 0, wrong = 0, over = false, haze = 0, clockT = 0, tipM = 0;
  const sx = () => V.R + 70, enforce = () => SH[si].wk && hour >= 6 && hour < 21, viol = (c) => c.g === 5 && !c.dpf && !c.amb && enforce();
  const clock = () => { const h = Math.floor(hour), m = Math.floor((hour - h) * 60); return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(m).padStart(2, '0')}`; };
  function shift() { si++; if (si >= SH.length) return finish(); const s = SH[si]; st = 0; left = s.n; dur = s.n * 1.25 + 6.5; spT = 1.6; hour = s.h0; kin(s.kin, s.sub, 's'); AU.pop(); }
  function spawn() {
    const r = Math.random(); let c;
    if (r < 0.42) c = { g: 5, tag: '5등급', kind: 'truck', col: pick(['#9a8f86', '#8a7f9a', '#a08a70']), smoke: 1 }; else if (r < 0.55) c = { g: 5, dpf: 1, tag: '5등급 · 저감장치', kind: 'truck', col: '#7fb0a0' }; else if (r < 0.63) c = { g: 5, amb: 1, tag: '5등급 · 긴급차', kind: 'amb', col: '#ffffff' }; else if (r < 0.8) c = { g: 1, tag: '1등급 전기차', kind: 'ev', col: '#19d3a2' }; else { const gg = pick([2, 3, 4]); c = { g: gg, tag: gg + '등급', kind: pick(['car', 'car', 'bus']), col: pick(['#ffd23f', '#ff8fb1', '#7fb6ff']) }; }
    lane ^= 1; Object.assign(c, { x: sx(), y: lane ? 556 : 486, v: (lane ? 82 : 94) * Math.min(1.8, (sx() + 70) / 500), a: 1 }); cars.push(c);
  }
  function finish() { over = true; const tot = caught + missed + wrong, acc = tot ? caught / tot : 0; endGame('road', acc >= 0.85 ? 3 : acc >= 0.65 ? 2 : acc >= 0.4 ? 1 : 0, { head: `단속 ${caught}대 성공!`, stat: `놓친 차 ${missed}대 · 잘못 세운 차 ${wrong}대`, facts: ['<b>배출가스 5등급 차량</b>은 계절관리제 기간(12~3월) <b>평일 오전 6시~오후 9시</b>에 다닐 수 없어요.', '<b>토·일요일과 공휴일</b>은 단속하지 않아요.', '<b>매연저감장치(DPF)</b>를 단 차, 긴급차, 장애인·국가유공자 차량 등은 제외. 어기면 과태료 <b>하루 10만 원</b>.'] }); }
  return {
    enter() { gBot('<div class="say pn"><b>5등급 차량</b>만 눌러서 세워요. <em>저감장치</em>를 단 차와 <em>긴급차</em>는 그냥 보내요.</div>'); $('#gm').innerHTML = '<div class="say pn" id="rdC" style="margin-top:calc(var(--u)*8);text-align:center"></div>'; gScore('단속 0'); shift(); },
    update(dt) {
      if (over) return; st += dt; hour = lerp(SH[si].h0, SH[si].h1, clamp(st / dur, 0, 1)); haze = Math.max(0, haze - dt * 0.02);
      if ((clockT -= dt) <= 0) { clockT = 0.15; const e = $('#rdC'); if (e) e.innerHTML = `<b>${SH[si].day}</b> · ${clock()}`; }
      if (left > 0 && (spT -= dt) <= 0) { spT = 1.25; left--; spawn(); }
      for (const c of cars) { if (c.done === 'caught') { c.a -= dt * 0.9; continue; } c.x -= c.v * dt; if (!c.done && c.x < 62) { if (viol(c)) { c.done = 'miss'; missed++; haze = Math.min(0.5, haze + 0.12); AU.bad(); if (!tipM++) toast('5등급 차량이 그냥 지나갔어요!'); } else c.done = 'pass'; } }
      cars = cars.filter((c) => c.a > 0 && c.x > V.L - 90); if (left <= 0 && !cars.length) shift();
    },
    draw() {
      const nt = hour >= 19.5 || hour < 6.5 ? 'night' : hour >= 17.5 ? 'sunset' : 'day', cl = 0.75 - haze; drawSky(nt, cl, 420); drawCity(nt, cl, 420); g.save(); g.translate(180, GY); LM[1](T, false, true); g.restore();
      g.fillStyle = '#3b4162'; g.fillRect(V.L - 2, 444, V.W + 4, 126); line(V.L - 2, 444, V.R + 2, 444, INK, 3); line(V.L - 2, 570, V.R + 2, 570, INK, 3); g.fillStyle = '#ffe9a8'; for (let x = V.L - ((T * 40) % 44); x < V.R; x += 44) g.fillRect(x, 506, 22, 4);
      g.fillStyle = '#fff'; for (let y = 450; y < 566; y += 14) g.fillRect(58, y, 6, 8);
      for (const c of cars.slice().sort((a, b) => a.y - b.y)) { g.globalAlpha = clamp(c.a, 0, 1); drawCar(c.x, c.y, 0.85, { col: c.col, kind: c.kind, dir: -1, smoke: c.smoke && !c.done }); const top = c.kind === 'bus' ? 62 : c.kind === 'truck' ? 56 : 54, w = c.tag.length * 10.5 + 16;
        box(c.x - w / 2, c.y - top - 9, w, 18, 9, c.g === 5 ? (c.dpf || c.amb ? '#fffdf4' : '#ff5a5f') : '#fffdf4', 2); text(c.tag, c.x, c.y - top + 0.5, 11, c.g === 5 && !c.dpf && !c.amb ? '#fff' : INK, 'center', true);
        if (c.done === 'caught') { g.save(); g.translate(c.x, c.y - 26); g.rotate(-0.2); box(-34, -15, 68, 30, 6, '#fffdf4', 3); text('단속!', 0, 1, 19, '#e5484d'); g.restore(); } if (c.shield > 0) { c.shield -= 0.03; g.strokeStyle = '#7fe9ff'; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y - 24, 46, 0, TAU); g.stroke(); } }
      g.globalAlpha = 1; hazeOver(cl, nt); if (nt === 'night') { g.fillStyle = 'rgba(6,10,38,.22)'; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4); }
    },
    down(x, y) {
      if (over) return; let c = null; for (const k of cars) if (!k.done && Math.abs(x - k.x) < 52 && y > k.y - 70 && y < k.y + 12) c = k; if (!c) return;
      if (viol(c)) { c.done = 'caught'; caught++; AU.ok(); sparkle(c.x, c.y - 30, 8); gScore('단속 ' + caught); if (caught === 1) toast('단속 성공! 과태료는 <b>하루 10만 원</b>'); return; }
      wrong++; c.done = 'pass'; c.shield = 1; AU.bad();
      toast(c.amb ? '<b>긴급차</b>는 단속하지 않아요' : c.dpf ? '<b>매연저감장치</b>를 단 차는 다닐 수 있어요' : c.g < 5 ? `<b>${c.g}등급</b>은 운행제한 대상이 아니에요` : !SH[si].wk ? '<b>주말·공휴일</b>에는 단속하지 않아요' : '단속은 <b>오전 6시~오후 9시</b>에만 해요');
    },
  };
};

/* =========================================================
   작전 3 · 비상 상황실 — 발령 기준 판단 → 발령 뒤 할 일 고르기
   ========================================================= */
GAME.room = () => {
  const ALL = [{ a: 62, b: 58, w: 0, y: 1, why: '오늘 50 초과(62) + 내일도 50 초과(58) 예보 → <b>발령!</b>' }, { a: 32, b: 41, w: 0, y: 0, why: '오늘도 내일도 50 이하. 발령 기준이 아니에요.' },
    { a: 40, b: 82, w: 0, y: 1, why: '<b>내일 75 초과(82)</b> 예보면 오늘 농도와 상관없이 <b>발령!</b>' }, { a: 57, b: 44, w: 0, y: 0, why: '오늘은 50을 넘었지만 <b>내일 예보가 50 이하</b>라 발령하지 않아요.' },
    { a: 46, b: 55, w: 1, y: 1, why: '오늘 <b>주의보</b>가 내려졌고 + 내일 50 초과(55) 예보 → <b>발령!</b>' }, { a: 45, b: 66, w: 0, y: 0, why: '내일 50은 넘지만 75 이하이고, 오늘 평균이 50 이하(주의보도 없음)라 발령하지 않아요.' }, { a: 71, b: 78, w: 1, y: 1, why: '세 가지 기준에 모두 해당! 당연히 <b>발령!</b>' }];
  const CASES = ALL.slice(0, 2).concat(shuffle(ALL.slice(2))), B = { a: 0, b: 0 }, ACT = shuffle([['5등급 차량 운행 제한', 1], ['공공기관 차량 2부제', 1], ['공사장 작업시간 줄이기', 1], ['도로 청소차 하루 3번 넘게', 1], ['쓰레기 모아서 태우기', 0, '태우면 먼지가 더 생겨요!'], ['공장을 밤새 더 돌리기', 0, '공장과 발전소는 오히려 가동을 줄여요.']]);
  let i = -1, cur = ALL[0], score = 0, tl = 0, lock = true, alarm = 0, ph = 'case', got = 0, bad = 0;
  function next() { i++; if (i >= CASES.length) return acts(); cur = CASES[i]; B.a = B.b = 0; tw(B, { a: cur.a, b: cur.b }, 0.9, E.out); tl = 10; lock = false; alarm = 0; gScore(`${i + 1} / ${CASES.length}`); AU.pop();
    gBot('<div class="say pn">오늘 평균과 내일 예보를 보고 판단해요. 기준은 <b>50</b>과 <b>75</b>!</div><div class="opts"><button class="b go" id="rY">발령!</button><button class="b w" id="rN">아직 아니야</button></div>'); $('#rY').onclick = () => ans(1); $('#rN').onclick = () => ans(0); }
  function ans(y) { if (lock) return; lock = true; gTime(null); const ok = y === cur.y; if (ok) { score++; AU.ok(); sparkle(180, 250, 10); } else AU.bad(); if (cur.y) { alarm = 1.6; if (ok) { AU.siren(); kin('발령!', '비상저감조치', 's'); } }
    gBot(`<div class="say pn">${ok ? '<em>정답!</em>' : y < 0 ? '<b>시간 초과!</b>' : '<b>아쉬워요!</b>'} ${cur.why}</div><button class="b go big" id="rNx">다음</button>`); $('#rNx').onclick = () => { AU.tap(); next(); }; }
  function acts() { ph = 'act'; alarm = 99; AU.siren(); kin('비상저감조치 발령!', '지금 해야 할 일은?', 's'); gScore('0 / 4'); gTime(null);
    gBot(`<div class="say pn">발령했어요! 지금 해야 할 일 <b>네 가지</b>를 모두 골라요.</div><div class="opts">${ACT.map((a, k) => `<button class="b w" data-k="${k}" style="font-size:calc(var(--u)*13.5)">${a[0]}</button>`).join('')}</div>`);
    $$('#gb [data-k]').forEach((b) => (b.onclick = () => { const a = ACT[+b.dataset.k]; if (b.classList.contains('ok') || b.classList.contains('no') || got >= 4) return; if (a[1]) { b.classList.add('ok'); got++; AU.ok(); gScore(`${got} / 4`); if (got >= 4) after(0.9, fin); } else { b.classList.add('no'); bad++; AU.bad(); toast(a[2]); } })); }
  function fin() { const tot = score + Math.max(0, 4 - bad); endGame('room', tot >= 10 ? 3 : tot >= 8 ? 2 : tot >= 5 ? 1 : 0, { head: `판단 ${score} / ${CASES.length}`, stat: '비상저감조치 발령 기준 (하나만 맞아도 발령)', facts: ['오늘(0~16시) 평균 <b>50 초과</b> + 내일 <b>50 초과</b> 예보', '오늘 <b>주의보·경보</b> + 내일 <b>50 초과</b> 예보', '내일 <b>75 초과</b> 예보', '발령하면 5등급 운행제한, 공공기관 2부제, 사업장·공사장 가동 줄이기, 도로 청소 확대!'] }); }
  return {
    enter() { kin('발령할까, 말까?', '오늘 평균 · 내일 예보를 봐요', 's'); after(1.5, next); },
    update(dt) { if (alarm > 0) alarm -= dt; if (ph === 'case' && !lock) { tl -= dt; gTime(tl / 10); if (tl <= 0) ans(-1); } },
    draw() {
      const gr = g.createLinearGradient(0, V.T, 0, V.B); gr.addColorStop(0, '#141a4a'); gr.addColorStop(1, '#0a0d26'); g.fillStyle = gr; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4);
      g.strokeStyle = 'rgba(120,140,255,.1)'; g.lineWidth = 1; g.beginPath(); for (let x = V.L - (V.L % 30); x < V.R; x += 30) { g.moveTo(x, V.T); g.lineTo(x, V.B); } for (let y = V.T - (V.T % 30); y < V.B; y += 30) { g.moveTo(V.L, y); g.lineTo(V.R, y); } g.stroke();
      box(20, 86, 320, 306, 18, '#0d1238', 4); text('초미세먼지 상황판', 40, 110, 15, '#7fe9ff', 'left'); const w = cur.w && i >= 0; circ(300, 110, 8, w && ((T * 3) | 0) % 2 ? '#ffb020' : w ? '#ff7a00' : '#2a3166', 2); text(w ? '주의보 발령 중' : '주의보 없음', 286, 110, 11.5, w ? '#ffb020' : '#6b76b8', 'right', true);
      const y0 = 352, sc = 2.05; for (const [v, c] of [[50, '#ffd23f'], [75, '#ff5a5f']]) { g.setLineDash([6, 5]); line(40, y0 - v * sc, 322, y0 - v * sc, c, 2); g.setLineDash([]); text(String(v), 38, y0 - v * sc - 10, 13, c, 'left'); }
      [['오늘 평균', B.a, 122], ['내일 예보', B.b, 240]].forEach(([n, v, x]) => { const h = Math.min(100, v) * sc; box(x - 34, y0 - h, 68, h + 2, 8, gradeOf(v)[1], 3); text(String(Math.round(v)), x, y0 - h - 24, 40, '#fff'); text(n, x, y0 + 20, 13.5, '#cfd6ff', 'center', true); });
      line(34, y0, 326, y0, '#6b76b8', 2);
      if (ph === 'act') { g.save(); g.translate(180, 240); g.rotate(-0.07); box(-128, -30, 256, 60, 12, '#ff5a5f', 4); text('비상저감조치 발령 중', 0, 1, 24, '#fff'); g.restore(); }
      drawHero(310, 468, 0.72, S.look, T, { flip: 1, pose: alarm > 0 ? 'cheer' : 'point', face: alarm > 0 ? 'open' : 'smile', noBoard: 1, still: 1 });
      if (alarm > 0) { g.fillStyle = `rgba(255,60,70,${(0.16 * (0.5 + 0.5 * Math.sin(T * 12))).toFixed(3)})`; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4); }
    },
  };
};

/* =========================================================
   작전 4 · 굴뚝 공단 — 배출원 다섯 곳에 알맞은 대책 고르기
   ========================================================= */
GAME.plant = () => {
  const SRC = [
    { n: '석탄발전소', mon: 'soot', x: 92, y: 204, q: '<b>석탄발전소</b> 굴뚝 연기, 어떻게 줄일까?', ok: '발전기를 멈추거나 출력을 80%로', why: '공공 석탄발전 최대 <b>17기 가동정지</b>, 46기는 출력을 80%로 낮춰요(상한제약).', no: ['굴뚝을 더 높게 쌓기', '밤에만 몰래 돌리기'] },
    { n: '큰 공장', mon: 'gas', x: 266, y: 204, q: '<b>큰 공장</b>(대형사업장)에서 나오는 먼지는?', ok: '줄이기로 약속 + 드론·AI 감시', why: '대형사업장 416곳이 더 줄이기로 약속하고, <b>드론·이동측정차·AI</b>로 불법 배출을 찾아내요.', no: ['굴뚝에 향수 뿌리기', '창문을 활짝 열기'] },
    { n: '공사장', mon: 'dust', x: 66, y: 388, q: '<b>공사장</b>에서 날리는 흙먼지는?', ok: '방진덮개 덮고 물 뿌리기', why: '<b>방진덮개, 물 뿌리기, 바퀴 씻기</b>로 날림먼지를 막고, 낡은 건설기계는 쓰지 못하게 해요.', no: ['선풍기로 멀리 날리기', '흙을 높이 쌓아 두기'] },
    { n: '들판', mon: 'fire', x: 180, y: 398, q: '농사 뒤 남은 찌꺼기(<b>영농 폐기물</b>)는?', ok: '태우지 말고 모아서 수거·파쇄', why: '<b>불법소각 금지!</b> 모아서 수거하거나 잘게 부숴요. 봄에는 수거를 일주일에 세 번으로 늘려요.', no: ['바람 부는 날 태우기', '밤에 몰래 태우기'] },
    { n: '도로', mon: 'smog', x: 294, y: 388, q: '<b>낡은 경유차</b> 매연과 도로 먼지는?', ok: '5등급 운행제한 + 도로 청소', why: '<b>5등급 차량 운행을 제한</b>하고, 차가 많은 도로를 <b>하루 2번 넘게</b> 청소해요.', no: ['차를 더 빨리 달리게 하기', '도로에 모래 뿌리기'] }];
  const C = { cl: 0, n: F.start }; let cur = -1, done = 0, miss = 0, lock = false, laugh = 0, end = false;
  const hint = () => gBot('<div class="say pn">먼지몬이 붙은 곳을 <b>눌러서</b> 알맞은 대책을 골라요. (' + done + ' / 5)</div>');
  function pickSrc(k) { if (lock || SRC[k].ok0) return; cur = k; AU.tap(); const s = SRC[k], op = shuffle([[s.ok, 1], [s.no[0], 0], [s.no[1], 0]]);
    gBot(`<div class="say pn">${s.q}</div><div class="opts one">${op.map((o) => `<button class="b w" data-ok="${o[1]}" style="font-size:calc(var(--u)*15)">${o[0]}</button>`).join('')}</div>`);
    $$('#gb [data-ok]').forEach((b) => (b.onclick = () => { if (lock) return; if (+b.dataset.ok) { lock = true; b.classList.add('ok'); s.ok0 = 1; done++; AU.ok(); AU.boom(); sparkle(s.x, s.y - 96, 14); burst(s.x, s.y - 96, 14, { cols: MONC[s.mon], sp: 200 }); tw(C, { cl: done / 5 }, 1.2); gScore(`${done} / 5`); gBot(`<div class="say pn"><em>잡았다!</em> ${s.why}</div>`); after(2.4, () => { lock = false; cur = -1; if (done >= 5) finale(); else hint(); }); } else { b.classList.add('no'); miss++; laugh = 1.2; AU.bad(); } })); }
  function finale() { end = true; gBot(''); kin(`${F.start} → ${F.now}`, '계절관리제로 실제 이만큼 낮아졌어요'); AU.star(); tw(C, { n: F.now }, 2.4, E.io, 0.3); after(3.6, () => endGame('plant', miss === 0 ? 3 : miss <= 2 ? 2 : 1, { head: '배출원 다섯 곳 해결!', stat: `틀린 횟수 ${miss}번`, facts: ['먼지는 <b>나오는 곳에서 줄이는 것</b>이 가장 좋아요.', '석탄발전 <b>최대 17기 정지</b> · 대형사업장 감축 · 공사장 날림먼지 · <b>불법소각 금지</b> · 5등급 운행제한', `계절관리제 기간 초미세먼지: 처음 <b>${F.start} → ${F.now}㎍/㎥</b>, 이번 목표는 <b>${F.goal}</b>.`] })); }
  const ICON = [
    (d) => { for (const [x, s] of [[-18, 1], [20, 0.8]]) { g.save(); g.translate(x, 0); g.scale(s * 0.62, s * 0.62); g.beginPath(); g.moveTo(-31, 0); g.quadraticCurveTo(-12, -62, -23, -116); g.lineTo(23, -116); g.quadraticCurveTo(12, -62, 31, 0); g.closePath(); fin('#e8ecf5'); line(-20, -102, 20, -102, '#ff5a5f', 6); g.restore(); } },
    (d) => { box(-40, -38, 70, 38, 3, '#ffb020'); for (let i = 0; i < 3; i++) poly([-40 + i * 23.3, -38, -40 + i * 23.3, -54, -16.7 + i * 23.3, -38], '#e08a10'); box(24, -84, 14, 84, 2, '#fff'); g.fillStyle = '#ff5a5f'; g.fillRect(25.3, -82, 11.4, 14); g.fillRect(25.3, -52, 11.4, 14); box(24, -84, 14, 84, 2, null); box(-30, -24, 12, 12, 2, '#9fe3ff', 2); box(-10, -24, 12, 12, 2, '#9fe3ff', 2); },
    (d) => { line(-22, 0, -22, -86, INK, 7); line(-22, 0, -22, -86, '#ffd23f', 3.4); line(-36, -80, 34, -80, INK, 7); line(-36, -80, 34, -80, '#ffd23f', 3.4); line(22, -80, 22, -56, INK, 2.2); box(16, -56, 12, 10, 2, '#8f9bb8', 2); g.beginPath(); g.ellipse(14, 0, 34, 24, 0, Math.PI, 0); g.closePath(); fin(d ? '#3fbf5a' : '#b98a55'); if (d) for (let i = 0; i < 3; i++) line(-6 + i * 12, -34 - (T * 30 + i * 9) % 14, -6 + i * 12, -28 - (T * 30 + i * 9) % 14, '#7fe9ff', 2.4); },
    (d) => { for (let i = 0; i < 4; i++) box(-44 + i * 22, -14, 20, 14, 3, i % 2 ? '#c8d96a' : '#8fd06a', 2); if (d) { box(-14, -40, 28, 26, 6, '#fffdf4'); text('수거', 0, -26, 11, INK, 'center', true); } else { poly([-18, -14, 0, -36, 18, -14], '#c9a445'); const f = Math.sin(T * 12) * 2; poly([-9, -30, -2 + f, -58, 3, -40, 9 + f, -52, 11, -30], '#ff6a2b', 2); } },
    (d) => { box(-48, -6, 96, 12, 2, '#3b4162', 2); drawCar(-4, 4, 0.62, d ? { col: '#19d3a2', kind: 'ev' } : { col: '#9a8f86', kind: 'truck', smoke: 1 }); },
  ];
  return {
    enter() { hint(); gScore('0 / 5'); kin('먼지몬을 잡아라!', '배출원 다섯 곳', 's'); },
    update(dt) { laugh -= dt; },
    draw() {
      drawSky('day', C.cl, 200); hills(0.1, 200, 170, 70, mix(skyCols('day', C.cl)[1], '#3f69b5', 0.4), 1.3); const gc = mix('#58c46c', '#9ba27e', (1 - C.cl) * 0.65);
      g.fillStyle = mix(gc, '#ffffff', 0.14); g.fillRect(V.L - 2, 204, V.W + 4, 96); line(V.L - 2, 204, V.R + 2, 204, INK, 3); g.fillStyle = gc; g.fillRect(V.L - 2, 296, V.W + 4, V.B - 294); line(V.L - 2, 296, V.R + 2, 296, INK, 3);
      for (const [tx, ty, r] of [[180, 204, 15], [16, 204, 18], [346, 204, 13], [120, 398, 13], [240, 398, 12]]) { box(tx - 3, ty - 20, 6, 20, 2, '#8a5a3c', 2); circ(tx, ty - 20 - r * 0.7, r, mix('#3fbf5a', '#8f9a72', (1 - C.cl) * 0.6), 2.2); }
      SRC.forEach((s, k) => { g.save(); g.translate(s.x, s.y); ICON[k](!!s.ok0); g.restore(); const w = s.n.length * 12 + 18; box(s.x - w / 2, s.y + 8, w, 20, 10, k === cur ? '#ffd23f' : '#fffdf4', 2.2); text(s.n, s.x, s.y + 18.5, 12, INK, 'center', true);
        if (!s.ok0) { if (k < 2) for (let i = 0; i < 3; i++) { const p = (T * 0.4 + i / 3) % 1; g.globalAlpha = (1 - p) * 0.7; circ(s.x + (k ? 31 : 0) + Math.sin(p * 5 + i) * 8, s.y - 78 - p * 50, 7 + p * 14, '#5b586f', 0); } g.globalAlpha = 1;
          const sel = k === cur; if (sel) { g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.setLineDash([7, 6]); g.beginPath(); g.arc(s.x, s.y - 96, 34 + Math.sin(T * 6) * 2, 0, TAU); g.stroke(); g.setLineDash([]); }
          drawMon(s.x + Math.sin(T * 1.3 + k) * 4, s.y - 96 + Math.sin(T * 2 + k) * 4, (sel ? 23 : 19) * (sel && laugh > 0 ? 1.2 : 1), s.mon, T, { ph: k * 2, mood: sel && laugh > 0 ? 'laugh' : sel ? 'scared' : 'angry' }); }
        else { g.save(); g.translate(s.x + 30, s.y - 70); circ(0, 0, 12, '#19d3a2'); g.beginPath(); g.moveTo(-5, 0); g.lineTo(-1, 4); g.lineTo(6, -4); g.lineWidth = 3; g.strokeStyle = '#fff'; g.lineCap = 'round'; g.stroke(); g.restore(); } });
      hazeOver(C.cl);
      if (end) { g.save(); g.translate(180, 520); g.scale(1.25, 1.25); g.rotate(-0.04); box(-100, -52, 200, 104, 20, '#fffdf4', 4); text('초미세먼지', 0, -30, 13, '#5b6080', 'center', true); text(String(Math.round(C.n)), -10, 10, 62, gradeOf(C.n)[1]); text('㎍/㎥', 52, 22, 13, '#5b6080', 'center', true); g.restore(); }
    },
    down(x, y) { if (end) return; SRC.forEach((s, k) => { if (Math.abs(x - s.x) < 58 && y > s.y - 130 && y < s.y + 32) pickSrc(k); }); },
  };
};

/* =========================================================
   작전 5 · 우리 동네 — 먼지가 매우 나쁜 날, 일곱 가지 행동 릴레이 (한 가지에 5초)
   ========================================================= */
GAME.town = () => {
  const D = 5.6, room = (wall, floor) => { g.fillStyle = wall; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4); g.fillStyle = 'rgba(255,255,255,.4)'; for (let y = V.T + 12, r = 0; y < 462; y += 34, r++) for (let x = V.L + 12 + (r & 1) * 17; x < V.R; x += 34) { g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); } g.fillStyle = '#fffdf4'; g.fillRect(V.L - 2, 460, V.W + 4, 10); g.fillStyle = floor; g.fillRect(V.L - 2, 470, V.W + 4, V.B - 468); line(V.L - 2, 470, V.R + 2, 470, INK, 3); };
  const out = () => { drawSky('day', 0.05, 900); drawCity('day', 0.05, 900); hazeOver(0.05); };
  const card = (x, y, w, h, on) => box(x - w / 2, y - h / 2, w, h, 16, on ? '#ffd23f' : '#fffdf4', 3.4);
  const M = [
    { cmd: '마스크를 골라!', tip: '나갈 땐 식약처 인증 <b>보건용 마스크</b>(KF80·KF94·KF99)!',
      init(d) { d.it = shuffle([['KF94 보건용', 1], ['면 마스크', 0], ['목도리', 0]]); },
      draw(d) { room('#ffe9c9', '#d9a066'); text('나가기 전에, 현관에서', 180, 150, 13, '#b06a10', 'center', true);
        d.it.forEach(([n, ok], i) => { const x = 66 + i * 114, y = 330; card(x, y, 102, 138); if (n[0] === 'K') { box(x - 26, y - 34, 52, 38, 12, '#fff', 2.6); line(x - 26, y - 22, x - 36, y - 28, INK, 2); line(x + 26, y - 22, x + 36, y - 28, INK, 2); line(x - 14, y - 15, x + 14, y - 15, '#c9d3e6', 2); text('KF94', x, y - 4, 10, '#2f7de1', 'center', true); } else if (n[0] === '면') { box(x - 26, y - 34, 52, 38, 12, '#ff9fc0', 2.6); for (let k = 0; k < 6; k++) circ(x - 15 + (k % 3) * 15, y - 23 + ((k / 3) | 0) * 13, 2.4, '#fff', 0); } else { box(x - 28, y - 36, 56, 16, 8, '#7b5cff', 2.6); box(x + 6, y - 26, 16, 36, 6, '#7b5cff', 2.6); for (let k = 0; k < 3; k++) line(x + 8, y - 12 + k * 8, x + 20, y - 12 + k * 8, '#ffd23f', 2.4); } text(n, x, y + 42, 12.5, INK, 'center', true); }); },
      down(d, x, y, G) { d.it.forEach(([n, ok], i) => { if (Math.abs(x - (66 + i * 114)) < 52 && Math.abs(y - 330) < 70) ok ? G.win() : G.fail(); }); } },
    { cmd: '버스를 타!', tip: '자가용 대신 <b>대중교통</b>! 먼지를 덜 만들어요.',
      init(d) { const ys = shuffle([330, 420, 510]); d.v = [{ kind: 'bus', col: '#3fbf5a', ok: 1, y: ys[0], x: 470, s: 96 }, { kind: 'car', col: '#ff5a5f', y: ys[1], x: 430, s: 118 }, { kind: 'car', col: '#7fb6ff', y: ys[2], x: 520, s: 104 }]; },
      upd(d, dt) { for (const v of d.v) { v.x -= v.s * dt; if (v.x < -90) v.x = 440; } },
      draw(d) { out(); g.fillStyle = '#3b4162'; g.fillRect(V.L - 2, 270, V.W + 4, 260); line(V.L - 2, 270, V.R + 2, 270, INK, 3); g.fillStyle = '#ffe9a8'; for (const y of [352, 442]) for (let x = V.L; x < V.R; x += 44) g.fillRect(x, y, 22, 4); for (const v of d.v) { drawCar(v.x, v.y, 0.95, { col: v.col, kind: v.kind, dir: -1, smoke: v.kind === 'car' }); if (v.ok) text('버스', v.x + 4, v.y - 22, 13, '#fff', 'center', true); } },
      down(d, x, y, G) { for (const v of d.v) if (Math.abs(x - v.x) < 58 && y > v.y - 62 && y < v.y + 10) v.ok ? G.win() : G.fail(); } },
    { cmd: '체육은 어디서?', tip: '매우 나쁜 날엔 <b>바깥 활동을 줄이고</b> 실내에서 해요.',
      init(d) { d.in = Math.random() < 0.5 ? 0 : 1; },
      draw(d) { out(); [0, 1].forEach((i) => { const x = 96 + i * 168, y = 340, gym = i === d.in; card(x, y, 150, 190); if (gym) { box(x - 48, y - 40, 96, 60, 4, '#7fb6ff', 2.6); poly([x - 56, y - 40, x, y - 74, x + 56, y - 40], '#ff5a5f', 2.6); box(x - 12, y - 8, 24, 28, 3, '#fffdf4', 2.4); } else { circ(x + 32, y - 46, 16, '#e58f6a', 2.4); box(x - 46, y - 10, 92, 30, 3, '#b9aa8c', 2.6); circ(x - 14, y + 4, 12, '#fff', 2.4); for (let k = 0; k < 4; k++) circ(x - 40 + k * 26, y - 30 + (k % 2) * 8, 5, '#8f8672', 0); } text(gym ? '실내 체육관' : '바깥 운동장', x, y + 62, 14, INK, 'center', true); }); },
      down(d, x, y, G) { [0, 1].forEach((i) => { if (Math.abs(x - (96 + i * 168)) < 75 && Math.abs(y - 340) < 95) i === d.in ? G.win() : G.fail(); }); } },
    { cmd: '손을 씻어!', tip: '돌아오면 <b>손·발·눈·코</b>를 흐르는 물에 깨끗이!',
      init(d) { d.n = 0; d.b = []; },
      draw(d) { room('#cfefff', '#9fd0e8'); box(110, 190, 140, 26, 8, '#8f9bb8'); box(170, 216, 20, 44, 4, '#cfd6e6'); for (let i = 0; i < 4; i++) line(180 + Math.sin(T * 9 + i) * 3, 262 + i * 14, 180 + Math.sin(T * 9 + i + 1) * 3, 272 + i * 14, '#7fe9ff', 6); box(70, 400, 220, 60, 18, '#fff'); const w = Math.sin(T * 22) * (d.n ? 6 : 0); circ(156 + w, 350, 30, SKIN[S.look.skin]); circ(204 - w, 350, 30, SKIN[S.look.skin]); for (const b of d.b) circ(b[0], b[1], b[2], '#fff', 1.6); text(`${Math.min(8, d.n)} / 8`, 180, 430, 20, '#2f7de1'); text('빠르게 여러 번 눌러요', 180, 150, 13, '#2f7de1', 'center', true); },
      down(d, x, y, G) { d.n++; AU.tick(); d.b.push([rand(120, 240), rand(310, 390), rand(5, 12)]); if (d.n >= 8) G.win(); } },
    { cmd: '물을 마셔!', tip: '<b>물</b>과 비타민C가 많은 <b>과일·채소</b>를 챙겨 먹어요.',
      init(d) { d.p = 0; },
      upd(d, dt, G) { if (ptr.down && Math.abs(ptr.x - 180) < 90 && Math.abs(ptr.y - 340) < 110) { d.p += dt / 1.5; if (d.p >= 1) G.win(); } },
      draw(d) { room('#fff0c9', '#e0b070'); box(60, 470, 240, 14, 4, '#8a5a3c'); g.beginPath(); g.moveTo(130, 250); g.lineTo(230, 250); g.lineTo(216, 430); g.lineTo(144, 430); g.closePath(); fin('#e9f8ff', 3.4); const lv = 1 - clamp(d.p, 0, 1), ty = 268 + (1 - lv) * 150; if (lv > 0.03) { g.beginPath(); g.moveTo(132 + (ty - 250) * 0.078, ty); g.lineTo(228 - (ty - 250) * 0.078, ty); g.lineTo(216, 430); g.lineTo(144, 430); g.closePath(); fin('#5fc8ff', 0); } g.beginPath(); g.moveTo(130, 250); g.lineTo(230, 250); g.lineTo(216, 430); g.lineTo(144, 430); g.closePath(); fin(null, 3.4); text('꾹 누르고 있어요', 180, 200, 13, '#b06a10', 'center', true); circ(270, 420, 22, '#ff9f1c', 2.6); circ(262, 412, 5, '#ffc56e', 0); },
      down() {} },
    { cmd: '후드를 켜!', tip: '요리할 땐 <b>주방 후드</b>를 켜고 환기해요. 실내 공기도 관리!',
      init(d) { d.n = 0; },
      draw(d) { room('#ffe1d6', '#c98f6a'); box(96, 170, 168, 54, 8, '#cfd6e6'); box(150, 120, 60, 52, 4, '#aab4c8'); circ(180, 198, 15, d.n ? '#19d3a2' : '#ff5a5f', 2.6); text(d.n ? String(d.n) : '켜기', 180, 199, 11, '#fff', 'center', true); box(70, 420, 220, 50, 6, '#8f9bb8'); box(140, 384, 80, 38, 8, '#3d4466'); line(132, 396, 122, 392, INK, 4); line(228, 396, 238, 392, INK, 4);
        for (let i = 0; i < 7 - d.n * 2; i++) { const p = (T * 0.5 + i / 7) % 1; g.globalAlpha = (1 - p) * 0.7; circ(180 + Math.sin(p * 6 + i) * (d.n ? 6 : 40) * p, 380 - p * (d.n ? 170 : 240), 8 + p * (d.n ? 6 : 22), '#8f8a9e', 0); } g.globalAlpha = 1; text('후드 단추를 세 번!', 180, 250, 13, '#b0503a', 'center', true); },
      down(d, x, y, G) { if (Math.abs(x - 180) < 60 && Math.abs(y - 198) < 44) { d.n++; AU.pop(); if (d.n >= 3) G.win(); } } },
    { cmd: '물걸레로 닦아!', tip: '집 안은 <b>물걸레질</b>과 공기청정기로 관리해요.',
      init(d) { d.s = Array.from({ length: 7 }, () => [rand(50, 310), rand(290, 450), 1]); },
      draw(d) { room('#e6f3d8', '#d9b888'); g.fillStyle = '#d9b888'; g.fillRect(V.L - 2, 260, V.W + 4, V.B - 258); line(V.L - 2, 260, V.R + 2, 260, INK, 3); for (let x = V.L; x < V.R; x += 60) line(x, 262, x - 30, V.B, 'rgba(18,20,43,.12)', 2); for (const s of d.s) if (s[2]) { circ(s[0], s[1], 15, '#8f8672', 2); circ(s[0] - 4, s[1] - 3, 2, INK, 0); circ(s[0] + 4, s[1] - 3, 2, INK, 0); } const mx = clamp(ptr.x, 30, 330), my = clamp(ptr.y, 280, 470); line(mx + 40, my - 110, mx, my, INK, 8); line(mx + 40, my - 110, mx, my, '#ffd23f', 4); box(mx - 30, my - 6, 60, 16, 6, '#7fe9ff'); text('문질러서 먼지를 닦아요', 180, 220, 13, '#3d7a3a', 'center', true); },
      move(d, x, y, G) { let left = 0; for (const s of d.s) { if (s[2] && Math.hypot(s[0] - x, s[1] - y) < 30) { s[2] = 0; AU.tick(); sparkle(s[0], s[1], 4, ['#7fe9ff', '#ffffff']); } left += s[2]; } if (!left) G.win(); },
      down(d, x, y, G) { this.move(d, x, y, G); } },
  ];
  let mi = -1, d = {}, lives = 3, st = 'wait', tl = 0, won = false;
  const G = { win() { if (st !== 'play') return; st = 'post'; won = true; AU.ok(); confetti(24); gTime(null); gBot(`<div class="say pn"><em>좋아요!</em> ${M[mi].tip}</div>`); after(1.7, next); }, fail() { if (st !== 'play') return; st = 'post'; won = false; lives--; AU.bad(); gTime(null); hearts(); gBot(`<div class="say pn"><b>아쉬워요!</b> ${M[mi].tip}</div>`); after(2.3, next); } };
  const hearts = () => gScore('♥'.repeat(Math.max(0, lives)) + '♡'.repeat(3 - Math.max(0, lives)));
  function next() { if (mi + 1 >= M.length || lives <= 0) { st = 'end'; return endGame('town', lives <= 0 ? 0 : lives, { head: lives > 0 ? '먼지 많은 날도 문제없어!' : '조금만 더 빠르게!', stat: `남은 하트 ${Math.max(0, lives)}개`, facts: ['<b>외출은 줄이고</b>, 나갈 땐 <b>보건용 마스크</b>(KF80·94·99)', '큰길·공사장은 피하고, 돌아오면 <b>깨끗이 씻기</b>', '<b>물·과일·채소</b> 챙기기, 주방 후드·물걸레로 <b>실내 공기 관리</b>', '자가용 대신 <b>대중교통</b>'] }); } mi++; d = {}; M[mi].init(d); st = 'play'; tl = D; gBot(''); kin(M[mi].cmd, `${mi + 1} / ${M.length}`, 's'); AU.pop(); }
  return {
    enter() { hearts(); kin('매우 나쁨!', '오늘 하루, 일곱 가지를 해내요'); after(1.7, next); },
    update(dt) { if (st !== 'play') return; if (M[mi].upd) M[mi].upd(d, dt, G); tl -= dt; gTime(tl / D); if (tl <= 0) G.fail(); },
    draw() { if (mi < 0) { out(); drawHero(180, 420, 1.2, S.look, T, { face: 'wow', pose: 'hold' }); return; } M[mi].draw(d); text(M[mi].cmd, 180, 96, 30, '#fff', 'center', false, 8); drawHero(V.W > 520 ? 430 : 314, 598, 0.8, S.look, T, { noBoard: 1, still: 1, pose: st === 'post' ? (won ? 'cheer' : 'sad') : 'point', face: st === 'post' ? (won ? 'happy' : 'sad') : 'smile', flip: 1 }); if (st === 'post') { g.fillStyle = 'rgba(255,253,244,.35)'; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4); } },
    down(x, y) { if (st === 'play') M[mi].down(d, x, y, G); },
    move(x, y, dn) { if (st === 'play' && M[mi].move) M[mi].move(d, x, y, G); },
  };
};
