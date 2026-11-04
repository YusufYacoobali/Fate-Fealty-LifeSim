import type {EventActorRole,GameEvent} from '@/types/game';
import {scene,reply,risk,ADULT} from './narrativeHelpers';
const CARER:EventActorRole={minAge:16,alive:true,excludePlayer:true,relation:'carer',missingActor:'clear_event'};
const PEER:EventActorRole={reference:'classmate',allowInformal:true,minAge:5,maxAge:17,alive:true,excludePlayer:true,missingActor:'clear_event'};
const TEACHER:EventActorRole={...ADULT,minAge:20,reference:'education_mentor',allowInformal:true};
function little(id:string,title:string,text:string,choices:GameEvent['choices']):GameEvent{return scene('young_'+id,'child','family',title,text,choices,{ageMin:0,ageMax:4,actorRoles:{carer:CARER},repetitionGroup:id,once:true});}
function child(id:string,title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={}):GameEvent{return scene('young_'+id,'child','family',title,text,choices,{ageMin:5,ageMax:9,actorRoles:{peer:PEER},repetitionGroup:id,once:true,...options});}
function older(id:string,title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={}):GameEvent{return child(id,title,text,choices,{ageMin:10,ageMax:13,...options});}
function youth(id:string,title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={}):GameEvent{return child(id,title,text,choices,{ageMin:14,ageMax:17,actorRoles:{peer:{...PEER,minAge:14,maxAge:17}},...options});}
export const CHILDHOOD_DEPTH_EVENTS:GameEvent[]=[
 little('spoon_office',"THE SPOON GOES DOWN AGAIN","You drop your spoon. {{carer.intro}} picks it up. By the fifth time, the smile has gone and the spoon is being held very firmly.",[
  reply('again',"Drop it once more","{{carer}} catches the spoon before it lands. You squeal with delight. This was meant to discourage you.",{charm:1,bond:{role:'carer',affinity:2},householdLesson:{progress:2}}),
  reply('offer',"Give it back with your sweetest smile","{{carer}} kisses your sticky forehead and lets you try feeding yourself. Most of supper reaches your mouth.",{bond:{role:'carer',trust:4},householdLesson:{progress:3}}),
 ]),
 little('sleep_inspection',"EVERYONE SHOULD BE AWAKE","{{carer.intro}} has just fallen asleep in the chair beside you. One eye is still open. You would like the other one open too.",[
  reply('call',"Shout until both eyes open","{{carer}} lurches upright and bumps the table. You laugh so hard that a tired laugh comes back.",{bond:{role:'carer',affinity:2},householdLesson:{progress:1}}),
  reply('settle',"Curl up and let them sleep","The chair creaks. {{carer}} sleeps with one hand on your blanket, and you drift off too.",{health:2,bond:{role:'carer',trust:3}}),
 ]),
 little('soup_fort',"NO SPOONS ALLOWED","{{carer.intro}} brings your soup. You have built a wall of bread around the bowl and will not allow the spoon through.",[
  reply('defend',"Slap away the invading spoon","Soup splashes down your sleeve. {{carer}} wipes you clean while you inspect the hole in your bread wall.",{householdLesson:{progress:2},charm:1}),
  reply('share',"Open a little gap","{{carer}} gets a spoonful past the bread. You eat it, look surprised, and allow another.",{health:2,bond:{role:'carer',affinity:3}}),
 ]),
 little('boot_harbour','THE BOOT WITH A PASSENGER',"A wooden duck fits neatly into {{carer.intro}}’s boot. You push it right down to the toe and wait to see what happens.",[
  reply('retrieve',"Fetch your duck when the hopping starts","{{carer}} holds out the boot. You fish out the duck and get a grateful squeeze, though the hopping has stopped.",{wits:1,bond:{role:'carer',trust:3},householdLesson:{progress:2}}),
  reply('hide',"Look as surprised as possible","{{carer}} shakes out the duck. You stare at it in amazement. It is the best acting you have managed so far.",{charm:2,bond:{role:'carer',affinity:2}}),
 ]),
 little('name_the_cat','THE CAT’S NEW NAME','You give the household cat a new name. {{carer}} asks what happened to its old one.',[
  reply('explain','Explain at great length','{{carer}} understands none of the explanation and all of the importance. The cat responds to neither name.',{bond:{role:'carer',affinity:4},householdLesson:{progress:3}}),
  reply('demonstrate','Call the cat to demonstrate','The cat leaves. {{carer}} praises your accurate imitation of an adult being ignored.',{wits:1,householdLesson:{progress:2}}),
 ]),
 little('washing_judge',"THAT IS MY DIRT","{{carer.intro}} approaches with a wet cloth. You clamp both hands over the patch of mud you have been saving on your cheek.",[
  reply('object',"Wriggle like an eel","{{carer}} catches one cheek, then the other. You get muddy fingerprints on the clean one and earn a helpless laugh.",{charm:1,bond:{role:'carer',affinity:2},householdLesson:{progress:1}}),
  reply('help',"Take a corner of the cloth","You scrub your chin while {{carer}} does the difficult parts. Water runs down your neck, but the dirt comes off.",{health:1,bond:{role:'carer',trust:4},householdLesson:{progress:3}}),
 ]),
 little('bread_shape','THE UNRECOGNISED ANIMAL','You shape a piece of dough and insist it is an animal. {{carer}} guesses carefully.',[
  reply('correct','Correct every guess','{{carer}} finally names a creature nobody has seen. You accept the answer and eat its head.',{wits:1,bond:{role:'carer',affinity:3},householdLesson:{progress:2}}),
  reply('gift','Give the creature to your carer','{{carer}} leaves it beside the hearth where it can become bread without ceasing to be important.',{bond:{role:'carer',trust:5},householdLesson:{progress:2}}),
 ]),
 little('blanket_trade','THE BLANKET EXCHANGE','{{carer}} offers a clean blanket for the old one. The old one knows how to be yours.',[
  reply('keep','Hold on to the familiar corner','{{carer}} washes the other end first. The compromise leaves you holding a small but recognised country.',{bond:{role:'carer',trust:3},householdLesson:{progress:2}}),
  reply('swap','Accept the warm replacement','The new blanket smells different. {{carer}} stays until different has stopped meaning alone.',{health:2,bond:{role:'carer',affinity:5}}),
 ]),
 little('candle_shadow','THE EXTRA PERSON ON THE WALL','A candle makes a stranger out of {{carer}}’s shadow. The stranger appears to possess a very long nose.',[
  reply('point','Point out the suspicious nose','{{carer}} bows and makes the nose longer. The stranger becomes less frightening and less dignified.',{bond:{role:'carer',affinity:4},householdLesson:{progress:3}}),
  reply('hide','Watch from beneath the blanket','{{carer}} moves the candle. The stranger goes home without requiring you to be brave for an audience.',{bond:{role:'carer',trust:5},health:1}),
 ]),
 little('small_mending',"ONE VERY IMPORTANT THREAD","{{carer.intro}} gives you the thread to hold while a torn sleeve is mended. You watch the needle as though it might bite.",[
  reply('hold',"Keep your fist still","{{carer}} finishes the sleeve and pulls it on to show you. You pat the new stitches and are thanked for helping.",{bond:{role:'carer',trust:5},householdLesson:{progress:4}}),
  reply('pull',"See how far the thread goes","Much farther than expected. {{carer}} catches the sleeve before it falls apart and gives you a spare length to tug.",{householdLesson:{progress:2},bond:{role:'carer',affinity:2}}),
 ]),
 child('goat_headmaster','THE NEW HEADMASTER',"A goat eats the lesson sheet. {{peer}} puts a cap on it and seats it in {{teacher.intro}}’s chair. The goat immediately eats the cap.",[
  reply('teacher',"Help {{teacher}} get the goat outside","{{teacher}} holds out a carrot. The goat abandons its chair, while {{peer}} finds you a clean lesson sheet.",{education:{progress:4,mentorBond:3},bond:{role:'peer',affinity:-3}}),
  reply('goat',"Let the goat teach the lesson","{{teacher}} waits for a sensible answer. The goat swallows the last bit of cap, and {{peer}} snorts so loudly that you start laughing too.",{education:{misconduct:5},bond:{role:'peer',affinity:8},charm:2}),
  reply('forge',"Replace the register with generous new names","You add three absent children and a pig. {{teacher}} asks the pig to read aloud, then takes the pencil away from you.",{education:{misconduct:12,progress:-2},bond:{role:'peer',trust:5}}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER},repetitionGroup:'school_authority'}),
 child('ink_finger',"THE HAND BEHIND YOUR BACK","{{teacher.intro}} finds an open inkpot. {{peer}} looks at your blackened hand, then at your face. “Put it in your pocket,” comes the whispered advice.",[
  reply('admit',"Hold up the inky hand","{{teacher}} hands you a rag. You clean the spill together, and next time the inkpot is left within your reach.",{education:{progress:3,misconduct:-2},bond:{role:'teacher',trust:5}}),
  reply('hide',"Hide it behind your back","You press a perfect black handprint onto your tunic. {{peer}} stuffs a sleeve into their mouth to stop laughing.",{education:{misconduct:5},bond:{role:'peer',affinity:4}}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER},repetitionGroup:'school_mischief'}),
 child('stool_court',"WHO GETS THE STOOL?","{{peer.intro}} gets the only stool and decides that means choosing every game. The rest of you have a plate of biscuits.",[
  reply('justice',"Insist everyone gets a turn","{{peer}} listens to each child in turn. By the time a game is chosen, the biscuits are gone.",{education:{progress:3},bond:{role:'peer',respect:5}}),
  reply('settle',"Offer a biscuit for a turn on the stool","{{peer}} takes the biscuit and climbs down. You sit for a minute before sharing it out again.",{charm:2,bond:{role:'peer',affinity:6},householdLesson:{progress:2}}),
 ]),
 child('river_boat','THE BOAT THAT HAS NO INTEREST IN COMMAND',"You and {{peer.intro}} launch a wooden boat in the ditch. It shoots under a bridge that neither of you can crawl beneath.",[
  reply('reach',"Fish it out with a stick","You hook the boat and soak your sleeve. {{peer}} holds your belt so you do not follow it into the ditch.",{skillXp:{husbandry:3},bond:{role:'peer',trust:4}}),
  reply('charge',"Make the other children pay to watch","The boat vanishes before your grand demonstration. {{peer}} has to return the pebbles while you explain the invisible ship.",{education:{misconduct:3},bond:{role:'peer',affinity:-5},wits:2}),
 ]),
 child('saint_cake','THE CAKE RESERVED FOR A SAINT',"{{peer.intro}} lifts the cloth over a cake saved for the parish feast. There is a great deal of cake and nobody in the room but you.",[
  reply('guard',"Cover it and wait for the feast","You both wait. The first slices reach you warm, and {{peer}} nudges yours across with the larger corner.",{faith:2,bond:{role:'peer',trust:5},memory:{tag:'cake_guard',weight:1}}),
  reply('taste',"Try a little from the far side","You and {{peer}} keep cutting it straight. When the cloth goes back, it sags into a hole big enough to hide a kitten.",{education:{misconduct:6},bond:{role:'peer',affinity:4},householdLesson:{progress:2}}),
 ]),
 child('lost_button','THE BUTTON AT THE CENTRE OF THE WORLD',"{{peer.intro}} has lost a shiny button in the rushes. They are trying very hard not to cry, which makes finding it much more urgent.",[
  reply('search',"Get down and search together","You find a bead, a nail and the button. {{peer}} presses the bead into your hand and keeps checking that the button is still there.",{bond:{role:'peer',trust:8,flag:'friend'},wits:1}),
  reply('boast',"Promise to find it for a reward","{{peer}} reaches into another pocket and finds it. You pretend you were about to suggest looking there.",{charm:1,bond:{role:'peer',trust:-4},memory:{tag:'button_boast',weight:1}}),
 ],{ageMax:13}),
 child('market_math','THE APPLE THAT DISPROVES THE SUM',"{{teacher.intro}} lays out apples for a lesson. At the far end of the bench, {{peer}} quietly makes one of the numbers smaller.",[
  reply('count',"Point out the missing apple","{{teacher}} asks {{peer}} to count aloud. A mouth full of apple makes this a difficult exercise.",{education:{progress:5},skillXp:{scholarship:3},bond:{role:'peer',respect:3}}),
  reply('join',"Help eat the difficult numbers","{{peer}} slips you a piece. {{teacher}} takes away the apples and gives you both more sums, which are much harder to swallow.",{education:{misconduct:5,progress:1},bond:{role:'peer',affinity:5}}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER}}),
 child('family_whisper','THE WORD YOU WERE NOT MEANT TO LEARN',"{{carer.intro}} drops a pot and shouts a word you have never heard. {{peer}} leans close. “Say it again.”",[
  reply('private',"Ask what it means, quietly","{{carer}} tells you what it means and asks you not to repeat it at chapel. {{peer}} looks as though chapel has just become interesting.",{education:{progress:2},bond:{role:'carer',trust:5}}),
  reply('public',"Try the new word at full volume","A neighbour drops a spoon. {{carer}} covers your mouth too late, while {{peer}} bends double laughing.",{education:{misconduct:4},bond:{role:'peer',affinity:6},charm:1}),
 ],{actorRoles:{carer:CARER,peer:PEER}}),
 child('hedge_crown','THE CROWN MADE OF THE WRONG HEDGE','{{peer}} makes a crown from a hedge nobody has first tested for thorns.',[
  reply('mend','Make a safer crown from rushes','{{peer}} accepts the replacement with the dignity of a ruler whose ears have recently been defeated.',{skillXp:{craftsmanship:3},bond:{role:'peer',trust:6}}),
  reply('wear','Prove it is perfectly suitable for royalty','You remove it quickly. {{peer}} agrees that a shorter reign can still be historic.',{health:-2,bond:{role:'peer',respect:3},memory:{tag:'thorn_crown',weight:1}}),
 ]),
 child('mud_toll',"ONE PEBBLE TO CROSS","{{peer.intro}} wants a pebble from anyone crossing a plank over a puddle. You can get around the entire puddle in one step.",[
  reply('bypass',"Step around it","{{peer}} drags the plank to block you. You go around the other end. This continues until both of you are laughing.",{wits:2,bond:{role:'peer',respect:4}}),
  reply('join',"Help collect the pebbles","You collect six before an adult takes back the plank. {{peer}} lets you keep half the pebbles and blames the adult.",{charm:2,bond:{role:'peer',affinity:6},education:{misconduct:2}}),
 ],{ageMax:13}),
 child('borrowed_bell','THE BELL THAT RINGS FOR BISCUITS',"{{peer.intro}} finds a small bell. One ring could bring the whole household running to supper, if anybody had cooked it yet.",[
  reply('warn',"Put it back before trouble comes","{{peer}} sighs, but helps you return it. The adults finish their work without being dragged away from it.",{bond:{role:'peer',respect:3},householdLesson:{progress:3}}),
  reply('ring',"Ring for a splendid imaginary supper","Three hungry adults arrive. {{peer}} looks into an empty bowl and whispers, “Ring it again. Perhaps that makes the food.”",{education:{misconduct:4},bond:{role:'peer',affinity:5},charm:1}),
 ],{ageMax:13}),
 child('pocket_inventory',"DO NOT WASH MY POCKET","{{carer.intro}} empties your pocket before washing your clothes. Out come a stone, a bent nail and something with far too many legs.",[
  reply('sort',"Explain which things you need","{{carer}} lets you keep the stone. The nail goes on a high shelf and the many-legged treasure goes outside on a shovel.",{bond:{role:'carer',trust:5},householdLesson:{progress:3}}),
  reply('rescue',"Grab the many-legged treasure","It scuttles up your sleeve. {{carer}} helps shake it out while you discover how quickly you can dance.",{wits:2,bond:{role:'carer',affinity:2},householdLesson:{progress:1}}),
 ],{ageMax:13,actorRoles:{carer:CARER}}),
 child('loaf_errand','THE LOAF WITH A JOURNEY MISSING','{{carer}} sends you home from the baker with a loaf. By the time you reach the door, a small section of the journey has been eaten.',[
  reply('admit','Explain where the missing piece went','{{carer}} cuts the loaf at the bite. Your share becomes remarkably easy to identify.',{bond:{role:'carer',trust:5},householdLesson:{progress:3}}),
  reply('blame','Describe an unusually precise attack by birds','{{carer}} asks why the birds left teeth marks. Your evidence is returned for further preparation.',{education:{misconduct:3},bond:{role:'carer',trust:-5},charm:1}),
 ],{ageMax:13,actorRoles:{carer:CARER}}),
 child('measuring_door','THE DOOR THAT RECORDS YOUR HEIGHT','{{carer}} marks your height on a doorpost. The previous mark is disappointingly close, considering how much work growing has been.',[
  reply('wait','Stand flat and accept the new mark','{{carer}} dates it carefully. There is still room above for years you cannot yet imagine.',{bond:{role:'carer',affinity:6},householdLesson:{progress:3}}),
  reply('heels','Improve the measurement with your heels','{{carer}} marks the extra height with a tiny drawing of your feet. The record is accurate in a particularly inconvenient way.',{charm:2,bond:{role:'carer',affinity:3},householdLesson:{progress:2}}),
 ],{ageMax:13,actorRoles:{carer:CARER}}),
 child('errand_receipt','THE ERRAND THAT NEEDS A RECEIPT','{{other}} offers you a coin to carry a parcel across the square. The parcel is light; the instructions about not looking inside are unusually heavy.',[
  reply('ask','Ask who will receive it before agreeing','{{other}} points to the cobbler. The parcel contains a repaired shoe, and the elaborate secrecy concerns a very large hole in the other one.',{gold:1,wits:2,bond:{role:'other',trust:4}}),
  reply('refuse','Decline the mysterious employment','{{other}} crosses the square carrying the parcel. The strange limping walk supplies an explanation you did not have to purchase.',{wits:1,householdLesson:{progress:3}}),
 ],{ageMax:13,actorRoles:{other:ADULT}}),
 child('window_visitor','THE VISITOR WHO GETS THE WARM PLACE','{{carer}} gives a tired visitor your favourite place by the hearth. {{peer}} suggests testing how long hospitality lasts.',[
  reply('share','Bring your stool alongside','{{carer}} makes room for both. The visitor tells a story worth more than the lost foot of warmth.',{bond:{role:'carer',trust:5},education:{progress:2}}),
  reply('complain','Explain whose place it really is','{{carer}} hears the explanation and gives the visitor another blanket. {{peer}} suggests your case lacked witnesses.',{bond:{role:'carer',affinity:-3},householdLesson:{progress:2}}),
 ],{actorRoles:{carer:CARER,peer:PEER}}),
 older('rent_signature','THE SIGNATURE BIGGER THAN THE RENT','{{other}} asks you to witness a rent mark. The tenant cannot read; you can read just enough to see the amount has grown.',[
  reply('read','Read the amount aloud before marking','{{other}} blames a tired clerk and fetches the smaller tally. The tenant watches you finish the word.',{education:{progress:5},familyReputation:{delta:3},bond:{role:'other',affinity:-8}}),
  reply('sign','Mark it and avoid the argument','{{other}} thanks you for being sensible. The tenant pays for the compliment.',{education:{misconduct:6},bond:{role:'other',trust:4},familyReputation:{delta:-4}}),
 ],{actorRoles:{other:ADULT}}),
 older('apprentice_model','THE MASTERPIECE SMALL ENOUGH TO HIDE','{{peer}} has made a model of the master’s best work and accidentally improved it. The master is approaching.',[
  reply('credit','Name the actual maker','The master inspects the joint twice before asking how it was done. {{peer}} stops hiding the model beneath the bench.',{skillXp:{craftsmanship:6},bond:{role:'peer',trust:8},education:{progress:3}}),
  reply('claim','Present the model as your work','The master asks you to repeat the joint. {{peer}} watches your second, much less successful masterpiece.',{education:{misconduct:10},bond:{role:'peer',trust:-18,flag:'rival'}}),
 ],{ageMin:10,actorRoles:{peer:{...PEER,maxAge:15}}}),
 older('exam_margin','THE ANSWER IN THE WRONG MARGIN','{{peer}} has a copy of a test with the answers written in the margin. The scholar’s name is also written there.',[
  reply('return','Return the copy before the test','{{peer}} calls you unreasonable until the scholar starts collecting names as well as papers.',{education:{misconduct:-4,progress:3},bond:{role:'peer',respect:5}}),
  reply('copy','Copy the impressive answers','You reproduce the scholar’s name under your own. {{peer}} admires the completeness of your borrowing.',{education:{misconduct:15,progress:-3},bond:{role:'peer',trust:-5}}),
 ]),
 older('hens_argument','THE HEN HAS TWO OWNERS AND NO ALLEGIANCE','{{peer}} catches a hen claimed by two households. It lays an egg during the argument.',[
  reply('marks','Compare the owners’ marks','The mark settles ownership. {{peer}} asks whether the egg can remain neutral.',{wits:2,bond:{role:'peer',respect:6},householdLesson:{progress:3}}),
  reply('sell','Sell the egg while they debate','You gain one gold. {{peer}} has to explain why the hen has suddenly become less productive under joint ownership.',{gold:1,education:{misconduct:5},bond:{role:'peer',affinity:4}}),
 ]),
 older('road_message','THE MESSAGE THAT SOUNDS BETTER SHORTENED','{{other}} entrusts you with a message that contains an apology. {{peer}} says removing that part would make you sound much more important.',[
  reply('deliver','Deliver the apology exactly','{{other}} hears that you kept the difficult part. The reply is shorter because it no longer has to be angry.',{education:{progress:3},bond:{role:'other',trust:8}}),
  reply('edit','Improve the sender’s dignity','Your version reaches the wrong sort of audience. {{other}} asks to hear the exact improvement, without the audience this time.',{education:{misconduct:7},bond:{role:'other',trust:-12}}),
 ],{actorRoles:{other:ADULT,peer:PEER}}),
 older('borrowed_sword','THE SWORD THAT REQUIRES TWO HANDS AND PERMISSION','{{peer}} finds a practice sword and suggests testing it before anyone can ask why you have it.',[
  reply('lesson','Ask for a safe lesson','The instructor gives you a blunt exercise and a stance that does not involve the nearest wall. {{peer}} has to learn it too.',{skillXp:{arms:6},bond:{role:'peer',trust:4},education:{progress:2}}),
  reply('swing','Demonstrate your natural command','The sword strikes a bucket. {{peer}} concedes that the bucket has surrendered, though your wrist disputes the victory.',{health:-4,education:{misconduct:4},bond:{role:'peer',respect:2}}),
 ]),
 older('holy_gloss','THE TRANSLATION THAT IMPROVES THE COOK',"{{teacher.intro}} sets a Latin sentence. {{peer}} reads it as “give the children more pudding” and waits hopefully.",[
  reply('check',"Check the word for pudding","The word means patience. {{teacher}} makes you find the right passage, while {{peer}} keeps a finger on the wrong one.",{education:{progress:6},skillXp:{scholarship:4},bond:{role:'peer',respect:3}}),
  reply('defend',"Explain why pudding fits the meaning","{{teacher}} asks for the grammar. {{peer}} rubs an empty stomach. It is a strong argument for lunch, but a poor one for Latin.",{education:{misconduct:4},bond:{role:'peer',affinity:6},charm:1}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER}}),
 older('market_change','THE EXTRA COIN NOBODY HAS CLAIMED','{{other}} gives you too much change. {{peer}} calculates how long it would take an honest person to notice.',[
  reply('return','Return the extra coin','{{other}} checks the sum and thanks you without making a sermon of it. {{peer}} revises the calculation.',{education:{progress:2},bond:{role:'other',trust:8},familyReputation:{delta:2}}),
  reply('keep','Keep the advantage','You pocket the extra coins. {{peer}} asks whether your arithmetic always improves when someone else is paying.',{gold:2,education:{misconduct:6},bond:{role:'peer',trust:-4}}),
 ],{actorRoles:{other:ADULT,peer:PEER}}),
 older('fence_dare','THE DARE WITH A WITNESS IN EVERY WINDOW','{{peer}} dares you over a forbidden fence. Every house overlooking it appears empty, except at the curtains.',[
  reply('refuse','Refuse the audience its entertainment','{{peer}} calls you cautious. The curtains remain disappointed and your coat remains whole.',{wits:2,bond:{role:'peer',respect:3},memory:{tag:'refused_fence_dare',weight:1}}),
  risk('climb','Climb before the witnesses get comfortable',0.65,'You cross and return with a leaf caught in your collar. {{peer}} declares the leaf proof of a great expedition.',{skillXp:{husbandry:4},bond:{role:'peer',affinity:6}},'You tear your coat and scrape a knee. {{peer}} offers a version of events in which the fence attacked first.',{health:-5,education:{misconduct:5},bond:{role:'peer',trust:3}}),
 ]),
 older('rival_nickname','THE NICKNAME THAT HAS OUTLIVED THE JOKE',"{{peer.intro}} gives you an unkind nickname. Younger children start repeating it, even when you are close enough to hear every word.",[
  reply('plain',"Tell them it hurts and ask them to stop","{{peer}} glances at your face and drops the grin. The next time somebody repeats it, they change the subject.",{bond:{role:'peer',respect:6,trust:3},charm:1}),
  reply('answer',"Find a crueler name for them","The younger children learn both names. {{peer}} stops laughing and starts using yours whenever an adult turns away.",{education:{misconduct:5},bond:{role:'peer',affinity:-12,flag:'rival'}}),
 ]),
 older('family_tally','THE HOUSEHOLD’S FIRST REAL ACCOUNT',"{{carer.intro}} asks you to count the grain sacks. There are fewer than the tally says, and the empty shelf is hard to argue with.",[
  reply('honest',"Show where the grain is missing","{{carer}} checks the shelf and changes the supper plan. Your careful count leaves a little more grain for the lean week ahead.",{education:{progress:4},householdState:{food:3},bond:{role:'carer',trust:7}}),
  reply('pretty',"Write down the reassuring number","{{carer}} finds the bare shelf later and recounts everything. Next time, you have to count with someone watching.",{education:{misconduct:5},bond:{role:'carer',trust:-8}}),
 ],{actorRoles:{carer:CARER}}),
 older('flood_slate','THE BRIDGE PLAN DRAWN AFTER THE RAIN',"{{peer.intro}} draws a bridge to build from spare boards. There is room for a hero in a cloak, but nothing holding up the middle.",[
  reply('supports',"Make room for the supports","{{peer}} rubs out the cloak. With two extra supports, your little model stays upright and the bridge might be useful.",{skillXp:{craftsmanship:5},education:{progress:3},bond:{role:'peer',trust:4}}),
  reply('hero',"Test the heroic version","One pebble folds the bridge in half. {{peer}} redraws the hero on the bank, well away from the water.",{education:{progress:2},bond:{role:'peer',affinity:4},wits:1}),
 ]),
 youth('love_note','THE LETTER THAT HAS MET ITS READER',"{{peer.intro}} has your note. They point to the line about their eyes and wait for you to stop staring at your shoes.",[
  reply('honest',"Ask the question you meant to ask","You get the words out without a borrowed verse. {{peer}} answers quietly, and neither of you has to involve the whole lane.",{bond:{role:'peer',trust:8},charm:2,memory:{tag:'first_honest_note',weight:2}}),
  reply('deny',"Say it was a handwriting exercise","{{peer}} reads the line about their eyes again. You decide to become very interested in the weather.",{bond:{role:'peer',affinity:-4},education:{misconduct:2},wits:1}),
 ]),
 youth('first_wage','THE WAGE WITH AN INVISIBLE DEDUCTION',"{{other.intro}} offers to pay you for an errand, then takes back half the wage as a fee for learning how to do it.",[
  reply('terms',"Ask for the whole wage before you start","{{other}} grumbles, but pays four gold. You do the errand carefully; you would like to be paid again.",{gold:4,work:{experience:3},bond:{role:'other',respect:6}}),
  reply('accept',"Take the two gold and get it done","You carry the sack and collect two gold. {{other}} pats your shoulder and asks whether the free instructions made it a fair bargain.",{gold:2,work:{experience:4},bond:{role:'other',trust:-4}}),
 ],{actorRoles:{other:ADULT}}),
 youth('forbidden_chapter','THE BOOK THAT SHOULD NOT BE THIS INTERESTING',"{{peer.intro}} opens a respectable book at a forbidden page. Somebody has underlined all the exciting parts in red.",[
  reply('study',"Read the argument and check it","You find a flaw in the passage and point it out. {{peer}} groans; you have somehow made forbidden reading into more work.",{education:{progress:5},skillXp:{scholarship:5},bond:{role:'peer',respect:4}}),
  reply('spread',"Copy the red bits for everyone","The copies are traced to your enormous red initials. {{peer}} quietly turns your name face down.",{education:{misconduct:15},bond:{role:'peer',affinity:5},reputation:-3}),
 ]),
 youth('dangerous_shortcut','THE SHORT WAY PAST THE QUARRY','{{peer}} knows a quicker path beneath loose quarry stone. The chief recommendation is that nobody responsible has approved it.',[
  reply('long','Take the ordinary road','{{peer}} complains until you arrive with both ankles functioning. The longer story is much less impressive.',{bond:{role:'peer',respect:3},wits:2}),
  risk('short','Take the unstable shortcut',0.65,'You cross safely and gain a poor example you can now defend from experience.',{skillXp:{husbandry:4},bond:{role:'peer',affinity:5}},'Loose stone catches your leg. The broken bone ends the outing and begins a real recovery.',{health:-18,healthCondition:{conditionId:'broken_bone',severity:25},bond:{role:'peer',trust:-4}}),
 ],{stakes:'major'}),
 youth('borrowed_reference','THE REFERENCE WRITTEN BY ITS BENEFICIARY',"{{peer.intro}} writes you a glowing reference. It lists three skills you do not have and one that neither of you can pronounce.",[
  reply('correct',"Leave in the things you can actually do","{{peer}} keeps one warm compliment and crosses out the rest. The shorter reference gives you something you can build on.",{education:{progress:3},bond:{role:'peer',trust:6},work:{experience:2}}),
  reply('submit',"Hand over the magnificent version","You are asked to demonstrate the unpronounceable skill. {{peer}} takes a sudden interest in a very distant part of the yard.",{education:{misconduct:12},bond:{role:'peer',trust:-5},reputation:-4}),
 ]),
 youth('leaving_supplies','THE BAG FOR THE LIFE BEYOND HOME','{{carer}} helps pack what you will need for work away from the household. Every practical object seems to carry a longer conversation.',[
  reply('listen','Pack slowly and hear the advice','{{carer}} stops pretending the extra bread is merely efficient. You leave the bag by the door and stay for the meal.',{bond:{role:'carer',trust:12},householdLesson:{progress:4}}),
  reply('rush','Pack quickly to prove you are ready','{{carer}} adds the bread after you have finished explaining your independence. You notice it later.',{bond:{role:'carer',affinity:3},wits:1}),
 ],{actorRoles:{carer:CARER}}),
 youth('peasant_seed','THE SEED THAT IS ALSO SUPPER','{{carer}} divides the household’s seed grain. It looks uncomfortably like the food everyone could eat tonight.',[
  reply('reserve','Keep the sowing reserve and find other work','{{carer}} marks the sack. The evening is lean, but the spring has not been eaten to make it easier.',{health:-2,householdState:{food:6},householdLesson:{progress:5},bond:{role:'carer',trust:6}}),
  reply('eat','Use the reserve now','The meal is better. {{carer}} counts the missing seed before putting the empty sack away.',{health:3,householdState:{food:-12},bond:{role:'carer',trust:-5}}),
 ],{actorRoles:{carer:CARER},requires:{custom:s=>s.world.characters[s.playerCharacterId].background?.origin==='peasant'}}),
 youth('merchant_sample','THE SAMPLE BETTER THAN THE GOODS','{{carer}} shows you a perfect cloth sample and the less perfect consignment. The lesson is about which one customers are allowed to touch.',[
  reply('honest','Label the goods by what they are','The lower price earns fewer coins and fewer angry visits. {{carer}} lets you write the next honest description.',{education:{progress:4},bond:{role:'carer',respect:7},work:{experience:4}}),
  reply('sample','Sell from the perfect sample alone','You receive four gold. {{carer}} makes you keep the sample for the complaints, where perfection becomes less helpful.',{gold:4,education:{misconduct:10},bond:{role:'carer',trust:-5}}),
 ],{actorRoles:{carer:CARER},requires:{custom:s=>['merchant','artisan'].includes(s.world.characters[s.playerCharacterId].background?.origin??'')}}),
 youth('military_ration','THE RATION RETURN COUNTS YOU TWICE','{{carer}} finds two ration entries in your name. The quartermaster describes the second as an administrative child.',[
  reply('correct','Correct the duplicate before collecting','The quartermaster crosses out the child. {{carer}} praises your first successful reduction of an army.',{education:{progress:3},bond:{role:'carer',respect:8},familyReputation:{delta:3}}),
  reply('collect','Collect for both children','The extra food reaches supper before your explanation. {{carer}} puts both signatures beside your bowl and waits for you to discover which one you wrote.',{householdState:{food:8},education:{misconduct:10},bond:{role:'carer',trust:-9}}),
 ],{actorRoles:{carer:CARER},requires:{custom:s=>s.world.characters[s.playerCharacterId].background?.origin==='military'}}),
 youth('noble_precedence','THE CHAIR THAT OUTRANKS ITS OWNER','{{carer}} asks you to yield a chair to an important cousin. The cousin has brought a diagram establishing the chair’s ancestors.',[
  reply('yield','Move the chair and keep your wit private','{{carer}} sees the concession. The cousin spends supper defending the pedigree to a chair that cannot contradict it.',{bond:{role:'carer',trust:6},charm:2,familyReputation:{delta:2}}),
  reply('read','Ask to hear the chair’s whole pedigree','The explanation lasts until the food cools. {{carer}} admires your question less than the audience does.',{charm:3,bond:{role:'carer',affinity:-7},education:{misconduct:4}}),
 ],{actorRoles:{carer:CARER},requires:{custom:s=>['noble','royal'].includes(s.world.characters[s.playerCharacterId].background?.origin??'')}}),
];
