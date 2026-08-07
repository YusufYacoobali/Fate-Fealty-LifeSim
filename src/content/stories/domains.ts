import { StoryCopy } from './types';

/**
 * The eight domain stories. These were previously generated from their own
 * titles — beat one was literally `${title.toLowerCase()}` dropped into a
 * sentence about public duty, and beats two and three were the same two strings
 * for all nineteen. Each now has its own situation, and its own three ways out.
 */
export const DOMAIN_STORY_COPY: Record<string, StoryCopy> = {
  pestilence_year: {
    1: {
      title: 'THE PESTILENCE YEAR · THE FIRST HOUSE',
      text: '{{other.name}} comes to say the sickness is in the row by the ford. Two dead in one house in a night, and the parish has to decide by morning whether that is a rumour or a fact.',
      choices: [
        { id: 'protect_people', label: 'Go and see for yourself', text: 'You go into the house. It is a fact. You come out and say so, and the whole village believes you because you went in.', effects: { faith: 5, health: -4, reputation: 5, worldConditions: { diseasePressure: 2 }, faction: { factionId: 'commons', playerStanding: 4 }, storyVariables: { approach: 'mercy' } }, tone: 'plain' },
        { id: 'secure_truth', label: 'Send for the physician before anyone says the word', text: 'You keep the word out of the alehouse for four days and get a man from the town who knows what he is looking at. Four days is not nothing, and it is not much.', effects: { wits: 5, gold: -6, worldConditions: { diseasePressure: -1 }, storyVariables: { approach: 'evidence' } }, tone: 'plain' },
        { id: 'take_advantage', label: 'Buy every sound sack of grain in the parish first', text: 'You spend the morning buying and the afternoon telling people. By noon you own most of the food in Swineford and everyone knows what is coming.', effects: { gold: -14, householdState: { food: 8 }, reputation: -4, faction: { factionId: 'commons', playerStanding: -4 }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE PESTILENCE YEAR · WHO CARRIES THE DEAD',
      text: 'The sexton is dead and there is nobody to carry. Bodies are going into the ground with no bearers, no bell and no words, and the households they came out of are watching from the doorways.',
      choices: [
        { id: 'carry', label: 'Carry them yourself', text: 'Nine in seventeen days on a hurdle, with the words said badly from memory. You do not take it. Half the parish assumes you will.', effects: { health: -8, faith: 8, reputation: 7, faction: { factionId: 'commons', playerStanding: 5 }, memory: { tag: 'carried_the_plague_dead', weight: 5 } }, tone: 'plain' },
        { id: 'pay_bearers', label: 'Pay men to carry (14g)', costGold: 14, text: 'Fourteen shillings buys three men from outside the parish who do not ask questions and do not stay. Everyone is buried properly and nobody has to look at you doing it.', effects: { gold: -14, householdState: { wealth: -3 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'paid_the_plague_bearers', weight: 4 } }, tone: 'plain' },
        { id: 'pit', label: 'Argue for a common pit outside the wall', text: 'It is sensible, it is quick, and it means twelve families never know which patch of ground is theirs. You win the argument on the second day.', effects: { wits: 4, worldConditions: { diseasePressure: -4, religiousTension: 4 }, faction: { factionId: 'church', playerStanding: -4 }, memory: { tag: 'argued_for_the_pit', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE PESTILENCE YEAR · THE HOUSE THAT WAS PROMISED SHELTER',
      text: '{{other.name}} took a household in on your word that it was safe to do so. It was not, and now there is sickness under a roof that had none before you spoke.',
      choices: [
        { id: 'own_it', label: 'Say plainly that it was your judgement', text: 'You say it in front of the household and the lane. It changes nothing about who is ill and it changes a great deal about what {{other.name}} can bear.', effects: { faith: 6, reputation: 4, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'owned_the_bad_judgement', weight: 5 } }, tone: 'plain' },
        { id: 'nurse_them', label: 'Move in and nurse them yourself', text: 'Three weeks in a shut house. Two of the four live, which is better than the parish average, and you come out considerably worse than you went in.', effects: { health: -12, faith: 7, boundKinRel: { role: 'other', delta: 16 }, healthCondition: { conditionId: 'lung_fever', severity: 18 }, memory: { tag: 'nursed_the_shut_house', weight: 5 } }, tone: 'plain' },
        { id: 'blame_luck', label: 'Say it was nobody’s doing', text: 'It is probably true and it is certainly convenient, and {{other.name}} watches you say it and does not argue.', effects: { charm: 3, boundKinRel: { role: 'other', delta: -10 }, faith: -3, memory: { tag: 'called_it_nobodys_fault', weight: 4 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE PESTILENCE YEAR · THE ORDER TO SHUT THE PARISH',
      text: 'An order comes to close Swineford entirely: no market, no road, no strangers, until the burials stop. It will hold the sickness and it will starve the poorest households by Candlemas.',
      choices: [
        { id: 'reconcile', label: 'Shut the road but open the church granary', text: 'The parish is closed and fed at once, on the church’s stores and a great deal of shouting. It costs the rector his temper and everybody else their savings.', effects: { wits: 6, charm: 5, gold: -10, worldConditions: { diseasePressure: -5, foodSecurity: 2, publicOrder: 3 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Shut it completely and enforce it', text: 'Men on the ford with staves. The sickness stops in five weeks and three households are eating boiled nettles by the end of it.', effects: { reputation: 5, worldConditions: { diseasePressure: -8, foodSecurity: -6, publicOrder: -3 }, faction: { factionId: 'crown', playerStanding: 4 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'refuse', label: 'Refuse the order and keep the market open', text: 'Swineford eats all winter and buries fourteen more than it would have. You are the reason for both halves of that sentence.', effects: { worldConditions: { diseasePressure: 6, foodSecurity: 4 }, faction: { factionId: 'commons', playerStanding: 5, }, reputation: -3, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE PESTILENCE YEAR · WHAT THE PARISH DID',
      text: 'The burials stop in March. Swineford came through with its poorest households alive and its granary empty, and both of those are somebody’s decision rather than anybody’s luck.',
      choices: [
        { id: 'accept_ending', label: 'Have the year written into the parish book', text: 'The dead, the shut road, the granary, the names of the bearers. It is read at every visitation for a century and it is entirely accurate.', effects: { faith: 5, familyReputation: { delta: 4 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'the_pestilence_year_recorded', weight: 5, note: 'Swineford came through the pestilence with its poorest alive.' } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE PESTILENCE YEAR · THE COUNT IN MARCH',
      text: 'The burials stop. The parish counts what it has left and finds the arithmetic came out in favour of the households that could already afford to shut their doors.',
      choices: [
        { id: 'accept_ending', label: 'Let the count stand', text: 'The names go in the book with no commentary. Two generations later the parish remembers the year and not one detail of how the burden fell.', effects: { familyReputation: { delta: 1 }, worldConditions: { publicOrder: -1 }, memory: { tag: 'the_pestilence_year_uncounted', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  charter_swineford: {
    1: {
      title: 'THE CHARTER · A MARKET WITHOUT A LICENCE',
      text: 'Swineford has been holding a Thursday market for sixteen years without any right to. {{other.name}} points out that the town four miles off has finally noticed and has lawyers.',
      choices: [
        { id: 'protect_people', label: 'Petition for a proper charter', text: 'A petition, a fee, and a great deal of standing about. It is the slow, expensive, correct road and half the parish thinks you are wasting their money.', effects: { gold: -12, wits: 4, faction: { factionId: 'crown', playerStanding: 3 }, storyVariables: { approach: 'evidence' } }, tone: 'plain' },
        { id: 'secure_truth', label: 'Find out whether an old right already exists', text: 'Two months in the priory’s muniments and there it is: a grant of 1204, unexercised for eighty years and never revoked. Nobody had thought to look.', effects: { wits: 7, gold: -4, reputation: 4, storyVariables: { approach: 'evidence' } }, tone: 'good' },
        { id: 'take_advantage', label: 'Hold the market anyway and dare them', text: 'Thursday comes and the market opens. The town sends a man to count the stalls and Swineford sells him a pie.', effects: { charm: 5, worldConditions: { prosperity: 3, publicOrder: -2 }, faction: { factionId: 'commons', playerStanding: 4 }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE CHARTER · WHO PAYS THE FEE',
      text: 'The Crown wants forty marks for the charter. Swineford has perhaps twelve. {{other.name}} has begun listing which households could find the rest and how much they would want in return.',
      choices: [
        { id: 'assess_all', label: 'Assess every household by what it holds', text: 'Nine days with the rent roll and the same argument in each doorway. Everyone pays something and nobody buys a controlling share of the market.', effects: { wits: 6, charm: 4, worldConditions: { publicOrder: 3 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'assessed_the_charter_fee', weight: 4 } }, tone: 'good' },
        { id: 'find_a_patron', label: 'Find one rich man to pay the lot', text: 'He pays thirty-eight marks and takes the market tolls for twenty years, which is precisely what thirty-eight marks buys.', effects: { gold: 6, worldConditions: { prosperity: 4 }, faction: { factionId: 'guilds', playerStanding: 3 }, memory: { tag: 'sold_the_market_tolls', weight: 5 } }, tone: 'plain' },
        { id: 'pay_it_yourself', label: 'Put in everything you have (35g)', costGold: 35, text: 'Thirty-five shillings of your own money into a charter with your name nowhere on it. Four people know. It does you no good at all and you would do it again.', effects: { gold: -35, faith: 6, reputation: 6, householdState: { wealth: -5 }, memory: { tag: 'paid_for_the_charter_yourself', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE CHARTER · THE TOWN SENDS ITS OWN PETITION',
      text: 'The town four miles off petitions against the grant and produces twenty merchants who will swear Swineford’s market is ruining them. {{other.name}} says two of the twenty have never traded there.',
      choices: [
        { id: 'prove_it', label: 'Prove the two false witnesses', text: 'You get their own guild’s tally books and read them into the record. The petition survives and never recovers its authority.', effects: { wits: 7, reputation: 5, faction: { factionId: 'guilds', playerStanding: -2 }, memory: { tag: 'broke_the_towns_petition', weight: 5 } }, tone: 'good' },
        { id: 'concede_day', label: 'Offer to move Swineford’s market to Tuesday', text: 'A day’s difference and the whole objection evaporates. It costs Swineford the Thursday drovers and it costs nobody anything else.', effects: { charm: 6, worldConditions: { prosperity: -1, publicOrder: 2 }, faction: { factionId: 'guilds', playerStanding: 3 }, memory: { tag: 'moved_the_market_day', weight: 4 } }, tone: 'good' },
        { id: 'counter_petition', label: 'Petition against the town’s own liberties', text: 'You go through their charter looking for lapsed clauses and find three. It becomes a nine-year war of parchment that both sides eventually lose interest in.', effects: { wits: 5, gold: -10, worldConditions: { prosperity: -2 }, faction: { factionId: 'guilds', playerStanding: -4 }, memory: { tag: 'the_parchment_war', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE CHARTER · WHAT GOES IN THE WORDING',
      text: 'The clerk is drafting. Every clause added now is law in Swineford for two centuries, and {{other.name}} wants a line about who may hold a stall and who may not.',
      choices: [
        { id: 'reconcile', label: 'Write it open: any man of the parish may trade', text: 'One clause, six words, and no one is ever kept off the green for being the wrong kind of person. The wealthier stallholders argue about it for a decade and lose.', effects: { wits: 6, faith: 5, worldConditions: { prosperity: 3, publicOrder: 3 }, faction: { factionId: 'commons', playerStanding: 6 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Write it closed: freemen of the parish only', text: 'It protects the men who paid for the charter, exactly as they intended when they paid for it. Cottars and incomers trade from the verge for two hundred years.', effects: { gold: 12, householdState: { wealth: 4 }, worldConditions: { prosperity: 4, publicOrder: -2 }, faction: { factionId: 'guilds', playerStanding: 4 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'leave_it_out', label: 'Leave the question out of the charter entirely', text: 'No clause at all, which means the argument is had fresh every generation by people with no document to point at.', effects: { wits: 3, worldConditions: { publicOrder: -1 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE CHARTER · THE SEAL COMES DOWN THE ROAD',
      text: 'The charter arrives with the great seal on it, and it is read at the cross in front of everybody. The wording is generous and it was fought for, clause by clause.',
      choices: [
        { id: 'accept_ending', label: 'Have it read aloud every Michaelmas', text: 'It is read at the cross every Michaelmas thereafter, in English, so that the people it protects can hear what it says.', effects: { reputation: 6, familyReputation: { delta: 4 }, worldConditions: { prosperity: 3, publicOrder: 2 }, memory: { tag: 'the_open_charter', weight: 5, note: 'Swineford’s market charter was written open to every man of the parish.' } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE CHARTER · SEALED AND LOCKED IN THE CHEST',
      text: 'The charter arrives, is read once in Latin, and goes into the parish chest. Swineford has a lawful market and a very precise list of who is allowed to stand in it.',
      choices: [
        { id: 'accept_ending', label: 'Lock the chest', text: 'The market prospers. So does the short list of families who paid for it, and in eighty years nobody can remember it was ever any other way.', effects: { gold: 10, householdState: { wealth: 3 }, worldConditions: { prosperity: 3 }, familyReputation: { delta: 2 }, memory: { tag: 'the_closed_charter', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  empty_throne: {
    1: {
      title: 'THE EMPTY THRONE · NO WRIT COMES',
      text: 'The quarter’s writs do not arrive. Neither does the escheator, the tax, or any word at all from Westminster. {{other.name}} says the last man down the road claimed there are two great seals in use.',
      choices: [
        { id: 'protect_people', label: 'Call the tithings together and keep the peace locally', text: 'Watch, hue and cry, and a list of who is answerable for whom. Swineford governs itself from Lady Day and does it competently, which is faintly alarming.', effects: { charm: 5, wits: 4, worldConditions: { publicOrder: 4 }, faction: { factionId: 'commons', playerStanding: 4 }, storyVariables: { approach: 'mercy' } }, tone: 'good' },
        { id: 'secure_truth', label: 'Send a man to find out who is actually king', text: 'Nine days, four shillings, and an answer that changes twice on the way home. There are two answers and both of them have armies.', effects: { wits: 6, gold: -4, worldConditions: { warThreat: 2 }, storyVariables: { approach: 'evidence' } }, tone: 'plain' },
        { id: 'take_advantage', label: 'Stop paying anything to anyone', text: 'No tax, no tithe, no scutage, for as long as nobody is certain who to pay. Swineford is richer by Michaelmas than it has been in living memory.', effects: { gold: 18, householdState: { wealth: 4 }, worldConditions: { prosperity: 3, publicOrder: -2 }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE EMPTY THRONE · TWO COMMISSIONS, ONE ROAD',
      text: 'Two commissions of array arrive within a fortnight, each lawful, each demanding men, each promising to hang the parish for obeying the other.',
      choices: [
        { id: 'obey_neither', label: 'Answer neither and say the roads were bad', text: 'You send both a courteous letter about mud. It works until Whitsun. You had given it a fortnight.', effects: { wits: 6, charm: 5, worldConditions: { warThreat: -1 }, memory: { tag: 'answered_neither_commission', weight: 5 } }, tone: 'good' },
        { id: 'pick_one', label: 'Answer whichever has the nearer army', text: 'Six men and a cart go north. It is the correct reading of the situation and it puts Swineford on a list held by the other side.', effects: { faction: { factionId: 'crown', playerStanding: 3 }, worldConditions: { warThreat: 3, publicOrder: 1 }, health: -3, memory: { tag: 'answered_the_nearer_army', weight: 5 } }, tone: 'plain' },
        { id: 'send_both', label: 'Send a small party to each', text: 'Five men each way. Both sides are dissatisfied, neither is insulted, and two Swineford men end up on opposite sides of the same field in June.', effects: { wits: 4, charm: 3, health: -4, worldConditions: { warThreat: 2 }, memory: { tag: 'sent_men_both_ways', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE EMPTY THRONE · THE STEWARD STOPS COMING',
      text: 'The steward has not held a court in eight months and the manor’s business is simply stopping. {{other.name}} asks who is supposed to record a death, a transfer, or a marriage now.',
      choices: [
        { id: 'hold_court', label: 'Hold the hallmote yourselves and keep the roll', text: 'You hold court, badly, with the old rolls as a guide. Every judgement is later confirmed as valid, which surprises everybody including you.', effects: { wits: 7, reputation: 6, worldConditions: { publicOrder: 4 }, faction: { factionId: 'commons', playerStanding: 5 }, memory: { tag: 'held_the_hallmote_ourselves', weight: 5, note: 'Swineford ran its own manor court through the interregnum.' } }, tone: 'good' },
        { id: 'wait', label: 'Write it all down and wait for a steward', text: 'Eight months of business in one book, in order, with witnesses. When a steward finally comes he confirms the lot in an afternoon.', effects: { wits: 5, faith: 3, worldConditions: { publicOrder: 2 }, memory: { tag: 'kept_the_book_and_waited', weight: 4 } }, tone: 'good' },
        { id: 'seize', label: 'Take the vacant holdings into your own hand', text: 'Four holdings with nobody to claim them and no court to stop you. It is defensible right up until somebody with a seal asks.', effects: { holding: { stores: 10 }, gold: 14, legal: { suspicion: 6 }, faction: { factionId: 'commons', playerStanding: -5 }, memory: { tag: 'seized_the_vacant_holdings', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE EMPTY THRONE · SOMEBODY WINS',
      text: 'A king is proclaimed and it is the one Swineford did not answer. His officers are riding the shire asking, quite politely, what each parish did during the vacancy.',
      choices: [
        { id: 'reconcile', label: 'Meet him at the boundary with the whole book', text: 'You hand over eight months of honest record including the parts that look bad. It is disarming, it is verifiable, and it is accepted.', effects: { wits: 6, faith: 4, reputation: 5, faction: { factionId: 'crown', playerStanding: 5 }, worldConditions: { publicOrder: 3 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Say Swineford was loyal all along', text: 'You say it with total conviction and one very carefully edited roll. It holds. It holds for five years and then a clerk finds the other copy.', effects: { charm: 6, faction: { factionId: 'crown', playerStanding: 3 }, createSecret: { type: 'false_lineage', severity: 45, knownByIds: [] }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'pay', label: 'Buy a pardon for the parish (30g)', costGold: 30, text: 'Thirty shillings and a general pardon under seal for everything Swineford did or failed to do. It is expensive and it is completely final.', effects: { gold: -30, householdState: { wealth: -4 }, faction: { factionId: 'crown', playerStanding: 4 }, worldConditions: { publicOrder: 2 }, storyVariables: { resolution: 'reconcile' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE EMPTY THRONE · THE WRITS COME BACK',
      text: 'The writs start arriving again as though they had never stopped. Swineford is back inside the realm, with its own record of the months it spent outside.',
      choices: [
        { id: 'accept_ending', label: 'Keep the interregnum book', text: 'It stays in the chest, unremarkable and complete. Twice in the next century somebody needs it, and twice it settles the matter.', effects: { wits: 4, familyReputation: { delta: 4 }, worldConditions: { publicOrder: 3 }, memory: { tag: 'kept_the_interregnum_book', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE EMPTY THRONE · THE PRICE OF BEING RIGHT LATE',
      text: 'Swineford is back inside the realm and firmly on the wrong side of somebody’s memory. The assessments come in high and stay high for a generation.',
      choices: [
        { id: 'accept_ending', label: 'Pay it and say nothing', text: 'The parish pays a fifth more than its neighbours for a generation and never once gets a straight answer about why.', effects: { householdState: { wealth: -4 }, worldConditions: { prosperity: -2 }, familyReputation: { delta: 1 }, memory: { tag: 'paid_for_the_vacancy', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  the_accused: {
    1: {
      title: 'THE ACCUSED · PRESENTED AT THE VIEW',
      text: 'Your name is presented at the view of frankpledge on the word of one man. The charge is small, the evidence is nothing, and the presentment is on the roll in ink.',
      choices: [
        { id: 'protect_people', label: 'Find six oath-helpers and clear it at once', text: 'Compurgation: seven neighbours swearing to your word, not to the facts. You get twelve by noon and the presentment dies the same day.', effects: { charm: 6, reputation: 4, legal: { suspicion: -5 }, faction: { factionId: 'commons', playerStanding: 4 }, storyVariables: { approach: 'mercy' } }, tone: 'good' },
        { id: 'secure_truth', label: 'Find out who put your name forward and why', text: 'It takes three weeks and it is about a strip of headland your father ploughed wrong in 1338. Knowing this helps enormously and satisfies nobody.', effects: { wits: 6, storyVariables: { approach: 'evidence' } }, tone: 'plain' },
        { id: 'take_advantage', label: 'Ignore it and let it sit on the roll', text: 'You do nothing. It sits there, small and unresolved, and every future presentment against you is read next to it.', effects: { legal: { suspicion: 4 }, wits: 2, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE ACCUSED · THE CHARGE GROWS A SECOND HEAD',
      text: 'The small charge acquires a larger companion. {{other.name}} warns you that the second one carries the tourn rather than the manor court, and the tourn hangs people.',
      choices: [
        { id: 'get_a_pleader', label: 'Hire a man who knows the forms (12g)', costGold: 12, text: 'Twelve shillings for someone who knows which words matter. He finds a defect in the presentment within an hour and looks bored doing it.', effects: { gold: -12, wits: 5, legal: { suspicion: -4 }, memory: { tag: 'hired_a_pleader', weight: 4 } }, tone: 'good' },
        { id: 'go_to_the_lord', label: 'Petition the lord for his protection', text: 'He gives it, in exchange for an understanding about your labour services that will cost you two days a week until you die.', effects: { holding: { stores: -6 }, legal: { suspicion: -6 }, faction: { factionId: 'crown', playerStanding: 3 }, memory: { tag: 'bought_the_lords_protection', weight: 5 } }, tone: 'plain' },
        { id: 'flee', label: 'Go and stay with kin in the next hundred', text: 'You are outside the tourn’s reach and outside your own fields. The crop is somebody else’s problem and so, increasingly, is your reputation.', effects: { legal: { suspicion: 3, notoriety: 2 }, holding: { stores: -8 }, path: { outlaw: 2 }, memory: { tag: 'left_the_hundred', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE ACCUSED · WHAT {{other.name}} KNOWS',
      text: '{{other.name}} can end this with one sentence in front of the steward. Saying it will put them exactly where you are standing now, and they know that better than you do.',
      choices: [
        { id: 'ask_them', label: 'Ask them to say it', text: 'You ask, plainly, knowing what it costs. They say they will think about it and do not sleep for a week.', effects: { boundKinRel: { role: 'other', delta: -8 }, wits: 3, memory: { tag: 'asked_them_to_take_it', weight: 5 } }, tone: 'plain' },
        { id: 'never_ask', label: 'Make sure they are never asked', text: 'You close that road off entirely and tell the pleader it does not exist. It is the most expensive decision in the whole business.', effects: { faith: 6, legal: { suspicion: 3 }, boundKinRel: { role: 'other', delta: 18 }, memory: { tag: 'never_asked_them', weight: 5 } }, tone: 'good' },
        { id: 'force_it', label: 'Let the pleader call them as a witness', text: 'They are called, they are sworn, and they say it. You are clear by Friday and they are presented at the next view.', effects: { legal: { suspicion: -8 }, boundKinRel: { role: 'other', delta: -22 }, faith: -5, memory: { tag: 'put_them_in_my_place', weight: 5 } }, tone: 'bad' },
      ],
    },
    4: {
      title: 'THE ACCUSED · THE STEWARD WANTS IT ENDED',
      text: 'The steward has no appetite for a hanging over a strip of headland and offers a way out that is neither acquittal nor conviction, and requires you to agree to something in public.',
      choices: [
        { id: 'reconcile', label: 'Take the amercement and the loveday', text: 'A fine of two shillings and a public reconciliation with the man who accused you, on the green, with drink. Neither of you means a word of it and it holds for thirty years.', effects: { gold: -2, charm: 5, legal: { suspicion: -6 }, worldConditions: { publicOrder: 3 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Demand a full acquittal and a counter-charge', text: 'You get both. He is amerced, shamed, and ruined over five years, and the parish spends those five years deciding what that says about you.', effects: { reputation: 5, legal: { suspicion: -4, notoriety: 2 }, faction: { factionId: 'commons', playerStanding: -4 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE ACCUSED · THE LOVEDAY ON THE GREEN',
      text: 'The reconciliation is performed on the green with the whole parish watching and a barrel provided. It is a legal fiction and it works exactly as intended.',
      choices: [
        { id: 'accept_ending', label: 'Drink the drink', text: 'You drink with him and neither of you ever refers to it again. Your children marry each other’s children, which nobody predicted at the time.', effects: { charm: 4, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'the_loveday_held', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE ACCUSED · CLEARED, AND NOT FORGIVEN',
      text: 'The roll records the acquittal in full. The parish records something rather different and passes it on with more care than the clerk ever managed.',
      choices: [
        { id: 'accept_ending', label: 'Let both records stand', text: 'You are clear in law and marked in memory, which turns out to be the record that gets consulted.', effects: { reputation: 2, familyReputation: { delta: -1 }, memory: { tag: 'cleared_and_marked', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  healers_burden: {
    1: {
      title: 'THE HEALER’S BURDEN · MORE DOORS THAN HOURS',
      text: '{{other.name}} has thirteen households asking and time for four. The other nine are watching to see which four, and drawing conclusions that will last decades.',
      choices: [
        { id: 'protect_people', label: 'Send them to the poorest four', text: 'The four with nothing get seen. The seven with something remember precisely how that decision was made and by whom.', effects: { faith: 6, faction: { factionId: 'commons', playerStanding: 5 }, householdState: { wealth: -2 }, worldConditions: { diseasePressure: -2 }, storyVariables: { approach: 'mercy' } }, tone: 'good' },
        { id: 'secure_truth', label: 'Sort them by who is actually dying', text: 'You walk all thirteen doors in a morning and rank them honestly. Two of the four are people nobody would have chosen and both of them live.', effects: { wits: 6, health: -3, worldConditions: { diseasePressure: -4 }, storyVariables: { approach: 'evidence' } }, tone: 'good' },
        { id: 'take_advantage', label: 'Let them be seen in order of payment', text: 'It is the arrangement everybody expects and nobody defends. The four who pay are seen and {{other.name}} stops meeting your eye.', effects: { gold: 12, boundKinRel: { role: 'other', delta: -8 }, faction: { factionId: 'commons', playerStanding: -5 }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE HEALER’S BURDEN · A DEATH THAT WAS PREVENTABLE',
      text: 'Somebody dies of a thing that could have been treated on the Tuesday. The family is not angry, which is considerably worse than if they were.',
      choices: [
        { id: 'tell_them', label: 'Tell the family the truth about the Tuesday', text: 'They take it quietly and thank you for coming. You are never entirely sure whether it helped them and entirely sure it was owed.', effects: { faith: 6, boundKinRel: { role: 'other', delta: 8 }, reputation: -2, memory: { tag: 'told_them_about_the_tuesday', weight: 5 } }, tone: 'plain' },
        { id: 'protect_healer', label: 'Make sure it never reaches {{other.name}}', text: 'You keep it from them entirely, which requires managing four other people’s conversations for a year. They find out anyway, in the worst way, from a stranger.', effects: { charm: 4, boundKinRel: { role: 'other', delta: -6 }, createSecret: { type: 'hidden_debt', severity: 35, knownByIds: [] }, memory: { tag: 'hid_the_preventable_death', weight: 5 } }, tone: 'plain' },
        { id: 'change_the_rule', label: 'Change how the doors are chosen', text: 'A written order of seeing, posted on the church door, argued over furiously and then simply used. Nobody dies on a Tuesday for that reason again.', effects: { wits: 6, worldConditions: { diseasePressure: -4, publicOrder: 2 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'wrote_the_order_of_seeing', weight: 5 } }, tone: 'good' },
      ],
    },
    3: {
      title: 'THE HEALER’S BURDEN · THE PHYSICIANS OBJECT',
      text: 'A licensed physician from the town informs the parish that {{other.name}} is practising unlawfully, and that he will lay it before the bishop’s court unless it stops.',
      choices: [
        { id: 'fight_it', label: 'Fight the licence in the church court', text: 'You argue that surgery and physic are different things and win on a technicality about herbs. It is narrow and it holds for {{other.name}}’s whole life.', effects: { wits: 7, gold: -8, faction: { factionId: 'church', playerStanding: -3 }, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'won_the_licence_argument', weight: 5 } }, tone: 'good' },
        { id: 'buy_licence', label: 'Buy {{other.name}} a licence (25g)', costGold: 25, text: 'Twenty-five shillings, a bishop’s clerk and an examination that is mostly Latin. They pass, barely, and are lawful for the rest of their life.', effects: { gold: -25, faction: { factionId: 'church', playerStanding: 3 }, boundKinRel: { role: 'other', delta: 16 }, worldConditions: { diseasePressure: -3 }, memory: { tag: 'bought_the_healer_a_licence', weight: 5 } }, tone: 'good' },
        { id: 'go_quiet', label: 'Have them practise quietly and unpaid', text: 'No fee, no name, no record. It is lawful in the letter, it works, and it means {{other.name}} is poor for the rest of their life.', effects: { wits: 4, boundKinRel: { role: 'other', delta: 4 }, faction: { factionId: 'commons', playerStanding: 3 }, memory: { tag: 'the_unpaid_healer', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE HEALER’S BURDEN · MORE THAN ONE PAIR OF HANDS',
      text: 'It is plain that one healer for thirteen households is the actual problem, and it is equally plain that {{other.name}} has no intention of admitting that in public.',
      choices: [
        { id: 'reconcile', label: 'Get them to take and teach two apprentices', text: 'It takes a winter of argument. Three pairs of hands by Whitsun, and {{other.name}} is furious about it for a year and grateful for twenty.', effects: { charm: 6, wits: 4, worldConditions: { diseasePressure: -6 }, boundKinRel: { role: 'other', delta: 8 }, faction: { factionId: 'commons', playerStanding: 5 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Bring in a second healer over their head', text: 'You arrange it without asking. The parish is better served and {{other.name}} does not speak to you again for nine years.', effects: { wits: 5, worldConditions: { diseasePressure: -5 }, boundKinRel: { role: 'other', delta: -18 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE HEALER’S BURDEN · THREE PAIRS OF HANDS',
      text: 'Three healers where there was one. The burial list for the under-fives is the shortest it has been in the parish book, and nobody outside the three notices.',
      choices: [
        { id: 'accept_ending', label: 'Let the short list speak', text: 'It is entered in the book without comment. A vicar reads it in ninety years and works out what must have happened, and writes a note in the margin about it.', effects: { faith: 5, familyReputation: { delta: 3 }, worldConditions: { diseasePressure: -3 }, memory: { tag: 'the_short_burial_list', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE HEALER’S BURDEN · TWO HEALERS WHO DO NOT SPEAK',
      text: 'Swineford has two healers and they will not be in the same house. It works, in the sense that everybody gets seen, and it costs a friendship that had lasted since childhood.',
      choices: [
        { id: 'accept_ending', label: 'Let it be enough that it works', text: 'The parish is better doctored and quieter than it was. You did the right thing and it cost the wrong person.', effects: { wits: 4, worldConditions: { diseasePressure: -3 }, familyReputation: { delta: 1 }, memory: { tag: 'two_healers_who_do_not_speak', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  ashes_household: {
    1: {
      title: 'ASHES OF THE HOUSEHOLD · THE FIRE TAKES THE ROOF TREE',
      text: 'Your own roof goes up between vespers and dark. Everyone gets out. The roof tree, the stores, the tools and the year’s cloth do not.',
      choices: [
        { id: 'protect_people', label: 'Count the people and stop counting anything else', text: 'You stand in the lane getting names until you have all of them. The stores are gone and every single person is standing in the road, and that is the whole account.', effects: { faith: 6, boundKinRel: { role: 'other', delta: 12 }, householdState: { quality: -8, food: -8 }, storyVariables: { approach: 'mercy' } }, tone: 'plain' },
        { id: 'secure_truth', label: 'Find out how it started before the ash is cold', text: 'You are in the wreck at first light. It started at the byre end, where nobody sleeps and nobody cooks and there is no reason on earth for a fire to begin.', effects: { wits: 6, health: -3, householdState: { quality: -8, food: -8 }, storyVariables: { approach: 'evidence' } }, tone: 'plain' },
        { id: 'take_advantage', label: 'Save what will sell before the neighbours arrive', text: 'You get the ironwork and the good pot out and hidden before anybody comes to help. It is worth a fortnight of wages and it is watched from three doorways.', effects: { gold: 8, householdState: { quality: -8, food: -8 }, faction: { factionId: 'commons', playerStanding: -4 }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'ASHES OF THE HOUSEHOLD · WHERE EVERYONE SLEEPS NOW',
      text: 'The household is split across four other roofs. {{other.name}} says quietly that two of the four are being talked about as permanent, and asks what you intend.',
      choices: [
        { id: 'keep_together', label: 'Insist the household stays one household', text: 'You get everyone under a borrowed byre roof rather than let them be absorbed. It is cold, cramped and correct, and the household exists in spring.', effects: { charm: 5, health: -5, boundKinRel: { role: 'other', delta: 14 }, householdState: { capacity: 2 }, memory: { tag: 'kept_the_household_together', weight: 5 } }, tone: 'good' },
        { id: 'place_them', label: 'Place the youngest where they will eat best', text: 'Two children go to households that can feed them. It is plainly right and there is a real chance they do not come back.', effects: { wits: 4, faith: 3, householdState: { food: 3, capacity: -1 }, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'placed_the_children_out', weight: 5 } }, tone: 'plain' },
        { id: 'go_to_kin', label: 'Take the whole household to kin in the next parish', text: 'Four miles and a different manor. You keep everybody and you lose your holding, your suit of court and every claim Swineford owed you.', effects: { holding: { stores: -10 }, householdState: { capacity: 2 }, boundKinRel: { role: 'other', delta: 8 }, faction: { factionId: 'commons', playerStanding: -3 }, memory: { tag: 'left_swineford_after_the_fire', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'ASHES OF THE HOUSEHOLD · IT STARTED AT THE BYRE END',
      text: 'Somebody in the household knows how it started. {{other.name}} has worked out who, has not said the name, and is waiting to see whether you ask.',
      choices: [
        { id: 'ask', label: 'Ask, and hear the answer', text: 'It was carelessness by somebody who is fourteen and has not eaten properly since. You now know and can never quite unknow it.', effects: { wits: 4, boundKinRel: { role: 'other', delta: 6 }, memory: { tag: 'learned_who_started_the_fire', weight: 5 } }, tone: 'plain' },
        { id: 'dont_ask', label: 'Say you do not want to know', text: 'You say it clearly enough that nobody ever raises it. The household rebuilds with one secret in it that everybody can feel and nobody can name.', effects: { faith: 4, charm: 3, createSecret: { type: 'hidden_debt', severity: 30, knownByIds: [] }, memory: { tag: 'refused_to_learn_it', weight: 5 } }, tone: 'plain' },
        { id: 'blame_outward', label: 'Let it be understood that a stranger did it', text: 'A convenient pedlar is blamed, in his absence, permanently. It protects the household and it is a lie the household has to keep for good.', effects: { charm: 4, familyReputation: { delta: 2 }, faith: -5, createSecret: { type: 'betrayed_friend', severity: 40, knownByIds: [] }, memory: { tag: 'blamed_the_pedlar', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'ASHES OF THE HOUSEHOLD · WHAT GETS REBUILT',
      text: 'There is timber for a smaller house or debt for the one you had. The decision is yours and everybody in the household is standing in the yard waiting to hear it.',
      choices: [
        { id: 'reconcile', label: 'Build small, and build it debt-free', text: 'One room fewer and no money owed to anybody. It is a lesser house and the household holds it outright and sleeps.', effects: { wits: 5, faith: 4, householdState: { quality: 5, wealth: 2 }, boundKinRel: { role: 'other', delta: 10 }, worldConditions: { publicOrder: 1 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Borrow and rebuild exactly what was there', text: 'The same house, on the same footings, on twenty-two shillings of somebody else’s money at a rate you did not read carefully.', effects: { gold: 22, householdState: { quality: 9, wealth: -6 }, memory: { tag: 'rebuilt_on_debt', weight: 5, note: 'You borrowed heavily to rebuild the house exactly as it was.' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'ASHES OF THE HOUSEHOLD · A SMALLER ROOF, HELD OUTRIGHT',
      text: 'The new house is one room short of the old one and belongs to the household entirely. It is the first winter in years that nothing is owed to anybody.',
      choices: [
        { id: 'accept_ending', label: 'Sleep in it', text: 'Everybody sleeps under it and the year turns. In forty years somebody adds the missing room and nobody remembers why it was missing.', effects: { faith: 4, householdState: { quality: 3 }, familyReputation: { delta: 3 }, memory: { tag: 'the_smaller_house', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'ASHES OF THE HOUSEHOLD · THE SAME HOUSE, AND THE DEBT',
      text: 'The house stands exactly as it did, on the same footings, and the interest falls due at Michaelmas for rather longer than anybody in the yard understood at the time.',
      choices: [
        { id: 'accept_ending', label: 'Make the first payment', text: 'It is paid, and the next, and the one after. The house is beautiful and the household works for it for five years.', effects: { gold: -6, householdState: { quality: 2, wealth: -3 }, familyReputation: { delta: 1 }, memory: { tag: 'paying_for_the_rebuilt_house', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  divided_parish: {
    1: {
      title: 'THE DIVIDED PARISH · TWO SERMONS, ONE NAVE',
      text: 'The rector preaches obedience and the chantry priest preaches poverty, and the parish has begun sitting on two sides of the nave according to which they prefer. {{other.name}} asks which side your household sits on.',
      choices: [
        { id: 'protect_people', label: 'Sit deliberately on the poorer side', text: 'You take your household across the nave in front of everybody. It is a small movement and the whole parish reads it correctly.', effects: { faith: 5, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { religiousTension: 2 }, storyVariables: { approach: 'mercy' } }, tone: 'plain' },
        { id: 'secure_truth', label: 'Read what each of them is actually preaching', text: 'You get both men to write down what they hold. Neither text is heresy and neither man will say that about the other one.', effects: { wits: 6, faith: 3, worldConditions: { religiousTension: -2 }, storyVariables: { approach: 'evidence' } }, tone: 'good' },
        { id: 'take_advantage', label: 'Sit with the rector and take the churchwardenship', text: 'You sit where the power is and are made warden by Lady Day. It is the correct move and everybody watching knows exactly what it was.', effects: { reputation: 4, faction: { factionId: 'church', playerStanding: 4 }, gold: 6, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE DIVIDED PARISH · THE ROOD SCREEN MONEY',
      text: 'Nine shillings collected for a new rood screen. The rector wants a rood screen. Half the parish wants it spent on the six households that lost everything in the flood.',
      choices: [
        { id: 'to_the_poor', label: 'Get it spent on the four households', text: 'You take it to a vote at the parish meeting and win by three. The screen is not built and there is no argument in the parish for six years about anything else.', effects: { faith: 5, faction: { factionId: 'commons', playerStanding: 5, }, worldConditions: { religiousTension: 4, foodSecurity: 2 }, memory: { tag: 'spent_the_screen_money_on_the_poor', weight: 5 } }, tone: 'plain' },
        { id: 'build_screen', label: 'Build the screen', text: 'It is beautiful, it is still there, and six households spent that winter in a byre looking at it every Sunday.', effects: { faith: 3, faction: { factionId: 'church', playerStanding: 5 }, worldConditions: { religiousTension: -2, foodSecurity: -2 }, memory: { tag: 'built_the_rood_screen', weight: 5 } }, tone: 'plain' },
        { id: 'both', label: 'Build it cheaply and give the difference away', text: 'A plainer screen and nine shillings to the flooded. Neither party is satisfied and both can live with it. That is what a settlement is for.', effects: { wits: 6, charm: 4, worldConditions: { religiousTension: -3 }, faction: { factionId: 'church', playerStanding: 1 }, memory: { tag: 'split_the_screen_money', weight: 5 } }, tone: 'good' },
      ],
    },
    3: {
      title: 'THE DIVIDED PARISH · SOMEBODY WRITES TO THE BISHOP',
      text: 'A letter goes to the bishop naming four parishioners as holding dangerous opinions. {{other.name}} has seen the list. Your household is not on it, and working out why is worse than being on it would have been.',
      choices: [
        { id: 'warn_them', label: 'Warn the four', text: 'All four have time to think about what they will say. Two of them are very careful and two of them are not, and the difference shows.', effects: { faith: 5, charm: 4, worldConditions: { religiousTension: 2 }, boundKinRel: { role: 'other', delta: 10 }, memory: { tag: 'warned_the_named_four', weight: 5 } }, tone: 'good' },
        { id: 'find_writer', label: 'Find out who wrote it', text: 'It was the churchwarden, in the rector’s hand, over the chantry priest’s signature. All three of them are involved and none of them expected anyone to check.', effects: { wits: 7, faction: { factionId: 'church', playerStanding: -3 }, revealSecretOf: 'other', memory: { tag: 'traced_the_letter_to_the_bishop', weight: 5 } }, tone: 'plain' },
        { id: 'stay_off', label: 'Be glad you are not on it', text: 'You say nothing to anybody. The four are cited, two do penance in the market place, and you watch from a doorway with everyone else.', effects: { faith: -5, faction: { factionId: 'church', playerStanding: 2 }, worldConditions: { religiousTension: 3 }, memory: { tag: 'watched_the_penance', weight: 5 } }, tone: 'bad' },
      ],
    },
    4: {
      title: 'THE DIVIDED PARISH · THE ARCHDEACON’S VISITATION',
      text: 'The archdeacon comes to settle it and asks the parish, formally and in writing, to state what the quarrel is. The answer given now is the one that goes into the diocesan record.',
      choices: [
        { id: 'reconcile', label: 'Answer that the parish quarrelled over money and is done', text: 'It is true, it is unflattering to everybody equally, and it deprives both priests of a cause. The archdeacon accepts it with visible relief.', effects: { wits: 6, charm: 5, worldConditions: { religiousTension: -6, publicOrder: 2 }, faction: { factionId: 'church', playerStanding: 2 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Answer with the whole of it, names included', text: 'The letter, the screen money, the wardens, the lot. One priest is removed, one warden is ruined, and the parish talks about nothing else until the next rector dies.', effects: { reputation: 6, worldConditions: { religiousTension: 5, publicOrder: -3 }, faction: { factionId: 'church', playerStanding: -5 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE DIVIDED PARISH · ONE SIDE OF THE NAVE AGAIN',
      text: 'People stop sitting in sides. Nothing has been resolved doctrinally and everything has been resolved practically, which is how parishes actually work.',
      choices: [
        { id: 'accept_ending', label: 'Sit where you always sat', text: 'The parish goes back to arguing about the churchyard wall, which is the correct thing for a parish to argue about.', effects: { faith: 5, worldConditions: { religiousTension: -3, publicOrder: 2 }, familyReputation: { delta: 3 }, memory: { tag: 'the_nave_reunited', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE DIVIDED PARISH · WHAT THE RECORD SAYS',
      text: 'The diocesan record contains every name and every accusation, permanently, in a fair hand. Swineford is a parish that had trouble, officially, for as long as the register survives.',
      choices: [
        { id: 'accept_ending', label: 'Let the record say it', text: 'It says it. Three families leave the parish inside eighteen months, and the two sides of the nave are still visible in where people sit in 1450.', effects: { reputation: 3, worldConditions: { religiousTension: 3 }, familyReputation: { delta: 1 }, memory: { tag: 'the_parish_on_the_record', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  guild_election: {
    1: {
      title: 'THE GUILD ELECTION · TWO NAMES FOR ONE WARDENSHIP',
      text: 'The wardenship falls vacant. {{other.name}} wants it and so does a man with more money, more relatives in the livery, and a rather better cellar.',
      choices: [
        { id: 'protect_people', label: 'Back {{other.name}} openly', text: 'You put your name behind theirs early and in public, while it is still an open question and your name is still worth wagering.', effects: { charm: 5, boundKinRel: { role: 'other', delta: 14 }, faction: { factionId: 'guilds', playerStanding: -2 }, storyVariables: { approach: 'mercy' } }, tone: 'plain' },
        { id: 'secure_truth', label: 'Read the guild’s own ordinances on the election', text: 'It turns out the wardenship is elected by all sworn brethren, not by the livery, and has been since 1311. Nobody has done it that way in thirty years.', effects: { wits: 7, faction: { factionId: 'guilds', playerStanding: 2 }, storyVariables: { approach: 'evidence' } }, tone: 'good' },
        { id: 'take_advantage', label: 'Let both of them bid for your support', text: 'You are courted for six weeks by two men with cellars. It is extremely pleasant and it costs you the respect of everyone who is watching.', effects: { gold: 14, charm: 3, faction: { factionId: 'guilds', playerStanding: 1 }, boundKinRel: { role: 'other', delta: -8 }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE GUILD ELECTION · A DINNER FOR THE LIVERY',
      text: 'The other candidate gives a dinner for the livery three days before the vote: nine dishes, a swan, and no mention whatsoever of the election.',
      choices: [
        { id: 'match_it', label: 'Give a dinner for the whole brotherhood (24g)', costGold: 24, text: 'You feed sixty men badly instead of nine men well. It costs twenty-four shillings and it makes an argument that the swan cannot answer.', effects: { gold: -24, charm: 7, faction: { factionId: 'guilds', playerStanding: 3 }, boundKinRel: { role: 'other', delta: 10 }, memory: { tag: 'fed_the_whole_brotherhood', weight: 5 } }, tone: 'good' },
        { id: 'name_it', label: 'Have the dinner recorded as an election expense', text: 'You get it entered in the book as what it was. The ordinance against treating exists, it is read out, and the swan becomes the most famous bird in the trade.', effects: { wits: 6, reputation: 5, faction: { factionId: 'guilds', playerStanding: -3 }, memory: { tag: 'the_swan_in_the_book', weight: 5 } }, tone: 'plain' },
        { id: 'attend', label: 'Go to the dinner', text: 'You eat the swan and vote as you had already decided. Both facts are noticed and only one of them is believed.', effects: { charm: 3, health: 2, boundKinRel: { role: 'other', delta: -6 }, faction: { factionId: 'guilds', playerStanding: 2 }, memory: { tag: 'ate_the_swan', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE GUILD ELECTION · THE SEARCHERS FIND FAULT',
      text: 'Three days before the vote, the guild searchers find fault with {{other.name}}’s work. It is a real fault, in a real piece, found for entirely dishonest reasons.',
      choices: [
        { id: 'admit_it', label: 'Have them admit the fault and pay the fine', text: 'The fine is twopence and the admission is immediate. It takes the whole weapon away by refusing to pretend, and the searchers look ridiculous.', effects: { wits: 6, charm: 4, gold: -1, faction: { factionId: 'guilds', playerStanding: 2 }, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'admitted_the_fault_at_once', weight: 5 } }, tone: 'good' },
        { id: 'search_back', label: 'Demand a search of the other candidate’s shop', text: 'They find four faults in an afternoon because there are always four faults. The election is now about searching and nobody remembers what it was about.', effects: { wits: 4, worldConditions: { prosperity: -1 }, faction: { factionId: 'guilds', playerStanding: -4 }, memory: { tag: 'demanded_a_counter_search', weight: 5 } }, tone: 'plain' },
        { id: 'withdraw', label: 'Advise {{other.name}} to withdraw', text: 'They withdraw with the fault unadmitted, which the trade takes for guilt. It is the safe advice and it was the wrong advice.', effects: { boundKinRel: { role: 'other', delta: -14 }, faction: { factionId: 'guilds', playerStanding: 1 }, memory: { tag: 'advised_withdrawal', weight: 5 } }, tone: 'bad' },
      ],
    },
    4: {
      title: 'THE GUILD ELECTION · THE VOTE ITSELF',
      text: 'The brethren assemble. How the vote is taken has not been settled, and whoever settles it in the next ten minutes decides the result.',
      choices: [
        { id: 'reconcile', label: 'Take it by written scrutiny, all brethren voting', text: 'Every sworn man votes and nobody sees how. It takes two hours, it is close, and no one afterwards can say the result was arranged.', effects: { wits: 6, charm: 5, reputation: 5, faction: { factionId: 'guilds', playerStanding: 4 }, worldConditions: { prosperity: 2, publicOrder: 2 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Take it by show of hands, livery first', text: 'The livery raise their hands, everyone sees who raised what, and the rest of the hall votes accordingly. It is over in four minutes.', effects: { faction: { factionId: 'guilds', playerStanding: 3 }, gold: 10, worldConditions: { prosperity: 1, publicOrder: -2 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE GUILD ELECTION · A WARDEN NOBODY CAN QUESTION',
      text: 'The warden takes the oath with a result behind them that nobody in the trade can call arranged. It is a smaller thing than it sounds and it changes how the guild runs for a generation.',
      choices: [
        { id: 'accept_ending', label: 'Get the scrutiny written into the ordinances', text: 'Written scrutiny, all brethren, every election. It survives four attempts to repeal it and outlasts everybody who voted that day.', effects: { wits: 5, reputation: 5, faction: { factionId: 'guilds', playerStanding: 5 }, worldConditions: { prosperity: 2 }, memory: { tag: 'wrote_scrutiny_into_the_ordinances', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE GUILD ELECTION · A WARDEN AND A SHOW OF HANDS',
      text: 'The warden is sworn. Everybody in the hall knows how everybody else voted, and will know for the rest of their working lives.',
      choices: [
        { id: 'accept_ending', label: 'Let the hands speak', text: 'The trade runs perfectly well and rather quietly. Nobody proposes anything at a guild meeting for nine years without checking the room first.', effects: { gold: 8, faction: { factionId: 'guilds', playerStanding: 3 }, worldConditions: { publicOrder: -1 }, memory: { tag: 'the_show_of_hands', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  royal_bastard: {
    1: {
      title: 'THE ROYAL BASTARD · A CHILD AT THE PRIORY GATE',
      text: '{{other.name}} brings word of a child boarded at the priory whose keep is paid quarterly from an account nobody will name, in coin nobody in this shire handles.',
      choices: [
        { id: 'protect_people', label: 'Make sure the child is being decently kept', text: 'You go and look. The child is well fed, entirely alone, and has not been outside the precinct since it could walk.', effects: { faith: 5, wits: 3, boundKinRel: { role: 'other', delta: 6 }, storyVariables: { approach: 'mercy' } }, tone: 'plain' },
        { id: 'secure_truth', label: 'Follow the money instead of the child', text: 'Four quarters of payments through three hands, and the third hand is a clerk of the wardrobe. That is not a nobleman’s by-blow. That is closer than that.', effects: { wits: 7, gold: -6, storyVariables: { approach: 'evidence' } }, tone: 'plain' },
        { id: 'take_advantage', label: 'Let the right people know that you know', text: 'A word in the right ear and the quarterly payments acquire a small additional recipient. It is the easiest money you have ever made.', effects: { gold: 25, legal: { suspicion: 5 }, createSecret: { type: 'illegitimate_child', severity: 55, knownByIds: [] }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE ROYAL BASTARD · THE PAYMENTS STOP',
      text: 'The quarterly payment does not come at Michaelmas, or at Christmas. The prior is a practical man and a child who costs money and earns none does not stay long.',
      choices: [
        { id: 'pay_keep', label: 'Pay the child’s keep yourself (20g)', costGold: 20, text: 'Twenty shillings a year out of your own purse, quietly, with no explanation offered to the prior or anybody else.', effects: { gold: -20, faith: 6, householdState: { wealth: -3 }, memory: { tag: 'paid_the_childs_keep', weight: 5 } }, tone: 'good' },
        { id: 'take_child', label: 'Take the child into your own household', text: 'One more at the table and a very large unanswered question living under your roof. The household adjusts and the question does not go away.', effects: { expectChild: { route: 'wardship', dueInYears: 1 }, householdState: { food: -4, capacity: 1 }, faith: 5, memory: { tag: 'took_in_the_royal_ward', weight: 5 } }, tone: 'plain' },
        { id: 'find_out_why', label: 'Find out why the money stopped', text: 'Because the man who was paying it is dead, and because his executors are reading every account he kept. The child now appears in an executor’s inventory, listed between a bay gelding and thirteen yards of russet.', effects: { wits: 6, legal: { suspicion: 3 }, memory: { tag: 'learned_why_the_payments_stopped', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE ROYAL BASTARD · MEN COME ASKING',
      text: 'Two men arrive who are polite, well-mounted, and entirely uninterested in Swineford. They want to know about a child boarded at the priory and they have a description.',
      choices: [
        { id: 'lie', label: 'Tell them the child died in the winter', text: 'You say it steadily and the prior, to his eternal credit, says the same thing an hour later. They write it down and go, and you have just committed to something very large.', effects: { charm: 6, legal: { suspicion: 6 }, createSecret: { type: 'illegitimate_child', severity: 70, knownByIds: [] }, memory: { tag: 'told_them_the_child_died', weight: 5, note: 'You told the king’s men a living child was dead.' } }, tone: 'plain' },
        { id: 'tell_them', label: 'Tell them the truth', text: 'The child is taken south within the week, well-horsed and well-attended, and is never heard of in this shire again by anybody.', effects: { faction: { factionId: 'crown', playerStanding: 5 }, gold: 15, faith: -3, memory: { tag: 'gave_up_the_child', weight: 5 } }, tone: 'plain' },
        { id: 'bargain', label: 'Ask what the child is worth to them', text: 'Rather a lot, it turns out, and they are willing to discuss it in a way that tells you exactly how frightened somebody in London is.', effects: { gold: 40, wits: 5, legal: { suspicion: 7, notoriety: 3 }, faith: -6, memory: { tag: 'sold_the_child_south', weight: 5 } }, tone: 'bad' },
      ],
    },
    4: {
      title: 'THE ROYAL BASTARD · THE CHILD ASKS',
      text: 'Old enough now to have worked out most of it, the child asks you directly what you know and what you intend to do with it.',
      choices: [
        { id: 'reconcile', label: 'Tell them everything and let them decide', text: 'You give them the payments, the men, the lie, all of it. They think for three days and choose to stay exactly who they are, which was always the better claim.', effects: { faith: 7, charm: 5, boundKinRel: { role: 'other', delta: 18 }, familyReputation: { delta: 4 }, worldConditions: { publicOrder: 2 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Tell them to press the claim', text: 'You put a young person with no friends into the path of people who employ men on good horses. It might work. It is not principally about them.', effects: { reputation: 8, gold: 20, worldConditions: { warThreat: 3, publicOrder: -3 }, boundKinRel: { role: 'other', delta: -10 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE ROYAL BASTARD · THE CLAIM NEVER MADE',
      text: 'The claim is not pressed and the child grows into somebody ordinary in a village that has forgotten to be curious. It is the smallest possible ending and it was chosen.',
      choices: [
        { id: 'accept_ending', label: 'Let it be the small ending', text: 'They marry locally, hold four acres, and outlive most of the people who were frightened of them. Nothing whatever is written down.', effects: { faith: 6, familyReputation: { delta: 4 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'the_claim_never_made', weight: 5, note: 'A royal claim was left unpressed and a life was left alone.' } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE ROYAL BASTARD · THE CLAIM IN THE OPEN',
      text: 'The claim is made and the shire divides over it within a month. Swineford is now a place with a position, whether it wanted one or not.',
      choices: [
        { id: 'accept_ending', label: 'See where it goes', text: 'It goes a long way and not far enough. Retainers are quartered in the village for two winters and everybody is very careful about what they say at market.', effects: { reputation: 6, worldConditions: { warThreat: 4, publicOrder: -3 }, familyReputation: { delta: 2 }, memory: { tag: 'the_claim_pressed', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  relic_hunter: {
    1: {
      title: 'THE RELIC HUNTER · A LIST OF WHAT THE ABBEY LOST',
      text: '{{other.name}} has a list, copied from an old inventory, of fifteen things an abbey lost in the fire of 1291. Four of them have since turned up in parish churches that have no business owning them.',
      choices: [
        { id: 'protect_people', label: 'Warn the four parishes what they are holding', text: 'Three of them are grateful and one of them threatens you with a proctor. All four now know they may be sued in about eighteen months.', effects: { faith: 5, charm: 4, faction: { factionId: 'church', playerStanding: 2 }, storyVariables: { approach: 'mercy' } }, tone: 'plain' },
        { id: 'secure_truth', label: 'Verify the inventory before doing anything', text: 'Two priories and a very unhelpful sacrist later, the inventory is genuine and the copy is not. Somebody has added a twelfth item in a newer hand.', effects: { wits: 7, gold: -6, storyVariables: { approach: 'evidence' } }, tone: 'good' },
        { id: 'take_advantage', label: 'Go and find the remaining seven first', text: 'You are eight months ahead of anybody else who reads that list, and you spend all nineteen of them travelling.', effects: { gold: -10, wits: 5, health: -4, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE RELIC HUNTER · THE TWELFTH ITEM',
      text: 'The item added in the newer hand is not on any real inventory. Somebody wanted a thing to exist badly enough to write it into a document that everybody trusts.',
      choices: [
        { id: 'expose', label: 'Prove the interpolation and say so', text: 'Ink, hand and parchment all disagree with the rest of the sheet. You are entirely right and you have just made a lot of expensive people look foolish.', effects: { wits: 7, reputation: 5, faction: { factionId: 'church', playerStanding: -4 }, memory: { tag: 'exposed_the_interpolation', weight: 5 } }, tone: 'good' },
        { id: 'find_it', label: 'Go looking for the thing anyway', text: 'A forged entry does not prove the object never existed. It takes nine months and you find something, in a wall, that nobody can explain.', effects: { wits: 6, gold: -12, health: -4, memory: { tag: 'found_the_thing_in_the_wall', weight: 5 } }, tone: 'plain' },
        { id: 'sell_the_secret', label: 'Sell what you know to the abbey', text: 'They pay generously for the news that their own inventory was tampered with and rather more for your agreement to stop reading it.', effects: { gold: 30, faction: { factionId: 'church', playerStanding: 3 }, wits: 3, createSecret: { type: 'stolen_property', severity: 45, knownByIds: [] }, memory: { tag: 'sold_the_interpolation', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE RELIC HUNTER · A COMPETITOR ON THE SAME ROAD',
      text: 'Somebody else is working the same list, three weeks ahead, and buying rather than asking. Two of the four parishes have already sold quietly and denied it.',
      choices: [
        { id: 'outbid', label: 'Buy the remaining two first (28g)', costGold: 28, text: 'Twenty-eight shillings and both parishes are extremely relieved to deal with somebody who at least tells them what they are selling.', effects: { gold: -28, wits: 4, householdState: { wealth: 4 }, faction: { factionId: 'church', playerStanding: -2 }, memory: { tag: 'outbid_the_competitor', weight: 5 } }, tone: 'plain' },
        { id: 'stop_sales', label: 'Get the archdeacon to forbid all four sales', text: 'A monition under seal to four churchwardens. Nothing else moves, nothing is recovered either, and the competitor turns his attention to a different diocese.', effects: { wits: 6, faith: 5, faction: { factionId: 'church', playerStanding: 5 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'stopped_the_relic_sales', weight: 5 } }, tone: 'good' },
        { id: 'work_together', label: 'Propose you split the list', text: 'Six each and no bidding against one another. It is efficient, it is profitable, and it turns two searchers into one market.', effects: { gold: 20, charm: 5, faith: -4, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'split_the_relic_list', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE RELIC HUNTER · WHERE IT ALL GOES',
      text: 'Whatever has been gathered has to end up somewhere. The abbey that lost it in 1291 no longer exists, and four parishes, one collector and a bishop all have a case.',
      choices: [
        { id: 'reconcile', label: 'Give it to the parishes it was found in, with a written history', text: 'Each piece goes back where it surfaced with a full account of how it got there attached. Nobody gets everything and every object gets its story.', effects: { faith: 7, wits: 5, reputation: 6, faction: { factionId: 'church', playerStanding: 4 }, worldConditions: { publicOrder: 2 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Keep the collection whole and keep it yourself', text: 'Thirteen objects in one chest under your floor, worth a very great deal and impossible to show to anybody.', effects: { gold: 45, householdState: { wealth: 8 }, faith: -5, createSecret: { type: 'stolen_property', severity: 65, knownByIds: [] }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
      ],
    },
    '5_reconciled': {
      title: 'THE RELIC HUNTER · ELEVEN OBJECTS AND ELEVEN HISTORIES',
      text: 'Every piece sits where it was found with its own written account beside it. It is a very unusual thing to have done and two antiquaries write to you about it.',
      choices: [
        { id: 'accept_ending', label: 'Send them the copies', text: 'The histories are copied and outlive the objects by three hundred years. Nobody meant that, and it is the better half of the bargain.', effects: { wits: 5, faith: 5, familyReputation: { delta: 4 }, memory: { tag: 'the_eleven_histories', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE RELIC HUNTER · THE CHEST UNDER THE FLOOR',
      text: 'The collection is complete, valuable beyond anything else you own, and can never be opened in front of another person for as long as you live.',
      choices: [
        { id: 'accept_ending', label: 'Put the boards back', text: 'You nail the floor down. Twice a year you take it up and look, alone, and put it back, and that is the entire use the collection ever gets.', effects: { householdState: { wealth: 5 }, faith: -3, memory: { tag: 'the_chest_under_the_floor', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  secret_brotherhood: {
    1: {
      title: 'THE BROTHERHOOD · A CANDLE AND A COMMON BOX',
      text: '{{other.name}} invites you into a fraternity that keeps a light burning in the church, buries its own, and pays a shilling a week to any brother too sick to work. It also meets behind a locked door.',
      choices: [
        { id: 'protect_people', label: 'Join and pay your dues', text: 'Fourpence a quarter into the common box and your name in the brotherhood book. It is a burial club, a sick fund and, on the evidence, something else as well.', effects: { gold: -4, faith: 4, charm: 4, faction: { factionId: 'commons', playerStanding: 3 }, storyVariables: { approach: 'mercy' } }, tone: 'good' },
        { id: 'secure_truth', label: 'Find out what happens behind the locked door', text: 'It is a burial club, a sick fund, and a meeting at which wages are discussed by men who are not allowed to discuss wages. That is precisely why the door is locked.', effects: { wits: 6, storyVariables: { approach: 'evidence' } }, tone: 'plain' },
        { id: 'take_advantage', label: 'Take note of who is in it', text: 'Seven names, and three of them work for men who would pay for that list. You do not sell it yet. You write it down.', effects: { wits: 5, legal: { suspicion: 3 }, createSecret: { type: 'criminal_contact', severity: 35, knownByIds: [] }, storyVariables: { approach: 'advantage' } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE BROTHERHOOD · THE COMMON BOX IS LIGHT',
      text: 'The box is seven shillings short and three brothers are sick and unpaid. The steward of the box is a decent man in a bad year with a sick child of his own.',
      choices: [
        { id: 'cover_it', label: 'Make the box up yourself (7g)', costGold: 11, text: 'Seven shillings, replaced quietly, and the sick are paid on Friday. Two brothers work out what happened and neither of them ever says so.', effects: { gold: -11, faith: 6, charm: 5, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'made_up_the_common_box', weight: 5 } }, tone: 'good' },
        { id: 'expose_him', label: 'Put it to the brotherhood', text: 'He admits it in front of seven men, weeping, and is expelled by their own rule which does not allow for sick children. Everyone follows the rule and nobody defends it.', effects: { reputation: 3, faith: -3, faction: { factionId: 'commons', playerStanding: -3 }, boundKinRel: { role: 'other', delta: -10 }, memory: { tag: 'expelled_the_box_steward', weight: 5 } }, tone: 'bad' },
        { id: 'change_rule', label: 'Get the rule changed before anybody is accused', text: 'You propose relief for a brother’s household before you propose anything about the box. The rule passes, then the shortfall is raised, and it is a different meeting entirely.', effects: { wits: 7, charm: 6, faction: { factionId: 'commons', playerStanding: 5 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'changed_the_rule_first', weight: 5 } }, tone: 'good' },
      ],
    },
    3: {
      title: 'THE BROTHERHOOD · THE STATUTE AND THE LOCKED DOOR',
      text: 'The justices of labourers are riding the shire. A fraternity of working men meeting behind a locked door is, by the letter of the statute, a conspiracy, and the letter is what is enforced.',
      choices: [
        { id: 'go_open', label: 'Meet in the church porch with the door open', text: 'Everything the brotherhood does that is lawful is done in daylight where anyone may hear it. Everything else stops, and three brothers leave in disgust.', effects: { wits: 6, legal: { suspicion: -5 }, faction: { factionId: 'church', playerStanding: 3 }, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'opened_the_brotherhood_door', weight: 5 } }, tone: 'plain' },
        { id: 'burn_book', label: 'Burn the brotherhood book', text: 'Fifteen names and forty years of burials, on the fire. There is now no evidence of anything, including of who is owed relief.', effects: { legal: { suspicion: -7 }, faith: -4, faction: { factionId: 'commons', playerStanding: -3 }, memory: { tag: 'burned_the_brotherhood_book', weight: 5 } }, tone: 'plain' },
        { id: 'keep_meeting', label: 'Keep meeting behind the door', text: 'You go on exactly as before with a man watching the lane. It holds for two years, and then it holds for one more night than it should.', effects: { legal: { suspicion: 8, notoriety: 2 }, charm: 4, faction: { factionId: 'commons', playerStanding: 5 }, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'kept_the_door_locked', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE BROTHERHOOD · A JUSTICE ASKS FOR THE NAMES',
      text: 'A justice of labourers asks you, under oath, for the names of every man in the fraternity. He already has four of them and wants to see whether you will give him the other three.',
      choices: [
        { id: 'reconcile', label: 'Give him the brotherhood’s accounts instead', text: 'Forty years of burials, sick pay and candle wax, handed over entire. It is dull, it is complete, and it makes the conspiracy charge collapse under its own boredom.', effects: { wits: 7, charm: 5, legal: { suspicion: -6 }, faction: { factionId: 'commons', playerStanding: 5 }, worldConditions: { publicOrder: 2 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Give him the seven names', text: 'You say them under oath, correctly, one after another. Four are fined, two are ruined, and one of them was the man who let you in.', effects: { legal: { suspicion: -8 }, faction: { factionId: 'crown', playerStanding: 5 }, faith: -7, boundKinRel: { role: 'other', delta: -22 }, storyVariables: { resolution: 'hardline' } }, tone: 'bad' },
      ],
    },
    '5_reconciled': {
      title: 'THE BROTHERHOOD · THE LIGHT STILL BURNS',
      text: 'The fraternity survives as what it always mostly was: a light in the church, a box, and seven men who will bury each other. The other business is done elsewhere and not written down.',
      choices: [
        { id: 'accept_ending', label: 'Pay your quarter’s fourpence', text: 'You pay it for the rest of your life and the box pays your burial. The light is still burning in that church in 1520.', effects: { faith: 6, charm: 4, familyReputation: { delta: 3 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'the_light_still_burns', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_hard': {
      title: 'THE BROTHERHOOD · THE BOX IS BROKEN UP',
      text: 'The fraternity is dissolved, the box divided, and the light goes out. Three of the men live long enough to be old and none of them ever mentions it in your hearing.',
      choices: [
        { id: 'accept_ending', label: 'Take your share of the box', text: 'Elevenpence. You are entitled to it, you take it, and you cannot afterwards remember what you spent it on.', effects: { gold: 1, faith: -4, faction: { factionId: 'commons', playerStanding: -4 }, familyReputation: { delta: -1 }, memory: { tag: 'took_a_share_of_the_broken_box', weight: 5 } }, tone: 'bad' },
      ],
    },
  },
};
