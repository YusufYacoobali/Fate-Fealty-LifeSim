import { makeState } from './helpers';
import { cloneState, syncPlayerToWorld } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { beginForge, closeForge, finishForge, forgeAllowance, forgeAvailability, startForge, strikeForge } from '@/engine/forgeEngine';
import { recordTradeWork, resolveTradeChoice, tradeAvailability, tradeProgress } from '@/engine/tradeJourney';
import { skillsOf } from '@/engine/rpgProgress';
import { resolveScheduledConsequences } from '@/engine/consequenceScheduler';
import { deriveLifeRole, storyEligibilityMet } from '@/content/persistentStories';
import { careerAvailability, careerById } from '@/data/careers';
import { applyChoice } from '@/engine/storyGraph';
import { choiceStakes, isRoutineNews } from '@/engine/choiceFeedback';
import { ANNUAL_MESSAGES, pickAnnualMessage } from '@/content/annualMessages';
import { Choice, GameEvent } from '@/types/game';
import { spawnKin } from '@/engine/kinFactory';
import { PERSISTENT_WORLD_EVENTS } from '@/content/persistentWorldEvents';
import { isChoiceEnabled } from '@/engine/eventPicker';

function ready() {
  const s = makeState({ age: 30, gold: 200 });
  s.world.currentYear = s.bornYear + s.age;
  s.occupation = { careerId: 'artisan', experience: 0, performance: 70, workedThisYear: 0 };
  s.rpg.materials = { timber: 30, stone: 30, iron: 30, herbs: 30 };
  s.settings.liveForever = true; s.lifetimeUnlocked = true;
  syncPlayerToWorld(s);
  return s;
}
function perfect(s: ReturnType<typeof ready>) {
  const id = s.rpg.forge!.id;
  beginForge(s, id);
  for (let i = s.rpg.forge!.scores.length; i < 5; i++) strikeForge(s, id, i, s.rpg.forge!.targets[i]);
}
function nextYear(s: ReturnType<typeof ready>) { s.age++; s.world.currentYear++; s.actionClock.used = 0; syncPlayerToWorld(s); }

describe('optional forge', () => {
  it('gives paid forge work the same baseline as a normal shift and commits commissions only once', () => {
    const s = ready();
    const ordinary = gameReducer(s, { type: 'CAREER_ACTION', action: 'work' });
    let forged = gameReducer(s, { type: 'FORGE_START', task: { kind: 'work' }, revision: s.rpg.revision });
    expect(forged.gold).toBe(ordinary.gold); expect(forged.stats).toEqual(ordinary.stats);
    expect(forged.occupation).toEqual(ordinary.occupation); expect(skillsOf(forged)).toEqual(skillsOf(ordinary));
    expect(tradeProgress(forged).assignments).toBe(1);
    forged = gameReducer(forged, { type: 'FORGE_QUICK', id: forged.rpg.forge!.id });
    forged = gameReducer(forged, { type: 'FORGE_CLOSE', id: forged.rpg.forge!.id });
    const commission = { type: 'FORGE_START' as const, task: { kind: 'commission' as const, chapter: 0, choiceId: 'fit' }, revision: forged.rpg.revision };
    forged = gameReducer(forged, commission);
    expect(tradeProgress(forged).chapter).toBe(1);
    const gold = forged.gold; forged = gameReducer(forged, commission);
    expect(forged.gold).toBe(gold); expect(tradeProgress(forged).chapter).toBe(1);
    expect(forged.world.scheduledConsequences.filter((c) => c.sourceChoiceId === 'trade:0:fit')).toHaveLength(1);
  });
  it('commits exactly the quick-craft result before hammer work and never charges again', () => {
    const s = ready();
    const quick = gameReducer(s, { type: 'RPG', command: { kind: 'craft', id: 'wood_axe' } });
    let played = gameReducer(s, { type: 'FORGE_START', task: { kind: 'recipe', recipeId: 'wood_axe' }, revision: s.rpg.revision });
    expect(played.rpg.goods).toEqual(quick.rpg.goods);
    expect(played.rpg.materials).toEqual(quick.rpg.materials);
    expect(played.gold).toBe(quick.gold);
    expect(skillsOf(played)).toEqual(skillsOf(quick));
    expect(played.actionClock.used).toBe(1);
    const id = played.rpg.forge!.id;
    perfect(played);
    expect(played.rpg.forge).toMatchObject({ phase: 'result', bonusXp: 4, bonusIron: 1 });
    expect(played.rpg.materials.iron).toBe(quick.rpg.materials.iron + 1);
    const snapshot = JSON.stringify(played);
    strikeForge(played, id, 4, 0.5); finishForge(played, id, false); finishForge(played, id, true);
    expect(JSON.stringify(played)).toBe(snapshot);
    played = gameReducer(played, { type: 'FORGE_START', task: { kind: 'recipe', recipeId: 'wood_axe' }, revision: s.rpg.revision });
    expect(played.gold).toBe(quick.gold);
    expect(s.rpg.forge).toBeNull(); expect(s.rpg.goods).toEqual({});
  });
  it('can finish after the last action, blocks aging mid-attempt, and keeps ordinary rewards on skip', () => {
    let s = ready(); s.actionClock.used = s.actionClock.cap - 1;
    s = gameReducer(s, { type: 'FORGE_START', task: { kind: 'recipe', recipeId: 'wood_axe' }, revision: s.rpg.revision });
    expect(s.rpg.forge).not.toBeNull();
    expect(gameReducer(s, { type: 'AGE_UP' }).age).toBe(30);
    const id = s.rpg.forge!.id, gold = s.gold, goods = { ...s.rpg.goods };
    s = gameReducer(s, { type: 'FORGE_QUICK', id });
    expect(s.rpg.forge?.bonusXp).toBe(0); expect(s.gold).toBe(gold); expect(s.rpg.goods).toEqual(goods);
    s = gameReducer(s, { type: 'FORGE_CLOSE', id });
    expect(gameReducer(s, { type: 'AGE_UP' }).age).toBe(31);
  });
  it('persists the committed pattern, previous blows and settled rewards at every phase', () => {
    let s = ready(); startForge(s, { kind: 'recipe', recipeId: 'wood_axe' }); syncPlayerToWorld(s);
    const reload = () => { const before = JSON.stringify(s.rpg.forge); const gold = s.gold; s = normalizeGameState(JSON.parse(JSON.stringify(s))); expect(JSON.stringify(s.rpg.forge)).toBe(before); expect(s.gold).toBe(gold); };
    reload(); beginForge(s, s.rpg.forge!.id); strikeForge(s, s.rpg.forge!.id, 0, s.rpg.forge!.targets[0]); reload();
    const before = s.rpg.forge!.scores.length;
    strikeForge(s, 'stale', 1, 0.5); strikeForge(s, s.rpg.forge!.id, 0, 0.5); strikeForge(s, s.rpg.forge!.id, 1, NaN);
    expect(s.rpg.forge!.scores).toHaveLength(before);
    perfect(s); syncPlayerToWorld(s); reload();
  });
  it('supports repeated anvil training for one action per session and grants XP exactly once', () => {
    const s = ready(); const iron = s.rpg.materials.iron, gold = s.gold;
    startForge(s, { kind: 'practice' }); perfect(s);
    expect(s.rpg.forge?.scores).toEqual([100, 100, 100, 100, 100]);
    expect(s.rpg.forge?.bonusXp).toBe(0); expect(skillsOf(s).craftsmanship.xp).toBe(6);
    expect(s.actionClock.used).toBe(1);
    finishForge(s, s.rpg.forge!.id, true); expect(skillsOf(s).craftsmanship.xp).toBe(6);
    closeForge(s, s.rpg.forge!.id); expect(forgeAvailability(s, { kind: 'practice' })).toBeNull();
    expect(s.gold).toBe(gold); expect(s.rpg.materials.iron).toBe(iron); expect(forgeAllowance(s)).toBe(3);
    nextYear(s); expect(forgeAvailability(s, { kind: 'practice' })).toBeNull();
    skillsOf(s).craftsmanship.level = 3; expect(forgeAvailability(s, { kind: 'practice' })).toBeNull();
    startForge(s, { kind: 'practice' }); perfect(s);
    expect(skillsOf(s).craftsmanship.xp).toBe(12);
    closeForge(s, s.rpg.forge!.id);
    skillsOf(s).craftsmanship.level = 10; expect(forgeAvailability(s, { kind: 'practice' })).toBe('Maximum skill level');
  });
  it('caps paid bonuses at three and resets the allowance next year', () => {
    const s = ready();
    for (let n = 0; n < 4; n++) { startForge(s, { kind: 'recipe', recipeId: 'wood_axe' }); perfect(s); expect(s.rpg.forge!.bonusXp).toBe(n < 3 ? 4 : 0); closeForge(s, s.rpg.forge!.id); }
    expect(forgeAllowance(s)).toBe(0); nextYear(s); expect(forgeAllowance(s)).toBe(3);
  });
  it('rejects unaffordable work and clears a dead owner’s attempt on succession', () => {
    const s = ready(); s.rpg.materials.iron = 0;
    expect(forgeAvailability(s, { kind: 'recipe', recipeId: 'wood_axe' })).toContain('iron');
    startForge(s, { kind: 'recipe', recipeId: 'wood_axe' }); expect(s.actionClock.used).toBe(0);
    startForge(s, { kind: 'practice' });
    const heir = spawnKin(s, { kind: 'child', age: 18, isHeir: true }); s.dead = true;
    const inherited = gameReducer(s, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
    expect(inherited.rpg.forge).toBeNull(); expect(forgeAllowance(inherited)).toBe(3); expect(tradeProgress(inherited).chapter).toBe(0);
  });
  it('adds safe defaults to older saves without creating or replaying a task', () => {
    const saved = JSON.parse(JSON.stringify(ready()));
    delete saved.rpg.forge; delete saved.rpg.forgeBonuses; saved.world.contentVersion = 4;
    const loaded = normalizeGameState(saved);
    expect(loaded.rpg.forge).toBeNull(); expect(forgeAllowance(loaded)).toBe(3);
    expect(tradeProgress(loaded)).toEqual({ chapter: 0, assignments: 0, choices: [] });
    expect(loaded.gold).toBe(saved.gold); expect(loaded.actionClock.used).toBe(0);
  });
});

describe('professional life', () => {
  it.each(['trusted', 'prosperous', 'independent'])('reaches the %s legacy without a noble title', (ending) => {
    const s = ready(); s.rankIdx = 0;
    expect(resolveTradeChoice(s, 0, 'fit')).toBe(true);
    const clientId = tradeProgress(s).clientId;
    expect(clientId).toBeTruthy();
    expect(tradeAvailability(s)).toContain('next year');
    nextYear(s); expect(tradeAvailability(s)).toContain('2 paid work');
    recordTradeWork(s); recordTradeWork(s); expect(resolveTradeChoice(s, 1, 'recall')).toBe(true);
    nextYear(s); recordTradeWork(s); recordTradeWork(s); expect(resolveTradeChoice(s, 2, 'commons')).toBe(true);
    nextYear(s); recordTradeWork(s); recordTradeWork(s); expect(resolveTradeChoice(s, 3, ending)).toBe(true);
    expect(tradeProgress(s)).toMatchObject({ chapter: 4, ending, clientId });
    expect(s.memories.some((m) => m.tag === `trade_legacy_${ending}`)).toBe(true);
    expect(s.rankIdx).toBe(0);
    const gold = s.gold; expect(resolveTradeChoice(s, 3, ending)).toBe(false); expect(s.gold).toBe(gold);
  });
  it('pays a delayed callback once, replaces a deceased client, and keeps independent cloned progress', () => {
    const s = ready(); resolveTradeChoice(s, 0, 'fit'); const gold = s.gold;
    nextYear(s); resolveScheduledConsequences(s); expect(s.gold).toBe(gold + 4);
    resolveScheduledConsequences(s); expect(s.gold).toBe(gold + 4);
    const old = tradeProgress(s).clientId!; s.world.characters[old].alive = false;
    recordTradeWork(s); recordTradeWork(s);
    const copy = cloneState(s); resolveTradeChoice(copy, 1, 'deny');
    expect(tradeProgress(s).chapter).toBe(1); expect(tradeProgress(copy).chapter).toBe(2);
    expect(tradeProgress(copy).clientId).not.toBe(old);
    expect(copy.feed.some((e) => e.tag === 'A NEW BUYER')).toBe(true);
    nextYear(copy); recordTradeWork(copy); recordTradeWork(copy); resolveTradeChoice(copy, 2, 'commons');
    nextYear(copy); recordTradeWork(copy); recordTradeWork(copy);
    expect(tradeAvailability(copy, 'trusted')).toContain('Settle honestly');
  });
  it('keeps callbacks personal rather than paying them to an heir', () => {
    const s = ready(); resolveTradeChoice(s, 0, 'fit');
    const heir = spawnKin(s, { kind: 'child', age: 18, isHeir: true }); s.dead = true;
    const inherited = gameReducer(s, { type: 'CONTINUE_AS_HEIR', heirId: heir.id });
    const gold = inherited.gold; nextYear(inherited); resolveScheduledConsequences(inherited);
    expect(inherited.gold).toBe(gold);
  });
  it('retains a profession at high rank and allows independent professional promotion', () => {
    const s = ready(); s.age = 40; s.stats = { health: 90, charm: 90, wits: 90, faith: 90 };
    s.world.characters[s.playerCharacterId].education!.qualifications.push('apprenticeship');
    s.world.characters[s.playerCharacterId].professionalHistory!.craft = { reputation: 60, completedActions: ['commission', 'guild_petition'], milestones: ['masterpiece'], contactIds: [], matters: [], actionsYear: -1, actionsUsed: 0, lastWorkedYear: s.world.currentYear };
    s.rankIdx = 0; expect(careerAvailability(s, careerById('guildmaster')!)).toBeNull();
    s.rankIdx = 5; s.occupation.careerId = 'abbot'; expect(deriveLifeRole(s)).toBe('clergy');
    expect(storyEligibilityMet(s, { type: 'role', roles: ['monarch'] })).toBe(true);
    s.occupation.careerId = 'trade_magnate'; expect(deriveLifeRole(s)).toBe('artisan_merchant');
  });
});

describe('clearer stories and feedback', () => {
  it.each([
    'Pay their amercements and keep out of it',
    'Spread it across the whole village',
    'Recall all seven and replace them',
    'Move the coinage to the front',
    'Put him out of the band and see him settled',
  ])('requires the promised payment for "%s" without blocking the whole story', (label) => {
    const event = PERSISTENT_WORLD_EVENTS.find(e => e.choices.some(c => c.label === label))!;
    const choice = event.choices.find(c => c.label === label)!;
    const s = ready(); s.gold = 0;
    expect(isChoiceEnabled(s, choice)).toBe(false);
    expect(event.choices.some(c => isChoiceEnabled(s, c))).toBe(true);
    const before = JSON.stringify(s);
    applyChoice(s, event, choice);
    expect(JSON.stringify(s)).toBe(before);
    s.gold = -(choice.outcome?.effects?.gold ?? 0);
    expect(isChoiceEnabled(s, choice)).toBe(true);
  });
  it('previews costs without rolling, prevents unaffordable choices, and records actual clamped changes', () => {
    const s = ready(); s.gold = 3;
    const choice: Choice = { label: 'Pay', costGold: 4, outcome: { text: 'Paid.', effects: { gold: -4, health: 50 } } };
    const event: GameEvent = { id: 'test', title: 'Test', category: 'arc', text: 'Test', choices: [choice] };
    const before = JSON.stringify(s); expect(choiceStakes(choice)).toContain('Costs 4g'); applyChoice(s, event, choice); expect(JSON.stringify(s)).toBe(before);
    s.gold = 8; s.stats.health = 90; applyChoice(s, event, choice);
    expect(s.gold).toBe(4); expect(s.feed.find((e) => e.text === 'Paid.')?.changes).toEqual(['Gold −4', 'Health +10']);
  });
  it('never collapses family deaths, major world events or player choices', () => {
    expect(isRoutineNews({ source: 'npc', tag: 'WORLD · CAREER' })).toBe(true);
    for (const tag of ['WORLD · DEATH', 'FAMILY', 'CHOICE', 'WAR']) expect(isRoutineNews({ source: 'world', tag })).toBe(false);
    expect(isRoutineNews({ source: 'player', tag: 'WORLD · CAREER' })).toBe(false);
  });
  it('remembers first steps after the feed rolls off and applies a six-year flavour cooldown', () => {
    const s = ready(); s.age = 2; s.world.characters[s.playerCharacterId].annualNarrativeYears = { baby_first_steps: s.world.currentYear - 1 };
    expect(pickAnnualMessage(s, ANNUAL_MESSAGES.filter((m) => m.id !== 'baby_first_steps').map((m) => m.id))).toBeNull();
    s.age = 20; s.world.characters[s.playerCharacterId].annualNarrativeYears = { fortune_coin: s.world.currentYear - 5 };
    const excluded = ANNUAL_MESSAGES.filter((m) => m.id !== 'fortune_coin').map((m) => m.id);
    expect(pickAnnualMessage(s, excluded)).toBeNull(); s.world.currentYear += 7;
    expect(pickAnnualMessage(s, excluded)?.id).toBe('fortune_coin');
  });
});
