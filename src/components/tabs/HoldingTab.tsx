import { HoldingExpansionPanel } from '../rpg/RpgPanels';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { GameState, HoldingResource } from '@/types/game';
import { HOLDING_ACTIONS, HOLDING_UNLOCK_AGE, HOLDING_UPGRADES, holdingTitle } from '@/data/holding';
import {
  holdingActionAvailability,
  holdingPopulation,
  holdingPopulationCapacity,
  holdingProsperity,
  holdingProsperityReward,
  holdingUpgradeAvailability,
  holdingYearlyUpkeep,
  isHoldingUpgradeActive,
} from '@/engine/holdingEngine';
import { RANKS } from '@/data/ranks';
import { C, PANEL } from '@/theme/theme';
import { FEATURE_ART, HOLDING_ACTION_ART, HOLDING_RESOURCE_ART, HOLDING_UPGRADE_ART } from '@/assets/generatedAssets';
import { PixelBox } from '../ui/PixelBox';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';
import { WorldStatusPanel } from '../WorldStatusPanel';

interface Props {
  state: GameState;
  onAction: (id: string) => void;
  onUpgrade: (id: string) => void;
  onToggleVillage: () => void;
}

const RESOURCE_STYLE: Record<HoldingResource, { label: string; color: string; dark: string }> = {
  stores: { label: 'STORES', color: '#d8ad62', dark: '#966c2f' },
  security: { label: 'SECURITY', color: C.blue, dark: C.blueDark },
  loyalty: { label: 'LOYALTY', color: C.faith, dark: C.faithDark },
};

function ResourceMeter({ resource, value, note }: { resource: HoldingResource; value: number; note: string }) {
  const style = RESOURCE_STYLE[resource];
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Image source={HOLDING_RESOURCE_ART[resource]} resizeMode="contain" style={{ width: 24, height: 24 }} />
          <PixelText font="pixel" size={8} color={style.dark}>{style.label}</PixelText>
        </View>
        <PixelText font="pixel" size={8} color={value < 15 ? C.bad : C.inkSoft}>{value}%</PixelText>
      </View>
      <StatBar value={value} color={style.color} dark={style.dark} height={14} trackBg={C.lightFill} trackBorder={C.inkSoft} />
      <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 4 }}>{note}</PixelText>
    </View>
  );
}

function recommendation(state: GameState): string {
  if (state.holding.lastActionAge === state.age) return 'Your estate order is complete. Age up to see the yearly result.';
  if (state.holding.stores < 45) return 'Work the Land next. Low Stores can cause hunger and population loss.';
  if (state.holding.security < 45) return 'Secure Bounds next. Low Security risks raids and destroyed buildings.';
  if (state.holding.loyalty < 45) {
    return state.holding.stores >= 14
      ? 'Open the Stores next. Loyalty prevents revolt and protects your rank.'
      : 'Build Stores first, then use them to restore Loyalty.';
  }
  if (holdingProsperity(state) < 75) {
    const lowest = (['stores', 'security', 'loyalty'] as HoldingResource[])
      .reduce((current, key) => state.holding[key] < state.holding[current] ? key : current, 'stores');
    return `Raise ${RESOURCE_STYLE[lowest].label} toward 75 to unlock the prosperity payout.`;
  }
  return 'The estate is thriving. Keep every resource at 75 or more to earn gold and reputation each year.';
}

export function HoldingTab({ state, onAction, onUpgrade, onToggleVillage }: Props) {
  const villageCollapsed = state.settings.villageCollapsed ?? false;
  const lockedByAge = state.age < HOLDING_UNLOCK_AGE;
  const managed = state.holding.lastActionAge === state.age;
  const title = holdingTitle(state.rankIdx);
  const population = holdingPopulation(state);
  const capacity = holdingPopulationCapacity(state);
  const prosperity = holdingProsperity(state);
  const prosperityReward = holdingProsperityReward(state);
  const upkeep = holdingYearlyUpkeep(state);
  const flourishing = prosperity >= 75;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 11, paddingBottom: 18 }}
    >
      {/* Swineford leads: the estate below only makes sense against the village
          it sits in. Collapsible, because most years it needs no attention. */}
      <View style={{ marginBottom: 12 }}>
        <PixelButton
          bg={C.blueDeep}
          shadow={C.blueDark}
          onPress={onToggleVillage}
          innerStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8 }}
        >
          <PixelText font="pixel" size={8} color={C.charm}>THE VILLAGE OF SWINEFORD</PixelText>
          <PixelText font="pixel" size={8} color={C.white}>{villageCollapsed ? '▾ SHOW' : '▴ HIDE'}</PixelText>
        </PixelButton>
        {!villageCollapsed && (
          <View style={{ marginTop: 8 }}>
            <WorldStatusPanel state={state} />
            <PixelText font="body" size={14} color={C.textBrown} style={{ marginTop: 7 }}>
              Swineford belongs to everyone and outlives thee. Thy own estate is below: its Stores nudge the village
              FOOD each year, its Security and Loyalty nudge ORDER, and nothing reaches back the other way.
            </PixelText>
          </View>
        )}
      </View>

      <View style={{ borderWidth: 3, borderColor: C.inkSoft, backgroundColor: C.blueDeep }}>
        <Image source={FEATURE_ART.holding} resizeMode="cover" style={{ width: '100%', height: 122 }} />
        <View style={{ padding: 11, borderTopWidth: 3, borderTopColor: C.charmDark }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <PixelText font="pixel" size={10} color={C.charm}>{title.toUpperCase()}</PixelText>
              <PixelText font="body" size={15} color={C.creamBlue} style={{ marginTop: 4 }}>
                {RANKS[state.rankIdx].key} lands. Dynasty {state.lifeNo}.
              </PixelText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <PixelText font="pixel" size={7} color={flourishing ? C.faith : C.charm}>PROSPERITY</PixelText>
                <PixelText font="body" size={20} color={C.white}>{prosperity}%</PixelText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <PixelText font="pixel" size={7} color={C.faith}>PEOPLE</PixelText>
                <PixelText font="body" size={20} color={C.white}>{population}/{capacity}</PixelText>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={[PANEL.parchCard, { marginTop: 10, padding: 11 }]}>
        <PixelText font="pixel" size={8} color={C.blueDeep}>HOW THY HOLDING HELPS</PixelText>
        <PixelText font="body" size={16} color={C.textDark} style={{ marginTop: 7 }}>
          Give one estate order each year. Keep Stores, Security, and Loyalty healthy so people settle here and the land pays gold and reputation into your life.
        </PixelText>
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
          <View style={{ flex: 1, backgroundColor: C.goodBg, borderWidth: 2, borderColor: C.goodBorder, padding: 8, minHeight: 68 }}>
            <PixelText font="pixel" size={7} color={C.good}>HOW PROSPERITY WORKS</PixelText>
            <PixelText font="body" size={14} color={C.textDark} style={{ marginTop: 4 }}>
              It equals your lowest resource. Reach 75% to earn {prosperityReward}g and 2 reputation yearly.
            </PixelText>
          </View>
          <View style={{ flex: 1, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.paleEdge, padding: 8, minHeight: 68 }}>
            <PixelText font="pixel" size={7} color={C.blueDeep}>POPULATION</PixelText>
            <PixelText font="body" size={14} color={C.textDark} style={{ marginTop: 4 }}>
              At 60+ in all three, people arrive and increase the payout.
            </PixelText>
          </View>
        </View>
        <PixelText font="body" size={14} color={C.bad} style={{ marginTop: 8 }}>
          Below 15 for two years can cause famine, raids, revolt, lost buildings, or lost rank.
        </PixelText>
      </View>

      {lockedByAge && (
        <View style={[PANEL.parchCard, { marginTop: 10 }]}>
          <PixelText font="pixel" size={8} color={C.amber}>UNDER REGENCY</PixelText>
          <PixelText font="body" size={15} color={C.textBrown} style={{ marginTop: 6 }}>
            Your family tends the land for now. You take command at age {HOLDING_UNLOCK_AGE}.
          </PixelText>
        </View>
      )}

      <View style={{ backgroundColor: flourishing ? C.goodBg : '#fff4d6', borderWidth: 2, borderColor: flourishing ? C.goodBorder : C.charmDark, padding: 10, marginTop: 10 }}>
        <PixelText font="pixel" size={8} color={flourishing ? C.good : C.amber}>
          {flourishing ? 'THE ESTATE IS THRIVING' : 'BEST NEXT MOVE'}
        </PixelText>
        <PixelText font="body" size={15} color={C.textDark} style={{ marginTop: 5 }}>{recommendation(state)}</PixelText>
      </View>

      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginTop: 14, marginBottom: 8 }}>THE YEARLY LEDGER</PixelText>
      <PixelBox bg={C.parch} shadow={C.parchSd} light={C.parchSl} innerStyle={{ padding: 10 }}>
        <ResourceMeter resource="stores" value={state.holding.stores} note={`Feeds the estate. Yearly upkeep costs ${upkeep.stores}.`} />
        <ResourceMeter resource="security" value={state.holding.security} note={`Stops raids and protects buildings. Yearly upkeep costs ${upkeep.security}.`} />
        <ResourceMeter resource="loyalty" value={state.holding.loyalty} note="Stops revolt and protects your reputation and rank." />
        {state.holding.criticalYears > 0 && (
          <PixelText font="body" size={14} color={C.bad}>Warning: another critical year will bring a major crisis.</PixelText>
        )}
      </PixelBox>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 8 }}>
        <PixelText font="pixel" size={8} color={C.blueDeep}>ONE ORDER THIS YEAR</PixelText>
        <PixelText font="body" size={14} color={managed ? C.faithDark : C.amber}>{managed ? 'ORDER GIVEN' : lockedByAge ? 'LOCKED' : 'READY'}</PixelText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {HOLDING_ACTIONS.map((action) => {
          const availability = holdingActionAvailability(state, action.id);
          const art = HOLDING_ACTION_ART[action.id as keyof typeof HOLDING_ACTION_ART];
          return (
            <PixelButton
              key={action.id}
              bg={C.parch}
              shadow={C.parchSd}
              light={C.parchSl}
              disabled={!availability.available}
              onPress={() => onAction(action.id)}
              style={{ width: '48.5%', marginBottom: 8 }}
              innerStyle={{ padding: 8, minHeight: 142 }}
            >
              <View style={{ width: 42, height: 42, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={art} resizeMode="contain" style={{ width: 36, height: 36 }} />
              </View>
              <PixelText font="pixel" size={7} color={C.textDark} style={{ marginTop: 7 }}>{action.name}</PixelText>
              <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 6 }}>{action.desc}</PixelText>
              {!availability.available && <PixelText font="body" size={12} color={C.bad} style={{ marginTop: 5 }}>{availability.reason}</PixelText>}
            </PixelButton>
          );
        })}
      </View>

      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginTop: 7, marginBottom: 8 }}>PERMANENT BUILDINGS</PixelText>
      <PixelText font="body" size={14} color={C.textMuted} style={{ marginBottom: 8 }}>
        Buildings cost gold once, improve future years, and pass to an heir with the estate.
      </PixelText>
      <View style={{ gap: 8 }}>
        {HOLDING_UPGRADES.map((upgrade) => {
          const availability = holdingUpgradeAvailability(state, upgrade.id);
          const owned = state.holding.upgrades.includes(upgrade.id);
          const active = isHoldingUpgradeActive(state, upgrade.id);
          const art = HOLDING_UPGRADE_ART[upgrade.id as keyof typeof HOLDING_UPGRADE_ART];
          return (
            <PixelButton
              key={upgrade.id}
              bg={owned ? C.lightFill : C.parch}
              shadow={owned ? C.faithDark : C.parchSd}
              light={C.parchSl}
              disabled={!availability.available}
              onPress={() => onUpgrade(upgrade.id)}
              innerStyle={{ padding: 11, minHeight: 76 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 50, height: 50, flexShrink: 0, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={art} resizeMode="contain" style={{ width: 44, height: 44 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                    <PixelText font="pixel" size={7} color={C.textDark}>{upgrade.name}</PixelText>
                    <PixelText font="body" size={14} color={owned ? C.faithDark : C.amber}>
                      {owned ? active ? 'OWNED' : 'DORMANT' : `${upgrade.price}g`}
                    </PixelText>
                  </View>
                  <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 5 }}>{upgrade.desc}</PixelText>
                  {!availability.available && !owned && <PixelText font="body" size={12} color={C.bad} style={{ marginTop: 4 }}>{availability.reason}</PixelText>}
                </View>
              </View>
            </PixelButton>
          );
        })}
      </View>
    <HoldingExpansionPanel />
    </ScrollView>
  );
}
