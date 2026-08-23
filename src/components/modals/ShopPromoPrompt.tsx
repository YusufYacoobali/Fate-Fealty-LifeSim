import React from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import { RANK_PORTRAITS } from '@/assets/generatedAssets';
import { SHOP_PROMO_MESSAGES } from '@/services/shopPromoLogic';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';

interface Props {
  messageIndex: number;
  onExplore: () => void;
  onDismiss: () => void;
}

/** A playful, low-pressure invitation into the in-game premium shop. */
export function ShopPromoPrompt({ messageIndex, onExplore, onDismiss }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 340 || height < 620;
  const message = SHOP_PROMO_MESSAGES[messageIndex] ?? SHOP_PROMO_MESSAGES[0];
  const portraitFrame = compact ? 58 : 72;

  return (
    <ModalBackdrop zIndex={57}>
      <View
        style={{
          width: '100%',
          maxWidth: 440,
          alignSelf: 'center',
          backgroundColor: C.parch,
          borderWidth: 4,
          borderColor: C.inkSoft,
          borderTopColor: C.parchSl,
          borderLeftColor: C.parchSl,
          borderBottomColor: C.parchSd,
          borderRightColor: C.parchSd,
          padding: compact ? 10 : 14,
        }}
      >
        <View
          style={{
            backgroundColor: C.blueDeep,
            borderWidth: 3,
            borderColor: C.inkSoft,
            borderBottomColor: C.blueDark,
            borderRightColor: C.blueDark,
            paddingHorizontal: 8,
            paddingVertical: compact ? 5 : 7,
          }}
        >
          <PixelText font="pixel" size={compact ? 7 : 8} color={C.charm} style={{ textAlign: 'center' }}>
            {message.heading}
          </PixelText>
        </View>

        <View style={{ alignItems: 'center', gap: compact ? 6 : 9, paddingVertical: compact ? 9 : 13 }}>
          <View
            style={{
              width: portraitFrame,
              height: portraitFrame,
              backgroundColor: C.lightFill,
              borderWidth: 3,
              borderColor: C.inkSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={RANK_PORTRAITS.Monarch}
              resizeMode="contain"
              style={{ width: portraitFrame - 10, height: portraitFrame - 10 }}
            />
          </View>
          <PixelText font="body" size={compact ? 18 : 20} color={C.textDark} style={{ textAlign: 'center' }}>
            {message.title}
          </PixelText>
          <PixelText font="body" size={compact ? 15 : 17} color={C.textBrown} style={{ textAlign: 'center' }}>
            {message.body}
          </PixelText>
        </View>

        <View style={{ gap: 8 }}>
          <PixelButton
            bg={C.charm}
            shadow={C.charmDark}
            light="#fff1b0"
            onPress={onExplore}
            innerStyle={{ paddingVertical: compact ? 9 : 11, paddingHorizontal: 6, alignItems: 'center' }}
          >
            <PixelText font="pixel" size={compact ? 7 : 8} color="#3a2a08" style={{ textAlign: 'center' }}>
              {message.cta}
            </PixelText>
          </PixelButton>
          <PixelButton
            bg={C.lightFill}
            shadow={C.paleEdge}
            onPress={onDismiss}
            innerStyle={{ paddingVertical: compact ? 8 : 9, alignItems: 'center' }}
          >
            <PixelText font="pixel" size={8} color={C.blue}>
              NOT THIS YEAR
            </PixelText>
          </PixelButton>
        </View>
      </View>
    </ModalBackdrop>
  );
}
