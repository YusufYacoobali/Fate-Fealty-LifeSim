import type { EducationTrackId, Effects, GameState, WorldCharacter } from '@/types/game';
import { educationTrack } from '@/data/education';
import { emptyEducation } from './lifeDepthState';
import { spawnKin } from './kinFactory';
import { addMoney, pushFeed } from './gameState';
import { grantSkillXp, skillLevel } from './rpgProgress';
import { applyRelationshipShift } from './relationshipState';
import { appendCharacterMemory } from './worldJournal';
import { timedActionAvailability } from './actionClock';
import { clamp } from './random';

export type EducationAction = 'enrol' | 'study' | 'practise' | 'mentor' | 'challenge' | 'bully' | 'cheat' | 'skip' | 'scholarship' | 'graduate' | 'leave';
export function educationOf(character: WorldCharacter) { return character.education ??= emptyEducation(); }
export function educationFee(state: GameState, track: EducationTrackId): number {
  const p = state.world.characters[state.playerCharacterId];
  return educationOf(p).scholarship || educationTrack(track).origins.includes(p.background?.origin ?? 'peasant') ? 0 : educationTrack(track).fee;
}
export function educationAvailability(state: GameState, action: EducationAction, track?: EducationTrackId): string | null {
  const time = timedActionAvailability(state);
  if (!time.available) return time.reason!;
  if (state.age < 5) return 'Learning begins at age 5';
  const e = educationOf(state.world.characters[state.playerCharacterId]);
  if (e.actionsYear === state.world.currentYear && e.actionsUsed >= 3) return 'Three learning opportunities per year';
  if (action === 'scholarship') return e.scholarship ? 'Already sponsored' : null;
  if (action === 'enrol') {
    if (!track) return 'Choose a learning path';
    const def = educationTrack(track);
    if (!def) return 'Unknown learning path';
    if (e.track) return 'Leave or complete your current learning first';
    if (state.age < def.minAge) return `Begins at age ${def.minAge}`;
    if (def.qualifications.every(q => e.qualifications.includes(q))) return 'Already qualified';
    if (state.gold < educationFee(state, track)) return `Needs ${educationFee(state, track)}g or a scholarship`;
    return null;
  }
  if (!e.track) return 'Choose a learning path first';
  if (action === 'graduate') {
    const def = educationTrack(e.track);
    if (e.progress < 100) return 'Needs 100 learning progress';
    if (state.age < def.completionAge) return `Complete at age ${def.completionAge}`;
    if (state.world.currentYear - (e.startedYear ?? state.world.currentYear) < def.years) return `Requires ${def.years} years of training`;
    if (e.misconduct >= 50) return 'Repair your conduct with your mentor';
  }
  return null;
}
function recoverEducationActors(state: GameState): void {
  const p = state.world.characters[state.playerCharacterId], e = educationOf(p);
  if (!e.track) return;
  const def = educationTrack(e.track);
  if (!e.mentorId || !state.world.characters[e.mentorId]?.alive) {
    const mentor = Object.values(state.world.characters).find(c => c.id !== p.id && c.alive && c.age >= 20 && c.id !== e.classmateIds[0] && c.occupation.careerId === def.mentorCareer)
      ?? spawnKin(state, { kind: 'acquaintance', age: 35, role: `${def.name} mentor`, bio: 'A patient teacher whose fees include the right to complain.' });
    mentor.occupation.careerId = def.mentorCareer;
    e.mentorId = mentor.id;
  }
  e.classmateIds = e.classmateIds.filter(id => state.world.characters[id]?.alive);
  if (!e.classmateIds.length) {
    const peer = Object.values(state.world.characters).find(c => c.id !== p.id && c.id !== e.mentorId && c.alive && Math.abs(c.age - state.age) <= 3 && c.id !== 'goose')
      ?? spawnKin(state, { kind: 'acquaintance', age: state.age, role: 'Fellow learner', bio: 'Your fellow learner keeps careful count of every slight and every favour.' });
    e.classmateIds.push(peer.id);
  }
}
export function applyEducationEffect(state: GameState, effect: NonNullable<Effects['education']>): void {
  const p = state.world.characters[state.playerCharacterId], e = educationOf(p);
  if (!e.track) return;
  recoverEducationActors(state);
  e.progress = clamp(e.progress + (effect.progress ?? 0));
  e.misconduct = clamp(e.misconduct + (effect.misconduct ?? 0));
  if (effect.scholarship) e.scholarship = true;
  if (e.mentorId && effect.mentorBond) applyRelationshipShift(state, e.mentorId, { affinity: effect.mentorBond }, { affinity: effect.mentorBond, trust: effect.mentorBond });
  const peerId = e.classmateIds[0];
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
export function performEducationAction(state: GameState, action: EducationAction, track?: EducationTrackId): GameState {
  if (educationAvailability(state, action, track)) return state;
  const e = educationOf(state.world.characters[state.playerCharacterId]);
  if (e.actionsYear !== state.world.currentYear) { e.actionsYear = state.world.currentYear; e.actionsUsed = 0; }
  e.actionsUsed++;
  if (action === 'scholarship') {
    e.scholarship = true;
    state.world.factions.church.playerStanding += 2;
    pushFeed(state, 'PATRONAGE', '#365f88', 'You earn a bursary by copying the parish’s burial accounts. The dead make patient schoolfellows. Tuition is now covered, including later study.', 'good');
    return state;
  }
  if (action === 'enrol') {
    addMoney(state, -educationFee(state, track!));
    Object.assign(e, { track: track!, progress: 0, misconduct: 0, startedYear: state.world.currentYear, classmateIds: [] });
    recoverEducationActors(state);
    const mentor = state.world.characters[e.mentorId!];
    pushFeed(state, 'LEARNING', '#365f88', `You begin ${educationTrack(track!).name.toLowerCase()} with ${mentor.name}. Your fellow learner is ${state.world.characters[e.classmateIds[0]].name}.`, 'good');
    return state;
  }
  recoverEducationActors(state);
  const def = educationTrack(e.track!);
  const mentor = state.world.characters[e.mentorId!];
  if (action === 'graduate') {
    e.qualifications = [...new Set([...e.qualifications, ...def.qualifications])];
    e.history.push({ track: def.id, year: state.world.currentYear, outcome: 'completed' });
    e.track = null;
    if (def.id === 'martial') state.world.characters[state.playerCharacterId].socialStatus!.martialHonour = 'page';
    pushFeed(state, 'QUALIFIED', '#387245', `${mentor.name} signs your record: ${def.qualifications.map(q => q.replaceAll('_', ' ')).join(', ')}. Employers may listen; none has promised a place.`, 'good');
    return state;
  }
  if (action === 'leave') { e.history.push({ track: def.id, year: state.world.currentYear, outcome: 'left' }); e.track = null; return state; }
  const gain = 12 + skillLevel(state, def.skill) + Math.floor(mentor.rel / 20);
  const effects: Partial<Record<EducationAction, NonNullable<Effects['education']>>> = {
    study: { progress: gain, mentorBond: 2 }, practise: { progress: gain + 3 }, mentor: { progress: 9, misconduct: -20, mentorBond: 8 },
    challenge: { progress: 10, peerBond: mentor.rel >= 50 ? 4 : -5 }, bully: { progress: 2, misconduct: 25, peerBond: -25, mentorBond: -10 },
    cheat: { progress: 18, misconduct: 30, peerBond: -15, mentorBond: -12 }, skip: { progress: -6, misconduct: 15, mentorBond: -8 },
  };
  applyEducationEffect(state, effects[action]!);
  if (action !== 'skip' && action !== 'bully' && action !== 'cheat') grantSkillXp(state, def.skill, 8, def.name.toLowerCase());
  const lines: Partial<Record<EducationAction, string>> = {
    study: `You work through ${mentor.name}'s examples. The margins contain three corrections and a small drawing of your execution.`,
    practise: 'You repeat the difficult work until your hands understand what your head has been pretending to know.',
    mentor: `${mentor.name} explains the error privately. You repair your conduct as well as your work.`,
    challenge: `You test your work against ${state.world.characters[e.classmateIds[0]].name}. The result becomes a topic of conversation for years.`,
    bully: `You humiliate ${state.world.characters[e.classmateIds[0]].name} before the class. Their silence is not forgiveness.`,
    cheat: `You pass off ${state.world.characters[e.classmateIds[0]].name}'s work as yours. Your mentor recognises the handwriting.`,
    skip: 'You spend the lesson by the river. Your mentor adds your absence to a much less pleasant lesson.' };
  pushFeed(state, 'LEARNING', '#365f88', lines[action]!, ['bully', 'cheat', 'skip'].includes(action) ? 'bad' : 'good');
  return state;
}
export function tickEducation(state: GameState): void {
  for (const c of Object.values(state.world.characters)) {
    if (!c.alive) continue;
    const e = educationOf(c);
    if (c.id === state.playerCharacterId) {
      if (e.track) { recoverEducationActors(state); e.progress = clamp(e.progress + (e.misconduct < 50 ? 5 : 0)); }
      if (state.age >= 18 && !e.comingOfAge) {
        e.comingOfAge = true;
        pushFeed(state, 'COMING OF AGE', '#7a4f9a', `You enter adulthood with ${e.qualifications.length ? e.qualifications.map(q => q.replaceAll('_', ' ')).join(', ') : 'no formal qualification'}. ${e.classmateIds.map(id => state.world.characters[id]?.name).filter(Boolean).join(' and ') || 'The people of your household'} will remember how you got here. Later study remains open.`, 'plain');
      }
    } else if (c.age >= 5 && c.age <= 18 && (c.childDevelopment?.investment ?? 0) > 0) {
      e.track ??= c.childDevelopment?.education === 'martial' ? 'martial' : c.childDevelopment?.education === 'court' ? 'noble' : 'parish';
      e.progress = clamp(e.progress + 8 + Math.min(8, c.childDevelopment!.investment));
      if (e.progress >= 100 && c.age >= educationTrack(e.track).completionAge) {
        e.qualifications = [...new Set([...e.qualifications, ...educationTrack(e.track).qualifications])];
        e.history.push({ track: e.track, year: state.world.currentYear, outcome: 'completed' }); e.track = null;
      }
    }
  }
}
