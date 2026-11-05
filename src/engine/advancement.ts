import type {GameState} from '@/types/game';
import {royalCandidates} from './royalSuccessionEngine';

/** This is family/claim status, not an occupation, office or the Crown itself. */
export function royalProgression(s:GameState){
 const p=s.world.characters[s.playerCharacterId],court=s.world.court;
 const ruler=s.world.characters[court?.rulerId??''],heir=s.world.characters[court?.heirId??''];
 const claim=court?.claims.find(c=>c.characterId===p.id);
 const childOfRuler=!!ruler?.alive&&(p.parentIds??[]).includes(ruler.id)&&!['ward','adopted','disputed','illegitimate'].includes(p.lineageStatus??'marital');
 const royal=p.socialStatus?.estate==='royal';
 const label=court?.rulerId===p.id?'Monarch':royal&&childOfRuler?p.gender==='woman'?'Princess':'Prince':claim&&!claim.disinherited?'Royal Claimant':royal?'Royal Kin':null;
 const order=royalCandidates(s),index=order.findIndex(c=>c.id===p.id);
 return {label,ruler:ruler?.name??'No recognised ruler',heir:heir?.name??'Disputed',claim,position:index<0?null:index+1,
   competitors:order.filter(c=>c.id!==p.id).slice(0,3).map(c=>c.name),
   explanation:court?.rulerId===p.id?'You hold the Crown. Your designated heir and other documented claims govern the succession.':claim?.disinherited?'Your claim is disinherited and excluded from the succession.':claim&&!s.lifetimeUnlocked?'Your claim remains recorded. Pro access is required to succeed as the player.':index>=0?`You are ${index+1} in the eligible succession order. Designation comes first, then claim strength, age and character ID.`:'No eligible documented claim. Wealth, a barony and council office do not automatically confer the Crown.'};
}
