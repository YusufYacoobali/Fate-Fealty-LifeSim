import React from 'react';
import { ScrollView, View } from 'react-native';
import { C } from '@/theme/theme';
import { LifetimeOffer } from '../LifetimeOffer';
import { PixelText } from '../ui/PixelText';

export function ShopTab() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 12 }}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 14 }}>
        <View style={{ backgroundColor: C.charm, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, paddingHorizontal: 8, paddingVertical: 7 }}>
          <PixelText font="pixel" size={9} color="#3a2a08" style={{ textAlign: 'center' }}>
            ROYAL CART
          </PixelText>
        </View>
        <LifetimeOffer />
      </View>
    </ScrollView>
  );
}
