import { RpgIcon } from './RpgIcon';
import { CraftedItemActions } from './CraftedItemActions';
import { recipePurpose, recipeContracts } from '@/engine/craftingGuide';
import { ForgePlayButton } from './Workshop';
import React, { useState } from 'react';
import { View } from 'react-native';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';
import { useGame } from '@/state/GameContext';
import { CONTRACTS, EXPEDITIONS, HOLDING_MISSIONS } from '@/content/rpgMissions';
import { BRANCH_ASSIGNMENTS, BRANCH_MILESTONES, MASTERY_TITLES, MATERIAL_PRICES, RECIPES, RPG_BUILDINGS, SKILL_NAMES, SKILL_MILESTONES } from '@/data/rpg';
import { CareerBranch, MaterialId, SKILLS } from '@/types/rpg';
import { branchRequirement, careerBranchFor, gatheringQuote, RpgCommand, rpgAvailability } from '@/engine/rpgEngine';
import { equipmentDefinition, qualityAtLevel, skillLevel, skillsOf } from '@/engine/rpgProgress';
import { armsPracticeAvailability } from '@/engine/duelEngine';
import { ProUnlockButton } from './ProUnlockButton';

function Heading({ children, icon = "board" }: { children: React.ReactNode; icon?: string | null }) { return <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>{icon && <RpgIcon name={icon} />}<PixelText font="pixel" size={9} color={C.blueDark} style={{ flex: 1 }}>{children}</PixelText></View>; }
function Copy({ children }: { children: React.ReactNode }) { return <PixelText font="body" size={16} color={C.textBrown} style={{ marginBottom: 6 }}>{children}</PixelText>; }
function Box({ children }: { children: React.ReactNode }) { return <View style={{ backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchBorder, padding: 10, marginBottom: 10 }}>{children}</View>; }
function Action({ label, command }: { label: string; command: RpgCommand }) {
  const { state, dispatch } = useGame(); const reason = rpgAvailability(state, command);
  if (reason === 'Requires Pro') return <ProUnlockButton feature="ADVANCED CRAFTING" />;
  return <PixelButton bg={C.lightFill} shadow={C.paleEdge} disabled={!!reason} onPress={() => dispatch({ type: 'RPG', command, revision: state.rpg.revision })} style={{ marginTop: 6 }} innerStyle={{ padding: 10, minHeight: 44 }}>
    <PixelText font="pixel" size={7} color={reason ? C.textMuted : C.blueDark}>{label}</PixelText>
    {reason && <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 4 }}>{reason}</PixelText>}
  </PixelButton>;
}
function MaterialSummary() {
  const { state } = useGame();
  return <Copy>{Object.entries(state.rpg.materials).map(([id, count]) => `${id}: ${count}`).join(' · ')}</Copy>;
}
export function RpgHub() {
  const { state, dispatch } = useGame();
  const section = state.questSection ?? 'board';
  const [gatherOpen, setGatherOpen] = useState(false);
  const recipes = [...RECIPES].sort((a,b) => Number(b.id === state.questRecipe) - Number(a.id === state.questRecipe));
  const setSection = (section: NonNullable<typeof state.questSection>) => dispatch({ type: 'SET_QUEST_SECTION', section });
  return <View style={{ marginBottom: 12 }}>
    <Heading icon={null}>QUESTS</Heading>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
      {(['board', 'explore', 'craft', 'careers'] as const).map((id) => <PixelButton key={id} bg={section === id ? C.charm : C.lightFill} shadow={C.paleEdge} onPress={() => setSection(id)} innerStyle={{ padding: 10, minHeight: 44, justifyContent: 'center' }}><PixelText font="pixel" size={7} color={C.blueDark}>{id === 'board' ? 'CONTRACTS' : id.toUpperCase()}</PixelText></PixelButton>)}
    </View>
    {section === 'board' && <>
      {state.rpg.board.offers.length === 0 && <Copy>Village work opens at age 6. Age Up brings new opportunities.</Copy>}
      {state.rpg.board.offers.map((offer) => { const def = CONTRACTS.find((d) => d.id === offer.templateId); if (!def) return null;
        return <Box key={offer.id}><Heading icon={def.id}>{def.title}</Heading><Copy>{state.world.characters[offer.clientId ?? '']?.name ?? state.world.factions[def.faction].name} · {SKILL_NAMES[def.skill]}</Copy><Copy>{def.text.replaceAll('{client}', 'Your client')}</Copy>{!offer.attempted && def.options.filter(option => option.good).map(option => { const recipe = RECIPES.find(r => r.id === option.good); return recipe ? <View key={option.id}><Copy>{recipe.name}: {state.rpg.goods[recipe.id] ?? 0} owned · delivering one unlocks a guaranteed approach.</Copy><PixelButton bg={C.charm} shadow={C.charmDark} onPress={() => dispatch({ type: 'SET_QUEST_SECTION', section: 'craft', recipeId: recipe.id })} innerStyle={{ padding: 10, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>PREPARE {recipe.name.toUpperCase()}</PixelText></PixelButton></View> : null; })}<Action label={offer.attempted ? 'ATTEMPTED THIS YEAR' : 'TAKE CONTRACT'} command={{ kind: 'contract', id: offer.id }} /></Box>;
      })}
    </>}
    {section === 'explore' && <>
      {Object.entries(EXPEDITIONS).map(([id, def]) => <Box key={id}><Heading icon={id}>{def.name}</Heading><Copy>{def.stages[state.rpg.expedition?.id === id ? state.rpg.expedition.stage : 0].text}</Copy><Action label={state.rpg.expedition?.id === id ? 'RESUME JOURNEY' : 'EXPLORE'} command={{ kind: 'expedition', id }} /></Box>)}
      {state.rpg.expedition && <Action label="ABANDON EXPEDITION · KEEP EARNED GOODS" command={{ kind: 'abandon' }} />}
    </>}
    {section === 'craft' && <>
      <MaterialSummary />
      <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => setGatherOpen(!gatherOpen)} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>{gatherOpen ? 'HIDE GATHERING' : 'GATHER MATERIALS'}</PixelText></PixelButton>
      {gatherOpen && <View style={{ marginBottom: 10 }}>{(Object.keys(MATERIAL_PRICES) as MaterialId[]).map((id) => { const quote = gatheringQuote(state, id); return <Action key={id} label={`GATHER ${quote.amount} ${id.toUpperCase()} · ${quote.gold}g · 1 ACTION`} command={{ kind: 'gather', id }} />; })}</View>}
      {recipes.map((recipe) => <Box key={recipe.id}><Heading icon={recipe.equipment ? equipmentDefinition(recipe.equipment)?.slot : "goods"}>{recipe.name}</Heading><Copy>{recipePurpose(state, recipe)}</Copy><Copy>{recipe.gold}g · {Object.entries(recipe.materials).map(([k, n]) => `${n} ${k}`).join(', ')} · Craftsmanship {recipe.level}{recipe.scholarshipLevel ? ` · Scholarship ${recipe.scholarshipLevel}` : ''}{recipe.building ? ` · ${recipe.building.replaceAll('_', ' ')}` : ''}</Copy><Copy>Output: 1 {recipe.equipment ? qualityAtLevel(skillLevel(state, 'craftsmanship')) : recipe.id === 'masterpiece' ? 'masterwork' : 'ordinary'} {recipe.name}</Copy>{recipeContracts(state, recipe).map(match => <View key={match.offer.id}><Copy>Useful now: {match.title}. {match.purpose}</Copy><Action label="TAKE THIS CONTRACT · 1 ACTION" command={{ kind: 'contract', id: match.offer.id }} /></View>)}<Action label="QUICK CRAFT · 1 ACTION" command={{ kind: 'craft', id: recipe.id }} />{(recipe.materials.iron ?? 0) > 0 && <ForgePlayButton task={{ kind: 'recipe', recipeId: recipe.id }} />}{state.rpg.lastCrafted?.recipeId === recipe.id && <CraftedItemActions itemKey={state.rpg.lastCrafted.key} recipeId={recipe.id} />}</Box>)}
    </>}
    {section === 'careers' && <>
      <Copy>Specializations extend your career without replacing its promotion ladder. Assignments and chapters earn standing.</Copy>
      {(['mercenary', 'caravan', 'court'] as CareerBranch[]).map((id) => { const progress = state.rpg.branches[id]; return <Box key={id}><Heading icon={id}>{id === 'mercenary' ? 'Mercenary company' : id === 'caravan' ? 'Caravan enterprise' : 'Court service'}</Heading><Copy>{progress.chapter ? BRANCH_MILESTONES[id][progress.chapter - 1] : "Not yet specialized"}</Copy><Copy>{progress.chapter}/3 chapters · {progress.assignments} relevant assignments · {careerBranchFor(state) === id ? 'Current profession' : 'Change career to enter'}</Copy><Copy>{BRANCH_MILESTONES[id].map((title, i) => `${i + 1}. ${title}: ${[1, 3, 6][i]} ${id === "mercenary" ? "Arms" : "Scholarship"}, ${BRANCH_ASSIGNMENTS[i]} assignments${i ? ", non-negative faction standing" : ""}`).join(" / ")}</Copy><Copy>{id === "mercenary" ? "Escort and watch contracts advance this branch." : id === "caravan" ? "Caravan journeys and guild contracts advance this branch." : "Lawful scholarship contracts advance this branch."}</Copy><Copy>{branchRequirement(state, id) ?? 'The next chapter is ready. Choices change your standing and future.'}</Copy><Action label="PLAY NEXT CHAPTER · 1 ACTION" command={{ kind: 'career', id }} /></Box>; })}
      <Box><Heading icon="caravan">INDEPENDENT CARAVAN</Heading><Copy>Safe delivery returns 11g. Bargaining risks a 6g return for a chance at 18g. Provisions unlock a dependable community buyer.</Copy><Action label="TAKE THE ROAD · 8g · 1 ACTION" command={{ kind: 'caravan' }} /></Box>
    </>}
  </View>;
}
export function TrainingPanel() {
  const { state, dispatch } = useGame(); const skills = skillsOf(state);
  const father = state.kin.find(p => p.kind === 'father' && p.alive);
  const armsReason = armsPracticeAvailability(state);
  const practiceSkills = ['craftsmanship', ...SKILLS.filter(id => id !== 'craftsmanship')] as const;
  return <View>
    <Box><Heading icon="arms">PRACTICE IN THE YARD</Heading><Copy>Learn to block, dodge and parry against a sparring partner. Sparring costs no actions, grants no XP and causes no lasting injury.</Copy><PixelButton bg={C.faith} shadow={C.faithDark} disabled={state.age < 8 || state.dead || !!state.duel || !!state.pendingEvent || !!state.rpg.mission || !!state.rpg.forge || state.tags.includes('imprisoned')} onPress={() => dispatch({ type: 'PRACTICE_DUEL' })} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="pixel" size={8} color={C.blueDark}>SPAR · NO ACTION COST · AGE 8+</PixelText></PixelButton></Box>
    {practiceSkills.map((id) => <Box key={id}>
      <Heading icon={id}>{SKILL_NAMES[id]}</Heading>
      <Copy>Level {skills[id].level}{skills[id].mastered ? ' / ' + MASTERY_TITLES[id] : ''} · {skills[id].level < 10 ? skills[id].xp + '/' + skills[id].level * 20 + ' XP' : 'Maximum level'}</Copy>
      {id === 'craftsmanship' && <Copy>{skills.craftsmanship.level < 3 ? `${father ? father.name + ' takes you to the village forge. The smith' : 'The village smith'} shows you how to straighten a hinge without flattening your thumb.` : 'Practise shaping iron at the anvil. Five timed blows build your Craftsmanship.'}</Copy>}
      {id === 'arms' && <Copy>Five timed sword swings on your own. Practise quick cuts, heavy swings and feints to build Arms.</Copy>}
      <Copy>{skills[id].level < 3 ? 'Level 3: ' + SKILL_MILESTONES[id][3] : skills[id].level < 6 ? 'Level 6: ' + SKILL_MILESTONES[id][6] : skills[id].level < 10 ? 'Level 10: ' + SKILL_MILESTONES[id][10] : skills[id].mastered ? 'Mastery commission complete' : 'Complete the final commission to become ' + MASTERY_TITLES[id]}</Copy>
      {id === 'craftsmanship' ? <ForgePlayButton task={{ kind: 'practice' }} label="ANVIL PRACTICE · 1 ACTION · 6 XP" /> : id === 'arms' ? <PixelButton bg={C.charm} shadow={C.charmDark} disabled={!!armsReason} onPress={() => dispatch({ type: 'ARMS_PRACTICE_START', revision: state.rpg.revision })} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>SOLO SWORD PRACTICE · 1 ACTION · 6 XP</PixelText>{armsReason && <Copy>{armsReason}</Copy>}</PixelButton> : <Action label="PRACTICAL EXERCISES · 1 ACTION · 6 XP" command={{ kind: 'train', id }} />}
      {skills[id].level === 10 && !skills[id].mastered && <Action label="MASTERY COMMISSION · 1 ACTION" command={{ kind: 'mastery', id }} />}
    </Box>)}
  </View>;
}

export function SkillsEquipmentPanel() {
  const { state } = useGame();
  const gear = [...new Set([...state.inventory, ...Object.keys(state.rpg.goods).filter((id) => state.rpg.goods[id] > 0)])].filter((id) => equipmentDefinition(id));
  return <View style={{ padding: 11 }}>
    <Box><Heading icon="armour">EQUIPMENT</Heading>{(['weapon', 'armour', 'tool'] as const).map((slot) => <View key={slot}><Heading icon={slot}>{slot.toUpperCase()}</Heading><Copy> {equipmentDefinition(state.rpg.equipment[slot])?.name ?? 'None'}</Copy>{state.rpg.equipment[slot] && <Action label={`UNEQUIP ${slot.toUpperCase()}`} command={{ kind: 'unequip', id: slot }} />}</View>)}
      {gear.length === 0 && <Copy>Craft or buy equipment to put it to use.</Copy>}
      {gear.map((id) => <View key={id} style={{ marginTop: 10 }}><Copy>{equipmentDefinition(id)!.name}: {equipmentDefinition(id)!.description}</Copy><Action label={Object.values(state.rpg.equipment).includes(id) ? 'EQUIPPED' : 'EQUIP · FREE'} command={{ kind: 'equip', id }} /></View>)}
    </Box>
    <Box><Heading icon="goods">CRAFTED GOODS</Heading>{RECIPES.filter((r) => !r.equipment && (state.rpg.goods[r.id] ?? 0) > 0).map((r) => <View key={r.id}><Copy>{r.name} × {state.rpg.goods[r.id]} · {r.description}</Copy>{r.effects && <Action label="USE ONE · FREE" command={{ kind: 'use_good', id: r.id }} />}</View>)}<MaterialSummary /></Box>
  </View>;
}
export function HoldingExpansionPanel() {
  const { state } = useGame(); const [peopleOpen, setPeopleOpen] = useState(false);
  const candidates = Object.values(state.world.characters).filter((p) => p.alive && p.age >= 18 && p.id !== state.playerCharacterId && p.id !== 'goose').sort((a, b) => b.stats.wits - a.stats.wits).slice(0, 8);
  return <View style={{ marginTop: 10 }}><Box><Heading icon="holding">BUILD THE HOMESTEAD</Heading><MaterialSummary /><Copy>Property benefits: Cottage adds 2 Health when resting; Town House adds 2g to successful paid contracts; Manor adds 2 Stores at annual upkeep.</Copy>{RPG_BUILDINGS.map((b) => <View key={b.id} style={{ marginBottom: 8 }}><Copy>{b.name} · {b.gold}g · {Object.entries(b.materials).map(([k, n]) => `${n} ${k}`).join(', ')}</Copy><Copy>{b.description}</Copy><Action label="BUILD · 1 ACTION" command={{ kind: 'build', id: b.id }} /></View>)}</Box>
    <Box><Heading>VILLAGE AFFAIRS</Heading><Copy>Choose one estate order each year. These decisions share the existing management allowance.</Copy>{[HOLDING_MISSIONS[0], HOLDING_MISSIONS[4], HOLDING_MISSIONS[8]].map((d) => <Action key={d.id} label={`${d.title.toUpperCase()} · 1 ACTION`} command={{ kind: 'holding', id: d.id }} />)}</Box>
    <Box><Heading icon="people">THY STEWARD</Heading><Copy>{state.world.characters[state.rpg.stewardId ?? '']?.alive ? `${state.world.characters[state.rpg.stewardId!].name} · Wits ${state.world.characters[state.rpg.stewardId!].stats.wits} · relationship ${state.world.characters[state.rpg.stewardId!].rel}` : 'No steward appointed'}</Copy><Copy>A capable steward improves estate checks. Generosity builds their loyalty; failed orders strain it.</Copy><PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => setPeopleOpen(!peopleOpen)} innerStyle={{ padding: 10, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>{peopleOpen ? 'HIDE CANDIDATES' : 'CHOOSE A STEWARD'}</PixelText></PixelButton>{peopleOpen && candidates.map((p) => <Action key={p.id} label={`${p.name} · WITS ${p.stats.wits} · 1 ACTION`} command={{ kind: 'steward', id: p.id }} />)}</Box>
  </View>;
}
export function MaterialsShopPanel() {
  const [open, setOpen] = useState(false);
  return <Box><Heading icon="goods">RAW MATERIALS</Heading><MaterialSummary /><PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => setOpen(!open)} innerStyle={{ padding: 10, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>{open ? 'CLOSE MATERIAL STALL' : 'BROWSE MATERIALS'}</PixelText></PixelButton>{open && (Object.keys(MATERIAL_PRICES) as MaterialId[]).map((id) => <Action key={id} label={`BUY 1 ${id.toUpperCase()} · ${MATERIAL_PRICES[id]}g · 1 ACTION`} command={{ kind: 'buy_material', id }} />)}</Box>;
}
