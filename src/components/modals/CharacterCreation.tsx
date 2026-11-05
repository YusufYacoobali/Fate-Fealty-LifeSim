import { BIRTH_ORIGINS } from '@/data/birthOrigins';
import type { BirthOriginId } from '@/types/game';
import React, { useState, useRef } from 'react';
import { Image, ScrollView, TextInput, View, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { Difficulty, GenderIdentity } from '@/types/game';
import { NewLifeOptions } from '@/state/gameReducer';
import { birthTraits } from '@/data/traits';
import { EPITHETS, namesForGender } from '@/data/names';
import {personalNameError,displayName,NICKNAME_MAX_LENGTH} from '@/engine/nameValidation';
// Preview randomness is local and cannot draw from any saved world.
const previewPick=<T,>(items:readonly T[]):T=>items[Math.floor(Math.random()*items.length)];
import { C, FONT } from '@/theme/theme';
import { traitIconAsset } from '@/assets/generatedAssets';
import { defaultPronouns } from '@/data/identity';
import { MIN_ANDROID_BOTTOM_NAV_GUARD } from '../systemLayout';

interface Props {
  initialDifficulty: Difficulty;
  premiumUnlocked: boolean;
  onBegin: (options: NewLifeOptions) => void;
  onLockedTraitPress: () => void;
}

const DIFFICULTIES: Difficulty[] = ['Merciful', 'Normal', 'Brutal'];
const SURPRISE = '__surprise__';
export const DEFAULT_CHARACTER_GENDER: GenderIdentity = 'man';
const GENDERS: { id: GenderIdentity; label: string }[] = [
  { id: 'woman', label: 'WOMAN' }, { id: 'man', label: 'MAN' },
];

export function characterCreationBottomPadding(safeBottom: number, minimumGuard = MIN_ANDROID_BOTTOM_NAV_GUARD): number {
  return 28 + Math.max(safeBottom, minimumGuard);
}

/**
 * First-run / new-life character creation. The player names their character,
 * picks (or leaves to fate) a birth trait, and sets the difficulty before the
 * life begins. Confirming dispatches NEW_LIFE with these options.
 */
export function CharacterCreation({ initialDifficulty, premiumUnlocked, onBegin, onLockedTraitPress }: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = characterCreationBottomPadding(insets.bottom);
  const [name, setName] = useState(() => previewPick(namesForGender(DEFAULT_CHARACTER_GENDER)));
  const [nameEdited,setNameEdited]=useState(false);
  const [nickname,setNickname]=useState(()=>previewPick(EPITHETS));
  const [error,setError]=useState<string|null>(null);
  const nicknameInput=useRef<React.ComponentRef<typeof TextInput>>(null);
  const [birthOrigin, setBirthOrigin] = useState<BirthOriginId | undefined>();
  const [customBirth, setCustomBirth] = useState(false);
  const [traitId, setTraitId] = useState<string>(SURPRISE);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [gender, setGender] = useState<GenderIdentity>(DEFAULT_CHARACTER_GENDER);

  const traits = birthTraits();
  const selectedTrait = traits.find((t) => t.id === traitId) ?? null;
  const selectedTraitIcon = selectedTrait ? traitIconAsset(selectedTrait.id) : undefined;

  const begin = () => {
    const problem=personalNameError(name)??personalNameError(nickname,{optional:true,max:NICKNAME_MAX_LENGTH});
    if(problem){setError(problem);return;}
    Keyboard.dismiss();setError(null);
    onBegin({
      birthOrigin:customBirth?birthOrigin:undefined,
      firstName:name.trim(),nickname:nickname.trim(),
      birthTraitId:traitId===SURPRISE?undefined:traitId,
      difficulty,gender,pronouns:defaultPronouns(gender),attraction:gender==='woman'?'men':'women',
    });
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70, backgroundColor: C.ink }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, paddingTop: 28, paddingBottom: bottomPadding }}
      >
        <PixelText font="pixel" size={13} color={C.charm} style={{ textAlign: 'center' }}>
          FORGE THY DESTINY
        </PixelText>
        <PixelText font="body" size={16} color={C.creamBlue} style={{ textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
          Every legend begins in the mud of Swineford.
        </PixelText>

        {/* NAME */}
        <PixelText font="pixel" size={8} color={C.charm} style={{ marginBottom: 7 }}>
          NAME
        </PixelText>
        <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 12 }}>
          <View style={{ flex: 1, minHeight: 48, backgroundColor: C.parch, borderWidth: 3, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, justifyContent: 'center' }}>
            <TextInput
              value={name}
              onChangeText={(t) => {setName(t);setNameEdited(true);setError(null);}}
              accessibilityLabel="Name"
              multiline={false}
              returnKeyType="next"
              onSubmitEditing={()=>nicknameInput.current?.focus()}
              placeholder="Name thyself"
              placeholderTextColor="#b0a070"
              style={{ fontFamily: FONT.body, fontSize: 22, color: C.textDark, paddingHorizontal: 10, paddingVertical: 0, textAlignVertical: 'center' }}
              maxLength={60}
            />
          </View>
          <PixelButton bg={C.light} shadow={C.blue} accessibilityLabel="Generate random name" onPress={() => {setName(previewPick(namesForGender(gender)));setNameEdited(false);setError(null);}} style={{ alignSelf: 'stretch' }} innerStyle={{ width: 50, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
            <PixelText size={20} style={{ includeFontPadding: true, lineHeight: 28 }}>
              🎲
            </PixelText>
          </PixelButton>
        </View>

        <PixelText font="pixel" size={8} color={C.charm} style={{marginBottom:7}}>NICKNAME · OPTIONAL</PixelText>
        <View style={{flexDirection:'row',alignItems:'stretch',marginBottom:8}}>
          <View style={{flex:1,minWidth:0,minHeight:48,backgroundColor:C.parch,borderWidth:3,borderColor:C.parchSd,justifyContent:'center'}}>
            <TextInput ref={nicknameInput} accessibilityLabel="Nickname" value={nickname} onChangeText={t=>{setNickname(t);setError(null);}} placeholder="No nickname" placeholderTextColor="#b0a070" multiline={false} maxLength={80} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} style={{fontFamily:FONT.body,fontSize:22,color:C.textDark,paddingHorizontal:10,paddingVertical:0,textAlignVertical:'center'}}/>
          </View>
          <PixelButton accessibilityLabel="Generate random nickname" bg={C.light} shadow={C.blue} onPress={()=>{setNickname(previewPick(EPITHETS));setError(null);}} innerStyle={{width:50,minHeight:48,alignItems:'center',justifyContent:'center'}}><PixelText size={20} style={{includeFontPadding:true,lineHeight:28}}>🎲</PixelText></PixelButton>
        </View>
        <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={()=>{setNickname('');setError(null);}} innerStyle={{padding:10,minHeight:44}}><PixelText font="pixel" size={7}>NO NICKNAME</PixelText></PixelButton>
        <View style={{borderWidth:2,borderColor:C.charm,backgroundColor:'#0f274a',padding:10,gap:8,marginVertical:14}}>
          <PixelText font="pixel" size={8} color={C.charm}>THY FULL NAME</PixelText>
          <PixelText accessibilityLabel="Full name preview" size={24} color={C.cream}>{displayName(name,nickname)||'Enter thy name'}</PixelText>
          <PixelText size={15} color={C.creamBlue}>This exact name will begin your new life.</PixelText>
        </View>
        {error&&<PixelText accessibilityRole="alert" size={18} color={C.health} style={{marginBottom:12}}>{error}</PixelText>}

        <PixelText font="pixel" size={8} color={C.charm} style={{ marginBottom: 7 }}>
          THY IDENTITY
        </PixelText>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
          {GENDERS.map((option) => (
            <PixelButton
              key={option.id}
              bg={gender === option.id ? C.charm : C.lightFill}
              shadow={gender === option.id ? C.charmDark : C.paleEdge}
              onPress={() => {
                setGender(option.id);
                if (!nameEdited) setName(previewPick(namesForGender(option.id)));
              }}
              style={{ flex: 1 }}
              innerStyle={{ paddingVertical: 8, alignItems: 'center' }}
            >
              <PixelText font="pixel" size={7} color={C.blueDark}>{option.label}</PixelText>
            </PixelButton>
          ))}
        </View>
        <PixelText font="pixel" size={8} color={C.charm} style={{ marginVertical: 9 }}>THY HOUSEHOLD</PixelText>
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 8 }}>
          <PixelButton bg={!customBirth ? C.charm : C.lightFill} shadow={C.charmDark} onPress={() => setCustomBirth(false)} style={{ flex: 1 }} innerStyle={{ padding: 9 }}><PixelText font="pixel" size={7}>RANDOM BIRTH</PixelText></PixelButton>
          <PixelButton bg={customBirth ? C.charm : C.lightFill} shadow={C.charmDark} onPress={() => { setCustomBirth(true); setBirthOrigin(birthOrigin ?? 'peasant'); }} style={{ flex: 1 }} innerStyle={{ padding: 9 }}><PixelText font="pixel" size={7}>CUSTOM BIRTH</PixelText></PixelButton>
        </View>
        {customBirth && <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {BIRTH_ORIGINS.map(origin => <TraitChip key={origin.id} selected={birthOrigin === origin.id} emoji={origin.icon} name={origin.name} premium={origin.id === 'royal'} locked={origin.id === 'royal' && !premiumUnlocked} onPress={origin.id === 'royal' && !premiumUnlocked ? onLockedTraitPress : () => setBirthOrigin(origin.id)} />)}
        </View>}
        <PixelText font="body" size={15} color={C.creamBlue} style={{ marginBottom: 10 }}>{customBirth ? BIRTH_ORIGINS.find(o => o.id === birthOrigin)?.advantage : 'Let fate choose your family. Most begin with little; every household carries obligations.'}</PixelText>
        {/* BIRTH TRAIT */}
        <PixelText font="pixel" size={8} color={C.charm} style={{ marginTop: 8, marginBottom: 7 }}>
          BORN AS...
        </PixelText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Surprise me */}
          <TraitChip selected={traitId === SURPRISE} emoji="🎲" name="Leave to Fate" onPress={() => setTraitId(SURPRISE)} />
          {traits.map((t) => (
            <TraitChip
              key={t.id}
              id={t.id}
              selected={traitId === t.id}
              emoji={t.emoji}
              name={t.name}
              premium={Boolean(t.premium)}
              locked={Boolean(t.premium && !premiumUnlocked)}
              onPress={t.premium && !premiumUnlocked ? onLockedTraitPress : () => setTraitId(t.id)}
            />
          ))}
        </View>

        {/* selected trait blurb */}
        <View style={{ marginTop: 10, minHeight: 54, backgroundColor: '#0f274a', borderWidth: 3, borderColor: C.charm, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: 10 }}>
          {selectedTrait ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {selectedTraitIcon ? (
                  <Image source={selectedTraitIcon} resizeMode="contain" style={{ width: 20, height: 20 }} />
                ) : (
                  <PixelText size={14}>{selectedTrait.emoji}</PixelText>
                )}
                <PixelText font="pixel" size={8} color={C.charm}>
                  {selectedTrait.name}
                </PixelText>
              </View>
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
        <PixelText font="pixel" size={8} color={C.charm} style={{ marginTop: 16, marginBottom: 7 }}>
          THE WORLD'S MERCY
        </PixelText>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {DIFFICULTIES.map((d) => {
            const on = difficulty === d;
            return (
              <PixelButton key={d} bg={on ? C.charm : C.lightFill} shadow={on ? C.charmDark : C.paleEdge} onPress={() => setDifficulty(d)} style={{ flex: 1 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
                <PixelText font="pixel" size={8} color={on ? '#3a2a08' : C.blue}>
                  {d.toUpperCase()}
                </PixelText>
              </PixelButton>
            );
          })}
        </View>

        {/* BEGIN */}
        <PixelButton bg={C.faith} shadow={C.faithDark} light="#d8f5cc" onPress={begin} style={{ marginTop: 22 }} innerStyle={{ paddingVertical: 13, alignItems: 'center' }}>
          <PixelText font="pixel" size={12} color={C.blueDark}>
            ✦ BEGIN THY LIFE
          </PixelText>
        </PixelButton>
      </ScrollView>
    </View>
  );
}

function TraitChip({ id, selected, emoji, name, premium = false, locked = false, onPress }: { id?: string; selected: boolean; emoji: string; name: string; premium?: boolean; locked?: boolean; onPress: () => void }) {
  const icon = id ? traitIconAsset(id) : undefined;

  return (
    <PixelButton
      bg={selected ? C.purple : locked ? C.lightFill : C.parch}
      shadow={selected ? C.purpleDark : locked ? C.paleEdge : C.parchSd}
      light={selected ? undefined : C.parchSl}
      outline={C.parchBorder}
      onPress={onPress}
      style={{ width: '48.5%', marginBottom: 7 }}
      innerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 8 }}
    >
      {icon ? <Image source={icon} resizeMode="contain" style={{ width: 22, height: 22 }} /> : <PixelText size={16}>{emoji}</PixelText>}
      <PixelText font="body" size={15} color={locked ? C.textMuted : selected ? '#2a0d4a' : C.textDark} style={{ flex: 1 }}>
        {name}
      </PixelText>
      {premium && (
        <View style={{ backgroundColor: C.charm, borderWidth: 1, borderColor: C.charmDark, paddingHorizontal: 3, paddingVertical: 2 }}>
          <PixelText font="pixel" size={6} color="#3a2a08">PRO</PixelText>
        </View>
      )}
    </PixelButton>
  );
}
