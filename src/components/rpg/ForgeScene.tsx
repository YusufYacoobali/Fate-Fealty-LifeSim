import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { PixelLottie } from '../ui/PixelLottie';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';
import { haptic } from '@/services/haptics';
import { useReducedMotion } from 'react-native-reanimated';
const hammer = require('../../../assets/animations/pixel-hammer.json');

export function ForgeScene({ scores, active, reducedMotion, haptics }: { scores: number[]; active: boolean; reducedMotion: boolean; haptics: boolean }) {
  const systemReducedMotion = useReducedMotion();
  const previous = useRef(scores.length);
  const [strike, setStrike] = useState(0);
  useEffect(() => {
    if (scores.length > previous.current) {
      setStrike(n => n + 1);
      haptic(scores[scores.length - 1] === 100 ? 'heavy' : 'medium', haptics);
    }
    previous.current = scores.length;
  }, [scores, haptics]);
  const last = scores[scores.length - 1];
  return <View style={{ borderWidth: 3, borderColor: C.inkSoft, backgroundColor: C.ink }}>
    <View style={{ width: '100%', aspectRatio: 320 / 208, overflow: 'hidden' }}>
      <Image source={require('../../../assets/generated/forge-workshop-pixel.png')} resizeMode="stretch" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} accessible={false} />
      <PixelLottie source={hammer} trigger={strike} active={active} reducedMotion={reducedMotion || systemReducedMotion} />
    </View>
    <View style={{ paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', gap: 8, backgroundColor: C.blueDark, borderTopWidth: 2, borderColor: C.blue }}>
      <PixelText font="pixel" size={7} color={C.goldText}>{last === undefined ? 'HEAT. AIM. STRIKE.' : last === 100 ? 'PERFECT STRIKE!' : last === 60 ? 'GOOD STRIKE' : 'MISSED THE MARK'}</PixelText>
      <PixelText font="pixel" size={7} color={C.cream}>{scores.length} / 5</PixelText>
    </View>
  </View>;
}
