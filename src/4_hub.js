
/* =========================================================
   화면 흐름: 제목 → 대원 꾸미기 → 이야기 → 본부(도시 파노라마에서 작전지 고르기) → 작전 → 본부 …
   ========================================================= */
const DIST = [
  { id: 'lab', name: '먼지 연구소', tg: '미세먼지란?', desc: '초미세먼지는 얼마나 작을까? 오늘 공기는 무슨 색일까?', mon: 'gas' },
  { id: 'road', name: '5등급 검문소', tg: '계절관리제 · 운행제한', desc: '평일 아침 6시부터 밤 9시까지! 5등급 차량을 찾아내요.', mon: 'smog' },
  { id: 'room', name: '비상 상황실', tg: '비상저감조치', desc: '오늘 농도와 내일 예보를 보고, 발령할지 판단해요.', mon: 'soot' },
  { id: 'plant', name: '굴뚝 공단', tg: '배출원 줄이기', desc: '발전소·공사장·들판… 먼지가 나오는 곳을 대책으로 막아요.', mon: 'fire' },
  { id: 'town', name: '우리 동네', tg: '시민 행동요령', desc: '먼지가 매우 나쁜 날! 일곱 가지 행동을 재빨리 해내요.', mon: 'dust' },
  { id: 'arcade', name: '오락실', tg: '보너스 게임', desc: '하늘에서 내려오는 먼지몬을 막는, 옛날 오락기 슈팅 게임.', mon: null },
];
const arcStore = () => { try { return JSON.parse(localStorage.getItem('sky-guard-v1')) || {}; } catch (e) { return {}; } };
const isDone = (i) => (DIST[i].id === 'arcade' ? !!arcStore().clear : !!S.stars[DIST[i].id]);
const MONPOS = [[-92, -236, 19], [72, -296, 25], [120, -214, 15]];
function drawWorld(camX, tod, cl, o = {}) { // 하늘 → 도시 → 작전지 건물 → 먼지몬(아직 못 한 곳) 또는 별 깃발(마친 곳)
  drawSky(tod, cl, camX); drawCity(tod, cl, camX);
  for (let i = 0; i < DIST.length; i++) {
    const x = i * DW - camX + 206; if (x < V.L - 260 || x > V.R + 260) continue; const d = DIST[i], done = isDone(i);
    g.save(); g.translate(x, GY); LM[i](T, done); g.restore();
    if (o.noMon) continue;
    if (!done && d.mon) MONPOS.forEach(([dx, dy, r], k) => drawMon(x + dx + Math.sin(T * 0.9 + k * 2 + i) * 8, GY + dy + Math.sin(T * 1.7 + k + i) * 7, r, d.mon, T, { ph: k * 2 + i, look: Math.sin(T * 0.5 + k) }));
    else if (done && d.mon) { const n = S.stars[d.id] || 0; g.save(); g.translate(x, GY - 318 + Math.sin(T * 2 + i) * 4); g.rotate(-0.06); box(-46, -16, 92, 32, 10, '#fffdf4'); for (let k = 0; k < 3; k++) { starPath(-25 + k * 25, 0.5, 9.5); fin(k < n ? '#ffb300' : '#d9d5c3', 1.8); } g.restore(); }
  }
}
const stageOff = () => { $('#ui').hidden = true; $('#stage').hidden = true; $('#meongBar').hidden = true; $('#kin').innerHTML = ''; };

/* ---------- 제목 ---------- */
function titleScene() {
  let st = 0;
  return {
    enter() {
      stageOff(); AU.music('hub');
      const L = (s, i) => `<span style="animation-delay:${0.15 + i * 0.09}s">${s}</span>`;
      show(`<div class="logo"><span class="tg"><span>미세먼지 계절관리제 대작전</span></span><h1>${L('하', 0)}${L('늘', 1)}<br><em>${L('수', 2)}${L('비', 3)}${L('대', 4)}</em></h1><p>구름보드를 타고 뿌연 도시를 되찾아라!</p></div>
        <div class="tmenu"><button class="b go big" id="tGo">${S.made ? '이어서 출동!' : '출동!'}</button><div class="rowb" style="width:100%"><button class="b sm w" id="tNote">수첩</button><button class="b sm w" id="tSnd">${AU.muted ? '소리 꺼짐' : '소리 켜짐'}</button></div></div>`, 'clear title');
      $('#tGo').onclick = () => { AU.init(); AU.tap(); if (S.made) wipe(null, () => setScene(hubScene())); else wipe({ k: 'NEW MEMBER', t: '대원 등록', s: '나만의 수비대원을 만들어요' }, () => creator(true)); };
      $('#tNote').onclick = () => { AU.init(); AU.tap(); book(0, () => setScene(titleScene())); };
      $('#tSnd').onclick = () => { AU.init(); $('#tSnd').textContent = AU.toggle() ? '소리 꺼짐' : '소리 켜짐'; };
    },
    update(dt) { const wide = V.W > 560, hx = wide ? 180 + V.W * 0.2 : 180, hy = wide ? 400 : 404; if ((st -= dt) <= 0) { st = 0.05; fx.push({ k: 'dot', x: hx + Math.sin(T * 0.7) * 46 - 50, y: hy + Math.sin(T * 1.1) * 14 + rand(-40, 10), vx: -rand(160, 260), vy: 0, gr: 0, life: 0.5, max: 0.5, col: '#ffffff', r: rand(1.5, 3.5) }); } },
    draw() { const cl = 0.5 - 0.5 * Math.cos(T * 0.22); drawWorld(1050 - Math.cos(T * 0.045) * 1010, 'day', cl); hazeOver(cl); const wide = V.W > 560; drawHero((wide ? 180 + V.W * 0.2 : 180) + Math.sin(T * 0.7) * 46, (wide ? 400 : 404) + Math.sin(T * 1.1) * 14, wide ? 2.1 : 1.15, S.look, T, { pose: 'fly', face: 'open', lean: 0.16 + Math.sin(T * 1.1) * 0.05, wind: 1 }); },
  };
}

/* ---------- 대원 꾸미기 ---------- */
const CR = [
  ['타입', [['type', '어떤 대원?', TYPES.map((t) => t.n)]]],
  ['머리', [['hair', '머리 모양', HAIRN], ['hairCol', '머리 색', HAIRC]]],
  ['얼굴', [['skin', '피부', SKIN], ['eye', '눈', EYEN]]],
  ['옷', [['suit', '슈트 색', SUITC], ['scarf', '목도리 색', SCARFC]]],
  ['장비', [['gear', '머리 장비', GEARN], ['board', '타는 보드', BOARDN]]],
];
function creator(first) {
  const L = S.look, back = { ...L }; let tab = 0, joy = 0;
  const body = () => CR[tab][1].map(([k, lab, list]) => `<div class="opt"><small>${lab}</small><div>${list.map((v, i) => (v[0] === '#' ? `<button class="sw ${L[k] === i ? 'on' : ''}" data-k="${k}" data-i="${i}" style="background:${v}" aria-label="${lab} ${i + 1}"></button>` : `<button class="ch ${L[k] === i ? 'on' : ''}" data-k="${k}" data-i="${i}">${v}</button>`)).join('')}</div></div>`).join('');
  const paint = () => {
    $('#crT').innerHTML = CR.map((c, i) => `<button class="${i === tab ? 'on' : ''}" data-t="${i}">${c[0]}</button>`).join(''); $('#crB').innerHTML = body();
    $$('#crT button').forEach((b) => (b.onclick = () => { tab = +b.dataset.t; AU.tap(); paint(); }));
    $$('#crB button').forEach((b) => (b.onclick = () => { const k = b.dataset.k, i = +b.dataset.i; L[k] = i; if (k === 'type') { L.suit = TYPES[i].suit; L.scarf = TYPES[i].scarf; } joy = 0.7; AU.pop(); sparkle(180, V.B - 500, 8, [SUITC[L.suit], '#ffffff']); paint(); }));
  };
  stageOff();
  setScene({
    update(dt) { joy -= dt; },
    draw() {
      const c = SUITC[L.suit] === '#ffffff' ? '#8aa0c8' : SUITC[L.suit], gr = g.createLinearGradient(0, V.T, 0, V.B); gr.addColorStop(0, mix(c, INK, 0.62)); gr.addColorStop(1, mix(c, '#ffffff', 0.15)); g.fillStyle = gr; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4);
      g.save(); g.translate(180, 190); g.rotate(T * 0.14); g.fillStyle = 'rgba(255,255,255,.085)'; for (let i = 0; i < 14; i++) { g.rotate(TAU / 14); g.beginPath(); g.moveTo(0, 0); g.lineTo(1200, -120); g.lineTo(1200, 120); g.closePath(); g.fill(); } g.restore();
      g.fillStyle = 'rgba(255,255,255,.1)'; for (let y = V.T + 14; y < 130; y += 16) for (let x = V.L + 8 + ((y / 16) % 2) * 8; x < V.R; x += 16) { g.beginPath(); g.arc(x, y, Math.max(0.5, 3.6 - (y - V.T) / 40), 0, TAU); g.fill(); }
      const top = V.T + 12, bot = V.B - 400, k = clamp((bot - top - 92) / 130, 1, 2.3);
      text(TYPES[L.type].n, 180, top + 36, 58, 'rgba(255,255,255,.22)'); text(TYPES[L.type].d, 180, top + 76, 13.5, '#fff', 'center', true);
      ell(180, bot + 12 * k, 44 * k, 7 * k, 'rgba(18,20,43,.28)', 0);
      drawHero(180, bot, k, L, T, { pose: joy > 0 ? 'cheer' : 'idle', face: joy > 0 ? 'happy' : 'smile', wind: 0.35 });
    },
  });
  show(`<div class="pnl pn"><div class="tabs" id="crT"></div><div id="crB" style="min-height:calc(var(--u)*150)"></div>
    <label class="field">이름 <input id="nm" maxlength="8" placeholder="수비대원" autocomplete="off" value="${esc(S.name)}"></label>
    <div class="rowb" style="margin-top:calc(var(--u)*12)">${first ? '' : '<button class="b sm w" id="crX">취소</button>'}<button class="b sm w" id="crR">무작위</button><button class="b go" id="crOk" style="flex:2.2">완성!</button></div></div>`, 'clear low');
  paint();
  $('#crR').onclick = () => { const r = (a) => (Math.random() * a.length) | 0; Object.assign(L, { type: r(TYPES), hair: r(HAIRN), hairCol: r(HAIRC), skin: r(SKIN), eye: r(EYEN), suit: r(SUITC), scarf: r(SCARFC), gear: r(GEARN), board: r(BOARDN) }); joy = 0.7; AU.star(); sparkle(180, V.B - 500, 14); paint(); };
  if (!first) $('#crX').onclick = () => { Object.assign(L, back); AU.tap(); wipe(null, () => setScene(hubScene())); };
  $('#crOk').onclick = () => { S.name = $('#nm').value.trim().slice(0, 8); S.made = 1; save(); AU.win(); if (first) wipe({ k: '겨울과 봄', t: '하늘이 뿌옇다!', s: '서풍, 멈춘 공기, 늘어난 난방… 미세먼지가 짙어지는 계절' }, story); else wipe(null, () => setScene(hubScene())); };
}
function story() { // 처음 한 번: 뿌연 도시를 훑어보고 계절관리제 소개
  hide(); let x = 0;
  setScene({ enter() { AU.music('hub'); after(0.5, () => kin('콜록콜록!', '도시가 먼지몬에게 뒤덮였어요')); after(3.4, () => wipe({ k: '매년 12월 1일 ~ 이듬해 3월 31일', t: '미세먼지 계절관리제', s: '넉 달 동안 평소보다 더 세게 줄여요. 수비대, 출동!' }, () => setScene(hubScene({ hello: 1 })))); },
    update(dt) { x += dt * 150; }, draw() { drawWorld(x, 'day', 0); hazeOver(0); drawHero(180, 372, 1, S.look, T, { face: 'wow', pose: 'hold', wind: 0.9, lean: 0.1 }); } });
}

/* ---------- 본부: 도시 파노라마에서 작전지 고르기 ---------- */
function hudSync(pm = pmNow()) {
  $('#uName').textContent = S.name || '수비대원'; $('#uRank').textContent = rankOf(); faceTo($('#uFace'), S.look);
  const v = Math.round(pm), e = $('#uGrade'); $('#uPm').textContent = v; e.textContent = v > F.goal ? `목표까지 ${v - F.goal}` : '목표 달성!'; e.style.background = v > F.goal ? '#ff5a5f' : '#19d3a2';
  $('#uBar').style.width = clamp((F.start - pm) / (F.start - F.goal), 0.03, 1) * 100 + '%';
}
function hubScene(o = {}) {
  let sel = clamp(S.sel || 0, 0, DIST.length - 1), camX = sel * DW, hxw = sel * DW + 100, hv = 0, st = 0, face = 'smile', joy = 0;
  const H = { cl: o.pm0 === undefined ? cleanNow() : clamp((F.start - o.pm0) / (F.start - F.goal), 0, 1) };
  const card = (anim) => {
    const d = DIST[sel], arc = d.id === 'arcade', n = S.stars[d.id] || 0, c = $('#uCard');
    c.innerHTML = `<span class="no">${arc ? '★' : '0' + (sel + 1)}</span><span class="tg"><span>${d.tg}</span></span><h2>${d.name}</h2><p>${d.desc}</p><div class="row">${arc ? `<span style="font-weight:900;font-size:calc(var(--u)*12.5);white-space:nowrap">${arcStore().best ? '최고 ' + arcStore().best.toLocaleString() + '점' : '기록 없음'}</span>` : `<span class="stars">${starHtml(n)}</span>`}<button class="b go" id="uGo">${arc ? '들어가기' : n ? '다시 출동' : '출동!'}</button></div><div class="dots">${DIST.map((x, k) => `<i class="${k === sel ? 'on' : ''} ${isDone(k) ? 'ok' : ''}"></i>`).join('')}</div>`;
    $('#uGo').onclick = enter; if (anim) { c.classList.remove('in'); void c.offsetWidth; c.classList.add('in'); }
  };
  const go = (i) => { i = clamp(i, 0, DIST.length - 1); if (i === sel) return; sel = i; S.sel = i; save(); AU.whoosh(); card(true); };
  function enter() { AU.tap(); const d = DIST[sel]; if (d.id === 'arcade') arcadeDoor(); else playGame(d.id); }
  return {
    enter() {
      stageOff(); hide(); $('#ui').hidden = false; AU.music('hub'); hudSync(F.start - H.cl * (F.start - F.goal)); card(true);
      $('#uPrev').onclick = () => go(sel - 1); $('#uNext').onclick = () => go(sel + 1);
      $('#uMe').onclick = () => { AU.tap(); wipe(null, () => creator(false)); }; $('#uNote').onclick = () => { AU.tap(); book(0, hide); };
      $('#uMeong').onclick = () => { AU.tap(); wipe({ k: 'HEALING', t: '하늘멍', s: '잠깐 쉬어 가요' }, () => setScene(meongScene())); }; $('#uSet').onclick = () => { AU.tap(); settings(); };
      const to = cleanNow();
      if (to > H.cl + 0.001) { const pm0 = Math.round(F.start - H.cl * (F.start - F.goal)); tw(H, { cl: to }, 2.2, E.io, 0.7); after(0.8, () => { kin('하늘이 맑아졌다!', `초미세먼지 ${pm0} → ${pmNow()}㎍/㎥`); AU.star(); joy = 2.6; confetti(40); }); after(3.4, () => { if (doneN() === MIDS.length && !S.fin) finale(); }); }
      else if (o.hello) after(0.6, () => toast('◀ ▶ 로 작전지를 고르고 <b>출동!</b> 을 눌러요'));
    },
    update(dt) {
      camX += (sel * DW - camX) * (1 - Math.exp(-dt * 4.5)); const tx = sel * DW + 100; hv += ((tx - hxw) * 34 - hv * 10) * dt; hxw += hv * dt; joy -= dt;
      if (Math.abs(hv) > 70 && (st -= dt) <= 0) { st = 0.035; fx.push({ k: 'dot', x: hxw - camX + 180 - Math.sign(hv) * 26, y: 372 + rand(-30, 6), vx: -hv * 0.5, vy: 0, gr: 0, life: 0.35, max: 0.35, col: '#ffffff', r: rand(1.5, 3.2) }); }
      const pm = F.start - H.cl * (F.start - F.goal); if (Math.round(pm) !== +$('#uPm').textContent) hudSync(pm);
    },
    draw() { drawWorld(camX, 'day', H.cl); hazeOver(H.cl); const mv = Math.abs(hv) > 60; drawHero(hxw - camX + 180, 372, 0.96, S.look, T, { pose: joy > 0 ? 'cheer' : mv ? 'fly' : 'idle', face: joy > 0 ? 'happy' : mv ? 'open' : face, flip: hv < -60, lean: clamp(Math.abs(hv) * 0.0011, 0, 0.3), wind: clamp(0.45 + Math.abs(hv) / 500, 0, 1) }); },
    up(x, y, dx, dy) {
      if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy)) return go(sel + (dx < 0 ? 1 : -1));
      const wx = x - 180 + camX, i = Math.round((wx - 26) / DW); if (i < 0 || i >= DIST.length || Math.abs(wx - 26 - i * DW) > 130 || y < GY - 330 || y > GY + 70) return;
      if (i === sel) enter(); else go(i);
    },
    key(c) { if (c === 'ArrowLeft') go(sel - 1); else if (c === 'ArrowRight') go(sel + 1); else if (c === 'Enter' || c === 'Space') enter(); else return false; },
  };
}
function arcadeDoor() {
  const a = arcStore();
  show(`<div class="pnl pn"><button class="b sm w xx" id="aX">✕</button><span class="tg"><span>보너스 게임</span></span><h2>오락실 · 하늘 수비대 아케이드</h2><p>본부 옆 오락실에 있는 <b>옛날 오락기</b>예요. 구름을 타고 물방울을 쏴서, 12월부터 3월까지 넉 달 동안 하늘에서 내려오는 먼지몬을 막아요. 🚨 단추가 켜지면 <b>비상저감조치</b>!</p>${a.best ? `<p>내 최고 기록 <b>${a.best.toLocaleString()}점</b> · 완주 ${a.clear || 0}번</p>` : ''}<button class="b go big" id="aGo">오락기 켜기</button></div>`);
  $('#aX').onclick = () => { AU.tap(); hide(); };
  $('#aGo').onclick = () => { AU.tap(); S.sel = 5; save(); wipe({ k: 'INSERT COIN', t: '오락실', s: '옛날 오락기 화면으로 바뀌어요' }, () => { location.href = 'arcade/?hq=1'; }); };
}

/* ---------- 하늘멍 (쉬어 가기) ---------- */
function meongScene() {
  let tod = S.meong || 'day', x = 300, dim = 0; const bar = $('#meongBar'), birds = Array.from({ length: 6 }, (_, i) => ({ x: rand(-200, 500), y: 150 + i * 16 + rand(-10, 10), v: rand(22, 40), p: rand(0, 6) })); let shoot = null, shootT = 4;
  const paint = () => { bar.innerHTML = [['day', '낮'], ['sunset', '노을'], ['night', '밤']].map(([k, n]) => `<button class="b sm ${k === tod ? '' : 'w'}" data-k="${k}">${n}</button>`).join('') + '<button class="b sm go" id="mOut">돌아가기</button>'; $$('#meongBar [data-k]').forEach((b) => (b.onclick = () => { tod = S.meong = b.dataset.k; save(); AU.tap(); dim = 0; paint(); })); $('#mOut').onclick = () => { AU.tap(); wipe(null, () => setScene(hubScene())); }; };
  return {
    enter() { stageOff(); hide(); bar.hidden = false; bar.classList.remove('dim'); paint(); AU.music('calm'); after(0.8, () => toast('천천히 숨을 쉬면서 하늘을 바라봐요')); },
    update(dt) { x += dt * 16; dim += dt; bar.classList.toggle('dim', dim > 5); for (const b of birds) { b.x += b.v * dt; if (b.x > V.R + 40) { b.x = V.L - 40; b.y = rand(120, 260); } }
      if (tod === 'night' && (shootT -= dt) <= 0) { shootT = rand(4, 9); shoot = { x: rand(V.L + 40, V.R - 40), y: rand(V.T + 30, 200), t: 0 }; } if (shoot && (shoot.t += dt) > 0.8) shoot = null; },
    draw() {
      const cl = 0.6 + 0.4 * cleanNow(); drawWorld(x % 2400, tod, cl, { noMon: 1 }); hazeOver(cl, tod);
      if (tod !== 'night') { g.strokeStyle = tod === 'sunset' ? '#3a2350' : '#27306b'; g.lineWidth = 2; g.lineCap = 'round'; for (const b of birds) { const f = Math.sin(T * 7 + b.p) * 4; g.beginPath(); g.moveTo(b.x - 7, b.y - f); g.quadraticCurveTo(b.x - 3, b.y - 3, b.x, b.y); g.quadraticCurveTo(b.x + 3, b.y - 3, b.x + 7, b.y - f); g.stroke(); } }
      if (shoot) { const p = shoot.t / 0.8; g.globalAlpha = 1 - p; line(shoot.x + p * 150, shoot.y + p * 70, shoot.x + p * 150 - 50, shoot.y + p * 70 - 23, '#fff', 2.4); g.globalAlpha = 1; }
      drawHero(180 + Math.sin(T * 0.25) * 60, 330 + Math.sin(T * 0.6) * 16, 1.05, S.look, T * 0.6, { face: 'happy', pose: 'idle', wind: 0.5, lean: Math.sin(T * 0.5) * 0.06 });
      if (tod === 'night') { g.fillStyle = 'rgba(6,10,38,.28)'; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4); }
    },
    down() { dim = 0; },
  };
}

/* ---------- 수첩 · 설정 · 마무리 · 인증서 ---------- */
function book(tab, back) {
  show(`<div class="pnl pn wide"><button class="b sm w xx" id="bx">✕</button><span class="tg"><span>수비대 수첩</span></span><div class="tabs" style="margin-top:calc(var(--u)*10)">${NOTES.map((n, i) => `<button data-t="${i}" class="${i === tab ? 'on' : ''}">${n[0]}</button>`).join('')}</div><div class="note">${NOTES[tab][1]}<div class="src">자료: 기후에너지환경부·국무조정실 보도자료(2025.11.18., 2025.11.25., 2026.2.24.), 수원시 누리집 미세먼지 안내. ${F.round} 계절관리제 기준이며 시기와 지역에 따라 달라질 수 있어요.</div></div></div>`);
  $$('#ovl .tabs button').forEach((b) => (b.onclick = () => { AU.tap(); book(+b.dataset.t, back); })); $('#bx').onclick = () => { AU.tap(); back(); };
}
function settings() {
  show(`<div class="pnl pn"><button class="b sm w xx" id="sX">✕</button><span class="tg"><span>설정</span></span><h2>${esc(S.name || '수비대원')} · ${rankOf()}</h2><p>모은 별 <b>${starSum()} / 15</b> · 마친 작전 <b>${doneN()} / 5</b></p>
    <div class="rowb"><button class="b w" id="sSnd">${AU.muted ? '소리 꺼짐' : '소리 켜짐'}</button><button class="b w" id="sMe">대원 꾸미기</button></div>
    <div class="rowb" style="margin-top:calc(var(--u)*10)"><button class="b mint" id="sCert" ${doneN() ? '' : 'disabled'}>인증서 저장</button><button class="b w" id="sHome">처음 화면</button></div>
    <p style="margin:calc(var(--u)*14) 0 0;font-size:calc(var(--u)*11);color:#666">기록은 이 기기에만 저장돼요. <button id="sReset" style="border:0;background:none;text-decoration:underline;font-weight:700;color:#d43d2a">처음부터 다시 하기</button></p></div>`);
  $('#sX').onclick = () => { AU.tap(); hide(); }; $('#sSnd').onclick = () => { $('#sSnd').textContent = AU.toggle() ? '소리 꺼짐' : '소리 켜짐'; };
  $('#sMe').onclick = () => { AU.tap(); hide(); wipe(null, () => creator(false)); }; $('#sHome').onclick = () => { AU.tap(); wipe(null, () => setScene(titleScene())); };
  $('#sCert').onclick = () => saveCert();
  $('#sReset').onclick = () => { show(`<div class="pnl pn"><h2>처음부터 다시 할까요?</h2><p>모은 별과 대원 꾸미기가 모두 지워져요. 되돌릴 수 없어요.</p><div class="rowb"><button class="b w" id="rN">아니요</button><button class="b go" id="rY">지우기</button></div></div>`); $('#rN').onclick = settings; $('#rY').onclick = () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } location.href = location.pathname; }; };
}
function finale() {
  S.fin = 1; save(); AU.win(); confetti(120); kin('작전 성공!', '다섯 작전을 모두 해냈어요');
  after(2.2, () => {
    show(`<div class="pnl pn"><span class="tg"><span>MISSION COMPLETE</span></span><h2>${esc(S.name || '수비대원')} 대원,<br>푸른 하늘을 되찾았어요!</h2><p>우리 도시 초미세먼지 <b>${F.start} → ${pmNow()}㎍/㎥</b>. 실제로도 계절관리제를 하면서 이 기간 농도가 <b>33 → 20㎍/㎥</b>으로 낮아졌고, 이번 목표는 <b>${F.goal}㎍/㎥</b>이에요.</p>
      <ul class="facts"><li><b>계절관리제</b>: 매년 12월 1일~이듬해 3월 31일, 평소보다 강하게 줄여요.</li><li><b>비상저감조치</b>: 오늘 50 초과 + 내일 50 초과 예보(또는 내일 75 초과 예보)면 발령!</li><li>먼지는 <b>나오는 곳에서 줄이는 것</b>이 먼저예요.</li><li>짙은 날엔 <b>외출 줄이기·보건용 마스크·씻기·대중교통</b>.</li></ul>
      <p>${starSum() < 15 ? `별을 모두 모으면(${starSum()}/15) 목표 ${F.goal}에 닿아요. ` : '별을 모두 모았어요! '}오락실의 옛날 오락기도 해 보세요.</p><div class="rowb"><button class="b mint" id="fC">인증서 저장</button><button class="b go" id="fOk">계속하기</button></div></div>`);
    $('#fC').onclick = () => saveCert(); $('#fOk').onclick = () => { AU.tap(); hide(); };
  });
}
function saveCert() { // 인증서 그림 (이 기기 안에서만 만들어짐)
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d'), old = g; g = x;
  const gr = x.createLinearGradient(0, 0, 0, 1350); gr.addColorStop(0, '#1b78e2'); gr.addColorStop(0.6, '#6ec2ff'); gr.addColorStop(1, '#dff5ff'); x.fillStyle = gr; x.fillRect(0, 0, 1080, 1350);
  x.save(); x.translate(540, 360); x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 14; i++) { x.rotate(TAU / 14); x.beginPath(); x.moveTo(0, 0); x.lineTo(1500, -150); x.lineTo(1500, 150); x.closePath(); x.fill(); } x.restore();
  cloud(190, 250, 3, '#ffffff', 0.95); cloud(900, 180, 2.4, '#ffffff', 0.95); cloud(820, 560, 2, '#ffffff', 0.9);
  x.save(); x.translate(-360, 0); drawHero(900, 560, 3.6, S.look, 1, { pose: 'cheer', face: 'happy', still: 1, wind: 0.7 }); x.restore();
  x.save(); x.translate(540, 0); box(-450, 690, 900, 540, 44, '#fffdf4', 10); x.fillStyle = INK; x.fillRect(-430, 1232, 900, 0);
  text('미세먼지 계절관리제 대작전', 0, 760, 40, '#0b7f6a', 'center', true); text('하늘 수비대 인증서', 0, 850, 96, INK);
  text(`${S.name || '수비대원'} · ${rankOf()}`, 0, 965, 60, '#d43d2a');
  for (let k = 0; k < 5; k++) { const n = S.stars[MIDS[k]] || 0; for (let j = 0; j < 3; j++) { starPath(-336 + k * 150 + j * 36, 1050, 17); fin(j < n ? '#ffb300' : '#d9d5c3', 4); } }
  text(`우리 도시 초미세먼지 ${F.start} → ${pmNow()}㎍/㎥ (목표 ${F.goal})`, 0, 1120, 36, INK, 'center', true);
  const d = new Date(); text(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}${ORG ? ' · ' + ORG : ''} · 계절관리제는 매년 12월 1일~이듬해 3월 31일`, 0, 1180, 27, '#5b6080', 'center', true); x.restore(); g = old;
  c.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = '하늘수비대_인증서.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('인증서를 저장했어요'); });
}
