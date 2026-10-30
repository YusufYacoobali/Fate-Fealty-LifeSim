import type { BirthOriginId, EducationTrackId, GameEvent } from '@/types/game';

// Each encounter is a concrete problem, with its own repair and dishonest route.
const LESSONS: Record<EducationTrackId, readonly [string, string, string, string, string, string][]> = {
  household: [
    ['THE RENT NOTCH', 'Your guardian’s tally stick has one notch too many. The bailiff has brought a sack large enough to contain your supper.', 'Compare both halves', 'The split tally proves the payment. Your household keeps its grain.', 'Cut away the notch', 'The fresh cut betrays you. Your fellow learner is accused of lending the knife.'],
    ['THE SEED POT', 'A rat has drowned in the pot of seed grain. Your cousin proposes burying the evidence in tomorrow’s bread.', 'Sort the seed together', 'You save enough clean seed for a strip of field and share the credit.', 'Blame your fellow learner', 'They are made to scrub the pot. They memorise your smile.'],
    ['LETTERS ON THE DOOR', 'Your guardian teaches letters on a soot-blackened door. A neighbour mistakes the alphabet for a curse.', 'Read it aloud', 'The neighbour apologises to the letter B. Your guardian lets you keep the chalk.', 'Say your classmate wrote it', 'The neighbour crosses himself at your classmate. Friendship grows colder.'],
    ['THE WOOL ACCOUNT', 'The household owes six fleeces. A damp fleece weighs twice as much and smells like a drowned sheep.', 'Dry and count them', 'The account balances before anyone reaches for a cudgel.', 'Hide the damp one in a rival’s sack', 'The smell follows your rival into chapel. So does a grievance.'],
  ],
  parish: [
    ['THE SAINT WITH TWO ELBOWS', 'Your teacher asks you to copy the relic inventory. Saint Aelfric now possesses three elbows and no head.', 'Check the older inventory', 'You restore one elbow to its rightful saint. Your teacher praises your care.', 'Let your classmate copy the error', 'The visiting canon questions your classmate before the whole parish.'],
    ['THE PSALTER PIG', 'A pig eats the lower half of a psalter page. Your mentor suggests that Providence has abbreviated the lesson.', 'Reconstruct the passage', 'You and your classmate remember enough to rescue the psalm.', 'Accuse your classmate of feeding it', 'The pig escapes punishment. Your classmate does not.'],
    ['THE BURIAL FEE', 'A widow’s husband appears twice in the burial ledger. She refuses to pay for the second funeral on sound theological grounds.', 'Correct the account', 'The widow keeps her pennies. Your teacher trusts you with the ledger.', 'Copy your rival’s signature beneath it', 'The widow curses your rival by name. They learn why at vespers.'],
    ['THE BELL ROPE EXAMINATION', 'Your classmate is suspended from the bell rope, clutching the only clean lesson sheet.', 'Help them down and share it', 'You both pass, though the bell announces it to three parishes.', 'Read the answers while they dangle', 'Your work is excellent. Your classmate’s opinion of you is precise.'],
  ],
  guild: [
    ['THE MASTER’S PERFECT HORSESHOE', 'Your master offers the inspector a horseshoe you saw crack beneath the hammer. Your fellow apprentice has been ordered to carry it.', 'Repair it quietly', 'Your repair holds. The master’s reputation now rests on your hands.', 'Blame the other apprentice', 'The master docks their supper. They keep the cracked shoe as evidence.'],
    ['THE STOLEN GUILD SEAL', 'A customer wants the guild seal on pewter spoons. The master’s silver sample is locked away with his drinking money.', 'Demand a proper assay', 'The spoons fail the assay. Your careful work earns the inspector’s attention.', 'Stamp the rival’s mark instead', 'A false mark reaches the guild court. Your rival begins collecting witnesses.'],
    ['THE APPRENTICE’S FINGER', 'A younger apprentice traps a finger in the vice. The commission is due before the bells.', 'Stop work and free them', 'The apprentice keeps the finger and helps finish your commission.', 'Tell the master your rival tightened it', 'The vice is opened. Your rival’s prospects close a little.'],
    ['THE MASTERPIECE IN THE ASHES', 'A spark lands on your measured drawing. Your rival’s drawing is excellent, and unattended.', 'Rebuild the measurements', 'Your teacher tests every line. The work is slow and yours.', 'Present the rival’s drawing', 'The compass holes match their old work. Your mentor is less foolish than you hoped.'],
  ],
  cathedral: [
    ['THE DEVIL IN THE MARGIN', 'Your classmate draws a bishop being swallowed by a snail. The dean calls for the artist.', 'Defend it as a moral warning', 'The dean accepts a sermon on vanity. Your classmate owes you a kindness.', 'Name your rival instead', 'Your rival scrapes parchment for a week and starts a private list of sins.'],
    ['THE GREEK THAT WASN’T', 'Your mentor’s prized Greek quotation is a laundry account in a merchant’s cipher.', 'Translate it privately', 'The master changes his lecture. You receive access to a better manuscript.', 'Let your rival recite it', 'The chapter learns the price of washing six shirts. Your rival learns betrayal.'],
    ['THE FASTING DISPUTATION', 'The chapter argues whether a goose is a fish while the cook holds the knife.', 'Argue from the text', 'Your argument saves the goose until supper. Your teacher respects the scholarship.', 'Attribute the heresy to your rival', 'Your rival must defend a goose they have never met.'],
    ['THE MEDICAL GLOSS', 'A manuscript recommends bloodletting after a faint. Your classmate has fainted directly beneath it.', 'Compare the herbal commentary', 'You keep the lancet shut and fetch water. Your classmate recovers.', 'Forge the rival’s endorsement', 'The mentor catches the forged hand before the lancet opens. The grudge remains real.'],
  ],
  martial: [
    ['THE PAGE AND THE PRIVY', 'Your first watch is outside the lord’s privy. A visitor insists the password is a matter of terrible urgency.', 'Fetch the watch sergeant', 'The visitor is admitted under escort. The sergeant trusts your judgement.', 'Send your rival to stop him', 'Your rival receives the chamber pot and the blame.'],
    ['THE SQUIRE’S WOODEN HORSE', 'Your classmate’s practice saddle slips. The master calls this an opportunity to demonstrate courage.', 'Secure the girth first', 'Your classmate lands upright and later returns the favour.', 'Loosen the rival’s girth', 'The fall is noticed. So are your hands on the buckle.'],
    ['THE BLUNT LANCE', 'The training lance bears a fresh split. The armourer offers to paint over it before the inspection.', 'Replace the shaft', 'You lose an afternoon and save a face. Your master credits the inspection.', 'Put it in your rival’s rack', 'The shaft breaks in their hands. They remember who visited the rack.'],
    ['THE HUNGRY MUSTER', 'The muster roll includes four dead soldiers and a horse listed as a cousin.', 'Recount the living', 'Rations reach the actual company. Your teacher praises useful arithmetic.', 'Sign your rival’s name to it', 'Your rival answers to the captain for a horse’s family tree.'],
  ],
  noble: [
    ['THE WRONG COAT OF ARMS', 'Your tutor asks you to seat two cousins whose fathers died fighting over the same painted badger.', 'Check the genealogy', 'You separate the cousins by three bishops. Dinner survives.', 'Give your rival the seating plan', 'They face two angry households. Your tutor identifies the handwriting.'],
    ['THE ACCOUNT OF THE SWANS', 'The steward counts twelve swans. The kitchen accounts for thirteen swan pies.', 'Trace the kitchen purchases', 'The thirteenth bird was a goose. Your tutor commends the audit.', 'Charge the missing bird to your rival', 'The steward demands payment. Your rival begins auditing you.'],
    ['THE EMBASSY’S CHAIRS', 'An envoy’s chair is an inch lower than yours. His secretary calls it an insult to the whole coast.', 'Offer equal stools', 'Everyone suffers equally. Your tutor calls this diplomacy.', 'Say your rival ordered the chairs', 'The envoy records your rival’s name beside the word grievance.'],
    ['THE TENANT’S PETITION', 'A tenant petitions for seed. Your tutor says this is an exercise in household administration. The tenant says he is an exercise in starvation.', 'Check the granary and draft relief', 'The lesson becomes a workable petition. Your classmate helps calculate it.', 'Forge your rival’s refusal', 'The tenant curses your rival. Your tutor catches the borrowed seal.'],
  ],
};
export const EDUCATION_EVENTS: GameEvent[] = Object.entries(LESSONS).flatMap(([track, rows]) => rows.map((row, index) => ({
  id: `education_${track}_${index}`, title: row[0], text: row[1], category: 'child', domain: 'career',
  ageMin: 5, once: true, arcNodeOnly: true, actorRoles: {},
  requires: { educationTracks: [track as EducationTrackId] },
  choices: [
    { id: 'repair', label: row[2], outcome: { text: row[3], effects: { education: { progress: 15, mentorBond: 7, peerBond: 6 }, reputation: 2 }, tone: 'good' } },
    { id: 'deceive', label: row[4], outcome: { text: row[5], effects: { education: { progress: 8, misconduct: 35, mentorBond: -12, peerBond: -25 } }, tone: 'bad' } },
    { id: 'confess', label: 'Ask the mentor to intervene', outcome: { text: 'You bring the evidence to your mentor before the quarrel worsens. The correction is public; the help is real.', effects: { education: { progress: 7, misconduct: -12, mentorBond: 5 } }, tone: 'plain' } },
  ],
})));
const ORIGIN_ENCOUNTERS: [BirthOriginId, string, string, string][] = [
  ['peasant', 'THE BAILIFF’S FOURTH CHICKEN', 'The bailiff demands a hen that your household has never owned. Your family contact has the old rent tally.', 'You and your neighbour prove the tally. The hen remains imaginary; the debt does not grow.'],
  ['artisan', 'THE GUILD’S SMALL PRINT', 'Your family’s commission includes a penalty for hammer noise after compline. The church commissioned the bell.', 'Your guild contact finds the exemption. The household keeps its fee.'],
  ['merchant', 'THE RIVAL’S SHORT BUSHEL', 'The household’s rival sells grain in a bushel with a false bottom. Your parent asks you to watch the measure.', 'You bring witnesses and protect the household’s buyers. The rival now knows your name.'],
  ['church', 'THE LAY SCRIBE’S BABY', 'A visiting friar mistakes your lay scribe parent for a vowed cleric and prepares a scandal of magnificent proportions.', 'The marriage entry settles it. The friar must find his scandal elsewhere.'],
  ['military', 'THE RATION HEIR', 'The garrison refuses to feed a soldier’s child until the child can carry a spear. The spear is taller than the clerk.', 'Your household contact quotes the service oath. You receive bread and an enemy in the stores.'],
  ['noble', 'THE COUSIN’S LITTLE MAP', 'A cousin has drawn the family boundary through your nursery. The steward offers to charge you rent.', 'You compare the charter with the stones. The cousin loses a field and a little affection.'],
  ['royal', 'THE NURSERY PRECEDENT', 'Your older sibling claims the whole nursery under a succession custom invented before breakfast.', 'Your guardian divides the room. The throne remains undivided and very far away.'],
];
export const ORIGIN_CHILDHOOD_EVENTS: GameEvent[] = ORIGIN_ENCOUNTERS.map(([origin, title, text, result]) => ({
  id: `origin_child_${origin}`, title, text, category: 'child', domain: 'family', once: true, ageMin: 5, ageMax: 13,
  requires: { birthOrigins: [origin] }, actorRoles: {},
  choices: [
    { label: 'Ask the household contact for evidence', outcome: { text: result, effects: { wits: 2, familyReputation: { delta: 3 }, memory: { tag: `childhood_${origin}`, weight: 3 } }, tone: 'good' } },
    { label: 'Sell your silence for three gold', outcome: { text: 'Three coins change hands. Your family’s standing pays the larger price.', effects: { gold: 3, familyReputation: { delta: -6 }, memory: { tag: `betrayed_house_${origin}`, weight: 4 } }, tone: 'bad' } },
  ],
}));

const COUNSEL: Record<EducationTrackId, readonly [string, string][]> = {
  household: [ ['Ask the bailiff to produce his half', 'Your guardian brings both halves of the tally to the reeve. Neither can be altered without leaving a scar.'], ['Ask how seed should be stored', 'Your guardian shows you a dry bin with a stone lid. The lesson costs a pot, not a harvest.'], ['Ask your guardian to explain the letters', 'Your guardian reads a household name aloud. The neighbour recognises it and puts down the holy water.'], ['Ask the wool buyer for a dry weight', 'The buyer provides a dry standard. Your guardian teaches you to record it before accepting a fleece.'] ],
  parish: [ ['Ask the canon to inspect the relic roll', 'The canon compares the old roll with yours. Saint Aelfric loses an elbow without further injury.'], ['Bring the damaged page to the priest', 'The priest borrows a second psalter. You learn how a missing passage is checked rather than invented.'], ['Ask the priest to cancel the duplicate burial', 'Your teacher strikes the second entry and explains why a clean correction beats a clever excuse.'], ['Fetch the teacher and a ladder', 'The teacher lowers your classmate safely. The lesson resumes beneath a very quiet bell.'] ],
  guild: [ ['Show the crack to the inspector', 'The inspector refuses the shoe. Your master accepts the rebuke rather less gracefully than the inspection fee.'], ['Ask the master to order a public assay', 'Your master orders the assay in front of witnesses. You learn how a mark binds the maker to the metal.'], ['Call the master to open the vice', 'The master stops the job and releases the apprentice. You lose an hour and learn why a commission has no fingers.'], ['Ask the master to check your surviving measurements', 'The master helps reconstruct the burnt drawing. Each borrowed measurement is acknowledged in the margin.'] ],
  cathedral: [ ['Ask the dean what the snail signifies', 'The dean invents an allegory with astonishing speed. Your mentor explains which parts can safely be repeated.'], ['Show the quotation to your teacher in private', 'Your teacher replaces the quotation before the lecture. You receive a lesson in translating before pontificating.'], ['Ask the cook to suspend judgement', 'The cook postpones the knife while your mentor checks the authorities. Theology briefly becomes useful to a goose.'], ['Fetch the infirmarer before the lancet', 'The infirmarer orders water and rest. Your teacher makes you record the observation beside the disputed gloss.'] ],
  martial: [ ['Ask the sergeant to take the watch', 'The sergeant handles the visitor and explains when urgency is an excuse and when it is a medical fact.'], ['Ask the riding master to inspect the saddle', 'The master repairs the girth. You are made to inspect every buckle before the next ride.'], ['Bring the shaft to the armourer', 'The armourer replaces the split wood and teaches you where a painted crack will still show under pressure.'], ['Ask the quartermaster to recount the roll', 'The quartermaster removes four ghosts and one horse. Your tutor makes you copy the corrected ration order.'] ],
  noble: [ ['Ask the herald to verify the disputed arms', 'The herald seats both cousins far from sharp cutlery. Your tutor explains the disputed descent.'], ['Ask the steward to reconcile the kitchen roll', 'The steward finds the goose receipt. You learn to audit the purchases before accusing the cook.'], ['Ask the chamberlain to change every seat', 'The chamberlain replaces the chairs. Your tutor notes that equal discomfort is a workable diplomatic settlement.'], ['Ask the tutor to examine the seed petition', 'Your tutor measures the household’s need against the stores. The petitioner receives an answer based on grain rather than manners.'] ],
};
for (const event of EDUCATION_EVENTS) {
  const [, track, index] = event.id.split('_');
  const [label, text] = COUNSEL[track as EducationTrackId][Number(index)];
  event.choices[2].label = label;
  event.choices[2].outcome!.text = text;
}
const ORIGIN_CHOICES: readonly [string, string, string][] = [
  ['Compare the bailiff’s rent tally', 'Accept the bailiff’s hush money', 'The bailiff pays you three coins to hide his extra assessment. Your household loses more grain than those coins could buy.'],
  ['Ask Edwin to check the guild exemption', 'Keep the noise penalty secret for three gold', 'You pocket three gold while the workshop pays the penalty. Edwin learns whose silence was purchased.'],
  ['Ask Beatrice to witness the false measure', 'Take three gold from the short-measure seller', 'The seller buys your silence. Your household’s buyers discover the short grain and blame the family name.'],
  ['Produce the household marriage entry', 'Sell the friar a rumour for three gold', 'The friar pays for a scandal about your own lay household. The correction will cost considerably more than three gold.'],
  ['Ask Joan to cite the service oath', 'Take three gold to abandon the ration claim', 'The stores clerk buys your silence. Your family gives up a season of bread for your private handful of coins.'],
  ['Ask Aldric to compare the boundary charter', 'Accept three gold to hide the cousin’s map', 'Your cousin buys your silence and presses the boundary claim. The household discovers your price was lower than the surveyor’s.'],
  ['Ask the guardian to settle nursery precedence', 'Sell your sibling the secret nursery key', 'Your sibling pays three gold for the nursery key. The guards change the locks and your household’s opinion of you.'],
];
ORIGIN_CHILDHOOD_EVENTS.forEach((event, index) => {
  event.choices[0].label = ORIGIN_CHOICES[index][0];
  event.choices[1].label = ORIGIN_CHOICES[index][1];
  event.choices[1].outcome!.text = ORIGIN_CHOICES[index][2];
});
