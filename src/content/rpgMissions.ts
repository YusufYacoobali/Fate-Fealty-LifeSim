import { Condition, Effects, FactionKey, WorldConditionKey } from '@/types/game';
import { CareerBranch, MaterialId, SkillId } from '@/types/rpg';

export interface MissionOption {
  id: string; label: string; text: string; effects: Effects;
  check?: boolean; combat?: boolean; minLevel?: number; gold?: number;
  good?: string; material?: { id: MaterialId; count: number }; failure?: Effects; failureText?: string;
  requires?: Condition; requirementHint?: string;
}
export interface MissionDefinition {
  id: string; title: string; text: string; skill: SkillId; minAge: number;
  faction: FactionKey; pressure: WorldConditionKey; options: MissionOption[];
}
const safe = (label: string, text: string, effects: Effects): MissionOption => ({ id: 'safe', label, text, effects });
const check = (label: string, text: string, effects: Effects, failure: Effects = { reputation: -2 }, failureText = 'The plan falls short. You learn from the mistake, but your client remembers.'): MissionOption => ({ id: 'skilled', label, text, effects, check: true, failure, failureText });
const fight = (label: string, text: string, effects: Effects): MissionOption => ({ id: 'fight', label, text, effects, combat: true, failure: { reputation: -2 }, failureText: 'You withdraw from the field. The opposition keeps the prize.' });
const give = (good: string, label: string, effects: Effects): MissionOption => ({ id: 'deliver', good, label, text: 'Your preparation makes the difference. The finished goods are gratefully received.', effects });
function mission(id: string, title: string, text: string, skill: SkillId, faction: FactionKey, pressure: WorldConditionKey, options: MissionOption[], minAge = 10): MissionDefinition {
  return { id, title, text, skill, faction, pressure, options, minAge };
}
export const CONTRACTS: MissionDefinition[] = [
  mission('broken_cart', 'The broken cart', '{client} needs a cart repaired before market. Prosperity determines how much trade is at stake.', 'craftsmanship', 'guilds', 'prosperity', [safe('Patch the wheel', 'The cart reaches market, slowly but intact.', { gold: 4, materials: { timber: 1 } }), check('Rebuild the axle', 'Your new axle carries the whole load.', { gold: 10, reputation: 2, materials: { iron: 2 } }), give('repair_kit', 'Deliver a repair kit', { gold: 12, reputation: 3 })]),
  mission('stone_wall', 'A wall between neighbours', '{client} wants a boundary repaired. The neighbours disagree about where it stood.', 'craftsmanship', 'commons', 'publicOrder', [safe('Restore the old boundary', 'Neither neighbour gains land. Both can live with it.', { gold: 5, materials: { stone: 2 } }), check('Survey and rebuild', 'Your careful survey settles the quarrel.', { gold: 11, holding: { security: 4 }, materials: { stone: 3 } }, { health: -3, reputation: -2 })]),
  mission('harvest_help', 'Hands for the harvest', '{client} is short of hands. Food shortages make every sheaf valuable.', 'husbandry', 'commons', 'foodSecurity', [safe('Help bring it in', 'You bring in a modest share of the crop.', { gold: 4, holding: { stores: 5 } }), check('Organise the harvest', 'Neighbours work together and the barns fill.', { gold: 9, holding: { stores: 12 }, reputation: 2 }), give('seed_bundle', 'Provide seed for next year', { gold: 7, holding: { loyalty: 6 } })], 6),
  mission('stray_sheep', 'Sheep on the common', '{client} has lost sheep near disputed grazing land.', 'husbandry', 'commons', 'foodSecurity', [safe('Search the familiar fields', 'You find most of the flock, sheltering behind a hedge.', { gold: 4, materials: { herbs: 1 } }), check('Follow the tracks', 'You bring every sheep home and discover better pasture.', { gold: 9, holding: { stores: 8 } })], 6),
  mission('fever_remedy', 'A household with fever', '{client} asks for help. Disease in Swineford determines how difficult the case is.', 'scholarship', 'church', 'diseasePressure', [safe('Bring food and clean water', 'Practical care eases the household’s burden.', { gold: 3, faith: 2, reputation: 2 }), check('Prepare a treatment', 'A careful remedy helps the patient recover.', { gold: 10, materials: { herbs: 3 }, reputation: 4 }, { health: -3, reputation: -2 }), give('healing_salve', 'Deliver healing salve', { gold: 12, reputation: 4 })], 8),
  mission('chapel_herbs', 'The chapel physic chest', '{client} needs plants for the chapel. Confusing similar leaves would be costly.', 'scholarship', 'church', 'diseasePressure', [safe('Gather familiar leaves', 'You bring a small but useful bundle.', { gold: 4, materials: { herbs: 2 } }), check('Identify rare remedies', 'Your notes and specimens replenish the physic chest.', { gold: 10, materials: { herbs: 4 }, faith: 2 })], 8),
  mission('sealed_letter', 'The sealed letter', '{client} needs a private letter carried through an uneasy town.', 'scholarship', 'crown', 'publicOrder', [safe('Deliver it unopened', 'The seal reaches its intended recipient unbroken.', { gold: 5, reputation: 1 }), check('Negotiate safe passage', 'You pass the checkpoint without revealing the sender.', { gold: 11, faction: { factionId: 'crown', playerStanding: 3 } }, { gold: -3, legal: { suspicion: 3 } })]),
  mission('market_dispute', 'Weights and measures', '{client} asks you to settle a dispute at the market scales.', 'scholarship', 'guilds', 'prosperity', [safe('Arrange a compromise', 'Both merchants accept a smaller profit and an end to shouting.', { gold: 4, holding: { loyalty: 3 } }), check('Expose the false weights', 'Your evidence wins restitution for the customers.', { gold: 10, reputation: 4 }, { reputation: -3, faction: { factionId: 'guilds', playerStanding: -2 } })]),
  mission('road_escort', 'An escort to the bridge', '{client} needs an escort. The state of the roads changes the danger.', 'arms', 'crown', 'publicOrder', [safe('Take the guarded road', 'You arrive safely by the long route.', { gold: 5 }), check('Scout a shorter route', 'Your reconnaissance avoids the ambush entirely.', { gold: 12, materials: { iron: 1 } }, { health: -5, gold: -2 }), fight('Confront the road bully', 'The road opens after your victory.', { gold: 14, reputation: 3 })], 16),
  mission('watch_duty', 'Watch at the gate', '{client} needs someone steady at the village gate.', 'arms', 'commons', 'publicOrder', [safe('Keep a careful watch', 'The night passes without trouble.', { gold: 5, holding: { security: 3 } }), check('Track the intruders', 'You uncover a route through the old fence.', { gold: 11, holding: { security: 8 } }, { health: -4 }), fight('Challenge the trespasser', 'The trespasser abandons the gate.', { gold: 12, holding: { security: 6 } })], 16),
  mission('quiet_package', 'A parcel without a name', '{client} offers generous pay for discretion. The reeve is looking for contraband.', 'scholarship', 'outlaws', 'publicOrder', [safe('Inspect it and decline', 'You return the parcel before becoming involved.', { reputation: 2, gold: 2 }), check('Carry it discreetly', 'The parcel changes hands, and nobody asks for a receipt.', { gold: 16, legal: { notoriety: 2 }, faction: { factionId: 'outlaws', playerStanding: 3 } }, { gold: -5, legal: { suspicion: 15 } }, 'A watchman opens the parcel. The reeve records your name.')], 16),
  mission('missing_tools', 'Tools after dark', '{client} suspects stolen tools are hidden near an abandoned shed.', 'craftsmanship', 'guilds', 'publicOrder', [safe('Arrange the return of essential tools', 'A quiet agreement returns the tools without a fight.', { gold: 3, materials: { iron: 1 } }), check('Trace the maker’s marks', 'The marked tools lead you to the thief.', { gold: 10, materials: { iron: 3 }, reputation: 2 }), fight('Demand their return', 'The tools return to their rightful owner.', { gold: 12, materials: { iron: 2 } })], 16),
];

// Simple boundary work joins harvest and animal care on the childhood board.
CONTRACTS.find((contract) => contract.id === 'stone_wall')!.minAge = 6;
CONTRACTS.find((contract) => contract.id === 'stone_wall')!.options[1].failure = { health: -3, reputation: -2, debt: { principal: 4, interestRate: 0.1 } };
CONTRACTS.find((contract) => contract.id === 'stone_wall')!.options[1].failureText = 'A weakened section falls. The neighbours lend you four gold for repairs, at yearly interest, and remember the failed survey.';

export const EXPEDITIONS: Record<string, { name: string; minAge: number; stages: MissionDefinition[] }> = {
  woodland: { name: 'Woodland', minAge: 10, stages: [
    mission('woodland_0', 'Beyond the charcoal paths', 'Old tracks lead towards a clearing rich in useful plants.', 'husbandry', 'commons', 'foodSecurity', [safe('Follow the charcoal burners', 'Their marked path takes you safely to the clearing.', { materials: { timber: 2 } }), check('Read the animal tracks', 'The tracks reveal a richer route.', { materials: { herbs: 3, timber: 2 } })]),
    mission('woodland_1', 'Across the flooded stream', 'The bridge has fallen. Useful timber lies on the far bank.', 'craftsmanship', 'commons', 'foodSecurity', [safe('Gather on this bank', 'You leave the dangerous crossing for another day.', { materials: { timber: 2 } }), check('Rig a crossing', 'Your bridge holds and the far bank yields its timber.', { materials: { timber: 5 } }, { health: -4 }), give('repair_kit', 'Use a repair kit', { materials: { timber: 5, stone: 2 } })]),
    mission('woodland_2', 'The keeper’s clearing', 'A keeper challenges your right to gather here.', 'scholarship', 'commons', 'publicOrder', [safe('Share the gathered supplies', 'The keeper grants you a modest gathering right.', { materials: { herbs: 3 }, reputation: 2 }), check('Prove the common right', 'Old custom supports your claim.', { materials: { herbs: 5, timber: 4 }, gold: 8 }), give('provisions', 'Offer provisions', { materials: { herbs: 5, timber: 3 }, reputation: 3 })]),
  ] },
  quarry: { name: 'Abandoned quarry', minAge: 14, stages: [
    mission('quarry_0', 'The quarry road', 'A fallen cart blocks the way to the old workings.', 'craftsmanship', 'guilds', 'prosperity', [safe('Salvage what is nearby', 'You mark a safe route for your next visit.', { materials: { stone: 2 } }), check('Clear the cart', 'The axle yields iron and the road opens.', { materials: { iron: 2, stone: 2 } })], 14),
    mission('quarry_1', 'Under the broken lintel', 'A seam of iron lies beneath unstable masonry.', 'craftsmanship', 'guilds', 'prosperity', [safe('Work the outer seam', 'You take the accessible ore without disturbing the roof.', { materials: { iron: 2 } }), { ...check('Brace the roof', 'The braces hold while you recover the deeper seam.', { materials: { iron: 5, stone: 3 } }, { health: -6 }), minLevel: 3 }, give('repair_kit', 'Use your repair kit', { materials: { iron: 4, stone: 3 } })], 14),
    mission('quarry_2', 'Who owns the stone?', 'An armed claimant demands a share of the quarry.', 'arms', 'guilds', 'publicOrder', [safe('Agree a shared claim', 'You leave with stone and an uneasy partner.', { materials: { stone: 4, iron: 2 } }), check('Negotiate a working agreement', 'You secure access for the village masons.', { materials: { stone: 6, iron: 3 }, reputation: 3 }), fight('Defend your claim', 'Your claim is recognised after a public contest.', { materials: { stone: 6, iron: 4 }, gold: 10 })], 16),
  ] },
  watchtower: { name: 'Ruined watchtower', minAge: 16, stages: [
    mission('watchtower_0', 'The lost patrol road', 'An old survey points towards the ruined tower.', 'scholarship', 'crown', 'warThreat', [safe('Follow the visible landmarks', 'You locate a safe approach to the tower.', { materials: { stone: 2 } }), check('Decipher the survey', 'The survey reveals a forgotten storehouse.', { materials: { iron: 3 }, gold: 4 })], 16),
    mission('watchtower_1', 'The tower’s inhabitants', 'Armed squatters guard the stair. Some look hungrier than dangerous.', 'arms', 'crown', 'publicOrder', [safe('Clear rubble in exchange for passage', 'Your work earns passage to the upper floor.', { materials: { stone: 3 } }), give('provisions', 'Share provisions', { materials: { iron: 3 }, reputation: 3 }), fight('Challenge their champion', 'Their champion yields and the stair is yours.', { materials: { iron: 4 }, reputation: 2 })], 16),
    mission('watchtower_2', 'The sealed strongbox', 'Inside are old muster records and the pay of a vanished garrison.', 'scholarship', 'crown', 'warThreat', [safe('Return the records', 'The crown rewards your honesty and records your service.', { gold: 12, faction: { factionId: 'crown', playerStanding: 5 } }), check('Find the soldiers’ descendants', 'You distribute the pay and earn lasting goodwill.', { gold: 18, reputation: 6, materials: { iron: 3 } }, { reputation: -2 }), { id: 'keep', label: 'Keep the forgotten pay', text: 'Your purse grows heavier. Your conscience does too.', effects: { gold: 26, faith: -4, legal: { suspicion: 8 } } }], 16),
  ] },
};

export const CAREER_MISSIONS: Record<CareerBranch, MissionDefinition[]> = {
  mercenary: [
    mission('mercenary_0', 'The company’s first escort', '{client} hires the company to guard a grain convoy.', 'arms', 'crown', 'warThreat', [safe('Guard the civilians', 'Every wagon arrives, though the officers call you slow.', { gold: 10, reputation: 3 }), fight('Clear the ambush', 'Your victory earns the company its pay.', { gold: 16, faction: { factionId: 'crown', playerStanding: 3 } })], 16),
    mission('mercenary_1', 'An order to burn', '{client} carries orders to seize a village’s supplies.', 'arms', 'crown', 'warThreat', [safe('Protect the villagers', 'You refuse the burning and negotiate a smaller levy.', { reputation: 6, faction: { factionId: 'commons', playerStanding: 5 } }), check('Challenge the order', 'Your argument wins provisions without ruin.', { gold: 18, reputation: 4 }, { faction: { factionId: 'crown', playerStanding: -4 } })], 16),
    mission('mercenary_2', 'Ransom at the ford', '{client} is among the captives. The company awaits your decision.', 'arms', 'crown', 'warThreat', [safe('Arrange an exchange', 'The captives return and the company respects your restraint.', { gold: 15, reputation: 5 }), fight('Lead the rescue', 'You bring the captives home and earn command.', { gold: 25, reputation: 8 })], 16),
  ],
  caravan: [
    mission('caravan_0', 'A road worth taking', '{client} offers a first cargo. One road is guarded; the other avoids the toll.', 'scholarship', 'guilds', 'publicOrder', [safe('Take the guarded road', 'The smaller margin buys a safe delivery.', { gold: 8 }), check('Survey the back road', 'A careful survey saves the toll and the cargo.', { gold: 15, materials: { timber: 2 } }, { gold: -4, health: -3 })], 16),
    mission('caravan_1', 'The customs bargain', '{client} asks you to carry undeclared cloth with the legal cargo.', 'scholarship', 'guilds', 'publicOrder', [safe('Declare the whole cargo', 'The customs clerk remembers an honest merchant.', { gold: 12, reputation: 3 }), check('Hide the extra bales', 'The bales pass unnoticed and the profit is substantial.', { gold: 23, faction: { factionId: 'outlaws', playerStanding: 3 } }, { gold: -8, legal: { suspicion: 15 } })], 16),
    mission('caravan_2', 'Shares in the road', '{client} offers a partnership whose small print favours the wealthy.', 'scholarship', 'guilds', 'prosperity', [safe('Take a modest independent share', 'You secure a small route without owing a patron.', { gold: 16, reputation: 4 }), check('Negotiate equal terms', 'The signed agreement makes you a partner in earnest.', { gold: 26, faction: { factionId: 'guilds', playerStanding: 6 } }, { gold: -5 })], 16),
  ],
  court: [
    mission('court_0', 'A petition under the seal', '{client} asks you to carry a petition past an obstructive official.', 'scholarship', 'crown', 'publicOrder', [safe('Follow the lawful process', 'The petition reaches the proper clerk.', { gold: 8, reputation: 2 }), check('Win a private hearing', 'Your argument secures a hearing before the council.', { gold: 14, faction: { factionId: 'crown', playerStanding: 3 } })], 14),
    mission('court_1', 'The patron’s missing account', '{client} fears a powerful patron has altered the household accounts.', 'scholarship', 'crown', 'prosperity', [safe('Correct the accounts quietly', 'The money returns without a public accusation.', { gold: 12, reputation: 2 }), check('Present the evidence openly', 'The council accepts the evidence despite the patron’s anger.', { gold: 18, reputation: 6 }, { reputation: -4, faction: { factionId: 'crown', playerStanding: -3 } })], 14),
    mission('court_2', 'A place beside the throne', '{client} offers influence in exchange for dependable obedience.', 'scholarship', 'crown', 'religiousTension', [safe('Keep your independence', 'You retain a smaller office and the freedom to speak.', { gold: 15, reputation: 6 }), check('Accept, with conditions', 'Your terms turn patronage into a working alliance.', { gold: 24, faction: { factionId: 'crown', playerStanding: 6 } }, { reputation: -5 })], 14),
  ],
};

// A journey is one charged action with three decisions. Its reward is settled
// only at the destination; chapters of the career remain separate yearly work.
export const CARAVAN_JOURNEY: MissionDefinition[] = [
  mission('journey_0', 'Choose the caravan road', '{client} has loaded the wagons. Choose how to reach the ford.', 'scholarship', 'guilds', 'publicOrder', [
    safe('Stay with the guarded convoy', 'You reach the ford under the watchmen’s protection.', {}),
    check('Scout the untolled track · return +3g / failure −2g', 'You mark a shorter route through the hills, saving three gold on the cargo return.', {}, {}, 'The track ends in mud. Returning to the toll road costs two gold from the eventual cargo return.'),
  ], 16),
  mission('journey_1', 'Trouble at the ford', 'The ferryman demands extra payment while a hungry crowd gathers on the bank.', 'scholarship', 'guilds', 'foodSecurity', [
    safe('Wait for the public crossing', 'A measured delay keeps the cargo safe.', {}),
    check('Mediate a fair crossing · return +2g / failure −2g', 'The ferryman accepts a shared fare, adding two gold to the cargo return.', {}, {}, 'The dispute costs two gold from your eventual cargo return, but the wagons cross.'),
    give('provisions', 'Share provisions · return +2g and a community buyer', {}),
  ], 16),
  mission('journey_2', 'Unloading at market', '{client} waits beside the scales. The journey is over; settle the cargo.', 'scholarship', 'guilds', 'prosperity', [
    safe('Honour the agreed price', 'The cargo sells and the caravan returns with a modest margin.', { gold: 11 }),
    check('Bargain for a better price', 'Careful accounts secure a profitable delivery.', { gold: 18, materials: { timber: 2 } }, { gold: 6 }, 'The market has turned. The cargo recovers only part of your stake.'),
  ], 16),
];

export const HOLDING_MISSIONS: MissionDefinition[] = [
  ...[
    ['full_barns', 'Full barns, hungry neighbours', 'The barns are full, but poorer households ask for a share.'],
    ['wet_harvest', 'Rain on the sheaves', 'Rain threatens the sheaves still lying in the field.'],
    ['seed_choice', 'Seed for another year', 'A neighbour offers unfamiliar seed at a tempting price.'],
    ['granary_pests', 'Scratching in the granary', 'Small thieves with whiskers have discovered your stores.'],
  ].map(([id, title, text]) => mission(id, title, text, 'husbandry', 'commons', 'foodSecurity', [safe('Keep a careful reserve', 'You protect the household’s winter supply.', { holding: { stores: 8 } }), { id: 'sell', label: 'Sell surplus · 8 Stores', text: 'The market buys your surplus.', effects: { gold: 9, holding: { stores: -8 } } }, { id: 'share', label: 'Support the villagers · 6 Stores', text: 'The village remembers who opened the barns.', effects: { holding: { stores: -6, loyalty: 12 }, reputation: 3 } }, { ...check('Invest in the next harvest · 4g', 'Better organisation fills the stores.', { holding: { stores: 18 } }, { holding: { stores: -3 } }), gold: 4 }], 6)),
  ...[
    ['road_raiders', 'Riders at the boundary', 'Armed riders demand supplies at your boundary.'],
    ['night_alarm', 'The night alarm', 'A watchman has seen torches beside the barns.'],
    ['stolen_cattle', 'Cattle beyond the hedge', 'Raiders have driven cattle towards the old road.'],
    ['gate_challenge', 'A challenge at the gate', 'A raider offers single combat before the gates.'],
  ].map(([id, title, text]) => mission(id, title, text, 'arms', 'commons', 'publicOrder', [safe('Rely on the fortifications', 'The defenders hold, using supplies to stay on watch.', { holding: { stores: -4, security: 5 } }), { ...safe('Pay them to leave · 5g', 'The raiders take payment and withdraw.', { holding: { loyalty: 2 } }), id: 'pay', gold: 5 }, check('Negotiate their retreat', 'The raiders decide your neighbours are easier prey.', { holding: { security: 10 }, reputation: 2 }, { holding: { stores: -6, security: -4 } }), fight('Defend the gate yourself', 'The victory restores confidence in the holding.', { holding: { security: 14, loyalty: 6 }, reputation: 4 })], 16)),
  ...[
    ['boundary_petition', 'The boundary petition', 'Two households claim the same strip of land.'],
    ['broken_well', 'The broken village well', 'Villagers need help to repair their only reliable well.'],
    ['widows_roof', 'A roof before winter', 'A widow’s roof has fallen in, and her neighbours bring a petition.'],
    ['stewards_accounts', 'The steward’s accounts', 'The household accounts contain a shortfall and several explanations.'],
  ].map(([id, title, text]) => mission(id, title, text, 'craftsmanship', 'commons', 'prosperity', [safe('Arrange communal help', 'Neighbours share the work and settle the immediate need.', { holding: { loyalty: 5 }, reputation: 1 }), check('Take charge of the solution', 'Your careful work settles the matter for everyone.', { holding: { loyalty: 10, security: 5 }, reputation: 3 }, { holding: { loyalty: -3 } }), give('repair_kit', 'Donate a repair kit', { holding: { loyalty: 12, security: 5 }, reputation: 4 })], 10)),
];

const HOLDING_VARIANTS: Record<string, { safe?: MissionOption; extra: MissionOption }> = {
  full_barns: { extra: { id: 'feast', label: 'Hold a harvest feast · 10 Stores', text: 'Villagers eat together and settle old arguments over the shared tables.', effects: { holding: { stores: -10, loyalty: 18 }, charm: 2 } } },
  wet_harvest: { safe: safe('Dry a smaller harvest indoors', 'You save the grain nearest the cottages and leave the wettest sheaves.', { holding: { stores: 3 } }), extra: { id: 'drying_racks', label: 'Build drying racks · 2 timber', material: { id: 'timber', count: 2 }, requires: { skillAtLeast: { craftsmanship: 3 } }, requirementHint: 'Craftsmanship 3', text: 'Raised racks save the crop from mould.', effects: { holding: { stores: 15, loyalty: 3 } } } },
  seed_choice: { safe: safe('Keep the seed you know', 'The familiar strain promises a modest but dependable crop.', { holding: { stores: 5 } }), extra: { id: 'test_seed', label: 'Plant a controlled trial · Husbandry 6', requires: { skillAtLeast: { husbandry: 6 } }, requirementHint: 'Husbandry 6', text: 'A small test plot identifies the best strain without risking the household crop.', effects: { holding: { stores: 15 }, reputation: 3 } } },
  granary_pests: { safe: safe('Move grain into sealed crocks', 'You save the clean grain without claiming another harvest.', { holding: { stores: 2, security: 2 } }), extra: { id: 'pest_proof', label: 'Line the grain bins · 2 stone', material: { id: 'stone', count: 2 }, text: 'Stone-lined bins and close-fitting lids keep the stores secure.', effects: { holding: { stores: 7, security: 7 } } } },
  road_raiders: { extra: { id: 'tribute', label: 'Negotiate a food tribute · 8 Stores', text: 'A fixed tribute avoids a fight and buys a promise to leave the villagers alone.', effects: { holding: { stores: -8, loyalty: 4 }, faction: { factionId: 'outlaws', playerStanding: 2 } } } },
  night_alarm: { extra: { id: 'signal', label: 'Organise signal fires · Arms 6', requires: { skillAtLeast: { arms: 6 } }, requirementHint: 'Arms 6', text: 'Coordinated signals bring neighbouring patrols before the raiders reach the barns.', effects: { holding: { security: 15 }, reputation: 3 } } },
  stolen_cattle: { extra: { id: 'herd', label: 'Call the cattle home · Husbandry 3', requires: { skillAtLeast: { husbandry: 3 } }, requirementHint: 'Husbandry 3', text: 'Familiar calls turn the herd back through the hedge while the riders argue.', effects: { holding: { stores: 10, loyalty: 4 } } } },
  gate_challenge: { extra: { id: 'champion', label: 'Read the champion’s weakness · Arms 10', requires: { skillAtLeast: { arms: 10 } }, requirementHint: 'Arms 10', text: 'A demonstration at the gate makes the champion reconsider the challenge.', effects: { holding: { security: 12 }, reputation: 5 } } },
  boundary_petition: { safe: safe('Keep the existing boundary', 'Both households accept a temporary marker until the records can be read.', { holding: { loyalty: 3 } }), extra: { id: 'survey', label: 'Read the old land roll · Scholarship 3', requires: { skillAtLeast: { scholarship: 3 } }, requirementHint: 'Scholarship 3', text: 'The old measurements settle the ownership without taking either household’s word alone.', effects: { holding: { loyalty: 12 }, reputation: 3 } } },
  broken_well: { safe: safe('Arrange water from neighbouring farms', 'Shared buckets meet the immediate need until the well is repaired.', { holding: { loyalty: 3, stores: 2 } }), extra: { id: 'well', label: 'Rebuild the wellhead · 3 stone', material: { id: 'stone', count: 3 }, text: 'The wellhead is sound again and the water runs clear.', effects: { holding: { loyalty: 10 }, worldConditions: { diseasePressure: -5 } } } },
  widows_roof: { safe: safe('Offer a spare room', 'The household has shelter while the neighbours organise repairs.', { holding: { loyalty: 6 } }), extra: { id: 'roof', label: 'Raise a durable roof · 3 timber', material: { id: 'timber', count: 3 }, text: 'The widow returns home under a sound roof, and remembers who supplied it.', effects: { holding: { loyalty: 14 }, reputation: 4 } } },
  stewards_accounts: { safe: safe('Correct the ledger without punishment', 'The steward repays the missing sum in labour and keeps the office.', { holding: { loyalty: 4 } }), extra: { id: 'audit', label: 'Audit every account · Scholarship 6', requires: { skillAtLeast: { scholarship: 6 } }, requirementHint: 'Scholarship 6', text: 'You distinguish waste from theft and recover the missing coin without a false accusation.', effects: { gold: 10, holding: { loyalty: 7 } } } },
};
for (const def of HOLDING_MISSIONS) {
  const variant = HOLDING_VARIANTS[def.id];
  if (variant.safe) def.options[0] = variant.safe;
  def.options.push(variant.extra);
}

export const ALL_RPG_MISSIONS = [...CONTRACTS, ...Object.values(EXPEDITIONS).flatMap((d) => d.stages), ...Object.values(CAREER_MISSIONS).flat(), ...CARAVAN_JOURNEY, ...HOLDING_MISSIONS];
