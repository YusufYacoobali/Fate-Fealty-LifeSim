import type { CareerFamily, FactionKey, Qualification, WorldConditionKey } from '@/types/game';
import type { SkillId } from '@/types/rpg';
export interface CareerSpecialization {
  id: string; family: CareerFamily; name: string; cost: number; skill: SkillId; contactCareer: string;
  mechanism: 'crops' | 'tenancy' | 'livestock' | 'commission' | 'apprentice' | 'guild' | 'deal' | 'route' | 'rival' | 'sermon' | 'dispute' | 'appointment' | 'patrol' | 'troops' | 'mission' | 'patron' | 'advice' | 'audit' | 'diagnose' | 'treat' | 'epidemic' | 'perform' | 'satire' | 'defend' | 'investigate' | 'judgment' | 'recruit' | 'operation' | 'betrayal';
  condition: WorldConditionKey; faction: FactionKey; qualification?: Qualification; story?: boolean;
  text: string;
}
const rows: [CareerFamily, string, string, CareerSpecialization['mechanism'], WorldConditionKey, FactionKey, string][] = [
  ['agriculture','crop_plan','Rotate the strips','crops','foodSecurity','commons','You plant legumes on the exhausted strip. The reeve calls peas an insult until he sees the next crop.'],
  ['agriculture','tenancy','Negotiate a tenancy','tenancy','prosperity','commons','You set the rent against the actual harvest. The landlord’s agent discovers that a starving tenant pays poorly.'],
  ['agriculture','livestock','Inspect the livestock','livestock','diseasePressure','commons','You separate a coughing ox from the herd. The owner protests until the second ox begins to cough.'],
  ['craft','commission','Accept a commission','commission','prosperity','guilds','A customer orders funeral hinges before the patient has died. You insist on being paid for the hinges rather than the prediction.'],
  ['craft','train_apprentice','Teach an apprentice','apprentice','prosperity','guilds','You take on a real apprentice, complete with a bed, wages and the confidence of someone who has never held a hammer.'],
  ['craft','guild_petition','Challenge the guild','guild','publicOrder','guilds','You demand an open assay instead of another verdict delivered over the master’s private wine.'],
  ['trade','negotiate_deal','Negotiate a grain deal','deal','prosperity','guilds','Your buyer brings a short bushel. You bring the town measure and a witness with excellent eyesight.'],
  ['trade','route_toll','Settle the bridge toll','route','publicOrder','guilds','The bridge keeper charges for six wheels. Your cart has two; his arithmetic has aspirations.'],
  ['trade','commercial_rival','Contest a rival’s claim','rival','prosperity','guilds','A rival household claims your wool bears its mark. You summon the shearer and the sheep, in that order.'],
  ['church','sermon','Deliver a sermon','sermon','religiousTension','church','You preach against selling counterfeit relics. The reliquary keeper spends the sermon rearranging his elbows.'],
  ['church','parish_dispute','Mediate the tithe dispute','dispute','publicOrder','commons','Two households dispute whether geese owe a tithe. You inspect the parish custom before anyone baptises a goose.'],
  ['church','church_appointment','Seek parish responsibility','appointment','religiousTension','church','You present accounts of actual parish work. The archdeacon looks disappointed by their lack of decorative miracles.'],
  ['martial','lead_patrol','Lead a road patrol','patrol','publicOrder','crown','You patrol the road where the reeve’s nephew insists bandits cannot possibly live. They own his old tent.'],
  ['martial','drill_company','Organise the company','troops','warThreat','crown','You count spears, boots and men. For the first time the three figures have a useful relationship.'],
  ['martial','command_mission','Command a convoy escort','mission','foodSecurity','crown','The supply convoy needs a commander who can distinguish a charge from a road. You volunteer.'],
  ['court','seek_patron','Seek a noble patron','patron','publicOrder','crown','You offer a noble something rarer than flattery: an account that balances before supper.'],
  ['court','advise_decree','Advise on a decree','advice','prosperity','crown','The proposed salt levy taxes the same barrel three times. You prepare a correction before the cook learns to riot.'],
  ['court','expose_accounts','Investigate court accounts','audit','publicOrder','crown','The royal household pays a dead falconer for seventeen hawks. None of them has appeared at a hunt.'],
  ['medicine','diagnose_patient','Examine a patient','diagnose','diseasePressure','commons','You ask what the patient ate before consulting the stars. This radical sequence produces useful evidence.'],
  ['medicine','treat_household','Treat a household','treat','diseasePressure','commons','The household demands bloodletting. You examine the fever first and put the lancet where an impatient cousin cannot reach it.'],
  ['medicine','epidemic_response','Organise fever relief','epidemic','diseasePressure','commons','You separate the fever beds, boil cloth and persuade the well to stop sharing cups with the sick.'],
  ['entertainment','hall_performance','Perform in the hall','perform','prosperity','commons','You sing the lord’s genealogy. He requests an encore with fewer bastards.'],
  ['entertainment','find_patron','Seek a paying patron','patron','prosperity','crown','A patron promises everlasting fame. You request supper and a deposit.'],
  ['entertainment','public_satire','Answer a public scandal','satire','publicOrder','commons','A rival performs your verse with a verse about you added. You answer in metre before answering with a stool.'],
  ['law','defend_client','Defend a tenant','defend','publicOrder','commons','Your client is accused of stealing a boundary stone. You ask why the lord’s new field is precisely one stone wider.'],
  ['law','investigate_claim','Investigate a charter','investigate','publicOrder','crown','The charter is ancient. Its witness, inconveniently, is still learning to walk.'],
  ['law','hear_case','Hear a sworn case','judgment','publicOrder','commons','Both neighbours swear that the disputed pig belongs to them. The pig selects a third neighbour.'],
  ['outlaw','recruit_associate','Recruit an associate','recruit','publicOrder','outlaws','Your new associate brings a knife, three debts and an impressive hatred of bailiffs.'],
  ['outlaw','organise_operation','Organise an operation','operation','publicOrder','outlaws','You plan the theft of a collector’s chest. You count guards before dividing imaginary gold.'],
  ['outlaw','handle_betrayal','Investigate an informer','betrayal','publicOrder','outlaws','Someone told the sheriff about the camp. You compare what each associate knew before reaching for a rope.'],
];
export const CAREER_SPECIALIZATIONS: CareerSpecialization[] = rows.map(([family,id,name,mechanism,condition,faction,text]) => ({
  id, family, name, mechanism, condition, faction, text, cost: ['apprentice','route','treat','epidemic','troops'].includes(mechanism) ? 4 : 2,
  skill: family === 'martial' ? 'arms' : family === 'craft' ? 'craftsmanship' : family === 'agriculture' ? 'husbandry' : 'scholarship',
  contactCareer: ({ agriculture: 'tenant_farmer', craft: 'artisan', trade: 'trader', church: 'cleric', martial: 'guard', court: 'steward', medicine: 'herb_gatherer', entertainment: 'busker', law: 'copyist', outlaw: 'poacher_job' } as const)[family],
}));
export const specializationsFor = (family: CareerFamily) => CAREER_SPECIALIZATIONS.filter(a => a.family === family);
