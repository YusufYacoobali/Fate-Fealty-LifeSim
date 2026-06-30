import React from 'react';
import { View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from './ui/PixelButton';
import { PixelText } from './ui/PixelText';

const BENEFITS = [
  'Lifetime access',
  'All future premium chapters',
  'One purchase, no renewal',
  'Supports new events and endings',
] as const;

export function LifetimeOffer() {
  return (
    <View>
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 11 }}>
        <View style={{ backgroundColor: C.health, borderWidth: 2, borderColor: C.inkSoft, borderBottomColor: C.healthDark, borderRightColor: C.healthDark, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8 }}>
          <PixelText font="pixel" size={7} color={C.white}>
            COMING SOON
          </PixelText>
        </View>
        <PixelText font="pixel" size={12} color={C.blueDeep} style={{ textAlign: 'center' }}>
          LIFETIME PASS
        </PixelText>
        <PixelText font="body" size={18} color={C.textBrown} style={{ textAlign: 'center', marginTop: 7 }}>
          Own the whole medieval life, forever.
        </PixelText>
      </View>

      <View style={{ backgroundColor: C.blueDeep, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.blueDark, borderRightColor: C.blueDark, padding: 12, alignItems: 'center' }}>
        <PixelText font="body" size={16} color={C.creamBlue}>
          Founder's lifetime unlock
        </PixelText>
        <PixelText font="pixel" size={18} color={C.charm} style={{ marginTop: 6 }}>
          $9.99
        </PixelText>
      </View>

      <View style={{ marginTop: 10, gap: 7 }}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 12, height: 12, backgroundColor: C.faith, borderWidth: 2, borderColor: C.faithDark }} />
            <PixelText font="body" size={16} color={C.textDark}>
              {benefit}
            </PixelText>
          </View>
        ))}
      </View>

      <PixelButton disabled bg={C.charm} shadow={C.charmDark} light="#fff1b0" style={{ marginTop: 13 }} innerStyle={{ paddingVertical: 12, alignItems: 'center' }}>
        <PixelText font="pixel" size={9} color="#3a2a08">
          COMING SOON
        </PixelText>
      </PixelButton>
      <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 7, textAlign: 'center' }}>
        Purchases are not live yet.
      </PixelText>
    </View>
  );
}
