import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { TypewriterText } from '../ui/TypewriterText';
import { Choice, GameEvent, GameState } from '@/types/game';
import { isChoiceAvailable, isChoiceEnabled } from '@/engine/eventPicker';
import { C, PANEL } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { storyBeatLine, storyPresentation } from '@/content/storyPresentation';

interface Props {
  state: GameState;
  event: GameEvent;
  onChoose: (choice: Choice) => void;
}

export function EventModal({ state, event, onChoose }: Props) {
  const text = typeof event.text === 'function' ? event.text(state) : event.text;
  const choices = event.choices.filter((c) => isChoiceAvailable(state, c));
  const story = state.pendingEvent?.storyInstanceId
    ? state.world.activeStories.find((item) => item.id === state.pendingEvent!.storyInstanceId)
    : undefined;

  // The modal stays mounted as one event replaces another, so the reveal has to
  // be reset explicitly rather than relying on a remount.
  const [written, setWritten] = useState(false);
  const [skipped, setSkipped] = useState(false);
  useEffect(() => {
    setWritten(false);
    setSkipped(false);
  }, [event.id]);

  const instant = Boolean(state.settings.reducedMotion) || skipped;
  const onWritten = useCallback(() => setWritten(true), []);

  return (
    <ModalBackdrop zIndex={50}>
      <View style={PANEL.parchModal}>
        <View style={{ backgroundColor: C.health, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.healthDark, borderRightColor: C.healthDark, paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={10} color={C.white} style={{ textAlign: 'center' }}>
            {event.title}
          </PixelText>
        </View>

        {story && (
          <View style={{ backgroundColor: '#efe2fb', borderWidth: 2, borderColor: C.purple, borderBottomColor: C.purpleDark, borderRightColor: C.purpleDark, padding: 8, marginTop: 9 }}>
            <PixelText font="pixel" size={8} color={C.purpleDark} style={{ textAlign: 'center' }}>
              {storyPresentation(story.templateId).title.toUpperCase()}
            </PixelText>
            <PixelText font="body" size={16} color={C.textBrown} style={{ textAlign: 'center', marginTop: 5 }}>
              {storyBeatLine(story.templateId, story.currentBeatId)}
            </PixelText>
          </View>
        )}

        {/* Tapping the passage finishes it at once — nobody should be made to
            wait through a line they can already read. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reveal the rest of the passage"
          onPress={() => setSkipped(true)}
          style={{ marginVertical: 12, marginHorizontal: 2 }}
        >
          <TypewriterText
            text={text}
            font="body"
            size={18}
            color={C.textDark}
            cursorColor={C.amber}
            instant={instant}
            onDone={onWritten}
          />
        </Pressable>

        {!written && (
          <PixelText font="pixel" size={6} color={C.textMuted} style={{ textAlign: 'center', marginBottom: 8 }}>
            TAP TO READ ON
          </PixelText>
        )}

        <View style={{ gap: 7, opacity: written ? 1 : 0.45 }}>
          {choices.map((c, i) => {
            const enabled = written && isChoiceEnabled(state, c);
            return (
              <PixelButton
                key={i}
                bg={C.light}
                shadow={C.blue}
                light={C.sky}
                onPress={() => onChoose(c)}
                disabled={!enabled}
                innerStyle={{ padding: 9 }}
              >
                <PixelText font="body" size={17} color={C.blueDark}>
                  {c.label}
                </PixelText>
                {c.hint ? (
                  <PixelText font="body" size={14} color={C.blue} style={{ marginTop: 2 }}>
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
