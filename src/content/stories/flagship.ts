import { StoryCopy } from './types';

/**
 * The five flagship stories. Their premise text was already written per beat;
 * what was generated was every choice in them — three "approach" options with
 * one shared outcome line each, repeated at all thirty nodes, and one shared
 * set of endings.
 *
 * Beat 3 MUST set `approach` (bold / cautious / family) and beat 5 MUST set
 * `resolution` (reconcile / hardline / withdraw), or the story silently takes
 * its default branch. Each binds two named roles — see `persistentStories.ts`.
 */
export const FLAGSHIP_STORY_COPY: Record<string, StoryCopy> = {
  rivals_rise: {
    1: {
      title: 'THE RIVAL · A CONTEST MADE PUBLIC',
      text: "{{rival.name}} challenges you to carry a sack of turnips across the village green. They have drawn a finish line, gathered a crowd and already practised their victory bow.",
      choices: [
        { id: 'compete', label: 'Win the turnip race', text: "You cross first, wheezing turnip dust. {{rival.name}} insists the sack was uneven. The crowd insists they do the victory bow anyway.", effects: { charm: 5, health: -3, reputation: 4, memory: { tag: 'met_the_rival_head_on', weight: 4 } }, tone: 'plain' },
        { id: 'decline', label: 'Refuse to make it a contest', text: "You ask why anyone should carry turnips for free. The crowd drifts away. {{rival.name}} is left guarding two sacks and an excellent bow.", effects: { wits: 5, charm: -2, memory: { tag: 'refused_the_rivals_contest', weight: 4 } }, tone: 'plain' },
        { id: 'befriend', label: 'Try to make an ally of them instead', text: "You offer to carry the sack together. {{rival.name}} accuses you of pitying them, then drops it on their own foot.", effects: { charm: 3, boundKinRel: { role: 'rival', delta: -6 }, memory: { tag: 'offered_the_rival_friendship', weight: 4 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE RIVAL · A PATRON TAKES AN INTEREST',
      text: "{{patron.name}} has hired {{rival.name}} to supervise the prize pigs. Your rival struts through the market wearing a brass badge that says Deputy Pig Marshal. They tell you the job comes with paid meals.",
      choices: [
        { id: 'court_patron', label: 'Put yourself in front of {{patron.name}} too', text: "You offer to keep the pig accounts. {{patron.name}} likes your confidence. {{rival.name}} now has to explain every missing turnip to you.", effects: { charm: 5, path: { court: 2 }, reputation: 3, memory: { tag: 'courted_the_same_patron', weight: 4 } }, tone: 'plain' },
        { id: 'build_own', label: 'Improve your own vegetable patch', text: "You improve your own vegetable patch and fill the store cupboard. No patron required. No badge either, which is a mercy.", effects: { wits: 5, holding: { stores: 5 }, householdState: { wealth: 3 }, memory: { tag: 'built_without_a_patron', weight: 4 } }, tone: 'good' },
        { id: 'undermine', label: 'Let {{patron.name}} hear the worst of them', text: "You tell {{patron.name}} that the Deputy Pig Marshal lost a pig inside the chapel. It is true. Repeating the part about the baptismal font is optional, but you do.", effects: { charm: 3, faith: -3, boundKinRel: { role: 'rival', delta: -10 }, memory: { tag: 'poisoned_the_patrons_ear', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE RIVAL · A RUMOUR WITH ONE SOURCE',
      text: "{{rival.name}} claims you stole the church bell’s clapper and sold it as a soup ladle. Three market sellers repeat the story. Customers are starting to avoid your household.",
      choices: [
        { id: 'bold', label: 'Name {{rival.name}} as the source, publicly', text: "You name {{rival.name}} as the liar and demand they produce the alleged ladle. Half the market cheers. The other half wants to see the ladle.", effects: { charm: 4, reputation: 5, boundKinRel: { role: 'rival', delta: -14 }, worldConditions: { publicOrder: -1 }, storyVariables: { approach: 'bold' }, memory: { tag: 'named_the_rival_publicly', weight: 5 } }, tone: 'plain' },
        { id: 'cautious', label: 'Trace it properly and say nothing yet', text: "You question the sellers. Each heard the tale from {{rival.name}}, who received a sealed note from {{patron.name}}. You keep the note.", effects: { wits: 7, revealSecretOf: 'rival', storyVariables: { approach: 'cautious' }, memory: { tag: 'traced_the_rumour_quietly', weight: 5 } }, tone: 'plain' },
        { id: 'family', label: 'Make sure it cannot touch your household', text: "You settle your household’s accounts in front of witnesses. The traders keep selling to your family, though the ladle jokes continue.", effects: { householdState: { wealth: 3, status: 2 }, familyReputation: { delta: 2 }, reputation: -3, storyVariables: { approach: 'family' }, memory: { tag: 'shielded_the_household_from_the_rumour', weight: 5 } }, tone: 'plain' },
      ],
    },
    '4_bold': {
      title: 'THE RIVAL · THE FEUD IN DAYLIGHT',
      text: "The market is arguing over the missing clapper. {{rival.name}} demands an apology. {{patron.name}} offers to settle the quarrel if you both work for lower wages.",
      choices: [
        { id: 'escalate', label: 'Press it while you have the advantage', text: "You ask {{rival.name}} to describe the ladle. They change its size three times. The crowd laughs, then gets tired of you asking a fourth time.", effects: { reputation: 5, charm: -3, boundKinRel: { role: 'rival', delta: -12 }, memory: { tag: 'pressed_the_public_feud', weight: 4 } }, tone: 'plain' },
        { id: 'hold', label: 'Say your piece once and then stop', text: "You point out that the church bell still rings. Then you stop talking. The bell supplies a considerably better argument.", effects: { wits: 5, charm: 5, reputation: 4, memory: { tag: 'said_it_once_and_stopped', weight: 4 } }, tone: 'good' },
      ],
    },
    '4_cautious': {
      title: 'THE RIVAL · THE SHAPE OF THE THING',
      text: "The sealed note proves {{patron.name}} invented the clapper story. A second note offers both of you lower wages while your reputations recover. Your patron is paying you less to clean up their own lie.",
      choices: [
        { id: 'use_it', label: 'Use what you have found', text: "You send both notes to the guild clerk. The wage-cut scheme collapses. {{rival.name}} blames you for exposing how easily they were fooled.", effects: { wits: 6, reputation: 4, boundKinRel: { role: 'rival', delta: -10 }, memory: { tag: 'took_the_structure_apart', weight: 4 } }, tone: 'plain' },
        { id: 'show_them', label: 'Show {{rival.name}} what you found', text: "You show {{rival.name}} both notes. They read the wage offer twice, then call {{patron.name}} a name usually reserved for diseased turnips.", effects: { wits: 5, charm: 4, boundKinRel: { role: 'rival', delta: 14 }, memory: { tag: 'showed_the_rival_the_truth', weight: 5 } }, tone: 'good' },
      ],
    },
    '4_family': {
      title: 'THE RIVAL · IT COMES TO THE DOOR ANYWAY',
      text: "{{rival.name}} tells the miller to refuse your household’s grain. The miller asks you to settle the feud before everyone has to eat turnip soup.",
      choices: [
        { id: 'draw_line', label: 'Tell them the household is out of it', text: "You tell {{rival.name}} to bring complaints to you, not the miller. They agree to leave your household alone and immediately insult you instead.", effects: { charm: 5, reputation: 3, boundKinRel: { role: 'rival', delta: -6 }, familyReputation: { delta: 3 }, memory: { tag: 'drew_the_line_at_the_household', weight: 5 } }, tone: 'good' },
        { id: 'answer_in_kind', label: 'Go after theirs', text: "You persuade a baker to refuse their household’s flour. Now two innocent families need supper and both shopkeepers regret knowing you.", effects: { reputation: 4, faith: -4, boundKinRel: { role: 'rival', delta: -14 }, familyReputation: { delta: -2 }, memory: { tag: 'went_after_their_household', weight: 5 } }, tone: 'bad' },
      ],
    },
    5: {
      title: 'THE RIVAL · BEFORE THE WHOLE HALL',
      text: "At the village hall, {{rival.name}} repeats the bell-clapper accusation before {{patron.name}}. The priest arrives carrying the actual clapper. He would like everyone to stop discussing his ladle.",
      choices: [
        { id: 'reconcile', label: 'Offer them terms in front of everyone', text: "You offer a truce: no more rumours, no pressure on either household, and one public apology each. {{rival.name}} agrees. The priest takes his clapper home.", effects: { charm: 7, faith: 4, reputation: 4, boundKinRel: { role: 'rival', delta: 16 }, worldConditions: { publicOrder: 2 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Make them repeat the accusation beside the evidence', text: "You ask the priest to hold up the clapper while {{rival.name}} repeats the accusation. They cannot finish. You have won, and made the humiliation needlessly thorough.", effects: { reputation: 8, charm: -4, boundKinRel: { role: 'rival', delta: -20 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'withdraw', label: 'Decline to answer and leave the hall', text: "You leave the hall to finish your household’s accounts. The crowd calls it surrender. Your family calls it finally being home for supper.", effects: { wits: 4, reputation: -5, householdState: { wealth: 2 }, storyVariables: { resolution: 'withdraw' } }, tone: 'plain' },
      ],
    },
    '6_reconciled': {
      title: 'THE RIVAL · TWO LIVES MEASURED AGAINST EACH OTHER',
      text: "{{rival.name}} meets you at market without an insult prepared. You discuss turnip prices. It is an unexpectedly pleasant improvement.",
      choices: [
        { id: 'accept_ending', label: 'Let it be finished', text: "You and {{rival.name}} jointly challenge a trader’s false weights. The trader looks at both of you and quietly fetches the honest scales.", effects: { charm: 5, reputation: 5, boundKinRel: { role: 'rival', delta: 12 }, familyReputation: { delta: 4 }, memory: { tag: 'the_rivalry_ended_by_agreement', weight: 5, note: 'The rivalry ended with public apologies and a promise to leave both households alone.' } }, tone: 'good' },
      ],
    },
    '6_hard': {
      title: 'THE RIVAL · WHAT THE RIVALRY MADE',
      text: "You and {{rival.name}} pass on opposite sides of the market. The bell rings overhead. Neither of you mentions kitchen utensils.",
      choices: [
        { id: 'accept_ending', label: 'Take what it made of you', text: "You keep your accounts precise and your accusations provable. Your family has learned the same lesson, at the cost of many uncomfortable dinners.", effects: { wits: 5, reputation: 4, familyReputation: { delta: 1 }, memory: { tag: 'the_rivalry_never_ended', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  lean_harvest: {
    1: {
      title: 'THE LEAN HARVEST · THE PRICE MOVES BEFORE THE BELL STOPS',
      text: 'The corn comes in sparse and damp. {{merchant.name}} has raised the price of a bushel before the church bell has finished ringing the news.',
      choices: [
        { id: 'buy_now', label: 'Buy at the new price at once (10g)', costGold: 10, text: 'Ten shillings for grain that was eight yesterday. It is a bad price and it is the best price anybody in Swineford gets for the next twelve months.', effects: { gold: -10, householdState: { food: 6 }, wits: 3, memory: { tag: 'bought_early_in_the_lean_year', weight: 4 } }, tone: 'plain' },
        { id: 'challenge_price', label: 'Demand the assize price be enforced', text: 'You cite the assize at the reeve in front of the market. He agrees, reluctantly, and {{merchant.name}} sells at the lawful price and remembers who made him.', effects: { wits: 5, reputation: 4, worldConditions: { foodSecurity: 2 }, boundKinRel: { role: 'merchant', delta: -12 }, memory: { tag: 'enforced_the_assize', weight: 4 } }, tone: 'good' },
        { id: 'wait', label: 'Wait and see if it settles', text: 'It does not settle. By Martinmas it is fourteen and by Candlemas there is none at any price.', effects: { wits: 2, householdState: { food: -3 }, memory: { tag: 'waited_out_the_price', weight: 4 } }, tone: 'bad' },
      ],
    },
    2: {
      title: 'THE LEAN HARVEST · WHAT {{reeve.name}} SAYS ABOUT THE STORES',
      text: 'Households are missing meals and {{reeve.name}} keeps saying the common stores are being managed fairly. Nobody has seen inside the store since Michaelmas.',
      choices: [
        { id: 'demand_count', label: 'Demand the store be counted in front of witnesses', text: 'Six men, a tally and an afternoon. It is being managed fairly, actually, and there is a great deal less of it than anybody had assumed.', effects: { wits: 5, reputation: 3, worldConditions: { publicOrder: 2 }, memory: { tag: 'counted_the_common_store', weight: 4 } }, tone: 'good' },
        { id: 'feed_quietly', label: 'Feed the worst-off out of your own stores', text: 'You do it without announcing it, which means five households eat and the rest of the lane assumes nobody did anything.', effects: { householdState: { food: -5 }, faith: 5, faction: { factionId: 'commons', playerStanding: 4 }, memory: { tag: 'fed_them_quietly', weight: 4 } }, tone: 'good' },
        { id: 'back_reeve', label: 'Back {{reeve.name}} in public', text: 'You say the stores are being managed properly. It is true, and it buys the parish four weeks of calm that nobody has earned.', effects: { charm: 4, boundKinRel: { role: 'reeve', delta: 12 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'backed_the_reeve', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE LEAN HARVEST · A STOREHOUSE BROKEN IN THE NIGHT',
      text: 'The store is broken open and emptied. Hungry neighbours are looking at the ground, {{merchant.name}} is demanding hangings, and how this is answered decides how the winter goes.',
      choices: [
        { id: 'bold', label: 'Open the remaining stores yourself, publicly', text: 'You open the doors and distribute in daylight before anybody can stop you. It is theft with better manners and it is entirely defensible to everybody who is hungry.', effects: { charm: 5, reputation: 5, worldConditions: { foodSecurity: 4, publicOrder: -2 }, faction: { factionId: 'commons', playerStanding: 6 }, storyVariables: { approach: 'bold' }, memory: { tag: 'opened_the_stores_publicly', weight: 5 } }, tone: 'plain' },
        { id: 'cautious', label: 'Audit every sack and every price first', text: 'Three weeks of tallies. You establish exactly how much grain exists in Swineford and exactly who is sitting on it, and both numbers surprise everybody.', effects: { wits: 7, worldConditions: { publicOrder: 1 }, revealSecretOf: 'merchant', storyVariables: { approach: 'cautious' }, memory: { tag: 'audited_the_grain', weight: 5 } }, tone: 'plain' },
        { id: 'family', label: 'Secure your own household’s grain first', text: 'You move your stores somewhere defensible and put a man on them. Your household eats all winter and is watched doing it.', effects: { householdState: { food: 6 }, holding: { security: 4 }, faction: { factionId: 'commons', playerStanding: -4 }, storyVariables: { approach: 'family' }, memory: { tag: 'secured_your_own_grain', weight: 5 } }, tone: 'plain' },
      ],
    },
    '4_bold': {
      title: 'THE LEAN HARVEST · THE GRANARY OPEN AND THE CROWD IN IT',
      text: 'The doors are open and the distribution has become a crush. Generosity has turned into a problem of order within about ninety seconds.',
      choices: [
        { id: 'order_it', label: 'Impose a list and a queue', text: 'You get a list of households, a rota and two large men on the door. It is slower, it is fairer, and nobody is trampled.', effects: { charm: 6, wits: 4, worldConditions: { foodSecurity: 3, publicOrder: 3 }, memory: { tag: 'ordered_the_distribution', weight: 4 } }, tone: 'good' },
        { id: 'let_it_run', label: 'Let it run', text: 'It empties in an afternoon. The strongest households carry off most of it and two of the weakest go home with an empty sack, which is precisely backwards.', effects: { worldConditions: { foodSecurity: 1, publicOrder: -3 }, faction: { factionId: 'commons', playerStanding: -2 }, memory: { tag: 'the_distribution_ran_wild', weight: 4 } }, tone: 'bad' },
      ],
    },
    '4_cautious': {
      title: 'THE LEAN HARVEST · FALSE WEIGHTS AND A HIDDEN STORE',
      text: 'The tallies produce two facts: {{merchant.name}}’s bushel is light, and there are forty quarters of sound grain in a barn that is not on anybody’s list.',
      choices: [
        { id: 'publish', label: 'Read both facts out at the hallmote', text: 'The measure is broken in front of the market and the barn is opened by order. It is complete, it is public, and it makes an enemy with money.', effects: { wits: 5, reputation: 6, worldConditions: { foodSecurity: 4, prosperity: -1 }, boundKinRel: { role: 'merchant', delta: -18 }, memory: { tag: 'broke_the_false_measure', weight: 5 } }, tone: 'good' },
        { id: 'leverage', label: 'Put both facts to {{merchant.name}} privately', text: 'He sells the forty quarters into Swineford at the assize price by the end of the week and nobody ever learns why. He hates you accurately and permanently.', effects: { wits: 6, charm: 5, worldConditions: { foodSecurity: 4 }, boundKinRel: { role: 'merchant', delta: -10 }, memory: { tag: 'leveraged_the_hidden_barn', weight: 5 } }, tone: 'plain' },
      ],
    },
    '4_family': {
      title: 'THE LEAN HARVEST · SMOKE FROM YOUR CHIMNEY',
      text: 'Your household eats. The lane can see the smoke from your oven every morning and has begun to have opinions about it out loud.',
      choices: [
        { id: 'share_some', label: 'Start baking for four other households', text: 'Your oven, their flour where they have any and yours where they do not. It costs a third of your stores and it ends the conversation in the lane.', effects: { householdState: { food: -4 }, charm: 5, faction: { factionId: 'commons', playerStanding: 5 }, memory: { tag: 'baked_for_the_lane', weight: 5 } }, tone: 'good' },
        { id: 'hold', label: 'Bake earlier and keep the door shut', text: 'You move the baking to before first light. Everybody knows anyway. The lane simply stops mentioning it in front of you, and that is the part that stings.', effects: { householdState: { food: 4 }, faction: { factionId: 'commons', playerStanding: -5 }, wits: 3, memory: { tag: 'baked_before_first_light', weight: 5 } }, tone: 'plain' },
      ],
    },
    5: {
      title: 'THE LEAN HARVEST · THE CROWD AT {{reeve.name}}’S DOOR',
      text: 'A crowd is outside {{reeve.name}}’s door with empty sacks and farm tools. It is not yet a riot and it will be within the hour, and you are the only person both sides will listen to.',
      choices: [
        { id: 'reconcile', label: 'Get both sides to agree a distribution on the spot', text: 'Forty minutes on a doorstep and a written agreement about weekly measures. Nobody gets what they came for and nobody is hanged for it either.', effects: { charm: 7, wits: 5, worldConditions: { foodSecurity: 3, publicOrder: 4 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Send for the lord’s men', text: 'Seventeen armed retainers and the crowd is off the lane in twenty minutes. Four men are amerced, one is gaoled, and the winter passes very quietly indeed.', effects: { reputation: 4, worldConditions: { publicOrder: 3, foodSecurity: -3 }, faction: { factionId: 'crown', playerStanding: 4 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'withdraw', label: 'Go home and bar the door', text: 'You are not there. It goes the way it goes, {{reeve.name}}’s door comes off its hinges, and nobody ever asks where you were because everybody knows.', effects: { householdState: { food: 2 }, reputation: -6, worldConditions: { publicOrder: -4 }, storyVariables: { resolution: 'withdraw' } }, tone: 'bad' },
      ],
    },
    '6_reconciled': {
      title: 'THE LEAN HARVEST · THE BARNS FILL AGAIN',
      text: 'The next harvest is ordinary, which after this year passes for plenty. Swineford has a written arrangement about lean years that it did not have in the spring.',
      choices: [
        { id: 'accept_ending', label: 'Keep the arrangement in the parish chest', text: 'You put the grain-sharing rules in the parish chest. The clerk adds a large drawing of a sack for the councillor who pretends to read.', effects: { faith: 5, reputation: 5, familyReputation: { delta: 4 }, worldConditions: { foodSecurity: 3, publicOrder: 2 }, memory: { tag: 'the_lean_year_arrangement', weight: 5, note: 'Swineford came out of a famine year with a written rule for the next one.' } }, tone: 'good' },
      ],
    },
    '6_hard': {
      title: 'THE LEAN HARVEST · WHO FED IT AND WHO PROFITED',
      text: 'The barns fill again. Swineford keeps a very exact account of who fed it, who profited from it, and who sent armed men down the lane.',
      choices: [
        { id: 'accept_ending', label: 'Let the account stand', text: 'It stands for two generations, unwritten and word-perfect. Four families are still explaining their grandparents in 1390.', effects: { reputation: 3, familyReputation: { delta: -1 }, worldConditions: { publicOrder: -1 }, memory: { tag: 'the_hunger_remembered', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  disputed_inheritance: {
    1: {
      title: 'THE INHERITANCE · A CLAIM AND A WITNESS',
      text: '{{claimant.name}} produces a claim on family property and asks {{witness.name}} to support it. {{witness.name}} has not said yes and has not said no.',
      choices: [
        { id: 'talk_to_witness', label: 'Get to {{witness.name}} first', text: 'You reach them before the claimant does. What they actually remember is less than either side wants and more than either side feared.', effects: { wits: 5, boundKinRel: { role: 'witness', delta: 8 }, memory: { tag: 'reached_the_witness_first', weight: 4 } }, tone: 'plain' },
        { id: 'concede_part', label: 'Concede the part of the claim that is sound', text: 'You give up a third of it immediately and publicly. It costs real land and it makes the remaining two-thirds nearly unassailable.', effects: { holding: { stores: -6 }, wits: 5, reputation: 4, boundKinRel: { role: 'claimant', delta: 8 }, memory: { tag: 'conceded_the_sound_third', weight: 5 } }, tone: 'good' },
        { id: 'refuse_all', label: 'Refuse the whole claim outright', text: 'You reject all of it in front of the family. {{claimant.name}} was expecting a negotiation and now has nothing to lose, which was not the intention.', effects: { charm: -3, boundKinRel: { role: 'claimant', delta: -12 }, memory: { tag: 'refused_the_whole_claim', weight: 4 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE INHERITANCE · A PROMISE REPEATED UNTIL IT IS LAW',
      text: 'A deathbed promise is being repeated at every gathering as though repetition makes it enforceable. Two people who were in the room remember it differently and both are certain.',
      choices: [
        { id: 'both_accounts', label: 'Have both accounts written down and sealed', text: 'Two statements, two seals, both preserved. Neither is proved and neither can now quietly change, which turns out to matter enormously.', effects: { wits: 6, gold: -3, worldConditions: { publicOrder: 1 }, memory: { tag: 'sealed_both_accounts', weight: 5 } }, tone: 'good' },
        { id: 'out_repeat', label: 'Repeat your version more often and louder', text: 'It works, in the sense that by spring most of the family believes it. It is exactly the tactic you objected to and everybody notices.', effects: { charm: 5, faith: -3, boundKinRel: { role: 'claimant', delta: -8 }, memory: { tag: 'out_repeated_them', weight: 4 } }, tone: 'plain' },
        { id: 'find_third', label: 'Find whether anybody else was in the room', text: 'A servant was, and is alive, and is now the most important person in the county and knows it.', effects: { wits: 6, gold: -4, memory: { tag: 'found_the_third_person_in_the_room', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE INHERITANCE · A CONVENIENT SEAL AND AN AWKWARD DATE',
      text: 'A document appears with a seal that is entirely convincing and a date that cannot possibly be right. How you handle it decides whether this stays a family matter.',
      choices: [
        { id: 'bold', label: 'Denounce it as a forgery in open court', text: 'You take the date apart in front of the steward. It is devastating, it is correct, and it turns a family argument into a criminal one.', effects: { wits: 5, reputation: 5, boundKinRel: { role: 'claimant', delta: -16 }, legal: { suspicion: 2 }, worldConditions: { publicOrder: -1 }, storyVariables: { approach: 'bold' }, memory: { tag: 'denounced_the_forgery', weight: 5 } }, tone: 'plain' },
        { id: 'cautious', label: 'Say nothing and find out who made it', text: 'The seal is genuine and fourteen years old, reused. Whoever did this had access to the family chest, and the list of those people is very short.', effects: { wits: 7, revealSecretOf: 'claimant', storyVariables: { approach: 'cautious' }, memory: { tag: 'traced_the_reused_seal', weight: 5 } }, tone: 'plain' },
        { id: 'family', label: 'Take it to the family before the court', text: 'You put it on the table at home and say that whoever did it should say so now. Somebody does, eventually, at about midnight.', effects: { charm: 5, faith: 4, familyReputation: { delta: 3 }, boundKinRel: { role: 'witness', delta: 8 }, storyVariables: { approach: 'family' }, memory: { tag: 'settled_the_forgery_at_home', weight: 5 } }, tone: 'good' },
      ],
    },
    '4_bold': {
      title: 'THE INHERITANCE · CLAIM AGAINST CLAIM',
      text: '{{claimant.name}} answers in kind: witnesses, anger, and a second document that is considerably better made than the first.',
      choices: [
        { id: 'press', label: 'Press for a criminal charge', text: 'You go for forgery rather than for the land. It is winnable and it will hang somebody in your own family if it succeeds.', effects: { legal: { suspicion: 3 }, reputation: 4, boundKinRel: { role: 'claimant', delta: -14 }, familyReputation: { delta: -3 }, memory: { tag: 'pressed_the_forgery_charge', weight: 5 } }, tone: 'plain' },
        { id: 'drop_criminal', label: 'Drop the forgery and argue the land alone', text: 'You take the hanging off the table and argue the property on its merits. It is slower, it is smaller, and nobody in the family dies of it.', effects: { wits: 5, faith: 4, familyReputation: { delta: 3 }, boundKinRel: { role: 'claimant', delta: 6 }, memory: { tag: 'dropped_the_forgery_charge', weight: 5 } }, tone: 'good' },
      ],
    },
    '4_cautious': {
      title: 'THE INHERITANCE · WHO HAD THE KEY TO THE CHEST',
      text: 'The list of people who could have taken that seal is four names long, and one of them is {{witness.name}}, who has been helping you all year.',
      choices: [
        { id: 'confront_witness', label: 'Put it to {{witness.name}}', text: 'They admit it in about four seconds and explain why, and the reason is better than you wanted it to be.', effects: { wits: 5, boundKinRel: { role: 'witness', delta: -8 }, revealSecretOf: 'witness', memory: { tag: 'confronted_the_witness', weight: 5 } }, tone: 'plain' },
        { id: 'protect_witness', label: 'Keep {{witness.name}}’s name out of it', text: 'You solve the forgery in a way that never requires the fourth name. It costs you the cleanest version of your case and it is the right call.', effects: { faith: 5, wits: 4, boundKinRel: { role: 'witness', delta: 16 }, memory: { tag: 'kept_the_witnesses_name_out', weight: 5 } }, tone: 'good' },
      ],
    },
    '4_family': {
      title: 'THE INHERITANCE · A TABLE AND NO LAWYERS',
      text: 'The family sits down without proctors. Old affection turns out to be useful and old grievance turns out to be more detailed.',
      choices: [
        { id: 'divide_now', label: 'Get a division agreed at the table tonight', text: 'A long evening, one very bad half-hour, and a division everybody signs before going to bed. It is uneven and it is agreed.', effects: { charm: 6, familyReputation: { delta: 4 }, holding: { stores: -3 }, boundKinRel: { role: 'claimant', delta: 12 }, memory: { tag: 'divided_it_at_the_table', weight: 5 } }, tone: 'good' },
        { id: 'adjourn', label: 'Adjourn before somebody says something final', text: 'You stop the inheritance meeting before anyone throws the inkpot. Each claimant must bring a written proposal next time.', effects: { wits: 5, charm: 4, familyReputation: { delta: 2 }, memory: { tag: 'adjourned_before_the_worst', weight: 4 } }, tone: 'plain' },
      ],
    },
    5: {
      title: 'THE INHERITANCE · JUDGMENT BEFORE THE WHOLE FAMILY',
      text: '{{claimant.name}} demands a settlement in front of the family and the village. Everybody who will inherit anything from anybody is in the room watching how this is done.',
      choices: [
        { id: 'reconcile', label: 'Settle for less than you could take', text: 'You take about two-thirds of what a court would have given you and say why, out loud, in front of everyone. Nobody is thrilled and nobody is finished.', effects: { faith: 5, charm: 5, holding: { stores: -4 }, familyReputation: { delta: 5 }, boundKinRel: { role: 'claimant', delta: 16 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Take the whole of what is yours', text: 'You take all of it, lawfully, and the roll agrees with you completely. {{claimant.name}} is a tenant of somebody else by Michaelmas.', effects: { holding: { stores: 12 }, gold: 16, householdState: { wealth: 5 }, boundKinRel: { role: 'claimant', delta: -22 }, familyReputation: { delta: -3 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'withdraw', label: 'Give up the claim entirely', text: 'You walk away from the whole thing in front of everybody. It is either the most generous or the most contemptuous act of your life and opinion is divided permanently.', effects: { holding: { stores: -10 }, faith: 6, reputation: 3, boundKinRel: { role: 'claimant', delta: 10 }, storyVariables: { resolution: 'withdraw' } }, tone: 'plain' },
      ],
    },
    '6_reconciled': {
      title: 'THE INHERITANCE · WHAT THE HEIRS ACTUALLY GET',
      text: 'The property is divided and the family survives the dividing. Any clerk can do the first part.',
      choices: [
        { id: 'accept_ending', label: 'Have the division written and witnessed', text: 'Sealed, witnessed, and copied three times. Not one of the next four generations has to argue about any of it, and none of them knows why.', effects: { faith: 5, familyReputation: { delta: 5 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'the_inheritance_settled', weight: 5, note: 'A disputed inheritance was divided by agreement and written down.' } }, tone: 'good' },
      ],
    },
    '6_hard': {
      title: 'THE INHERITANCE · THE LAND HAS AN OWNER',
      text: 'The property is settled beyond appeal. The family is settled too, into two halves that will be introduced to each other at funerals for the next sixty years.',
      choices: [
        { id: 'accept_ending', label: 'Take possession', text: 'You take the whole estate. Your relatives refuse the celebratory supper and send back the invitation wrapped around a dead onion.', effects: { holding: { stores: 6 }, householdState: { wealth: 4 }, familyReputation: { delta: -2 }, memory: { tag: 'the_inheritance_taken_whole', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  war_swineford: {
    1: {
      title: 'WAR · BANNERS ON THE CAMBRIDGE ROAD',
      text: '{{commander.name}} arrives under a war banner wanting men, carts and grain out of Swineford, and has the writ to take all three whether the village agrees or not.',
      choices: [
        { id: 'negotiate', label: 'Negotiate what goes and what stays', text: 'You spend an evening arguing over a tally and keep back the plough oxen and the seed corn. It is the difference between a hard year and no year at all.', effects: { wits: 6, charm: 4, worldConditions: { foodSecurity: 3 }, boundKinRel: { role: 'commander', delta: 8 }, memory: { tag: 'negotiated_the_requisition', weight: 4 } }, tone: 'good' },
        { id: 'comply', label: 'Give them everything on the writ', text: 'Everything on the list, promptly and without argument. {{commander.name}} notes the village as cooperative and comes back in the spring for more.', effects: { holding: { stores: -10 }, faction: { factionId: 'crown', playerStanding: 4 }, worldConditions: { foodSecurity: -3 }, memory: { tag: 'complied_with_the_writ', weight: 4 } }, tone: 'plain' },
        { id: 'hide', label: 'Hide half of it before they finish counting', text: 'Two carts of grain into the mere field overnight. It works, it feeds Swineford in March, and it is a hanging matter if the count is ever checked.', effects: { householdState: { food: 6 }, legal: { suspicion: 6 }, worldConditions: { foodSecurity: 2 }, memory: { tag: 'hid_grain_from_the_army', weight: 5 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'WAR · {{companion.name}} ASKS WHETHER YOU ARE COMING',
      text: '{{companion.name}} is on the muster roll and asks, directly and only once, whether you will be standing next to them.',
      choices: [
        { id: 'go', label: 'Put your name down beside theirs', text: 'You write it in and they visibly stop being frightened, which is most of what they were asking for.', effects: { health: -6, charm: 5, boundKinRel: { role: 'companion', delta: 18 }, rankProgress: 8, memory: { tag: 'marched_with_them', weight: 5 } }, tone: 'plain' },
        { id: 'get_them_off', label: 'Get {{companion.name}} taken off the roll instead', text: 'It costs six shillings and a favour and it works. They are furious about it for a year and alive for forty.', effects: { gold: -6, wits: 5, boundKinRel: { role: 'companion', delta: -8 }, memory: { tag: 'got_them_off_the_roll', weight: 5 } }, tone: 'plain' },
        { id: 'stay', label: 'Tell them plainly that you are not coming', text: 'You say it to their face rather than letting them find out at the muster. It is the smallest possible decency and it is the one they remember.', effects: { faith: 3, wits: 3, boundKinRel: { role: 'companion', delta: -12 }, memory: { tag: 'told_them_to_their_face', weight: 4 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'WAR · THE COLLECTORS EMPTY THE BARNS',
      text: 'Purveyors are taking what the writ did not cover and paying in tallies redeemable at the Exchequer, eventually, in theory. What you do about it sets Swineford’s war.',
      choices: [
        { id: 'bold', label: 'Answer the muster yourself and go with the carts', text: 'If Swineford’s grain is going, you go with it, and a surprising amount of it arrives where it is supposed to because you are standing next to it.', effects: { health: -8, rankProgress: 12, reputation: 6, worldConditions: { warThreat: 1 }, storyVariables: { approach: 'bold' }, memory: { tag: 'went_with_the_carts', weight: 5 } }, tone: 'plain' },
        { id: 'cautious', label: 'Fortify the village and find out where the war is', text: 'A ditch, a bank, two watchmen and a boy on a fast pony. You know where the fighting is four days before anybody else in the hundred.', effects: { wits: 6, holding: { security: 8 }, worldConditions: { publicOrder: 2 }, storyVariables: { approach: 'cautious' }, memory: { tag: 'fortified_and_watched', weight: 5 } }, tone: 'good' },
        { id: 'family', label: 'Move your household off the line of march', text: 'Four miles to kin, with the beasts, before the second column comes through. It is the correct decision and Swineford watches you make it.', effects: { householdState: { capacity: 1 }, holding: { stores: -6 }, faction: { factionId: 'commons', playerStanding: -4 }, storyVariables: { approach: 'family' }, memory: { tag: 'moved_the_household_off_the_road', weight: 5 } }, tone: 'plain' },
      ],
    },
    '4_bold': {
      title: 'WAR · BENEATH THE BANNER',
      text: 'You are standing with {{companion.name}} while {{commander.name}} arranges a defence that depends on the left holding for rather longer than the left can hold.',
      choices: [
        { id: 'say_it', label: 'Tell {{commander.name}} the left will not hold', text: 'You say it in front of his officers and you are right. He changes the disposition, resents you for the rest of the campaign, and loses sixteen men instead of ninety.', effects: { wits: 6, rankProgress: 10, boundKinRel: { role: 'commander', delta: -8 }, worldConditions: { warThreat: -2 }, memory: { tag: 'told_the_commander_the_truth', weight: 5 } }, tone: 'good' },
        { id: 'hold_left', label: 'Ask to be put on the left', text: 'You go where it is going to break. It breaks anyway and rather later than it would have, and you are carried off it.', effects: { health: -16, rankProgress: 16, reputation: 8, boundKinRel: { role: 'companion', delta: 14 }, healthCondition: { conditionId: 'deep_cut', severity: 25 }, memory: { tag: 'held_the_left', weight: 5 } }, tone: 'plain' },
      ],
    },
    '4_cautious': {
      title: 'WAR · DITCH, BANK AND A BOY ON A PONY',
      text: 'The scouts come back: the enemy column is taking the ford road, not the Cambridge road, and will be at Swineford in two days rather than never.',
      choices: [
        { id: 'break_ford', label: 'Break the ford causeway', text: 'A morning with mattocks and the ford is impassable to carts. The column goes round by nine miles and Swineford is not on its road at all.', effects: { wits: 7, health: -4, worldConditions: { warThreat: -4, publicOrder: 2 }, holding: { security: 4 }, memory: { tag: 'broke_the_ford_causeway', weight: 5 } }, tone: 'good' },
        { id: 'warn_everyone', label: 'Send the boy on to warn the next four villages', text: 'You give up your only fast rider and your two days of advantage. Four villages get out in time and Swineford meets the column with no warning of its own.', effects: { faith: 7, reputation: 6, worldConditions: { warThreat: 2, publicOrder: 2 }, faction: { factionId: 'commons', playerStanding: 6 }, memory: { tag: 'sent_the_warning_on', weight: 5 } }, tone: 'plain' },
      ],
    },
    '4_family': {
      title: 'WAR · THE ROAD FULL OF PEOPLE',
      text: 'You are six miles off with the household intact and the road behind you is filling with people from Swineford who left it later than you did.',
      choices: [
        { id: 'take_them_in', label: 'Take in whoever reaches you', text: 'Nineteen people in a barn meant for four and every scrap of food gone in twenty days. Not one of them is turned away and not one of them forgets it.', effects: { householdState: { food: -8, capacity: 2 }, faith: 7, faction: { factionId: 'commons', playerStanding: 6 }, memory: { tag: 'took_in_the_road', weight: 5 } }, tone: 'good' },
        { id: 'go_further', label: 'Go further', text: 'Another ten miles to a place with no war in it. Your household is entirely safe and entirely absent, and both facts are noted at home.', effects: { householdState: { capacity: 1 }, health: -3, faction: { factionId: 'commons', playerStanding: -6 }, memory: { tag: 'went_further', weight: 5 } }, tone: 'plain' },
      ],
    },
    5: {
      title: 'WAR · SMOKE ON THE SWINEFORD HORIZON',
      text: 'It has come to the village itself. {{commander.name}} must hold the road or give up Swineford, and is genuinely asking rather than telling.',
      choices: [
        { id: 'reconcile', label: 'Pay the fine and open the road', text: 'Forty marks raised in a day and the column takes it and goes past. Swineford is poor for a decade and standing, and two men call you a coward at the ale for years.', effects: { gold: -25, householdState: { wealth: -5 }, worldConditions: { warThreat: -4, prosperity: -3, publicOrder: 3 }, storyVariables: { resolution: 'reconcile' } }, tone: 'plain' },
        { id: 'hardline', label: 'Hold the road', text: 'It is held. Nineteen dead, the mill burned, the column turned, and a story that is told in that village for two hundred years with your name in it.', effects: { health: -14, reputation: 10, rankProgress: 14, worldConditions: { warThreat: -3, prosperity: -4, publicOrder: -2 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'withdraw', label: 'Get everybody out and give them the village', text: 'Swineford empties in six hours. The column takes an empty village, burns half of it out of irritation, and nobody at all is killed.', effects: { worldConditions: { warThreat: -2, prosperity: -6 }, holding: { stores: -12 }, faith: 5, storyVariables: { resolution: 'withdraw' } }, tone: 'plain' },
      ],
    },
    '6_reconciled': {
      title: 'WAR · THE BANNERS GO PAST',
      text: 'The war moves on somewhere else. Swineford has its people, most of its roofs, and a debt it will be paying at every Michaelmas for five years.',
      choices: [
        { id: 'accept_ending', label: 'Start paying it', text: 'The village pays it off in 1361 and holds an ale for the occasion. Nobody at the ale is entirely sure any more whether it was the right decision.', effects: { faith: 4, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'swineford_bought_the_road', weight: 5, note: 'Swineford bought its way out of a battle and paid for it for six years.' } }, tone: 'plain' },
      ],
    },
    '6_hard': {
      title: 'WAR · THE RETURNING BANNERS',
      text: 'The survivors come back different. Swineford counts nineteen graves, one burned mill and a set of reputations that will not be adjusted again in anybody’s lifetime.',
      choices: [
        { id: 'accept_ending', label: 'Count them properly', text: 'Every name on a board in the church, in order, including the two that somebody wanted left off. It is there in 1500 and the paint has been renewed four times.', effects: { faith: 5, reputation: 6, familyReputation: { delta: 3 }, worldConditions: { publicOrder: 2 }, memory: { tag: 'the_nineteen_names', weight: 5 } }, tone: 'plain' },
      ],
    },
  },

  ambitious_child: {
    1: {
      title: 'THE AMBITIOUS CHILD · MORE THAN THE HOUSE CAN GIVE',
      text: '{{child.name}} tells you what they want, and it is bigger than this household, this village and anything either of your parents attempted.',
      choices: [
        { id: 'encourage', label: 'Tell them to go after it', text: 'You say it plainly and immediately. They are so unprepared for it that they cry, which neither of you mentions ever again.', effects: { charm: 4, boundKinRel: { role: 'child', delta: 16 }, memory: { tag: 'told_the_child_to_go_for_it', weight: 4 } }, tone: 'good' },
        { id: 'test_it', label: 'Ask them how, specifically', text: 'You make them account for every step of it. Two of the steps do not exist, they find that out from you rather than from the world, and they go and fix them.', effects: { wits: 6, boundKinRel: { role: 'child', delta: 6 }, memory: { tag: 'made_the_child_show_the_steps', weight: 4 } }, tone: 'good' },
        { id: 'the_holding', label: 'Remind them what the holding needs', text: 'It is true, it is necessary, and it is what your own father said to you, in nearly the same words, which occurs to you about a week later.', effects: { holding: { stores: 4 }, boundKinRel: { role: 'child', delta: -10 }, memory: { tag: 'said_what_your_father_said', weight: 5 } }, tone: 'plain' },
      ],
    },
    2: {
      title: 'THE AMBITIOUS CHILD · {{mentor.name}} OFFERS TO HELP',
      text: '{{mentor.name}} offers to take {{child.name}} on. The offer is generous, the terms are vague, and nothing in Swineford has ever been free.',
      choices: [
        { id: 'terms_first', label: 'Get the terms in writing before anything else', text: 'Three evenings and an indenture that specifies keep, years, and what happens if either side wants out. {{mentor.name}} is mildly offended and signs.', effects: { wits: 6, gold: -3, boundKinRel: { role: 'mentor', delta: -4 }, memory: { tag: 'got_the_mentors_terms_in_writing', weight: 5 } }, tone: 'good' },
        { id: 'trust', label: 'Take the offer as given', text: 'A handshake and goodwill. It works until the third summer, when there is a disagreement about what was meant and nothing to point at.', effects: { charm: 4, boundKinRel: { role: 'mentor', delta: 12 }, memory: { tag: 'took_the_mentor_on_trust', weight: 4 } }, tone: 'plain' },
        { id: 'refuse_mentor', label: 'Find out what {{mentor.name}} wants first', text: 'They want a connection to your household in about seven years for reasons they will not state. It is not sinister and it is not nothing.', effects: { wits: 6, revealSecretOf: 'mentor', memory: { tag: 'found_out_what_the_mentor_wanted', weight: 5 } }, tone: 'plain' },
      ],
    },
    3: {
      title: 'THE AMBITIOUS CHILD · THE OTHER CHILDREN ARE COUNTING',
      text: 'What has gone to {{child.name}} in coin, time and attention has been noticed by the rest of the household and is being tallied with some accuracy.',
      choices: [
        { id: 'bold', label: 'Back {{child.name}} openly and say the rest must wait', text: 'You say it out loud at the table: this one, now, and the others when it comes back. It is honest, it is a gamble, and everybody knows exactly where they stand.', effects: { charm: 4, boundKinRel: { role: 'child', delta: 14 }, familyReputation: { delta: -2 }, storyVariables: { approach: 'bold' }, memory: { tag: 'backed_one_child_openly', weight: 5 } }, tone: 'plain' },
        { id: 'cautious', label: 'Set conditions and test {{mentor.name}} properly', text: 'Progress reviewed each Michaelmas, money released against results. {{child.name}} finds it humiliating and it saves them from two very bad decisions.', effects: { wits: 6, householdState: { wealth: 2 }, boundKinRel: { role: 'child', delta: -6 }, storyVariables: { approach: 'cautious' }, memory: { tag: 'set_conditions_on_the_child', weight: 5 } }, tone: 'plain' },
        { id: 'family', label: 'Balance it, and give something to every child', text: 'You divide what there is between all of them. Nobody is neglected, nothing is enough for anything, and {{child.name}} watches the chance go.', effects: { familyReputation: { delta: 4 }, faith: 4, boundKinRel: { role: 'child', delta: -12 }, storyVariables: { approach: 'family' }, memory: { tag: 'balanced_between_the_children', weight: 5 } }, tone: 'plain' },
      ],
    },
    '4_bold': {
      title: 'THE AMBITIOUS CHILD · A DOOR THROWN OPEN',
      text: '{{child.name}} takes the chance and is immediately very good at it, which attracts admiration, envy and a set of expectations nobody has warned them about.',
      choices: [
        { id: 'warn', label: 'Warn them what the envy will cost', text: 'You tell them what to expect from people who have known them since they were small. They do not believe you until Lammas and then they do.', effects: { wits: 5, charm: 4, boundKinRel: { role: 'child', delta: 10 }, memory: { tag: 'warned_them_about_the_envy', weight: 4 } }, tone: 'good' },
        { id: 'let_them_run', label: 'Stay out of the way', text: 'You let them run at it without commentary. They go faster and further and hit the first wall entirely unprepared.', effects: { boundKinRel: { role: 'child', delta: 6 }, rankProgress: 6, memory: { tag: 'stayed_out_of_the_way', weight: 4 } }, tone: 'plain' },
      ],
    },
    '4_cautious': {
      title: 'THE AMBITIOUS CHILD · THE MENTOR UNDER TERMS',
      text: '{{mentor.name}} accepts every condition without argument, which is either good faith or the behaviour of somebody with a longer plan. {{child.name}} resents every review.',
      choices: [
        { id: 'keep_terms', label: 'Hold to the terms exactly', text: 'You inspect the accounts at the agreed review. A landlord has charged rent twice. You catch the duplicate before your child pays it.', effects: { wits: 6, householdState: { wealth: 3 }, boundKinRel: { role: 'child', delta: -4 }, memory: { tag: 'held_the_terms_exactly', weight: 5 } }, tone: 'good' },
        { id: 'ease_off', label: 'Ease the conditions as they prove themselves', text: 'You loosen it year by year as they earn it. It is what they needed, and it takes away the one thing that was catching their mistakes.', effects: { charm: 5, boundKinRel: { role: 'child', delta: 12 }, householdState: { wealth: -2 }, memory: { tag: 'eased_the_conditions', weight: 4 } }, tone: 'plain' },
      ],
    },
    '4_family': {
      title: 'THE AMBITIOUS CHILD · WATCHING IT GO',
      text: 'The household is steady, fair and unremarkable. {{child.name}} can see the chance receding at a measurable rate and has stopped mentioning it.',
      choices: [
        { id: 'find_another', label: 'Find them a smaller chance you can actually afford', text: 'Not the thing they wanted. A real thing, within reach, that you can pay for. They take it and are quietly furious and quietly successful.', effects: { wits: 5, gold: -10, boundKinRel: { role: 'child', delta: 8 }, familyReputation: { delta: 2 }, memory: { tag: 'found_a_smaller_chance', weight: 5 } }, tone: 'good' },
        { id: 'let_it_go', label: 'Let it go', text: 'The chance passes and nothing is said. They are a competent, unremarkable adult who is very good to their siblings and never once raises it.', effects: { familyReputation: { delta: 3 }, holding: { stores: 5 }, boundKinRel: { role: 'child', delta: -8 }, memory: { tag: 'let_the_chance_pass', weight: 5 } }, tone: 'plain' },
      ],
    },
    5: {
      title: 'THE AMBITIOUS CHILD · CHILD AGAINST PARENT',
      text: '{{child.name}} refuses the future you chose and demands to name their own, in front of the household, without leaving either of you a graceful exit.',
      choices: [
        { id: 'reconcile', label: 'Give way, and say why you were wrong', text: 'You admit that you mistook your child’s independence for ingratitude. The room goes quiet. Your child takes your hand.', effects: { faith: 6, charm: 5, boundKinRel: { role: 'child', delta: 20 }, familyReputation: { delta: 4 }, storyVariables: { resolution: 'reconcile' } }, tone: 'good' },
        { id: 'hardline', label: 'Refuse, and make it stick', text: 'You hold, entirely, and you have the household and the holding to hold with. They comply. They are still complying at forty and you can see it.', effects: { holding: { stores: 8 }, familyReputation: { delta: 2 }, boundKinRel: { role: 'child', delta: -20 }, storyVariables: { resolution: 'hardline' } }, tone: 'plain' },
        { id: 'withdraw', label: 'Tell them it is theirs to decide and step out of it', text: 'You take yourself out of the decision entirely and mean it. They are free, unadvised, and rather more frightened than they expected to be.', effects: { wits: 4, boundKinRel: { role: 'child', delta: 6 }, holding: { stores: -4 }, storyVariables: { resolution: 'withdraw' } }, tone: 'plain' },
      ],
    },
    '6_reconciled': {
      title: 'THE AMBITIOUS CHILD · THE PERSON THEY BECAME',
      text: 'They are grown and they are theirs, and they come back on their own account rather than because they were told to.',
      choices: [
        { id: 'accept_ending', label: 'Meet them as an equal', text: 'They visit twice a year for the rest of your life and argue with you as an equal, loudly, over supper, about nothing much.', effects: { faith: 5, charm: 4, boundKinRel: { role: 'child', delta: 14 }, familyReputation: { delta: 5 }, memory: { tag: 'the_child_who_came_back', weight: 5, note: 'A child you gave way to became someone who chose to come back.' } }, tone: 'good' },
      ],
    },
    '6_hard': {
      title: 'THE AMBITIOUS CHILD · WHAT THE UPBRINGING MADE',
      text: 'They are grown, capable, dutiful and entirely closed. The holding is in good hands and there is a conversation the two of you have never had and now will not.',
      choices: [
        { id: 'accept_ending', label: 'Hand over the holding', text: 'They take it, run it better than you did, and are unfailingly correct with you until the end. Nobody outside the household ever notices anything wrong.', effects: { holding: { stores: 8 }, familyReputation: { delta: 2 }, boundKinRel: { role: 'child', delta: -6 }, memory: { tag: 'the_dutiful_closed_heir', weight: 5 } }, tone: 'plain' },
      ],
    },
  },
};
