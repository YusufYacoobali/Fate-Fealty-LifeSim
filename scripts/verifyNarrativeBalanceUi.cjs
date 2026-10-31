const {chromium}=require(process.env.PLAYWRIGHT_MODULE??'playwright');
const fs=require('fs');const fixtures=JSON.parse(fs.readFileSync(process.env.NARRATIVE_UI_FIXTURES??'/tmp/fate-balance-ui-fixtures.json','utf8'));
const achievements=[...fs.readFileSync('src/data/achievements.ts','utf8').matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
const meta={onboarded:true,tutorialSeen:true,firstLifeNo:1,proTrialUsed:false,proTrialNoticeSeen:true,reviewPrompted:true,reviewPromptCount:3,notificationsDenied:true,achievements,dailyReward:{lastClaimDate:new Date().toISOString().slice(0,10),streak:1,longestStreak:1,totalClaims:1,graceAvailable:true}};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const errors=[],results=[];
 const cases=fixtures.flatMap(f=>[280,320,390,768].map(width=>({f,width,enlarge:false,animated:false})));
 for(const f of fixtures.filter(f=>['comic_escaped_letter','system_legal_trial','life_boat_fare'].includes(f.id)))cases.push({f,width:280,enlarge:true,animated:false});
 cases.push({f:fixtures[0],width:320,enlarge:false,animated:true});
 for(const{f,width,enlarge,animated}of cases){
  const state=JSON.parse(JSON.stringify(f.envelope));state.game.settings.reducedMotion=!animated;
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:animated?'no-preference':'reduce'});
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(({state,meta})=>{if(!localStorage.getItem('mls:world:v5'))localStorage.setItem('mls:world:v5',JSON.stringify(state));if(!localStorage.getItem('mls:meta:v1'))localStorage.setItem('mls:meta:v1',JSON.stringify(meta));},{state,meta});
  await page.goto(process.env.NARRATIVE_UI_URL??'http://127.0.0.1:8102');await page.getByText(f.title,{exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);
  const claim=page.getByText('CLAIM THY PLACE',{exact:true});if(await claim.isVisible())await claim.click();
  const reveal=page.getByRole('button',{name:'Reveal the rest of the passage',exact:true});
  if(animated)await reveal.click();
  await page.waitForTimeout(250);
  if(enlarge)await page.evaluate(()=>{for(const e of document.querySelectorAll('*')){const s=getComputedStyle(e);if(/VT323|PressStart/.test(s.fontFamily)&&e.childNodes.length){e.style.fontSize=parseFloat(s.fontSize)*1.35+'px';e.style.lineHeight=parseFloat(s.lineHeight)*1.35+'px';}}});
  const text=await page.locator('body').innerText();
  if(f.id==='system_legal_trial'&&!text.includes('restitution up to 12g'))throw Error('Restitution cost missing');
  if(f.warning&&!text.includes(f.warning))throw Error('Missing severe warning '+f.id);
  if(text.includes('{{'))throw Error('Unresolved actor '+f.id);
  const names=Object.values(f.bindings).map(id=>state.game.world.characters[id].name);
  const requiredNames=f.expectedNames;
  if(!requiredNames.every(n=>text.includes(n)))throw Error('Missing canonical actor '+f.id+': '+names);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)throw Error('Page overflow '+f.id+' '+width);
  if(f.id==='life_boat_fare'&&width===280&&!enlarge)await page.screenshot({path:'docs/validation/balance/graded-risk-280.png'});
  if(f.id==='comic_ordinary_john'&&width===390)await page.screenshot({path:'docs/validation/balance/ordinary-john-390.png'});
  if(f.id==='royal_creative_accounts'&&width===280)await page.screenshot({path:'docs/validation/balance/royal-scandal-280.png'});
  if(enlarge&&f.id==='system_legal_trial')await page.screenshot({path:'docs/validation/balance/legal-large-text-280.png'});
  await page.getByText(f.choice,{exact:true}).click();
  if(f.id==='war_levy'){await page.getByText('THE ROUT',{exact:true}).waitFor();const passage=page.getByRole('button',{name:'Reveal the rest of the passage',exact:true});await passage.click();await page.getByText('Stand and brace your spear',{exact:true}).click();}
  await page.waitForFunction(id=>{const g=JSON.parse(localStorage.getItem('mls:world:v5')).game;return g.pendingEvent===null&&g.world.history.some(h=>h.eventId===id);},f.id);
  const resolved=await page.evaluate(id=>{const g=JSON.parse(localStorage.getItem('mls:world:v5')).game;const h=g.world.history.findLast(h=>h.eventId===id);return {choice:h.resolvedChoiceId,bindings:h.actorBindings,callback:h.callbackForHistoryId,rng:g.world.rngState,year:g.world.currentYear,open:g.activeArcs.length+(g.world.threads??[]).length+g.world.activeStories.filter(x=>['active','paused'].includes(x.status)).length};},f.id);
  if(resolved.year!==f.year||resolved.open)throw Error('Authored encounter did not finish this year '+f.id);
  for(const [role,id]of Object.entries(f.bindings))if(resolved.bindings[role]!==id)throw Error('Choice changed actor '+f.id);
  if(resolved.callback)throw Error('A current circumstance retained callback provenance');
  await page.reload();await page.getByRole('button',{name:'PEOPLE',exact:true}).waitFor();await page.waitForTimeout(250);
  const saved=await page.evaluate(id=>{const g=JSON.parse(localStorage.getItem('mls:world:v5')).game;return {history:g.world.history.findLast(h=>h.eventId===id),rng:g.world.rngState};},f.id);
  if(JSON.stringify(saved.rng)!==JSON.stringify(resolved.rng))throw Error('Hydration drew RNG '+f.id);
  if(saved.history.resolvedChoiceId!==resolved.choice)throw Error('Reload lost choice '+f.id);
  if(f.id==='system_legal_trial'&&width===280&&enlarge){
   for(const tab of ['LIFE','DO','PEOPLE','HOLD','SHOP','ME']){await page.getByRole('button',{name:tab,exact:true}).click();await page.waitForTimeout(100);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Tab overflow '+tab);}
   await page.screenshot({path:'docs/validation/balance/navigation-large-text-280.png'});
  }
  results.push({id:f.id,width,textEnlargement:enlarge?1.35:1,animated,actors:names,overflow:false,choice:resolved.choice,reloadPreserved:true});await page.close();
 }
 fs.writeFileSync('docs/validation/balance/browser.json',JSON.stringify({browser:'Chromium production export',results,errors},null,2)+'\n');
 if(errors.length)throw Error(errors.join('\n'));await browser.close();console.log('PASS',results.length,'render/choice/reload states');
})().catch(e=>{console.error(e);process.exit(1)});
