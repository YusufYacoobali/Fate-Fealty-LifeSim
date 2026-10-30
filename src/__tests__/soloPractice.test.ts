import { makeState } from './helpers';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { armsPracticeAvailability, combatChoiceReason } from '@/engine/duelEngine';
import { combatPresentation } from '@/engine/combatPresentation';
import { skillsOf } from '@/engine/rpgProgress';
import { forgeAvailability } from '@/engine/forgeEngine';
import { Attack } from '@/types/rpg';

function ready() { return makeState({ age: 24, gold: 50, lifetimeUnlocked: true }); }
function start(s = ready()) { return gameReducer(s, { type: 'ARMS_PRACTICE_START', revision: s.rpg.revision }); }
function swing(s: ReturnType<typeof ready>, move: Attack = 'quick', offsetMs = 0) {
  s = gameReducer(s, { type: 'COMBAT_SELECT', fightId: s.duel!.combat!.id, sequence: s.duel!.combat!.sequence, move });
  return gameReducer(s, { type: 'COMBAT_TIMING', fightId: s.duel!.combat!.id, sequence: s.duel!.combat!.sequence, offsetMs });
}

describe('solo Arms practice', () => {
  it('charges one action and completes five swings without an opponent, injury or combat rewards', () => {
    const before = ready(), gold = before.gold, health = before.stats.health, reputation = before.reputation;
    skillsOf(before).arms.xp = 18;
    let s = start(before);
    const startAction = { type: 'ARMS_PRACTICE_START' as const, revision: before.rpg.revision };
    s = gameReducer(s, startAction);
    expect(s.actionClock.used).toBe(1); expect(skillsOf(s).arms.xp).toBe(18);
    expect(s.duel!.combat).toMatchObject({ phase: 'attack', practice: true, solo: { completed: 0, xp: 0 } });
    for (let i = 0; i < 5; i++) {
      s = swing(s, i % 2 ? 'heavy' : 'feint', i % 2 ? 10000 : 0);
      expect(s.duel!.playerVigour).toBe(100); expect(s.duel!.opponentVigour).toBe(100);
      if (i < 4) { expect(s.duel!.combat!.phase).toBe('attack'); expect(s.duel!.outcome).toBeUndefined(); }
    }
    expect(s.duel!.combat!.solo).toEqual({ completed: 5, xp: 6 });
    expect(skillsOf(s).arms).toMatchObject({ level: 2, xp: 4 });
    expect(combatPresentation(s.duel!).scene).toBe('feint');
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    const id = s.duel!.combat!.id;
    s = gameReducer(s, { type: 'ARMS_PRACTICE_FINISH', fightId: id });
    s = gameReducer(s, { type: 'DUEL_CLOSE' });
    s = gameReducer(s, { type: 'DUEL_CLOSE' });
    expect(s.duel).toBeNull(); expect(s.tab).toBe('life');
    expect(skillsOf(s).arms).toMatchObject({ level: 2, xp: 4 });
    expect(s.gold).toBe(gold); expect(s.stats.health).toBe(health); expect(s.reputation).toBe(reputation);
    expect(s.actionClock.used).toBe(1);
    expect(s.feed.filter(f => f.tag === 'SWORD PRACTICE')).toHaveLength(1);
  });

  it('preserves committed timing on reload and ignores repeated/stale timing inputs', () => {
    let s = start();
    s = gameReducer(s, { type: 'COMBAT_SELECT', fightId: s.duel!.combat!.id, sequence: 0, move: 'heavy' });
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    const action = { type: 'COMBAT_TIMING' as const, fightId: s.duel!.combat!.id, sequence: s.duel!.combat!.sequence, offsetMs: 0 };
    const original = s;
    s = gameReducer(s, action);
    expect(original.duel!.combat!.solo!.completed).toBe(0);
    expect(s.duel!.combat!.solo!.completed).toBe(1);
    s = gameReducer(s, action);
    expect(s.duel!.combat!.solo!.completed).toBe(1); expect(s.actionClock.used).toBe(1);
    expect(combatPresentation(s.duel!)).toMatchObject({ scene: 'heavy', detail: 'PERFECT' });
    expect(combatChoiceReason(s, 'block')).toBe('Choose a practice swing');
    expect(combatChoiceReason(s, 'recover')).toBe('Choose a practice swing');
  });

  it('quick-finishes once during timing and rejects delayed callbacks from a previous session', () => {
    let s = start(); const id = s.duel!.combat!.id;
    s = gameReducer(s, { type: 'COMBAT_SELECT', fightId: id, sequence: 0, move: 'quick' });
    s = gameReducer(s, { type: 'ARMS_PRACTICE_FINISH', fightId: id });
    s = gameReducer(s, { type: 'COMBAT_TIMING', fightId: id, sequence: 1, offsetMs: 0 });
    expect(skillsOf(s).arms.xp).toBe(6);
    s = gameReducer(s, { type: 'DUEL_CLOSE' }); s = start(s);
    s = gameReducer(s, { type: 'ARMS_PRACTICE_FINISH', fightId: id });
    expect(s.duel!.outcome).toBeUndefined(); expect(skillsOf(s).arms.xp).toBe(6);
    expect(s.actionClock.used).toBe(2);
  });

  it('works even without another living adult in the village', () => {
    const s = ready();
    for (const p of Object.values(s.world.characters)) if (p.id !== s.playerCharacterId) p.alive = false;
    expect(start(s).duel!.combat!.solo).toBeDefined();
  });

  it('honours age, action, imprisonment, encounter, training-yard and maximum-level gates', () => {
    const young = ready(); young.age = 7; expect(start(young).duel).toBeNull();
    const full = ready(); full.actionClock.used = full.actionClock.cap; expect(start(full).duel).toBeNull();
    const jailed = ready(); jailed.tags.push('imprisoned'); expect(start(jailed).duel).toBeNull();
    const advanced = ready(); skillsOf(advanced).arms.level = 3;
    expect(armsPracticeAvailability(advanced)).toContain('training yard');
    advanced.holding.upgrades.push('training_yard'); expect(armsPracticeAvailability(advanced)).toBeNull();
    skillsOf(advanced).arms.level = 10; expect(start(advanced).duel).toBeNull();
    const busy = start(); const id = busy.duel!.combat!.id;
    expect(start(busy).duel!.combat!.id).toBe(id); expect(start(busy).actionClock.used).toBe(1);
    expect(forgeAvailability(busy, { kind: 'practice' })).toContain('encounter');
  });
});

describe('Craftsmanship training at the anvil', () => {
  it('levels advanced crafters, allows another paid-action session that year and never duplicates XP', () => {
    let s = ready(); skillsOf(s).craftsmanship = { level: 6, xp: 118 };
    s = gameReducer(s, { type: 'FORGE_START', task: { kind: 'practice' }, revision: s.rpg.revision });
    const firstId = s.rpg.forge!.id;
    s = gameReducer(s, { type: 'FORGE_QUICK', id: firstId });
    expect(skillsOf(s).craftsmanship).toMatchObject({ level: 7, xp: 4 });
    s = gameReducer(s, { type: 'FORGE_CLOSE', id: firstId });
    s = gameReducer(s, { type: 'FORGE_START', task: { kind: 'practice' }, revision: s.rpg.revision });
    const id = s.rpg.forge!.id;
    s = gameReducer(s, { type: 'FORGE_BEGIN', id });
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    for (let sequence = 0; sequence < 5; sequence++) {
      s = gameReducer(s, { type: 'FORGE_STRIKE', id, sequence, position: s.rpg.forge!.targets[sequence] });
    }
    s = gameReducer(s, { type: 'FORGE_QUICK', id });
    expect(skillsOf(s).craftsmanship).toMatchObject({ level: 7, xp: 10 });
    expect(s.actionClock.used).toBe(2); expect(s.rpg.forge!.bonusIron).toBe(0);
  });
});
