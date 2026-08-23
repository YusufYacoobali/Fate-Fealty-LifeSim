import { GameEvent } from '@/types/game';
import { C } from '@/theme/theme';

const actorRoles = {
  other: { minAge: 14, alive: true, excludePlayer: true, missingActor: 'substitute' as const },
};

/**
 * Problems created by deliberate activities. These are internal nodes: they
 * never enter the annual event lottery, and only open when the player creates
 * the situation through an activity.
 */
export const ACTIVITY_CONSEQUENCE_EVENTS: GameEvent[] = [
  {
    id: 'activity_village_dispute', category: 'peasant', domain: 'household', arcNodeOnly: true,
    title: 'THE COMMON HEDGE', tagColor: C.amber,
    text: '{{other.name}} moves a boundary hedge while you organise the village work. By dusk two households are shouting over a strip of common ground and everyone expects you to decide whether this was theft or a mistake.',
    actorRoles,
    choices: [
      { id: 'measure', label: 'Measure the old boundary', hint: 'A slow, public settlement', outcome: { text: 'You find the old stones beneath the nettles and put the hedge back where memory and mud agree it belongs.', effects: { wits: 3, reputation: 4, worldConditions: { publicOrder: 2 }, boundKinRel: { role: 'other', delta: -3 }, memory: { tag: 'activity_village_dispute_resolved', weight: 3 } }, tone: 'good' } },
      { id: 'back_them', label: 'Back {{other.name}}', hint: 'Loyal, but visibly partial', outcome: { text: 'You declare the moved hedge reasonable. {{other.name}} remembers the loyalty; the other household remembers everything else.', effects: { charm: 2, reputation: -3, boundKinRel: { role: 'other', delta: 12 }, worldConditions: { publicOrder: -2 }, memory: { tag: 'activity_village_dispute_resolved', weight: 3 } }, tone: 'plain' } },
      { id: 'reeve', label: 'Put it before the reeve', hint: 'Safe, formal, and unpopular', outcome: { text: 'The reeve restores the boundary, fines both households for wasting his morning, and thanks you by assigning next month’s ditch work.', effects: { health: -2, rankProgress: 3, reputation: 1, memory: { tag: 'activity_village_dispute_resolved', weight: 2 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'activity_guild_pact', category: 'peasant', domain: 'career', arcNodeOnly: true,
    title: 'THE MASTERS’ PRICE', tagColor: C.charmDark,
    text: '{{other.name}} closes the guild-room door and lays out a simple proposal: every workshop will raise its prices together, and anyone who refuses will find supplies strangely unavailable.',
    actorRoles,
    choices: [
      { id: 'refuse', label: 'Refuse the pact', hint: 'Protect customers; anger the guild', outcome: { text: 'You keep your prices honest. Customers crowd your door, while three suppliers suddenly forget the road to your workshop.', effects: { gold: 5, reputation: 6, faction: { factionId: 'guilds', playerStanding: -5 }, boundKinRel: { role: 'other', delta: -10 }, memory: { tag: 'activity_guild_pact_resolved', weight: 4 } }, tone: 'plain' } },
      { id: 'join', label: 'Join them', hint: 'Profitable and hard to defend', outcome: { text: 'The new prices hold. Your purse grows heavier and the poorest customers begin repairing old things instead of buying yours.', effects: { gold: 15, faith: -4, reputation: -4, faction: { factionId: 'guilds', playerStanding: 5 }, boundKinRel: { role: 'other', delta: 6 }, memory: { tag: 'activity_guild_pact_resolved', weight: 4 } }, tone: 'plain' } },
      { id: 'bargain', label: 'Demand a poor rate', hint: 'Spend influence on a compromise', outcome: { text: 'You secure one price for noble orders and another for neighbours who arrive with mended sleeves. Nobody loves it, which is how you know it is a bargain.', effects: { charm: 5, gold: 6, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'activity_guild_pact_resolved', weight: 4 } }, tone: 'good' } },
    ],
  },
  {
    id: 'activity_confession_secret', category: 'faith', domain: 'politics', arcNodeOnly: true,
    title: 'WHAT WAS SAID IN DARKNESS', tagColor: C.faithDark,
    text: 'The voice behind the screen is {{other.name}}’s. The confession concerns a plan that may hurt innocent people, but repeating it would break the seal that made the truth possible.',
    actorRoles,
    choices: [
      { id: 'keep_seal', label: 'Keep the seal', hint: 'Protect trust; accept the risk', outcome: { text: 'You say nothing. {{other.name}} leaves knowing the secret is safe, while you spend the night wondering who may pay for that safety.', effects: { faith: 6, boundKinRel: { role: 'other', delta: 10 }, worldConditions: { publicOrder: -1 }, memory: { tag: 'activity_confession_secret_resolved', weight: 5 } }, tone: 'plain' } },
      { id: 'warn', label: 'Warn the threatened household', hint: 'Prevent harm without naming the source', outcome: { text: 'You deliver a warning wrapped in enough scripture to conceal its origin. The household prepares, and {{other.name}} watches you more carefully afterward.', effects: { wits: 4, reputation: 4, boundKinRel: { role: 'other', delta: -8 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'activity_confession_secret_resolved', weight: 5 } }, tone: 'good' } },
      { id: 'report', label: 'Report it openly', hint: 'Certain action; broken confidence', outcome: { text: 'You name the danger and its source. The plan dies immediately, along with every honest confession likely to reach you for years.', effects: { reputation: 6, faith: -6, boundKinRel: { role: 'other', delta: -18 }, worldConditions: { publicOrder: 4, religiousTension: 3 }, memory: { tag: 'activity_confession_secret_resolved', weight: 5 } }, tone: 'bad' } },
    ],
  },
  {
    id: 'activity_forbidden_manuscript', category: 'faith', domain: 'politics', arcNodeOnly: true,
    title: 'THE FORBIDDEN GLOSS', tagColor: C.blue,
    text: '{{other.name}} recognises the hand in a censored margin: a respected scholar condemned years ago. The erased argument is persuasive, useful, and dangerous to possess.',
    actorRoles,
    choices: [
      { id: 'preserve', label: 'Copy it in secret', hint: 'Preserve knowledge; risk discovery', outcome: { text: 'You hide the argument inside an innocent commentary where a careful reader may recover it. Knowledge survives by learning to whisper.', effects: { wits: 7, faith: -2, boundKinRel: { role: 'other', delta: 7 }, worldConditions: { religiousTension: 2 }, memory: { tag: 'activity_forbidden_manuscript_resolved', weight: 5, note: 'You preserved a forbidden argument inside an innocent manuscript.' } }, tone: 'plain' } },
      { id: 'erase', label: 'Finish the erasure', hint: 'Protect the house; destroy the passage', outcome: { text: 'Fresh scraping removes the last readable words. The manuscript is safe, the scriptorium is safe, and the thought exists only in your memory.', effects: { faith: 3, wits: 2, faction: { factionId: 'church', playerStanding: 4 }, boundKinRel: { role: 'other', delta: -5 }, memory: { tag: 'activity_forbidden_manuscript_resolved', weight: 4 } }, tone: 'plain' } },
      { id: 'declare', label: 'Put it before the prior', hint: 'Force an open judgment', outcome: { text: 'The prior reads the passage twice, locks the book away, and orders that no punishment follow. Half the house calls that mercy and half calls it fear.', effects: { reputation: 4, faith: 4, worldConditions: { religiousTension: -2 }, boundKinRel: { role: 'other', delta: 3 }, memory: { tag: 'activity_forbidden_manuscript_resolved', weight: 4 } }, tone: 'good' } },
    ],
  },
  {
    id: 'activity_levy_deserter', category: 'war', domain: 'politics', arcNodeOnly: true,
    title: 'ONE SPEAR MISSING', tagColor: C.healthDark,
    text: 'At roll call {{other.name}} is absent. You find them behind the tithe barn, shaking, with a widowed parent at home and no intention of marching toward a war they do not understand.',
    actorRoles,
    choices: [
      { id: 'hide', label: 'Mark them sick', hint: 'Merciful, but false', outcome: { text: 'A fever appears in the roll beside {{other.name}}’s name. Their household keeps its last able pair of hands and your captain begins counting more carefully.', effects: { faith: 4, reputation: -2, boundKinRel: { role: 'other', delta: 14 }, faction: { factionId: 'crown', playerStanding: -3 }, memory: { tag: 'activity_levy_deserter_resolved', weight: 4 } }, tone: 'plain' } },
      { id: 'return', label: 'Talk them back into line', hint: 'Duty without public shame', outcome: { text: 'You promise to place them in the rear rank and bring them home if promises survive battle. They return because you asked, not because the levy did.', effects: { charm: 5, rankProgress: 4, boundKinRel: { role: 'other', delta: 5 }, worldConditions: { warThreat: -1 }, memory: { tag: 'activity_levy_deserter_resolved', weight: 4 } }, tone: 'good' } },
      { id: 'arrest', label: 'Make an example of them', hint: 'Restore discipline through fear', outcome: { text: '{{other.name}} is bound before the whole levy. Nobody else deserts, and nobody meets your eye during the march.', effects: { reputation: 3, faith: -5, boundKinRel: { role: 'other', delta: -20 }, worldConditions: { publicOrder: 3 }, memory: { tag: 'activity_levy_deserter_resolved', weight: 5 } }, tone: 'bad' } },
    ],
  },
  {
    id: 'activity_petition_feud', category: 'noble', domain: 'household', arcNodeOnly: true,
    title: 'TWO CLAIMS, ONE MEADOW', tagColor: C.purpleDark,
    text: '{{other.name}} arrives with a charter, while another household arrives with three generations of grazing and no parchment at all. Both claims are convincing. The meadow is not large enough to satisfy either.',
    actorRoles,
    choices: [
      { id: 'custom', label: 'Uphold the old custom', hint: 'Favour use over parchment', outcome: { text: 'The grazing continues as it always has. {{other.name}} folds the charter very carefully and begins asking who else doubts written law.', effects: { reputation: 5, faction: { factionId: 'commons', playerStanding: 5 }, boundKinRel: { role: 'other', delta: -10 }, holding: { loyalty: 4 }, memory: { tag: 'activity_petition_feud_resolved', weight: 4 } }, tone: 'good' } },
      { id: 'charter', label: 'Uphold the charter', hint: 'Clear law; harsh displacement', outcome: { text: 'The seal wins. The meadow changes hands before sunset, and an old household begins selling the animals it can no longer graze.', effects: { rankProgress: 5, faction: { factionId: 'crown', playerStanding: 4 }, boundKinRel: { role: 'other', delta: 10 }, holding: { loyalty: -4 }, memory: { tag: 'activity_petition_feud_resolved', weight: 4 } }, tone: 'plain' } },
      { id: 'divide', label: 'Divide the grazing rights', hint: 'A fragile compromise', outcome: { text: 'You mark alternate grazing weeks. Both sides call it impossible and both follow the schedule once they think nobody is watching.', effects: { wits: 4, charm: 4, worldConditions: { publicOrder: 2 }, holding: { loyalty: 2 }, memory: { tag: 'activity_petition_feud_resolved', weight: 4 } }, tone: 'good' } },
    ],
  },
  {
    id: 'activity_council_crisis', category: 'court', domain: 'politics', arcNodeOnly: true,
    title: 'THE EMPTY GRANARIES', tagColor: C.purpleDark,
    text: 'The council’s figures agree on one fact: there is not enough grain for the army, the towns, and the winter poor. {{other.name}} asks which promise should be broken first.',
    actorRoles,
    choices: [
      { id: 'poor', label: 'Feed the poorest first', hint: 'Lose readiness; preserve lives', outcome: { text: 'Army stores are opened at the church doors. The hungry eat, the captains protest, and every mother in the queue learns whose order did it.', effects: { faith: 7, reputation: 7, worldConditions: { foodSecurity: 7, warThreat: 4 }, faction: { factionId: 'commons', playerStanding: 6 }, memory: { tag: 'activity_council_crisis_resolved', weight: 5 } }, tone: 'good' } },
      { id: 'army', label: 'Keep the army supplied', hint: 'Prepare for war; deepen hunger', outcome: { text: 'The military granaries remain sealed. The levy will march well-fed past villages that are not.', effects: { rankProgress: 6, worldConditions: { foodSecurity: -6, warThreat: -5, publicOrder: -3 }, faction: { factionId: 'crown', playerStanding: 5 }, memory: { tag: 'activity_council_crisis_resolved', weight: 5 } }, tone: 'bad' } },
      { id: 'buy', label: 'Buy foreign grain', hint: 'Expensive, broad relief', outcome: { text: 'Merchants empty your treasury and fill the quays. It is an undignified solution to hunger, which remains preferable to a dignified famine.', effects: { gold: -25, wits: 4, worldConditions: { foodSecurity: 8, prosperity: 2 }, boundKinRel: { role: 'other', delta: 5 }, memory: { tag: 'activity_council_crisis_resolved', weight: 5 } }, tone: 'good' } },
    ],
  },
  {
    id: 'activity_gang_betrayal', category: 'peasant', domain: 'crime', arcNodeOnly: true,
    title: 'THE MISSING SHARE', tagColor: C.healthDark,
    text: 'The gang’s purse is light by twelve gold. {{other.name}} had the key, denies taking it, and offers three different explanations before anyone asks for one.',
    actorRoles,
    choices: [
      { id: 'quiet', label: 'Recover it quietly', hint: 'Preserve the gang', outcome: { text: 'You find six gold beneath a floorboard and accept that the other six purchased silence. The gang survives with a new lock and an old suspicion.', effects: { gold: 6, wits: 4, boundKinRel: { role: 'other', delta: -8 }, legal: { suspicion: -2 }, memory: { tag: 'activity_gang_betrayal_resolved', weight: 4 } }, tone: 'plain' } },
      { id: 'expel', label: 'Expel {{other.name}}', hint: 'Restore discipline; create an enemy', outcome: { text: '{{other.name}} leaves without the purse and with every name, route, and hiding place the gang has used this year.', effects: { reputation: -3, boundKinRel: { role: 'other', delta: -20 }, legal: { suspicion: 8, notoriety: 3 }, memory: { tag: 'activity_gang_betrayal_resolved', weight: 5 } }, tone: 'bad' } },
      { id: 'forgive', label: 'Forgive the debt once', hint: 'Risk weakness for loyalty', outcome: { text: 'You name the theft, forgive it, and make {{other.name}} earn the money back beside you. Half the gang calls it weakness; the other half would now follow you anywhere.', effects: { charm: 6, faith: 3, boundKinRel: { role: 'other', delta: 12 }, path: { outlaw: 2 }, memory: { tag: 'activity_gang_betrayal_resolved', weight: 5 } }, tone: 'good' } },
    ],
  },
  {
    id: 'activity_gathering_quarrel', category: 'family', domain: 'family', arcNodeOnly: true,
    title: 'THE WRONG SEAT', tagColor: C.charmDark,
    text: 'Before the first loaf is cut, {{other.name}} objects to where you have seated them. The complaint is supposedly about precedence and unmistakably about an insult from twelve years ago.',
    actorRoles,
    choices: [
      { id: 'move', label: 'Move the whole table', hint: 'Absurd, but neutral', outcome: { text: 'Benches scrape, children carry trenchers, and everyone moves one place. The ancient insult survives but tonight’s supper does too.', effects: { charm: 4, householdState: { status: 2 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'activity_gathering_quarrel_resolved', weight: 3 } }, tone: 'good' } },
      { id: 'honour', label: 'Give {{other.name}} the high seat', hint: 'Win one ally; slight the rest', outcome: { text: '{{other.name}} receives the high seat and becomes gracious at once. Three other guests become historians.', effects: { boundKinRel: { role: 'other', delta: 12 }, familyReputation: { delta: -2 }, charm: 2, memory: { tag: 'activity_gathering_quarrel_resolved', weight: 3 } }, tone: 'plain' } },
      { id: 'laugh', label: 'Make the quarrel ridiculous', hint: 'Charm may defuse it', successChance: (s) => 0.35 + s.stats.charm / 220, success: { text: 'You retell the old insult until even its victim laughs. By pudding, the rival households are correcting your version together.', effects: { charm: 6, familyReputation: { delta: 4 }, boundKinRel: { role: 'other', delta: 5 }, memory: { tag: 'activity_gathering_quarrel_resolved', weight: 4 } }, tone: 'good' }, failure: { text: 'Your joke lands like a brick in a baptismal font. {{other.name}} leaves before supper and takes two cousins with them.', effects: { charm: -4, familyReputation: { delta: -4 }, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'activity_gathering_quarrel_resolved', weight: 4 } }, tone: 'bad' } },
    ],
  },
  {
    id: 'activity_sermon_unrest', category: 'faith', domain: 'politics', arcNodeOnly: true,
    title: 'THE PARISH HEARS A NAME', tagColor: C.faithDark,
    text: 'Your sermon against hidden sin is still echoing when someone in the nave points at {{other.name}}. The congregation turns as one body and waits for you to confirm an accusation you never made.',
    actorRoles,
    choices: [
      { id: 'mercy', label: 'Preach mercy immediately', hint: 'Cool the crowd; surrender certainty', outcome: { text: 'You turn the next half-hour toward mercy until pointing fingers lower. {{other.name}} remains shaken, but the parish leaves with nobody to punish.', effects: { faith: 6, charm: 4, worldConditions: { religiousTension: -6 }, boundKinRel: { role: 'other', delta: 8 }, memory: { tag: 'activity_sermon_unrest_resolved', weight: 5 } }, tone: 'good' } },
      { id: 'accuse', label: 'Let the accusation stand', hint: 'Gain fervour through a scapegoat', outcome: { text: 'You do not speak the name, but you do not deny it. By evening {{other.name}}’s door bears a mark in chalk and the collection plate is unusually heavy.', effects: { gold: 8, faith: 5, reputation: -5, worldConditions: { religiousTension: 8, publicOrder: -3 }, boundKinRel: { role: 'other', delta: -20 }, memory: { tag: 'activity_sermon_unrest_resolved', weight: 5 } }, tone: 'bad' } },
      { id: 'admit', label: 'Admit the sermon went too far', hint: 'Lose authority; restore trust', outcome: { text: 'You say plainly that zeal outran wisdom. A few parishioners sneer, more look relieved, and {{other.name}} stays to help extinguish the candles.', effects: { reputation: -2, wits: 4, faith: 3, worldConditions: { religiousTension: -4 }, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'activity_sermon_unrest_resolved', weight: 5 } }, tone: 'good' } },
    ],
  },
];
