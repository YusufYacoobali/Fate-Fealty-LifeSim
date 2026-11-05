import type {GameState} from '@/types/game';
import {baronyEligible,nobilityRequirements} from './progressionRequirements';
import {legacyStatus} from './lifeDepthState';
import {rollBonusFromTraits} from './traitEngine';
import {adjustRankProgress} from './pathProgression';

/** Eligibility is permission to petition, not a promise that the ruler agrees. */
export function nobilityProspects(s:GameState):{baseOdds:number;odds:number;detail:string}{
 const p=s.world.characters[s.playerCharacterId];
 const baseOdds=Math.max(.1,Math.min(.85,.2+(s.reputation+(p.factionInfluence??0)+s.world.factions.crown.playerStanding)/300+Math.min(s.gold,350)/1400));
 return {baseOdds,odds:Math.max(0,Math.min(1,baseOdds+rollBonusFromTraits(s))),detail:`Reputation ${s.reputation}; political influence ${p.factionInfluence??0}; Crown support ${s.world.factions.crown.playerStanding}; gold held ${s.gold}g. These affect the ruler’s decision.`};
}
export function titleConfirmationEligible(s:GameState,title:'noble'|'baron'):boolean{
 return title==='baron'?baronyEligible(s):!s.dead&&nobilityRequirements(s).every(r=>r.met);
}
/** Save-compatible effect ID: new patents are recognition, never rank shortcuts. */
export function grantPlayerTitle(s:GameState,title:'noble'|'baron'):boolean {
 if(!titleConfirmationEligible(s,title))return false;
 const status=s.world.characters[s.playerCharacterId].socialStatus!,key=`${title}_recognition_${s.world.currentYear}`;
 if(status.grants.includes(key))return false;
 status.grants.push(key);adjustRankProgress(s,title==='baron'?25:20);return true;
}

/** The ruler's existing NPC patent uses the same estate/title invariants. */
export function grantNobilityTo(s:GameState,characterId:string):boolean{
 const p=s.world.characters[characterId];
 if(!p?.alive||p.age<18||p.id===s.playerCharacterId||(p.socialStatus?.estate??'commoner')!=='commoner'||p.rankIdx>=3)return false;
 const status=p.socialStatus??=legacyStatus(p.rankIdx);
 if(status.grants.includes(`royal_patent_${s.world.currentYear}`))return false;
 const next=Math.min(3,p.rankIdx+1);if(next===3){status.estate='noble';status.titles=[...new Set([...status.titles,'Noble'])];}
 status.grants=[...new Set([...status.grants,`royal_patent_${s.world.currentYear}`])];p.rankIdx=next;
 return true;
}
