/* Production browser review; fixtures are made by createMilestoneUiFixtures.ts. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE??'playwright');
const fs=require('node:fs');
const dir='docs/validation/milestones';fs.mkdirSync(dir,{recursive:true});
const fixtures=JSON.parse(fs.readFileSync('/tmp/milestone-ui-fixtures.json'));
const achievements=[...fs.readFileSync('src/data/achievements.ts','utf8').matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
const meta={onboarded:true,tutorialSeen:true,firstLifeNo:1,proTrialUsed:true,proTrialNoticeSeen:true,reviewPrompted:true,reviewPromptCount:3,notificationsDenied:true,achievements,dailyReward:{lastClaimDate:new Date().toISOString().slice(0,10),streak:1,longestStreak:1,totalClaims:1,graceAvailable:true}};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE??'/usr/bin/chromium',args:['--no-sandbox']});const results=[],errors=[];
 const cases=fixtures.flatMap(f=>[280,320,390,768].map(width=>({f,width,scale:1})));
 for(const kind of ['spouse_bitter','child_loss','priority','former_deceased'])cases.push({f:fixtures.find(f=>f.kind===kind),width:280,scale:1.35});
 for(const kind of ['spouse_bitter','priority'])cases.push({f:fixtures.find(f=>f.kind===kind),width:280,scale:1.35,height:430});
 if(process.env.MILESTONE_SCENARIO){for(let i=cases.length-1;i>=0;i--)if(cases[i].f.kind!==process.env.MILESTONE_SCENARIO)cases.splice(i,1);}
 if(process.env.MILESTONE_SHORT_ONLY==='1')cases.splice(0,cases.length-2);
 for(const{f,width,scale,height=850}of cases){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(({state,meta})=>{if(!localStorage.getItem('mls:world:v5'))localStorage.setItem('mls:world:v5',JSON.stringify(state));if(!localStorage.getItem('mls:meta:v1'))localStorage.setItem('mls:meta:v1',JSON.stringify(meta));},{state:f.envelope,meta});
  const game=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mls:world:v5')).game);
  const enlarge=async()=>{if(scale===1)return;await page.evaluate(scale=>{for(const e of document.querySelectorAll('*')){const s=getComputedStyle(e);if(/VT323|PressStart/.test(s.fontFamily)&&e.childNodes.length){e.dataset.baseFont??=String(parseFloat(s.fontSize));e.dataset.baseLine??=String(parseFloat(s.lineHeight));e.style.fontSize=Number(e.dataset.baseFont)*scale+'px';e.style.lineHeight=Number(e.dataset.baseLine)*scale+'px';}}},scale);};
  const snap=async name=>{await enlarge();await page.screenshot({path:`${dir}/${name}-${width}${scale>1?'-large':''}${height<850?'-short':''}.png`});};
  const noOverflow=async()=>{if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(`Horizontal overflow ${f.kind} ${width}`);};
  const ack=async()=>{
   const before=await game();const open=before.lifeEvents.notices.filter(n=>!n.acknowledged).sort((a,b)=>b.priority-a.priority||a.year-b.year)[0];
   await page.getByText(open.title,{exact:true}).waitFor();await page.getByText(open.text,{exact:true}).waitFor();if(await page.getByText('NAME THY CHILD',{exact:true}).count())throw Error('Notice overlaps naming');
   await page.getByText('CONTINUE',{exact:true}).scrollIntoViewIfNeeded();if(height<850)await snap(f.kind+'-'+open.category+'-continue');await page.getByText('CONTINUE',{exact:true}).click();
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('mls:world:v5')).game.lifeEvents.notices.find(n=>n.id===id)?.acknowledged,open.id);
   const after=await game();delete before.lifeEvents;delete after.lifeEvents;if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Continue changed gameplay: '+f.kind);
  };
  await page.goto(process.env.MILESTONE_UI_URL??'http://127.0.0.1:8104');await page.evaluate(()=>document.fonts.ready);await page.getByRole('button',{name:'PEOPLE',exact:true}).waitFor();
  if(f.kind==='priority'){
   await page.getByText('THE FERRY’S EXTRA PASSENGER',{exact:true}).waitFor();if(await page.getByText('YOUR SPOUSE HAS DIED',{exact:true}).count())throw Error('Notice overlapped required event');
   if(width===390)await snap('critical-event-first');await page.getByText('Wait for the next crossing',{exact:true}).click();
  }
  const first=f.envelope.game.lifeEvents.notices.filter(n=>!n.acknowledged).sort((a,b)=>b.priority-a.priority)[0];
  await page.getByText(first.title,{exact:true}).waitFor();await page.reload();await page.getByText(first.text,{exact:true}).waitFor();await enlarge();await noOverflow();
  if(width===390||f.kind==='spouse_tender'||scale>1)await snap(f.kind);
  const baseline=await game();if(baseline.lifetimeUnlocked||baseline.actionClock.used!==baseline.actionClock.cap||baseline.gold!==0)throw Error('Must test free and exhausted actions');
  await ack();
  if(f.kind==='priority'){
   await page.getByText('A PARENT HAS DIED',{exact:true}).waitFor();await ack();await page.getByText('NAME THY CHILD',{exact:true}).waitFor();await enlarge();
   const g=await game();if(g.childNaming.pendingIds.length!==2||g.lifeEvents.notices.filter(n=>!n.acknowledged).length)throw Error('Priority lost queue');
   await page.getByRole('textbox',{name:"Child's name",exact:true}).fill('Élodie');if(height<850){await page.getByRole('textbox',{name:"Child's name",exact:true}).focus();await page.getByRole('textbox',{name:"Child's name",exact:true}).scrollIntoViewIfNeeded();}if(width===390||height<850)await snap('naming-after-notices');await page.getByText('CONFIRM NAME',{exact:true}).scrollIntoViewIfNeeded();if(height<850)await snap('naming-continue');await page.getByText('CONFIRM NAME',{exact:true}).click();
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('mls:world:v5')).game.world.characters[id].name==='Élodie',f.children[0]);await page.getByText('KEEP SUGGESTED NAME',{exact:true}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('mls:world:v5')).game.childNaming.pendingIds.length===0);
  }
  await page.reload();await page.getByRole('button',{name:'PEOPLE',exact:true}).click();if(await page.getByText(first.title,{exact:true}).count())throw Error('Acknowledged notice returned');
  if(['spouse_tender','spouse_bitter','spouse_illness','former_deceased'].includes(f.kind)){
   await page.getByText('DEAD',{exact:true}).click();await page.getByText(f.envelope.game.world.characters[f.targetId].name,{exact:true}).first().click();const label=f.kind==='former_deceased'?'FORMER SPOUSE · DECEASED':'LATE SPOUSE';await page.getByText(label,{exact:true}).waitFor();if(await page.getByText('UNMARRIED',{exact:true}).count())throw Error('Dead spouse shown unmarried');
   await page.getByText(label,{exact:true}).scrollIntoViewIfNeeded();if(width===390||scale>1)await snap('label-'+f.kind);
  }
  if(f.kind==='divorce'){
   await page.getByText('Alys',{exact:true}).first().click();await page.getByText('FORMER SPOUSE',{exact:true}).first().waitFor();if(width===390)await snap('former-spouse');
  }
  await enlarge();await noOverflow();console.log('PASS',f.kind,width,scale);results.push({scenario:f.kind,width,viewportHeight:height,textScale:scale,passed:true});await page.close();
 }
 if(process.env.MILESTONE_SHORT_ONLY==='1'||process.env.MILESTONE_SCENARIO){const prior=JSON.parse(fs.readFileSync(dir+'/browser.json'));results.unshift(...prior.results.filter(r=>process.env.MILESTONE_SCENARIO?r.scenario!==process.env.MILESTONE_SCENARIO:(r.viewportHeight??850)===850).map(r=>({viewportHeight:850,...r})));errors.unshift(...prior.errors);}
 const browserVersion=browser.version();await browser.close();if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(dir+'/browser.json',JSON.stringify({browser:'Chromium production export',browserVersion,reducedMotion:true,results,errors},null,2)+'\n');console.log('PASS',results.length,'milestone UI cases');
})().catch(e=>{console.error(e);process.exit(1)});
