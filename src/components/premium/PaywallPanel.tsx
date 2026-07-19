import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { C } from '@/theme/theme';
import { ACTIVITY_ICONS, HOLDING_ACTION_ART, RANK_PORTRAITS, STAT_ICONS } from '@/assets/generatedAssets';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { PlanPicker } from './PlanPicker';
import { PREMIUM_BENEFIT_DETAILS, PREMIUM_PLANS, PlanId } from '@/data/premiumPlans';
import { PurchaseOutcome } from '@/services/purchases';
import { usePremiumOffers } from '@/state/hooks/usePremiumOffers';
import { usePurchaseFlow } from '@/state/hooks/usePurchaseFlow';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

interface Props {
  /** Plans to offer, first one preselected. */
  planIds: PlanId[];
  unlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: (plan: PlanId) => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  /** Called after a confirmed purchase or successful restore. */
  onUnlocked?: () => void;
  ctaLabel?: string;
  variant?: 'standard' | 'onboarding';
}

const BENEFIT_ART = [
  HOLDING_ACTION_ART.work_land,
  RANK_PORTRAITS.Monarch,
  ACTIVITY_ICONS.quest,
  STAT_ICONS.health,
  ACTIVITY_ICONS.fair,
] as const;

/** Shared premium pitch used by onboarding and the in-game premium shop. */
export function PaywallPanel({
  planIds,
  unlocked,
  accessState,
  onPurchase,
  onRestore,
  onUnlocked,
  ctaLabel = 'UNLOCK PREMIUM',
  variant = 'standard',
}: Props) {
  const [selected, setSelected] = useState<PlanId>(planIds[0]);
  const { offers, storeUnavailable } = usePremiumOffers(!unlocked);
  const { message, busy, buy, restore } = usePurchaseFlow(onPurchase, onRestore);

  const checkingAccess = accessState === 'loading';
  const storeBlocked = storeUnavailable || accessState === 'unavailable';
  const selectedMissing = !!offers && !offers[selected].available;
  const buyDisabled = unlocked || busy || checkingAccess || storeBlocked || selectedMissing;

  const ctaText = unlocked
    ? 'OWNED'
    : busy
      ? 'WORKING...'
      : checkingAccess
        ? 'CHECKING...'
        : storeBlocked || selectedMissing
          ? 'NOT AVAILABLE'
          : ctaLabel;

  const handleBuy = async () => {
    const outcome = await buy(selected);
    if (outcome === 'purchased') onUnlocked?.();
  };

  const handleRestore = async () => {
    const restored = await restore();
    if (restored) onUnlocked?.();
  };

  if (unlocked) {
    return (
      <View
        style={{
          backgroundColor: C.blueDeep,
          borderWidth: 3,
          borderColor: C.inkSoft,
          borderBottomColor: C.blueDark,
          borderRightColor: C.blueDark,
          padding: 16,
          alignItems: 'center',
        }}
      >
        <Image source={RANK_PORTRAITS.Monarch} resizeMode="contain" style={{ width: 72, height: 72 }} />
        <PixelText font="pixel" size={10} color={C.charm} style={{ marginTop: 8 }}>
          PREMIUM OWNED
        </PixelText>
        <PixelText font="body" size={16} color={C.creamBlue} style={{ marginTop: 7, textAlign: 'center' }}>
          Baron, Monarch, every premium story, and future premium chapters are yours. Long may you reign.
        </PixelText>
      </View>
    );
  }

  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <PixelText font="pixel" size={variant === 'onboarding' ? 10 : 9} color={C.blueDeep} style={{ textAlign: 'center' }}>
          UNLOCK THE BIGGER LIFE
        </PixelText>
        <PixelText font="body" size={16} color={C.textBrown} style={{ textAlign: 'center', marginTop: 6 }}>
          More ways to rule, more stories to discover, and future premium chapters included.
        </PixelText>
      </View>

      <View style={{ gap: 8, marginBottom: 14 }}>
        {PREMIUM_BENEFIT_DETAILS.map((benefit, index) => (
          <View
            key={benefit.title}
            style={{
              minHeight: 78,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: index === 0 ? '#fff4c7' : C.parchSl,
              borderWidth: 2,
              borderColor: index === 0 ? C.charmDark : C.parchSd,
              padding: 10,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: index === 0 ? C.charm : C.lightFill,
                borderWidth: 2,
                borderColor: C.inkSoft,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Image source={BENEFIT_ART[index]} resizeMode="contain" style={{ width: 40, height: 40 }} />
            </View>
            <View style={{ flex: 1 }}>
              <PixelText font="pixel" size={7} color={C.blueDeep}>
                {benefit.title}
              </PixelText>
              <PixelText font="body" size={15} color={C.textBrown} style={{ marginTop: 4 }}>
                {benefit.body}
              </PixelText>
            </View>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: C.blueDeep, borderWidth: 3, borderColor: C.inkSoft, padding: 10 }}>
        <PixelText font="pixel" size={8} color={C.charm} style={{ textAlign: 'center', marginBottom: 9 }}>
          CHOOSE THY PASS
        </PixelText>
        <PlanPicker planIds={planIds} selected={selected} onSelect={setSelected} offers={offers} />
      </View>

      <PixelButton
        disabled={buyDisabled}
        bg={C.charm}
        shadow={C.charmDark}
        light="#fff1b0"
        onPress={handleBuy}
        style={{ marginTop: 12 }}
        innerStyle={{ minHeight: 52, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
      >
        <PixelText font="pixel" size={9} color="#3a2a08" style={{ textAlign: 'center' }}>
          {ctaText}
        </PixelText>
      </PixelButton>

      <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 7, textAlign: 'center' }}>
        {storeBlocked ? 'The store is unreachable right now.' : PREMIUM_PLANS[selected].ctaNote}
      </PixelText>

      <TouchableOpacity onPress={handleRestore} disabled={busy} style={{ marginTop: 8, alignSelf: 'center', padding: 5 }}>
        <PixelText font="body" size={14} color={C.blue}>
          Restore purchases
        </PixelText>
      </TouchableOpacity>

      {!!message && (
        <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 4, textAlign: 'center' }}>
          {message}
        </PixelText>
      )}
    </View>
  );
}
