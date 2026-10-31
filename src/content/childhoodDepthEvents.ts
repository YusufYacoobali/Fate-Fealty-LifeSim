import type {EventActorRole,GameEvent} from '@/types/game';
import {scene,reply,risk,ADULT} from './narrativeHelpers';
const CARER:EventActorRole={minAge:16,alive:true,excludePlayer:true,relation:'carer',missingActor:'clear_event'};
const PEER:EventActorRole={minAge:5,maxAge:13,alive:true,excludePlayer:true,missingActor:'clear_event'};
const TEACHER:EventActorRole={...ADULT,careerFamilies:['church']};
function little(id:string,title:string,text:string,choices:GameEvent['choices']):GameEvent{return scene('young_'+id,'child','family',title,text,choices,{ageMin:0,ageMax:4,actorRoles:{carer:CARER},repetitionGroup:id,once:true});}
function child(id:string,title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={}):GameEvent{return scene('young_'+id,'child','family',title,text,choices,{ageMin:5,ageMax:9,actorRoles:{peer:PEER},repetitionGroup:id,once:true,...options});}
function older(id:string,title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={}):GameEvent{return child(id,title,text,choices,{ageMin:10,ageMax:13,...options});}
function youth(id:string,title:string,text:string,choices:GameEvent['choices'],options:Partial<GameEvent>={}):GameEvent{return child(id,title,text,choices,{ageMin:14,ageMax:17,actorRoles:{peer:{...PEER,minAge:14,maxAge:17}},...options});}
export const CHILDHOOD_DEPTH_EVENTS:GameEvent[]=[
 little('spoon_office','THE SPOON’S NEW OFFICE','You discover that dropping a spoon makes {{carer}} fetch it. The office has no salary, but excellent powers.',[
  reply('again','Drop it a second time','{{carer}} retrieves it, then moves the bowl beyond your jurisdiction.',{charm:1,bond:{role:'carer',affinity:2},householdLesson:{progress:2}}),
  reply('offer','Offer the spoon back','{{carer}} accepts the damp gift with ceremony. You have invented an inefficient but pleasant form of cooperation.',{bond:{role:'carer',trust:4},householdLesson:{progress:3}}),
 ]),
 little('sleep_inspection','THE NIGHT INSPECTOR','{{carer}} has finally sat down. You open your eyes to check that the household remains properly staffed.',[
  reply('call','Call for the night inspection','{{carer}} arrives with one shoe on the wrong foot. The inspection passes; the inspector remains unsatisfied.',{bond:{role:'carer',affinity:2},householdLesson:{progress:1}}),
  reply('settle','Settle to the sound of the chair','The chair creaks once more, then stops. {{carer}} gets a little rest without having to earn it twice.',{health:2,bond:{role:'carer',trust:3}}),
 ]),
 little('soup_fort','THE FORTIFICATION OF SUPPER','You have arranged crusts round your bowl. {{carer}} attempts to introduce a spoon through an undefended gate.',[
  reply('defend','Defend the gate with both hands','The soup breaches the wall and most of your sleeve. {{carer}} admires the defence while removing the evidence.',{householdLesson:{progress:2},charm:1}),
  reply('share','Let the spoon into the fortress','You eat. {{carer}} calls the siege a success and declines to discuss whose side won.',{health:2,bond:{role:'carer',affinity:3}}),
 ]),
 little('boot_harbour','THE BOOT WITH A PASSENGER','You put a wooden toy inside {{carer}}’s boot. Departure now depends on a small creature accepting terms.',[
  reply('retrieve','Rescue the toy proudly','{{carer}} thanks you for solving a problem in which you have shown unusually complete expertise.',{wits:1,bond:{role:'carer',trust:3},householdLesson:{progress:2}}),
  reply('hide','Pretend the boot has always lived there','{{carer}} tips out the toy and studies your perfectly serious face. The boot resumes ordinary work.',{charm:2,bond:{role:'carer',affinity:2}}),
 ]),
 little('name_the_cat','THE CAT’S NEW NAME','You give the household cat a new name. {{carer}} asks what happened to its old one.',[
  reply('explain','Explain at great length','{{carer}} understands none of the explanation and all of the importance. The cat responds to neither name.',{bond:{role:'carer',affinity:4},householdLesson:{progress:3}}),
  reply('demonstrate','Call the cat to demonstrate','The cat leaves. {{carer}} praises your accurate imitation of an adult being ignored.',{wits:1,householdLesson:{progress:2}}),
 ]),
 little('washing_judge','THE LAUNDRY HEARING','{{carer}} proposes washing your face. You have not been consulted about the status of the dirt.',[
  reply('object','Object with your whole body','You preserve one muddy cheek through extraordinary effort. {{carer}} wins the other by negotiation.',{charm:1,bond:{role:'carer',affinity:2},householdLesson:{progress:1}}),
  reply('help','Hold the clean cloth yourself','{{carer}} gives you one corner. Your face becomes cleaner and the floor rather less so.',{health:1,bond:{role:'carer',trust:4},householdLesson:{progress:3}}),
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
 little('small_mending','THE THREAD YOU CAN REACH','{{carer}} mends a sleeve while you hold the spare thread. The household has placed considerable confidence in a small fist.',[
  reply('hold','Hold the thread carefully','{{carer}} finishes the stitch and thanks you as though the sleeve could not have survived without the help.',{bond:{role:'carer',trust:5},householdLesson:{progress:4}}),
  reply('pull','Test whether the thread is firmly attached','It is not. {{carer}} starts again and gives you a shorter, less strategically important piece.',{householdLesson:{progress:2},bond:{role:'carer',affinity:2}}),
 ]),
 child('goat_headmaster','THE NEW HEADMASTER','The children elect a goat after it eats the attendance register. {{teacher}} declares the election unlawful. {{peer}} says the goat already has a carrot and three votes of confidence.',[
  reply('teacher','Support the teacher’s authority','{{teacher}} removes the carrot from the meeting. The new headmaster follows its principal source of legitimacy out of the yard.',{education:{progress:4,mentorBond:3},bond:{role:'peer',affinity:-3}}),
  reply('goat','Defend the goat’s election','The goat eats the appeal. {{teacher}} concedes that its administration is unusually decisive.',{education:{misconduct:5},bond:{role:'peer',affinity:8},charm:2}),
  reply('forge','Reconstruct the register rather generously','You improve attendance by adding children who are not present and one unusually literate pig. {{teacher}} notices the pig first.',{education:{misconduct:12,progress:-2},bond:{role:'peer',trust:5}}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER},repetitionGroup:'school_authority'}),
 child('ink_finger','THE FINGER THAT GAVE EVIDENCE','{{teacher}} asks who touched the ink. {{peer}} recommends denying it before you remember which hand is black.',[
  reply('admit','Raise the guilty hand','{{teacher}} gives you a cleaning cloth. The lesson begins with a remarkably well-supported confession.',{education:{progress:3,misconduct:-2},bond:{role:'teacher',trust:5}}),
  reply('hide','Hide the hand behind your back','You leave a black handprint on your tunic. {{peer}} admires evidence that can travel with its owner.',{education:{misconduct:5},bond:{role:'peer',affinity:4}}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER},repetitionGroup:'school_mischief'}),
 child('stool_court','THE COURT WITHOUT A SECOND STOOL','{{peer}} holds court because their household owns the stool. The accused owns the biscuits.',[
  reply('justice','Hear the charge before the biscuits','The court hears an excellent case and receives no biscuits. {{peer}} asks whether justice is always this hungry.',{education:{progress:3},bond:{role:'peer',respect:5}}),
  reply('settle','Propose a biscuit settlement','The accused distributes the evidence. {{peer}} declares the case deliciously inconclusive.',{charm:2,bond:{role:'peer',affinity:6},householdLesson:{progress:2}}),
 ]),
 child('river_boat','THE BOAT THAT HAS NO INTEREST IN COMMAND','You and {{peer}} launch a wooden boat in a ditch. It immediately joins a different fleet beneath the bridge.',[
  reply('reach','Fetch it with a stick','You recover the boat and lose a sleeve to the mud. {{peer}} appoints you admiral of the stick.',{skillXp:{husbandry:3},bond:{role:'peer',trust:4}}),
  reply('charge','Charge spectators for the launch','{{peer}} demands a refund on behalf of the spectators. The spectators are three children and one unmoved dog.',{education:{misconduct:3},bond:{role:'peer',affinity:-5},wits:2}),
 ]),
 child('saint_cake','THE CAKE RESERVED FOR A SAINT','{{peer}} finds a cake set aside for the parish celebration. The saint has not yet arrived to object.',[
  reply('guard','Guard it until the feast','{{peer}} helps guard the cake. Both guards are paid in slices after the duty is over.',{faith:2,bond:{role:'peer',trust:5},memory:{tag:'cake_guard',weight:1}}),
  reply('taste','Taste only enough to establish its quality','The testing spreads to the other side of the cake. {{peer}} suggests calling the missing part an offering.',{education:{misconduct:6},bond:{role:'peer',affinity:4},householdLesson:{progress:2}}),
 ]),
 child('lost_button','THE BUTTON AT THE CENTRE OF THE WORLD','{{peer}} has lost a prized button in the rushes. Finding it has become more important than anything adults claim to be doing.',[
  reply('search','Search carefully together','You find a bone bead, a nail and finally the button. {{peer}} keeps the button and gives you the bead.',{bond:{role:'peer',trust:8,flag:'friend'},wits:1}),
  reply('boast','Claim you can find it for a reward','{{peer}} produces the button from another pocket before your demonstration. Your confidence remains for sale with fewer customers.',{charm:1,bond:{role:'peer',trust:-4},memory:{tag:'button_boast',weight:1}}),
 ],{ageMax:13}),
 child('market_math','THE APPLE THAT DISPROVES THE SUM','{{teacher}} explains division using apples. {{peer}} is performing subtraction from the far end of the bench.',[
  reply('count','Count the evidence before it vanishes','{{teacher}} changes the lesson to subtraction and asks {{peer}} to supply the answer. The answer is full.',{education:{progress:5},skillXp:{scholarship:3},bond:{role:'peer',respect:3}}),
  reply('join','Help reduce the difficult numbers','The arithmetic becomes easy and the teacher becomes difficult. {{peer}} shares the last piece before the examples are confiscated.',{education:{misconduct:5,progress:1},bond:{role:'peer',affinity:5}}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER}}),
 child('family_whisper','THE WORD YOU WERE NOT MEANT TO LEARN','{{carer}} uses a splendid new word after dropping a pot. {{peer}} asks whether you can remember it.',[
  reply('private','Ask its meaning quietly','{{carer}} explains that the word is not useful at chapel. {{peer}} is disappointed by such a limited application.',{education:{progress:2},bond:{role:'carer',trust:5}}),
  reply('public','Demonstrate it at full volume','The word reaches three neighbours before {{carer}} reaches you. {{peer}} has acquired a favourite new quotation.',{education:{misconduct:4},bond:{role:'peer',affinity:6},charm:1}),
 ],{actorRoles:{carer:CARER,peer:PEER}}),
 child('hedge_crown','THE CROWN MADE OF THE WRONG HEDGE','{{peer}} makes a crown from a hedge nobody has first tested for thorns.',[
  reply('mend','Make a safer crown from rushes','{{peer}} accepts the replacement with the dignity of a ruler whose ears have recently been defeated.',{skillXp:{craftsmanship:3},bond:{role:'peer',trust:6}}),
  reply('wear','Prove it is perfectly suitable for royalty','You remove it quickly. {{peer}} agrees that a shorter reign can still be historic.',{health:-2,bond:{role:'peer',respect:3},memory:{tag:'thorn_crown',weight:1}}),
 ]),
 child('mud_toll','THE TOLL AT THE VERY SMALL BRIDGE','{{peer}} charges a pebble to cross a plank over a puddle. The bypass is one ordinary step.',[
  reply('bypass','Walk round the puddle','{{peer}} announces a wider jurisdiction. You take a wider step.',{wits:2,bond:{role:'peer',respect:4}}),
  reply('join','Offer to become deputy collector','The takings reach six pebbles before the owner of the plank asks for it back. {{peer}} gives you a glowing reference.',{charm:2,bond:{role:'peer',affinity:6},education:{misconduct:2}}),
 ],{ageMax:13}),
 child('borrowed_bell','THE BELL THAT RINGS FOR BISCUITS','{{peer}} finds a small bell and proposes summoning the entire household to supper. Nobody has made supper.',[
  reply('warn','Return the bell before the announcement','The household remains undisturbed. {{peer}} says you have no appreciation of ceremony.',{bond:{role:'peer',respect:3},householdLesson:{progress:3}}),
  reply('ring','Announce the excellent imaginary supper','Three adults arrive with impressive speed. {{peer}} discovers that the bell does not also produce food.',{education:{misconduct:4},bond:{role:'peer',affinity:5},charm:1}),
 ],{ageMax:13}),
 child('pocket_inventory','THE INSPECTION OF THE IMPORTANT POCKET','{{carer}} empties your pocket before washing your clothes. The inventory includes a smooth stone, a bent nail and something that has accepted neither name nor explanation.',[
  reply('sort','Explain each treasure before sorting it','{{carer}} keeps the stone and removes the nail. The unidentified object is granted a hearing outside, with a shovel.',{bond:{role:'carer',trust:5},householdLesson:{progress:3}}),
  reply('rescue','Rescue the unidentified object first','It unfolds. {{carer}} opens the door and allows your collection to leave under its own power.',{wits:2,bond:{role:'carer',affinity:2},householdLesson:{progress:1}}),
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
 older('holy_gloss','THE TRANSLATION THAT IMPROVES THE COOK','{{teacher}} assigns a Latin line. {{peer}} translates it as a command to give scholars better pudding.',[
  reply('check','Check the difficult word','The line concerns patience. {{teacher}} describes the translation as a practical opportunity to demonstrate it.',{education:{progress:6},skillXp:{scholarship:4},bond:{role:'peer',respect:3}}),
  reply('defend','Defend the nourishing translation','{{teacher}} asks for the grammatical reason. {{peer}} supplies an excellent account of hunger and no grammar.',{education:{misconduct:4},bond:{role:'peer',affinity:6},charm:1}),
 ],{actorRoles:{teacher:TEACHER,peer:PEER}}),
 older('market_change','THE EXTRA COIN NOBODY HAS CLAIMED','{{other}} gives you too much change. {{peer}} calculates how long it would take an honest person to notice.',[
  reply('return','Return the extra coin','{{other}} checks the sum and thanks you without making a sermon of it. {{peer}} revises the calculation.',{education:{progress:2},bond:{role:'other',trust:8},familyReputation:{delta:2}}),
  reply('keep','Keep the advantage','You gain two gold. {{peer}} learns exactly which sort of mistake you prefer not to correct.',{gold:2,education:{misconduct:6},bond:{role:'peer',trust:-4}}),
 ],{actorRoles:{other:ADULT,peer:PEER}}),
 older('fence_dare','THE DARE WITH A WITNESS IN EVERY WINDOW','{{peer}} dares you over a forbidden fence. Every house overlooking it appears empty, except at the curtains.',[
  reply('refuse','Refuse the audience its entertainment','{{peer}} calls you cautious. The curtains remain disappointed and your coat remains whole.',{wits:2,bond:{role:'peer',respect:3},memory:{tag:'refused_fence_dare',weight:1}}),
  risk('climb','Climb before the witnesses get comfortable',0.65,'You cross and return with a leaf caught in your collar. {{peer}} declares the leaf proof of a great expedition.',{skillXp:{husbandry:4},bond:{role:'peer',affinity:6}},'You tear your coat and scrape a knee. {{peer}} offers a version of events in which the fence attacked first.',{health:-5,education:{misconduct:5},bond:{role:'peer',trust:3}}),
 ]),
 older('rival_nickname','THE NICKNAME THAT HAS OUTLIVED THE JOKE','{{peer}} gives you a name the younger children repeat without understanding. They are very diligent pupils.',[
  reply('plain','Ask plainly for it to stop','{{peer}} sees that you are not performing for the audience. The next attempt at the joke is quieter and much less certain.',{bond:{role:'peer',respect:6,trust:3},charm:1}),
  reply('answer','Invent a crueler name in return','The audience learns two names. {{peer}} begins collecting examples, and the game stops feeling like one.',{education:{misconduct:5},bond:{role:'peer',affinity:-12,flag:'rival'}}),
 ]),
 older('family_tally','THE HOUSEHOLD’S FIRST REAL ACCOUNT','{{carer}} lets you compare the household tally with the goods. The tally is much more optimistic.',[
  reply('honest','Name the shortage carefully','{{carer}} changes the supper plan without blaming your arithmetic. The household has learned something useful before it becomes hungry.',{education:{progress:4},householdState:{food:3},bond:{role:'carer',trust:7}}),
  reply('pretty','Make the account look reassuring','{{carer}} finds the empty shelf. Your figures are moved to the category of things that require checking.',{education:{misconduct:5},bond:{role:'carer',trust:-8}}),
 ],{actorRoles:{carer:CARER}}),
 older('flood_slate','THE BRIDGE PLAN DRAWN AFTER THE RAIN','{{peer}} proposes building a footbridge from spare boards. The drawing includes a heroic figure in a cloak, but no supports.',[
  reply('supports','Add the boring necessary supports','{{peer}} removes the cloak to make room on the slate. The model now stands without needing anyone to be brave.',{skillXp:{craftsmanship:5},education:{progress:3},bond:{role:'peer',trust:4}}),
  reply('hero','Keep the heroic figure and test the model','The model folds beneath a pebble. {{peer}} moves the hero to the bank, where command appears much safer.',{education:{progress:2},bond:{role:'peer',affinity:4},wits:1}),
 ]),
 youth('love_note','THE LETTER THAT HAS MET ITS READER','{{peer}} has read your carefully composed note and asks whether the excellent handwriting is meant to distract from the question.',[
  reply('honest','Ask honestly and accept the answer','You manage a conversation without borrowed verses. {{peer}} answers without inviting the lane to judge it.',{bond:{role:'peer',trust:8},charm:2,memory:{tag:'first_honest_note',weight:2}}),
  reply('deny','Claim you were copying an exercise','{{peer}} asks which lesson requires quite so many compliments about their eyes. The handwriting is admired at a distance.',{bond:{role:'peer',affinity:-4},education:{misconduct:2},wits:1}),
 ]),
 youth('first_wage','THE WAGE WITH AN INVISIBLE DEDUCTION','{{other}} offers your first paid errand, less a fee for teaching you the privilege of being paid.',[
  reply('terms','Ask for the actual wage before agreeing','{{other}} removes the instructional fee after discovering you have understood that part without tuition.',{gold:4,work:{experience:3},bond:{role:'other',respect:6}}),
  reply('accept','Accept the bad bargain for experience','You receive two gold and a lesson worth at least the missing two. {{other}} praises your cooperative nature.',{gold:2,work:{experience:4},bond:{role:'other',trust:-4}}),
 ],{actorRoles:{other:ADULT}}),
 youth('forbidden_chapter','THE BOOK THAT SHOULD NOT BE THIS INTERESTING','{{peer}} finds a forbidden page in a respectable book. The author has helpfully marked the exciting parts in red.',[
  reply('study','Read it critically rather than circulate it','You identify the argument and its weaknesses. {{peer}} is disappointed to discover that scandal can require homework.',{education:{progress:5},skillXp:{scholarship:5},bond:{role:'peer',respect:4}}),
  reply('spread','Copy the red parts for everyone','The copies are traced by your distinctive red initials. {{peer}} suggests that anonymity might have required another colour.',{education:{misconduct:15},bond:{role:'peer',affinity:5},reputation:-3}),
 ]),
 youth('dangerous_shortcut','THE SHORT WAY PAST THE QUARRY','{{peer}} knows a quicker path beneath loose quarry stone. The chief recommendation is that nobody responsible has approved it.',[
  reply('long','Take the ordinary road','{{peer}} complains until you arrive with both ankles functioning. The longer story is much less impressive.',{bond:{role:'peer',respect:3},wits:2}),
  risk('short','Take the unstable shortcut',0.65,'You cross safely and gain a poor example you can now defend from experience.',{skillXp:{husbandry:4},bond:{role:'peer',affinity:5}},'Loose stone catches your leg. The broken bone ends the outing and begins a real recovery.',{health:-18,healthCondition:{conditionId:'broken_bone',severity:25},bond:{role:'peer',trust:-4}}),
 ],{stakes:'major'}),
 youth('borrowed_reference','THE REFERENCE WRITTEN BY ITS BENEFICIARY','{{peer}} has written you a glowing reference for work. It praises three skills you do not yet possess and a fourth that nobody recognises.',[
  reply('correct','Correct the reference before using it','{{peer}} keeps one compliment you can defend. The employer receives a smaller promise and a more useful applicant.',{education:{progress:3},bond:{role:'peer',trust:6},work:{experience:2}}),
  reply('submit','Submit the magnificent version','The employer asks for a demonstration of the mysterious fourth skill. {{peer}} is suddenly unavailable to explain it.',{education:{misconduct:12},bond:{role:'peer',trust:-5},reputation:-4}),
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
  reply('collect','Collect for both children','You gain food and lose the advantage of a simple explanation. {{carer}} puts both signatures beside you at supper.',{householdState:{food:8},education:{misconduct:10},bond:{role:'carer',trust:-9}}),
 ],{actorRoles:{carer:CARER},requires:{custom:s=>s.world.characters[s.playerCharacterId].background?.origin==='military'}}),
 youth('noble_precedence','THE CHAIR THAT OUTRANKS ITS OWNER','{{carer}} asks you to yield a chair to an important cousin. The cousin has brought a diagram establishing the chair’s ancestors.',[
  reply('yield','Move the chair and keep your wit private','{{carer}} sees the concession. The cousin spends supper defending the pedigree to a chair that cannot contradict it.',{bond:{role:'carer',trust:6},charm:2,familyReputation:{delta:2}}),
  reply('read','Ask to hear the chair’s whole pedigree','The explanation lasts until the food cools. {{carer}} admires your question less than the audience does.',{charm:3,bond:{role:'carer',affinity:-7},education:{misconduct:4}}),
 ],{actorRoles:{carer:CARER},requires:{custom:s=>['noble','royal'].includes(s.world.characters[s.playerCharacterId].background?.origin??'')}}),
];
