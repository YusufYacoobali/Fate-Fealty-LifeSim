import { GameState, WorldCharacter } from '@/types/game';
import {
  affairPartnerId,
  canSeduce,
  contextualActions,
  isRomanceEligible,
  relationMatchesFilter,
  tickAffairs,
} from '@/engine/relationshipEngine';
import { assault, blackmail, frameThem, knownSecretOf, murder, spreadRumour, stealFrom } from '@/engine/misdeedEngine';
import { gameReducer } from '@/state/gameReducer';
import { spawnKin } from '@/engine/kinFactory';
import { killKin } from '@/engine/kinFactory';
import { tickFamilyFormation, tryForAffairChild } from '@/engine/familyFormationEngine';
import { makeState } from './helpers';

function target(state: GameState, id = 'merek'): WorldCharacter {
  return state.world.characters[id];
}

function giveSecret(state: GameState, id: string) {
  const person = target(state, id);
  person.secrets = [{ id: `secret_${id}`, type: 'hidden_debt', knownByIds: [state.playerCharacterId], revealed: false, severity: 40, createdYear: 1320 }];
  return person;
}

/** Marry the player to Agnes so affairs have someone to wound. */
function married(): GameState {
  let s = makeState({ age: 26, gold: 40, attraction: 'women' });
  const agnes = s.kin.find((kin) => kin.id === 'agnes')!;
  agnes.age = 26;
  agnes.gender = 'woman';
  agnes.attraction = 'men';
  s.world.proposalFromId = agnes.id;
  s = gameReducer(s, { type: 'KIN_INTERACT', id: agnes.id, action: 'accept_proposal' });
  return s;
}

describe('cruelty lands on the other person', () => {
  it('takes real coin when blackmail succeeds', () => {
    const s = makeState({ age: 24 });
    const victim = giveSecret(s, 'merek');
    victim.gold = 40;
    const beforeGold = s.gold;

    blackmail(s, victim);

    expect(victim.gold).toBeLessThan(40);
    expect(s.gold).toBeGreaterThan(beforeGold);
    expect(knownSecretOf(s, victim)).toBeDefined();
  });

  it('only offers blackmail when a secret is actually known', () => {
    const s = makeState({ age: 24 });
    const stranger = s.kin.find((kin) => kin.id === 'merek')!;
    stranger.secrets = [];
    expect(contextualActions(s, stranger)).not.toContain('blackmail');

    giveSecret(s, 'merek');
    expect(contextualActions(s, s.kin.find((kin) => kin.id === 'merek')!)).toContain('blackmail');
  });

  it('costs the victim standing when a rumour takes hold', () => {
    const s = makeState({ age: 30, stats: { health: 60, charm: 100, wits: 60, faith: 50 } });
    s.reputation = 80;
    const victim = target(s);
    const family = s.world.families[victim.birthFamilyId!];
    const beforeReputation = family.reputation;

    spreadRumour(s, victim);

    expect(family.reputation).toBeLessThanOrEqual(beforeReputation);
    expect(victim.worldMemories?.length ?? 0).toBeGreaterThan(0);
  });

  it('moves the law from the player onto whoever is framed', () => {
    const s = makeState({ age: 30, stats: { health: 60, charm: 60, wits: 100, faith: 50 } });
    s.reputation = 60;
    const player = s.world.characters[s.playerCharacterId];
    player.legalState!.suspicion = 30;
    const victim = target(s);
    victim.stats.charm = 10;

    frameThem(s, victim);

    expect(player.legalState!.suspicion).toBeLessThan(30);
    expect(victim.legalState!.charges.length).toBeGreaterThan(0);
  });

  it('either takes their coin or turns them against thee', () => {
    const s = makeState({ age: 24 });
    const victim = target(s);
    victim.gold = 30;
    const beforeGold = victim.gold;

    stealFrom(s, victim);

    const relation = Object.values(s.world.relationships).find(
      (item) => item.aId === victim.id || item.bId === victim.id,
    );
    // One or the other must have happened; a theft is never a non-event.
    expect(victim.gold < beforeGold || relation?.flags.includes('feud')).toBe(true);
  });

  it('leaves family out of the cruelty on offer', () => {
    const s = makeState({ age: 24 });
    const mother = s.kin.find((kin) => kin.id === 'mother')!;
    const actions = contextualActions(s, mother);
    expect(actions).not.toContain('spread_rumour');
    expect(actions).not.toContain('steal_from');
  });
});

describe('violence', () => {
  it('always draws a charge, and always hurts one of the two', () => {
    const s = makeState({ age: 30, stats: { health: 95, charm: 50, wits: 50, faith: 50 } });
    const victim = target(s);
    victim.stats.health = 40;
    const beforeVictim = victim.stats.health;
    const beforePlayer = s.stats.health;

    assault(s, victim);

    const player = s.world.characters[s.playerCharacterId];
    // The charge lands whether or not the attack did — swinging is the crime.
    expect(player.legalState!.charges.some((charge) => charge.offence.includes('assault'))).toBe(true);
    expect(player.legalState!.suspicion).toBeGreaterThan(0);
    // Either they came off worse or thou did; violence is never a non-event.
    expect(victim.stats.health < beforeVictim || s.stats.health < beforePlayer).toBe(true);
  });

  it('injures the victim outright when badly outmatched', () => {
    const s = makeState({ age: 30, stats: { health: 100, charm: 50, wits: 50, faith: 50 } });
    const victim = target(s);
    // A 100-vs-0 gap puts the success chance at 1, so this branch is certain.
    victim.stats.health = 0;
    const beforeInjuries = victim.healthConditions?.length ?? 0;

    assault(s, victim);

    expect(victim.healthConditions!.length).toBeGreaterThan(beforeInjuries);
  });

  it('can actually kill, and the law hears about it either way', () => {
    const s = makeState({ age: 30, stats: { health: 100, charm: 50, wits: 100, faith: 50 } });
    const victim = target(s);
    victim.stats.health = 10;

    murder(s, victim);

    const player = s.world.characters[s.playerCharacterId];
    expect(player.legalState!.charges.length).toBeGreaterThan(0);
    if (!victim.alive) {
      // A killing is remembered by the world, not just by the feed.
      expect(s.world.history.some((entry) => entry.type === 'killing')).toBe(true);
    } else {
      expect(victim.stats.health).toBeLessThan(10 + 1);
    }
  });

  it('allows killing close blood while keeping ordinary violence restricted', () => {
    const s = makeState({ age: 30 });
    const actions = contextualActions(s, s.kin.find((kin) => kin.id === 'mother')!);
    expect(actions).not.toContain('assault');
    expect(actions).toContain('murder');
    expect(actions).not.toContain('duel');
  });

  it('offers violence against an unrelated villager', () => {
    const s = makeState({ age: 30 });
    const actions = contextualActions(s, s.kin.find((kin) => kin.id === 'merek')!);
    expect(actions).toEqual(expect.arrayContaining(['assault', 'murder']));
  });

  it('unlocks killing at age eleven, not before', () => {
    const child = makeState({ age: 10 });
    const targetAtTen = child.kin.find((kin) => kin.id === 'merek')!;
    expect(contextualActions(child, targetAtTen)).not.toContain('murder');

    child.age = 11;
    child.world.characters[child.playerCharacterId].age = 11;
    expect(contextualActions(child, targetAtTen)).toContain('murder');
  });
});

describe('affairs', () => {
  it('needs a marriage on one side to be worth anything', () => {
    const single = makeState({ age: 26, attraction: 'women' });
    const agnes = single.kin.find((kin) => kin.id === 'agnes')!;
    agnes.age = 26;
    agnes.gender = 'woman';
    agnes.attraction = 'men';
    expect(canSeduce(single, agnes)).toBe(false);

    const wed = married();
    const merchant = wed.kin.find((kin) => kin.id === 'joan')!;
    merchant.age = 27;
    merchant.gender = 'woman';
    merchant.attraction = 'men';
    expect(canSeduce(wed, merchant)).toBe(true);
  });

  it('records the affair and offers a way out of it', () => {
    const s = married();
    const other = s.kin.find((kin) => kin.id === 'joan')!;
    other.age = 27;
    other.gender = 'woman';
    other.attraction = 'men';
    const relation = Object.values(s.world.relationships).find(
      (item) => (item.aId === s.playerCharacterId && item.bId === other.id) || (item.bId === s.playerCharacterId && item.aId === other.id),
    );
    relation!.flags.push('affair');

    expect(affairPartnerId(s)).toBe(other.id);
    const actions = contextualActions(s, other);
    expect(actions).toContain('end_affair');
    expect(actions).not.toContain('seduce');
    expect(actions).toEqual(expect.arrayContaining(['flirt', 'court', 'secret_meeting', 'spend_night', 'promise_future']));
    expect(relationMatchesFilter(s, other, 'romance')).toBe(true);
  });

  it('uses a real world spouse and makes the lover single when that spouse dies', () => {
    const s = makeState({ age: 26, attraction: 'women' });
    const lover = s.kin.find((kin) => kin.id === 'joan')!;
    lover.age = 26;
    lover.gender = 'woman';
    lover.attraction = 'men';
    const husband = spawnKin(s, { kind: 'acquaintance', age: 29, gender: 'man', name: 'Hugh' });
    lover.spouseId = husband.id;
    husband.spouseId = lover.id;

    expect(canSeduce(s, lover)).toBe(true);
    expect(s.world.characters[lover.spouseId!]).toBe(husband);
    killKin(s, husband.id);
    expect(lover.spouseId).toBeUndefined();
    expect(isRomanceEligible(s, lover)).toBe(true);
  });

  it('can produce a genealogically real illegitimate child with a lover', () => {
    const s = makeState({ age: 26, attraction: 'women' });
    const lover = s.kin.find((kin) => kin.id === 'joan')!;
    lover.age = 26;
    lover.gender = 'woman';
    lover.attraction = 'men';
    const relation = Object.values(s.world.relationships).find(
      (item) => (item.aId === s.playerCharacterId && item.bId === lover.id) || (item.bId === s.playerCharacterId && item.aId === lover.id),
    )!;
    relation.flags.push('affair');

    for (let attempt = 0; attempt < 100 && !s.world.expectedChildren.length; attempt += 1) tryForAffairChild(s, lover.id);
    expect(s.world.expectedChildren[0]?.route).toBe('illegitimate');
    s.world.currentYear = s.world.expectedChildren[0].dueYear;
    tickFamilyFormation(s);
    const child = Object.values(s.world.characters).find((person) => person.lineageStatus === 'illegitimate');
    expect(child?.parentIds).toEqual(expect.arrayContaining([s.playerCharacterId, lover.id]));
    expect(child?.role).toBe('Thy Illegitimate Child');
    expect(child?.isHeir).toBe(false);
  });

  it('is eventually discovered, and the spouse reacts', () => {
    const s = married();
    const other = s.kin.find((kin) => kin.id === 'joan')!;
    const relation = Object.values(s.world.relationships).find(
      (item) => (item.aId === s.playerCharacterId && item.bId === other.id) || (item.bId === s.playerCharacterId && item.aId === other.id),
    );
    relation!.flags.push('affair');
    const beforeReputation = s.reputation;

    // Discovery is a yearly roll; over many years it must land.
    for (let year = 0; year < 60 && !relation!.sharedMemories.includes('affair_exposed'); year += 1) {
      s.age += 1;
      s.world.currentYear += 1;
      tickAffairs(s);
    }

    expect(affairPartnerId(s)).toBe(other.id);
    expect(relation!.sharedMemories).toContain('affair_exposed');
    expect(s.tags).toContain('affair_exposed');
    expect(s.reputation).toBeLessThan(beforeReputation);
    expect(contextualActions(s, other)).toContain('end_affair');
  });

  it('leaves an unexposed affair alone when there is no spouse to wound', () => {
    const s = makeState({ age: 26 });
    expect(affairPartnerId(s)).toBeNull();
    expect(tickAffairs(s).tags).not.toContain('affair_exposed');
  });
});

describe('household authority', () => {
  it('offers heir choices only for the player\'s own children', () => {
    const s = makeState({ age: 40, gold: 40 });
    const child = spawnKin(s, { kind: 'child', name: 'Alys', age: 16, gender: 'woman' });
    const stranger = s.kin.find((kin) => kin.id === 'merek')!;

    expect(contextualActions(s, child)).toContain(child.isHeir ? 'disinherit' : 'name_heir');
    expect(contextualActions(s, stranger)).not.toContain('name_heir');
    expect(contextualActions(s, stranger)).not.toContain('disinherit');
  });

  it('moves the inheritance to whoever is named, and takes it back', () => {
    let s = makeState({ age: 40, gold: 40 });
    const first = spawnKin(s, { kind: 'child', name: 'Alys', age: 16, gender: 'woman' });
    const second = spawnKin(s, { kind: 'child', name: 'Wren', age: 14, gender: 'man' });

    s = gameReducer(s, { type: 'KIN_INTERACT', id: first.id, action: 'name_heir' });
    expect(s.world.characters[first.id].isHeir).toBe(true);

    // Only one heir at a time: naming the second must clear the first.
    s = gameReducer(s, { type: 'KIN_INTERACT', id: second.id, action: 'name_heir' });
    expect(s.world.characters[second.id].isHeir).toBe(true);
    expect(s.world.characters[first.id].isHeir).toBe(false);

    s = gameReducer(s, { type: 'KIN_INTERACT', id: second.id, action: 'disinherit' });
    expect(s.world.characters[second.id].isHeir).toBe(false);
  });
});
