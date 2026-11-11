
/* =========================================================
   작전(미니게임) 공통 틀: 들어가기 · 점수 · 시간 막대 · 결과
   ========================================================= */
const GAME = {};
let EMBED = null; // 3D 마을 안에 겹쳐 띄운 경우: 게임 하나만 하고 결과를 부모 창에 알려 줌 (기록은 마을 쪽에서 함)
const tellParent = (o) => parent.postMessage(Object.assign({ src: 'hq' }, o), location.origin);
function stageOn(title) { stageOff(); hide(); $('#stage').hidden = false; $('#gTi').textContent = title; $('#gSc').textContent = ''; $('#gTb').hidden = true; $('#gm').innerHTML = ''; $('#gb').innerHTML = ''; }
const gScore = (s) => { $('#gSc').textContent = s; };
const gTime = (f) => { const b = $('#gTb'); if (f === null) { b.hidden = true; return; } b.hidden = false; b.firstChild.style.transform = `scaleX(${clamp(f, 0, 1)})`; b.firstChild.style.background = f < 0.3 ? '#ff5a5f' : '#19d3a2'; };
const gBot = (html) => { $('#gb').innerHTML = html; };
function playGame(id, again) { const i = DIST.findIndex((d) => d.id === id), d = DIST[i]; wipe(again ? null : { k: d.part, t: d.name, s: d.q }, () => { paused = false; stageOn(d.name); AU.music('game'); setScene(GAME[id]()); }); }
function backHub(o) { if (EMBED) return tellParent({ stars: null }); wipe(null, () => { paused = false; setScene(hubScene(o)); }); }
$('#gX').onclick = () => {
  AU.tap(); paused = true;
  show(`<div class="pnl pn"><h2>작전을 그만할까요?</h2><p>지금까지 한 것은 저장되지 않아요.</p><div class="rowb"><button class="b w" id="qN">${EMBED ? '마을로' : '본부로'}</button><button class="b go" id="qY" style="flex:1.6">계속하기</button></div></div>`);
  $('#qY').onclick = () => { AU.tap(); hide(); paused = false; }; $('#qN').onclick = () => { AU.tap(); hide(); backHub(); };
};
function endGame(id, stars, o) { // o: { head, stat, facts: [] }
  const pm0 = pmNow(), old = S.stars[id] || 0; if (stars > old) S.stars[id] = stars; save(); AU.music(null); gTime(null); gBot(''); $('#gm').innerHTML = '';
  if (stars) { AU.win(); confetti(40 + stars * 25); } else AU.lose();
  if (EMBED) { kin(stars ? '성공!' : '아쉬워요!', stars ? '★'.repeat(stars) : '한 번 더 해 봐요'); setTimeout(() => tellParent({ id, stars, head: o.head, stat: o.stat, facts: o.facts }), 1700); return; }
  show(`<div class="pnl pn"><span class="tg"><span>${stars ? '작전 성공' : '한 번 더!'}</span></span><div class="bigstars">${starHtml(stars)}</div><h2 style="text-align:center">${o.head}</h2>${o.stat ? `<p style="text-align:center">${o.stat}</p>` : ''}<ul class="facts">${o.facts.map((f) => `<li>${f}</li>`).join('')}</ul><div class="rowb"><button class="b w" id="rRe">다시 하기</button><button class="b go" id="rOk" style="flex:1.7">본부로</button></div></div>`);
  $('#rRe').onclick = () => { AU.tap(); playGame(id, true); }; $('#rOk').onclick = () => { AU.tap(); backHub({ pm0 }); };
}
