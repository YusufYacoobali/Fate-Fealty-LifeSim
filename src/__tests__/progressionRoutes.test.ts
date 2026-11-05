import {makeState} from './helpers';
import {gameReducer} from '@/state/gameReducer';
import {createLife,syncPlayerToWorld} from '@/engine/gameState';
import {baronyEligible,baronyRequirements,holdsBarony,militaryPromotionRequirements,nobilityRequirements,occupationPromotionRequirements} from '@/engine/progressionRequirements';
import {grantPlayerTitle,nobilityProspects} from '@/engine/titleEngine';
import {royalProgression} from '@/engine/advancement';
import {eventById} from '@/engine/eventPicker';
import {courtAvailability} from '@/engine/courtEngine';
import {canPromote,promote} from '@/engine/pathProgression';
import {normalizeGameState} from '@/state/persistence';
import {applyEffects} from '@/engine/consequenceEngine';
import {careerActionAvailability} from '@/engine/careerEngine';
import {RANKS} from '@/data/ranks';

function ready(){const s=makeState({age:38,rankIdx:3,gold:350,lifetimeUnlocked:true,stats:{health:90,charm:84,wits:76,faith:50}});s.world.currentYear=s.bornYear+s.age;s.world.pacing.hazardsRolledYear=s.world.currentYear;syncPlayerToWorld(s);return s;}
const event=()=>eventById('baron_land_grant')!;
const buy=()=>event().choices[0];
const decline=()=>event().choices[1];
const request=(s:ReturnType<typeof ready>)=>gameReducer(s,{type:'COURT',action:'seek_barony'});
const choose=(s:ReturnType<typeof ready>)=>gameReducer(s,{type:'CHOOSE',choice:buy()});

it('uses the actual six barony requirements and retires obsolete hereditary ladder thresholds',()=>{
 const s=ready();expect(baronyRequirements(s).map(r=>r.met)).toEqual([true,true,true,true,true,true]);expect(baronyEligible(s)).toBe(true);
 s.age=37;expect(baronyRequirements(s).find(r=>r.id==='age')?.met).toBe(false);s.age=38;s.gold=349;expect(baronyEligible(s)).toBe(false);
 for(const index of [0,3,4,5])expect(RANKS[index].promote).toBeUndefined();
});
it('manually opens the existing opportunity and charges once only when the patent is accepted',()=>{
 const s=ready(),opened=request(s);expect(opened.pendingEvent?.eventId).toBe('baron_land_grant');expect(opened.gold).toBe(350);expect(opened.actionClock.used).toBe(s.actionClock.used+1);expect(opened.world.court!.actionsUsed).toBe(1);
 const duplicate=request(opened);expect(duplicate.actionClock.used).toBe(opened.actionClock.used);expect(duplicate.gold).toBe(350);
 const granted=choose(opened);expect(granted.gold).toBe(260);expect(granted.rankIdx).toBe(4);expect(holdsBarony(granted)).toBe(true);expect(granted.pendingEvent).toBeNull();
 const replay=choose(granted);expect(replay.gold).toBe(260);expect(replay.memories.filter(m=>m.tag==='barony_claimed')).toHaveLength(1);expect(replay.world.characters[replay.playerCharacterId].socialStatus!.titles.filter(t=>t==='Baron')).toHaveLength(1);
});
it('shares the same atomic grant for an annual opportunity and does not require military progress',()=>{
 const s=ready();s.rankProgress=0;s.pendingEvent={eventId:event().id,bindings:{}};
 const result=choose(s);expect(result.gold).toBe(260);expect(result.rankIdx).toBe(4);expect(result.actionClock.used).toBe(s.actionClock.used);
});
it('revalidates every qualification at confirmation without charging or rewarding an invalid choice',()=>{
 const changes=[(s:ReturnType<typeof ready>)=>{s.gold=349;},(s:ReturnType<typeof ready>)=>{s.stats.charm=83;},(s:ReturnType<typeof ready>)=>{s.stats.wits=75;},(s:ReturnType<typeof ready>)=>{s.age=37;},(s:ReturnType<typeof ready>)=>{s.lifetimeUnlocked=false;},(s:ReturnType<typeof ready>)=>{s.world.characters[s.playerCharacterId].socialStatus!.estate='commoner';}];
 for(const change of changes){const s=request(ready());change(s);const before=JSON.stringify(s);applyEffects(s,buy().outcome!.effects);expect(JSON.stringify(s)).toBe(before);const next=choose(s);expect(next.gold).toBe(s.gold);expect(next.rankIdx).toBe(s.rankIdx);expect(holdsBarony(next)).toBe(false);}
});
it('keeps declined and legacy-fired opportunities available in later years without same-year farming',()=>{
 let s=request(ready());s=gameReducer(s,{type:'CHOOSE',choice:decline()});expect(s.gold).toBe(350);expect(s.rankIdx).toBe(3);expect(courtAvailability(s,'seek_barony')).toContain('Already decided');
 s.world.currentYear++;s.age++;s.world.pacing.hazardsRolledYear=s.world.currentYear;s.firedOnce.push(event().id);syncPlayerToWorld(s);
 expect(courtAvailability(s,'seek_barony')).toBeNull();expect(request(s).pendingEvent?.eventId).toBe(event().id);
});
it('reloads both an open opportunity and a purchased barony without duplicate payment or rewards',()=>{
 const opened=normalizeGameState(JSON.parse(JSON.stringify(request(ready()))));const result=choose(opened);expect(result.gold).toBe(260);
 const loaded=normalizeGameState(JSON.parse(JSON.stringify(result)));expect(holdsBarony(loaded)).toBe(true);expect(courtAvailability(loaded,'seek_barony')).not.toBeNull();expect(choose(loaded).gold).toBe(260);
});
it('preserves royal parentage, claims and heir order when a royal character buys land',()=>{
 const s=createLife({worldSeed:950117,birthOrigin:'royal',lifetimeUnlocked:true});s.age=38;s.gold=350;s.stats.charm=84;s.stats.wits=76;s.world.currentYear=s.bornYear+38;s.world.pacing.hazardsRolledYear=s.world.currentYear;syncPlayerToWorld(s);
 const p=s.world.characters[s.playerCharacterId],before=JSON.stringify([p.parentIds,p.birthFamilyId,s.world.court!.claims,s.world.court!.heirId]);expect(royalProgression(s).label).toBe('Prince');
 const next=choose(request(s)),q=next.world.characters[next.playerCharacterId];expect(q.socialStatus!.estate).toBe('royal');expect(q.socialStatus!.titles).toContain('Baron');expect(JSON.stringify([q.parentIds,q.birthFamilyId,next.world.court!.claims,next.world.court!.heirId])).toBe(before);expect(next.world.court!.rulerId).not.toBe(next.playerCharacterId);expect(next.rankIdx).toBe(4);
});
it('distinguishes direct royal children, other claimants and disinherited relatives using canonical succession',()=>{
 const s=createLife({worldSeed:950118,birthOrigin:'royal',lifetimeUnlocked:true}),p=s.world.characters[s.playerCharacterId];expect(royalProgression(s).label).toBe('Prince');p.gender='woman';expect(royalProgression(s).label).toBe('Princess');
 p.parentIds=[];expect(royalProgression(s).label).toBe('Royal Claimant');s.world.court!.claims.find(c=>c.characterId===p.id)!.disinherited=true;expect(royalProgression(s).label).toBe('Royal Kin');expect(royalProgression(s).position).toBeNull();expect(royalProgression(s).explanation).toContain('disinherited');
});
it('opens a usable same-year noble petition for a merchant and keeps previews pure',()=>{
 const s=makeState({age:30,gold:350});s.occupation.careerId='trader';s.world.characters[s.playerCharacterId].factionInfluence=25;s.world.factions.crown.playerStanding=10;syncPlayerToWorld(s);
 const before=JSON.stringify(s);expect(nobilityRequirements(s).every(r=>r.met)).toBe(true);expect(nobilityProspects(s).odds).toBeGreaterThan(0);royalProgression(s);militaryPromotionRequirements(s);occupationPromotionRequirements(s);expect(JSON.stringify(s)).toBe(before);
 const next=gameReducer(s,{type:'COURT',action:'seek_nobility'});expect(next.pendingEvent?.eventId).toBe('court_nobility_petition');expect(next.actionClock.used).toBe(s.actionClock.used+1);expect(grantPlayerTitle(next,'noble')).toBe(true);expect(next.rankIdx).toBe(3);expect(next.occupation.careerId).toBe('trader');expect(next.world.court!.rulerId).not.toBe(next.playerCharacterId);
});
it('keeps military honours independent of land and displays the same job blockers the handler enforces',()=>{
 const s=ready();s.occupation.careerId='levy';s.world.characters[s.playerCharacterId].education!.qualifications.push('martial_training');s.rankProgress=100;expect(canPromote(s)).toBe(true);expect(promote(s)).toBe(true);expect(s.rankIdx).toBe(3);expect(s.world.characters[s.playerCharacterId].socialStatus!.estate).toBe('noble');expect(s.world.characters[s.playerCharacterId].socialStatus!.martialHonour).toBe('squire');
 s.occupation.careerId='trader';s.occupation.experience=20;expect(occupationPromotionRequirements(s).find(r=>r.id==='experience')?.met).toBe(false);expect(careerActionAvailability(s,'promote').reason).toContain('60');
});
