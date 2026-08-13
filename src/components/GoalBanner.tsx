import React from 'react';
import { Image, View } from 'react-native';
import { PixelText } from './ui/PixelText';
import { StatBar } from './ui/StatBar';
import { GoalView } from '@/engine/goalEngine';
import { C } from '@/theme/theme';
import { goalIconAsset } from '@/assets/generatedAssets';

/**
 * A slim always-visible banner showing the player's current life ambition and
 * its progress — a constant nudge to work toward something concrete.
 */
export function GoalBanner({ goal }: { goal: GoalView }) {
  const pct = Math.round(goal.progress * 100);
  const icon = goalIconAsset(goal.id);
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
          <PixelText font="pixel" size={7} color={goal.done ? C.faith : C.purple}>
            AMBITION
          </PixelText>
          <PixelText font="body" size={15} color={C.creamBlue}>
            {goal.done ? 'FULFILLED' : `${pct}%`}
          </PixelText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          {icon && <Image source={icon} resizeMode="contain" style={{ width: 23, height: 23 }} />}
          <PixelText font="body" size={15} color={C.cream} numberOfLines={1} style={{ flex: 1 }}>
            {goal.title}
          </PixelText>
        </View>
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
