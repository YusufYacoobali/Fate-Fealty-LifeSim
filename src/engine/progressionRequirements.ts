import type {GameState} from '@/types/game';
import {careerById,careerRequirements} from '@/data/careers';
import {RANKS} from '@/data/ranks';

export type AdvancementDestination = 'life'|'activities'|'work'|'learning'|'martial_learning'|'court'|'claim'|'patron'|'advice'|'barony'|'nobility'|'honour'|'career_promotion'|'premium';
export interface ProgressionRequirement {id:string;label:string;current:string;met:boolean;destination:AdvancementDestination;}
export const requirement=(id:string,label:string,current:string,met:boolean,destination:AdvancementDestination='court'):ProgressionRequirement=>({id,label,current,met,destination});
export const missingRequirements=(rows:ProgressionRequirement[])=>rows.filter(r=>!r.met).map(r=>`${r.label} (${r.current})`).join('; ');
export const BARONY = {minAge:38,reserve:350,charm:84,wits:76,price:90} as const;
const player=(s:GameState)=>s.world.characters[s.playerCharacterId];
export const holdsBarony=(s:GameState)=>player(s).socialStatus?.estate==='baronial'||!!player(s).socialStatus?.titles.includes('Baron');
export function baronyRequirements(s:GameState):ProgressionRequirement[]{
 const p=player(s),noble=['noble','royal'].includes(p.socialStatus?.estate??'')&&!holdsBarony(s)&&s.world.court?.rulerId!==p.id;
 return [requirement('station','Noble station; no existing barony',noble?'Met':holdsBarony(s)?'Already Baron':s.world.court?.rulerId===p.id?'Already ruler':p.socialStatus?.estate??'commoner',noble,'nobility'),
 requirement('age',`Age ${BARONY.minAge}+`,`${s.age}`,s.age>=BARONY.minAge,'life'),
 requirement('gold',`Gold held ${BARONY.reserve}g`,`${s.gold}g`,s.gold>=BARONY.reserve,'work'),
 requirement('charm',`Charm ${BARONY.charm}+`,`${s.stats.charm}`,s.stats.charm>=BARONY.charm,'activities'),
 requirement('wits',`Wits ${BARONY.wits}+`,`${s.stats.wits}`,s.stats.wits>=BARONY.wits,'learning'),
 requirement('access','Pro access',s.lifetimeUnlocked?'Active':'Required',s.lifetimeUnlocked,'premium')];
}
export const baronyEligible=(s:GameState)=>!s.dead&&baronyRequirements(s).every(r=>r.met);
/** A new petition closes the gap between commoner careers and formal title grants. */
export function nobilityRequirements(s:GameState):ProgressionRequirement[]{
 const p=player(s),r=s.world.characters[s.world.court?.rulerId??''];
 return [requirement('station','No landed or royal title',p.socialStatus?.estate??'commoner',(p.socialStatus?.estate??'commoner')==='commoner'),
 requirement('age','Age 18+',`${s.age}`,s.age>=18,'life'),
 requirement('ruler','Recognised ruler outside regency',r?.alive?r.name:'No recognised living ruler',!!r?.alive&&r.age>=16&&!s.world.court?.regentId),
 requirement('influence','Political influence 15+',`${p.factionInfluence??0}`,(p.factionInfluence??0)>=15,'patron'),
 requirement('support','Crown support 5+',`${s.world.factions.crown.playerStanding}`,s.world.factions.crown.playerStanding>=5,'advice')];
}
export function militaryPromotionRequirements(s:GameState):{honour:'squire'|'knight';rows:ProgressionRequirement[]}|null{
 const p=player(s),held=p.socialStatus?.martialHonour??(s.rankIdx===1?'squire':s.rankIdx===2?'knight':'none');
 if(held==='knight')return null;
 const honour=held==='squire'?'knight':'squire',req=RANKS[honour==='squire'?1:2].promote!;
 return {honour,rows:[requirement('training','Martial training',p.education?.qualifications.includes('martial_training')?'Qualified':'Not qualified',!!p.education?.qualifications.includes('martial_training'),'martial_learning'),
 requirement('career','Martial occupation',careerById(s.occupation.careerId)?.title??'Unemployed',careerById(s.occupation.careerId)?.family==='martial','work'),
 requirement('age',`Age ${req.minAge}+`,`${s.age}`,s.age>=req.minAge,'life'),
 requirement('service',`Service standing ${req.progress}`,`${s.rankProgress}`,s.rankProgress>=req.progress,'work'),
 ...Object.entries(req.stats??{}).map(([stat,value])=>requirement(stat,`${stat==='wits'?'Wits':'Charm'} ${value}+`,`${s.stats[stat as 'wits'|'charm']}`,s.stats[stat as 'wits'|'charm']>=value,stat==='wits'?'learning':'activities'))]};
}
export function knighthoodServiceRequirements(s:GameState):ProgressionRequirement[]{
 const p=player(s),h=p.professionalHistory?.martial;
 return [requirement('notKnight','Not already knighted',p.socialStatus?.martialHonour??'none',p.socialStatus?.martialHonour!=='knight'),
 requirement('age','Age 18+',`${s.age}`,s.age>=18,'life'),
 requirement('career','Martial occupation',careerById(s.occupation.careerId)?.title??'Unemployed',careerById(s.occupation.careerId)?.family==='martial','work'),
 requirement('training','Martial training',p.education?.qualifications.includes('martial_training')?'Qualified':'Required',!!p.education?.qualifications.includes('martial_training'),'martial_learning'),
 requirement('arms','Arms level 3+',`${p.skills?.arms.level??1}`,(p.skills?.arms.level??1)>=3,'activities'),
 requirement('standing','Military professional standing 20+',`${h?.reputation??0}`,(h?.reputation??0)>=20,'work'),
 requirement('command','Recognised command service',h?.milestones.filter(m=>['service_honours','company_command'].includes(m)).join(', ')||'Not yet recorded',!!h?.milestones.some(m=>['service_honours','company_command'].includes(m)),'work')];
}

export function occupationPromotionRequirements(s:GameState):ProgressionRequirement[]{
 const current=careerById(s.occupation.careerId),next=careerById(current?.promotesTo??null);
 if(!next)return [];
 return [requirement('experience','Occupation experience 60+',`${s.occupation.experience}`,s.occupation.experience>=60,'work'),requirement('performance','Occupation performance 55+',`${s.occupation.performance}`,s.occupation.performance>=55,'work'),...careerRequirements(s,next)];
}
