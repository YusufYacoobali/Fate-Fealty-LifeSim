// Original vector pixel art. Re-run to reproduce the two bundled Lottie files.
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '../assets/animations');
fs.mkdirSync(out, { recursive: true });
const fixed = k => ({ a: 0, k });
const keys = pairs => ({ a: 1, k: pairs.map(([t, s]) => ({ t, s: Array.isArray(s) ? s : [s], h: 1 })) });
const color = hex => hex.match(/\w\w/g).map(n => parseInt(n, 16) / 255).concat(1);
const rect = (x, y, w, h, hex) => ({ ty: 'gr', it: [{ ty: 'rc', p: fixed([x + w / 2, y + h / 2]), s: fixed([w, h]), r: fixed(0) }, { ty: 'fl', c: fixed(color(hex)), o: fixed(100), r: 1 }, { ty: 'tr', p: fixed([0, 0]), a: fixed([0, 0]), s: fixed([100, 100]), r: fixed(0), o: fixed(100), sk: fixed(0), sa: fixed(0) }] });
const layer = (name, shapes, ks = {}, end = 24) => ({ ddd: 0, ind: 1, ty: 4, nm: name, sr: 1, ks: { o: fixed(100), r: fixed(0), p: fixed([0, 0, 0]), a: fixed([0, 0, 0]), s: fixed([100, 100, 100]), ...ks }, ao: 0, shapes: [...shapes].reverse(), ip: 0, op: end, st: 0, bm: 0 });
const file = (name, w, h, end, layers) => fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify({ v: '5.12.2', fr: 40, ip: 0, op: end, w, h, nm: name, ddd: 0, assets: [], layers: layers.map((l, i) => ({ ...l, ind: i + 1 })) }) + '\n');
const hammer = layer('Pixel steel hammer', [
  rect(10, -18, 66, 16, '171d2b'), rect(16, -14, 58, 8, '8f512f'), rect(18, -14, 54, 3, 'c38a49'),
  ...[48, 56, 64].map(x => rect(x, -14, 3, 8, '5a342b')),
  rect(-18, -34, 34, 34, '101b2b'), rect(-22, -28, 42, 22, '101b2b'), rect(-18, -28, 34, 22, '566777'),
  rect(-14, -30, 26, 6, 'b8ccd6'), rect(-18, -24, 8, 14, '8b9fa9'), rect(-10, -10, 26, 6, '34465e'), rect(12, -24, 4, 14, '334055'),
], { a: fixed([68, -10, 0]), p: fixed([228, 92, 0]), r: keys([[0, 50], [2, 60], [4, 30], [5, 0], [7, 0], [9, 22], [12, 42], [15, 50], [24, 50]]) });
const sparks = Array.from({ length: 9 }, (_, i) => {
  const angle = (195 + i * 19) * Math.PI / 180;
  const dx = Math.round(Math.cos(angle) * (34 + i % 3 * 14) / 2) * 2;
  const dy = Math.round(Math.sin(angle) * 44 / 2) * 2;
  return layer('Square ember ' + i, [rect(-2, -2, i % 2 ? 4 : 6, 4, i % 2 ? 'ffce3a' : 'fff0b0')], { p: keys([[0, [160, 103, 0]], [5, [160, 103, 0]], [7, [160 + dx / 2, 103 + dy / 2, 0]], [10, [160 + dx, 103 + dy, 0]], [14, [160 + dx + 4, 113 + dy, 0]]]), o: keys([[0, 0], [5, 100], [11, 100], [14, 0]]) });
});
file('pixel-hammer', 320, 208, 24, [...sparks, hammer]);
const paper = [rect(26, 18, 272, 208, '0d2a4a'), rect(22, 14, 272, 208, 'd8c08f'), rect(22, 14, 268, 204, 'f6e9c8'), rect(26, 18, 260, 4, 'fffaf0'), rect(154, 22, 4, 188, 'd8c08f'), rect(42, 34, 228, 8, '0d2a4a'), rect(66, 48, 180, 4, '5a4a28'), rect(42, 64, 228, 2, '5a4a28')];
for (let col = 0; col < 2; col++) for (let row = 0; row < 11; row++) paper.push(rect(42 + col * 120, 80 + row * 10, row % 4 === 3 ? 72 : 100, row === 0 ? 6 : 3, row === 0 ? '0d2a4a' : '8a7440'));
file('pixel-newspaper', 320, 240, 28, [layer('Unfolding pixel broadsheet', paper, { a: fixed([160, 120, 0]), p: fixed([160, 120, 0]), s: keys([[0, [32, 65, 100]], [3, [42, 70, 100]], [6, [58, 80, 100]], [9, [78, 90, 100]], [12, [96, 100, 100]], [15, [100, 100, 100]], [28, [100, 100, 100]]]), r: keys([[0, -8], [6, -4], [12, 0]]) }, 28)]);



