import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { GameState, WorldConditionKey } from '@/types/game';
import { PixelText } from './ui/PixelText';
import { PixelButton } from './ui/PixelButton';
import { C, PANEL } from '@/theme/theme';
import { strongestConditionReasons } from '@/engine/worldSimulation';
import { STORY_TEMPLATE_BY_ID } from '@/content/persistentStories';

const ITEMS: Array<[WorldConditionKey, string]> = [
  ['foodSecurity', 'FOOD'], ['prosperity', 'WEALTH'], ['publicOrder', 'ORDER'],
  ['warThreat', 'WAR'], ['diseasePressure', 'PLAGUE'], ['religiousTension', 'TENSION'],
];

export function WorldStatusPanel({ state, saveCompatibilityBlocked = false }: { state: GameState; saveCompatibilityBlocked?: boolean }) {
  const [open, setOpen] = React.useState<'world' | 'journal' | null>(null);
  const mostExtreme = [...ITEMS].sort(([a], [b]) => Math.abs(state.world.conditions[b] - 50) - Math.abs(state.world.conditions[a] - 50))[0][0];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Open detailed world status" onPress={() => setOpen('world')} style={{ backgroundColor: C.blueDeep, paddingHorizontal: 9, paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: C.blue }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
        {ITEMS.map(([key, label]) => {
          const value = state.world.conditions[key];
          const danger = key === 'foodSecurity' || key === 'prosperity' || key === 'publicOrder' ? value < 35 : value > 65;
          return <View key={key} style={{ alignItems: 'center', flex: 1 }}>
            <PixelText font="pixel" size={5} color="#9fc4e8">{label}</PixelText>
            <PixelText font="pixel" size={6} color={danger ? C.health : C.faith}>{value}</PixelText>
          </View>;
        })}
      </View>
      <PixelText font="body" size={12} color="#bcd2eb" style={{ textAlign: 'center', marginTop: 3 }}>
        {state.world.currentYear} · {strongestConditionReasons(state, mostExtreme).join(', ')}
      </PixelText>
      {state.world.recoveryNotice && <PixelText font="body" size={12} color={C.charm} style={{ textAlign: 'center' }}>Some unfinished tales were safely concluded after an update.</PixelText>}
      {saveCompatibilityBlocked && <PixelText font="body" size={12} color={C.health} style={{ textAlign: 'center' }}>This device has a save from a newer game version. It remains untouched; saving is disabled until the game is updated.</PixelText>}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 3 }}>
        <PixelText font="pixel" size={5} color={C.white}>TAP FOR WORLD DETAILS</PixelText>
        <Pressable accessibilityRole="button" accessibilityLabel="Open story journal" onPress={(event) => { event.stopPropagation(); setOpen('journal'); }}>
          <PixelText font="pixel" size={5} color={C.charm}>STORY JOURNAL</PixelText>
        </Pressable>
      </View>
      <Modal visible={open != null} transparent animationType={state.settings.reducedMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(13,27,46,0.82)', justifyContent: 'center', padding: 16 }}>
          <View style={{ ...PANEL.parchModal, maxHeight: '88%' }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <PixelButton bg={open === 'world' ? C.faith : C.light} shadow={open === 'world' ? C.faithDark : C.blue} onPress={() => setOpen('world')} style={{ flex: 1 }} innerStyle={{ padding: 7 }}><PixelText font="pixel" size={6} color={C.blueDark}>WORLD STATUS</PixelText></PixelButton>
              <PixelButton bg={open === 'journal' ? C.charm : C.light} shadow={open === 'journal' ? C.charmDark : C.blue} onPress={() => setOpen('journal')} style={{ flex: 1 }} innerStyle={{ padding: 7 }}><PixelText font="pixel" size={6} color={C.blueDark}>STORY JOURNAL</PixelText></PixelButton>
            </View>
            <ScrollView style={{ marginTop: 10 }} contentContainerStyle={{ gap: 9, paddingBottom: 8 }}>
              {open === 'world' ? <WorldDetails state={state} /> : <StoryJournal state={state} />}
            </ScrollView>
            <PixelButton bg={C.blue} shadow={C.blueDeep} onPress={() => setOpen(null)} innerStyle={{ padding: 8 }}><PixelText font="pixel" size={7} color={C.white}>CLOSE</PixelText></PixelButton>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
}

function WorldDetails({ state }: { state: GameState }) {
  const crises = ITEMS.filter(([key]) => ['foodSecurity', 'prosperity', 'publicOrder'].includes(key) ? state.world.conditions[key] < 35 : state.world.conditions[key] > 65);
  return <>
    <PixelText font="pixel" size={8} color={C.blueDeep}>SWINEFORD · {state.world.currentYear}</PixelText>
    {ITEMS.map(([key, label]) => <View key={key} style={PANEL.parchCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><PixelText font="pixel" size={6} color={C.amber}>{label}</PixelText><PixelText font="pixel" size={7} color={C.blueDeep}>{state.world.conditions[key]}</PixelText></View>
      <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 3 }}>Causes: {strongestConditionReasons(state, key).join(', ') || 'ordinary yearly drift'}</PixelText>
    </View>)}
    <PixelText font="pixel" size={7} color={C.blueDeep}>CURRENT CRISES</PixelText>
    <PixelText font="body" size={15} color={crises.length ? C.bad : C.good}>{crises.length ? crises.map(([, label]) => label.toLowerCase()).join(', ') : 'No condition has crossed a crisis threshold.'}</PixelText>
    <PixelText font="pixel" size={7} color={C.blueDeep}>FACTIONS</PixelText>
    {Object.values(state.world.factions).map((faction) => <PixelText key={faction.id} font="body" size={14} color={C.textDark}>{faction.name}: influence {faction.influence} · standing {faction.playerStanding} · {faction.activePressure ?? 'no declared pressure'}</PixelText>)}
    <PixelText font="pixel" size={7} color={C.blueDeep}>HOUSEHOLDS</PixelText>
    {state.world.households.slice(0, 15).map((household) => <PixelText key={household.id} font="body" size={14} color={C.textDark}>{household.id.replaceAll('_', ' ')}: {household.memberIds.length}/{household.capacity ?? 6} people · food {household.storedFood ?? household.foodSecurity ?? 50} · quality {household.residenceQuality ?? 50}</PixelText>)}
  </>;
}

function StoryJournal({ state }: { state: GameState }) {
  const active = state.world.activeStories.filter((story) => ['active', 'paused'].includes(story.status));
  const complete = state.world.activeStories.filter((story) => ['completed', 'failed', 'cancelled'].includes(story.status));
  return <>
    <PixelText font="pixel" size={8} color={C.purpleDark}>ACTIVE CHAPTERS</PixelText>
    {!active.length && <PixelText font="body" size={15} color={C.textMuted}>No persistent tale is active this year.</PixelText>}
    {active.map((story) => {
      const template = STORY_TEMPLATE_BY_ID[story.templateId];
      const actors = Object.entries(story.bindings).map(([role, id]) => `${role}: ${state.world.characters[id]?.name ?? 'missing'}`).join(' · ');
      const decisions = Object.entries(story.variables).filter(([key]) => key !== 'lastChoice').map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
      return <View key={story.id} style={PANEL.parchCard}>
        <PixelText font="pixel" size={6} color={C.amber}>{story.templateId.replaceAll('_', ' ').toUpperCase()}</PixelText>
        <PixelText font="body" size={15} color={C.textDark}>Chapter {story.currentBeatId.replaceAll('_', ' ')} · {story.status}</PixelText>
        <PixelText font="body" size={13} color={C.textMuted}>Actors: {actors || 'none'}</PixelText>
        {!!decisions && <PixelText font="body" size={13} color={C.textMuted}>Past decisions: {decisions}</PixelText>}
        <PixelText font="body" size={13} color={C.textMuted}>Why active: {template ? `eligible since ${story.startedYear}; next chapter from ${story.nextEligibleYear}` : 'recovering older content'}</PixelText>
      </View>;
    })}
    <PixelText font="pixel" size={7} color={C.blueDeep}>KNOWN DELAYED CONSEQUENCES</PixelText>
    {!state.world.scheduledConsequences.length && <PixelText font="body" size={14} color={C.textMuted}>None currently known.</PixelText>}
    {state.world.scheduledConsequences.slice(0, 12).map((item) => <PixelText key={item.id} font="body" size={14} color={C.textDark}>{item.dueYear}: {item.explanation}</PixelText>)}
    <PixelText font="pixel" size={7} color={C.blueDeep}>COMPLETED TALES</PixelText>
    {!complete.length && <PixelText font="body" size={14} color={C.textMuted}>No persistent tale has reached its ending.</PixelText>}
    {complete.slice(-12).reverse().map((story) => <PixelText key={story.id} font="body" size={14} color={C.textDark}>{story.templateId.replaceAll('_', ' ')} · {story.status} · began {story.startedYear}</PixelText>)}
  </>;
}
