import React from 'react';
import { View } from 'react-native';
import { PixelText } from './ui/PixelText';
import { StatBar } from './ui/StatBar';
import { GoalView } from '@/engine/goalEngine';
import { C } from '@/theme/theme';

/**
 * A slim always-visible banner showing the player's current life ambition and
 * its progress — a constant nudge to work toward something concrete.
 */
export function GoalBanner({ goal }: { goal: GoalView }) {
  const pct = Math.round(goal.progress * 100);
  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 6, backgroundColor: C.blueDeep }}>
      <View
        style={{
          backgroundColor: goal.done ? '#1a3a0a' : '#0f274a',
          borderWidth: 2,
          borderColor: goal.done ? C.faithDark : C.purpleDark,
          paddingHorizontal: 9,
          paddingVertical: 6,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <PixelText font="pixel" size={6} color={goal.done ? C.faith : C.purple}>
            {goal.done ? '✓ AMBITION' : '🎯 AMBITION'}
          </PixelText>
          <PixelText font="body" size={13} color={C.creamBlue}>
            {goal.done ? 'FULFILLED' : `${pct}%`}
          </PixelText>
        </View>
        <PixelText font="body" size={15} color={C.cream} numberOfLines={1} style={{ marginBottom: 5 }}>
          {goal.emoji} {goal.title}
        </PixelText>
        <StatBar
          value={pct}
          color={goal.done ? C.faith : C.purple}
          dark={goal.done ? C.faithDark : C.purpleDark}
          height={7}
          trackBg="#0a1c33"
          trackBorder="#06182e"
        />
      </View>
    </View>
  );
}
