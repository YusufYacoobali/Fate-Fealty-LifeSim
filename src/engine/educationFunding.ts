import type { EducationTrackId, GameState, SponsorshipKind, WorldCharacter } from '@/types/game';
import { educationTrack } from '@/data/education';
import { readRelationship, perspectives } from './relationshipState';
import { chance, clamp } from './random';
import { skillLevel } from './rpgProgress';
import { pushFeed } from './gameState';

export function educationHousehold(state: GameState) {
  const player = state.world.characters[state.playerCharacterId];
  return state.world.households.find(h => h.id === player.householdId);
}
function bond(state: GameState, person?: WorldCharacter): number {
  if (!person) return 0;
  const views = perspectives(state, readRelationship(state, person));
  return (views.other.affinity + views.other.trust + views.other.respect) / 3;
}
export function fundingSponsor(state: GameState, kind: SponsorshipKind, track: EducationTrackId, requestedId?: string): WorldCharacter | undefined {
  const p = state.world.characters[state.playerCharacterId];
  const influential = (c: WorldCharacter) => c.rankIdx >= 3 || (c.factionInfluence ?? 0) >= 30 || Object.values(state.world.court?.offices ?? {}).includes(c.id);
  const eligible = Object.values(state.world.characters).filter(c => c.id !== p.id && c.alive && c.age >= 18 && c.id !== 'goose');
  if (kind === 'household') return eligible.find(c => c.id === educationHousehold(state)?.headId) ?? eligible.find(c => p.guardianIds?.includes(c.id));
  if (kind === 'patron') return eligible.filter(influential).filter(c => !requestedId || c.id === requestedId).sort((a,b) => bond(state,b) - bond(state,a) || a.id.localeCompare(b.id))[0];
  const guild = track === 'guild';
  const leader = state.world.factions[guild ? 'guilds' : 'church'].leaderId;
  return eligible.find(c => c.id === leader) ?? eligible.find(c => c.occupation.careerId === educationTrack(track).mentorCareer);
}
export function sponsorshipEligibility(state: GameState, kind: SponsorshipKind, track: EducationTrackId, sponsorId?: string): string | null {
  const p = state.world.characters[state.playerCharacterId], e = p.education!;
  const def = educationTrack(track);
  if (!def || def.fee === 0) return 'This learning path needs no tuition';
  if (e.track === track) return 'Tuition for this current training is already paid';
  if (def.qualifications.length && def.qualifications.every(q => e.qualifications.includes(q))) return 'You already hold this route’s qualifications';
  if (state.age < def.minAge) return `This training begins at ${def.minAge}`;
  if (e.sponsorships?.some(s => s.status === 'awarded' && (s.track === track || s.track === 'all') && (s.remaining === null || s.remaining > 0))) return 'This tuition is already covered';
  if (e.applications?.some(a => a.year === state.world.currentYear && a.kind === kind && a.track === track)) return 'Apply again in a later year';
  const sponsor = fundingSponsor(state,kind,track,sponsorId), household = educationHousehold(state);
  const wealth = household?.wealth ?? p.background?.householdWealth ?? 0;
  if (kind === 'household') return (household?.wealth ?? 0) >= def.fee ? null : `The household cannot spare ${def.fee}g`;
  if (!sponsor) return 'No suitable living sponsor is available';
  if (e.misconduct >= 50 || state.reputation < -25) return 'Repair your conduct or reputation before seeking support';
  if (kind === 'parish_charity') {
    if (state.age >= 18 || track !== 'parish') return 'Parish charity supports children learning their letters';
    if (wealth > 24 || state.gold > 24) return 'Charity is reserved for households unable to pay';
  }
  if (kind === 'merit' && state.stats.wits < 55 && e.progress < 25 && skillLevel(state, 'scholarship') < 2) return 'Show learning progress, Scholarship 2 or Wits 55 first';
  if (kind === 'patron' && bond(state,sponsor) < 55) return `${sponsor.name} does not yet trust you enough`;
  if (kind === 'patron' && sponsor.gold < def.fee) return `${sponsor.name} cannot fund this tuition now`;
  const institution = state.world.factions[track === 'guild' ? 'guilds' : 'church'];
  if (kind !== 'patron' && (institution.influence < 25 || institution.playerStanding < -20)) return `${institution.name} cannot support this application`;
  return null;
}
export function tuitionDue(state: GameState, track: EducationTrackId): number {
  const e = state.world.characters[state.playerCharacterId].education;
  const coverage = (e?.sponsorships ?? []).filter(s => s.status === 'awarded' && (s.track === track || s.track === 'all'));
  if ((e?.scholarship && !e.sponsorships?.length) || coverage.some(s => s.remaining === null)) return 0;
  return Math.max(0, educationTrack(track).fee - coverage.reduce((sum,s) => sum + (s.remaining ?? 0),0));
}
export function spendTuitionCoverage(state: GameState, track: EducationTrackId): number {
  const e = state.world.characters[state.playerCharacterId].education!;
  if (e.scholarship && !e.sponsorships?.length) return 0;
  let due = educationTrack(track).fee;
  for (const award of e.sponsorships ?? []) {
    if (award.status !== 'awarded' || (award.track !== track && award.track !== 'all')) continue;
    if (award.remaining === null) return 0;
    const used = Math.min(due,award.remaining); due -= used; award.remaining -= used;
    if (award.remaining === 0) award.status = 'spent';
  }
  return due;
}
export function applyForSponsorship(state: GameState, kind: SponsorshipKind, track: EducationTrackId, sponsorId?: string): void {
  const p = state.world.characters[state.playerCharacterId], e = p.education!;
  const reason = sponsorshipEligibility(state,kind,track,sponsorId);
  if (reason) return;
  const sponsor = fundingSponsor(state,kind,track,sponsorId);
  const competence = (sponsor?.stats.wits ?? 40) / 500;
  const odds = clamp((kind === 'parish_charity' ? 65 : kind === 'merit' ? 35 : 30) + state.stats.wits / 5 + e.progress / 6 + bond(state,sponsor) / 5 + competence * 10 + state.reputation / 10 - e.misconduct / 2,20,95) / 100;
  const approved = kind === 'household' || chance(odds);
  const explanation = approved ? `${sponsor?.name ?? 'Your household'} covers ${educationTrack(track).fee}g for ${educationTrack(track).name.toLowerCase()}. This award funds this route’s tuition once.`
    : `${sponsor!.name} declines: ${kind === 'parish_charity' ? 'the parish has more applicants than candles' : kind === 'merit' ? 'your work did not win the limited bursary' : 'your patron will not stake their purse on this request yet'}. Improve your work or relationships and apply in a later year.`;
  (e.applications ??= []).push({ kind,track,year: state.world.currentYear,approved,reason: explanation });
  e.applications = e.applications.slice(-30);
  if (approved) {
    const fee = educationTrack(track).fee;
    if (kind === 'household') educationHousehold(state)!.wealth -= fee;
    if (kind === 'patron') sponsor!.gold -= fee;
    (e.sponsorships ??= []).push({ id: `tuition_${state.nextId++}`, kind,track,sponsorId: sponsor?.id,status: 'awarded',year: state.world.currentYear,covered: fee,remaining: fee });
  }
  pushFeed(state,'EDUCATION · FUNDING',approved ? '#387245' : '#a36a1f',explanation,approved ? 'good' : 'plain');
}
