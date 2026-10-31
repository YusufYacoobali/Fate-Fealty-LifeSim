import { ChainSpec } from './types';

export const POLITICS_CHAINS: ChainSpec[] = [
  {
    id: 'tithe_dispute',
    domain: 'politics',
    minAge: 14,
    beats: [
      {
        title: 'THE BUSHEL THAT WEIGHS SHORT',
        text: '{{other.name}} says the great tithe was taken this year with a bushel measure that does not match the one chained in the market house. In a lean year, one-tenth measured wrong is a fortnight of somebody’s bread.',
        choices: [
          { id: 'measure_it', label: 'Carry both measures to the market house', text: 'You set them side by side in front of thirty people. The rector’s bushel is short by better than a quart and there is nothing anybody can say about it.', effects: { wits: 6, reputation: 5, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { religiousTension: 3 }, memory: { tag: 'measured_the_tithe_bushel', weight: 5 } }, tone: 'good' },
          { id: 'quiet_word', label: 'Have a quiet word with the rector', text: 'He is embarrassed, blames a servant, and the measure is corrected before Lady Day without one word said in public. Nobody is punished and everybody eats.', effects: { charm: 5, faith: 4, faction: { factionId: 'church', playerStanding: 3 }, worldConditions: { foodSecurity: 2 }, memory: { tag: 'settled_the_bushel_quietly', weight: 4 } }, tone: 'good' },
          { id: 'pay_it', label: 'Pay the tithe as measured', text: 'You give the tenth as demanded and say nothing. Four households follow your example. The rector had been waiting all morning for exactly that.', effects: { faith: 3, householdState: { food: -3 }, faction: { factionId: 'church', playerStanding: 2 }, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'paid_the_short_tithe', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE GRANARY OPENS, WITH CONDITIONS',
        text: 'The rector opens the church granary and requires each household receiving grain to make its submission in writing first. The clerk has the roll ready and the grain is behind him.',
        choices: [
          { id: 'sign_first', label: 'Sign first and openly', text: 'You put your name at the head of the roll so that poorer households do not have to be the first to bend. It costs you nothing but the sight of your own signature.', effects: { charm: 5, faith: 3, faction: { factionId: 'church', playerStanding: 3 }, worldConditions: { foodSecurity: 2 }, memory: { tag: 'signed_the_submission_first', weight: 4 } }, tone: 'plain' },
          { id: 'refuse_sign', label: 'Refuse to sign and go hungry', text: 'You walk out past the grain. Nine households sign, two do not, and the parish spends the rest of the winter deciding which of you was the fool.', effects: { householdState: { food: -5 }, reputation: 4, faction: { factionId: 'church', playerStanding: -4 }, worldConditions: { religiousTension: 3 }, memory: { tag: 'refused_the_submission', weight: 5 } }, tone: 'plain' },
          { id: 'buy_around', label: 'Buy grain elsewhere and share it out (12g)', costGold: 12, text: 'Twelve shillings of Cambridge wheat, distributed from your own yard with no roll and no clerk. The rector’s granary stays remarkably full.', effects: { gold: -12, faction: { factionId: 'commons', playerStanding: 6 }, worldConditions: { foodSecurity: 3 }, memory: { tag: 'bought_grain_round_the_rector', weight: 5 } }, tone: 'good' },
        ],
      },
      {
        title: 'THE BISHOP’S CLERK COMES TO COUNT',
        text: 'A clerk arrives from the bishop to inspect the tithe accounts. Within a day it is plain that he is much more interested in who has been loyal than in whether the arithmetic works.',
        choices: [
          { id: 'give_accounts', label: 'Give him the accounts, all of them', text: 'You hand over every roll including the ones that embarrass the parish. He reads for two days and writes down four names, none of them about arithmetic.', effects: { wits: 4, faction: { factionId: 'church', playerStanding: 3 }, worldConditions: { religiousTension: 2 }, memory: { tag: 'opened_the_tithe_accounts', weight: 4 } }, tone: 'plain' },
          { id: 'coach_parish', label: 'Coach the parish on what to say', text: 'You spend an evening in the alehouse making sure everybody tells the same true story. He finds nothing and reports the parish sullen. A parish with nothing to hide does not close ranks.', effects: { charm: 6, wits: 4, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'coached_the_parish', weight: 5 } }, tone: 'plain' },
          { id: 'give_him_a_name', label: 'Give him the name he came for', text: 'You name the churchwarden who has been selling tithe hay on the side. It is entirely true, it satisfies the clerk completely, and it ends a family in this parish.', effects: { reputation: 3, faction: { factionId: 'church', playerStanding: 5 }, boundKinRel: { role: 'other', delta: -14 }, faith: -3, memory: { tag: 'gave_the_clerk_a_name', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE NEXT COLLECTION REFUSED',
        text: 'The parish prepares to refuse the next collection outright. The rector has begun using the word excommunication in sermons, which means no burial ground and no marriages for anyone who holds out.',
        choices: [
          { id: 'negotiate', label: 'Broker a modus: a fixed sum in place of the tenth', text: 'A money payment, fixed by agreement, entered in the book. Both sides lose the argument and gain a number, which is what a settlement is.', effects: { wits: 7, charm: 5, worldConditions: { religiousTension: -4, publicOrder: 2 }, faction: { factionId: 'church', playerStanding: 2 }, memory: { tag: 'brokered_the_modus', weight: 5, note: 'You settled the tithe dispute with a fixed money payment.' } }, tone: 'good' },
          { id: 'hold_out', label: 'Hold the refusal', text: 'The refusal hardens religious tension and lowers public order. Your standing with the Commons rises, while the rector’s authority remains a matter for the church rather than a victory you can announce.', effects: { reputation: 6, faith: -4, worldConditions: { religiousTension: 5, publicOrder: -2 }, faction: { factionId: 'commons', playerStanding: 6 }, memory: { tag: 'held_the_tithe_refusal', weight: 5 } }, tone: 'plain' },
          { id: 'break_it', label: 'Pay in full and break the refusal', text: 'You pay the whole tenth on the first day. The refusal collapses within a week and the parish is very clear about who collapsed it.', effects: { householdState: { food: -4 }, faction: { factionId: 'church', playerStanding: 5 }, worldConditions: { religiousTension: -3 }, boundKinRel: { role: 'other', delta: -16 }, memory: { tag: 'broke_the_tithe_refusal', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE TITHE AS IT IS NOW TAKEN',
        text: 'A new arrangement is proclaimed at the church door and written into the book. Every threat, bargain and short bushel of the last six years is somewhere in the wording of it.',
        choices: [
          { id: 'read_terms', label: 'Have the terms read out every year', text: 'You get it entered that the modus is to be read aloud each Lady Day. It is read for a hundred and forty years, long after nobody remembers why.', effects: { wits: 5, reputation: 5, worldConditions: { publicOrder: 3 }, familyReputation: { delta: 3 }, memory: { tag: 'the_terms_read_every_year', weight: 5 } }, tone: 'good' },
          { id: 'let_it_lie', label: 'Let it lie in the book', text: 'It goes into the parish chest. Within a generation both sides are quoting it inaccurately and with total confidence.', effects: { wits: 2, worldConditions: { religiousTension: 1 }, memory: { tag: 'the_tithe_terms_left_in_the_chest', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'crown_levy',
    domain: 'politics',
    minAge: 16,
    beats: [
      {
        title: 'THE COMMISSION OF ARRAY',
        text: '{{other.name}} brings the writ down the lane: men, carts and grain for the king’s host, assessed at a figure Swineford could meet in a good year. This is not a good year.',
        choices: [
          { id: 'muster_fairly', label: 'Draw up an honest assessment', text: 'You go house by house with the tax roll and set what each can actually bear. It takes nine days and everybody hates the number and pays it.', effects: { wits: 6, charm: 4, worldConditions: { publicOrder: 3 }, faction: { factionId: 'crown', playerStanding: 3 }, memory: { tag: 'drew_an_honest_assessment', weight: 5 } }, tone: 'good' },
          { id: 'plead_poverty', label: 'Plead the village down', text: 'You take the murrain, the flood and the burial list to the commissioners in person. They cut the assessment by a third and mark Swineford as difficult.', effects: { charm: 6, gold: -4, worldConditions: { foodSecurity: 2 }, faction: { factionId: 'crown', playerStanding: -3 }, memory: { tag: 'pleaded_swineford_down', weight: 5 } }, tone: 'good' },
          { id: 'pay_scutage', label: 'Offer money instead of men (20g)', costGold: 20, text: 'You raise twenty shillings and buy the village out of the array. No Swineford man marches, and the money is gone in a way the grain would not have been.', effects: { gold: -20, householdState: { wealth: -3 }, faction: { factionId: 'crown', playerStanding: 2 }, worldConditions: { warThreat: -2 }, memory: { tag: 'bought_out_of_the_array', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'NAMES OFF THE MUSTER ROLL',
        text: 'Five names vanish from the roll between the drafting and the reading. All five households have made private payments to somebody, and everyone can guess to whom.',
        choices: [
          { id: 'restore_names', label: 'Put the four names back', text: 'You write them in again in front of the constable. Two of the five never speak to you again and the roll is honest for the first time in nineteen years.', effects: { wits: 5, reputation: 5, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'restored_the_muster_names', weight: 5 } }, tone: 'good' },
          { id: 'take_payment', label: 'Take a payment to leave your own name off (10g)', text: 'Ten shillings changes hands and your name is not read out. It is precisely what the five households did, and you were a great deal angrier about it in March.', effects: { gold: 10, legal: { suspicion: 5 }, faith: -5, faction: { factionId: 'commons', playerStanding: -5 }, memory: { tag: 'bought_off_the_muster_roll', weight: 5, note: 'You paid to keep your own name off the muster roll.' } }, tone: 'bad' },
          { id: 'say_nothing', label: 'Read the roll as it stands', text: 'You read out what is written. Five men who should be marching are at home, and the rest of the column noticed exactly which five.', effects: { wits: 2, worldConditions: { publicOrder: -2 }, faction: { factionId: 'commons', playerStanding: -3 }, memory: { tag: 'read_the_short_roll', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'LOTS DRAWN IN FRONT OF THE HALL',
        text: 'The Commons demand a public drawing of lots for who marches. The lord’s retainers are stood along the hall wall in mail, which is not a coincidence and is not quite a threat.',
        choices: [
          { id: 'draw_lots', label: 'Hold the drawing, and draw first', text: 'You put your own hand in the bag before anybody else. You draw a short straw and it is the single most useful thing you do all year.', effects: { reputation: 7, health: -6, charm: 5, faction: { factionId: 'commons', playerStanding: 6 }, worldConditions: { publicOrder: 3 }, memory: { tag: 'drew_first_from_the_bag', weight: 5, note: 'You drew a lot for the levy before anyone else and lost.' } }, tone: 'plain' },
          { id: 'lord_chooses', label: 'Let the steward choose the men', text: 'He picks twelve and the retainers stay against the wall. The fourteen are the sixteen you would have expected, and the hall empties in complete silence.', effects: { faction: { factionId: 'crown', playerStanding: 4 }, worldConditions: { publicOrder: -3 }, memory: { tag: 'let_the_steward_pick_the_levy', weight: 5 } }, tone: 'plain' },
          { id: 'volunteer', label: 'Take the place of a man with children', text: 'You march in place of a father of four. His wife brings your household bread for six years and never explains why to anybody who asks.', effects: { health: -10, faith: 6, reputation: 6, faction: { factionId: 'commons', playerStanding: 5 }, memory: { tag: 'marched_in_anothers_place', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE ESCHEATOR ASKS ABOUT THE NUMBERS',
        text: 'A royal officer arrives on a rumour that Swineford falsified both its population and its harvest returns. He has the old rolls with him and a great deal of time.',
        choices: [
          { id: 'tell_truth', label: 'Give him the true figures', text: 'You lay out what the village actually has. The assessment goes up by a fifth, permanently, and no one is ever hanged for it.', effects: { faith: 5, wits: 4, faction: { factionId: 'crown', playerStanding: 5 }, householdState: { wealth: -3 }, worldConditions: { prosperity: -2 }, memory: { tag: 'gave_the_escheator_true_figures', weight: 5 } }, tone: 'plain' },
          { id: 'hold_the_line', label: 'Stand by the returns as filed', text: 'Every man in the village tells him the same figure. He does not believe a word of it and cannot prove otherwise, and he says so in writing.', effects: { charm: 5, wits: 5, legal: { suspicion: 6 }, faction: { factionId: 'commons', playerStanding: 5 }, memory: { tag: 'held_the_false_returns', weight: 5 } }, tone: 'plain' },
          { id: 'blame_predecessor', label: 'Blame the dead reeve', text: 'You put it all on a man buried three years ago who cannot argue. The officer accepts it because it is convenient, and his widow hears about it by Friday.', effects: { wits: 5, faith: -4, familyReputation: { delta: -2 }, faction: { factionId: 'crown', playerStanding: 3 }, memory: { tag: 'blamed_the_dead_reeve', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE LEVY MARCHES OUT',
        text: 'They go up the Cambridge road with the carts behind them. Swineford now has to decide, out loud and for the record, whether the burden was shared or merely hidden well.',
        choices: [
          { id: 'name_it', label: 'Say plainly how it was shared', text: 'You give the full account at the view: who paid, who marched, who bought their way clear. It is entered in the roll and read at every array afterwards.', effects: { reputation: 6, faith: 4, worldConditions: { publicOrder: 3 }, familyReputation: { delta: 3 }, memory: { tag: 'named_how_the_levy_fell', weight: 5 } }, tone: 'good' },
          { id: 'let_it_go', label: 'Let the village forget it', text: 'Nobody says anything. By the next array the story has quietly rearranged itself so that everyone behaved rather better than they did.', effects: { charm: 3, worldConditions: { publicOrder: -1 }, memory: { tag: 'let_the_levy_be_forgotten', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'guild_seal',
    domain: 'politics',
    minAge: 18,
    beats: [
      {
        title: 'TWO SEALS, ONE MATRIX',
        text: '{{other.name}} discovers that two guild officers are issuing orders under impressions of the same seal. One matrix, two men, and a fortnight of contradictory instructions already out on the roads.',
        choices: [
          { id: 'seize_matrix', label: 'Seize the matrix and lock it in the chest', text: 'You take it, put it under three keys held by three men, and no order goes out for twenty days. The town is furious and the forgery stops dead.', effects: { wits: 6, reputation: 4, faction: { factionId: 'guilds', playerStanding: 3 }, worldConditions: { prosperity: -1, publicOrder: 2 }, memory: { tag: 'locked_up_the_seal_matrix', weight: 5 } }, tone: 'good' },
          { id: 'pick_a_side', label: 'Recognise one officer and ignore the other', text: 'You pick the one who is more likely to win and start honouring his orders. Half the guild does the same and the other half does the opposite.', effects: { charm: 4, faction: { factionId: 'guilds', playerStanding: 2 }, worldConditions: { publicOrder: -2 }, memory: { tag: 'picked_a_seal_faction', weight: 4 } }, tone: 'plain' },
          { id: 'use_both', label: 'Take orders from whichever suits you', text: 'For a season you have written authority for absolutely anything you care to do. It is extremely profitable and it cannot possibly last.', effects: { gold: 18, wits: 5, legal: { suspicion: 5 }, faction: { factionId: 'guilds', playerStanding: -3 }, memory: { tag: 'played_both_seals', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE MERCHANTS STOP TAKING SWINEFORD PAPER',
        text: 'Merchants at Lynn and Stourbridge refuse anything sealed out of Swineford until somebody proves which council is lawful. Three carts of wool are sitting on a wharf accruing nothing but charges.',
        choices: [
          { id: 'ride_out', label: 'Ride to Lynn and vouch for the wool yourself', text: 'You stand surety in person for three carts on nothing but your own name. It works, it takes nine days, and your name is worth more at Lynn afterwards than it is at home.', effects: { charm: 6, wits: 4, gold: -6, householdState: { status: 3 }, worldConditions: { prosperity: 3 }, memory: { tag: 'vouched_for_the_wool_at_lynn', weight: 5 } }, tone: 'good' },
          { id: 'sell_cheap', label: 'Sell the wool at whatever it fetches', text: 'It goes for two-thirds and the charges eat a third of that. Everybody is paid something and nobody is paid enough.', effects: { gold: 6, worldConditions: { prosperity: -2 }, faction: { factionId: 'guilds', playerStanding: -2 }, memory: { tag: 'dumped_the_wool_cheap', weight: 4 } }, tone: 'plain' },
          { id: 'wait', label: 'Leave it on the wharf and wait them out', text: 'Eight weeks of charges and the wool is worth less than the storage. The dispute is settled the following spring, far too late for that wool.', effects: { gold: -10, wits: 3, worldConditions: { prosperity: -3 }, memory: { tag: 'left_the_wool_on_the_wharf', weight: 4 } }, tone: 'bad' },
        ],
      },
      {
        title: 'A CHARTER FRAGMENT IN A FAMILY CHEST',
        text: 'Half a charter turns up in a dead man’s chest, granting the guild rights that neither faction had thought to claim and that the borough would very much prefer stayed lost.',
        choices: [
          { id: 'produce_it', label: 'Produce it before both councils', text: 'It is read out and it changes the argument completely. Both factions immediately begin claiming they always knew about it.', effects: { wits: 7, reputation: 5, faction: { factionId: 'guilds', playerStanding: 5 }, worldConditions: { prosperity: 2 }, memory: { tag: 'produced_the_charter_fragment', weight: 5 } }, tone: 'good' },
          { id: 'sell_it', label: 'Sell it to the borough (25g)', text: 'The borough pays well for a document that ceases to exist the moment it is paid for. You are twenty-five shillings richer and the guild is smaller forever.', effects: { gold: 25, faction: { factionId: 'guilds', playerStanding: -6 }, faith: -4, createSecret: { type: 'stolen_property', severity: 55, knownByIds: [] }, memory: { tag: 'sold_the_charter_to_the_borough', weight: 5, note: 'You sold a guild charter to the borough and it was never seen again.' } }, tone: 'bad' },
          { id: 'find_other_half', label: 'Go looking for the other half', text: 'Two years of chests, priories and one very unhelpful archdeacon. You never find it, and everybody now knows there is half a charter somewhere.', effects: { wits: 5, gold: -8, worldConditions: { publicOrder: -1 }, memory: { tag: 'hunted_the_other_half', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE CROWN OFFERS RECOGNITION',
        text: 'The Crown will recognise one council and settle the whole business tomorrow. The fee is an annual payment that will bind the guild for a generation and be described in the writ as a free gift.',
        choices: [
          { id: 'take_it', label: 'Take the recognition and the debt', text: 'Sealed by Whitsun. The guild is lawful, undisputed, and paying the Crown eight marks a year in 1390 for a quarrel settled in 1352.', effects: { faction: { factionId: 'crown', playerStanding: 5 }, worldConditions: { prosperity: 3, publicOrder: 3 }, gold: -10, memory: { tag: 'took_the_crowns_recognition', weight: 5 } }, tone: 'plain' },
          { id: 'refuse_it', label: 'Refuse and settle it yourselves', text: 'Four more years of argument, two ruined merchants, and a settlement written by the guild for the guild that costs it nothing annually forever.', effects: { wits: 6, charm: 5, worldConditions: { prosperity: -2, publicOrder: -2 }, faction: { factionId: 'guilds', playerStanding: 5 }, memory: { tag: 'refused_the_crowns_recognition', weight: 5 } }, tone: 'plain' },
          { id: 'borough', label: 'Go to the borough instead', text: 'The borough will recognise the guild for less money and considerably more interference. It is a smaller collar and it is a collar.', effects: { gold: -4, wits: 4, worldConditions: { prosperity: 2 }, faction: { factionId: 'guilds', playerStanding: 2 }, memory: { tag: 'took_borough_recognition', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'ONE SEAL RETURNS TO THE HALL',
        text: 'A single matrix goes back into the guild chest under three keys. Its authority now rests entirely on a history that every man in the hall remembers differently and none of them wrongly.',
        choices: [
          { id: 'write_it_down', label: 'Have the whole history written into the book', text: 'Four pages, both factions, the wool on the wharf, the charter. It is read to every new warden at their swearing-in for two hundred years.', effects: { wits: 5, reputation: 5, faction: { factionId: 'guilds', playerStanding: 4 }, worldConditions: { publicOrder: 2 }, familyReputation: { delta: 2 }, memory: { tag: 'wrote_the_seal_history', weight: 5 } }, tone: 'good' },
          { id: 'move_on', label: 'Turn the key and get back to trade', text: 'Nobody writes it down. Inside a generation the guild is confidently telling a version in which nothing much went wrong at all.', effects: { gold: 10, worldConditions: { prosperity: 2 }, memory: { tag: 'turned_the_key_and_moved_on', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
];
