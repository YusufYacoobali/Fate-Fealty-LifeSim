import { professionalClientContext } from '@/engine/professionalClients';
import { medicalAdviser, patientSummary } from '@/engine/medicalPractice';
import { PersonPicker } from '../ui/PersonPicker';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { TypewriterText } from '../ui/TypewriterText';
import { choiceStakes, choiceHint } from '@/engine/choiceFeedback';
import { Choice, GameEvent, GameState } from '@/types/game';
import { isChoiceAvailable, isChoiceEnabled } from '@/engine/eventPicker';
import { C, PANEL } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { storyBeatLine, storyPresentation } from '@/content/storyPresentation';
import { renderBoundText } from '@/content/persistentWorldEvents';

interface Props {
  state: GameState;
  event: GameEvent;
  onChoose: (choice: Choice) => void;
  onProfessionalClient?: (id: string) => void;
}

export function EventModal({ state, event, onChoose, onProfessionalClient }: Props) {
  const { height } = useWindowDimensions();
  const rawText = typeof event.text === 'function' ? event.text(state) : event.text;
  const text = renderBoundText(state, rawText);
  const title = renderBoundText(state, event.title);
  const client = onProfessionalClient && event.id === state.pendingEvent?.eventId ? professionalClientContext(state) : undefined;
  const adviser = client?.definition.family === 'medicine' && client.selected ? medicalAdviser(state,client.record,client.selected.id) : undefined;
  const choices = event.choices.filter((c) => isChoiceAvailable(state, c));
  const story = state.pendingEvent?.storyInstanceId
    ? state.world.activeStories.find((item) => item.id === state.pendingEvent!.storyInstanceId)
    : undefined;

  // Completion belongs to this passage and its cast. Keying the reveal avoids
  // resetting a parent's boolean after an instant child has already finished.
  const passageKey = `${event.id}:${JSON.stringify(state.pendingEvent?.bindings ?? {})}:${text}`;
  const [writtenPassage, setWrittenPassage] = useState<string>();
  const [skippedPassage, setSkippedPassage] = useState<string>();
  const written = writtenPassage === passageKey;
  const instant = Boolean(state.settings.reducedMotion) || skippedPassage === passageKey;
  const onWritten = useCallback(() => setWrittenPassage(passageKey), [passageKey]);
  const skipWriting = useCallback(() => { if (!written) setSkippedPassage(passageKey); }, [written,passageKey]);

  return (
    <ModalBackdrop zIndex={50} onTouchStart={skipWriting}>
      <ScrollView automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" style={[PANEL.parchModal, { maxHeight: height - 100 }]} contentContainerStyle={{ paddingBottom: 8 }}>
        <View style={{ backgroundColor: C.health, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.healthDark, borderRightColor: C.healthDark, paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={10} color={C.white} style={{ textAlign: 'center' }}>
            {title}
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
          onPress={() => setSkippedPassage(passageKey)}
          style={{ marginVertical: 12, marginHorizontal: 2 }}
        >
          <TypewriterText
            key={passageKey}
            text={text}
            font="body"
            size={18}
            color={C.textDark}
            cursorColor={C.amber}
            instant={instant}
            onDone={onWritten}
          />
        </Pressable>

        {client && onProfessionalClient && <View style={[PANEL.parchCard,{ marginBottom: 10 }]}>
          <PixelText font="pixel" size={7} color={C.blueDeep}>{client.definition.family === 'medicine' ? 'PATIENT' : 'TRADING PARTNER'}</PixelText>
          <PersonPicker key={event.id} people={client.people} value={client.matter.actorId} onChange={onProfessionalClient} />
          {client.selected && <PixelText size={15}>{client.definition.family === 'medicine' ? patientSummary(client.selected) : `${client.selected.name} · ${client.selected.gold}g available. Past dealings affect trust and the agreement.`}</PixelText>}
          {client.definition.family === 'medicine' && <PixelText size={14} color={C.textMuted} style={{ marginTop: 5 }}>{adviser ? `Second opinion: ${adviser.name}. The consultation pays this practitioner 2g.` : 'A qualified physician can be retained for a second opinion (2g).'}</PixelText>}
          <PixelText size={14} color={C.textMuted} style={{ marginTop: 5 }}>Choose before agreeing a method. Selection does not spend another action.</PixelText>
        </View>}

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
                  {renderBoundText(state, c.label)}
                </PixelText>
                {choiceHint(c) ? (
                  <PixelText font="body" size={14} color={C.blue} style={{ marginTop: 2 }}>
                    {choiceHint(c)}
                  </PixelText>
                ) : null}
                {choiceStakes(c).map((line) => <PixelText key={line} font="body" size={14} color={C.textBrown} style={{ marginTop: 3 }}>{line}</PixelText>)}
                {(c.disabledReason || (c.costGold != null && state.gold < c.costGold)) && <PixelText font="body" size={14} color={C.bad}>{c.costGold != null && state.gold < c.costGold ? `You have ${state.gold}g` : c.disabledReason}</PixelText>}
              </PixelButton>
            );
          })}
        </View>
      </ScrollView>
    </ModalBackdrop>
  );
}
