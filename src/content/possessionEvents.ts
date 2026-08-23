import { GameEvent } from '@/types/game';
import { C } from '@/theme/theme';

/**
 * Events that only exist because you own the thing.
 *
 * Shop items used to be a one-off stat bump and nothing else: nothing in the
 * world ever noticed you had a destrier, a relic or a bound ledger. These are
 * gated on `hasItems`, so buying a thing quietly opens a door in the content
 * that stays open for the rest of the life.
 */
export const POSSESSION_EVENTS: GameEvent[] = [
  {
    id: 'own_falcon_bishop',
    category: 'court',
    domain: 'politics',
    title: 'THE BISHOP ADMIRES THY FALCON',
    text: 'The bishop stops mid-procession to admire your hunting falcon, and asks its breeding in a tone that is not entirely about birds.',
    ageMin: 16,
    requires: { hasItems: ['falcon'] },
    cooldownYears: 20,
    choices: [
      { id: 'gift', label: 'Give him the falcon', outcome: { text: 'He is delighted and slightly embarrassed, and a bishop in that condition is worth a great deal. Your name reaches the diocese before you do.', effects: { charm: 5, reputation: 6, faction: { factionId: 'church', playerStanding: 6 }, removeTags: [], memory: { tag: 'gave_the_bishop_a_falcon', weight: 4 } }, tone: 'good' } },
      { id: 'fly_it', label: 'Fly her for him instead', outcome: { text: 'She takes a heron in front of the whole procession. The bishop talks about it for years and never once offers to buy her.', effects: { charm: 7, reputation: 5, faction: { factionId: 'church', playerStanding: 3 }, memory: { tag: 'flew_the_falcon_for_a_bishop', weight: 4 } }, tone: 'good' } },
      { id: 'price', label: 'Name a price', outcome: { text: 'He pays it without blinking, which tells you the price was too low. You have coin and he has a story about a grasping fellow from Swineford.', effects: { gold: 26, reputation: -4, faction: { factionId: 'church', playerStanding: -3 }, memory: { tag: 'sold_the_bishop_a_falcon', weight: 4 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'own_destrier_muster',
    category: 'knight',
    domain: 'politics',
    title: 'A HORSE WORTH TAKING',
    text: 'The muster clerk looks at your destrier, then at his roll, and informs you that a man with a warhorse serves mounted, at his own cost, for twice the term.',
    ageMin: 18,
    requires: { hasItems: ['warhorse'] },
    cooldownYears: 18,
    choices: [
      { id: 'serve', label: 'Serve mounted and be seen doing it', outcome: { text: 'You ride out at the head of the Swineford contingent, which is four men and a cart. It is absurd and it is remembered.', effects: { rankProgress: 16, reputation: 6, health: -6, path: { martial: 3 }, faction: { factionId: 'crown', playerStanding: 4 }, memory: { tag: 'served_mounted', weight: 4 } }, tone: 'good' } },
      { id: 'stable', label: 'Swear the horse is lame', outcome: { text: 'You keep the horse and the clerk keeps a note. Both of you know the horse is sound and neither of you says so.', effects: { wits: 4, legal: { suspicion: 4 }, faction: { factionId: 'crown', playerStanding: -3 }, memory: { tag: 'hid_a_sound_warhorse', weight: 4 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'own_relic_pilgrims',
    category: 'faith',
    domain: 'rare',
    title: 'THEY HAVE HEARD ABOUT THE RELIC',
    text: 'Three pilgrims are at your gate before Prime, having walked from Ely on the strength of a rumour about what you keep in your house.',
    ageMin: 14,
    requires: { hasItems: ['relic'] },
    cooldownYears: 12,
    choices: [
      { id: 'let_them', label: 'Let them see it, and take nothing', outcome: { text: 'They stay an hour and leave weeping. By Lammas there are thirty of them, and by Michaelmas the road past your door is a road.', effects: { faith: 7, reputation: 6, worldConditions: { prosperity: 2, diseasePressure: 2 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'opened_the_house_to_pilgrims', weight: 4 } }, tone: 'good' } },
      { id: 'charge', label: 'Ask a penny a head', outcome: { text: 'They pay it. Word of the penny travels exactly as fast as word of the relic, and arrives in the same conversation.', effects: { gold: 16, faith: -3, reputation: -3, householdState: { wealth: 3 }, memory: { tag: 'charged_pilgrims_at_the_gate', weight: 4 } }, tone: 'plain' } },
      { id: 'refuse', label: 'Send them on to the abbey', outcome: { text: 'You point them up the road and shut the gate. They go, and they tell the abbey where they were sent from.', effects: { faith: 2, wits: 3, faction: { factionId: 'church', playerStanding: 2 }, memory: { tag: 'sent_the_pilgrims_on', weight: 3 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'own_ledger_accounts',
    category: 'peasant',
    domain: 'career',
    title: 'A MAN WHO KEEPS A LEDGER',
    text: 'Word has got round that you keep written accounts. The reeve arrives with a box of tallies, an apologetic expression, and no intention of leaving with the box.',
    ageMin: 14,
    requires: { hasItems: ['ledger'] },
    cooldownYears: 14,
    choices: [
      { id: 'do_it', label: 'Do the parish accounts', outcome: { text: 'Nine evenings of somebody else’s arithmetic. You find two errors in the parish’s favour and one very much not, and you report both.', effects: { wits: 6, reputation: 6, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'kept_the_parish_accounts', weight: 4 } }, tone: 'good' } },
      { id: 'charge', label: 'Do them for a fee', outcome: { text: 'Four shillings and the work is done properly. The reeve pays and thereafter treats you as a tradesman rather than a neighbour.', effects: { gold: 10, wits: 4, faction: { factionId: 'commons', playerStanding: -2 }, memory: { tag: 'charged_for_the_accounts', weight: 3 } }, tone: 'plain' } },
      { id: 'cook_them', label: 'Do them, and improve them', outcome: { text: 'The accounts balance beautifully and two of the entries are yours. It will hold until somebody else learns to read a tally.', effects: { gold: 20, legal: { suspicion: 6 }, wits: 5, createSecret: { type: 'hidden_debt', severity: 45, knownByIds: [] }, memory: { tag: 'cooked_the_parish_accounts', weight: 5 } }, tone: 'bad' } },
    ],
  },
  {
    id: 'own_millstone_toll',
    category: 'peasant',
    domain: 'household',
    title: 'A STONE OF THINE OWN',
    text: 'Your own millstone means your own flour, and half the lane has worked that out. They arrive with sacks and a hopeful manner.',
    ageMin: 12,
    requires: { hasItems: ['millstone'] },
    cooldownYears: 12,
    choices: [
      { id: 'free', label: 'Grind for them, and take no toll', outcome: { text: 'You grind for nine households and take nothing. The miller hears about it within the day and is not amused.', effects: { faith: 5, householdState: { food: -2 }, faction: { factionId: 'commons', playerStanding: 6 }, worldConditions: { foodSecurity: 2 }, memory: { tag: 'ground_for_the_lane_free', weight: 4 } }, tone: 'good' } },
      { id: 'toll', label: 'Take a toll, honestly measured', outcome: { text: 'A twentieth, measured in front of them. The mill takes a tenth and everybody knows it, so you are paid and nobody feels robbed.', effects: { gold: 9, householdState: { food: 4 }, faction: { factionId: 'commons', playerStanding: 3 }, memory: { tag: 'took_an_honest_toll', weight: 4 } }, tone: 'good' } },
      { id: 'refuse', label: 'It is your stone', outcome: { text: 'You shut the door on them. It is entirely your stone and they go back to the mill, past your house, every week, for years.', effects: { householdState: { food: 3 }, faction: { factionId: 'commons', playerStanding: -5 }, memory: { tag: 'kept_the_stone_to_yourself', weight: 4 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'own_plague_mask_called',
    category: 'plague',
    domain: 'health',
    title: 'THE ONE WITH THE MASK',
    text: 'Sickness is in the row by the ford and you own the only beaked mask in the parish, which in everyone else’s eyes makes you the nearest thing Swineford has to a physician.',
    ageMin: 14,
    requires: { hasItems: ['plague_mask'], worldAtLeast: { diseasePressure: 40 } },
    cooldownYears: 10,
    choices: [
      { id: 'go_in', label: 'Put it on and go in', outcome: { text: 'The mask does nothing at all and the vinegar-soaked rag inside it may do a little. You bring four people through and take a cough that lasts till spring.', effects: { health: -9, faith: 7, reputation: 7, worldConditions: { diseasePressure: -3 }, faction: { factionId: 'commons', playerStanding: 6 }, memory: { tag: 'went_in_wearing_the_mask', weight: 5 } }, tone: 'plain' } },
      { id: 'lend', label: 'Lend it to the herb-wife', outcome: { text: 'She takes it without comment and uses it for nine years. You never get it back and never ask.', effects: { faith: 5, worldConditions: { diseasePressure: -2 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'lent_the_mask', weight: 4 } }, tone: 'good' } },
      { id: 'keep', label: 'Keep it, and keep indoors', outcome: { text: 'You are well all season. The lane knows exactly what is hanging on your door and exactly who did not come.', effects: { health: 3, faction: { factionId: 'commons', playerStanding: -6 }, reputation: -4, memory: { tag: 'kept_the_mask_indoors', weight: 5 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'own_sword_expected',
    category: 'knight',
    domain: 'crime',
    title: 'A MAN WITH A SWORD IS ASKED',
    text: 'A carter is being beaten in the market by two men over a debt. You are wearing a sword, which the whole market has noticed, and which changes what standing still means.',
    ageMin: 15,
    requires: { hasItems: ['sword'] },
    cooldownYears: 10,
    choices: [
      { id: 'draw', label: 'Draw it', outcome: { text: 'They go. Nobody is cut and everybody saw the steel come out, and you will be answering for that at the tourn.', effects: { charm: 5, reputation: 6, legal: { suspicion: 4 }, path: { martial: 2 }, faction: { factionId: 'commons', playerStanding: 5 }, memory: { tag: 'drew_in_the_market', weight: 5 } }, tone: 'plain' } },
      { id: 'hilt', label: 'Put a hand on the hilt and say nothing', outcome: { text: 'They look at the hand, then at your face, and decide the debt can wait. Not one word is spoken and it works completely.', effects: { charm: 7, wits: 4, reputation: 4, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'the_hand_on_the_hilt', weight: 4 } }, tone: 'good' } },
      { id: 'walk', label: 'Walk on', outcome: { text: 'You walk on wearing a sword past a man being beaten. The market watches you do it and draws the obvious conclusion.', effects: { reputation: -7, faith: -3, faction: { factionId: 'commons', playerStanding: -5 }, memory: { tag: 'walked_on_wearing_a_sword', weight: 5 } }, tone: 'bad' } },
    ],
  },
  {
    id: 'own_hound_poaching',
    category: 'peasant',
    domain: 'crime',
    title: 'THE FORESTER LOOKS AT THY HOUND',
    text: 'The forester stops you on the coppice road and looks a long time at your hunting hound. Under forest law a dog that can run down a deer must be lawed: three claws off the forefoot.',
    ageMin: 14,
    requires: { hasItems: ['hunting_hound'] },
    cooldownYears: 15,
    choices: [
      { id: 'law_it', label: 'Have the dog lawed', outcome: { text: 'It is done at the next swanimote with a mallet and a chisel. The dog lives, limps, and never runs anything down again.', effects: { faith: 3, legal: { suspicion: -4 }, faction: { factionId: 'crown', playerStanding: 3 }, charm: -3, memory: { tag: 'had_the_hound_lawed', weight: 4 } }, tone: 'plain' } },
      { id: 'pay', label: 'Pay the fine instead (12g)', costGold: 12, outcome: { text: 'Twelve shillings buys the dog its claws and buys the forester a new opinion of your purse. He will be back.', effects: { gold: -12, faction: { factionId: 'crown', playerStanding: 1 }, memory: { tag: 'paid_to_spare_the_hound', weight: 4 } }, tone: 'plain' } },
      { id: 'hide', label: 'Keep the dog out of the wood', outcome: { text: 'The hound never goes near the coppice again and neither do you. It is a small life for a good dog and it keeps all four feet.', effects: { wits: 4, legal: { suspicion: 2 }, faction: { factionId: 'outlaws', playerStanding: 2 }, memory: { tag: 'kept_the_hound_from_the_wood', weight: 4 } }, tone: 'plain' } },
    ],
  },
];
