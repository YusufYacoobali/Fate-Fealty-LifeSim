import { createLife, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer, GameAction } from '@/state/gameReducer';
import { GameState, BirthOriginId, EducationTrackId } from '@/types/game';
import { educationAvailability } from '@/engine/educationEngine';
import { eventById } from '@/engine/eventPicker';
import { careerActionAvailability } from '@/engine/careerEngine';
import { dueProfessionalEventId } from '@/engine/careerSpecializationEngine';
import { normalizeGameState } from '@/state/persistence';
import { spawnKin, killKin } from '@/engine/kinFactory';
import { tickCourt } from '@/engine/courtEngine';
import { runWithWorldRng } from '@/engine/random';

// Controlled annual fixtures isolate the six gameplay contracts from unrelated
// plague/death lotteries. The full-soak suite runs the actual annual director.
function nextYear(s: GameState): GameState {
  s.age++; s.world.currentYear++;
  for (const c of Object.values(s.world.characters)) if (c.id !== s.playerCharacterId && c.alive) c.age++;
  s.actionClock.used = 0; s.occupation.workedThisYear = 0;
  syncPlayerToWorld(s);
  return s;
}
function act(s: GameState, action: GameAction): GameState { return gameReducer(s, action); }
function resolve(s: GameState, index = 0): GameState {
  const event = eventById(s.pendingEvent!.eventId)!;
  return act(s, { type: 'CHOOSE', choice: event.choices[index] });
}
function learn(s: GameState, track: EducationTrackId): GameState {
  s = act(s, { type: 'EDUCATION', action: 'scholarship' });
  s = act(s, { type: 'EDUCATION', action: 'enrol', track });
  for (let year = 0; year < 18; year++) {
    if (!educationAvailability(s, 'graduate')) return act(s, { type: 'EDUCATION', action: 'graduate' });
    for (let i = 0; i < 3; i++) s = act(s, { type: 'EDUCATION', action: 'study' });
    s = nextYear(s);
  }
  throw new Error('Education did not become completable');
}
function born(origin: BirthOriginId, premium = false): GameState {
  return createLife({ worldSeed: 301, birthOrigin: origin, birthTraitId: 'bookish', lifetimeUnlocked: premium });
}
describe('specified life-depth acceptance scenarios', () => {
  it('A: peasant to respected physician through a bursary and real practice, without nobility', () => {
    let s = born('peasant'); while (s.age < 5) s = nextYear(s);
    s.gold = 0; s = learn(s, 'parish');
    expect(s.world.characters[s.playerCharacterId].education!.qualifications).toContain('literacy');
    s = act(s, { type: 'CAREER_ACTION', action: 'apply', careerId: 'herb_gatherer' });
    for (; s.age < 28; s = nextYear(s)) {
      if (s.stats.health < 70) for (let i = 0; i < 2; i++) s = act(s, { type: 'DO_ACTIVITY', id: 'rest' });
      for (let i = 0; i < 3; i++) s = act(s, { type: 'CAREER_ACTION', action: 'work' });
      for (let i = 0; i < 2; i++) s = act(s, { type: 'CAREER_ACTION', action: 'train' });
      for (const id of ['diagnose_patient','treat_household']) s = act(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: id });
      const record = s.world.characters[s.playerCharacterId].professionalHistory!.medicine!;
      if (s.age === 18) {
        s = act(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'noble_fever' });
        s = resolve(s, 2);
      }
      const followup = dueProfessionalEventId(s);
      if (followup && followup.endsWith('_verdict')) { s.pendingEvent = { eventId: followup }; s = resolve(s); }
      if (careerActionAvailability(s, 'promote').available) s = act(s, { type: 'CAREER_ACTION', action: 'promote' });
      expect(s.rankIdx).toBe(0);
    }
    expect(s.occupation.careerId).toBe('physician');
    expect(s.world.characters[s.playerCharacterId].professionalHistory!.medicine!.milestones).toContain('recognised_practice');
  });
  it('B: a merchant heir inherits household credit, the same rival and an unfinished commercial dispute', () => {
    let s = born('merchant'); s.age = 25; s.occupation.careerId = 'hawker';
    for (const id of ['negotiate_deal','commercial_rival','wool_mark']) s = act(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: id });
    s = resolve(s);
    const old = s.world.characters[s.playerCharacterId].professionalHistory!.trade!;
    const heir = spawnKin(s, { kind: 'child', age: 18 }); s.dead = true;
    s = act(s, { type: 'CONTINUE_AS_HEIR', heirId: heir.id, lifetimeUnlocked: false });
    const record = s.world.characters[heir.id].professionalHistory!.trade!;
    expect(record.rivalId).toBe(old.rivalId);
    expect(record.reputation).toBe(Math.floor(old.reputation / 2));
    expect(record.matters[0].resolved).toBe(false);
    s = nextYear(s);
    expect(dueProfessionalEventId(s)).toBe('profession_wool_mark_verdict');
    s.pendingEvent = { eventId: dueProfessionalEventId(s)! }; s = resolve(s);
    expect(s.world.characters[heir.id].professionalHistory!.trade!.milestones).toContain('commercial_legacy');
  });
  it('C: a noble school rival becomes the same rival in adult court work', () => {
    let s = born('noble'); while (s.age < 5) s = nextYear(s);
    s = act(s, { type: 'EDUCATION', action: 'enrol', track: 'noble' });
    const peer = s.world.characters[s.playerCharacterId].education!.classmateIds[0];
    s = act(s, { type: 'EDUCATION', action: 'bully' });
    s = act(s, { type: 'EDUCATION', action: 'mentor' });
    for (let i = 0; i < 15 && s.world.characters[s.playerCharacterId].education!.track; i++) {
      s = nextYear(s);
      for (let j = 0; j < 2; j++) s = act(s, { type: 'EDUCATION', action: 'study' });
      if (!educationAvailability(s, 'graduate')) s = act(s, { type: 'EDUCATION', action: 'graduate' });
    }
    s.occupation.careerId = 'clerk';
    s = act(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'seek_patron' });
    expect(s.world.characters[s.playerCharacterId].professionalHistory!.court!.rivalId).toBe(peer);
    expect(s.world.characters[peer].worldMemories!.some(m => m.type === 'school_grudge')).toBe(true);
    syncPlayerToWorld(s); s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(s.world.characters[s.playerCharacterId].education!.qualifications).toContain('court_education');
  });
  it('D: an entitled royal child faces senior claims and inherits only through succession', () => {
    let s = born('royal', true); s.age = s.world.characters[s.playerCharacterId].age = 20;
    expect(s.world.court!.heirId).not.toBe(s.playerCharacterId);
    const senior = s.world.court!.heirId!; killKin(s, senior); killKin(s, 'father');
    expect(s.world.court!.rulerId).toBe(s.playerCharacterId);
    const funds = s.world.court!.treasury;
    s = act(s, { type: 'COURT', action: 'religion' });
    expect(s.world.court!.treasury).toBe(funds - 15);
    expect(s.world.conditions.religiousTension).toBe(20);
  });
  it('E: a failed monarch loses the throne after corrupt appointments and faction opposition', () => {
    let s = born('royal', true); s.age = s.world.characters[s.playerCharacterId].age = 30;
    killKin(s, s.world.court!.heirId!); killKin(s, 'father');
    const corrupt = s.world.characters.roderick; corrupt.personalityTraits = ['cunning','ambitious']; corrupt.stats.wits = 20;
    s = act(s, { type: 'COURT', action: 'appoint', targetId: corrupt.id, office: 'chancellor' });
    s = act(s, { type: 'COURT', action: 'tax_raise' });
    expect(s.world.factions.commons.playerStanding).toBeLessThan(0);
    s.world.court!.legitimacy = 0; s.world.conditions.publicOrder = 0; s.world.currentYear++;
    runWithWorldRng(s.world, () => tickCourt(s));
    expect(s.world.court!.rulerId).not.toBe(s.playerCharacterId);
    expect(s.world.characters[s.playerCharacterId].legalState!.status).toBe('exiled');
    expect(s.dead).toBe(false);
  });
  it('F: a free courtier earns influence and an office, while every crown route remains closed', () => {
    let s = born('peasant'); s.age = 30; s.occupation.careerId = 'clerk';
    s.world.characters[s.playerCharacterId].education!.qualifications = ['literacy', 'court_education'];
    const ruler = s.world.court!.rulerId;
    s = act(s, { type: 'COURT', action: 'patron', targetId: ruler });
    s = act(s, { type: 'COURT', action: 'advise' }); s = nextYear(s);
    s = act(s, { type: 'COURT', action: 'patron', targetId: ruler });
    s = act(s, { type: 'COURT', action: 'petition', office: 'chancellor' });
    expect(s.world.court!.offices.chancellor).toBe(s.playerCharacterId);
    for (const action of ['recognise_claim','takeover','regency_claim'] as const) s = act(s, { type: 'COURT', action });
    expect(s.world.court!.rulerId).toBe(ruler);
    expect(s.rankIdx).toBe(0);
  });
});
