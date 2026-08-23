import { ChainSpec } from './types';

export const HOUSEHOLD_CHAINS: ChainSpec[] = [
  {
    id: 'winter_roof',
    domain: 'household',
    minAge: 10,
    beats: [
      {
        title: 'THE THATCH WILL NOT SEE ANOTHER WINTER',
        text: '{{other.name}} pushes a thumb through the thatch above the hearth end and it goes in to the knuckle. There are seven weeks to Martinmas and a thatcher wants nine shillings.',
        choices: [
          { id: 'pay_thatcher', label: 'Pay the thatcher properly (9g)', costGold: 9, text: 'Nine shillings, three days, and new reed over the whole hearth end. It is the correct decision and it empties the purse before winter.', effects: { gold: -9, householdState: { quality: 6 }, health: 3, memory: { tag: 'paid_the_thatcher', weight: 3 } }, tone: 'good' },
          { id: 'patch_it', label: 'Patch it yourself with what you have', text: 'Two days on the roof with old reed and borrowed spars. It will hold. It will hold in the way that things hold when you are the one who fixed them.', effects: { health: -4, wits: 3, householdState: { quality: 2 }, memory: { tag: 'patched_the_roof_yourself', weight: 3 } }, tone: 'plain' },
          { id: 'leave_it', label: 'Move the bed and leave it', text: 'You shift the beds to the dry end and put a pot under the wet one. Everybody sleeps in one room until March and nobody says a word about it.', effects: { householdState: { quality: -3 }, health: -3, gold: 4, memory: { tag: 'left_the_roof_till_spring', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'ROT UNDER A RECENT REPAIR',
        text: 'The carpenter strips back the hearth end and finds the main tie-beam soft as bread. Somebody patched over this within living memory and charged for a sound repair.',
        choices: [
          { id: 'find_him', label: 'Find out who did it and make him pay', text: 'It was the man who is now the churchwarden. He pays for the beam rather than have it discussed, and he is never civil to you again.', effects: { gold: 8, wits: 5, reputation: 3, faction: { factionId: 'church', playerStanding: -3 }, memory: { tag: 'made_the_churchwarden_pay', weight: 4 } }, tone: 'good' },
          { id: 'new_beam', label: 'Buy the beam and say nothing (16g)', costGold: 16, text: 'Sixteen shillings for oak and two men to raise it. The house will stand for two hundred years and nobody will ever know why it needed to.', effects: { gold: -16, householdState: { quality: 8 }, memory: { tag: 'replaced_the_tie_beam', weight: 4 } }, tone: 'plain' },
          { id: 'prop_it', label: 'Prop it and hope', text: 'A post under the beam and a prayer. It holds for thirteen years. Nobody who signed it expected five.', effects: { householdState: { quality: -2 }, gold: 12, faith: 2, memory: { tag: 'propped_the_rotten_beam', weight: 4, note: 'The main beam of your house is rotten and propped.' } }, tone: 'plain' },
        ],
      },
      {
        title: 'RAIN IN THE BEDDING',
        text: 'A week of rain comes through before the work is done and ruins the stored bedding. Two households are now sharing one dry room and both have opinions about who sleeps nearest the fire.',
        choices: [
          { id: 'give_place', label: 'Give up your own place by the fire', text: 'You sleep by the door for six weeks and take a cough that lasts into April. The other household never forgets which side of the room you chose.', effects: { health: -6, faith: 4, boundKinRel: { role: 'other', delta: 14 }, faction: { factionId: 'commons', playerStanding: 3 }, memory: { tag: 'gave_up_the_fire', weight: 4 } }, tone: 'good' },
          { id: 'draw_lots', label: 'Draw lots for it each week', text: 'A rota, drawn publicly, changed every Sunday. It is fair, everybody grumbles about it, and there is not one serious quarrel all winter.', effects: { charm: 5, wits: 3, householdState: { quality: 2 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'drew_lots_for_the_hearth', weight: 3 } }, tone: 'good' },
          { id: 'keep_it', label: 'Keep your place; it is your roof', text: 'It is your roof, factually. You are warm all winter and the arrangement is discussed in the lane for considerably longer than the winter lasts.', effects: { health: 3, boundKinRel: { role: 'other', delta: -10 }, faction: { factionId: 'commons', playerStanding: -3 }, memory: { tag: 'kept_the_fire_for_yourself', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE TIMBER GOES TO THE LORD’S GRANARY',
        text: 'The oak promised to your roof is diverted to repair the lord’s granary. The steward is apologetic and entirely immovable, and the carpenter is stood in your yard with nothing to raise.',
        choices: [
          { id: 'petition', label: 'Petition the steward at the hallmote', text: 'You cite the custom of the manor on timber-right for repairs. It is real, and he had plainly assumed nobody in Swineford could quote it. Half the oak comes back.', effects: { wits: 6, charm: 3, householdState: { quality: 5 }, faction: { factionId: 'crown', playerStanding: -2 }, memory: { tag: 'quoted_the_timber_right', weight: 5, note: 'You quoted manorial custom at the steward and got your timber back.' } }, tone: 'good' },
          { id: 'buy_elsewhere', label: 'Buy timber from the next parish (18g)', costGold: 18, text: 'Eighteen shillings and a two-day haul. The roof is finished a fortnight before Martinmas and the purse is emptier than it has been in years.', effects: { gold: -18, householdState: { quality: 7 }, memory: { tag: 'bought_timber_elsewhere', weight: 4 } }, tone: 'plain' },
          { id: 'take_it', label: 'Take what you need off the granary pile at night', text: 'Three spars, moved after dark, from a pile of forty. Nobody counts them and you spend the next five years expecting somebody to.', effects: { householdState: { quality: 5 }, legal: { suspicion: 6 }, path: { outlaw: 2 }, memory: { tag: 'took_the_lords_timber', weight: 5 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'granary_rats',
    domain: 'household',
    minAge: 8,
    beats: [
      {
        title: 'THE SACKS COME UP LIGHT',
        text: '{{other.name}} finds three sacks gnawed open at the seam. The loss is larger than any rat could account for, and the granary door has a good lock on it.',
        choices: [
          { id: 'set_traps', label: 'Set traps and count every sack weekly', text: 'You catch nine rats and establish, by arithmetic, that the rats account for about a third of it. The other two-thirds have a key.', effects: { wits: 6, householdState: { food: 2 }, memory: { tag: 'counted_the_granary_sacks', weight: 4 } }, tone: 'plain' },
          { id: 'blame_rats', label: 'Blame the rats and get a better cat', text: 'A good mouser from the mill, fed on scraps, worth every one of them. The loss halves and the half that remains keeps quietly happening.', effects: { householdState: { food: 3 }, charm: 2, memory: { tag: 'got_a_mouser', weight: 3 } }, tone: 'plain' },
          { id: 'watch_at_night', label: 'Sit in the granary all night', text: 'Four nights in the cold before you see who has the key. You know, now, and knowing turns out to be considerably harder than not knowing was.', effects: { health: -4, wits: 5, revealSecretOf: 'other', memory: { tag: 'saw_who_had_the_key', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A CHILD CARRYING FLOUR AT DUSK',
        text: 'A child is stopped in the lane with flour under a coat, going to a household that has had nothing since Tuesday. The child is nine and does not attempt to lie about it.',
        choices: [
          { id: 'send_more', label: 'Fill the coat properly and send them on', text: 'You put a full measure in and walk them to the door yourself. Four households know by morning and two of them start doing the same.', effects: { householdState: { food: -4 }, faith: 5, faction: { factionId: 'commons', playerStanding: 5 }, worldConditions: { foodSecurity: 1 }, memory: { tag: 'filled_the_childs_coat', weight: 5 } }, tone: 'good' },
          { id: 'to_the_reeve', label: 'Take the child to the reeve', text: 'The reeve is obliged to record it and does so with visible reluctance. The child is amerced twopence their family cannot pay, and everyone involved feels precisely as bad as they should.', effects: { reputation: -4, faction: { factionId: 'commons', playerStanding: -6 }, worldConditions: { publicOrder: 1 }, faith: -4, memory: { tag: 'took_the_child_to_the_reeve', weight: 5 } }, tone: 'bad' },
          { id: 'send_home_empty', label: 'Take the flour back and say nothing', text: 'The child goes home with an empty coat. Nothing is recorded, nothing is said, and nothing is eaten in that house until Friday.', effects: { householdState: { food: 2 }, faith: -3, memory: { tag: 'took_back_the_flour', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'DAMP GRAIN BEHIND A NEW WALL',
        text: 'Somebody has walled up a section of the granary with grain still damp behind it. By the time the smell reaches the yard, a quarter of the winter store has gone to mould.',
        choices: [
          { id: 'open_it', label: 'Break the wall out and salvage what is sound', text: 'Two days of shovelling and sorting in a stench that gets into your clothes. You save rather more than anyone expected and lose the rest.', effects: { health: -4, householdState: { food: -3 }, wits: 4, memory: { tag: 'salvaged_the_walled_grain', weight: 4 } }, tone: 'plain' },
          { id: 'sell_it', label: 'Sell the doubtful sacks at market', text: 'It goes at a good price to a buyer three villages off who does not open the sacks in your presence. You are paid and you are not proud of it.', effects: { gold: 12, faith: -5, legal: { suspicion: 4 }, worldConditions: { diseasePressure: 2 }, memory: { tag: 'sold_the_mouldy_grain', weight: 5, note: 'You sold spoiled grain at market to a buyer three villages away.' } }, tone: 'bad' },
          { id: 'burn_it', label: 'Burn the lot in the yard', text: 'A quarter of the winter store, on a fire, in front of the household. Nobody in Swineford is poisoned that year and nobody in your house forgives you until March.', effects: { householdState: { food: -6 }, faith: 5, worldConditions: { diseasePressure: -2 }, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'burned_the_spoiled_grain', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE RECKONING AT WINTER’S END',
        text: 'The household counts what is left in March: what was eaten, what was stolen, what was shared out and what was quietly saved. All four numbers are known and only two of them are ever said aloud.',
        choices: [
          { id: 'say_all_four', label: 'Say all four numbers out loud', text: 'You read the whole account to the household including the sharing and the theft. It is a difficult evening and the granary is never short again.', effects: { wits: 5, familyReputation: { delta: 3 }, householdState: { food: 3 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'read_the_whole_granary_account', weight: 5 } }, tone: 'good' },
          { id: 'say_two', label: 'Say the two that are easy', text: 'Eaten and spoiled. The other two numbers stay in your head, where they go on being true and go on being expensive.', effects: { charm: 3, householdState: { food: 1 }, createSecret: { type: 'hidden_debt', severity: 25, knownByIds: [] }, memory: { tag: 'kept_two_numbers_back', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'neighbours_fire',
    domain: 'household',
    minAge: 8,
    beats: [
      {
        title: 'SPARKS ON YOUR OWN THATCH',
        text: '{{other.name}} is in the lane shouting that the roof next door is gone. The wind is coming your way and there are already sparks landing on your thatch.',
        choices: [
          { id: 'wet_your_roof', label: 'Wet your own roof first', text: 'Every bucket in the house onto your own thatch. Your roof survives, theirs does not, and both of those facts are noted in the lane.', effects: { householdState: { quality: 2 }, health: -3, faction: { factionId: 'commons', playerStanding: -3 }, memory: { tag: 'wet_your_own_roof_first', weight: 4 } }, tone: 'plain' },
          { id: 'pull_it_down', label: 'Pull the burning roof down with hooks', text: 'You get the fire-hooks off the church wall and drag the whole roof into the lane. It is the right answer, it saves the row, and it takes the skin off your hands.', effects: { health: -7, reputation: 6, faction: { factionId: 'commons', playerStanding: 5 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'pulled_down_the_burning_roof', weight: 5 } }, tone: 'good' },
          { id: 'get_people_out', label: 'Get the people out and let it burn', text: 'Three children and an old man out through the smoke, and the row goes up behind you. Everyone lives. Nothing else does.', effects: { health: -5, faith: 6, boundKinRel: { role: 'other', delta: 14 }, householdState: { quality: -4 }, memory: { tag: 'got_them_out_of_the_fire', weight: 5 } }, tone: 'good' },
        ],
      },
      {
        title: 'THREE HOUSEHOLDS, TWO ROOMS',
        text: 'The fire is out. Three households now have between them two rooms with roofs on, and the frost is a fortnight off.',
        choices: [
          { id: 'take_them_in', label: 'Take a household into your own room', text: 'Six people where six lived. The food goes twice as fast, nobody sleeps well, and not one of them is out of doors when the frost comes.', effects: { householdState: { food: -6, capacity: 2 }, faith: 5, faction: { factionId: 'commons', playerStanding: 5 }, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'took_in_the_burnt_out', weight: 5 } }, tone: 'good' },
          { id: 'rent_it', label: 'Let out your byre at a fair rent', text: 'A penny a week for the byre, which is honest, sheltered and cold. They take it and they pay it and something between you never quite comes back.', effects: { gold: 8, householdState: { wealth: 2 }, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'rented_out_the_byre', weight: 4 } }, tone: 'plain' },
          { id: 'church_house', label: 'Get the church house opened for them', text: 'You badger the churchwardens until they open the church house, which has stood empty for six years for no reason anybody can defend.', effects: { charm: 6, wits: 4, faction: { factionId: 'church', playerStanding: -2 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'opened_the_church_house', weight: 5 } }, tone: 'good' },
        ],
      },
      {
        title: 'A STRONGBOX IN THE ASHES',
        text: 'Raking the burnt row turns up a small iron box with fifteen shillings and a ring in it. Nobody living in that row will admit to owning it, which is the most interesting thing about the box.',
        choices: [
          { id: 'cry_it', label: 'Have it cried in church three Sundays', text: 'Three Sundays and no claimant. It goes to the parish chest for the rebuilding, lawfully, and everybody knows you could have kept it.', effects: { faith: 6, reputation: 5, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'cried_the_strongbox', weight: 5 } }, tone: 'good' },
          { id: 'keep_it', label: 'Keep it', text: 'Nine shillings and a ring you never wear. Whoever it belonged to knows it was in that row, and one day may work out who did the raking.', effects: { gold: 11, legal: { suspicion: 4 }, faith: -4, createSecret: { type: 'stolen_property', severity: 40, knownByIds: [] }, memory: { tag: 'kept_the_strongbox', weight: 5 } }, tone: 'plain' },
          { id: 'split_it', label: 'Split it between the three households', text: 'Three shillings and eightpence each and the ring drawn for. It is not lawful and nobody in that lane ever raises the point.', effects: { charm: 5, faction: { factionId: 'commons', playerStanding: 5 }, legal: { suspicion: 2 }, boundKinRel: { role: 'other', delta: 10 }, memory: { tag: 'split_the_strongbox', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'WHO GETS A ROOF FIRST',
        text: 'The rebuilding begins and there is timber for one house before the frost. The poorest of the three families has the most children and the least claim on anybody.',
        choices: [
          { id: 'poorest_first', label: 'The poorest family first', text: 'They are under a roof by Martinmas. The other two wait until spring and say, mostly, that it was right, and mean it, mostly.', effects: { faith: 6, reputation: 5, faction: { factionId: 'commons', playerStanding: 6 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'poorest_roofed_first', weight: 5, note: 'You had the poorest burnt-out family roofed before the others.' } }, tone: 'good' },
          { id: 'who_can_pay', label: 'Whoever can pay toward the timber', text: 'The family that can find twelve shillings is roofed first, which is how it is normally done and is the reason the poorest family is the poorest family.', effects: { gold: 8, householdState: { wealth: 2 }, faction: { factionId: 'commons', playerStanding: -3 }, memory: { tag: 'roofed_whoever_could_pay', weight: 4 } }, tone: 'plain' },
          { id: 'share_out', label: 'Split the timber three ways and rough-roof all three', text: 'Three bad roofs instead of one good one. All three leak, all three stand, and nobody spends the winter in somebody else’s byre.', effects: { wits: 5, householdState: { quality: -2 }, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'three_bad_roofs', weight: 5 } }, tone: 'good' },
        ],
      },
    ],
  },
];
