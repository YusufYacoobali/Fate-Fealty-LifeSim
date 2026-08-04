import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View, useWindowDimensions } from 'react-native';
import { RANKS } from '@/data/ranks';
import { holdingTitle } from '@/data/holding';
import { rankPortraitAsset } from '@/assets/generatedAssets';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';

interface Props {
  rankIdx: number;
  reducedMotion: boolean;
  onDone: () => void;
}

/** What the new station actually unlocks, in the player's own terms. */
const RANK_MEANING: Record<number, string> = {
  1: 'A squire eats better, trains under a real blade, and is finally worth someone noticing.',
  2: 'A knight carries steel by right, holds a manor, and answers to lords rather than reeves.',
  3: 'A noble commands lands and tenants, and the Crown now knows thy family name.',
  4: 'A baron holds a barony in his own right, with courts, levies and enemies to match.',
  5: 'A monarch rules the realm. There is no one left above thee to blame.',
};

/** Rays of gold behind the portrait; the one moment the UI is allowed to shout. */
function Sunburst({ size }: { size: number }) {
  return (
    <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: 12 }, (_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            width: 5,
            height: size,
            backgroundColor: index % 2 === 0 ? C.charm : '#fff1b0',
            opacity: 0.35,
            transform: [{ rotate: `${index * 15}deg` }],
          }}
        />
      ))}
    </View>
  );
}

export function PromotionScreen({ rankIdx, reducedMotion, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 660;
  const rank = RANKS[rankIdx];
  const previous = RANKS[rankIdx - 1];
  const portrait = rankPortraitAsset(rank.key);
  const frame = compact ? 104 : 132;

  const rise = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.sequence([
      Animated.timing(rise, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, rise, spin]);

  const scale = rise.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ModalBackdrop zIndex={82}>
      <View
        style={{
          width: '100%',
          maxWidth: 460,
          alignSelf: 'center',
          backgroundColor: '#0a3768',
          borderWidth: 4,
          borderColor: C.charm,
          borderBottomColor: C.charmDark,
          borderRightColor: C.charmDark,
          padding: compact ? 12 : 18,
          alignItems: 'center',
        }}
      >
        <PixelText font="pixel" size={compact ? 8 : 9} color={C.charm} style={{ textAlign: 'center' }}>
          ✦ THY STATION RISES ✦
        </PixelText>

        <View style={{ width: frame, height: frame, alignItems: 'center', justifyContent: 'center', marginVertical: compact ? 12 : 18 }}>
          <Animated.View style={{ position: 'absolute', transform: [{ rotate }] }}>
            <Sunburst size={frame} />
          </Animated.View>
          <Animated.View
            style={{
              transform: [{ scale }],
              width: frame - 26,
              height: frame - 26,
              backgroundColor: C.sky,
              borderWidth: 4,
              borderColor: C.charm,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {portrait ? (
              <Image source={portrait} resizeMode="contain" style={{ width: frame - 40, height: frame - 40 }} />
            ) : (
              <PixelText size={44}>{rank.portrait}</PixelText>
            )}
          </Animated.View>
        </View>

        <PixelText font="body" size={compact ? 17 : 19} color={C.creamBlue} style={{ textAlign: 'center' }}>
          {previous ? `No longer a ${previous.key.toLowerCase()}.` : 'A new beginning.'}
        </PixelText>
        <PixelText font="pixel" size={compact ? 14 : 17} color={C.charm} style={{ textAlign: 'center', marginTop: 8 }}>
          {rank.key.toUpperCase()}
        </PixelText>

        <View style={{ backgroundColor: '#082c56', borderWidth: 3, borderColor: C.inkSoft, padding: 10, marginTop: 14, width: '100%' }}>
          <PixelText font="body" size={compact ? 16 : 17} color={C.cream} style={{ textAlign: 'center' }}>
            {RANK_MEANING[rankIdx] ?? 'The village adjusts its opinion of thee, loudly.'}
          </PixelText>
          <PixelText font="body" size={15} color={C.charm} style={{ textAlign: 'center', marginTop: 8 }}>
            Thy lands are now {holdingTitle(rankIdx)}.
          </PixelText>
        </View>

        <PixelButton
          bg={C.charm}
          shadow={C.charmDark}
          light="#fff1b0"
          onPress={onDone}
          style={{ marginTop: 16, width: '100%' }}
          innerStyle={{ paddingVertical: 12, alignItems: 'center' }}
        >
          <PixelText font="pixel" size={compact ? 8 : 9} color="#3a2a08">
            CLAIM THY PLACE
          </PixelText>
        </PixelButton>
      </View>
    </ModalBackdrop>
  );
}
