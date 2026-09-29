import { makeState } from './helpers';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { gatheringQuote, rpgAvailability } from '@/engine/rpgEngine';
import { combatPresentation } from '@/engine/combatPresentation';
import { resolveCombatTiming, selectCombatMove, startDuel } from '@/engine/duelEngine';
import { freshSkills, MATERIAL_PRICES } from '@/data/rpg';
import { MaterialId } from '@/types/rpg';

function ready() {
  const s = makeState({ age: 24, gold: 50 });
  s.world.characters[s.playerCharacterId].skills = freshSkills();
  s.world.characters.roderick.age = 26;
  return s;
}

describe('gathering economy', () => {
  it.each<[MaterialId, number]>([['timber', 2], ['stone', 4], ['iron', 6], ['herbs', 3]])('charges %s once for the quoted yield', (id, price) => {
    let s = ready();
    const quote = gatheringQuote(s, id), before = s.rpg.materials[id];
    expect(quote).toMatchObject({ gold: price, amount: 2 });
    expect(quote.gold).toBeLessThan(quote.amount * MATERIAL_PRICES[id]);
    const action = { type: 'RPG' as const, command: { kind: 'gather' as const, id }, revision: s.rpg.revision };
    s = gameReducer(s, action);
    expect(s.gold).toBe(50 - price);
    expect(s.rpg.materials[id]).toBe(before + quote.amount);
    expect(s.actionClock.used).toBe(1);
    const settled = JSON.stringify(s);
    expect(JSON.stringify(gameReducer(s, action))).toBe(settled);
  });

  it('refuses an unaffordable trip without charging actions, gold, materials or XP', () => {
    const s = ready(); s.gold = 5;
    expect(rpgAvailability(s, { kind: 'gather', id: 'iron' })).toBe('You have 5g');
    const next = gameReducer(s, { type: 'RPG', command: { kind: 'gather', id: 'iron' }, revision: s.rpg.revision });
    expect(next.gold).toBe(s.gold);
    expect(next.actionClock).toEqual(s.actionClock);
    expect(next.rpg.materials).toEqual(s.rpg.materials);
    expect(next.world.characters[s.playerCharacterId].skills).toEqual(s.world.characters[s.playerCharacterId].skills);
  });

  it('can spend the final coins but cannot gather after using the last action', () => {
    let s = ready(); s.gold = 6; s.actionClock.used = s.actionClock.cap - 1;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'gather', id: 'iron' } });
    expect(s.gold).toBe(0); expect(s.actionClock.used).toBe(s.actionClock.cap);
    s.gold = 50;
    const next = gameReducer(s, { type: 'RPG', command: { kind: 'gather', id: 'iron' } });
    expect(next.gold).toBe(50); expect(next.rpg.materials).toEqual(s.rpg.materials);
  });

  it('preserves skill and tool yield bonuses at the same outing price after reload', () => {
    let s = ready();
    s.world.characters[s.playerCharacterId].skills!.husbandry = { level: 6, xp: 0 };
    s.rpg.goods['wood_axe:ordinary'] = 1; s.rpg.equipment.tool = 'wood_axe:ordinary';
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    const quote = gatheringQuote(s, 'timber'), before = s.rpg.materials.timber;
    expect(quote).toMatchObject({ amount: 5, gold: 2 });
    s = gameReducer(s, { type: 'RPG', command: { kind: 'gather', id: 'timber' } });
    expect(s.rpg.materials.timber).toBe(before + 5); expect(s.gold).toBe(48);
  });
});

describe('combat impact cues', () => {
  function fight() { const s = ready(); s.inventory.push('sword'); startDuel(s, 'roderick', 'duel'); return s; }

  it.each(['heavy', 'feint'] as const)('retains the resolved %s cue through the next selection and reload', move => {
    let s = fight();
    s.duel!.combat!.phase = 'attack';
    selectCombatMove(s, s.duel!.combat!.sequence, move);
    resolveCombatTiming(s, s.duel!.combat!.sequence, 90);
    const cue = combatPresentation(s.duel!);
    expect(cue.scene).toBe(move);
    expect(s.duel!.combat!.attack).toBeUndefined();
    expect(cue.detail).toBe(`−${s.duel!.combat!.lastDamage}`);
    selectCombatMove(s, s.duel!.combat!.sequence, 'block');
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    expect(combatPresentation(s.duel!)).toEqual(cue);
  });

  it('shows a perfect parry as safe, and a missed defence as damage to the player', () => {
    const s = fight(); s.duel!.moveId = 'high_swing';
    selectCombatMove(s, s.duel!.combat!.sequence, 'parry');
    resolveCombatTiming(s, s.duel!.combat!.sequence, 0);
    expect(combatPresentation(s.duel!)).toMatchObject({ scene: 'parry', label: 'PARRY!', detail: 'SAFE', defending: true });
    const missed = fight();
    selectCombatMove(missed, missed.duel!.combat!.sequence, 'block');
    resolveCombatTiming(missed, missed.duel!.combat!.sequence, 10000);
    expect(combatPresentation(missed.duel!)).toMatchObject({ scene: 'hurt', defending: true });
    expect(missed.duel!.combat!.lastDamage).toBeGreaterThan(0);
  });

  it('replaces the previous impact with the actual capped stamina recovery', () => {
    const s = fight(), c = s.duel!.combat!;
    c.phase = 'attack'; c.playerStamina = 90; c.lastAction = 'strike'; c.lastDamage = 25; c.lastGrade = 'perfect';
    selectCombatMove(s, c.sequence, 'recover');
    expect(c.playerStamina).toBe(100); expect(c.lastGrade).toBeUndefined();
    expect(combatPresentation(s.duel!)).toMatchObject({ scene: 'recover', detail: '+10 STAMINA' });
    expect(s.duel!.log.join(' ')).toContain('recover 10 stamina');
  });

  it.each(['quick', 'heavy', 'feint'] as const)('keeps a finishing %s attack visible before victory', move => {
    const s = fight(); s.duel!.opponentVigour = 1; s.duel!.combat!.phase = 'attack';
    selectCombatMove(s, s.duel!.combat!.sequence, move);
    resolveCombatTiming(s, s.duel!.combat!.sequence, 0);
    expect(s.duel!.outcome).toBe('won');
    expect(combatPresentation(s.duel!, false).scene).toBe(move === 'quick' ? 'strike' : move);
    expect(combatPresentation(s.duel!, true).scene).toBe('victory');
  });

  it('shows the last incoming hit before defeat', () => {
    const s = fight(); s.duel!.playerVigour = 1;
    selectCombatMove(s, s.duel!.combat!.sequence, 'block');
    resolveCombatTiming(s, s.duel!.combat!.sequence, 10000);
    expect(s.duel!.outcome).toBe('lost');
    expect(combatPresentation(s.duel!, false).scene).toBe('hurt');
    expect(combatPresentation(s.duel!, true).scene).toBe('defeat');
  });
});
