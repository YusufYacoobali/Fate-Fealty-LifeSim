import { ChainSpec } from './types';

export const RARE_CHAINS: ChainSpec[] = [
  {
    id: 'strangers_map',
    domain: 'rare',
    minAge: 14,
    beats: [
      {
        title: 'A RAIN-SOAKED MAP FOR FOURPENCE',
        text: '{{other.name}} buys a ruined sheet of vellum off a pedlar for fourpence. Under the water damage is a line running beneath Swineford’s oldest boundary stones, and a cross where no cross should be.',
        choices: [
          { id: 'study_it', label: 'Dry it out and read it properly', text: 'Three days over a low fire and most of it comes back. It is a genuine survey, badly copied, of something under the mere field.', effects: { wits: 6, memory: { tag: 'read_the_strangers_map', weight: 4 } }, tone: 'plain' },
          { id: 'buy_it_off_them', label: 'Buy it off {{other.name}} for a shilling', text: 'A shilling for fourpence of vellum. They take it happily and tell nine people about the profit. By Sunday the whole village knows there is a map.', effects: { gold: -1, wits: 3, boundKinRel: { role: 'other', delta: 5 }, memory: { tag: 'bought_the_map', weight: 4 } }, tone: 'plain' },
          { id: 'burn_it', label: 'Tell them to burn it', text: 'Maps of things under boundary stones have a way of becoming inquests. They do not burn it. They put it somewhere you cannot find it.', effects: { wits: 4, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'told_them_to_burn_the_map', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'BONES, TOOLS, AND A NEWER FOOTPRINT',
        text: 'A night in the mere field with a spade opens a sealed chamber under the third boundary stone. There are bones in it, iron tools of a shape nobody uses, and one bootprint considerably fresher than the rest.',
        choices: [
          { id: 'seal_it', label: 'Seal it up again and tell the priest', text: 'The priest has it consecrated and blessed and firmly closed. He also asks, twice, who else had been down there, and you do not have an answer.', effects: { faith: 6, faction: { factionId: 'church', playerStanding: 4 }, wits: 3, memory: { tag: 'sealed_the_chamber', weight: 5 } }, tone: 'plain' },
          { id: 'take_tools', label: 'Take the tools', text: 'Five iron pieces of a make no smith in the shire recognises. They are worth money to the right person and questions to everybody else.', effects: { gold: 14, wits: 4, legal: { suspicion: 4 }, createSecret: { type: 'stolen_property', severity: 45, knownByIds: [] }, memory: { tag: 'took_the_chamber_tools', weight: 5 } }, tone: 'plain' },
          { id: 'find_the_boot', label: 'Go looking for whose boot it was', text: 'You measure it against every man in Swineford over the next month, entirely without explaining why. You find the match and you very much wish you had not.', effects: { wits: 7, revealSecretOf: 'other', boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'matched_the_bootprint', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE MISSING CORNER IN THE REEVE’S ARCHIVE',
        text: 'The torn-off corner of the map turns up in the reeve’s own chest, filed among records of land confiscated from a family that stopped existing in this parish some ninety years ago.',
        choices: [
          { id: 'ask_reeve', label: 'Ask the reeve about it directly', text: 'He goes grey, says it was there when he came, and is entirely honest about that. He is much less honest about why he never mentioned it.', effects: { wits: 5, charm: 3, faction: { factionId: 'crown', playerStanding: -2 }, memory: { tag: 'asked_the_reeve_about_the_corner', weight: 5 } }, tone: 'plain' },
          { id: 'steal_corner', label: 'Take the corner out of the chest', text: 'You now have the whole map and a theft from the manor archive on your conscience and, potentially, on the record.', effects: { legal: { suspicion: 7 }, wits: 5, path: { outlaw: 2 }, memory: { tag: 'stole_the_map_corner', weight: 5 } }, tone: 'plain' },
          { id: 'trace_family', label: 'Trace the family that stopped existing', text: 'Ninety years of rolls and one very reluctant priory. They did not die out. They were dispossessed, and there are descendants, and they are three miles away.', effects: { wits: 7, gold: -5, memory: { tag: 'traced_the_dispossessed_family', weight: 5, note: 'You found living descendants of a family dispossessed ninety years ago.' } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE PATH ENDS UNDER A LIVING HOUSE',
        text: 'The line on the map runs out beneath a house with a family asleep in it. Whatever is down there and whoever owns the ground are now precisely the same argument.',
        choices: [
          { id: 'tell_them', label: 'Tell the family what is under their floor', text: 'You tell them everything and let them decide. They decide to do nothing at all, and they sleep on it for another forty years, and they are grateful you asked.', effects: { faith: 6, charm: 4, boundKinRel: { role: 'other', delta: 14 }, familyReputation: { delta: 3 }, memory: { tag: 'told_the_family_what_lay_beneath', weight: 5 } }, tone: 'good' },
          { id: 'dig_anyway', label: 'Dig at night from the byre side', text: 'Ten nights of quiet digging under somebody else’s floor. You find it. Whatever it is worth, you can never once explain how you came by it.', effects: { gold: 40, legal: { suspicion: 8, notoriety: 3 }, faith: -6, createSecret: { type: 'stolen_property', severity: 70, knownByIds: [] }, householdState: { wealth: 6 }, memory: { tag: 'dug_under_their_floor', weight: 5, note: 'You dug treasure out from under a sleeping family’s house.' } }, tone: 'bad' },
          { id: 'declare_treasure', label: 'Declare it as treasure trove', text: 'You report it to the coroner as the law requires. The Crown takes the whole of it, you are thanked in writing, and the family gets the hole in their floor filled in.', effects: { reputation: 6, faction: { factionId: 'crown', playerStanding: 6 }, gold: 6, worldConditions: { publicOrder: 2 }, memory: { tag: 'declared_the_treasure_trove', weight: 5 } }, tone: 'plain' },
        ],
      },
    ],
  },
  {
    id: 'saints_bone',
    domain: 'rare',
    minAge: 14,
    beats: [
      {
        title: 'A RELIQUARY AND A LARGE CLAIM',
        text: '{{other.name}} arrives with a small enamelled reliquary and the assertion that the finger-bone inside belonged to a saint that nobody in this diocese has heard of.',
        choices: [
          { id: 'examine', label: 'Look at the reliquary rather than the bone', text: 'The enamel is Limoges work and eighty years old at least. Whatever is inside it, the box is real and the box is worth more than the parish makes in a year.', effects: { wits: 6, memory: { tag: 'valued_the_reliquary', weight: 4 } }, tone: 'plain' },
          { id: 'take_it_to_church', label: 'Take it to the rector at once', text: 'He is cautious, delighted, and writing to the bishop before you are out of the door. It is out of your hands inside a week.', effects: { faith: 5, faction: { factionId: 'church', playerStanding: 4 }, boundKinRel: { role: 'other', delta: 4 }, memory: { tag: 'gave_the_relic_to_the_rector', weight: 4 } }, tone: 'plain' },
          { id: 'keep_quiet', label: 'Tell them to keep it in a box and say nothing', text: 'It goes under a floorboard. It stays there for nine years and then somebody’s child finds it, at the worst possible moment, in front of a visiting archdeacon.', effects: { wits: 4, boundKinRel: { role: 'other', delta: 6 }, createSecret: { type: 'stolen_property', severity: 35, knownByIds: [] }, memory: { tag: 'hid_the_reliquary', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'PILGRIMS ON THE SWINEFORD ROAD',
        text: 'Word gets out. Pilgrims come, and bring with them coin, sickness, and five competing accounts of miracles performed within sight of the reliquary.',
        choices: [
          { id: 'take_the_trade', label: 'Sell them beds, bread and badges', text: 'Swineford makes more in one summer than in the four years before it. It also buries nine people in August who came in already coughing.', effects: { gold: 26, householdState: { wealth: 5 }, worldConditions: { prosperity: 5, diseasePressure: 5 }, memory: { tag: 'took_the_pilgrim_trade', weight: 5 } }, tone: 'plain' },
          { id: 'limit_them', label: 'Limit them to the churchyard and the well', text: 'You organise where they sleep, where they wash and where they do not go. It makes half the money and buries nobody, and the alehouse never forgives you.', effects: { wits: 6, charm: 4, gold: 8, worldConditions: { prosperity: 2, diseasePressure: -3 }, faction: { factionId: 'commons', playerStanding: 3 }, memory: { tag: 'limited_the_pilgrims', weight: 5 } }, tone: 'good' },
          { id: 'test_miracles', label: 'Ask the miracle-witnesses some questions', text: 'Of six miracles, eight are weather, two are recovery from things people recover from, and one is genuinely unaccountable. You write all seven down anyway.', effects: { wits: 7, faith: -3, worldConditions: { religiousTension: 3 }, memory: { tag: 'examined_the_miracles', weight: 5 } }, tone: 'plain' },
        ],
      },
      {
        title: 'THE SCHOLAR WILL NOT SPEAK OF THE BONE',
        text: 'A scholar from Cambridge examines the reliquary and certifies the enamel as genuine and old. Asked directly about the bone inside it, he changes the subject three times and then leaves.',
        choices: [
          { id: 'press_him', label: 'Follow him to the gate and press him', text: 'He tells you, quietly, that it is a sheep’s. He also tells you he will deny having said so, and that he is not the first man to have found this out.', effects: { wits: 6, faith: -4, createSecret: { type: 'false_lineage', severity: 50, knownByIds: [] }, memory: { tag: 'learned_what_the_bone_was', weight: 5, note: 'A scholar told you privately that the parish relic is a sheep bone.' } }, tone: 'plain' },
          { id: 'let_him_go', label: 'Let him go and publish the certificate', text: 'The certificate says the reliquary is genuine. That is true, and it is not what anybody who reads it will think it says.', effects: { charm: 5, faction: { factionId: 'church', playerStanding: 3 }, worldConditions: { prosperity: 2 }, memory: { tag: 'published_the_half_certificate', weight: 5 } }, tone: 'plain' },
          { id: 'ask_publicly', label: 'Ask him the question in front of the parish', text: 'He gives a beautiful eight-minute answer about the limits of scholarly method that says nothing whatsoever, and the parish is entirely satisfied by it.', effects: { wits: 4, worldConditions: { religiousTension: 2 }, reputation: 3, memory: { tag: 'asked_the_scholar_publicly', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'TWO CHURCHES AND AN ARMED GUARD',
        text: 'A priory and a cathedral both claim the relic. There are now armed men sleeping in the church porch, and the poor of Swineford are asking loudly why holiness needs a guard.',
        choices: [
          { id: 'give_it_up', label: 'Give it to whichever house will take it furthest away', text: 'It goes to the cathedral with an escort. The pilgrims follow it inside a twelvemonth and Swineford goes back to being a village with a wet field.', effects: { faith: 4, faction: { factionId: 'church', playerStanding: 4 }, worldConditions: { prosperity: -4, religiousTension: -4, diseasePressure: -3 }, memory: { tag: 'gave_up_the_relic', weight: 5 } }, tone: 'plain' },
          { id: 'keep_it_here', label: 'Fight to keep it in the parish', text: 'Two years of proctors and letters and one shoving match in the nave. Swineford keeps it, keeps the trade, and keeps the armed men in the porch indefinitely.', effects: { charm: 5, reputation: 6, worldConditions: { prosperity: 4, religiousTension: 5, publicOrder: -2 }, faction: { factionId: 'church', playerStanding: -3 }, memory: { tag: 'kept_the_relic_in_the_parish', weight: 5 } }, tone: 'plain' },
          { id: 'answer_the_poor', label: 'Put the offerings to the poor and say so loudly', text: 'Every penny in the box goes to the burnt-out and the widowed, published at the church door each quarter. Both claimant houses lose interest remarkably quickly.', effects: { faith: 8, reputation: 7, faction: { factionId: 'commons', playerStanding: 6 }, worldConditions: { foodSecurity: 3, religiousTension: -2 }, gold: -6, memory: { tag: 'gave_the_relic_offerings_to_the_poor', weight: 5, note: 'You put every penny of the relic offerings to Swineford’s poor, publicly.' } }, tone: 'good' },
        ],
      },
    ],
  },
  {
    id: 'prophetic_child',
    domain: 'rare',
    minAge: 14,
    beats: [
      {
        title: 'THE CHILD WHO DESCRIBED THE FLOOD',
        text: '{{other.name}} reports that a child in the lane described the mere coming over the causeway four days before a cloud was seen. It came over the causeway.',
        choices: [
          { id: 'write_it_down', label: 'Write down exactly what was said and when', text: 'You take it in the child’s own words with the date and two witnesses. It is either the most valuable page in the parish or a piece of paper.', effects: { wits: 6, memory: { tag: 'recorded_the_first_dream', weight: 4 } }, tone: 'plain' },
          { id: 'tell_priest', label: 'Tell the priest at once', text: 'He is far more worried than impressed and says three things about discernment of spirits that the family does not understand and does not like.', effects: { faith: 4, faction: { factionId: 'church', playerStanding: 2 }, worldConditions: { religiousTension: 2 }, memory: { tag: 'told_the_priest_of_the_dream', weight: 4 } }, tone: 'plain' },
          { id: 'coincidence', label: 'Call it a coincidence, loudly', text: 'You say the obvious thing about a wet spring and a low causeway. Half the lane agrees with you and the other half remembers, in detail, that you said it.', effects: { wits: 4, faith: -2, worldConditions: { religiousTension: -1 }, memory: { tag: 'called_the_dream_coincidence', weight: 4 } }, tone: 'plain' },
        ],
      },
      {
        title: 'A SECOND DREAM NAMES SOMETHING PRIVATE',
        text: 'The child describes a thing about a household that they could not possibly have known and that two adults have spent five years making sure nobody knew.',
        choices: [
          { id: 'protect_child', label: 'Get the child out of the lane for a while', text: 'You send them to kin at Barton for the summer. The household concerned calms down, and the two who are protecting the secret work out exactly who moved the child.', effects: { charm: 4, faith: 4, boundKinRel: { role: 'other', delta: 12 }, legal: { suspicion: 2 }, memory: { tag: 'moved_the_dreaming_child', weight: 5 } }, tone: 'good' },
          { id: 'ask_how', label: 'Ask the child how they knew', text: 'They say a woman told them, and describe somebody who has been dead since before they were born, accurately, including the limp.', effects: { wits: 5, faith: 3, worldConditions: { religiousTension: 3 }, memory: { tag: 'asked_the_child_how_they_knew', weight: 5 } }, tone: 'plain' },
          { id: 'use_it', label: 'Use what the child said', text: 'You go to the household concerned and let them understand that you know. They are extremely accommodating from that day and they hate you for the rest of their lives.', effects: { gold: 12, wits: 5, faith: -6, revealSecretOf: 'other', legal: { suspicion: 3 }, memory: { tag: 'used_the_childs_dream', weight: 5, note: 'You used a child’s vision to blackmail a household.' } }, tone: 'bad' },
        ],
      },
      {
        title: 'CROWDS AT THE DOOR ASKING ABOUT HARVESTS',
        text: 'People come from three parishes to ask about weather, marriages and the price of wool. The child is eight, is frightened of them, and the family is asking for it to stop.',
        choices: [
          { id: 'shut_the_door', label: 'Shut the door and stand in front of it', text: 'You turn away sixty people in a month, some of them angry and more of them desperate. The child sleeps properly for the first time since Lady Day.', effects: { charm: 5, faith: 5, reputation: -3, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'shut_the_door_on_the_crowds', weight: 5 } }, tone: 'good' },
          { id: 'manage_it', label: 'Let them come, but on your terms', text: 'One morning a week, six people, in the churchyard, no money. It is a compromise and it works and the child is still eight and still frightened.', effects: { wits: 5, charm: 4, gold: 4, worldConditions: { religiousTension: 1 }, memory: { tag: 'rationed_the_prophecies', weight: 5 } }, tone: 'plain' },
          { id: 'charge', label: 'Charge a penny a question', text: 'The family is out of debt by Michaelmas and the child has stopped speaking except when asked. Both of those are consequences of the same decision.', effects: { gold: 20, householdState: { wealth: 4 }, faith: -5, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'charged_for_the_prophecies', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'A DREAM THAT SUITS NOBODY',
        text: 'The final dream contradicts what the priest has been preaching and what the lord has been planning, in the same sentence. Everybody in the parish now has to say out loud what they actually believe.',
        choices: [
          { id: 'stand_by_child', label: 'Say you believe the child', text: 'You say it in the nave with both of them present. It costs you the rector’s goodwill, the steward’s goodwill, and absolutely nothing that you needed.', effects: { faith: 8, reputation: 5, faction: { factionId: 'church', playerStanding: -5 }, worldConditions: { religiousTension: 4 }, boundKinRel: { role: 'other', delta: 16 }, memory: { tag: 'stood_by_the_dreaming_child', weight: 5 } }, tone: 'plain' },
          { id: 'call_it_illness', label: 'Say the child is ill and needs quiet', text: 'It is the answer that ends the matter without anybody being burned or believed. The child is left alone and grows up ordinary, which was possibly the point.', effects: { wits: 6, charm: 5, worldConditions: { religiousTension: -4 }, faction: { factionId: 'church', playerStanding: 3 }, memory: { tag: 'called_the_visions_an_illness', weight: 5 } }, tone: 'plain' },
          { id: 'side_with_priest', label: 'Side with the rector', text: 'You say what the rector needs said. The dream is condemned from the pulpit, the family leaves the parish by spring, and you are on very good terms with the church.', effects: { faith: 3, faction: { factionId: 'church', playerStanding: 6 }, boundKinRel: { role: 'other', delta: -18 }, worldConditions: { religiousTension: -3 }, memory: { tag: 'sided_against_the_child', weight: 5 } }, tone: 'bad' },
        ],
      },
      {
        title: 'THE DREAMER COMES BACK GROWN',
        text: 'Years on, the grown dreamer walks back into Swineford to find out which parts of the story the parish decided to keep. They are entirely ordinary now, and they want to know.',
        choices: [
          { id: 'tell_them_true', label: 'Tell them what actually happened', text: 'The flood, the secret, the crowds, the penny a question, what you did about each. They listen the whole way through and thank you, and they do not stay.', effects: { faith: 5, wits: 4, familyReputation: { delta: 3 }, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'told_the_dreamer_the_truth', weight: 5 } }, tone: 'good' },
          { id: 'tell_the_legend', label: 'Tell them the version the parish tells', text: 'It is a better story than the truth and considerably kinder to everybody in it, including you. They know it is not right and do not press.', effects: { charm: 6, reputation: 3, memory: { tag: 'told_the_dreamer_the_legend', weight: 5 } }, tone: 'plain' },
        ],
      },
    ],
  },
];
