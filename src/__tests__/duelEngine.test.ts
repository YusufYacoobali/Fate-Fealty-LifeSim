import { GameState } from '@/types/game';
import { DUEL_MOVES, DUEL_MOVE_BY_ID, movesForKind } from '@/content/duelMoves';
import {
  DUEL_MAX_ROUNDS,
  canYield,
  concludeDuel,
  duelAvailability,
  duelResponses,
  duelTelegraph,
  respondToDuel,
  responseChance,
  startDuel,
} from '@/engine/duelEngine';
import { contextualActions } from '@/engine/relationshipEngine';
import { gameReducer } from '@/state/gameReducer';
import { normalizeGameState } from '@/state/persistence';
import { makeState } from './helpers';

function readyToFight(): GameState {
  const s = makeState({ age: 24, gold: 60 });
  s.inventory = ['sword'];
  const roderick = s.world.characters.roderick;
  roderick.age = 26;
  return s;
}

/** Answer exchanges until the fight resolves, so tests never hang. */
function fightToTheEnd(state: GameState, pick: (state: GameState) => string): GameState {
  for (let guard = 0; guard < DUEL_MAX_ROUNDS + 4 && state.duel && !state.duel.outcome; guard += 1) {
    respondToDuel(state, pick(state));
  }
  return state;
}

describe('duel content', () => {
  it('gives every exchange several distinct answers', () => {
    for (const move of DUEL_MOVES) {
      expect(move.responses.length).toBeGreaterThanOrEqual(3);
      const ids = move.responses.map((response) => response.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(move.kinds.length).toBeGreaterThan(0);
    }
  });

  it('leaves both kinds of fight with exchanges to draw from', () => {
    expect(movesForKind('duel').length).toBeGreaterThan(2);
    expect(movesForKind('brawl').length).toBeGreaterThan(2);
  });

  it('spreads the answers across attributes so no single stat wins every fight', () => {
    const stats = new Set(DUEL_MOVES.flatMap((move) => move.responses.map((response) => response.stat)));
    expect(stats.size).toBeGreaterThanOrEqual(3);
  });
});

describe('duel availability', () => {
  it('needs a blade or a station for a formal duel', () => {
    const bare = makeState({ age: 24 });
    bare.world.characters.roderick.age = 26;
    expect(duelAvailability(bare, 'roderick', 'duel').available).toBe(false);
    // A brawl asks for nothing but temper.
    expect(duelAvailability(bare, 'roderick', 'brawl').available).toBe(true);

    expect(duelAvailability(readyToFight(), 'roderick', 'duel').available).toBe(true);
  });

  it('refuses to raise a hand against close blood', () => {
    const s = readyToFight();
    expect(duelAvailability(s, 'mother', 'duel')).toMatchObject({ available: false });
    expect(duelAvailability(s, 'mother', 'brawl')).toMatchObject({ available: false });
  });

  it('offers both fights on a rival, and refuses a second one mid-fight', () => {
    const s = readyToFight();
    const roderick = s.kin.find((kin) => kin.id === 'roderick')!;
    expect(contextualActions(s, roderick)).toEqual(expect.arrayContaining(['duel', 'brawl']));

    startDuel(s, 'roderick', 'duel');
    expect(duelAvailability(s, 'roderick', 'duel')).toMatchObject({ available: false, reason: 'A fight is already underway' });
  });
});

describe('fighting it out', () => {
  it('telegraphs an attack and offers answers naming the opponent', () => {
    const s = readyToFight();
    startDuel(s, 'roderick', 'duel');

    expect(s.duel).not.toBeNull();
    expect(duelTelegraph(s)).toContain('Sir Roderick');
    // No placeholder may survive into what the player reads.
    expect(duelTelegraph(s)).not.toMatch(/\{\w+\}/);
    for (const response of duelResponses(s)) {
      expect(response.text.label).not.toMatch(/\{\w+\}/);
      expect(response.text.hint).not.toMatch(/\{\w+\}/);
    }
  });

  it('always resolves, and never past the round limit', () => {
    const s = readyToFight();
    startDuel(s, 'roderick', 'duel');
    fightToTheEnd(s, (state) => duelResponses(state)[0].id);

    expect(s.duel?.outcome).toBeDefined();
    expect(s.duel!.round).toBeLessThanOrEqual(DUEL_MAX_ROUNDS + 1);
  });

  it('allows yielding between exchanges without forcing further injury', () => {
    const s = readyToFight();
    startDuel(s, 'roderick', 'duel');
    expect(canYield(s)).toBe(true);

    respondToDuel(s, 'yield');
    expect(s.duel?.outcome).toBe('yielded');
  });

  it('ends immediately on a yield once it is allowed', () => {
    const s = readyToFight();
    startDuel(s, 'roderick', 'duel');
    // Advance a few exchanges with the safest answers available.
    for (let i = 0; i < 3 && s.duel && !s.duel.outcome; i += 1) {
      const responses = duelResponses(s);
      respondToDuel(s, responses[responses.length - 1].id);
    }
    if (!s.duel || s.duel.outcome) return; // decided early; nothing to yield from

    expect(canYield(s)).toBe(true);
    respondToDuel(s, 'yield');
    expect(s.duel?.outcome).toBe('yielded');
  });

  it('lets attributes move the odds', () => {
    const weak = readyToFight();
    weak.stats = { health: 10, charm: 10, wits: 10, faith: 10 };
    const strong = readyToFight();
    strong.stats = { health: 95, charm: 95, wits: 95, faith: 95 };
    const response = DUEL_MOVE_BY_ID.high_swing.responses[0];

    expect(responseChance(strong, response, strong.world.characters.roderick))
      .toBeGreaterThan(responseChance(weak, response, weak.world.characters.roderick));
  });
});

describe('what a fight costs', () => {
  it('pays out standing for a won duel and marks the loser', () => {
    const s = readyToFight();
    startDuel(s, 'roderick', 'duel');
    s.duel!.outcome = 'won';
    s.duel!.verdict = 'x';
    const beforeReputation = s.reputation;
    const beforeProgress = s.rankProgress;
    const beforeOpponentHealth = s.world.characters.roderick.stats.health;

    concludeDuel(s);

    expect(s.duel).toBeNull();
    expect(s.reputation).toBeGreaterThan(beforeReputation);
    expect(s.rankProgress).toBeGreaterThan(beforeProgress);
    expect(s.world.characters.roderick.stats.health).toBeLessThan(beforeOpponentHealth);
  });

  it('costs standing and health when lost', () => {
    const s = readyToFight();
    startDuel(s, 'roderick', 'duel');
    s.duel!.playerVigour = 10;
    s.duel!.outcome = 'lost';
    s.duel!.verdict = 'x';
    const beforeHealth = s.stats.health;

    concludeDuel(s);
    expect(s.stats.health).toBeLessThan(beforeHealth);
    expect(s.reputation).toBeLessThan(0);
  });

  it('brings the law down on a brawl but not on a duel', () => {
    const brawler = readyToFight();
    startDuel(brawler, 'roderick', 'brawl');
    brawler.duel!.outcome = 'won';
    brawler.duel!.verdict = 'x';
    concludeDuel(brawler);
    expect(brawler.world.characters[brawler.playerCharacterId].legalState!.suspicion).toBeGreaterThan(0);

    const duellist = readyToFight();
    startDuel(duellist, 'roderick', 'duel');
    duellist.duel!.outcome = 'won';
    duellist.duel!.verdict = 'x';
    concludeDuel(duellist);
    expect(duellist.world.characters[duellist.playerCharacterId].legalState!.suspicion).toBe(0);
  });
});

describe('duels through the reducer', () => {
  it('opens a fight for one action and blocks other actions until it ends', () => {
    let s = readyToFight();
    const used = s.actionClock.used;
    s = gameReducer(s, { type: 'KIN_INTERACT', id: 'roderick', action: 'duel' });

    expect(s.duel).not.toBeNull();
    expect(s.actionClock.used).toBe(used + 1);

    // A second kin action must not slip through while steel is out.
    const during = gameReducer(s, { type: 'KIN_INTERACT', id: 'agnes', action: 'praise' });
    expect(during.actionClock.used).toBe(s.actionClock.used);
  });

  it('will not conclude a fight that is still undecided', () => {
    let s = readyToFight();
    s = gameReducer(s, { type: 'KIN_INTERACT', id: 'roderick', action: 'duel' });
    const stillFighting = gameReducer(s, { type: 'DUEL_CLOSE' });
    expect(stillFighting.duel).not.toBeNull();
  });

  it('clears the fight once the player closes a decided one', () => {
    let s = readyToFight();
    s = gameReducer(s, { type: 'KIN_INTERACT', id: 'roderick', action: 'duel' });
    while (s.duel && !s.duel.outcome) {
      s = gameReducer(s, { type: 'DUEL_RESPOND', responseId: duelResponses(s)[0].id });
    }
    s = gameReducer(s, { type: 'DUEL_CLOSE' });
    expect(s.duel).toBeNull();
  });

  it('restores a half-fought duel from a save without rerolling it', () => {
    const s = readyToFight();
    startDuel(s, 'roderick', 'duel');
    expect(s.duel).not.toBeNull();

    expect(normalizeGameState(s).duel).toEqual(s.duel);
  });
});
