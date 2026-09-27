// Pack image-generated pixel fighters into self-contained Lottie layers.
// Only atlas extraction / nearest-neighbour sizing happens here; artwork is in assets/generated.
const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');
const root = path.join(__dirname, '..');
const atlas = PNG.sync.read(fs.readFileSync(path.join(root, 'assets/generated/combat-fighters-pixel.png')));
const fixed = k => ({ a: 0, k });
const keys = pairs => ({ a: 1, k: pairs.map(([t, s]) => ({ t, s: Array.isArray(s) ? s : [s], h: 1 })) });
const motion = pairs => ({ a: 1, k: pairs.map(([t, value], i) => {
  const s = Array.isArray(value) ? value : [value];
  if (i === pairs.length - 1) return { t, s };
  const next = pairs[i + 1][1];
  return { t, s, e: Array.isArray(next) ? next : [next], o: { x: [0.2], y: [0] }, i: { x: [0.2], y: [1] } };
}) });
const end = 48;
function sprite(id, left) {
  const png = new PNG({ width: 164, height: 172 });
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const src = ((210 + y * 4) * atlas.width + left + x * 4) * 4;
    atlas.data.copy(png.data, (y * png.width + x) * 4, src, src + 4);
  }
  const bytes = PNG.sync.write(png);
  fs.writeFileSync(path.join(root, `assets/generated/${id}.png`), bytes);
  return { id, w: png.width, h: png.height, u: '', p: 'data:image/png;base64,' + bytes.toString('base64'), e: 1 };
}
const assets = [sprite('combat-player-pixel', 64), sprite('combat-rival-pixel', 816)];
const letters = require('./pixelCombatLetters.cjs');
const rgb = hex => hex.match(/../g).map(x => parseInt(x, 16) / 255).concat(1);
const transform = overrides => ({ o: fixed(100), r: fixed(0), p: fixed([0, 0, 0]), a: fixed([0, 0, 0]), s: fixed([100, 100, 100]), ...overrides });
const base = (name, ks) => ({ ddd: 0, nm: name, sr: 1, ks: transform(ks), ao: 0, ip: 0, op: end, st: 0, bm: 0 });
const fighter = (id, name, ks) => ({ ...base(name, ks), ty: 2, refId: id });
const fill = hex => ({ ty: 'fl', c: fixed(rgb(hex)), o: fixed(100), r: 1 });
const rect = (x, y, w, h) => ({ ty: 'rc', p: fixed([x + w / 2, y + h / 2]), s: fixed([w, h]), r: fixed(0) });
const shape = (name, geometry, hex, ks = {}) => ({ ...base(name, ks), ty: 4, shapes: [...geometry, fill(hex)] });
const show = (from, until, strength = 100) => keys([[0, 0], [from, strength], [until, strength], [until + 1, 0]]);
const points = vertices => ({ ty: 'sh', ks: fixed({ i: vertices.map(() => [0,0]), o: vertices.map(() => [0,0]), v: vertices, c: true }) });
const scale = (x, y = x) => [x, y, 100];
const pos = (x, y) => [x, y, 0];

function word(text, hex, impact, permanent = false) {
  const cell = 2, width = (text.length * 6 - 1) * cell;
  const pixels = [];
  [...text].forEach((ch, i) => {
    if (!letters[ch]) throw Error('Missing pixel letter ' + ch);
    letters[ch].forEach((row, y) => {
      // Merge runs instead of drawing one layer per pixel.
      for (let x = 0; x < row.length;) {
        if (row[x] !== '1') { x++; continue; }
        let stop = x + 1; while (row[stop] === '1') stop++;
        pixels.push(rect((i * 6 + x) * cell - width / 2, y * cell - 7, (stop - x) * cell, cell)); x = stop;
      }
    });
  });
  const ks = {
    p: motion([[0, pos(160, 55)], [impact, pos(160, 55)], [impact + 3, pos(160, 43)], [impact + 7, pos(160, 48)], [36, pos(160, 40)], [47, pos(160, 36)]]),
    s: motion([[0, scale(90)], [impact, scale(90)], [impact + 3, scale(150, 145)], [impact + 7, scale(120)], [36, scale(120)], [47, scale(110)]]),
    r: motion([[0, -10], [impact + 3, 5], [impact + 7, -3], [36, -3], [47, 0]]),
    o: permanent ? show(impact, 48) : keys([[0, 0], [impact, 100], [34, 100], [39, 50], [43, 0]]),
  };
  // Four offset silhouettes create a continuous outline without pixel seams.
  return [shape('Callout ' + text, pixels, hex, ks), ...[[2,2],[-2,2],[2,-2],[-2,-2]].map(([x,y]) => shape('Callout outline', pixels, '101a2a', { ...ks, a: fixed([-x, -y, 0]) }))];
}

function sparks(impact, at, tint, count = 14) {
  return Array.from({length: count}, (_, i) => {
    const theta = i * Math.PI * 2 / count;
    const travel = 26 + i % 3 * 11;
    return shape('Impact shard ' + i, [rect(-2,-2,i % 2 ? 3 : 6,3)], i % 3 ? tint : 'fff4d1', {
      p: motion([[0,at],[impact,at],[impact + 4, pos(at[0] + Math.round(Math.cos(theta) * 10), at[1] + Math.round(Math.sin(theta) * 10))], [impact + 10, pos(at[0] + Math.round(Math.cos(theta) * travel), at[1] + Math.round(Math.sin(theta) * travel))], [impact + 17, pos(at[0] + Math.round(Math.cos(theta) * (travel + 6)), at[1] + Math.round(Math.sin(theta) * travel) + 10)]]),
      r: motion([[0,0],[impact + 10,i * 27]]), o: show(impact, impact + 14),
    });
  });
}

const arc = [[-60,24],[-58,4],[-46,-22],[-24,-42],[4,-48],[32,-36],[50,-14],[56,10],[44,-4],[26,-20],[4,-26],[-18,-22],[-36,-10],[-50,8]];
function sweep(name, impact, at, tint, direction = 1, size = 100) {
  return shape(name, [points(arc)], tint, {
    p: fixed(at), s: motion([[0,scale(size * .7 * direction,size * .7)],[impact - 2,scale(size * direction,size)],[impact + 4,scale(size * 1.08 * direction,size * 1.08)]]),
    r: motion([[0,-65 * direction],[impact - 2,-45 * direction],[impact,18 * direction],[impact + 4,55 * direction]]), o: show(impact - 2, impact + 4, 88),
  });
}

const labels = { idle: '', strike: 'SLASH!', heavy: 'SMASH!', feint: 'FEINT!', block: 'BLOCK!', parry: 'PARRY!', dodge: 'DODGE!', hurt: 'OUCH!', miss: 'WHOOSH!', recover: 'BREATHE!', victory: 'VICTORY!', defeat: 'DOWN!' };
for (const [action, label] of Object.entries(labels)) {
  const heavy = action === 'heavy';
  const attack = ['strike','heavy','feint','miss','victory'].includes(action);
  const defending = ['block','parry','dodge','hurt','defeat'].includes(action);
  const hit = !['idle','dodge','miss','recover'].includes(action);
  const impact = heavy ? 14 : action === 'feint' ? 16 : 10;
  const tint = ['block','parry','dodge'].includes(action) ? '96e5ef' : action === 'hurt' || action === 'defeat' ? 'ff9472' : action === 'recover' ? 'b8e889' : 'ffd477';
  const px = action === 'dodge' ? 52 : attack ? heavy ? 132 : 126 : action === 'hurt' ? 54 : 80;
  const py = heavy ? 174 : action === 'dodge' ? 170 : 190;
  const ex = action === 'miss' ? 266 : attack ? 226 : 190;
  let pp = motion([[0,pos(82,190)],[4,pos(attack ? 66 : 82,194)],[impact - 2,pos(px,py)],[impact + 3,pos(px,py)],[impact + 7,pos(attack ? px + 5 : px - 3,190)],[29,pos(82,190)],[47,pos(82,190)]]);
  if (action === 'feint') pp = motion([[0,pos(82,190)],[4,pos(115,186)],[8,pos(88,190)],[14,pos(132,182)],[19,pos(132,182)],[25,pos(108,190)],[32,pos(82,190)],[47,pos(82,190)]]);
  if (action === 'recover') pp = motion([[0,pos(82,190)],[8,pos(76,194)],[20,pos(82,182)],[30,pos(82,190)],[47,pos(82,190)]]);
  const ep = motion([[0,pos(238,190)],[4,pos(defending ? 224 : 238,192)],[impact - 2,pos(ex,defending ? 182 : 190)],[impact + 3,pos(ex,defending ? 182 : 190)],[impact + 8,pos(attack && action !== 'miss' ? 260 : ex,heavy ? 164 : 190)],[30,pos(action === 'victory' ? 253 : 238,190)],[47,pos(action === 'victory' ? 253 : 238,190)]]);
  const pr = action === 'defeat' ? motion([[0,0],[10,-20],[18,25],[27,85],[47,85]])
    : motion([[0,0],[4,attack ? -20 : 0],[impact - 2,attack ? heavy ? 26 : 18 : action === 'dodge' ? -24 : -8],[impact + 3,attack ? heavy ? 26 : 18 : -8],[impact + 8,action === 'hurt' ? -30 : 5],[29,0],[47,0]]);
  const er = action === 'victory' ? motion([[0,0],[impact,0],[impact + 4,22],[23,-42],[30,-88],[47,-88]])
    : motion([[0,0],[impact - 2,defending ? -22 : 0],[impact + 3,defending ? -22 : 0],[impact + 8,attack && action !== 'miss' ? heavy ? 32 : 22 : 0],[30,0],[47,0]]);
  const squash = motion([[0,scale(75)],[4,scale(82,66)],[impact - 2,scale(70,82)],[impact + 3,scale(70,82)],[impact + 8,scale(83,67)],[29,scale(75)],[47,scale(75)]]);
  const playerKs = { a: fixed([82,166,0]), p: pp, r: pr, s: squash };
  const rivalKs = { a: fixed([82,166,0]), p: ep, r: er, s: squash };
  if (action === 'idle') {
    Object.assign(playerKs,{p:fixed(pos(82,190)),r:fixed(0),s:fixed(scale(75))});
    Object.assign(rivalKs,{p:fixed(pos(238,190)),r:fixed(0),s:fixed(scale(75))});
  }
  const effects = [];
  if (label) effects.push(...word(label,tint,impact,['victory','defeat'].includes(action)));
  if (hit) effects.push(...sparks(impact,pos(defending ? 124 : 190,122),tint,heavy ? 20 : 14));
  if (attack || defending) {
    effects.push(sweep('Steel slash arc',impact,pos(defending ? 140 : 169,130),'fff1cc',defending ? -1 : 1,heavy ? 120 : 88));
    effects.push(sweep('Gold slash edge',impact - 1,pos(defending ? 140 : 169,130),'f4b851',defending ? -1 : 1,heavy ? 130 : 96));
  }
  if (action === 'block' || action === 'parry') effects.push(shape('Shield impact', [points([[-22,-32],[14,-24],[24,10],[0,32],[-24,10]])], '93deed', {p:fixed(pos(128,133)),o:show(impact,impact+5,45),s:motion([[0,scale(80)],[impact,scale(80)],[impact+5,scale(120)]])}));
  // Faint copies leave a readable dash trail; they vanish before the impact settles.
  const ghosts = action === 'idle' || action === 'recover' ? [] : [0,1].map(i => fighter('combat-player-pixel','Dash afterimage '+i,{...playerKs,a:fixed([82 + (attack ? 14 : -14) * (i+1),166,0]),o:show(impact-3,impact+1,18-i*6)}));
  const dust = action === 'idle' ? [] : Array.from({length:10},(_,i)=>shape('Landing dust '+i,[rect(-3,-2,6,3)],i%2?'d7a66c':'f0c483',{
    p:motion([[0,pos(attack ? 120 : 78,191)],[impact+5,pos(attack ? 120 : 78,191)],[impact+12,pos((attack ? 120 : 78)+(i-4)*8,180-i%3*5)],[impact+20,pos((attack ? 120 : 78)+(i-4)*12,189)]]),o:show(impact+5,impact+19,70),
  }));
  const streaks = action === 'idle' || action === 'recover' ? [] : Array.from({length:5},(_,i)=>shape('Speed streak '+i,[rect(0,0,24+i%2*15,2)],'f8da96',{p:fixed(pos(attack?45:245,100+i*15)),o:show(impact-4,impact-1,50)}));
  const layers = [...effects,...dust,fighter('combat-player-pixel','Blue adventurer',playerKs),fighter('combat-rival-pixel','Red challenger',rivalKs),...ghosts,...streaks,
    ...[82,238].map(x=>shape('Ground shadow',[{ty:'el',p:fixed([0,0]),s:fixed([58,9])}],'332631',{p:fixed(pos(x,192)),o:fixed(28)}))];
  fs.writeFileSync(path.join(root,`assets/animations/pixel-combat-${action}.json`),JSON.stringify({v:'5.12.2',fr:40,ip:0,op:end,w:320,h:208,nm:'pixel-combat-'+action,ddd:0,assets,layers:layers.map((l,i)=>({...l,ind:i+1}))})+'\n');
}
