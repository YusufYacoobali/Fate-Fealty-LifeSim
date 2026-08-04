import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { GameState } from '@/types/game';
import { canYield, duelResponses, duelTelegraph, responseChance, DUEL_MAX_ROUNDS } from '@/engine/duelEngine';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';

interface Props {
  state: GameState;
  onRespond: (responseId: string) => void;
  onClose: () => void;
}

const STAT_LABEL = { health: 'STRENGTH', charm: 'PRESENCE', wits: 'TIMING', faith: 'RESOLVE' } as const;

/** Rough odds, shown as words rather than a number to keep it a read, not a sum. */
function oddsWord(chance: number): string {
  if (chance >= 0.72) return 'likely';
  if (chance >= 0.52) return 'even';
  if (chance >= 0.34) return 'risky';
  return 'desperate';
}

function oddsColour(chance: number): string {
  if (chance >= 0.72) return C.good;
  if (chance >= 0.52) return C.amber;
  return C.bad;
}

function VigourBar({ label, value, colour, dark }: { label: string; value: number; colour: string; dark: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
        <PixelText font="pixel" size={7} color={C.creamBlue}>{label}</PixelText>
        <PixelText font="pixel" size={7} color={value <= 30 ? C.health : C.faith}>{value}</PixelText>
      </View>
      <StatBar value={value} color={colour} dark={dark} height={12} trackBg="#0d2a4a" trackBorder={C.inkSoft} />
    </View>
  );
}

export function DuelModal({ state, onRespond, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 700;
  const duel = state.duel;
  const opponent = duel ? state.world.characters[duel.opponentId] : undefined;
  if (!duel || !opponent) return null;

  const formal = duel.kind === 'duel';
  const responses = duelResponses(state);
  const finished = Boolean(duel.outcome);
  const won = duel.outcome === 'won';

  return (
    <ModalBackdrop zIndex={70}>
      <View
        style={{
          width: '100%',
          maxWidth: 470,
          alignSelf: 'center',
          backgroundColor: '#0a2440',
          borderWidth: 4,
          borderColor: formal ? C.charm : C.health,
          borderBottomColor: formal ? C.charmDark : C.healthDark,
          borderRightColor: formal ? C.charmDark : C.healthDark,
          padding: compact ? 10 : 14,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <PixelText font="pixel" size={compact ? 8 : 9} color={formal ? C.charm : C.health}>
            {formal ? '⚔ A DUEL' : '✊ A BRAWL'}
          </PixelText>
          <PixelText font="body" size={14} color={C.creamBlue}>
            {finished ? 'decided' : `exchange ${duel.round} of ${DUEL_MAX_ROUNDS}`}
          </PixelText>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: compact ? 9 : 12 }}>
          <VigourBar label="THEE" value={duel.playerVigour} colour={C.faith} dark={C.faithDark} />
          <VigourBar label={opponent.name.toUpperCase()} value={duel.opponentVigour} colour={C.health} dark={C.healthDark} />
        </View>

        {/* Recent exchanges, so the fight reads as a sequence rather than a state. */}
        {duel.log.length > 0 && (
          <ScrollView style={{ maxHeight: compact ? 92 : 118, marginTop: compact ? 9 : 12 }} contentContainerStyle={{ gap: 5 }}>
            {duel.log.map((line, index) => (
              <PixelText
                key={`${index}-${line.slice(0, 12)}`}
                font="body"
                size={15}
                color={index === duel.log.length - 1 ? C.cream : '#8fb0d4'}
              >
                {line}
              </PixelText>
            ))}
          </ScrollView>
        )}

        {finished ? (
          <>
            <View style={{ backgroundColor: won ? '#123a1c' : '#3a1218', borderWidth: 3, borderColor: won ? C.good : C.bad, padding: compact ? 10 : 12, marginTop: compact ? 10 : 14 }}>
              <PixelText font="pixel" size={compact ? 10 : 12} color={won ? C.faith : C.health} style={{ textAlign: 'center' }}>
                {duel.outcome === 'won' ? 'THOU HAST WON' : duel.outcome === 'lost' ? 'THOU ART BEATEN' : 'THOU HAST YIELDED'}
              </PixelText>
              <PixelText font="body" size={compact ? 16 : 18} color={C.cream} style={{ textAlign: 'center', marginTop: 7 }}>
                {duel.verdict}
              </PixelText>
            </View>
            <PixelButton
              bg={won ? C.faith : C.lightFill}
              shadow={won ? C.faithDark : C.paleEdge}
              onPress={onClose}
              style={{ marginTop: 12 }}
              innerStyle={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <PixelText font="pixel" size={compact ? 8 : 9} color={C.blueDark}>
                {won ? 'TAKE THE FIELD' : 'LIMP AWAY'}
              </PixelText>
            </PixelButton>
          </>
        ) : (
          <>
            <View style={{ backgroundColor: '#123a5e', borderWidth: 3, borderColor: C.blue, padding: compact ? 9 : 11, marginTop: compact ? 10 : 13 }}>
              <PixelText font="pixel" size={7} color={C.charm}>{opponent.name.toUpperCase()} MOVES</PixelText>
              <PixelText font="body" size={compact ? 17 : 19} color={C.cream} style={{ marginTop: 5 }}>
                {duelTelegraph(state)}
              </PixelText>
            </View>

            <View style={{ gap: 7, marginTop: compact ? 9 : 12 }}>
              {responses.map((response) => {
                const odds = responseChance(state, response, opponent);
                return (
                  <PixelButton
                    key={response.id}
                    bg={C.lightFill}
                    shadow={C.paleEdge}
                    light={C.lighter}
                    onPress={() => onRespond(response.id)}
                    innerStyle={{ padding: compact ? 8 : 10 }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <PixelText font="pixel" size={7} color={C.blueDark} style={{ flex: 1 }}>{response.text.label}</PixelText>
                      <PixelText font="pixel" size={7} color={oddsColour(odds)}>{oddsWord(odds).toUpperCase()}</PixelText>
                    </View>
                    <PixelText font="body" size={14} color={C.blue} style={{ marginTop: 3 }}>
                      {STAT_LABEL[response.stat]} · {response.text.hint}
                    </PixelText>
                  </PixelButton>
                );
              })}
              {canYield(state) && (
                <PixelButton bg="#3a1218" shadow={C.healthDark} onPress={() => onRespond('yield')} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
                  <PixelText font="pixel" size={7} color={C.health}>YIELD THE FIGHT</PixelText>
                </PixelButton>
              )}
            </View>
          </>
        )}
      </View>
    </ModalBackdrop>
  );
}
