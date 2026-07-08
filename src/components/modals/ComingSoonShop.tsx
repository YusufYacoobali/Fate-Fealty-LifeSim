import React, { useState } from 'react';
import { View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { ModalBackdrop } from './ModalBackdrop';
import { LifetimeOffer } from '../LifetimeOffer';

interface Props {
  unlocked: boolean;
  onPurchase: () => void;
  onRestore: () => boolean;
  onClose: () => void;
}

export function ComingSoonShop({ unlocked, onPurchase, onRestore, onClose }: Props) {
  const [message, setMessage] = useState<string | undefined>();

  const buy = () => {
    onPurchase();
    setMessage('Lifetime Pass unlocked on this device.');
  };

  const restore = () => {
    const restored = onRestore();
    setMessage(restored ? 'Lifetime Pass restored.' : 'No saved Lifetime Pass was found.');
  };

  return (
    <ModalBackdrop zIndex={75}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 15 }}>
        <View style={{ backgroundColor: C.charm, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, paddingHorizontal: 8, paddingVertical: 7 }}>
          <PixelText font="pixel" size={9} color="#3a2a08" style={{ textAlign: 'center' }}>
            🛒 ROYAL CART
          </PixelText>
        </View>

        <LifetimeOffer unlocked={unlocked} message={message} onPurchase={buy} onRestore={restore} />

        <PixelButton bg={C.light} shadow={C.blue} light={C.sky} onPress={onClose} style={{ marginTop: 10 }} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color={C.blueDark}>
            CLOSE
          </PixelText>
        </PixelButton>
      </View>
    </ModalBackdrop>
  );
}
