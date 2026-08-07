import { ChainSpec } from './types';

export const FAMILY_CHAINS: ChainSpec[] = [
  {
    id: 'broken_betrothal',
    domain: 'family',
    minAge: 12,
    beats: [
      {
        title: 'AT THE CHURCH DOOR',
        text: '{{other.name}} asks you to stand witness while two households marry off children who have met twice. The dowry is read out at the porch: eight ewes, a brass pot, and four shillings at Michaelmas.',
        choices: [
          { id: 'witness', label: 'Stand witness and say the words', text: 'You say the words. Four households now consider you party to the bargain. In Swineford that is as binding as a seal and rather harder to break.', effects: { charm: 3, boundKinRel: { role: 'other', delta: 6 }, familyReputation: { delta: 2 }, memory: { tag: 'witnessed_the_betrothal', weight: 3, note: 'You stood witness at a betrothal made between households, not people.' } }, tone: 'plain' },
          { id: 'ask_consent', label: 'Ask aloud whether the bride consents', text: 'The porch goes quiet. Canon law is on your side and nobody in the lane thanks you for it. She says yes, eventually, and everyone hears how long it took.', effects: { faith: 5, charm: -4, boundKinRel: { role: 'other', delta: -4 }, faction: { factionId: 'church', playerStanding: 2 }, memory: { tag: 'asked_if_she_consented', weight: 4 } }, tone: 'plain' },
          { id: 'refuse', label: 'Refuse to put your name to it', text: 'You walk back up the lane. They find another witness inside the hour, and remember that they had to.', effects: { reputation: -3, boundKinRel: { role: 'other', delta: -7 }, familyReputation: { delta: -1 }, memory: { tag: 'refused_the_betrothal_witness', weight: 3 } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE FOUR SHILLINGS THAT NEVER CAME',
        text: 'Michaelmas passes and the four shillings do not appear. {{other.name}} is fairly sure an uncle used them to settle an older debt, and has begun praying about providence at considerable volume.',
        choices: [
          { id: 'cover_it', label: 'Quietly make up the shortfall (4g)', costGold: 4, text: 'You put four shillings on the table and let them believe it came from the uncle. Two people know otherwise, and one of them is the uncle.', effects: { gold: -4, boundKinRel: { role: 'other', delta: 12 }, familyReputation: { delta: 2 }, memory: { tag: 'paid_anothers_dowry', weight: 4, note: 'You secretly paid a dowry that was owed by somebody else.' } }, tone: 'good' },
          { id: 'name_him', label: 'Name the uncle at the hallmote', text: 'You say it in front of the steward. The uncle is amerced sixpence and swears he will remember your face longer than the debt.', effects: { reputation: 4, wits: 3, boundKinRel: { role: 'other', delta: 5 }, faction: { factionId: 'commons', playerStanding: 2 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'named_the_uncle_at_the_hallmote', weight: 4 } }, tone: 'plain' },
          { id: 'silence', label: 'Let them work it out themselves', text: 'You say nothing. They work it out in March, badly, in front of the whole lane.', effects: { wits: 2, boundKinRel: { role: 'other', delta: -4 }, familyReputation: { delta: -1 }, memory: { tag: 'kept_the_dowry_silence', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'ONE DOOR BARRED',
        text: 'The bride’s people demand the marriage go ahead. The groom’s people have barred their door and are shouting the missing shillings through it. {{other.name}} is stood in the lane between them holding the brass pot.',
        choices: [
          { id: 'broker', label: 'Broker a smaller dowry before witnesses', text: 'Six ewes, the pot, and the shillings forgiven. Both households sign because you made it hard to refuse in public.', effects: { charm: 6, wits: 3, boundKinRel: { role: 'other', delta: 8 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'brokered_the_lesser_dowry', weight: 4 } }, tone: 'good' },
          { id: 'church_court', label: 'Send it to the church court', text: 'The consistory court will hear it at Easter, or the Easter after. The bride will be nineteen by then and the pot will have been sold.', effects: { faith: 4, faction: { factionId: 'church', playerStanding: 3 }, boundKinRel: { role: 'other', delta: -3 }, memory: { tag: 'sent_the_betrothal_to_court', weight: 3 } }, tone: 'plain' },
          { id: 'let_it_die', label: 'Let the match die in the lane', text: 'Everyone goes indoors. The ewes stay where they are, the pot comes back to you, and two households stop speaking for a generation.', effects: { boundKinRel: { role: 'other', delta: -9 }, familyReputation: { delta: -2 }, householdState: { food: 2 }, memory: { tag: 'let_the_match_die', weight: 4 } }, tone: 'bad' },
        ],
      },
      {
        title: 'LETTERS FROM AN EARLIER LOVE',
        text: 'A carter brings a bundle of letters {{other.name}} wrote to somebody else three summers ago. Read in the right room they are a precontract, which voids the marriage outright and disgraces every household named in it on the way out.',
        choices: [
          { id: 'burn', label: 'Burn them in the hearth', text: 'They go up quickly. {{other.name}} watches the whole time and neither of you says anything about it ever again.', effects: { faith: 3, boundKinRel: { role: 'other', delta: 14 }, createSecret: { type: 'secret_lover', severity: 40, knownByIds: [] }, memory: { tag: 'burned_the_precontract', weight: 5, note: 'You burned letters that would have voided a marriage.' } }, tone: 'plain' },
          { id: 'to_the_priest', label: 'Carry them to the priest', text: 'The priest reads two lines and stops. The marriage is dissolved before Advent, correctly, and to nobody’s satisfaction at all.', effects: { faith: 6, reputation: 4, faction: { factionId: 'church', playerStanding: 4 }, boundKinRel: { role: 'other', delta: -15 }, memory: { tag: 'gave_up_the_precontract', weight: 5 } }, tone: 'plain' },
          { id: 'keep', label: 'Keep them somewhere you can find them', text: 'You put them under the floor of the byre. They are worth nothing until the day they are worth a great deal.', effects: { wits: 5, createSecret: { type: 'secret_lover', severity: 55, knownByIds: [] }, memory: { tag: 'holds_the_precontract', weight: 5, note: 'You hold letters that could dissolve a marriage whenever you choose.' } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE CHILDREN OF BOTH HOUSES',
        text: 'At the Lammas ale, children of the two houses ask you what the quarrel was actually about. Nobody living now agrees on the sum, and two people have already said "ten shillings" with total confidence.',
        choices: [
          { id: 'whole_truth', label: 'Tell them the whole of it', text: 'You give them the ewes, the pot, the uncle and the debt. They are disappointed by how small it all was. Nothing you could have said would have taught them more.', effects: { wits: 4, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'told_the_truth_of_the_betrothal', weight: 4 } }, tone: 'good' },
          { id: 'kind_version', label: 'Give them the kind version', text: 'You tell them about eight ewes and a brass pot and leave the uncle out. It is a better story and it will hold for another generation.', effects: { charm: 5, boundKinRel: { role: 'other', delta: 5 }, memory: { tag: 'softened_the_old_quarrel', weight: 3 } }, tone: 'plain' },
          { id: 'change_subject', label: 'Tell them to mind the harvest', text: 'They go back to the sheaves. The quarrel keeps its teeth for whoever asks next.', effects: { householdState: { food: 2 }, familyReputation: { delta: -1 }, memory: { tag: 'buried_the_old_quarrel', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE LAST WITNESS AT THE PORCH',
        text: 'The last person living who stood at that church door offers to say what really happened, but only if both households sit at one table to hear it. Everyone involved is now old, and not one of them is sorry.',
        choices: [
          { id: 'set_the_table', label: 'Set the table and sit them down', text: 'It takes most of an afternoon and two jugs. Nobody apologises, but by the end they are arguing about sheep prices instead, which is as close to peace as Swineford gets.', effects: { charm: 6, faith: 3, familyReputation: { delta: 5 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'the_houses_reconciled', weight: 5, note: 'You got two feuding households to sit at one table and hear the truth.' } }, tone: 'good' },
          { id: 'let_it_die', label: 'Let it die with the witness', text: 'The witness is buried in spring and takes it with them. Both houses go on believing the version that suits them, and both are wrong.', effects: { wits: 3, familyReputation: { delta: -2 }, memory: { tag: 'the_betrothal_never_settled', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'foster_oath',
    domain: 'family',
    minAge: 14,
    beats: [
      {
        title: 'A CHILD AT THE THRESHOLD',
        text: '{{other.name}} carries an orphaned child to your door on the eve of Martinmas. The child owns a blanket, a wooden spoon, and no surname anyone will admit to.',
        choices: [
          { id: 'take_in', label: 'Give the child a place at your fire', text: 'You clear a corner by the hearth. The parish is relieved, your stores are not, and the child sleeps for fourteen hours.', effects: { faith: 6, householdState: { food: -3 }, expectChild: { route: 'adoption', dueInYears: 1 }, faction: { factionId: 'commons', playerStanding: 3 }, memory: { tag: 'took_in_the_orphan', weight: 4 } }, tone: 'good' },
          { id: 'place_elsewhere', label: 'Find them a place at the mill', text: 'The miller takes the child for the work in them. It is a roof, and it is not a kindness, and you knew both when you arranged it.', effects: { charm: 3, wits: 2, boundKinRel: { role: 'other', delta: 2 }, memory: { tag: 'placed_the_orphan_at_the_mill', weight: 3 } }, tone: 'plain' },
          { id: 'turn_away', label: 'Turn them away', text: 'You shut the door. The child is taken in three doors down by people with less than you, and Swineford counts the doors.', effects: { faith: -7, familyReputation: { delta: -3 }, boundKinRel: { role: 'other', delta: -9 }, faction: { factionId: 'commons', playerStanding: -4 }, memory: { tag: 'turned_away_the_orphan', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE BIRTH KIN COME BACK',
        text: 'The child’s blood family appears at the gate. They do not want the child back. They want it acknowledged that the child owes them service for the roof they gave first.',
        choices: [
          { id: 'pay_them', label: 'Pay them to go away (6g)', costGold: 6, text: 'Six shillings and they are gone by dusk. They will be back in three years, having spent it, with the same argument.', effects: { gold: -6, memory: { tag: 'bought_off_the_birth_kin', weight: 3 }, createSecret: { type: 'hidden_debt', severity: 25, knownByIds: [] } }, tone: 'plain' },
          { id: 'hallmote', label: 'Take it to the hallmote', text: 'The steward rules the claim has no standing, the birth kin are amerced fourpence for troubling the court, and the whole village now knows the child’s business.', effects: { wits: 5, reputation: 3, faction: { factionId: 'commons', playerStanding: 2 }, legal: { suspicion: -2 }, memory: { tag: 'hallmote_ruled_on_the_ward', weight: 4 } }, tone: 'good' },
          { id: 'child_chooses', label: 'Put it to the child', text: 'The child stands in the gateway and picks. It takes a long time and everybody has to watch.', effects: { charm: 4, faith: 2, boundKinRel: { role: 'other', delta: 7 }, memory: { tag: 'let_the_ward_choose', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE LOAVES THAT WALKED',
        text: 'You find the lardarium lighter than it should be. The child has been carrying bread out to a household that has not eaten since Tuesday, and has got quite good at it.',
        choices: [
          { id: 'send_openly', label: 'Send more, and openly', text: 'You put a basket on their step yourself. It costs you a fortnight of stores and buys you something the stores could not.', effects: { householdState: { food: -4 }, faith: 5, faction: { factionId: 'commons', playerStanding: 4 }, worldConditions: { foodSecurity: 1 }, memory: { tag: 'fed_the_hungry_neighbours', weight: 4 } }, tone: 'good' },
          { id: 'teach_discretion', label: 'Explain what a theft costs, then look away', text: 'You explain leyrwite, amercement and the pillory in some detail, then go to bed early and stop counting loaves.', effects: { wits: 4, charm: 3, householdState: { food: -2 }, memory: { tag: 'taught_the_ward_discretion', weight: 4 } }, tone: 'plain' },
          { id: 'lock_it', label: 'Put a lock on the lardarium', text: 'The bread stops walking. So does the child’s habit of looking at you when you come in.', effects: { householdState: { food: 3 }, boundKinRel: { role: 'other', delta: -7 }, memory: { tag: 'locked_the_lardarium', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A PLACE AT THE FORGE',
        text: 'A smith offers the child a seven-year indenture. The premium is two marks, and the child leaves the household the day it is sealed and does not come back.',
        choices: [
          { id: 'buy_indenture', label: 'Pay the indenture (14g)', costGold: 14, text: 'The indenture is cut in two and you keep the ragged half. The child is a smith’s apprentice by Whitsun and cries on the way out of the gate.', effects: { gold: -14, boundKinRel: { role: 'other', delta: 10 }, faction: { factionId: 'guilds', playerStanding: 4 }, memory: { tag: 'bought_the_indenture', weight: 5, note: 'You paid two marks to put your foster child into a trade.' } }, tone: 'good' },
          { id: 'keep_home', label: 'Keep them home for the harvest', text: 'You need the hands and you say so honestly, which does not make it land any better. The smith takes another boy.', effects: { holding: { stores: 7 }, householdState: { food: 3 }, boundKinRel: { role: 'other', delta: -9 }, memory: { tag: 'kept_the_ward_home', weight: 4 } }, tone: 'plain' },
          { id: 'letters', label: 'Send them to the priest for letters instead', text: 'Cheaper than a forge and slower to pay. The child learns to read a rent-roll, which in Swineford is very nearly a weapon.', effects: { faith: 4, wits: 5, faction: { factionId: 'church', playerStanding: 3 }, memory: { tag: 'ward_sent_to_letters', weight: 4 } }, tone: 'good' },
        ],
      },
      {
        title: 'WHICH NAME AT THE VIEW OF FRANKPLEDGE',
        text: 'Grown now, the ward must give a surname at the view of frankpledge, in front of the tithing and the steward’s clerk, and it will be written down and kept.',
        choices: [
          { id: 'your_name', label: 'Offer them your name', text: 'The clerk writes it without looking up. Your family gains a member and a set of complications, in that order.', effects: { familyReputation: { delta: 5 }, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'the_ward_took_your_name', weight: 5, note: 'Your foster child took your surname at the frankpledge view.' } }, tone: 'good' },
          { id: 'own_name', label: 'Tell them to keep their own', text: 'They give the name they were born with, in a clear voice, and the tithing writes it down as though it had never been in doubt.', effects: { faith: 4, wits: 2, familyReputation: { delta: 1 }, memory: { tag: 'the_ward_kept_their_name', weight: 4 } }, tone: 'good' },
        ],
      },
    ],
  },
  {
    id: 'siblings_share',
    domain: 'family',
    minAge: 16,
    beats: [
      {
        title: 'THE UNEQUAL BOWLS',
        text: '{{other.name}} says at supper what the family has arranged silently for two generations: the eldest takes the land, and everybody else takes goodwill and a place to sleep until they marry.',
        choices: [
          { id: 'side_against', label: 'Say aloud that it is not fair', text: 'You agree, at volume, in front of everyone. The eldest puts down the bread and does not pick it up again that evening.', effects: { boundKinRel: { role: 'other', delta: 9 }, familyReputation: { delta: -2 }, charm: 2, memory: { tag: 'sided_against_the_heir', weight: 4 } }, tone: 'plain' },
          { id: 'defend_custom', label: 'Defend the custom of the manor', text: 'You point out that a divided holding feeds nobody. That is true. You then say it is why the thing has always been done, and that is a different argument wearing the same coat.', effects: { familyReputation: { delta: 3 }, wits: 3, boundKinRel: { role: 'other', delta: -7 }, memory: { tag: 'defended_the_custom', weight: 4 } }, tone: 'plain' },
          { id: 'the_pig', label: 'Change the subject to the pig', text: 'You raise the matter of pannage in the lord’s wood. It works, for about a year.', effects: { charm: 3, householdState: { food: 1 }, memory: { tag: 'dodged_the_inheritance_talk', weight: 2 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE CHRISTENING SPOON',
        text: 'A silver christening spoon goes missing after supper. Four siblings remember four separate deathbed promises about it, all made in the same room, apparently on the same afternoon.',
        choices: [
          { id: 'search', label: 'Search every chest in the house', text: 'You find no spoon, one hidden purse, and a letter nobody wanted read. The spoon turns up in June behind the salt.', effects: { wits: 5, boundKinRel: { role: 'other', delta: -6 }, familyReputation: { delta: -2 }, revealSecretOf: 'other', memory: { tag: 'searched_the_family_chests', weight: 4 } }, tone: 'bad' },
          { id: 'second_spoon', label: 'Buy a second spoon and say nothing (8g)', costGold: 8, text: 'The silversmith asks no questions for an extra penny. Two spoons now exist and the family peace rests on nobody ever putting them side by side.', effects: { gold: -8, charm: 5, createSecret: { type: 'stolen_property', severity: 30, knownByIds: [] }, memory: { tag: 'the_second_spoon', weight: 4, note: 'You forged family peace with a duplicate christening spoon.' } }, tone: 'plain' },
          { id: 'let_it_stand', label: 'Let the accusation lie where it fell', text: 'The blame settles on the sibling least able to argue back, which is why it settled there. Everyone is relieved and nobody says so.', effects: { legal: { suspicion: 3 }, boundKinRel: { role: 'other', delta: -9 }, faith: -3, memory: { tag: 'let_a_sibling_take_the_blame', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'A LINE IN A DIFFERENT HAND',
        text: '{{other.name}} produces the parish copy of the will, and a witness who says the priest’s clerk took twopence to change one line of it after the sealing.',
        choices: [
          { id: 'church_court', label: 'Sue in the church court (5g)', costGold: 5, text: 'Probate belongs to the church and the church takes its time. Two years later a ruling arrives that pleases nobody and costs more than the land.', effects: { gold: -5, faith: 4, faction: { factionId: 'church', playerStanding: 2 }, wits: 3, memory: { tag: 'sued_over_the_will', weight: 4 } }, tone: 'plain' },
          { id: 'squeeze_clerk', label: 'Have a quiet word with the clerk', text: 'He is very frightened and very forthcoming. You leave with six shillings of his money and a permanent hold on him.', effects: { gold: 6, wits: 5, createSecret: { type: 'criminal_contact', severity: 35, knownByIds: [] }, faction: { factionId: 'church', playerStanding: -2 }, memory: { tag: 'squeezed_the_clerk', weight: 4 } }, tone: 'plain' },
          { id: 'let_it_stand', label: 'Let the will stand as written', text: 'One line stays changed. The family stops shouting and starts keeping accounts of who owes whom, which lasts considerably longer.', effects: { familyReputation: { delta: 2 }, boundKinRel: { role: 'other', delta: -11 }, memory: { tag: 'let_the_altered_will_stand', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'AT THE LAMMAS ALE',
        text: 'The quarrel follows the family to the Lammas ale, where the whole village is within earshot and saying nothing looks exactly like admitting it.',
        choices: [
          { id: 'air_it', label: 'Say the grievance in the open', text: 'You lay it out in front of forty people and a barrel. It is true, it is satisfying, and the family will be explaining it at every ale for a decade.', effects: { reputation: 5, charm: -4, familyReputation: { delta: -4 }, worldConditions: { publicOrder: -1 }, memory: { tag: 'aired_the_family_quarrel', weight: 5 } }, tone: 'plain' },
          { id: 'toast', label: 'Toast the family and lie beautifully', text: 'You give a short speech about your parents that is almost entirely false and genuinely moving. Three people weep. The quarrel goes back under the table intact.', effects: { charm: 8, familyReputation: { delta: 4 }, memory: { tag: 'lied_beautifully_at_lammas', weight: 4 } }, tone: 'good' },
          { id: 'leave', label: 'Leave before the second barrel', text: 'You walk home in the light. Everything said after you go is worse than anything you would have said, and all of it is attributed to you.', effects: { wits: 2, boundKinRel: { role: 'other', delta: -5 }, familyReputation: { delta: -2 }, memory: { tag: 'walked_out_of_lammas', weight: 3 } }, tone: 'plain' },
        ],
      },
      {
        title: 'WHAT THE DEAD ACTUALLY LEFT',
        text: 'The last of the elder generation is buried and the heriot is paid: the best beast, gone to the lord before the family sees a penny. What is left is the land, the spoon, and every word said while fighting over both.',
        choices: [
          { id: 'divide', label: 'Divide it evenly, whatever custom says', text: 'You split a holding that was never meant to be split. Each share feeds one household badly instead of one household well, and nobody has to leave.', effects: { familyReputation: { delta: 6 }, holding: { stores: -5 }, boundKinRel: { role: 'other', delta: 12 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'divided_the_holding_evenly', weight: 5, note: 'You split the family land against custom rather than turn kin out.' } }, tone: 'good' },
          { id: 'take_share', label: 'Take what the custom gives you', text: 'You take the whole of it, lawfully, and two of your siblings are cottars by Michaelmas. The custom is on your side every single day of it.', effects: { holding: { stores: 12 }, gold: 14, boundKinRel: { role: 'other', delta: -16 }, familyReputation: { delta: -3 }, memory: { tag: 'took_the_customary_share', weight: 5, note: 'You took the whole inheritance by custom and left your siblings landless.' } }, tone: 'plain' },
        ],
      },
    ],
  },
];
