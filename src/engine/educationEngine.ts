import { applyForSponsorship, sponsorshipEligibility, spendTuitionCoverage, tuitionDue } from './educationFunding';
import type { SponsorshipKind } from '@/types/game';
import type { EducationTrackId, Effects, GameState, WorldCharacter } from '@/types/game';
import { educationTrack } from '@/data/education';
import { emptyEducation } from './lifeDepthState';
import { spawnKin } from './kinFactory';
import { addMoney, pushFeed } from './gameState';
import { grantSkillXp, skillLevel } from './rpgProgress';
import { applyRelationshipShift } from './relationshipState';
import { appendCharacterMemory } from './worldJournal';
import { timedActionAvailability } from './actionClock';
import { clamp, chance } from './random';

export type EducationAction = 'enrol' | 'study' | 'practise' | 'mentor' | 'challenge' | 'bully' | 'cheat' | 'skip' | 'scholarship' | 'graduate' | 'leave';
export function educationOf(character: WorldCharacter) { return character.education ??= emptyEducation(); }
export function educationFee(state: GameState, track: EducationTrackId): number {
  return tuitionDue(state, track);
}
export function educationAvailability(state: GameState, action: EducationAction, track?: EducationTrackId, funding: SponsorshipKind = 'parish_charity', sponsorId?: string): string | null {
  const time = timedActionAvailability(state);
  if (!time.available) return time.reason!;
  if (state.age < 5) return 'Learning begins at age 5';
  const e = state.world.characters[state.playerCharacterId].education ?? emptyEducation();
  if (e.actionsYear === state.world.currentYear && e.actionsUsed >= 3) return 'Three learning opportunities per year';
  if (action === 'scholarship') return sponsorshipEligibility(state, funding, track ?? e.track ?? 'parish', sponsorId);
  if (action === 'enrol') {
    if (!track) return 'Choose a learning path';
    const def = educationTrack(track);
    if (!def) return 'Unknown learning path';
    if (e.track) return 'Leave or complete your current learning first';
    if (state.age < def.minAge) return `Begins at age ${def.minAge}`;
    if (e.history.some(h => h.track === track && h.outcome === 'completed') || (def.qualifications.length > 0 && def.qualifications.every(q => e.qualifications.includes(q)))) return 'Already qualified';
    if (state.gold < educationFee(state, track)) return `Needs ${educationFee(state, track)}g or a scholarship`;
    return null;
  }
  if (!e.track) return 'Choose a learning path first';
  if (['study', 'practise'].includes(action) && e.progress >= 100) return 'Training mastered; complete at the track’s required age and service years';
  if (action === 'graduate') {
    const def = educationTrack(e.track);
    if (e.progress < 100) return 'Needs 100 learning progress';
    if (state.age < def.completionAge) return `Complete at age ${def.completionAge}`;
    if (state.world.currentYear - (e.startedYear ?? state.world.currentYear) < def.years) return `Requires ${def.years} years of training`;
    if (e.misconduct >= 50) return 'Repair your conduct with your mentor';
  }
  return null;
}
export function recoverEducationActors(state: GameState): void {
  const p = state.world.characters[state.playerCharacterId], e = educationOf(p);
  if (!e.track) return;
  const def = educationTrack(e.track);
  if (!e.mentorId || !state.world.characters[e.mentorId]?.alive) {
    const mentor = Object.values(state.world.characters).find(c => c.id !== p.id && c.alive && c.age >= 20 && c.id !== (e.activeClassmateIds?.[0] ?? e.classmateIds[0]) && c.occupation.careerId === def.mentorCareer)
      ?? spawnKin(state, { kind: 'acquaintance', age: 35, role: `${def.name} mentor`, bio: 'A patient teacher whose fees include the right to complain.' });
    mentor.occupation.careerId = def.mentorCareer;
    e.mentorId = mentor.id;
  }
  e.activeClassmateIds ??= [...e.classmateIds];
  e.activeClassmateIds = e.activeClassmateIds.filter(id => state.world.characters[id]?.alive && (state.world.characters[id].age >= 18) === (state.age >= 18));
  if (!e.activeClassmateIds.length) {
    const peer = Object.values(state.world.characters).find(c => c.id !== p.id && c.id !== e.mentorId && c.alive && Math.abs(c.age - state.age) <= 3 && (c.age >= 18) === (state.age >= 18) && (!c.education?.track || c.education.track === e.track) && c.id !== 'goose')
      ?? spawnKin(state, { kind: 'acquaintance', age: state.age, role: state.age >= 18 ? 'Adult study colleague' : 'Fellow learner', bio: 'Your fellow learner keeps careful count of every slight and every favour.' });
    e.classmateIds = [...new Set([...e.classmateIds, peer.id])];
    e.activeClassmateIds.push(peer.id);
    const peerLearning = educationOf(peer);
    if (!peerLearning.track) { peerLearning.track = def.id; peerLearning.startedYear = state.world.currentYear; }
    if (peerLearning.track === def.id) {
      peerLearning.mentorId = e.mentorId;
      peerLearning.classmateIds = [...new Set([...peerLearning.classmateIds, p.id])];
      peer.childDevelopment!.investment = Math.max(4, peer.childDevelopment!.investment);
    }
  }
}
export function applyEducationEffect(state: GameState, effect: NonNullable<Effects['education']>): void {
  const p = state.world.characters[state.playerCharacterId], e = educationOf(p);
  if (effect.disputedCredential && e.track && educationTrack(e.track).qualifications.includes(effect.disputedCredential)) {
    e.qualifications = [...new Set([...e.qualifications, effect.disputedCredential])];
    (e.fraudulentCredentials ??= []).push({ qualification: effect.disputedCredential, mentorId: e.mentorId, reviewYear: state.world.currentYear + 2, resolved: false });
  }
  if (effect.qualifications) e.qualifications = [...new Set([...e.qualifications, ...effect.qualifications])];
  if (!e.track) return;
  recoverEducationActors(state);
  e.progress = clamp(e.progress + (effect.progress ?? 0));
  e.misconduct = clamp(e.misconduct + (effect.misconduct ?? 0));
  // Authored awards use the same finite route budget; only migrated v6 flags
  // retain the old ongoing benefit. No new effect can mint a blanket waiver.
  if (effect.scholarship && !e.sponsorships?.some(a => a.status === 'awarded' && (a.track === e.track || a.track === 'all'))) {
    const fee = educationTrack(e.track).fee;
    if (fee) (e.sponsorships ??= []).push({ id: `tuition_${state.nextId++}`, kind: 'merit', track: e.track, sponsorId: e.mentorId, status: 'awarded', year: state.world.currentYear, covered: fee, remaining: fee });
  }
  if (e.mentorId && effect.mentorBond) applyRelationshipShift(state, e.mentorId, { affinity: effect.mentorBond }, { affinity: effect.mentorBond, trust: effect.mentorBond });
  const peerId = e.activeClassmateIds?.[0] ?? e.classmateIds[0];
  if (peerId && effect.peerBond) {
    applyRelationshipShift(state, peerId, { affinity: effect.peerBond }, { affinity: effect.peerBond, trust: effect.peerBond });
    const peer = state.world.characters[peerId];
    if (effect.peerBond < 0) {
      const relationship = Object.values(state.world.relationships).find(r => (r.aId === p.id && r.bId === peerId) || (r.bId === p.id && r.aId === peerId));
      if (relationship && !relationship.flags.includes('rival')) relationship.flags.push('rival');
      const family = state.world.families[p.birthFamilyId ?? ''];
      if (family && peer.birthFamilyId && family.id !== peer.birthFamilyId && !family.enemyFamilyIds.includes(peer.birthFamilyId)) family.enemyFamilyIds.push(peer.birthFamilyId);
    }
    appendCharacterMemory(peer, { id: `education_${state.nextId++}`, year: state.world.currentYear, type: effect.peerBond < 0 ? 'school_grudge' : 'school_friendship', actorIds: [p.id], sentiment: effect.peerBond, salience: 4, inherited: effect.peerBond < 0, summary: `${p.name} ${effect.peerBond < 0 ? 'humiliated' : 'helped'} ${peer.name} during ${educationTrack(e.track).name.toLowerCase()}.` });
  }
  if (effect.dismiss || e.misconduct >= 80) {
    e.history.push({ track: e.track, year: state.world.currentYear, outcome: 'dismissed' });
    e.track = null;
    pushFeed(state, 'EDUCATION · DISMISSED', '#ab3939', 'Your mentor returns your belongings in a sack. The sack is the only recommendation enclosed.', 'bad');
  }
}
export function performEducationAction(state: GameState, action: EducationAction, track?: EducationTrackId, funding: SponsorshipKind = 'parish_charity', sponsorId?: string): GameState {
  if (educationAvailability(state, action, track, funding, sponsorId)) return state;
  const e = educationOf(state.world.characters[state.playerCharacterId]);
  if (e.actionsYear !== state.world.currentYear) { e.actionsYear = state.world.currentYear; e.actionsUsed = 0; }
  e.actionsUsed++;
  if (action === 'scholarship') {
    applyForSponsorship(state, funding, track ?? e.track ?? 'parish', sponsorId);
    return state;
  }
  if (action === 'enrol') {
    addMoney(state, -spendTuitionCoverage(state, track!));
    if (e.mentorId) e.formerMentorIds = [...new Set([...(e.formerMentorIds ?? []), e.mentorId])];
    Object.assign(e, { track: track!, progress: 0, misconduct: 0, startedYear: state.world.currentYear, activeClassmateIds: [], mentorId: undefined, mode: state.age >= 18 ? 'adult' : 'childhood' });
    recoverEducationActors(state);
    const mentor = state.world.characters[e.mentorId!];
    pushFeed(state, 'LEARNING', '#365f88', `You begin ${educationTrack(track!).name.toLowerCase()} with ${mentor.name}. Your fellow learner is ${state.world.characters[(e.activeClassmateIds?.[0] ?? e.classmateIds[0])].name}.`, 'good');
    return state;
  }
  recoverEducationActors(state);
  const def = educationTrack(e.track!);
  const mentor = state.world.characters[e.mentorId!];
  if (action === 'graduate') {
    e.qualifications = [...new Set([...e.qualifications, ...def.qualifications])];
    e.history.push({ track: def.id, year: state.world.currentYear, outcome: 'completed' });
    e.track = null;
    if (def.id === 'martial' && state.world.characters[state.playerCharacterId].socialStatus!.martialHonour === 'none') state.world.characters[state.playerCharacterId].socialStatus!.martialHonour = 'page';
    pushFeed(state, 'QUALIFIED', '#387245', `${mentor.name} signs your record: ${def.qualifications.map(q => q.replaceAll('_', ' ')).join(', ') || 'household practice completed'}. Employers may listen; none has promised a place.`, 'good');
    return state;
  }
  if (action === 'leave') { e.history.push({ track: def.id, year: state.world.currentYear, outcome: 'left' }); e.track = null; return state; }
  const expertise = (mentor.skills?.[def.skill]?.level ?? 1) + mentor.stats.wits / 15 + mentor.occupation.performance / 25;
  const gain = Math.max(3, Math.round(5 + skillLevel(state, def.skill) + expertise / 2 + mentor.rel / 25 - e.misconduct / 25));
  const attentive = chance(Math.max(0.35, Math.min(0.95, 0.45 + expertise / 35 + state.stats.wits / 500)));
  const discovered = action === 'cheat' && chance(Math.min(0.9, 0.12 + mentor.stats.wits / 160 + e.misconduct / 250));
  const effects: Partial<Record<EducationAction, NonNullable<Effects['education']>>> = {
    study: { progress: attentive ? gain : 3, mentorBond: attentive ? 2 : 0 }, practise: { progress: attentive ? gain + 3 : 4 }, mentor: { progress: 9, misconduct: -20, mentorBond: 8 },
    challenge: { progress: 10, peerBond: mentor.rel >= 50 ? 4 : -5 }, bully: { progress: 2, misconduct: 25, peerBond: -25, mentorBond: -10 },
    cheat: discovered ? { progress: -4, misconduct: 35, peerBond: -15, mentorBond: -15 } : { progress: 16, misconduct: 2 }, skip: { progress: -6, misconduct: 15, mentorBond: -8 },
  };
  applyEducationEffect(state, effects[action]!);
  if (action !== 'skip' && action !== 'bully' && action !== 'cheat') grantSkillXp(state, def.skill, attentive ? 7 : 2, def.name.toLowerCase());
  const lines: Partial<Record<EducationAction, string>> = {
    study: `You work through ${mentor.name}'s examples. The margins contain three corrections and a small drawing of your execution.`,
    practise: 'You repeat the difficult work until your hands understand what your head has been pretending to know.',
    mentor: `${mentor.name} explains the error privately. You repair your conduct as well as your work.`,
    challenge: `You test your work against ${state.world.characters[(e.activeClassmateIds?.[0] ?? e.classmateIds[0])].name}. The result becomes a topic of conversation for years.`,
    bully: `You humiliate ${state.world.characters[(e.activeClassmateIds?.[0] ?? e.classmateIds[0])].name} before the class. Their silence is not forgiveness.`,
    cheat: `You pass off ${state.world.characters[(e.activeClassmateIds?.[0] ?? e.classmateIds[0])].name}'s work as yours. ${discovered ? 'Your mentor recognises the handwriting; the accusation is recorded.' : 'The borrowed work passes for yours, this time.'}`,
    skip: 'You spend the lesson by the river. Your mentor adds your absence to a much less pleasant lesson.' };
  if (state.age >= 18) {
    lines.study = `${mentor.name} reviews your adult study. ${attentive ? 'The commentary clears up a difficult passage.' : 'The explanation leaves you with corrections and work still to do.'}`;
    lines.challenge = `You debate ${state.world.characters[(e.activeClassmateIds?.[0] ?? e.classmateIds[0])].name} as a fellow adult learner. Your argument will travel beyond the lesson.`;
  }
  pushFeed(state, 'LEARNING', '#365f88', lines[action]!, ['bully', 'cheat', 'skip'].includes(action) ? 'bad' : 'good');
  return state;
}
export function tickEducation(state: GameState): void {
  // Childhood company exists outside paid schooling too. Keep an actual,
  // persistent child in the world; eligibility probes never invent actors.
  if (state.age >= 5 && state.age <= 17 && !Object.values(state.world.characters).some(c => c.id !== state.playerCharacterId && c.id !== 'goose' && c.alive && c.age >= 5 && c.age < 18 && Math.abs(c.age - state.age) <= 3)) {
    spawnKin(state, { kind: 'acquaintance', age: state.age, role: 'Childhood companion', bio: 'A fellow child of the neighbourhood, with opinions about fair shares and a good memory for unfair ones.' });
  }
  for (const c of Object.values(state.world.characters)) {
    if (!c.alive) continue;
    const e = educationOf(c);
    if (c.id === state.playerCharacterId) {
      for (const credential of e.fraudulentCredentials ?? []) {
        if (credential.resolved || credential.reviewYear > state.world.currentYear) continue;
        credential.resolved = true;
        const mentor = state.world.characters[credential.mentorId ?? ''];
        if (chance(Math.min(0.95, 0.4 + (mentor?.stats.wits ?? 40) / 200 + e.misconduct / 300))) {
          const legitimatelyEarned = e.history.some(h => h.outcome === 'completed' && educationTrack(h.track).qualifications.includes(credential.qualification));
          if (!legitimatelyEarned) e.qualifications = e.qualifications.filter(q => q !== credential.qualification);
          e.misconduct = clamp(e.misconduct + 30); state.reputation -= 8;
          if (mentor?.alive) applyRelationshipShift(state, mentor.id, { trust: -20 }, { trust: -25, respect: -15 });
          pushFeed(state, 'CREDENTIAL REVIEW', '#ab3939', `${mentor?.name ?? 'The examiner'} challenges your borrowed ${credential.qualification.replaceAll('_', ' ')} certificate. ${legitimatelyEarned ? 'Your later honest examination stands, but the deception is recorded.' : 'The false credential is withdrawn; honest training remains open.'}`, 'bad');
        }
      }
      if (e.track) { e.mode = state.age >= 18 ? 'adult' : 'childhood'; recoverEducationActors(state); e.progress = clamp(e.progress + (e.misconduct < 50 ? 5 : 0)); }
      if (state.age >= 18 && !e.comingOfAge) {
        e.comingOfAge = true;
        pushFeed(state, 'COMING OF AGE', '#7a4f9a', `${state.age === 18 ? 'You enter adulthood with' : 'Your learning record contains'} ${e.qualifications.length ? e.qualifications.map(q => q.replaceAll('_', ' ')).join(', ') : 'no formal qualification'}. ${e.classmateIds.map(id => state.world.characters[id]?.name).filter(Boolean).join(' and ') || 'The people of your household'} will remember how you got here. Later study remains open.`, 'plain');
      }
    } else {
      const investment = c.childDevelopment?.investment ?? 0;
      if (!e.track && c.age >= 5 && c.age <= 18 && investment > 0) {
        const track = c.childDevelopment?.education === 'martial' ? 'martial' : c.childDevelopment?.education === 'court' ? 'noble' : c.childDevelopment?.education === 'craft' ? 'guild' : c.childDevelopment?.education === 'church' ? 'cathedral' : 'parish';
        if (!e.history.some(h => h.track === track && h.outcome === 'completed') && c.age >= educationTrack(track).minAge) { e.track = track; e.startedYear = state.world.currentYear; }
      }
      if (e.track) {
        const def = educationTrack(e.track);
        if (e.mentorId && !state.world.characters[e.mentorId]?.alive) e.mentorId = Object.values(state.world.characters).find(mentor => mentor.alive && mentor.age >= 20 && mentor.id !== c.id && mentor.occupation.careerId === def.mentorCareer)?.id;
        e.progress = clamp(e.progress + 8 + Math.min(8, investment));
        if (e.progress >= 100 && c.age >= def.completionAge && state.world.currentYear - (e.startedYear ?? state.world.currentYear - def.years) >= def.years) {
          e.qualifications = [...new Set([...e.qualifications, ...def.qualifications])];
          e.history.push({ track: e.track, year: state.world.currentYear, outcome: 'completed' }); e.track = null;
        }
      }
    }
  }
}
