import type {GameState,WorldCharacter} from '@/types/game';
import {activeSpouse} from './characterState';
export function playerMarriageLabel(s:GameState,person:WorldCharacter):string|undefined {
 if(activeSpouse(s)?.id===person.id)return;
 const player=s.world.characters[s.playerCharacterId];
 const record=player.marriages?.filter(m=>m.spouseId===person.id).at(-1)??person.marriages?.filter(m=>m.spouseId===player.id).at(-1);
 const former=record||Object.values(s.world.relationships).some(r=>(r.aId===player.id&&r.bId===person.id||r.bId===player.id&&r.aId===person.id)&&r.flags.includes('former_spouse'));
 if(!former)return;
 if(!person.alive)return record?.endReason==='death'&&record.deceasedId===person.id?'Late spouse':'Former spouse · Deceased';
 return 'Former spouse';
}
export function maritalStatusLabel(s:GameState,person:WorldCharacter):string {
 const toPlayer=playerMarriageLabel(s,person);
 if(toPlayer==='Late spouse'||toPlayer==='Former spouse · Deceased')return toPlayer;
 const current=activeSpouse(s,person.id);
 if(current)return `Married to ${current.id===s.playerCharacterId?'you':current.name}`;
 const last=person.marriages?.at(-1);
 if(last?.endReason==='death'&&last.deceasedId!==person.id)return person.alive?'Widowed':'Widowed · Deceased';
 if(!person.alive){
  const late=s.world.characters[last?.spouseId??''];
  return last?.endReason==='death'&&last.deceasedId===person.id&&late?`Spouse of ${late.name} at death`:'Deceased';
 }
 return toPlayer??'Unmarried';
}
