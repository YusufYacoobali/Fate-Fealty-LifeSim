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



// Combat scenes share the forge's stepped pixel animation and warm palette.
const yard = [rect(0,0,320,208,'271e25'),rect(0,0,320,92,'454258'),rect(0,92,320,72,'665247'),rect(0,156,320,52,'8c6948'),rect(0,159,320,4,'b38a58')];
for(let row=0;row<5;row++)for(let col=0;col<11;col++)yard.push(rect(col*34-(row%2?17:0),48+row*22,30,18,row%2?'584a47':'60524b'));
for(let i=0;i<8;i++){yard.push(rect(i*44,28,32,25,'766658'),rect(i*44+4,28,24,4,'ad9774'));}
for(let i=0;i<22;i++)yard.push(rect((i*67)%320,167+(i%4)*10,10+(i%3)*4,3,i%2?'735239':'bd935d'));
for(const x of [20,292])yard.push(rect(x,80,8,78,'3a2928'),rect(x-4,80,16,4,'b17c43'),rect(x-2,65,12,15,'ce693a'),rect(x,61,8,13,'f6bd64'),rect(x+2,63,4,7,'fff0b0'));
for(let i=0;i<9;i++){const x=40+i*27;yard.push(rect(x,99,11,17,['7a5744','786b64','6a5e6e'][i%3]),rect(x+2,93,7,8,'d6a774'),rect(x,91,11,4,'3a2d30'));}
yard.push(rect(0,128,320,5,'b9905b'),rect(0,143,320,4,'50392d'));
for(const x of [10,72,244,304])yard.push(rect(x,120,6,42,'3d2b28'),rect(x,120,6,4,'d3a266'));
const body = (enemy) => { const cloth=enemy?'a64e46':'426b86', light=enemy?'d6775d':'759ca8';return [
 rect(-20,41,38,8,'594331'),rect(-13,-6,12,32,'282631'),rect(3,-6,12,32,'282631'),rect(-17,23,18,6,'171d2b'),rect(3,23,18,6,'171d2b'),
 rect(-20,-43,40,43,'172433'),rect(-16,-43,32,39,cloth),rect(-12,-39,8,25,light),rect(-17,-9,34,6,'322c32'),rect(-3,-9,7,6,'e4b766'),
 rect(-14,-67,28,25,'231d27'),rect(-10,-64,22,21,'d69b6c'),rect(-10,-64,8,9,'f0c18b'),rect(5,-58,4,4,'171d2b'),rect(-14,-72,28,10,'85939c'),rect(-18,-65,36,6,'b8c4bb'),rect(-15,-59,6,18,'586779'),
 rect(-27,-39,11,27,'233345'),rect(-25,-37,8,21,'a5b3ab'),rect(15,-34,13,11,'d69b6c'),
 ];};
for(const action of ['idle','strike','block','dodge','hurt','miss','victory']){
 const attacking=action==='strike'||action==='miss'||action==='victory';
 const pX=action==='dodge'?-24:attacking?38:action==='hurt'?-12:4;
 const player=layer('Blue fighter',body(false),{p:keys([[0,[84,143,0]],[4,[84-8,143,0]],[8,[84+pX,143,0]],[14,[84+pX,143,0]],[23,[84,143,0]]])},32);
 const enemy=layer('Red challenger',body(true),{p:keys([[0,[236,143,0]],[6,[attacking?232:201,143,0]],[12,[attacking?250:206,143,0]],[23,[236,143,0]]]),s:fixed([-100,100,100]),r:action==='victory'?keys([[0,0],[12,0],[15,-35],[19,-75],[25,-90]]):fixed(0)},32);
 const swordShapes=[rect(-3,-56,6,50,'172433'),rect(-2,-55,4,43,'dce6df'),rect(-2,-55,2,43,'a6bec4'),rect(-9,-14,18,5,'d6aa61'),rect(-3,-9,6,15,'694530')];
 const blade=layer('Player sword',swordShapes,{p:keys([[0,[109,116,0]],[4,[103,112,0]],[8,[109+pX,116,0]],[14,[109+pX,116,0]],[23,[109,116,0]]]),r:keys([[0,18],[4,attacking?-38:-15],[8,action==='block'?-55:attacking?85:15],[14,attacking?85:15],[23,18]])},32);
 const foeBlade=layer('Opponent sword',swordShapes,{p:keys([[0,[211,116,0]],[6,[attacking?207:176,116,0]],[12,[attacking?225:181,116,0]],[23,[211,116,0]]]),r:keys([[0,-18],[4,attacking?-20:35],[8,attacking?-55:-85],[14,-45],[23,-18]])},32);
 const burst=Array.from({length:9},(_,i)=>{const angle=i*Math.PI/4;return layer('Impact spark '+i,[rect(-2,-2,4,4,action==='hurt'?'dc7655':i%2?'fff0b0':'f6bd64')],{o:keys([[0,0],[10,['idle','dodge','miss'].includes(action)?0:100],[17,100],[21,0]]),p:keys([[0,[160,112,0]],[10,[160,112,0]],[17,[160+Math.round(Math.cos(angle)*28),112+Math.round(Math.sin(angle)*24),0]],[21,[160+Math.round(Math.cos(angle)*36),118+Math.round(Math.sin(angle)*32),0]]])},32)});
 file('pixel-combat-'+action,320,208,32,[...burst,blade,foeBlade,player,enemy,layer('Stone yard, spectators and torches',yard,{},32)]);
}
