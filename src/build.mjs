// src/ 의 조각들을 이어 붙여 ../hq/index.html (2D 미니게임판 '하늘 수비대') 을 만든다.  실행: node src/build.mjs
// 수첩 글(NOTES)은 arcade/index.html 에 있는 것을 그대로 가져와 한 곳에서만 관리한다.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url)), rd = (f) => readFileSync(join(dir, f), 'utf8');
const arc = readFileSync(join(dir, '../arcade/index.html'), 'utf8');
const a = arc.indexOf('const PILL ='), b = arc.indexOf('function book(');
if (a < 0 || b < 0) throw new Error('arcade/index.html 에서 NOTES 를 찾지 못함');
const notes = '\n/* ---------- 수첩 글 (arcade/index.html 과 같은 내용) ---------- */\n' + arc.slice(a, b);
const js = readdirSync(dir).filter((f) => /^\d_.*\.js$/.test(f)).sort();
let out = rd('1_head.html');
for (const f of js) { if (f.startsWith('9_')) out += notes; out += rd(f); }
writeFileSync(join(dir, '../hq/index.html'), out);
console.log('hq/index.html', (out.length / 1024).toFixed(1) + ' KB', js.join(' '));
