import { contextualActions } from '@/engine/relationshipEngine';
import { familyPlanningRoute, childbearingPartner } from '@/engine/familyFormationEngine';
import { spawnKin } from '@/engine/kinFactory';
import { ageUp } from '@/engine/lifeDirector';
import { createLife } from '@/engine/gameState';

describe('repro: real flow', () => {
  function grownWoman() {
    let state = createLife({ gender: 'woman', attraction: 'men' } as never);
    state.world.characters[state.playerCharacterId].gender = 'woman';
    state.gender = 'woman';
    state.attraction = 'men';
    while (state.age < 26 && !state.dead) { state.pendingEvent = null; state = ageUp(state); }
    return state;
  }

  it('female player + male spouse after living to 26', () => {
    const state = grownWoman();
    const player = state.world.characters[state.playerCharacterId];
    const spouse = spawnKin(state, { kind: 'spouse', gender: 'man', age: 28 });
    console.log('player world age', player.age, 'gender', player.gender, '| state.age', state.age);
    console.log('spouse', spouse.gender, spouse.age);
    console.log('childbearingPartner =', childbearingPartner(state, spouse.id)?.name ?? 'NONE');
    console.log('route =', familyPlanningRoute(state, spouse.id));
    console.log('try_for_child =', contextualActions(state, spouse).includes('try_for_child'));
    expect(true).toBe(true);
  });

  it('what does a fresh life have for player age/gender', () => {
    const state = createLife();
    const p = state.world.characters[state.playerCharacterId];
    console.log('fresh: world player age', p.age, 'gender', p.gender, 'state.gender', state.gender);
    expect(true).toBe(true);
  });
});
