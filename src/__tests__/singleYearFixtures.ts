import type {GameEvent,GameState} from '@/types/game';
import {CAREERS} from '@/data/careers';
import {createLife,syncPlayerToWorld} from '@/engine/gameState';
import {spawnKin} from '@/engine/kinFactory';
import {applyEffects} from '@/engine/consequenceEngine';
import {addRoyalClaim,recogniseRuler} from '@/engine/royalSuccessionEngine';
import {runWithWorldRng} from '@/engine/random';
export function singleYearFixture(e:GameEvent):GameState {
 const s=createLife({worldSeed:90511,lifetimeUnlocked:true});
 const age=Math.max(e.ageMin??18,e.requires?.minAge??0);s.age=age;s.world.currentYear=s.bornYear+age;s.gold=500;s.stats={health:80,wits:70,charm:70,faith:70};
 const p=s.world.characters[s.playerCharacterId];p.age=age;
 for(const c of Object.values(s.world.characters))if(c.id!==p.id){c.age+=age;c.alive=true;}
 const spawn=(options:Parameters<typeof spawnKin>[1])=>runWithWorldRng(s.world,()=>spawnKin(s,options));
 const peer=spawn({kind:'friend',age:Math.min(16,Math.max(6,age)),name:'Test Peer'});
 if(Object.values(e.actorRoles??{}).some(r=>r.kinds?.includes('friend')))spawn({kind:'friend',age:30,name:'Adult Friend'});
 const teacher=spawn({kind:'acquaintance',age:40,name:'Test Teacher'});teacher.occupation.careerId='cleric';
 if(Object.values(e.actorRoles??{}).some(r=>r.relation==='child'))spawn({kind:'child',age:12});
 if(Object.values(e.actorRoles??{}).some(r=>r.relation==='spouse'))spawn({kind:'spouse',age:30});
 if(Object.values(e.actorRoles??{}).some(r=>r.relation==='sibling'))spawn({kind:'sibling',age:Math.max(18,age)});
 if(Object.values(e.actorRoles??{}).some(r=>r.relation==='rival')){
  s.pendingEvent={eventId:e.id,bindings:{other:'merek'}};
  applyEffects(s,{bond:{role:'other',flag:'rival'}});s.pendingEvent=null;
 }
 if(Object.values(e.actorRoles??{}).some(r=>r.familyRelation)){
  const other=Object.values(s.world.characters).find(c=>c.alive&&c.age>=18&&c.birthFamilyId!==p.birthFamilyId&&s.world.families[c.birthFamilyId??''])!;
  s.world.families[p.birthFamilyId!].enemyFamilyIds.push(other.birthFamilyId!);
 }
 if(e.requires?.careerFamilies)s.occupation.careerId=CAREERS.find(c=>c.family===e.requires!.careerFamilies![0])!.id;
 if(e.requires?.roles?.includes('commoner'))s.occupation.careerId='tenant_farmer';
 if(e.requires?.roles?.includes('outlaw')){s.occupation.careerId='poacher_job';s.paths.outlaw=30;s.tags.push('outlaw');}
 if(e.requires?.rankAtLeast)s.rankIdx=p.rankIdx=e.requires.rankAtLeast;
 for(const [key,value]of Object.entries(e.requires?.worldAtLeast??{}))s.world.conditions[key as keyof typeof s.world.conditions]=value;
 for(const [key,value]of Object.entries(e.requires?.worldAtMost??{}))s.world.conditions[key as keyof typeof s.world.conditions]=value;
 for(const conditionId of e.requires?.hasHealthCondition??[])applyEffects(s,{healthCondition:{conditionId,severity:25}});
 if(e.requires?.hasKnownSecret)s.world.characters.merek.secrets![0].knownByIds.push(p.id);
 if(e.requires?.suspicionAtLeast)p.legalState!.suspicion=e.requires.suspicionAtLeast;
 if(e.id.includes('shipment_loan')||e.id.includes('foreign_advance'))applyEffects(s,{debt:{principal:30,interestRate:0.1}});
 if(e.id==='single_story_blood_between_siblings'){const parent=p.parentIds?.[0];if(parent)s.world.characters[parent].alive=false;}
 if(e.id==='single_story_role_monarch'||['circumstance_coin_weight','circumstance_private_execution'].includes(e.id)){addRoyalClaim(s,p.id,s.world.court!.rulerId,'recognition',90);recogniseRuler(s,p.id,'A documented fixture coronation');}
 const origin=e.id==='young_peasant_seed'?'peasant':e.id==='young_merchant_sample'?'merchant':e.id==='young_military_ration'?'military':e.id==='young_noble_precedence'?'noble':undefined;
 if(origin)p.background!.origin=origin;
 syncPlayerToWorld(s);return s;
}
