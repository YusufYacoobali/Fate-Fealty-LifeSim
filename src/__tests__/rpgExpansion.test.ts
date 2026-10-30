import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeState } from './helpers';
import { cloneState, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { loadGame, normalizeGameState, saveGame } from '@/state/persistence';
import { chooseMission, missionEvent, performRpgCommand, refreshWorkBoard, rpgAvailability } from '@/engine/rpgEngine';
import { freshSkills, RECIPES } from '@/data/rpg';
import { CONTRACTS, EXPEDITIONS, HOLDING_MISSIONS } from '@/content/rpgMissions';
import { equippedBonus, grantSkillXp, skillsOf } from '@/engine/rpgProgress';
import { combatChoiceReason, concludeDuel, resolveCombatTiming, selectCombatMove, startDuel, timingGrade, upgradeDuel } from '@/engine/duelEngine';
import { runWithWorldRng } from '@/engine/random';
import { spawnKin } from '@/engine/kinFactory';

function ready() {
  const s = makeState({ age: 24, gold: 200 });
  s.settings.liveForever = true; s.lifetimeUnlocked = true;
  s.rpg.materials = { timber: 30, stone: 30, iron: 30, herbs: 30 };
  s.world.characters[s.playerCharacterId].skills = freshSkills();
  syncPlayerToWorld(s); refreshWorkBoard(s); return s;
}
function safeResolve(s: ReturnType<typeof ready>) {
  const event = missionEvent(s)!;
  return gameReducer(s, { type: 'MISSION_CHOOSE', missionId: event.id, optionId: event.choices[0].id! });
}
describe('playable RPG progression', () => {
  it('ships the promised content and unique content ids', () => {
    expect(CONTRACTS).toHaveLength(12); expect(RECIPES).toHaveLength(12); expect(HOLDING_MISSIONS).toHaveLength(12);
    expect(Object.values(EXPEDITIONS).every((e) => e.stages.length === 3)).toBe(true);
    expect(new Set(CONTRACTS.map((c) => c.id)).size).toBe(12);
  });
  it('persists three offers without consuming RNG or rerolling on reload', () => {
    const s = ready(), rng = { ...s.world.rngState }, offers = JSON.stringify(s.rpg.board);
    refreshWorkBoard(s); expect(s.world.rngState).toEqual(rng);
    expect(JSON.stringify(normalizeGameState(JSON.parse(JSON.stringify(s))).rpg.board)).toBe(offers);
  });
  it('finishes a contract after the final action and pays it exactly once', () => {
    let s = ready(); s.actionClock.used = s.actionClock.cap - 1;
    const offer = s.rpg.board.offers[0];
    s = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: offer.id } });
    expect(s.actionClock.used).toBe(s.actionClock.cap);
    expect(gameReducer(s, { type: 'AGE_UP' }).age).toBe(s.age);
    const event = missionEvent(s)!, action = { type: 'MISSION_CHOOSE' as const, missionId: event.id, optionId: event.choices[0].id! };
    s = gameReducer(s, action); const gold = s.gold;
    expect(s.rpg.mission).toBeNull(); expect(gameReducer(s, action).gold).toBe(gold);
    expect(gameReducer(s, { type: 'AGE_UP' }).age).toBe(s.age + 1);
  });
  it('reserves three actions and opens each expedition decision automatically, including after reload', () => {
    let s = ready(); s = gameReducer(s, { type: 'RPG', command: { kind: 'expedition', id: 'woodland' } });
    expect(s.actionClock.used).toBe(3);
    for (let stage = 0; stage < 3; stage++) {
      expect(s.rpg.mission?.stage).toBe(stage);
      expect(gameReducer(s, { type: 'AGE_UP' }).age).toBe(s.age);
      s = normalizeGameState(JSON.parse(JSON.stringify(s)));
      const previous = missionEvent(s)!.id;
      s = safeResolve(s);
      const snapshot = JSON.stringify(s);
      s = gameReducer(s, { type: 'MISSION_CHOOSE', missionId: previous, optionId: 'safe' });
      expect(JSON.stringify(s)).toBe(snapshot);
      expect(s.actionClock.used).toBe(3);
    }
    expect(s.rpg.expedition).toBeNull(); expect(s.rpg.mission).toBeNull();
  });
  it('crafts a concrete item, consumes materials, and never stacks equip bonuses', () => {
    let s = ready(); const initialHealth = s.stats.health;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'craft', id: 'wood_axe' } });
    expect(s.rpg.materials.timber).toBe(28); expect(s.rpg.goods['wood_axe:ordinary']).toBe(1);
    s = gameReducer(s, { type: 'RPG', command: { kind: 'equip', id: 'wood_axe:ordinary' } });
    s = gameReducer(s, { type: 'RPG', command: { kind: 'equip', id: 'wood_axe:ordinary' } });
    expect(equippedBonus(s, 'yield')).toBe(1); expect(s.stats.health).toBe(initialHealth); expect(s.actionClock.used).toBe(1);
    s = gameReducer(s, { type: 'RPG', command: { kind: 'gather', id: 'timber' } }); expect(s.rpg.materials.timber).toBe(31);
  });
  it('uses goods exactly once and rejects unaffordable recipes', () => {
    const s = ready(); s.rpg.goods.healing_salve = 1; s.stats.health = 40;
    performRpgCommand(s, { kind: 'use_good', id: 'healing_salve' }); performRpgCommand(s, { kind: 'use_good', id: 'healing_salve' });
    expect(s.stats.health).toBe(50); expect(s.rpg.goods.healing_salve).toBe(0);
    s.rpg.materials.iron = 0; expect(rpgAvailability(s, { kind: 'craft', id: 'wood_axe' })).toContain('iron');
  });
  it('keeps player skills canonical and deep clones them', () => {
    const s = ready(), clone = cloneState(s); grantSkillXp(clone, 'arms', 26, 'test');
    expect(skillsOf(clone).arms).toMatchObject({ level: 2, xp: 6 }); expect(skillsOf(s).arms.level).toBe(1);
    expect(normalizeGameState(JSON.parse(JSON.stringify(clone))).world.characters[s.playerCharacterId].skills?.arms.level).toBe(2);
  });
  it('preserves household possessions through succession, but not parent mastery or personal missions', () => {
    let s = ready(); grantSkillXp(s, 'arms', 900, 'mastery'); s.rpg.goods['steel_blade:masterwork'] = 1;
    performRpgCommand(s, { kind: 'expedition', id: 'woodland' });
    const heir = spawnKin(s, { kind: 'child', age: 18, isHeir: true }); s.dead = true;
    s = gameReducer(s, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
    expect(skillsOf(s).arms.level).toBe(1); expect(s.rpg.goods['steel_blade:masterwork']).toBe(1); expect(s.rpg.expedition).toBeNull(); expect(s.rpg.mission).toBeNull();
  });
  it('refuses missions in prison and duplicate construction', () => {
    const s = ready(); s.tags.push('imprisoned'); expect(rpgAvailability(s, { kind: 'gather', id: 'iron' })).toBe('Imprisoned');
    s.tags = []; performRpgCommand(s, { kind: 'build', id: 'workshop' }); const gold = s.gold;
    performRpgCommand(s, { kind: 'build', id: 'workshop' }); expect(s.gold).toBe(gold); expect(s.actionClock.used).toBe(1);
  });
});
describe('interactive combat', () => {
  function fight() { const s = ready(); s.inventory.push('sword'); startDuel(s, 'roderick', 'duel'); return s; }
  it('honours exact timing boundaries and rejects duplicate phase inputs', () => {
    const s = fight(); selectCombatMove(s, 0, 'dodge');
    expect(timingGrade(s, 60)).toBe('perfect'); expect(timingGrade(s, 61)).toBe('good'); expect(timingGrade(s, 180)).toBe('good'); expect(timingGrade(s, 181)).toBe('miss');
    resolveCombatTiming(s, 1, 0); expect(s.duel!.playerVigour).toBe(100);
    const snapshot = JSON.stringify(s.duel); resolveCombatTiming(s, 1, 10000); expect(JSON.stringify(s.duel)).toBe(snapshot);
  });
  it('prevents guard-breaker parries and always permits an exhausted fallback', () => {
    const s = fight(); s.duel!.moveId = 'grapple'; expect(combatChoiceReason(s, 'parry')).toContain('guard-breaking strike');
    s.duel!.combat!.playerStamina = 0; expect(combatChoiceReason(s, 'block')).toContain('stamina'); expect(combatChoiceReason(s, 'brace')).toBeNull();
  });
  it('preserves committed attacks and equipment across reloads without RNG changes', () => {
    const s = fight(); selectCombatMove(s, 0, 'block'); const rng = { ...s.world.rngState };
    const loaded = normalizeGameState(JSON.parse(JSON.stringify(s))); expect(loaded.duel).toEqual(s.duel); expect(loaded.world.rngState).toEqual(rng);
    s.rpg.equipment.weapon = 'steel_blade:masterwork'; expect(s.duel!.combat!.damage).toBe(0);
  });
  it('resolves fights within four exchanges and settles once', () => {
    const s = fight();
    runWithWorldRng(s.world, () => {
      for (let guard = 0; guard < 40 && !s.duel!.outcome; guard++) {
        const c = s.duel!.combat!;
        if (c.phase === 'defence') selectCombatMove(s, c.sequence, combatChoiceReason(s, 'dodge') ? 'brace' : 'dodge');
        else if (c.phase === 'attack') selectCombatMove(s, c.sequence, combatChoiceReason(s, 'quick') ? 'recover' : 'quick');
        else resolveCombatTiming(s, c.sequence, 0);
      }
      expect(s.duel!.outcome).toBeDefined(); expect(s.duel!.round).toBeLessThanOrEqual(5);
      concludeDuel(s); const health = s.stats.health; concludeDuel(s); expect(s.stats.health).toBe(health);
    });
  });
  it('practice causes no lasting effects and missed timing stays a miss', () => {
    const s = ready(); startDuel(s, 'roderick', 'duel', true);
    expect(timingGrade(s, 10000)).toBe('miss'); s.duel!.outcome = 'lost'; s.duel!.playerVigour = 0;
    const health = s.stats.health; concludeDuel(s); expect(s.stats.health).toBe(health); expect(skillsOf(s).arms.xp).toBe(0);
  });
  it('upgrades a legacy duel without changing its round or vigour', () => { const s = fight(); delete s.duel!.combat; s.duel!.round = 3; s.duel!.playerVigour = 42; upgradeDuel(s); expect(s.duel!.round).toBe(3); expect(s.duel!.playerVigour).toBe(42); });
});
describe('v5 saves', () => {
  beforeEach(async () => { await AsyncStorage.clear(); });
  it.each([3, 4])('migrates v%s additively and leaves its source intact', async (version) => {
    const s = ready(); const raw = { ...s, schemaVersion: version, rpg: undefined }; const key = `mls:world:v${version}`;
    await AsyncStorage.setItem(key, JSON.stringify({ schemaVersion: version, game: raw }));
    const loaded = await loadGame(); expect(loaded.state?.schemaVersion).toBe(6); expect(loaded.state?.gold).toBe(s.gold); expect(loaded.state?.rpg.materials.iron).toBe(0); expect(await AsyncStorage.getItem(key)).not.toBeNull();
  });
  it('serializes multiple saves so the newest snapshot wins', async () => {
    const first = ready(), second = cloneState(first); second.gold = 123;
    await Promise.all([saveGame(first), saveGame(second)]);
    expect(JSON.parse((await AsyncStorage.getItem('mls:world:v5'))!).game.gold).toBe(123);
  });
});
