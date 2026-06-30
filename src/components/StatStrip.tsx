import React from 'react';
import { View } from 'react-native';
import { PixelText } from './ui/PixelText';
import { StatBar } from './ui/StatBar';
import { DeltaBadge } from './ui/DeltaBadge';
import { C } from '@/theme/theme';

interface StatVM {
  key: string;
  icon: string;
  color: string;
  dark: string;
  val: number;
}

/** The always-visible four-stat strip (health, charm, wits, faith). */
export function StatStrip({ stats }: { stats: StatVM[] }) {
  return (
    <View
      style={{
        backgroundColor: C.blueMid,
        borderBottomWidth: 4,
        borderBottomColor: C.blueDarker,
        paddingHorizontal: 10,
        paddingVertical: 7,
        flexDirection: 'row',
        gap: 7,
      }}
    >
      {stats.map((s) => (
        <View key={s.key} style={{ flex: 1 }}>
          <DeltaBadge value={s.val} size={18} style={{ right: 0, top: -10 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <PixelText font="pixel" size={8} color={s.color}>
              {s.icon}
            </PixelText>
            <PixelText font="body" size={15} color={C.lightFill}>
              {s.val}
            </PixelText>
          </View>
          <StatBar value={s.val} color={s.color} dark={s.dark} height={9} />
        </View>
      ))}
    </View>
  );
}
