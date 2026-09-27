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
import { branchRequirement, careerBranchFor, contractPreview, RpgCommand, rpgAvailability } from '@/engine/rpgEngine';
import { equipmentDefinition, qualityAtLevel, skillLevel, skillsOf } from '@/engine/rpgProgress';

function Heading({ children }: { children: React.ReactNode }) { return <PixelText font="pixel" size={9} color={C.blueDark} style={{ marginBottom: 8 }}>{children}</PixelText>; }
function Copy({ children }: { children: React.ReactNode }) { return <PixelText font="body" size={16} color={C.textBrown} style={{ marginBottom: 6 }}>{children}</PixelText>; }
function Box({ children }: { children: React.ReactNode }) { return <View style={{ backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchBorder, padding: 10, marginBottom: 10 }}>{children}</View>; }
function Action({ label, command }: { label: string; command: RpgCommand }) {
  const { state, dispatch } = useGame(); const reason = rpgAvailability(state, command);
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
  const [section, setSection] = useState<'board' | 'explore' | 'craft' | 'careers'>('board');
  return <View style={{ marginBottom: 12 }}>
    <Heading>WORK & ADVENTURE</Heading>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
      {(['board', 'explore', 'craft', 'careers'] as const).map((id) => <PixelButton key={id} bg={section === id ? C.charm : C.lightFill} shadow={C.paleEdge} onPress={() => setSection(id)} innerStyle={{ padding: 10, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>{id === 'board' ? 'CONTRACTS' : id.toUpperCase()}</PixelText></PixelButton>)}
    </View>
    {section === 'board' && <>
      <Copy>Three offers each year. One action starts a mission; every choice and fight within it is included.</Copy>
      {state.rpg.board.offers.length === 0 && <Copy>Village work opens at age 6. Age Up brings new opportunities.</Copy>}
      {state.rpg.board.offers.map((offer) => { const def = CONTRACTS.find((d) => d.id === offer.templateId); if (!def) return null;
        return <Box key={offer.id}><Heading>{def.title}</Heading><Copy>{state.world.characters[offer.clientId ?? '']?.name ?? state.world.factions[def.faction].name} · {SKILL_NAMES[def.skill]}</Copy><Copy>{def.text.replaceAll('{client}', 'Your client')}</Copy><Copy>Age {def.minAge}+ / 1 action; additional costs only for the approach you choose.</Copy>{contractPreview(state, offer).map((line, i) => <Copy key={i}>{line}</Copy>)}<Action label={offer.attempted ? 'ATTEMPTED THIS YEAR' : 'TAKE CONTRACT · 1 ACTION'} command={{ kind: 'contract', id: offer.id }} /></Box>;
      })}
    </>}
    {section === 'explore' && <>
      <Copy>Three stages, one action each. Return to the village between stages; Age Up remains available.</Copy>
      {Object.entries(EXPEDITIONS).map(([id, def]) => <Box key={id}><Heading>{def.name}</Heading><Copy>{def.stages[state.rpg.expedition?.id === id ? state.rpg.expedition.stage : 0].text}</Copy><Copy>Materials, discoveries and choices. Combat is optional; risky approaches can cause injury.</Copy><Action label={state.rpg.expedition?.id === id ? `RESUME · STAGE ${state.rpg.expedition.stage + 1}/3 · 1 ACTION` : `EXPLORE · 3 ACTIONS TOTAL · AGE ${def.minAge}+`} command={{ kind: 'expedition', id }} /></Box>)}
      {state.rpg.expedition && <Action label="ABANDON EXPEDITION · KEEP EARNED GOODS" command={{ kind: 'abandon' }} />}
      <Box><Heading>PRACTICE IN THE YARD</Heading><Copy>Learn to block, dodge and parry. Free sparring grants no XP or rewards and causes no lasting injury.</Copy><PixelButton bg={C.faith} shadow={C.faithDark} disabled={state.age < 8 || state.dead || !!state.duel || !!state.pendingEvent || !!state.rpg.mission || state.tags.includes('imprisoned')} onPress={() => dispatch({ type: 'PRACTICE_DUEL' })} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="pixel" size={8} color={C.blueDark}>SPAR · FREE · AGE 8+</PixelText></PixelButton></Box>
    </>}
    {section === 'craft' && <>
      <ForgePlayButton task={{ kind: 'practice' }} label="PRACTICE AT THE ANVIL · FREE · AGE 10+" /><Copy>Optional hammer work adds a small bonus to paid tasks, up to three attempts each year. Quick crafting keeps its normal rewards.</Copy><MaterialSummary /><Copy>Gather materials for one action, or buy them in Shop. Crafting resolves immediately and costs one action.</Copy>
      <View style={{ marginBottom: 10 }}>{(Object.keys(MATERIAL_PRICES) as MaterialId[]).map((id) => <Action key={id} label={`GATHER ${id.toUpperCase()} · 1 ACTION`} command={{ kind: 'gather', id }} />)}</View>
      {RECIPES.map((recipe) => <Box key={recipe.id}><Heading>{recipe.name}</Heading><Copy>{recipe.description}</Copy><Copy>{recipe.gold}g · {Object.entries(recipe.materials).map(([k, n]) => `${n} ${k}`).join(', ')} · Craftsmanship {recipe.level}{recipe.scholarshipLevel ? ` · Scholarship ${recipe.scholarshipLevel}` : ''}{recipe.building ? ` · ${recipe.building.replaceAll('_', ' ')}` : ''}</Copy><Copy>{recipe.equipment ? equipmentDefinition(`${recipe.equipment}:${qualityAtLevel(skillLevel(state, 'craftsmanship'))}`)?.description : recipe.description}</Copy><Copy>Output: 1 {recipe.equipment ? qualityAtLevel(skillLevel(state, 'craftsmanship')) : recipe.id === 'masterpiece' ? 'masterwork' : 'ordinary'} {recipe.name}</Copy><Action label="QUICK CRAFT · 1 ACTION" command={{ kind: 'craft', id: recipe.id }} />{(recipe.materials.iron ?? 0) > 0 && <ForgePlayButton task={{ kind: 'recipe', recipeId: recipe.id }} />}</Box>)}
    </>}
    {section === 'careers' && <>
      <Copy>Specializations extend your career without replacing its promotion ladder. Assignments and chapters earn standing.</Copy>
      {(['mercenary', 'caravan', 'court'] as CareerBranch[]).map((id) => { const progress = state.rpg.branches[id]; return <Box key={id}><Heading>{id === 'mercenary' ? 'Mercenary company' : id === 'caravan' ? 'Caravan enterprise' : 'Court service'}</Heading><Copy>{progress.chapter ? BRANCH_MILESTONES[id][progress.chapter - 1] : "Not yet specialized"}</Copy><Copy>{progress.chapter}/3 chapters · {progress.assignments} relevant assignments · {careerBranchFor(state) === id ? 'Current profession' : 'Change career to enter'}</Copy><Copy>{BRANCH_MILESTONES[id].map((title, i) => `${i + 1}. ${title}: ${[1, 3, 6][i]} ${id === "mercenary" ? "Arms" : "Scholarship"}, ${BRANCH_ASSIGNMENTS[i]} assignments${i ? ", non-negative faction standing" : ""}`).join(" / ")}</Copy><Copy>{id === "mercenary" ? "Escort and watch contracts advance this branch." : id === "caravan" ? "Caravan journeys and guild contracts advance this branch." : "Lawful scholarship contracts advance this branch."}</Copy><Copy>{branchRequirement(state, id) ?? 'The next chapter is ready. Choices change your standing and future.'}</Copy><Action label="PLAY NEXT CHAPTER · 1 ACTION" command={{ kind: 'career', id }} /></Box>; })}
      <Box><Heading>INDEPENDENT CARAVAN</Heading><Copy>Three decisions on the road for 8g and one action. Safe delivery returns 11g; bargaining can return 18g or only 6g. Route and crossing choices adjust that return; provisions unlock a dependable community buyer.</Copy><Action label="TAKE THE ROAD · 8g · 1 ACTION" command={{ kind: 'caravan' }} /></Box>
    </>}
  </View>;
}
export function SkillsEquipmentPanel() {
  const { state, dispatch } = useGame(); const skills = skillsOf(state);
  const gear = [...new Set([...state.inventory, ...Object.keys(state.rpg.goods).filter((id) => state.rpg.goods[id] > 0)])].filter((id) => equipmentDefinition(id));
  return <View style={{ padding: 11 }}>
    <Box><Heading>SKILLS THROUGH DEEDS</Heading>{SKILLS.map((id) => <View key={id} style={{ marginBottom: 12 }}><Copy>{SKILL_NAMES[id]} · level {skills[id].level}{skills[id].mastered ? ` / ${MASTERY_TITLES[id]}` : ''} · {skills[id].level < 10 ? `${skills[id].xp}/${skills[id].level * 20} XP` : 'Maximum level'}</Copy><Copy>{skills[id].level < 3 ? `Level 3: ${SKILL_MILESTONES[id][3]}` : skills[id].level < 6 ? `Level 6: ${SKILL_MILESTONES[id][6]}` : skills[id].level < 10 ? `Level 10: ${SKILL_MILESTONES[id][10]}` : skills[id].mastered ? 'Mastery commission complete' : `Complete the final commission to become ${MASTERY_TITLES[id]}`}</Copy><Action label="PRACTICAL EXERCISES · 1 ACTION · 6 XP" command={{ kind: 'train', id }} />{skills[id].level === 10 && !skills[id].mastered && <Action label="MASTERY COMMISSION · 1 ACTION" command={{ kind: 'mastery', id }} />}</View>)}</Box>
    <Box><Heading>EQUIPMENT</Heading>{(['weapon', 'armour', 'tool'] as const).map((slot) => <View key={slot}><Copy>{slot}: {equipmentDefinition(state.rpg.equipment[slot])?.name ?? 'None'}</Copy>{state.rpg.equipment[slot] && <Action label={`UNEQUIP ${slot.toUpperCase()}`} command={{ kind: 'unequip', id: slot }} />}</View>)}
      {gear.length === 0 && <Copy>Craft or buy equipment to put it to use.</Copy>}
      {gear.map((id) => <View key={id} style={{ marginTop: 10 }}><Copy>{equipmentDefinition(id)!.name}: {equipmentDefinition(id)!.description}</Copy><Action label={Object.values(state.rpg.equipment).includes(id) ? 'EQUIPPED' : 'EQUIP · FREE'} command={{ kind: 'equip', id }} /></View>)}
    </Box>
    <Box><Heading>CRAFTED GOODS</Heading>{RECIPES.filter((r) => !r.equipment && (state.rpg.goods[r.id] ?? 0) > 0).map((r) => <View key={r.id}><Copy>{r.name} × {state.rpg.goods[r.id]} · {r.description}</Copy>{r.effects && <Action label="USE ONE · FREE" command={{ kind: 'use_good', id: r.id }} />}</View>)}<MaterialSummary /></Box>
    <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => dispatch({ type: 'SET_SETTINGS', settings: { timingAssist: !state.settings.timingAssist } })} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="pixel" size={8} color={C.blueDark}>TIMING ASSIST: {state.settings.timingAssist ? 'ON' : 'OFF'}</PixelText><Copy>Good timing automatically; tactics and rewards stay the same. Applies to your next duel or forge attempt.</Copy></PixelButton>
  </View>;
}
export function HoldingExpansionPanel() {
  const { state } = useGame(); const [peopleOpen, setPeopleOpen] = useState(false);
  const candidates = Object.values(state.world.characters).filter((p) => p.alive && p.age >= 18 && p.id !== state.playerCharacterId && p.id !== 'goose').sort((a, b) => b.stats.wits - a.stats.wits).slice(0, 8);
  return <View style={{ marginTop: 10 }}><Box><Heading>BUILD THE HOMESTEAD</Heading><MaterialSummary /><Copy>Property benefits: Cottage adds 2 Health when resting; Town House adds 2g to successful paid contracts; Manor adds 2 Stores at annual upkeep.</Copy>{RPG_BUILDINGS.map((b) => <View key={b.id} style={{ marginBottom: 8 }}><Copy>{b.name} · {b.gold}g · {Object.entries(b.materials).map(([k, n]) => `${n} ${k}`).join(', ')}</Copy><Copy>{b.description}</Copy><Action label="BUILD · 1 ACTION" command={{ kind: 'build', id: b.id }} /></View>)}</Box>
    <Box><Heading>VILLAGE AFFAIRS</Heading><Copy>Choose one estate order each year. These decisions share the existing management allowance.</Copy>{[HOLDING_MISSIONS[0], HOLDING_MISSIONS[4], HOLDING_MISSIONS[8]].map((d) => <Action key={d.id} label={`${d.title.toUpperCase()} · 1 ACTION`} command={{ kind: 'holding', id: d.id }} />)}</Box>
    <Box><Heading>THY STEWARD</Heading><Copy>{state.world.characters[state.rpg.stewardId ?? '']?.alive ? `${state.world.characters[state.rpg.stewardId!].name} · Wits ${state.world.characters[state.rpg.stewardId!].stats.wits} · relationship ${state.world.characters[state.rpg.stewardId!].rel}` : 'No steward appointed'}</Copy><Copy>A capable steward improves estate checks. Generosity builds their loyalty; failed orders strain it.</Copy><PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => setPeopleOpen(!peopleOpen)} innerStyle={{ padding: 10, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>{peopleOpen ? 'HIDE CANDIDATES' : 'CHOOSE A STEWARD'}</PixelText></PixelButton>{peopleOpen && candidates.map((p) => <Action key={p.id} label={`${p.name} · WITS ${p.stats.wits} · 1 ACTION`} command={{ kind: 'steward', id: p.id }} />)}</Box>
  </View>;
}
export function MaterialsShopPanel() {
  const [open, setOpen] = useState(false);
  return <Box><Heading>RAW MATERIALS</Heading><MaterialSummary /><PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => setOpen(!open)} innerStyle={{ padding: 10, minHeight: 44 }}><PixelText font="pixel" size={7} color={C.blueDark}>{open ? 'CLOSE MATERIAL STALL' : 'BROWSE MATERIALS'}</PixelText></PixelButton>{open && (Object.keys(MATERIAL_PRICES) as MaterialId[]).map((id) => <Action key={id} label={`BUY 1 ${id.toUpperCase()} · ${MATERIAL_PRICES[id]}g · 1 ACTION`} command={{ kind: 'buy_material', id }} />)}</Box>;
}
