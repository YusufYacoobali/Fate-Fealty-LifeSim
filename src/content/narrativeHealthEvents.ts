import type { GameEvent } from '@/types/game';
import { scene, reply, risk, fraud } from './narrativeHelpers';
export const NARRATIVE_HEALTH_EVENTS: GameEvent[] = [
  scene('life_scaffold_blessing','peasant','health','THE SCAFFOLD’S BLESSING','{{other}} says the repaired scaffold has been blessed. The supporting peg is still lying on the ground beside the holy water.',[
    reply('secure','Fit the peg before going up','You spend the time securing the work and gain practical experience. {{other}} concedes that the blessing need not do every part of the job.',{skillXp:{craftsmanship:6},bond:{role:'other',trust:5}}),
    risk('climb','Climb before the support is fixed (risk lasting injury)',0.45,'The scaffold holds and you finish the task. You collect the promised fee for a task that remains a terrible example.',{gold:8,health:-4},'The platform gives way. The fall leaves lasting pain that does not disappear when the bruises fade.',{health:-22,healthCondition:{conditionId:'chronic_pain',severity:38},holding:{security:-3}}),
    reply('leave','Refuse to test the argument with your body','You keep your health and lose a little favour with {{other}}. The peg remains admirably available.',{bond:{role:'other',affinity:-6},wits:2}),
  ],{repetitionGroup:'unsafe_work',stakes:'major'}),
  scene('life_eye_cure','peasant','health','THE MAN WHO CAN POLISH YOUR SIGHT','{{other}} recommends a travelling healer who promises to polish your sight with an abrasive paste. The demonstration is being performed on a spoon.',[
    reply('refuse','Refuse the treatment and rest your eyes','You gain a little health by resting. Any existing eye condition remains; the spoon’s recovery proves nothing about yours.',{health:3,bond:{role:'other',affinity:-3}}),
    reply('try','Submit to the abrasive treatment (permanent eye damage)','The paste injures your eyes. Failing sight becomes a lasting disability, and {{other}} loses your trust.',{health:-16,healthCondition:{conditionId:'failing_sight',severity:35},bond:{role:'other',trust:-25}}),
    reply('question','Demand evidence from a patient rather than cutlery','You improve public standing by challenging the claim. {{other}} learns that a polished spoon is not a testimonial.',{reputation:4,bond:{role:'other',trust:-8},wits:2}),
  ],{repetitionGroup:'false_cures',stakes:'major'}),
  scene('life_fever_work','peasant','health','THE WORK THAT WILL NOT SWEAT ITSELF','While you are feverish, {{other}} insists a hard day’s labour will drive the sickness out. You would prefer it to leave by a door that does not require lifting.',[
    reply('rest','Rest and accept a lost day’s work','You recover some health and lose a little work performance. The existing illness remains subject to its real course.',{health:7,work:{performance:-5},bond:{role:'other',affinity:-3}}),
    reply('work','Work through the fever (risk making it worse)','You lose health and the lung fever becomes more severe. {{other}} is impressed by an effort your body has not endorsed.',{health:-16,healthCondition:{conditionId:'lung_fever',severity:18},work:{performance:3},bond:{role:'other',respect:5}}),
    reply('help','Pay for practical help and keep resting (7g)','You pay for help and recover some strength without pretending the payment itself removes the disease.',{gold:-7,health:10,work:{performance:-2}},{costGold:7}),
  ],{requires:{hasHealthCondition:['lung_fever']},repetitionGroup:'medical_judgement',stakes:'major'}),
  scene('life_quarry_shortcut','peasant','health','THE SHORTCUT WITHOUT THE ROAD','{{other}} offers to show you a quicker descent through an abandoned quarry. It is certainly shorter; the question is whether you arrive in one piece.',[
    reply('road','Stay on the long road','You spend strength on the safe route and lose some favour with the guide. The road continues to justify its existence.',{health:-2,bond:{role:'other',affinity:-4}}),
    risk('ledge','Take the narrow ledge (risk a fatal fall)',s=>0.3+s.stats.health/220,'You reach the bottom unharmed and gain confidence. {{other}} claims the loose stones were part of the intended route.',{charm:3,bond:{role:'other',trust:4}},'The ledge crumbles beneath you. The shorter route has no place to stop the fall.',{death:'Killed after choosing a dangerous shortcut through an abandoned quarry.'}),
    reply('turn','Turn back before the descent begins','You give up the excursion and preserve your health. {{other}} keeps the story of the shortcut for a more agreeable audience.',{wits:2,bond:{role:'other',trust:-4}}),
  ],{rarity:'uncommon',repetitionGroup:'dangerous_shortcuts',stakes:'major'}),
  scene('life_furnace_quick_lime','peasant','health','THE WHITE DUST UNDER THE LID','{{other}} asks you to open a hot lime vessel without waiting for it to cool. The warning on the lid is inconveniently short and clear.',[
    reply('wait','Wait for proper cooling and protection','You gain practical judgement and a little trust. {{other}} discovers that impatience is cheaper than a burn only until someone obeys it.',{wits:3,skillXp:{craftsmanship:5},bond:{role:'other',trust:4}}),
    reply('open','Open the hot vessel (severe burns)','You suffer real burns and lose health. {{other}} can no longer call the warning an excess of caution.',{health:-20,healthCondition:{conditionId:'burns',severity:42},bond:{role:'other',trust:-20}}),
  ],{repetitionGroup:'unsafe_work',stakes:'major'}),
  scene('life_boat_fare','peasant','health','THE FERRY’S EXTRA PASSENGER','{{other}} asks you to board a ferry already low in the water. The ferryman argues that the extra fare will make the crossing worthwhile.',[
    reply('wait','Wait for the next crossing','You miss the busy part of the market and lose a little work performance. Your feet remain on the useful side of the river.',{work:{performance:-3},bond:{role:'other',affinity:-3}}),
    risk('board','Board the overloaded ferry (risk drowning)',0.6,'The ferry reaches the bank. You gain a small reputation for nerve and remain unable to spend it on better buoyancy.',{reputation:4,health:-3},'The overloaded boat capsizes in deep water. The extra fare cannot purchase a shore.',{death:'Drowned after choosing an overloaded ferry.'}),
    reply('unload','Pay to leave a cargo bundle behind (7g)','You pay for a safer arrangement and gain {{other}}’s respect. The ferryman reluctantly accepts that cargo can miss a crossing.',{gold:-7,bond:{role:'other',respect:8}},{costGold:7}),
  ],{repetitionGroup:'dangerous_crossings',stakes:'major'}),
  scene('life_herbal_labels','peasant','health','THE TWO IDENTICAL HERB BUNDLES','{{other}} has mixed up two bundles of herbs, one soothing and one violently unsuitable for supper. The labels were left in the other basket.',[
    reply('discard','Discard both and buy known food (4g)','You pay for ordinary food rather than an exciting diagnosis. {{other}} accepts the loss of the herbs.',{gold:-4,health:3,bond:{role:'other',trust:5}},{costGold:4}),
    reply('taste','Taste a little to decide','The experiment causes gut sickness and costs you health. {{other}} learns the result without sharing the method.',{health:-8,healthCondition:{conditionId:'gut_sickness',severity:18},bond:{role:'other',trust:-7}}),
    reply('refuse','Leave both bundles untouched','You refuse the gamble and gain some judgement. Not every uncertain meal needs a conclusive ending.',{wits:3,bond:{role:'other',affinity:-3}}),
  ],{repetitionGroup:'false_cures'}),
  scene('life_recovery_workbench','peasant','health','THE BENCH BESIDE THE HEARTH','{{other}} has moved a small workbench beside the hearth while your bone heals. It is useful, and almost tactful enough not to mention being useful.',[
    reply('accept','Accept the help and work gently','You gain a little health and deepen trust with {{other}}. The broken bone remains real; the day becomes less difficult.',{health:5,bond:{role:'other',trust:12},work:{experience:3}}),
    reply('refuse','Refuse to be treated as injured','You push too hard and lose health. {{other}} leaves the bench nearby without requiring you to admit anything.',{health:-5,bond:{role:'other',affinity:-3},work:{performance:-2}}),
  ],{requires:{hasHealthCondition:['broken_bone']},repetitionGroup:'recovery_and_care'}),
  scene('life_pain_weather','peasant','health','THE CURE THAT IS MOSTLY A CHAIR','{{other}} recommends a chair beside the fire for your lasting pain. It is the first proposed remedy not accompanied by a promise to make you entirely new.',[
    reply('rest','Take the chair and accept limited relief','Your health improves a little while the chronic pain remains. {{other}} is good enough company not to call this a miracle.',{health:6,bond:{role:'other',trust:9}}),
    reply('work','Keep working and refuse the fuss','You lose some health and gain a little work experience. The disability is neither cured nor turned into a moral failing.',{health:-4,work:{experience:4},bond:{role:'other',affinity:-2}}),
  ],{requires:{hasHealthCondition:['chronic_pain']},repetitionGroup:'recovery_and_care'}),
  scene('life_cough_false_warranty','peasant','health','THE TONIC WITH A FUNERAL GUARANTEE','{{other}} recommends a tonic whose seller promises a refund if it fails. The refund must be claimed in person, after burial.',[
    reply('decline','Decline the reassuring guarantee','You ask to see the guarantee in writing. {{other}} discovers a pressing appointment with someone who has not asked that question.',{wits:4,bond:{role:'other',trust:-3}}),
    reply('buy','Buy it despite the warning (6g)','You pay for a useless tonic and lose a little health. No disease is removed, and the guarantee remains admirably difficult to invoke.',{gold:-6,health:-3,bond:{role:'other',trust:-6}},{costGold:6}),
    reply('expose','Read the condition to the waiting customers','You expose the trick and gain public standing. {{other}} is embarrassed to have supplied such a precise recommendation.',{reputation:4,bond:{role:'other',affinity:-6}}),
  ],{repetitionGroup:'false_cures'}),
  scene('life_sickroom_witness','peasant','health','THE SICKROOM’S EXCELLENT WITNESS','{{other}} offers to swear you have recovered enough to work, even though your health is still poor. The employer is prepared to believe whoever costs less.',[
    reply('truth','Give an honest account of your limits','You lose work performance and gain trust with {{other}} by refusing a useful falsehood. Your health remains a fact rather than a certificate.',{work:{performance:-4},bond:{role:'other',trust:7},reputation:2}),
    reply('false','Submit the false declaration','You gain a little performance at the cost of health and a fraud charge. The declaration has not repaired the body it describes.',{work:{performance:5},health:-7,legal:fraud('Submitting a knowingly false fitness declaration')}),
  ],{requires:{minAge:16,statAtMost:{health:35}},repetitionGroup:'professional_fraud'}),
  scene('life_bandage_promise','peasant','health','THE BANDAGE TIED TO A PROMISE','{{other}} helps dress your wound and asks you to remember the favour when less frightened. The knot is firmer than the request.',[
    reply('remember','Promise practical help when you are able','You gain a little health and a trustworthy bond. The wound remains under care rather than vanishing under a promise.',{health:4,bond:{role:'other',trust:14,flag:'friend'}}),
    reply('pay','Pay fairly instead of owing a favour (5g)','You pay five gold for the help and recover some strength. {{other}} accepts a small, completed kindness.',{gold:-5,health:4,bond:{role:'other',trust:5}},{costGold:5}),
    reply('dismiss','Accept the help and dismiss the obligation','You gain some health and lose trust. {{other}} tightens the final knot in silence.',{health:3,bond:{role:'other',trust:-16}}),
  ],{requires:{hasHealthCondition:['deep_cut']},repetitionGroup:'recovery_and_care'}),
];
