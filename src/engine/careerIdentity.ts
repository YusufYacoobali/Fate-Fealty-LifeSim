import { CareerFamily, GameState } from '@/types/game';
import { careerById } from '@/data/careers';
import { applyEffects } from './consequenceEngine';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';

export interface CareerActionSnapshot {
  gold: number;
  income: number;
  performance: number;
}

export function captureCareerActionRewards(s: GameState): CareerActionSnapshot {
  return {
    gold: s.gold,
    income: s.income,
    performance: s.occupation.performance,
  };
}

function clampStanding(value: number): number {
  return Math.max(-100, Math.min(100, value));
}

function clampFactor(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

interface WorkContext {
  payFactor: number;
  performanceDelta: number;
}

/**
 * The normal career engine still owns wages and experience. This says how much
 * the EXISTING world matters to that particular profession: a merchant cares
 * about markets and guild favour; a priest about faith and religious tension;
 * a soldier about war, order and Crown favour; and so on.
 */
function workContext(s: GameState, family: CareerFamily): WorkContext {
  const w = s.world.conditions;
  const guild = s.world.factions.guilds.playerStanding;
  const crown = s.world.factions.crown.playerStanding;
  const church = s.world.factions.church.playerStanding;
  const commons = s.world.factions.commons.playerStanding;
  const outlaws = s.world.factions.outlaws.playerStanding;
  const guildStanding = s.occupation.guildStanding ?? 0;
  const legal = s.world.characters[s.playerCharacterId]?.legalState;

  switch (family) {
    case 'agriculture':
      return {
        payFactor: clampFactor(1 + (w.prosperity - 50) / 500 + (50 - w.foodSecurity) / 800, 0.82, 1.2),
        performanceDelta: w.foodSecurity < 35 ? 1 : 0,
      };
    case 'craft':
      return {
        payFactor: clampFactor(1 + (w.prosperity - 50) / 300 + guild / 700 + (guildStanding - 25) / 700, 0.78, 1.3),
        performanceDelta: guild >= 20 ? 1 : guild <= -20 ? -1 : 0,
      };
    case 'trade':
      return {
        payFactor: clampFactor(1 + (w.prosperity - 50) / 180 + guild / 450 + (guildStanding - 25) / 500, 0.65, 1.45),
        performanceDelta: (w.prosperity >= 65 ? 2 : w.prosperity <= 35 ? -2 : 0) + (guild >= 20 ? 1 : guild <= -20 ? -1 : 0),
      };
    case 'church':
      return {
        payFactor: clampFactor(1 + church / 1000, 0.9, 1.12),
        performanceDelta: (s.stats.faith >= 70 ? 1 : 0) + (w.religiousTension >= 60 ? (s.stats.faith >= 60 ? 1 : -2) : 0) + (church <= -20 ? -1 : 0),
      };
    case 'martial':
      return {
        payFactor: clampFactor(1 + (w.warThreat - 35) / 250 + crown / 700, 0.8, 1.35),
        performanceDelta: (w.warThreat >= 55 ? 1 : 0) + (w.publicOrder < 40 ? 1 : 0) + (crown <= -20 ? -2 : crown >= 20 ? 1 : 0),
      };
    case 'court':
      return {
        payFactor: clampFactor(1 + crown / 350 + (s.world.factions.crown.influence - 60) / 500, 0.75, 1.35),
        performanceDelta: (crown >= 20 ? 2 : crown <= -20 ? -2 : 0) + (s.stats.charm >= 70 ? 1 : 0),
      };
    case 'outlaw':
      return {
        payFactor: clampFactor(1 + (50 - w.publicOrder) / 220 + outlaws / 500 - (legal?.suspicion ?? 0) / 700, 0.7, 1.4),
        performanceDelta: (w.publicOrder < 40 ? 2 : w.publicOrder > 65 ? -1 : 0) + (outlaws >= 20 ? 1 : 0) - ((legal?.suspicion ?? 0) >= 60 ? 2 : 0),
      };
    case 'medicine':
      return {
        payFactor: clampFactor(1 + (w.diseasePressure - 30) / 250 + commons / 900, 0.85, 1.35),
        performanceDelta: (w.diseasePressure >= 45 ? 2 : 0) + (s.stats.wits >= 70 ? 1 : 0),
      };
    case 'entertainment':
      return {
        payFactor: clampFactor(1 + (w.prosperity - 50) / 220 + commons / 800, 0.7, 1.35),
        performanceDelta: (w.prosperity >= 60 ? 1 : w.prosperity <= 35 ? -2 : 0) + (s.stats.charm >= 70 ? 1 : 0),
      };
    case 'law':
      return {
        payFactor: clampFactor(1 + (50 - w.publicOrder) / 300 + crown / 700, 0.8, 1.3),
        performanceDelta: (w.publicOrder < 40 ? 2 : 0) + (crown >= 20 ? 1 : crown <= -20 ? -1 : 0),
      };
  }
}

function applyCoreWorkContext(s: GameState, family: CareerFamily, before?: CareerActionSnapshot): void {
  if (!before) return;
  const context = workContext(s, family);
  const earned = Math.max(0, s.gold - before.gold);
  if (earned > 0) {
    const adjusted = Math.max(0, Math.round(earned * context.payFactor));
    s.gold = before.gold + adjusted;
    s.income = Math.max(before.income, before.income + adjusted);
  }
  s.occupation.performance = Math.max(0, Math.min(100, s.occupation.performance + context.performanceDelta));
}

/**
 * Careers already have wages, experience and promotion ladders. This layer makes
 * those same careers lean on the world they live in, without inventing a second
 * career system beside the first one.
 */
export function reinforceCareerIdentity(s: GameState, action: string, before?: CareerActionSnapshot): GameState {
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

  applyCoreWorkContext(s, career.family, before);
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
      break;

    case 'trade':
      shiftFaction(s, 'guilds', 1);
      if (world.prosperity >= 65) {
        pushFeed(s, 'A FAT MARKET', C.good, 'Coin is moving freely and, by happy coincidence, some of it has chosen thy purse.', 'good');
      } else if (world.prosperity <= 35) {
        pushFeed(s, 'A THIN MARKET', C.amber, 'Purses stay shut and every merchant suddenly discovers a cousin who can do it cheaper.', 'plain');
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
      }
      break;

    case 'court':
      shiftFaction(s, 'crown', 1);
      applyEffects(s, { charm: 1 });
      if (s.world.factions.crown.playerStanding >= 20) {
        pushFeed(s, 'A FAVOURED FACE', C.charmDark, 'Doors open a little sooner when the Crown already knows thy name for agreeable reasons.', 'good');
      } else if (s.world.factions.crown.playerStanding <= -20) {
        pushFeed(s, 'A COLD COURT', C.amber, 'Every corridor is the same length, yet somehow each audience takes twice as long when the Crown dislikes thee.', 'plain');
      }
      break;

    case 'outlaw': {
      shiftFaction(s, 'outlaws', 1);
      const legal = s.world.characters[s.playerCharacterId]?.legalState;
      if (legal) {
        legal.suspicion = Math.min(100, legal.suspicion + 2);
        legal.notoriety = Math.min(100, legal.notoriety + 1);
      }
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
