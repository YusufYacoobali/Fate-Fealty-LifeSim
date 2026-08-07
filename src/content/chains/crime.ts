import { ChainSpec } from './types';

export const CRIME_CHAINS: ChainSpec[] = [
  {
    id: 'stolen_chalice',
    domain: 'crime',
    minAge: 12,
    beats: [
      {
        title: 'THE CHALICE IS GONE FROM THE AUMBRY',
        text: 'The parish chalice is missing from the aumbry, and {{other.name}} was seen coming out of the north door before first light with something under a coat.',
        choices: [
          { id: 'ask_them', label: 'Ask them yourself, first', text: 'They say it was a lamb they were hiding from the reeve, and produce a lamb. The lamb is real. The timing is not.', effects: { wits: 4, boundKinRel: { role: 'other', delta: 6 }, memory: { tag: 'asked_before_accusing', weight: 3 } }, tone: 'plain' },
          { id: 'raise_hue', label: 'Raise the hue and cry', text: 'The whole tithing turns out, as the law requires, and finds nothing. {{other.name}} spends the night in the reeve’s outhouse on the strength of your word.', effects: { reputation: 3, legal: { suspicion: -2 }, boundKinRel: { role: 'other', delta: -14 }, faction: { factionId: 'crown', playerStanding: 2 }, memory: { tag: 'raised_the_hue_and_cry', weight: 4 } }, tone: 'plain' },
          { id: 'say_nothing', label: 'Keep what you saw to yourself', text: 'You go home. Six people saw them come out of that door and you are the only one who has decided to be no help whatsoever.', effects: { faith: -3, boundKinRel: { role: 'other', delta: 8 }, legal: { suspicion: 3 }, memory: { tag: 'withheld_what_you_saw', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A SLIVER OF GILT IN THE MARKET',
        text: 'A scrap of gilded rim turns up in a pedlar’s tray at market. {{other.name}} says flatly that it was planted by a man who owes them seventeen shillings and would like the debt to die with them.',
        choices: [
          { id: 'trace_pedlar', label: 'Trace where the pedlar got it', text: 'Three days of asking ends at a tinker who bought it at Stourbridge fair from a man he cannot describe. It proves nothing and unproves nothing.', effects: { wits: 6, gold: -2, memory: { tag: 'traced_the_gilt', weight: 4 } }, tone: 'plain' },
          { id: 'buy_it', label: 'Buy the scrap and pocket it (3g)', costGold: 3, text: 'Threepence and no questions asked. You now own the only piece of evidence in the parish. It sits in your purse for a month before you understand what you are carrying.', effects: { gold: -3, wits: 3, createSecret: { type: 'stolen_property', severity: 45, knownByIds: [] }, memory: { tag: 'pocketed_the_evidence', weight: 5 } }, tone: 'plain' },
          { id: 'to_reeve', label: 'Take it straight to the reeve', text: 'He puts it in the box with the writs and thanks you formally. The pedlar is arrested and is very obviously not the man anyone is looking for.', effects: { reputation: 4, faction: { factionId: 'crown', playerStanding: 3 }, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'gave_the_gilt_to_the_reeve', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A NEW ROOF AND SEVERAL FAT HENS',
        text: 'The one witness who was certain has changed his account. He also has a new roof this month, and considerably more hens than his yard can honestly explain.',
        choices: [
          { id: 'count_hens', label: 'Count the hens aloud at the hallmote', text: 'You do the arithmetic in public: a roof, nine hens, and a labourer’s wage. The steward strikes the testimony and the witness leaves the parish before Advent.', effects: { wits: 6, reputation: 5, worldConditions: { publicOrder: 2 }, faction: { factionId: 'commons', playerStanding: 3 }, memory: { tag: 'counted_the_hens', weight: 5 } }, tone: 'good' },
          { id: 'outbid', label: 'Offer him more to change it back (10g)', costGold: 10, text: 'He takes it, changes his story a third time, and is now worth precisely nothing as a witness to anybody at all, yourself included.', effects: { gold: -10, legal: { suspicion: 5, notoriety: 2 }, wits: 2, memory: { tag: 'bought_a_witness', weight: 5, note: 'You paid a witness to change his testimony back.' } }, tone: 'bad' },
          { id: 'leave_it', label: 'Let the new roof stand', text: 'You say nothing about the hens. The case bends round the bribe the way water bends round a stone, and everyone can see the shape of it.', effects: { faith: -3, wits: 2, worldConditions: { publicOrder: -2 }, memory: { tag: 'let_the_bribe_stand', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE REEVE AND THE ARCHDEACON DISAGREE',
        text: 'The reeve is preparing a trial at the manor court. The archdeacon holds that a consecrated vessel is the Church’s business, and wants the relic recovered before anybody is judged for taking it.',
        choices: [
          { id: 'back_reeve', label: 'Back the reeve and the manor court', text: 'Secular justice, and quickly. The archdeacon writes a letter about jurisdiction that is still being quoted in that parish forty years later.', effects: { faction: { factionId: 'crown', playerStanding: 4 }, worldConditions: { religiousTension: 3 }, reputation: 3, memory: { tag: 'backed_the_manor_court', weight: 4 } }, tone: 'plain' },
          { id: 'back_church', label: 'Back the archdeacon', text: 'It goes to the church court, where the penalty is penance and the object comes before the person. The reeve does not speak to you until Lady Day twice over.', effects: { faith: 5, faction: { factionId: 'church', playerStanding: 4 }, worldConditions: { religiousTension: -2 }, memory: { tag: 'backed_the_archdeacon', weight: 4 } }, tone: 'plain' },
          { id: 'sanctuary', label: 'Tell {{other.name}} to claim sanctuary', text: 'Forty days in the chancel, then abjure the realm and walk to the coast barefoot carrying a cross. It is not mercy. It is not the gallows either.', effects: { faith: 3, wits: 4, boundKinRel: { role: 'other', delta: 12 }, legal: { suspicion: 4 }, faction: { factionId: 'outlaws', playerStanding: 3 }, memory: { tag: 'sent_them_to_sanctuary', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE CHALICE COMES BACK IN A MEAL SACK',
        text: 'The chalice reappears on the church step in a meal sack, undamaged, with no note. Everybody has now been accused of something and nobody has been cleared of anything.',
        choices: [
          { id: 'close_it', label: 'Declare the matter closed', text: 'You say it loudly and often until it becomes true. Three households never speak again, and the parish is content to call that a resolution.', effects: { charm: 5, faith: 2, worldConditions: { publicOrder: 2 }, memory: { tag: 'closed_the_chalice_matter', weight: 4 } }, tone: 'plain' },
          { id: 'keep_asking', label: 'Keep asking who carried the sack', text: 'You ask for twelve months and get an answer nobody wanted. By then the parish had stopped wanting one and rather resents being given it.', effects: { wits: 5, reputation: -3, legal: { suspicion: 2 }, memory: { tag: 'kept_asking_about_the_sack', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE SILVERSMITH’S CONFESSION',
        text: 'A silversmith two towns over confesses he copied that chalice fourteen years ago for a churchwarden who wanted the original sold. Which vessel was actually stolen is now an open question.',
        choices: [
          { id: 'publish', label: 'Have the confession read in church', text: 'The parish learns it nearly hanged a neighbour over pewter under gilt. The churchwarden’s tomb is in the chancel and cannot be asked about it.', effects: { wits: 5, reputation: 6, worldConditions: { religiousTension: 4, publicOrder: -1 }, faction: { factionId: 'church', playerStanding: -4 }, memory: { tag: 'published_the_chalice_forgery', weight: 5 } }, tone: 'plain' },
          { id: 'suppress', label: 'Pay him for his silence (8g)', costGold: 8, text: 'Eight shillings for his trouble and his quiet. The parish keeps its relic, its story and its grudges, and every one of them is false.', effects: { gold: -8, faith: -3, faction: { factionId: 'church', playerStanding: 4 }, createSecret: { type: 'stolen_property', severity: 60, knownByIds: [] }, memory: { tag: 'buried_the_chalice_confession', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE ACCOUNT READ BEFORE THE PARISH',
        text: 'The whole business is read out at the annual view: every accusation, every retraction, every hen. Silence from the innocent will cost as much today as speech from the guilty.',
        choices: [
          { id: 'speak', label: 'Stand and say your own part in it', text: 'You give your account including the parts that do you no credit at all. Two others follow you up. It is the closest the parish comes to a reckoning.', effects: { faith: 5, reputation: 6, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 3 }, memory: { tag: 'spoke_at_the_reckoning', weight: 5, note: 'You gave a full public account of your part in the chalice affair.' } }, tone: 'good' },
          { id: 'stay_seated', label: 'Stay on the bench', text: 'You keep your seat. The reading ends, everyone files out, and the whole business settles into the parish like damp into a wall.', effects: { wits: 3, reputation: -2, worldConditions: { publicOrder: -1 }, memory: { tag: 'stayed_seated_at_the_reckoning', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'forest_gang',
    domain: 'crime',
    minAge: 14,
    beats: [
      {
        title: 'VENISON IN THE WRONG HOUSES',
        text: '{{other.name}} knows exactly who has been taking deer out of the lord’s wood, and knows which six households have eaten meat this winter because of it.',
        choices: [
          { id: 'stay_out', label: 'Want no part of it', text: 'You say so plainly and are not asked twice. You are also not told anything, by anybody, for a very long time afterwards.', effects: { wits: 3, legal: { suspicion: -3 }, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'refused_the_poachers', weight: 3 } }, tone: 'plain' },
          { id: 'take_share', label: 'Take a share of the meat', text: 'A shoulder, wrapped in sacking, left in your byre before dawn. Your household eats, and you are now inside something with no obvious door out.', effects: { householdState: { food: 5 }, legal: { suspicion: 5 }, path: { outlaw: 2 }, faction: { factionId: 'outlaws', playerStanding: 3 }, boundKinRel: { role: 'other', delta: 8 }, memory: { tag: 'took_the_venison', weight: 4 } }, tone: 'plain' },
          { id: 'warn_forester', label: 'Warn the forester there is a gang', text: 'You tell him there is a gang without telling him who. Patrols double, the poaching stops for six weeks, and somebody works out where the warning came from.', effects: { reputation: 3, faction: { factionId: 'crown', playerStanding: 3 }, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'warned_the_forester', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A SNARE TAKES A FORESTER’S LEG',
        text: 'A hidden snare opens a forester’s leg to the bone. Poaching the parish quietly tolerated has become a hunt for blood, and the verderers are riding for the eyre.',
        choices: [
          { id: 'carry_him', label: 'Carry him in and pay the herb-wife (4g)', costGold: 4, text: 'You get him to the village on a hurdle and he keeps the leg. He remembers who took the front end, which turns out to matter enormously.', effects: { gold: -4, health: -3, faith: 4, faction: { factionId: 'crown', playerStanding: 4 }, legal: { suspicion: -4 }, memory: { tag: 'carried_in_the_forester', weight: 5 } }, tone: 'good' },
          { id: 'clear_snares', label: 'Go out at night and clear the snares', text: 'Fourteen snares in one night by moonlight. Nobody thanks you, both sides suspect you, and no forester loses a leg in that wood again.', effects: { wits: 4, health: -2, legal: { suspicion: 3 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'cleared_the_snares_at_night', weight: 5 } }, tone: 'plain' },
          { id: 'walk_away', label: 'Be somewhere else entirely', text: 'You are seen at the alehouse from noon to dark by nine reliable witnesses, which is the most suspicious alibi in the history of Swineford.', effects: { legal: { suspicion: 4 }, charm: 2, memory: { tag: 'the_too_good_alibi', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A SHARE OF THE SILVER',
        text: 'The gang offers you a cut of what the venison earns at market, if you can pull the village patrol off the coppice road for a single night.',
        choices: [
          { id: 'take_it', label: 'Take the silver and move the patrol', text: 'You send them the long way on a story about a broken hurdle. Six shillings arrive wrapped in cloth two days later.', effects: { gold: 6, legal: { suspicion: 7, notoriety: 2 }, path: { outlaw: 3 }, faction: { factionId: 'outlaws', playerStanding: 5 }, memory: { tag: 'sold_the_patrol_road', weight: 5, note: 'You were paid to divert the village patrol for poachers.' } }, tone: 'plain' },
          { id: 'refuse', label: 'Refuse, and tell them why', text: 'You tell them a leg is already open and the next thing opened will be a neck. They call you soft. Two of them privately agree with you.', effects: { faith: 4, charm: 3, faction: { factionId: 'outlaws', playerStanding: -3 }, memory: { tag: 'refused_the_poachers_silver', weight: 4 } }, tone: 'good' },
          { id: 'double_cross', label: 'Take the silver and send the patrol anyway', text: 'Three of them are taken on the coppice road with your six shillings still in your purse. It is the cleverest thing you have ever done and you sleep badly for a decade.', effects: { gold: 6, reputation: 5, faith: -5, faction: { factionId: 'crown', playerStanding: 5 }, boundKinRel: { role: 'other', delta: -20 }, memory: { tag: 'took_the_silver_and_betrayed_them', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE APPROVER’S PARDON',
        text: 'One of the gang is offered a pardon for turning approver: he names every accomplice from the dock, {{other.name}} among them, and fights in the lists any man who denies it.',
        choices: [
          { id: 'stand_surety', label: 'Stand surety for {{other.name}}', text: 'You pledge your own goods against their appearance. If they run you are ruined, and every man in that court does the arithmetic while you are still speaking.', effects: { gold: -8, boundKinRel: { role: 'other', delta: 18 }, legal: { suspicion: 4 }, reputation: 4, memory: { tag: 'stood_surety_for_a_poacher', weight: 5 } }, tone: 'plain' },
          { id: 'common_fine', label: 'Petition the lord for a common fine instead', text: 'You argue that hanging four tenants costs the manor four tenants. The steward finds this persuasive in a way that justice had not been.', effects: { wits: 6, charm: 4, gold: -5, worldConditions: { publicOrder: 1 }, faction: { factionId: 'crown', playerStanding: 2 }, memory: { tag: 'argued_the_manor_out_of_hangings', weight: 5 } }, tone: 'good' },
          { id: 'let_it_run', label: 'Let the approver name whoever he names', text: 'He names sixteen people, two of whom were nowhere near the wood. Three hang. His pardon is honoured in full and he is gone by spring.', effects: { legal: { suspicion: -3 }, faith: -4, worldConditions: { publicOrder: -3 }, boundKinRel: { role: 'other', delta: -15 }, memory: { tag: 'let_the_approver_speak', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE WOOD GOES QUIET',
        text: 'After the eyre the wood is silent. Several households still eat because of venison buried in salt two winters ago, and loyalties considerably older than the forest law.',
        choices: [
          { id: 'keep_moving', label: 'Keep the buried stores moving', text: 'You shift salt meat between four byres for another three winters. It is a small crime conducted with enormous administrative care.', effects: { householdState: { food: 3 }, legal: { suspicion: 3 }, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'kept_the_buried_stores_moving', weight: 4 } }, tone: 'plain' },
          { id: 'end_it', label: 'Dig it up and end it', text: 'You burn what has gone over and return the rest. Two households go hungry in March who did not have to, and they know which choice did it.', effects: { legal: { suspicion: -5 }, householdState: { food: -2 }, faith: 3, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'ended_the_venison_trade', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE NEW FORESTER OFFERS AN AMNESTY',
        text: 'A new forester offers to forget every snare in that wood, provided the village names who organised the gang. They have until Michaelmas to settle it among themselves.',
        choices: [
          { id: 'name_the_gone', label: 'Give him the one who has already fled', text: 'You name a man who took ship at Boston two winters back. The forester writes it down, everyone knows exactly what has happened, and the amnesty holds.', effects: { wits: 6, charm: 4, legal: { suspicion: -4 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'named_a_man_already_gone', weight: 5 } }, tone: 'good' },
          { id: 'name_nobody', label: 'Let the village name nobody', text: 'Michaelmas passes in total silence. The amnesty lapses, the patrols double, and Swineford holds together in a way that costs it a great deal.', effects: { faction: { factionId: 'commons', playerStanding: 5 }, worldConditions: { publicOrder: -2 }, charm: 3, memory: { tag: 'the_village_named_nobody', weight: 5 } }, tone: 'plain' },
          { id: 'name_true', label: 'Name who actually did it', text: 'You say the name in the open. The amnesty holds for everybody else, and you are the man who said it for the rest of your life.', effects: { reputation: 4, legal: { suspicion: -6 }, boundKinRel: { role: 'other', delta: -18 }, faction: { factionId: 'commons', playerStanding: -6 }, memory: { tag: 'named_the_gang_leader', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'WHEN THE DEER COME BACK TO THE COPPICE',
        text: 'The deer return in numbers nobody has seen in a generation. The poorest households ask, out loud, whether the law made the wood safer or merely emptier of them.',
        choices: [
          { id: 'defend_law', label: 'Say the law kept the wood', text: 'You make the case for forest law to people whose grandparents cleared that coppice. It is a sound argument and it persuades nobody who is hungry.', effects: { faction: { factionId: 'crown', playerStanding: 4 }, worldConditions: { publicOrder: 2 }, reputation: 2, memory: { tag: 'defended_the_forest_law', weight: 4 } }, tone: 'plain' },
          { id: 'pannage', label: 'Petition for a common right of pannage', text: 'Not deer. Pigs, in the wood, in autumn, by right. It is a smaller thing to ask for, it is granted, and it feeds Swineford every October after.', effects: { wits: 6, charm: 5, worldConditions: { foodSecurity: 4 }, faction: { factionId: 'commons', playerStanding: 6 }, householdState: { food: 4 }, memory: { tag: 'won_the_right_of_pannage', weight: 5, note: 'You won Swineford a standing right of pannage in the lord’s wood.' } }, tone: 'good' },
        ],
      },
    ],
  },
  {
    id: 'false_witness',
    domain: 'crime',
    minAge: 14,
    beats: [
      {
        title: 'AN ALIBI THAT IS PARTLY TRUE',
        text: '{{other.name}} asks you to swear they were at your hearth on the night in question. They were. For roughly half of it.',
        choices: [
          { id: 'swear_whole', label: 'Swear to the whole night', text: 'You give the oath entire and they walk free. The half you invented sits in the court roll in a clerk’s beautiful hand for good.', effects: { boundKinRel: { role: 'other', delta: 15 }, legal: { suspicion: 5 }, faith: -4, createSecret: { type: 'betrayed_friend', severity: 40, knownByIds: [] }, memory: { tag: 'swore_a_false_alibi', weight: 5 } }, tone: 'plain' },
          { id: 'swear_half', label: 'Swear only to the hours you had them', text: 'You give the court exactly what you know: not enough to clear them, not enough to hang them. Both sides find you useless and entirely honest.', effects: { faith: 5, wits: 3, reputation: 3, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'swore_only_to_the_hours', weight: 4 } }, tone: 'good' },
          { id: 'refuse_oath', label: 'Refuse the oath entirely', text: 'You will not stand up at all. They find two oath-helpers elsewhere inside a day, neither of whom was anywhere near your hearth.', effects: { faith: 2, legal: { suspicion: -3 }, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'refused_to_be_an_oath_helper', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE SECOND WITNESS IS TOO TIDY',
        text: 'The accuser’s family produces a second witness whose account is cleaner than any real memory has a right to be. He has the hour, the weather, and the colour of a coat.',
        choices: [
          { id: 'test_him', label: 'Ask him what the rain did that night', text: 'You ask in front of the steward. He answers with total confidence and gets it wrong, and the court goes very quiet indeed.', effects: { wits: 7, reputation: 4, boundKinRel: { role: 'other', delta: 8 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'broke_the_tidy_witness', weight: 5 } }, tone: 'good' },
          { id: 'match_it', label: 'Produce a tidier witness of your own', text: 'You find somebody willing to be equally certain of the opposite. The court now holds two immaculate lies and no means of choosing between them.', effects: { charm: 5, faith: -3, legal: { suspicion: 4 }, worldConditions: { publicOrder: -2 }, memory: { tag: 'matched_lie_for_lie', weight: 5 } }, tone: 'plain' },
          { id: 'accept', label: 'Let the clean story stand', text: 'It stands, and it wins. It was the best-told story in the room, and that is what the room was always going to decide on.', effects: { wits: 2, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'let_the_clean_story_win', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE CLERK STILL HAS THE FIRST DRAFT',
        text: 'The steward’s clerk lets slip that the testimony was rewritten after the hearing, that he kept the original, and that he is a poor man with a great fondness for being helped.',
        choices: [
          { id: 'buy_original', label: 'Buy the original (9g)', costGold: 9, text: 'Nine shillings for one sheet of parchment that says something quite different from the roll. You are now a man who buys evidence.', effects: { gold: -9, wits: 5, createSecret: { type: 'criminal_contact', severity: 40, knownByIds: [] }, memory: { tag: 'bought_the_original_testimony', weight: 5 } }, tone: 'plain' },
          { id: 'report_clerk', label: 'Report the clerk to the steward', text: 'He is dismissed inside the week and the roll stands uncorrected, because correcting it would mean admitting it was wrong. Justice, administratively.', effects: { reputation: 4, faction: { factionId: 'crown', playerStanding: 3 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'reported_the_clerk', weight: 4 } }, tone: 'plain' },
          { id: 'hide_it', label: 'Tell him to hide it and say nothing', text: 'It goes into the church chest under the tithe books. It will surface in fifteen years at the worst possible moment. Neither of you says so, and both of you are counting on it.', effects: { wits: 4, legal: { suspicion: 2 }, memory: { tag: 'hid_the_original_testimony', weight: 5, note: 'A rewritten testimony still exists, hidden in the church chest.' } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE LIE WAS FOR SOMEBODY ELSE',
        text: '{{other.name}} finally admits the lie was never about them at all. It was covering a third person, and naming that person now would do far more damage than the original charge ever could.',
        choices: [
          { id: 'name_them', label: 'Name the third person', text: 'You say it and the whole shape of the case turns over. The damage is exactly as large as promised, and it lands on people who had done nothing.', effects: { wits: 4, reputation: 3, revealSecretOf: 'other', boundKinRel: { role: 'other', delta: -16 }, worldConditions: { publicOrder: -2 }, memory: { tag: 'named_the_third_person', weight: 5 } }, tone: 'plain' },
          { id: 'hold', label: 'Carry the name yourself', text: 'You carry it. It is heavier than you expected and gets no lighter, and the wrong person stays under a shadow for years because you are decent.', effects: { faith: 3, boundKinRel: { role: 'other', delta: 14 }, createSecret: { type: 'betrayed_friend', severity: 50, knownByIds: [] }, memory: { tag: 'held_the_third_name', weight: 5 } }, tone: 'plain' },
          { id: 'make_them', label: 'Make {{other.name}} say it themselves', text: 'You give them a month, then you stop giving them months. They say it badly, to the wrong people, and it costs them everything it would have cost you.', effects: { charm: 4, wits: 4, boundKinRel: { role: 'other', delta: -9 }, memory: { tag: 'made_them_confess_it', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE WRONGED HOUSEHOLD ASKS FOR THE RECORD',
        text: 'Years on, the household that lost the case asks the parish to correct the roll. Everybody who could be embarrassed by it is still alive, and most of them hold some kind of office.',
        choices: [
          { id: 'correct_it', label: 'Get the roll corrected (6g)', costGold: 6, text: 'Nineteen months, two petitions and a fee. One line struck and one line added, and the family read it aloud to each other every evening for a week.', effects: { gold: -6, reputation: 6, faith: 5, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'corrected_the_court_roll', weight: 5, note: 'You got a false judgment struck from the manor roll years after the fact.' } }, tone: 'good' },
          { id: 'compensate', label: 'Pay them instead (15g)', costGold: 15, text: 'Fifteen shillings, and the record stands. They take it because they need it, and both parties understand precisely what has been bought.', effects: { gold: -15, faith: -2, boundKinRel: { role: 'other', delta: 6 }, memory: { tag: 'paid_instead_of_correcting', weight: 4 } }, tone: 'plain' },
          { id: 'refuse', label: 'Tell them it is too late', text: 'It is too late, factually. They knew that when they asked, and the asking was the whole of the point.', effects: { wits: 2, familyReputation: { delta: -3 }, faction: { factionId: 'commons', playerStanding: -4 }, memory: { tag: 'refused_to_reopen_it', weight: 4 } }, tone: 'bad' },
        ],
      },
      {
        title: 'NO HERO IN THE CORRECTED ROLL',
        text: 'The finished record names no hero. It names a great many people who found a small lie easier than a difficult morning, and it names them in a clerk’s immaculate hand.',
        choices: [
          { id: 'read_it', label: 'Read it aloud at the view', text: 'You read every name, including your own. Nobody enjoys it. It is entered in the roll as read, which is the only monument the business ever gets.', effects: { faith: 5, reputation: 5, familyReputation: { delta: 2 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'read_the_roll_aloud', weight: 5 } }, tone: 'good' },
          { id: 'file_it', label: 'File it in the chest unread', text: 'It goes in with the writs and the tithe books, entirely accurate and entirely unread for the rest of the century.', effects: { wits: 3, memory: { tag: 'filed_the_roll_unread', weight: 4 } }, tone: 'plain' },
        ],
      },
    ],
  },
];
