import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { GameState, KinMember, RelationFilter } from '@/types/game';
import { KinAction } from '@/engine/kinEngine';
import { contextualActions, perspectives, relationshipWith } from '@/engine/relationshipEngine';
import { careerById } from '@/data/careers';
import { relColor, relLabel } from '@/state/viewModel';
import { C, PANEL } from '@/theme/theme';
import { kinIconAsset } from '@/assets/generatedAssets';

interface Props {
  state: GameState;
  kin: KinMember[];
  detail: KinMember | null;
  filter: RelationFilter;
  onFilter: (filter: RelationFilter) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
  onInteract: (id: string, action: KinAction) => void;
}

const FILTERS: { id: RelationFilter; label: string }[] = [
  { id: 'all', label: 'ALL' }, { id: 'family', label: 'FAMILY' }, { id: 'romance', label: 'LOVE' },
  { id: 'friends', label: 'FRIENDS' }, { id: 'acquaintances', label: 'KNOWN' }, { id: 'rivals', label: 'RIVALS' },
  { id: 'authority', label: 'LORDS' }, { id: 'deceased', label: 'DEAD' },
];

const ACTION_META: Record<KinAction, { label: string; hint: string; bg: string; sd: string }> = {
  time: { label: 'SPEND TIME', hint: 'affinity + trust', bg: C.faith, sd: C.faithDark },
  praise: { label: 'PRAISE', hint: 'respect + affinity', bg: C.light, sd: C.blue },
  help: { label: 'OFFER HELP', hint: 'strong trust gain', bg: C.teal, sd: C.tealDark },
  confide: { label: 'CONFIDE', hint: 'share a secret · trust', bg: C.teal, sd: C.tealDark },
  forgive: { label: 'FORGIVE', hint: 'release an old hurt', bg: C.faith, sd: C.faithDark },
  educate_child: { label: 'TEACH CHILD', hint: 'shape learning + ambition', bg: C.light, sd: C.blue },
  arrange_marriage: { label: 'ARRANGE MATCH', hint: 'join two households', bg: C.charm, sd: C.charmDark },
  care_for_relative: { label: 'GIVE CARE', hint: 'health + lasting trust', bg: C.faith, sd: C.faithDark },
  expose_secret: { label: 'EXPOSE SECRET', hint: 'truth with consequences', bg: C.health, sd: C.healthDark },
  gift: { label: 'GIVE GIFT', hint: '5g · affinity', bg: C.charm, sd: C.charmDark },
  favour: { label: 'ASK FAVOUR', hint: 'borrow coin', bg: C.teal, sd: C.tealDark },
  apologize: { label: 'APOLOGIZE', hint: 'repair trust', bg: C.light, sd: C.blue },
  insult: { label: 'INSULT', hint: 'may start a rivalry', bg: C.health, sd: C.healthDark },
  plot: { label: 'SCHEME', hint: 'begin a feud', bg: C.purple, sd: C.purpleDark },
  reconcile: { label: 'MAKE PEACE', hint: 'end rivalry', bg: C.faith, sd: C.faithDark },
  flirt: { label: 'FLIRT', hint: 'test attraction', bg: C.health, sd: C.healthDark },
  court: { label: 'COURT', hint: 'build mutual love', bg: C.charm, sd: C.charmDark },
  propose: { label: 'PROPOSE', hint: 'trust + attraction', bg: C.purple, sd: C.purpleDark },
  accept_proposal: { label: 'ACCEPT PROPOSAL', hint: 'marry by choice', bg: C.faith, sd: C.faithDark },
  reject_proposal: { label: 'REFUSE PROPOSAL', hint: 'remain unmarried', bg: C.health, sd: C.healthDark },
  divorce: { label: 'SEEK DIVORCE', hint: 'end marriage', bg: C.health, sd: C.healthDark },
};

export function KinTab({ state, kin, detail, filter, onFilter, onOpen, onBack, onInteract }: Props) {
  const [treeOpen, setTreeOpen] = React.useState(false);
  if (detail) {
    const relation = relationshipWith(state, detail.id);
    const views = perspectives(state, relation);
    const career = careerById(detail.occupation.careerId);
    const actions = contextualActions(state, detail);
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.sky }} contentContainerStyle={{ padding: 11, paddingBottom: 16, gap: 9 }}>
        <PixelButton bg={C.blue} shadow={C.blueDeep} onPress={onBack} style={{ alignSelf: 'flex-start' }} innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={7} color={C.white}>◂ BACK</PixelText>
        </PixelButton>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0f274a', borderWidth: 4, borderColor: detail.alive ? C.charm : C.textMuted, padding: 10 }}>
          <View style={{ width: 56, height: 56, backgroundColor: C.sky, borderWidth: 3, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center', opacity: detail.alive ? 1 : 0.55 }}>
            <KinIcon kin={detail} size={50} fallbackSize={30} />
          </View>
          <View style={{ flex: 1 }}>
            <PixelText font="pixel" size={9} color={detail.alive ? C.charm : C.creamBlue}>{detail.name}</PixelText>
            <PixelText font="body" size={15} color="#dbe9ff">{detail.role} · {detail.age} winters</PixelText>
            <PixelText font="body" size={14} color="#a9c2df">{detail.pronouns.subject}/{detail.pronouns.object} · {career?.title ?? 'No occupation'} · {detail.gold}g</PixelText>
            {!detail.alive && <PixelText font="pixel" size={7} color={C.health}>DECEASED</PixelText>}
          </View>
        </View>
        <View style={PANEL.parchCard}>
          <PixelText font="pixel" size={6} color={C.amber}>MUTUAL RELATIONSHIP</PixelText>
          <Dimension label="YOUR AFFINITY" value={views.player.affinity} />
          <Dimension label="THEIR AFFINITY" value={views.other.affinity} />
          <Dimension label="TRUST" value={Math.round((views.player.trust + views.other.trust) / 2)} />
          <Dimension label="RESPECT" value={Math.round((views.player.respect + views.other.respect) / 2)} />
          {(views.player.attraction > 0 || views.other.attraction > 0) && <Dimension label="ATTRACTION" value={Math.round((views.player.attraction + views.other.attraction) / 2)} />}
        </View>
        <View style={PANEL.parchCard}>
          <PixelText font="pixel" size={6} color={C.amber}>TRAIT — {detail.trait}</PixelText>
          <PixelText font="body" size={16} color={C.textBrown} style={{ marginTop: 5 }}>{detail.bio}</PixelText>
          {!!detail.personalityTraits?.length && <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 5 }}>Nature: {detail.personalityTraits.join(', ')}</PixelText>}
          {detail.ambition && <PixelText font="body" size={14} color={C.textMuted}>Ambition: {detail.ambition.replaceAll('_', ' ')}</PixelText>}
          <PixelText font="body" size={14} color={C.textMuted}>Health: {detail.healthConditions?.length ? detail.healthConditions.map((condition) => `${condition.conditionId.replaceAll('_', ' ')} (${condition.severity})`).join(', ') : 'No known condition'}</PixelText>
          <PixelText font="body" size={14} color={C.textMuted}>Legal: {detail.legalState?.status?.replaceAll('_', ' ') ?? 'free'}{detail.legalState?.charges.some((charge) => !charge.resolved) ? ` · ${detail.legalState.charges.filter((charge) => !charge.resolved).length} open charge(s)` : ''}</PixelText>
          <PixelText font="body" size={14} color={C.textMuted}>Faction: {detail.factionId?.replaceAll('_', ' ') ?? 'unaligned'} · Lineage: {detail.lineageStatus ?? 'marital'}</PixelText>
          {!!detail.guardianIds?.length && <PixelText font="body" size={14} color={C.textMuted}>Guardians: {detail.guardianIds.map((id) => state.world.characters[id]?.name).filter(Boolean).join(', ')}</PixelText>}
          <PixelText font="body" size={14} color={C.textMuted}>Secret: {detail.secretRevealed ? detail.secret?.replaceAll('_', ' ') : 'Unknown'}</PixelText>
          {!!detail.parentIds?.length && <PixelText font="body" size={14} color={C.textMuted}>Parents: {detail.parentIds.map((id) => state.world.characters[id]?.name).filter(Boolean).join(', ')}</PixelText>}
          {!!detail.childIds?.length && <PixelText font="body" size={14} color={C.textMuted}>Children: {detail.childIds.map((id) => state.world.characters[id]?.name).filter(Boolean).join(', ')}</PixelText>}
          {!!detail.worldMemories?.length && <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 5 }}>Remembers: {detail.worldMemories.slice(-2).map((memory) => memory.summary).join(' · ')}</PixelText>}
          {!!relation.sharedMemories.length && <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 5 }}>Shared: {relation.sharedMemories.join(', ')}</PixelText>}
        </View>
        {detail.alive && <>
          <PixelText font="pixel" size={7} color={C.blueDeep}>CONTEXTUAL ACTIONS</PixelText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {actions.map((action) => {
              const meta = ACTION_META[action];
              const noTime = state.actionClock.used >= state.actionClock.cap;
              return <PixelButton key={action} bg={meta.bg} shadow={meta.sd} disabled={noTime} onPress={() => onInteract(detail.id, action)} style={{ width: '48.5%', marginBottom: 7 }} innerStyle={{ paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center' }}>
                <PixelText font="pixel" size={6} color={C.blueDark} style={{ textAlign: 'center' }}>{meta.label}</PixelText>
                <PixelText font="body" size={13} color={C.textDark} style={{ marginTop: 3 }}>{noTime ? 'Age up to act again' : meta.hint}</PixelText>
              </PixelButton>;
            })}
          </View>
        </>}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 3, borderBottomColor: C.paleEdge }} contentContainerStyle={{ gap: 5, padding: 9 }}>
        {FILTERS.map((item) => <PixelButton key={item.id} bg={filter === item.id ? C.faith : C.lightFill} shadow={filter === item.id ? C.faithDark : C.paleEdge} onPress={() => onFilter(item.id)} innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={6} color={C.blueDark}>{item.label}</PixelText>
        </PixelButton>)}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <PixelText font="pixel" size={8} color={C.blueDeep}>♥ PEOPLE & RELATIONSHIPS</PixelText>
          <PixelButton bg={treeOpen ? C.faith : C.light} shadow={treeOpen ? C.faithDark : C.blue} onPress={() => setTreeOpen((open) => !open)} innerStyle={{ paddingHorizontal: 7, paddingVertical: 5 }}>
            <PixelText font="pixel" size={5} color={C.blueDark}>{treeOpen ? 'LIST' : 'FAMILY TREE'}</PixelText>
          </PixelButton>
        </View>
        {treeOpen && <FamilyTree state={state} />}
        {!kin.length && <PixelText font="body" size={17} color={C.textMuted}>No one is recorded in this part of thy life.</PixelText>}
        {!treeOpen && kin.map((person) => <PixelButton key={person.id} bg={C.parch} shadow={C.parchSd} light={C.parchSl} outline={C.parchBorder} onPress={() => onOpen(person.id)} innerStyle={{ paddingHorizontal: 9, paddingVertical: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <KinIcon kin={person} size={32} fallbackSize={19} />
            <View style={{ flex: 1 }}><PixelText font="body" size={18} color={C.textDark}>{person.name}</PixelText><PixelText font="body" size={13} color={C.textMuted}>{person.alive ? person.role : `${person.role} · deceased`}</PixelText></View>
            <View style={{ alignItems: 'flex-end' }}><PixelText font="pixel" size={7} color={relColor(person.rel)}>{person.rel}%</PixelText><PixelText font="body" size={12} color={C.textMuted}>{relLabel(person.rel)}</PixelText></View>
          </View>
        </PixelButton>)}
      </ScrollView>
    </View>
  );
}

function FamilyTree({ state }: { state: GameState }) {
  const player = state.world.characters[state.playerCharacterId];
  const parents = (player?.parentIds ?? []).map((id) => state.world.characters[id]).filter(Boolean);
  const siblings = Object.values(state.world.characters).filter((character) => character.id !== player?.id && character.parentIds?.some((id) => player?.parentIds?.includes(id)));
  const children = (player?.childIds ?? []).map((id) => state.world.characters[id]).filter(Boolean);
  const grandchildren = children.flatMap((child) => (child.childIds ?? []).map((id) => state.world.characters[id]).filter(Boolean));
  const generations = [
    { title: 'PARENTS', people: parents },
    { title: 'THY GENERATION', people: [player, ...siblings].filter(Boolean) },
    { title: 'CHILDREN', people: children },
    { title: 'GRANDCHILDREN', people: grandchildren },
  ];
  return <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
    {generations.map((generation) => <View key={generation.title} style={{ width: 150, ...PANEL.parchCard }}>
      <PixelText font="pixel" size={6} color={C.amber}>{generation.title}</PixelText>
      {!generation.people.length && <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 6 }}>No recorded kin</PixelText>}
      {generation.people.map((person) => <View key={person.id} style={{ borderTopWidth: 1, borderTopColor: C.parchSd, marginTop: 6, paddingTop: 5 }}>
        <PixelText font="body" size={15} color={person.id === state.playerCharacterId ? C.blueDeep : C.textDark}>{person.name}</PixelText>
        <PixelText font="body" size={12} color={C.textMuted}>{person.alive ? `${person.age} winters` : `died ${person.deathYear ?? ''}`} · {person.lineageStatus ?? 'marital'}</PixelText>
      </View>)}
    </View>)}
  </ScrollView>;
}

function Dimension({ label, value }: { label: string; value: number }) {
  return <View style={{ marginTop: 7 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><PixelText font="body" size={14} color={C.textBrown}>{label}</PixelText><PixelText font="pixel" size={6} color={relColor(value)}>{value}</PixelText></View><View style={{ height: 6, backgroundColor: C.parchSd, marginTop: 2 }}><View style={{ width: `${value}%`, height: '100%', backgroundColor: relColor(value) }} /></View></View>;
}

function KinIcon({ kin, size, fallbackSize }: { kin: KinMember; size: number; fallbackSize: number }) {
  const asset = kinIconAsset(kin.id, kin.kind);
  return asset ? <Image source={asset} resizeMode="contain" style={{ width: size, height: size }} /> : <PixelText size={fallbackSize}>{kin.emoji}</PixelText>;
}
