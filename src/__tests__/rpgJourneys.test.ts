import { createLife, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { ALL_RPG_MISSIONS } from '@/content/rpgMissions';
import { branchRequirement, missionDefinition, missionEvent, missionOdds, optionUnavailable, refreshWorkBoard, rpgAvailability } from '@/engine/rpgEngine';
import { skillsOf } from '@/engine/rpgProgress';
import { combatChoiceReason, combatCost, resolveCombatTiming, selectCombatMove, startDuel, timingWindows } from '@/engine/duelEngine';
import { GameState } from '@/types/game';
import { eventById, isChoiceEnabled } from '@/engine/eventPicker';
import { spawnKin } from '@/engine/kinFactory';
import { worldIntegrityIssues } from '@/engine/worldIntegrity';

function ready(seed = 74000): GameState {
  const s = createLife({ worldSeed: seed });
  s.age = 24; s.world.currentYear = s.bornYear + 24; s.gold = 200;
  s.stats = { health: 100, charm: 70, wits: 70, faith: 60 };
  s.rpg.materials = { timber: 40, stone: 40, iron: 40, herbs: 40 };
  syncPlayerToWorld(s); refreshWorkBoard(s); return s;
}
function choose(s: GameState, id = 'safe'): GameState {
  return gameReducer(s, { type: 'MISSION_CHOOSE', missionId: s.rpg.mission!.id, optionId: id });
}
function playFight(s: GameState): GameState {
  for (let input = 0; input < 40 && s.duel && !s.duel.outcome; input++) {
    const c = s.duel.combat!;
    if (c.phase === 'defence') s = gameReducer(s, { type: 'COMBAT_SELECT', fightId: c.id, sequence: c.sequence, move: combatChoiceReason(s, 'dodge') ? 'brace' : 'dodge' });
    else if (c.phase === 'attack') s = gameReducer(s, { type: 'COMBAT_SELECT', fightId: c.id, sequence: c.sequence, move: combatChoiceReason(s, 'quick') ? 'recover' : 'quick' });
    else s = gameReducer(s, { type: 'COMBAT_TIMING', fightId: c.id, sequence: c.sequence, offsetMs: 0 });
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
  }
  expect(s.duel?.outcome).toBeDefined();
  return gameReducer(s, { type: 'DUEL_CLOSE' });
}
function resolveOpen(s: GameState): GameState {
  for (let n = 0; n < 12 && !s.dead && (s.pendingEvent || s.rpg.mission || s.duel); n++) {
    if (s.duel) s = playFight(s);
    else if (s.rpg.mission) {
      const option = missionDefinition(s)!.options.find((o) => !o.combat && !optionUnavailable(s, o))!;
      s = choose(s, option.id);
    } else {
      const event = eventById(s.pendingEvent!.eventId)!;
      const choice = event.choices.find((c) => isChoiceEnabled(s, c))!;
      s = gameReducer(s, { type: 'CHOOSE', choice });
    }
  }
  expect(s.pendingEvent || s.rpg.mission || s.duel).toBeFalsy();
  return s;
}

describe('RPG journey and interruption invariants', () => {
  it('has unique choices and a complete childhood board', () => {
    for (const def of ALL_RPG_MISSIONS) expect(new Set(def.options.map((o) => o.id)).size).toBe(def.options.length);
    const s = ready(); s.age = 6; s.rpg.board.year = -1; refreshWorkBoard(s); expect(s.rpg.board.offers).toHaveLength(3);
  });
  it('rejects a repeated craft request even when materials remain', () => {
    let s = ready(); const action = { type: 'RPG' as const, revision: s.rpg.revision, command: { kind: 'craft' as const, id: 'wood_axe' } };
    s = gameReducer(s, action); const saved = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(gameReducer(saved, action)).toBe(saved); expect(saved.rpg.goods['wood_axe:ordinary']).toBe(1);
  });
  it('plays a three-choice caravan on the final action with one XP award', () => {
    let s = ready(); s.actionClock.used = s.actionClock.cap - 1;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'caravan' } });
    expect(s.gold).toBe(192);
    for (let stage = 0; stage < 3; stage++) {
      expect(s.rpg.mission?.stage).toBe(stage); expect(gameReducer(s, { type: 'AGE_UP' }).age).toBe(24);
      s = normalizeGameState(JSON.parse(JSON.stringify(s))); s = choose(s);
      if (stage < 2) expect(skillsOf(s).scholarship.xp).toBe(0);
    }
    expect(s.rpg.mission).toBeNull(); expect(s.gold).toBe(203); expect(skillsOf(s).scholarship.xp).toBe(10);
    expect(s.actionClock.used).toBe(s.actionClock.cap);
  });
  it('resumes a paid contract after combat without charging or awarding Arms twice', () => {
    let s = ready(); s.rpg.board.offers = [{ id: 'test-escort', templateId: 'road_escort', attempted: false, clientId: 'aldric' }];
    s.actionClock.used = s.actionClock.cap - 1;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: 'test-escort' } }); s = choose(s, 'fight');
    expect(s.rpg.mission?.phase).toBe('combat'); expect(s.duel).not.toBeNull();
    s = playFight(s); expect(s.rpg.mission).toBeNull(); expect(s.actionClock.used).toBe(s.actionClock.cap);
    expect(skillsOf(s).arms.xp).toBe(10); const gold = s.gold;
    s = gameReducer(s, { type: 'DUEL_CLOSE' }); expect(s.gold).toBe(gold); expect(skillsOf(s).arms.xp).toBe(10);
  });
  it('rejects stale input from another duel with the same sequence', () => {
    let s = gameReducer(ready(), { type: 'PRACTICE_DUEL' }); const id = s.duel!.combat!.id;
    s = gameReducer(s, { type: 'DUEL_RESPOND', responseId: 'yield' }); s = gameReducer(s, { type: 'DUEL_CLOSE' });
    s = gameReducer(s, { type: 'PRACTICE_DUEL' });
    expect(gameReducer(s, { type: 'COMBAT_SELECT', fightId: id, sequence: 0, move: 'block' })).toBe(s);
  });
  it('retreats without granting the final expedition reward', () => {
    let s = ready(); s = gameReducer(s, { type: 'RPG', command: { kind: 'expedition', id: 'woodland' } });
    const materials = { ...s.rpg.materials }; s = choose(s, 'retreat');
    expect(s.rpg.expedition).toBeNull(); expect(s.rpg.materials).toEqual(materials); expect(s.actionClock.used).toBe(3);
  });
  it('uses faction substitutes for deceased clients and recovers missing opponents', () => {
    let s = ready(); const offer = s.rpg.board.offers[0];
    s = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: offer.id } });
    if (s.rpg.mission!.clientId) s.world.characters[s.rpg.mission!.clientId!].alive = false;
    expect(missionEvent(s)?.text).toContain(s.world.factions[s.rpg.mission!.faction].name);
    s.rpg.mission!.phase = 'combat'; s.duel = null;
    s = normalizeGameState(JSON.parse(JSON.stringify(s))); expect(s.rpg.mission?.phase).toBe('choice');
    s = choose(s); expect(s.rpg.mission).toBeNull();
  });
  it('keeps branch choices through career changes and unlocks the consequence', () => {
    let s = ready(); s.occupation.careerId = 'guard'; syncPlayerToWorld(s);
    s = gameReducer(s, { type: 'RPG', command: { kind: 'career', id: 'mercenary' } }); s = choose(s);
    expect(s.rpg.branches.mercenary.choices?.[0]).toBe('safe');
    s.occupation.careerId = null; expect(branchRequirement(s, 'mercenary')).toContain('career');
    s.occupation.careerId = 'guard'; s.world.characters[s.playerCharacterId].skills!.arms.level = 3; syncPlayerToWorld(s);
    s.rpg.board.offers = [{ id: 'company-watch', templateId: 'watch_duty', clientId: 'aldric', attempted: false }];
    s = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: 'company-watch' } }); s = choose(s);
    s = gameReducer(s, { type: 'RPG', command: { kind: 'career', id: 'mercenary' } });
    expect(missionDefinition(s)?.options.some((o) => o.id === 'allies')).toBe(true);
    expect(s.world.scheduledConsequences.length).toBeGreaterThan(0);
  });
  it('uses different client trust, world conditions, equipment and stewards in real choices', () => {
    let s = ready(); s.rpg.board.offers = [{ id: 'herbs', templateId: 'chapel_herbs', clientId: 'aldric', attempted: false }];
    s.world.characters.aldric.rel = 75; s.world.conditions.diseasePressure = 80;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: 'herbs' } });
    expect(missionDefinition(s)!.options.map((o) => o.id)).toEqual(expect.arrayContaining(['trusted', 'relief', 'prepared']));
    const before = missionOdds(s, missionDefinition(s)!); s.rpg.goods['herbal_kit:ordinary'] = 1; s.rpg.equipment.tool = 'herbal_kit:ordinary';
    expect(missionOdds(s, missionDefinition(s)!)).toBeGreaterThan(before);
    s = choose(s); s = gameReducer(s, { type: 'RPG', command: { kind: 'holding', id: 'broken_well' } });
    const unmanaged = missionOdds(s, missionDefinition(s)!); s.rpg.stewardId = 'aldric';
    expect(missionOdds(s, missionDefinition(s)!)).toBeGreaterThan(unmanaged);
  });
  it('makes strong fortifications materially better than a neglected boundary', () => {
    let s = gameReducer(ready(), { type: 'RPG', command: { kind: 'holding', id: 'night_alarm' } });
    s.holding.security = 70; const secure = missionDefinition(s)!.options[0].effects.holding!;
    s.holding.security = 10; const neglected = missionDefinition(s)!.options[0].effects.holding!;
    expect(secure.security).toBeGreaterThan(neglected.security!); expect(secure.stores).toBeGreaterThan(neglected.stores!);
    s.holding.stores = 0; s.gold = 0; expect(optionUnavailable(s, missionDefinition(s)!.options[0])).toBeNull();
  });
  it.each([[6, 'fine'], [10, 'masterwork']] as const)('crafts previewed quality at Craftsmanship %s', (level, quality) => {
    let s = ready(); s.world.characters[s.playerCharacterId].skills!.craftsmanship.level = level;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'craft', id: 'practice_sword' } });
    expect(s.rpg.goods[`practice_sword:${quality}`]).toBe(1); expect(s.rpg.materials.iron).toBe(38);
  });
  it('equipment changes actual damage, mitigation and dodge cost', () => {
    const baseline = ready(), equipped = ready();
    equipped.inventory.push('sword', 'mail_shirt'); equipped.rpg.equipment = { weapon: 'sword', armour: 'mail_shirt' };
    for (const s of [baseline, equipped]) {
      startDuel(s, 'roderick', 'brawl'); s.duel!.moveId = 'high_swing';
      selectCombatMove(s, 0, 'block'); resolveCombatTiming(s, 1, 100);
      selectCombatMove(s, 2, 'quick'); resolveCombatTiming(s, 3, 100);
    }
    expect(equipped.duel!.playerVigour).toBeGreaterThan(baseline.duel!.playerVigour);
    expect(equipped.duel!.opponentVigour).toBeLessThan(baseline.duel!.opponentVigour);
    expect(combatCost(equipped, 'dodge')).toBe(25);
  });
  it('perfect parry opens the strongest counter and Arms widens timing windows', () => {
    const parry = ready(), dodge = ready();
    for (const [s, defence] of [[parry, 'parry'], [dodge, 'dodge']] as const) {
      startDuel(s, 'roderick', 'brawl'); s.duel!.moveId = 'high_swing';
      selectCombatMove(s, 0, defence); resolveCombatTiming(s, 1, 0);
      selectCombatMove(s, 2, 'heavy'); resolveCombatTiming(s, 3, 0);
    }
    expect(parry.duel!.opponentVigour).toBeLessThan(dodge.duel!.opponentVigour);
    parry.duel!.combat!.arms = 10; expect(timingWindows(parry)).toEqual({ good: 240, perfect: 80 });
  });
  it('cannot spend the same caravan input on two different journey stages', () => {
    let s = gameReducer(ready(), { type: 'RPG', command: { kind: 'caravan' } });
    const input = { type: 'MISSION_CHOOSE' as const, missionId: s.rpg.mission!.id, optionId: 'safe' };
    s = gameReducer(s, input); const snapshot = JSON.stringify(s.rpg.mission);
    s = gameReducer(s, input); expect(JSON.stringify(s.rpg.mission)).toBe(snapshot);
    expect(skillsOf(s).scholarship.xp).toBe(0);
  });
  it('permits estate decisions in prison but not personal combat', () => {
    let s = gameReducer(ready(), { type: 'RPG', command: { kind: 'holding', id: 'night_alarm' } });
    s.tags.push('imprisoned');
    const fight = missionDefinition(s)!.options.find((o) => o.combat)!;
    expect(optionUnavailable(s, fight)).toContain('imprisoned');
    expect(choose(s, fight.id).duel).toBeNull();
    s = choose(s); expect(s.rpg.mission).toBeNull();
  });
});

describe('RPG life and dynasty simulations', () => {
  jest.setTimeout(120000);
  it('mixes optional play, reloads and age-up across lives and inherited households', () => {
    for (let seed = 75100; seed < 75106; seed++) {
      let s = createLife({ worldSeed: seed });
      for (let generation = 0; generation < 3; generation++) {
        for (let year = 0; year < 28 && !s.dead; year++) {
          s = resolveOpen(s); if (s.dead) break;
          const offer = s.rpg.board.offers.find((o) => !o.attempted);
          if (offer && !rpgAvailability(s, { kind: 'contract', id: offer.id })) {
            s = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: offer.id } }); s = resolveOpen(s);
          }
          if (!rpgAvailability(s, { kind: 'expedition', id: 'woodland' })) {
            s = gameReducer(s, { type: 'RPG', command: { kind: 'expedition', id: 'woodland' } }); s = resolveOpen(s);
          }
          const age = s.age; if (!s.dead) { s = gameReducer(s, { type: 'AGE_UP' }); expect(s.age).toBe(age + 1); }
          if (year % 4 === 0) s = normalizeGameState(JSON.parse(JSON.stringify(s)));
          for (const amount of Object.values(s.rpg.materials)) expect(amount).toBeGreaterThanOrEqual(0);
          expect(s.actionClock.used).toBeLessThanOrEqual(s.actionClock.cap);
        }
        if (generation < 2) {
          const stock = { ...s.rpg.materials };
          const heir = spawnKin(s, { kind: 'child', age: 18, isHeir: true }); heir.skills!.scholarship = { level: 2, xp: 7 };
          s.rpg.stewardId = heir.id;
          s.dead = true; s = gameReducer(s, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
          expect(s.rpg.materials).toEqual(stock); expect(skillsOf(s).scholarship).toMatchObject({ level: 2, xp: 7 });
          expect(s.rpg.mission).toBeNull(); expect(s.rpg.expedition).toBeNull();
          expect(s.rpg.stewardId).toBeNull();
        }
      }
      expect(worldIntegrityIssues(s)).toEqual([]);
    }
  });
});
