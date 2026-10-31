import { GameEvent } from '@/types/game';

/** The Black Death looms over the 14th century. These can be lethal. */
export const PLAGUE_EVENTS: GameEvent[] = [
  {
id: 'plague_arrives',
category: 'plague',
title: 'THE PESTILENCE COMES',
text: "A traveller is taken ill in the square. By evening the news has reached every door, growing more certain as the evidence becomes harder to find.",
ageMin: 14,
once: true,
weight: 1.5,
requires: { custom: (s) => s.bornYear + s.age >= 1347 },
choices: [
      { label: 'Flee to the hills at once', successChance: 0.75, success: { text: 'You fled to the high pastures and waited it out. Lonely and hungry and breathing.', effects: { health: -6, gold: -4, faith: 2, addTags: ['plague_survivor'], memory: { tag: 'survived_plague', weight: 4 } }, tone: 'good' }, failure: {text:"The fever finds you on the road. A nearby household gives you shelter, and the illness must run its real course.",effects:{health:-12,healthCondition:{conditionId:'lung_fever',severity:30}},tone:'bad'},catastropheChance:0.08,catastrophe:{text:"You fled, but carried the sickness with you. The fever finds you on the road.",effects:{death:"Taken by the Pestilence on a lonely hill road."},tone:'bad'} },
      { label: 'Stay and tend the sick', successChance: (s) => 0.4 + s.stats.faith / 300, success: { text: 'You nursed the dying with rags and prayers and somehow did not fall ill. The village calls you blessed.', effects: { health: -10, faith: 16, reputation: 18, path: { church: 4 }, addTags: ['plague_survivor'], memory: { tag: 'plague_saint', weight: 5 } }, tone: 'good' }, failure: {text:"You fall ill after tending the sick. Another carer takes your place; accepting the bed is harder than offering it.",effects:{health:-12,healthCondition:{conditionId:'lung_fever',severity:30}},tone:'bad'},catastropheChance:0.12,catastrophe:{text:"You tended the sick, and the sickness took you in turn. A merciful death, the priest says. He is lying.",effects:{death:"Died of the Pestilence, tending those who could not be saved."},tone:'bad'} },
      { label: 'Barricade yourself indoors', successChance: 0.6, success: { text: 'You sealed the door and rationed turnips for a grim season. The Pestilence passed you by.', effects: { health: -8, charm: -4, addTags: ['plague_survivor'], memory: { tag: 'survived_plague', weight: 4 } }, tone: 'plain' }, failure: {text:"The sickness reaches the house. You need care and lose strength, but the barred door has not decided the ending.",effects:{health:-12,healthCondition:{conditionId:'lung_fever',severity:30}},tone:'bad'},catastropheChance:0.04,catastrophe:{text:"It came through the rats, through the very walls. There was no barricade against it.",effects:{death:"Died of the Pestilence, alone behind a barred door."},tone:'bad'} },
    ]
},
  {
id: 'plague_aftermath',
category: 'plague',
title: 'A WORLD MADE EMPTY',
text: "The sickness has eased, leaving exhausted households and urgent work. People are counting who is available before agreeing what labour is worth.",
ageMin: 15,
requires: { hasTags: ['plague_survivor'] },
once: true,
choices: [{
label: "Ask for wages that reflect the actual shortage",
outcome: {
text: "You earn more for urgent work and gain standing among labouring households. No particular neighbour is declared dead merely to explain the wage.",
effects: {
gold: 20,
charm: 4,
path: { labour: 3 },
reputation: 3,
memory: { tag: 'rose_after_plague', weight: 3 },
faction: {"factionId":"commons","playerStanding":4}
},
tone: 'good'
}
},
{
label: "Pay to restore a neglected dwelling",
outcome: {
text: "You improve your own household’s shelter and standing. You do not acquire somebody else’s cottage simply by noticing its empty door.",
effects: {
health: 6,
charm: 4,
memory: { tag: 'inherited_emptiness', weight: 2 },
householdState: {"quality":14,"status":5}
},
tone: 'plain'
}
},
{
label: "Help with the ordinary work of recovery",
outcome: {
text: "You improve household food and public health conditions through practical aid. The quiet work does not require a triumphant explanation.",
effects: {
faith: 8,
health: 2,
kinRel: { id: 'goose', delta: 5 },
worldConditions: {"diseasePressure":-4},
householdState: {"food":5}
},
tone: 'good'
}
}]
},
];
