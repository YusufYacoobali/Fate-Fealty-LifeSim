import type { GameEvent } from '@/types/game';
import { scene, reply, fraud } from './narrativeHelpers';
function echo(id:string,eventId:string,choiceIds:string[],title:string,text:string,choices:GameEvent['choices'],sourceRole='other',options:Partial<GameEvent>={}):GameEvent {
  return scene(id,'family','family',title,text,choices,{legacyNarrative:true,ageMin:0,once:true,weight:6,actorRoles:{other:{alive:true,excludePlayer:true,missingActor:'clear_event'}},repetitionGroup:'remembered_choices',callback:{eventId,choiceIds,minYears:1,maxYears:3,roleMap:{other:sourceRole}},...options});
}
export const LEGACY_CALLBACK_EVENTS: GameEvent[] = [
  echo('echo_cooling_stone','peasant_quack_doctor',['peasant_quack_doctor_choice_1'],'THE STONE’S SECOND APPOINTMENT','{{other}} remembers selling you the heated healing stone. It has, the seller explains, used up its medicinal warmth and requires a fresh fee.',[
    reply('refuse','Decline to pay for the same fire twice','You keep your money and damage {{other}}’s confidence in repeat business.',{wits:3,bond:{role:'other',trust:-8}}),
    reply('warn','Show the stone to the waiting customers','You expose the sales trick, gain public standing and make {{other}} a rival who remembers your first purchase less fondly.',{reputation:4,bond:{role:'other',trust:-18,flag:'rival'}}),
  ]),
  echo('echo_rival_higher_price','court_rivalry',['court_rivalry_choice_2'],'THE RUMOUR’S NEW PRICE','{{other}} returns to the silence you bought. Its new price is announced loudly enough to explain what the first bargain was worth.',[
    reply('reject','Refuse the second payment','You keep the coin and lose more of {{other}}’s trust. The rivalry now has a clear financial history.',{bond:{role:'other',trust:-18,flag:'rival'},reputation:-2}),
    reply('expose','Admit the original payment publicly','You disclose your part in the bargain and improve your own reputation. {{other}} acquires a rival who is no longer protecting the same secret.',{reputation:4,bond:{role:'other',trust:-22,flag:'rival'}}),
  ]),
  echo('echo_wet_ancestor','court_forged_lineage',['court_forged_lineage_choice_1'],'THE ANCESTOR’S OTHER DESCENDANTS','{{other}} has sold a similar pedigree to a second household. Your shared ancestor has suddenly become more productive than any surviving record suggests.',[
    reply('withdraw','Withdraw your claim before it becomes testimony','You lose some family standing and keep the disagreement from producing a fresh lie. {{other}} resents an ancestor being returned.',{familyReputation:{delta:-6},bond:{role:'other',trust:-12}}),
    reply('defend','Defend the invented descent under oath','You add a genuine perjury charge to a false family history. {{other}} is now a named witness to the origin of the pedigree.',{legal:fraud('Defending an invented pedigree under oath'),familyReputation:{delta:-7}}),
  ]),
  echo('echo_millers_measure','base_miller_toll',['base_miller_toll_choice_1'],'THE SCOOP’S NEW WITNESS','{{other}} still remembers your challenge to the milling measure. Another household asks whether you will repeat it before witnesses this time.',[
    reply('witness','Repeat only what you actually observed','You gain Commons standing and lose {{other}}’s affection. The dispute has acquired an honest witness rather than a larger story.',{faction:{factionId:'commons',playerStanding:4},bond:{role:'other',affinity:-10}}),
    reply('decline','Decline to enlarge the old quarrel','You preserve your time and lose a little public standing. {{other}} regards your silence as a useful, temporary arrangement.',{reputation:-2,bond:{role:'other',trust:3}}),
  ]),
  echo('echo_feather_seller','faith_relic_vendor',['faith_relic_vendor_choice_2'],'THE PEDLAR’S LESS ANGELIC STOCK','{{other}} returns after your argument over the feather, now selling ordinary quills. The prices still suggest a distinguished ancestry.',[
    reply('welcome','Welcome the honest description','You improve the acquaintance and gain Church standing. {{other}} is allowed to make a living without making an angel.',{bond:{role:'other',trust:10},faction:{factionId:'church',playerStanding:3}}),
    reply('mock','Retell the old scandal for the new customers','You gain a little charm and turn a possible reform into a continuing rivalry.',{charm:3,bond:{role:'other',affinity:-15,flag:'rival'}}),
  ]),
  echo('echo_betrayed_plot','noble_conspiracy',['noble_conspiracy_choice_2'],'THE LETTER YOUR INFORMANT KEPT','{{other}} has kept a copy of the accusation you helped deliver against the plotters. A useful letter, the holder explains, should not be allowed to retire.',[
    reply('disclose','Publicly stand by what you actually reported','Your reputation falls under renewed attention, but you refuse a new secret bargain. {{other}} loses leverage over your silence.',{reputation:-4,bond:{role:'other',trust:-14}}),
    reply('buy','Pay for the copy without trusting it is the only one (12g)','You pay twelve gold for one copy and gain no promise that the rest have vanished. {{other}} finds your caution less profitable than your secrecy.',{gold:-12,bond:{role:'other',trust:-8}},{costGold:12}),
  ]),
  echo('echo_saint_donations','faith_miracle',['faith_miracle_choice_1'],'THE MIRACLE’S ACCOUNT BOOK','{{other}} asks how the donations attracted by your supposed miracle were used. The account needs figures rather than another account of the miracle.',[
    reply('relief','Fund visible relief (8g)','You fund actual relief, improve food security and gain Church standing. {{other}} accepts an answer that somebody can eat.',{gold:-8,worldConditions:{foodSecurity:4},faction:{factionId:'church',playerStanding:4}},{costGold:8}),
    reply('refuse','Claim that the giving itself was sufficient','You lose trust and family standing by refusing an account. The original child’s recovery has not supplied a receipt.',{familyReputation:{delta:-5},bond:{role:'other',trust:-15}}),
  ]),
  echo('echo_child_collector','child_bully',['child_bully_choice_1','child_bully_choice_3'],'THE COLLECTOR WITHOUT A PRINCIPAL','{{other}} remembers the lunch collection you resisted. The miller’s big son is absent; the smaller collector asks whether the old quarrel must continue without him.',[
    reply('truce','Accept a truce without pretending to be friends','You improve trust with {{other}}. The rivalry is not erased by a speech, but the next meeting need not collect another grievance.',{bond:{role:'other',trust:12}}),
    reply('repay','Demand lunch in repayment','You deepen the rivalry and lose a little reputation. {{other}} recognises the collection method immediately.',{bond:{role:'other',affinity:-15,flag:'rival'},reputation:-3}),
  ]),
  echo('echo_mother_treatment','family_mother_ill',['family_mother_ill_choice_1'],'THE FEE YOUR MOTHER REMEMBERS','{{other}} has recovered enough to discuss the money spent during the fever. The question is less about the sum than whether you will ever stop reminding her of it.',[
    reply('quiet','Tell her the account is closed between you','You deepen trust without erasing any actual loan. {{other}} relaxes into a conversation that is finally about something else.',{bond:{role:'other',trust:14,affinity:7}}),
    reply('remind','List everything you sacrificed','You keep the list and damage the bond. {{other}} is alive to hear it, which makes the account no kinder.',{bond:{role:'other',trust:-12,affinity:-8}}),
  ],'mother'),
  echo('echo_roderick_words','knight_duel',['knight_duel_choice_3'],'THE GLOVE LEFT IN A POCKET','Roderick remembers losing the argument instead of the duel. {{other}} has brought no glove this time, but has rehearsed an opening sentence.',[
    reply('hear','Hear the grievance without staging another victory','You hear {{other}} out without inviting the neighbours to enjoy it. The grievance becomes easier to understand when nobody is performing it.',{bond:{role:'other',trust:10},wits:2}),
    reply('repeat','Repeat the winning argument in public','You gain charm and deepen the rivalry. {{other}} now has a second date to attach to the same grievance.',{charm:4,bond:{role:'other',affinity:-16,flag:'rival'}}),
  ]),
  echo('echo_alive_witness','life_living_corpse',['testify'],'THE DECEASED OBJECTS AGAIN','{{other}} has received a copy of the corrected claim. Your parent asks whether being officially alive now excuses the next assessment.',[
    reply('explain','Explain that the victory restored ordinary obligations','You improve trust by refusing to turn one honest correction into another convenient fiction.',{bond:{role:'other',trust:9},familyReputation:{delta:2}}),
    reply('fund','Help meet the assessment (6g)','You contribute toward the household assessment. {{other}} agrees that life is expensive but preferable to the earlier paperwork.',{gold:-6,householdState:{wealth:6},bond:{role:'other',affinity:10}},{costGold:6}),
  ],'parent'),
  echo('echo_false_death_fee','life_living_corpse',['fee'],'THE WITHDRAWN CLAIM’S STORAGE FEE','{{other}} remembers the nine gold you paid to withdraw the false death claim. A new fee is proposed for storing the withdrawn document.',[
    reply('contest','Contest the second demand openly','You gain local reputation and make {{other}} a rival. The document has become expensive to keep hidden.',{reputation:4,bond:{role:'other',trust:-18,flag:'rival'}}),
    reply('pay','Pay four gold to avoid another day in court','You spend four gold on delay rather than on a lasting settlement. {{other}} remembers which part of the first demand worked.',{gold:-4,bond:{role:'other',trust:-5}},{costGold:4}),
  ]),
  echo('echo_salt_weight','life_family_secret_salt',['take'],'THE WEIGHT OF THE SALT CELLAR','{{other}} has found the missing household savings you took. The salt was weighed, which makes your explanation about rats particularly unhelpful.',[
    reply('restore','Restore twelve gold to the household (12g)','You replace the money and regain some trust. {{other}} does not have to pretend the loss was imaginary.',{gold:-12,householdState:{wealth:12},bond:{role:'other',trust:12}},{costGold:12}),
    reply('deny','Keep denying a loss that has been counted','You lose more trust and deepen the family quarrel. The unchanged cellar has become a very patient witness.',{bond:{role:'other',trust:-20,flag:'feud'}}),
  ],'parent'),
  echo('echo_sibling_guarantee','life_sibling_guarantor',['take_debt'],'THE GUARANTEE’S FIRST ANNIVERSARY','{{other}} remembers the debt you accepted after the false guarantee. The promised contribution has not materialised; the explanation has improved substantially.',[
    reply('terms','Set clear terms for future help','You improve your own judgement and lose some of {{other}}’s affection. Existing debt remains real until paid.',{wits:3,bond:{role:'other',affinity:-8}}),
    reply('kind','Keep the family bond without making a new promise','You preserve trust while refusing another guarantee. {{other}} learns that affection need not include an empty signature line.',{bond:{role:'other',trust:8}}),
  ],'sibling'),
  echo('echo_child_silence','life_child_witness',['silence'],'THE QUESTION NO LONGER ASKED','{{other}} has stopped asking about the goods you concealed. The silence is obedient in exactly the way you once demanded.',[
    reply('admit','Admit that threatening the witness was wrong','You regain some trust by acknowledging the threat. The old evidence and any charges are not wiped away by the apology.',{bond:{role:'other',trust:14},familyReputation:{delta:2}}),
    reply('reward','Praise the silence and demand it continue','You deepen the damage to trust. {{other}} learns another lesson about what you call loyalty.',{bond:{role:'other',trust:-15,affinity:-7}}),
  ],'child'),
  echo('echo_soap_seal','life_family_false_seal',['use'],'THE SEAL LEFT A GOOD IMPRESSION','{{other}} has been asked about the advance obtained with the soap seal. The seal has dissolved; the impression on the agreement has not.',[
    reply('truth','Give an honest account of the forgery','You gain some reputation for candour without removing the existing charge. {{other}} trusts the admission more than the earlier plan.',{reputation:3,bond:{role:'other',trust:6}}),
    reply('false','Invent another document to support the first','You add a second forgery charge. {{other}} now has a much more complicated account to remember.',{legal:fraud('Creating false evidence for the soap-seal advance'),bond:{role:'other',trust:-10}}),
  ],'sibling'),
  echo('echo_inventory_division','life_marriage_inventory',['divide'],'THE GOODS LEFT AFTER THE LIST','{{other}} returns to discuss a small item omitted when your marriage ended. Both of you have brought the old inventory and a newer caution.',[
    reply('settle','Give up the disputed household item','Your household loses four gold of wealth and trust with {{other}} improves. The former marriage does not resume because an argument ends.',{householdState:{wealth:-4},bond:{role:'other',trust:10}}),
    reply('argue','Insist the silence in the list means ownership','You preserve the goods and deepen the quarrel. {{other}} adds a useful annotation to the old inventory.',{bond:{role:'other',trust:-12,flag:'rival'}}),
  ],'spouse'),
  echo('echo_jealous_joke','life_jealous_petition',['mock'],'THE JOKE REACHES THE OTHER DOOR','{{other}} hears the public joke you made about the suspected visits repeated back at home. It has acquired a kinder ending for everyone except your spouse.',[
    reply('correct','Correct your own story publicly','You regain some trust by taking the embarrassment yourself. {{other}} hears a difference between an apology and another joke.',{bond:{role:'other',trust:12},charm:-3}),
    reply('defend','Insist that being hurt proves there was something to hide','You deepen the loss of trust. {{other}} is given a fresh accusation in place of an answer.',{bond:{role:'other',trust:-18,affinity:-8}}),
  ],'spouse'),
  echo('echo_wedding_reserve','life_three_grooms',['profit'],'THE FOURTH WEDDING CREDITOR','{{other}} asks for the ten gold you took from the wedding reserve. The three brokers have become much less impressive as excuses for the fourth demand.',[
    reply('restore','Restore the ten gold (10g)','You replace the household money and recover some trust. {{other}} removes one name from the list of people awaiting payment.',{gold:-10,householdState:{wealth:10},bond:{role:'other',trust:10}},{costGold:10}),
    reply('keep','Keep the money and call it your fee','The family quarrel deepens. {{other}} now regards your help as something to budget against.',{bond:{role:'other',trust:-18,flag:'feud'},familyReputation:{delta:-3}}),
  ],'sibling'),
  echo('echo_wrong_serenade','life_wrong_serenade',['guide'],'THE SINGER FINDS THE RIGHT WINDOW','{{other}} remembers your quiet correction of the storeroom serenade and offers to help you avoid a public embarrassment of your own.',[
    reply('accept','Accept the advice before making a speech','You gain charm and deepen the friendship. The favour is useful precisely because the audience never sees it happen.',{charm:4,bond:{role:'other',trust:10}}),
    reply('decline','Trust your own judgement this time','You keep the decision your own and lose only a little of {{other}}’s enthusiasm for rescuing you.',{wits:1,bond:{role:'other',affinity:-2}}),
  ]),
  echo('echo_shadow_household','life_shadow_rent',['organise'],'THE SHADE OF AN OLD QUARREL','{{other}}’s household still remembers your family’s opposition to the shadow rent. A minor boundary question has arrived wearing the larger feud.',[
    reply('mediate','Pay for a witnessed boundary discussion (11g)','You pay for mediation and improve trust. The existing family feud remains a real problem rather than disappearing into the refreshments.',{gold:-11,bond:{role:'other',trust:10},worldConditions:{publicOrder:2}},{costGold:11}),
    reply('provoke','Answer with the old accusation','You deepen the quarrel and lower public order. {{other}} supplies the family with a fresh version of the grievance.',{bond:{role:'other',affinity:-16,flag:'feud'},worldConditions:{publicOrder:-3}}),
  ],'other',{callback:{eventId:'life_shadow_rent',choiceIds:['organise'],minYears:1,maxYears:12,inherited:true}}),
  echo('echo_blank_pardon','life_counterfeit_pardon',['use'],'THE PARDON’S HANDWRITING','{{other}} is asked who filled in the blank pardon you presented. The missing seal is no longer the most interesting absence in the account.',[
    reply('admit','Give a truthful account without claiming a pardon','You improve your reputation a little. The forgery charge remains, and {{other}} is spared a second invented story.',{reputation:3,bond:{role:'other',trust:4}}),
    reply('blame','Blame the supplier for words you wrote','You damage trust with {{other}} and gain a rival who can identify your handwriting.',{bond:{role:'other',trust:-24,flag:'rival'},legal:{suspicion:7}}),
  ]),
  echo('echo_juror_pie','life_juror_lunch',['disclose'],'THE PIE’S UNHAPPY OWNER','{{other}} has not forgotten that you delivered the suggested verdict as evidence. The next meeting contains no pie and several extremely polite threats.',[
    reply('record','Have the threats witnessed','You gain public standing by refusing to let the old evidence become a private bargain. {{other}} loses further trust in your discretion.',{reputation:4,bond:{role:'other',trust:-12}}),
    reply('leave','End the meeting without a new bargain','You keep your record clear and the rivalry intact. {{other}} is left with the refreshments and the unsaid part of the threat.',{wits:2,bond:{role:'other',affinity:-4}}),
  ]),
  echo('echo_brand_paid','life_branding_substitute',['accept'],'THE MONEY AFTER THE MARK','{{other}} sees the arm injured by the substitute punishment and asks whether you would recommend the arrangement to someone else.',[
    reply('refuse','Refuse to recruit a second substitute','You gain reputation and keep the chronic pain that made the offer real. {{other}} finds your endorsement unexpectedly unavailable.',{reputation:4,bond:{role:'other',trust:-9}}),
    reply('care','Ask for practical support rather than another bargain','You gain a little health and a more honest bond. The disability remains; the account of what it cost is less easy to evade.',{health:4,bond:{role:'other',trust:7}}),
  ]),
  echo('echo_coffin_toll','life_smuggler_coffin',['carry'],'THE UNCLE’S SECOND JOURNEY','{{other}} asks whether you will carry another supposed coffin. This one has ventilation holes and a much stricter request not to shake it.',[
    reply('decline','Refuse the second cargo','You keep clear of a new smuggling attempt and lose some of {{other}}’s favour. Your earlier record remains whatever it actually was.',{bond:{role:'other',affinity:-8},wits:2}),
    reply('inspect','Require the cargo to be declared openly','You gain Crown standing by insisting on an honest declaration. {{other}} decides the route may be less profitable with you on it.',{faction:{factionId:'crown',playerStanding:4},bond:{role:'other',trust:-8}}),
  ]),
  echo('echo_court_lie','life_court_lie',['warn'],'THE REHEARSAL’S NEXT AUDIENCE','{{other}}’s household remembers the rehearsed accusation you exposed. A new invitation has arrived, careful to contain no words that can easily be quoted.',[
    reply('decline','Refuse the invitation without inventing a threat','You preserve your distance and lose further affection. The household feud remains recorded rather than becoming a new conspiracy by assumption.',{bond:{role:'other',affinity:-8},wits:2}),
    reply('attend','Attend with witnesses of your own','You gain public standing through an openly witnessed meeting. {{other}} finds you difficult to invite into confidence.',{reputation:4,bond:{role:'other',trust:-6}}),
  ],'other',{callback:{eventId:'life_court_lie',choiceIds:['warn'],minYears:1,maxYears:12,inherited:true}}),
  echo('echo_barrel_mark','life_barrel_false_bottom',['sign'],'THE BARRELS COME BACK FULL OF AIR','{{other}} returns with complaints about the false-measure barrels you signed. The workmanship has held up better than the description.',[
    reply('refund','Pay toward a correction (10g)','You spend ten gold and improve your working standing a little. The original fraud charge remains for the court.',{gold:-10,work:{guildStanding:4},bond:{role:'other',trust:5}},{costGold:10}),
    reply('deny','Defend the false capacity again','You deepen the loss of trust and professional standing. {{other}} has a barrel available for the demonstration.',{work:{guildStanding:-7},bond:{role:'other',trust:-15}}),
  ]),
  echo('echo_master_recall','life_master_seal',['recall'],'THE CUSTOMER WHO KEPT THE RECALL','{{other}} remembers that you recalled the rejected goods at your own expense. A new customer asks whether your mark can be trusted.',[
    reply('ask','Ask for a plain account of the correction','You gain work performance and trust through the recommendation. The old mistake is included rather than hidden.',{work:{performance:8},bond:{role:'other',trust:10}}),
    reply('credit','Give the repairers their share of the credit','Your professional standing improves more broadly. {{other}} likes an account that makes room for the people who did the work.',{work:{guildStanding:6},bond:{role:'other',affinity:8}}),
  ]),
  echo('echo_shipment_loan','life_shipment_dry_rain',['venture'],'THE BARGE’S VERY DRY DEBT','{{other}} brings the accounts of the venture you borrowed to fund. Whatever happened to the goods, the interest has remained perfectly sheltered.',[
    reply('review','Review the real accounts before borrowing again','You gain work experience and a more cautious bond. No existing debt is cleared by understanding it better.',{work:{experience:10},bond:{role:'other',trust:5}}),
    reply('borrow','Borrow another twelve gold against hoped-for returns','You add a twelve-gold obligation without creating an imaginary cargo. {{other}} finds the confidence encouraging.',{debt:{principal:12,interestRate:0.14},bond:{role:'other',affinity:5}}),
  ]),
  echo('echo_silent_partner','life_merchant_silent_partner',['guarantee'],'THE PARTNER HAS FOUND A VOICE','{{other}} remembers your guarantee and proposes another. The earlier silence was evidently intended to leave room for this request.',[
    reply('refuse','Refuse another guarantee while the first remains','You lose some favour and improve your judgement. Existing debt is not a qualification for acquiring more.',{wits:3,bond:{role:'other',affinity:-9}}),
    reply('account','Demand a full account before discussing terms','You gain work experience and a more exacting relationship. {{other}} has to turn the conversation from trust to figures.',{work:{experience:9},bond:{role:'other',trust:-3}}),
  ]),
  echo('echo_missing_not','life_lawyer_missing_not',['omit'],'THE WORD RETURNED TO THE CASE','{{other}}’s omitted “not” has been found in a retained draft. A single word now occupies most of the hearing.',[
    reply('correct','Provide the accurate draft','You gain a little reputation for candour and lose {{other}}’s trust. The original alteration remains a real charge.',{reputation:3,bond:{role:'other',trust:-12}}),
    reply('destroy','Try to destroy the retained draft','You add an evidence-destruction charge. The case now has two carefully named acts instead of one missing word.',{legal:fraud('Destroying evidence of a deliberately altered agreement')}),
  ]),
  echo('echo_false_certificate','life_physician_certificate',['backdate'],'THE PATIENT WHO READ THE DATE','{{other}} has compared the certificate you sold with the day of the actual visit. Your former employment is being discussed in the past tense for a very definite reason.',[
    reply('admit','Acknowledge the false certificate','You gain some reputation for honesty without regaining the post or removing the charge. {{other}} finally receives an accurate statement.',{reputation:3,bond:{role:'other',trust:4}}),
    reply('deny','Insist that the date was clinically unimportant','You damage trust further. {{other}} regards the calendar as one of the few instruments used correctly in the case.',{bond:{role:'other',trust:-18},familyReputation:{delta:-3}}),
  ]),
  echo('echo_poet_refusal','life_poet_treason',['refuse'],'THE PATRON’S SAFER VERSE','{{other}} asks for another performance after you refused the accusation of treason. This time the proposed enemy is a badly maintained bridge.',[
    reply('accept','Accept a subject that cannot be imprisoned','You improve work performance and rebuild trust. The bridge is allowed no right of reply, but neither is it made into a person.',{work:{performance:6},bond:{role:'other',trust:8}}),
    reply('terms','Agree only to an honest account of the repair','You gain professional experience by writing within the facts. {{other}} learns that a commission can come with a conscience.',{work:{experience:10},bond:{role:'other',trust:4}}),
  ]),
  echo('echo_honest_muster','life_muster_old_men',['correct'],'THE MEN WHO ARE ACTUALLY HERE','{{other}} brings the next muster list with the duplicate names crossed out. There are fewer men and far fewer explanations.',[
    reply('support','Support the accurate muster','You improve Crown standing and rebuild trust. The smaller force is at least large enough to match its own account.',{faction:{factionId:'crown',playerStanding:4},bond:{role:'other',trust:9}}),
    reply('mock','Read out the earlier list for the company','You gain charm and deepen the rivalry. {{other}} discovers that correction has not bought discretion.',{charm:3,bond:{role:'other',affinity:-13,flag:'rival'}}),
  ]),
  echo('echo_falcon_house','life_falcon_supper',['blame'],'THE RING KEPT BY THE OTHER HOUSE','{{other}}’s household has kept the account of your accusation over the falcon. The old supper now appears whenever the families disagree about anything edible.',[
    reply('admit','Admit your false accusation','You improve trust at the cost of family standing. The recorded feud remains until the households actually find a way to repair it.',{bond:{role:'other',trust:12},familyReputation:{delta:-3}}),
    reply('renew','Repeat the accusation for the new generation','You deepen the feud and lose public standing. {{other}} supplies another accurate account of what you have chosen to repeat.',{bond:{role:'other',affinity:-18,flag:'feud'},reputation:-4}),
  ],'other',{callback:{eventId:'life_falcon_supper',choiceIds:['blame'],minYears:1,maxYears:12,inherited:true}}),
  echo('echo_shadow_map','life_court_map',['survey'],'THE RIVER AT THE HEARING','{{other}} has brought a corrected map after you demanded a survey. The river has resumed its inconvenient natural course.',[
    reply('accept','Accept the corrected evidence without a victory speech','You improve trust and gain Crown standing. {{other}} keeps enough dignity to continue using the accurate map.',{bond:{role:'other',trust:10},faction:{factionId:'crown',playerStanding:3}}),
    reply('boast','Make a public account of the earlier drawing','You gain reputation and damage the relationship. The corrected river now has to carry the old humiliation as well.',{reputation:3,bond:{role:'other',affinity:-12}}),
  ]),
  echo('echo_coin_weight','life_crown_counterfeit_coin',['debase'],'THE COIN RETURNS BY WEIGHT','{{other}} brings back the light coin issued under your order. Traders have begun weighing your face instead of trusting it.',[
    reply('relief','Fund a public correction (18g)','You spend personal gold to improve public order and family standing. The correction buys some goodwill; the charge over the dishonest issue remains on the roll.',{gold:-18,worldConditions:{publicOrder:5},familyReputation:{delta:3}},{costGold:18}),
    reply('deny','Blame the people weighing the coins','Public order falls further and {{other}} loses trust. The silver continues to be absent without asking anyone’s permission.',{worldConditions:{publicOrder:-5},bond:{role:'other',trust:-14}}),
  ],'other',{premium:true,domain:'politics'}),
  echo('echo_private_execution','life_crown_private_trial',['hear'],'THE MORNING YOU REFUSED TO SAVE','{{other}} remembers your refusal to approve a condemnation before evidence. Another petition now arrives with witnesses rather than a convenient conclusion.',[
    reply('hear','Hear the better petition','You improve public order and rebuild trust. The earlier refusal has produced something more useful than an obedient morning.',{worldConditions:{publicOrder:4},bond:{role:'other',trust:10}}),
    reply('decline','Require an ordinary hearing rather than a private favour','You gain Crown standing by keeping the decision out of a personal bargain. {{other}} accepts the limits reluctantly.',{faction:{factionId:'crown',playerStanding:4},bond:{role:'other',affinity:-3}}),
  ],'other',{premium:true,domain:'politics'}),
  echo('echo_relic_skulls','life_saint_two_skulls',['question'],'THE SAINT’S REVISED INVENTORY','{{other}} has removed the claim about the smaller skull. The new label says “object of uncertain history,” which is both less profitable and more defensible.',[
    reply('approve','Support the honest revision','You improve Church standing and trust with {{other}}. The object is allowed to remain interesting without another childhood.',{faction:{factionId:'church',playerStanding:3},bond:{role:'other',trust:10}}),
    reply('repeat','Keep telling the original joke','You gain a little charm and lose the chance to reward correction. {{other}} finds honesty a poor protection against your memory.',{charm:2,bond:{role:'other',trust:-9}}),
  ]),
  echo('echo_ordeal_hand','life_ordeal_oven',['touch'],'THE OVEN’S LESS CONVINCING WITNESS','{{other}} sees the lasting pain left by the burning ordeal. The oven has produced bread since, but no new evidence about your innocence.',[
    reply('testimony','Explain publicly what the ordeal actually proved','You gain reputation by refusing to recommend the injury. The chronic pain remains a real cost rather than becoming proof of guilt.',{reputation:5,bond:{role:'other',trust:-10}}),
    reply('rest','Accept practical help and rest','You recover some health and improve trust. Help eases the day without curing the disability.',{health:5,bond:{role:'other',trust:8}}),
  ]),
  echo('echo_charity_names','life_chapel_key',['open'],'THE SHORTER DONOR LIST','{{other}} has changed the distribution so food is served while names are read. Several donors object to not being heard over the grateful eating.',[
    reply('support','Support the practical arrangement','You gain Church standing and deepen trust. The names still exist; they no longer have to be hungry first.',{faction:{factionId:'church',playerStanding:4},bond:{role:'other',trust:9}}),
    reply('restore','Demand the old ceremony for the important donors','You lose public reputation and {{other}}’s trust by making the meal wait for precedence again.',{reputation:-4,bond:{role:'other',trust:-12}}),
  ]),
  echo('echo_bandage_favour','life_bandage_promise',['remember'],'THE FAVOUR WITH BOTH HANDS FREE','{{other}} remembers the promise you made while the wound was dressed. A practical household chore now needs the help you said you would give.',[
    reply('help','Give the promised afternoon','You spend a little strength and deepen a real friendship. The favour is repaid through work, without claiming the wound never happened.',{health:-2,bond:{role:'other',trust:16,flag:'friend'},familyReputation:{delta:2}}),
    reply('refuse','Say the promise belonged to a frightening day','You lose trust with {{other}}. The knot has come untied more easily than the memory.',{bond:{role:'other',trust:-20}}),
  ]),
  echo('echo_scaffold_peg','life_scaffold_blessing',['secure'],'THE PEG KEPT ON THE BENCH','{{other}} has kept the peg you fitted before climbing the scaffold. Another worker asks why the smallest part of the job is being shown so proudly.',[
    reply('teach','Explain the repair without making the blessing a joke','You gain craft experience and trust. {{other}} is able to repeat the lesson without defending the earlier mistake.',{skillXp:{craftsmanship:8},bond:{role:'other',trust:10}}),
    reply('boast','Make the explanation mostly about your own good sense','You gain charm and lose a little affection. The peg is patient enough to remain the useful part of the story.',{charm:3,bond:{role:'other',affinity:-6}}),
  ]),
  echo('echo_tonic_guarantee','life_cough_false_warranty',['expose'],'THE GUARANTEE’S NEW WORDING','{{other}} returns with a tonic guarantee rewritten after your public objection. This version promises only that the bottle contains tonic.',[
    reply('accept','Welcome the smaller, honest promise','You improve trust and gain a little public standing. {{other}} has discovered a claim that fits inside the bottle.',{bond:{role:'other',trust:9},reputation:2}),
    reply('reject','Keep clear of the seller without renewing the argument','You preserve your judgement and lose no money. {{other}} accepts that changed wording need not buy a customer.',{wits:2,bond:{role:'other',affinity:2}}),
  ]),
  echo('echo_foreign_advance','life_unclaimed_fortune',['borrow'],'THE INHERITANCE’S SECOND MESSENGER','{{other}} brings a new demand connected with the fortune you borrowed to pursue. The estate is still unnamed; its expenses have become very well documented.',[
    reply('stop','Refuse to finance the claim further','You gain judgement and lose {{other}}’s favour. The existing loans remain, but no new obligation is invented on their behalf.',{wits:4,bond:{role:'other',trust:-12}}),
    reply('evidence','Put the demands before the clerk','You gain public standing and make {{other}} a rival. The supposed fortune has finally produced an identifiable person for the inquiry.',{reputation:4,bond:{role:'other',trust:-20,flag:'rival'}}),
  ]),
  echo('echo_pageant_worker','life_escaped_pageant',['pay'],'THE DEVIL REMEMBERS A FAIR WAGE','{{other}} remembers that you helped pay the pageant performer. A later neighbourhood task needs someone trusted to account for everyone’s work.',[
    reply('help','Help keep the accounts fairly','You gain experience and public standing through a reputation based on an actual payment. {{other}} trusts you with the list.',{work:{experience:8},reputation:3,bond:{role:'other',trust:8}}),
    reply('decline','Decline the responsibility without insulting the work','You keep the evening free and preserve the acquaintance. The earlier kindness remains completed rather than becoming permanent employment.',{bond:{role:'other',trust:3},faith:1}),
  ]),
  echo('echo_family_boundary','life_sibling_fence',['restore'],'THE STONE WHERE YOU PUT IT','{{other}} wants your help identifying a boundary mark. The stone restored before witnesses is still there, inconveniently available for everybody to inspect.',[
    reply('witness','Stand by the witnessed position','You improve family standing and trust. {{other}} is reminded that a useful agreement can survive without being rewritten.',{familyReputation:{delta:4},bond:{role:'other',trust:8}}),
    reply('avoid','Keep out of the new argument','You preserve your time and lose some trust. The stone remains a better witness than the people avoiding it.',{bond:{role:'other',trust:-7}}),
  ],'sibling'),
  echo('echo_old_family_goods','life_sibling_fire_sale',['redeem'],'THE THING YOU BOUGHT BACK','{{other}} returns a small keepsake to your hand after you saved the household goods. This one, the explanation goes, should not need rescuing twice.',[
    reply('keep','Keep it without turning the gift into a debt','You deepen the family bond. The object carries no new price. {{other}} waits until you understand that part.',{bond:{role:'other',trust:12,affinity:7}}),
    reply('account','Remind the giver what the rescue cost','You damage trust by making the gift another entry in the debt account. The actual loans are unchanged.',{bond:{role:'other',trust:-12},wits:1}),
  ],'sibling'),
];
