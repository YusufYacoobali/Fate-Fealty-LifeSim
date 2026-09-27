import { makeState } from './helpers';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { syncPlayerToWorld } from '@/engine/gameState';
import { eventById, isChoiceEnabled } from '@/engine/eventPicker';
import { recipeContracts, recipePurpose } from '@/engine/craftingGuide';
import { RECIPES } from '@/data/rpg';
import { choiceHint, choiceStakes } from '@/engine/choiceFeedback';
import { forgeAvailability } from '@/engine/forgeEngine';
import { rpgAvailability } from '@/engine/rpgEngine';
import { timingGrade } from '@/engine/duelEngine';

function ready() {
  const s = makeState({ age: 24, gold: 50 });
  s.world.currentYear = s.bornYear + s.age;
  s.world.characters.roderick.age = 26;
  s.rpg.materials = { timber: 20, stone: 20, iron: 20, herbs: 20 };
  syncPlayerToWorld(s);
  return s;
}

describe('crafting and quest navigation', () => {
  it('links only live contracts that consume or benefit from the recipe', () => {
    const s = ready(), recipe = RECIPES.find(r => r.id === 'repair_kit')!;
    s.rpg.board = { year: s.world.currentYear, offers: [{ id: 'cart', templateId: 'broken_cart', clientId: null, attempted: false }] };
    expect(recipeContracts(s, recipe)[0]).toMatchObject({ title: 'The broken cart', purpose: 'Deliver one: 12g, +3 Reputation.' });
    expect(recipeContracts(s, RECIPES.find(r => r.id === 'healing_salve')!)).toEqual([]);
    s.rpg.board.offers[0].attempted = true;
    expect(recipeContracts(s, recipe)).toEqual([]);
    for (const item of RECIPES) expect(recipePurpose(s, item).length).toBeGreaterThan(50);
  });
  it('redirects the existing career craft action without spending an action', () => {
    const s = gameReducer(ready(), { type: 'CAREER_ACTION', action: 'craft' });
    expect(s.tab).toBe('do'); expect(s.doCat).toBe('quests'); expect(s.questSection).toBe('craft'); expect(s.actionClock.used).toBe(0);
  });
  it('keeps quest sections inside Do and migrates saves from the old main tab', () => {
    const s = gameReducer(ready(), { type: 'SET_QUEST_SECTION', section: 'craft', recipeId: 'repair_kit' });
    expect(s).toMatchObject({ tab: 'do', doCat: 'quests', questSection: 'craft', questRecipe: 'repair_kit' });
    const oldSave = JSON.parse(JSON.stringify(s)); oldSave.tab = 'quests'; oldSave.doCat = 'all';
    expect(normalizeGameState(oldSave)).toMatchObject({ tab: 'do', doCat: 'quests', questSection: 'craft', questRecipe: 'repair_kit' });
  });
  it('reveals Life and the quest result even when a saved encounter used another tab/filter', () => {
    let s = ready(); s.tab = 'do'; s.doCat = 'quests'; s.world.feedFilter = 'world';
    s.rpg.board = { year: s.world.currentYear, offers: [{ id: 'cart', templateId: 'broken_cart', clientId: null, attempted: false }] };
    s = gameReducer(s, { type: 'RPG', command: { kind: 'contract', id: 'cart' } });
    expect(s.tab).toBe('life'); expect(s.world.feedFilter).toBe('all');
    s.tab = 'do'; s.world.feedFilter = 'world';
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    s = gameReducer(s, { type: 'MISSION_CHOOSE', missionId: s.rpg.mission!.id, optionId: 'safe' });
    expect(s.tab).toBe('life'); expect(s.world.feedFilter).toBe('all'); expect(s.rpg.mission).toBeNull();
    expect(s.feed.some(entry => entry.text.includes('The cart reaches market'))).toBe(true);
  });
  it('does not navigate or charge for an unavailable quest', () => {
    let s = ready(); s.tab = 'do'; s.doCat = 'quests'; s.actionClock.used = s.actionClock.cap;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'expedition', id: 'woodland' } });
    expect(s.tab).toBe('do'); expect(s.rpg.mission).toBeNull(); expect(s.actionClock.used).toBe(s.actionClock.cap);
  });
  it('returns from a completed anvil lesson to its Life result without granting XP again', () => {
    let s = ready(); s.tab = 'do'; s.doCat = 'practice';
    s = gameReducer(s, { type: 'FORGE_START', task: { kind: 'practice' }, revision: s.rpg.revision });
    const id = s.rpg.forge!.id;
    s = gameReducer(s, { type: 'FORGE_QUICK', id });
    const xp = s.world.characters[s.playerCharacterId].skills!.craftsmanship.xp;
    s = gameReducer(s, { type: 'FORGE_CLOSE', id });
    expect(s.tab).toBe('life'); expect(s.rpg.forge).toBeNull();
    s = gameReducer(s, { type: 'FORGE_CLOSE', id });
    expect(s.world.characters[s.playerCharacterId].skills!.craftsmanship.xp).toBe(xp);
  });
  it('offers the exact crafted quality and equips directly from a settled forge', () => {
    let s = ready();
    s.world.characters[s.playerCharacterId].skills!.craftsmanship = { level: 6, xp: 0 };
    s = gameReducer(s, { type: 'FORGE_START', task: { kind: 'recipe', recipeId: 'wood_axe' }, revision: s.rpg.revision });
    const id = s.rpg.forge!.id;
    expect(s.rpg.forge?.craftedKey).toBe('wood_axe:fine');
    expect(rpgAvailability(s, { kind: 'equip', id: 'wood_axe:fine' })).not.toBeNull();
    s = gameReducer(s, { type: 'FORGE_QUICK', id });
    s = gameReducer(s, { type: 'RPG', command: { kind: 'equip', id: 'wood_axe:fine' }, revision: s.rpg.revision });
    expect(s.rpg.equipment.tool).toBe('wood_axe:fine'); expect(s.actionClock.used).toBe(1);
    expect(s.rpg.forge?.phase).toBe('result');
  });
  it('uses the last crafted consumable once without another action', () => {
    let s = ready(); s.stats.health = 40;
    s = gameReducer(s, { type: 'RPG', command: { kind: 'craft', id: 'healing_salve' } });
    expect(s.rpg.lastCrafted).toEqual({ key: 'healing_salve', recipeId: 'healing_salve' });
    const action = { type: 'RPG' as const, command: { kind: 'use_good' as const, id: 'healing_salve' }, revision: s.rpg.revision };
    s = gameReducer(s, action); s = gameReducer(s, action);
    expect(s.stats.health).toBe(50); expect(s.rpg.goods.healing_salve).toBe(0); expect(s.actionClock.used).toBe(1);
  });
  it('rejects a journey without enough remaining actions and lessons when the year is full', () => {
    const s = ready(); s.actionClock.used = s.actionClock.cap - 2;
    expect(rpgAvailability(s, { kind: 'expedition', id: 'woodland' })).toContain('3 actions');
    expect(gameReducer(s, { type: 'RPG', command: { kind: 'expedition', id: 'woodland' } }).rpg.mission).toBeNull();
    s.actionClock.used = s.actionClock.cap;
    expect(forgeAvailability(s, { kind: 'practice' })).toContain('1 action');
  });
  it('resumes a legacy partly completed expedition by paying only its remaining stages', () => {
    let s = ready();
    s.rpg.expedition = { id: 'woodland', stage: 1, ownerId: s.playerCharacterId };
    s = gameReducer(s, { type: 'RPG', command: { kind: 'expedition', id: 'woodland' } });
    expect(s.actionClock.used).toBe(2); expect(s.rpg.mission?.stage).toBe(1);
  });
});

describe('event combat stakes', () => {
  it.each(['won', 'lost', 'yielded'] as const)('starts the wagered duel and settles %s once, even after reload', outcome => {
    let s = ready();
    const event = eventById('rival_wagered_challenge')!, choice = event.choices[0];
    s.pendingEvent = { eventId: event.id, bindings: { rival: 'roderick' } };
    expect(isChoiceEnabled(s, choice)).toBe(true);
    s = gameReducer(s, { type: 'CHOOSE', choice });
    expect(s.gold).toBe(40); expect(s.pendingEvent).toBeNull();
    expect(s.duel?.opponentId).toBe('roderick');
    expect(s.duel?.stakes?.win.gold).toBe(30);
    s.duel!.outcome = outcome;
    s.duel!.combat!.phase = 'resolved';
    s = normalizeGameState(JSON.parse(JSON.stringify(s)));
    s = gameReducer(s, { type: 'DUEL_CLOSE' });
    expect(s.gold).toBe(outcome === 'won' ? 70 : 40);
    const settled = JSON.stringify(s);
    expect(JSON.stringify(gameReducer(s, { type: 'DUEL_CLOSE' }))).toBe(settled);
  });
  it('blocks stale or unaffordable challenges without taking money', () => {
    let s = ready(); s.gold = 3;
    const event = eventById('rival_wagered_challenge')!, choice = event.choices[0];
    s.pendingEvent = { eventId: event.id, bindings: { rival: 'roderick' } };
    s = gameReducer(s, { type: 'CHOOSE', choice });
    expect(s.gold).toBe(3); expect(s.duel).toBeNull();
    s.gold = 50; s.world.characters.roderick.alive = false;
    expect(isChoiceEnabled(s, choice)).toBe(false);
  });
  it('offers a peaceful alternative and settles grain losses for yielding', () => {
    let s = ready();
    const event = eventById('grain_cart_champion')!;
    s.pendingEvent = { eventId: event.id, bindings: { challenger: 'roderick' } };
    const peaceful = gameReducer(s, { type: 'CHOOSE', choice: event.choices[1] });
    expect(peaceful.duel).toBeNull(); expect(peaceful.holding.stores).toBe(s.holding.stores - 3);
    const stores = s.holding.stores;
    s = gameReducer(s, { type: 'CHOOSE', choice: event.choices[0] });
    s = gameReducer(s, { type: 'DUEL_RESPOND', responseId: 'yield' });
    s = gameReducer(s, { type: 'DUEL_CLOSE' });
    expect(s.holding.stores).toBe(stores - 10);
  });
});

describe('clear costs and legacy settings', () => {
  it('shows a gold cost once but keeps risks and unlabelled costs', () => {
    const quack = eventById('peasant_quack_doctor')!.choices[0];
    expect(choiceStakes(quack)).toEqual([]);
    expect(choiceStakes({ label: 'Buy the medicine', costGold: 6, outcome: { text: 'Done', effects: { gold: -6 } } })).toEqual(['Costs 6g']);
    expect(choiceHint({ label: 'Buy (6g)', costGold: 6, hint: 'Pay 6g' })).toBeUndefined();
    expect(choiceStakes({ label: 'Gamble (6g)', costGold: 6, success: { text: 'Won' }, failure: { text: 'Lost', effects: { health: -4 } } })).toEqual(['Outcome uncertain', 'Failure can cause injury']);
  });
  it('drops saved timing assistance rather than retaining an invisible advantage', () => {
    let s = ready(); const event = eventById('grain_cart_champion')!;
    s.pendingEvent = { eventId: event.id, bindings: { challenger: 'roderick' } };
    s = gameReducer(s, { type: 'CHOOSE', choice: event.choices[0] });
    const raw = JSON.parse(JSON.stringify(s));
    raw.settings.timingAssist = true; raw.duel.combat.assist = true;
    const loaded = normalizeGameState(raw);
    expect(loaded.settings).not.toHaveProperty('timingAssist');
    expect(loaded.duel?.combat).not.toHaveProperty('assist');
    expect(timingGrade(loaded, 10000)).toBe('miss');
  });
});
