import { FactionKey, GameState } from '@/types/game';
import { chance, clamp, rnd } from './random';
import { appendWorldHistory } from './worldJournal';

const FACTIONS: FactionKey[] = ['crown', 'church', 'guilds', 'commons', 'outlaws'];

export function tickFactions(state: GameState): GameState {
  for (const key of FACTIONS) {
    const faction = state.world.factions[key];
    const direction = key === 'outlaws'
      ? (50 - state.world.conditions.publicOrder) / 20
      : key === 'commons'
        ? (50 - state.world.conditions.foodSecurity) / 25
        : key === 'crown'
          ? state.world.conditions.warThreat / 40
          : key === 'church'
            ? state.world.conditions.religiousTension / 35
            : state.world.conditions.prosperity / 45;
    faction.influence = clamp(faction.influence + rnd(-2, 2) + Math.round(direction));
    faction.lastActionYear = state.world.currentYear;
    faction.activePressure = key === 'crown' ? (state.world.conditions.warThreat > 60 ? 'raising levies for war' : 'strengthening royal justice')
      : key === 'church' ? (state.world.conditions.religiousTension > 60 ? 'enforcing religious conformity' : 'organising parish relief')
        : key === 'guilds' ? (state.world.conditions.prosperity < 45 ? 'protecting workshops from failure' : 'expanding guild privileges')
          : key === 'commons' ? (state.world.conditions.foodSecurity < 40 ? 'demanding affordable grain' : 'defending customary village rights')
            : (state.world.conditions.publicOrder < 40 ? 'recruiting among the discontented' : 'testing patrols and road tolls');
    if (key === 'crown') state.world.conditions.publicOrder = clamp(state.world.conditions.publicOrder + (faction.influence > 65 ? 1 : 0));
    if (key === 'church') state.world.conditions.religiousTension = clamp(state.world.conditions.religiousTension + (faction.influence > 70 ? 1 : -1));
    if (key === 'guilds') state.world.conditions.prosperity = clamp(state.world.conditions.prosperity + (faction.influence > 60 ? 1 : 0));
    if (key === 'commons') state.world.conditions.foodSecurity = clamp(state.world.conditions.foodSecurity + (faction.influence > 60 ? 1 : 0));
    if (key === 'outlaws') state.world.conditions.publicOrder = clamp(state.world.conditions.publicOrder - (faction.influence > 45 ? 2 : 0));
    if (chance(0.03) && Math.abs(faction.influence - 50) > 22) appendWorldHistory(state, { id: `history_faction_${state.nextId++}`, year: state.world.currentYear, type: 'faction_shift', participantIds: [faction.leaderId ?? ''].filter(Boolean), familyIds: [], causes: [key], summary: `${faction.name} ${faction.influence > 50 ? 'extended' : 'lost'} influence in Swineford.`, salience: 2 });
  }
  return state;
}
