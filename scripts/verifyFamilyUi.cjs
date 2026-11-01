const {chromium}=require(process.env.PLAYWRIGHT_MODULE??'playwright');
const fs=require('node:fs');
const dir='docs/validation/family';fs.mkdirSync(dir,{recursive:true});
const fixtures=JSON.parse(fs.readFileSync('/tmp/family-ui-fixtures.json'));
const achievements=[...fs.readFileSync('src/data/achievements.ts','utf8').matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
const meta={onboarded:true,tutorialSeen:true,firstLifeNo:1,proTrialUsed:true,proTrialNoticeSeen:true,reviewPrompted:true,reviewPromptCount:3,notificationsDenied:true,achievements,dailyReward:{lastClaimDate:new Date().toISOString().slice(0,10),streak:1,longestStreak:1,totalClaims:1,graceAvailable:true}};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const results=[],errors=[];
 const cases=fixtures.filter(f=>f.kind!=='heir').flatMap(f=>[280,320,390,768].map(width=>({f,width,scale:1,keyboard:false})));
 for(const kind of ['birth','rename'])cases.push({f:fixtures.find(f=>f.kind===kind),width:280,scale:1.35,keyboard:false});
 cases.push({f:fixtures.find(f=>f.kind==='rename'),width:280,scale:1,keyboard:true});cases.push({f:fixtures.find(f=>f.kind==='heir'),width:768,scale:1,keyboard:false});
 for(const{f,width,scale,keyboard}of cases){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(({state,meta})=>{if(!localStorage.getItem('mls:world:v5'))localStorage.setItem('mls:world:v5',JSON.stringify(state));if(!localStorage.getItem('mls:meta:v1'))localStorage.setItem('mls:meta:v1',JSON.stringify(meta));},{state:f.envelope,meta});
  const game=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mls:world:v5')).game);
  const enlarge=async()=>{if(scale===1)return;await page.evaluate(scale=>{for(const e of document.querySelectorAll('*')){const s=getComputedStyle(e);if(/VT323|PressStart/.test(s.fontFamily)&&e.childNodes.length){e.dataset.baseFont??=String(parseFloat(s.fontSize));e.dataset.baseLine??=String(parseFloat(s.lineHeight));e.style.fontSize=Number(e.dataset.baseFont)*scale+'px';e.style.lineHeight=Number(e.dataset.baseLine)*scale+'px';}}},scale);};
  await page.goto(process.env.FAMILY_UI_URL??'http://127.0.0.1:8103');await page.evaluate(()=>document.fonts.ready);await page.getByRole('button',{name:'PEOPLE',exact:true}).waitFor();
  if(f.kind==='birth'){
   await page.getByText('THE FERRY’S EXTRA PASSENGER',{exact:true}).waitFor();if(await page.getByText('NAME THY CHILD',{exact:true}).count())throw Error('Naming overlapped EventModal');
   await page.getByText('Wait for the next crossing',{exact:true}).click();await page.getByText('NAME THY CHILD',{exact:true}).waitFor();await page.reload();await page.getByText('NAME THY CHILD',{exact:true}).waitFor();await enlarge();
   const before=await game();if(before.lifetimeUnlocked||before.actionClock.used!==before.actionClock.cap)throw Error('Fixture must have no yearly actions left');await page.getByRole('textbox',{name:"Child's name",exact:true}).fill('   ');await page.getByText('CONFIRM NAME',{exact:true}).click();await page.getByText('Enter a name or keep the suggestion.',{exact:true}).waitFor();
   if((await game()).childNaming.pendingIds.length!==2)throw Error('Invalid input consumed request');
   if(width===280&&scale>1)await page.screenshot({path:dir+'/naming-large-text-280.png'});
   await page.getByRole('textbox',{name:"Child's name",exact:true}).fill(' Élodie-Jane ');await page.getByText('CONFIRM NAME',{exact:true}).click();
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('mls:world:v5')).game.world.characters[id].name==='Élodie-Jane',f.children[0]);
   await page.getByText('KEEP SUGGESTED NAME',{exact:true}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('mls:world:v5')).game.childNaming.pendingIds.length===0);
   const after=await game();if(after.gold!==before.gold||after.actionClock.used!==before.actionClock.used)throw Error('Naming consumed resources');if(!after.feed.some(h=>h.actorId===f.children[0]&&h.text.includes('Élodie-Jane')))throw Error('Birth announcement retained wrong name');
   await page.reload();await page.getByRole('button',{name:'PEOPLE',exact:true}).click();await page.getByText('Élodie-Jane',{exact:true}).first().waitFor();if(width===390){await page.getByText(after.world.characters[f.children[1]].name,{exact:true}).last().scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/named-children-390.png'});}
  }
  if(f.kind==='rename'){
   await page.getByRole('button',{name:'PEOPLE',exact:true}).click();await page.getByText(f.envelope.game.world.characters[f.children[0]].name,{exact:true}).first().click();
   if(width===390){await page.getByText('RENAME CHILD',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/rename-action-390.png'});}await page.getByText('RENAME CHILD',{exact:true}).click();await page.getByText('RENAME THY CHILD',{exact:true}).waitFor();await enlarge();
   if(keyboard){await page.setViewportSize({width,height:430});await page.getByRole('textbox',{name:"Child's name",exact:true}).focus();}
   const before=await game();if(before.lifetimeUnlocked||before.actionClock.used!==before.actionClock.cap)throw Error('Fixture must have no yearly actions left');await page.getByText('ANOTHER SUGGESTION',{exact:true}).click();await page.waitForFunction(id=>{const g=JSON.parse(localStorage.getItem('mls:world:v5')).game;return g.childNaming.suggestion?.childId===id&&document.querySelector('input')?.value===g.childNaming.suggestion.name;},f.children[0]);const suggestion=await page.getByRole('textbox',{name:"Child's name",exact:true}).inputValue();await page.reload();await page.getByText('RENAME THY CHILD',{exact:true}).waitFor();if(await page.getByRole('textbox',{name:"Child's name",exact:true}).inputValue()!==suggestion)throw Error('Suggestion lost on reload');await enlarge();
   await page.getByRole('textbox',{name:"Child's name",exact:true}).fill('Anaïs O’Neill');
   if(width===280)await page.screenshot({path:dir+(keyboard?'/naming-keyboard-resize-280.png':'/rename-280.png')});
   await page.getByText('CONFIRM NAME',{exact:true}).click();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('mls:world:v5')).game.world.characters[id].name==='Anaïs O’Neill',f.children[0]);
   const after=await game();if(after.gold!==0||after.actionClock.used!==before.actionClock.used||JSON.stringify(after.world.rngState)!==JSON.stringify(before.world.rngState)||JSON.stringify(after.world.history)!==JSON.stringify(before.world.history))throw Error('Rename changed gameplay or old history');await page.getByText('Anaïs O’Neill',{exact:true}).first().waitFor();
  }
  if(f.kind==='widowed'){
   await page.getByRole('button',{name:'PEOPLE',exact:true}).click();await page.getByText(f.envelope.game.world.characters[f.suitorId].name,{exact:true}).first().click();
   await page.getByText('ROMANCE',{exact:true}).click();await page.getByText('ACCEPT PROPOSAL',{exact:true}).waitFor();const before=await game();if(before.tags.includes('married')||!before.tags.includes('widowed'))throw Error('Legacy widow not repaired');
   if(width===390){await page.getByText('ACCEPT PROPOSAL',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/widow-proposal-390.png'});}
   await page.getByText('ACCEPT PROPOSAL',{exact:true}).click();await page.waitForFunction(id=>(()=>{const g=JSON.parse(localStorage.getItem('mls:world:v5')).game;return g.world.characters[g.playerCharacterId].spouseId===id;})(),f.suitorId);
   await page.reload();await page.getByRole('button',{name:'PEOPLE',exact:true}).click();await page.getByText(f.envelope.game.world.characters[f.suitorId].name,{exact:true}).first().click();await page.getByText('TRY FOR A CHILD',{exact:true}).waitFor();const after=await game();if(!after.tags.includes('married')||after.tags.includes('widowed')||after.world.characters[f.spouseId].alive)throw Error('Remarriage status wrong');for(const id of f.children)if(JSON.stringify(after.world.characters[id].parentIds)!==JSON.stringify(before.world.characters[id].parentIds))throw Error('Remarriage changed parentage');if(width===390){await page.getByText('TRY FOR A CHILD',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/remarried-390.png'});}
  }
  if(f.kind==='heir'){await page.getByRole('button',{name:'PEOPLE',exact:true}).click();const g=await game();if(g.first!==f.envelope.game.first||g.childNaming.pendingIds.length)throw Error('Heir lost name or inherited naming requests');await page.getByText('FAMILY TREE',{exact:true}).click();await page.getByText(g.first,{exact:true}).first().waitFor();await page.screenshot({path:dir+'/named-heir-tree-768.png'});}
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow '+f.kind+' '+width);
  console.log('PASS',f.kind,width,scale,keyboard);results.push({kind:f.kind,width,textScale:scale,keyboardViewportResize:keyboard,passed:true});await page.close();
 }
 await browser.close();if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(dir+'/browser.json',JSON.stringify({browser:'Chromium production export',results,errors},null,2)+'\n');console.log('PASS',results.length,'family UI cases');
})().catch(e=>{console.error(e);process.exit(1)});
