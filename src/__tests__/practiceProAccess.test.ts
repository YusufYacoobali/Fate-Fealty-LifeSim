import { makeState } from './helpers';
import { gameReducer } from '@/state/gameReducer';
import { armsPracticeAvailability, startArmsPractice, startDuel } from '@/engine/duelEngine';
import { beginForge, closeForge, finishForge, forgeAllowance, forgeAvailability, startForge, strikeForge } from '@/engine/forgeEngine';
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

describe('free practice and basic crafting; Pro advanced crafting', () => {
  it('keeps the agreed basic and advanced recipe catalog split', () => {
    expect(RECIPES.filter(r => !r.premium).map(r => r.id).sort()).toEqual([
      'healing_salve', 'practice_sword', 'provisions', 'repair_kit', 'seed_bundle', 'wood_axe',
    ]);
    expect(RECIPES.filter(r => r.premium).map(r => r.id).sort()).toEqual([
      'gambeson', 'herbal_kit', 'mail_shirt', 'mason_tools', 'masterpiece', 'steel_blade',
    ]);
  });
  it.each([false, true])('allows yard and solo practice at reducer and engine entry points (Pro=%s)', pro => {
    const s = ready(pro);
    expect(armsPracticeAvailability(s)).toBeNull();
    const yard = gameReducer(s, { type: 'PRACTICE_DUEL' });
    const solo = gameReducer(s, { type: 'ARMS_PRACTICE_START', revision: s.rpg.revision });
    expect(yard.duel?.combat?.practice).toBe(true); expect(yard.actionClock.used).toBe(0);
    expect(solo.duel?.combat?.solo).toBeDefined(); expect(solo.actionClock.used).toBe(1);
    startArmsPractice(s); expect(s.duel?.combat?.solo).toBeDefined();
    const directYard = ready(pro); startDuel(directYard, 'roderick', 'duel', true);
    expect(directYard.duel?.combat?.practice).toBe(true);
  });

  it.each<ForgeTask>([
    { kind: 'recipe', recipeId: 'steel_blade' },
    { kind: 'commission', chapter: 0, choiceId: 'fit' },
  ])('blocks the $kind anvil entry point without spending actions, supplies or pay', task => {
    const s = ready(), before = JSON.stringify(resources(s));
    expect(forgeAvailability(s, task)).toBe('Requires Pro');
    startForge(s, task);
    const result = gameReducer(s, { type: 'FORGE_START', task, revision: s.rpg.revision });
    expect(s.rpg.forge).toBeNull(); expect(result.rpg.forge).toBeNull();
    expect(JSON.stringify(resources(result))).toBe(before);
  });

  it.each(RECIPES.filter(r => r.premium).map(r => r.id))('blocks advanced crafting %s before spending any resources', id => {
    const s = ready(), command = { kind: 'craft' as const, id }, before = JSON.stringify(resources(s));
    expect(rpgAvailability(s, command)).toBe('Requires Pro');
    performRpgCommand(s, command);
    const result = gameReducer(s, { type: 'RPG', command, revision: s.rpg.revision });
    expect(JSON.stringify(resources(result))).toBe(before);
    expect(result.rpg.lastCrafted).toBeFalsy();
  });

  it.each(['arms', 'craftsmanship'] as const)('allows free legacy %s training with normal XP and action cost', id => {
    const s = ready(), command = { kind: 'train' as const, id };
    expect(rpgAvailability(s, command)).toBeNull();
    const result = gameReducer(s, { type: 'RPG', command });
    expect(result.actionClock.used).toBe(1); expect(skillsOf(result)[id].xp).toBe(6);
  });

  it.each([false, true])('allows basic crafting and both practice modes (Pro=%s)', pro => {
    const s = ready(pro);
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

  it('lets lessons finish exactly once after Pro expires and allows another free lesson', () => {
    let solo = gameReducer(ready(true), { type: 'ARMS_PRACTICE_START', revision: 0 });
    const fightId = solo.duel!.combat!.id;
    solo = gameReducer(solo, { type: 'SET_LIFETIME_UNLOCKED', unlocked: false });
    solo = gameReducer(solo, { type: 'ARMS_PRACTICE_FINISH', fightId });
    solo = gameReducer(solo, { type: 'ARMS_PRACTICE_FINISH', fightId });
    expect(skillsOf(solo).arms.xp).toBe(6);
    solo = gameReducer(solo, { type: 'DUEL_CLOSE' });
    expect(gameReducer(solo, { type: 'ARMS_PRACTICE_START', revision: solo.rpg.revision }).duel?.combat?.solo).toBeDefined();

    let forge = gameReducer(ready(true), { type: 'FORGE_START', task: { kind: 'practice' }, revision: 0 });
    const id = forge.rpg.forge!.id;
    forge = gameReducer(forge, { type: 'SET_LIFETIME_UNLOCKED', unlocked: false });
    forge = gameReducer(forge, { type: 'FORGE_QUICK', id });
    forge = gameReducer(forge, { type: 'FORGE_QUICK', id });
    expect(skillsOf(forge).craftsmanship.xp).toBe(6);
    forge = gameReducer(forge, { type: 'FORGE_CLOSE', id });
    expect(gameReducer(forge, { type: 'FORGE_START', task: { kind: 'practice' }, revision: forge.rpg.revision }).rpg.forge?.practice).toBe(true);
    expect(rpgAvailability(forge, { kind: 'craft', id: 'wood_axe' })).toBeNull();
    expect(forge.actionClock.cap).toBe(24);
  });

  it('keeps gathering, existing possessions, other skills, normal work and actual fights available without Pro', () => {
    const s = ready(); s.rpg.goods['mail_shirt:ordinary'] = 1; s.rpg.goods.healing_salve = 1;
    const commands: RpgCommand[] = [{ kind: 'gather', id: 'iron' }, { kind: 'equip', id: 'mail_shirt:ordinary' }, { kind: 'use_good', id: 'healing_salve' }, { kind: 'train', id: 'scholarship' }];
    for (const command of commands) expect(rpgAvailability(s, command)).toBeNull();
    expect(gameReducer(s, { type: 'CAREER_ACTION', action: 'work' }).actionClock.used).toBe(1);
    startDuel(s, 'roderick', 'brawl');
    expect(s.duel).not.toBeNull(); expect(s.duel?.combat?.practice).toBe(false);
  });

  it.each(RECIPES.filter(r => !r.premium))('makes basic $id crafting available with equal costs and rewards for free and Pro', recipe => {
    const s = ready(), command = { kind: 'craft' as const, id: recipe.id };
    expect(rpgAvailability(s, command)).toBeNull();
    const free = gameReducer(s, { type: 'RPG', command, revision: s.rpg.revision });
    const paid = gameReducer(ready(true), { type: 'RPG', command, revision: s.rpg.revision });
    expect(resources(free)).toEqual(resources(paid));
    expect(free.actionClock.used).toBe(1); expect(free.gold).toBe(s.gold - recipe.gold);
    for (const [material, cost] of Object.entries(recipe.materials)) {
      expect(free.rpg.materials[material as keyof typeof free.rpg.materials]).toBe(40 - cost);
    }
    expect(free.rpg.lastCrafted?.recipeId).toBe(recipe.id); expect(skillsOf(free).craftsmanship.xp).toBe(6);
  });

  it.each(RECIPES.filter(r => r.premium))('keeps advanced $id Pro even when a free player meets its normal requirements', recipe => {
    const s = ready(); skillsOf(s).craftsmanship.level = 10; skillsOf(s).scholarship.level = 10;
    s.holding.upgrades.push('workshop', 'herb_garden');
    const command = { kind: 'craft' as const, id: recipe.id }, before = JSON.stringify(resources(s));
    expect(rpgAvailability(s, command)).toBe('Requires Pro');
    expect(JSON.stringify(resources(gameReducer(s, { type: 'RPG', command })))).toBe(before);
    if ((recipe.materials.iron ?? 0) > 0) {
      const task = { kind: 'recipe' as const, recipeId: recipe.id };
      expect(forgeAvailability(s, task)).toBe('Requires Pro');
      startForge(s, task); expect(s.rpg.forge).toBeNull();
    }
    s.lifetimeUnlocked = true;
    expect(rpgAvailability(s, command)).toBeNull();
    expect(gameReducer(s, { type: 'RPG', command }).rpg.lastCrafted?.recipeId).toBe(recipe.id);
  });

  it('gives free artisan forge work the same baseline as a normal paid shift', () => {
    const s = ready();
    const ordinary = gameReducer(s, { type: 'CAREER_ACTION', action: 'work' });
    const forged = gameReducer(s, { type: 'FORGE_START', task: { kind: 'work' }, revision: s.rpg.revision });
    expect(forged.rpg.forge).not.toBeNull(); expect(resources(forged)).toEqual(resources(ordinary));
  });

  it('keeps free crafting playable after three bonuses without increasing bonus rewards', () => {
    const s = ready();
    for (let n = 0; n < 4; n++) {
      startForge(s, { kind: 'recipe', recipeId: 'wood_axe' }); const id = s.rpg.forge!.id;
      beginForge(s, id);
      for (let i = 0; i < 5; i++) strikeForge(s, id, i, s.rpg.forge!.targets[i]);
      expect(s.rpg.forge!.bonusXp).toBe(n < 3 ? 4 : 0); expect(s.rpg.forge!.bonusIron).toBe(n < 3 ? 1 : 0);
      finishForge(s, id, false); closeForge(s, id);
    }
    expect(forgeAllowance(s)).toBe(0); expect(s.actionClock.used).toBe(4);
    expect(s.rpg.goods['wood_axe:ordinary']).toBe(4);
    expect(forgeAvailability(s, { kind: 'recipe', recipeId: 'wood_axe' })).toBeNull();
  });
});
