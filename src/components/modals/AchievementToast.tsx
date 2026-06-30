import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { achievementById } from '@/data/achievements';
import { C } from '@/theme/theme';

interface Props {
  /** Id of the achievement to celebrate; null when the queue is empty. */
  id: string | null;
  onDone: () => void;
}

/**
 * A self-dismissing banner that slides down to announce a freshly unlocked
 * achievement, then calls `onDone` so the next queued one can show.
 */
export function AchievementToast({ id, onDone }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const a = id ? achievementById(id) : undefined;

  useEffect(() => {
    if (!a) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 7 }),
      Animated.delay(2200),
      Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [id, a, anim, onDone]);

  if (!a) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 8,
        left: 12,
        right: 12,
        zIndex: 80,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          backgroundColor: '#0f274a',
          borderWidth: 3,
          borderColor: C.charm,
          borderBottomColor: C.charmDark,
          borderRightColor: C.charmDark,
          paddingHorizontal: 11,
          paddingVertical: 9,
        }}
      >
        <PixelText size={22}>{a.emoji}</PixelText>
        <View style={{ flex: 1, minWidth: 0 }}>
          <PixelText font="pixel" size={6} color={C.charm}>
            ACHIEVEMENT UNLOCKED
          </PixelText>
          <PixelText font="body" size={17} color={C.cream} style={{ marginTop: 3 }}>
            {a.name}
          </PixelText>
        </View>
      </View>
    </Animated.View>
  );
}
