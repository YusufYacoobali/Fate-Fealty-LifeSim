import React from 'react';
import { ScrollView, View } from 'react-native';
import { GameState, HoldingResource } from '@/types/game';
import { HOLDING_ACTIONS, HOLDING_UNLOCK_AGE, HOLDING_UPGRADES, holdingTitle } from '@/data/holding';
import {
  holdingActionAvailability,
  holdingUpgradeAvailability,
  isHoldingUpgradeActive,
} from '@/engine/holdingEngine';
import { RANKS } from '@/data/ranks';
import { C, PANEL } from '@/theme/theme';
import { PixelBox } from '../ui/PixelBox';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';

interface Props {
  state: GameState;
  onAction: (id: string) => void;
  onUpgrade: (id: string) => void;
}

const RESOURCE_STYLE: Record<HoldingResource, { label: string; icon: string; color: string; dark: string }> = {
  stores: { label: 'STORES', icon: '🌾', color: '#d8ad62', dark: '#966c2f' },
  security: { label: 'SECURITY', icon: '🛡️', color: C.blue, dark: C.blueDark },
  loyalty: { label: 'LOYALTY', icon: '♥', color: C.faith, dark: C.faithDark },
};

function ResourceMeter({ resource, value }: { resource: HoldingResource; value: number }) {
  const style = RESOURCE_STYLE[resource];
  return (
    <View style={{ marginBottom: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <PixelText font="pixel" size={7} color={style.dark}>{style.icon} {style.label}</PixelText>
        <PixelText font="pixel" size={7} color={C.inkSoft}>{value}%</PixelText>
      </View>
      <StatBar value={value} color={style.color} dark={style.dark} height={13} trackBg={C.lightFill} trackBorder={C.inkSoft} />
    </View>
  );
}

export function HoldingTab({ state, onAction, onUpgrade }: Props) {
  const lockedByAge = state.age < HOLDING_UNLOCK_AGE;
  const managed = state.holding.lastActionAge === state.age;
  const title = holdingTitle(state.rankIdx);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 16 }}>
      <View style={{ backgroundColor: C.blueDeep, borderWidth: 3, borderColor: C.charm, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: 11 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d8ad62', borderWidth: 2, borderColor: C.inkSoft }}>
            <PixelText size={25}>{state.rankIdx >= 5 ? '🏰' : state.rankIdx >= 2 ? '🏡' : '🛖'}</PixelText>
          </View>
          <View style={{ flex: 1 }}>
            <PixelText font="pixel" size={9} color={C.charm}>{title.toUpperCase()}</PixelText>
            <PixelText font="body" size={15} color={C.creamBlue} style={{ marginTop: 4 }}>
              {RANKS[state.rankIdx].key} lands · Dynasty {state.lifeNo}
            </PixelText>
          </View>
        </View>
      </View>

      {lockedByAge && (
        <View style={[PANEL.parchCard, { marginTop: 10 }]}>
          <PixelText font="pixel" size={7} color={C.amber}>UNDER REGENCY</PixelText>
          <PixelText font="body" size={15} color={C.textBrown} style={{ marginTop: 6 }}>
            Thy family and regents tend these lands. You may take command in your sixth winter.
          </PixelText>
        </View>
      )}

      <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 13, marginBottom: 8 }}>THE LEDGER</PixelText>
      <PixelBox bg={C.parch} shadow={C.parchSd} light={C.parchSl} innerStyle={{ padding: 10 }}>
        <ResourceMeter resource="stores" value={state.holding.stores} />
        <ResourceMeter resource="security" value={state.holding.security} />
        <ResourceMeter resource="loyalty" value={state.holding.loyalty} />
        {state.holding.criticalYears > 0 && (
          <PixelText font="body" size={14} color={C.bad}>⚠ The holding is in peril. Another critical year will bring disaster.</PixelText>
        )}
      </PixelBox>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 8 }}>
        <PixelText font="pixel" size={7} color={C.blueDeep}>THIS YEAR'S ORDER</PixelText>
        <PixelText font="body" size={14} color={managed ? C.faithDark : C.amber}>{managed ? 'GIVEN ✓' : lockedByAge ? 'LOCKED' : 'READY'}</PixelText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {HOLDING_ACTIONS.map((action) => {
          const availability = holdingActionAvailability(state, action.id);
          return (
            <PixelButton
              key={action.id}
              bg={C.parch}
              shadow={C.parchSd}
              light={C.parchSl}
              disabled={!availability.available}
              onPress={() => onAction(action.id)}
              style={{ width: '48.5%', marginBottom: 8 }}
              innerStyle={{ padding: 8, minHeight: 116 }}
            >
              <PixelText size={21}>{action.icon}</PixelText>
              <PixelText font="pixel" size={6} color={C.textDark} style={{ marginTop: 5 }}>{action.name}</PixelText>
              <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 5 }}>{action.desc}</PixelText>
              {!availability.available && <PixelText font="body" size={12} color={C.bad} style={{ marginTop: 5 }}>🔒 {availability.reason}</PixelText>}
            </PixelButton>
          );
        })}
      </View>

      <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 7, marginBottom: 8 }}>WORKS & BUILDINGS</PixelText>
      <View style={{ gap: 8 }}>
        {HOLDING_UPGRADES.map((upgrade) => {
          const availability = holdingUpgradeAvailability(state, upgrade.id);
          const owned = state.holding.upgrades.includes(upgrade.id);
          const active = isHoldingUpgradeActive(state, upgrade.id);
          return (
            <PixelButton
              key={upgrade.id}
              bg={owned ? C.lightFill : C.parch}
              shadow={owned ? C.faithDark : C.parchSd}
              light={C.parchSl}
              disabled={!availability.available}
              onPress={() => onUpgrade(upgrade.id)}
              innerStyle={{ padding: 9 }}
            >
              <View style={{ flexDirection: 'row', gap: 9 }}>
                <PixelText size={21}>{upgrade.icon}</PixelText>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                    <PixelText font="pixel" size={6} color={C.textDark}>{upgrade.name}</PixelText>
                    <PixelText font="body" size={14} color={owned ? C.faithDark : C.amber}>
                      {owned ? active ? 'OWNED ✓' : 'DORMANT' : `${upgrade.price}g`}
                    </PixelText>
                  </View>
                  <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 4 }}>{upgrade.desc}</PixelText>
                  {!availability.available && !owned && <PixelText font="body" size={12} color={C.bad} style={{ marginTop: 3 }}>🔒 {availability.reason}</PixelText>}
                </View>
              </View>
            </PixelButton>
          );
        })}
      </View>
    </ScrollView>
  );
}
