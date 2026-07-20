import React from 'react';
import { TouchableOpacity, useWindowDimensions } from 'react-native';
import { C } from '@/theme/theme';
import { PixelText } from '@/components/ui/PixelText';
import { FullScreenPage } from '@/components/premium/FullScreenPage';
import { RoyalShopOfferPanel } from '@/components/premium/onboarding-paywall-panel';
import { PlanId } from '@/data/premiumPlans';
import { PurchaseOutcome } from '@/services/purchases';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

interface Props {
  unlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: (plan: PlanId) => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  onClose: () => void;
}

/** Full-screen premium storefront, reachable any time from the game. */
export function PremiumShopScreen({ unlocked, accessState, onPurchase, onRestore, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 390 || height < 720;

  return (
    <FullScreenPage
      title="ROYAL SHOP"
      zIndex={75}
      headerRight={
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close shop" style={{ padding: 4 }}>
          <PixelText font="pixel" size={10} color={C.cream}>
            X
          </PixelText>
        </TouchableOpacity>
      }
      contentMaxWidth={620}
      contentPadding={compact ? 8 : 10}
      backgroundColor="#0a3768"
      headerBackgroundColor="#082c56"
      headerBorderColor="#b8790a"
    >
      <RoyalShopOfferPanel
        compact={compact}
        unlocked={unlocked}
        accessState={accessState}
        onPurchase={onPurchase}
        onRestore={onRestore}
      />
    </FullScreenPage>
  );
}
