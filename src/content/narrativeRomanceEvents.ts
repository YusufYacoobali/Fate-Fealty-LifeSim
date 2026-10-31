import type { GameEvent } from '@/types/game';
import { scene, reply, ADULT, SPOUSE, SIBLING, fraud } from './narrativeHelpers';
const wed = { actorRoles:{spouse:SPOUSE}, ageMin:18, repetitionGroup:'married_disagreements' };
const single = { actorRoles:{other:{...ADULT,unmarried:true,romanceEligible:true}}, ageMin:18, requires:{missingTags:['married']}, repetitionGroup:'courtship_bargains' };
export const NARRATIVE_ROMANCE_EVENTS: GameEvent[] = [
  scene('life_three_grooms','family','family','THE WEDDING OF THREE GROOMS','{{sibling}} has promised to pay three different wedding brokers for one match. All three bring contracts to the same supper. The prospective marriage is the only part nobody has arranged.',[
    reply('expose','Read all three contracts aloud','You expose the conflicting promises. Family standing suffers and {{sibling}} blames the only person at supper who could read.',{familyReputation:{delta:-8},bond:{role:'sibling',trust:-15,flag:'rival'}}),
    reply('settle','Pay the brokers to cancel the claims (15g)','The contracts are cancelled for fifteen gold. Everybody leaves unmarried. The family counts this as the evening’s first clear success.',{gold:-15,boundKinRel:{role:'sibling',delta:12},familyReputation:{delta:4}},{costGold:15}),
    reply('profit','Demand a share of the household’s wedding reserve','You take ten gold from the reserve. {{sibling}} now has three brokers and one blackmailer to satisfy.',{gold:10,householdState:{wealth:-10},bond:{role:'sibling',trust:-25,flag:'feud'},createSecret:{type:'hidden_debt',severity:35}}),
  ],{actorRoles:{sibling:SIBLING},requires:{householdAtLeast:{wealth:10}},repetitionGroup:'humiliating_marriages'}),
  scene('life_marriage_inventory','family','family','THE INVENTORY OF MATRIMONY','{{spouse}} has drawn up a list of everything each of you brought to the marriage. Under your name, “confidence” is underlined twice.',[
    reply('laugh','Add a fair account of the unpaid work','You list the work both of you do. {{spouse}} puts the inventory away before it needs another sheet.',{bond:{role:'spouse',trust:12,affinity:8},householdState:{status:2}}),
    reply('win','Prove that you brought more','You win the valuation and lose affection. {{spouse}} asks whether you would like a receipt for the triumph.',{bond:{role:'spouse',affinity:-14,trust:-8},wits:2}),
    reply('divide','Seek a formal separation and divide your goods','You end the marriage and surrender part of the household reserve. The list becomes useful in a way neither of you intended.',{endMarriage:true,householdState:{wealth:-20},gold:-10}),
  ],{...wed,stakes:'major'}),
  scene('life_wedding_bench','family','family','THE BENCH BETWEEN TWO FAMILIES','At your wedding anniversary meal, {{spouse}} objects to the order of the benches. Everyone insists that seating means nothing while refusing to move.',[
    reply('mix','Mix the benches and serve the food yourself','You put conversation before precedence. {{spouse}} helps, and the household’s reputation improves without buying another bench.',{bond:{role:'spouse',affinity:8},familyReputation:{delta:3}}),
    reply('yield','Let your spouse choose the seats','{{spouse}} gets the arrangement right to at least one person’s satisfaction. Your willingness to yield is remembered kindly at home.',{bond:{role:'spouse',trust:7},charm:-1}),
  ],{...wed,repetitionGroup:'humiliating_marriages'}),
  scene('life_love_letter_account','family','family','THE LOVE LETTER WITH A TALLY','{{other}} sends a declaration of affection on the back of a household account. The account is paid. This is the most encouraging part of the letter.',[
    reply('reply','Answer honestly, without promising a wedding','You begin a warmer acquaintance with {{other}}. Nobody is married by correspondence, though both of you enjoy the ink.',{bond:{role:'other',affinity:14,trust:7},charm:2}),
    reply('marry','Accept the offered marriage','You and {{other}} marry by mutual consent. The household account becomes the least interesting part of the document.',{marryRole:'other',familyReputation:{delta:2}}),
    reply('decline','Return a kind refusal','You decline without circulating the letter. {{other}} appreciates having one disappointment instead of an audience.',{bond:{role:'other',trust:5},faith:2}),
  ],single),
  scene('life_jealous_petition','family','family','THE PETITION AGAINST YOUR EVENINGS','{{spouse}} asks why every errand takes you past the same doorway. You offer a well-prepared explanation. {{spouse}} asks how long you have been preparing it.',[
    reply('talk','Give a full account and change the arrangement','You answer the question and make room for your spouse’s worry. Trust improves through a less entertaining use of the evening.',{bond:{role:'spouse',trust:14,affinity:4}}),
    reply('mock','Turn the suspicion into a public joke','The joke reaches an audience. {{spouse}} withdraws affection and acquires a grievance that is entirely about what you actually did.',{bond:{role:'spouse',trust:-20,affinity:-16},familyReputation:{delta:-4}}),
    reply('leave','End the marriage rather than answer','You choose separation. The marriage ends, the household loses resources and the unanswered question survives without a husband or wife to ask it.',{endMarriage:true,householdState:{wealth:-18,quality:-8}}),
  ],{...wed,stakes:'major',repetitionGroup:'marital_suspicion'}),
  scene('life_suitor_testament','family','family','A SUITOR’S EARLY TESTAMENT','{{other}} offers you a marriage contract and a draft will in the same sitting. The second document has been written considerably more neatly.',[
    reply('wait','Discuss how to live together before discussing death','You leave the contracts unsigned and the acquaintance more honest. {{other}} is relieved to put away the better pen.',{bond:{role:'other',trust:12},wits:3}),
    reply('agree','Accept the marriage without the speculative will','You marry {{other}} by consent. Neither of you gains an inheritance in advance of anyone’s death.',{marryRole:'other',bond:{role:'other',trust:5}}),
    reply('false','Forge a richer settlement than you own','You create a false marriage settlement without making a marriage. {{other}} becomes a witness to the fraud, not your spouse.',{legal:fraud('Forging a marriage settlement'),bond:{role:'other',trust:-30,flag:'rival'},familyReputation:{delta:-8}}),
  ],{...single,stakes:'major',repetitionGroup:'suspicious_inheritances'}),
  scene('life_returned_gift','family','family','THE GIFT RETURNED IN BETTER WRAPPING','{{other}} returns a courtship gift wrapped more beautifully than when it left you. The rejection appears to have received professional help.',[
    reply('accept','Accept the answer and admire the wrapping','You take the refusal without turning it into a quarrel. {{other}} trusts you more for the boundary you respect.',{bond:{role:'other',trust:9},faith:2}),
    reply('demand','Demand payment for the humiliation','You make an enemy of someone who had merely declined you. The wrapping is now the kindest part of the exchange.',{bond:{role:'other',affinity:-22,trust:-20,flag:'rival'},reputation:-4}),
  ],single),
  scene('life_lovers_witness','family','crime','A WITNESS TO THE WRONG ROMANCE','{{other}} asks you to swear you saw a courting couple promise marriage. You saw two people quarrel over a borrowed cloak, but the fee for remembering otherwise is tempting.',[
    reply('truth','Describe exactly what you saw','You refuse the false testimony. {{other}} loses trust in your usefulness; your own legal record remains untouched.',{bond:{role:'other',affinity:-8},familyReputation:{delta:4}}),
    reply('lie','Sign the false testimony for a promised reward','You accept a promise of payment and acquire a real perjury charge. The promised money is still only a promise.',{legal:fraud('False testimony about marriage vows'),createSecret:{type:'hidden_debt',severity:45},bond:{role:'other',trust:5}}),
    reply('warn','Warn the people whose names are being used','You publicly challenge the scheme. Your reputation rises while {{other}} acquires a specific grievance against you.',{reputation:5,bond:{role:'other',affinity:-18,flag:'rival'}}),
  ],{repetitionGroup:'false_witnesses'}),
  scene('life_spouse_poem','family','family','THE PRACTICAL LOVE POEM','{{spouse}} discovers a poem you wrote early in the marriage. Your present skill at remembering where the firewood is stored compares poorly with your former devotion.',[
    reply('act','Fetch the wood before discussing the poem','The room warms and {{spouse}} accepts the new verse as an improvement. It has fewer adjectives and better fuel.',{householdState:{food:2},bond:{role:'spouse',affinity:10},health:-1}),
    reply('recite','Recite it with undiminished confidence','You make {{spouse}} laugh, though the wood remains where it was. Affection improves more than the room temperature.',{bond:{role:'spouse',affinity:5},charm:2}),
  ],wed),
  scene('life_duplicate_ring','family','family','THE IDENTICAL TOKEN','{{spouse}} finds a love token that looks exactly like one given to a neighbour. The pedlar who sold them is wisely absent.',[
    reply('explain','Admit the token came from a crowded stall','You admit that the token was common and the affection was not. {{spouse}} accepts the distinction after enjoying your discomfort.',{bond:{role:'spouse',trust:8},charm:-2}),
    reply('replace','Commission something personal (7g)','Seven gold buys a token with a private inscription. {{spouse}} reads it twice before deciding not to ask what the first one cost.',{gold:-7,bond:{role:'spouse',affinity:13}},{costGold:7}),
    reply('accuse','Accuse your spouse of inventing the comparison','You answer a small doubt with a larger cruelty. Trust falls, and the cheap token has become an expensive object.',{bond:{role:'spouse',trust:-17,affinity:-10}}),
  ],{...wed,repetitionGroup:'marital_suspicion'}),
  scene('life_marriage_exit_fee','family','family','THE PRICE OF PARTING','You and {{spouse}} are considering separation. The clerk has quoted for three copies: one for each of you and one for everyone who will pretend not to have read it.',[
    reply('part','Pay for a formal separation (12g)','The marriage ends and twelve gold pays for the record. The clerk is the only person who calls the day satisfactory.',{gold:-12,endMarriage:true,householdState:{wealth:-10}},{costGold:12}),
    reply('reconcile','Try an honest conversation before signing','You keep the marriage and rebuild a little trust. It is a beginning, not a miraculous repair.',{bond:{role:'spouse',trust:9,affinity:3}}),
    reply('discard','Destroy the draft and forbid further discussion','The marriage continues under less trust. A torn document is easier to silence than the person who asked for it.',{bond:{role:'spouse',trust:-18},familyReputation:{delta:-2}}),
  ],{...wed,stakes:'major'}),
  scene('life_dowry_geese','family','household','THE DOWRY WHICH HONKS','{{spouse}} wants the household’s wedding reserve spent on food rather than another display of respectability. The proposed display has a ribbon budget larger than its supper budget.',[
    reply('food','Put the money into household food (9g)','You fund the reserve and cancel the ribbons. {{spouse}} values an anniversary that can be eaten.',{gold:-9,householdState:{food:16},bond:{role:'spouse',trust:8}},{costGold:9}),
    reply('display','Buy the display and leave supper thin (9g)','The ribbons are splendid and the household’s food reserve shrinks. {{spouse}} declines to be nourished by colour.',{gold:-9,householdState:{food:-7,status:4},bond:{role:'spouse',affinity:-7}},{costGold:9}),
    reply('simple','Hold a quiet meal with what you have','You choose an unshowy supper and keep your savings. {{spouse}} enjoys not having to praise anything you have bought.',{bond:{role:'spouse',affinity:6},familyReputation:{delta:1}}),
  ],wed),
  scene('life_chaperone_bill','family','family','THE CHAPERONE’S EXPENSES','{{other}} brings an itemised account for supervising two people’s courtship. “Looking away at suitable moments” is the largest charge.',[
    reply('question','Ask the supervised couple to review the account','You expose the exaggerated bill without inventing a romantic scandal. {{other}} dislikes the new interest in arithmetic.',{bond:{role:'other',trust:-8},reputation:3}),
    reply('pay','Pay to spare the couple an argument (5g)','You pay for discretion and dubious eyesight. {{other}} is pleased to find affection has a solvent friend.',{gold:-5,bond:{role:'other',affinity:7}},{costGold:5}),
  ],{repetitionGroup:'courtship_bargains'}),
  scene('life_wrong_serenade','family','family','THE SERENADE AT THE STOREROOM','{{other}} has been singing beneath a shutter that opens onto a storeroom. The household wants the flour left out of the next verse.',[
    reply('guide','Privately explain the mistake','You save {{other}} from a second performance and gain a grateful acquaintance. The flour remains unmoved.',{bond:{role:'other',trust:10,flag:'friend'},charm:2}),
    reply('encore','Call loudly for an encore','{{other}} discovers the error in public. Your reputation for wit rises slightly; your reputation with the singer falls considerably.',{charm:4,bond:{role:'other',affinity:-18,flag:'rival'}}),
    reply('shelter','Offer the singer a quiet cup indoors (3g)','You pay for a little hospitality and the humiliation passes without an audience. {{other}} remembers the door that actually opened.',{gold:-3,bond:{role:'other',trust:14}},{costGold:3}),
  ],{repetitionGroup:'courtship_embarrassment'}),
  scene('life_spouse_guest','family','household','THE GUEST WHO CAME WITH THE MARRIAGE','{{spouse}} has invited a relation to stay. “A short visit” has now acquired a spare blanket and an opinion about the way you cook.',[
    reply('agree','Agree on a leaving date together','You and {{spouse}} settle the invitation without a public quarrel. Household trust improves and the spare blanket remains only a blanket.',{bond:{role:'spouse',trust:10},householdState:{status:2}}),
    reply('support','Fund another week’s food (9g)','You pay for the visit and improve the food reserve. {{spouse}} appreciates generosity that does not arrive attached to a complaint.',{gold:-9,householdState:{food:8},bond:{role:'spouse',affinity:8}},{costGold:9}),
    reply('expel','Order the guest out and blame your spouse','The household loses harmony and {{spouse}} loses trust in you. Winning the doorway has cost you something farther inside.',{bond:{role:'spouse',trust:-20,affinity:-12},holding:{loyalty:-5}}),
  ],wed),
  scene('life_matchmaker_rival','family','family','THE MATCHMAKER’S UNHELPFUL RECOMMENDATION','{{other}} recommends you for a marriage by praising your ability to withstand disappointment. You would prefer the compliment not to need so many examples.',[
    reply('correct','Set out what you actually want in a match','You replace a flattering description with an honest one. {{other}} understands you better and has less material for the next introduction.',{bond:{role:'other',trust:8},wits:2}),
    reply('invent','Invent impressive relations and property','Your invented position becomes a concealed falsehood. {{other}} is impressed by facts that will be expensive to defend.',{createSecret:{type:'false_lineage',severity:40},familyReputation:{delta:3},bond:{role:'other',trust:-5}}),
  ],{requires:{missingTags:['married']},repetitionGroup:'courtship_bargains'}),
  scene('life_anniversary_silence','family','family','THE ANNIVERSARY NEITHER MENTIONED','You and {{spouse}} have both forgotten the date of your marriage. Each of you is carefully waiting to see whether the other has remembered.',[
    reply('admit','Admit it first and share the relief','{{spouse}} laughs with the relief of a person acquitted before accusation. You begin a better evening than either of you had planned.',{bond:{role:'spouse',affinity:12,trust:4}}),
    reply('blame','Wait, then accuse your spouse of forgetting','You win a small advantage and spend it immediately on an argument. {{spouse}} is less inclined to celebrate the next year.',{bond:{role:'spouse',trust:-10,affinity:-8}}),
  ],wed),
  scene('life_lover_public_oath','family','crime','THE OATH THAT WAS NOT YOURS','{{other}} has circulated a claim that you promised marriage. You remember promising to return a borrowed pot. The pot is still at home.',[
    reply('return','Return the pot before witnesses','You return the object you actually promised and reject the other claim publicly. {{other}} resents the clarity.',{bond:{role:'other',trust:-12},familyReputation:{delta:4}}),
    reply('settle','Pay to withdraw the accusation (9g)','Nine gold buys an end to this claim, together with a secret about how readily your name can be priced.',{gold:-9,bond:{role:'other',trust:-8},createSecret:{type:'hidden_debt',severity:25}},{costGold:9}),
    reply('forge','Produce a forged counterclaim','Your counterclaim reaches the clerk, who recognises the false seal. You face a forgery charge; the pot has become the most innocent participant.',{legal:fraud('Forging evidence in a marriage dispute'),familyReputation:{delta:-6},bond:{role:'other',affinity:-20,flag:'feud'}}),
  ],{repetitionGroup:'humiliating_marriages'}),
];
