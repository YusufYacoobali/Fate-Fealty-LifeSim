import {educationTrack} from '@/data/education';
import {killPlayer} from '@/engine/consequenceEngine';
import {EVENTS_BY_ID,ALL_EVENTS} from '@/content';
import {createLife,syncPlayerToWorld} from '@/engine/gameState';
import {spawnKin,killKin} from '@/engine/kinFactory';
import {recoverEducationActors,performEducationAction} from '@/engine/educationEngine';
import {bindEventActors,isEventPlayable} from '@/engine/eventPicker';
import {bindDirectedEvent} from '@/engine/director';
import {describeActorForPlayer,involvedPeople} from '@/engine/eventActors';
import {renderBoundText} from '@/content/persistentWorldEvents';
import {renderAnnualText,ANNUAL_MESSAGES} from '@/content/annualMessages';
import {runWithWorldRng} from '@/engine/random';
import {relationshipWith,perspectives} from '@/engine/relationshipEngine';
import {professionalRecord} from '@/engine/careerSpecializationEngine';
import {normalizeGameState} from '@/state/persistence';
import {gameReducer} from '@/state/gameReducer';
import type {GameEvent,GameState} from '@/types/game';
function base(age=9){const s=createLife({worldSeed:81290});s.age=age;s.world.currentYear=s.bornYear+age;s.gold=100;for(const c of Object.values(s.world.characters))if(c.id!==s.playerCharacterId)c.age+=age;syncPlayerToWorld(s);return s;}
function enrolled(age=9){const s=base(age);runWithWorldRng(s.world,()=>performEducationAction(s,'enrol','parish'));return s;}
const cast=(s:GameState,id:string)=>runWithWorldRng(s.world,()=>bindEventActors(s,EVENTS_BY_ID[id]));
it('casts the actual current mentor and primary classmate, not an unrelated cleric or child',()=>{
 const s=enrolled(),e=s.world.characters[s.playerCharacterId].education!,other=spawnKin(s,{kind:'acquaintance',age:40});other.occupation.careerId='cleric';spawnKin(s,{kind:'acquaintance',age:9});
 expect(cast(s,'young_market_math')).toEqual({teacher:e.mentorId,peer:e.activeClassmateIds![0]});expect(cast(s,'education_parish_0')).toEqual({mentor:e.mentorId,classmate:e.activeClassmateIds![0]});
 expect(runWithWorldRng(s.world,()=>bindDirectedEvent(s,{event:EVENTS_BY_ID.education_parish_0,kind:'quiet',isLegal:false}))).toEqual({mentor:e.mentorId,classmate:e.activeClassmateIds![0]});
});
it('applies education outcomes to exactly the named mentor and classmate',()=>{
 let s=enrolled();const e=s.world.characters[s.playerCharacterId].education!,event=EVENTS_BY_ID.education_parish_0,bindings=cast(s,event.id)!;
 const unrelated=spawnKin(s,{kind:'acquaintance',age:9}),before=perspectives(s,relationshipWith(s,unrelated.id)).other.trust,peerTrust=perspectives(s,relationshipWith(s,bindings.classmate)).other.trust;
 s.pendingEvent={eventId:event.id,bindings};s=gameReducer(s,{type:'CHOOSE',choice:event.choices.find(c=>c.id==='repair')!});
 expect(s.world.characters[s.playerCharacterId].education!.progress).toBe(e.progress+15);expect(perspectives(s,relationshipWith(s,bindings.classmate)).other.trust).toBe(peerTrust+6);expect(perspectives(s,relationshipWith(s,unrelated.id)).other.trust).toBe(before);
});
it('keeps casting probes pure and never invents a substitute when an active mentor dies',()=>{
 const s=enrolled(),e=s.world.characters[s.playerCharacterId].education!,event=EVENTS_BY_ID.young_market_math;killKin(s,e.mentorId!);const before=JSON.stringify(s);expect(isEventPlayable(s,event)).toBe(false);expect(JSON.stringify(s)).toBe(before);
 runWithWorldRng(s.world,()=>recoverEducationActors(s));expect(s.world.characters[e.mentorId!].alive).toBe(true);expect(cast(s,event.id)?.teacher).toBe(e.mentorId);
});
it('rejects wrong-occupation mentors, wrong-track classmates and adult children in a school scene',()=>{
 const s=enrolled(),e=s.world.characters[s.playerCharacterId].education!,mentor=s.world.characters[e.mentorId!],peer=s.world.characters[e.activeClassmateIds![0]];mentor.occupation.careerId='trader';expect(cast(s,'young_market_math')).toBeUndefined();runWithWorldRng(s.world,()=>recoverEducationActors(s));peer.education!.track='guild';expect(cast(s,'education_parish_0')).toBeUndefined();peer.education!.track='parish';peer.age=25;expect(cast(s,'education_parish_0')).toBeUndefined();
});
it('offers informal childhood lessons only when unenrolled, with an age-matched child and a real cleric',()=>{
 const s=base();const cleric=spawnKin(s,{kind:'acquaintance',age:40});cleric.occupation.careerId='cleric';spawnKin(s,{kind:'acquaintance',age:9});const b=cast(s,'young_market_math')!;expect(s.world.characters[b.teacher].age).toBeGreaterThanOrEqual(20);expect(Math.abs(s.world.characters[b.peer].age-s.age)).toBeLessThanOrEqual(3);expect(describeActorForPlayer(s,b.peer)).not.toContain('classmate');
});
it('describes parents, guardians, classmates, friends and existing rivals without inventing friendship',()=>{
 const s=enrolled(),p=s.world.characters[s.playerCharacterId],e=p.education!,id=e.activeClassmateIds![0];expect(describeActorForPlayer(s,p.parentIds![0])).toMatch(/your (mother|father),/);
 const guardian=spawnKin(s,{kind:'acquaintance',age:42});p.guardianIds!.push(guardian.id);expect(describeActorForPlayer(s,guardian.id)).toBe(`your guardian, ${guardian.name}`);
 const r=relationshipWith(s,id);r.flags=[];expect(describeActorForPlayer(s,id)).toBe(`your classmate, ${s.world.characters[id].name}`);r.flags.push('friend');expect(describeActorForPlayer(s,id)).toContain('classmate and friend');r.flags.push('rival');expect(describeActorForPlayer(s,id)).toContain('classmate and rival');
});
it('recognises returning former classmates and mentors, and keeps hostile classmates out of friendly descriptions',()=>{
 const s=enrolled(),e=s.world.characters[s.playerCharacterId].education!,id=e.activeClassmateIds![0],r=relationshipWith(s,id);r.flags=['friend'];r.aToB.affinity=0;expect(describeActorForPlayer(s,id)).toBe(`your classmate, ${s.world.characters[id].name}`);
 const mentor=e.mentorId!;e.formerMentorIds=[mentor];e.track=null;e.history.push({track:'parish',year:s.world.currentYear,outcome:'left'});expect(describeActorForPlayer(s,id)).toContain('former classmate');expect(describeActorForPlayer(s,mentor)).toContain('former mentor');
});
it('introduces a stranger through their actual work and uses professional records for colleagues and rivals',()=>{
 const s=base(25),p=s.world.characters[s.playerCharacterId],merchant=spawnKin(s,{kind:'acquaintance',age:30});merchant.occupation.careerId='trader';expect(describeActorForPlayer(s,merchant.id)).not.toMatch(/friend|trusted|rival/);expect(describeActorForPlayer(s,merchant.id)).toContain('trader');
 s.occupation.careerId='trader';const record=professionalRecord(p,'trade');record.contactIds=[merchant.id];record.rivalId='merek';
 const event:GameEvent={id:'reference_test',title:'Reference',text:'{{colleague}} and {{rival}}',category:'peasant',actorRoles:{colleague:{reference:'career_contact',alive:true,minAge:18,missingActor:'clear_event'},rival:{reference:'career_rival',alive:true,minAge:18,missingActor:'clear_event'}},choices:[]};
 expect(runWithWorldRng(s.world,()=>bindEventActors(s,event))).toEqual({colleague:merchant.id,rival:'merek'});expect(describeActorForPlayer(s,'merek')).toContain('professional rival');
});
it('renders accurate introductions once and a compact set of involved people without changing state',()=>{
 const s=enrolled(),p=s.world.characters[s.playerCharacterId],id=p.parentIds![0];s.pendingEvent={eventId:'example',bindings:{carer:id,mentor:p.education!.mentorId!,classmate:p.education!.activeClassmateIds![0]}};
 const before=JSON.stringify(s),name=s.world.characters[id].name,text=renderBoundText(s,'{{carer.intro}} puts down a cup. You ask {{carer}} for another.');expect(text).toContain(name);expect(text).not.toContain('{{');expect(text.match(/your (mother|father)/gi)).toHaveLength(1);expect(text).toMatch(/^Your (mother|father), .+, puts down a cup\./);
 expect(renderBoundText(s,'“Enough.” {{carer.intro}} puts down a cup.')).toMatch(/” Your (mother|father), .+, puts/);expect(renderBoundText(s,"You take {{carer.intro}}’s hand.")).not.toMatch(/mother,|father,/);expect(describeActorForPlayer(s,'goose')).toBe(s.world.characters.goose.name+', the goose');
 for(const origin of ['peasant','artisan','merchant','church','military','noble','royal'] as const){const newborn=createLife({worldSeed:843010,lifetimeUnlocked:true,birthOrigin:origin});expect(newborn.feed[0].text).toMatch(/your (mother|father),/i);expect(newborn.feed[0].text).not.toMatch(/King your father/);}
 expect(involvedPeople(s,'{{mentor}} asks {{classmate}} to read.',[])).toHaveLength(2);expect(involvedPeople(s,'{{carer.intro}} helps.',[])).toHaveLength(0);expect(JSON.stringify(s)).toBe(before);
});
it('repairs or clears a pending scene whose canonical actor is missing, and preserves saved education identity',()=>{
 const s=enrolled(),e=s.world.characters[s.playerCharacterId].education!,event=EVENTS_BY_ID.education_parish_0;s.pendingEvent={eventId:event.id,bindings:cast(s,event.id)};
 const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(loaded.world.characters[s.playerCharacterId].education!.mentorId).toBe(e.mentorId);expect(loaded.world.characters[s.playerCharacterId].education!.activeClassmateIds).toEqual(e.activeClassmateIds);
 delete s.world.characters[e.mentorId!];const core=JSON.stringify([s.world.rngState,s.gold,s.age,s.world.currentYear,e.progress]);const recovered=normalizeGameState(JSON.parse(JSON.stringify(s)));if(recovered.pendingEvent)expect(bindEventActors(recovered,event)).toBeDefined();else expect(recovered.pendingEvent).toBeNull();expect(JSON.stringify([recovered.world.rngState,recovered.gold,recovered.age,recovered.world.currentYear,recovered.world.characters[s.playerCharacterId].education!.progress])).toBe(core);expect(normalizeGameState(JSON.parse(JSON.stringify(recovered)))).toEqual(recovered);
});
it('uses the heir’s real mother in annual introductions rather than the outgoing player’s family',()=>{
 let s=base(35);const spouse=spawnKin(s,{kind:'spouse',age:35,name:'Alys'}),heir=spawnKin(s,{kind:'child',age:19,name:'Elin'});killPlayer(s,'Natural death');s=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:heir.id});
 const text=renderAnnualText(s,ANNUAL_MESSAGES.find(m=>m.id==='old_oath_found')!);expect(text).toMatch(/your mother, Alys/i);expect(text).not.toContain(s.world.characters.mother.name);expect(s.world.characters[s.playerCharacterId].parentIds).toContain(spouse.id);
});
it('renders every education route with its real cast and all three current-year responses',()=>{
 for(const event of ALL_EVENTS.filter(e=>e.id.startsWith('education_'))){const track=event.requires!.educationTracks![0],s=base(event.id.startsWith('education_adult_')?25:Math.max(8,educationTrack(track).minAge));s.gold=500;runWithWorldRng(s.world,()=>performEducationAction(s,'enrol',track));const bindings=cast(s,event.id)!;expect(bindings).toBeDefined();s.pendingEvent={eventId:event.id,bindings};
 for(const choice of event.choices){const text=renderBoundText(s,typeof event.text==='function'?event.text(s):event.text)+' '+renderBoundText(s,choice.label)+' '+renderBoundText(s,choice.outcome!.text);expect(text).not.toMatch(/\{\{|someone once known/);const after=gameReducer(s,{type:'CHOOSE',choice});expect(after.world.characters[s.playerCharacterId].education!.progress).toBe(s.world.characters[s.playerCharacterId].education!.progress+choice.outcome!.effects!.education!.progress!);}
 }
});
it('keeps every rewritten event self-contained without adding story schedules or chapters',()=>{
 for(const e of ALL_EVENTS.filter(e=>e.id.startsWith('young_')||e.id.startsWith('education_'))){expect(e.chain).toBeUndefined();expect(e.callback).toBeUndefined();for(const c of e.choices)for(const o of [c.outcome,c.success,c.failure])expect(o?.next).toBeUndefined();}
});
it('renders the bed and relic scenes with a clear invitation, truthful relationships and every concrete response',()=>{
 const bed=EVENTS_BY_ID.comic_lofty_bed,s=base(25),other=s.world.characters.edwin;s.pendingEvent={eventId:bed.id,bindings:{other:other.id}};
 expect(renderBoundText(s,bed.text as string)).toContain('invites you in');expect(renderBoundText(s,bed.text as string)).toContain(other.name);expect(bed.title).toBe('A BED FIT FOR A GIANT');
 expect(bed.choices.map(c=>c.id)).toEqual(['stairs','admire','lower']);expect(bed.choices[0].outcome!.effects).toMatchObject({skillXp:{craftsmanship:4},bond:{role:'other',trust:7}});
 for(const choice of bed.choices){const text=renderBoundText(s,choice.label)+' '+renderBoundText(s,choice.outcome!.text);expect(text).not.toMatch(/\{\{|nobody in particular|carpenter lowers/);}
 const t=enrolled(),p=t.world.characters[t.playerCharacterId],e=p.education!,peer=t.world.characters[e.activeClassmateIds![0]],lesson=EVENTS_BY_ID.education_parish_0;
 peer.gender='woman';peer.parentIds=[...p.parentIds!];t.pendingEvent={eventId:lesson.id,bindings:{mentor:e.mentorId!,classmate:peer.id}};
 expect(describeActorForPlayer(t,peer.id)).toContain('sister and fellow student');expect(renderBoundText(t,lesson.text as string)).toContain('list of holy relics');expect(lesson.title).toBe('ONE ELBOW TOO MANY');
 for(const choice of lesson.choices){const text=renderBoundText(t,choice.label)+' '+renderBoundText(t,choice.outcome!.text);expect(text).not.toMatch(/\{\{|splendid extra elbow/);expect(text).toMatch(/list|entry|copy|correction/);}
 peer.education!.track='guild';expect(describeActorForPlayer(t,peer.id)).not.toContain('fellow student');
});
