import { CareerDef, GameState } from '@/types/game';
import { CAREERS, careerAvailability, careerById } from '@/data/careers';
import { addMoney, addTag, pushFeed } from './gameState';
import { applyEffects } from './consequenceEngine';
import { chance, pick, rnd } from './random';
import { C } from '@/theme/theme';
import { pickNarrative } from './narrativeEngine';

export type CareerAction = 'apply' | 'work' | 'train' | 'promote' | 'resign' | 'borrow' | 'repay' | 'rank_duty' | 'odd_job' | 'craft' | 'trade';

export interface CareerActionAvailability {
  available: boolean;
  reason?: string;
}

export function careerActionAvailability(state: GameState, action: CareerAction, careerId?: string): CareerActionAvailability {
  if (state.dead || state.pendingEvent) return { available: false, reason: 'Unavailable just now' };
  if (state.actionClock.used >= state.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  const current = careerById(state.occupation.careerId);
  if (action === 'apply') {
    const target = careerById(careerId ?? null);
    if (!target) return { available: false, reason: 'Unknown occupation' };
    const reason = careerAvailability(state, target);
    if (reason) return { available: false, reason };
    if (current?.id === target.id) return { available: false, reason: 'Already employed here' };
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
    if (state.age < 10) return { available: false, reason: 'Requires age 10' };
    return state.gold < 2 ? { available: false, reason: 'Needs 2g for materials' } : { available: true };
  }
  if (action === 'trade') {
    if (state.age < 8) return { available: false, reason: 'Requires age 8' };
    return state.gold < 3 ? { available: false, reason: 'Needs 3g for stock' } : { available: true };
  }
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
    case 'apply': {
      const career = careerById(careerId ?? null)!;
      state.occupation = { careerId: career.id, experience: 0, performance: 50, workedThisYear: 0 };
      addTag(state, 'gainfully_employed');
      addTag(state, `career_family_${career.family}`);
      pushFeed(state, 'NEW OCCUPATION', C.good, `You take work as ${career.title}. ${career.desc}`, 'good');
      break;
    }
    case 'work': {
      const career = current!;
      const pay = career.wage + rnd(0, Math.max(1, career.tier + 1));
      addMoney(state, pay);
      state.occupation.experience += 5 + career.tier;
      state.occupation.performance = Math.min(100, state.occupation.performance + rnd(1, 4));
      state.occupation.workedThisYear += 1;
      if (career.healthRisk) applyEffects(state, { health: -career.healthRisk });
      pushFeed(state, 'WORK', C.good, `${pickNarrative(state, 'career_work', WORK_LINES)} ${career.title} wages: ${pay}g.`, 'good');
      break;
    }
    case 'train':
      applyEffects(state, { wits: 2, health: -1 });
      state.occupation.experience += 9;
      state.occupation.performance = Math.min(100, state.occupation.performance + 3);
      pushFeed(state, 'TRAINING', C.blue, `You study the finer points of being ${current!.title}. The coarse points remain more memorable.`, 'good');
      break;
    case 'promote': {
      const next = careerById(current!.promotesTo!)!;
      state.occupation = { careerId: next.id, experience: 10, performance: 55, workedThisYear: 0 };
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
      const pay = rnd(3, 7);
      addMoney(state, pay);
      applyEffects(state, { health: -1, path: { labour: 1 } });
      pushFeed(state, 'ODD WORK', C.amber, `You carry sacks, mend a gate, and locate a missing hen. The village pays ${pay} gold for this improbable expertise.`, 'good');
      break;
    }
    case 'craft': {
      addMoney(state, -2);
      const success = chance(0.42 + state.stats.wits / 220);
      if (success) {
        addMoney(state, 9);
        addTag(state, 'crafted_for_profit');
        pushFeed(state, 'CRAFTED', C.good, 'Two gold of materials become nine gold of respectable workmanship. Nobody inspects the back too closely.', 'good');
      } else {
        applyEffects(state, { wits: 1 });
        pushFeed(state, 'CRAFTING', C.bad, 'The materials become an educational object with no known buyer.', 'bad');
      }
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
  const current = careerById(state.occupation.careerId);
  if (current) {
    if (state.occupation.workedThisYear === 0) {
      state.occupation.performance = Math.max(0, state.occupation.performance - 18);
      pushFeed(state, 'WORK', C.bad, `You neglected your duties as ${current.title}. Your employer has noticed.`, 'bad');
      if (state.occupation.performance < 20 && chance(0.55)) {
        pushFeed(state, 'DISMISSED', C.bad, `You are dismissed from your post as ${current.title}. Even the door seems eager to see you out.`, 'bad');
        state.occupation = { careerId: null, experience: 0, performance: 50, workedThisYear: 0 };
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
