import { GameEvent } from '@/types/game';

/** Court intrigue — charm, scheming, and the slippery climb toward nobility. */
export const COURTIER_EVENTS: GameEvent[] = [
  {
id: 'court_invitation',
category: 'court',
title: 'AN INVITATION TO THE HALL',
text: "You are invited to the high table after an account of your wit reaches the steward. It arrives slightly improved. You must now live up to something you never quite said.",
ageMin: 14,
paths: ['court'],
requires: { statAtLeast: { charm: 45 } },
weight: 2,
choices: [
      { label: 'Charm the whole table', successChance: (s) => 0.4 + s.stats.charm / 200, success: { text: 'You had them roaring with laughter. The lord himself toasted you. Doors are opening.', effects: { charm: 6, path: { court: 4 }, rankProgress: 16, reputation: 6, memory: { tag: 'courtly_favour', weight: 2 } }, tone: 'good' }, failure: { text: 'You used the wrong spoon, then the wrong fork, then insulted a baroness. A long carriage ride home.', effects: { charm: -5, reputation: -4 }, tone: 'bad' } },
      { label: 'Quietly observe and learn', outcome: { text: 'You said little and watched much. You now know who hates whom, and that is power.', effects: { wits: 6, path: { court: 2 } }, tone: 'good' } },
    ]
},
  {
id: 'court_rivalry',
category: 'court',
title: 'A RIVAL AT COURT',
text: "{{other}} dismisses your success as an accident of useful acquaintances. The charge is delivered to as many useful acquaintances as possible.",
ageMin: 16,
paths: ['court'],
requires: { minReputation: 0 },
choices: [{
label: "Expose the contradiction in the rumour",
successChance: (s) => 0.35 + s.stats.wits / 200,
success: {
text: "You make {{other}} answer for the contradictory story. Your reputation rises and the rivalry becomes explicit.",
effects: {
wits: 5,
path: { court: 4 },
reputation: 8,
memory: { tag: 'won_intrigue', weight: 2 },
bond: {"role":"other","trust":-15,"flag":"rival"}
},
tone: 'good'
},
failure: {
text: "Your trap contradicts your own account. {{other}} gains an advantage and a clearer reason to keep the rivalry alive.",
effects: {
charm: -4,
reputation: -6,
bond: {"role":"other","affinity":-12,"flag":"rival"}
},
tone: 'bad'
}
},
{
label: "Buy a pause in the rumour (12g)",
costGold: 12,
outcome: {
text: "You pay twelve gold and gain a brief respite. {{other}} learns that silence has a price worth remembering.",
effects: {
gold: -12,
reputation: 2,
bond: {"role":"other","trust":-8},
createSecret: {"type":"hidden_debt","severity":25}
},
tone: 'plain'
}
},
{
label: "Challenge the rumour in public",
outcome: {
text: "You demand an answer before witnesses. {{other}} becomes a named rival instead of a rumour without an address.",
effects: {
charm: 3,
reputation: -2,
path: { court: 2 },
bond: {"role":"other","affinity":-16,"flag":"rival"}
},
tone: 'plain'
}
}],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'court_proposal',
category: 'court',
title: 'A NOBLE PROPOSAL',
text: "{{other}} proposes a marriage of mutual advantage and asks what sort of life you would want beyond the advantage. It is the first question not answered by the settlement.",
ageMin: 18,
paths: ['court'],
once: true,
requires: { rankAtLeast: 1, missingTags: ['married'], statAtLeast: { charm: 55 } },
choices: [{
label: "Accept the proposed marriage",
outcome: {
text: "You marry into a better-connected household. Your standing can improve through that connection; no title is granted merely by the wedding.",
effects: {
gold: undefined,
charm: 6,
rankProgress: 50,
addTags: ['married', 'married_noble'],
addKin: undefined,
path: { court: 5 },
memory: { tag: 'married_up', weight: 4 },
marryRole: "other"
},
tone: 'good'
}
},
{
label: "Decline without humiliating the suitor",
outcome: {
text: "You refuse the match graciously. Your reputation improves because you leave the proposal as private as it can still be.",
effects: {
charm: 4,
reputation: 4
},
tone: 'good'
}
}],
actorRoles: {other:{minAge:18,rankAtLeast:3,alive:true,unmarried:true,romanceEligible:true,excludePlayer:true,missingActor:'clear_event'}}
},
];
