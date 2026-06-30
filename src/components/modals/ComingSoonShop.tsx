import React from 'react';
import { View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { ModalBackdrop } from './ModalBackdrop';
import { LifetimeOffer } from '../LifetimeOffer';

export function ComingSoonShop({ onClose }: { onClose: () => void }) {
  return (
    <ModalBackdrop zIndex={75}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 15 }}>
        <View style={{ backgroundColor: C.charm, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, paddingHorizontal: 8, paddingVertical: 7 }}>
          <PixelText font="pixel" size={9} color="#3a2a08" style={{ textAlign: 'center' }}>
            🛒 ROYAL CART
          </PixelText>
        </View>

        <LifetimeOffer />

        <PixelButton bg={C.light} shadow={C.blue} light={C.sky} onPress={onClose} style={{ marginTop: 10 }} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color={C.blueDark}>
            CLOSE
          </PixelText>
        </PixelButton>
      </View>
    </ModalBackdrop>
  );
}
