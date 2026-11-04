import type {EventActorRole,GameState,WorldCharacter} from '@/types/game';
import {careerById} from '@/data/careers';
import {educationTrack} from '@/data/education';
import {kinshipTo} from './kinship';
const relationship=(s:GameState,id:string)=>Object.values(s.world.relationships).find(r=>r.aId===s.playerCharacterId&&r.bId===id||r.bId===s.playerCharacterId&&r.aId===id);
/** Pure reference resolution. Casting/eligibility must never create a teacher or consume RNG. */
export function matchesActorReference(s:GameState,c:WorldCharacter,role:EventActorRole):boolean{
 const p=s.world.characters[s.playerCharacterId],e=p.education;
 if(role.reference==='education_mentor'){
  if(e?.track)return c.id===e.mentorId&&c.age>=20&&c.occupation.careerId===educationTrack(e.track).mentorCareer;
  return Boolean(role.allowInformal&&c.age>=20&&careerById(c.occupation.careerId)?.family==='church');
 }
 if(role.reference==='classmate'){
  if(e?.track){const id=e.activeClassmateIds?.[0]??e.classmateIds[0];return c.id===id&&c.education?.track===e.track&&(s.age>=18?c.age>=18:c.age<18&&Math.abs(c.age-s.age)<=3);}
  return Boolean(role.allowInformal&&s.age<18&&c.age<18&&Math.abs(c.age-s.age)<=3);
 }
 if(role.reference==='childhood_peer')return s.age<18&&c.age<18&&Math.abs(c.age-s.age)<=3;
 const record=p.professionalHistory?.[careerById(s.occupation.careerId)?.family??'agriculture'];
 if(role.reference==='career_contact')return Boolean(record?.contactIds.includes(c.id));
 if(role.reference==='career_rival')return record?.rivalId===c.id;
 if(role.reference==='patron')return s.occupation.patronId===c.id;
 return true;
}
/** Short introductions come from live canonical ties, never a fabricated personal history. */
export function describeActorForPlayer(s:GameState,id:string,context?:{role?:string}):string{
 const person=s.world.characters[id];if(!person)return 'an absent participant';
 if(id==='goose')return `${person.name}, the goose`;
 const p=s.world.characters[s.playerCharacterId],tie=kinshipTo(s,id),r=relationship(s,id),e=p.education;
 const friend=Boolean(r?.flags.includes('friend')&&Math.min(r.aToB.affinity,r.bToA.affinity)>=40&&Math.min(r.aToB.trust,r.bToA.trust)>=30);
 const family=['mother','father','daughter','son','sister','brother','grandmother','grandfather','granddaughter','grandson','aunt','uncle','niece','nephew','cousin','spouse','ward','guardian'];
 if(family.includes(tie))return `your ${tie}, ${person.name}`;
 if([...(p.guardianIds??[]),...(p.background?.guardianIds??[])].includes(id))return `your guardian, ${person.name}`;
 if(e?.track&&e.mentorId===id)return `your mentor, ${person.name}`;
 if(e?.track&&e.activeClassmateIds?.includes(id)&&person.education?.track===e.track){const rival=r?.flags.some(f=>f==='rival'||f==='feud');return `your ${rival?'classmate and rival':friend?'classmate and friend':'classmate'}, ${person.name}`;}
 if(e?.formerMentorIds?.includes(id)||!e?.track&&e?.mentorId===id&&e.history.length>0)return `your former mentor, ${person.name}`;
 if(e?.classmateIds.includes(id))return `your former classmate${r?.flags.some(f=>f==='rival'||f==='feud')?' and rival':''}, ${person.name}`;
 const office=Object.entries(s.world.court?.offices??{}).find(([,actor])=>actor===id)?.[0];
 if(office)return `${person.name}, the ${office==='religious_adviser'?'religious adviser':office}${r?.flags.some(f=>f==='rival'||f==='feud')?' and your rival':''}`;
 if(s.world.court?.rulerId===id)return `${person.name}, the ruler`;
 if(Object.values(p.professionalHistory??{}).some(record=>record.rivalId===id))return `your professional rival, ${person.name}`;
 if(r?.flags.some(f=>f==='rival'||f==='feud'))return `your rival, ${person.name}`;
 if(s.occupation.patronId===id)return `your patron, ${person.name}`;
 if(friend)return `your friend, ${person.name}`;
 if(r?.flags.includes('friend'))return `${person.name}, someone you know from Swineford`;
 if(Object.values(p.professionalHistory??{}).some(record=>record.contactIds.includes(id)))return `your work contact, ${person.name}`;
 if(person.age<18&&s.age<18)return `${person.name}, another child from Swineford`;
 const career=careerById(person.occupation.careerId);
 if(career){const noun=career.title.toLowerCase();return `${person.name}, ${/^[aeiou]/i.test(noun)?'an':'a'} ${noun}`;}
 return `${person.name}, a villager from ${person.householdId===p.householdId?'your':'another'} household`;
}
/** Fit the factual fragment into a sentence without breaking apposition or possessives. */
export function actorIntroductionInText(s:GameState,id:string,role:string,before:string,after:string):string{
 const person=s.world.characters[id];let description=describeActorForPlayer(s,id,{role});
 const nameFirst=Boolean(person&&description.startsWith(person.name+', '));
 const possessive=/^[’']s\b/.test(after);
 if(possessive&&person){
  if(description.endsWith(', '+person.name))description=description.slice(0,-person.name.length-2)+' '+person.name;
  else if(nameFirst){let detail=description.slice(person.name.length+2).replace(/^an? /,'the ').replace(/ and your rival$/,'');if(detail==='another child from Swineford')detail='the child';description=detail+' '+person.name;}
 }else if(description.includes(', ')&&after.length&&!/^\s*(?:[.,!?;:)\]”"’']|$)/.test(after))description+=',';
 const plainBefore=before.replace(/[“”‘’"'()[\]]/g,'');
 if((!plainBefore.trim()||/[.!?]\s*$/.test(plainBefore))&&(!nameFirst||possessive))description=description[0].toUpperCase()+description.slice(1);
 return description;
}

export function involvedPeople(s:GameState,source:string,labels:string[]):{id:string;description:string}[]{
 const seen=new Set<string>();return Object.entries(s.pendingEvent?.bindings??{}).flatMap(([role,id])=>{
  const c=s.world.characters[id];if(!c||seen.has(id)||source.includes(`{{${role}.intro}}`)||!(source.includes(`{{${role}`)||source.includes(c.name)||labels.some(label=>label.includes(`{{${role}`))))return [];
  seen.add(id);return [{id,description:describeActorForPlayer(s,id,{role})}];
 }).slice(0,2);
}
