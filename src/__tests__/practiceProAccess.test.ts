import { makeState } from './helpers';
import { gameReducer } from '@/state/gameReducer';
import { armsPracticeAvailability, startArmsPractice, startDuel } from '@/engine/duelEngine';
import { forgeAvailability, startForge } from '@/engine/forgeEngine';
import { performRpgCommand, refreshWorkBoard, rpgAvailability, RpgCommand } from '@/engine/rpgEngine';
import { skillsOf } from '@/engine/rpgProgress';
import { ForgeTask } from '@/types/rpg';
import { RECIPES } from '@/data/rpg';

function ready(pro = false) {
  const s = makeState({ age: 24, gold: 200, lifetimeUnlocked: pro });
  s.world.currentYear = s.bornYear + s.age;
  s.world.characters.roderick.age = 26;
  s.rpg.materials = { timber: 40, iron: 40, stone: 40, herbs: 40 };
  s.occupation = { careerId: 'artisan', experience: 0, performance: 70, workedThisYear: 0 };
  refreshWorkBoard(s);
  return s;
}

function resources(s: ReturnType<typeof ready>) {
  return { gold: s.gold, materials: s.rpg.materials, goods: s.rpg.goods, used: s.actionClock.used, skills: skillsOf(s), occupation: s.occupation };
}

describe('Pro access for crafting and practice', () => {
  it('blocks yard and solo practice at both reducer and engine entry points without spending anything', () => {
    const s = ready(), before = JSON.stringify(resources(s));
    expect(armsPracticeAvailability(s)).toBe('Requires Pro');
    startArmsPractice(s); startDuel(s, 'roderick', 'duel', true);
    expect(s.duel).toBeNull();
    const yard = gameReducer(s, { type: 'PRACTICE_DUEL' });
    const solo = gameReducer(s, { type: 'ARMS_PRACTICE_START', revision: s.rpg.revision });
    for (const result of [s, yard, solo]) {
      expect(result.duel).toBeNull();
      expect(JSON.stringify(resources(result))).toBe(before);
    }
  });

  it.each<ForgeTask>([
    { kind: 'practice' }, { kind: 'recipe', recipeId: 'wood_axe' },
    { kind: 'work' }, { kind: 'commission', chapter: 0, choiceId: 'fit' },
  ])('blocks the $kind anvil entry point without spending actions, supplies or pay', task => {
    const s = ready(), before = JSON.stringify(resources(s));
    expect(forgeAvailability(s, task)).toBe('Requires Pro');
    startForge(s, task);
    const result = gameReducer(s, { type: 'FORGE_START', task, revision: s.rpg.revision });
    expect(s.rpg.forge).toBeNull(); expect(result.rpg.forge).toBeNull();
    expect(JSON.stringify(resources(result))).toBe(before);
  });

  it.each(RECIPES.map(r => r.id))('blocks quick crafting %s before spending any resources', id => {
    const s = ready(), command = { kind: 'craft' as const, id }, before = JSON.stringify(resources(s));
    expect(rpgAvailability(s, command)).toBe('Requires Pro');
    performRpgCommand(s, command);
    const result = gameReducer(s, { type: 'RPG', command, revision: s.rpg.revision });
    expect(JSON.stringify(resources(result))).toBe(before);
    expect(result.rpg.lastCrafted).toBeFalsy();
  });

  it.each(['arms', 'craftsmanship'] as const)('blocks the legacy %s training command', id => {
    const s = ready(), command = { kind: 'train' as const, id }, before = JSON.stringify(resources(s));
    expect(rpgAvailability(s, command)).toBe('Requires Pro');
    expect(JSON.stringify(resources(gameReducer(s, { type: 'RPG', command })))).toBe(before);
  });

  it('allows Pro crafting and both combat practice modes', () => {
    const s = ready(true);
    expect(armsPracticeAvailability(s)).toBeNull();
    const yard = gameReducer(s, { type: 'PRACTICE_DUEL' });
    expect(yard.duel?.combat?.practice).toBe(true);
    const solo = gameReducer(s, { type: 'ARMS_PRACTICE_START', revision: s.rpg.revision });
    expect(solo.duel?.combat?.solo).toBeDefined(); expect(solo.actionClock.used).toBe(1);
    const crafted = gameReducer(s, { type: 'RPG', command: { kind: 'craft', id: 'wood_axe' } });
    expect(crafted.rpg.goods['wood_axe:ordinary']).toBe(1); expect(crafted.actionClock.used).toBe(1);
    const forged = gameReducer(s, { type: 'FORGE_START', task: { kind: 'practice' }, revision: s.rpg.revision });
    expect(forged.rpg.forge?.practice).toBe(true); expect(forged.actionClock.used).toBe(1);
  });

  it('lets a committed solo or anvil lesson finish once after Pro access expires', () => {
    let solo = gameReducer(ready(true), { type: 'ARMS_PRACTICE_START', revision: 0 });
    const fightId = solo.duel!.combat!.id;
    solo = gameReducer(solo, { type: 'SET_LIFETIME_UNLOCKED', unlocked: false });
    solo = gameReducer(solo, { type: 'ARMS_PRACTICE_FINISH', fightId });
    solo = gameReducer(solo, { type: 'ARMS_PRACTICE_FINISH', fightId });
    expect(skillsOf(solo).arms.xp).toBe(6);
    solo = gameReducer(solo, { type: 'DUEL_CLOSE' });
    expect(gameReducer(solo, { type: 'ARMS_PRACTICE_START', revision: solo.rpg.revision }).duel).toBeNull();

    let forge = gameReducer(ready(true), { type: 'FORGE_START', task: { kind: 'practice' }, revision: 0 });
    const id = forge.rpg.forge!.id;
    forge = gameReducer(forge, { type: 'SET_LIFETIME_UNLOCKED', unlocked: false });
    forge = gameReducer(forge, { type: 'FORGE_QUICK', id });
    forge = gameReducer(forge, { type: 'FORGE_QUICK', id });
    expect(skillsOf(forge).craftsmanship.xp).toBe(6);
    forge = gameReducer(forge, { type: 'FORGE_CLOSE', id });
    expect(gameReducer(forge, { type: 'FORGE_START', task: { kind: 'practice' }, revision: forge.rpg.revision }).rpg.forge).toBeNull();
  });

  it('keeps gathering, existing possessions, other skills, normal work and actual fights available without Pro', () => {
    const s = ready(); s.rpg.goods['wood_axe:ordinary'] = 1; s.rpg.goods.healing_salve = 1;
    const commands: RpgCommand[] = [{ kind: 'gather', id: 'iron' }, { kind: 'equip', id: 'wood_axe:ordinary' }, { kind: 'use_good', id: 'healing_salve' }, { kind: 'train', id: 'scholarship' }];
    for (const command of commands) expect(rpgAvailability(s, command)).toBeNull();
    expect(gameReducer(s, { type: 'CAREER_ACTION', action: 'work' }).actionClock.used).toBe(1);
    startDuel(s, 'roderick', 'brawl');
    expect(s.duel).not.toBeNull(); expect(s.duel?.combat?.practice).toBe(false);
  });
});
