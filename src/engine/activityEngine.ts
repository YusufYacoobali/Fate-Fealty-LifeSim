/**
 * Activity resolution. Activities are the player-driven counterpart to the
 * Director's annual events: chosen freely, they nudge stats/gold and quietly
 * feed the hidden path system (e.g. training -> martial, crime -> outlaw).
 *
 * Each activity returns its outcome through the consequence engine, so death,
 * promotion, and memories all work uniformly.
 */

import { GameState } from '@/types/game';
import { ACTIVITY_DEFS } from '@/data/activities';
import { applyEffects } from './consequenceEngine';
import { countLivingKin, hasTag, pushFeed, removeTag } from './gameState';
import { checkLifeGoal } from './goalEngine';
import { spawnKin } from './kinFactory';
import { chance, pick } from './random';
import { C } from '@/theme/theme';
import { isIncapacitated } from './lifecycleEngine';
import { deriveLifeRole } from '@/content/persistentStories';

function crimeCharge(s: GameState, offence: string, severity: number, evidence: number) {
  const victims = Object.values(s.world.characters).filter((character) => character.alive && character.id !== s.playerCharacterId);
  const victim = victims.length ? pick(victims) : undefined;
  const witnesses = victims.filter((character) => character.id !== victim?.id);
  return { offence, severity, evidence, victimIds: victim ? [victim.id] : [], witnessIds: witnesses.length ? [pick(witnesses).id] : [] };
}

/** Chance a tavern night yields a real drinking companion (adults only). */
export const TAVERN_FRIEND_CHANCE = 0.12;

/** Shared cure: clears the ongoing illness state and announces it. */
function cureIllness(s: GameState): void {
  if (hasTag(s, 'ill')) {
    removeTag(s, 'ill');
    pushFeed(s, 'CURED', C.good, 'The treatment drives out the lingering sickness. You are whole once more.', 'good');
  }
}

type Handler = (s: GameState) => void;

/**
 * The single source of truth for what an activity costs. `activityAvailability`
 * gates on these, and the handlers below charge from the same table — if the two
 * ever drift, the UI blocks an action the handler would happily have run at a
 * lower price (or vice versa).
 */
const ACTIVITY_COSTS = {
  tavern: 2, dice: 3, feast: 4, pilgrimage: 3, tournament: 5,
  leech: 3, bathhouse: 2, herbalist: 4,
  arrange_gathering: 3, bribe_official: 20, run_caravan: 8, repair_household: 5,
} as const satisfies Record<string, number>;

/** Gold an activity requires up front; 0 for activities that cost nothing. */
function costOf(id: string): number {
  return (ACTIVITY_COSTS as Record<string, number>)[id] ?? 0;
}

export interface ActivityAvailability {
  available: boolean;
  reason?: string;
}

export function activityAvailability(s: GameState, id: string): ActivityAvailability {
  if (s.dead) return { available: false, reason: 'Thy life is ended' };
  if (s.pendingEvent) return { available: false, reason: 'Resolve the current event' };
  if (s.actionClock.used >= s.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  if (isIncapacitated(s)) return { available: false, reason: 'Imprisoned' };
  const def = ACTIVITY_DEFS.find((activity) => activity.id === id);
  if (!def) return { available: false, reason: 'Unknown activity' };
  if (def.minAge != null && s.age < def.minAge) return { available: false, reason: `Requires age ${def.minAge}` };
  if (def.roles && !def.roles.includes(deriveLifeRole(s))) return { available: false, reason: `Requires the ${def.roles[0].replaceAll('_', ' ')} life` };
  const cost = costOf(id);
  if (s.gold < cost) return { available: false, reason: `Needs ${cost} gold` };
  return { available: true };
}

function blocked(s: GameState, tag: string, text: string) {
  pushFeed(s, tag, C.amber, text, 'plain');
}

function one(lines: readonly string[]): string {
  return pick(lines);
}

const HANDLERS: Record<string, Handler> = {
  tavern: (s) => {
    if (s.gold < ACTIVITY_COSTS.tavern) return blocked(s, 'TAVERN', 'You had no coin for ale, so you watched others drink. Bleak.');
    applyEffects(s, { gold: -ACTIVITY_COSTS.tavern, charm: 5, health: -2, faith: -1, path: { court: 1 } });
    pushFeed(s, 'TAVERN', C.amber, one([
      'A night at the Sloshed Squire! You sang, spilled ale, and were applauded by a bench.',
      'You joined a tavern argument over whether soup can be sinful. Nobody won, but everyone shouted well.',
      'The ale was thin, the songs were thick, and you left with a new friend who may have been a hatter.',
    ]), 'good');
    // Sometimes the "new friend" is real: a modest chance to gain a drinking
    // companion, capped so the roster can't fill up with tavern acquaintances.
    if (s.age >= 16 && chance(TAVERN_FRIEND_CHANCE) && countLivingKin(s, 'friend') <= 2) {
      const mate = spawnKin(s, { kind: 'friend', role: 'Tavern Friend', trait: 'Merry', rel: 55 });
      pushFeed(s, 'NEW FRIEND', C.good, `${mate.name} matched you tale for tale until dawn. You have made a true friend at the Sloshed Squire.`, 'good');
    }
  },
  dice: (s) => {
    if (s.gold < ACTIVITY_COSTS.dice) return blocked(s, 'DICE', "You can't gamble with an empty purse. The dice men shoo you away.");
    if (chance(0.45)) {
      applyEffects(s, { gold: 9, charm: 2, path: { court: 1 } });
      pushFeed(s, 'DICE', C.good, one([
        'You won at dice! The loser accused the cubes of treason.',
        'The dice loved you tonight. A monk nearby called it providence, then asked to borrow them.',
        'You threw sixes until the table went quiet and the tavern cat left in protest.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -5 });
      pushFeed(s, 'DICE', C.bad, one([
        'You lost at dice. The winner thanked your ancestors for raising a generous fool.',
        'The dice betrayed you with tiny square faces of innocence.',
        'You lost so neatly the table asked if you had practiced.',
      ]), 'bad');
    }
  },
  feast: (s) => {
    if (s.gold < ACTIVITY_COSTS.feast) return blocked(s, 'FEAST', 'A feast needs coin and you have none. You gnaw a turnip alone. Festive.');
    applyEffects(s, { gold: -ACTIVITY_COSTS.feast, health: 6, charm: 3, faith: -1, path: { court: 2 } });
    pushFeed(s, 'FEAST', C.amber, 'You hosted a roaring feast — roast goose (NOT Sir Quackbeard), much mead, more merriment.', 'good');
  },
  fair: (s) => {
    applyEffects(s, { charm: 4, health: 2 });
    pushFeed(s, 'VILLAGE FAIR', C.purpleDark, 'You juggled turnips at the fair. Two children cheered, one threw a beet. A triumph.', 'good');
  },
  fields: (s) => {
    applyEffects(s, { gold: 5, health: -4, path: { labour: 2 } });
    pushFeed(s, 'LABOUR', C.amber, one([
      'You toiled in the turnip fields all season. Your back hates you, your purse loves you.',
      'You pulled turnips until the earth seemed personally offended.',
      'Fieldwork paid well today, if one measures pay against blisters and despair.',
    ]), 'good');
  },
  blacksmith: (s) => {
    applyEffects(s, { gold: 6, health: -3, wits: 2, path: { labour: 2 } });
    pushFeed(s, 'THE FORGE', C.blue, 'You hammered iron at the forge all season. Sooty, sweaty, and a few coins richer.', 'good');
  },
  market: (s) => {
    if (chance(0.6)) {
      applyEffects(s, { gold: 5, charm: 1, path: { labour: 1 } });
      pushFeed(s, 'MARKET', C.good, one([
        "You sold pies and trinkets at your stall. A brisk day's trade!",
        'You sold a comb, two pies, and advice worth less than both.',
        'Your stall prospered after you labelled everything "nearly noble."',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -1 });
      pushFeed(s, 'MARKET', C.amber, one([
        'Nobody bought a thing. You ate your own unsold pies. Bleakly profitable for your belly.',
        'A customer inspected every pie, blessed none of them, and left.',
        'Trade was so slow a fly landed, considered buying, and flew away.',
      ]), 'plain');
    }
  },
  church: (s) => {
    applyEffects(s, { faith: 8, charm: 1, path: { church: 2 } });
    pushFeed(s, 'CHAPEL', C.good, one([
      'You prayed earnestly. The stained glass was lovely. You feel cleansed and a bit hungry.',
      'The sermon was long, but so is eternity, which may have been the point.',
      'You knelt, prayed, and avoided thinking about lunch for almost seven whole minutes.',
    ]), 'good');
  },
  pilgrimage: (s) => {
    if (s.gold < ACTIVITY_COSTS.pilgrimage) return blocked(s, 'PILGRIMAGE', 'You lacked the 3 gold for the road. The shrine remains un-pilgrimaged.');
    applyEffects(s, { gold: -ACTIVITY_COSTS.pilgrimage, faith: 14, health: -6, wits: 2, path: { church: 3 }, memory: { tag: 'pilgrim', weight: 2 } });
    pushFeed(s, 'PILGRIMAGE', C.good, 'You walked to the holy shrine and back. Blisters and blessings, in equal and abundant measure.', 'good');
  },
  train: (s) => {
    applyEffects(s, { wits: 5, charm: 4, health: -2, path: { martial: 3 }, rankProgress: 9 });
    pushFeed(s, 'TRAINING', C.blue, one([
      'You trained hard at the keep: sword, courtesy, and not tripping over your own cloak.',
      'You practiced blade work until the straw dummy looked personally disappointed.',
      'A veteran taught you three cuts, two bows, and one excellent way to fall with dignity.',
    ]), 'good');
  },
  quest: (s) => {
    if (chance(0.55)) {
      applyEffects(s, { gold: 10, charm: 7, health: -5, path: { martial: 2 }, rankProgress: 5, memory: { tag: 'hero', weight: 2 } });
      pushFeed(s, 'QUEST', C.good, one([
        'You answered a notice-board quest and returned a hero! A small one. A village hero.',
        'You solved the quest by bravery, luck, and misreading the map in a useful direction.',
        'The quest-giver paid you and asked no follow-up questions. Ideal heroism.',
      ]), 'good');
    } else {
      applyEffects(s, { health: -10, charm: 3 });
      pushFeed(s, 'QUEST', C.bad, one([
        "The quest was a trap. The 'dragon' was an angry cow. You have learned humility and a limp.",
        'The notice-board failed to mention mud, knives, or the man shouting about bees.',
        'You returned from the quest alive, which is a generous definition of success.',
      ]), 'bad');
    }
  },
  tournament: (s) => {
    if (s.gold < ACTIVITY_COSTS.tournament) return blocked(s, 'TOURNEY', 'Entry costs 5 gold you do not have. You watch the joust from the cheap mud.');
    if (chance(0.5)) {
      applyEffects(s, { gold: 5, charm: 12, health: -12, path: { martial: 3 }, rankProgress: 7 });
      pushFeed(s, 'TOURNEY', C.good, one([
        'You were unhorsed gloriously, but your scream thrilled the crowd. Bruised, but briefly famous!',
        'You survived the tilt and bowed to the wrong lord. The crowd loved both.',
        'Your lance shattered, your pride bent, and somehow people cheered.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -5, charm: 4, health: -6 });
      pushFeed(s, 'TOURNEY', C.bad, one([
        'You fell off before the joust even began. Polite, pitying applause.',
        'Your horse took one look at glory and walked sideways out of history.',
        'You lowered your lance, missed the knight, and offended a banner.',
      ]), 'bad');
    }
  },
  poach: (s) => {
    if (chance(0.5)) {
      applyEffects(s, { gold: 12, health: -2, path: { outlaw: 2 }, reputation: -3 });
      pushFeed(s, 'POACHING', C.good, one([
        "You poached a fat deer from the King's wood and sold it quietly. Delicious crime.",
        "You slipped through the royal wood and returned with meat, scratches, and no witnesses worth naming.",
        'The forest kept your secret. The stew did not.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -6, health: -8, charm: -3, path: { outlaw: 1 }, reputation: -6, legal: { suspicion: 18, notoriety: 4, status: 'accused', charge: crimeCharge(s, 'poaching in the crown wood', 28, 62) } });
      pushFeed(s, 'CAUGHT!', C.bad, one([
        "The King's foresters caught you mid-poach. You were fined, thrashed, and shamed.",
        'A forester found you whispering apologies to a snare. The fine was immediate.',
        'You escaped the deer but not the law, which is worse at running but better at paperwork.',
      ]), 'bad');
    }
  },
  pickpocket: (s) => {
    if (chance(0.55)) {
      applyEffects(s, { gold: 7, faith: -3, path: { outlaw: 2 }, reputation: -2 });
      pushFeed(s, 'PICKPOCKET', C.good, "Light fingers, fat purse. You lifted a merchant's coin and whistled away innocently.", 'good');
    } else {
      applyEffects(s, { gold: -3, health: -5, charm: -3, path: { outlaw: 1 }, reputation: -5, legal: { suspicion: 22, notoriety: 5, status: 'accused', charge: crimeCharge(s, 'theft from a named victim', 34, 70) } });
      pushFeed(s, 'CAUGHT!', C.bad, 'A guard caught your hand in a stranger’s pocket. A public ear-flicking ensued. Humbling.', 'bad');
    }
  },
  banditry: (s) => {
    if (chance(0.45)) {
      applyEffects(s, { gold: 18, charm: 3, faith: -8, path: { outlaw: 4 }, reputation: -8, memory: { tag: 'bandit', weight: 2 } });
      pushFeed(s, 'BANDITRY', C.good, one([
        'You robbed a merchant on the lonely road! Rich, dashing, and thoroughly damned.',
        'Your ambush worked because the merchant was busy arguing with his mule.',
        'You took a purse and left a speech about fairness. The merchant hated both.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -5, health: -14, charm: -5, path: { outlaw: 2 }, reputation: -10, legal: { suspicion: 30, notoriety: 9, status: 'awaiting_trial', charge: crimeCharge(s, 'armed robbery on the road', 68, 76) } });
      pushFeed(s, 'AMBUSHED!', C.bad, one([
        "Your ambush failed spectacularly. The merchant's guards thrashed you into the ditch.",
        'You shouted "stand and deliver" from behind the wrong hedge.',
        'The merchant had guards, dogs, and a very hurtful laugh.',
      ]), 'bad');
    }
  },
  leech: (s) => {
    if (s.gold < ACTIVITY_COSTS.leech) return blocked(s, 'DOCTOR', 'The leech-doctor demands 3 gold up front. You have not got it. You stay ill.');
    const good = chance(0.6);
    applyEffects(s, { gold: -ACTIVITY_COSTS.leech, health: good ? 9 : -5 });
    pushFeed(s, 'DOCTOR', C.bad, good ? one([
      'The leech-doctor applied eleven leeches. Astonishingly, you feel better.',
      'The doctor named each leech and charged by personality. It worked anyway.',
      'The leeches looked confident, which is more than can be said for you.',
    ]) : one([
      'The leech-doctor applied too many leeches. You feel considerably worse. He charged extra.',
      'The treatment removed several humours and most of your patience.',
      'The doctor says feeling worse proves the cure found something to fight.',
    ]), good ? 'good' : 'bad');
    if (good) cureIllness(s);
  },
  bathhouse: (s) => {
    if (s.gold < ACTIVITY_COSTS.bathhouse) return blocked(s, 'BATHHOUSE', 'A bath costs 2 gold. You cannot afford to be clean. You remain fragrant.');
    applyEffects(s, { gold: -ACTIVITY_COSTS.bathhouse, health: 5, charm: 5 });
    pushFeed(s, 'BATHHOUSE', C.good, 'A rare hot bath! You emerge smelling of lavender instead of livestock. People stare, impressed.', 'good');
  },
  herbalist: (s) => {
    if (s.gold < ACTIVITY_COSTS.herbalist) return blocked(s, 'HERBALIST', 'The herb-wife wants 4 gold for her tonic. Your purse says no.');
    applyEffects(s, { gold: -ACTIVITY_COSTS.herbalist, health: 10, wits: 1 });
    pushFeed(s, 'HERBALIST', C.good, 'The herb-wife brewed you a tonic. It tastes of regret and pondwater, but it works wonders.', 'good');
    cureIllness(s);
  },
};

const ROLE_HANDLERS: Record<string, Handler> = {
  village_service: (s) => { applyEffects(s, { charm: 3, reputation: 3, worldConditions: { publicOrder: 2 } }); pushFeed(s, 'VILLAGE DUTY', C.good, 'You settle small quarrels and carry larger baskets. Swineford notices.', 'good'); },
  gather_fuel: (s) => { applyEffects(s, { health: -2, holding: { stores: 5 }, path: { labour: 1 } }); pushFeed(s, 'HOUSEHOLD', C.amber, 'You gather fuel and winter stores before the weather turns.', 'good'); },
  manage_workshop: (s) => { applyEffects(s, { gold: 8, wits: 2, worldConditions: { prosperity: 2 } }); pushFeed(s, 'WORKSHOP', C.good, 'Your workshop turns patient skill into coin and reputation.', 'good'); },
  guild_bargain: (s) => { applyEffects(s, { charm: 4, gold: -2, reputation: 3 }); pushFeed(s, 'GUILD', C.charmDark, 'You bargain for a stronger place among Swineford’s trades.', 'good'); },
  hear_confession: (s) => { applyEffects(s, { faith: 4, charm: 2, worldConditions: { religiousTension: -2 } }); pushFeed(s, 'CONFESSION', C.faithDark, 'You hear a troubled confession and carry its secret carefully.', 'good'); },
  copy_manuscript: (s) => { applyEffects(s, { wits: 4, faith: 2 }); pushFeed(s, 'SCRIPTORIUM', C.blue, 'Ink, patience, and cramped fingers preserve another page.', 'good'); },
  lead_patrol: (s) => { applyEffects(s, { health: -2, rankProgress: 4, worldConditions: { publicOrder: 3 } }); pushFeed(s, 'PATROL', C.blue, 'Your patrol makes the roads safer and the ditch mud less dignified.', 'good'); },
  drill_levy: (s) => { applyEffects(s, { health: -3, charm: 2, rankProgress: 5, worldConditions: { warThreat: -1 } }); pushFeed(s, 'LEVY', C.healthDark, 'You drill frightened neighbours until they resemble a line of soldiers.', 'good'); },
  hear_petitions: (s) => { applyEffects(s, { charm: 3, reputation: 4, holding: { loyalty: 4 } }); pushFeed(s, 'PETITIONS', C.purpleDark, 'You judge boundaries, debts, and one legally complicated goat.', 'good'); },
  host_court: (s) => { applyEffects(s, { gold: -5, charm: 5, familyReputation: { delta: 3 } }); pushFeed(s, 'COURT', C.charmDark, 'A crowded hall turns food and ceremony into influence.', 'good'); },
  hold_council: (s) => { applyEffects(s, { wits: 3, charm: 3, worldConditions: { publicOrder: 2, warThreat: -1 } }); pushFeed(s, 'ROYAL COUNCIL', C.purpleDark, 'Advice, argument, and decree carry across the realm.', 'good'); },
  royal_audience: (s) => { applyEffects(s, { charm: 5, faith: 2, reputation: 4 }); pushFeed(s, 'AUDIENCE', C.charmDark, 'You receive petitioners and remind the court who wears the crown.', 'good'); },
  plan_heist: (s) => { applyEffects(s, { wits: 4, faith: -2, path: { outlaw: 2 } }); pushFeed(s, 'HEIST', C.purpleDark, 'Maps, gossip, and a borrowed key make a dangerous plan.', 'plain'); },
  rally_gang: (s) => { applyEffects(s, { charm: 4, reputation: -3, path: { outlaw: 2 }, worldConditions: { publicOrder: -2 } }); pushFeed(s, 'OUTLAW BAND', C.healthDark, 'You bind dangerous people with promises of danger and profit.', 'plain'); },
  teach_child: (s) => {
    const child = s.kin.find((kin) => kin.alive && kin.kind === 'child' && kin.age >= 4 && kin.age < 18);
    if (!child) return blocked(s, 'TEACHING', 'No child in thy household is ready for a lesson.');
    child.childDevelopment ??= { completedMilestones: [], education: 'none', investment: 0, favour: 0 };
    child.childDevelopment.education = 'household'; child.childDevelopment.investment += 8; child.stats.wits = Math.min(100, child.stats.wits + 3);
    // kinRel, not boundKinRel: boundKinRel resolves through pendingEvent
    // bindings, and activities only ever run while no event is pending.
    applyEffects(s, { kinRel: { id: child.id, delta: 3 }, wits: 1, memory: { tag: 'taught_child', weight: 2, note: child.name } });
    pushFeed(s, 'TEACH CHILD', C.blue, `You teach ${child.name} letters, figures, and when not to correct an elder in public.`, 'good');
  },
  arrange_gathering: (s) => { applyEffects(s, { gold: -3, charm: 4, familyReputation: { delta: 2 }, householdState: { status: 2 } }); pushFeed(s, 'HOUSEHOLD GATHERING', C.charmDark, 'Bread, ale and careful seating bring several households together without a feud.', 'good'); },
  care_relative: (s) => {
    const patient = s.kin.find((kin) => kin.alive && ((kin.healthConditions?.length ?? 0) > 0 || kin.stats.health < 55));
    if (!patient) return blocked(s, 'FAMILY CARE', 'No relative presently needs sustained care.');
    const condition = patient.healthConditions?.sort((a, b) => b.severity - a.severity)[0];
    if (condition) condition.severity = Math.max(0, condition.severity - 12);
    patient.stats.health = Math.min(100, patient.stats.health + 4); applyEffects(s, { health: -2, memory: { tag: 'cared_for_family', weight: 2, note: patient.name } });
    pushFeed(s, 'FAMILY CARE', C.tealDark, `You spend the season helping ${patient.name} eat, rest and remain part of household life.`, 'good');
  },
  rest: (s) => { const player = s.world.characters[s.playerCharacterId]; const condition = player?.healthConditions?.sort((a, b) => b.severity - a.severity)[0]; if (condition) condition.severity = Math.max(0, condition.severity - 10); applyEffects(s, { health: 6 }); pushFeed(s, 'REST', C.tealDark, 'You surrender a season to sleep, broth and the radical practice of doing less.', 'good'); },
  treat_patient: (s) => { const patient = s.kin.find((kin) => kin.alive && (kin.healthConditions?.length ?? 0) > 0); if (!patient) return blocked(s, 'TREATMENT', 'No known patient needs treatment just now.'); const condition = patient.healthConditions![0]; const success = chance(0.35 + s.stats.wits / 250); condition.diagnosed = true; condition.severity = Math.max(0, condition.severity + (success ? -18 : 5)); applyEffects(s, { wits: 2, reputation: success ? 2 : -1 }); pushFeed(s, 'TREAT PATIENT', success ? C.good : C.healthDark, success ? `${patient.name} improves under thy careful treatment.` : `${patient.name} survives thy treatment but does not thank it.`, success ? 'good' : 'bad'); },
  fence_goods: (s) => { const success = chance(0.48 + s.stats.charm / 300); applyEffects(s, success ? { gold: 12, path: { outlaw: 2 }, legal: { suspicion: 6, notoriety: 2 } } : { gold: -3, legal: { suspicion: 18, notoriety: 4, status: 'accused', charge: crimeCharge(s, 'receiving stolen goods', 30, 58) }, reputation: -4 }); pushFeed(s, 'FENCE GOODS', success ? C.good : C.healthDark, success ? 'A careful buyer turns questionable goods into very spendable coin.' : 'The buyer was an informer with an excellent memory for faces.', success ? 'good' : 'bad'); },
  bribe_official: (s) => { const legal = s.world.characters[s.playerCharacterId]?.legalState; applyEffects(s, { gold: -20, faith: -3, legal: { suspicion: -22, notoriety: chance(0.25) ? 5 : 0 } }); pushFeed(s, 'BRIBERY', C.amber, legal?.suspicion ? 'An official develops a more flexible memory, though not necessarily a loyal one.' : 'The official accepts the coin and invents a problem thy payment has solved.', 'plain'); },
  scout_target: (s) => { applyEffects(s, { wits: 4, path: { outlaw: 1 }, addTags: ['crime_prepared'], legal: { suspicion: 2 } }); pushFeed(s, 'SCOUT TARGET', C.purpleDark, 'You learn the locks, habits, witnesses and exits before deciding whether to become foolish.', 'plain'); },
  study_trade: (s) => { s.occupation.experience += 8; s.occupation.performance = Math.min(100, s.occupation.performance + 3); applyEffects(s, { wits: 3 }); pushFeed(s, 'STUDY TRADE', C.blue, 'You study accounts, tools and the expensive mistakes of older professionals.', 'good'); },
  seek_patron: (s) => { const success = chance(0.35 + s.stats.charm / 220 + s.reputation / 400); if (success) { const patrons = s.kin.filter((kin) => kin.alive && (kin.rankIdx >= 2 || kin.kind === 'liege')); s.occupation.patronId = patrons.length ? pick(patrons).id : 'aldric'; } applyEffects(s, success ? { charm: 2, rankProgress: 6, faction: { factionId: 'crown', playerStanding: 3 }, addTags: ['has_patron'] } : { charm: 1, reputation: -1 }); pushFeed(s, 'SEEK PATRON', success ? C.charmDark : C.amber, success ? 'An influential household agrees to speak thy name where advancement is decided.' : 'Thy request receives courtesy, watered ale and no promise.', success ? 'good' : 'plain'); },
  run_caravan: (s) => { const success = chance(0.45 + s.stats.wits / 350 + s.stats.charm / 400); applyEffects(s, success ? { gold: 20, worldConditions: { prosperity: 2 }, faction: { factionId: 'guilds', playerStanding: 3 } } : { gold: -8, health: -4, worldConditions: { prosperity: -1 } }); pushFeed(s, 'CARAVAN', success ? C.good : C.healthDark, success ? 'The caravan returns with foreign cloth, local gossip and a respectable profit.' : 'Mud, tolls and thieves consume the venture before Swineford sees a profit.', success ? 'good' : 'bad'); },
  preach_sermon: (s) => { applyEffects(s, { faith: 4, charm: 2, faction: { factionId: 'church', playerStanding: 3 }, worldConditions: { religiousTension: s.stats.faith >= 60 ? -2 : 1 } }); pushFeed(s, 'SERMON', C.faithDark, 'You speak of duty, mercy and sins sufficiently vague to trouble every listener.', 'good'); },
  gather_intelligence: (s) => { const secretOwner = s.kin.find((kin) => kin.alive && (kin.secrets?.length ?? 0) > 0 && !kin.secretRevealed); if (secretOwner && chance(0.45 + s.stats.wits / 300)) { secretOwner.secretRevealed = true; secretOwner.secrets!.forEach((secret) => { secret.knownByIds = Array.from(new Set([...secret.knownByIds, s.playerCharacterId])); }); } applyEffects(s, { wits: 3, faction: { factionId: 'crown', playerStanding: 1 } }); pushFeed(s, 'INTELLIGENCE', C.purpleDark, secretOwner?.secretRevealed ? `Patient listening reveals something ${secretOwner.name} meant to keep hidden.` : 'You collect rumours, compare contradictions and learn where questions make people nervous.', 'plain'); },
  negotiate_levy: (s) => { const success = chance(0.4 + s.stats.charm / 250 + s.reputation / 500); applyEffects(s, success ? { charm: 3, worldConditions: { warThreat: -2, publicOrder: 2 }, faction: { factionId: 'commons', playerStanding: 4 } } : { reputation: -2, faction: { factionId: 'crown', playerStanding: -3 } }); pushFeed(s, 'LEVY BARGAIN', success ? C.good : C.healthDark, success ? 'The levy is reduced and the poorest households keep both grain and sons.' : 'The collector rejects thy argument and marks Swineford as reluctant.', success ? 'good' : 'bad'); },
  repair_household: (s) => { applyEffects(s, { gold: -5, householdState: { quality: 10, capacity: 1 } }); pushFeed(s, 'REPAIR HOME', C.amber, 'Fresh timber, patched thatch and five vanished gold make the household safer.', 'good'); },
  manage_stores: (s) => { applyEffects(s, { wits: 2, householdState: { food: 10 }, worldConditions: { foodSecurity: 1 } }); pushFeed(s, 'MANAGE STORES', C.faithDark, 'You air damp grain, count every sack and discover that rats respect no inventory.', 'good'); },
};

export function doActivity(s: GameState, id: string): GameState {
  if (s.dead || s.pendingEvent) return s;
  s.tab = 'life';
  s.selectedKinId = null;
  if (s.tags.includes('imprisoned')) {
    pushFeed(s, 'IMPRISONED', C.amber, 'You languish behind iron bars; such pursuits must wait for freedom.', 'plain');
    return s;
  }
  // Too young: the world (and your mother) will not allow it.
  const def = ACTIVITY_DEFS.find((a) => a.id === id);
  if (def?.minAge != null && s.age < def.minAge) {
    pushFeed(s, 'TOO YOUNG', C.amber, one([
      `At ${s.age}, you are firmly informed that ${def.name.toLowerCase()} is not for children. Maud marches you home by the ear.`,
      `You toddle hopefully toward the ${def.name.toLowerCase()}, and are returned to the cottage by a passing neighbour. Again.`,
      `The village agrees: no ${def.name.toLowerCase()} until you are at least ${def.minAge} winters old.`,
    ]), 'plain');
    return s;
  }
  const handler = HANDLERS[id] ?? ROLE_HANDLERS[id];
  if (handler) {
    handler(s);
    const role = def?.roles?.[0];
    if (role) {
      const previous = s.playerRun.roleProgress[role] ?? 0;
      const next = Math.min(100, previous + 5);
      s.playerRun.roleProgress[role] = next;
      if (previous < 50 && next >= 50) pushFeed(s, `${role.replaceAll('_', ' ').toUpperCase()} MASTERY`, C.purpleDark, 'Years of practice have made this calling part of thy reputation.', 'good');
    }
  }
  checkLifeGoal(s);
  return s;
}
