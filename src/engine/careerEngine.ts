import { performSpecialization, specializationAvailability, recordProfessionalWork, tickProfessionalStanding } from './careerSpecializationEngine';
import { recordTradeWork } from './tradeJourney';
import { CareerDef, GameState } from '@/types/game';
import { CAREERS, careerAvailability, careerById } from '@/data/careers';
import { addMoney, addTag, pushFeed } from './gameState';
import { applyEffects } from './consequenceEngine';
import { chance, pick, rnd } from './random';
import { C } from '@/theme/theme';
import { pickNarrative } from './narrativeEngine';
import { equipmentCheckBonus, grantSkillXp, skillLevel } from './rpgProgress';

export type CareerAction = 'honour' | 'specialize' | 'apply' | 'work' | 'train' | 'promote' | 'resign' | 'borrow' | 'repay' | 'rank_duty' | 'odd_job' | 'craft' | 'trade';

export interface CareerActionAvailability {
  available: boolean;
  reason?: string;
}

export function careerActionAvailability(state: GameState, action: CareerAction, careerId?: string): CareerActionAvailability {
  if (state.dead || state.pendingEvent) return { available: false, reason: 'Unavailable just now' };
  if (state.actionClock.used >= state.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  if (action === 'specialize') { const reason = specializationAvailability(state, careerId ?? ''); return reason ? { available: false, reason } : { available: true }; }
  const current = careerById(state.occupation.careerId);
  if (action === 'apply') {
    const target = careerById(careerId ?? null);
    if (!target) return { available: false, reason: 'Unknown occupation' };
    const reason = careerAvailability(state, target);
    if (reason) return { available: false, reason };
    if (current?.id === target.id) return { available: false, reason: 'Already employed here' };
    return { available: true };
  }
  if (action === 'honour') {
    const p = state.world.characters[state.playerCharacterId], history = p.professionalHistory?.martial;
    if (p.socialStatus?.martialHonour === 'knight') return { available: false, reason: 'Already knighted' };
    if (state.age < 18 || current?.family !== 'martial' || !p.education?.qualifications.includes('martial_training') || skillLevel(state, 'arms') < 3 || (history?.reputation ?? 0) < 20 || !history?.milestones.some(m => ['service_honours', 'company_command'].includes(m))) return { available: false, reason: 'Needs martial training, Arms 3 and recognised command service' };
    return { available: true };
  }
  if (action === 'borrow') return state.debts.length ? { available: false, reason: 'Repay thy existing debt first' } : { available: true };
  if (action === 'repay') {
    if (!state.debts.length) return { available: false, reason: 'No debt to repay' };
    if (state.gold < 5) return { available: false, reason: 'Needs at least 5g' };
    return { available: true };
  }
  if (action === 'rank_duty') return state.age < 12 ? { available: false, reason: 'Too young for public duties' } : { available: true };
  if (action === 'odd_job') return state.age < 6 ? { available: false, reason: 'Requires age 6' } : { available: true };
  if (action === 'craft') {
    return { available: false, reason: 'Choose a recipe in Do → Craft' };
  }
  if (action === 'trade') {
    if (state.age < 8) return { available: false, reason: 'Requires age 8' };
    return state.gold < 3 ? { available: false, reason: 'Needs 3g for stock' } : { available: true };
  }
  if (current?.premium && !state.lifetimeUnlocked && action !== 'resign') return { available: false, reason: 'Requires Premium access' };
  if (!current) return { available: false, reason: 'No occupation' };
  if (action === 'promote') {
    if (!current.promotesTo) return { available: false, reason: 'At the top of this career' };
    if (state.occupation.experience < 60 || state.occupation.performance < 55) return { available: false, reason: 'Needs 60 experience and 55 performance' };
    const next = careerById(current.promotesTo)!;
    const reason = careerAvailability(state, next);
    if (reason) return { available: false, reason };
  }
  return { available: true };
}

/** Days of honest labour before a trade is worked out for the year. */
export const WORK_BEFORE_GLUT = 6;

const POOR_DAY_LINES = [
  'Half the day was spent waiting on a man who never came.',
  'The work was there and the coin was not; you are promised it at Michaelmas.',
  'Nobody in the market had money today, only opinions.',
  'You were paid partly in cabbages, which the tally does not recognise.',
  'A wet morning and an idle afternoon. It happens.',
  'The customer disputed the price, at length, and won.',
] as const;

const WORK_LINES = [
  'You put in a long day. Your hands ache, but your purse sounds healthier.',
  'The work is honest, mostly. The payment is entirely honest, which matters more.',
  'You finish the day tired, competent, and richer than you began it.',
  'Nothing catches fire, nobody resigns, and coin changes hands. A professional triumph.',
] as const;

export function performCareerAction(state: GameState, action: CareerAction, careerId?: string): GameState {
  const availability = careerActionAvailability(state, action, careerId);
  if (!availability.available) return state;
  const current = careerById(state.occupation.careerId);

  switch (action) {
    case 'honour': {
      const p = state.world.characters[state.playerCharacterId];
      p.socialStatus!.martialHonour = 'knight'; p.socialStatus!.grants.push(`service_knighthood_${state.world.currentYear}`);
      state.rankIdx = Math.max(2, state.rankIdx);
      pushFeed(state, 'KNIGHTED', C.good, 'Your documented command service earns a formal knighthood. Your family estate remains a separate matter.', 'good');
      return state;
    }
    case 'specialize': return performSpecialization(state, careerId ?? '');
    case 'apply': {
      const career = careerById(careerId ?? null)!;
      state.occupation = { careerId: career.id, experience: 0, performance: 50, workedThisYear: 0, apprenticeshipYears: career.tier === 0 ? 0 : undefined, guildStanding: ['craft', 'trade', 'medicine', 'entertainment', 'law'].includes(career.family) ? 5 : 0 };
      addTag(state, 'gainfully_employed');
      addTag(state, `career_family_${career.family}`);
      pushFeed(state, 'NEW OCCUPATION', C.good, `You take work as ${career.title}. ${career.desc}`, 'good');
      break;
    }
    case 'work': {
      const career = current!;
      const prosperityFactor = 0.75 + state.world.conditions.prosperity / 200;
      const guildFactor = ['craft', 'trade', 'medicine', 'entertainment', 'law'].includes(career.family) ? 1 + state.world.factions.guilds.playerStanding / 500 : 1;
      const patronFactor = state.tags.includes('has_patron') ? 1.08 : 1;
      // A trade only has so much work in it. Beyond a full season the day's
      // takings fall away, so a year cannot be turned into coin simply by
      // pressing the same button until the clock runs out.
      const seasonFactor = 1 / (1 + Math.max(0, state.occupation.workedThisYear - WORK_BEFORE_GLUT) * 0.28);
      const skill = career.family === 'martial' ? 'arms' : career.family === 'agriculture' ? 'husbandry' : career.family === 'craft' ? 'craftsmanship' : 'scholarship';
      const expertise = 1 + (skillLevel(state, skill) - 1) * 0.015 + equipmentCheckBonus(state, skill);
      const full = (career.wage + rnd(0, Math.max(1, career.tier + 1))) * prosperityFactor * guildFactor * patronFactor * seasonFactor * expertise;

      // Wages were previously certain. They are not: a poor day is likelier
      // when the work is going badly, when the trade is glutted, or when the
      // village has no coin to spend.
      const badDayChance = Math.min(0.4, 0.22
        - state.occupation.performance / 500
        - state.world.conditions.prosperity / 700
        + Math.max(0, state.occupation.workedThisYear - WORK_BEFORE_GLUT) * 0.03);
      const badDay = chance(Math.max(0.04, badDayChance));
      const pay = badDay ? Math.floor(full * rnd(0, 40) / 100) : Math.max(1, Math.round(full));

      if (pay > 0) addMoney(state, pay);
      state.occupation.experience += 5 + career.tier;
      const illnessPenalty = Math.min(4, state.world.characters[state.playerCharacterId]?.healthConditions?.length ?? 0);
      state.occupation.performance = Math.min(100, state.occupation.performance + rnd(1, 4) - illnessPenalty - (badDay ? 2 : 0));
      state.occupation.workedThisYear += 1;
      recordTradeWork(state);
      recordProfessionalWork(state);
      if (career.tier === 0) state.occupation.apprenticeshipYears = (state.occupation.apprenticeshipYears ?? 0) + 1;
      if (['craft', 'trade', 'medicine', 'entertainment', 'law'].includes(career.family)) state.occupation.guildStanding = Math.min(100, (state.occupation.guildStanding ?? 0) + 1);
      if (career.healthRisk) applyEffects(state, { health: -career.healthRisk });
      if (badDay) {
        pushFeed(state, 'WORK', C.amber, `${pick(POOR_DAY_LINES)} ${career.title} wages: ${pay}g.`, pay > 0 ? 'plain' : 'bad');
      } else {
        pushFeed(state, 'WORK', C.good, `${pickNarrative(state, 'career_work', WORK_LINES)} ${career.title} wages: ${pay}g.`, 'good');
      }
      grantSkillXp(state, skill, badDay ? 3 : 6, badDay ? 'a difficult working day' : 'professional work');
      break;
    }
    case 'train':
      applyEffects(state, { wits: 2, health: -1 });
      state.occupation.experience += 9;
      state.occupation.performance = Math.min(100, state.occupation.performance + 3);
      pushFeed(state, 'TRAINING', C.blue, `You study the finer points of being ${current!.title}. The coarse points remain more memorable.`, 'good');
      grantSkillXp(state, current!.family === 'agriculture' ? 'husbandry' : current!.family === 'martial' ? 'arms' : current!.family === 'craft' ? 'craftsmanship' : 'scholarship', 6, 'professional training');
      break;
    case 'promote': {
      const next = careerById(current!.promotesTo!)!;
      state.occupation = { careerId: next.id, experience: 10, performance: 55, workedThisYear: 0, guildStanding: Math.min(100, (state.occupation.guildStanding ?? 0) + 10), patronId: state.occupation.patronId };
      addTag(state, `career_${next.id}`);
      pushFeed(state, 'CAREER RISE', C.purpleDark, `Your work is recognized. You are now ${next.title}.`, 'good');
      break;
    }
    case 'resign':
      pushFeed(state, 'RESIGNED', C.amber, `You leave your post as ${current!.title}. Your employer manages to look both offended and relieved.`, 'plain');
      state.occupation = { careerId: null, experience: 0, performance: 50, workedThisYear: 0 };
      break;
    case 'borrow':
      state.debts.push({ id: `debt_${state.nextId++}`, principal: 20, interestRate: 0.1 });
      addMoney(state, 20);
      addTag(state, 'has_borrowed');
      pushFeed(state, 'LOAN', C.amber, 'A moneylender advances you 20 gold and smiles as if already spending the interest.', 'plain');
      break;
    case 'repay': {
      const debt = state.debts[0];
      const paid = Math.min(10, debt.principal, state.gold);
      addMoney(state, -paid);
      debt.principal -= paid;
      if (debt.principal <= 0) {
        state.debts.shift();
        addTag(state, 'debt_repaid');
      }
      pushFeed(state, 'DEBT', C.good, `You repay ${paid} gold. The lender looks almost disappointed.`, 'good');
      break;
    }
    case 'rank_duty':
      performRankDuty(state);
      break;
    case 'odd_job': {
      // Casual labour is available without an occupation, but it is not a
      // risk-free coin button. Some days the work falls through after costs.
      if (chance(0.62)) {
        const pay = rnd(2, 6);
        addMoney(state, pay);
        applyEffects(state, { health: -1, path: { labour: 1 } });
        pushFeed(state, 'ODD WORK', C.amber, `You carry sacks, mend a gate, and locate a missing hen. The village pays ${pay} gold for this improbable expertise.`, 'good');
      } else {
        const loss = Math.min(state.gold, rnd(1, 4));
        addMoney(state, -loss);
        applyEffects(state, { health: -rnd(1, 3), reputation: -1, path: { labour: 1 } });
        pushFeed(state, 'ODD WORK · GONE WRONG', C.bad, loss > 0
          ? `A cart axle breaks while it is in thy care. The owner takes ${loss} gold for repairs, and the day's labour earns nothing.`
          : `A cart axle breaks while it is in thy care. Thou earns nothing and goes home bruised besides.`, 'bad');
      }
      break;
    }
    case 'craft': {
      // Retained action identifier for old callers; recipes own all crafting.
      break;
    }
    case 'trade': {
      addMoney(state, -3);
      const success = chance(0.38 + state.stats.charm / 210);
      if (success) {
        addMoney(state, 11);
        addTag(state, 'traded_for_profit');
        pushFeed(state, 'TRADE', C.good, 'You buy modest stock and sell it with magnificent confidence. Profit: eight gold.', 'good');
      } else {
        pushFeed(state, 'TRADE', C.bad, 'You buy high, sell low, and call the difference tuition.', 'bad');
      }
      break;
    }
  }
  return state;
}

function performRankDuty(state: GameState): void {
  const duties = [
    { tag: 'VILLAGE DUTY', text: 'You help settle a boundary quarrel using a stick, a boot, and unexpected diplomacy.', effects: { gold: 3, charm: 2, reputation: 2 } },
    { tag: 'SERVICE', text: 'You serve your liege through a day of errands, oaths, and waiting outside impressive doors.', effects: { rankProgress: 5, charm: 2 } },
    { tag: 'PATROL', text: 'You patrol the roads. Bandits avoid you; puddles show no such respect.', effects: { gold: 6, health: -3, rankProgress: 5 } },
    { tag: 'PETITIONS', text: 'You hear petitions and discover every goat in the estate has legal representation.', effects: { charm: 4, reputation: 4, holding: { loyalty: 5 } } },
    { tag: 'BARONIAL DUTY', text: 'You inspect levies and taxes with the grave expression of someone who understands half the figures.', effects: { gold: 14, reputation: -2, holding: { security: 6 } } },
    { tag: 'ROYAL DECREE', text: 'You issue a decree. Scribes improve it, courtiers praise it, and the realm cautiously obeys.', effects: { charm: 6, reputation: 6, holding: { loyalty: 6 } } },
  ] as const;
  const duty = duties[Math.min(duties.length - 1, state.rankIdx)];
  applyEffects(state, duty.effects);
  pushFeed(state, duty.tag, C.purpleDark, duty.text, 'good');
}

export function tickCareerAndEconomy(state: GameState): GameState {
  tickProfessionalStanding(state);
  const current = careerById(state.occupation.careerId);
  if (current) {
    if (state.occupation.workedThisYear === 0) {
      state.occupation.performance = Math.max(0, state.occupation.performance - 18);
      pushFeed(state, 'WORK', C.bad, `You neglected your duties as ${current.title}. Your employer has noticed.`, 'bad');
      if (state.occupation.performance < 20 && chance(0.55)) {
        pushFeed(state, 'DISMISSED', C.bad, `You are dismissed from your post as ${current.title}. Even the door seems eager to see you out.`, 'bad');
        state.occupation = { careerId: null, experience: 0, performance: 50, workedThisYear: 0, dismissedYear: state.world.currentYear };
      }
    } else {
      state.occupation.performance = Math.min(100, state.occupation.performance + Math.min(8, state.occupation.workedThisYear));
      state.occupation.workedThisYear = 0;
    }
  }

  const householdSize = 1 + state.kin.filter((kin) => kin.alive && (kin.kind === 'spouse' || kin.kind === 'child')).length;
  const upkeep = Math.max(1, Math.ceil(householdSize / 2) + state.rankIdx * 2);
  if (state.gold >= upkeep) addMoney(state, -upkeep);
  else {
    const shortfall = upkeep - state.gold;
    addMoney(state, -state.gold);
    const debt = state.debts[0] ?? { id: `debt_${state.nextId++}`, principal: 0, interestRate: 0.1 };
    if (!state.debts.length) state.debts.push(debt);
    debt.principal += shortfall;
  }
  if (upkeep > 1) pushFeed(state, 'HOUSEHOLD', C.amber, `Food, clothing, and station cost ${upkeep} gold this year. Even dignity has upkeep.`, 'plain');

  for (const debt of state.debts) debt.principal = Math.ceil(debt.principal * (1 + debt.interestRate));
  if (state.debts.length) pushFeed(state, 'DEBT', C.bad, `Interest leaves you owing ${state.debts.reduce((sum, debt) => sum + debt.principal, 0)} gold.`, 'bad');
  return state;
}

export function entryCareersFor(state: GameState): CareerDef[] {
  return CAREERS.filter((career) => career.tier === 0 && careerAvailability(state, career) == null);
}
