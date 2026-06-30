import React from 'react';
import { View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { Choice, GameEvent, GameState } from '@/types/game';
import { isChoiceAvailable, isChoiceEnabled } from '@/engine/eventPicker';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';

interface Props {
  state: GameState;
  event: GameEvent;
  onChoose: (event: GameEvent, choice: Choice) => void;
}

export function EventModal({ state, event, onChoose }: Props) {
  const text = typeof event.text === 'function' ? event.text(state) : event.text;
  const choices = event.choices.filter((c) => isChoiceAvailable(state, c));

  return (
    <ModalBackdrop zIndex={50}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 14 }}>
        <View style={{ backgroundColor: C.health, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.healthDark, borderRightColor: C.healthDark, paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={9} color={C.white} style={{ textAlign: 'center' }}>
            {event.title}
          </PixelText>
        </View>

        <PixelText font="body" size={18} color={C.textDark} style={{ marginVertical: 12, marginHorizontal: 2 }}>
          {text}
        </PixelText>

        <View style={{ gap: 7 }}>
          {choices.map((c, i) => {
            const enabled = isChoiceEnabled(state, c);
            return (
              <PixelButton
                key={i}
                bg={C.light}
                shadow={C.blue}
                light={C.sky}
                onPress={() => onChoose(event, c)}
                disabled={!enabled}
                innerStyle={{ padding: 9 }}
              >
                <PixelText font="body" size={17} color={C.blueDark}>
                  {c.label}
                </PixelText>
                {c.hint ? (
                  <PixelText font="body" size={13} color={C.blue} style={{ marginTop: 2 }}>
                    {c.hint}
                  </PixelText>
                ) : null}
              </PixelButton>
            );
          })}
        </View>
      </View>
    </ModalBackdrop>
  );
}
