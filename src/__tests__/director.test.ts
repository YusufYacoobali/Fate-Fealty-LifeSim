import {EVENTS_BY_ID,ALL_EVENTS} from '@/content';
import {createLife} from '@/engine/gameState';
import {ageUp} from '@/engine/lifeDirector';
import {applyChoice} from '@/engine/storyGraph';
import {isChoiceEnabled,isEventEligible,isEventPlayable} from '@/engine/eventPicker';
import {resolveRpgEncounter} from './rpgSoakHelpers';
import {RHYTHM} from '@/engine/director/rhythm';
jest.setTimeout(600000);

describe('the director offers complete yearly encounters',()=>{
 const runs=Array.from({length:40},(_,index)=>{
  let s=createLife({worldSeed:18000+index}),quiet=0,quietMax=0,popups=0,years=0;const ids=new Set<string>(),converted=new Set<string>();
  while(!s.dead&&s.age<130){
   resolveRpgEncounter(s);s=ageUp(s);years++;
   let current=0;
   while(s.pendingEvent&&!s.dead&&current++<3){
    const e=EVENTS_BY_ID[s.pendingEvent.eventId];
    expect(e.legacyNarrative).not.toBe(true);expect(e.chain).toBeUndefined();expect(e.callback).toBeUndefined();
    const year=s.world.currentYear;const choice=e.choices.find(c=>isChoiceEnabled(s,c));if(!choice)throw Error('No response in '+e.id);
    applyChoice(s,e,choice);expect(s.world.currentYear).toBe(year);ids.add(e.id);if(e.convertedFrom)converted.add(e.id);popups++;
   }
   expect(s.pendingEvent).toBeNull();expect(current).toBeLessThanOrEqual(2);
   expect(s.activeArcs).toEqual([]);expect(s.world.threads??[]).toEqual([]);expect(s.world.activeStories.some(story=>['active','paused'].includes(story.status))).toBe(false);
   quiet=current?0:quiet+1;quietMax=Math.max(quietMax,quiet);
  }
  return {years,popups,quietMax,ids,converted};
 });
 it('has a meaningful encounter in most years',()=>{expect(runs.reduce((n,r)=>n+r.popups,0)/runs.reduce((n,r)=>n+r.years,0)).toBeGreaterThan(0.8);});
 it('retains the safeguard against long silent runs',()=>{for(const r of runs)expect(r.quietMax).toBeLessThanOrEqual(RHYTHM.MAX_QUIET_RUN+1);});
 it('actually encounters converted writing across separate lives',()=>{expect(new Set(runs.flatMap(r=>[...r.converted])).size).toBeGreaterThan(30);expect(new Set(runs.flatMap(r=>[...r.ids])).size).toBeGreaterThan(150);});
 it('never offers a retired opening, continuation or callback',()=>{
  const state=createLife();state.age=30;const retired=ALL_EVENTS.filter(e=>e.legacyNarrative);expect(retired.length).toBeGreaterThan(300);
  for(const e of retired){expect(isEventEligible(state,e)).toBe(false);expect(isEventPlayable(state,e)).toBe(false);}
 });
});
