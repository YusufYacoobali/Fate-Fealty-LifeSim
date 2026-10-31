import { GameEvent } from '@/types/game';

/** Extra free events inspired by medieval jest books, fabliaux, and court satire. */
export const BASE_EXPANSION_EVENTS: GameEvent[] = [
  {
id: 'base_goose_witness',
category: 'peasant',
title: 'THE GOOSE IS SUMMONED',
text: "The reeve summons Sir Quackbeard in a disputed theft. The clerk leaves space for a mark; the goose inspects whether it can be eaten.",
ageMin: 10,
ranks: ['Peasant', 'Squire'],
choices: [
      { label: 'Interpret the honks', outcome: { text: 'You translate three honks as "the baker did it." The baker confesses to avoid further poultry law.', effects: { charm: 6, wits: 3, kinRel: { id: 'goose', delta: 6 }, reputation: 4 }, tone: 'good' } },
      { label: 'Let the goose speak', outcome: { text: 'Sir Quackbeard bites the reeve. The court accepts this as strong testimony.', effects: { charm: 4, health: -2, kinRel: { id: 'goose', delta: 4 } }, tone: 'plain' } },
      { label: 'Blame the pie', outcome: { text: 'You accuse the pie of tempting honest men. The court pauses, then fines you for nonsense.', effects: { gold: -3, wits: 2 }, tone: 'bad' } },
    ],
requires: { custom:s=>s.world.characters.goose?.alive===true }
},
  {
id: 'base_pig_trial',
category: 'peasant',
title: 'A PIG ON TRIAL',
text: "A pig is accused of eating chapel flowers. The court debates intent while the defendant attempts to consume the evidence basket.",
ageMin: 8,
ranks: ['Peasant', 'Squire'],
choices: [
      { label: 'Defend the pig', successChance: (s) => 0.35 + s.stats.charm / 250, success: { text: 'Your speech on floral temptation moves the court. The pig is spared and immediately eats the verdict.', effects: { charm: 8, reputation: 5, path: { court: 2 } }, tone: 'good' }, failure: { text: 'Your defense collapses when the accused eats your sleeve.', effects: { charm: -4, health: -2 }, tone: 'bad' } },
      { label: 'Demand harsh justice', outcome: { text: 'The pig is sentenced to public shame. It appears immune.', effects: { faith: -2, reputation: -3, wits: 2 }, tone: 'plain' } },
    ]
},
  {
id: 'base_holy_bathwater',
category: 'peasant',
title: 'HOLY BATHWATER',
text: "A friar sells holy bathwater that smells of yesterday’s broth. He calls the floating onion a sign that the blessing has taken.",
ageMin: 10,
choices: [
      { label: 'Buy a bottle (5g)', costGold: 5, outcome: { text: 'You drink it and feel warmth in the soul, or possibly leek. The friar calls both miracles.', effects: { gold: -5, faith: 7, health: -2 }, tone: 'plain' } },
      { label: 'Expose the soup', successChance: (s) => 0.45 + s.stats.wits / 250, success: { text: 'You find a turnip floating in the relic jar. The crowd turns on him with ladles.', effects: { wits: 5, reputation: 5, charm: 3, memory: { tag: 'exposed_holy_soup', weight: 2 } }, tone: 'good' }, failure: { text: 'The friar declares the turnip a sign. You are booed by people holding soup.', effects: { charm: -4, faith: -2, memory: { tag: 'mocked_by_soup_pilgrims', weight: 2 } }, tone: 'bad' } },
      { label: 'Ask for bread too', outcome: { text: 'The friar, impressed by your theology of lunch, gives you a heel of bread.', effects: { health: 3, wits: 1 }, tone: 'good' } },
    ]
},
  {
id: 'base_leeches_for_rent',
category: 'peasant',
title: "THE DOCTOR'S CURE",
text: "A leech seller offers to treat unpaid rent. His argument is that the landlord cannot demand blood if somebody else has already taken it.",
ageMin: 12,
choices: [{
label: "Pay for the dubious treatment (4g)",
costGold: 4,
outcome: {
text: "The treatment costs blood and coin without touching the rent. You leave with a clearer sense of what the leeches actually consume.",
effects: {
gold: -4,
health: -4,
charm: -2
},
tone: 'plain'
}
},
{
label: "Ask whether the landlord has agreed",
outcome: {
text: "The seller has not consulted the landlord. You gain judgement while the leeches continue to make a much simpler living.",
effects: {
wits: 5,
familyReputation: {"delta":1}
},
tone: 'good'
}
},
{
label: "Sell a false specimen to the seller",
requires: { minGold: 1 },
outcome: {
text: "You earn six gold and create a fraud charge. A worm in a cup has proved more difficult to defend than to sell.",
effects: {
gold: 6,
faith: -3,
path: { outlaw: 1 },
legal: {"suspicion":38,"charge":{"offence":"Selling a false medicinal specimen","severity":20,"evidence":45,"victimIds":[],"witnessIds":[]}}
},
tone: 'good'
}
}]
},
  {
id: 'base_spare_toe_relic',
category: 'peasant',
title: "SAINT SOMEBODY'S TOE",
text: "A seller displays a waxy toe attributed to a saint whose name becomes less certain when you ask for the history of the other nine.",
ageMin: 11,
choices: [
      { label: 'Buy the toe (7g)', costGold: 7, outcome: { text: 'The toe is wax. Your faith wobbles, but your candle supply improves.', effects: { gold: -7, faith: 4, wits: -2 }, tone: 'plain' } },
      { label: 'Ask it to bless you', outcome: { text: 'Nothing happens. The seller says the toe is shy before crowds.', effects: { charm: 2, faith: -2 }, tone: 'plain' } },
      { label: 'Report him to the priest', outcome: { text: 'The priest confiscates the toe, then quietly asks if there were any fingers.', effects: { reputation: 4, faith: 3, memory: { tag: 'reported_false_relic', weight: 2 } }, tone: 'good' } },
    ]
},
  {
id: 'base_alehouse_oath',
category: 'peasant',
title: 'THE ALEHOUSE OATH',
text: "The tavern agrees to dig defensive works before dawn. Nobody has agreed which side of the ditch Swineford ought to occupy.",
ageMin: 14,
choices: [
      { label: 'Dig bravely', outcome: { text: 'By dawn you have made a ditch, lost a shoe, and invented a new smell.', effects: { health: -5, charm: 5, path: { labour: 2 } }, tone: 'good' } },
      { label: 'Sell shovels', outcome: { text: 'You sell shovels at heroic prices. The moat is poor; your purse is excellent.', effects: { gold: 10, faith: -2, path: { court: 1 } }, tone: 'good' } },
      { label: 'Sleep under the table', outcome: { text: 'You wake to find the moat is actually around you.', effects: { health: 2, charm: -3 }, tone: 'plain' } },
    ]
},
  {
id: 'base_miller_toll',
category: 'peasant',
title: "THE MILLER'S TOLL",
text: "The miller calls his enlarged scoop an improvement in accuracy. It is certainly more accurate at transferring flour into his own store.",
ageMin: 12,
ranks: ['Peasant', 'Squire'],
choices: [
      { label: 'Challenge the measure', successChance: (s) => 0.4 + s.stats.wits / 250, success: { text: 'You find a stone hidden in his scoop. The village laughs until flour comes out of their noses.', effects: { wits: 6, reputation: 5, gold: 4 }, tone: 'good' }, failure: { text: 'The miller talks faster than his wheel. You leave poorer and dusted white.', effects: { gold: -4, charm: -2 }, tone: 'bad' } },
      { label: 'Pay and remember', outcome: { text: 'You pay quietly. Your revenge ripens like damp grain.', effects: { wits: 3, memory: { tag: 'miller_cheated', weight: 2 } }, tone: 'plain' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'base_bell_ringer',
category: 'peasant',
title: "THE BELL RINGER'S BET",
text: "The bell ringer bets that you cannot sleep through matins. He holds the rope like a man whose confidence has a very direct source.",
ageMin: 9,
choices: [
      { label: 'Take the bet', successChance: (s) => 0.45 + s.stats.health / 300, success: { text: 'You sleep like a blessed log. The bell ringer fears you may be part stone.', effects: { gold: 5, health: 4, charm: 2 }, tone: 'good' }, failure: { text: 'The first bell launches you out of bed and into a bucket.', effects: { health: -2, charm: -3 }, tone: 'bad' } },
      { label: 'Ring it first', outcome: { text: 'You ring early. Half the village arrives angry, dressed, and spiritually confused.', effects: { charm: 4, faith: -3, path: { outlaw: 1 } }, tone: 'plain' } },
    ]
},
  {
id: 'base_turnip_oracle',
category: 'peasant',
title: 'THE TURNIP ORACLE',
text: "A root split by frost is being read as a weather omen. The keeper promises an answer before supper, when the evidence will be eaten.",
ageMin: 6,
choices: [{
label: "Study the crack rather than buy the prophecy",
outcome: {
text: "You learn how frost split the root and improve household food planning. The forecast is useful precisely because nobody claims it speaks.",
effects: {
faith: 4,
charm: 4,
memory: { tag: 'turnip_oracle', weight: 2 },
wits: 3,
householdState: {"food":3}
},
tone: 'good'
}
},
{
label: "Buy it as food and end the performance",
outcome: {
text: "You make a meal of the disputed evidence. The household gains food; no prediction is proved merely because you are fed.",
effects: {
health: 5,
faith: -4,
householdState: {"food":4}
},
tone: 'plain'
}
}]
},
  {
id: 'court_wrong_spoon',
category: 'court',
title: 'THE WRONG SPOON',
text: "The steward gives you a spoon whose use depends on the guest seated above you. You have been placed directly beneath a person who will not eat.",
ageMin: 14,
paths: ['court'],
choices: [{
label: "Use the spoon and accept the risk of a joke",
successChance: (s) => 0.35 + s.stats.charm / 250,
success: {
text: "You choose correctly and gain a little courtly standing. The spoon performs the undistinguished task it was made for.",
effects: {
charm: 6,
reputation: 4,
path: { court: 2 },
faction: {"factionId":"crown","playerStanding":2}
},
tone: 'good'
},
failure: {
text: "You choose badly and lose standing. The steward now has a story in which the most important object is cutlery.",
effects: {
charm: -6,
wits: 2,
faction: {"factionId":"crown","playerStanding":-2}
},
tone: 'bad'
}
},
{
label: "Use bread and leave the rule untested",
outcome: {
text: "You eat neatly with bread and gain a little judgement. The idle guest remains the only person waiting on the spoon.",
effects: {
health: 3,
charm: 2,
wits: 3
},
tone: 'plain'
}
}]
},
  {
id: 'court_jester_insult',
category: 'court',
title: "THE JESTER'S BITE",
text: "The jester has prepared a joke about your boots. The room is waiting to discover whether your power is large enough to survive a small laugh.",
ageMin: 16,
paths: ['court'],
choices: [
      { label: 'Laugh loudest', outcome: { text: 'You laugh first and steal the sting. The court likes a target who can bow.', effects: { charm: 8, reputation: 4, path: { court: 2 } }, tone: 'good' } },
      { label: 'Insult him back', successChance: (s) => 0.35 + s.stats.wits / 220, success: { text: 'Your reply lands so neatly the jester bows to you. Terrible for him, excellent for your legend.', effects: { wits: 5, charm: 7, reputation: 5 }, tone: 'good' }, failure: { text: 'Your comeback limps out and dies near the salt cellar.', effects: { charm: -5 }, tone: 'bad' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'court_forged_lineage',
category: 'court',
title: 'A VERY OLD FAMILY TREE',
text: "A clerk offers a royal pedigree with space left for your preferred ancestor. The oldest branch of the family tree is still drying.",
ageMin: 18,
paths: ['court'],
choices: [
      { label: 'Buy the ancestors (18g)', costGold: 18, outcome: { text: 'You gain three dukes, a saint, and one suspiciously handsome oak tree.', effects: { gold: -18, charm: 7, rankProgress: 14, path: { court: 3 } }, tone: 'good' } },
      { label: 'Expose the ink', outcome: { text: 'You point out the wet seal. The clerk says your eyesight is lowborn.', effects: { wits: 5, reputation: 3 }, tone: 'plain' } },
      { label: 'Add the goose', outcome: { text: 'Sir Quackbeard is inserted as a Norman baron. Somehow the chart improves.', effects: { charm: 3, kinRel: { id: 'goose', delta: 4 } }, tone: 'good' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'court_flatterer',
category: 'court',
title: 'THE GOLDEN FLATTERER',
text: "A courtier praises your judgement so extensively that the favour he wants has begun to sound overdue.",
ageMin: 16,
paths: ['court'],
choices: [
      { label: 'Reward the praise (8g)', costGold: 8, outcome: { text: 'The praise doubles at once. Your nose is now compared to a noble ship.', effects: { gold: -8, charm: 5, path: { court: 1 } }, tone: 'plain' } },
      { label: 'Ask what he wants', outcome: { text: "He wanted a post, a purse, and your cousin's hand. You give him none and keep your spoon.", effects: { wits: 6, reputation: 3 }, tone: 'good' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'court_bishop_fish',
category: 'court',
title: "THE BISHOP'S FISH",
text: "The bishop claims the largest fish on grounds of spiritual precedence. The dish has become an excellent test of how hungry theology can be.",
ageMin: 15,
paths: ['court'],
choices: [
      { label: 'Agree piously', outcome: { text: 'The bishop takes the fish and a second helping of the argument that got it for him. He blesses you between mouthfuls and has forgotten your name by the fruit.', effects: { faith: 5, charm: 2, path: { church: 1 }, memory: { tag: 'yielded_to_bishop', weight: 2 } }, tone: 'plain' } },
      { label: 'Argue theology', successChance: (s) => 0.35 + s.stats.wits / 220, success: { text: 'You prove the smallest fish is humblest and therefore holiest. The bishop loses appetite and argument, in that order.', effects: { wits: 6, faith: 4, reputation: 4, faction: { factionId: 'church', playerStanding: -2 }, memory: { tag: 'out_argued_bishop', weight: 3 } }, tone: 'good' }, failure: { text: 'You confuse a psalm with a recipe. The bishop keeps the fish and the moral high ground.', effects: { charm: -3, faith: -2, memory: { tag: 'lost_fish_argument', weight: 2 } }, tone: 'bad' } },
    ]
},
  {
id: 'court_singing_lawyer',
category: 'court',
title: 'THE SINGING LAWYER',
text: "A lawyer presents a boundary claim in rhyme. The verse is impeccable, which is awkward because the measurements are not.",
ageMin: 18,
paths: ['court'],
choices: [
      { label: 'Join the rhyme', successChance: (s) => 0.4 + s.stats.charm / 250, success: { text: 'Your couplet wins the room and, somehow, the argument. The clerk copies it into the roll, where it will embarrass someone for a century.', effects: { charm: 7, wits: 3, reputation: 4, path: { court: 2 }, memory: { tag: 'rhymed_at_the_assize', weight: 3 } }, tone: 'good' }, failure: { text: 'You rhyme "acre" with "baker." The judge ages visibly and rules against everyone present.', effects: { charm: -4, memory: { tag: 'rhymed_badly_in_court', weight: 2 } }, tone: 'bad' } },
      { label: 'Demand plain speech', outcome: { text: 'Everyone thanks you except the lawyer, who was halfway to rhyming "ditch." The case is decided in an hour instead of a season.', effects: { wits: 4, reputation: 3, faction: { factionId: 'crown', playerStanding: 2 }, memory: { tag: 'plain_speech_advocate', weight: 2 } }, tone: 'good' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'court_bad_portrait',
category: 'court',
title: 'THE COURT PORTRAIT',
text: "A painter has rendered your face with dismaying honesty. The clothes are splendid, so no one can claim the same mistake affected the whole canvas.",
ageMin: 18,
paths: ['court'],
choices: [
      { label: 'Praise the honesty', outcome: { text: 'The court admires your humility. The painter admits he painted the cabbage from memory. It hangs in the great hall for the rest of your life.', effects: { charm: 5, faith: 2, memory: { tag: 'cabbage_portrait_hangs', weight: 3, note: 'A famously unflattering portrait hangs where everyone can see it.' } }, tone: 'good' } },
      { label: 'Demand beauty (10g)', costGold: 10, outcome: { text: 'The new version has heroic cheekbones and no known relation to you. The first one is not destroyed, merely moved somewhere with worse light.', effects: { gold: -10, charm: 8, wits: -1, path: { court: 1 }, memory: { tag: 'vain_portrait', weight: 2 } }, tone: 'plain' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'knight_turnip_insult',
category: 'knight',
title: 'HONOUR OF THE TURNIP',
text: "A knight mocks the root on your crest. The insult might be harmless if he were not waiting so eagerly to see what you will pay for a reply.",
ageMin: 16,
ranks: ['Squire', 'Knight'],
choices: [
      { label: 'Challenge him', successChance: (s) => 0.35 + s.paths.martial / 180 + s.stats.health / 350, success: { text: 'You strike his shield so hard the turnip becomes fashionable.', effects: { charm: 9, health: -8, reputation: 7, rankProgress: 16, path: { martial: 3 } }, tone: 'good' }, failure: { text: 'He knocks you into a cart of actual turnips. The symbolism is unbearable.', effects: { health: -12, charm: -4 }, tone: 'bad' } },
      { label: 'Embrace the turnip', outcome: { text: 'You declare the turnip humble, nourishing, and hard to kill. The crowd cheers despite itself.', effects: { charm: 6, faith: 2 }, tone: 'good' } },
    ]
},
  {
id: 'knight_squire_helmet',
category: 'knight',
title: "THE SQUIRE'S HELMET",
text: "A squire has polished your helmet through a thin patch. You can now admire the work from both sides of the metal.",
ageMin: 17,
ranks: ['Knight', 'Noble'],
choices: [
      { label: 'Praise the work', outcome: { text: 'The squire beams and drops the helmet on your foot.', effects: { charm: 4, health: -2, reputation: 2 }, tone: 'good' } },
      { label: 'Teach discipline', outcome: { text: 'You lecture on care, duty, and not blinding allies with shine.', effects: { wits: 4, rankProgress: 6, path: { martial: 1 } }, tone: 'plain' } },
    ]
},
  {
id: 'knight_tournament_pudding',
category: 'knight',
title: 'THE PUDDING PRIZE',
text: "The tourney offers a spur for skill and a pudding for endurance. Competitors are becoming suspicious about which contest is expected to produce more casualties.",
ageMin: 16,
ranks: ['Squire', 'Knight'],
choices: [
      { label: 'Fight for the spur', successChance: (s) => 0.4 + s.paths.martial / 200, success: { text: 'You win the spur and only a modest limp. Chivalry smiles.', effects: { charm: 9, health: -8, rankProgress: 18, reputation: 6, path: { martial: 3 }, memory: { tag: 'won_the_silver_spur', weight: 3 } }, tone: 'good' }, failure: { text: 'You lose the bout and land face-first in the prize pudding. The heralds will describe this for years, always at feasts.', effects: { health: -8, charm: 2, memory: { tag: 'the_pudding_landing', weight: 3, note: 'Unhorsed into a pudding before the whole tourney field.' } }, tone: 'bad' } },
      { label: 'Fight for the pudding', outcome: { text: 'You win the pudding by terrifying everyone with sincerity, then eat a third of it standing up.', effects: { health: 6, charm: 4, faith: -1, householdState: { food: 3 }, memory: { tag: 'pudding_champion', weight: 2 } }, tone: 'good' } },
    ]
},
  {
id: 'knight_horse_sermon',
category: 'knight',
title: 'THE HORSE SERMON',
text: "The chaplain blesses the warhorses. One bows its head at exactly the right moment, creating an unfortunate comparison with the riders.",
ageMin: 16,
ranks: ['Squire', 'Knight', 'Noble'],
choices: [
      { label: 'Pray beside it', outcome: { text: 'The horse sneezes on you at the amen. The chaplain calls it a sign, and the stable hands start calling you Blessed of the Bay Mare.', effects: { faith: 6, health: -1, path: { church: 1 }, memory: { tag: 'blessed_by_a_horse', weight: 2 } }, tone: 'good' } },
      { label: 'Question its piety', outcome: { text: 'It steps on your boot. The debate is settled, and the chaplain writes down that you doubted publicly.', effects: { wits: 2, health: -3, charm: 2, faction: { factionId: 'church', playerStanding: -1 }, memory: { tag: 'doubted_the_blessing', weight: 2 } }, tone: 'plain' } },
    ]
},
  {
id: 'knight_ransom_duck',
category: 'knight',
title: 'A RANSOM IN POULTRY',
text: "A captured knight’s proposed ransom contains poultry, buttons and an account of why ready coin would be beneath the dignity of his house.",
ageMin: 18,
ranks: ['Knight', 'Noble'],
choices: [
      { label: 'Accept the ransom', outcome: { text: 'The ducks arrive furious. The promise not to sing proves priceless, and the knight leaves owing you a courtesy he will one day be asked to repay.', effects: { gold: 12, charm: 3, reputation: 3, householdState: { food: 4 }, memory: { tag: 'ransom_paid_in_ducks', weight: 3, note: 'A knight ransomed himself in poultry and still owes a favour.' } }, tone: 'good' } },
      { label: 'Demand proper coin', successChance: (s) => 0.45 + s.stats.charm / 300, success: { text: 'His family pays in coin and apologizes for the ducks. They do not forget being made to apologize.', effects: { gold: 24, reputation: 4, memory: { tag: 'squeezed_a_ransom', weight: 3 } }, tone: 'good' }, failure: { text: 'His family sends more ducks. You have negotiated poorly and now keep five ducks.', effects: { charm: -2, health: -1, householdState: { food: 5 }, memory: { tag: 'the_duck_surplus', weight: 2 } }, tone: 'plain' } },
    ]
},
  {
id: 'knight_rusty_relic',
category: 'knight',
title: 'THE RUSTY SWORD RELIC',
text: "A monk identifies your rusty practice sword as a martyr’s relic. You remember the smith making it, but the monk says certainty can be a spiritual obstacle.",
ageMin: 17,
ranks: ['Squire', 'Knight'],
choices: [
      { label: 'Donate it', outcome: { text: 'Pilgrims kiss the rust. You feel pious and slightly worried about tetanus.', effects: { faith: 8, reputation: 4, path: { church: 1 } }, tone: 'good' } },
      { label: 'Keep your sword', outcome: { text: 'You keep it. The monk asks if your boot has any sacred blisters.', effects: { wits: 4, faith: -1 }, tone: 'plain' } },
    ]
},
  {
id: 'knight_ducking_stool',
category: 'knight',
title: 'THE DUCKING STOOL HONOUR',
text: "A village asks you to settle a dispute by ducking both parties. The stated advantage is that nobody needs to listen to them finish.",
ageMin: 18,
ranks: ['Knight', 'Noble'],
choices: [
      { label: 'Dunk both equally', outcome: { text: 'Justice splashes. Everyone leaves wet, offended, and weirdly satisfied. The village adds your name to the custom.', effects: { reputation: 5, charm: 4, worldConditions: { publicOrder: 1 }, memory: { tag: 'judged_by_pond', weight: 2 } }, tone: 'good' } },
      { label: 'Hear the case properly', outcome: { text: 'You listen for an hour and discover the true villain is a missing cheese. Word spreads that you will actually hear a case, which is going to cost you every future afternoon.', effects: { wits: 6, faith: 2, worldConditions: { publicOrder: 2 }, faction: { factionId: 'commons', playerStanding: 3 }, memory: { tag: 'hears_cases_properly', weight: 3 } }, tone: 'good' } },
    ]
},
  {
id: 'noble_bad_herald',
category: 'noble',
title: 'THE BAD HERALD',
text: "Your herald announces a title from the rehearsal notes rather than the approved roll. The mistake describes your damp estate with painful accuracy.",
ageMin: 20,
ranks: ['Noble'],
choices: [{
label: "Accept the damp title and laugh first",
outcome: {
text: "You make the mistake safe to laugh at and gain household loyalty. The herald retains a job that suddenly feels much less secure.",
effects: {
charm: 8,
reputation: 5,
addTags: ['defender_of_turnips'],
memory: { tag: 'defender_of_turnips', weight: 3, note: 'A herald’s joke became a title you chose to keep.' },
holding: {"loyalty":5},
familyReputation: {"delta":2}
},
tone: 'good'
}
},
{
label: "Correct the roll without inventing a punishment",
outcome: {
text: "You have the proper title read and lose a little charm. The household learns you value precision even when everyone has heard the alternative.",
effects: {
charm: -3,
wits: 2,
familyReputation: { delta: -1 },
memory: { tag: 'snapped_at_the_herald', weight: 2 },
holding: {"loyalty":-2}
},
tone: 'plain'
}
}]
},
  {
id: 'noble_feast_disaster',
category: 'noble',
title: 'THE FEAST DISASTER',
text: "At your feast, sauce catches fire just as a guest praises the kitchen’s originality. The cook waits to hear whether this is a compliment or a charge.",
ageMin: 22,
ranks: ['Noble'],
choices: [
      { label: 'Call it entertainment', outcome: { text: 'You declare it a new French fashion. No one knows enough French to disagree.', effects: { charm: 8, wits: 4, reputation: 3, holding: { stores: -5, loyalty: 5 } }, tone: 'good' } },
      { label: 'Blame the cook', outcome: { text: 'The cook bows and points out you ordered "something memorable." Treason by accuracy.', effects: { reputation: -4, faith: -2, holding: { stores: -5, loyalty: -5 } }, tone: 'bad' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'noble_stained_glass',
category: 'noble',
title: 'YOUR FACE IN GLASS',
text: "A proposed chapel window gives you a halo and very prominent ears. The glazier says the ears will be less noticeable once people start praying.",
ageMin: 24,
ranks: ['Noble'],
choices: [
      { label: 'Praise the piety', outcome: { text: 'You praise the holy light. At sunset, your ears glow across the nave.', effects: { faith: 8, charm: 3, memory: { tag: 'window_patron', weight: 3 } }, tone: 'good' } },
      { label: 'Pay for smaller ears (15g)', costGold: 15, outcome: { text: 'The glazier reduces them. The saint beside you now looks disappointed.', effects: { gold: -15, charm: 6 }, tone: 'plain' } },
    ]
},
  {
id: 'noble_overproud_cousin',
category: 'noble',
title: 'THE OVERPROUD COUSIN',
text: "A relative insists the family has always been noble while hiding the household’s old tools. The tools have a more convincing account of the past.",
ageMin: 22,
ranks: ['Noble'],
choices: [
      { label: 'Let him boast', outcome: { text: 'He invents an ancestor who conquered a ditch. The room chooses to believe it, which means someone will eventually check.', effects: { charm: 4, reputation: 3, createSecret: { type: 'false_lineage', severity: 30, knownByIds: [] }, memory: { tag: 'let_the_lineage_lie_stand', weight: 3 } }, tone: 'plain' } },
      { label: 'Mention the mud', outcome: { text: 'You speak warmly of Swineford mud. Half the court laughs; the other half checks its boots. Your cousin does not speak to you until Candlemas.', effects: { faith: 3, charm: 5, familyReputation: { delta: 2 }, memory: { tag: 'owned_the_swineford_mud', weight: 3 } }, tone: 'good' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'noble_reeve_petition',
category: 'noble',
title: "THE REEVE'S PETITION",
text: "The reeve asks to tax smoke because it passes through your air. His calculation makes a cold, poor household look like a wilful tax evader.",
ageMin: 22,
ranks: ['Noble'],
choices: [
      { label: 'Reject the foolish tax', outcome: { text: 'The villagers cheer. The reeve sadly scratches "cloud rent" from his next proposal. The whole village now knows what sort of lord it has, which is worth more than the four shillings.', effects: { reputation: 10, faith: 4, gold: -4, holding: { loyalty: 8 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'refused_the_smoke_tax', weight: 3 } }, tone: 'good' } },
      { label: 'Allow a tiny tax', outcome: { text: 'The treasury gains coin. Every chimney now smokes accusingly, and the reeve begins drafting cloud rent in earnest.', effects: { gold: 18, reputation: -8, faith: -3, holding: { loyalty: -10 }, faction: { factionId: 'commons', playerStanding: -4 }, memory: { tag: 'taxed_the_smoke', weight: 3, note: 'You put a tax on chimney smoke and the village has not forgotten.' } }, tone: 'plain' } },
    ],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'faith_friar_pudding',
category: 'faith',
title: 'THE FRIAR AND THE PUDDING',
text: "A friar condemns appetite while concealing a pudding under his robe. A dark patch is developing exactly where the argument is weakest.",
ageMin: 12,
choices: [
      { label: 'Expose the pudding', outcome: { text: 'The pudding drops at the word "temptation." The sermon ends early and sticky, and the friar remembers precisely who was pointing.', effects: { wits: 5, charm: 5, faith: 2, faction: { factionId: 'church', playerStanding: -3 }, memory: { tag: 'exposed_the_friars_pudding', weight: 3 } }, tone: 'good' } },
      { label: 'Protect his dignity', outcome: { text: 'You cough loudly while he rescues dessert. He blesses you with grateful crumbs and, more usefully, owes you a silence of your own one day.', effects: { faith: 5, health: 2, faction: { factionId: 'church', playerStanding: 3 }, memory: { tag: 'covered_for_the_friar', weight: 3, note: 'A friar owes you a kindness for a pudding nobody mentioned.' } }, tone: 'plain' } },
    ]
},
  {
id: 'faith_upside_down_plague_flag',
category: 'faith',
title: 'THE UPSIDE-DOWN FLAG',
text: "A sickness flag hangs the wrong way up. Two factions are arguing over the meaning of a knot nobody has offered to untie.",
ageMin: 14,
requires: { custom: (s) => s.bornYear + s.age >= 1347 },
choices: [
      { label: 'Set it right', outcome: { text: 'You fix the flag. The argument moves to whether you used the blessed ladder, and will still be running at Lammas.', effects: { faith: 4, reputation: 3, worldConditions: { religiousTension: -2 }, memory: { tag: 'righted_the_plague_flag', weight: 2 } }, tone: 'plain' } },
      { label: 'Declare both sides wrong', outcome: { text: 'You declare the flag cannot read itself. This is called wisdom by three people and heresy by one, and it is the one who writes letters.', effects: { wits: 6, charm: 3, worldConditions: { religiousTension: 3 }, memory: { tag: 'named_a_heretic_over_a_flag', weight: 3 } }, tone: 'good' } },
    ]
},
  {
id: 'faith_pardoner_sale',
category: 'faith',
title: "THE PARDONER'S BUNDLE",
text: "A pardoner offers forgiveness among the combs and trinkets on his stall. He recommends buying it before the afternoon prices rise.",
ageMin: 13,
choices: [
      { label: 'Buy forgiveness (6g)', costGold: 6, outcome: { text: 'He forgives you for sins you had not planned yet. Efficient, if troubling. You keep the paper, which is the part that will matter.', effects: { gold: -6, faith: 6, wits: -1, path: { church: 1 }, memory: { tag: 'bought_a_pardon', weight: 3, note: 'You hold a pardoner’s letter for sins not yet committed.' } }, tone: 'plain' } },
      { label: 'Ask for a receipt', outcome: { text: 'He flees at the word "receipt." The crowd learns a valuable theology of paperwork, and repeats the story at every fair for a decade.', effects: { wits: 5, reputation: 4, faction: { factionId: 'commons', playerStanding: 2 }, memory: { tag: 'routed_a_pardoner', weight: 3 } }, tone: 'good' } },
    ]
},
  {
id: 'family_heir_goat_word',
category: 'family',
title: "THE HEIR'S FIRST WORD",
text: "A young child in your household offers an early word that sounds like “goat.” You are asked to judge whether this demonstrates genius or somebody else’s example.",
ageMin: 20,
requires: {custom:s=>s.kin.some(k=>k.alive&&k.parentIds?.includes(s.playerCharacterId)&&k.age<=3)},
choices: [
      { label: 'Call it genius', outcome: { text: 'You declare the child prophetic. The family begins watching goats for omens.', effects: { charm: 4, faith: 3, kinRel: { id: 'goose', delta: 2 } }, tone: 'good' } },
      { label: 'Blame your spouse', outcome: { text: 'Your spouse blames you back with better evidence.', effects: { charm: -3, wits: 2 }, tone: 'plain' } },
    ]
},
  {
id: 'family_father_tall_tale',
category: 'family',
title: "FATHER'S TALL TALE",
text: "{{father}} tells a story in which the enemy gets larger every time the bowl is refilled. {{mother}} remembers being present and is finding the new numbers difficult.",
ageMin: 12,
requires: { custom: (s) => !!s.kin.find((k) => k.id === 'father' && k.alive) },
choices: [
      { label: 'Believe Father', outcome: { text: 'Your father glows with pride and retells it as eight taxmen.', effects: { kinRel: { id: 'father', delta: 8 }, charm: 2 }, tone: 'good' } },
      { label: 'Ask Your mother for truth', outcome: { text: 'Your mother describes the goose victory in brutal detail. Your father studies the floor.', effects: { wits: 4, kinRel: { id: 'mother', delta: 4 } }, tone: 'good' } },
    ],
actorRoles: {father:{relation:'parent',gender:'man',alive:true,excludePlayer:true,missingActor:'clear_event'},mother:{relation:'parent',gender:'woman',alive:true,excludePlayer:true,missingActor:'clear_event'}}
},
  {
id: 'family_spouse_sermon_sleep',
category: 'family',
title: 'SLEEPING THROUGH SERMON',
text: "{{spouse}} nods off during the sermon and snores into a pause designed for moral reflection. The reflection spreads to your bench.",
ageMin: 18,
requires: { hasTags: ['married'] },
choices: [
      { label: 'Wake them gently', outcome: { text: 'They wake, nod gravely, and pretend the snore was theological agreement.', effects: { faith: 3, charm: 3, memory: { tag: 'spouse_sermon_kindness', weight: 2 } }, tone: 'good' } },
      { label: 'Let it happen', outcome: { text: 'The priest takes it personally. The pew takes it loudly.', effects: { charm: -2, faith: -2, health: 2 }, tone: 'plain' } },
    ],
actorRoles: {spouse:{relation:'spouse',alive:true,minAge:18,excludePlayer:true,missingActor:'clear_event'}}
},
  {
id: 'plague_door_mark',
category: 'plague',
title: 'THE WRONG DOOR',
text: "A marker has mistaken your door for one under sickness watch. The apology is being delivered from a distance the mistake itself has made unnecessary.",
ageMin: 14,
requires: { custom: (s) => s.bornYear + s.age >= 1347 },
choices: [
      { label: 'Scrub it off', outcome: { text: 'You scrub until the door is cleaner than your soul.', effects: { health: -2, charm: 2 }, tone: 'plain' } },
      { label: 'Use the privacy', outcome: { text: 'No one visits for weeks. Peaceful, except for the screaming outside.', effects: { health: 4, charm: -3, memory: { tag: 'plague_privacy', weight: 2 } }, tone: 'plain' } },
    ]
},
  {
id: 'plague_bell_argument',
category: 'plague',
title: 'THE BELL ARGUMENT',
text: "The bell ringer asks what a sickness warning ought to sound like. Everyone wants a warning that is accurate and not intended for them.",
ageMin: 14,
requires: { custom: (s) => s.bornYear + s.age >= 1347 },
choices: [
      { label: 'Choose hopeful', outcome: { text: 'The bells ring bright over a frightened village. For a moment people breathe easier, and afterwards they remember who chose the sound of that year.', effects: { faith: 5, reputation: 4, worldConditions: { publicOrder: 2 }, memory: { tag: 'chose_the_hopeful_bells', weight: 3 } }, tone: 'good' } },
      { label: 'Choose frightening', outcome: { text: 'The bells terrify everyone except the sickness, which has poor manners. Three households leave Swineford rather than hear them again.', effects: { charm: -2, faith: 2, worldConditions: { publicOrder: -2, diseasePressure: -1 }, memory: { tag: 'chose_the_frightening_bells', weight: 3 } }, tone: 'plain' } },
    ]
},
  {
id: 'war_backwards_banner',
category: 'war',
title: 'THE BACKWARDS BANNER',
text: "Your unit’s banner has been sewn backwards. The commander says the enemy must not be allowed to learn how literally the company can face the wrong way.",
ageMin: 16,
requires: { missingTags: ['at_war'] },
choices: [
      { label: 'Fix it before muster', outcome: { text: 'You fix the banner and earn respect from everyone who can read cloth.', effects: { wits: 4, reputation: 3, path: { martial: 1 } }, tone: 'good' } },
      { label: 'Call it strategy', outcome: { text: 'The captain loves it. Confusion, he says, is half of war and most of command.', effects: { charm: 4, addTags: ['at_war'], path: { martial: 2 } }, tone: 'plain', next: 'arc_war_2', nextWhen: 'now' } },
    ]
},
  {
id: 'war_arrow_inventory',
category: 'war',
title: 'COUNTING ARROWS',
text: "The quartermaster’s arrow count changes every time a bundle is opened. He proposes blessing the total rather than counting the shafts.",
ageMin: 16,
ranks: ['Peasant', 'Squire', 'Knight'],
choices: [
      { label: 'Count them properly', outcome: { text: 'You count thirty-seven arrows and one suspicious knitting needle.', effects: { wits: 5, reputation: 3, path: { martial: 1 } }, tone: 'good' } },
      { label: 'Pray over the bundle', outcome: { text: 'The arrows remain thirty-seven. The needle seems holier.', effects: { faith: 5, wits: -1 }, tone: 'plain' } },
    ]
},
  {
id: 'war_cowardly_drum',
category: 'war',
title: 'THE COWARDLY DRUM',
text: "The war drum splits before the muster. The drummer gives it an honourable speech and asks whether a barrel might be promoted into the vacancy.",
ageMin: 16,
requires: { hasTags: ['at_war'] },
choices: [
      { label: 'Praise the drum', outcome: { text: 'The men laugh, then cheer. Morale is a strange stew.', effects: { charm: 5, reputation: 4, health: -2 }, tone: 'good' } },
      { label: 'Find a barrel', outcome: { text: 'You beat a barrel into service. It sounds terrible, but so does war.', effects: { wits: 3, path: { martial: 2 } }, tone: 'plain' } },
    ]
},
];
