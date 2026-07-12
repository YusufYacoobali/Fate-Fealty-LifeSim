import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelText } from '@/components/ui/PixelText';
import { FullScreenPage } from '@/components/premium/FullScreenPage';
import { PaywallPanel } from '@/components/premium/PaywallPanel';
import { RANK_PORTRAITS } from '@/assets/generatedAssets';
import { SHOP_PLAN_IDS, PlanId } from '@/data/premiumPlans';
import { PurchaseOutcome } from '@/services/purchases';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

interface Props {
  unlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: (plan: PlanId) => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  onClose: () => void;
}

/** Full-screen premium storefront: every plan, reachable any time from the game. */
export function PremiumShopScreen({ unlocked, accessState, onPurchase, onRestore, onClose }: Props) {
  return (
    <FullScreenPage
      title="👑 ROYAL SHOP"
      zIndex={75}
      headerRight={
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close shop" style={{ padding: 4 }}>
          <PixelText font="pixel" size={10} color={C.cream}>
            ✕
          </PixelText>
        </TouchableOpacity>
      }
    >
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 76, height: 76, backgroundColor: C.lightFill, borderWidth: 3, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Image source={RANK_PORTRAITS.Monarch} resizeMode="contain" style={{ width: 66, height: 66 }} />
        </View>
        <PixelText font="pixel" size={11} color={C.blueDeep} style={{ textAlign: 'center' }}>
          {unlocked ? 'LONG MAY YOU REIGN' : 'OWN THE BIGGER LIFE'}
        </PixelText>
        {!unlocked && (
          <PixelText font="body" size={16} color={C.textBrown} style={{ textAlign: 'center', marginTop: 6 }}>
            Baron and Monarch await. Pick the pact that suits your reign.
          </PixelText>
        )}
      </View>

      <PaywallPanel
        planIds={SHOP_PLAN_IDS}
        unlocked={unlocked}
        accessState={accessState}
        onPurchase={onPurchase}
        onRestore={onRestore}
        ctaLabel="UNLOCK PREMIUM"
      />
    </FullScreenPage>
  );
}
