import React, { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { Difficulty } from '@/types/game';
import { NewLifeOptions } from '@/state/gameReducer';
import { birthTraits } from '@/data/traits';
import { FIRST_NAMES } from '@/data/names';
import { pick } from '@/engine/random';
import { C, FONT } from '@/theme/theme';

interface Props {
  initialDifficulty: Difficulty;
  onBegin: (options: NewLifeOptions) => void;
}

const DIFFICULTIES: Difficulty[] = ['Merciful', 'Normal', 'Brutal'];
const SURPRISE = '__surprise__';

/**
 * First-run / new-life character creation. The player names their peasant,
 * picks (or leaves to fate) a birth trait, and sets the difficulty before the
 * life begins. Confirming dispatches NEW_LIFE with these options.
 */
export function CharacterCreation({ initialDifficulty, onBegin }: Props) {
  const [name, setName] = useState(() => pick(FIRST_NAMES));
  const [traitId, setTraitId] = useState<string>(SURPRISE);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);

  const traits = birthTraits();
  const selectedTrait = traits.find((t) => t.id === traitId) ?? null;

  const begin = () =>
    onBegin({
      firstName: name.trim() || undefined,
      birthTraitId: traitId === SURPRISE ? undefined : traitId,
      difficulty,
    });

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70, backgroundColor: C.ink }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 28, paddingBottom: 28 }}>
        <PixelText font="pixel" size={13} color={C.charm} style={{ textAlign: 'center' }}>
          FORGE THY DESTINY
        </PixelText>
        <PixelText font="body" size={16} color={C.creamBlue} style={{ textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
          Every legend begins in the mud of Swineford.
        </PixelText>

        {/* NAME */}
        <PixelText font="pixel" size={7} color={C.charm} style={{ marginBottom: 7 }}>
          THY NAME
        </PixelText>
        <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 7, marginBottom: 16 }}>
          <View style={{ flex: 1, minHeight: 48, backgroundColor: C.parch, borderWidth: 3, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, justifyContent: 'center' }}>
            <TextInput
              value={name}
              onChangeText={(t) => setName(t.slice(0, 16))}
              placeholder="Name thyself"
              placeholderTextColor="#b0a070"
              style={{ fontFamily: FONT.body, fontSize: 22, color: C.textDark, paddingHorizontal: 10, paddingVertical: 0, textAlignVertical: 'center' }}
              maxLength={16}
            />
          </View>
          <PixelButton bg={C.light} shadow={C.blue} onPress={() => setName(pick(FIRST_NAMES))} style={{ alignSelf: 'stretch' }} innerStyle={{ width: 50, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
            <PixelText size={20} style={{ includeFontPadding: true, lineHeight: 28 }}>
              🎲
            </PixelText>
          </PixelButton>
        </View>

        {/* BIRTH TRAIT */}
        <PixelText font="pixel" size={7} color={C.charm} style={{ marginBottom: 7 }}>
          BORN AS...
        </PixelText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Surprise me */}
          <TraitChip selected={traitId === SURPRISE} emoji="🎲" name="Leave to Fate" onPress={() => setTraitId(SURPRISE)} />
          {traits.map((t) => (
            <TraitChip key={t.id} selected={traitId === t.id} emoji={t.emoji} name={t.name} onPress={() => setTraitId(t.id)} />
          ))}
        </View>

        {/* selected trait blurb */}
        <View style={{ marginTop: 10, minHeight: 54, backgroundColor: '#0f274a', borderWidth: 3, borderColor: C.charm, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: 10 }}>
          {selectedTrait ? (
            <>
              <PixelText font="pixel" size={7} color={C.charm}>
                {selectedTrait.emoji} {selectedTrait.name}
              </PixelText>
              <PixelText font="body" size={15} color={C.creamBlue} style={{ marginTop: 5 }}>
                {selectedTrait.blurb}
              </PixelText>
            </>
          ) : (
            <PixelText font="body" size={15} color={C.creamBlue}>
              Let the stars decide who you are born to be.
            </PixelText>
          )}
        </View>

        {/* DIFFICULTY */}
        <PixelText font="pixel" size={7} color={C.charm} style={{ marginTop: 16, marginBottom: 7 }}>
          THE WORLD'S MERCY
        </PixelText>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {DIFFICULTIES.map((d) => {
            const on = difficulty === d;
            return (
              <PixelButton key={d} bg={on ? C.charm : C.lightFill} shadow={on ? C.charmDark : C.paleEdge} onPress={() => setDifficulty(d)} style={{ flex: 1 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
                <PixelText font="pixel" size={7} color={on ? '#3a2a08' : C.blue}>
                  {d.toUpperCase()}
                </PixelText>
              </PixelButton>
            );
          })}
        </View>

        {/* BEGIN */}
        <PixelButton bg={C.faith} shadow={C.faithDark} light="#d8f5cc" onPress={begin} style={{ marginTop: 22 }} innerStyle={{ paddingVertical: 13, alignItems: 'center' }}>
          <PixelText font="pixel" size={11} color={C.blueDark}>
            ✦ BEGIN THY LIFE
          </PixelText>
        </PixelButton>
      </ScrollView>
    </View>
  );
}

function TraitChip({ selected, emoji, name, onPress }: { selected: boolean; emoji: string; name: string; onPress: () => void }) {
  return (
    <PixelButton
      bg={selected ? C.purple : C.parch}
      shadow={selected ? C.purpleDark : C.parchSd}
      light={selected ? undefined : C.parchSl}
      outline={C.parchBorder}
      onPress={onPress}
      style={{ width: '48.5%', marginBottom: 7 }}
      innerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 8 }}
    >
      <PixelText size={16}>{emoji}</PixelText>
      <PixelText font="body" size={15} color={selected ? '#2a0d4a' : C.textDark}>
        {name}
      </PixelText>
    </PixelButton>
  );
}
