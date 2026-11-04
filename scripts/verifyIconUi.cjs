// Review the actual exported PNGs at game sizes and exercise the existing UI.
// Review tooling is external; no Playwright dependency is added to the app.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const output = 'docs/validation/icon-crops';
const build = process.env.ICON_EXPORT_DIR ?? '/tmp/fate-icons-production';
const url = process.env.ICON_UI_URL ?? 'http://127.0.0.1:8108';
const audit = JSON.parse(fs.readFileSync(`${output}/audit.json`));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const files = fs.readdirSync(path.join(build, 'assets'), {recursive:true}).filter(p => p.endsWith('.png'));
const sources = new Map(audit.icons.map(icon => {
  const matches = files.filter(p => path.basename(p).startsWith(icon.name.slice(0,-4)+'.'));
  const asset = matches.find(p => hash(fs.readFileSync(path.join(build,'assets',p))) === icon.after.sha256);
  if (!asset) throw Error('Current icon missing from production export: '+icon.name);
  return [icon.name, '/assets/'+asset.split(path.sep).join('/')];
}));
const samples = audit.icons.map(icon => `<section><p>${icon.name}</p>${['#eadbb2','#17467c'].map(bg=>`<div class="samples" style="background:${bg}">${[24,32,48,64].map(size=>`<div class="frame" style="width:${size}px;height:${size}px"><img alt="${icon.name} at ${size}px" src="${sources.get(icon.name)}" width="${size}" height="${size}"></div>`).join('')}</div>`).join('')}</section>`).join('');
fs.writeFileSync(path.join(build,'icon-review.html'),`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Icon crop review</title><style>body{margin:8px;background:#e8d9ad;color:#162a42;font:13px monospace}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:8px}section{min-width:0;border:1px solid #966c2f;padding:6px}p{overflow-wrap:anywhere}.samples{display:flex;gap:6px;align-items:center;padding:5px;margin:4px 0}.frame{flex:none}img{object-fit:contain;display:block}</style><h1>All 187 registered icons</h1><main>${samples}</main>`);
const achievements=[...fs.readFileSync('src/data/achievements.ts','utf8').matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
const meta={onboarded:true,tutorialSeen:true,firstLifeNo:1,lifetimeUnlocked:true,proTrialUsed:true,proTrialNoticeSeen:true,reviewPrompted:true,reviewPromptCount:3,notificationsDenied:true,achievements,dailyReward:{lastClaimDate:new Date().toISOString().slice(0,10),streak:1,longestStreak:1,totalClaims:1,graceAvailable:true}};
const fixture=JSON.parse(fs.readFileSync('/tmp/holding-ui-fixtures.json')).find(f=>f.kind==='court');
fixture.envelope.game.lifetimeUnlocked=true;
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const results=[],errors=[];
  for(const width of [280,320,390,768]){
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(url+'/icon-review.html');
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const count=await page.locator('img').count();
    if(count!==audit.iconsReviewed*8)throw Error('Incomplete icon gallery');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Icon gallery overflow');
    await page.screenshot({path:`${output}/gallery-${width}.png`});
    results.push({kind:'gallery',width,icons:audit.iconsReviewed,images:count,sizes:[24,32,48,64],backgrounds:['parchment','blue'],passed:true});
    await page.close();
    const game=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    game.on('pageerror',e=>errors.push(String(e)));
    await game.addInitScript(({save,meta})=>{localStorage.setItem('mls:world:v5',JSON.stringify(save));localStorage.setItem('mls:meta:v1',JSON.stringify(meta));},{save:fixture.envelope,meta});
    await game.goto(url);await game.evaluate(()=>document.fonts.ready);
    await game.getByRole('button',{name:'HOLD',exact:true}).click();await game.waitForTimeout(2500);
    for(const tab of ['LIFE','DO','PEOPLE','HOLD','SHOP','ME']){
      await game.getByRole('button',{name:tab,exact:true}).click();await game.waitForTimeout(500);
      await game.screenshot({path:`${output}/game-${tab.toLowerCase()}-${width}.png`});
      if(await game.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(tab+' overflow');
      results.push({kind:'game',tab,width,passed:true});
      if(tab==='DO')for(const section of ['LEISURE','QUESTS']){
        await game.getByText(section,{exact:true}).click();await game.waitForTimeout(300);
        await game.screenshot({path:`${output}/game-do-${section.toLowerCase()}-${width}.png`});
        if(await game.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('DO '+section+' overflow');
        results.push({kind:'game-section',tab:'DO',section,width,passed:true});
      }
    }
    await game.getByRole('button',{name:'SHOP',exact:true}).click();
    if(await game.getByText('APOTHECARY',{exact:true}).count()){
      await game.getByText('APOTHECARY',{exact:true}).click();await game.waitForTimeout(300);
      await game.screenshot({path:`${output}/game-apothecary-${width}.png`});
    }
    const loaded=await game.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.src.includes('/generated/')).map(i=>({src:new URL(i.src).pathname,loaded:i.complete&&i.naturalWidth>0})));
    for(const image of loaded)if(!image.loaded)throw Error('Unloaded game image '+image.src);
    await game.close();
  }
  const version=browser.version();await browser.close();
  if(errors.length)throw Error(errors.join('\n'));
  fs.writeFileSync(`${output}/browser.json`,JSON.stringify({version,results,errors},null,2)+'\n');
  console.log(`PASS: four galleries (${audit.iconsReviewed} icons, four sizes, two backgrounds), 24 game-tab screens and eight Do sections; no page errors or width overflow`);
})().catch(error=>{console.error(error);process.exit(1)});
