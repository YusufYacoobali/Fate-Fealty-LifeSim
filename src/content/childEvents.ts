import { GameEvent } from '@/types/game';
import { C } from '@/theme/theme';

/** Early-life events (roughly ages 4-12). They set early stat & path leanings. */
export const CHILD_EVENTS: GameEvent[] = [
  {
id: 'child_first_lesson',
category: 'child',
title: 'THE WANDERING MONK',
text: "The travelling monk asks the children to copy “Do not waste parchment.” He has written it on a fresh sheet so large that even the back row can see the irony.",
ageMin: 5,
ageMax: 11,
once: true,
choices: [{
label: "Learn the letters, including the expensive ones",
outcome: {
text: "You learn enough letters to read the warning yourself. The monk lets you keep a scrap and looks away while you practise.",
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
text: "The goose offers no instruction and requires no parchment. You enjoy the company, though the writing remains unread.",
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
label: "Introduce the frog to the lesson",
outcome: {
text: "The frog leaves a wet impression on the page. You gain a reputation for mischief and the monk gains a very brief pupil with excellent jumping prospects.",
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
text: "{{father}} points out the rows waiting to be weeded. “You can see the end,” {{father}} says, omitting that the end is also where tomorrow begins.",
requires: { birthOrigins: ['peasant'] },
ageMin: 6,
ageMax: 12,
choices: [{
label: "Work through the rows with your father",
outcome: {
text: "You finish tired and gain your father’s affection. The last row earns a quiet nod that nobody else would recognise as a celebration.",
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
label: "Do enough, then hide in the hay",
outcome: {
text: "The nap is excellent. Your father’s disappointment is less restful and follows you indoors.",
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
text: "{{other}} collects lunches on behalf of the miller’s big son. The supposed protection consists of not being bothered by the people collecting it.",
ageMin: 6,
ageMax: 12,
choices: [{
label: "Refuse the protection fee",
successChance: (s) => 0.3 + s.stats.health / 250,
success: {
text: "You refuse to surrender lunch. {{other}} backs down and remembers exactly who made the collection difficult.",
effects: {
charm: 6,
path: { martial: 2 },
reputation: 3,
bond: {"role":"other","trust":-8,"flag":"rival"}
},
tone: 'good'
},
failure: {
text: "You are knocked into the ditch. {{other}} keeps the food and acquires a rival who will remember more than the price of lunch.",
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
label: "Surrender the lunch and keep the afternoon quiet",
outcome: {
text: "You hand over the food. {{other}} gains confidence in the arrangement and loses some of your trust.",
effects: {
charm: -2,
bond: {"role":"other","trust":-10}
},
tone: 'plain'
}
},
{
label: "Call Sir Quackbeard between you",
outcome: {
text: "The goose drives {{other}} back by refusing to negotiate about ankles. The collection stops here, and the collector becomes a named rival.",
effects: {
charm: 4,
kinRel: { id: 'goose', delta: 5 },
bond: {"role":"other","affinity":-12,"flag":"rival"}
},
tone: 'good'
},
requires: { custom:s=>s.world.characters.goose?.alive===true }
}],
actorRoles: {other:{minAge:6,maxAge:16,alive:true,excludePlayer:true,missingActor:'clear_event'}}
},
];
