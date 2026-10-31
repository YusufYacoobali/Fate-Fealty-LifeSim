import type { GameEvent } from '@/types/game';
import { scene, reply, risk, fraud } from './narrativeHelpers';
export const NARRATIVE_FAITH_EVENTS: GameEvent[] = [
  scene('life_saint_two_skulls','faith','politics','THE SAINT’S SMALLER SKULL','{{other}} displays a saint’s skull beside a smaller skull said to belong to the saint as a child. The keeper has anticipated the obvious objection and looks tired of it.',[
    reply('question','Ask for the history of both objects','You expose the weak account without inventing a miracle. Your reputation improves and {{other}} becomes less welcoming to questions.',{wits:3,reputation:3,bond:{role:'other',trust:-10}}),
    reply('quiet','Leave the objects and give alms instead (4g)','You give four gold toward relief rather than the display. Your faith and family standing improve without acquiring an extra saint.',{gold:-4,faith:4,familyReputation:{delta:2}},{costGold:4}),
    reply('endorse','Write an endorsement you know is false','You lend your name to the false display and create a fraud charge. The smaller skull has acquired an adult witness.',{legal:fraud('Knowingly endorsing false relics'),createSecret:{type:'false_lineage',severity:30}}),
  ],{repetitionGroup:'false_relics'}),
  scene('life_fast_fish','faith','politics','THE ANIMAL DECLARED A FISH','{{other}} supports declaring a barnyard animal a fish so it may be eaten on fast days. The proposed proof is that it has once stood in a puddle.',[
    reply('object','Ask why the puddle did not convert its owner','You gain public wit and lose {{other}}’s affection. The argument is not improved by your willingness to test it.',{charm:4,bond:{role:'other',affinity:-8},faction:{factionId:'church',playerStanding:-2}}),
    reply('fast','Keep the fast without policing everyone’s supper','You keep your own observance and improve your relationship with {{other}} by declining to turn a meal into a trial.',{faith:5,bond:{role:'other',trust:5}}),
  ],{repetitionGroup:'religious_hypocrisy'}),
  scene('life_ordeal_oven','faith','health','THE OVEN OF INNOCENCE','{{other}} wants to settle an accusation by having you touch a heated oven door. The oven is said to know the truth. Nobody has explained how it will communicate it.',[
    reply('refuse','Demand witnesses rather than an injury','You refuse the ordeal, gain public standing and lose {{other}}’s favour. The oven remains available for bread.',{reputation:4,bond:{role:'other',trust:-12}}),
    reply('touch','Submit to the burning ordeal (lasting pain)','You burn your hand and develop chronic pain. {{other}} admires your endurance. The admiration does nothing for the hand.',{health:-17,healthCondition:{conditionId:'chronic_pain',severity:32},faith:3,bond:{role:'other',respect:8}}),
    reply('delay','Pay for a formal petition instead (11g)','You pay to have your objection heard through ordinary testimony. Crown standing improves without the heat being mistaken for evidence.',{gold:-11,faction:{factionId:'crown',playerStanding:4}},{costGold:11}),
  ],{repetitionGroup:'ordeals',stakes:'major'}),
  scene('life_pilgrim_miles','faith','household','THE PILGRIMAGE MEASURED IN RENT','{{other}} offers to make a pilgrimage on your behalf for a fee determined by how sinful you look. The route gets longer as you explain your finances.',[
    reply('walk','Make a modest local pilgrimage yourself','You spend your strength rather than money and gain faith. {{other}} loses a customer but cannot lengthen your road.',{health:-3,faith:6,bond:{role:'other',affinity:-3}}),
    reply('pay','Contribute to a genuine traveller’s expenses (7g)','You give seven gold without claiming that another person’s miles cancel your conduct. {{other}} appreciates an honest purpose for the journey.',{gold:-7,faith:4,bond:{role:'other',trust:6}},{costGold:7}),
    reply('decline','Decline the spiritual distance calculation','You keep your money and improve your judgement. {{other}} has to assess someone with a less exacting conscience.',{wits:3,bond:{role:'other',affinity:-4}}),
  ],{repetitionGroup:'pilgrimage_bargains'}),
  scene('life_funeral_volume','faith','family','THE FUNERAL’S PRICE OF SILENCE','{{other}} is collecting for a neighbour’s burial. The fee for leaving out an embarrassing story is higher than the fee for telling any number of flattering ones.',[
    reply('support','Pay toward a plain, respectful burial (5g)','You give five gold toward the burial and improve family standing. The dead are not made more virtuous by being more expensive.',{gold:-5,familyReputation:{delta:4},faith:3} ,{costGold:5}),
    reply('object','Refuse to pay for withholding gossip','You challenge the charge and lose {{other}}’s affection. Your own reputation improves for making the objection before anyone starts the story.',{reputation:4,bond:{role:'other',affinity:-10}}),
    reply('gossip','Supply a better story to lower your share','You spread private gossip and gain a rival in {{other}}, who no longer trusts you with an account that might reach the next funeral.',{faith:-4,bond:{role:'other',trust:-15,flag:'rival'},familyReputation:{delta:-3}}),
  ],{repetitionGroup:'family_remembrance'}),
  scene('life_chapel_key','faith','household','THE KEY TO CHARITY','{{other}} holds the key to a food chest and insists it cannot be opened until the donors’ names are read. Hungry people are waiting through an exceptionally generous list.',[
    reply('open','Offer to read the names while food is served','You help the distribution without emptying your own household stores. Church standing and {{other}}’s trust improve.',{faction:{factionId:'church',playerStanding:5},bond:{role:'other',trust:6}}),
    reply('donate','Supply food from your own household reserve','Your household gives up food and gains reputation. {{other}} sees a donation delivered without first hearing its name.',{householdState:{food:-8},familyReputation:{delta:5},bond:{role:'other',respect:7}}),
    reply('record','Make a public account of the delay','You improve Commons standing and make {{other}} a rival. The key’s owner learns that waiting can be recorded too.',{faction:{factionId:'commons',playerStanding:5},bond:{role:'other',trust:-16,flag:'rival'}}),
  ],{repetitionGroup:'parish_charity'}),
  scene('life_miracle_roof','faith','household','THE MIRACLE OF THE DRY PARCHMENT','Rain avoids the shrine’s best account book because {{other}} keeps it under the only sound section of roof. The rest of the room is being called a test of faith.',[
    reply('repair','Fund repairs instead of another miracle plaque (10g)','You improve your household’s standing through the contribution and gain Church favour. The work is paid for by coin, without claiming an unbuilt roof has already risen.',{gold:-10,familyReputation:{delta:4},faction:{factionId:'church',playerStanding:4}},{costGold:10}),
    reply('observe','Point out the useful location of the ledger','You gain wit and lose {{other}}’s patience. The book remains impressively dry.',{wits:3,bond:{role:'other',affinity:-9}}),
  ],{repetitionGroup:'religious_hypocrisy'}),
  scene('life_pilgrim_bridge','faith','health','THE BRIDGE THAT REQUIRES FAITH','{{other}} promises that a saint protects those crossing a broken footbridge. A long detour exists, which has made the promise commercially inconvenient.',[
    reply('detour','Take the long, safe road','You lose some strength to the detour and gain a little faith in the value of reaching your destination.',{health:-3,faith:2,bond:{role:'other',affinity:-3}}),
    risk('cross','Trust the damaged bridge (risk drowning)',0.5,'You cross safely and gain a modest reputation for nerve. The missing boards have not been repaired by your example.',{reputation:5,health:-4},'The bridge gives way over deep water. The assurance of protection cannot keep you afloat.',{death:'Drowned after choosing to cross a visibly broken bridge.'}),
    reply('warn','Warn travellers and refuse to endorse the assurance','You improve public order by challenging the dangerous claim. {{other}} acquires a rival who knows exactly which boards are missing.',{worldConditions:{publicOrder:3},bond:{role:'other',trust:-18,flag:'rival'}}),
  ],{repetitionGroup:'dangerous_bargains',stakes:'major'}),
  scene('life_sermon_own_sin','faith','politics','THE SERMON WITH YOUR MEASURES IN IT','{{other}} has proposed a sermon against dishonest measures using details suspiciously close to your neighbours’ accounts. You are asked to confirm the names.',[
    reply('evidence','Insist that accusations require evidence','You improve public standing and lose {{other}}’s confidence in your willingness to make an example of someone.',{reputation:4,bond:{role:'other',trust:-7}}),
    reply('name','Confirm names you cannot substantiate','You acquire a false-testimony charge. The sermon’s moral certainty has become your legal uncertainty.',{legal:fraud('Confirming knowingly unsupported public accusations'),familyReputation:{delta:-4}}),
    reply('general','Help write a sermon without identifying households','You preserve the moral point and improve Church standing. {{other}} discovers that an argument can survive without a named victim.',{faction:{factionId:'church',playerStanding:4},bond:{role:'other',trust:5}}),
  ],{repetitionGroup:'false_witnesses'}),
  scene('life_silent_brother','faith','family','THE BROTHER WHO WILL NOT SPEAK','A visiting brother remains silent while {{other}} tries to extract a public blessing. The brother quietly helps an exhausted porter lift a load instead.',[
    reply('help','Help carry the load without arranging a ceremony','You spend some strength and gain faith. {{other}} joins you after finding there is nobody left to applaud.',{health:-2,faith:5,bond:{role:'other',trust:6}}),
    reply('observe','Let the useful silence remain useful','You gain understanding without demanding a sign. {{other}} is less annoyed once no one is watching the disappointment.',{wits:3,bond:{role:'other',affinity:3}}),
  ],{repetitionGroup:'quiet_service'}),
  scene('life_saint_dog_bone','faith','politics','THE RELIC WITH TOOTH MARKS','{{other}} asks you to help identify a sacred bone. The household dog identifies it first and is proving difficult to cross-examine.',[
    reply('withdraw','Withdraw the claim until there is evidence','You improve Church standing by declining to manufacture certainty. {{other}} is disappointed that the dog will not be treated as a witness for the defence.',{faction:{factionId:'church',playerStanding:3},bond:{role:'other',trust:-4}}),
    reply('quiet_alms','Turn the gathering toward ordinary alms (3g)','You contribute three gold to relief and gain faith. The bone’s status remains undecided while something useful happens.',{gold:-3,faith:4,familyReputation:{delta:2}},{costGold:3}),
  ],{repetitionGroup:'false_relics'}),
  scene('life_cloister_window','faith','family','THE WINDOW OPENED IN WINTER','{{other}} wants a dying neighbour visited but objects to the draught from the open door. The objection has outlasted the visitor’s strength.',[
    reply('visit','Visit and bring something warm (4g)','You spend four gold on care and gain faith. {{other}} sees a useful duty completed before it can become another argument.',{gold:-4,faith:5,bond:{role:'other',trust:6}},{costGold:4}),
    reply('blanket','Give a household blanket instead of debating the door','Your household loses a little wealth and gains a reputation for care. You do not claim to have cured the neighbour by being kind.',{householdState:{wealth:-4},familyReputation:{delta:4},faith:3}),
    reply('leave','Leave the discussion to people who have time for it','You avoid the expense and lose {{other}}’s respect. The unfinished duty is smaller than your explanation for leaving it.',{bond:{role:'other',respect:-10},faith:-2}),
  ],{repetitionGroup:'quiet_service'}),
];
