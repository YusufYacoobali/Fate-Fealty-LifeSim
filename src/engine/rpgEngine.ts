import { feedbackSnapshot, feedbackChanges } from './choiceFeedback';
import { normalizeWorkshopState } from './workshopState';
import { recordTradeWork } from './tradeJourney';
import { Effects, FactionKey, GameEvent, GameState, HoldingResource } from '@/types/game';
import { CareerBranch, ContractOffer, MaterialId, MissionRun, SkillId, SKILLS } from '@/types/rpg';
import { ALL_RPG_MISSIONS, CARAVAN_JOURNEY, CAREER_MISSIONS, CONTRACTS, EXPEDITIONS, HOLDING_MISSIONS, MissionDefinition, MissionOption } from '@/content/rpgMissions';
import { BRANCH_ASSIGNMENTS, BRANCH_MILESTONES, freshRpg, GATHERING_COSTS, MASTERY_TITLES, MATERIAL_PRICES, RECIPES, RPG_BUILDINGS, SKILL_NAMES } from '@/data/rpg';
import { careerById } from '@/data/careers';
import { addMoney, pushFeed } from './gameState';
import { applyEffects } from './consequenceEngine';
import { spendAction, timedActionAvailability } from './actionClock';
import { chance, stableHash } from './random';
import { equipmentDefinition, equipmentCheckBonus, gatheringBonus, grantSkillXp, normalizeSkills, ownsEquipment, qualityAtLevel, skillLevel, skillsOf } from './rpgProgress';
import { applyRelationshipShift } from './relationshipState';
import { duelAvailability, startDuel } from './duelEngine';
import { meetsCondition } from './eventPicker';
import { appendWorldHistory } from './worldJournal';

export type RpgCommand =
  | { kind: 'contract'; id: string } | { kind: 'expedition'; id: string } | { kind: 'abandon' }
  | { kind: 'career'; id: CareerBranch } | { kind: 'caravan' } | { kind: 'holding'; id: string }
  | { kind: 'craft'; id: string } | { kind: 'equip'; id: string } | { kind: 'unequip'; id: 'weapon' | 'armour' | 'tool' }
  | { kind: 'gather'; id: MaterialId } | { kind: 'buy_material'; id: MaterialId }
  | { kind: 'build'; id: string } | { kind: 'use_good'; id: string } | { kind: 'steward'; id: string }
  | { kind: 'train'; id: SkillId } | { kind: 'mastery'; id: SkillId };

export function gatheringQuote(s: GameState, material: MaterialId) {
  const skill = material === 'herbs' ? 'scholarship' : material === 'timber' ? 'husbandry' : 'craftsmanship';
  const amount = 2 + gatheringBonus(s, material) + Math.floor(skillLevel(s, skill) / 3) + (material === 'herbs' && s.holding.upgrades.includes('herb_garden') ? 1 : 0);
  return { gold: GATHERING_COSTS[material], amount, skill } as const;
}

export function refreshWorkBoard(s: GameState): void {
  if (s.rpg.board.year === s.world.currentYear) return;
  const people = Object.values(s.world.characters).filter((c) => c.alive && c.age >= 18 && c.id !== s.playerCharacterId && c.id !== 'goose').sort((a, b) => a.id.localeCompare(b.id));
  const career = careerById(s.occupation.careerId);
  const ranked = CONTRACTS.filter((d) => d.minAge <= s.age).map((d) => {
    const match = career?.family === 'martial' && d.skill === 'arms' || career?.family === 'craft' && d.skill === 'craftsmanship' || career?.family === 'agriculture' && d.skill === 'husbandry' || ['court', 'medicine', 'trade'].includes(career?.family ?? '') && d.skill === 'scholarship';
    const pressure = s.world.conditions[d.pressure];
    return { d, score: stableHash(s.world.worldSeed, String(s.world.currentYear), d.id) / 0xffffffff + (match ? 0.2 : 0) + skillLevel(s, d.skill) * 0.015 + pressure / 1000 };
  }).sort((a, b) => b.score - a.score || a.d.id.localeCompare(b.d.id));
  s.rpg.board = { year: s.world.currentYear, offers: ranked.slice(0, 3).map(({ d }, index) => {
    const sorted = [...people].sort((a, b) => (b.factionId === d.faction ? 10 : 0) + b.rel / 100 - ((a.factionId === d.faction ? 10 : 0) + a.rel / 100) || a.id.localeCompare(b.id));
    const candidates = sorted.slice(0, 6);
    const client = candidates.length ? candidates[stableHash(s.world.worldSeed, String(s.world.currentYear), d.id, String(index)) % candidates.length] : undefined;
    return { id: `${s.world.currentYear}:${d.id}`, templateId: d.id, clientId: client?.id ?? null, attempted: false };
  }) };
}
export function careerBranchFor(s: GameState): CareerBranch | null {
  const family = careerById(s.occupation.careerId)?.family;
  return family === 'martial' ? 'mercenary' : family === 'trade' ? 'caravan' : family === 'court' ? 'court' : null;
}
export function branchRequirement(s: GameState, id: CareerBranch): string | null {
  if (careerBranchFor(s) !== id) return `Requires a ${id === 'mercenary' ? 'martial' : id === 'caravan' ? 'trade' : 'court'} career`;
  const progress = s.rpg.branches[id];
  if (progress.chapter >= 3) return 'All three career commissions completed';
  const minAge = Math.max(CAREER_MISSIONS[id][progress.chapter].minAge, careerById(s.occupation.careerId)?.minAge ?? 0);
  if (s.age < minAge) return `Requires age ${minAge}`;
  const level = [1, 3, 6][progress.chapter];
  const skill = id === 'mercenary' ? 'arms' : 'scholarship';
  if (skillLevel(s, skill) < level) return `Requires ${SKILL_NAMES[skill]} ${level}`;
  if (progress.assignments < BRANCH_ASSIGNMENTS[progress.chapter]) return `Complete ${BRANCH_ASSIGNMENTS[progress.chapter]} relevant assignments (${progress.assignments} done)`;
  if (progress.chapter > 0 && s.world.factions[id === 'mercenary' ? 'crown' : id === 'caravan' ? 'guilds' : 'crown'].playerStanding < 0) return 'Restore your faction standing';
  return null;
}
function payable(s: GameState, gold: number, materials: Partial<Record<MaterialId, number>>): string | null {
  if (s.gold < gold) return `Needs ${gold}g`;
  for (const [id, n] of Object.entries(materials)) if (s.rpg.materials[id as MaterialId] < n) return `Needs ${n} ${id}`;
  return null;
}
export function rpgAvailability(s: GameState, command: RpgCommand): string | null {
  if (command.kind === 'craft' && !s.lifetimeUnlocked && RECIPES.find((recipe) => recipe.id === command.id)?.premium) return 'Requires Pro';
  if (s.dead || s.pendingEvent || s.duel || s.rpg.mission || (s.rpg.forge && !(s.rpg.forge.phase === 'result' && ['equip', 'use_good'].includes(command.kind)))) return 'Finish the current encounter first';
  if (command.kind === 'abandon') return s.rpg.expedition ? null : 'No expedition in progress';
  if (command.kind === 'unequip') return null;
  if (command.kind === 'equip') return ownsEquipment(s, command.id) && equipmentDefinition(command.id) ? null : 'Not owned';
  if (command.kind === 'use_good') return (s.rpg.goods[command.id] ?? 0) > 0 && RECIPES.find((r) => r.id === command.id)?.effects ? null : 'No usable goods';
  const available = timedActionAvailability(s);
  if (!available.available) return available.reason ?? 'Unavailable';
  if (s.age < 6) return 'Unlocks at age 6';
  switch (command.kind) {
    case 'contract': {
      const offer = s.rpg.board.offers.find((o) => o.id === command.id);
      const def = CONTRACTS.find((d) => d.id === offer?.templateId);
      return !offer || offer.attempted || s.rpg.board.year !== s.world.currentYear ? 'Offer no longer available' : !def || s.age < def.minAge ? 'Too young for this assignment' : null;
    }
    case 'expedition': {
      const def = EXPEDITIONS[command.id];
      if (!def) return 'Unknown destination';
      if (s.age < def.minAge) return `Requires age ${def.minAge}`;
      const remaining = def.stages.length - (s.rpg.expedition?.id === command.id ? s.rpg.expedition.stage : 0);
      if (s.actionClock.cap - s.actionClock.used < remaining) return `Needs ${remaining} actions for the whole journey`;
      return s.rpg.expedition && s.rpg.expedition.id !== command.id ? 'Finish or abandon your current expedition' : null;
    }
    case 'career': return branchRequirement(s, command.id);
    case 'caravan': return s.age < 16 ? 'Requires age 16' : payable(s, 8, {});
    case 'craft': {
      const def = RECIPES.find((r) => r.id === command.id);
      if (!def) return 'Unknown recipe';
      if (s.age < 10) return 'Requires age 10';
      if (skillLevel(s, 'craftsmanship') < def.level) return `Requires Craftsmanship ${def.level}`;
      if (def.scholarshipLevel && skillLevel(s, 'scholarship') < def.scholarshipLevel) return `Requires Scholarship ${def.scholarshipLevel}`;
      if (def.building && !s.holding.upgrades.includes(def.building)) return `Build a ${def.building.replaceAll('_', ' ')}`;
      return payable(s, def.gold, def.materials);
    }
    case 'build': {
      const def = RPG_BUILDINGS.find((b) => b.id === command.id);
      if (!def) return 'Unknown building';
      return s.holding.upgrades.includes(def.id) ? 'Already built' : payable(s, def.gold, def.materials);
    }
    case 'buy_material': return command.id in MATERIAL_PRICES ? payable(s, MATERIAL_PRICES[command.id], {}) : 'Unknown material';
    case 'gather': return command.id in GATHERING_COSTS ? s.gold < GATHERING_COSTS[command.id] ? `You have ${s.gold}g` : null : 'Unknown material';
    case 'train': return !SKILLS.includes(command.id) ? 'Unknown skill' : skillLevel(s, command.id) === 10 ? 'Maximum skill level' : command.id === 'arms' && skillLevel(s, 'arms') >= 3 && !s.holding.upgrades.includes('training_yard') ? 'Build a training yard for advanced exercises' : null;
    case 'steward': {
      const person = s.world.characters[command.id];
      return person?.alive && person.age >= 18 && person.id !== s.playerCharacterId ? s.holding.lastActionAge === s.age ? 'Managed this year' : null : 'Choose a living adult villager';
    }
    case 'holding': {
      const def = HOLDING_MISSIONS.find((d) => d.id === command.id);
      return !def || s.age < def.minAge ? 'Not available at this age' : s.holding.lastActionAge === s.age ? 'Managed this year' : null;
    }
    case 'mastery': return s.age < (command.id === 'arms' ? 16 : 10) ? `Requires age ${command.id === 'arms' ? 16 : 10}` : !SKILLS.includes(command.id) || skillLevel(s, command.id) < 10 ? 'Requires skill level 10' : skillsOf(s)[command.id].mastered ? 'Already mastered' : null;
  }
}
function pay(s: GameState, gold: number, materials: Partial<Record<MaterialId, number>>): void {
  addMoney(s, -gold);
  for (const [id, count] of Object.entries(materials)) s.rpg.materials[id as MaterialId] -= count;
}
function clientFor(s: GameState, faction?: FactionKey): string | null {
  if (s.occupation.patronId && s.world.characters[s.occupation.patronId]?.alive) return s.occupation.patronId;
  const candidates = Object.values(s.world.characters).filter((c) => c.id !== s.playerCharacterId && c.id !== 'goose' && c.alive && c.age >= 18);
  candidates.sort((a, b) => Number(b.factionId === faction) - Number(a.factionId === faction) || b.rankIdx - a.rankIdx || a.id.localeCompare(b.id));
  return candidates[0]?.id ?? null;
}
function openMission(s: GameState, def: MissionDefinition, kind: MissionRun['kind'], stage = 0, clientId = clientFor(s, def.faction)): void {
  s.tab = 'life';
  s.world.feedFilter = 'all';
  s.rpg.mission = { id: `mission_${s.nextId++}`, ownerId: s.playerCharacterId, kind, definitionId: def.id, stage, clientId, faction: def.faction, phase: 'choice', skill: def.skill };
}
export function performRpgCommand(s: GameState, command: RpgCommand): GameState {
  refreshWorkBoard(s);
  if (rpgAvailability(s, command)) return s;
  s.rpg.revision += 1;
  if (command.kind === 'abandon') { s.rpg.expedition = null; return s; }
  if (command.kind === 'equip') { s.rpg.equipment[equipmentDefinition(command.id)!.slot] = command.id; return s; }
  if (command.kind === 'unequip') { delete s.rpg.equipment[command.id]; return s; }
  if (command.kind === 'use_good') { s.rpg.goods[command.id] -= 1; applyEffects(s, RECIPES.find((r) => r.id === command.id)!.effects); return s; }
  spendAction(s);
  switch (command.kind) {
    case 'contract': {
      const offer = s.rpg.board.offers.find((o) => o.id === command.id)!; offer.attempted = true;
      openMission(s, CONTRACTS.find((d) => d.id === offer.templateId)!, 'contract', 0, offer.clientId); break;
    }
    case 'expedition': {
      s.rpg.expedition ??= { id: command.id, stage: 0, ownerId: s.playerCharacterId };
      for (let stage = s.rpg.expedition.stage + 1; stage < EXPEDITIONS[command.id].stages.length; stage++) spendAction(s);
      s.rpg.expedition.prepaid = true;
      openMission(s, EXPEDITIONS[command.id].stages[s.rpg.expedition.stage], 'expedition', s.rpg.expedition.stage); break;
    }
    case 'career': {
      const progress = s.rpg.branches[command.id];
      if (!progress.clientId || !s.world.characters[progress.clientId]?.alive) progress.clientId = clientFor(s, CAREER_MISSIONS[command.id][progress.chapter].faction) ?? undefined;
      openMission(s, CAREER_MISSIONS[command.id][progress.chapter], 'career', progress.chapter, progress.clientId ?? null); break;
    }
    case 'caravan': pay(s, 8, {}); openMission(s, CARAVAN_JOURNEY[0], 'caravan'); break;
    case 'holding': s.holding.lastActionAge = s.age; openMission(s, HOLDING_MISSIONS.find((d) => d.id === command.id)!, 'holding'); break;
    case 'mastery': openMission(s, masteryDefinition(command.id), 'mastery'); break;
    case 'craft': {
      const recipe = RECIPES.find((r) => r.id === command.id)!; pay(s, recipe.gold, recipe.materials);
      const quality = qualityAtLevel(skillLevel(s, 'craftsmanship'));
      const key = recipe.equipment ? `${recipe.equipment}:${quality}` : recipe.id;
      s.rpg.goods[key] = (s.rpg.goods[key] ?? 0) + 1;
      s.rpg.lastCrafted = { key, recipeId: recipe.id };
      grantSkillXp(s, 'craftsmanship', 6, `crafted ${recipe.name}`);
      pushFeed(s, 'CRAFTED', '#387245', `${quality} ${recipe.name} added to your possessions. ${recipe.description}`, 'good'); break;
    }
    case 'build': {
      const b = RPG_BUILDINGS.find((b) => b.id === command.id)!; pay(s, b.gold, b.materials); s.holding.upgrades.push(b.id);
      grantSkillXp(s, 'craftsmanship', 6, `built ${b.name}`); pushFeed(s, 'BUILT', '#387245', `${b.name} completed. ${b.description}`, 'good'); break;
    }
    case 'buy_material': pay(s, MATERIAL_PRICES[command.id], {}); s.rpg.materials[command.id] += 1; break;
    case 'gather': {
      const { gold, amount, skill } = gatheringQuote(s, command.id);
      pay(s, gold, {});
      s.rpg.materials[command.id] += amount;
      grantSkillXp(s, skill, 6, `gathered ${amount} ${command.id}`);
      pushFeed(s, 'GATHERED', '#387245', `You bring home ${amount} ${command.id}. The outing costs ${gold}g.`, 'good'); break;
    }
    case 'train': grantSkillXp(s, command.id, 6, 'practical exercises'); break;
    case 'steward': s.rpg.stewardId = command.id; s.holding.lastActionAge = s.age; applyRelationshipShift(s, command.id, { trust: 3 }, { affinity: 5, trust: 3 }); pushFeed(s, 'STEWARD', '#365f88', `${s.world.characters[command.id].name} takes responsibility for the holding.`, 'good'); break;
  }
  return s;
}
function masteryDefinition(skill: SkillId): MissionDefinition {
  const capstones = {
    husbandry: { title: 'The village seed trial', text: '{client} entrusts you with restoring an exhausted field without taking the village’s winter reserves.', label: 'Demonstrate crop rotation and selective seed', outcome: 'Your trial restores the field and gives the village a dependable seed stock.', effects: { holding: { stores: 15, loyalty: 5 } } },
    craftsmanship: { title: 'The guild’s final commission', text: '{client} commissions a load-bearing bridge model. The guild will test every joint before granting its seal.', label: 'Build and test the bridge model', outcome: 'The loaded model holds. Your joints become the guild’s teaching example.', effects: { holding: { security: 10 } } },
    scholarship: { title: 'The disputed physic book', text: '{client} brings two contradictory remedies and a damaged manuscript. The chapel needs a reliable account, not an impressive guess.', label: 'Compare the records and establish a safe remedy', outcome: 'Your annotated remedy corrects the manuscript and becomes the chapel’s reference.', effects: { worldConditions: { diseasePressure: -5 }, faith: 3 } },
    arms: { title: 'The muster examination', text: '{client} asks you to teach a levy to protect a retreating village. The examiners judge discipline as well as swordcraft.', label: 'Lead a disciplined defensive exercise', outcome: 'The levy holds formation and brings every civilian home. The examiners entrust you with teaching others.', effects: { holding: { security: 10 }, reputation: 2 } },
  };
  const capstone = capstones[skill];
  return { id: `mastery_${skill}`, title: capstone.title, text: `${capstone.text} Success earns the title ${MASTERY_TITLES[skill]}.`, skill, minAge: skill === 'arms' ? 16 : 10, faction: skill === 'arms' ? 'crown' : skill === 'scholarship' ? 'church' : skill === 'husbandry' ? 'commons' : 'guilds', pressure: 'prosperity', options: [
    { id: 'master', label: capstone.label, check: true, effects: { ...capstone.effects, reputation: 8, gold: 20 }, text: `${capstone.outcome} You are recognised as ${MASTERY_TITLES[skill]}.`, failure: { reputation: -1 }, failureText: 'The examiners identify a flaw in your demonstration. You retain your skill and can attempt the commission again.' },
    ...(skill === 'craftsmanship' ? [{ id: 'deliver', label: 'Present your guild masterpiece', good: 'masterpiece', text: 'The guild recognises your masterpiece and grants its seal.', effects: { reputation: 10, gold: 25 } }] : []),
    { id: 'leave', label: 'Withdraw for now', text: 'You leave the examination for another year.', effects: {} },
  ] };
}
export function missionDefinition(s: GameState, run = s.rpg.mission): MissionDefinition | undefined {
  if (!run) return undefined;
  const base = run.kind === 'mastery' ? masteryDefinition(run.skill) : ALL_RPG_MISSIONS.find((d) => d.id === run.definitionId);
  if (!base) return undefined;
  const def = { ...base, options: base.options.map((o) => ({ ...o })) };
  if (run.kind === 'caravan' && run.stage === 2) {
    const choices = run.choices ?? [], results = run.results ?? [];
    // Older v5 journeys have no per-stage result: preserve their original margin.
    const margin = choices.reduce((sum, id, stage) => sum + (id === 'skilled' ? results[stage] === true ? stage === 0 ? 3 : 2 : results[stage] === false ? -2 : 0 : id === 'deliver' ? 2 : 0), 0);
    if (margin) {
      def.text += ` Your route and crossing decisions change the cargo return by ${margin > 0 ? '+' : ''}${margin}g.`;
      def.options = def.options.map((o) => ({ ...o, effects: { ...o.effects, gold: Math.max(0, (o.effects.gold ?? 0) + margin) }, ...(o.failure ? { failure: { ...o.failure, gold: Math.max(0, (o.failure.gold ?? 0) + margin) } } : {}) }));
    }
    if (choices[1] === 'deliver') def.options.push({ id: 'community', label: 'Sell through the households you helped', text: 'The grateful households pool their orders, giving you a dependable market for the cargo.', effects: { gold: 16, reputation: 3 } });
  }
  if (run.kind === 'expedition') def.options.push({ id: 'retreat', label: 'Retreat to the village', text: 'You leave the unfinished expedition behind, keeping only what you already earned.', effects: {} });
  const client = run.clientId ? s.world.characters[run.clientId] : undefined;
  if (run.kind === 'contract') {
    if (client?.alive && client.rel >= 65) def.options.push({ id: 'trusted', label: 'Call on your established trust', text: 'Your client supplies helpers and pays a little extra for someone they trust.', effects: { ...base.options[0].effects, gold: (base.options[0].effects.gold ?? 0) + 2 } });
    const supply = run.skill === 'craftsmanship' ? 'timber' : run.skill === 'arms' ? 'iron' : 'herbs';
    def.options.push({ id: 'prepared', label: `Use professional preparation · 2 ${supply}`, material: { id: supply, count: 2 }, requires: { skillAtLeast: { [run.skill]: 3 } }, requirementHint: `${SKILL_NAMES[run.skill]} 3`, text: 'Your practiced preparation makes the difficult work dependable.', effects: { ...base.options[1].effects } });
    if ((def.pressure === 'diseasePressure' && s.world.conditions.diseasePressure >= 60) || (def.pressure === 'foodSecurity' && s.world.conditions.foodSecurity < 35)) def.options.push({ id: 'relief', label: 'Give your fee to emergency relief', text: 'You forgo payment so the worst-hit households can recover.', effects: { reputation: 5, holding: { loyalty: 6 }, worldConditions: { [def.pressure]: def.pressure === 'diseasePressure' ? -3 : 3 } } });
  }
  if (run.kind === 'career') {
    const branch = Object.keys(CAREER_MISSIONS).find((id) => CAREER_MISSIONS[id as CareerBranch].some((d) => d.id === run.definitionId)) as CareerBranch;
    const previous = s.rpg.branches[branch].choices ?? {};
    if (branch === 'mercenary' && run.stage > 0 && previous[run.stage - 1] === 'safe') def.options.push({ id: 'allies', label: 'Ask the civilians you protected for help', text: 'Villagers repay your restraint with guides, shelter and witnesses. Your company completes the assignment without bloodshed.', effects: { gold: 18, reputation: 6, faction: { factionId: 'commons', playerStanding: 5 } } });
    if (branch === 'caravan' && run.stage === 2) {
      if (previous[1] === 'safe' || s.memories.some((m) => m.tag === 'shared_the_caravan_loss')) def.options.push({ id: 'partners', label: 'Use your honest partnership record', text: 'The old partners vouch for your accounts and secure an equal share.', effects: { gold: 24, reputation: 6 } });
      if (previous[1] === 'skilled') { def.text += ' Your undeclared bales have become a bargaining weapon in the patron’s hands.'; def.options[0] = { ...def.options[0], effects: { gold: 8, legal: { suspicion: 4 } }, text: 'You retain a smaller share, but the patron keeps evidence of the smuggling.' }; }
    }
    if (branch === 'court' && run.stage === 2 && (previous[1] === 'skilled' || s.memories.some((m) => m.tag === 'won_intrigue'))) { def.text += ' Your public evidence has earned independent witnesses and an enemy at court.'; def.options.push({ id: 'witnesses', label: 'Build an independent council of witnesses', text: 'The petitioners support an office that answers to the record, rather than one patron.', effects: { gold: 18, reputation: 8, faction: { factionId: 'commons', playerStanding: 4 } } }); }
  }
  if (run.kind === 'holding' && def.skill === 'arms') {
    const fortification = def.options.find((o) => o.id === 'safe');
    if (fortification) { const secure = s.holding.security >= 50; fortification.text = secure ? 'Strong walls and a disciplined watch turn the raiders away.' : 'The watch shelters the villagers, but the weak boundary costs supplies.'; fortification.effects = { holding: { stores: secure ? -2 : -Math.min(4, s.holding.stores), security: secure ? 5 : -3, loyalty: secure ? 2 : -2 } }; }
  }
  return def;
}
export function missionOdds(s: GameState, def: MissionDefinition, run = s.rpg.mission): number {
  const stat = def.skill === 'arms' || def.skill === 'husbandry' ? s.stats.health : s.stats.wits;
  const client = run?.clientId ? s.world.characters[run.clientId] : undefined;
  const pressure = s.world.conditions[def.pressure];
  const favourable = ['diseasePressure', 'warThreat', 'religiousTension'].includes(def.pressure) ? 100 - pressure : pressure;
  const steward = run?.kind === 'holding' && s.rpg.stewardId ? s.world.characters[s.rpg.stewardId] : undefined;
  return Math.max(0.15, Math.min(0.95, 0.35 + skillLevel(s, def.skill) * 0.035 + stat / 500 + (favourable - 50) / 500 + ((client?.rel ?? 50) - 50) / 500 + equipmentCheckBonus(s, def.skill) + (steward?.alive ? steward.stats.wits / 1000 : 0)));
}
export function optionUnavailable(s: GameState, option: MissionOption, skill = s.rpg.mission?.skill): string | null {
  if (!meetsCondition(s, option.requires)) return option.requirementHint ?? 'Requirements not met';
  if (option.material && s.rpg.materials[option.material.id] < option.material.count) return `Needs ${option.material.count} ${option.material.id}`;
  if (option.gold && s.gold < option.gold) return `Needs ${option.gold}g`;
  if (option.good && (s.rpg.goods[option.good] ?? 0) < 1) return `Needs ${option.good.replaceAll('_', ' ')}`;
  if (option.minLevel && (!skill || skillLevel(s, skill) < option.minLevel)) return `Requires level ${option.minLevel}`;
  if (option.effects.holding?.stores && option.effects.holding.stores < 0 && s.holding.stores < -option.effects.holding.stores) return 'Not enough Stores';
  if (option.combat && s.age < 16) return 'Requires age 16';
  if (option.combat && s.tags.includes('imprisoned')) return 'Cannot fight while imprisoned';
  return null;
}
export function missionEvent(s: GameState): GameEvent | undefined {
  const def = missionDefinition(s), run = s.rpg.mission;
  if (!def || !run || run.phase !== 'choice') return undefined;
  const client = run.clientId ? s.world.characters[run.clientId] : null;
  const name = client?.alive ? client.name : s.world.factions[run.faction].name;
  return { id: run.id, title: def.title, category: 'arc', text: `${run.previousResult ? run.previousResult + '\n\n' : ''}${def.text.replaceAll('{client}', name)}\n\n${SKILL_NAMES[def.skill]} ${skillLevel(s, def.skill)} · ${def.pressure.replaceAll(/([A-Z])/g, ' $1').toLowerCase()}: ${s.world.conditions[def.pressure]}.`, choices: def.options.map((o) => {
    const reason = optionUnavailable(s, o);
    return { id: o.id, label: o.label, disabledReason: reason ?? undefined, hint: [o.combat ? 'Interactive duel; injury and defeat possible' : o.check ? 'Skill check · outcome uncertain' : describeEffects(o.effects), o.gold ? `Pay ${o.gold}g` : '', o.material ? `Uses ${o.material.count} ${o.material.id}` : '', o.good ? `Uses 1 ${o.good.replaceAll('_', ' ')}` : '', o.check ? `Failure: ${describeEffects(o.failure ?? { reputation: -2 })}` : ''].filter(Boolean).join(' · '), costGold: o.gold,
      outcome: { text: o.text, effects: o.effects } };
  }) };
}
export function describeEffects(e: Effects): string {
  return [e.gold ? `${e.gold > 0 ? '+' : ''}${e.gold}g` : '', e.reputation ? `${e.reputation > 0 ? '+' : ''}${e.reputation} reputation` : '', ...(['health', 'charm', 'wits', 'faith'] as const).filter((stat) => e[stat]).map((stat) => `${e[stat]! > 0 ? '+' : ''}${e[stat]} ${stat}`), ...Object.entries(e.materials ?? {}).map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`), ...Object.entries(e.holding ?? {}).map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`), e.legal?.suspicion ? `+${e.legal.suspicion} suspicion` : '', e.debt ? `${e.debt.principal}g debt` : ''].filter(Boolean).join(' · ') || 'Changes your story';
}
/** The board and encounter share a definition; previewing never changes state or RNG. */
export function contractPreview(s: GameState, offer: ContractOffer): string[] {
  const base = CONTRACTS.find((d) => d.id === offer.templateId);
  if (!base) return [];
  const run: MissionRun = { id: offer.id, ownerId: s.playerCharacterId, kind: 'contract', definitionId: base.id, stage: 0, clientId: offer.clientId, faction: base.faction, phase: 'choice', skill: base.skill };
  return missionDefinition(s, run)!.options.map((o) => {
    const costs = [o.gold ? `${o.gold}g` : '', o.material ? `${o.material.count} ${o.material.id}` : '', o.good ? `1 ${o.good.replaceAll('_', ' ')}` : ''].filter(Boolean);
    const requirement = optionUnavailable(s, o, base.skill);
    return `${o.label}: ${describeEffects(o.effects)}${o.check ? ` · ${Math.round(missionOdds(s, base, run) * 100)}% success` : ''}${o.combat ? ' · duel, injury and defeat possible' : ''}${o.check || o.combat ? ` · failure: ${describeEffects(o.failure ?? { reputation: -2 })}` : ''}${costs.length ? ` · costs ${costs.join(', ')}` : ''}${requirement ? ` · ${requirement}` : ''}`;
  });
}
function resolveMission(s: GameState, option: MissionOption, success: boolean): void {
  const run = s.rpg.mission;
  if (!run || run.ownerId !== s.playerCharacterId || s.dead) return;
  s.tab = 'life';
  s.world.feedFilter = 'all';
  const def = missionDefinition(s)!;
  const before = feedbackSnapshot(s);
  applyEffects(s, success ? option.effects : option.failure ?? { reputation: -2 });
  if (run.kind === 'caravan' && run.stage < 2) {
    const inputId = run.id;
    run.choices = [...(run.choices ?? []), option.id];
    (run.results ??= [])[run.stage] = success;
    run.failed = run.failed || !success;
    pushFeed(s, 'ON THE ROAD', '#365f88', success ? option.text : option.failureText ?? 'The road is difficult.', 'plain');
    run.previousResult = success ? option.text : option.failureText ?? 'The road is difficult.';
    run.stage += 1;
    run.definitionId = CARAVAN_JOURNEY[run.stage].id;
    // A double-tap from the preceding page cannot choose the next page.
    run.id = `${inputId.split(':')[0]}:${run.stage}`;
    return;
  }
  if (success && run.kind === 'contract' && s.inventory.includes('town_house') && (option.effects.gold ?? 0) > 0) addMoney(s, 2);
  if (run.charged !== false) grantSkillXp(s, run.skill, success && !run.failed ? 10 : 5, def.title);
  const text = success ? option.text : option.failureText ?? 'The attempt fails, but the experience stays with you.';
  pushFeed(s, def.title.toUpperCase(), success ? '#387245' : '#a34736', text, success ? 'good' : 'bad', { changes: feedbackChanges(before, s) });
  const defiesClient = run.definitionId === 'mercenary_1' && ['safe', 'allies'].includes(option.id) || run.definitionId === 'court_1' && option.id === 'skilled' || run.definitionId === 'quiet_package' && option.id === 'safe';
  if (run.clientId && s.world.characters[run.clientId]?.alive) applyRelationshipShift(s, run.clientId, {}, { affinity: success && !defiesClient ? 3 : -3, trust: success && !defiesClient ? 2 : -2 });
  applyEffects(s, { faction: { factionId: run.faction, playerStanding: defiesClient ? -4 : success ? 2 : -1 } });
  appendWorldHistory(s, { id: `rpg_history_${s.nextId++}`, year: s.world.currentYear, type: 'choice', participantIds: [s.playerCharacterId, ...(run.clientId ? [run.clientId] : [])], familyIds: [], causes: [def.title, option.label], summary: text, salience: 3 });
  if (!success && (run.faction === 'outlaws' || run.kind === 'career')) applyEffects(s, { schedule: { dueYear: s.world.currentYear + 1, scope: 'character', targetIds: [s.playerCharacterId], resolution: { type: 'effects', effects: { reputation: -1 }, targetId: s.playerCharacterId }, explanation: `Your failed undertaking, ${def.title}, is still being discussed.` } });
  if (run.kind === 'expedition' && s.rpg.expedition) {
    s.rpg.expedition.stage += 1;
    if (s.rpg.expedition.stage >= 3) s.rpg.expedition = null;
  }
  if (run.kind === 'career' && success) {
    const branch = Object.keys(CAREER_MISSIONS).find((id) => CAREER_MISSIONS[id as CareerBranch].some((d) => d.id === run.definitionId)) as CareerBranch;
    s.rpg.branches[branch].chapter = Math.max(s.rpg.branches[branch].chapter, run.stage + 1);
    s.rpg.branches[branch].assignments += 1;
    (s.rpg.branches[branch].choices ??= {})[run.stage] = option.id;
    pushFeed(s, 'SPECIALIZATION', '#387245', `${BRANCH_MILESTONES[branch][run.stage]} achieved.`, 'good');
    applyEffects(s, { schedule: { dueYear: s.world.currentYear + 1, scope: 'character', targetIds: [s.playerCharacterId], resolution: { type: 'effects', effects: { reputation: option.id === 'safe' ? 2 : 1 }, targetId: s.playerCharacterId }, explanation: `${def.title}: ${option.text}` } });
  }
  if (success && (run.kind === 'caravan' || run.kind === 'contract' && run.faction === 'guilds')) recordTradeWork(s);
  if ((run.kind === 'contract' || run.kind === 'caravan') && success) {
    const branch = careerBranchFor(s);
    const relevant = branch === 'mercenary' ? run.kind === 'contract' && run.skill === 'arms' : branch === 'caravan' ? run.kind === 'caravan' || run.faction === 'guilds' : branch === 'court' ? run.kind === 'contract' && run.skill === 'scholarship' && run.faction !== 'outlaws' : false;
    if (branch && relevant) s.rpg.branches[branch].assignments += 1;
  }
  if (run.kind === 'mastery' && success && option.id !== 'leave') {
    const player = s.world.characters[s.playerCharacterId]; player.skills ??= normalizeSkills(); player.skills[run.skill].mastered = true;
    s.tags = [...new Set([...s.tags, `master_${run.skill}`])];
  }
  if (run.kind === 'holding' && s.rpg.stewardId && s.world.characters[s.rpg.stewardId]?.alive) applyRelationshipShift(s, s.rpg.stewardId, {}, { affinity: option.id === 'share' || option.id === 'deliver' ? 4 : success ? 1 : -2 });
  s.rpg.mission = null;
  if (run.kind === 'expedition' && s.rpg.expedition?.prepaid && !s.dead && s.stats.health > 0) {
    const progress = s.rpg.expedition;
    openMission(s, EXPEDITIONS[progress.id].stages[progress.stage], 'expedition', progress.stage, run.clientId);
    s.rpg.mission!.previousResult = text;
  }
}
export function chooseMission(s: GameState, missionId: string, optionId: string): void {
  const run = s.rpg.mission, def = missionDefinition(s);
  if (!run || !def || run.id !== missionId || run.phase !== 'choice' || s.duel || s.dead) return;
  const option = def.options.find((o) => o.id === optionId);
  if (!option || optionUnavailable(s, option)) return;
  if (run.kind === 'mastery' && option.id === 'leave') { s.rpg.mission = null; return; }
  if (option.id === 'retreat' && run.kind === 'expedition') {
    grantSkillXp(s, run.skill, 5, 'returned from an unfinished expedition');
    pushFeed(s, 'EXPEDITION ENDED', '#365f88', option.text, 'plain');
    s.rpg.mission = null; s.rpg.expedition = null; return;
  }
  if (option.gold) addMoney(s, -option.gold);
  if (option.good) s.rpg.goods[option.good] -= 1;
  if (option.material) s.rpg.materials[option.material.id] -= option.material.count;
  if (option.combat) {
    const opponent = Object.values(s.world.characters).filter((p) => p.id !== s.playerCharacterId && p.id !== run.clientId && duelAvailability(s, p.id, 'brawl').available).sort((a, b) => a.rel - b.rel)[0];
    if (opponent) {
      startDuel(s, opponent.id, 'brawl');
      if (s.duel) { run.phase = 'combat'; run.selectedOptionId = option.id; return; }
    }
    resolveMission(s, option, false); return;
  }
  resolveMission(s, option, !option.check || chance(missionOdds(s, def)));
}
export function resumeMissionAfterDuel(s: GameState, won: boolean): void {
  if (s.rpg.mission?.phase !== 'combat') return;
  const option = missionDefinition(s)?.options.find((o) => o.id === s.rpg.mission?.selectedOptionId) ?? missionDefinition(s)?.options.find((o) => o.combat);
  if (option) resolveMission(s, option, won); else s.rpg.mission = null;
}
export function maybeHoldingEncounter(s: GameState, crisis: boolean | HoldingResource = false): boolean {
  if (s.dead || s.pendingEvent || s.duel || s.rpg.mission || s.age < 6) return false;
  if (!crisis && (s.rpg.lastHoldingEncounterYear != null && s.world.currentYear - s.rpg.lastHoldingEncounterYear < 3 || stableHash(s.world.worldSeed, String(s.world.currentYear), 'holding') % 4 !== 0)) return false;
  const resource = !crisis ? undefined : typeof crisis === 'string' ? crisis : (['stores', 'security', 'loyalty'] as HoldingResource[]).sort((a, b) => s.holding[a] - s.holding[b])[0];
  const crisisIds = resource === 'stores' ? ['wet_harvest', 'granary_pests'] : resource === 'security' ? ['road_raiders', 'night_alarm'] : ['boundary_petition', 'stewards_accounts'];
  const candidates = HOLDING_MISSIONS.filter((d) => d.minAge <= s.age && (!crisis || crisisIds.includes(d.id)));
  if (crisis && !candidates.length) return false;
  const pool = candidates.length ? candidates : HOLDING_MISSIONS.filter((d) => d.minAge <= s.age);
  const def = pool[stableHash(s.world.worldSeed, String(s.world.currentYear), 'holding-event') % pool.length];
  if (!def) return false;
  openMission(s, def, 'holding'); s.rpg.lastHoldingEncounterYear = s.world.currentYear; s.rpg.lastHoldingEncounterId = def.id;
  s.rpg.mission!.charged = false;
  if (resource) { s.holding.criticalYears = 0; s.holding[resource] = Math.max(20, s.holding[resource]); }
  return true;
}
export function normalizeRpg(s: GameState): void {
  const defaults = freshRpg(), saved = s.rpg;
  s.rpg = { ...defaults, ...saved, materials: { ...defaults.materials, ...saved?.materials }, goods: { ...saved?.goods }, equipment: { ...saved?.equipment }, branches: { ...defaults.branches, ...saved?.branches } };
  s.rpg.revision = Number.isSafeInteger(s.rpg.revision) && s.rpg.revision >= 0 ? s.rpg.revision : 0;
  for (const id of ['mercenary', 'caravan', 'court'] as CareerBranch[]) {
    const progress = s.rpg.branches[id];
    s.rpg.branches[id] = { ...defaults.branches[id], ...progress, chapter: Math.max(0, Math.min(3, Math.floor(Number.isFinite(progress?.chapter) ? progress.chapter : 0))), assignments: Math.max(0, Math.floor(Number.isFinite(progress?.assignments) ? progress.assignments : 0)), choices: { ...progress?.choices } };
  }
  if (!s.rpg.board || !Array.isArray(s.rpg.board.offers)) s.rpg.board = defaults.board;
  for (const id of Object.keys(s.rpg.goods)) s.rpg.goods[id] = Math.max(0, Math.floor(Number.isFinite(s.rpg.goods[id]) ? s.rpg.goods[id] : 0));
  for (const id of Object.keys(defaults.materials) as MaterialId[]) s.rpg.materials[id] = Math.max(0, Math.floor(Number.isFinite(s.rpg.materials[id]) ? s.rpg.materials[id] : 0));
  for (const c of Object.values(s.world.characters)) c.skills = normalizeSkills(c.skills);
  normalizeWorkshopState(s);
  for (const slot of ['weapon', 'armour', 'tool'] as const) { const key = s.rpg.equipment[slot]; if (key && (!ownsEquipment(s, key) || equipmentDefinition(key)?.slot !== slot)) delete s.rpg.equipment[slot]; }
  if (s.rpg.mission && (s.dead || s.rpg.mission.ownerId !== s.playerCharacterId || !missionDefinition(s))) s.rpg.mission = null;
  if (s.rpg.expedition && (s.dead || s.rpg.expedition.ownerId !== s.playerCharacterId || !EXPEDITIONS[s.rpg.expedition.id] || !Number.isInteger(s.rpg.expedition.stage) || s.rpg.expedition.stage < 0 || s.rpg.expedition.stage > 2)) s.rpg.expedition = null;
  if (s.rpg.stewardId && (s.rpg.stewardId === s.playerCharacterId || !s.world.characters[s.rpg.stewardId]?.alive || s.world.characters[s.rpg.stewardId].age < 18)) s.rpg.stewardId = null;
  refreshWorkBoard(s);
}
