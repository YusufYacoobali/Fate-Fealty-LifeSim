import type { CourtOffice, Effects, GameState, WorldCharacter } from '@/types/game';
import type { CourtAction } from './courtEngine';
import { POLITICAL_OFFICES } from '@/data/politicalOffices';
import { clamp, chance } from './random';
import { perspectives, readRelationship, applyRelationshipShift } from './relationshipState';
import { pushFeed } from './gameState';
import { appendCharacterMemory } from './worldJournal';

const bond = (s: GameState, c?: WorldCharacter) => c ? perspectives(s, readRelationship(s,c)).other.trust : 0;
export function courtCandidatesFor(s: GameState, action: CourtAction): WorldCharacter[] {
  const court = s.world.court;
  if (!court) return [];
  return Object.values(s.world.characters).filter(c => {
    if (!c.alive || c.id === 'goose' || c.id === s.playerCharacterId) return false;
    if (action === 'justice') return c.legalState?.status === 'imprisoned';
    if (action === 'name_heir' || action === 'disinherit') return c.id !== court.rulerId && court.claims.some(q => q.characterId === c.id && !q.disinherited);
    if (action === 'appoint') return c.age >= 18 && c.id !== court.rulerId && !Object.values(court.offices).includes(c.id);
    if (action === 'patron') return c.age >= 18 && (c.rankIdx >= 3 || Object.values(court.offices).includes(c.id));
    if (action === 'grant_title') return c.age >= 18 && c.rankIdx < 3;
    return c.age >= 18;
  }).sort((a,b) => a.name.localeCompare(b.name));
}
export function beginOfficePetition(s: GameState, office: CourtOffice): void {
  const c = s.world.court!, p = s.world.characters[s.playerCharacterId];
  const rival = Object.values(s.world.characters).filter(x => x.alive && x.age >= 18 && x.id !== p.id && x.id !== c.rulerId && x.id !== 'goose' && !Object.values(c.offices).includes(x.id) && (x.education?.qualifications.includes('court_education') || x.rankIdx >= 3 || x.ambition === 'gain_status')).sort((a,b) => b.stats.wits - a.stats.wits || a.id.localeCompare(b.id))[0];
  c.petition = { applicantId: p.id, rulerId: c.rulerId, office, incumbentId: c.offices[office], rivalId: rival?.id, year: s.world.currentYear, resolved: false };
  s.pendingEvent = { eventId: 'court_office_contest', bindings: { ruler: c.rulerId, incumbent: c.offices[office] ?? c.rulerId, rival: rival?.id ?? c.rulerId } };
}
export function petitionProspects(s: GameState, route: 'merit' | 'patron'): { odds: number; detail: string } {
  const c = s.world.court!, p = s.world.characters[s.playerCharacterId], q = c.petition!;
  const incumbent = s.world.characters[c.offices[q.office] ?? ''], ruler = s.world.characters[c.rulerId], rival = s.world.characters[q.rivalId ?? ''];
  const supporters = Object.values(c.offices).map(id => s.world.characters[id!]).filter(x => x?.alive && bond(s,x) >= 55).length;
  const professional = p.professionalHistory?.court?.reputation ?? 0;
  const merit = (p.education?.qualifications.includes('court_education') ? 12 : 0) + professional / 3 + stateSkill(s) * 2;
  const patron = s.world.characters[s.occupation.patronId ?? ''];
  const patronHelp = route === 'patron' && patron?.alive ? (bond(s,patron) - 35) / 2 : 0;
  const odds = clamp(20 + merit + (p.factionInfluence ?? 0) / 3 + (bond(s,ruler) - 50) / 3 + supporters * 7 + patronHelp + (incumbent?.alive ? -incumbent.stats.wits / 3 : 25) - (rival?.stats.wits ?? 0) / 12, 8, 92) / 100;
  return { odds, detail: `${incumbent?.alive ? `${incumbent.name} defends the seal with Wits ${incumbent.stats.wits}` : 'The seal is vacant'}. ${supporters} council supporters; professional standing ${professional}; ruler trust ${Math.round(bond(s,ruler))}${rival ? `; ${rival.name} also seeks appointment` : ''}.` };
}
function stateSkill(s: GameState) { return s.world.characters[s.playerCharacterId].skills?.scholarship.level ?? 1; }
function record(s: GameState, kind: string, detail: string, targetId?: string) {
  s.world.court!.records.push({ year: s.world.currentYear, kind, actorId: s.playerCharacterId, targetId, detail });
  pushFeed(s,'COURT','#7a4f9a',detail,'plain');
}
export function resolveOfficePetition(s: GameState, route: NonNullable<Effects['courtPetition']>): void {
  const c = s.world.court, q = c?.petition, p = s.world.characters[s.playerCharacterId];
  if (!c || !q || q.resolved || q.applicantId !== p.id) return;
  if (route === 'patron' && !petitionPatronEligible(s)) return;
  q.resolved = true;
  if (q.rulerId !== c.rulerId || q.incumbentId !== c.offices[q.office] || Object.values(c.offices).includes(p.id) || c.rulerId === p.id) { q.outcome = 'rejected'; record(s,'petition_lapsed','The court changed during your petition. The new ruler must consider a fresh request.'); return; }
  if (route === 'withdraw') { q.outcome = 'withdrawn'; record(s,'petition_withdrawn','You withdraw the request without displacing the present holder.'); return; }
  if (route === 'conditional') { q.outcome = 'conditional'; q.requiredStanding = Math.max(25,(p.professionalHistory?.court?.reputation ?? 0) + 8); record(s,'petition_conditional',`The ruler invites a new petition after you achieve court standing ${q.requiredStanding}. The office stays with its current holder until a later decision.`); return; }
  const prospects = petitionProspects(s,route);
  if (chance(prospects.odds)) {
    c.offices[q.office] = p.id; p.factionInfluence = clamp((p.factionInfluence ?? 0) + 8); q.outcome = 'appointed';
    if (q.incumbentId) { applyRelationshipShift(s,q.incumbentId,{}, { affinity: -18, trust: -8 }); addCourtOpposition(s,q.incumbentId,12); }
    if (q.rivalId) { applyRelationshipShift(s,q.rivalId,{}, { affinity: -10 }); addCourtOpposition(s,q.rivalId,6); }
    record(s,'petition_appointed',`The council awards you the ${q.office.replaceAll('_',' ')}’s seal. ${prospects.detail}`,p.id);
  } else {
    q.outcome = q.incumbentId ? 'retained' : 'rejected';
    record(s,'petition_rejected',`${q.incumbentId ? `${s.world.characters[q.incumbentId]?.name} retains the seal` : 'The ruler declines to fill the vacancy from your petition'}. ${prospects.detail}`,q.incumbentId);
    if (q.rivalId) s.world.characters[q.rivalId].factionInfluence = clamp((s.world.characters[q.rivalId].factionInfluence ?? 0) + 3);
  }
}
export function councilAdvice(s: GameState, action: CourtAction): { id: string; support: boolean; text: string }[] {
  const w = s.world.conditions, c = s.world.court;
  if (!c) return [];
  return POLITICAL_OFFICES.flatMap(o => {
    const npc = s.world.characters[c.offices[o.id] ?? '']; if (!npc?.alive || npc.id === s.playerCharacterId) return [];
    let support = true, text = 'Preserve the Crown’s authority and the household accounts.';
    if (action === 'tax_raise') { support = w.foodSecurity >= 45 && (o.id === 'treasurer' || npc.ambition === 'gain_status'); text = support ? 'The treasury needs revenue; publish a clear assessment.' : `Food security is ${w.foodSecurity}; another levy risks resistance.`; }
    else if (action === 'tax_relief') { support = o.id !== 'treasurer' || c.treasury >= 65; text = support ? 'Seed relief keeps occupied farms paying in later years.' : 'Relief leaves too little in the treasury for existing obligations.'; }
    else if (action === 'mobilise') { support = w.warThreat >= 40 || npc.ambition === 'win_glory'; text = support ? `War threat ${w.warThreat} calls for a prepared host.` : 'The harvest and treasury will suffer if the host marches without need.'; }
    else if (action === 'peace') { support = npc.ambition !== 'win_glory' && !(npc.personalityTraits?.includes('cruel')); text = support ? 'A truce needs credible guarantees and a competent envoy.' : 'Peace deprives the company of glory and unsettled claims.'; }
    else if (action === 'religion') { support = o.id === 'religious_adviser' || !npc.personalityTraits?.includes('cunning'); text = support ? `Parish relief addresses religious tension ${w.religiousTension}.` : 'This endowment strengthens a rival patronage network.'; }
    else if (action === 'grant_title' || action === 'name_heir' || action === 'disinherit') { support = !npc.personalityTraits?.some(t => ['envious','ambitious'].includes(t)); text = support ? 'Publish the lawful grounds before changing household precedence.' : 'My household’s claims deserve consideration before another receives precedence.'; }
    else if (action === 'justice') { support = !npc.personalityTraits?.some(t => ['cruel','cautious'].includes(t)); text = support ? 'A pardon should explain restitution to the injured households.' : 'The victims’ families will remember who released their offender.'; }
    return [{ id: npc.id, support, text: `${npc.name}: ${text}` }];
  });
}
export function addCourtOpposition(s: GameState, leaderId: string, amount: number): void {
  const c = s.world.court, leader = s.world.characters[leaderId]; if (!c || !leader?.alive || leaderId === c.rulerId) return;
  c.coalitions ??= [];
  const existing = c.coalitions.find(x => x.leaderId === leaderId);
  if (existing) { existing.strength = clamp(existing.strength + amount); return; }
  c.coalitions.push({ leaderId, memberIds: [leaderId], strength: amount, lastMoveYear: s.world.currentYear });
  c.coalitions = c.coalitions.slice(-12);
}
export function reactToDecree(s: GameState, action: CourtAction, counsel: 'consult' | 'override', targetId?: string): string {
  const c = s.world.court!, w = s.world.conditions, p = s.world.characters[s.playerCharacterId];
  let result = '';
  for (const advice of councilAdvice(s,action)) {
    const change = advice.support ? (counsel === 'consult' ? 3 : 0) : counsel === 'consult' ? -3 : -9;
    applyRelationshipShift(s,advice.id,{}, { affinity: change, trust: change });
    if (!advice.support) { addCourtOpposition(s,advice.id,counsel === 'consult' ? 5 : 12); appendCharacterMemory(s.world.characters[advice.id], { id: `dissent_${s.nextId++}`, year: s.world.currentYear, type: 'council_dissent', actorIds: [p.id], sentiment: -25, salience: 4, inherited: true, summary: `${action.replaceAll('_',' ')}: ${advice.text}` }); }
  }
  if (action === 'tax_raise' && w.foodSecurity < 45 && chance(counsel === 'consult' ? 0.35 : 0.7)) { c.treasury = Math.max(0,c.treasury - 8); w.publicOrder = clamp(w.publicOrder - 8); result = ' Hungry households resist collection: eight treasury gold goes unpaid and public order falls.'; }
  if (action === 'grant_title') {
    for (const npc of Object.values(s.world.characters).filter(x => x.alive && x.id !== targetId && x.id !== p.id && x.rankIdx >= 3 && x.personalityTraits?.some(t => ['envious','ambitious'].includes(t))).slice(0,2)) { applyRelationshipShift(s,npc.id,{}, { affinity: -10 }); addCourtOpposition(s,npc.id,10); result += ` ${npc.name} objects to the new grant’s precedence.`; }
  }
  if (action === 'justice' && targetId) {
    const target = s.world.characters[targetId];
    for (const victimId of [...new Set(target.legalState?.charges.flatMap(q => q.victimIds) ?? [])]) {
      const victim = s.world.characters[victimId]; if (!victim?.alive || victimId === p.id) continue;
      applyRelationshipShift(s,victimId,{}, { trust: -15, affinity: -15 }); addCourtOpposition(s,victimId,12); result += ` ${victim.name}'s household condemns the pardon.`;
    }
  }
  return result;
}
export function tickCourtOpposition(s: GameState): void {
  const c = s.world.court; if (!c) return;
  c.coalitions = (c.coalitions ?? []).filter(x => s.world.characters[x.leaderId]?.alive);
  for (const coalition of c.coalitions) {
    coalition.memberIds = coalition.memberIds.filter(id => s.world.characters[id]?.alive);
    if (coalition.lastMoveYear + 3 > s.world.currentYear || c.legitimacy >= 55 || !chance(0.3)) continue;
    coalition.lastMoveYear = s.world.currentYear;
    const supporter = Object.values(c.offices).map(id => s.world.characters[id!]).find(x => x?.alive && x.id !== c.rulerId && !coalition.memberIds.includes(x.id) && (x.personalityTraits?.includes('ambitious') || x.worldMemories?.some(m => m.sentiment < -20 && m.actorIds.includes(c.rulerId))));
    if (supporter) coalition.memberIds.push(supporter.id);
    const claim = c.claims.filter(q => !q.disinherited && q.characterId !== c.rulerId && s.world.characters[q.characterId]?.alive).sort((a,b) => b.strength - a.strength)[0];
    coalition.claimantId = claim?.characterId;
    coalition.strength = clamp(coalition.strength + 6 + coalition.memberIds.length);
    if (claim) claim.strength = clamp(claim.strength + 3);
    c.treasury = Math.max(0,c.treasury - 3); s.world.conditions.publicOrder = clamp(s.world.conditions.publicOrder - 3);
    const text = `${s.world.characters[coalition.leaderId].name}'s coalition withholds cooperation${claim ? ` and backs ${s.world.characters[claim.characterId].name}'s claim` : ''}.`;
    c.records.push({ year: s.world.currentYear, kind: 'opposition', actorId: coalition.leaderId, targetId: claim?.characterId, detail: text });
    pushFeed(s,'COURT OPPOSITION','#a36a1f',text,'bad');
  }
}
export function dueCourtEvent(s: GameState): string | undefined {
  const c = s.world.court; if (!c) return;
  if (c.petition && !c.petition.resolved && c.petition.applicantId === s.playerCharacterId) return 'court_office_contest';
  if (c.rulerId === s.playerCharacterId && s.lifetimeUnlocked && c.coalitions?.some(q => q.strength >= 40 && (q.lastAudienceYear ?? -10) + 5 <= s.world.currentYear)) return 'court_opposition_audience';
}
export function resolveCourtOpposition(s: GameState, choice: NonNullable<Effects['courtOpposition']>): void {
  const c = s.world.court;
  if (!c || c.rulerId !== s.playerCharacterId || !s.lifetimeUnlocked) return;
  const q = c.coalitions?.find(q => q.strength >= 40 && (q.lastAudienceYear ?? -10) + 5 <= s.world.currentYear);
  if (!q || (choice === 'negotiate' && c.treasury < 15)) return;
  q.lastAudienceYear = s.world.currentYear;
  if (choice === 'negotiate') { c.treasury -= 15; q.strength = clamp(q.strength - 20); c.legitimacy = clamp(c.legitimacy + 3); applyRelationshipShift(s,q.leaderId,{}, { trust: 8 }); }
  if (choice === 'hear') { q.strength = clamp(q.strength - 8); c.legitimacy = clamp(c.legitimacy + 2); applyRelationshipShift(s,q.leaderId,{}, { respect: 5 }); }
  if (choice === 'assert') { q.strength = clamp(q.strength + 12); c.legitimacy = clamp(c.legitimacy - 6); s.world.conditions.publicOrder = clamp(s.world.conditions.publicOrder - 8); }
  record(s,`opposition_${choice}`,`${s.world.characters[q.leaderId]?.name}'s coalition: ${choice === 'negotiate' ? 'a funded settlement reduces organised opposition' : choice === 'hear' ? 'a hearing reduces grievances while the rival claim survives' : 'a rejected petition strengthens the opposition and lowers public order'}.`,q.leaderId);
}

export function petitionPatronEligible(s: GameState): boolean {
  const patron = s.world.characters[s.occupation.patronId ?? ''];
  return !!patron?.alive && bond(s,patron) >= 55;
}
