import type {GameState,WorldState} from '@/types/game';
import {PROFESSIONAL_STORIES} from '@/data/professionalStories';
import {STORY_TEMPLATE_BY_ID} from '@/content/persistentStories';

/** Archive scheduling metadata, never a victory, punishment, refund or invented ending. */
export function retireAuthoredWorld(world:WorldState):WorldState {
 const history=[...world.history];
 const note=(id:string,participants:string[],source:string)=>{
  if(history.some(h=>h.id===id))return;
  history.push({id,year:world.currentYear,type:'narrative_retired',participantIds:participants,familyIds:[],causes:[source],summary:'The earlier decisions remain on record. No further chapter or unchosen ending was assumed when the old narrative schedule was retired.',salience:1});
 };
 const activeStories=world.activeStories.map(story=>{
  if(!['active','paused'].includes(story.status))return story;
  note(`retired_${story.id}`,Object.values(story.bindings),story.templateId);
  return {...story,status:'retired' as const};
 });
 for(const thread of world.threads??[])note(`retired_thread_${thread.id}_${thread.openedYear}`,Object.values(thread.bindings??{}),thread.id);
 return {...world,history,activeStories,threads:[],scheduledConsequences:world.scheduledConsequences.filter(c=>!(c.resolution.type==='history'&&['delayed_story_consequence','story_legacy'].includes(c.resolution.historyType)))};
}

/** State-level queues are outside the world-version migration's signature. */
export function retireAuthoredState(state:GameState):void {
 const pending=state.pendingEvent;
 const savedStory=pending?.storyInstanceId?state.world.activeStories.find(s=>s.id===pending.storyInstanceId):undefined;
 if(pending&&savedStory)pending.bindings={...savedStory.bindings,...pending.bindings};
 const requiredRoles=pending?.eventId.startsWith('profession_')?['client','rival']
  :/^(quality_|echo_)/.test(pending?.eventId??'')?['other']
  :savedStory?Object.keys(STORY_TEMPLATE_BY_ID[savedStory.templateId]?.roles??savedStory.bindings)
  :Object.keys(pending?.bindings??{});
 const legacyActorsPresent=!!pending&&requiredRoles.length>0&&requiredRoles.every(role=>state.world.characters[pending.bindings?.[role]??'']?.alive)&&Object.values(pending.bindings??{}).every(id=>state.world.characters[id]?.alive);
 if(state.world.activeStories.some(s=>['active','paused'].includes(s.status)) || state.world.threads?.length || state.world.scheduledConsequences.some(c=>c.resolution.type==='history'&&['delayed_story_consequence','story_legacy'].includes(c.resolution.historyType)))state.world=retireAuthoredWorld(state.world);
 for(const arc of state.activeArcs){
  const id=`retired_arc_${arc.arc}_${arc.startedAge}`;
  if(!state.world.history.some(h=>h.id===id))state.world.history.push({id,year:state.world.currentYear,type:'narrative_retired',participantIds:[state.playerCharacterId],familyIds:[],causes:[arc.arc],summary:'A queued chapter was archived. Its earlier choices and consequences remain unchanged.',salience:1});
 }
 state.activeArcs=[];
 const pendingId=state.pendingEvent?.eventId;
 for(const p of Object.values(state.world.characters))for(const record of Object.values(p.professionalHistory??{}))for(const matter of record.matters){
  if(matter.resolved || !PROFESSIONAL_STORIES.some(s=>s.id===matter.id))continue;
  if(p.id===state.playerCharacterId&&[ `profession_${matter.id}`,`profession_${matter.id}_verdict`].includes(pendingId??'')&&legacyActorsPresent)continue;
  matter.resolved=true;matter.retired=true;
  const id=`retired_profession_${p.id}_${matter.id}_${matter.openedYear??0}`;
  if(!state.world.history.some(h=>h.id===id))state.world.history.push({id,year:state.world.currentYear,type:'narrative_retired',participantIds:[p.id,matter.actorId].filter(id=>!!state.world.characters[id]),familyIds:[p.birthFamilyId??''].filter(Boolean),causes:[matter.id],summary:'An unfinished professional chapter was archived. Earlier payments, work and relationships remain; no verdict or completion reward was assumed.',salience:1});
 }
 if(state.pendingEvent&&/^(story_|quality_|echo_|profession_)/.test(state.pendingEvent.eventId)&&!legacyActorsPresent){
  state.world.history.push({id:`retired_visible_${state.pendingEvent.eventId}_${state.world.currentYear}`,year:state.world.currentYear,type:'narrative_retired',participantIds:[state.playerCharacterId],familyIds:[],causes:[state.pendingEvent.eventId],summary:'The visible encounter was withdrawn because a required participant was no longer present. No reward or replacement actor was invented.',salience:1});
  state.pendingEvent=null;
 }
}
