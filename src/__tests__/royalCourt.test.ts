import { createLife, cloneState, syncPlayerToWorld } from '@/engine/gameState';
import { resolveCourtOpposition, dueCourtEvent } from '@/engine/courtPolitics';
import { gameReducer } from '@/state/gameReducer';
import { courtAvailability, reconcileCourt, tickCourt, applyCourtScandal } from '@/engine/courtEngine';
import { recogniseRuler, addRoyalClaim, settleRoyalSuccession } from '@/engine/royalSuccessionEngine';
import { spawnKin } from '@/engine/kinFactory';
import { normalizeGameState } from '@/state/persistence';
import { worldIntegrityIssues } from '@/engine/worldIntegrity';
import { runWithWorldRng } from '@/engine/random';

function royal() {
  const s = createLife({ worldSeed: 301, lifetimeUnlocked: true, birthOrigin: 'royal' });
  s.age = s.world.characters[s.playerCharacterId].age = 20;
  const p = s.world.characters[s.playerCharacterId];
  p.factionInfluence = 80; s.world.factions.crown.playerStanding = 40;
  return s;
}
function crown() {
  const s = royal(); const court = s.world.court!;
  court.heirId = s.playerCharacterId;
  s.world.characters[court.rulerId].alive = false;
  settleRoyalSuccession(s);
  return s;
}
describe('persistent royal court', () => {
  it('creates valid unique councillors and royal children with competing claims', () => {
    const s = royal(), court = s.world.court!;
    expect(court.rulerId).toBe('father');
    expect(s.rankIdx).toBe(3);
    expect(court.claims.some(c => c.characterId === s.playerCharacterId && c.basis === 'birth')).toBe(true);
    expect(court.heirId).not.toBe(s.playerCharacterId);
    expect(new Set(Object.values(court.offices)).size).toBe(Object.keys(court.offices).length);
    expect(worldIntegrityIssues(s)).toEqual([]);
  });
  it('legitimate succession recognises exactly one ruler and retains the court', () => {
    const s = crown(), court = s.world.court!;
    expect(court.rulerId).toBe(s.playerCharacterId);
    expect(s.rankIdx).toBe(5);
    expect(Object.values(s.world.characters).filter(c => c.alive && c.rankIdx === 5)).toHaveLength(1);
    const before = JSON.stringify(court);
    syncPlayerToWorld(s);
    const loaded = normalizeGameState(cloneState(s));
    expect(JSON.stringify(loaded.world.court)).toBe(before);
  });
  it.each(['recognise_claim', 'takeover', 'regency_claim'] as const)('gates %s and the central recognition primitive', action => {
    const s = royal(); s.lifetimeUnlocked = false; s.world.court!.legitimacy = 0;
    expect(courtAvailability(s, action)).toMatch(/Premium/);
    expect(recogniseRuler(s, s.playerCharacterId, 'forged call')).toBe(false);
    s.world.characters.father.alive = false;
    settleRoyalSuccession(s);
    expect(s.world.court!.rulerId).not.toBe(s.playerCharacterId);
  });
  it('does not forge a genealogical or marital claim', () => {
    const s = royal();
    expect(addRoyalClaim(s, 'joan', 'father', 'birth', 100)).toBe(false);
    expect(addRoyalClaim(s, 'joan', 'father', 'marriage', 100)).toBe(false);
  });
  it('allows a free courtier to contest an office without a title', () => {
    let s = createLife({ birthOrigin: 'peasant', worldSeed: 42 }); s.age = 30;
    const p = s.world.characters[s.playerCharacterId];
    p.education!.qualifications.push('court_education'); p.factionInfluence = 30;
    s.world.factions.crown.playerStanding = 15;
    s = gameReducer(s, { type: 'COURT', action: 'petition', office: 'chancellor' });
    expect(s.world.court!.offices.chancellor).not.toBe(s.playerCharacterId);
    const { eventById } = require('@/engine/eventPicker');
    s = gameReducer(s, { type: 'CHOOSE',choice: eventById(s.pendingEvent!.eventId).choices[0] });
    expect(s.world.court!.petition!.resolved).toBe(true);
    expect(s.rankIdx).toBe(0);
    expect(courtAvailability(s, 'tax_raise')).toMatch(/entitled adult ruler/);
  });
  it('charges royal decisions once, moves factions and leaves delayed consequences', () => {
    let s = crown(); const treasury = s.world.court!.treasury;
    s = gameReducer(s, { type: 'COURT', action: 'tax_raise' });
    expect(s.world.court!.treasury).toBe(treasury + 25);
    expect(s.world.factions.commons.playerStanding).toBe(-12);
    expect(s.world.scheduledConsequences.some(c => c.explanation.includes('levy'))).toBe(true);
    expect(gameReducer(s, { type: 'COURT', action: 'tax_raise' })).toEqual(s);
  });
  it('rejects double office holding and removes dead officials', () => {
    let s = crown(); const treasurer = s.world.court!.offices.treasurer!;
    expect(courtAvailability(s, 'appoint', treasurer, 'marshal')).toMatch(/one council office/);
    s.world.characters[treasurer].alive = false; reconcileCourt(s);
    expect(s.world.court!.offices.treasurer).toBeUndefined();
  });
  it('resolves real scandals and prevents duplicate recovery', () => {
    const s = crown(), court = s.world.court!, official = court.offices.chancellor!;
    court.scandals.push({ actorId: official, office: 'chancellor', amount: 40, exposed: false });
    const treasury = court.treasury;
    applyCourtScandal(s, 'investigate'); applyCourtScandal(s, 'investigate');
    expect(court.treasury).toBe(treasury + 20);
    expect(court.offices.chancellor).toBeUndefined();
    expect(court.scandals[0].exposed).toBe(true);
  });
  it('creates a childhood regency and ends it when the ruler comes of age', () => {
    const s = royal(); const court = s.world.court!;
    s.age = s.world.characters[s.playerCharacterId].age = 10;
    court.heirId = s.playerCharacterId; s.world.characters.father.alive = false;
    settleRoyalSuccession(s);
    expect(court.regentId).toBeDefined();
    expect(courtAvailability(s, 'tax_raise')).toMatch(/sixteen/);
    s.age = s.world.characters[s.playerCharacterId].age = 16;
    reconcileCourt(s); expect(court.regentId).toBeUndefined();
  });
  it('can depose an unpopular ruler and preserve an exiled aftermath', () => {
    const s = crown(), court = s.world.court!;
    court.legitimacy = 0; s.world.conditions.publicOrder = 0; s.world.currentYear++;
    runWithWorldRng(s.world, () => tickCourt(s));
    expect(court.rulerId).toBe(s.playerCharacterId);
    expect(dueCourtEvent(s)).toBe('court_opposition_audience');
    resolveCourtOpposition(s, 'assert');
    s.world.currentYear++;
    runWithWorldRng(s.world, () => tickCourt(s));
    expect(court.rulerId).not.toBe(s.playerCharacterId);
    expect(s.rankIdx).toBe(3);
    expect(s.world.characters[s.playerCharacterId].legalState!.status).toBe('exiled');
    expect(Object.values(s.world.characters).filter(c => c.alive && c.rankIdx === 5)).toHaveLength(1);
  });
  it('ends a sample on heir continuation while retaining claims and court problems', () => {
    const s = crown(), court = s.world.court!;
    const heir = spawnKin(s, { kind: 'child', age: 18 });
    reconcileCourt(s); court.heirId = heir.id;
    const official = court.offices.chancellor!;
    court.scandals.push({ actorId: official, office: 'chancellor', amount: 25, exposed: false });
    s.dead = true; s.nextLifePremiumAccess = false;
    const next = gameReducer(s, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
    expect(next.lifetimeUnlocked).toBe(false);
    expect(next.rankIdx).toBeLessThan(4);
    expect(next.world.court!.rulerId).not.toBe(heir.id);
    expect(next.world.court!.claims.some(c => c.characterId === heir.id)).toBe(true);
    expect(next.world.court!.scandals).toHaveLength(1);
    expect(gameReducer(next, { type: 'CONTINUE_AS_HEIR' })).toEqual(next);
  });
});

it('existing royal events name real claimants and credit the royal treasury', () => {
  const { eventById } = require('@/engine/eventPicker');
  let s = crown();
  const children = [...(s.world.characters[s.playerCharacterId].childIds ?? [])];
  const heirEvent = eventById('monarch_heir_question');
  s.pendingEvent = { eventId: heirEvent.id };
  s = gameReducer(s, { type: 'CHOOSE', choice: heirEvent.choices[0] });
  expect(s.world.court!.heirId).toBeDefined();
  expect(s.world.characters[s.playerCharacterId].childIds ?? []).toEqual(children);
  s.world.court!.treasury = 10;
  const privateGold = s.gold, treasuryEvent = eventById('monarch_empty_treasury');
  s.pendingEvent = { eventId: treasuryEvent.id };
  s = gameReducer(s, { type: 'CHOOSE', choice: treasuryEvent.choices[0] });
  expect(s.world.court!.treasury).toBe(55);
  expect(s.gold).toBe(privateGold);
});

it('keeps the recognised crown authoritative when legacy code writes the rank adapter', () => {
  const s = crown();
  s.rankIdx = 4;
  s.world.characters[s.playerCharacterId].socialStatus!.estate = 'baronial';
  reconcileCourt(s);
  expect(s.rankIdx).toBe(5);
  expect(s.world.characters[s.playerCharacterId].socialStatus!.estate).toBe('royal');
  expect(s.world.court!.rulerId).toBe(s.playerCharacterId);
});
