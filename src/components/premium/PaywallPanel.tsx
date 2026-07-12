import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { PlanPicker } from './PlanPicker';
import { PREMIUM_BENEFITS, PREMIUM_PLANS, PlanId } from '@/data/premiumPlans';
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
  /** Called after a confirmed purchase or successful restore (e.g. advance onboarding). */
  onUnlocked?: () => void;
  ctaLabel?: string;
}

/**
 * The complete sales pitch: benefits, plan selection, CTA, restore. Shared by
 * the onboarding paywall and the premium shop so pricing and behaviour never
 * drift between surfaces.
 */
export function PaywallPanel({ planIds, unlocked, accessState, onPurchase, onRestore, onUnlocked, ctaLabel = 'UNLOCK PREMIUM' }: Props) {
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
      <View style={{ backgroundColor: C.blueDeep, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.blueDark, borderRightColor: C.blueDark, padding: 14, alignItems: 'center' }}>
        <PixelText font="pixel" size={10} color={C.charm}>
          👑 PREMIUM OWNED
        </PixelText>
        <PixelText font="body" size={16} color={C.creamBlue} style={{ marginTop: 7, textAlign: 'center' }}>
          Baron, Monarch, and every future chapter are yours. Long may you reign.
        </PixelText>
      </View>
    );
  }

  return (
    <View>
      {/* what you get */}
      <View style={{ gap: 6, marginBottom: 12 }}>
        {PREMIUM_BENEFITS.map((benefit) => (
          <View key={benefit} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 12, height: 12, backgroundColor: C.faith, borderWidth: 2, borderColor: C.faithDark }} />
            <PixelText font="body" size={16} color={C.textDark} style={{ flex: 1 }}>
              {benefit}
            </PixelText>
          </View>
        ))}
      </View>

      <PlanPicker planIds={planIds} selected={selected} onSelect={setSelected} offers={offers} />

      <PixelButton
        disabled={buyDisabled}
        bg={C.charm}
        shadow={C.charmDark}
        light="#fff1b0"
        onPress={handleBuy}
        style={{ marginTop: 12 }}
        innerStyle={{ paddingVertical: 13, alignItems: 'center' }}
      >
        <PixelText font="pixel" size={9} color="#3a2a08">
          {ctaText}
        </PixelText>
      </PixelButton>

      <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 6, textAlign: 'center' }}>
        {storeBlocked ? 'The store is unreachable right now.' : PREMIUM_PLANS[selected].ctaNote}
      </PixelText>

      <TouchableOpacity onPress={handleRestore} disabled={busy} style={{ marginTop: 8, alignSelf: 'center', padding: 4 }}>
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
