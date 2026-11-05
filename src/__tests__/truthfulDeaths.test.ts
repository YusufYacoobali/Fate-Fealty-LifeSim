import {makeState} from './helpers';
import {applyEffects,killPlayer} from '@/engine/consequenceEngine';
import {checkDeath,buildLifeChronicle} from '@/engine/deathEngine';
import {tickAilments} from '@/engine/lifecycleEngine';
import {tickStructuredHealth} from '@/engine/healthEngine';
import {concludeDuel} from '@/engine/duelEngine';
import {normalizeGameState} from '@/state/persistence';
import {syncPlayerToWorld} from '@/engine/gameState';
import {EVENTS_BY_ID} from '@/content';
import {runWithWorldRng} from '@/engine/random';
import * as random from '@/engine/random';
import {gameReducer} from '@/state/gameReducer';
import {spawnKin} from '@/engine/kinFactory';
afterEach(()=>jest.restoreAllMocks());
it('never converts an outlaw health collapse into an invented execution, disease or tavern debt',()=>{
 const s=makeState({age:30,paths:{outlaw:100,martial:0,court:0,church:0,labour:0},reputation:-90});s.stats.health=0;checkDeath(s);
 expect(s.deathContext?.category).toBe('unknown');expect(s.deathCause).toContain('no specific cause');expect(s.deathCause).not.toMatch(/hang|plague|debt|guard|king/i);
});
it('does not invent an annual outlaw hazard from low reputation and path alone',()=>{
 jest.spyOn(random,'chance').mockReturnValue(true);
 const s=makeState({age:30,reputation:-90});s.paths.outlaw=100;checkDeath(s);expect(s.dead).toBe(false);
});
it('records a real same-year pursuit only from an active violent charge; imprisonment is not execution',()=>{
 jest.spyOn(random,'chance').mockReturnValue(true);const s=makeState({age:30}),l=s.world.characters[s.playerCharacterId].legalState!;
 l.suspicion=80;l.charges.push({id:'armed_robbery_charge',offence:'armed robbery on the road',severity:68,evidence:76,victimIds:[],witnessIds:['edwin'],year:s.world.currentYear,resolved:false});
 l.status='imprisoned';checkDeath(s);expect(s.dead).toBe(false);s.world.currentYear++;l.status='outlawed';checkDeath(s);
 expect(s.deathContext).toMatchObject({category:'pursuit',sourceType:'legal',sourceId:'armed_robbery_charge',actorIds:['edwin']});expect(s.deathCause).toContain('wounds sustained while fleeing the guards');expect(s.feed.some(f=>f.tag==='GUARD PURSUIT')).toBe(true);
});
it('keeps the actual illness when its damage exhausts health and legacy ailments record their source',()=>{
 const s=makeState({age:25});s.stats.health=1;syncPlayerToWorld(s);s.world.characters[s.playerCharacterId].healthConditions=[{id:'fever_1',conditionId:'winter_fever',kind:'illness',severity:50,diagnosed:true,startedYear:s.world.currentYear,nextReviewYear:s.world.currentYear}];
 runWithWorldRng(s.world,()=>tickStructuredHealth(s));checkDeath(s);expect(s.deathContext).toMatchObject({category:'illness',sourceId:'fever_1'});expect(s.deathCause).toMatch(/fever/i);
 const t=makeState({age:25});t.stats.health=1;t.tags.push('ill');tickAilments(t);checkDeath(t);expect(t.deathContext?.sourceId).toBe('ill');expect(t.deathCause).toContain('lingering illness');
});
it('records the actual combat opponent, not a guessed tourney or military occupation',()=>{
 const s=makeState({age:30});s.stats.health=1;s.duel={opponentId:'edwin',kind:'duel',playerVigour:0,opponentVigour:40,round:4,moveId:'cut',log:[],outcome:'lost'};concludeDuel(s);checkDeath(s);
 expect(s.deathContext).toMatchObject({category:'combat',sourceType:'encounter',actorIds:['edwin']});expect(s.deathCause).toContain(s.world.characters.edwin.name);
});
it('retains authored execution and first confirmed causes, even with Live Forever or maximum age on finalisation',()=>{
 const event=Object.values(EVENTS_BY_ID).find(e=>e.choices.some(c=>c.failure?.effects?.deathOrigin?.category==='execution'))!;expect(event).toBeDefined();
 const s=makeState({age:40});s.pendingEvent={eventId:event.id,bindings:{other:'edwin'}};applyEffects(s,event.choices.find(c=>c.failure?.effects?.deathOrigin?.category==='execution')!.failure!.effects);const cause=s.deathCause;
 s.settings.liveForever=true;s.age=110;killPlayer(s,'an unrelated later cause');checkDeath(s);expect(s.deathContext?.category).toBe('execution');expect(s.deathContext?.sourceId).toBe(event.id);expect(s.deathCause).toBe(cause);
});
it('finalises once through repeated checks, reload and legacy deaths without altering historical causes or RNG',()=>{
 let s=makeState({age:30});killPlayer(s,'An explicitly recorded old cause');checkDeath(s);syncPlayerToWorld(s);const rng=JSON.stringify(s.world.rngState);s=normalizeGameState(JSON.parse(JSON.stringify(s)));const before=JSON.stringify(s);checkDeath(s);checkDeath(s);expect(JSON.stringify(s)).toBe(before);expect(JSON.stringify(s.world.rngState)).toBe(rng);
 expect(s.memories.filter(m=>m.tag==='died')).toHaveLength(1);expect(s.feed.filter(f=>f.tag.includes('THE END'))).toHaveLength(1);expect(s.world.history.filter(h=>h.type==='death'&&h.participantIds.includes(s.playerCharacterId))).toHaveLength(1);
 delete s.deathContext;delete s.deathFinalized;checkDeath(s);expect(s.deathCause).toBe('An explicitly recorded old cause');expect(s.feed.filter(f=>f.tag.includes('THE END'))).toHaveLength(1);
});
it('summarises personal children and milestones, excluding unrelated births and unearned friendship',()=>{
 const s=makeState({age:30}),child=spawnKin(s,{kind:'child',age:3,name:'Alys'});s.world.history=[{id:'unrelated',year:s.world.currentYear,type:'birth',participantIds:['edwin'],familyIds:[],causes:[],summary:'An unrelated baby was born.',salience:5},{id:'own_child',year:s.world.currentYear,type:'birth',participantIds:[child.id],familyIds:[],causes:[],summary:'Alys joined your family.',salience:4}];
 for(const r of Object.values(s.world.relationships)){r.aToB.affinity=0;r.bToA.affinity=0;}
 expect(buildLifeChronicle(s).join(' ')).toContain('Alys');expect(buildLifeChronicle(s).join(' ')).not.toMatch(/unrelated baby|strongest threads/);
});
it('clears the outgoing death context when continuing as an heir',()=>{
 const s=makeState({age:40,lifetimeUnlocked:true}),child=spawnKin(s,{kind:'child',age:18,name:'Alys'});killPlayer(s,'Old recorded death');checkDeath(s);const next=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:child.id,lifetimeUnlocked:true});expect(next.dead).toBe(false);expect(next.deathContext).toBeUndefined();expect(next.deathFinalized).toBeUndefined();expect(next.world.characters[s.playerCharacterId].deathContext?.cause).toBe('Old recorded death');
});
