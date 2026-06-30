import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

interface Props {
  value: number; // 0..100
  color: string;
  dark: string;
  height?: number;
  trackBg?: string;
  trackBorder?: string;
  /** Set false to render instantly (e.g. inside a static list). */
  animated?: boolean;
}

/**
 * A chunky pixel progress bar. The fill animates smoothly toward the target
 * value (measured in px so we can use the layout-driven Animated width), which
 * gives stat changes a satisfying "tick" rather than a hard jump.
 */
export function StatBar({ value, color, dark, height = 8, trackBg = '#0d2a4a', trackBorder = '#0a2038', animated = true }: Props) {
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const [width, setWidth] = useState(0);
  const anim = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(anim, { toValue: pct, duration: 450, useNativeDriver: false }).start();
    } else {
      anim.setValue(pct);
    }
  }, [pct, anim, animated]);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height, backgroundColor: trackBg, borderWidth: 2, borderColor: trackBorder, overflow: 'hidden' }}
    >
      <Animated.View
        style={{
          height: '100%',
          width: anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(0, width - 4)] }),
          backgroundColor: color,
          borderBottomWidth: Math.max(2, Math.floor(height / 4)),
          borderBottomColor: dark,
        }}
      />
    </View>
  );
}
