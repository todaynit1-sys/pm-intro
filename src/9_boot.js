
/* ---------- 시작 ---------- */
let last = performance.now();
function frame(ts) { const dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts; tick(dt); begin(); scene.draw(); drawFx(); requestAnimationFrame(frame); }
{ const q = new URLSearchParams(location.search), em = q.get('embed');
  if (em && GAME[em] && parent !== window) { // 마을에서 넘겨준 캐릭터 모습으로 그 게임만 바로 시작
    EMBED = em; const L = (q.get('look') || '').split('.').map(Number), N = [TYPES, HAIRN, HAIRC, SKIN, EYEN, SUITC, SCARFC, GEARN];
    ['type', 'hair', 'hairCol', 'skin', 'eye', 'suit', 'scarf', 'gear'].forEach((k, i) => { if (Number.isFinite(L[i])) S.look[k] = clamp(L[i] | 0, 0, N[i].length - 1); });
    setScene({ update() {}, draw() { g.fillStyle = '#12142b'; g.fillRect(V.L - 2, V.T - 2, V.W + 4, V.H + 4); } }); stageOff(); playGame(em);
  } else setScene(S.made && q.has('hq') ? hubScene() : titleScene()); if (q.has('hq')) history.replaceState(null, '', location.pathname + location.hash); }
requestAnimationFrame(frame);
if (location.hash === '#debug') window.__g = { S, V, save, step(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); begin(); scene.draw(); drawFx(); }, get scene() { return scene; }, get T() { return T; }, get fx() { return fx; }, setScene, titleScene, hubScene, creator, story, meongScene, playGame, endGame, finale, book, settings, GAME, wipe, kin, toast, saveCert };
</script>
</body>
</html>
