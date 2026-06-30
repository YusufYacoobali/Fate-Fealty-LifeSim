import React, { useState } from 'react';
import { View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { ModalBackdrop } from './ModalBackdrop';
import { LifetimeOffer } from '../LifetimeOffer';

const LESSONS = [
  { icon: '📜', title: 'LIVE A LIFE', body: 'Each age brings a medieval mishap, chance, or choice. Your story is written in the life log.' },
  { icon: '♥', title: 'WATCH THY STATS', body: 'Health, charm, wits, and faith shape what survives, succeeds, or goes terribly sideways.' },
  { icon: '⚒️', title: 'DO DEEDS', body: 'Use the Do tab to work, train, pray, scheme, or recover before the next year arrives.' },
  { icon: '👪', title: 'MIND THY KIN', body: 'Family, friends, rivals, and heirs can change a life as much as any royal decree.' },
] as const;

export function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState<'guide' | 'offer'>('guide');
  const isOffer = page === 'offer';

  return (
    <ModalBackdrop zIndex={80}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 14 }}>
        <View style={{ backgroundColor: C.blue, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.blueDark, borderRightColor: C.blueDark, paddingHorizontal: 8, paddingVertical: 7 }}>
          <PixelText font="pixel" size={9} color={C.white} style={{ textAlign: 'center' }}>
            {isOffer ? 'SUPPORT THE KINGDOM' : 'WELCOME, SMALL LEGEND'}
          </PixelText>
        </View>

        {isOffer ? (
          <LifetimeOffer />
        ) : (
          <>
            <PixelText font="body" size={18} color={C.textDark} style={{ marginTop: 12, marginBottom: 10, textAlign: 'center' }}>
              Rise from muddy Swineford and see how long thy luck holds.
            </PixelText>

            <View style={{ gap: 8 }}>
              {LESSONS.map((lesson) => (
                <View key={lesson.title} style={{ flexDirection: 'row', gap: 8, backgroundColor: C.parchSl, borderWidth: 2, borderColor: C.parchSd, padding: 9 }}>
                  <View style={{ width: 32, height: 32, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <PixelText size={17}>{lesson.icon}</PixelText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PixelText font="pixel" size={7} color={C.blueDeep}>
                      {lesson.title}
                    </PixelText>
                    <PixelText font="body" size={15} color={C.textBrown} style={{ marginTop: 3 }}>
                      {lesson.body}
                    </PixelText>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <PixelButton
          bg={C.faith}
          shadow={C.faithDark}
          light="#d8f5cc"
          onPress={isOffer ? onDone : () => setPage('offer')}
          style={{ marginTop: 13 }}
          innerStyle={{ paddingVertical: 11, alignItems: 'center' }}
        >
          <PixelText font="pixel" size={9} color={C.blueDark}>
            {isOffer ? 'BEGIN THE TALE' : 'NEXT'}
          </PixelText>
        </PixelButton>
      </View>
    </ModalBackdrop>
  );
}
