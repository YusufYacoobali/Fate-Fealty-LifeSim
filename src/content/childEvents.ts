import { GameEvent } from '@/types/game';
import { C } from '@/theme/theme';

/** Early-life events (roughly ages 4-12). They set early stat & path leanings. */
export const CHILD_EVENTS: GameEvent[] = [
  {
id: 'child_first_lesson',
actorRoles:{teacher:{reference:'education_mentor',allowInformal:true,minAge:20,alive:true,missingActor:'clear_event'}},
category: 'child',
title: "A VERY LARGE WARNING",
text: "{{teacher.intro}} writes “Do not waste parchment” across an enormous clean sheet. Somebody at the back asks whether the warning applies to teachers.",
ageMin: 5,
ageMax: 11,
once: true,
choices: [{
label: "Learn to read the warning yourself",
outcome: {
text: "You can read the words without help by the end. {{teacher}} lets you keep a scrap, and you fill every corner with letters.",
effects: {
education: {
qualifications: ["literacy"]
},
wits: 8,
path: { church: 1 },
memory: {
tag: "lettered",
weight: 2
}
},
tone: 'good'
}
},
{
label: "Spend the lesson with Sir Quackbeard",
outcome: {
text: "Sir Quackbeard settles beside you and goes to sleep. You enjoy the company, but the letters on the sheet remain a mystery.",
effects: {
health: 3,
kinRel: { id: 'goose', delta: 6 },
charm: 2
},
tone: 'good'
},
requires: { custom:s=>s.world.characters.goose?.alive===true }
},
{
label: "Follow the frog outside",
outcome: {
text: "The frog leaps into the ditch and you leap after it. {{teacher}} has an empty place at the bench and a very muddy pupil to look for.",
effects: {
charm: 5,
faith: -4,
path: { outlaw: 1 },
familyReputation: {"delta":-2}
},
tone: 'plain'
}
}]
},
  {
id: 'child_chores',
category: 'child',
title: 'A MOUNTAIN OF TURNIPS',
text: "{{father.intro}} points to the turnip rows. “You can see the end.” You can, but it appears to be getting farther away whenever you bend down.",
requires: { birthOrigins: ['peasant'] },
ageMin: 6,
ageMax: 12,
choices: [{
label: "Weed the rows together",
outcome: {
text: "Your hands ache by the last row. {{father}} gives you a quiet nod and takes the heavier basket home.",
effects: {
health: -3,
path: { labour: 2 },
kinRel: {
id: "father",
delta: 8
},
householdState: {"food":3}
},
tone: 'good'
}
},
{
label: "Sneak away to play",
outcome: {
text: "You return rested and find {{father}} finishing the rows alone. The spare basket is placed beside you without a word.",
effects: {
health: 4,
kinRel: {
id: "father",
delta: -4
}
},
tone: 'plain'
}
}],
actorRoles: { father: { relation:'parent', gender:'man', minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'child_bully',
category: 'child',
title: 'THE MILLER’S BIG SON',
text: "{{other.intro}} holds out a hand for your lunch. The miller’s big son supposedly sent them. You have never seen the big son do any of the collecting.",
ageMin: 6,
ageMax: 12,
choices: [{
label: "Keep your lunch and stand your ground",
successChance: (s) => 0.3 + s.stats.health / 250,
success: {
text: "{{other}} gives way in front of the other children. You eat your lunch while they stare at you, plainly saving the insult for later.",
effects: {
charm: 6,
path: { martial: 2 },
reputation: 3,
bond: {"role":"other","trust":-8,"flag":"rival"}
},
tone: 'good'
},
failure: {
text: "{{other}} shoves you into the ditch and takes the food. You climb out with a scraped knee and a very good memory.",
effects: {
health: -5,
charm: -2,
memory: { tag: 'humiliated', weight: 1 },
bond: {"role":"other","affinity":-15,"flag":"rival"}
},
tone: 'bad'
}
},
{
label: "Hand it over and get away",
outcome: {
text: "{{other}} eats while you watch. You leave before the grin gets any wider.",
effects: {
charm: -2,
bond: {"role":"other","trust":-10}
},
tone: 'plain'
}
},
{
label: "Let Sir Quackbeard handle the ankles",
outcome: {
text: "Sir Quackbeard drives {{other}} backward with a hiss. You keep your lunch, and the collector points at you as though you personally sharpened the beak.",
effects: {
charm: 4,
kinRel: { id: 'goose', delta: 5 },
bond: {"role":"other","affinity":-12,"flag":"rival"}
},
tone: 'good'
},
requires: { custom:s=>s.world.characters.goose?.alive===true }
}],
actorRoles: {other:{reference:'childhood_peer',minAge:6,maxAge:16,alive:true,excludePlayer:true,missingActor:'clear_event'}}
},
];
