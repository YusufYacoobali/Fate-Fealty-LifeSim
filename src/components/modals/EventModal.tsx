import React from 'react';
import { View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { Choice, GameEvent, GameState } from '@/types/game';
import { isChoiceAvailable, isChoiceEnabled } from '@/engine/eventPicker';
import { C, PANEL } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { strongestConditionReasons } from '@/engine/worldSimulation';
import { WorldConditionKey } from '@/types/game';
import { storyEligibilityReasons } from '@/content/persistentStories';

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
  const conditionKey = (Object.keys(state.world.conditions) as WorldConditionKey[])
    .sort((a, b) => Math.abs(state.world.conditions[b] - 50) - Math.abs(state.world.conditions[a] - 50))[0];

  return (
    <ModalBackdrop zIndex={50}>
      <View style={PANEL.parchModal}>
        <View style={{ backgroundColor: C.health, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.healthDark, borderRightColor: C.healthDark, paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={9} color={C.white} style={{ textAlign: 'center' }}>
            {event.title}
          </PixelText>
        </View>

        {story && <PixelText font="pixel" size={6} color={C.purpleDark} style={{ textAlign: 'center', marginTop: 8 }}>
          {story.templateId.replaceAll('_', ' ').toUpperCase()} · {story.currentBeatId.replace('_', ' ').toUpperCase()}
        </PixelText>}
        {story && <PixelText font="body" size={13} color={C.textMuted} style={{ textAlign: 'center', marginTop: 3 }}>
          Why now: {(story ? storyEligibilityReasons(state, story.templateId) : strongestConditionReasons(state, conditionKey)).join(', ')}.
        </PixelText>}

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
                onPress={() => onChoose(c)}
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
                {c.forecast && <View style={{ marginTop: 5, gap: 2 }}>
                  <PixelText font="body" size={13} color={c.forecast.risk === 'high' ? C.bad : c.forecast.risk === 'medium' ? C.amber : C.good}>
                    Risk: {c.forecast.risk} · Advantage: {c.forecast.positive.join(', ')}
                  </PixelText>
                  <PixelText font="body" size={12} color={C.textMuted}>
                    Cost: {c.forecast.negative.join(', ')}{c.forecast.warnsDelayedConsequence ? ' · This may return in later years.' : ''}
                  </PixelText>
                </View>}
              </PixelButton>
            );
          })}
        </View>
      </View>
    </ModalBackdrop>
  );
}
