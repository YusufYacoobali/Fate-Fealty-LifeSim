import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { PixelText } from './ui/PixelText';
import { PixelButton } from './ui/PixelButton';
import { C } from '@/theme/theme';

/** The pulsing "AGE UP" call-to-action. The bob mirrors the mockup animation. */
export function AgeUpBar({ onAgeUp, disabled, actionsUsed, actionCap }: { onAgeUp: () => void; disabled?: boolean; actionsUsed: number; actionCap: number }) {
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
      <PixelText font="pixel" size={8} color={actionsUsed >= actionCap ? C.health : C.creamBlue} style={{ textAlign: 'center', marginBottom: 6 }}>
        ACTIONS REMAINING: {Math.max(0, actionCap - actionsUsed)}/{actionCap}
      </PixelText>
      <Animated.View style={{ transform: [{ translateY: bob }] }}>
        <PixelButton bg={C.charm} shadow={C.charmDark} light="#fff1b0" onPress={onAgeUp} disabled={disabled} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
          <PixelText font="pixel" size={12} color="#3a2a08">
            ▲ AGE UP
          </PixelText>
        </PixelButton>
      </Animated.View>
    </View>
  );
}
