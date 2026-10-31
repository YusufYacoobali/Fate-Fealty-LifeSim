import type {GameEvent} from '@/types/game';
import {scene,reply,risk,ADULT,SPOUSE,RIVAL} from './narrativeHelpers';
const comic=(id:string,title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={})=>scene('comic_'+id,'family','family',title,text,choices,{ageMin:18,repetitionGroup:'comic_'+id,...options});
const SUITOR={...ADULT,unmarried:true,romanceEligible:true};
export const SOCIAL_COMEDY_EVENTS:GameEvent[]=[
 comic('accidental_champion','THE KNIGHT WHO WON BY ACCIDENT','{{other}} boasts of never losing a duel. You discover the previous opponents were paid to surrender. Unfortunately, the next challenge has just been addressed to you.',[
  reply('price','Ask the champion what surrender pays','{{other}} gives you six gold to preserve the legend. You fall over after a magnificently unconvincing blow and spend the walk home rehearsing a better groan.',{gold:6,reputation:-3,bond:{role:'other',trust:8},createSecret:{type:'criminal_contact',severity:20}}),
  reply('audience','Invite the previous opponents to demonstrate','Three former victims demonstrate the same fatal stagger. {{other}} objects that you have organised a very unfair rehearsal.',{reputation:4,bond:{role:'other',respect:4,affinity:-15,flag:'rival'}}),
  reply('fight','Insist on a real practice bout (injury risk)','{{other}} has to lift a sword without paying anyone first. The spectators become attentive for entirely new reasons.',{}, {challenge:{role:'other',stakes:{summary:'A real bout can injure either opponent.',win:{reputation:6,bond:{role:'other',respect:10}},lose:{health:-14,reputation:-4}}}}),
 ],{actorRoles:{other:{...ADULT,rankAtLeast:2}},stakes:'meaningful'}),
 comic('escaped_letter','THE LOVE LETTER THAT ESCAPED','Your private love letter has reached the wrong hearth. Three neighbours consider the description flattering. {{spouse}} would like to know which of them resembles a summer orchard.',[
  reply('read','Read the original aloud, including the intended name','{{spouse}} hears the name before the unfortunate fruit comparison. The misunderstanding ends; the orchard will take longer to live down.',{bond:{role:'spouse',trust:8},charm:-1}),
  reply('lie','Claim it was an exercise for a travelling poet','{{spouse}} asks you to recite another verse. Your sudden objection to poetry is much less convincing than the first letter.',{bond:{role:'spouse',trust:-17},reputation:-3}),
  reply('dedicate','Dedicate the entire disastrous poem to your spouse','You recite it under your own window. {{spouse}} pulls you inside before the orchard can acquire another harvest.',{charm:3,bond:{role:'spouse',affinity:9,respect:-3}}),
 ],{actorRoles:{spouse:SPOUSE},repetitionGroup:'romantic_misunderstandings'}),
 comic('ordinary_john','THE NOBLE’S BRILLIANT DISGUISE','{{other}} arrives in a sack with a coronet underneath and insists the name is “Ordinary John”. Ordinary John would like to hear an honest opinion of the local nobility.',[
  reply('work','Give Ordinary John an ordinary load to carry','{{other}} carries it three steps before requesting the sort of assistance usually reserved for important people. You praise the remarkable speed of the promotion.',{wits:2,reputation:3,bond:{role:'other',respect:5,affinity:-5}}),
  reply('truth','Describe exactly what the households complain about','{{other}} forgets to disguise the voice halfway through defending the lord. The argument becomes considerably more useful after that.',{bond:{role:'other',trust:8,affinity:-6},faction:{factionId:'commons',playerStanding:3}}),
  reply('flatter','Remark how handsome the disguised lord must be','{{other}} agrees before remembering not to know. You are both obliged to admire the sack for a moment.',{charm:3,bond:{role:'other',affinity:9},reputation:-2}),
 ],{actorRoles:{other:{...ADULT,rankAtLeast:3}}}),
 comic('wedding_hiccup','THE WEDDING SPEECH THAT WILL NOT END','{{other}} asks you to toast a newly married couple. A hiccup arrives after the first name and appears determined to marry it to every sentence.',[
  reply('short','Offer the shortest possible blessing','You say “Happiness”, hiccup once and sit. {{other}} calls it the most efficient speech of the feast.',{charm:2,bond:{role:'other',trust:5}}),
  reply('song','Make the interruption part of a song','The guests join in at the wrong places. {{other}} has to explain to the bride’s aunt that this was not a family custom until five minutes ago.',{charm:4,reputation:-2,bond:{role:'other',affinity:5}}),
  reply('persist','Refuse to surrender the rest of your magnificent speech','The couple finish eating before you finish the introduction. {{other}} moves the candle farther from your sleeve without interrupting the hiccups.',{reputation:-4,faith:1,bond:{role:'other',respect:-5}}),
 ],{repetitionGroup:'weddings'}),
 comic('wrong_balcony','THE LADDER AT THE WRONG WINDOW','{{other}} waits below a dark window with flowers. You know the room belongs to an elderly wool sorter who has already opened a bucket.',[
  reply('warn','Move the admirer before the bucket tips','{{other}} escapes with dry flowers and a much wetter opinion of the address supplied by a friend.',{bond:{role:'other',trust:10},wits:1}),
  reply('announce','Announce the serenade to its actual audience','The wool sorter demands a second verse. {{other}} receives the bucket only after failing to supply one.',{charm:3,bond:{role:'other',trust:-12,flag:'rival'}}),
  reply('sing','Take the first verse yourself','The bucket finds you instead. {{other}} helps wring out your cloak and promises never to praise your voice again.',{health:-2,bond:{role:'other',affinity:12},reputation:-2}),
 ],{repetitionGroup:'romantic_misunderstandings'}),
 comic('borrowed_sleeves','THE SLEEVES THAT ARRIVED BEFORE YOU','{{other}} lends you fashionable sleeves for an important supper. They reach the soup before your hands and the candle before your judgement.',[
  reply('roll','Roll them up and admit the loan','You eat with both hands visible. {{other}} asks why nobody told the tailor this was an available arrangement.',{bond:{role:'other',trust:6},wits:2}),
  reply('grand','Continue the magnificent gestures','The left sleeve extinguishes a candle and the right acquires somebody else’s sauce. {{other}} retrieves the sleeves before they can accept a third invitation.',{reputation:-4,bond:{role:'other',affinity:-6},gold:-3}),
  reply('partner','Ask your neighbour to hold the spare fabric','The two of you conduct supper like an awkward sail. {{other}} is delighted until asked to steer the pudding.',{charm:3,bond:{role:'other',affinity:7}}),
 ]),
 comic('proud_minstral','THE HERO WITH A RHYME MISSING','{{other}} commissions a song about your courage. The minstrel has found rhymes for your name, but all of them involve a cowardly act or a skin complaint.',[
  reply('change','Become the hero under a less musical name','The song praises a stranger with your deeds. {{other}} enjoys it until the stranger is credited with paying for supper.',{reputation:2,gold:-2,bond:{role:'other',affinity:5}}),
  reply('honest','Suggest the embarrassing incident yourself','The audience laughs where you intended. {{other}} has to surrender the much worse version prepared for later.',{charm:4,bond:{role:'other',respect:6}}),
  reply('command','Demand that courage rhyme with your name','The minstrel stretches the word across three notes. {{other}} starts coughing at every repetition and finally leaves the room to recover.',{reputation:-4,bond:{role:'other',affinity:-5}}),
 ],{repetitionGroup:'public_vanity'}),
 comic('cherry_stone','THE CHAMPION’S VERY SMALL WEAPON','{{other}} challenges you to spit a cherry stone farther than the village champion. The champion is the baker’s grandmother and has removed her good shoes.',[
  risk('compete','Compete with suitable respect',.55,'Your stone passes hers. {{other}} congratulates you at a careful distance from the grandmother’s second attempt.',{charm:3,reputation:2},'Your stone lands in your own collar. {{other}} declares this an entirely different achievement.',{charm:-1,bond:{role:'other',affinity:5}}),
  reply('judge','Judge the distances instead','{{other}} disputes half a thumb’s length until the grandmother offers to demonstrate it against a nearby target. The dispute ends.',{wits:2,bond:{role:'other',trust:5}}),
  reply('cheat','Kick your stone farther while everyone watches hers','The grandmother has been watching your feet. {{other}} awards you a special prize for having apparently misunderstood the sport.',{reputation:-5,bond:{role:'other',trust:-5}}),
 ]),
 comic('peacock_step','THE DANCE WITH ONE INSTRUCTION TOO MANY','{{other}} teaches a fashionable dance before the lord’s supper. Every step has a name. Your feet know none of them.',[
  reply('simple','Offer a simpler village measure','The servants recognise the tune and the nobles borrow their timing. {{other}} calls this the rustic portion of an increasingly successful evening.',{charm:4,bond:{role:'other',respect:5}}),
  reply('invent','Invent names for the mistakes','The audience follows the second mistake willingly. {{other}} is obliged to explain why the dance now contains “Avoid the Chair”.',{charm:5,bond:{role:'other',affinity:-4}}),
  reply('stop','Stop before taking anyone else with you','You leave the floor with a bow that requires no assistance. {{other}} praises your judgement in the voice usually used for the injured.',{wits:2,bond:{role:'other',trust:3}}),
 ]),
 comic('soup_proof','THE MERCHANT’S FABULOUSLY EMPTY FEAST','{{other}} invites the important buyers to admire a new fortune. The dishes are magnificent, the portions are tiny and the cook has begun serving the decorations.',[
  reply('share','Turn it into a shared supper','You bring bread and invite everyone to add what they have. {{other}} acquires a warm evening at the cost of a rather cold pretence.',{householdState:{food:-4},bond:{role:'other',trust:10},reputation:2}),
  reply('praise','Praise the remarkable lightness of every course','The buyers repeat the compliment until {{other}} orders the cook to make something heavy. The cook brings the pot.',{charm:3,bond:{role:'other',affinity:-12,flag:'rival'}}),
  reply('leave','Leave hungry without exposing the host','{{other}} follows you to the door with an apology wrapped round the last piece of cheese.',{bond:{role:'other',trust:7},health:-1}),
 ],{requires:{careerFamilies:['trade']}}),
 comic('fierce_hat','THE HAT THAT FRIGHTENS ITS OWNER','{{other}} acquires a plumed hat to make an impression at court. A gust makes the plume brush the back of the neck. The resulting leap makes a different impression.',[
  reply('catch','Catch the hat before the second attack','{{other}} thanks you and holds the hat at arm’s length for the rest of the introduction.',{bond:{role:'other',trust:8},charm:1}),
  reply('bow','Bow solemnly to the victorious feather','The servants copy the bow. {{other}} removes the plume with the expression of someone dismissing a dangerous officer.',{charm:3,bond:{role:'other',trust:-10,flag:'rival'}}),
  reply('wear','Offer to tame the creature yourself','You wear the hat backwards. {{other}} is forced to choose between gratitude and explaining why this looks better.',{reputation:2,bond:{role:'other',affinity:6}}),
 ],{requires:{rankAtLeast:1}}),
 comic('hermit_guest','THE HERMIT WHO ENJOYS VISITORS','{{other}} invites you to meet a famous hermit. The hermit offers three courses, asks who else is coming and complains that solitude has been slow this season.',[
  reply('listen','Let the lonely host talk','The hermit tells you about the winter. {{other}} quietly stops explaining the advantages of never needing anybody.',{faith:3,bond:{role:'other',trust:6}}),
  reply('invite','Invite the hermit to your next supper','The invitation is accepted before you have named a date. {{other}} wonders whether a hermit may bring a companion.',{householdState:{food:-3},bond:{role:'other',affinity:8}}),
  reply('mock','Ask whether the wilderness requires a waiting room','The hermit finds an excellent view for you outside. {{other}} remains for the second course.',{charm:2,bond:{role:'other',affinity:-7}}),
 ]),
 comic('bravery_pig','THE NOBLE’S PROOF OF COURAGE','{{other}} offers to demonstrate courage by approaching an allegedly savage pig. The pig is asleep. Its owner recommends leaving both facts undisturbed.',[
  reply('quiet','Declare the beast subdued before waking it','{{other}} accepts the triumph in a whisper. The pig sleeps through its own defeat.',{charm:3,bond:{role:'other',trust:7},reputation:-1}),
  reply('wake','Wake the pig and let courage take its course','The pig rises, sniffs and follows the smell of the feast. {{other}} retreats faster than anyone expected a victory to travel.',{reputation:3,bond:{role:'other',affinity:-15,flag:'rival'}}),
  reply('lead','Show how its owner actually handles it','You lead it away with food. {{other}} asks whether anyone needs to mention the food in the account of your bravery.',{householdState:{food:-2},skillXp:{husbandry:5},bond:{role:'other',respect:6}}),
 ],{actorRoles:{other:{...ADULT,rankAtLeast:3}}}),
 comic('rival_saddle','THE RIVAL WHO ARRIVED SIDEWAYS','{{other}} rides into the square rehearsing a splendid greeting. The saddle begins to turn halfway through it.',[
  reply('help','Hold the reins before the speech falls off','{{other}} completes the greeting from the ground. Thanks follows considerably later, but it does follow.',{bond:{role:'other',trust:10},reputation:2}),
  reply('audience','Ask the crowd to admire the new riding style','{{other}} spends the evening explaining how little the incident mattered. By nightfall, even the stable boy knows which side landed first.',{charm:4,bond:{role:'other',trust:-15}}),
  reply('lesson','Offer a private lesson in checking the girth','{{other}} accepts after making it clear that the lesson concerns the saddle’s conduct.',{skillXp:{arms:3},bond:{role:'other',respect:7}}),
 ],{actorRoles:{other:RIVAL}}),
 comic('jealous_mirror','THE PERSON YOUR SPOUSE KEEPS PRAISING','{{spouse}} has praised a stranger’s looks three times. You discover the portrait being admired is a very flattering picture of you.',[
  reply('admit','Admit the resemblance before demanding an apology','{{spouse}} studies you, then the picture, then asks whether the painter can also improve your hearing.',{bond:{role:'spouse',affinity:8},charm:-1}),
  reply('join','Agree that the stranger seems delightful','You compliment the painted face until {{spouse}} turns it round. Supper includes a surprisingly detailed discussion of modesty.',{charm:3,bond:{role:'spouse',respect:-4,affinity:5}}),
  reply('accuse','Insist this proves something suspicious anyway','{{spouse}} puts the portrait away. The room becomes less handsome and much less willing to explain itself.',{bond:{role:'spouse',trust:-15}}),
 ],{actorRoles:{spouse:SPOUSE},repetitionGroup:'romantic_misunderstandings'}),
 comic('proposal_pear','THE PROPOSAL THAT STUCK','You plan a graceful greeting for {{other}} and take one last bite of pear. The greeting arrives as an urgent request for help with the pear.',[
  reply('honest','Start again after you can speak','{{other}} hears the real greeting between two small laughs. The second attempt has fewer ornaments and a better answer.',{bond:{role:'other',affinity:10,trust:5},charm:1}),
  reply('bow','Pretend the coughing was an elaborate bow','{{other}} returns the bow while trying not to laugh. You have introduced an unfortunate new custom between you.',{charm:3,bond:{role:'other',affinity:5}}),
  reply('retreat','Retreat with what remains of your dignity','{{other}} offers water for the retreat. Your dignity has to accept it before leaving.',{bond:{role:'other',respect:2},charm:-1}),
 ],{actorRoles:{other:SUITOR},requires:{custom:s=>!s.world.characters[s.playerCharacterId].spouseId}}),
 comic('secret_footprints','THE ROMANCE WITH VERY CLEAR FOOTPRINTS','{{spouse}} points to two sets of muddy footprints outside a neighbour’s window. Yours lead there and back. You were returning a borrowed kettle; the kettle has not stayed to testify.',[
  reply('fetch','Fetch the kettle and its owner','The owner arrives carrying the kettle and an excellent memory for the handle you broke. {{spouse}} forgives the supposed romance before discussing the handle.',{gold:-3,bond:{role:'spouse',trust:10}}),
  reply('mud','Explain that many people own feet','{{spouse}} agrees, then asks how many of them wear your patched left shoe. The argument acquires a very specific shape.',{bond:{role:'spouse',trust:-12}}),
  reply('repair','Admit the broken handle before anything else','{{spouse}} asks why a kettle was worth such an impressive effort to appear unfaithful. The two of you finish laughing before supper.',{bond:{role:'spouse',affinity:9},reputation:-1}),
 ],{actorRoles:{spouse:SPOUSE},repetitionGroup:'romantic_misunderstandings'}),
 comic('borrowed_baby','THE BABY WHO CHOSE THE IMPORTANT GUEST','{{other}} brings a visiting dignitary to admire a new baby. The baby reaches for the grand chain and immediately decides it is worth tasting.',[
  reply('toy','Offer a wooden toy in exchange','The baby releases the chain. {{other}} watches the dignitary thank a piece of wood for succeeding where rank had failed.',{bond:{role:'other',trust:6},charm:2}),
  reply('praise','Congratulate the baby on excellent judgement','{{other}} has to hold the baby while the guest removes the chain. Neither appears willing to be the first to apologise.',{charm:3,bond:{role:'other',affinity:-6}}),
  reply('rescue','Take the baby and the responsibility','The baby releases the chain and grips your sleeve. {{other}} calls this a happy transfer of government.',{bond:{role:'other',trust:9},householdLesson:{progress:3}}),
 ]),
 comic('honourable_coward','THE HERO HIDING BEHIND THE RIGHT DOOR','{{other}} hides from a noisy quarrel behind a cellar door. Opening it lets out the household’s enormous dog, which ends the quarrel immediately. Witnesses are cheering the courage.',[
  reply('credit','Praise the dog’s contribution','The owner feeds the actual hero. {{other}} accepts a smaller share of the applause without having to re-enter the cellar.',{reputation:3,bond:{role:'other',respect:5}}),
  reply('legend','Help improve the story','{{other}} becomes increasingly brave with each telling and increasingly dependent on your silence.',{charm:3,bond:{role:'other',trust:10},createSecret:{type:'criminal_contact',severity:15}}),
  reply('quiet','Get the frightened neighbour away from the crowd','{{other}} stops shaking once the cheering is two streets away. You let the dog have the rest of the story.',{bond:{role:'other',trust:12},faith:1}),
 ]),
 comic('lofty_bed','THE BED MADE FOR A MUCH BETTER PERSON','{{other}} has raised a bed to show the household’s importance. Getting into it now requires a servant, a stool and a willingness to be seen needing both.',[
  reply('stairs','Build a small step and name nobody in particular','{{other}} tests the step after everyone has been asked to leave. The furniture finally becomes suitable for sleeping.',{skillXp:{craftsmanship:4},bond:{role:'other',trust:7}}),
  reply('admire','Admire the view from the floor','{{other}} descends to explain that height is not the point. This takes both the stool and most of the explanation.',{charm:3,bond:{role:'other',affinity:-9}}),
  reply('lower','Suggest returning the legs to ordinary length','The carpenter lowers the bed while {{other}} is away. You are thanked for the comfort and blamed for the lost elevation.',{bond:{role:'other',respect:6,affinity:-3},wits:2}),
 ]),
 comic('feud_tune','THE FAMILY FEUD LEARNS A TUNE','{{other}} whistles a tune associated with an old family insult. Half the lane recognises the insult; the other half keeps asking for the next verse.',[
  reply('different','Supply an embarrassingly affectionate new verse','The tune survives as a love song nobody wants to claim. {{other}} finds it much harder to whistle threateningly.',{charm:4,bond:{role:'other',trust:5}}),
  reply('answer','Sing the insulting verse back (family feud)','The lane learns both versions. Your households now possess a quarrel that can be performed without either of you being present.',{reputation:-4,familyFeud:{role:'other',reason:'Public exchange of a family insult'},bond:{role:'other',trust:-20}}),
  reply('private','Ask what the quarrel is actually about','{{other}} begins with a grandfather, loses track of a cousin and finally admits to never having met either. You agree to leave them out of supper.',{bond:{role:'other',trust:10},wits:2}),
 ],{actorRoles:{other:{...ADULT,outsideFamily:true}}}),
 comic('rival_praise','THE COMPLIMENT YOUR RIVAL BELIEVED','{{other}} mistakes your sarcastic praise for a sincere recommendation. The resulting bow is so grateful that the audience has stopped laughing.',[
  reply('allow','Let the compliment become true','You help finish the task you had intended to mock. {{other}} thanks you a second time. Resenting the first was much easier.',{health:-2,bond:{role:'other',trust:12,clearRivalry:true}}),
  reply('explain','Explain the joke at full volume','The crowd understands. {{other}} understands more than you meant to teach.',{charm:2,reputation:-3,bond:{role:'other',trust:-18}}),
  reply('redirect','Suggest a more modest first attempt','{{other}} tries it and succeeds. You are left in the awkward position of having given useful advice.',{bond:{role:'other',respect:8},wits:1}),
 ],{actorRoles:{other:RIVAL}}),
 comic('suitor_rehearsal','THE SUITOR WHO BROUGHT A PROPMAN','{{other}} rehearses a flattering speech to you. A friend behind the hedge supplies the forgotten words and, on one occasion, the wrong beloved’s name.',[
  reply('hedge','Ask the hedge whether it wishes to join the conversation','The prompter crawls out. {{other}} delivers the remaining sentence without help, and it is much better for being short.',{bond:{role:'other',affinity:8},charm:2}),
  reply('learn','Teach the suitor to ask a real question','{{other}} asks what you would actually enjoy doing. The hedge, having no prepared answer, is finally quiet.',{bond:{role:'other',trust:10},wits:1}),
  reply('depart','Leave before the hedge proposes marriage','{{other}} bows alone. The prompter supplies an ending to somebody who is already walking home.',{bond:{role:'other',affinity:-5},charm:1}),
 ],{actorRoles:{other:SUITOR},requires:{custom:s=>!s.world.characters[s.playerCharacterId].spouseId}}),
 comic('triumphal_return','THE TRIUMPH THAT REACHED THE WRONG HOUSE','{{other}} returns from a modest errand beneath a garland and two borrowed banners. The procession stops at your house because nobody thought to ask where the hero lived.',[
  reply('welcome','Offer the hero a seat and water','{{other}} sits among the abandoned banners and admits the errand concerned a missing shoe. You ask whether it has returned in triumph too.',{householdState:{food:-2},bond:{role:'other',trust:8}}),
  reply('redirect','Lead the procession to the actual destination','The neighbours cheer when the right door finally opens. {{other}} has to acknowledge your contribution to the navigation.',{reputation:3,bond:{role:'other',respect:5}}),
  reply('hero','Accept the applause yourself','You bow until somebody asks what you did. {{other}} supplies the answer with the joy of someone finally useful to the ceremony.',{charm:3,reputation:-5,bond:{role:'other',trust:-7}}),
 ]),
 comic('false_wake','THE WAKE THAT STARTED TOO EARLY','{{parent}} falls asleep during preparations for an elderly neighbour’s wake. A visiting mourner begins praising the wrong person’s virtues. {{parent}} opens one eye at the first exaggeration.',[
  reply('correct','Make the introduction before the speech improves','The mourner is relieved to discover a living critic. {{parent}} asks to keep the part about generosity for another occasion.',{boundKinRel:{role:'parent',delta:8},charm:2}),
  reply('listen','Let your parent hear the affectionate part','{{parent}} waits until the kind words are finished before asking for tea. The mourner laughs and stays to share it.',{boundKinRel:{role:'parent',delta:12},faith:2}),
  reply('object','Correct the praise as well as the identity','{{parent}} sits up to defend virtues nobody had questioned until you arrived. The actual wake proceeds with rather less help from you.',{bond:{role:'parent',trust:-10},reputation:-3}),
 ],{actorRoles:{parent:{...ADULT,relation:'parent'}},repetitionGroup:'family_embarrassment'}),
];
