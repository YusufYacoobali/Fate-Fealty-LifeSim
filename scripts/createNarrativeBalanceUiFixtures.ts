import {writeFileSync} from 'node:fs';
import {EVENTS_BY_ID} from '../src/content';
import {singleYearFixture} from '../src/__tests__/singleYearFixtures';
import {bindEventActors} from '../src/engine/eventPicker';
import {syncPlayerToWorld} from '../src/engine/gameState';
import {runWithWorldRng} from '../src/engine/random';
import {beginLegalTrial} from '../src/engine/legalEngine';
import {beginCourtScandal} from '../src/engine/courtIncidents';
import {beginOfficePetition} from '../src/engine/courtPolitics';
import {addRoyalClaim,recogniseRuler} from '../src/engine/royalSuccessionEngine';
const ids=['comic_escaped_letter','comic_ordinary_john','comic_rival_saddle','life_boat_fare','system_legal_trial','royal_creative_accounts','court_office_contest','comic_accidental_champion'];
const saves=ids.map(id=>{
 const e=EVENTS_BY_ID[id],s=singleYearFixture(e),p=s.world.characters[s.playerCharacterId];
 s.pendingEvent={eventId:id,bindings:runWithWorldRng(s.world,()=>bindEventActors(s,e))};
 if(id==='system_legal_trial'){
  const l=p.legalState!;l.suspicion=70;l.charges=['Theft of a saddle','Forging its sale','Fraud in a market sale','Assault at the forge','Treason against the Crown','Smuggling stolen goods'].map((offence,i)=>({id:'ui_charge_'+i,offence,severity:25+i,evidence:40+i,victimIds:['merek'],witnessIds:['roderick'],year:s.world.currentYear,resolved:false}));beginLegalTrial(s);
 }
 if(id==='royal_creative_accounts'){
  addRoyalClaim(s,p.id,s.world.court!.rulerId,'recognition',90);recogniseRuler(s,p.id,'A browser fixture coronation');const c=s.world.court!;c.offices.marshal='merek';c.scandals=[{id:'ui_scandal',actorId:'merek',office:'marshal',amount:27,exposed:false}];s.pendingEvent={eventId:id,incidentId:beginCourtScandal(s),bindings:{}};
 }
 if(id==='court_office_contest')beginOfficePetition(s,'treasurer');
 s.settings.reducedMotion=true;s.settings.soundEffects=false;s.settings.haptics=false;syncPlayerToWorld(s);
 const text=typeof e.text==='string'?e.text:e.text(s),bindings=s.pendingEvent!.bindings??{};
 return {id,title:e.title,choice:e.choices[0].label,bindings,expectedNames:Object.entries(bindings).filter(([role,actor])=>text.includes('{{'+role)||text.includes(s.world.characters[actor].name)).map(([,actor])=>s.world.characters[actor].name),year:s.world.currentYear,warning:id==='life_boat_fare'?'Death':id==='system_legal_trial'?'Imprisonment':id==='royal_creative_accounts'?'Substantial political damage':undefined,envelope:{schemaVersion:7,savedAt:Date.now(),game:s}};
});
writeFileSync(process.argv[2]??'/tmp/fate-balance-ui-fixtures.json',JSON.stringify(saves));
