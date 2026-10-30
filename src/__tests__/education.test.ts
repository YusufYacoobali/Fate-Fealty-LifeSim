import { createLife, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { EDUCATION_TRACKS } from '@/data/education';
import { educationAvailability, applyEducationEffect } from '@/engine/educationEngine';
import { normalizeGameState } from '@/state/persistence';
import { spawnKin } from '@/engine/kinFactory';
import { EDUCATION_EVENTS } from '@/content/educationEvents';
import { eventById } from '@/engine/eventPicker';

describe('playable education', () => {
  it.each(EDUCATION_TRACKS)('$id has a complete, saved learning loop and persistent actors', track => {
    let s = createLife({ worldSeed: 33, birthOrigin: 'peasant' });
    s.age = 20;
    s.gold = 200;
    s = gameReducer(s, { type: 'EDUCATION', action: 'enrol', track: track.id });
    const e = s.world.characters[s.playerCharacterId].education!;
    const mentor = e.mentorId!, peer = e.classmateIds[0];
    for (let i = 0; i < 8; i++) {
      s.world.currentYear++;
      s.actionClock.used = 0;
      for (let j = 0; j < 3; j++) s = gameReducer(s, { type: 'EDUCATION', action: 'practise' });
      syncPlayerToWorld(s);
      s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    }
    s.world.currentYear++; s.actionClock.used = 0;
    expect(educationAvailability(s, 'graduate')).toBeNull();
    s = gameReducer(s, { type: 'EDUCATION', action: 'graduate' });
    expect(s.world.characters[s.playerCharacterId].education!.qualifications).toEqual(expect.arrayContaining(track.qualifications));
    expect(s.world.characters[mentor].alive).toBe(true);
    expect(s.world.characters[peer].id).toBe(peer);
    s.occupation.careerId = 'farmhand';
    expect(s.world.characters[s.playerCharacterId].education!.qualifications).toEqual(expect.arrayContaining(track.qualifications));
  });
  it('spends one action, caps school actions, and rejects repeated taps without reward', () => {
    let s = createLife({ worldSeed: 5, birthOrigin: 'peasant' }); s.age = 10;
    s = gameReducer(s, { type: 'EDUCATION', action: 'enrol', track: 'household' });
    expect(s.actionClock.used).toBe(1);
    s = gameReducer(s, { type: 'EDUCATION', action: 'study' });
    s = gameReducer(s, { type: 'EDUCATION', action: 'study' });
    const before = JSON.stringify(s);
    expect(JSON.stringify(gameReducer(s, { type: 'EDUCATION', action: 'study' }))).toBe(before);
  });
  it('records grudges and can dismiss misconduct without erasing qualifications', () => {
    let s = createLife({ worldSeed: 23, birthOrigin: 'artisan' }); s.age = 10;
    s = gameReducer(s, { type: 'EDUCATION', action: 'enrol', track: 'guild' });
    const e = s.world.characters[s.playerCharacterId].education!;
    e.qualifications.push('literacy'); const peer = e.classmateIds[0];
    applyEducationEffect(s, { misconduct: 90, peerBond: -30 });
    expect(e.track).toBeNull();
    expect(e.qualifications).toContain('literacy');
    expect(s.world.characters[peer].worldMemories?.some(m => m.type === 'school_grudge')).toBe(true);
  });
  it('continues an educated heir in the same social world', () => {
    const s = createLife({ worldSeed: 42 });
    const heir = spawnKin(s, { kind: 'child', age: 18 });
    heir.education!.qualifications = ['literacy', 'court_education'];
    s.dead = true;
    const next = gameReducer(s, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
    expect(next.world.characters[heir.id].education!.qualifications).toContain('court_education');
    expect(next.world.worldSeed).toBe(s.world.worldSeed);
  });
  it('registers four authored encounters for every learning route', () => {
    for (const track of EDUCATION_TRACKS) {
      const events = EDUCATION_EVENTS.filter(e => e.id.startsWith(`education_${track.id}_`));
      expect(events).toHaveLength(4);
      for (const event of events) expect(eventById(event.id)).toBeDefined();
    }
  });
});

it('classmates have their own canonical learning records and finish before heir control', () => {
  const { tickEducation } = require('@/engine/educationEngine');
  let s = createLife({ worldSeed: 141, birthOrigin: 'artisan' }); s.age = 10;
  s = gameReducer(s, { type: 'EDUCATION', action: 'enrol', track: 'guild' });
  const p = s.world.characters[s.playerCharacterId];
  const peer = s.world.characters[p.education!.classmateIds[0]];
  expect(peer.education!.track).toBe('guild');
  expect(peer.education!.classmateIds).toContain(p.id);
  for (let year = 0; year < 10; year++) { s.world.currentYear++; peer.age++; tickEducation(s); }
  expect(peer.education!.qualifications).toContain('apprenticeship');
  expect(peer.education!.history.filter(h => h.track === 'guild' && h.outcome === 'completed')).toHaveLength(1);
});
