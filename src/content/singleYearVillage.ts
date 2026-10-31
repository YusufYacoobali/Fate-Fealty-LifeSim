import type {GameEvent} from '@/types/game';
import {scene,reply,risk,ADULT,CHILD,SIBLING,fraud} from './narrativeHelpers';

function village(source:string,domain:GameEvent['domain'],title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={}):GameEvent {
 return scene('single_chain_'+source,domain==='politics'?'court':'peasant',domain,title,text,choices,{convertedFrom:'chain:'+source,repetitionGroup:source,...options});
}
export const SINGLE_YEAR_VILLAGE:GameEvent[]=[
 village('broken_betrothal','family','THE MATCH WITH FOUR COPIES AND NO AGREEMENT','{{other}} brings a marriage settlement that promises more than either household owns. The clerk recommends signing before anyone counts.',[
  reply('count','Count the goods and renegotiate','The promised ox becomes a cart, then half a cart, then an apology. {{other}} agrees to a smaller honest settlement; nobody is married by arithmetic alone.',{bond:{role:'other',trust:8},familyReputation:{delta:3},wits:2}),
  reply('withdraw','Withdraw the promise openly','The proposed match ends before anybody has to live inside it. {{other}} returns your token with the air of a creditor cancelling a very small kingdom.',{bond:{role:'other',affinity:-8},memory:{tag:'betrothal_withdrawn',weight:3}}),
  reply('inflate','Add your own imaginary livestock','The settlement now contains enough cattle to feed both families until the clerk asks where they are. {{other}} supplies the false document to the court.',{legal:fraud('Offering a fraudulent marriage settlement'),familyReputation:{delta:-8}}),
 ],{ageMin:16}),
 village('foster_oath','family','THE CHILD AT THE THRESHOLD','{{other}} brings a child needing a home. The parish offers a blessing and asks whether you can provide the less portable necessities.',[
  reply('place','Register a placement and set aside food','The placement is entered through the parish and food is reserved. {{other}} carries away a practical answer instead of another prayer to translate into supper.',{householdState:{food:-8},expectChild:{route:'adoption',dueInYears:1},bond:{role:'other',trust:12}}),
  reply('fund','Fund the child’s immediate care (8g)','The parish receives eight gold for food and bedding. {{other}} puts the blessing aside long enough to buy both.',{gold:-8,faith:4,bond:{role:'other',trust:8}},{costGold:8}),
  reply('decline','Admit that your household cannot provide care','You help {{other}} ask elsewhere without promising a bed you do not have. The answer hurts less than a welcome that cannot be kept.',{bond:{role:'other',respect:4},familyReputation:{delta:1}}),
 ],{ageMin:18}),
 village('siblings_share','family','THE BED THAT HAS BECOME A PEDIGREE','{{sibling}} claims the best bed as the elder child. The argument has acquired three ancestors, two doubtful customs and no spare mattress.',[
  reply('divide','Agree a witnessed division','You accept fewer goods in exchange for a final settlement. {{sibling}} signs before an ancestor can be found who slept on the floor.',{householdState:{wealth:-6},bond:{role:'sibling',trust:12},familyReputation:{delta:3}}),
  reply('yield','Give the bed and keep the relationship','{{sibling}} sits on the bed and, after an awkward pause, asks you to stay for supper.',{householdState:{wealth:-8},bond:{role:'sibling',affinity:18}}),
  reply('forge','Produce a more convenient family inventory','The inventory is convincing until {{sibling}} remembers carving the listed chest last winter. A forgery complaint replaces the question of blankets.',{householdState:{wealth:12},legal:fraud('Forging a household inventory','sibling'),bond:{role:'sibling',trust:-25,flag:'rival'}}),
 ],{actorRoles:{sibling:SIBLING}}),
 village('millers_fever','health','THE MILLRACE’S BAD AIR','{{other}} has fever after clearing the millrace. The miller insists the work cannot be responsible because it was not paid well enough to be important.',[
  reply('supplies','Fund rest and clean supplies (9g)','You pay for food, water and a dry place to rest. {{other}} is spared the miller’s proposed cure of another shift.',{gold:-9,bond:{role:'other',trust:15},worldConditions:{diseasePressure:-4}},{costGold:9}),
  reply('cover','Take the dangerous shift yourself','You clear enough of the race to stop the immediate flooding. {{other}} thanks you; your own strength pays the part the miller omitted.',{health:-9,householdState:{food:5},bond:{role:'other',trust:12}}),
  reply('deny','Sell a reassuring report to keep the mill open','The miller pays you to call it a rumour. {{other}} supplies a less convenient account, between bouts of coughing.',{gold:12,worldConditions:{diseasePressure:8},legal:fraud('Concealing a reported sickness'),bond:{role:'other',trust:-22}}),
 ],{ageMin:12,requires:{worldAtLeast:{diseasePressure:35}}}),
 village('wounded_midwife','health','THE MIDWIFE’S INCONVENIENT HAND','{{other}} is helping an experienced midwife whose hand locks in the cold. A family wants the famous name; the apprentice has the steadier fingers.',[
  reply('assistant','Pay for skilled assistance (8g)','The midwife directs and the apprentice works. {{other}} marvels that two people can be useful without one of them being declared a fraud.',{gold:-8,worldConditions:{diseasePressure:-4},bond:{role:'other',trust:10}},{costGold:8}),
  reply('listen','Ask the midwife to choose the safest arrangement','The master gives the practical tasks to the apprentice and keeps the difficult decisions. {{other}} finally stops arguing about the name on the door.',{bond:{role:'other',respect:8},faith:2,worldConditions:{diseasePressure:-2}}),
  reply('fame','Insist on the name you were promised','The midwife attempts too much and the care becomes less safe. {{other}} remembers your contribution to a problem you did not have to solve with your hands.',{worldConditions:{diseasePressure:5},bond:{role:'other',trust:-18},familyReputation:{delta:-5}}),
 ],{ageMin:12}),
 village('bellmakers_sight','career','THE BELL FOUNDER CANNOT READ HIS MARK','{{other}} cannot see the tuning marks on a new bell. The wardens want the famous founder to work alone, preferably without describing what “alone” now requires.',[
  reply('help','Read the marks without taking the credit','You call the marks and {{other}} makes the corrections. The bell rings true, under the name that knew what to do with the numbers.',{skillXp:{craftsmanship:6},bond:{role:'other',trust:15},reputation:3}),
  reply('claim','Take the credit for the whole casting','You collect a fee and the applause. {{other}} keeps the mould and the knowledge of who actually knew how to use it.',{gold:12,bond:{role:'other',trust:-25,flag:'rival'},familyReputation:{delta:-4}}),
  reply('honour','Pay for an assistant named on the commission (10g)','The wardens allow a second name after discovering it does not make the bell twice as expensive. {{other}} can keep working without pretending to see.',{gold:-10,bond:{role:'other',respect:12},work:{guildStanding:4}},{costGold:10}),
 ],{ageMin:12}),
 village('stolen_chalice','crime','THE CHALICE AND THE VERY ORDINARY METAL','A chalice is missing. {{other}} has found a gilt shaving, a fresh roof and several hens belonging to a suspiciously prosperous witness.',[
  reply('test','Have the metal tested before accusing anyone (5g)','The gold is gilt over pewter. {{other}} looks at the new roof and realises that someone has stolen twice: first the chalice, then the parish’s idea of its value.',{gold:-5,wits:4,bond:{role:'other',trust:8},familyReputation:{delta:3}},{costGold:5}),
  reply('evidence','Place the evidence before the proper court','You lodge the shaving and the account of the payment. {{other}} signs as witness; a rumour becomes evidence without becoming a conviction by lunch.',{legal:{targetId:'other',suspicion:15},reputation:4,memory:{tag:'chalice_evidence_lodged',weight:3}}),
  reply('sell','Sell your silence about the witness’s new hens','You receive fourteen gold. {{other}} retains the shaving and a particularly good description of the transaction.',{gold:14,legal:fraud('Taking money to conceal church theft'),createSecret:{type:'hidden_debt',severity:45},bond:{role:'other',trust:-20}}),
 ],{ageMin:12}),
 village('forest_gang','crime','THE SNARE HAS CAUGHT A FORESTER','{{other}} has trapped the forester’s leg in a snare meant for deer. The forester promises to be reasonable as soon as somebody stops being so criminally helpful.',[
  reply('release','Cut the snare and give an honest account','The forester is freed and the trap is surrendered. {{other}} loses a valuable wire and gains a chance to explain it without a man screaming over the answer.',{health:-3,bond:{role:'other',trust:7},familyReputation:{delta:3}}),
  reply('flee','Take the catch and leave the evidence','You carry away the meat. {{other}} can describe both your kindness and the direction in which it departed.',{householdState:{food:15},legal:fraud('Taking game and abandoning a trapped forester'),bond:{role:'other',trust:-20}}),
  reply('surgeon','Pay for help and surrender the poaching gear (8g)','You pay for care and the gear is taken as evidence. {{other}} discovers an unusually expensive method of catching no deer.',{gold:-8,bond:{role:'other',respect:10},reputation:3} ,{costGold:8}),
 ],{ageMin:14}),
 village('false_witness','crime','THE ALIBI WITH TOO MUCH DETAIL','{{other}} offers an alibi that includes the weather, the candles and what everyone ate. You remember only that you were not there for half of it.',[
  reply('correct','Give the part you actually know','The clerk crosses out an impressive meal and two useful hours. {{other}} has a weaker alibi and a witness who can survive a second question.',{reputation:4,bond:{role:'other',trust:6},familyReputation:{delta:2}}),
  reply('swear','Swear to the whole polished account','The first draft is still on the clerk’s desk. He puts it beside your oath and asks which version you would prefer to defend.',{legal:fraud('Swearing to a fabricated alibi'),bond:{role:'other',trust:-10}}),
  reply('withdraw','Refuse to give evidence you cannot support','The court seeks another witness. {{other}} stops treating your presence as a thing that can be borrowed after the event.',{bond:{role:'other',respect:8,affinity:-4}}),
 ],{ageMin:14}),
 village('masterpiece','career','THE COPE-CHEST HAS ACQUIRED A DEADLINE','{{other}} wants an oak chest, a lower price and an earlier delivery. The apprentice’s better joint is described as an unacceptable innovation until the old one splits.',[
  reply('craft','Use the apprentice’s joint and name the work honestly','The chest closes squarely. {{other}} tries to complain about the method and is defeated by the lid.',{work:{experience:8,guildStanding:6},gold:8,bond:{role:'other',respect:8}}),
  reply('cheap','Use cheap timber and conceal the split','You pocket the difference. {{other}} finds the split when the chest is lifted; the receipt is stronger than the wood.',{gold:18,work:{guildStanding:-12},legal:fraud('Concealing defective commissioned work')}),
  reply('refuse','Return the advance rather than the promise (8g)','You return the advance and keep your tools. {{other}} takes the schedule to someone whose timber is apparently more obedient.',{gold:-8,work:{performance:-3},bond:{role:'other',trust:4}},{costGold:8}),
 ],{requires:{careerFamilies:['craft']}}),
 village('caravan_partnership','career','FOUR CARTS, ONE QUESTIONABLE GUARANTEE','{{other}} offers a place in a four-cart convoy. The safe-passage letter covers the road, the bridge and everything except the people collecting the toll.',[
  reply('terms','Pay for a clear shared contract (9g)','The hauliers sign the loss-sharing terms. {{other}} stops calling the profits guaranteed once somebody writes down who pays for a missing cart.',{gold:-9,work:{experience:7},bond:{role:'other',trust:10},householdState:{wealth:6}},{costGold:9}),
  risk('venture','Borrow for the unguarded shipment (30g debt)',0.55,'The carts arrive and your return is paid. The loan also arrives, requiring rather less unloading.',{gold:28,debt:{principal:30,interestRate:0.1},work:{performance:5}},'The goods are lost. Your creditor has stayed home and suffered no such misfortune.',{debt:{principal:30,interestRate:0.15},householdState:{wealth:-25},bond:{role:'other',trust:-12}}),
  reply('decline','Keep your goods and refuse the guarantee','{{other}} offers three adjectives and no better security. You take your goods home before a fourth can be found.',{wits:3,bond:{role:'other',respect:4}}),
 ],{ageMin:18,requires:{careerFamilies:['trade']},stakes:'major'}),
 village('apprentice_revolt','career','THE WORKDAY THAT RAN INTO TOMORROW','{{other}} brings a contract requiring apprentices to work after the permitted hours. The master has solved the problem by describing midnight as late afternoon.',[
  reply('refuse','Uphold the hours and take the smaller commission','You refuse the work that depends on the extra hours. {{other}} loses a commission and gains an example the apprentices can quote.',{gold:-5,work:{guildStanding:7},bond:{role:'other',respect:8},faction:{factionId:'commons',playerStanding:3}}),
  reply('break','Take the cheap work and break the agreed hours','You earn twelve gold. {{other}} submits the hours, which look much longer when laid beside your signature.',{gold:12,legal:fraud('Breaking a witnessed labour ordinance'),work:{guildStanding:-10}}),
  reply('feed','Pay for food while the dispute is settled (8g)','The apprentices eat while the master finds a clock that agrees with the ordinance. {{other}} keeps the bread account separately from the speeches.',{gold:-8,bond:{role:'other',trust:12},householdState:{food:-3},familyReputation:{delta:3}},{costGold:8}),
 ],{requires:{careerFamilies:['craft','trade']}}),
 village('tithe_dispute','politics','THE BUSHEL WITH LESS INSIDE THAN OUT','{{other}} presents a tithe measure with a handsome outside and a remarkably high bottom. The steward calls the difference ecclesiastical space.',[
  reply('measure','Compare the measure before witnesses','You fill both measures from the same sack. {{other}} replaces the false one while explaining that certainty has become unpleasantly heavy.',{faction:{factionId:'commons',playerStanding:5},householdState:{food:8},bond:{role:'other',affinity:-10}}),
  reply('bribe','Pay to exempt your household alone (9g)','Your grain is spared and your neighbours’ grain is not. {{other}} keeps the payment in a box with a very accurate memory.',{gold:-9,createSecret:{type:'hidden_debt',severity:35},familyReputation:{delta:-5}},{costGold:9}),
  reply('fund','Pay for an independent standard (6g)','The new standard is kept in public. {{other}} dislikes the inconvenience of a bushel that does not improve when unattended.',{gold:-6,householdState:{food:5},bond:{role:'other',respect:5}},{costGold:6}),
 ],{ageMin:14}),
 village('crown_levy','politics','THE LOTS ARE DRAWN BEFORE THE DRAWING','{{other}} brings a levy list containing the names of fourteen men. You were told there would be a drawing. The ink appears to have attended early.',[
  reply('redraw','Demand a public drawing with exemptions read aloud','The list is remade before witnesses. {{other}} complains about delay while hiding the pen that predicted the first result.',{faction:{factionId:'commons',playerStanding:6},familyReputation:{delta:3},bond:{role:'other',trust:-12}}),
  reply('pay','Pay for a lawful household exemption (14g)','The exemption is recorded and the levy continues. {{other}} gives you a receipt too large to hide in a sleeve.',{gold:-14,bond:{role:'other',affinity:4}},{costGold:14}),
  reply('alter','Remove your household’s name secretly','The erased name leaves a fine white scar. {{other}} has the first copy, complete with a date that is not your friend.',{legal:fraud('Falsifying a Crown muster list'),familyReputation:{delta:-8}}),
 ]),
 village('guild_seal','career','TWO SEALS, NO CONFIDENCE','{{other}} brings two impressions of the guild seal. Both claim exclusive authority, and both smell of the same workshop.',[
  reply('verify','Compare the charter and lodge one public standard','You establish the authorised impression before the merchants. {{other}} must retire a very profitable second thumb.',{work:{guildStanding:10},worldConditions:{prosperity:3},bond:{role:'other',trust:-12}}),
  reply('recognise','Pay for a proper verification (12g)','The verification arrives with enough witnesses to outnumber the seals. {{other}} remarks that honesty is becoming expensive to counterfeit.',{gold:-12,work:{guildStanding:7},familyReputation:{delta:3}},{costGold:12}),
  reply('copy','Sell a third impression','You collect sixteen gold and provide the guild with the only claim neither side wishes to defend.',{gold:16,legal:fraud('Selling counterfeit guild authority'),work:{guildStanding:-15}}),
 ],{ageMin:18,requires:{careerFamilies:['craft','trade']}}),
 village('winter_roof','household','THE THATCH HAS LEARNED THE WEATHER','{{other}} finds rot beneath your recently repaired roof. The repairer says it is not a leak if the water can also get out.',[
  reply('repair','Pay for sound timber (14g)','The rotten pieces come down and dry ones go up. {{other}} lets you count them before anybody describes the house as improved.',{gold:-14,householdState:{quality:20},bond:{role:'other',trust:6}},{costGold:14}),
  reply('patch','Patch it with your own labour','You finish the patch with a stiff back and a dry bed. {{other}} tests the beam before congratulating you.',{health:-6,householdState:{quality:10},skillXp:{craftsmanship:5}}),
  reply('leave','Move the bowls and leave the repair','The bowls catch less than the rain brings. The household loses food and shelter while the repairer preserves a perfect record of having been paid.',{householdState:{food:-15,quality:-22},bond:{role:'other',trust:-8}}),
 ],{ageMin:10}),
 village('granary_rats','household','THE RATS HAVE ACQUIRED A KEY','The granary sacks are light. {{other}} blames rats. You catch nine and find that the missing grain is still far too heavy for their combined ambition.',[
  reply('check','Count the sacks and change the lock (5g)','The new lock excludes both the rats and the person who kept forgetting to report them. {{other}} loses the spare key with visible regret.',{gold:-5,householdState:{food:12},holding:{security:5},bond:{role:'other',trust:-8}},{costGold:5}),
  reply('share','Record an honest food allowance instead','The hungry household receives a proper ration. {{other}} signs for it; the sacks stop having to develop holes to feed somebody.',{householdState:{food:-6},familyReputation:{delta:4},bond:{role:'other',trust:10}}),
  reply('sell','Sell your silence about the missing sacks','You take eight gold from a theft that is still costing your household grain. {{other}} finds your arithmetic delightfully incurious.',{gold:8,householdState:{food:-20},legal:fraud('Concealing theft from a communal granary'),bond:{role:'other',trust:-10}}),
 ],{ageMin:8}),
 village('neighbours_fire','household','THE FIRE HAS NO RESPECT FOR BOUNDARIES','A neighbour’s roof burns and sparks reach your own thatch. {{other}} has a ladder, two buckets and an urgent theory about whose property matters first.',[
  risk('rescue','Help the people before the property',0.75,'You get the trapped household into the yard. {{other}} pours the last bucket on your sleeve and apologises for the part that was still warm.',{health:-7,bond:{role:'other',trust:18},familyReputation:{delta:6}},'A falling spar burns your arm. You reach the yard alive, with pain that requires proper care.',{health:-20,healthCondition:{conditionId:'burns',severity:30},bond:{role:'other',respect:12}}),
  reply('roof','Protect your household’s roof first','Your roof survives. {{other}} watches where you pour the water and stops calling you neighbour quite so comfortably.',{householdState:{quality:6},bond:{role:'other',trust:-15},familyReputation:{delta:-5}}),
  reply('crew','Pay for a bucket crew (10g)','The crew passes water rather than opinions. {{other}} discovers how much quicker the work goes without deciding who deserves to be wet.',{gold:-10,householdState:{quality:8},bond:{role:'other',trust:8}},{costGold:10}),
 ],{ageMin:14,stakes:'major'}),
 village('strangers_map','rare','THE TREASURE MAP ENDS UNDER A BED','{{other}} sells a map to buried wealth. The last mark lies under a living neighbour’s bed. The map provides no advice about the neighbour.',[
  reply('ask','Ask permission and share any proceeds','The neighbour admits there is an old cellar and lets you inspect it. {{other}} looks disappointed that the first tool you used was a question.',{wits:3,bond:{role:'other',trust:6},memory:{tag:'cellar_map_verified',weight:3}}),
  reply('buy','Pay to inspect the survey (4g)','The survey is genuine and the treasure annotation is newer. {{other}} lowers the price of the annotation without offering to improve the cellar.',{gold:-4,wits:4,bond:{role:'other',trust:-8}},{costGold:4}),
  reply('dig','Dig without permission','You find a sound foundation and a furious owner. {{other}} declines to explain why you are under somebody’s floor.',{health:-4,legal:fraud('Breaking into a dwelling to dig for treasure'),bond:{role:'other',trust:-12}}),
 ],{ageMin:14,rarity:'uncommon'}),
 village('saints_bone','politics','THE BONE BOTH CHURCHES REMEMBER','{{other}} presents a relic claimed by two churches. Each can describe its miracles; neither can produce the receipt. The armed escort can produce several swords.',[
  reply('inquiry','Require provenance before public claims','The inventory identifies the bone as a sheep’s. {{other}} asks whether that proves the sheep was not unusually devout.',{wits:3,worldConditions:{religiousTension:-5},bond:{role:'other',respect:6}}),
  reply('trade','Sell the shrine’s display rights to both churches','You take sixteen gold and issue two incompatible promises. {{other}} places the contracts beside the bone, creating a rather better exhibit.',{gold:16,legal:fraud('Selling conflicting rights to a disputed relic'),worldConditions:{religiousTension:8}}),
  reply('quiet','Fund a quiet public inventory (8g)','The bone is catalogued without a procession. {{other}} laments the loss of a very profitable misunderstanding.',{gold:-8,worldConditions:{religiousTension:-6},faction:{factionId:'church',playerStanding:3}},{costGold:8}),
 ],{ageMin:14}),
 village('prophetic_child','rare','THE PROPHECY THAT HAS MET THE RENT','A child has made a striking prediction. {{other}} is charging to hear the next one and has begun suggesting that the heavens might be interested in this month’s rent.',[
  reply('private','Stop the paying audience and hear the child quietly','Without the crowd, the prediction becomes a frightened child’s account of a flooded ditch. {{other}} has to find a different way to make it pay.',{familyReputation:{delta:4},bond:{role:'other',affinity:-8},worldConditions:{religiousTension:-3}}),
  reply('sell','Take a share of the prophecy takings','You receive fifteen gold. {{other}} adds another stool for paying customers, and the child learns which sort of answer brings supper.',{gold:15,createSecret:{type:'hidden_debt',severity:35},familyReputation:{delta:-8}}),
  reply('shelter','Pay for quiet care and food (8g)','The child gets food, a quiet room and an afternoon without questions. {{other}} receives a receipt instead of a revelation.',{gold:-8,faith:3,bond:{role:'other',respect:6}},{costGold:8}),
 ],{ageMin:12,rarity:'uncommon'}),
];

/** Distinct later conflicts retained as independent situations, not gates or chapter numbers. */
export const SALVAGED_VILLAGE_SCENES:GameEvent[]=[
 village('spoon_claim','family','THE CHRISTENING SPOON IN THE WRONG SLEEVE','{{sibling}} has the household’s silver spoon and an explanation that grows more ancestral every time you ask.',[
  reply('return','Ask for its return without an audience','The spoon comes home. {{sibling}} keeps the explanation, which is now too elaborate to throw away.',{bond:{role:'sibling',trust:6},householdState:{wealth:4}}),
  reply('price','Sell your claim for a fair payment','{{sibling}} pays five gold for the spoon and the right to stop describing your grandmother.',{gold:5,bond:{role:'sibling',affinity:-4}}),
 ],{convertedFrom:'chain:siblings_share',actorRoles:{sibling:SIBLING}}),
 village('birth_kin','family','THE CARE AGREEMENT EVERYONE HAS HEARD ABOUT','{{other}} challenges a household care agreement. The dispute has attracted several people who have never provided any of the care.',[
  reply('record','Read the actual terms before witnesses','The audience loses interest when the food, beds and responsibilities are counted. {{other}} signs the corrected terms instead of another accusation.',{householdState:{status:4},bond:{role:'other',trust:8}}),
  reply('punish','Use the disagreement to humiliate the claimant','You win the audience and lose {{other}}’s trust. The people who offered no care offer excellent applause.',{reputation:4,bond:{role:'other',trust:-20,flag:'rival'}}),
 ],{convertedFrom:'chain:foster_oath',ageMin:18}),
 village('midwife_room','household','THE MIDWIFE ASKS FOR A HEARTH','{{other}} asks to use your main room for a birth. The floor is dry, the fire is good, and your household had other plans for both.',[
  reply('room','Make room and provide clean fuel','You give up privacy and supplies. {{other}} moves the work indoors and leaves the arguments about inconvenience outside.',{householdState:{food:-4,quality:-2},bond:{role:'other',trust:15},faith:3}),
  reply('fund','Pay for another suitable room (6g)','You fund a warm room nearby. {{other}} is grateful for an answer that includes a door which opens.',{gold:-6,bond:{role:'other',trust:8}},{costGold:6}),
 ],{convertedFrom:'chain:wounded_midwife',ageMin:16}),
 village('founder_mark','career','WHOSE NAME FITS ROUND THE BELL','{{other}} wants their name cast round a bell made by several hands. There is room for everyone’s mark, provided the patron’s titles lose a little weight.',[
  reply('names','Credit the makers as well as the patron','The inscription becomes less flattering and more accurate. {{other}} objects to having neighbours in bronze.',{work:{guildStanding:6},bond:{role:'other',respect:8,affinity:-4}}),
  reply('flatter','Reserve the whole inscription for the payer','You earn eight gold for arranging an unusually exclusive alphabet. {{other}} calls the result historically inevitable.',{gold:8,work:{guildStanding:-5},familyReputation:{delta:-3}}),
 ],{convertedFrom:'chain:bellmakers_sight',requires:{careerFamilies:['craft']}}),
 village('forester_amnesty','crime','THE AMNESTY WITH A PRICE BESIDE EACH NAME','{{other}} offers to submit names for a poaching amnesty. The list includes a fee column that the royal notice appears to have forgotten.',[
  reply('notice','Compare the terms with the public notice','The fee column disappears. {{other}} complains that copying the law word for word leaves no room for initiative.',{reputation:4,bond:{role:'other',trust:-10},faction:{factionId:'commons',playerStanding:3}}),
  reply('names','Sell names to the intermediary','You collect ten gold for exposing your neighbours to an arrangement you have not verified. {{other}} now has both the names and yours.',{gold:10,createSecret:{type:'hidden_debt',severity:40},familyReputation:{delta:-7}}),
 ],{convertedFrom:'chain:forest_gang'}),
 village('retained_draft','crime','THE FIRST DRAFT IS STILL WET','{{other}} asks you to confirm a statement while the clerk has its contradictory first draft drying beside the fire.',[
  reply('correct','Correct the statement before swearing','The clerk keeps both copies. {{other}} is annoyed that your conscience has developed such inconvenient timing.',{reputation:3,bond:{role:'other',trust:5,affinity:-5}}),
  reply('burn','Pay to destroy the first draft (7g)','The clerk takes your money and declines to burn evidence. You have purchased a very clear memory in somebody else’s head.',{gold:-7,legal:fraud('Attempting to destroy a witness statement')},{costGold:7}),
 ],{convertedFrom:'chain:false_witness',ageMin:14}),
 village('split_oak','career','THE OAK HAS ARRIVED IN TWO OPINIONS','{{other}} delivers split timber for sound-timber money. The split is described as evidence that you can now see the quality inside.',[
  reply('reject','Reject the faulty lot and record why','The seller takes it back under witnesses. {{other}} finds a customer with less interest in the inside of wood.',{work:{experience:5,guildStanding:3},bond:{role:'other',trust:-8}}),
  reply('accept','Buy cheaply and disclose the limits','You pay for usable offcuts, mark the defects and adapt the work. {{other}} is offended that the discount has become part of the description.',{gold:-5,work:{experience:7},bond:{role:'other',respect:5}},{costGold:5}),
 ],{convertedFrom:'chain:masterpiece',requires:{careerFamilies:['craft']}}),
 village('returned_driver','career','THE DRIVER RETURNS WITHOUT THE CART','{{other}} returns with no cart and an account containing a bridge, a lord and an extremely powerful pig. The freight receipt mentions none of them.',[
  reply('inspect','Compare the route, witnesses and receipts','The story loses its lord, then its bridge. The pig survives as a regrettable error in loading, for which {{other}} accepts responsibility.',{work:{experience:7},bond:{role:'other',trust:-8},householdState:{wealth:5}}),
  reply('settle','Accept a partial repayment now','{{other}} pays eight gold and signs for the missing goods. The pig is left out of the agreement to save parchment.',{gold:8,bond:{role:'other',respect:4}}),
 ],{convertedFrom:'chain:caravan_partnership',requires:{careerFamilies:['trade']}}),
 village('quiet_contract','career','THE CONTRACT UNDER THE SUPPER BOWL','{{other}} offers you private work while your fellow workers dispute the rate. The contract is concealed beneath a bowl, though the wage is not large enough to require hiding.',[
  reply('refuse','Return the contract and explain why','{{other}} puts the bowl back with great dignity. Your fellow workers know you declined before the story could improve itself.',{work:{guildStanding:6},bond:{role:'other',affinity:-6},familyReputation:{delta:2}}),
  reply('take','Take the underpriced work','You receive nine gold. {{other}} can now quote your rate to everyone else, which proves much more valuable than the bowl.',{gold:9,work:{guildStanding:-8},bond:{role:'other',trust:-8}}),
 ],{convertedFrom:'chain:apprentice_revolt',requires:{careerFamilies:['craft','trade']}}),
 village('burial_tally','politics','THE ACCOUNT WITH TWO BURIALS FOR ONE MAN','{{other}} collects dues using a roll that has charged one household for the same burial twice. The second entry praises the deceased’s reliability.',[
  reply('correct','Correct the roll in public','The duplicate is struck out and the household keeps its payment. {{other}} announces that a dead clerk must have done it; no living clerk volunteers to disagree.',{reputation:4,worldConditions:{religiousTension:-3},bond:{role:'other',affinity:-8}}),
  reply('quiet','Pay the disputed fee for the household (6g)','You cover the immediate demand and insist on a receipt. {{other}} now has to explain why the deceased has paid so promptly in person.',{gold:-6,familyReputation:{delta:4},bond:{role:'other',respect:5}},{costGold:6}),
 ],{convertedFrom:'chain:tithe_dispute',ageMin:14}),
 village('levy_witness','politics','THE WITNESS HAS THREE NEW HENS','{{other}} offers testimony supporting a levy exemption. Their yard has three new hens and their memory has improved by exactly that many birds.',[
  reply('question','Ask who paid for the hens','{{other}} withdraws the useful part of the statement and becomes indignant about your interest in poultry.',{reputation:4,bond:{role:'other',trust:-12}}),
  reply('buy','Buy equally helpful testimony (9g)','The testimony improves. The clerk records the payment as carefully as the evidence you hoped it would replace.',{gold:-9,legal:fraud('Buying levy testimony')},{costGold:9}),
 ],{convertedFrom:'chain:crown_levy'}),
 village('charter_fragment','career','THE CHARTER IN THE FAMILY CHEST','{{other}} finds a charter fragment being used beneath a loose chest foot. It may establish a guild right; it certainly establishes why the chest used to wobble.',[
  reply('copy','Pay for a witnessed copy (5g)','The copy preserves the right and the original goes somewhere dry. {{other}} repairs the chest with an ordinary piece of wood, now recognised as such.',{gold:-5,work:{guildStanding:6},bond:{role:'other',trust:8}},{costGold:5}),
  reply('sell','Sell exclusive access to the document','You pocket twelve gold. {{other}} learns how quickly a public right can become a private appointment.',{gold:12,work:{guildStanding:-7},familyReputation:{delta:-4}}),
 ],{convertedFrom:'chain:guild_seal',requires:{careerFamilies:['craft','trade']}}),
 village('timber_right','household','THE LORD HAS BORROWED YOUR REPAIR TIMBER','{{other}} has moved your repair timber to the lord’s granary. The steward describes it as communal necessity, with a surprisingly precise sense of whose community you belong to.',[
  reply('custom','Quote the repair right before witnesses','The custom is real and the timber comes back. {{other}} complains that knowing the law has made you very difficult to govern efficiently.',{householdState:{quality:8},bond:{role:'other',respect:6},familyReputation:{delta:2}}),
  reply('replace','Buy replacement timber (10g)','Your roof is repaired and the granary keeps its timber. {{other}} calls this an excellent practical resolution, having paid for neither.',{gold:-10,householdState:{quality:10},bond:{role:'other',trust:-8}},{costGold:10}),
 ],{convertedFrom:'chain:winter_roof',ageMin:12}),
 village('grain_wall','household','THE WALL THAT HID THE DAMP GRAIN','{{other}} opens a newly built partition and finds damp grain behind it. The mason says the wall had been intended to improve appearances.',[
  reply('sort','Sort and dry what can be saved','You lose a day’s strength and rescue useful stores. {{other}} agrees that food improves a household’s appearance best from inside its occupants.',{health:-4,householdState:{food:10},bond:{role:'other',trust:6}}),
  reply('sell','Sell the lot without mentioning the wall','You take twelve gold and lose household stores. {{other}} has retained a sack that illustrates your account rather well.',{gold:12,householdState:{food:-15},legal:fraud('Selling concealed damp grain')}),
 ],{convertedFrom:'chain:granary_rats',ageMin:12}),
 village('strongbox_ashes','household','THE BOX THE FIRE DID NOT OPEN','{{other}} finds a locked strongbox in the burned rubble and asks whose it is. The owner’s mark is still readable, if inconveniently so.',[
  reply('return','Return it unopened','The owner receives the box through {{other}}. Nobody has to invent a story about how the fire consumed the name but spared the lock.',{bond:{role:'other',trust:12},familyReputation:{delta:4}}),
  reply('open','Force the lock and take the contents','You gain fourteen gold. {{other}} has seen the mark and now knows precisely how much your honesty costs.',{gold:14,legal:fraud('Taking marked property from a fire'),bond:{role:'other',trust:-22}}),
 ],{convertedFrom:'chain:neighbours_fire',ageMin:14}),
 village('scholar_bone','rare','THE SCHOLAR’S VERY CAREFUL SILENCE','{{other}} has examined a supposed holy bone and offers an expensive explanation of why it would be unwise to explain the result.',[
  reply('plain','Ask for the actual finding','The bone is an ordinary sheep’s. {{other}} is relieved until you ask for the answer in ordinary writing as well.',{wits:4,bond:{role:'other',trust:6},memory:{tag:'bone_finding_recorded',weight:2}}),
  reply('display','Buy a flattering description (8g)','Your description mentions antiquity, dignity and almost everything except sheep. {{other}} makes sure not to sign the interesting part.',{gold:-8,createSecret:{type:'hidden_debt',severity:25},reputation:3} ,{costGold:8}),
 ],{convertedFrom:'chain:saints_bone',ageMin:14,rarity:'uncommon'}),
];
