import type { GameEvent } from '@/types/game';
import { scene, reply, risk, fraud } from './narrativeHelpers';
const rare={rarity:'rare' as const,once:true,repetitionGroup:'rare_oddities'};
export const NARRATIVE_RARE_EVENTS: GameEvent[] = [
  scene('life_lightning_rod','peasant','rare','THE MAN WHO WILL CATCH THUNDER','{{other}} has arranged a public demonstration with an iron pole on a high roof during a storm. The fee for holding the pole is described as hazard money only after you ask.',[
    reply('refuse','Refuse the roof and warn the onlookers','You step away and describe the danger. {{other}} calls the crowd’s increasing distance a disappointing failure of confidence.',{reputation:4,bond:{role:'other',trust:-7}}),
    risk('hold','Hold the pole through the storm (risk death)',0.45,'The worst of the storm passes elsewhere. You earn twenty gold for a demonstration that has proved nothing safe.',{gold:20,health:-8},"A gust throws you against the roof and the crowd scatters. Your fee is spent on treating the burns before anybody can call it a profit.",{health:-16,healthCondition:{conditionId:'burns',severity:25}},{catastropheChance:0.22,catastrophe:{text:"Lightning strikes the exposed roof. The promised hazard payment is no defence against it.",effects:{death:"Killed while knowingly holding an iron pole on a roof during a storm."},tone:'bad'}}),
  ],{...rare,stakes:'major',repetitionGroup:'dangerous_spectacles'}),
  scene('life_unclaimed_fortune','peasant','rare','THE INHERITANCE THAT REQUIRES AN ADVANCE','{{other}} brings news of a vast foreign inheritance. The messenger requires an advance, a travel bond and your patience about the absence of a named deceased.',[
    reply('verify','Ask for an identified estate and witnesses','You ask for the estate’s name before paying. {{other}} becomes less certain which country contains the fortune.',{wits:5,bond:{role:'other',trust:-8}}),
    reply('borrow','Borrow heavily to fund the supposed claim','You record a sixty-gold debt and lose household wealth meeting the costs. No inheritance arrives to recognise the trouble you have taken.',{debt:{principal:60,interestRate:0.18},householdState:{wealth:-25},familyReputation:{delta:-5}}),
    reply('report','Give the demand to the clerk','You expose the scheme and gain public standing. {{other}} becomes a rival who can now name at least one person involved.',{reputation:5,bond:{role:'other',trust:-22,flag:'rival'}}),
  ],{...rare,stakes:'major',repetitionGroup:'suspicious_inheritances'}),
  scene('life_speaking_statue','peasant','rare','THE STATUE WITH A SORE THROAT','{{other}} shows you a statue said to speak through a hole in the wall. Behind the wall, somebody asks for water in exactly the statue’s voice.',[
    reply('explain','Open the door before the next revelation','You expose the trick and gain reputation. {{other}} is annoyed that the revelation has acquired a visible speaker.',{reputation:5,bond:{role:'other',trust:-15}}),
    reply('quiet','Leave without making the frightened audience a joke','You preserve your own judgement and gain faith through restraint. {{other}} is grateful for less discretion than they wanted.',{faith:3,bond:{role:'other',trust:4}}),
    reply('join','Offer a more convincing voice for a dishonest fee','You earn seven gold and a fraud charge. Your best performance now comes with a witness behind the wall.',{gold:7,legal:fraud('Taking payment for a staged sacred revelation')}),
  ],{...rare,repetitionGroup:'false_relics'}),
  scene('life_whale_bone_house','peasant','rare','THE HOUSE BUILT ROUND A BONE','{{other}} owns a sea creature’s enormous bone and wants to charge people to touch it for luck. The carpenter thinks it would make an excellent lintel.',[
    reply('study','Study the bone without buying the promised luck','You spend an hour examining the enormous bone. {{other}} keeps interrupting to mention luck, which proves much harder to point to than the joints.',{wits:4,bond:{role:'other',trust:6}}),
    reply('support','Contribute to a shelter display (6g)','Your contribution improves the family’s public standing. The contribution supports a display, not a miracle.',{gold:-6,familyReputation:{delta:4}},{costGold:6}),
  ],rare),
  scene('life_distant_chess','court','rare','THE GAME WITH A KING WHO CANNOT LEAVE','{{other}} teaches you a foreign board game in which the king moves very little and everyone else is sacrificed around him. The explanation attracts an uncomfortable number of courtiers.',[
    reply('learn','Learn the game without supplying an allegory','{{other}} shows you why the wooden king cannot simply order the board rearranged. You learn more than either of you intended about government.',{wits:5,bond:{role:'other',trust:8}}),
    reply('compare','Explain which actual people the pieces resemble','Your comparison amuses the audience. {{other}} had not expected a wooden monarch to require a public defence.',{charm:5,bond:{role:'other',trust:-18,flag:'rival'}}),
  ],{...rare,requires:{rankAtLeast:1},repetitionGroup:'court_intrigue'}),
  scene('life_escaped_pageant','peasant','rare','THE DEVIL HAS TAKEN THE AFTERNOON OFF','The person playing the devil in a pageant has refused to perform until paid. {{other}} asks you to explain to the crowd why virtue has nothing left to conquer.',[
    reply('pay','Pay the performer what the organiser owes (9g)','The devil is paid and returns to work. {{other}} finds nine gold a surprisingly efficient instrument of salvation.',{gold:-9,reputation:4,bond:{role:'other',trust:6}},{costGold:9}),
    reply('rewrite','Rewrite the ending around a missing adversary','You give the remaining virtues a quarrel among themselves. {{other}} discovers that goodness can fill an afternoon without paying a devil.',{skillXp:{scholarship:6},charm:4,bond:{role:'other',trust:5}}),
    reply('blame','Blame the absent performer before the crowd','The crowd asks why the devil should work for nothing. {{other}} has to defend a play in which the villain has become the most reasonable person present.',{reputation:-4,bond:{role:'other',trust:-10}}),
  ],rare),
  scene('life_paper_castle','peasant','rare','THE CASTLE THAT FITS IN A CHEST','{{other}} shows you a beautifully made model castle with working gates. It defends a table far more effectively than several actual castles defend their villages.',[
    reply('admire','Ask how the little gates were made','{{other}} opens the tiny gates and shows you the hinges. Nobody besieges anything; two people spend an excellent evening admiring a door.',{skillXp:{craftsmanship:8},bond:{role:'other',trust:8}}),
    reply('mock','Ask how much grain the model has protected','{{other}} shuts the tiny gate. It is the first part of the castle that has actually managed to keep you out.',{wits:2,bond:{role:'other',affinity:-12}}),
  ],rare),
  scene('life_traveller_last_word','family','rare','THE WORD FOR COMING HOME','{{other}} returns from a long journey and tries to explain a word for the relief of reaching a place that knows you. The closest translation takes the rest of supper.',[
    reply('listen','Let the explanation take as long as it needs','{{other}} explains the word slowly, then stops translating and asks for more bread. You understand that part without help.',{wits:3,bond:{role:'other',trust:12,flag:'friend'}}),
    reply('meal','Share household food and let the word remain foreign','You give up a little food and gain a warm acquaintance. Some meanings travel more easily in company than in words.',{householdState:{food:-3},bond:{role:'other',affinity:12},faith:2}),
  ],rare),
];
