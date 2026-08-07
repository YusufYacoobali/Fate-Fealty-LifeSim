import { StoryCopy } from './types';

/**
 * The six relationship stories. All thirty-six beats previously shared three
 * strings — "{{other.name}} asks something difficult of you", "What was left
 * unsaid has grown heavier with time" — and one set of three choices, so a
 * marriage, a blood feud and an affair all played out identically.
 */
export const RELATIONSHIP_STORY_COPY: Record<string, StoryCopy> = {
  friendship_test: {
    1: {
      title: 'A FRIENDSHIP TESTED · THE SURETY',
      text: '{{other.name}} asks you to go surety for a debt of eight shillings. If they default, the bond falls on you, and they are asking in a doorway rather than in front of witnesses.',
      choices: [
        { id: 'stand', label: 'Put your name to the bond', text: 'You sign. They pay the first three instalments early. You decide not to work out whether that is reassurance or a performance.', effects: { charm: 4, gold: -2, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'went_surety_for_a_friend', weight: 4 } }, tone: 'plain' },
        { id: 'lend_instead', label: 'Lend them the eight shillings yourself (8g)', costGold: 8, text: 'Your money, no bond, no lender. It is cleaner and it makes you the creditor, which changes something between you that neither of you names.', effects: { gold: -8, wits: 4, boundKinRel: { role: 'other', delta: 4 }, memory: { tag: 'lent_instead_of_signing', weight: 4 } }, tone: 'plain' },
        { id: 'refuse', label: 'Say no in the doorway', text: 'You say no plainly. They find somebody else within a week and are perfectly civil to you for five years and never ask you for anything again.', effects: { wits: 3, boundKinRel: { role: 'other', delta: -10 }, memory: { tag: 'refused_the_surety', weight: 4 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'A FRIENDSHIP TESTED · WHAT IS SAID AT THE ALEHOUSE',
      text: 'It gets back to you that {{other.name}} has been telling a story about you at the alehouse. It is funny, it is largely true, and it is the part you asked them never to repeat.',
      choices: [
        { id: 'say_it', label: 'Tell them you heard it', text: 'They go red and apologise properly, which is rare, and tell the story again eighteen months later.', effects: { charm: 3, boundKinRel: { role: 'other', delta: -4 }, memory: { tag: 'named_the_alehouse_story', weight: 4 } }, tone: 'plain' },
        { id: 'top_it', label: 'Tell a worse one about them', text: 'You tell a better story about them in the same room a week later. Honours are considered even by everybody except the two of you.', effects: { charm: 6, boundKinRel: { role: 'other', delta: -8 }, reputation: 2, memory: { tag: 'told_a_worse_one_back', weight: 4 } }, tone: 'plain' },
        { id: 'nothing', label: 'Say nothing at all', text: 'You never mention it. It sits there, and every time they tell a story afterwards you are listening for it.', effects: { wits: 3, boundKinRel: { role: 'other', delta: -3 }, memory: { tag: 'swallowed_the_alehouse_story', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'A FRIENDSHIP TESTED · THE OLD DEBT SURFACES',
      text: '{{other.name}} finally says what has actually been wrong: something you did at seventeen that you had entirely forgotten and they have not, once, in twenty years.',
      choices: [
        { id: 'apologise', label: 'Apologise for the thing itself', text: 'Not for how they felt about it. For the thing. It takes a long time and it is the first honest hour the two of you have had in a decade.', effects: { faith: 5, charm: 4, boundKinRel: { role: 'other', delta: 16 }, memory: { tag: 'apologised_for_the_old_thing', weight: 5 } }, tone: 'good' },
        { id: 'dispute_it', label: 'Say it did not happen that way', text: 'You are probably right about the facts. Being right about the facts turns out to have nothing whatever to do with it.', effects: { wits: 4, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'disputed_the_old_thing', weight: 5 } }, tone: 'plain' },
        { id: 'ask_why_now', label: 'Ask why they carried it for twenty years', text: 'The answer is longer and worse than the original grievance and involves three other people. You had no idea about any of it.', effects: { wits: 5, boundKinRel: { role: 'other', delta: 8 }, revealSecretOf: 'other', memory: { tag: 'asked_why_they_carried_it', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'A FRIENDSHIP TESTED · MEND IT OR END IT',
      text: 'Twenty years of this is either about to become forty or about to stop. {{other.name}} is waiting and, for once, is not going to fill the silence.',
      choices: [
        { id: 'mend', label: 'Say you would rather have them than be right', text: 'You say it out loud, which neither of you has ever done. It is excruciating and it works, and you are both slightly different people afterwards.', effects: { faith: 5, charm: 5, boundKinRel: { role: 'other', delta: 20 }, storyVariables: { resolution: 'mend' } }, tone: 'good' },
        { id: 'break', label: 'Say it has run out', text: 'You say it kindly and completely. They do not argue, which tells you they had reached the same place, and you walk out of the same door separately.', effects: { wits: 4, boundKinRel: { role: 'other', delta: -20 }, storyVariables: { resolution: 'break' } }, tone: 'bad' },
      ],
    },
    '5_mend': {
      title: 'A FRIENDSHIP TESTED · TWENTY MORE YEARS',
      text: 'It goes on, repaired and slightly reinforced at the join. Neither of you refers to the conversation and both of you behave differently because of it.',
      choices: [
        { id: 'accept_ending', label: 'Let it go on', text: 'They are at your table at Christmas for the next twenty years and at your burial at the end of it, and they tell that alehouse story at the wake.', effects: { charm: 4, boundKinRel: { role: 'other', delta: 8 }, memory: { tag: 'the_friendship_held', weight: 4, note: 'An old friendship survived being said out loud.' } }, tone: 'good' },
      ],
    },
    '5_break': {
      title: 'A FRIENDSHIP TESTED · THE SAME VILLAGE, SEPARATELY',
      text: 'You live four doors apart for the rest of your lives and are unfailingly polite. Both households know precisely how far the politeness goes.',
      choices: [
        { id: 'accept_ending', label: 'Be polite in the lane', text: 'Nineteen years of good mornings. At the end of it you carry one corner of their coffin because there was nobody else to do it.', effects: { wits: 3, faith: 3, memory: { tag: 'the_friendship_ended_politely', weight: 4 } }, tone: 'plain' },
      ],
    },
  },

  rival_reckoning: {
    1: {
      title: 'A RIVAL RECKONING · THE SAME STRIP OF GROUND',
      text: 'You and {{other.name}} hold strips that meet at a headland, and the headland has been ploughed a furrow the wrong way every year since your fathers were alive.',
      choices: [
        { id: 'measure', label: 'Get the field jury to walk it and measure', text: 'Twelve men, a rope and an afternoon. The answer is that you are both wrong by about half a furrow, which satisfies neither of you.', effects: { wits: 5, worldConditions: { publicOrder: 1 }, boundKinRel: { role: 'other', delta: 4 }, memory: { tag: 'the_field_jury_walked_it', weight: 4 } }, tone: 'plain' },
        { id: 'plough_it', label: 'Plough it your way and see what happens', text: 'You take the furrow. They take it back in October. You take it again in spring, and by the fourth year the furrow is the only thing either of you still says to the other.', effects: { holding: { stores: 3 }, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'took_the_headland_furrow', weight: 4 } }, tone: 'plain' },
        { id: 'concede', label: 'Give them the furrow openly', text: 'You concede it in front of witnesses so that it cannot be conceded twice. They are graceless about it and they never touch it again.', effects: { holding: { stores: -3 }, charm: 4, reputation: 3, boundKinRel: { role: 'other', delta: 6 }, memory: { tag: 'gave_up_the_furrow', weight: 4 } }, tone: 'good' },
      ],
    },
    2: {
      title: 'A RIVAL RECKONING · THE BEAST IN THE CORN',
      text: 'Their ox is in your corn, or your ox is in theirs. The accounts differ and the corn is equally flattened either way. The hayward is standing in the gap looking at both of you.',
      choices: [
        { id: 'pound_it', label: 'Impound the beast and make them redeem it', text: 'Into the pound it goes, and they pay fourpence and a great deal of dignity to get it out. It is entirely lawful and it makes an enemy for a generation.', effects: { gold: 4, reputation: 2, boundKinRel: { role: 'other', delta: -12 }, memory: { tag: 'impounded_their_beast', weight: 4 } }, tone: 'plain' },
        { id: 'mend_the_gap', label: 'Mend the gap together and say nothing about the corn', text: 'Two hours and a hurdle. Neither of you mentions whose beast it was and the gap does not open again while either of you is farming.', effects: { charm: 5, health: -2, boundKinRel: { role: 'other', delta: 12 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'mended_the_gap_together', weight: 4 } }, tone: 'good' },
        { id: 'present_them', label: 'Present them at the next hallmote', text: 'A formal presentment for a beast in the corn. The steward amerces them twopence and writes both your names in the roll next to each other.', effects: { wits: 3, boundKinRel: { role: 'other', delta: -9 }, legal: { suspicion: 1 }, memory: { tag: 'presented_them_at_the_hallmote', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'A RIVAL RECKONING · WHY IT ACTUALLY STARTED',
      text: 'An old woman mentions, without meaning anything by it, that the quarrel began over a marriage that did not happen in 1319 and has had nothing to do with land since.',
      choices: [
        { id: 'tell_them', label: 'Go and tell {{other.name}}', text: 'They already knew. They have known since they were nine and assumed you did too, and the two of you stand in the lane feeling extremely stupid.', effects: { wits: 5, charm: 3, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'learned_why_the_feud_started', weight: 5 } }, tone: 'good' },
        { id: 'use_it', label: 'Find out which family was jilted', text: 'It was theirs. It is a small, mean, useful piece of knowledge and you can hear yourself deciding to keep it.', effects: { wits: 5, boundKinRel: { role: 'other', delta: -6 }, createSecret: { type: 'betrayed_friend', severity: 30, knownByIds: [] }, memory: { tag: 'kept_the_jilting', weight: 5 } }, tone: 'plain' },
        { id: 'ignore', label: 'Decide it changes nothing', text: 'It is sixty years old and both principals are dead. Both the jilted and the jilter are sixty years in the ground. Every furrow since has been your own work.', effects: { wits: 4, memory: { tag: 'the_feud_is_now_ours', weight: 4 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'A RIVAL RECKONING · THE LOVEDAY OFFERED',
      text: 'The parish offers a loveday: both of you on the green, drink provided, and a formal end declared in front of everybody. It only works if you both actually turn up.',
      choices: [
        { id: 'mend', label: 'Turn up', text: 'You are both there, both awkward, both drinking too fast. It is declared ended and, to the surprise of the whole parish, it is.', effects: { charm: 6, reputation: 4, boundKinRel: { role: 'other', delta: 18 }, worldConditions: { publicOrder: 2 }, storyVariables: { resolution: 'mend' } }, tone: 'good' },
        { id: 'break', label: 'Stay away', text: 'You are not there. They are, for an hour, in front of everybody, and that hour is the thing the parish remembers about the whole feud.', effects: { reputation: -5, boundKinRel: { role: 'other', delta: -18 }, worldConditions: { publicOrder: -1 }, storyVariables: { resolution: 'break' } }, tone: 'bad' },
      ],
    },
    '5_mend': {
      title: 'A RIVAL RECKONING · THE HEADLAND SHARED',
      text: 'The headland is ploughed in alternate years by agreement, which is what any reasonable person would have suggested in 1319.',
      choices: [
        { id: 'accept_ending', label: 'Take your year', text: 'You alternate for thirty years without one word of disagreement, and your grandchildren have no idea there was ever anything in it.', effects: { holding: { stores: 4 }, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 1 }, memory: { tag: 'the_headland_shared', weight: 4 } }, tone: 'good' },
      ],
    },
    '5_break': {
      title: 'A RIVAL RECKONING · INHERITED BY THE CHILDREN',
      text: 'Neither of you gives way and both of you die. The strips still meet at the headland and your children take up the furrow exactly where you left it.',
      choices: [
        { id: 'accept_ending', label: 'Leave it to them', text: 'It runs for two more generations on the same half-furrow. Nobody involved after 1360 can say what it was originally about.', effects: { familyReputation: { delta: -2 }, holding: { stores: 2 }, memory: { tag: 'the_feud_inherited', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  marriage_strain: {
    1: {
      title: 'STRAIN IN THE MARRIAGE · THE THIRD BAD HARVEST',
      text: 'Three lean years and {{other.name}} has stopped saying what they think about the decisions that got you here. The silence at the table is louder than the arguing was.',
      choices: [
        { id: 'ask', label: 'Ask them directly what they would have done', text: 'They tell you, at length, and most of it is correct. It is not a pleasant evening and it is the first useful one in three years.', effects: { wits: 5, boundKinRel: { role: 'other', delta: 10 }, householdState: { wealth: 2 }, memory: { tag: 'asked_what_they_would_have_done', weight: 4 } }, tone: 'good' },
        { id: 'defend', label: 'Explain why the decisions were right', text: 'You give a good account of three bad harvests. They agree with all of it and go back to not saying anything.', effects: { charm: 3, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'defended_the_lean_years', weight: 4 } }, tone: 'plain' },
        { id: 'hand_over', label: 'Give them the household accounts entirely', text: 'You hand over the tally and the purse and stop deciding. It is a considerable admission and the accounts are in better order by Lady Day.', effects: { wits: 3, householdState: { wealth: 4 }, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'handed_over_the_accounts', weight: 5 } }, tone: 'good' },
      ],
    },
    2: {
      title: 'STRAIN IN THE MARRIAGE · WHAT THE PARISH HAS NOTICED',
      text: 'The parish has noticed. Somebody asks you a kind question in the churchyard and you understand that it has been chewed over in at least seven households.',
      choices: [
        { id: 'answer_honestly', label: 'Give an honest answer in the churchyard', text: 'You say it is a hard few years and leave it there. It is enough. The talk stops in five of the seven almost at once.', effects: { charm: 4, faith: 3, familyReputation: { delta: 2 }, memory: { tag: 'answered_honestly_in_the_churchyard', weight: 4 } }, tone: 'good' },
        { id: 'perform', label: 'Put on a very good show at the next ale', text: 'Two hours of visible warmth in front of sixty people. It works entirely and you both go home and do not speak.', effects: { charm: 6, familyReputation: { delta: 3 }, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'performed_at_the_ale', weight: 4 } }, tone: 'plain' },
        { id: 'ignore_them', label: 'Let the parish talk', text: 'You do nothing about it and neither does {{other.name}}, which is the first thing you have agreed on in a year.', effects: { wits: 3, familyReputation: { delta: -2 }, boundKinRel: { role: 'other', delta: 4 }, memory: { tag: 'let_the_parish_talk', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'STRAIN IN THE MARRIAGE · THE THING THAT WAS NEVER SAID',
      text: '{{other.name}} says the actual thing at last, on an ordinary Tuesday, about something that happened before the lean years and has nothing to do with money.',
      choices: [
        { id: 'listen', label: 'Sit down and hear all of it', text: 'It takes until the fire is out. You do not defend yourself once. It is the hardest hour of your life and the only one that changes anything.', effects: { faith: 5, wits: 4, boundKinRel: { role: 'other', delta: 18 }, memory: { tag: 'heard_all_of_it', weight: 5 } }, tone: 'good' },
        { id: 'answer_back', label: 'Say your own version', text: 'You have one and it is fair. Both versions are now in the room and neither of you can put either of them away again.', effects: { charm: 3, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'gave_your_own_version', weight: 5 } }, tone: 'plain' },
        { id: 'walk_out', label: 'Go and see to the beasts', text: 'You go out to the byre for an hour. When you come back the fire is banked and they have gone up, and it is never raised again.', effects: { boundKinRel: { role: 'other', delta: -14 }, createSecret: { type: 'hidden_debt', severity: 35, knownByIds: [] }, memory: { tag: 'went_out_to_the_beasts', weight: 5 } }, tone: 'bad' },
      ],
    },
    4: {
      title: 'STRAIN IN THE MARRIAGE · WHAT THE NEXT TWENTY YEARS LOOK LIKE',
      text: 'Whatever is decided now is what the household is until one of you dies. There is no version of this where it simply carries on unaddressed.',
      choices: [
        { id: 'mend', label: 'Start again, on stated terms', text: 'You agree, out loud, what each of you will actually do differently. It is unromantic and specific and it is the only kind that ever holds.', effects: { faith: 5, charm: 5, boundKinRel: { role: 'other', delta: 20 }, householdState: { wealth: 3 }, storyVariables: { resolution: 'mend' } }, tone: 'good' },
        { id: 'break', label: 'Agree to live as two households under one roof', text: 'Separate work, separate purse, one table for the children’s sake. It is entirely functional and it is not a marriage.', effects: { wits: 4, boundKinRel: { role: 'other', delta: -16 }, householdState: { wealth: 2 }, storyVariables: { resolution: 'break' } }, tone: 'plain' },
      ],
    },
    '5_mend': {
      title: 'STRAIN IN THE MARRIAGE · THE STATED TERMS HOLD',
      text: 'The terms hold, mostly, with two renegotiations and one very bad Christmas. The household comes out of the lean years intact and rather better run.',
      choices: [
        { id: 'accept_ending', label: 'Keep to the terms', text: 'Thirty more years. They are the ones who closes your eyes at the end of it and they are still cross about the second renegotiation.', effects: { faith: 5, boundKinRel: { role: 'other', delta: 10 }, familyReputation: { delta: 4 }, householdState: { wealth: 3 }, memory: { tag: 'the_marriage_renegotiated', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_break': {
      title: 'STRAIN IN THE MARRIAGE · ONE ROOF, TWO HOUSEHOLDS',
      text: 'The arrangement works exactly as designed. The children grow up in a house that is warm, well-run and quiet in a way they cannot explain to anybody until they are forty.',
      choices: [
        { id: 'accept_ending', label: 'Keep the arrangement', text: 'It lasts. Both purses prosper, both of you are civil, and neither of you is ever asked by anybody whether it was worth it.', effects: { householdState: { wealth: 4 }, wits: 3, familyReputation: { delta: 1 }, memory: { tag: 'one_roof_two_households', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  blood_between_siblings: {
    1: {
      title: 'BLOOD BETWEEN SIBLINGS · WHO SAT UP WITH THE DYING',
      text: '{{other.name}} sat up seven nights with your parent at the end. You were a day’s walk away with a holding to run, and neither of you has yet said one word about it.',
      choices: [
        { id: 'thank_them', label: 'Say plainly that they did it and you did not', text: 'You say it without excuses. It does not make it even and it stops it becoming the thing that never gets said.', effects: { faith: 5, charm: 3, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'named_who_sat_up', weight: 4 } }, tone: 'good' },
        { id: 'explain', label: 'Explain about the holding', text: 'It is a complete and accurate explanation. They listen to all of it and say, evenly, that they know.', effects: { wits: 3, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'explained_about_the_holding', weight: 4 } }, tone: 'plain' },
        { id: 'pay_it', label: 'Make it up in goods (10g)', costGold: 10, text: 'Ten shillings’ worth of things they need and did not ask for. They take it because they need it and it is not what was owed.', effects: { gold: -10, boundKinRel: { role: 'other', delta: 4 }, memory: { tag: 'paid_for_the_eleven_nights', weight: 4 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'BLOOD BETWEEN SIBLINGS · THE DIVISION OF GOODS',
      text: 'The moveables have to be divided: two beds, a brass pot, the good cloak, and a psalter nobody in the family can read.',
      choices: [
        { id: 'let_them_pick', label: 'Let {{other.name}} choose first, every time', text: 'They pick first on every item and take slightly less than half by weight, which you both notice and neither mentions.', effects: { charm: 4, gold: -4, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'let_them_choose_first', weight: 4 } }, tone: 'good' },
        { id: 'appraise', label: 'Have it appraised by two neighbours', text: 'Two men, an afternoon, and a written valuation. It is scrupulously fair and it turns the division of your parent’s bed into an accounting exercise.', effects: { wits: 5, boundKinRel: { role: 'other', delta: -4 }, householdState: { wealth: 2 }, memory: { tag: 'appraised_the_moveables', weight: 4 } }, tone: 'plain' },
        { id: 'take_psalter', label: 'Take the psalter and give them the rest', text: 'They get everything of value and you get a book neither of you can read. In forty years your grandchild can, and it turns out to have names in the back.', effects: { gold: -8, wits: 4, faith: 4, boundKinRel: { role: 'other', delta: 8 }, memory: { tag: 'took_the_psalter', weight: 5, note: 'You took the family psalter over everything of value.' } }, tone: 'good' },
      ],
    },
    3: {
      title: 'BLOOD BETWEEN SIBLINGS · WHAT WAS SAID AT THE END',
      text: '{{other.name}} finally repeats what your parent said on the last night. It is about you, it is not kind, and there is no way of knowing whether it is being reported accurately.',
      choices: [
        { id: 'believe_it', label: 'Take it as said', text: 'You accept it, entire, and do not ask them to soften it. It is the harder road and it removes the weapon from the argument permanently.', effects: { faith: 5, wits: 4, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'took_the_last_words_as_said', weight: 5 } }, tone: 'plain' },
        { id: 'doubt_it', label: 'Say you do not believe them', text: 'You may well be right. They will never forgive being called a liar about the seven nights, and that is what they heard.', effects: { charm: -3, boundKinRel: { role: 'other', delta: -18 }, memory: { tag: 'called_them_a_liar', weight: 5 } }, tone: 'bad' },
        { id: 'ask_more', label: 'Ask what else was said', text: 'A great deal more, most of it about {{other.name}} and none of it kinder. They have been carrying all of it alone since the funeral.', effects: { wits: 5, faith: 4, boundKinRel: { role: 'other', delta: 14 }, memory: { tag: 'asked_what_else_was_said', weight: 5 } }, tone: 'good' },
      ],
    },
    4: {
      title: 'BLOOD BETWEEN SIBLINGS · THE LAST OF THE FAMILY',
      text: 'You are the last two of your generation. Whatever the two of you settle now is what your children inherit as the family’s ordinary way of behaving.',
      choices: [
        { id: 'mend', label: 'Settle it properly, in front of the children', text: 'You do it deliberately and where they can see: the nights, the goods, the words. Your children grow up in a family that repairs things.', effects: { faith: 6, charm: 5, boundKinRel: { role: 'other', delta: 20 }, familyReputation: { delta: 5 }, storyVariables: { resolution: 'mend' } }, tone: 'good' },
        { id: 'break', label: 'Divide the family and be done', text: 'Two households, one surname, no visits. Your children are told a version that makes sense and is not true.', effects: { boundKinRel: { role: 'other', delta: -20 }, familyReputation: { delta: -3 }, householdState: { wealth: 2 }, storyVariables: { resolution: 'break' } }, tone: 'bad' },
      ],
    },
    '5_mend': {
      title: 'BLOOD BETWEEN SIBLINGS · ONE FAMILY, TWO ROOFS',
      text: 'The families stay one family across two roofs. The cousins grow up in and out of each other’s doors and cannot imagine it having been otherwise.',
      choices: [
        { id: 'accept_ending', label: 'Keep the doors open', text: 'Both households come through two bad decades because there were always two households. Nobody afterwards can point to when it was decided.', effects: { faith: 5, familyReputation: { delta: 5 }, householdState: { capacity: 1 }, memory: { tag: 'one_family_two_roofs', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_break': {
      title: 'BLOOD BETWEEN SIBLINGS · TWO FAMILIES, ONE NAME',
      text: 'The cousins grow up strangers with the same surname and meet properly for the first time at a funeral, where somebody has to introduce them.',
      choices: [
        { id: 'accept_ending', label: 'Let them be strangers', text: 'They are, thoroughly. In 1401 two of them marry the same family from opposite sides and neither knows the connection.', effects: { familyReputation: { delta: -3 }, householdState: { wealth: 2 }, memory: { tag: 'two_families_one_name', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  parent_and_child: {
    1: {
      title: 'PARENT AND CHILD · THE ROAD ALREADY CHOSEN',
      text: '{{other.name}} says, in the middle of an ordinary afternoon, that the life laid out for them is not the one they are going to have.',
      choices: [
        { id: 'ask_what', label: 'Ask what they want instead', text: 'They have thought about it far more than you expected and the answer is specific, plausible and expensive.', effects: { wits: 4, charm: 3, boundKinRel: { role: 'other', delta: 12 }, memory: { tag: 'asked_what_they_wanted', weight: 4 } }, tone: 'good' },
        { id: 'explain_the_road', label: 'Explain why the road exists', text: 'The holding, the custom, the mouths. It is all true and they have heard it before and they were not asking about that.', effects: { wits: 3, boundKinRel: { role: 'other', delta: -8 }, memory: { tag: 'explained_the_road', weight: 4 } }, tone: 'plain' },
        { id: 'not_now', label: 'Say it can wait until after harvest', text: 'It waits until after harvest and then until after Christmas. By spring they have stopped raising it, which you briefly mistake for agreement.', effects: { holding: { stores: 4 }, boundKinRel: { role: 'other', delta: -10 }, memory: { tag: 'put_it_off_until_after_harvest', weight: 4 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'PARENT AND CHILD · SOMEBODY ELSE IS ADVISING THEM',
      text: 'Somebody outside the household has been giving {{other.name}} advice, and it is better advice than yours, and they have started quoting it.',
      choices: [
        { id: 'meet_them', label: 'Go and meet whoever it is', text: 'They are decent, competent, and have no designs on anything. It is a considerable relief and a small, specific injury.', effects: { wits: 5, charm: 3, boundKinRel: { role: 'other', delta: 8 }, memory: { tag: 'met_the_other_adviser', weight: 4 } }, tone: 'good' },
        { id: 'forbid', label: 'Forbid the connection', text: 'You forbid it clearly. It continues, considerably more carefully, and you are now outside a conversation you used to be inside.', effects: { boundKinRel: { role: 'other', delta: -14 }, memory: { tag: 'forbade_the_adviser', weight: 5 } }, tone: 'bad' },
        { id: 'outbid', label: 'Find them a better teacher yourself', text: 'You spend three months and nine shillings finding somebody better. It works, and it is transparently an answer to the other one.', effects: { gold: -8, wits: 4, boundKinRel: { role: 'other', delta: 6 }, memory: { tag: 'found_a_better_teacher', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'PARENT AND CHILD · WHAT THEY THINK YOU DID TO THEM',
      text: '{{other.name}} tells you what they believe you did to them as a child. Two of the three things you have no memory of at all and one of them you remember exactly.',
      choices: [
        { id: 'own_the_one', label: 'Own the one you remember', text: 'You take that one entirely and say honestly that you do not remember the other two. It is the only answer that is not a negotiation.', effects: { faith: 6, boundKinRel: { role: 'other', delta: 16 }, memory: { tag: 'owned_the_one_you_remembered', weight: 5 } }, tone: 'good' },
        { id: 'deny', label: 'Say it did not happen like that', text: 'It probably did not. They have built half a life around it happening like that, and you have just told them the half life was a mistake.', effects: { boundKinRel: { role: 'other', delta: -16 }, wits: 3, memory: { tag: 'denied_their_account', weight: 5 } }, tone: 'bad' },
        { id: 'own_all', label: 'Take all three', text: 'You accept things you did not do to end an argument you are losing. It works immediately and it is a debt that comes due later.', effects: { charm: 4, boundKinRel: { role: 'other', delta: 10 }, faith: -3, createSecret: { type: 'hidden_debt', severity: 30, knownByIds: [] }, memory: { tag: 'took_all_three', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'PARENT AND CHILD · THEY ARE GOING EITHER WAY',
      text: 'They are leaving, or staying, and it is still genuinely open. What they are asking for is not permission. It is whether the door stays open behind them.',
      choices: [
        { id: 'mend', label: 'Tell them the door stays open', text: 'You say it plainly and mean it, and you say it before they have decided, when it still costs you something to say.', effects: { faith: 6, charm: 5, boundKinRel: { role: 'other', delta: 20 }, familyReputation: { delta: 3 }, storyVariables: { resolution: 'mend' } }, tone: 'good' },
        { id: 'break', label: 'Tell them it is this house or the road', text: 'You put it as a choice because you are certain they will choose the house. They are on the Cambridge road inside a fortnight.', effects: { boundKinRel: { role: 'other', delta: -20 }, holding: { stores: -4 }, familyReputation: { delta: -2 }, storyVariables: { resolution: 'break' } }, tone: 'bad' },
      ],
    },
    '5_mend': {
      title: 'PARENT AND CHILD · THEY COME BACK IN MARCH',
      text: 'They go, and they come back in March, and they go again, and the door is open every single time. It is a considerably better arrangement than either of you expected.',
      choices: [
        { id: 'accept_ending', label: 'Keep the door open', text: 'They are at the burial and they bring their own children, who know the house and know the way in without being shown.', effects: { faith: 5, boundKinRel: { role: 'other', delta: 10 }, familyReputation: { delta: 4 }, memory: { tag: 'the_door_stayed_open', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_break': {
      title: 'PARENT AND CHILD · A LETTER EVERY FOURTH YEAR',
      text: 'They write occasionally, briefly, and always at a distance that is carefully maintained on both sides. They are perfectly well and they do not come back.',
      choices: [
        { id: 'accept_ending', label: 'Keep the letters', text: 'Six letters in eighteen years, kept in the psalter. The last one arrives after you are already ill and you do not manage to answer it.', effects: { faith: 3, familyReputation: { delta: -2 }, memory: { tag: 'six_letters_in_twenty_years', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  hidden_affair: {
    1: {
      title: 'THE HIDDEN AFFAIR · WHAT YOU ARE FAIRLY SURE OF',
      text: 'You are fairly sure about {{other.name}}. Not certain. Fairly sure, on the evidence of three small things that would each be nothing on their own.',
      choices: [
        { id: 'ask_directly', label: 'Ask them outright', text: 'They deny it, well, and are careful for six weeks and then stop being careful. Now you are certain and you have used up the asking.', effects: { wits: 4, boundKinRel: { role: 'other', delta: -6 }, memory: { tag: 'asked_outright', weight: 4 } }, tone: 'plain' },
        { id: 'wait', label: 'Say nothing and watch', text: 'You watch through the summer and are entirely certain by Lammas. Four months of knowing and saying nothing changes you more than the fact does.', effects: { wits: 5, health: -3, memory: { tag: 'watched_for_four_months', weight: 5 } }, tone: 'plain' },
        { id: 'let_it_be', label: 'Decide you do not want to know', text: 'You put it down deliberately. It is a real decision and it holds for three years. Most people cannot manage a fortnight.', effects: { faith: 3, charm: 3, boundKinRel: { role: 'other', delta: 4 }, memory: { tag: 'chose_not_to_know', weight: 5 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE HIDDEN AFFAIR · SOMEBODY ELSE KNOWS',
      text: 'A neighbour makes it clear that they know too, and that they are the sort of person who will mention it at the wrong moment for the pleasure of the thing.',
      choices: [
        { id: 'buy_silence', label: 'Buy their silence (10g)', costGold: 10, text: 'Ten shillings and they are silent for a year and considerably more expensive after that. You have taught them exactly what it is worth.', effects: { gold: -10, legal: { suspicion: 3 }, createSecret: { type: 'secret_lover', severity: 50, knownByIds: [] }, memory: { tag: 'bought_the_neighbours_silence', weight: 5 } }, tone: 'plain' },
        { id: 'get_ahead', label: 'Tell somebody you trust first', text: 'You put your own version into the parish before theirs. It is a cold, effective thing to do and it works completely.', effects: { wits: 5, charm: 4, familyReputation: { delta: -2 }, memory: { tag: 'got_ahead_of_the_talk', weight: 5 } }, tone: 'plain' },
        { id: 'ignore_them', label: 'Give them nothing to work with', text: 'You behave with total normality for as long as it takes them to get bored. It takes nine months and it is exhausting.', effects: { charm: 5, health: -3, wits: 3, memory: { tag: 'outlasted_the_gossip', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE HIDDEN AFFAIR · THE CHURCH COURT SITS AT EASTER',
      text: 'The archdeacon’s court sits at Easter and takes presentments for adultery. A presentment means public penance in the market place, barefoot, with a candle.',
      choices: [
        { id: 'end_it_quietly', label: 'Get it ended before Easter', text: 'You do it yourself, quietly, with two conversations and no shouting. It ends. Whether it stays ended is another question and not one you can settle.', effects: { wits: 6, charm: 5, boundKinRel: { role: 'other', delta: -4 }, worldConditions: { religiousTension: -1 }, memory: { tag: 'ended_it_before_easter', weight: 5 } }, tone: 'plain' },
        { id: 'let_the_court', label: 'Let the presentment go forward', text: 'The penance is performed in the market place in front of everybody who has ever known them. It is lawful, it is what the court is for, and you watched.', effects: { faith: -3, reputation: 3, boundKinRel: { role: 'other', delta: -20 }, worldConditions: { religiousTension: 3 }, memory: { tag: 'let_the_penance_happen', weight: 5 } }, tone: 'bad' },
        { id: 'take_it_on', label: 'Swear before the court that there was nothing in it', text: 'You perjure yourself in a church court to keep somebody out of the market place. It works. You are the only person in the building who knows what it cost.', effects: { faith: -6, charm: 4, boundKinRel: { role: 'other', delta: 18 }, legal: { suspicion: 4 }, memory: { tag: 'perjured_yourself_for_them', weight: 5 } }, tone: 'plain' },
      ],
    },
    4: {
      title: 'THE HIDDEN AFFAIR · WHAT THE HOUSEHOLD IS NOW',
      text: 'Everything is known by everybody who matters. What remains is what the household is going to be for the next thirty years, and that is genuinely undecided.',
      choices: [
        { id: 'mend', label: 'Rebuild it, knowing all of it', text: 'You start from what is actually true rather than from what should have been. It is slow, it is unglamorous, and it holds better than the first version did.', effects: { faith: 5, charm: 4, boundKinRel: { role: 'other', delta: 18 }, familyReputation: { delta: 2 }, storyVariables: { resolution: 'mend' } }, tone: 'good' },
        { id: 'break', label: 'Separate, formally and quietly', text: 'A separation from bed and board, done properly through the court, with the property divided. It is dignified, it is final, and the parish is disappointed by how little there is to watch.', effects: { wits: 5, boundKinRel: { role: 'other', delta: -18 }, householdState: { wealth: -3 }, familyReputation: { delta: -2 }, storyVariables: { resolution: 'break' } }, tone: 'plain' },
      ],
    },
    '5_mend': {
      title: 'THE HIDDEN AFFAIR · BUILT ON WHAT IS ACTUALLY TRUE',
      text: 'The household goes on and is, oddly, better. Nothing is assumed, which turns out to have been the trouble with it in the first place.',
      choices: [
        { id: 'accept_ending', label: 'Go on', text: 'Twenty-eight more years, one very bad month in 1371, and no more surprises of any kind. Neither of you ever explains it to anybody.', effects: { faith: 5, boundKinRel: { role: 'other', delta: 10 }, familyReputation: { delta: 3 }, memory: { tag: 'rebuilt_on_the_truth', weight: 5 } }, tone: 'good' },
      ],
    },
    '5_break': {
      title: 'THE HIDDEN AFFAIR · SEPARATED FROM BED AND BOARD',
      text: 'The separation is entered in the court book and the property is divided to the halfpenny. Both households are solvent, quiet, and perfectly correct with each other.',
      choices: [
        { id: 'accept_ending', label: 'Sign the division', text: 'You sign. You see them at church every week for thirty years and exchange the same six words, and both of you mean them.', effects: { wits: 4, householdState: { wealth: -2 }, familyReputation: { delta: -1 }, memory: { tag: 'separated_from_bed_and_board', weight: 5 } }, tone: 'plain' },
      ],
    },
  },
};
