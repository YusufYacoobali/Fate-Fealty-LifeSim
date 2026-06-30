import React, { useState } from 'react';
import { View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { ModalBackdrop } from './ModalBackdrop';
import { presentNativeReview } from '@/services/review';
import { C } from '@/theme/theme';

interface Props {
  /** Called once the prompt is fully resolved (so it's marked as shown). */
  onResolved: () => void;
}

/**
 * Two-step review flow, per the soft-prompt best practice:
 *   1. Ask if they're enjoying it (never send an unhappy player to the store).
 *   2a. "Aye" -> trigger the OS-native in-app review (falls back to the store
 *       page if the native prompt isn't available).
 *   2b. "Not yet" -> thank them and quietly bow out — no store trip, no nagging.
 */
export function ReviewPrompt({ onResolved }: Props) {
  const [step, setStep] = useState<'ask' | 'sad'>('ask');

  const onEnjoying = async () => {
    // Resolve first (mark as shown) so we never prompt twice, then present.
    onResolved();
    await presentNativeReview();
  };

  const onNotYet = () => setStep('sad');

  return (
    <ModalBackdrop zIndex={58}>
      <View
        style={{
          backgroundColor: C.parch,
          borderWidth: 4,
          borderColor: C.inkSoft,
          borderTopColor: C.parchSl,
          borderLeftColor: C.parchSl,
          borderBottomColor: C.parchSd,
          borderRightColor: C.parchSd,
          padding: 14,
        }}
      >
        <View
          style={{
            backgroundColor: C.charm,
            borderWidth: 3,
            borderColor: C.inkSoft,
            borderBottomColor: C.charmDark,
            borderRightColor: C.charmDark,
            paddingHorizontal: 8,
            paddingVertical: 6,
          }}
        >
          <PixelText font="pixel" size={9} color="#3a2a08" style={{ textAlign: 'center' }}>
            {step === 'ask' ? '★ A MOMENT, GOOD SOUL' : '☆ FARE THEE WELL'}
          </PixelText>
        </View>

        {step === 'ask' ? (
          <>
            <PixelText font="body" size={18} color={C.textDark} style={{ marginVertical: 12, marginHorizontal: 2, textAlign: 'center' }}>
              Art thou enjoying thy life in Swineford?
            </PixelText>
            <View style={{ gap: 8 }}>
              <PixelButton bg={C.faith} shadow={C.faithDark} onPress={onEnjoying} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
                <PixelText font="pixel" size={8} color={C.blueDark}>
                  AYE, 'TIS GRAND!
                </PixelText>
              </PixelButton>
              <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={onNotYet} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
                <PixelText font="pixel" size={8} color={C.blue}>
                  NOT YET...
                </PixelText>
              </PixelButton>
            </View>
          </>
        ) : (
          <>
            <PixelText font="body" size={18} color={C.textDark} style={{ marginVertical: 12, marginHorizontal: 2, textAlign: 'center' }}>
              Thy honesty is noted, and thy turnips respected. May thy next life fare better.
            </PixelText>
            <PixelButton bg={C.charm} shadow={C.charmDark} light="#fff1b0" onPress={onResolved} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
              <PixelText font="pixel" size={8} color="#3a2a08">
                ONWARD
              </PixelText>
            </PixelButton>
          </>
        )}
      </View>
    </ModalBackdrop>
  );
}
