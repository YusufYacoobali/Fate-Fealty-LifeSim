import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
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

interface RankVM {
  name: string;
  locked: boolean;
  bg: string;
  sd: string;
  fg: string;
}

interface RankClimbVM {
  from: string;
  to: string;
  progress: number;
  locked: boolean;
}

interface StandingVM {
  delta: number;
  gains: { label: string; delta: number }[];
  losses: { label: string; delta: number }[];
}

/** What is raising and lowering the climb toward the next rank, in plain words. */
function StandingCard({ standing }: { standing: StandingVM }) {
  const rising = standing.delta > 0;
  const rows = [...standing.gains, ...standing.losses];

  return (
    <View style={{ marginTop: 10, backgroundColor: C.parch, borderWidth: 3, borderColor: C.parchBorder, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <PixelText font="pixel" size={8} color={C.blueDeep}>STANDING THIS YEAR</PixelText>
        <PixelText font="pixel" size={9} color={rising ? C.good : standing.delta === 0 ? C.textMuted : C.bad}>
          {standing.delta > 0 ? `+${standing.delta}` : standing.delta}
        </PixelText>
      </View>
      <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 5 }}>
        Deeds and events move the climb too. This is only what each year adds or takes on its own.
      </PixelText>
      <View style={{ marginTop: 8, gap: 4 }}>
        {rows.map((row) => (
          <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <PixelText font="body" size={15} color={C.textDark} style={{ flex: 1 }}>{row.label}</PixelText>
            <PixelText font="body" size={15} color={row.delta > 0 ? C.good : C.bad}>
              {row.delta > 0 ? `+${row.delta}` : row.delta}
            </PixelText>
          </View>
        ))}
      </View>
    </View>
  );
}

function displayLockedRank(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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
  rankClimb: RankClimbVM | null;
  standing: StandingVM;
  traits: TraitVM[];
  goal: GoalVM | null;
  bio: string;
  onLockedRankPress?: () => void;
}

export function MeTab({ portrait, firstName, epithet, classRank, age, stats, rankPath, rankClimb, standing, traits, goal, bio, onLockedRankPress }: Props) {
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
      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginTop: 13, marginBottom: 8 }}>
        PATH TO NOBILITY
      </PixelText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {rankPath.map((r, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={r.locked ? 0.72 : 1}
            disabled={!r.locked}
            accessibilityRole={r.locked ? 'button' : undefined}
            accessibilityLabel={r.locked ? `${r.name} locked. Opens Lifetime Pass.` : r.name}
            onPress={r.locked ? onLockedRankPress : undefined}
            style={{ flex: 1, alignItems: 'center', backgroundColor: r.bg, borderWidth: 2, borderColor: C.inkSoft, borderBottomColor: r.sd, borderRightColor: r.sd, paddingVertical: 5, paddingHorizontal: 2, opacity: r.locked ? 0.86 : 1 }}
          >
            <PixelText font="pixel" size={7} color={r.fg}>
              {r.locked ? displayLockedRank(r.name) : r.name}
            </PixelText>
            {r.locked && (
              <PixelText font="pixel" size={7} color={r.fg} style={{ marginTop: 2 }}>
                Locked
              </PixelText>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {rankClimb && (
        <View style={{ marginTop: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
            <PixelText font="body" size={12} color={C.textMuted}>{rankClimb.from} PATH</PixelText>
            <PixelText font="body" size={12} color={rankClimb.locked ? C.textMuted : C.blueDark}>
              {rankClimb.locked ? `${rankClimb.to} REQUIRES PREMIUM` : `${rankClimb.progress}% TO ${rankClimb.to}`}
            </PixelText>
          </View>
          <StatBar
            value={rankClimb.progress}
            color={rankClimb.locked ? '#9aa8b8' : C.charm}
            dark={rankClimb.locked ? '#667486' : C.charmDark}
            height={6}
            trackBg={C.lightFill}
            trackBorder={C.paleEdge}
          />
        </View>
      )}
      {rankClimb && !rankClimb.locked && <StandingCard standing={standing} />}

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

      {/* life goal */}
      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginTop: 14, marginBottom: 8 }}>
        THY AMBITION
      </PixelText>
      <View style={PANEL.parchCard}>
        {goal ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <PixelText font="body" size={17} color={C.textDark}>
                {goal.emoji} {goal.title}
              </PixelText>
              <PixelText font="body" size={15} color={goal.done ? C.faithDark : C.amber}>
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
