import {currentCourtScandal,identifyCourtScandals} from './courtIncidents';
import { allianceUnavailable } from './courtAlliances';
import { beginOfficePetition, councilAdvice, reactToDecree, tickCourtOpposition, addCourtOpposition } from './courtPolitics';
import type { CourtOffice, Effects, GameState, WorldCharacter } from '@/types/game';
import { POLITICAL_OFFICES } from '@/data/politicalOffices';
import { legacyStatus } from './lifeDepthState';
import { addRoyalClaim, recogniseRuler, royalCandidates, settleRoyalSuccession } from './royalSuccessionEngine';
import { timedActionAvailability } from './actionClock';
import { applyRelationshipShift } from './relationshipState';
import { appendCharacterMemory } from './worldJournal';
import { clamp, chance } from './random';
import { pushFeed } from './gameState';

/** Stable initial court for both new worlds and additive migration. No RNG draws. */
export function initializeCourt(state: GameState): void {
  if (state.world.court) return;
  const characters = Object.values(state.world.characters);
  const royalBirth = state.world.characters[state.playerCharacterId].background?.origin === 'royal' && !state.world.characters[state.playerCharacterId].background?.inherited;
  const ruler = characters.find(c => c.id === state.playerCharacterId && state.rankIdx === 5)
    ?? (royalBirth ? state.world.characters.father : undefined)
    ?? characters.find(c => c.alive && c.rankIdx >= 5)
    ?? state.world.characters.aldric ?? characters.find(c => c.alive && c.age >= 18 && c.id !== state.playerCharacterId)!;
  if (!ruler) return;
  state.world.court = { rulerId: ruler.id, offices: {}, claims: [], treasury: 250, legitimacy: 65, lastTickYear: state.world.currentYear, actionsYear: -1, actionsUsed: 0, records: [], scandals: [] };
  ruler.rankIdx = 5;
  ruler.socialStatus ??= legacyStatus(5);
  ruler.socialStatus.estate = 'royal';
  ruler.socialStatus.titles = [...new Set([...ruler.socialStatus.titles, 'Monarch'])];
  addRoyalClaim(state, ruler.id, ruler.id, 'legacy', 100);
  const used = new Set([ruler.id, state.playerCharacterId]);
  for (const office of POLITICAL_OFFICES) {
    const desired = state.world.characters[office.initialId];
    const person = desired?.alive && desired.age >= 18 && !used.has(desired.id) ? desired : characters.find(c => c.alive && c.age >= 18 && !used.has(c.id) && c.id !== 'goose');
    if (person) { state.world.court.offices[office.id] = person.id; person.importance = 'core'; used.add(person.id); }
  }
  if (!ruler.childIds?.length && ruler.id !== state.playerCharacterId) {
    const heir = characters.find(c => c.alive && c.age < 18 && !c.parentIds?.length && c.id !== 'goose' && c.id !== state.playerCharacterId);
    if (heir) {
      heir.parentIds = [ruler.id]; ruler.childIds = [heir.id];
      const oldFamily = state.world.families[heir.birthFamilyId ?? ''];
      if (oldFamily) oldFamily.memberIds = oldFamily.memberIds.filter(id => id !== heir.id);
      heir.birthFamilyId = ruler.birthFamilyId;
      const family = state.world.families[ruler.birthFamilyId ?? '']; if (family && !family.memberIds.includes(heir.id)) family.memberIds.push(heir.id);
      heir.socialStatus = { estate: 'royal', martialHonour: 'none', titles: ['Royal heir'], grants: ['birthright'] }; heir.rankIdx = 3;
    }
  }
  refreshRoyalClaims(state);
}
export function refreshRoyalClaims(state: GameState): void {
  const court = state.world.court; if (!court) return;
  const ruler = state.world.characters[court.rulerId]; if (!ruler) return;
  const children = Object.values(state.world.characters).filter(c => c.alive && c.parentIds?.includes(ruler.id)).sort((a,b) => b.age - a.age || a.id.localeCompare(b.id));
  children.forEach((child, index) => addRoyalClaim(state, child.id, ruler.id, 'birth', Math.max(40, 90 - index * 5)));
  if (ruler.spouseId) addRoyalClaim(state, ruler.spouseId, ruler.id, 'marriage', 45);
  if (!court.heirId || !state.world.characters[court.heirId]?.alive || court.claims.some(c => c.characterId === court.heirId && c.disinherited)) court.heirId = royalCandidates(state)[0]?.id;
}
export type CourtAction = 'patron' | 'petition' | 'alliance' | 'expose' | 'advise' | 'recognise_claim' | 'takeover' | 'regency_claim' | 'appoint' | 'dismiss' | 'tax_raise' | 'tax_relief' | 'justice' | 'religion' | 'mobilise' | 'peace' | 'grant_title' | 'name_heir' | 'disinherit' | 'abdicate';
const PUBLIC_ACTIONS: CourtAction[] = ['patron','petition','alliance','expose','advise','recognise_claim','takeover','regency_claim'];
export function courtAvailability(state: GameState, action: CourtAction, targetId?: string, office?: CourtOffice): string | null {
  const time = timedActionAvailability(state); if (!time.available) return time.reason!;
  const court = state.world.court; if (!court) return 'No recognised court';
  const p = state.world.characters[state.playerCharacterId];
  if (state.age < 16) return 'Political duties begin at sixteen';
  if (court.actionsYear === state.world.currentYear && court.actionsUsed >= 3) return 'Three council matters per year';
  if (court.lastActionYears?.[action] === state.world.currentYear) return 'Already decided this year';
  const target = targetId ? state.world.characters[targetId] : undefined;
  if (targetId && !target?.alive) return 'Choose a living person';
  if (['patron','alliance','appoint','justice','grant_title','name_heir','disinherit'].includes(action) && !target) return 'Choose a person';
  const ruler = court.rulerId === p.id;
  if (!PUBLIC_ACTIONS.includes(action) && (!ruler || !state.lifetimeUnlocked || court.regentId)) return 'Requires an entitled adult ruler';
  if (['appoint','dismiss','petition'].includes(action) && (!office || !POLITICAL_OFFICES.some(o => o.id === office))) return 'Choose an office';
  if (action === 'alliance') { const reason = allianceUnavailable(state, targetId); if (reason) return reason; }
  if (action === 'patron' && (target!.age < 18 || (target!.rankIdx < 3 && !Object.values(court.offices).includes(target!.id)))) return 'Choose an adult noble or council patron';
  if (action === 'appoint' && (target!.age < 18 || target!.id === court.rulerId || Object.values(court.offices).includes(target!.id))) return 'An adult may hold one council office';
  if (action === 'dismiss' && !court.offices[office!]) return 'That office is vacant';
  if (action === 'petition') {
    if (ruler || Object.values(court.offices).includes(p.id)) return 'Already serving in the court';
    if (court.petition && !court.petition.resolved) return 'A petition is already before the council';
    const professional = p.professionalHistory?.court;
    if (court.petition?.applicantId === p.id && court.petition.outcome === 'conditional' && (professional?.reputation ?? 0) < (court.petition.requiredStanding ?? 25)) return `The conditional service requires court standing ${court.petition.requiredStanding}`;
    if (!(p.education?.qualifications.includes('court_education') || (professional?.reputation ?? 0) >= 20)) return 'Needs court education or respected court service';
    if ((p.factionInfluence ?? 0) < 15 || state.world.factions.crown.playerStanding < 5) return 'Needs 15 influence and Crown support';
  }
  if (action === 'abdicate' && !royalCandidates(state).length) return 'Name an eligible successor first';
  if (action === 'justice' && target?.legalState?.status !== 'imprisoned') return 'Choose an imprisoned person';
  if (['name_heir','disinherit'].includes(action) && !court.claims.some(c => c.characterId === targetId && !c.disinherited && c.characterId !== court.rulerId)) return 'Choose an eligible royal claimant';
  if (action === 'grant_title' && (target!.age < 18 || target!.id === p.id)) return 'Choose another adult';
  if (['recognise_claim','takeover','regency_claim'].includes(action)) {
    if (!state.lifetimeUnlocked) return 'Monarch routes require Premium access';
    if (ruler) return 'Already ruler';
    if ((p.factionInfluence ?? 0) < (action === 'takeover' ? 60 : 30) || state.world.factions.crown.playerStanding < 15) return 'Needs influence and Crown support';
    if (action === 'recognise_claim' && !court.claims.some(c => c.characterId === p.id && !c.disinherited)) return 'No documented claim';
    if (action === 'regency_claim' && (court.formerRegentId !== p.id || state.world.characters[court.rulerId].age < 16)) return 'Requires a completed regency and council agreement';
    if (action === 'takeover' && (court.legitimacy > 30 || state.world.conditions.publicOrder > 35)) return 'The reigning monarch retains too much support';
    if (action === 'recognise_claim' && court.legitimacy > 40 && state.world.characters[court.rulerId]?.alive) return 'The reigning monarch still has a recognised mandate';
  }
  const costs: Partial<Record<CourtAction, number>> = { tax_relief: 20, religion: 15, mobilise: 30, peace: 15 };
  if (court.treasury < (costs[action] ?? 0)) return `Needs ${costs[action]} in the royal treasury`;
  return null;
}
function recordCourt(state: GameState, kind: string, targetId: string | undefined, detail: string): void {
  const court = state.world.court!;
  court.records.push({ year: state.world.currentYear, kind, actorId: state.playerCharacterId, targetId, detail });
  if (court.records.length > 150) court.records.splice(0, court.records.length - 150);
  pushFeed(state, 'COURT', '#7a4f9a', detail, 'plain');
}
export function performCourtAction(state: GameState, action: CourtAction, targetId?: string, office?: CourtOffice, counsel: 'consult' | 'override' = 'consult'): GameState {
  if (courtAvailability(state, action, targetId, office)) return state;
  const court = state.world.court!, p = state.world.characters[state.playerCharacterId], target = targetId ? state.world.characters[targetId] : undefined;
  if (court.actionsYear !== state.world.currentYear) { court.actionsYear = state.world.currentYear; court.actionsUsed = 0; }
  court.actionsUsed++; (court.lastActionYears ??= {})[action] = state.world.currentYear;
  const advice = court.rulerId === p.id ? councilAdvice(state,action) : [];
  const world = state.world.conditions;
  let text = '';
  switch (action) {
    case 'patron': p.factionInfluence = clamp((p.factionInfluence ?? 0) + 7); state.world.factions.crown.playerStanding = clamp(state.world.factions.crown.playerStanding + 4, -100, 100); applyRelationshipShift(state, target!.id, { affinity: 5 }, { affinity: 6, respect: 4 }); state.occupation.patronId = target!.id; text = `${target!.name} agrees to hear your petitions. Patronage begins with actual letters and an expectation of service.`; break;
    case 'petition': {
      beginOfficePetition(state,office!); text = `Your request for the ${office!.replaceAll('_',' ')}’s seal goes before the council. The present holder keeps the office while the petition is heard.`; break;
    }
    case 'alliance': {
      const family = state.world.families[p.birthFamilyId ?? ''], other = state.world.families[target!.birthFamilyId ?? ''];
      family.allyFamilyIds.push(other.id); other.allyFamilyIds.push(family.id);
      p.factionInfluence = clamp((p.factionInfluence ?? 0) + 6); text = `${target!.name}'s household records an alliance with yours. Its obligations will outlive the present courtiers.`; break;
    }
    case 'advise': p.factionInfluence = clamp((p.factionInfluence ?? 0) + 5); world.prosperity = clamp(world.prosperity + 2); state.world.factions.crown.playerStanding = clamp(state.world.factions.crown.playerStanding + 3, -100, 100); text = 'Your correction removes a duplicate levy from the decree. The realm gains a little prosperity and you gain a little influence.'; break;
    case 'expose': {
      identifyCourtScandals(state);const scandal = currentCourtScandal(state);
      if (scandal) { scandal.exposed = true; scandal.resolved = true; scandal.resolvedYear=state.world.currentYear; if (court.offices[scandal.office] === scandal.actorId) delete court.offices[scandal.office]; court.treasury += Math.floor(scandal.amount / 2); applyRelationshipShift(state, scandal.actorId, { trust: -20 }, { affinity: -25 }); court.legitimacy = clamp(court.legitimacy + 5); text = `Your investigation removes ${state.world.characters[scandal.actorId]?.name ?? 'the official'} and recovers ${Math.floor(scandal.amount / 2)} treasury gold. The missing portion has already been spent.`; }
      else { world.publicOrder = clamp(world.publicOrder + 2); text = 'Your audit finds no missing funds. You publish the accounts instead of manufacturing an accusation.'; }
      p.factionInfluence = clamp((p.factionInfluence ?? 0) + 6); break;
    }
    case 'recognise_claim': case 'takeover': case 'regency_claim':
      if (action !== 'recognise_claim') addRoyalClaim(state, p.id, court.rulerId, action === 'takeover' ? 'takeover' : 'regency', 70);
      recogniseRuler(state, p.id, action === 'takeover' ? 'a takeover backed by the council and Crown faction' : action === 'regency_claim' ? 'a council-approved transition after the regency' : 'council recognition of a disputed claim'); court.legitimacy = action === 'takeover' ? 40 : 60; text = 'The council recognises one ruler. Rival claims survive the ceremony.'; break;
    case 'appoint': {
      const old = court.offices[office!]; if (old) { applyRelationshipShift(state, old, { affinity: -4 }, { affinity: -15 }); addCourtOpposition(state,old,10); }
      court.offices[office!] = target!.id; applyRelationshipShift(state, target!.id, { respect: 5 }, { affinity: 10 }); text = `${target!.name} receives the ${office!.replaceAll('_',' ')}’s seal. Their ability and loyalty will now affect the kingdom.`; break;
    }
    case 'dismiss': { const id = court.offices[office!]!; delete court.offices[office!]; applyRelationshipShift(state, id, { trust: -10 }, { affinity: -20 }); text = `${state.world.characters[id].name} loses the seal and retains a very specific grievance.`; break; }
    case 'tax_raise': court.treasury += 25; court.legitimacy = clamp(court.legitimacy - 8); world.prosperity = clamp(world.prosperity - 7); state.world.factions.commons.playerStanding = clamp(state.world.factions.commons.playerStanding - 12, -100,100); state.world.scheduledConsequences.push({ id: `levy_${state.nextId++}`, dueYear: state.world.currentYear + 1, scope: 'world', targetIds: [], resolution: { type: 'condition', condition: 'publicOrder', delta: -7, label: 'Resentment of the raised levy' }, explanation: 'Households remember the raised levy when next year’s rents fall due.' }); text = 'You raise the levy. Twenty-five gold enters the treasury; the Commons begin calculating what your crown costs them.'; break;
    case 'tax_relief': court.treasury -= 20; court.legitimacy = clamp(court.legitimacy + 7); world.foodSecurity = clamp(world.foodSecurity + 10); world.prosperity = clamp(world.prosperity + 6); state.world.factions.commons.playerStanding = clamp(state.world.factions.commons.playerStanding + 10,-100,100); text = 'You forgive arrears and fund seed grain. The treasury loses twenty gold; occupied fields are a more durable receipt.'; break;
    case 'justice': target!.legalState!.status = 'free'; target!.legalState!.sentenceYearsRemaining = 0; for (const charge of target!.legalState!.charges) charge.resolved = true; target!.healthTags = target!.healthTags.filter(t => t !== 'imprisoned'); world.publicOrder = clamp(world.publicOrder + 3); text = `${target!.name} leaves prison under a recorded royal pardon.`; break;
    case 'religion': court.treasury -= 15; world.religiousTension = clamp(world.religiousTension - 10); state.world.factions.church.playerStanding = clamp(state.world.factions.church.playerStanding + 10,-100,100); court.legitimacy = clamp(court.legitimacy + 3); text = 'Fifteen treasury gold endows parish relief. Bread settles the dispute more effectively than the last three sermons.'; break;
    case 'mobilise': {
      court.treasury -= 30; const marshal = state.world.characters[court.offices.marshal ?? '']; const effective = marshal?.alive ? Math.max(2, Math.floor((marshal.stats.wits + (marshal.skills?.arms.level ?? 1) * 5) / 6)) : 2;
      world.warThreat = clamp(world.warThreat - effective); if (effective < 8) court.legitimacy = clamp(court.legitimacy - 6); text = `The host costs thirty treasury gold. ${marshal?.name ?? 'An unstaffed command'} reduces the threat by ${effective}; competence has become a matter of survival.`; break;
    }
    case 'peace': { court.treasury -= 15; const envoy = state.world.characters[court.offices.chancellor ?? '']; const odds = clamp(0.3 + (envoy?.stats.wits ?? 20) / 200 + court.legitimacy / 400 - world.warThreat / 500 + (counsel === 'consult' ? 0.1 : 0),0.15,0.9); const agreed = chance(odds); if (agreed) { world.warThreat = clamp(world.warThreat - 8); state.world.factions.commons.playerStanding = clamp(state.world.factions.commons.playerStanding + 5,-100,100); } else court.legitimacy = clamp(court.legitimacy - 3); text = `Fifteen treasury gold funds ${envoy?.name ?? 'the unstaffed chancellery'}’s embassy. ${agreed ? 'The guarantees win a truce; war threat falls.' : 'The other side rejects the guarantees; war threat remains and legitimacy falls.'}`; break; }
    case 'grant_title': target!.socialStatus ??= legacyStatus(target!.rankIdx); target!.socialStatus.estate = 'noble'; target!.socialStatus.titles = [...new Set([...target!.socialStatus.titles, 'Noble'])]; target!.socialStatus.grants.push(`royal_patent_${state.world.currentYear}`); target!.rankIdx = Math.max(3, target!.rankIdx); text = `${target!.name} receives a patent of landed nobility. The grant is entered in the royal record.`; break;
    case 'name_heir': court.heirId = target!.id; for (const claim of court.claims.filter(c => c.characterId !== target!.id && c.characterId !== p.id)) if (state.world.characters[claim.characterId]?.alive) applyRelationshipShift(state, claim.characterId, { affinity: -3 }, { affinity: -12 }); text = `${target!.name} is named heir. The other claimants retain their genealogy and their objections.`; break;
    case 'disinherit': court.claims.find(c => c.characterId === target!.id)!.disinherited = true; if (court.heirId === target!.id) court.heirId = undefined; court.legitimacy = clamp(court.legitimacy - 10); applyRelationshipShift(state, target!.id, { trust: -15 }, { affinity: -35 }); text = `${target!.name} is disinherited. The family receives a legal decision and the beginnings of a feud.`; break;
    case 'abdicate': { const successor = royalCandidates(state)[0]; if (successor) recogniseRuler(state, successor.id, 'a recorded abdication'); text = 'You surrender the crown. The council and the treasury continue under the recognised successor.'; break; }
  }
  if (court.rulerId === p.id && !PUBLIC_ACTIONS.includes(action)) text += reactToDecree(state,action,counsel,targetId,advice);
  court.treasury = clamp(court.treasury, 0, 5000);
  recordCourt(state, action, targetId, text);
  if (target) appendCharacterMemory(target, { id: `court_${state.nextId++}`, year: state.world.currentYear, type: `court_${action}`, actorIds: [p.id], sentiment: ['disinherit','dismiss','expose'].includes(action) ? -25 : 15, salience: 4, inherited: true, summary: text });
  return state;
}
/** Repair stale office holders, then resolve succession and age-based regencies. */
export function reconcileCourt(state: GameState): void {
  initializeCourt(state);
  const court = state.world.court; if (!court) return;
  court.claims = court.claims.filter(c => !!state.world.characters[c.characterId] && !!state.world.characters[c.throughId]);
  const seen = new Set([court.rulerId]);
  for (const office of POLITICAL_OFFICES) {
    const id = court.offices[office.id]; const c = state.world.characters[id ?? ''];
    if (!c?.alive || c.age < 18 || seen.has(id!)) delete court.offices[office.id]; else seen.add(id!);
  }
  if (court.petition && !court.petition.resolved && court.petition.applicantId !== state.playerCharacterId) court.petition.resolved = true;
  refreshRoyalClaims(state);
  settleRoyalSuccession(state);
  const ruler = state.world.characters[court.rulerId];
  const crisis = court.crisis;
  if (crisis && (
    crisis.rulerId !== court.rulerId || court.rulerId !== state.playerCharacterId || !state.lifetimeUnlocked ||
    !state.world.characters[crisis.leaderId]?.alive || !state.world.characters[crisis.challengerId]?.alive ||
    court.claims.some(q => q.characterId === crisis.challengerId && q.disinherited) ||
    !court.coalitions?.some(q => q.leaderId === crisis.leaderId)
  )) delete court.crisis;
  if (ruler) {
    ruler.socialStatus ??= legacyStatus(5);
    ruler.socialStatus.estate = 'royal';
    ruler.socialStatus.titles = [...new Set([...ruler.socialStatus.titles, 'Monarch'])];
  }
  if (ruler?.age >= 16) { if (court.regentId) court.formerRegentId = court.regentId; court.regentId = undefined; }
  else if (!court.regentId || !state.world.characters[court.regentId]?.alive) court.regentId = Object.values(court.offices).find(id => state.world.characters[id!]?.alive && state.world.characters[id!].age >= 18);
  for (const c of Object.values(state.world.characters)) if (c.alive && c.id !== court.rulerId && c.rankIdx >= 5) c.rankIdx = 3;
  if (!state.dead && state.rankIdx >= 5 && court.rulerId !== state.playerCharacterId) state.rankIdx = 3;
  if (court.rulerId === state.playerCharacterId) state.rankIdx = 5;
  state.world.factions.crown.leaderId = court.rulerId;
  court.records = court.records.slice(-150);
}
export function tickCourt(state: GameState): void {
  reconcileCourt(state);
  const court = state.world.court; if (!court || court.lastTickYear >= state.world.currentYear) return;
  court.lastTickYear = state.world.currentYear;
  court.treasury = Math.min(5000, Math.max(0, court.treasury + 8 - Object.keys(court.offices).length * 2));
  for (const office of POLITICAL_OFFICES) {
    const councillor = state.world.characters[court.offices[office.id] ?? '']; if (!councillor || councillor.id === state.playerCharacterId) continue;
    const traits = councillor.personalityTraits ?? [];
    const corrupt = traits.some(t => ['cunning','cruel','ambitious'].includes(t)) && !traits.includes('loyal');
    if (corrupt && court.treasury >= 12 && !court.scandals.some(s => s.actorId === councillor.id && !s.resolved) && chance(0.08)) {
      const amount = Math.min(40, court.treasury); court.treasury -= amount; councillor.gold += amount;
      court.scandals.push({ id:`court_scandal_${state.nextId++}`,openedYear:state.world.currentYear,office: office.id, actorId: councillor.id, amount, exposed: false }); court.legitimacy = clamp(court.legitimacy - 4);
      court.records.push({ year: state.world.currentYear, kind: 'corruption', actorId: councillor.id, detail: 'Funds diverted through a household account.' });
    }
    if (councillor.stats.wits < 35) { state.world.conditions.prosperity = clamp(state.world.conditions.prosperity - 2); court.legitimacy = clamp(court.legitimacy - 1); }
    const ruler = state.world.characters[court.rulerId];
    const loyalty = Object.values(state.world.relationships).find(r => (r.aId === ruler.id && r.bId === councillor.id) || (r.bId === ruler.id && r.aId === councillor.id));
    const grievance = councillor.worldMemories?.some(m => m.sentiment < -20 && m.actorIds.includes(ruler.id));
    if ((corrupt || grievance || (loyalty && (loyalty.aToB.trust + loyalty.bToA.trust) / 2 < 25)) && court.legitimacy < 40) court.legitimacy = clamp(court.legitimacy - 2);
    else if (traits.includes('loyal') && councillor.stats.wits >= 60) court.legitimacy = clamp(court.legitimacy + 1);
  }
  tickCourtOpposition(state);
  const critical = court.legitimacy < 15 && state.world.conditions.publicOrder < 25;
  if (!critical && court.crisis?.responseYear !== undefined) delete court.crisis;
  if (critical) {
    const former = state.world.characters[court.rulerId];
    const challenger = royalCandidates(state)[0] ?? Object.values(court.offices).map(id => state.world.characters[id!]).find(c => c?.alive && c.id !== former.id && c.id !== state.playerCharacterId);
    let canDepose = former.id !== state.playerCharacterId || !state.lifetimeUnlocked;
    let successor = challenger;
    if (!canDepose && challenger) {
      if (!court.crisis) {
        const leaderId = court.coalitions?.filter(q => state.world.characters[q.leaderId]?.alive && q.leaderId !== former.id).sort((a,b) => b.strength - a.strength)[0]?.leaderId ?? challenger.id;
        addCourtOpposition(state, leaderId, 0);
        const coalition = court.coalitions!.find(q => q.leaderId === leaderId)!;
        coalition.strength = Math.max(50, coalition.strength);
        coalition.claimantId = challenger.id;
        court.crisis = { rulerId: former.id, leaderId, challengerId: challenger.id, openedYear: state.world.currentYear };
        const detail = `${state.world.characters[leaderId].name}'s coalition threatens to depose you. Answer the households before the crown's future is decided.`;
        court.records.push({ year: state.world.currentYear, kind: 'crisis_opened', actorId: leaderId, targetId: former.id, detail });
        pushFeed(state, 'COURT CRISIS', '#a36a1f', detail, 'bad');
      } else if (court.crisis.responseYear !== undefined && court.crisis.responseYear < state.world.currentYear) {
        const coalition = court.coalitions!.find(q => q.leaderId === court.crisis!.leaderId)!;
        canDepose = coalition.strength >= 40;
        successor = state.world.characters[court.crisis.challengerId];
        if (!canDepose) delete court.crisis;
      }
    }
    if (successor && canDepose && addRoyalClaim(state, successor.id, former.id, 'takeover', 60) && recogniseRuler(state, successor.id, 'a rebellion backed by the disaffected council')) {
      court.legitimacy = 42;
      delete court.crisis;
      if (former.legalState) { former.legalState.status = 'exiled'; former.legalState.suspicion = 0; }
      if (former.id === state.playerCharacterId && !state.tags.includes('exiled')) state.tags.push('exiled');
    }
  }
  const vacancy = POLITICAL_OFFICES.find(o => !court.offices[o.id]);
  if (vacancy) {
    const aspirant = Object.values(state.world.characters).find(c => c.alive && c.age >= 18 && c.id !== state.playerCharacterId && c.id !== court.rulerId && c.id !== 'goose' && !Object.values(court.offices).includes(c.id) && c.personalityTraits?.includes('ambitious'));
    if (aspirant && chance(0.2)) { court.offices[vacancy.id] = aspirant.id; aspirant.importance = 'core'; court.records.push({ year: state.world.currentYear, kind: 'appointment', actorId: aspirant.id, detail: `${aspirant.name} secured the vacant ${vacancy.name.toLowerCase()} office.` }); }
  }
  const claimant = royalCandidates(state)[0];
  const backer = Object.values(court.offices).map(id => state.world.characters[id!]).find(c => c?.alive && c.id !== state.playerCharacterId && c.personalityTraits?.some(t => ['cunning','envious'].includes(t)));
  if (claimant && backer && court.legitimacy < 40 && chance(0.12)) {
    const claim = court.claims.find(c => c.characterId === claimant.id)!; claim.strength = Math.min(100, claim.strength + 3);
    const id = `rel_${[backer.id, claimant.id].sort().join('_')}`;
    const relation = state.world.relationships[id] ?? Object.values(state.world.relationships).find(r => (r.aId === backer.id && r.bId === claimant.id) || (r.aId === claimant.id && r.bId === backer.id));
    if (backer.id !== claimant.id) {
      const view = { affinity: 55, trust: 50, respect: 60, attraction: 0 };
      state.world.relationships[relation?.id ?? id] = relation ?? { id, aId: backer.id, bId: claimant.id, aToB: { ...view }, bToA: { ...view }, flags: ['friend'], lastInteractionAge: state.age, interactionsThisYear: 0, sharedMemories: [] };
      if (relation) { relation.aToB.trust = clamp(relation.aToB.trust + 3); relation.bToA.trust = clamp(relation.bToA.trust + 3); }
    }
    court.records.push({ year: state.world.currentYear, kind: 'claimant_backing', actorId: backer.id, targetId: claimant.id, detail: `${backer.name} backs ${claimant.name}'s competing claim.` });
  }
  court.scandals = [...court.scandals.filter(q=>q.resolved).slice(-30),...court.scandals.filter(q=>!q.resolved)];
  court.records = court.records.slice(-150);
}

export function applyCourtScandal(state: GameState, decision: NonNullable<Effects['courtScandal']>): void {
  const court = state.world.court;
  if (!court || court.rulerId !== state.playerCharacterId || !state.lifetimeUnlocked) return;
  identifyCourtScandals(state);const scandal = currentCourtScandal(state);
  if (!scandal) return;
  if(state.pendingEvent?.eventId==='royal_creative_accounts')state.pendingEvent.incidentId=scandal.id;
  scandal.resolved = true; scandal.resolvedYear=state.world.currentYear;
  const official = state.world.characters[scandal.actorId];
  const remove = () => { if (court.offices[scandal.office] === scandal.actorId) delete court.offices[scandal.office]; };
  if (decision === 'investigate') {
    scandal.exposed = true; remove(); court.treasury += Math.floor(scandal.amount / 2); court.legitimacy = clamp(court.legitimacy + 6);
    if (official) official.gold = Math.max(0, official.gold - Math.floor(scandal.amount / 2));
    applyRelationshipShift(state, scandal.actorId, { trust: -20 }, { affinity: -25 });
    state.world.factions.commons.playerStanding = clamp(state.world.factions.commons.playerStanding + 6,-100,100);
  } else if (decision === 'cover') {
    court.legitimacy = clamp(court.legitimacy - 8);
    applyRelationshipShift(state, scandal.actorId, { trust: -5 }, { affinity: 10 });
    state.world.scheduledConsequences.push({ id: `court_evidence_${state.nextId++}`, dueYear: state.world.currentYear + 2, scope: 'world', targetIds: [], resolution: { type: 'condition', condition: 'publicOrder', delta: -12, label: 'Evidence of covered royal corruption' }, explanation: 'An opposing household produces evidence of the covered accounts.' });
  } else if (decision === 'scapegoat') {
    const innocent = court.offices.treasurer;
    if (innocent) { delete court.offices.treasurer; applyRelationshipShift(state, innocent, { affinity: -8 }, { affinity: -35, trust: -30 }); }
    court.legitimacy = clamp(court.legitimacy - 12); state.world.factions.guilds.playerStanding = clamp(state.world.factions.guilds.playerStanding - 15,-100,100);
  } else { remove(); applyRelationshipShift(state, scandal.actorId, { trust: -12 }, { affinity: -20 }); court.legitimacy = clamp(court.legitimacy - 2); }
  court.treasury = clamp(court.treasury, 0, 5000);
  recordCourt(state, `scandal_${decision}`, scandal.actorId, `${official?.name ?? 'The official'}: ${scandal.amount} treasury gold diverted; the crown chose ${decision}.`);
}

export function applyRoyalTransition(state: GameState, transition: 'claim' | 'abdicate' | 'depose' | 'name_heir'): void {
  const court = state.world.court; if (!court) return;
  if (transition === 'claim') {
    const p = state.world.characters[state.playerCharacterId];
    if (state.lifetimeUnlocked && state.age >= 16 && (p.factionInfluence ?? 0) >= 30 && state.world.factions.crown.playerStanding >= 15 && court.legitimacy <= 40 && court.claims.some(c => c.characterId === p.id && !c.disinherited)) recogniseRuler(state, p.id, 'recognition of a documented disputed claim');
    return;
  }
  if (court.rulerId !== state.playerCharacterId) return;
  refreshRoyalClaims(state);
  const candidate = royalCandidates(state)[0];
  if (transition === 'name_heir') { if (candidate) court.heirId = candidate.id; return; }
  if (transition === 'abdicate' && (!state.lifetimeUnlocked || !candidate)) return;
  const successor = candidate ?? Object.values(court.offices).map(id => state.world.characters[id!]).find(c => c?.alive && c.id !== state.playerCharacterId);
  if (!successor) return;
  addRoyalClaim(state, successor.id, court.rulerId, 'recognition', 50);
  recogniseRuler(state, successor.id, transition === 'abdicate' ? 'voluntary abdication' : 'defeat in a council-backed rebellion');
  if (transition === 'depose') {
    const former = state.world.characters[state.playerCharacterId]; former.legalState!.status = 'exiled';
    if (!state.tags.includes('exiled')) state.tags.push('exiled');
  }
}
