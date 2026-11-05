import {makeState} from './helpers';
import {createLife,syncPlayerToWorld} from '@/engine/gameState';
import {gameReducer} from '@/state/gameReducer';
import {canPromote,promote,tickProgression} from '@/engine/pathProgression';
import {rankPromotionRequirements} from '@/engine/progressionRequirements';
import {eventById} from '@/engine/eventPicker';
import {grantPlayerTitle} from '@/engine/titleEngine';
import {normalizeGameState} from '@/state/persistence';
import {royalProgression} from '@/engine/advancement';
import {applyEffects} from '@/engine/consequenceEngine';
import {selectRankClimb} from '@/state/viewModel';
import {RANKS} from '@/data/ranks';
function ready(rankIdx=0){const s=makeState({age:45,rankIdx,rankProgress:100,gold:600,lifetimeUnlocked:true,stats:{health:90,charm:95,wits:95,faith:85}});s.world.currentYear=s.bornYear+s.age;s.world.pacing.hazardsRolledYear=s.world.currentYear;syncPlayerToWorld(s);return s;}
it('restores the career-independent sequential ladder from Commoner to Baron',()=>{
 const s=ready();s.occupation.careerId='tenant_farmer';s.world.characters[s.playerCharacterId].education!.qualifications=[];
 for(let i=1;i<=4;i++){s.rankProgress=100;expect(canPromote(s)).toBe(true);expect(promote(s)).toBe(true);expect(s.rankIdx).toBe(i);expect(s.world.characters[s.playerCharacterId].rankIdx).toBe(i);expect(s.rankProgress).toBe(0);expect(promote(s)).toBe(false);}
 expect(s.world.characters[s.playerCharacterId].socialStatus!.martialHonour).toBe('none');expect(s.world.characters[s.playerCharacterId].socialStatus!.titles).toEqual(expect.arrayContaining(['Noble','Baron']));expect(s.gold).toBe(600);
});
it('uses shared requirements and never lets the legacy force flag bypass a gate',()=>{
 const s=ready();s.age=0;expect(promote(s,true)).toBe(false);s.age=12;s.stats.wits=47;expect(rankPromotionRequirements(s).find(r=>r.id==='wits')?.met).toBe(false);expect(promote(s)).toBe(false);s.stats.wits=48;expect(promote(s,true)).toBe(true);
 for(const i of [1,2,3,4,5])expect(RANKS[i].promote?.progress).toBe(100);
});
it('retains completed standing through age, stat and Pro blockers without negative drift or overflow',()=>{
 const s=ready(3);s.lifetimeUnlocked=false;applyEffects(s,{rankProgress:-50});tickProgression(s);expect(s.rankProgress).toBe(100);expect(s.rankIdx).toBe(3);s.lifetimeUnlocked=true;s.age=29;expect(canPromote(s)).toBe(false);s.age=30;s.stats.charm=79;expect(canPromote(s)).toBe(false);s.stats.charm=80;expect(promote(s)).toBe(true);expect(s.rankIdx).toBe(4);
});
it('automatically promotes a merchant after settled ordinary play, once, without military qualifications',()=>{
 let s=ready(2);s.occupation.careerId='trader';s.rankProgress=99;s=gameReducer(s,{type:'DO_ACTIVITY',id:'study_trade'});expect(s.rankIdx).toBe(3);expect(s.rankProgress).toBe(0);expect(s.memories.filter(m=>m.tag==='promoted_noble')).toHaveLength(1);expect(s.occupation.careerId).toBe('trader');
 s=gameReducer(s,{type:'DO_ACTIVITY',id:'study_trade'});expect(s.rankIdx).toBe(3);expect(s.rankProgress).toBeLessThan(100);
});
it('applies diminished activity rewards before evaluating promotion and keeps the existing repetition cap',()=>{
 let s=ready();s.rankProgress=90;for(let i=0;i<8;i++)s=gameReducer(s,{type:'DO_ACTIVITY',id:'study_trade'});expect(s.rankIdx).toBeLessThanOrEqual(1);expect(s.actionClock.used).toBe(5);expect(s.rankProgress).toBeLessThanOrEqual(100);
});
it('turns noble petitions into capped standing rewards, without skipping levels or changing occupations',()=>{
 const s=ready();s.rankProgress=0;s.world.characters[s.playerCharacterId].factionInfluence=25;s.world.factions.crown.playerStanding=10;s.occupation.careerId='trader';expect(grantPlayerTitle(s,'noble')).toBe(true);expect(s.rankIdx).toBe(0);expect(s.rankProgress).toBe(20);expect(grantPlayerTitle(s,'noble')).toBe(false);expect(s.rankProgress).toBe(20);expect(s.occupation.careerId).toBe('trader');
});
it('keeps a saved barony scene as optional recognition without a purchase or rank grant',()=>{
 let s=ready(3);s.rankProgress=0;const gold=s.gold;const e=eventById('baron_land_grant')!;s.pendingEvent={eventId:e.id,bindings:{}};s=gameReducer(s,{type:'CHOOSE',choice:e.choices[0]});expect(s.gold).toBe(gold);expect(s.rankIdx).toBe(3);expect(s.rankProgress).toBe(25);expect(s.memories.some(m=>m.tag==='barony_recognised')).toBe(true);expect(gameReducer(s,{type:'CHOOSE',choice:e.choices[0]}).rankProgress).toBe(25);
});
it('preserves existing Noble/Baron saves and progress through repeated reload without promoting on load',()=>{
 for(const rankIdx of [3,4]){const s=ready(rankIdx);s.rankProgress=68;let n=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(n.rankIdx).toBe(rankIdx);expect(n.rankProgress).toBe(68);const rng=JSON.stringify(n.world.rngState);expect(normalizeGameState(JSON.parse(JSON.stringify(n)))).toEqual(n);expect(JSON.stringify(n.world.rngState)).toBe(rng);expect(selectRankClimb(n)?.progress).toBe(68);}
 const s=ready(3);s.rankProgress=240;expect(normalizeGameState(JSON.parse(JSON.stringify(s))).rankProgress).toBe(100);
});
it('does not overthrow a living ruler even with perfect Baron standing and a claim',()=>{
 const s=ready(4),ruler=s.world.court!.rulerId;s.world.court!.claims.push({characterId:s.playerCharacterId,throughId:ruler,basis:'recognition',strength:100,disinherited:false});s.world.court!.heirId=s.playerCharacterId;expect(canPromote(s)).toBe(false);expect(promote(s,true)).toBe(false);expect(s.world.court!.rulerId).toBe(ruler);expect(s.rankProgress).toBe(100);
});
it('retains exceptional royal birth, succession and ancestry when ordinary levels advance',()=>{
 const s=createLife({worldSeed:950117,birthOrigin:'royal',lifetimeUnlocked:true});expect(s.rankIdx).toBe(3);expect(royalProgression(s).label).toBe('Prince');s.age=40;s.gold=500;s.stats.charm=95;s.stats.wits=95;s.rankProgress=100;const p=s.world.characters[s.playerCharacterId],before=JSON.stringify([p.parentIds,s.world.court!.claims]);expect(promote(s)).toBe(true);expect(s.rankIdx).toBe(4);expect(p.socialStatus!.estate).toBe('royal');expect(JSON.stringify([p.parentIds,s.world.court!.claims])).toBe(before);expect(s.world.court!.rulerId).not.toBe(p.id);
});
it('keeps an already-earned Baron heir when Pro access expires, without granting a new free barony',()=>{
 const {spawnKin}=require('@/engine/kinFactory'),{killPlayer}=require('@/engine/consequenceEngine'),{legacyStatus}=require('@/engine/lifeDepthState');
 const s=ready(3),child=spawnKin(s,{kind:'child',age:25,name:'Alys'});child.rankIdx=4;child.socialStatus=legacyStatus(4);killPlayer(s,'A recorded death');const next=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:child.id,lifetimeUnlocked:false});expect(next.rankIdx).toBe(4);expect(next.world.characters[child.id].socialStatus!.titles).toContain('Baron');expect(canPromote(next)).toBe(false);
});
it('keeps military honours separate and makes royal NPC recognition sequential and replay-safe',()=>{
 const {grantNobilityTo}=require('@/engine/titleEngine'),{performCareerAction}=require('@/engine/careerEngine'),{legacyStatus}=require('@/engine/lifeDepthState');const s=ready();s.rankProgress=0;const p=s.world.characters[s.playerCharacterId];s.occupation.careerId='guard';p.education!.qualifications.push('martial_training');p.skills!.arms.level=3;Object.assign(require('@/engine/careerSpecializationEngine').professionalRecord(p,'martial'),{reputation:30,milestones:['company_command']});performCareerAction(s,'honour');expect(s.rankIdx).toBe(0);expect(p.socialStatus!.martialHonour).toBe('knight');
 const target=s.world.characters.edwin;target.age=30;target.rankIdx=0;target.socialStatus=legacyStatus(0);expect(grantNobilityTo(s,target.id)).toBe(true);expect(target.rankIdx).toBe(1);expect(grantNobilityTo(s,target.id)).toBe(false);expect(target.rankIdx).toBe(1);
});
