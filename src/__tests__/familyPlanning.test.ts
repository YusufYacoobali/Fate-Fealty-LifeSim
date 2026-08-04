import { GameState } from '@/types/game';
import {
  ADOPTION_COST,
  adoptChild,
  childbearingPartner,
  familyPlanningRoute,
  tickFamilyFormation,
  tryForChild,
} from '@/engine/familyFormationEngine';
import { contextualActions } from '@/engine/relationshipEngine';
import { gameReducer } from '@/state/gameReducer';
import { makeState } from './helpers';

/** A state where the player is married to `agnes`, both of childbearing age. */
function marriedState(overrides: Partial<GameState> = {}): GameState {
  let state = makeState({ age: 24, gold: 60, attraction: 'women', ...overrides });
  const candidate = state.kin.find((kin) => kin.id === 'agnes')!;
  candidate.age = 24;
  state.world.proposalFromId = candidate.id;
  state = gameReducer(state, { type: 'KIN_INTERACT', id: candidate.id, action: 'accept_proposal' });
  return state;
}

describe('family planning routes', () => {
  it('offers a pregnancy to a couple who can conceive', () => {
    const state = marriedState();
    expect(familyPlanningRoute(state, 'agnes')).toBe('pregnancy');
    expect(contextualActions(state, state.kin.find((kin) => kin.id === 'agnes')!)).toContain('try_for_child');
  });

  it('offers to take in a child when neither partner can carry one', () => {
    const state = marriedState({ gender: 'woman', attraction: 'women' });
    // Two women: the simulation has no pregnancy route for them.
    state.world.characters[state.playerCharacterId].gender = 'woman';
    state.world.characters.agnes.gender = 'woman';

    expect(childbearingPartner(state, 'agnes')).not.toBeNull();
    // Past childbearing age, the adoption road is the only one left.
    state.world.characters[state.playerCharacterId].age = 60;
    state.world.characters.agnes.age = 60;
    expect(childbearingPartner(state, 'agnes')).toBeNull();
    expect(familyPlanningRoute(state, 'agnes')).toBe('adoption');
  });

  it('offers nothing to someone who is not the player\'s spouse', () => {
    const state = makeState({ age: 24 });
    expect(familyPlanningRoute(state, 'agnes')).toBeNull();
  });

  it('withdraws the offer while an arrival is already expected', () => {
    const state = marriedState();
    adoptChild(state, 'agnes');
    expect(familyPlanningRoute(state, 'agnes')).toBeNull();
  });
});

describe('trying for a child', () => {
  it('records an expected pregnancy naming both parents', () => {
    const state = marriedState();
    // Retry across years rather than depending on a single roll.
    let expecting = false;
    for (let attempt = 0; attempt < 40 && !expecting; attempt += 1) expecting = tryForChild(state, 'agnes');

    expect(expecting).toBe(true);
    const expected = state.world.expectedChildren.find((item) => item.status === 'expected')!;
    expect(expected.route).toBe('pregnancy');
    expect(expected.parentIds).toEqual(expect.arrayContaining([state.playerCharacterId, 'agnes']));
    expect(expected.dueYear).toBe(state.world.currentYear + 1);
  });

  it('delivers the child into the player\'s own kin roster', () => {
    const state = marriedState();
    let expecting = false;
    for (let attempt = 0; attempt < 40 && !expecting; attempt += 1) expecting = tryForChild(state, 'agnes');
    expect(expecting).toBe(true);

    state.world.currentYear += 1;
    tickFamilyFormation(state);

    const child = Object.values(state.world.characters).find((character) => character.kind === 'child' && character.age === 0);
    expect(child).toBeDefined();
    expect(child!.parentIds).toEqual(expect.arrayContaining([state.playerCharacterId, 'agnes']));
    expect(state.world.characters[state.playerCharacterId].childIds).toContain(child!.id);
  });

  it('runs through the reducer and spends an action', () => {
    const state = marriedState();
    const used = state.actionClock.used;
    const next = gameReducer(state, { type: 'KIN_INTERACT', id: 'agnes', action: 'try_for_child' });

    expect(next.actionClock.used).toBe(used + 1);
    expect(next.feed[next.feed.length - 1].tag).toMatch(/CHILD/);
  });
});

describe('taking in a child', () => {
  it('charges the household and expects an adoption', () => {
    const state = marriedState();
    const gold = state.gold;
    adoptChild(state, 'agnes');

    expect(state.gold).toBe(gold - ADOPTION_COST);
    const expected = state.world.expectedChildren.find((item) => item.status === 'expected')!;
    expect(expected.route).toBe('adoption');
    expect(expected.parentIds).toEqual(expect.arrayContaining([state.playerCharacterId, 'agnes']));
  });

  it('is unavailable without the fee', () => {
    const state = marriedState({ gold: 2 });
    state.gold = 2;
    state.world.characters[state.playerCharacterId].age = 60;
    state.world.characters.agnes.age = 60;
    const next = gameReducer(state, { type: 'KIN_INTERACT', id: 'agnes', action: 'adopt_child' });

    expect(next.gold).toBe(2);
    expect(next.world.expectedChildren).toHaveLength(0);
  });
});
