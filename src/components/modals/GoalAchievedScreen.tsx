import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, useWindowDimensions } from 'react-native';
import { goalById } from '@/data/goals';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';

interface Props {
  goalId: string;
  reducedMotion: boolean;
  onDone: () => void;
}

/**
 * The ambition a character set at eighteen, fulfilled. It is the one thing in a
 * life the player chose to be measured against, so it gets a full stop rather
 * than a line in the feed.
 */
export function GoalAchievedScreen({ goalId, reducedMotion, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 660;
  const goal = goalById(goalId);

  const rise = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(rise, { toValue: 1, duration: 380, easing: Easing.out(Easing.back(1.8)), useNativeDriver: true }).start();
  }, [reducedMotion, rise]);

  if (!goal) return null;
  const scale = rise.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <ModalBackdrop zIndex={83}>
      <View
        style={{
          width: '100%',
          maxWidth: 460,
          alignSelf: 'center',
          backgroundColor: '#123a1e',
          borderWidth: 4,
          borderColor: C.good,
          borderBottomColor: '#1c5c2e',
          borderRightColor: '#1c5c2e',
          padding: compact ? 12 : 18,
          alignItems: 'center',
        }}
      >
        <PixelText font="pixel" size={compact ? 8 : 9} color={C.good} style={{ textAlign: 'center' }}>
          ✦ AMBITION FULFILLED ✦
        </PixelText>

        <Animated.View style={{ transform: [{ scale }], marginVertical: compact ? 12 : 18 }}>
          <PixelText size={compact ? 46 : 58}>{goal.emoji}</PixelText>
        </Animated.View>

        <PixelText font="pixel" size={compact ? 11 : 14} color={C.good} style={{ textAlign: 'center' }}>
          {goal.title.toUpperCase()}
        </PixelText>

        <View style={{ backgroundColor: '#0d2c17', borderWidth: 3, borderColor: C.inkSoft, padding: 10, marginTop: 14, width: '100%' }}>
          <PixelText font="body" size={compact ? 16 : 17} color={C.cream} style={{ textAlign: 'center' }}>
            {goal.desc}
          </PixelText>
          <PixelText font="body" size={15} color={C.good} style={{ textAlign: 'center', marginTop: 8 }}>
            You set yourself this at eighteen, and you have done it.
          </PixelText>
        </View>

        <PixelButton
          bg={C.good}
          shadow="#1c5c2e"
          light="#9fe8ad"
          onPress={onDone}
          style={{ marginTop: 16, width: '100%' }}
          innerStyle={{ paddingVertical: 12, alignItems: 'center' }}
        >
          <PixelText font="pixel" size={compact ? 8 : 9} color="#08300f">
            LIVE ON
          </PixelText>
        </PixelButton>
      </View>
    </ModalBackdrop>
  );
}
