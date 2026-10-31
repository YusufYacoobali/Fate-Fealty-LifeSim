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
  ageMin: 5, ageMax: 17, once: true, arcNodeOnly: true, actorRoles: {},
  requires: { educationTracks: [track as EducationTrackId] },
  choices: [
    { id: 'repair', label: row[2], outcome: { text: row[3], effects: { education: { progress: 15, mentorBond: 7, peerBond: 6 }, reputation: 2 }, tone: 'good' } },
    { id: 'deceive', label: row[4], outcome: { text: row[5], effects: { education: { progress: 8, misconduct: 35, mentorBond: -12, peerBond: -25 } }, tone: 'bad' } },
    { id: 'confess', label: 'Ask the mentor to intervene', outcome: { text: 'You bring the evidence to your mentor before the quarrel worsens. The correction is public; the help is real.', effects: { education: { progress: 7, misconduct: -12, mentorBond: 5 } }, tone: 'plain' } },
  ],
})));
const ORIGIN_ENCOUNTERS: [BirthOriginId, string, string, string][] = [
  ['peasant', 'THE BAILIFF’S FOURTH CHICKEN', 'The bailiff demands a hen that your household has never owned. Your family contact has the old rent tally.', 'You and your neighbour prove the tally. The hen remains imaginary; the debt does not grow.'],
  ['artisan', 'THE GUILD’S SMALL PRINT', 'Your family’s commission includes a penalty for hammer noise after compline. The church commissioned the bell.', 'The guild contact finds the exemption. The collector departs without the fee and with a much lower opinion of children being taught to read.'],
  ['merchant', 'THE RIVAL’S SHORT BUSHEL', 'The household’s rival sells grain in a bushel with a false bottom. Your parent asks you to watch the measure.', 'You bring witnesses and protect the household’s buyers. The rival now knows your name.'],
  ['church', 'THE LAY SCRIBE’S BABY', 'A visiting friar mistakes your lay scribe parent for a vowed cleric and prepares a scandal of magnificent proportions.', 'The marriage entry settles it. The friar must find his scandal elsewhere.'],
  ['military', 'THE RATION HEIR', 'The garrison refuses to feed a soldier’s child until the child can carry a spear. The spear is taller than the clerk.', 'Your household receives its bread. The stores clerk hands over each loaf as though personally surrendering a small fort.'],
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
  ['Ask {{contact}} to check the guild exemption', 'Keep the noise penalty secret for three gold', 'You pocket three gold while the workshop pays the penalty. {{contact}} learns whose silence was purchased.'],
  ['Ask {{contact}} to witness the false measure', 'Take three gold from the short-measure seller', 'The seller buys your silence. Your household’s buyers discover the short grain and blame the family name.'],
  ['Produce the household marriage entry', 'Sell the friar a rumour for three gold', 'The friar pays for a scandal about your own lay household. The correction will cost considerably more than three gold.'],
  ['Ask {{contact}} to cite the service oath', 'Take three gold to abandon the ration claim', 'The stores clerk buys your silence. Your family gives up a season of bread for your private handful of coins.'],
  ['Ask {{contact}} to compare the boundary charter', 'Accept three gold to hide the cousin’s map', 'Your cousin buys your silence and presses the boundary claim. The household discovers your price was lower than the surveyor’s.'],
  ['Ask the guardian to settle nursery precedence', 'Sell your sibling the secret nursery key', 'Your sibling pays three gold for the nursery key. The guards change the locks and your household’s opinion of you.'],
];
ORIGIN_CHILDHOOD_EVENTS.forEach((event, index) => {
  event.choices[0].label = ORIGIN_CHOICES[index][0];
  event.choices[1].label = ORIGIN_CHOICES[index][1];
  event.choices[1].outcome!.text = ORIGIN_CHOICES[index][2];
});

// Adult routes share qualifications and progress, with work, household and institutional stakes.
const ADULT_LESSONS: Record<EducationTrackId, readonly [string, string, string, string, string, string][]> = {
  household: [
    ['THE WINTER ACCOUNT', '{{mentor}} brings your household ledger. Winter grain and a creditor fall due together.', 'Plan the stores with {{classmate}}', 'The plan protects seed and supper.', 'Hide the arrears in the seed account', 'Your colleague finds the missing debt beside their signature.'],
    ['AN EVENING OF LETTERS', 'After work, {{classmate}} asks you to read a tenancy clause neither of you understood as children.', 'Read it against the old agreement', 'Your shared study finds the changed rent.', 'Pretend the clause favours you', 'Your colleague carries your interpretation to the landlord.'],
  ],
  parish: [
    ['THE LATE READER', '{{mentor}} reserves an evening for adults learning their letters. {{classmate}} brings a contract rather than a psalter.', 'Read the contract together', 'You separate the obligations from the ornament.', 'Copy a fluent reader’s exercise', 'The copied hand wins praise that belongs to someone else.'],
    ['A LETTER HOME', '{{classmate}} needs a letter to a relative who has left for work. The parish desk is finally quiet.', 'Help compose an honest letter', 'Your colleague entrusts you with the reply.', 'Read the private lines aloud for a laugh', 'The laughter travels; so does the betrayal.'],
  ],
  guild: [
    ['THE LATE APPRENTICE', 'An older apprentice is assigned the heaviest work. {{mentor}} asks whether your previous experience changes the arrangement.', 'Propose a trial piece and fair rotation', 'Your work earns an adult place at the bench.', 'Claim {{classmate}} made the flawed trial piece', 'The commission carries an innocent maker’s mark.'],
    ['THE EVENING MASTERPIECE', 'Your paying work leaves one evening to finish the apprenticeship sample. {{classmate}} offers measurements.', 'Credit their help and submit your own work', 'The master tests the work and acknowledges both hands.', 'Submit their sample under your mark', 'Your colleague keeps the original drawing.'],
  ],
  cathedral: [
    ['THE INFERMARER’S COMMENTARY', '{{mentor}} asks your adult seminar to compare a fever diary with an old authority. The patient’s actual course contradicts the gloss.', 'Record the observations honestly', 'The seminar adopts a more careful account of care.', 'Alter the diary to flatter the authority', 'Your colleague retains the unaltered observations.'],
    ['THE VISITING EXAMINER', 'A visiting examiner asks how your learning was acquired while you worked. {{mentor}} can certify the hours actually completed.', 'Submit the honest record', 'Your remaining requirements are written clearly.', 'Borrow a completed clerical certificate', 'The borrowed certificate passes today. A later review may compare the signatures.'],
  ],
  martial: [
    ['THE VETERAN AT DRILL', '{{classmate}} has seen a siege; you are learning formations after years in another trade. {{mentor}} asks for a plan.', 'Combine practical experience with the drill', 'The exercise gives both adult learners useful work.', 'Claim their campaign experience as yours', 'The sergeant begins asking which company remembers you.'],
    ['THE CONTRACTED WATCH', 'Your training company must cover a night watch while keeping time for its adult recruits’ paid work.', 'Draw a fair rotation', 'The company trusts the rota because you serve it too.', 'Put your colleague on every cold watch', 'The rota is copied, along with its author’s name.'],
  ],
  noble: [
    ['THE PRIVATE TUTOR’S TABLE', '{{mentor}} teaches court practice to adults. {{classmate}} brings a petition from their own household.', 'Draft advice from the actual accounts', 'Your tutor commends a useful answer rather than a fine bow.', 'Trade their private grievance for influence', 'The petition returns to its author with your name attached.'],
    ['THE ADULT AUDIENCE', 'An envoy questions why your household can afford tutoring while tenants petition for seed.', 'Explain the accounts and propose affordable relief', 'Your reasoning survives questions from your colleague.', 'Produce a borrowed court certificate', 'The document opens a door. The seal may be checked later.'],
  ],
};
for (const [track, rows] of Object.entries(ADULT_LESSONS)) rows.forEach((row, index) => {
  const credential = index === 1 && track === 'cathedral' ? 'clerical_learning' as const : index === 1 && track === 'noble' ? 'court_education' as const : undefined;
  EDUCATION_EVENTS.push({
    id: `education_adult_${track}_${index}`, title: row[0], text: row[1], category: 'peasant', domain: 'career', ageMin: 18,
    once: true, arcNodeOnly: true, actorRoles: {}, requires: { educationTracks: [track as EducationTrackId] },
    choices: [
      { id: 'repair', label: row[2], outcome: { text: row[3], effects: { education: { progress: 12, mentorBond: 6, peerBond: 7 }, reputation: 2 }, tone: 'good' } },
      { id: 'deceive', label: row[4], outcome: { text: row[5], effects: { education: { progress: 6, misconduct: 25, peerBond: -18, disputedCredential: credential } }, tone: 'bad' } },
      { id: 'review', label: 'Arrange a private review with {{mentor}}', outcome: { text: 'Your tutor records what remains to be learned and sets a manageable programme alongside your other duties.', effects: { education: { progress: 6, misconduct: -15, mentorBond: 5 } }, tone: 'plain' } },
    ],
  });
});

const EXTRA_CHILDHOOD: [BirthOriginId, string, string, string, string][] = [
  ['peasant', 'THE FLOODED STRIP', '{{guardian}} finds seed floating across a neighbour’s boundary. {{contact}} remembers where the old ditch ran.', 'Reopen the ditch together', 'Charge the neighbour for your own lost seed'],
  ['peasant', 'THE WINTER WOOD', '{{contact}} offers fallen wood if your household helps mend the common gate before winter.', 'Help {{guardian}} mend the gate', 'Sell the gate timber secretly'],
  ['artisan', 'THE CUSTOMER’S SEAL', '{{guardian}} has a commission without a deposit. {{contact}} recognises the customer’s disputed seal.', 'Ask for a witnessed deposit', 'Copy the seal onto another order'],
  ['artisan', 'THE GUILD FEAST', '{{contact}} invites your household to show a trial piece. The entry fee will buy a week’s supper.', 'Help {{guardian}} prepare a modest sample', 'Pass off another workshop’s piece'],
  ['merchant', 'THE SHIPMENT AT THE FORD', '{{guardian}} must choose between a safe crossing fee and a cheap flooded ford. {{contact}} has a wagon there too.', 'Share the safe crossing cost', 'Send {{contact}} toward the flooded ford'],
  ['merchant', 'THE LEDGER’S SECOND HAND', 'A rival disputes {{guardian}}’s ledger. {{contact}} offers to witness a recount in the market.', 'Carry both copies to the recount', 'Remove the page that favours the rival'],
  ['church', 'THE BORROWED MANUSCRIPT', '{{guardian}} owes the priory a manuscript. {{contact}} finds rain beneath the reading-room window.', 'Help dry and recopy the damaged leaves', 'Blame a visiting lay household'],
  ['church', 'THE CHARITY BREAD', '{{contact}} asks your household to record bread for hungry neighbours. One loaf remains after the tally.', 'Ask {{guardian}} to check the names', 'Sell the extra loaf and alter the list'],
  ['military', 'THE OLD CAMPAIGN CLOAK', '{{guardian}} offers a service cloak for your first training. {{contact}} notices an unpaid campaign receipt in its lining.', 'Return the receipt to the pay clerk', 'Forge an extra ration claim'],
  ['military', 'THE GARRISON’S HORSE', '{{contact}} needs someone to hold a nervous horse while {{guardian}} checks its harness.', 'Help check the girth and stay beside it', 'Tell the quartermaster another child lost it'],
  ['noble', 'THE EMPTY TUTOR’S PURSE', '{{guardian}} must meet a tutor’s fee and a tenant’s request for seed. {{contact}} has the household accounts.', 'Read the accounts before asking for more', 'Hide the tenant’s petition'],
  ['noble', 'THE COUSIN AT TABLE', '{{contact}} brings a cousin’s challenge to your household’s precedence. {{guardian}} asks you to carry the family record.', 'Present the record without insults', 'Alter the cousin’s place in the record'],
  ['royal', 'THE TWO NURSERY SEALS', '{{guardian}} finds rival nursery orders signed by different palace factions. {{contact}} asks which order you carried.', 'Show both seals to the guardian', 'Tell each faction the other threatened you'],
  ['royal', 'THE HEIR’S LESSON', '{{guardian}} arranges a lesson beside your elder sibling. {{contact}} says guards have begun wagering on which of you will rule.', 'Share the lesson and refuse the wager', 'Buy a guard’s rumour about your sibling'],
];
EXTRA_CHILDHOOD.forEach(([origin, title, text, honest, deceive], index) => ORIGIN_CHILDHOOD_EVENTS.push({
  id: `origin_child_${origin}_extra_${index}`, title, text, category: 'child', domain: 'family', ageMin: 5, ageMax: 16, once: true, actorRoles: {},
  requires: { birthOrigins: [origin] }, choices: [
    { label: honest, outcome: { text: '{{guardian}} and {{contact}} remember your help. The household keeps resources and a more reliable connection.', effects: { householdLesson: { wealth: 4, contactBond: 6, progress: 4 }, familyReputation: { delta: 2 } }, tone: 'good' } },
    { label: deceive, outcome: { text: 'You pocket the proceeds. {{contact}} records the disputed account; the loss falls on your own household.', effects: { gold: 3, householdLesson: { wealth: -6, contactBond: -12 }, familyReputation: { delta: -4 } }, tone: 'bad' } },
  ],
}));

const ADULT_COUNSEL: [string,string][] = [
  ['Ask {{mentor}} to review the winter stores', 'Your tutor separates the seed reserve from the debt payment and sets a practical accounting exercise.'],
  ['Read the disputed tenancy clause with {{mentor}}', 'Your tutor compares both agreements and asks you to explain each changed obligation.'],
  ['Ask for an evening reading exercise', 'Your teacher sets a short contract passage that can be studied after paid work.'],
  ['Ask how to write a private reply', 'Your teacher helps form a respectful letter while preserving your colleague’s confidence.'],
  ['Ask for an assessment of your previous craft work', 'Your master tests your existing skills and records what the late apprenticeship still requires.'],
  ['Show {{mentor}} your unfinished masterpiece', 'The master checks the surviving measurements and sets a smaller, honest trial piece.'],
  ['Compare the fever diary with {{mentor}}', 'Your teacher asks you to distinguish an observed symptom from an authority’s assumption.'],
  ['Ask for the actual examination requirements', 'The examiner writes down the hours and arguments still required for a legitimate certificate.'],
  ['Review the drill with the veteran and {{mentor}}', 'Your trainer sets an exercise that tests the veteran’s experience and your understanding together.'],
  ['Ask the captain to review the watch rotation', 'The captain checks the recruits’ paid work and makes you explain a fair allocation of cold watches.'],
  ['Ask {{mentor}} to examine the household petition', 'The tutor checks the figures and asks you to justify each proposed relief payment.'],
  ['Ask for a witnessed court examination', 'Your tutor offers a legitimate assessment instead of a borrowed seal; the remaining preparation is recorded.'],
];
EDUCATION_EVENTS.filter(e => e.id.startsWith('education_adult_')).forEach((event,i) => {
  event.choices[2].label = ADULT_COUNSEL[i][0]; event.choices[2].outcome!.text = ADULT_COUNSEL[i][1];
});
const HOUSEHOLD_RESULTS: [string,string][] = [
  ['The reopened ditch saves seed on both strips. {{contact}} records your household’s share of the labour.', 'Your false claim wins a few coins and leaves {{guardian}} to repair the damaged neighbourly agreement.'],
  ['The common gate stands through winter. {{contact}} delivers the promised fallen wood.', 'The missing timber leaves the common gate open. {{contact}} charges your household for its replacement.'],
  ['The witnessed deposit pays for material before the customer can dispute the order.', 'The copied seal is discovered on the second order. {{contact}} keeps it as evidence against your household.'],
  ['The workshop’s sample is admired, tasted and promptly requested in a larger quantity. Your household still has supper when the important guests finish theirs.', 'The borrowed trial piece is recognised. Your workshop pays the entry fee and loses the guild’s trust.'],
  ['Both wagons share the safe crossing and split the fee. The shipment arrives with its partners intact.', '{{contact}} finds the dangerous ford and learns who gave the directions. Your household loses a trading partner.'],
  ['The recount establishes what was delivered. The rival must challenge a witnessed account.', 'The missing ledger page becomes the rival’s strongest evidence. Your household bears the cost of your bargain.'],
  ['The dried leaves and careful copies satisfy the priory. Your lay household retains its access to the books.', 'The visiting household produces witnesses. Your own household pays for the damaged manuscript.'],
  ['The checked names reveal a hungry neighbour missed from the tally. The last loaf reaches them.', 'The altered bread list is traced to your hand. Your household must replace what the charity lost.'],
  ['The pay clerk acknowledges the old receipt and credits the service household.', 'The extra ration is refused when {{contact}} checks the muster. Your household’s genuine claim is delayed.'],
  ['The checked girth holds and the garrison records your household’s help.', 'The quartermaster finds your false account beside the harness. Your household loses standing with the stores.'],
  ['The accounts show what can be spent on tutors after seed is reserved. Your guardian trusts you with the next petition.', 'The hidden petition is found. The tenants blame your household for a refusal it never openly made.'],
  ['The cousin receives the proper seat. It is less comfortable than the disputed one, but much harder to call an outrage.', 'The altered genealogy reaches {{contact}}. The cousin keeps a copy and begins a more serious challenge.'],
  ['Both nursery seals reach the guardian. Conflicting orders are corrected before the guards choose sides.', 'The two palace factions compare your stories. Both now have grounds to distrust your household’s word.'],
  ['The guards return their wagers and watch both heirs share a lesson. Nobody is willing to bet on the peace lasting, but the lesson gets finished.', 'The purchased rumour reaches your sibling. A nursery quarrel acquires a guard willing to repeat it.'],
];
ORIGIN_CHILDHOOD_EVENTS.filter(e => e.id.includes('_extra_')).forEach((event,i) => {
  event.choices[0].outcome!.text = HOUSEHOLD_RESULTS[i][0]; event.choices[1].outcome!.text = HOUSEHOLD_RESULTS[i][1];
});

// A bereaved or unusual household still has ordinary early childhood years.
ORIGIN_CHILDHOOD_EVENTS.push(
  { id: 'household_first_words', title: 'THE FIRST HOUSEHOLD WORDS', category: 'child', domain: 'family', ageMin: 1, ageMax: 4, once: true,
    text: s => { const id = s.world.characters[s.playerCharacterId].guardianIds?.find(id => s.world.characters[id]?.alive); const guardian = id ? s.world.characters[id] : undefined; return `${guardian?.name ?? 'Someone caring for you'} counts cups at supper. You repeat the word for cup with greater confidence than accuracy.`; },
    choices: [
      { label: 'Count the cups together', outcome: { text: 'Your household gains a small voice in its nightly accounting. The cups remain easier to count than the debts.', effects: { wits: 1, householdLesson: { contactBond: 2 } }, tone: 'good' } },
      { label: 'Insist the cat is also a cup', outcome: { text: 'The cat refuses to join the crockery. Your household repeats the word more slowly.', effects: { charm: 1 }, tone: 'plain' } },
    ],
  },
  { id: 'household_rainy_roof', title: 'RAIN OVER THE CRADLE', category: 'child', domain: 'family', ageMin: 1, ageMax: 4, once: true,
    text: 'Rain finds a gap over your bedding. The household has one dry blanket and several strong opinions about the roof.',
    choices: [
      { label: 'Carry a small bowl to catch the rain', outcome: { text: 'The bowl catches a little water. Your guardian praises the help and moves your bedding somewhere dry.', effects: { wits: 1, householdLesson: { wealth: 1 } }, tone: 'good' } },
      { label: 'Ask to share the dry blanket', outcome: { text: 'Your guardian folds the dry blanket around you. The roof will require a less comfortable remedy.', effects: { health: 1 }, tone: 'plain' } },
    ],
  },
);
