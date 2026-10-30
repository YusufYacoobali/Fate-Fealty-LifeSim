import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { CAREER_SPECIALIZATIONS } from '@/data/careerSpecializations';
import { ENTRY_CAREERS, careerAvailability, careerById } from '@/data/careers';
import { specializationAvailability } from '@/engine/careerSpecializationEngine';

describe('professional gameplay', () => {
  it.each(ENTRY_CAREERS)('$family exposes three different actions with persistent outcomes', career => {
    let s = createLife({ worldSeed: 27, birthOrigin: 'peasant' });
    Object.assign(s, { age: 35, gold: 100, occupation: { careerId: career.id, experience: 100, performance: 80, workedThisYear: 0 } });
    const actions = CAREER_SPECIALIZATIONS.filter(a => a.family === career.family && !a.story);
    expect(actions).toHaveLength(3);
    const originalRank = s.rankIdx;
    for (const a of actions) {
      expect(specializationAvailability(s, a.id)).toBeNull();
      const used = s.actionClock.used;
      s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: a.id });
      expect(s.actionClock.used).toBe(used + 1);
      const record = s.world.characters[s.playerCharacterId].professionalHistory![career.family]!;
      expect(record.completedActions).toContain(a.id);
      expect(record.contactIds.every(id => !!s.world.characters[id])).toBe(true);
      expect(record.rivalId).toBeDefined();
      const repeated = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: a.id });
      expect(repeated).toEqual(s);
    }
    expect(s.rankIdx).toBe(originalRank);
    const record = s.world.characters[s.playerCharacterId].professionalHistory![career.family]!;
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'resign' });
    expect(s.world.characters[s.playerCharacterId].professionalHistory![career.family]).toEqual(record);
  });
  it('requires actual milestones as well as experience for promotion', () => {
    let s = createLife({ worldSeed: 2, birthOrigin: 'peasant' });
    s.age = 30; s.gold = 100; s.stats.wits = 100;
    s.occupation = { careerId: 'herb_gatherer', experience: 200, performance: 100, workedThisYear: 0 };
    s.world.characters[s.playerCharacterId].education!.qualifications.push('literacy');
    expect(careerAvailability(s, careerById('barber_surgeon')!)).toMatch(/milestone/);
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'diagnose_patient' });
    expect(careerAvailability(s, careerById('barber_surgeon')!)).toBeNull();
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'promote' });
    expect(s.occupation.careerId).toBe('barber_surgeon');
    expect(s.rankIdx).toBe(0);
  });
  it('physicians affect a real patient and craft creates a real apprentice', () => {
    let s = createLife({ worldSeed: 4, birthOrigin: 'peasant' });
    s.age = 30; s.gold = 100; s.occupation.careerId = 'herb_gatherer';
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'diagnose_patient' });
    const id = s.world.characters[s.playerCharacterId].professionalHistory!.medicine!.contactIds[0];
    const health = s.world.characters[id].stats.health;
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'treat_household' });
    expect(s.world.characters[id].stats.health).toBeGreaterThan(health);
    s.occupation.careerId = 'apprentice';
    s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: 'train_apprentice' });
    const apprentice = s.world.characters[s.playerCharacterId].professionalHistory!.craft!.apprenticeId!;
    expect(s.world.characters[apprentice].education!.mentorId).toBe(s.playerCharacterId);
  });
});
