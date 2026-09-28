import React from 'react';
import { useOpenPremiumShop } from '../premium/PremiumShopContext';
import { C } from '@/theme/theme';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';

/** A locked activity opens the existing storefront without starting or charging for it. */
export function ProUnlockButton({ feature }: { feature: string }) {
  const openShop = useOpenPremiumShop();
  return <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={openShop} style={{ marginTop: 8 }} innerStyle={{ padding: 12, minHeight: 44 }}>
    <PixelText font="pixel" size={7} color={C.blueDark}>{feature} · PRO</PixelText>
    <PixelText font="body" size={16} color={C.textBrown} style={{ marginTop: 4 }}>Unlock with Pro</PixelText>
  </PixelButton>;
}
