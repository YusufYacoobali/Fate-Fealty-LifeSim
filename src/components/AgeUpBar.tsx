import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { PixelText } from './ui/PixelText';
import { PixelButton } from './ui/PixelButton';
import { C } from '@/theme/theme';

/** The pulsing "AGE UP" call-to-action. The bob mirrors the mockup animation. */
export function AgeUpBar({ onAgeUp, disabled }: { onAgeUp: () => void; disabled?: boolean }) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (disabled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -3, duration: 850, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 850, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, disabled]);

  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, backgroundColor: C.blueDeep, borderTopWidth: 4, borderTopColor: C.blueDark }}>
      <Animated.View style={{ transform: [{ translateY: bob }] }}>
        <PixelButton bg={C.charm} shadow={C.charmDark} light="#fff1b0" onPress={onAgeUp} disabled={disabled} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
          <PixelText font="pixel" size={11} color="#3a2a08">
            ▲ AGE UP
          </PixelText>
        </PixelButton>
      </Animated.View>
    </View>
  );
}
