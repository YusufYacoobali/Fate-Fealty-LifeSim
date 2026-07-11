import React, { useState } from 'react';
import { View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { ModalBackdrop } from './ModalBackdrop';
import { LifetimeOffer } from '../LifetimeOffer';
import { PurchaseOutcome } from '@/services/purchases';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

interface Props {
  unlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: () => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  onClose: () => void;
}

export const OUTCOME_MESSAGES: Record<PurchaseOutcome, string> = {
  purchased: 'Lifetime Pass unlocked. Long may you reign!',
  cancelled: 'Purchase cancelled.',
  unavailable: 'The royal treasury is unreachable. Try again later.',
  error: 'Something went awry. No coin was taken — try again.',
};

export function ProShopModal({ unlocked, accessState, onPurchase, onRestore, onClose }: Props) {
  const [message, setMessage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('Summoning the royal treasury…');
    try {
      const outcome = await onPurchase();
      setMessage(OUTCOME_MESSAGES[outcome]);
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('Consulting the ledgers…');
    try {
      const restored = await onRestore();
      setMessage(restored ? 'Lifetime Pass restored.' : 'No saved Lifetime Pass was found.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop zIndex={75}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 15 }}>
        <View style={{ backgroundColor: C.charm, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, paddingHorizontal: 8, paddingVertical: 7 }}>
          <PixelText font="pixel" size={9} color="#3a2a08" style={{ textAlign: 'center' }}>
            🛒 ROYAL CART
          </PixelText>
        </View>

        <LifetimeOffer
          unlocked={unlocked}
          accessState={accessState}
          message={message}
          loading={busy}
          onPurchase={buy}
          onRestore={restore}
        />

        <PixelButton bg={C.light} shadow={C.blue} light={C.sky} onPress={onClose} style={{ marginTop: 10 }} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color={C.blueDark}>
            CLOSE
          </PixelText>
        </PixelButton>
      </View>
    </ModalBackdrop>
  );
}
