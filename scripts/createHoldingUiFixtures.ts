import {mkdirSync,writeFileSync} from 'node:fs';
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {CAREERS} from '../src/data/careers';
import {eventById} from '../src/engine/eventPicker';
import {addRoyalClaim,recogniseRuler} from '../src/engine/royalSuccessionEngine';
const cases=['estate','court','monarch','locked','child'] as const;
const fixtures=cases.map(kind=>{
 const s=createLife({worldSeed:880043,firstName:'Edmund',gender:'man',attraction:'women',lifetimeUnlocked:kind==='monarch',birthOrigin:'peasant',settings:{difficulty:'Normal',autoScroll:true,liveForever:false,reducedMotion:true,soundEffects:false,haptics:false}});
 s.age=kind==='child'?4:25;s.world.currentYear=s.bornYear+s.age;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.age+=s.age;
 s.pendingEvent=null;s.gold=kind==='locked'?0:200;s.stats.health=78;s.stats.wits=83;s.stats.charm=87;s.stats.faith=38;s.tab='hold';
 if(kind==='court')s.occupation.careerId=CAREERS.find(c=>c.family==='court'&&!c.premium)!.id;
 s.holding.stores=61;s.holding.security=78;s.holding.loyalty=78;s.holding.population=30;
 const p=s.world.characters[s.playerCharacterId];p.education!.qualifications=['court_education'];p.factionInfluence=25;s.world.factions.crown.playerStanding=10;
 if(kind==='locked'){p.education!.qualifications=[];p.factionInfluence=0;s.world.factions.crown.playerStanding=0;}
 syncPlayerToWorld(s);
 if(kind==='monarch'){addRoyalClaim(s,p.id,s.world.court!.rulerId,'recognition',90);recogniseRuler(s,p.id,'UI fixture coronation');}
 syncPlayerToWorld(s);return {kind,withdrawChoice:eventById('court_office_contest')!.choices.find(c=>c.outcome?.effects?.courtPetition==='withdraw')?.label,envelope:{schemaVersion:7,savedAt:Date.now(),game:s}};
});
mkdirSync('docs/validation/holding-writing',{recursive:true});writeFileSync('/tmp/holding-ui-fixtures.json',JSON.stringify(fixtures));
console.log('Created',fixtures.length,'Holding fixtures');
