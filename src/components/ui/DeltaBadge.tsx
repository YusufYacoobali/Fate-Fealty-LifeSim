import React, { useEffect, useRef, useState } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { PixelText } from './PixelText';
import { C } from '@/theme/theme';

interface Props {
  /** The current value; the badge shows the change since it last changed. */
  value: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A transient floating "+4 / −2" badge that pops whenever the watched value
 * changes, then drifts up and fades. Self-contained (tracks its own previous
 * value) so it can be dropped beside any stat or the gold counter.
 */
export function DeltaBadge({ value, size = 12, style }: Props) {
  const prev = useRef(value);
  const [delta, setDelta] = useState(0);
  const [nonce, setNonce] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const d = value - prev.current;
    prev.current = value;
    if (d !== 0) {
      setDelta(d);
      setNonce((n) => n + 1);
    }
  }, [value]);

  useEffect(() => {
    if (nonce === 0) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(550),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [nonce, anim]);

  if (delta === 0) return null;
  const positive = delta > 0;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [6, -10] }) }],
        },
        style,
      ]}
    >
      <PixelText font="body" size={size} color={positive ? C.faith : C.health}>
        {positive ? '+' : ''}
        {delta}
      </PixelText>
    </Animated.View>
  );
}
