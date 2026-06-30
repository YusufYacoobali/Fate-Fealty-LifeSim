import React from 'react';
import { ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';
import { C } from '@/theme/theme';

interface StatVM {
  key: string;
  label: string;
  icon: string;
  color: string;
  dark: string;
  val: number;
}

interface RankVM {
  name: string;
  bg: string;
  sd: string;
  fg: string;
}

interface TraitVM {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  kind: 'birth' | 'acquired';
}

interface GoalVM {
  emoji: string;
  title: string;
  desc: string;
  progress: number;
  done: boolean;
}

interface Props {
  portrait: string;
  firstName: string;
  epithet: string;
  classRank: string;
  age: number;
  stats: StatVM[];
  rankPath: RankVM[];
  traits: TraitVM[];
  goal: GoalVM | null;
  bio: string;
}

export function MeTab({ portrait, firstName, epithet, classRank, age, stats, rankPath, traits, goal, bio }: Props) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 8 }}>
      {/* identity card */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0f274a', borderWidth: 4, borderColor: C.charm, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: 10 }}>
        <View style={{ width: 60, height: 60, backgroundColor: C.sky, borderWidth: 3, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
          <PixelText size={32}>{portrait}</PixelText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <PixelText font="pixel" size={9} color={C.charm}>
            {firstName}
          </PixelText>
          <PixelText font="body" size={16} color="#dbe9ff" style={{ marginTop: 3 }}>
            "{epithet}"
          </PixelText>
          <View style={{ alignSelf: 'flex-start', marginTop: 5, backgroundColor: C.light, paddingHorizontal: 7, paddingVertical: 1, borderBottomWidth: 2, borderRightWidth: 2, borderColor: C.blue }}>
            <PixelText font="body" size={14} color={C.blueDark}>
              {classRank} · AGE {age}
            </PixelText>
          </View>
        </View>
      </View>

      {/* path to nobility */}
      <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 13, marginBottom: 8 }}>
        PATH TO NOBILITY
      </PixelText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        {rankPath.map((r, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', backgroundColor: r.bg, borderWidth: 2, borderColor: C.inkSoft, borderBottomColor: r.sd, borderRightColor: r.sd, paddingVertical: 6, paddingHorizontal: 2 }}>
            <PixelText font="pixel" size={6} color={r.fg}>
              {r.name}
            </PixelText>
          </View>
        ))}
      </View>

      {/* attributes */}
      <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 14, marginBottom: 8 }}>
        ATTRIBUTES
      </PixelText>
      <View style={{ gap: 9 }}>
        {stats.map((s) => (
          <View key={s.key}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <PixelText font="pixel" size={7} color={s.dark}>
                {s.icon} {s.label}
              </PixelText>
              <PixelText font="pixel" size={7} color={C.inkSoft}>
                {s.val}%
              </PixelText>
            </View>
            <StatBar value={s.val} color={s.color} dark={s.dark} height={13} trackBg={C.lightFill} trackBorder={C.inkSoft} />
          </View>
        ))}
      </View>

      {/* life goal */}
      <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 14, marginBottom: 8 }}>
        THY AMBITION
      </PixelText>
      <View style={{ backgroundColor: C.parch, borderWidth: 3, borderColor: C.parchBorder, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 9 }}>
        {goal ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <PixelText font="body" size={17} color={C.textDark}>
                {goal.emoji} {goal.title}
              </PixelText>
              <PixelText font="pixel" size={7} color={goal.done ? C.faithDark : C.amber}>
                {goal.done ? 'DONE ✓' : `${Math.round(goal.progress * 100)}%`}
              </PixelText>
            </View>
            <StatBar value={Math.round(goal.progress * 100)} color={goal.done ? C.faith : C.purple} dark={goal.done ? C.faithDark : C.purpleDark} height={11} trackBg={C.lightFill} trackBorder={C.inkSoft} />
            <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 6 }}>
              {goal.desc}
            </PixelText>
          </>
        ) : (
          <PixelText font="body" size={15} color={C.textMuted}>
            {age >= 18 ? 'No ambition set.' : `A life's ambition will be set when you come of age (18).`}
          </PixelText>
        )}
      </View>

      {/* traits */}
      <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 14, marginBottom: 8 }}>
        TRAITS & REPUTE
      </PixelText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {traits.map((t) => (
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
            <PixelText size={14}>{t.emoji}</PixelText>
            <PixelText font="body" size={14} color={C.blueDark}>
              {t.name}
            </PixelText>
          </View>
        ))}
      </View>

      {/* bio */}
      <View style={{ marginTop: 13, backgroundColor: C.parch, borderWidth: 3, borderColor: C.parchBorder, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 9 }}>
        <PixelText font="body" size={16} color={C.textBrown}>
          {bio}
        </PixelText>
      </View>
    </ScrollView>
  );
}
