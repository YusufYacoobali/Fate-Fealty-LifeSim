import { CareerFamily, GameState } from '@/types/game';
import { careerById } from '@/data/careers';
import { applyEffects } from './consequenceEngine';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';

function clampStanding(value: number): number {
  return Math.max(-100, Math.min(100, value));
}

function shiftFaction(s: GameState, id: keyof GameState['world']['factions'], delta: number): void {
  s.world.factions[id].playerStanding = clampStanding(s.world.factions[id].playerStanding + delta);
}

function oncePerYear(s: GameState, key: string): boolean {
  const ledgerKey = `career-identity:${s.age}:${key}`;
  if (s.world.repetitionLedger[ledgerKey]) return false;
  s.world.repetitionLedger[ledgerKey] = 1;
  return true;
}

function trainCount(s: GameState, family: CareerFamily): number {
  const key = `career-training:${s.age}:${family}`;
  const count = (s.world.repetitionLedger[key] ?? 0) + 1;
  s.world.repetitionLedger[key] = count;
  return count;
}

/**
 * Careers already have wages, experience and promotion ladders. This layer makes
 * those same careers lean on the world they live in, without inventing a second
 * career system beside the first one.
 */
export function reinforceCareerIdentity(s: GameState, action: string): GameState {
  const career = careerById(s.occupation.careerId);
  if (!career || (action !== 'work' && action !== 'train')) return s;

  if (action === 'train') {
    if (trainCount(s, career.family) > 2) return s;
    switch (career.family) {
      case 'agriculture':
      case 'martial':
        applyEffects(s, { health: 1 });
        break;
      case 'trade':
      case 'court':
      case 'entertainment':
        applyEffects(s, { charm: 1 });
        break;
      case 'church':
        applyEffects(s, { faith: 1 });
        break;
      default:
        s.occupation.performance = Math.min(100, s.occupation.performance + 1);
        break;
    }
    return s;
  }

  if (!oncePerYear(s, `${career.id}:work`)) return s;
  const world = s.world.conditions;

  switch (career.family) {
    case 'agriculture':
      shiftFaction(s, 'commons', 1);
      applyEffects(s, { holding: { stores: 1 } });
      if (world.foodSecurity < 40) {
        applyEffects(s, { reputation: 1 });
        pushFeed(s, 'A NEEDED HARVEST', C.good, 'With bellies tightening across Swineford, honest grain suddenly looks rather more heroic than usual.', 'good');
      }
      break;

    case 'craft':
      shiftFaction(s, 'guilds', 1);
      s.occupation.guildStanding = Math.min(100, (s.occupation.guildStanding ?? 0) + 2);
      s.occupation.performance = Math.max(0, Math.min(100, s.occupation.performance + (world.prosperity < 35 ? -2 : 1)));
      break;

    case 'trade':
      shiftFaction(s, 'guilds', 1);
      s.occupation.performance = Math.max(0, Math.min(100, s.occupation.performance + (world.prosperity >= 60 ? 2 : world.prosperity <= 35 ? -2 : 0)));
      if (world.prosperity >= 65) {
        applyEffects(s, { gold: 2 });
        pushFeed(s, 'A FAT MARKET', C.good, 'Coin is moving freely and, by happy coincidence, some of it has chosen thy purse.', 'good');
      }
      break;

    case 'church':
      shiftFaction(s, 'church', 1);
      applyEffects(s, { faith: 1 });
      if (world.religiousTension >= 55) {
        applyEffects(s, { reputation: 1 });
        pushFeed(s, 'A DIVIDED PARISH', C.faithDark, 'Tempers rise around matters of heaven. Keeping thy flock from biting one another is beginning to count as pastoral skill.', 'plain');
      }
      break;

    case 'martial':
      shiftFaction(s, 'crown', 1);
      if (world.warThreat >= 55) {
        applyEffects(s, { health: -2, reputation: 2 });
        pushFeed(s, 'STEEL EARNS ITS KEEP', C.blue, 'With war close enough to smell, thy service is suddenly admired by people who yesterday called soldiers expensive.', 'plain');
      } else if (world.publicOrder < 40) {
        s.occupation.performance = Math.min(100, s.occupation.performance + 2);
      }
      break;

    case 'court':
      shiftFaction(s, 'crown', 1);
      applyEffects(s, { charm: 1 });
      if (s.world.factions.crown.influence >= 65) applyEffects(s, { reputation: 1 });
      break;

    case 'outlaw': {
      shiftFaction(s, 'outlaws', 1);
      const legal = s.world.characters[s.playerCharacterId]?.legalState;
      if (legal) {
        legal.suspicion = Math.min(100, legal.suspicion + 2);
        legal.notoriety = Math.min(100, legal.notoriety + 1);
      }
      if (world.publicOrder < 40) s.occupation.performance = Math.min(100, s.occupation.performance + 2);
      break;
    }

    case 'medicine':
      shiftFaction(s, 'commons', 1);
      if (world.diseasePressure >= 45) {
        applyEffects(s, { health: -1, wits: 1, reputation: 2 });
        pushFeed(s, 'A BUSY SICKBED', C.faithDark, 'Sickness is everywhere. Thy hands grow surer, thy name travels faster, and washing them remains a controversial innovation.', 'plain');
      }
      break;

    case 'entertainment':
      shiftFaction(s, 'commons', 1);
      applyEffects(s, { charm: 1 });
      s.occupation.performance = Math.max(0, Math.min(100, s.occupation.performance + (world.prosperity >= 60 ? 1 : world.prosperity <= 35 ? -1 : 0)));
      break;

    case 'law':
      shiftFaction(s, 'crown', 1);
      applyEffects(s, { wits: 1 });
      if (world.publicOrder < 40) {
        applyEffects(s, { reputation: 1 });
        pushFeed(s, 'LAW, SUCH AS IT IS', C.purpleDark, 'With every second neighbour inventing a grievance, a person who can read the law is treated almost like a sorcerer.', 'plain');
      }
      break;
  }

  return s;
}
