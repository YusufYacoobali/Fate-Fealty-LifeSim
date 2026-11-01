import type {LifeEventNotice,LifeEventCategory} from '@/types/game';
type Variant={id:string;category:LifeEventCategory;style?:string;text:(n:LifeEventNotice)=>string};
const who=(n:LifeEventNotice)=>n.people[0].name;
const childWord=(n:LifeEventNotice)=>n.people[0].relationship==='ward'?'ward':'child';
const age=(n:LifeEventNotice)=>n.people[0].age;
const others=(n:LifeEventNotice)=>n.people.slice(1).map(p=>p.name).join(' and ');
/** Informational prose: no effects, rolls, chapters or inferred accusations. */
export const LIFE_EVENT_VARIATIONS:Variant[]=[
 {id:'spouse_ill_wait',category:'spouse_death',style:'illness',text:n=>`${who(n)}, your spouse, has died at ${age(n)}. The waiting for better news has ended. You had not understood how much hope could fit inside an ordinary day.`},
 {id:'spouse_ill_care',category:'spouse_death',style:'illness',text:n=>`${who(n)} has died at ${age(n)}. People try to offer comfort about the illness, and mostly offer their presence instead. You are grateful for the part they can give.`},
 {id:'spouse_ill_voice',category:'spouse_death',style:'illness',text:n=>`Your spouse, ${who(n)}, has died at ${age(n)}. You no longer have to ask whether there has been any improvement. It is a question you would dearly like to have a reason to ask again.`},
 {id:'spouse_betrayal',category:'spouse_death',style:'unresolved',text:n=>`${who(n)} has died at ${age(n)}. The broken trust between you has lost its chance of another conversation. The grief is no simpler for having company.`},
 {id:'spouse_betrayal_end',category:'spouse_death',style:'unresolved',text:n=>`Your spouse, ${who(n)}, has died at ${age(n)}. There was hurt still waiting to be answered. Now you must live with questions that cannot argue back.`},
 {id:'spouse_betrayal_silence',category:'spouse_death',style:'unresolved',text:n=>`${who(n)}, your spouse, has died at ${age(n)}. Death has ended the marriage without settling what happened within it. For once, the neighbours have no useful explanation either.`},
 {id:'spouse_quiet',category:'spouse_death',style:'tender',text:n=>`${who(n)}, your spouse, has died at ${age(n)}. You keep thinking of one more ordinary thing to tell them. The thought reaches the door before you remember.`},
 {id:'spouse_supper',category:'spouse_death',style:'tender',text:n=>`${who(n)} has died at ${age(n)}. Even the old complaints seem precious now; you had not known they were part of the company. Everyone offers advice, when company is what you want.`},
 {id:'spouse_voice',category:'spouse_death',style:'tender',text:n=>`Your marriage to ${who(n)} ends with their death at ${age(n)}. You remember a voice more clearly than the important occasions. It is an unexpectedly small thing to miss so much.`},
 {id:'spouse_quarrel',category:'spouse_death',style:'bitter',text:n=>`${who(n)} has died at ${age(n)}. Your last argument will never acquire its next reply. Winning it suddenly seems a very poor use of the silence.`},
 {id:'spouse_truce',category:'spouse_death',style:'bitter',text:n=>`${who(n)}, your spouse, has died at ${age(n)}. The neighbours call your marriage a battle bravely fought. Several have the gall to congratulate you on surviving it.`},
 {id:'spouse_relief',category:'spouse_death',style:'bitter',text:n=>`${who(n)} has died at ${age(n)}. Relief and grief sit on the same bench, looking thoroughly ashamed to be seen together. The neighbours offer to explain which one you ought to be feeling.`},
 {id:'spouse_unfinished',category:'spouse_death',style:'plain',text:n=>`${who(n)}, your spouse, has died at ${age(n)}. People ask how you are managing. For now, managing the question is work enough.`},
 {id:'spouse_custom',category:'spouse_death',style:'plain',text:n=>`${who(n)} has died at ${age(n)}. Everyone knows the proper custom until asked who will do the small, necessary things. You begin with one of those.`},
 {id:'spouse_objects',category:'spouse_death',style:'plain',text:n=>`Your spouse, ${who(n)}, has died at ${age(n)}. Ordinary objects seem to have acquired unusually good memories. You let the visitors do most of the talking.`},
 {id:'child_infant_name',category:'child_death',style:'infant',text:n=>`${who(n)}, your ${childWord(n)}, has died at ${age(n)}. You had begun making room for a whole life. There is no small way to lose it.`},
 {id:'child_infant_future',category:'child_death',style:'infant',text:n=>`Your ${childWord(n)}, ${who(n)}, has died at ${age(n)}. So much of your love had been waiting in the years ahead. It has nowhere easy to go now.`},
 {id:'child_infant_words',category:'child_death',style:'infant',text:n=>`${who(n)} has died at ${age(n)}. People try to find words small enough for such a young life. None of them are large enough for the loss.`},
 {id:'child_no_answer',category:'child_death',style:'child',text:n=>`Your ${childWord(n)}, ${who(n)}, has died at ${age(n)}. You keep returning to questions that no answer could put right. Those who love you stay, even when there is nothing to say.`},
 {id:'child_name',category:'child_death',style:'child',text:n=>`${who(n)}, your ${childWord(n)}, has died at ${age(n)}. Their name is still part of the way you think about tomorrow. You cannot yet imagine thinking differently.`},
 {id:'child_time',category:'child_death',style:'child',text:n=>`Your ${childWord(n)}, ${who(n)}, has died at ${age(n)}. The day continues in ordinary ways that feel impossible. You take it one necessary moment at a time.`},
 {id:'child_adult',category:'child_death',style:'adult',text:n=>`${who(n)}, your ${childWord(n)}, has died at ${age(n)}. Being grown did not make them any less someone you cared for. You find that there is no age at which a parent has prepared for this.`},
 {id:'child_adult_news',category:'child_death',style:'adult',text:n=>`The news is that ${who(n)}, your ${childWord(n)}, has died at ${age(n)}. You hear the name before you can hear the rest. Love has outlasted the future you expected.`},
 {id:'child_adult_memory',category:'child_death',style:'adult',text:n=>`Your ${childWord(n)}, ${who(n)}, has died at ${age(n)}. Memories arrive from quite different years, all equally close. You let them come without trying to put them in order.`},
 ...(['parent_death','guardian_death'] as const).flatMap(category=>[
  {id:category+'_patient',category,style:'patient',text:(n:LifeEventNotice)=>`${who(n)}, your ${n.people[0].relationship}, has died at ${age(n)}. You remember their patience with a tenderness that surprises you. There is no gentle way to hurry this part.`},
  {id:category+'_patient_time',category,style:'patient',text:(n:LifeEventNotice)=>`${who(n)} has died at ${age(n)}. Their patient manner returns to you in the middle of everyone else’s urgent kindness. You let yourself take a little of that time.`},
  {id:category+'_patient_answer',category,style:'patient',text:(n:LifeEventNotice)=>`Your ${n.people[0].relationship}, ${who(n)}, has died at ${age(n)}. They had a gift for letting a difficult answer arrive slowly. You find yourself wishing for it now.`},
  {id:category+'_questions',category,text:(n:LifeEventNotice)=>`${who(n)}, your ${n.people[0].relationship}, has died at ${age(n)}. You think of an ordinary question you can no longer ask. Somehow it feels more important than all the solemn words.`},
  {id:category+'_advice',category,text:(n:LifeEventNotice)=>`${who(n)} has died at ${age(n)}. Advice you once hurried past returns to you at its own pace. For once, you cannot interrupt it.`},
  {id:category+'_kin',category,text:(n:LifeEventNotice)=>`Your ${n.people[0].relationship}, ${who(n)}, has died at ${age(n)}. The family disagrees over how to remember them, then falls quiet at the same small detail. For a moment, that is enough.`},
  {id:category+'_young',category,style:'young',text:(n:LifeEventNotice)=>`${who(n)}, your ${n.people[0].relationship}, has died at ${age(n)}. The grown people speak more softly now. Their kindness matters, even though it cannot bring this person back.`},
  {id:category+'_young_stay',category,style:'young',text:(n:LifeEventNotice)=>`Your ${n.people[0].relationship}, ${who(n)}, has died at ${age(n)}. Nothing about this feels like something a child ought to know. You do not have to find the right words today.`},
  {id:category+'_young_loss',category,style:'young',text:(n:LifeEventNotice)=>`${who(n)} has died at ${age(n)}. Someone who belonged to the shape of your days is gone. The people still here must help you through the next one.`},
 ]),
 {id:'heartbreak_space',category:'heartbreak',style:'npc',text:n=>`${who(n)} ends your ${n.context.romanceKind==='affair'?'affair':'courtship'}. The request is for distance; even a pilgrim might consider the proposed amount excessive. Your finest promises are suddenly of no use to anyone.`},
 {id:'heartbreak_bow',category:'heartbreak',style:'npc',text:n=>`${who(n)} says the romance is over. You had prepared an impressive reply to a rather different conversation. Its finest sentence is now entirely useless.`},
 {id:'heartbreak_lane',category:'heartbreak',style:'npc',text:n=>`Your ${n.context.romanceKind==='affair'?'lover':'romantic partner'}, ${who(n)}, ends the relationship. The familiar paths are still there. You shall have to learn how to walk them without preparing an accidental meeting.`},
 {id:'heartbreak_player',category:'heartbreak',style:'player',text:n=>`You end the romance with ${who(n)}. The explanation sounds less graceful aloud than it did in your head. It is at least an answer instead of another promise.`},
 {id:'heartbreak_player_quiet',category:'heartbreak',style:'player',text:n=>`You and ${who(n)} part. Neither of you finds a noble way to end the conversation, so you settle for ending it honestly. The silence that follows belongs to both of you.`},
 {id:'heartbreak_player_last',category:'heartbreak',style:'player',text:n=>`You tell ${who(n)} that the romance is over. There are several tempting excuses, and you manage to leave them unsaid. It is a small courtesy, late but real.`},
 {id:'divorce_neighbours',category:'divorce',style:'player',text:n=>`You end your marriage to ${who(n)}. The neighbours had only just agreed on an account of the last quarrel. Three households must now abandon their suppers and begin the important work again.`},
 {id:'divorce_supper',category:'divorce',style:'player',text:n=>`Your marriage to ${who(n)} is over. Anyone who claims to have expected this is invited to explain why they kept offering advice. There are fewer volunteers for the explanation.`},
 {id:'divorce_dignity',category:'divorce',style:'player',text:n=>`You and ${who(n)} end the marriage. Both of you attempt to preserve your dignity, which proves rather harder to divide than the company. Neither household owes the neighbours a better version of the ending.`},
 {id:'divorce_npc_words',category:'divorce',style:'npc',text:n=>`${who(n)} ends your marriage. The words are plain enough to leave no useful misunderstanding. Your finest objections have arrived after the decision.`},
 {id:'divorce_npc_audience',category:'divorce',style:'npc',text:n=>`${who(n)} tells you the marriage is over. The neighbours fall silent with such force that you can practically hear their ears growing. By supper, Swineford will have furnished both of you with speeches you never made.`},
 {id:'divorce_npc_trust',category:'divorce',style:'npc',text:n=>`Your spouse, ${who(n)}, confirms the separation. The trouble between you has finally found an ending, though neither side gets to call it a victory. The next conversation will have to begin somewhere else.`},
 {id:'elope_open',category:'elopement',text:n=>`You and ${who(n)} choose each other openly.${others(n)?` The people left behind include ${others(n)}.`:''} By supper, half the village will claim they arranged it and the other half will claim they tried to stop you.`},
 {id:'elope_courage',category:'elopement',text:n=>`You elope with ${who(n)}. Courage and poor judgement have chosen the same road today. Swineford will spend considerably longer deciding which one led.`},
 {id:'elope_vows',category:'elopement',text:n=>`You and ${who(n)} make a new marriage out of a thoroughly public scandal. There will be no shortage of witnesses to the beginning. You must supply the better part yourselves.`},
 {id:'affair_witnesses',category:'affair_exposed',text:n=>`Your affair with ${who(n)} is known to ${others(n)}. You attempt to explain, and make the impressive discovery that honesty would have required a much shorter speech. Nobody offers you a chair.`},
 {id:'affair_privacy',category:'affair_exposed',text:n=>`${others(n)} learn of your affair with ${who(n)}. What was once a private arrangement has acquired an extremely interested audience. None of them has come to offer applause.`},
 {id:'affair_excuse',category:'affair_exposed',text:n=>`The affair with ${who(n)} is exposed to ${others(n)}. You discover that an innocent expression is difficult to maintain while inventing one. The trust lost is quite real.`},
];

export function noticeStyle(n:LifeEventNotice):string|undefined {
 if(n.category==='spouse_death'){if(n.context.infidelity)return 'unresolved';if(n.context.affection>=65&&/fever|plague|ague|illness|sickness|pestilence|palsy|consumption/i.test(n.cause??''))return 'illness';return n.context.affection>=65&&n.context.trust>=55?'tender':(n.context.affection<30&&n.context.trust<30||n.context.rivalry&&n.context.affection<50)?'bitter':'plain';}
 if(n.category==='child_death')return age(n)<2?'infant':age(n)<18?'child':'adult';
 if(n.category==='parent_death'||n.category==='guardian_death')return n.context.playerAge<18?'young':n.context.personality.includes('patient')?'patient':undefined;
 if(n.category==='heartbreak'||n.category==='divorce')return n.context.initiator==='npc'?'npc':'player';
}
export function writeLifeEventNotice(n:LifeEventNotice,recentIds:string[]):void {
 const style=noticeStyle(n);const pool=LIFE_EVENT_VARIATIONS.filter(v=>v.category===n.category&&v.style===style);
 const fresh=pool.filter(v=>!recentIds.includes(v.id));const choices=fresh.length?fresh:pool;
 let hash=2166136261;for(const c of n.id+n.context.personality.join(':'))hash=Math.imul(hash^c.charCodeAt(0),16777619);
 const chosen=choices[(hash>>>0)%choices.length];n.variantId=chosen.id;n.text=chosen.text(n);
}
