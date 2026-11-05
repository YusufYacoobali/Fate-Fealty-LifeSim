import {mkdirSync,writeFileSync} from 'node:fs';
import {createLife,syncPlayerToWorld} from '../src/engine/gameState';
import {legacyStatus} from '../src/engine/lifeDepthState';
import {selectProgressionHint} from '../src/state/viewModel';
import {addRoyalClaim,recogniseRuler} from '../src/engine/royalSuccessionEngine';
const dir='docs/validation/clean-profile-court';mkdirSync(dir,{recursive:true});
const kinds=['commoner','squire','knight','noble','royal','royal_kin','baron','monarch','locked'] as const;
const fixtures=kinds.map(kind=>{
 const s=createLife({worldSeed:950113,lifeNo:2,firstName:'Edmund',nickname:'Goosefriend',birthOrigin:kind==='royal'||kind==='royal_kin'?'royal':'peasant',lifetimeUnlocked:kind!=='locked',settings:{difficulty:'Normal',autoScroll:true,liveForever:false,reducedMotion:true,haptics:false,soundEffects:false}});
 s.age=kind==='royal'?16:kind==='noble'?38:30;s.world.currentYear=s.bornYear+s.age;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.age+=s.age;
 s.gold=kind==='noble'?350:100;s.stats={health:78,charm:84,wits:76,faith:38};s.tab='me';s.goalId='fortune';s.occupation.careerId='trader';
 const p=s.world.characters[s.playerCharacterId];p.factionInfluence=25;s.world.factions.crown.playerStanding=10;p.education!.qualifications=['court_education'];
 if(kind==='noble')s.goalId=null;
 const rank=kind==='noble'?3:kind==='baron'?4:kind==='squire'?1:kind==='knight'?2:undefined;
 if(rank!==undefined){s.rankIdx=p.rankIdx=rank;p.socialStatus=legacyStatus(rank);}
 if(kind==='squire'||kind==='knight')s.occupation.careerId='levy';
 if(kind==='royal_kin'){p.parentIds=[];s.world.court!.claims=s.world.court!.claims.filter(c=>c.characterId!==p.id);for(const c of Object.values(s.world.characters))c.childIds=c.childIds?.filter(id=>id!==p.id);}
 if(kind==='monarch'){syncPlayerToWorld(s);addRoyalClaim(s,p.id,s.world.court!.rulerId,'recognition',90);recogniseRuler(s,p.id,'A UI fixture coronation');}
 s.pendingEvent=null;syncPlayerToWorld(s);
 return {kind,hint:selectProgressionHint(s),envelope:{schemaVersion:7,savedAt:Date.now(),game:s}};
});
writeFileSync('/tmp/clean-profile-ui-fixtures.json',JSON.stringify(fixtures));
writeFileSync(`${dir}/progression-hints.json`,JSON.stringify(fixtures.map(({kind,hint})=>({kind,hint})),null,2)+'\n');
console.log('Created',fixtures.length,'profile fixtures.');
