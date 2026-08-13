import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { GameState, KinMember, RelationFilter } from '@/types/game';
import { KinAction } from '@/engine/kinEngine';
import { contextualActions, isAffairWith, isPlayerSpouse, perspectives, readRelationship } from '@/engine/relationshipEngine';
import { isFamilyTie, KinshipTie, kinshipGeneration, kinshipLabel, kinshipMap } from '@/engine/kinship';
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

type ActionGroup = 'warm' | 'romance' | 'cruel' | 'violent' | 'family';

interface ActionMeta {
  label: string;
  hint: string;
  bg: string;
  sd: string;
  group: ActionGroup;
}

/**
 * Actions are grouped so the screen never becomes a wall of buttons. The player
 * picks an intent first and sees only the handful of things that serve it,
 * which leaves room for a far wider range of behaviour than a flat grid could.
 */
const ACTION_GROUPS: { id: ActionGroup; label: string; bg: string; sd: string }[] = [
  { id: 'warm', label: 'KINDNESS', bg: C.faith, sd: C.faithDark },
  { id: 'romance', label: 'ROMANCE', bg: C.charm, sd: C.charmDark },
  { id: 'family', label: 'HOUSEHOLD', bg: C.light, sd: C.blue },
  { id: 'cruel', label: 'CRUELTY', bg: C.purple, sd: C.purpleDark },
  { id: 'violent', label: 'VIOLENCE', bg: C.health, sd: C.healthDark },
];

const ACTION_META: Record<KinAction, ActionMeta> = {
  time: { group: 'warm', label: 'SPEND TIME', hint: 'affinity + trust', bg: C.faith, sd: C.faithDark },
  praise: { group: 'warm', label: 'PRAISE', hint: 'respect + affinity', bg: C.light, sd: C.blue },
  help: { group: 'warm', label: 'OFFER HELP', hint: 'strong trust gain', bg: C.teal, sd: C.tealDark },
  confide: { group: 'warm', label: 'CONFIDE', hint: 'share a secret · trust', bg: C.teal, sd: C.tealDark },
  forgive: { group: 'warm', label: 'FORGIVE', hint: 'release an old hurt', bg: C.faith, sd: C.faithDark },
  apologize: { group: 'warm', label: 'APOLOGIZE', hint: 'repair trust', bg: C.light, sd: C.blue },
  reconcile: { group: 'warm', label: 'MAKE PEACE', hint: 'end the rivalry', bg: C.faith, sd: C.faithDark },
  gift: { group: 'warm', label: 'GIVE GIFT', hint: '5g · affinity', bg: C.charm, sd: C.charmDark },
  favour: { group: 'warm', label: 'ASK FAVOUR', hint: 'borrow coin', bg: C.teal, sd: C.tealDark },
  prank: { group: 'warm', label: 'PLAY A PRANK', hint: 'harmless, mostly', bg: C.purple, sd: C.purpleDark },
  carouse: { group: 'warm', label: 'DRINK TOGETHER', hint: 'strong bond · costs health', bg: C.charm, sd: C.charmDark },

  flirt: { group: 'romance', label: 'FLIRT', hint: 'test attraction', bg: C.health, sd: C.healthDark },
  court: { group: 'romance', label: 'COURT', hint: 'build mutual love', bg: C.charm, sd: C.charmDark },
  propose: { group: 'romance', label: 'PROPOSE', hint: 'trust + attraction', bg: C.purple, sd: C.purpleDark },
  seduce: { group: 'romance', label: 'SEDUCE', hint: 'an affair · someone gets hurt', bg: C.purple, sd: C.purpleDark },
  secret_meeting: { group: 'romance', label: 'MEET IN SECRET', hint: 'love + discovery risk', bg: C.purple, sd: C.purpleDark },
  spend_night: { group: 'romance', label: 'SPEND THE NIGHT', hint: 'passion · discovery risk', bg: C.health, sd: C.healthDark },
  promise_future: { group: 'romance', label: 'PROMISE A FUTURE', hint: 'deepen love · or break trust', bg: C.charm, sd: C.charmDark },
  elope: { group: 'romance', label: 'RUN AWAY TOGETHER', hint: 'leave spouses · marry · scandal', bg: C.health, sd: C.healthDark },
  end_affair: { group: 'romance', label: 'END THE AFFAIR', hint: 'before it is found out', bg: C.light, sd: C.blue },
  accept_proposal: { group: 'romance', label: 'ACCEPT PROPOSAL', hint: 'marry by choice', bg: C.faith, sd: C.faithDark },
  reject_proposal: { group: 'romance', label: 'REFUSE PROPOSAL', hint: 'remain unmarried', bg: C.health, sd: C.healthDark },
  try_for_child: { group: 'romance', label: 'TRY FOR A CHILD', hint: 'hope for an heir', bg: C.charm, sd: C.charmDark },
  adopt_child: { group: 'romance', label: 'TAKE IN A CHILD', hint: '15g · a child who needs a home', bg: C.charm, sd: C.charmDark },
  divorce: { group: 'romance', label: 'SEEK DIVORCE', hint: 'end the marriage', bg: C.health, sd: C.healthDark },

  educate_child: { group: 'family', label: 'TEACH CHILD', hint: 'shape learning + ambition', bg: C.light, sd: C.blue },
  arrange_marriage: { group: 'family', label: 'ARRANGE MATCH', hint: 'join two households', bg: C.charm, sd: C.charmDark },
  care_for_relative: { group: 'family', label: 'GIVE CARE', hint: 'health + lasting trust', bg: C.faith, sd: C.faithDark },
  name_heir: { group: 'family', label: 'NAME AS HEIR', hint: 'thy lands pass to them', bg: C.charm, sd: C.charmDark },
  disinherit: { group: 'family', label: 'DISINHERIT', hint: 'they lose everything', bg: C.health, sd: C.healthDark },

  insult: { group: 'cruel', label: 'INSULT', hint: 'may start a rivalry', bg: C.health, sd: C.healthDark },
  plot: { group: 'cruel', label: 'SCHEME', hint: 'begin a feud', bg: C.purple, sd: C.purpleDark },
  expose_secret: { group: 'cruel', label: 'EXPOSE SECRET', hint: 'truth with consequences', bg: C.health, sd: C.healthDark },
  spread_rumour: { group: 'cruel', label: 'SPREAD A RUMOUR', hint: 'ruin their standing', bg: C.purple, sd: C.purpleDark },
  blackmail: { group: 'cruel', label: 'BLACKMAIL', hint: 'their coin for thy silence', bg: C.purple, sd: C.purpleDark },
  steal_from: { group: 'cruel', label: 'STEAL FROM THEM', hint: 'coin · risk of the law', bg: C.health, sd: C.healthDark },
  frame_them: { group: 'cruel', label: 'FRAME THEM', hint: 'thy suspicion becomes theirs', bg: C.purple, sd: C.purpleDark },

  duel: { group: 'violent', label: 'CALL A DUEL', hint: 'formal combat before witnesses', bg: C.charm, sd: C.charmDark },
  brawl: { group: 'violent', label: 'START A BRAWL', hint: 'no rules, no honour, no law', bg: C.health, sd: C.healthDark },
  assault: { group: 'violent', label: 'ASSAULT THEM', hint: 'injure them · the law will hear', bg: C.health, sd: C.healthDark },
  murder: { group: 'violent', label: 'KILL THEM', hint: 'there is no undoing this', bg: '#7a1f2a', sd: '#4a0f18' },
};

export function KinTab({ state, kin, detail, filter, onFilter, onOpen, onBack, onInteract }: Props) {
  const [treeOpen, setTreeOpen] = React.useState(false);
  const ties = React.useMemo(() => kinshipMap(state), [state]);
  if (detail) {
    const relation = readRelationship(state, detail);
    const views = perspectives(state, relation);
    const career = careerById(detail.occupation.careerId);
    const actions = contextualActions(state, detail);
    const tie = ties[detail.id] ?? 'acquaintance';
    const spouse = detail.spouseId ? state.world.characters[detail.spouseId] : undefined;
    const affair = relation.flags.includes('affair');
    const affairExposed = relation.sharedMemories.includes('affair_exposed');
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.sky }} contentContainerStyle={{ padding: 11, paddingBottom: 16, gap: 9 }}>
        <PixelButton bg={C.blue} shadow={C.blueDeep} onPress={onBack} style={{ alignSelf: 'flex-start' }} innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={8} color={C.white}>◂ BACK</PixelText>
        </PixelButton>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0f274a', borderWidth: 4, borderColor: detail.alive ? C.charm : C.textMuted, padding: 10 }}>
          <View style={{ width: 56, height: 56, backgroundColor: C.sky, borderWidth: 3, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center', opacity: detail.alive ? 1 : 0.55 }}>
            <KinIcon kin={detail} size={50} fallbackSize={30} />
          </View>
          <View style={{ flex: 1 }}>
            <PixelText font="pixel" size={10} color={detail.alive ? C.charm : C.creamBlue}>{detail.name}</PixelText>
            <View style={{ alignSelf: 'flex-start', marginTop: 4, backgroundColor: isFamilyTie(tie) ? C.charm : C.light, borderWidth: 2, borderColor: C.inkSoft, paddingHorizontal: 6, paddingVertical: 2 }}>
              <PixelText font="pixel" size={7} color={C.blueDark}>{kinshipLabel(tie).toUpperCase()}</PixelText>
            </View>
            <PixelText font="body" size={15} color="#dbe9ff" style={{ marginTop: 4 }}>{detail.role} · {detail.age} winters</PixelText>
            <PixelText font="body" size={14} color="#a9c2df">{detail.pronouns.subject}/{detail.pronouns.object} · {career?.title ?? 'No occupation'} · {detail.gold}g</PixelText>
            {spouse?.alive ? (
              <PixelText font="pixel" size={7} color={C.charm} style={{ marginTop: 3 }}>
                MARRIED TO {spouse.id === state.playerCharacterId ? 'YOU' : spouse.name.toUpperCase()}
              </PixelText>
            ) : (
              <PixelText font="pixel" size={7} color="#9fc4e8" style={{ marginTop: 3 }}>UNMARRIED</PixelText>
            )}
            {affair && (
              <PixelText font="pixel" size={7} color={affairExposed ? C.health : C.purple} style={{ marginTop: 3 }}>
                {affairExposed ? 'YOUR AFFAIR IS EXPOSED' : 'YOUR SECRET LOVER'}
              </PixelText>
            )}
            {!detail.alive && <PixelText font="pixel" size={8} color={C.health}>DECEASED</PixelText>}
          </View>
        </View>

        {detail.alive && <ActionBoard state={state} actions={actions} kin={detail} onInteract={(action) => onInteract(detail.id, action)} />}
        <View style={PANEL.parchCard}>
          <PixelText font="pixel" size={7} color={C.amber}>MUTUAL RELATIONSHIP</PixelText>
          <Dimension label="YOUR AFFINITY" value={views.player.affinity} />
          <Dimension label="THEIR AFFINITY" value={views.other.affinity} />
          <Dimension label="TRUST" value={Math.round((views.player.trust + views.other.trust) / 2)} />
          <Dimension label="RESPECT" value={Math.round((views.player.respect + views.other.respect) / 2)} />
          {(views.player.attraction > 0 || views.other.attraction > 0) && <Dimension label="ATTRACTION" value={Math.round((views.player.attraction + views.other.attraction) / 2)} />}
        </View>
        <View style={PANEL.parchCard}>
          <PixelText font="pixel" size={7} color={C.amber}>TRAIT — {detail.trait}</PixelText>
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
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 3, borderBottomColor: C.paleEdge }} contentContainerStyle={{ gap: 5, padding: 9 }}>
        {FILTERS.map((item) => <PixelButton key={item.id} bg={filter === item.id ? C.faith : C.lightFill} shadow={filter === item.id ? C.faithDark : C.paleEdge} onPress={() => onFilter(item.id)} innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={7} color={C.blueDark}>{item.label}</PixelText>
        </PixelButton>)}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <PixelText font="pixel" size={9} color={C.blueDeep}>♥ PEOPLE & RELATIONSHIPS</PixelText>
          <PixelButton bg={treeOpen ? C.faith : C.light} shadow={treeOpen ? C.faithDark : C.blue} onPress={() => setTreeOpen((open) => !open)} innerStyle={{ paddingHorizontal: 7, paddingVertical: 5 }}>
            <PixelText font="pixel" size={6} color={C.blueDark}>{treeOpen ? 'LIST' : 'FAMILY TREE'}</PixelText>
          </PixelButton>
        </View>
        {treeOpen && <FamilyTree state={state} ties={ties} />}
        {!kin.length && <PixelText font="body" size={17} color={C.textMuted}>No one is recorded in this part of thy life.</PixelText>}
        {!treeOpen && kin.map((person) => {
          const tie = ties[person.id] ?? 'acquaintance';
          const family = isFamilyTie(tie);
          const spouse = person.spouseId ? state.world.characters[person.spouseId] : undefined;
          const affair = isAffairWith(state, person.id);
          return <PixelButton key={person.id} bg={C.parch} shadow={C.parchSd} light={C.parchSl} outline={C.parchBorder} onPress={() => onOpen(person.id)} innerStyle={{ paddingHorizontal: 9, paddingVertical: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <KinIcon kin={person} size={32} fallbackSize={19} />
              <View style={{ flex: 1 }}>
                <PixelText font="body" size={18} color={C.textDark}>{person.name}</PixelText>
                {/* The tie leads, because "who is this to me?" is the first
                    question the list has to answer. */}
                <PixelText font="pixel" size={6} color={family ? C.amber : C.blue} style={{ marginTop: 2 }}>
                  {kinshipLabel(tie).toUpperCase()}
                </PixelText>
                <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 2 }}>
                  {person.alive ? `${person.role} · ${person.age} winters` : `${person.role} · deceased`}
                </PixelText>
                {person.alive && (affair || spouse?.alive) && (
                  <PixelText font="body" size={12} color={affair ? C.purpleDark : C.textMuted}>
                    {affair ? 'Your secret lover' : `Married to ${spouse!.id === state.playerCharacterId ? 'you' : spouse!.name}`}
                  </PixelText>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}><PixelText font="pixel" size={8} color={relColor(person.rel)}>{person.rel}%</PixelText><PixelText font="body" size={12} color={C.textMuted}>{relLabel(person.rel)}</PixelText></View>
            </View>
          </PixelButton>;
        })}
      </ScrollView>
    </View>
  );
}

/**
 * Contextual actions, one intent at a time. Only groups that actually have
 * something available are offered, so the board stays honest about what this
 * particular relationship allows.
 */
function ActionBoard({ state, actions, kin, onInteract }: { state: GameState; actions: KinAction[]; kin: KinMember; onInteract: (action: KinAction) => void }) {
  const available = ACTION_GROUPS.filter((group) => actions.some((action) => ACTION_META[action].group === group.id));
  // The board used to open on KINDNESS for everybody, which hid TRY FOR A CHILD
  // behind an unpressed tab on the one screen a player goes looking for it.
  // Open where this particular relationship's business actually is.
  const opening: ActionGroup = isPlayerSpouse(state, kin) || isAffairWith(state, kin.id) ? 'romance'
    : actions.includes('educate_child') || actions.includes('name_heir') ? 'family'
      : available[0]?.id ?? 'warm';
  const [group, setGroup] = React.useState<ActionGroup>(available.some((item) => item.id === opening) ? opening : available[0]?.id ?? 'warm');
  // The relationship can change under us — fall back rather than showing nothing.
  const active = available.some((item) => item.id === group) ? group : available[0]?.id;
  if (!active) return null;

  const shown = actions.filter((action) => ACTION_META[action].group === active);
  const noTime = state.actionClock.used >= state.actionClock.cap;
  const dangerous = active === 'violent' || active === 'cruel';

  return (
    <>
      <PixelText font="pixel" size={8} color={C.blueDeep}>WHAT THOU MAY DO</PixelText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
        {available.map((item) => (
          <PixelButton
            key={item.id}
            bg={active === item.id ? item.bg : C.lightFill}
            shadow={active === item.id ? item.sd : C.paleEdge}
            onPress={() => setGroup(item.id)}
            innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}
          >
            <PixelText font="pixel" size={7} color={C.blueDark}>{item.label}</PixelText>
          </PixelButton>
        ))}
      </View>
      {dangerous && (
        <PixelText font="body" size={14} color={C.bad}>
          {active === 'violent'
            ? 'Violence leaves marks on them and charges against thee.'
            : 'Cruelty costs them their standing, and may cost thee thine.'}
        </PixelText>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {shown.map((action) => {
          const meta = ACTION_META[action];
          return (
            <PixelButton
              key={action}
              bg={meta.bg}
              shadow={meta.sd}
              disabled={noTime}
              onPress={() => onInteract(action)}
              style={{ width: '48.5%', marginBottom: 7 }}
              innerStyle={{ paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center' }}
            >
              <PixelText font="pixel" size={7} color={action === 'murder' ? C.white : C.blueDark} style={{ textAlign: 'center' }}>{meta.label}</PixelText>
              <PixelText font="body" size={13} color={action === 'murder' ? '#f0c0c0' : C.textDark} style={{ marginTop: 3, textAlign: 'center' }}>
                {noTime ? 'Age up to act again' : meta.hint}
              </PixelText>
            </PixelButton>
          );
        })}
      </View>
    </>
  );
}

/**
 * The tree reads the SAME kinship map as the list, so the two can no longer
 * disagree about who is family — previously the tree walked `parentIds` while
 * the list read `kind`, and each showed people the other denied.
 */
function FamilyTree({ state, ties }: { state: GameState; ties: Record<string, KinshipTie> }) {
  const player = state.world.characters[state.playerCharacterId];
  const family = Object.values(state.world.characters).filter((character) => isFamilyTie(ties[character.id] ?? 'acquaintance'));

  const inGeneration = (offset: number) => family.filter((character) => kinshipGeneration(ties[character.id]) === offset);
  const generations = [
    { title: 'GRANDPARENTS', people: inGeneration(-2) },
    { title: 'PARENTS & THEIR KIN', people: inGeneration(-1) },
    { title: 'THY GENERATION', people: [player, ...inGeneration(0)].filter(Boolean) },
    { title: 'CHILDREN & THEIR KIN', people: inGeneration(1) },
    { title: 'GRANDCHILDREN', people: inGeneration(2) },
  ].filter((generation) => generation.people.length > 0);

  if (generations.length <= 1) {
    return (
      <View style={PANEL.parchCard}>
        <PixelText font="body" size={16} color={C.textMuted}>
          No family is recorded beyond thyself. Marry, or find thy blood in the village.
        </PixelText>
      </View>
    );
  }

  return <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
    {generations.map((generation) => <View key={generation.title} style={{ width: 158, ...PANEL.parchCard }}>
      <PixelText font="pixel" size={7} color={C.amber}>{generation.title}</PixelText>
      {generation.people.map((person) => {
        const isPlayer = person.id === state.playerCharacterId;
        return <View key={person.id} style={{ borderTopWidth: 1, borderTopColor: C.parchSd, marginTop: 6, paddingTop: 5 }}>
          <PixelText font="body" size={16} color={isPlayer ? C.blueDeep : C.textDark}>{person.name}</PixelText>
          <PixelText font="pixel" size={6} color={isPlayer ? C.blueDeep : C.amber} style={{ marginTop: 2 }}>
            {isPlayer ? 'THYSELF' : kinshipLabel(ties[person.id]).toUpperCase()}
          </PixelText>
          <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 2 }}>
            {person.alive ? `${person.age} winters` : `died ${person.deathYear ?? ''}`}
          </PixelText>
        </View>;
      })}
    </View>)}
  </ScrollView>;
}

function Dimension({ label, value }: { label: string; value: number }) {
  return <View style={{ marginTop: 7 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><PixelText font="body" size={14} color={C.textBrown}>{label}</PixelText><PixelText font="pixel" size={7} color={relColor(value)}>{value}</PixelText></View><View style={{ height: 6, backgroundColor: C.parchSd, marginTop: 2 }}><View style={{ width: `${value}%`, height: '100%', backgroundColor: relColor(value) }} /></View></View>;
}

function KinIcon({ kin, size, fallbackSize }: { kin: KinMember; size: number; fallbackSize: number }) {
  const asset = kinIconAsset(kin.id, kin.kind, kin.gender, kin.age);
  return asset ? <Image source={asset} resizeMode="contain" style={{ width: size, height: size }} /> : <PixelText size={fallbackSize}>{kin.emoji}</PixelText>;
}
