import { varyBirthHousehold } from './birthCircumstances';
import type { BirthOriginId, GameState } from '@/types/game';
import { BIRTH_ORIGINS, birthWeights } from '@/data/birthOrigins';
import { pick, pickWeighted, rnd } from './random';
import { legacyStatus } from './lifeDepthState';
import { spawnKin } from './kinFactory';

export function chooseBirthOrigin(premium: boolean, selected?: BirthOriginId, weights?: Partial<Record<BirthOriginId, number>>): BirthOriginId {
  if (selected && BIRTH_ORIGINS.some(o => o.id === selected) && (selected !== 'royal' || premium)) return selected;
  const configured = birthWeights(premium, weights);
  return pickWeighted(BIRTH_ORIGINS, o => configured[o.id])?.id ?? 'peasant';
}
export function initializeBirthOrigin(state: GameState, selected?: BirthOriginId, weights?: Partial<Record<BirthOriginId, number>>): void {
  const origin = chooseBirthOrigin(state.lifetimeUnlocked, selected, weights);
  const def = BIRTH_ORIGINS.find(o => o.id === origin)!;
  const player = state.world.characters[state.playerCharacterId];
  const inheritedGold = Math.max(0, state.gold - 8);
  const inheritedRank = state.rankIdx;
  const parents = ['mother', 'father'].map(id => state.world.characters[id]);
  parents.forEach((parent, index) => {
    parent.age = rnd(index === 0 ? 22 : 26, index === 0 ? 36 : 42);
    parent.occupation.careerId = def.careers[index];
    parent.rankIdx = ['noble', 'royal'].includes(origin) ? 3 : 0;
    parent.socialStatus = legacyStatus(parent.rankIdx);
    parent.socialStatus.estate = origin === 'royal' ? 'royal' : parent.socialStatus.estate;
    parent.gold = Math.floor(def.wealth / 2);
    parent.bio = `${parent.name} keeps a ${def.name.toLowerCase()} household. ${def.advantage} ${def.burden}`;
    parent.spouseId = parents[1 - index].id;
  });
  player.guardianIds = parents.map(p => p.id);
  player.background = { origin, familyId: player.birthFamilyId!, guardianIds: [...player.guardianIds], contactId: def.contactId, householdWealth: def.wealth, inherited: false };
  player.socialStatus = legacyStatus(Math.max(inheritedRank, ['noble', 'royal'].includes(origin) ? 3 : 0));
  if (origin === 'royal') { player.socialStatus.estate = 'royal'; player.socialStatus.titles = ['Royal kin']; }
  player.rankIdx = state.rankIdx = Math.max(state.rankIdx, ['noble', 'royal'].includes(origin) ? 3 : 0);
  player.gold = state.gold = def.wealth + inheritedGold;
  const household = state.world.households.find(h => h.id === player.householdId)!;
  Object.assign(household, { wealth: state.gold, foodSecurity: Math.min(90, 40 + def.standing / 2), storedFood: Math.min(90, 35 + def.standing / 2), status: def.standing, residenceQuality: Math.max(25, def.standing), headId: 'father' });
  const family = state.world.families[player.birthFamilyId!];
  family.wealthTier = Math.min(4, Math.floor(def.wealth / 30));
  family.reputation = origin === 'royal' ? 40 : origin === 'noble' ? 25 : 0;
  family.name = `${parents[1].name}'s house`;
  state.holding.stores = Math.round(household.storedFood!);
  state.holding.security = Math.max(30, def.standing);
  state.holding.loyalty = origin === 'royal' ? 45 : 60;
  const contact = state.world.characters[def.contactId];
  if (contact) {
    contact.bio += ` A recurring contact of ${parents[1].name}'s household.`;
    contact.rel = origin === 'merchant' ? 30 : 65;
    if (origin === 'merchant') family.enemyFamilyIds = [contact.birthFamilyId!];
  }
  const roderick = state.world.characters.roderick;
  roderick.bio = `A household knight who stole a pear from the birth feast and denies it under oath.`;
  if (origin === 'royal') {
    const sibling = spawnKin(state, { kind: 'sibling', age: rnd(2, 7), role: 'Elder Royal Sibling', bio: 'First in the royal succession and determined to stay there.' });
    sibling.socialStatus = { estate: 'royal', martialHonour: 'none', titles: ['Royal heir'], grants: ['birthright'] };
    sibling.rankIdx = 3;
    sibling.background = { ...player.background, guardianIds: [...player.guardianIds] };
    state.world.characters.father.role = 'King · Thy Father';
  }
  state.feed[0].text = pick(def.introductions).replaceAll('{mother}', parents[0].name).replaceAll('{father}', parents[1].name).replaceAll('{player}', state.first);
  varyBirthHousehold(state,inheritedGold);
  player.bio = state.feed[0].text;
}
