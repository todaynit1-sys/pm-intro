
/* ---------- 시작 ---------- */
let last = performance.now();
function frame(ts) { const dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts; tick(dt); begin(); scene.draw(); drawFx(); requestAnimationFrame(frame); }
{ const q = new URLSearchParams(location.search); setScene(S.made && q.has('hq') ? hubScene() : titleScene()); if (q.has('hq')) history.replaceState(null, '', location.pathname + location.hash); }
requestAnimationFrame(frame);
if (location.hash === '#debug') window.__g = { S, V, save, step(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); begin(); scene.draw(); drawFx(); }, get scene() { return scene; }, get T() { return T; }, get fx() { return fx; }, setScene, titleScene, hubScene, creator, story, meongScene, playGame, endGame, finale, book, settings, GAME, wipe, kin, toast, saveCert };
</script>
</body>
</html>
