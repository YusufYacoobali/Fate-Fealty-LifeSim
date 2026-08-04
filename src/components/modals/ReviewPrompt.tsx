import React, { useState } from 'react';
import { View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { ModalBackdrop } from './ModalBackdrop';
import { openStorePage, presentNativeReview } from '@/services/review';
import { C } from '@/theme/theme';

interface Props {
  /** Called once the prompt is fully resolved, so it is marked as shown. */
  onResolved: () => void;
}

/**
 * Soft prompt first, native review second, manual store link last. The final
 * step covers platforms that silently decline to show the native sheet.
 */
export function ReviewPrompt({ onResolved }: Props) {
  const [step, setStep] = useState<'ask' | 'sad' | 'rate'>('ask');

  const onEnjoying = async () => {
    await presentNativeReview();
    setStep('rate');
  };

  const onRateInStore = async () => {
    onResolved();
    await openStorePage();
  };

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
          <PixelText font="pixel" size={10} color="#3a2a08" style={{ textAlign: 'center' }}>
            {step === 'ask' ? 'A MOMENT, GOOD SOUL' : step === 'rate' ? 'RATE THE TALE' : 'FARE THEE WELL'}
          </PixelText>
        </View>

        {step === 'ask' ? (
          <>
            <PixelText font="body" size={18} color={C.textDark} style={{ marginVertical: 12, marginHorizontal: 2, textAlign: 'center' }}>
              Art thou enjoying thy life in Swineford?
            </PixelText>
            <View style={{ gap: 8 }}>
              <PixelButton bg={C.faith} shadow={C.faithDark} onPress={onEnjoying} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
                <PixelText font="pixel" size={9} color={C.blueDark}>
                  AYE, 'TIS GRAND!
                </PixelText>
              </PixelButton>
              <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => setStep('sad')} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
                <PixelText font="pixel" size={9} color={C.blue}>
                  NOT YET...
                </PixelText>
              </PixelButton>
            </View>
          </>
        ) : step === 'rate' ? (
          <>
            <PixelText font="body" size={18} color={C.textDark} style={{ marginVertical: 12, marginHorizontal: 2, textAlign: 'center' }}>
              If no review box appeared, thou can rate the game on its store page.
            </PixelText>
            <View style={{ gap: 8 }}>
              <PixelButton bg={C.faith} shadow={C.faithDark} onPress={onRateInStore} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
                <PixelText font="pixel" size={9} color={C.blueDark}>
                  RATE ON STORE
                </PixelText>
              </PixelButton>
              <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={onResolved} innerStyle={{ paddingVertical: 10, alignItems: 'center' }}>
                <PixelText font="pixel" size={9} color={C.blue}>
                  DONE
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
              <PixelText font="pixel" size={9} color="#3a2a08">
                ONWARD
              </PixelText>
            </PixelButton>
          </>
        )}
      </View>
    </ModalBackdrop>
  );
}
