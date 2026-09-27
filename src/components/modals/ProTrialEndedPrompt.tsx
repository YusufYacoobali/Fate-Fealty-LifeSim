import React, { useState } from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';
import { FullScreenPage } from '@/components/premium/FullScreenPage';
import { OnboardingPaywallPanel } from '@/components/premium/onboarding-paywall-panel';
import { useGame } from '@/state/GameContext';

interface Props {
  /** Kept for compatibility with the existing GameScreen call site. */
  onExplore: () => void;
  onDismiss: () => void;
}

/**
 * The free first-life sample has already demonstrated Premium's value, so this
 * is the strongest subscription moment in the game: go straight to the
 * yearly-first subscription offer instead of adding an extra teaser tap.
 * Lifetime stays out of this surface so Yearly remains the obvious default.
 */
export function ProTrialEndedPrompt({ onDismiss }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 390 || height < 780;
  const [restoring, setRestoring] = useState(false);
  const { premiumEntitled, premiumAccessState, purchasePlan, restorePremium } = useGame();

  const footer = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <TouchableOpacity
        disabled={restoring}
        onPress={async () => {
          setRestoring(true);
          let restored = false;
          try {
            restored = await restorePremium();
          } finally {
            setRestoring(false);
          }
          if (restored) onDismiss();
        }}
        style={{ padding: 7 }}
      >
        <PixelText font="body" size={14} color={C.creamBlue}>
          {restoring ? 'Restoring...' : 'Restore purchases'}
        </PixelText>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} style={{ padding: 7 }}>
        <PixelText font="body" size={14} color={C.creamBlue}>
          Continue free &gt;
        </PixelText>
      </TouchableOpacity>
    </View>
  );

  return (
    <FullScreenPage
      title="KEEP THE ROYAL FAVOUR"
      zIndex={76}
      footer={footer}
      contentMaxWidth={620}
      contentPadding={compact ? 8 : 10}
      backgroundColor="#0a3768"
      headerBackgroundColor="#082c56"
      headerBorderColor="#b8790a"
      footerBackgroundColor="#082c56"
      footerBorderColor="#b8790a"
    >
      <View
        style={{
          backgroundColor: '#10477e',
          borderWidth: 3,
          borderColor: '#b8790a',
          paddingHorizontal: compact ? 10 : 14,
          paddingVertical: compact ? 9 : 12,
          marginBottom: compact ? 7 : 10,
        }}
      >
        <PixelText font="pixel" size={compact ? 7 : 8} color={C.charm} style={{ textAlign: 'center' }}>
          THY FREE ROYAL LIFE HAS ENDED
        </PixelText>
        <PixelText
          font="body"
          size={compact ? 14 : 16}
          color={C.cream}
          style={{ textAlign: 'center', marginTop: 6 }}
        >
          Thou hast already lived with Premium. Keep 50 deeds each year, the rise to Baron and Monarch, royal Holding
          orders, and Premium stories in every life.
        </PixelText>
      </View>

      <OnboardingPaywallPanel
        compact={compact}
        unlocked={premiumEntitled}
        accessState={premiumAccessState}
        onPurchase={purchasePlan}
        onRestore={restorePremium}
        onUnlocked={onDismiss}
      />
    </FullScreenPage>
  );
}
