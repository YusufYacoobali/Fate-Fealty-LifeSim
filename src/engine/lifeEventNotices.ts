import type {GameState,LifeEventNotice,LifeEventCategory,LifeEventPerson} from '@/types/game';
import {writeLifeEventNotice} from '@/content/lifeEventNotices';
const priorities:Record<LifeEventCategory,number>={child_death:100,spouse_death:100,parent_death:90,guardian_death:90,divorce:85,affair_exposed:85,heartbreak:80,elopement:80};
const titles:Record<LifeEventCategory,string>={child_death:'YOUR CHILD HAS DIED',spouse_death:'YOUR SPOUSE HAS DIED',parent_death:'A PARENT HAS DIED',guardian_death:'YOUR GUARDIAN HAS DIED',divorce:'YOUR MARRIAGE HAS ENDED',affair_exposed:'YOUR AFFAIR IS EXPOSED',heartbreak:'YOUR ROMANCE HAS ENDED',elopement:'A MOST PUBLIC ELOPEMENT'};
export function normalizeLifeEventNotices(s:GameState):void {
 const old=s.lifeEvents;
 if(!old||old.ownerId!==s.playerCharacterId){s.lifeEvents={ownerId:s.playerCharacterId,notices:[],seenIds:[]};return;}
 const ids=new Set<string>();
 old.notices=(Array.isArray(old.notices)?old.notices:[]).filter(n=>{
  if(!n||typeof n.id!=='string'||n.ownerId!==s.playerCharacterId||!Object.prototype.hasOwnProperty.call(priorities,n.category)||!Array.isArray(n.people)||!n.people.length||n.people.some(p=>!p||typeof p.id!=='string'||typeof p.name!=='string'||!Number.isFinite(p.age))||typeof n.text!=='string'||typeof n.title!=='string'||!Number.isFinite(n.year)||ids.has(n.id))return false;
  ids.add(n.id);n.acknowledged=Boolean(n.acknowledged);n.priority=priorities[n.category];return true;
 });
 const acknowledged=old.notices.filter(n=>n.acknowledged).slice(-24);
 old.notices=old.notices.filter(n=>!n.acknowledged||acknowledged.includes(n));
 old.seenIds=[...new Set([...(Array.isArray(old.seenIds)?old.seenIds.filter(id=>typeof id==='string'):[]),...ids])];
}
export function nextLifeEventNotice(s:GameState):LifeEventNotice|undefined {
 if(s.lifeEvents?.ownerId!==s.playerCharacterId)return;
 return s.lifeEvents.notices.filter(n=>!n.acknowledged).map((n,i)=>({n,i})).sort((a,b)=>b.n.priority-a.n.priority||a.n.year-b.n.year||a.i-b.i)[0]?.n;
}
export function isBereavementPending(s:GameState):boolean{return s.lifeEvents?.ownerId===s.playerCharacterId&&s.lifeEvents.notices.some(n=>!n.acknowledged&&n.category.endsWith('_death'))||false;}
export function snapshotPerson(s:GameState,id:string,relationship:string):LifeEventPerson {
 const p=s.world.characters[id];return {id,name:p.name,age:p.age,relationship};
}
export function noticeContext(s:GameState,id:string):LifeEventNotice['context'] {
 const p=s.world.characters[id],r=Object.values(s.world.relationships).find(r=>r.aId===s.playerCharacterId&&r.bId===id||r.bId===s.playerCharacterId&&r.aId===id);
 const mine=r?.aId===s.playerCharacterId?r?.aToB:r?.bToA,other=r?.aId===s.playerCharacterId?r?.bToA:r?.aToB;
 return {affection:Math.min(mine?.affinity??50,other?.affinity??50),trust:Math.min(mine?.trust??50,other?.trust??50),playerAge:s.age,personality:p?.personalityTraits?.slice()??[],rivalry:Boolean(r?.flags.some(f=>f==='rival'||f==='feud')),infidelity:Boolean(r?.sharedMemories.includes('betrayal_unresolved'))};
}
export function enqueueLifeEventNotice(s:GameState,input:{key:string;category:LifeEventCategory;people:LifeEventPerson[];cause?:string;context?:Partial<LifeEventNotice['context']>}):LifeEventNotice|undefined {
 if(s.dead||!s.world.characters[s.playerCharacterId]?.alive||!input.people.length)return;
 normalizeLifeEventNotices(s);const id=`life_${s.playerCharacterId}_${input.category}_${input.key}`;
 if(s.lifeEvents!.seenIds.includes(id))return;
 const n:LifeEventNotice={id,ownerId:s.playerCharacterId,category:input.category,characterIds:input.people.map(p=>p.id),people:input.people.map(p=>({...p})),cause:input.cause,year:s.world.currentYear,priority:priorities[input.category],acknowledged:false,title:titles[input.category],text:'',variantId:'',context:{...noticeContext(s,input.people[0].id),...input.context}};
 n.context.personality=[...n.context.personality];
 if(n.category==='child_death'&&n.people[0].relationship==='ward')n.title='YOUR WARD HAS DIED';
 writeLifeEventNotice(n,s.lifeEvents!.notices.filter(x=>x.category===n.category).slice(-3).map(x=>x.variantId));
 s.lifeEvents!.seenIds.push(id);s.lifeEvents!.notices.push(n);return n;
}
/** Called before destructive transitions. Raw reciprocal IDs also work just after a health death marks alive=false. */
export function enqueuePersonalDeath(s:GameState,id:string,cause?:string):void {
 const p=s.world.characters[s.playerCharacterId],person=s.world.characters[id];if(!p||!person||id===p.id)return;
 let relationship:string|undefined,category:LifeEventCategory|undefined;
 if(p.spouseId===id&&person.spouseId===p.id){relationship='spouse';category='spouse_death';}
 else if(person.parentIds?.includes(p.id)||p.childIds?.includes(id)||person.lineageStatus==='ward'&&person.guardianIds?.includes(p.id)){relationship=person.lineageStatus==='ward'?'ward':'child';category='child_death';}
 else if(p.parentIds?.includes(id)){relationship=person.gender==='woman'?'mother':person.gender==='man'?'father':'parent';category='parent_death';}
 else if(p.guardianIds?.includes(id)||p.background?.guardianIds?.includes(id)){relationship='guardian';category='guardian_death';}
 if(category&&relationship)enqueueLifeEventNotice(s,{key:`death_${id}_${person.deathYear??s.world.currentYear}`,category,people:[snapshotPerson(s,id,relationship)],cause:cause??person.deathCause});
}
export function acknowledgeLifeEvent(s:GameState,id:string):boolean {
 if(s.pendingEvent||s.duel||s.rpg.mission||s.rpg.forge||s.dead||s.lifeEvents?.ownerId!==s.playerCharacterId)return false;
 const n=s.lifeEvents.notices.find(n=>n.id===id&&!n.acknowledged);if(!n)return false;n.acknowledged=true;normalizeLifeEventNotices(s);return true;
}
