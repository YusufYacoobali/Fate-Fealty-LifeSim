import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { GameState, WorldConditionKey } from '@/types/game';
import { PixelText } from './ui/PixelText';
import { PixelButton } from './ui/PixelButton';
import { StatBar } from './ui/StatBar';
import { C, PANEL } from '@/theme/theme';
import { strongestConditionReasons } from '@/engine/worldSimulation';

interface ConditionInfo {
  label: string;
  /** True when a high number is good news for the player. */
  higherIsBetter: boolean;
  color: string;
  dark: string;
  /** What this dial actually does to the player's life. */
  effect: string;
}

/**
 * The six village dials. These describe SWINEFORD — the whole village, shared by
 * every character and carried across lives. They are NOT the player's estate;
 * that is the Holding, with its own Stores, Security and Loyalty.
 */
export const CONDITION_INFO: Record<WorldConditionKey, ConditionInfo> = {
  foodSecurity: {
    label: 'FOOD',
    higherIsBetter: true,
    color: '#d8ad62',
    dark: '#966c2f',
    effect: 'Grain in the village. Below 35 brings hunger years, and household troubles arrive far more often.',
  },
  prosperity: {
    label: 'WEALTH',
    higherIsBetter: true,
    color: C.charm,
    dark: C.charmDark,
    effect: 'Trade and coin. This scales every wage thou art paid — three quarters when Swineford is destitute, a quarter more when it is rich.',
  },
  publicOrder: {
    label: 'ORDER',
    higherIsBetter: true,
    color: C.blue,
    dark: C.blueDark,
    effect: 'Law on the roads. Low order makes crime and outlaw trouble far more likely to find thee.',
  },
  warThreat: {
    label: 'WAR',
    higherIsBetter: false,
    color: C.health,
    dark: C.healthDark,
    effect: 'How near the fighting is. Above 65 the Crown raises levies, taxes bite, and war chapters begin.',
  },
  diseasePressure: {
    label: 'PLAGUE',
    higherIsBetter: false,
    color: C.purple,
    dark: C.purpleDark,
    effect: 'Sickness in the air. Below 55 thou cannot fall ill by chance at all; above 82 the sickness that comes is plague itself.',
  },
  religiousTension: {
    label: 'TENSION',
    higherIsBetter: false,
    color: C.teal,
    dark: C.tealDark,
    effect: 'Strife over faith. High tension turns the Church against anyone who stands apart from the parish.',
  },
};

const KEYS = Object.keys(CONDITION_INFO) as WorldConditionKey[];

/** Whether a dial has crossed into crisis territory. */
export function conditionInCrisis(state: GameState, key: WorldConditionKey): boolean {
  const value = state.world.conditions[key];
  return CONDITION_INFO[key].higherIsBetter ? value < 35 : value > 65;
}

/**
 * The Swineford summary strip. It lives on the HOLDING tab, directly beneath
 * the estate, because the two are constantly confused: the estate is thine, the
 * village is everyone's, and the estate quietly feeds two of the village dials.
 */
export function WorldStatusPanel({ state }: { state: GameState }) {
  const [open, setOpen] = React.useState(false);
  const mostExtreme = [...KEYS].sort(
    (a, b) => Math.abs(state.world.conditions[b] - 50) - Math.abs(state.world.conditions[a] - 50),
  )[0];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open detailed Swineford status"
      onPress={() => setOpen(true)}
      style={{ backgroundColor: C.blueDeep, borderWidth: 3, borderColor: C.inkSoft, paddingHorizontal: 10, paddingVertical: 9 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <PixelText font="pixel" size={9} color={C.charm}>SWINEFORD · {state.world.currentYear}</PixelText>
        <PixelText font="body" size={14} color={C.creamBlue}>The village, not thy estate</PixelText>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
        {KEYS.map((key) => {
          const info = CONDITION_INFO[key];
          const danger = conditionInCrisis(state, key);
          return (
            <View key={key} style={{ alignItems: 'center', flex: 1 }}>
              <PixelText font="pixel" size={7} color="#9fc4e8">{info.label}</PixelText>
              <PixelText font="pixel" size={8} color={danger ? C.health : C.faith}>{state.world.conditions[key]}</PixelText>
            </View>
          );
        })}
      </View>

      <PixelText font="body" size={13} color="#bcd2eb" style={{ textAlign: 'center', marginTop: 6 }}>
        {CONDITION_INFO[mostExtreme].label.toLowerCase()}: {strongestConditionReasons(state, mostExtreme).join(', ')}
      </PixelText>
      <PixelText font="pixel" size={7} color={C.white} style={{ textAlign: 'center', marginTop: 6 }}>
        TAP FOR VILLAGE DETAILS
      </PixelText>

      <Modal visible={open} transparent animationType={state.settings.reducedMotion ? 'none' : 'fade'} onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(13,27,46,0.82)', justifyContent: 'center', padding: 16 }}>
          <View style={{ ...PANEL.parchModal, maxHeight: '88%' }}>
            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
              <WorldDetails state={state} />
            </ScrollView>
            <PixelButton bg={C.blue} shadow={C.blueDeep} onPress={() => setOpen(false)} innerStyle={{ padding: 9 }} style={{ marginTop: 10 }}>
              <PixelText font="pixel" size={9} color={C.white}>CLOSE</PixelText>
            </PixelButton>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
}

function SectionHeading({ title, blurb }: { title: string; blurb: string }) {
  return (
    <View style={{ backgroundColor: C.blueDeep, borderWidth: 2, borderColor: C.inkSoft, padding: 8 }}>
      <PixelText font="pixel" size={9} color={C.charm}>{title}</PixelText>
      <PixelText font="body" size={15} color={C.creamBlue} style={{ marginTop: 5 }}>{blurb}</PixelText>
    </View>
  );
}

function ConditionCard({ state, conditionKey }: { state: GameState; conditionKey: WorldConditionKey }) {
  const info = CONDITION_INFO[conditionKey];
  const value = state.world.conditions[conditionKey];
  const crisis = conditionInCrisis(state, conditionKey);
  const threshold = info.higherIsBetter ? 'below 35 is a crisis' : 'above 65 is a crisis';

  return (
    <View style={[PANEL.parchCard, { padding: 10 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <PixelText font="pixel" size={9} color={info.dark}>{info.label}</PixelText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          {crisis && (
            <View style={{ backgroundColor: C.badBg, borderWidth: 2, borderColor: C.badBorder, paddingHorizontal: 5, paddingVertical: 2 }}>
              <PixelText font="pixel" size={7} color={C.bad}>CRISIS</PixelText>
            </View>
          )}
          <PixelText font="pixel" size={10} color={crisis ? C.bad : C.blueDeep}>{value}</PixelText>
        </View>
      </View>

      <View style={{ marginTop: 7 }}>
        <StatBar value={value} color={info.color} dark={info.dark} height={14} trackBg={C.lightFill} trackBorder={C.inkSoft} />
      </View>
      <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 4 }}>
        {info.higherIsBetter ? 'Higher is better' : 'Lower is better'} · {threshold}
      </PixelText>

      <PixelText font="body" size={16} color={C.textDark} style={{ marginTop: 7 }}>{info.effect}</PixelText>
      <PixelText font="body" size={14} color={C.textBrown} style={{ marginTop: 6 }}>
        Moving it now: {strongestConditionReasons(state, conditionKey).join(', ')}.
      </PixelText>
    </View>
  );
}

function WorldDetails({ state }: { state: GameState }) {
  const crises = KEYS.filter((key) => conditionInCrisis(state, key));

  return (
    <>
      <View style={{ backgroundColor: C.charm, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: 10 }}>
        <PixelText font="pixel" size={10} color="#3a2a08" style={{ textAlign: 'center' }}>
          SWINEFORD · {state.world.currentYear}
        </PixelText>
        <PixelText font="body" size={16} color="#3a2a08" style={{ textAlign: 'center', marginTop: 6 }}>
          This is the whole village: shared by every soul in it, and carried on from life to life. Thy own estate is
          separate, and is measured on the Holding page above.
        </PixelText>
      </View>

      <SectionHeading
        title="THE SIX PRESSURES"
        blurb="Each moves a little every year and drifts back toward 50. They decide which events find thee, what thy work pays, and how easily thou fall sick."
      />
      {KEYS.map((key) => <ConditionCard key={key} state={state} conditionKey={key} />)}

      <View style={{ backgroundColor: crises.length ? C.badBg : C.goodBg, borderWidth: 2, borderColor: crises.length ? C.badBorder : C.goodBorder, padding: 10 }}>
        <PixelText font="pixel" size={8} color={crises.length ? C.bad : C.good}>
          {crises.length ? 'CRISES UNDERWAY' : 'NO CRISIS UNDERWAY'}
        </PixelText>
        <PixelText font="body" size={16} color={C.textDark} style={{ marginTop: 5 }}>
          {crises.length
            ? `${crises.map((key) => CONDITION_INFO[key].label.toLowerCase()).join(', ')} — expect harsher events until these recover.`
            : 'No pressure has crossed a crisis threshold. Swineford is having an ordinary bad century.'}
        </PixelText>
      </View>

      <SectionHeading
        title="HOW THY ESTATE FEEDS THIS"
        blurb="Thy Holding is not the village, but it leans on it. Each year thy Stores nudge FOOD, and thy Security and Loyalty together nudge ORDER. The village never reaches back into thy estate."
      />

      <SectionHeading
        title="THE FIVE POWERS"
        blurb="Influence is how much sway a faction holds over Swineford; standing is what it thinks of thee. Powerful factions push the pressures above in their own favour every year."
      />
      {Object.values(state.world.factions).map((faction) => (
        <View key={faction.id} style={[PANEL.parchCard, { padding: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <PixelText font="pixel" size={8} color={C.blueDeep}>{faction.name.toUpperCase()}</PixelText>
            <PixelText font="body" size={15} color={faction.playerStanding >= 0 ? C.good : C.bad}>
              thy standing {faction.playerStanding > 0 ? `+${faction.playerStanding}` : faction.playerStanding}
            </PixelText>
          </View>
          <View style={{ marginTop: 6 }}>
            <StatBar value={faction.influence} color={C.purple} dark={C.purpleDark} height={12} trackBg={C.lightFill} trackBorder={C.inkSoft} />
          </View>
          <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 4 }}>
            influence {faction.influence} · presently {faction.activePressure ?? 'making no particular demand'}
          </PixelText>
        </View>
      ))}

    </>
  );
}
