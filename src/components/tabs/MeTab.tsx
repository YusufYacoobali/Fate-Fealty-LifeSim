import {AdvancementPanel} from './AdvancementPanel';
import type {AdvancementDestination} from '@/engine/progressionRequirements';
import { SkillsEquipmentPanel } from '../rpg/RpgPanels';
import { useGame } from '@/state/GameContext';
import { careerById } from '@/data/careers';
import { tradeProgress, TRADE_ENDINGS } from '@/engine/tradeJourney';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';
import { C, PANEL } from '@/theme/theme';
import { rankPortraitAsset, statIconAsset, traitIconAsset } from '@/assets/generatedAssets';

interface StatVM {
  key: string;
  label: string;
  icon: string;
  color: string;
  dark: string;
  val: number;
}

interface TraitVM {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  kind: 'birth' | 'acquired';
}

interface Props {
  portrait: string;
  firstName: string;
  epithet: string;
  classRank: string;
  age: number;
  stats: StatVM[];
  onNavigateAdvancement?: (destination:AdvancementDestination)=>void;
  traits: TraitVM[];
  bio: string;
  onLockedRankPress?: () => void;
}

export function MeTab({ portrait, firstName, epithet, classRank, age, stats, onNavigateAdvancement, traits, bio, onLockedRankPress }: Props) {
  const { state,dispatch } = useGame();
  const career = careerById(state.occupation.careerId);
  const professional = tradeProgress(state);
  const portraitAsset = rankPortraitAsset(classRank);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 8 }}>
      {/* identity card */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0f274a', borderWidth: 4, borderColor: C.charm, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: 10 }}>
        <View style={{ width: 60, height: 60, backgroundColor: C.sky, borderWidth: 3, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
          {portraitAsset ? (
            <Image source={portraitAsset} resizeMode="contain" style={{ width: 54, height: 54 }} />
          ) : (
            <PixelText size={32}>{portrait}</PixelText>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <PixelText font="pixel" size={10} color={C.charm}>
            {firstName}
          </PixelText>
          {epithet&&<PixelText font="body" size={16} color="#dbe9ff" style={{ marginTop: 3 }}>
            "{epithet}"
          </PixelText>}
          <View style={{ alignSelf: 'flex-start', marginTop: 5, backgroundColor: C.light, paddingHorizontal: 7, paddingVertical: 1, borderBottomWidth: 2, borderRightWidth: 2, borderColor: C.blue }}>
            <PixelText font="body" size={14} color={C.blueDark}>
              {classRank} · AGE {age}
            </PixelText>
          </View>
        </View>
      </View>

      <View style={{ padding: 12, marginTop: 12, backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchBorder }}>
        <PixelText font="pixel" size={8} color={C.blueDark}>THY WORKING LIFE</PixelText>
        <PixelText font="body" size={19} color={C.textBrown} style={{ marginTop: 6 }}>{career?.title ?? 'No current occupation'}</PixelText>
        <PixelText font="body" size={16} color={C.textBrown}>Professional advancement follows experience and ability. Social station has its own ladder.</PixelText>
        {!!professional.chapter && <PixelText font="body" size={17} color={C.blueDark} style={{ marginTop: 6 }}>{professional.ending ? `Legacy: ${TRADE_ENDINGS[professional.ending]}` : `${professional.chapter} professional commissions completed`}</PixelText>}
      </View>
      <AdvancementPanel state={state} onNavigate={onNavigateAdvancement??(destination=>destination==='premium'?onLockedRankPress?.():dispatch({type:'SET_TAB',tab:destination==='court'?'hold':'do'}))}/>

      {/* attributes */}
      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginTop: 14, marginBottom: 8 }}>
        ATTRIBUTES
      </PixelText>
      <View style={{ gap: 9 }}>
        {stats.map((s) => (
          <View key={s.key}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                {statIconAsset(s.key) ? (
                  <Image source={statIconAsset(s.key)} resizeMode="contain" style={{ width: 20, height: 20 }} />
                ) : (
                  <PixelText font="pixel" size={8} color={s.dark}>
                    {s.icon}
                  </PixelText>
                )}
                <PixelText font="pixel" size={8} color={s.dark}>
                  {s.label}
                </PixelText>
              </View>
              <PixelText font="pixel" size={8} color={C.inkSoft}>
                {s.val}%
              </PixelText>
            </View>
            <StatBar value={s.val} color={s.color} dark={s.dark} height={13} trackBg={C.lightFill} trackBorder={C.inkSoft} />
          </View>
        ))}
      </View>

      <SkillsEquipmentPanel />

      {/* traits */}
      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginTop: 14, marginBottom: 8 }}>
        TRAITS & REPUTE
      </PixelText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {traits.map((t) => {
          const icon = traitIconAsset(t.id);

          return (
            <View
              key={t.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: t.kind === 'birth' ? C.lightFill : C.purple,
                borderWidth: 2,
                borderColor: C.inkSoft,
                borderBottomColor: t.kind === 'birth' ? C.paleEdge : C.purpleDark,
                borderRightColor: t.kind === 'birth' ? C.paleEdge : C.purpleDark,
                paddingHorizontal: 7,
                paddingVertical: 4,
                maxWidth: '100%',
              }}
            >
              {icon ? (
                <Image source={icon} resizeMode="contain" style={{ width: 18, height: 18 }} />
              ) : (
                <PixelText size={14}>{t.emoji}</PixelText>
              )}
              <PixelText font="body" size={14} color={C.blueDark}>
                {t.name}
              </PixelText>
            </View>
          );
        })}
      </View>

      {/* bio */}
      <View style={[PANEL.parchCard, { marginTop: 13 }]}>
        <PixelText font="body" size={16} color={C.textBrown}>
          {bio}
        </PixelText>
      </View>
    </ScrollView>
  );
}
