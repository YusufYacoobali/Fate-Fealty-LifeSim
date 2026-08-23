import { ChainSpec } from './types';

export const HEALTH_CHAINS: ChainSpec[] = [
  {
    id: 'millers_fever',
    domain: 'health',
    minAge: 10,
    beats: [
      {
        title: 'SICKNESS AT THE MILLRACE',
        text: '{{other.name}} takes a fever after a week clearing the wet millrace. Within four days nobody in Swineford will buy flour, and the miller is standing in his own doorway watching the queue not form.',
        choices: [
          { id: 'buy_publicly', label: 'Buy a sack in front of everyone', text: 'You carry it home on your shoulder past the whole market. Three households buy after you and one of them tells you it was foolish.', effects: { householdState: { food: 4 }, faction: { factionId: 'commons', playerStanding: 3 }, boundKinRel: { role: 'other', delta: 8 }, worldConditions: { diseasePressure: 1 }, memory: { tag: 'bought_the_suspect_flour', weight: 4 } }, tone: 'plain' },
          { id: 'stay_clear', label: 'Keep well clear of the mill', text: 'You grind by hand for a season and stay entirely well. The miller notices which neighbours crossed the lane to avoid his door.', effects: { wits: 3, health: 2, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'avoided_the_mill', weight: 3 } }, tone: 'plain' },
          { id: 'fetch_herbwife', label: 'Fetch the herb-wife for them (2g)', costGold: 2, text: 'She comes for tuppence and stays two nights. The fever breaks on the second, and she is honest enough to say she may have had nothing to do with it.', effects: { gold: -2, faith: 4, boundKinRel: { role: 'other', delta: 12 }, worldConditions: { diseasePressure: -2 }, memory: { tag: 'fetched_help_for_the_miller', weight: 4 } }, tone: 'good' },
        ],
      },
      {
        title: 'THE MILL HOUSE FALLS',
        text: 'Three more in the mill house take it. Swineford argues over which kills faster, an empty belly or a wet cough, and grinds its corn by hand in the meantime, badly.',
        choices: [
          { id: 'organise', label: 'Organise shared querns and shared labour', text: 'Six households, four hand-querns, and a rota you have to referee twice a week. Everyone eats and everyone complains about the rota.', effects: { charm: 6, worldConditions: { foodSecurity: 3, publicOrder: 2 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'organised_the_querns', weight: 4 } }, tone: 'good' },
          { id: 'grind_alone', label: 'Grind your own and say nothing', text: 'Your household eats well and quietly. The smoke from your oven is visible from most of the lane.', effects: { householdState: { food: 5 }, faction: { factionId: 'commons', playerStanding: -4 }, memory: { tag: 'ground_alone_in_the_fever_year', weight: 4 } }, tone: 'plain' },
          { id: 'burn_stock', label: 'Argue for burning the mill’s stock', text: 'You get your way and a great deal of grain goes up in the yard. The sickness stops. So does the flour, three months before harvest.', effects: { worldConditions: { diseasePressure: -4, foodSecurity: -5 }, reputation: -5, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'called_for_the_burning', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE CHARGE OF CONCEALMENT',
        text: '{{other.name}} mends. A customer swears at the hallmote that the mill hid the sickness for a fortnight to keep selling, and asks for an amercement and the loss of the mill’s suit.',
        choices: [
          { id: 'for_the_mill', label: 'Swear for the mill', text: 'You stand as an oath-helper and say the fortnight never happened. It probably did. The mill keeps its suit and you keep a debt you cannot name.', effects: { boundKinRel: { role: 'other', delta: 13 }, reputation: -3, legal: { suspicion: 3 }, memory: { tag: 'swore_for_the_mill', weight: 4 } }, tone: 'plain' },
          { id: 'against', label: 'Swear against it', text: 'You say what you saw. The mill is amerced two shillings, the customer buys you a drink, and the miller’s family stops speaking to yours entirely.', effects: { reputation: 5, faction: { factionId: 'commons', playerStanding: 3 }, boundKinRel: { role: 'other', delta: -15 }, memory: { tag: 'swore_against_the_mill', weight: 5 } }, tone: 'plain' },
          { id: 'nothing', label: 'Swear you saw nothing at all', text: 'The steward looks at you for slightly too long and writes it down anyway. Both sides now consider you unreliable, which is at least even-handed.', effects: { wits: 3, faith: -2, reputation: -2, memory: { tag: 'swore_to_nothing', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'FORTY DAYS AND THE LAST GOOD GRAIN',
        text: 'A physician from the town wants the mill house shut up for forty days. The last sound grain in Swineford is inside it, and there are five weeks until harvest.',
        choices: [
          { id: 'shut_it', label: 'Shut the door and go hungry', text: 'The door is nailed and the grain sits behind it. Nobody else takes the fever and everybody else is thinner by Whitsun.', effects: { worldConditions: { diseasePressure: -6, foodSecurity: -4 }, faith: 5, householdState: { food: -3 }, memory: { tag: 'shut_the_mill_door', weight: 5 } }, tone: 'plain' },
          { id: 'grind_first', label: 'Grind it out first, then shut the door', text: 'Two days of grinding with the sick upstairs. Swineford eats through the summer and two more households take the fever in June.', effects: { worldConditions: { diseasePressure: 4, foodSecurity: 4 }, householdState: { food: 5 }, memory: { tag: 'ground_before_the_quarantine', weight: 5 } }, tone: 'plain' },
          { id: 'bribe', label: 'Pay the physician to find them well (5g)', costGold: 5, text: 'He writes what you paid for and rides out before dusk. The mill opens, the grain sells, and in August the parish clerk starts a longer burial list than usual.', effects: { gold: -5, legal: { suspicion: 6 }, worldConditions: { diseasePressure: 5 }, faith: -4, memory: { tag: 'bribed_the_physician', weight: 5, note: 'You paid a physician to certify a plagued house as sound.' } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE WHEEL TURNS AGAIN',
        text: 'The mill runs. Swineford keeps an unusually exact memory of who carried bread up that lane and who carried accusations, and both lists are still current.',
        choices: [
          { id: 'first_sack', label: 'Buy the first sack of the new grinding (4g)', costGold: 4, text: 'You take it at the old price in front of the market. The miller does not thank you, which is how you know it landed.', effects: { gold: -4, faction: { factionId: 'commons', playerStanding: 3 }, boundKinRel: { role: 'other', delta: 10 }, worldConditions: { prosperity: 1 }, memory: { tag: 'first_sack_of_the_new_grinding', weight: 4 } }, tone: 'good' },
          { id: 'elsewhere', label: 'Take your custom to the next village’s mill', text: 'It is a four-mile walk each way and a penny more a bushel. You make it every month for a decade and never once explain why.', effects: { gold: -3, wits: 3, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'took_custom_to_another_mill', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'wounded_midwife',
    domain: 'health',
    minAge: 12,
    beats: [
      {
        title: 'A HAND ON THE WINTER ROAD',
        text: '{{other.name}} has caught half the children born in Swineford. On the ice by the ford she puts her hand through a hurdle, and by the time she reaches the village she cannot close it.',
        choices: [
          { id: 'house_her', label: 'Take her in until it mends', text: 'She stays nine weeks and is a terrible guest. Every woman in the parish comes to your door to ask her things. It ruins your mornings and puts your household at the centre of the lane.', effects: { householdState: { food: -3, status: 2 }, faith: 4, boundKinRel: { role: 'other', delta: 13 }, worldConditions: { diseasePressure: -2 }, memory: { tag: 'housed_the_midwife', weight: 4 } }, tone: 'good' },
          { id: 'pay_surgeon', label: 'Pay the barber-surgeon to set it (6g)', costGold: 6, text: 'He sets it badly and charges well. The hand works, mostly, and neither of you says which two fingers do not.', effects: { gold: -6, boundKinRel: { role: 'other', delta: 10 }, faction: { factionId: 'guilds', playerStanding: 1 }, memory: { tag: 'paid_for_the_midwifes_hand', weight: 4 } }, tone: 'plain' },
          { id: 'send_word', label: 'Send to the next parish for a midwife', text: 'One comes over for the worst of it and charges by the mile. It is sensible, it works, and {{other.name}} understands exactly what it means.', effects: { wits: 4, gold: -3, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'sent_for_another_midwife', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE APPRENTICE ASKS FOR A HEARTH',
        text: 'The apprentice has attended four births and watched seven. She asks to use your hearth as the place she learns the rest properly, where there is light and clean water and somebody sober.',
        choices: [
          { id: 'give_hearth', label: 'Give her the hearth', text: 'Your main room becomes the place Swineford is born for the better part of a decade. It costs you firewood, sleep and privacy, and the parish burial list for infants gets noticeably shorter.', effects: { householdState: { food: -2, status: 3 }, charm: 4, worldConditions: { diseasePressure: -3 }, memory: { tag: 'hearth_lent_to_the_apprentice', weight: 4 } }, tone: 'good' },
          { id: 'refuse', label: 'Refuse. A birth is not a lesson', text: 'You say it plainly and she does not argue. She just looks at the fire until you leave. She learns anyway, on kitchen floors, in the dark.', effects: { faith: 2, boundKinRel: { role: 'other', delta: -7 }, worldConditions: { diseasePressure: 1 }, memory: { tag: 'refused_the_apprentice_the_hearth', weight: 4 } }, tone: 'plain' },
          { id: 'charge', label: 'Give it, and charge for it', text: 'A penny a birth, payable by the household concerned. It is entirely reasonable and the entire village finds it repulsive.', effects: { gold: 6, faction: { factionId: 'commons', playerStanding: -4 }, householdState: { wealth: 2 }, memory: { tag: 'charged_for_the_birthing_hearth', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE HAND THAT WILL NOT WAIT',
        text: '{{other.name}} goes back to work far too early and hides how the fingers lock in cold weather. You watch her drop a bowl in your own kitchen and blame the frost.',
        choices: [
          { id: 'say_it', label: 'Say it aloud in front of the apprentice', text: 'You name it in the room, once. She does not forgive you for a long time, and she stops going out alone in January.', effects: { wits: 4, boundKinRel: { role: 'other', delta: -11 }, worldConditions: { diseasePressure: -3 }, memory: { tag: 'named_the_midwifes_hand', weight: 5 } }, tone: 'plain' },
          { id: 'keep_secret', label: 'Keep it between the two of you', text: 'You say nothing to anyone and she knows you saw. It holds until the winter she cannot hide it, and then it does not hold at all.', effects: { boundKinRel: { role: 'other', delta: 11 }, worldConditions: { diseasePressure: 2 }, createSecret: { type: 'hidden_debt', severity: 30, knownByIds: [] }, memory: { tag: 'kept_the_midwifes_secret', weight: 5 } }, tone: 'plain' },
          { id: 'carry_work', label: 'Quietly take the heavy work off her', text: 'You start turning up at the right moments with the right excuses. It costs you sleep and she pretends not to notice for both your sakes.', effects: { charm: 4, health: -3, boundKinRel: { role: 'other', delta: 8 }, memory: { tag: 'carried_the_midwifes_work', weight: 4 } }, tone: 'good' },
        ],
      },
      {
        title: 'A HARD BIRTH AT CANDLEMAS',
        text: 'A birth turns bad past midnight. Master and apprentice stand on either side of the bed accusing each other of pride, and the woman on it is past caring which of them is right.',
        choices: [
          { id: 'back_master', label: 'Back the master', text: 'Forty years of hands against two. It goes badly for an hour and then it does not, and nobody afterwards can say which of them turned it.', effects: { faith: 4, boundKinRel: { role: 'other', delta: 11 }, worldConditions: { diseasePressure: 1 }, memory: { tag: 'backed_the_master_midwife', weight: 5 } }, tone: 'plain' },
          { id: 'back_apprentice', label: 'Back the apprentice', text: 'She does the thing the master called proud, and it works. The master leaves before dawn and does not attend another birth in that house.', effects: { wits: 5, boundKinRel: { role: 'other', delta: -10 }, worldConditions: { diseasePressure: -4 }, memory: { tag: 'backed_the_apprentice', weight: 5 } }, tone: 'plain' },
          { id: 'physician', label: 'Put both out and send for the physician (8g)', costGold: 8, text: 'He arrives at first light, charges a mark, and does almost exactly what the apprentice had proposed at midnight.', effects: { gold: -8, faction: { factionId: 'guilds', playerStanding: 3 }, faith: -2, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'sent_for_the_physician_at_the_birth', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'WHOSE HANDS SWINEFORD SENDS FOR',
        text: 'The next child is coming and the village has already quietly decided which pair of hands it wants at the door. You had rather more to do with that than you meant to.',
        choices: [
          { id: 'old_hands', label: 'Speak for the old hands', text: 'They send for the master, as they always have. She is grateful, she is slower than she was, and everyone agrees not to mention the second thing.', effects: { boundKinRel: { role: 'other', delta: 13 }, faith: 3, worldConditions: { diseasePressure: 2 }, memory: { tag: 'swineford_kept_the_old_midwife', weight: 5 } }, tone: 'plain' },
          { id: 'new_hands', label: 'Speak for the new', text: 'They send for the apprentice. The master hears about it the same afternoon, from someone who enjoyed telling her.', effects: { charm: 3, wits: 3, boundKinRel: { role: 'other', delta: -11 }, worldConditions: { diseasePressure: -4 }, memory: { tag: 'swineford_took_the_apprentice', weight: 5 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'bellmakers_sight',
    domain: 'health',
    minAge: 12,
    beats: [
      {
        title: 'THE MARKS ON THE MOULD',
        text: '{{other.name}} has cast every bell in three parishes and can no longer see the tuning marks scratched on the mould. The workshop opens at dawn exactly as it always has.',
        choices: [
          { id: 'read_marks', label: 'Read the marks aloud for them', text: 'You go down before the pour and call the numbers. It becomes a habit neither of you ever names, and it lasts five years.', effects: { wits: 3, boundKinRel: { role: 'other', delta: 13 }, memory: { tag: 'read_for_the_bellmaker', weight: 4 } }, tone: 'good' },
          { id: 'tell_guild', label: 'Tell the guild wardens', text: 'The wardens are correct, thorough and merciless. The workshop keeps its licence and loses its commissions, which amounts to the same thing more slowly.', effects: { faction: { factionId: 'guilds', playerStanding: 4 }, reputation: 2, boundKinRel: { role: 'other', delta: -15 }, memory: { tag: 'told_the_guild_about_the_sight', weight: 5 } }, tone: 'bad' },
          { id: 'say_nothing', label: 'Say nothing to anyone', text: 'You leave it alone. Somebody else will see it eventually, and you will remember that you saw it first.', effects: { faith: -2, wits: 2, memory: { tag: 'said_nothing_about_the_sight', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE CORRECTIONS MADE AT NIGHT',
        text: 'The apprentice has been re-cutting the master’s moulds after dark and receiving neither credit nor thanks. He shows you once, by candle, and asks you to look away.',
        choices: [
          { id: 'look_away', label: 'Look away', text: 'You go home. The bells keep ringing true and the wrong name keeps going on them, and everyone concerned has agreed to this.', effects: { charm: 2, boundKinRel: { role: 'other', delta: 5 }, memory: { tag: 'looked_away_from_the_forge', weight: 3 } }, tone: 'plain' },
          { id: 'force_it', label: 'Make the master see it', text: 'You put both of them in front of the same mould in daylight. It is a bad hour and the workshop is better run afterwards.', effects: { wits: 5, boundKinRel: { role: 'other', delta: -8 }, faction: { factionId: 'guilds', playerStanding: 2 }, memory: { tag: 'forced_the_master_to_look', weight: 4 } }, tone: 'plain' },
          { id: 'sign_it', label: 'Tell the apprentice to sign his own work', text: 'He starts cutting his mark into the crown of each bell where only the founder would look. Within two years the wardens have noticed.', effects: { charm: 5, faction: { factionId: 'guilds', playerStanding: 3 }, memory: { tag: 'told_the_apprentice_to_sign', weight: 4 } }, tone: 'good' },
        ],
      },
      {
        title: 'THE BELL THAT CRACKED ON THE THIRD PEAL',
        text: 'The new bell splits on its third ringing. The parish blames failing eyes. You have seen the guild’s bill of metal for that pour and the tin in it was cheap and poor.',
        choices: [
          { id: 'produce_bill', label: 'Produce the bill of metal', text: 'You read the weights out in the churchyard in front of the wardens. The guild pays for the recast and does not forget who made them.', effects: { wits: 6, reputation: 5, boundKinRel: { role: 'other', delta: 13 }, faction: { factionId: 'guilds', playerStanding: -5 }, memory: { tag: 'produced_the_bill_of_metal', weight: 5, note: 'You proved a guild sold bad tin and made them pay for the recast.' } }, tone: 'good' },
          { id: 'let_blame', label: 'Let the old eyes take the blame', text: 'The wardens are relieved, the parish is satisfied, and the workshop is finished. You are paid a mark for a silence nobody names as such.', effects: { gold: 8, faction: { factionId: 'guilds', playerStanding: 4 }, boundKinRel: { role: 'other', delta: -17 }, faith: -4, memory: { tag: 'let_the_bellmaker_take_the_blame', weight: 5 } }, tone: 'bad' },
          { id: 'pay_recast', label: 'Pay for the recast yourself (12g)', costGold: 12, text: 'Twelve shillings and no explanation offered to anyone. The parish gets its bell and spends a decade guessing why.', effects: { gold: -12, faith: 5, faction: { factionId: 'church', playerStanding: 3 }, boundKinRel: { role: 'other', delta: 9 }, memory: { tag: 'paid_for_the_recast', weight: 4 } }, tone: 'good' },
        ],
      },
      {
        title: 'THE DEED ON THE BENCH',
        text: '{{other.name}} pushes a parchment across the bench and asks you to read it out. It keeps the workshop open and puts the name over the door into somebody else’s hand entirely.',
        choices: [
          { id: 'read_plainly', label: 'Read it plainly, clause by clause', text: 'You read every line including the one about the moulds. They sign anyway, but they sign knowing, which was the only thing you could give them.', effects: { wits: 5, boundKinRel: { role: 'other', delta: 9 }, memory: { tag: 'read_the_deed_plainly', weight: 4 } }, tone: 'good' },
          { id: 'buy_it', label: 'Buy the foundry yourself (30g)', costGold: 30, text: 'Thirty shillings, the moulds, the debts and the apprentice. The name over the door is now yours and half the parish thinks you circled it for years.', effects: { gold: -30, holding: { stores: 8 }, faction: { factionId: 'guilds', playerStanding: 4 }, householdState: { wealth: 4, status: 3 }, memory: { tag: 'bought_the_bell_foundry', weight: 5, note: 'You bought a failing bell foundry from the man who built it.' } }, tone: 'plain' },
          { id: 'advise_sign', label: 'Tell them to sign and take the pension', text: 'They sign. There is a clause about a chair by the fire and the right to watch the pours, and it is honoured until the second winter.', effects: { charm: 3, boundKinRel: { role: 'other', delta: 4 }, faction: { factionId: 'guilds', playerStanding: 2 }, memory: { tag: 'advised_the_signing', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'WHOSE NAME GOES ROUND THE SHOULDER',
        text: 'The next bell rings clean over four fields. The inscription cut round its shoulder will be read by people who have not been born for three hundred years.',
        choices: [
          { id: 'masters_name', label: 'The old master’s name', text: 'It goes up with his mark on it and he is helped out to hear the first peal. He says it is a little flat. It is not.', effects: { boundKinRel: { role: 'other', delta: 14 }, faith: 4, familyReputation: { delta: 2 }, memory: { tag: 'the_bell_bears_the_masters_name', weight: 5 } }, tone: 'good' },
          { id: 'apprentice_name', label: 'The apprentice’s name', text: 'His mark, on the crown, in daylight, at last. The master does not come to the ringing and everyone notices the empty place.', effects: { charm: 4, faction: { factionId: 'guilds', playerStanding: 4 }, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'the_bell_bears_the_apprentices_name', weight: 5 } }, tone: 'plain' },
          { id: 'your_name', label: 'Yours, for paying for it', text: 'Your name, round the shoulder, in letters a hand high. It is entirely accurate and it sounds worse every time the bell rings.', effects: { reputation: 7, faith: -4, boundKinRel: { role: 'other', delta: -7 }, householdState: { status: 3 }, memory: { tag: 'the_bell_bears_your_name', weight: 5, note: 'You put your own name on a bell somebody else spent a life learning to cast.' } }, tone: 'plain' },
        ],
      },
    ],
  },
];
