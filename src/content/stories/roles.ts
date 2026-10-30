import { StoryCopy } from './types';

/**
 * The seven vocation stories. Chapters one to three previously shared three
 * strings across all seven roles, and each role's two choices were repeated
 * verbatim at every chapter, so a monarch and an outlaw were offered the same
 * decision three times running.
 *
 * These bind the `contact` role, not `other`.
 */
export const ROLE_STORY_COPY: Record<string, StoryCopy> = {
  commoner: {
    1: {
      title: 'THE COMMON ROUND · THE BOON-WORK FALLS IN THE RAIN',
      text: '{{contact.name}} brings word that the lord’s boon-work has been called for the three driest days of the month, which are the three days every holding in Swineford needs for its own hay.',
      choices: [
        { id: 'commons', label: 'Get the village to ask for a different week', text: 'Thirteen households put the same request in the same words at the same hallmote. The steward moves it, grumbling, and notes that Swineford is organised.', effects: { charm: 5, worldConditions: { foodSecurity: 2, publicOrder: 1 }, faction: { factionId: 'commons', playerStanding: 3 } }, tone: 'good' },
        { id: 'independence', label: 'Cut your own hay at night and do the boon-work anyway', text: 'Three nights by moonlight and three days on the lord’s meadow. Your hay is in, you are half dead, and you owe nobody anything.', effects: { holding: { stores: 6 }, health: -6, wits: 3 }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE COMMON ROUND · THE HAYWARD TAKES AGAINST A HOUSEHOLD',
      text: 'The hayward has presented one household five times this year for things everybody does. {{contact.name}} says it is because of an old argument over a gate.',
      choices: [
        { id: 'commons', label: 'Get the presentments read out together', text: 'Five presentments against one household and none against anybody else, read one after another. The steward sees it instantly and the hayward is replaced at Michaelmas.', effects: { wits: 6, reputation: 4, worldConditions: { publicOrder: 2 }, faction: { factionId: 'commons', playerStanding: 4 } }, tone: 'good' },
        { id: 'independence', label: 'Pay their amercements and keep out of it', costGold: 2, text: 'Fourpence four times. The household is grateful, the hayward is undisturbed, and you have solved this year and not the next one.', effects: { gold: -2, faith: 4, charm: 3, holding: { stores: 2 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE COMMON ROUND · THE STEWARD WANTS A REEVE',
      text: 'The manor needs a reeve for the year: unpaid, unpopular, responsible for everybody else’s arrears, and excused their own rent. {{contact.name}} says the village would elect you if you let them.',
      choices: [
        { id: 'commons', label: 'Take it', text: 'A year of collecting from neighbours and answering to a steward. You are rent-free and nobody in Swineford quite talks to you the same way again.', effects: { rankProgress: 8, gold: 6, wits: 5, faction: { factionId: 'crown', playerStanding: 3 } }, tone: 'plain' },
        { id: 'independence', label: 'Refuse and let it fall on somebody else', text: 'It falls on a man who cannot say no and cannot do the arithmetic, and the whole village pays for that by Michaelmas.', effects: { holding: { stores: 4 }, worldConditions: { publicOrder: -2 }, faction: { factionId: 'commons', playerStanding: -2 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE COMMON ROUND · THE ARREARS OF A NEIGHBOUR',
      text: 'One household is six shillings behind and cannot pay. {{contact.name}} points out that the arrears are recoverable from the village as a whole, or from that household’s beasts, and the choice of which is being left to you.',
      choices: [
        { id: 'duty', label: 'Spread it across the whole village', costGold: 3, text: 'Elevenpence a household and a very cold reception at four doors. The family keeps its beasts and stays on its land, which was the entire point.', effects: { faith: 6, charm: 4, gold: -3, faction: { factionId: 'commons', playerStanding: 5 }, worldConditions: { publicOrder: 2 }, storyVariables: { resolution: 'duty' } }, tone: 'good' },
        { id: 'ambition', label: 'Take the beasts', text: 'Two oxen distrained and sold. The books balance perfectly, the steward is impressed, and the household is cottars by Lady Day.', effects: { gold: 12, rankProgress: 10, faction: { factionId: 'crown', playerStanding: 4 }, faith: -5, storyVariables: { resolution: 'ambition' } }, tone: 'bad' },
      ],
    },
    '5_duty': {
      title: 'THE COMMON ROUND · THE VILLAGE THAT COVERS ITSELF',
      text: 'Swineford agrees to share the unpaid dues of four struggling families. The collections cover this year’s arrears and keep those households on their land.',
      choices: [
        { id: 'accept_ending', label: 'Let it become the custom', text: 'The village agrees to keep the arrangement. For now, neighbours have a custom they can call on when the harvest fails.', effects: { faith: 5, reputation: 4, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'the_village_covers_itself', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_ambition': {
      title: 'THE COMMON ROUND · A VERY GOOD SET OF BOOKS',
      text: 'Your year as reeve produces the cleanest account roll the manor has seen. The steward remembers your name and so, differently, does the lane.',
      choices: [
        { id: 'accept_ending', label: 'Take the steward’s notice', text: 'Better work follows and so does a coolness in Swineford that never entirely lifts. Both were bought with the same two oxen.', effects: { rankProgress: 14, gold: 10, reputation: 4, faction: { factionId: 'commons', playerStanding: -4 }, memory: { tag: 'the_clean_account_roll', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  artisan_merchant: {
    1: {
      title: 'THE CONTESTED TRADE · THE ASSIZE OF BREAD AND ALE',
      text: '{{contact.name}} warns you the aletasters are coming through and that the assize price has moved since the last grain returns, downward, which nobody has told the traders.',
      choices: [
        { id: 'quality', label: 'Price to the new assize immediately', text: 'You are the only stall pricing correctly on the day the tasters walk through. Four of your neighbours are amerced and every one of them knows you knew.', effects: { wits: 5, reputation: 4, gold: -3, worldConditions: { prosperity: 1 } }, tone: 'plain' },
        { id: 'monopoly', label: 'Tell nobody and hold the old price for a week', text: 'A week of the old price and then a very quick correction the morning the tasters arrive. Eight shillings and no amercement.', effects: { gold: 8, faction: { factionId: 'guilds', playerStanding: -2 }, wits: 4 }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE CONTESTED TRADE · FORESTALLING ON THE ROAD',
      text: 'Somebody is meeting the carts a mile outside Swineford and buying the whole load before it reaches the market. It is illegal, it is profitable, and {{contact.name}} can name him.',
      choices: [
        { id: 'quality', label: 'Present him for forestalling', text: 'He is amerced and does it again by a different road within a month. The presentment costs him twopence and costs you a permanent enemy with capital.', effects: { reputation: 4, worldConditions: { prosperity: 2, publicOrder: 1 }, faction: { factionId: 'guilds', playerStanding: 2 } }, tone: 'good' },
        { id: 'monopoly', label: 'Meet the carts two miles out', text: 'You go further out than he does and buy earlier. It works beautifully and the market price in Swineford is now set entirely on the Cambridge road.', effects: { gold: 16, legal: { suspicion: 4 }, worldConditions: { prosperity: -2 }, faction: { factionId: 'commons', playerStanding: -3 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE CONTESTED TRADE · A BAD BATCH UNDER YOUR MARK',
      text: 'Seven pieces have gone out under your mark with a fault in them that will show in five winters or so. {{contact.name}} noticed before the buyers did.',
      choices: [
        { id: 'quality', label: 'Recall all seven and replace them', costGold: 22, text: 'You go to seven doors, admit it, and replace the lot at your own cost. The expense hurts, but the buyers praise your honesty and the guild takes notice.', effects: { gold: -22, reputation: 7, faction: { factionId: 'guilds', playerStanding: 4 }, worldConditions: { prosperity: 1 } }, tone: 'good' },
        { id: 'monopoly', label: 'Say nothing and improve the next batch', text: 'You leave the suspect pieces in circulation and improve the next batch. Nobody has connected the faults yet; you keep the list of buyers to yourself.', effects: { gold: 10, faith: -3, createSecret: { type: 'stolen_property', severity: 30, knownByIds: [] } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE CONTESTED TRADE · THE GUILD OFFERS YOU THE SEARCH',
      text: 'The wardens offer you the searchership: you inspect every shop in the trade, condemn what fails, and set the standard for the town. It is power, and it is unpaid, and it makes you responsible for other men’s livelihoods.',
      choices: [
        { id: 'duty', label: 'Take it and search honestly', text: 'You condemn work belonging to two men who have fed you and one who is owed money by you. Nobody ever accuses you of favour and nobody ever thanks you either.', effects: { faith: 5, wits: 5, reputation: 6, faction: { factionId: 'guilds', playerStanding: 5 }, worldConditions: { prosperity: 3 }, storyVariables: { resolution: 'duty' } }, tone: 'good' },
        { id: 'ambition', label: 'Take it and search selectively', text: 'Your competitors are searched thoroughly and your friends are searched on a Friday afternoon. Orders move to your shop, bringing profit and uncomfortable questions.', effects: { gold: 24, householdState: { wealth: 6, status: 3 }, faction: { factionId: 'guilds', playerStanding: 2 }, faith: -5, storyVariables: { resolution: 'ambition' } }, tone: 'plain' },
      ],
    },
    '5_duty': {
      title: 'THE CONTESTED TRADE · A MARK THAT MEANS SOMETHING',
      text: 'The standard holds because it was applied to everybody including you. Buyers three counties off ask for Swineford work by name, which has never happened before.',
      choices: [
        { id: 'accept_ending', label: 'Keep searching honestly', text: 'You record the faults honestly and settle the outstanding orders. Your fair dealing earns both payment and the guild’s respect.', effects: { reputation: 6, gold: 14, worldConditions: { prosperity: 4 }, familyReputation: { delta: 4 }, memory: { tag: 'the_honest_search', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_ambition': {
      title: 'THE CONTESTED TRADE · THE LARGEST SHOP IN THE TOWN',
      text: 'Yours is the biggest shop in the trade and the trade knows precisely how it got that way. Nobody says it, because you are also the searcher.',
      choices: [
        { id: 'accept_ending', label: 'Keep the search and the shop', text: 'You keep the appointment and the profit from this order. Your household grows richer, but the guild questions whose interests your inspections serve.', effects: { gold: 30, householdState: { wealth: 8, status: 4 }, familyReputation: { delta: -2 }, faction: { factionId: 'guilds', playerStanding: -3 }, memory: { tag: 'the_searchers_shop', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  clergy: {
    1: {
      title: 'THE CURE OF SOULS · THE UNBAPTISED CHILD',
      text: '{{contact.name}} brings a child born in the night to a woman with no husband anybody will name. The child is weak, and the question of whether it is baptised before dawn is not a theological one tonight.',
      choices: [
        { id: 'mercy', label: 'Baptise it at once and ask nothing', text: 'Done before first light with two women as witnesses. The child lives. The question of the father is never entered in any book.', effects: { faith: 7, charm: 4, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { religiousTension: -1 } }, tone: 'good' },
        { id: 'orthodoxy', label: 'Baptise it and present the mother for leyrwite', text: 'Both are done properly. The child is saved and the mother pays sixpence she does not have and stands up in front of the parish.', effects: { faith: 4, reputation: 3, faction: { factionId: 'church', playerStanding: 3 }, worldConditions: { religiousTension: 2 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE CURE OF SOULS · WHAT WAS SAID IN CONFESSION',
      text: 'Somebody has confessed something that will kill another person if it stays secret. The seal of confession is absolute and there is no version of this where you are not complicit in something.',
      choices: [
        { id: 'mercy', label: 'Work on the penitent until they tell it themselves', text: 'Four months of the hardest pastoral work of your life. They tell it, in the end, in their own voice, and nobody dies.', effects: { faith: 8, wits: 6, charm: 5, worldConditions: { publicOrder: 2 } }, tone: 'good' },
        { id: 'orthodoxy', label: 'Keep the seal absolutely', text: 'You keep it, entirely, as you are bound to. Somebody dies in March and you say the words over them knowing what you knew.', effects: { faith: 5, health: -4, reputation: 2, faction: { factionId: 'church', playerStanding: 4 }, worldConditions: { publicOrder: -2 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE CURE OF SOULS · THE BISHOP WANTS THE PARISH SILENT',
      text: 'A letter comes: the parish is to stop asking about where the tithe corn goes, and to be told from the pulpit that the question is itself a sin. {{contact.name}} has read it over your shoulder.',
      choices: [
        { id: 'mercy', label: 'Preach on stewardship instead', text: 'You preach a scrupulously orthodox sermon on the duties of stewards that answers the question completely without once mentioning it. The parish understands perfectly.', effects: { faith: 6, wits: 6, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { religiousTension: 1 } }, tone: 'good' },
        { id: 'orthodoxy', label: 'Preach the letter as written', text: 'You say from the pulpit that asking is a sin. Fifteen people stop coming and four of them never come back to any church at all.', effects: { faction: { factionId: 'church', playerStanding: 5 }, reputation: 3, faith: -3, worldConditions: { religiousTension: 4 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE CURE OF SOULS · A PATRON’S OFFER',
      text: 'A wealthy church patron offers a paid commission. Taking it means less time this season for three local families in genuine trouble.',
      choices: [
        { id: 'duty', label: 'Refuse it and stay', text: 'You write a short, polite refusal and put it in the fire twice before sending it. You make time for the three families and help them through the immediate trouble.', effects: { faith: 8, reputation: 5, faction: { factionId: 'commons', playerStanding: 6 }, worldConditions: { religiousTension: -3, publicOrder: 2 }, storyVariables: { resolution: 'duty' } }, tone: 'good' },
        { id: 'ambition', label: 'Take it', text: 'You accept the commission and its payment. The patron commends your work; the three families must wait for your attention.', effects: { gold: 26, rankProgress: 14, faction: { factionId: 'church', playerStanding: 5 }, storyVariables: { resolution: 'ambition' } }, tone: 'plain' },
      ],
    },
    '5_duty': {
      title: 'THE CURE OF SOULS · A PARISH THAT TRUSTS YOU',
      text: 'The families you helped thank you after the service. Their trust was earned through small duties that could easily have been neglected.',
      choices: [
        { id: 'accept_ending', label: 'Renew your commitment', text: 'The parish records its thanks and promises help with your work. You return to your duties with stronger support and a name people trust.', effects: { faith: 8, reputation: 6, familyReputation: { delta: 5 }, worldConditions: { religiousTension: -2 }, memory: { tag: 'forty_years_in_one_parish', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_ambition': {
      title: 'THE CURE OF SOULS · THE PATRON’S FAVOUR',
      text: 'The commission brings money and influence within the church. Your patron offers further support, while local families still need your time.',
      choices: [
        { id: 'accept_ending', label: 'Get on with the work', text: 'You accept the patron’s support and complete the agreed work. Your household benefits, and the demands on your attention remain.', effects: { rankProgress: 12, gold: 18, householdState: { status: 4 }, faction: { factionId: 'church', playerStanding: 4 }, memory: { tag: 'took_the_town_living', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  martial: {
    1: {
      title: 'THE SOLDIER’S ROAD · THE ARRAY IS SHORT OF ARCHERS',
      text: '{{contact.name}} says the array is six archers short and the shortfall will be made up from whoever is standing in the butts on Sunday, whether they can draw or not.',
      choices: [
        { id: 'defend', label: 'Train them properly before the muster', text: 'Six weeks of Sundays and a great deal of shouting. Six men who can draw a bow instead of six men holding one.', effects: { rankProgress: 6, charm: 4, health: -3, worldConditions: { publicOrder: 2, warThreat: -1 } }, tone: 'good' },
        { id: 'glory', label: 'Get yourself named to the retinue instead', text: 'You are attached to a retinue rather than the array, which is better pay, better company, and considerably nearer the fighting.', effects: { rankProgress: 12, gold: 8, health: -4, reputation: 4 }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE SOLDIER’S ROAD · AN ORDER TO FIRE THE VILLAGE',
      text: 'The order is to burn a village on the line of march to deny it to the enemy. It is a sound military decision and there are people in it.',
      choices: [
        { id: 'defend', label: 'Get them out first and burn it slowly', text: 'You lose half a day and the village burns with nobody in it. Your captain says nothing about the half day and does not forget it.', effects: { faith: 6, charm: 4, rankProgress: -4, worldConditions: { publicOrder: 1 } }, tone: 'plain' },
        { id: 'glory', label: 'Burn it on time', text: 'It is done inside the hour exactly as ordered. You are commended in front of the retinue and you are careful, afterwards, not to think about the hour.', effects: { rankProgress: 14, reputation: 5, faith: -6, worldConditions: { warThreat: 2 } }, tone: 'bad' },
      ],
    },
    3: {
      title: 'THE SOLDIER’S ROAD · THE WAGES DO NOT COME',
      text: 'Eight weeks unpaid and the retinue is beginning to take payment from the countryside instead. {{contact.name}} says it starts as requisition and it never stays requisition.',
      choices: [
        { id: 'defend', label: 'Ride to the paymaster and refuse to leave', text: 'Six days in an antechamber being extremely polite. The wages arrive, eight weeks of them, and the countryside is not touched.', effects: { charm: 6, wits: 4, gold: 10, worldConditions: { publicOrder: 2 }, faction: { factionId: 'crown', playerStanding: -2 } }, tone: 'good' },
        { id: 'glory', label: 'Take what the retinue is owed from the country', text: 'Nineteen weeks of wages taken in kind from people who owe you nothing. The men are paid, the retinue holds together, and three villages remember the badge.', effects: { gold: 20, path: { outlaw: 2 }, worldConditions: { publicOrder: -4 }, faction: { factionId: 'commons', playerStanding: -5 } }, tone: 'bad' },
      ],
    },
    4: {
      title: 'THE SOLDIER’S ROAD · THE CAPTAINCY AND THE GARRISON',
      text: 'You are offered a captaincy on a campaign that will make a name, or the command of the shire garrison, which is dull, permanent, and the only thing standing between the coast road and the villages behind it.',
      choices: [
        { id: 'duty', label: 'Take the garrison', text: 'You organise patrols, drills and watch rotations. Merchants report a quieter road, and the nearby villages welcome the extra protection.', effects: { faith: 5, rankProgress: 8, worldConditions: { publicOrder: 4, warThreat: -3 }, faction: { factionId: 'commons', playerStanding: 5 }, storyVariables: { resolution: 'duty' } }, tone: 'good' },
        { id: 'ambition', label: 'Take the captaincy', text: 'You lead a hard-fought sortie and return with wounds, pay and a growing reputation. While the retinue is away, patrols on the coast road are stretched thin.', effects: { rankProgress: 20, gold: 24, reputation: 8, health: -8, worldConditions: { publicOrder: -2 }, storyVariables: { resolution: 'ambition' } }, tone: 'plain' },
      ],
    },
    '5_duty': {
      title: 'THE SOLDIER’S ROAD · THE ROAD WHERE NOTHING HAPPENED',
      text: 'The patrol reports record a quiet season. Four villages behind the road have brought their goods safely to market, with no great battle for a chronicler to celebrate.',
      choices: [
        { id: 'accept_ending', label: 'Keep the road', text: 'You renew the watch and train a capable deputy. The garrison recognises your steady command, even if a safe road makes a poor tale at a feast.', effects: { rankProgress: 10, faith: 5, familyReputation: { delta: 4 }, worldConditions: { publicOrder: 3 }, memory: { tag: 'the_road_where_nothing_happened', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_ambition': {
      title: 'THE SOLDIER’S ROAD · A NAME THAT TRAVELS',
      text: 'The name goes further than you ever did and comes home ahead of you. It is worth a great deal in every hall in the shire and nothing at all on the coast road.',
      choices: [
        { id: 'accept_ending', label: 'Live on the name', text: 'Your name brings invitations, gifts and a comfortable seat at the next feast. Everyone wants to hear about those same six minutes.', effects: { rankProgress: 16, gold: 20, reputation: 8, householdState: { status: 5 }, memory: { tag: 'the_name_that_travelled', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  landed_noble: {
    1: {
      title: 'A MATTER OF JUSTICE · THE FIRST COURT YOU HOLD',
      text: '{{contact.name}} sets the first roll in front of you. Fourteen presentments, four of them against people who cannot read the charge, and every judgement you give today could become a precedent for later hearings.',
      choices: [
        { id: 'justice', label: 'Have every charge read out in English first', text: 'It doubles the length of the court and it means every man amerced knows what for. The steward finds it eccentric and it becomes the custom of the manor.', effects: { wits: 5, reputation: 5, holding: { loyalty: 6 }, worldConditions: { publicOrder: 3 } }, tone: 'good' },
        { id: 'privilege', label: 'Get through the roll efficiently', text: 'Sixteen presentments in ninety minutes and four shillings in amercements. It is a well-run court and four men leave it without knowing why they were fined.', effects: { gold: 8, holding: { loyalty: -4 }, wits: 3 }, tone: 'plain' },
      ],
    },
    2: {
      title: 'A MATTER OF JUSTICE · THE HERIOT ON A POOR HOLDING',
      text: 'A tenant dies leaving a widow, four children and one cow. The heriot is the best beast, which is the cow, and it is entirely lawful and it will finish them.',
      choices: [
        { id: 'justice', label: 'Take a token heriot and leave the cow', text: 'You take twopence and a pot and enter it in the roll as the best beast. The steward writes it exactly as you dictate and does not look up.', effects: { faith: 6, holding: { loyalty: 10 }, gold: -3, faction: { factionId: 'commons', playerStanding: 4 } }, tone: 'good' },
        { id: 'privilege', label: 'Take the cow', text: 'The cow comes to the hall. It is lawful, it is what the custom says, and the widow is at her brother’s within the year.', effects: { gold: 10, holding: { loyalty: -12 }, faith: -5, householdState: { food: 3 } }, tone: 'bad' },
      ],
    },
    3: {
      title: 'A MATTER OF JUSTICE · A KNIGHT OF YOUR OWN AFFINITY IS GUILTY',
      text: 'One of your own retainers has done the thing he is accused of. {{contact.name}} says the county is watching to see whether your court applies to your own men.',
      choices: [
        { id: 'justice', label: 'Try him in your own court and convict him', text: 'He is convicted, fined heavily and put out of the affinity. Three other retainers leave with him and every tenant in the honour hears about it inside a week.', effects: { reputation: 7, holding: { loyalty: 12, security: -4 }, worldConditions: { publicOrder: 3 } }, tone: 'good' },
        { id: 'privilege', label: 'Have it settled elsewhere', text: 'It goes away through a friend at the assize. The retainer is loyal for life, the county notices, and every man who pleads before you afterwards knows what your court is worth.', effects: { holding: { security: 6, loyalty: -8 }, legal: { suspicion: 3 }, worldConditions: { publicOrder: -2 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'A MATTER OF JUSTICE · THE COMMISSION OF THE PEACE',
      text: 'You are offered a place on the commission of the peace for the whole shire: real jurisdiction, real work, and every gentleman in the county watching how you use it.',
      choices: [
        { id: 'duty', label: 'Take it and sit at every session', text: 'You attend the session, question doubtful charges and insist that the clerk records each ruling. Prisoners receive a fairer hearing and the shire notices your diligence.', effects: { faith: 5, wits: 6, reputation: 6, worldConditions: { publicOrder: 5 }, faction: { factionId: 'crown', playerStanding: 4 }, storyVariables: { resolution: 'duty' } }, tone: 'good' },
        { id: 'ambition', label: 'Take it and use it', text: 'The commission is a lever and you use it as one. Favourable settlements enrich your household and strengthen your holding, while the shire questions your impartiality.', effects: { gold: 40, holding: { stores: 12, security: 6 }, householdState: { wealth: 8, status: 5 }, worldConditions: { publicOrder: -3 }, storyVariables: { resolution: 'ambition' } }, tone: 'plain' },
      ],
    },
    '5_duty': {
      title: 'A MATTER OF JUSTICE · THE CUSTOM OF THE MANOR',
      text: 'The court roll of your honour is quoted in three neighbouring shires as the way it ought to be done. Your lands are worth less than they might be and they are extremely quiet.',
      choices: [
        { id: 'accept_ending', label: 'Keep sitting', text: 'You enter the procedure in the court roll: tenants must hear the charge and be allowed to answer. They leave with greater confidence in your court.', effects: { reputation: 6, holding: { loyalty: 10 }, familyReputation: { delta: 5 }, worldConditions: { publicOrder: 3 }, memory: { tag: 'the_custom_of_the_manor', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_ambition': {
      title: 'A MATTER OF JUSTICE · PROFIT AND A REPUTATION',
      text: 'Your household has grown richer through the commission and the shire is entirely clear about how. Nobody says it at your table and everybody says it at their own.',
      choices: [
        { id: 'accept_ending', label: 'Hold what you have taken', text: 'You keep the proceeds and secure your holding. The losing parties lodge their objections, and your tenants are less willing to trust the court.', effects: { gold: 30, holding: { stores: 10, loyalty: -6 }, householdState: { wealth: 8, status: 5 }, familyReputation: { delta: -2 }, memory: { tag: 'three_manors_and_a_reputation', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  monarch: {
    1: {
      title: 'THE WEIGHT OF THE CROWN · THE FIRST GREAT COUNCIL',
      text: '{{contact.name}} sets the order of business. Twenty items, and the one about the coinage is placed eleventh, where the council will be tired and will pass it without argument.',
      choices: [
        { id: 'counsel', label: 'Move the coinage to the front', costGold: 12, text: 'Four hours of argument about the coinage with everybody awake. The council agrees on a sounder coinage, at a cost to the treasury.', effects: { wits: 6, worldConditions: { prosperity: 3, publicOrder: 2 }, gold: -12 }, tone: 'good' },
        { id: 'decree', label: 'Leave it eleventh', text: 'It passes at dusk in four minutes with nobody attending. It is exactly what you wanted, but merchants question its value and the Commons record their objections.', effects: { gold: 26, worldConditions: { prosperity: -2, publicOrder: -2 }, wits: 3 }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE WEIGHT OF THE CROWN · A FAVOURITE AND A FAMINE',
      text: 'The grain is short in four counties and the man you have raised highest is the one holding the export licences. Everybody in the room knows both facts.',
      choices: [
        { id: 'counsel', label: 'Revoke the licences yourself, in council', text: 'You do it in front of him, giving the reason plainly. His manner turns cold. With the licences revoked, grain reaches the markets and food supplies improve.', effects: { faith: 6, reputation: 5, worldConditions: { foodSecurity: 5, publicOrder: 3 }, charm: -4 }, tone: 'good' },
        { id: 'decree', label: 'Let the licences stand', text: 'They stand. He is loyal beyond anything money could buy and there are bread riots in two counties by Lent.', effects: { gold: 20, worldConditions: { foodSecurity: -5, publicOrder: -5 }, faction: { factionId: 'crown', playerStanding: 3 } }, tone: 'bad' },
      ],
    },
    3: {
      title: 'THE WEIGHT OF THE CROWN · PARLIAMENT WANTS REDRESS BEFORE SUPPLY',
      text: 'The Commons will vote the subsidy only after their petitions are answered. {{contact.name}} points out that no king has ever conceded that order and that you need the money by Whitsun.',
      choices: [
        { id: 'counsel', label: 'Concede the order', text: 'Redress before supply, conceded in writing. You get your subsidy, and the Commons enter the concession in the roll as a precedent.', effects: { wits: 5, faith: 4, gold: 30, worldConditions: { publicOrder: 4 }, faction: { factionId: 'commons', playerStanding: 6 } }, tone: 'good' },
        { id: 'decree', label: 'Dissolve them and raise it another way', text: 'Forced loans, a benevolence, and the sale of thirteen offices. You get more than the subsidy would have been and you have taught the Commons what you think of them.', effects: { gold: 40, worldConditions: { publicOrder: -5, prosperity: -2 }, faction: { factionId: 'commons', playerStanding: -6 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE WEIGHT OF THE CROWN · THE WAR OR THE REALM',
      text: 'The claim abroad is genuinely good and pressing it will take every penny raised for a decade. {{contact.name}} has the two accounts side by side and will not say which one to choose.',
      choices: [
        { id: 'duty', label: 'Abandon the claim and spend it at home', text: 'You give up a legitimate claim and are called a coward in three chronicles. The roads are repaired, the coinage is sound, and nobody writes about that at all.', effects: { faith: 6, wits: 6, worldConditions: { prosperity: 6, publicOrder: 4, warThreat: -5 }, reputation: -4, storyVariables: { resolution: 'duty' } }, tone: 'good' },
        { id: 'ambition', label: 'Press the claim', text: 'You summon the retinue and fund the opening campaign. The court applauds your resolve, while levies and requisitions leave the realm poorer and food supplies strained.', effects: { reputation: 12, rankProgress: 10, worldConditions: { warThreat: 6, prosperity: -6, foodSecurity: -3 }, storyVariables: { resolution: 'ambition' } }, tone: 'plain' },
      ],
    },
    '5_duty': {
      title: 'THE WEIGHT OF THE CROWN · A DULL AND SOLVENT REIGN',
      text: 'The chronicles give your reign four lines and none of them are interesting. The realm is solvent, quiet, and rather better off than it was, which is not a thing chroniclers count.',
      choices: [
        { id: 'accept_ending', label: 'Take the four lines', text: 'You accept the short account and return to the council’s work. Sound coinage and repaired roads have brought the realm more benefit than a flattering chronicle.', effects: { faith: 6, wits: 5, familyReputation: { delta: 5 }, worldConditions: { prosperity: 4, publicOrder: 4 }, memory: { tag: 'the_dull_solvent_reign', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_ambition': {
      title: 'THE WEIGHT OF THE CROWN · THE CHRONICLE ENTRY',
      text: 'A chronicler offers nineteen pages and a woodcut celebrating your rule. Outside the court, the cost of those campaigns weighs on the realm.',
      choices: [
        { id: 'accept_ending', label: 'Take the nineteen pages', text: 'They are magnificent pages. The county paying for the campaigns owns no copy of the chronicle, and its hardship continues.', effects: { reputation: 12, rankProgress: 8, worldConditions: { prosperity: -3, warThreat: 3 }, familyReputation: { delta: 2 }, memory: { tag: 'the_chronicle_entry', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  outlaw: {
    1: {
      title: 'HONOUR AMONG THIEVES · THE FIRST RULE OF THE BAND',
      text: '{{contact.name}} says the band needs a rule about what is not taken, and needs it before the first job rather than after the first mistake.',
      choices: [
        { id: 'code', label: 'Nothing from a household that works the land', text: 'It halves what is available and it means four villages will feed you rather than name you. It is the single most useful decision the band ever makes.', effects: { charm: 5, wits: 4, faction: { factionId: 'outlaws', playerStanding: 4 }, worldConditions: { publicOrder: -1 } }, tone: 'good' },
        { id: 'terror', label: 'Everything is taken from everybody', text: 'No rule, no argument, no limit. It is extremely profitable for fifteen months and the countryside turns out for the hue and cry in the twelfth.', effects: { gold: 22, legal: { suspicion: 6, notoriety: 3 }, worldConditions: { publicOrder: -4 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'HONOUR AMONG THIEVES · THE MAN WHO CANNOT KEEP QUIET',
      text: 'One of the band talks in alehouses. Everybody knows it, nobody has raised it, and {{contact.name}} raises it in front of all of them and then looks at you.',
      choices: [
        { id: 'code', label: 'Put him out of the band and see him settled', costGold: 14, text: 'He is out, with a share and a place found for him forty miles off. It costs money and it means nobody in the band ever fears being killed by it.', effects: { gold: -14, charm: 6, faction: { factionId: 'outlaws', playerStanding: 4 }, legal: { suspicion: 3 } }, tone: 'good' },
        { id: 'terror', label: 'Make an example of him', text: 'It is done in front of the band and it is entirely effective. Nobody talks in an alehouse again and three men leave inside a month.', effects: { legal: { suspicion: 8, notoriety: 4 }, faith: -7, charm: -3, worldConditions: { publicOrder: -3 } }, tone: 'bad' },
      ],
    },
    3: {
      title: 'HONOUR AMONG THIEVES · A PARDON FOR SERVICE',
      text: 'The Crown is offering pardons to outlaws who will serve in the array. It is a genuine offer, it is a genuine war, and roughly half of the men who take it do not come back.',
      choices: [
        { id: 'code', label: 'Put it to the whole band and let each choose', text: 'Six take it and five stay. You make sure the six leave with a share and the five are told exactly why the six went.', effects: { charm: 6, faith: 4, faction: { factionId: 'outlaws', playerStanding: 3 }, worldConditions: { warThreat: 1 } }, tone: 'good' },
        { id: 'terror', label: 'Forbid it and keep the band whole', text: 'Nobody takes the pardon because nobody dares. The band is at full strength and every man in it now knows what he is not allowed to want.', effects: { legal: { notoriety: 3 }, gold: 12, faction: { factionId: 'outlaws', playerStanding: 5 }, faith: -4 }, tone: 'plain' },
      ],
    },
    4: {
      title: 'HONOUR AMONG THIEVES · THE SHERIFF OFFERS TERMS',
      text: 'The sheriff offers you personally a pardon, a small office and a quiet life, on condition you deliver the band. {{contact.name}} does not know the offer has been made.',
      choices: [
        { id: 'duty', label: 'Refuse, and tell the band it was offered', text: 'You tell them what was offered and what you said. Some remain doubtful, but showing them the terms earns a measure of trust.', effects: { faith: 6, charm: 6, faction: { factionId: 'outlaws', playerStanding: 6 }, legal: { notoriety: 2 }, storyVariables: { resolution: 'duty' } }, tone: 'good' },
        { id: 'ambition', label: 'Take the terms', text: 'Five men taken in one night on your word, a pardon under seal, and an office worth four pounds a year. Every part of it is honoured exactly as agreed.', effects: { gold: 30, rankProgress: 12, legal: { suspicion: -10, status: 'free' }, faction: { factionId: 'crown', playerStanding: 6 }, faith: -8, storyVariables: { resolution: 'ambition' } }, tone: 'bad' },
      ],
    },
    '5_duty': {
      title: 'HONOUR AMONG THIEVES · THE BAND THAT HELD',
      text: 'The band meets again with its members still free and its agreement intact. Your refusal has given them a reason to trust one another.',
      choices: [
        { id: 'accept_ending', label: 'Renew the agreement', text: 'The band renews its agreement: nobody is to be sold for a pardon. They share supplies and information, giving one another a better chance of staying free.', effects: { charm: 6, faith: 5, faction: { factionId: 'outlaws', playerStanding: 5 }, familyReputation: { delta: 2 }, memory: { tag: 'the_band_that_held', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_ambition': {
      title: 'HONOUR AMONG THIEVES · THE OFFICE AND THE QUIET LIFE',
      text: 'The pardon is honoured, the office is real, and the quiet life is exactly as promised. It is a good outcome by every measure that can be written in a roll.',
      choices: [
        { id: 'accept_ending', label: 'Accept the official settlement', text: 'The authorities pay the agreed settlement and publicly accept your cooperation. Your household benefits; your former companions keep their distance.', effects: { gold: 24, rankProgress: 10, householdState: { wealth: 5, status: 3 }, faction: { factionId: 'outlaws', playerStanding: -8 }, memory: { tag: 'the_office_and_the_quiet_life', weight: 5 } }, tone: 'plain' },
      ],
    },
  },
};
