import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { ACHIEVEMENTS } from '@/data/achievements';
import { RANKS } from '@/data/ranks';
import { ProgressSnapshot } from '@/state/hooks/useMetaProgression';
import { C } from '@/theme/theme';

interface Props {
  progress: ProgressSnapshot;
  onClose: () => void;
}

type Section = 'stats' | 'achievements' | 'dynasty';

/**
 * The Chronicle — a cross-life overlay with three sections: lifetime
 * statistics, the achievements gallery, and the Hall of Legends (past lives).
 */
export function ChronicleScreen({ progress, onClose }: Props) {
  const [section, setSection] = useState<Section>('stats');
  const unlocked = new Set(progress.achievements);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 65, backgroundColor: C.ink }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 24, paddingBottom: 10, backgroundColor: C.blueDeep, borderBottomWidth: 4, borderBottomColor: C.blueDark }}>
        <PixelText font="pixel" size={11} color={C.charm}>
          📜 CHRONICLE
        </PixelText>
        <PixelButton bg={C.health} shadow={C.healthDark} onPress={onClose} innerStyle={{ paddingHorizontal: 10, paddingVertical: 6 }}>
          <PixelText font="pixel" size={8} color={C.white}>
            CLOSE
          </PixelText>
        </PixelButton>
      </View>

      {/* section tabs */}
      <View style={{ flexDirection: 'row', gap: 6, padding: 10, backgroundColor: C.blueDeep }}>
        {(['stats', 'achievements', 'dynasty'] as Section[]).map((sec) => {
          const on = section === sec;
          const label = sec === 'stats' ? 'STATS' : sec === 'achievements' ? 'DEEDS' : 'LEGENDS';
          return (
            <PixelButton key={sec} bg={on ? C.charm : C.blue} shadow={on ? C.charmDark : C.blueDark} onPress={() => setSection(sec)} style={{ flex: 1 }} innerStyle={{ paddingVertical: 7, alignItems: 'center' }}>
              <PixelText font="pixel" size={7} color={on ? '#3a2a08' : C.cream}>
                {label}
              </PixelText>
            </PixelButton>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 28 }}>
        {section === 'stats' && <StatsSection progress={progress} />}
        {section === 'achievements' && <AchievementsSection unlocked={unlocked} />}
        {section === 'dynasty' && <DynastySection progress={progress} />}
      </ScrollView>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#1f3a5c', paddingVertical: 9 }}>
      <PixelText font="body" size={17} color={C.creamBlue}>
        {label}
      </PixelText>
      <PixelText font="pixel" size={8} color={C.charm}>
        {value}
      </PixelText>
    </View>
  );
}

function StatsSection({ progress }: { progress: ProgressSnapshot }) {
  const s = progress.stats;
  const rank = RANKS[s.highestRankIdx]?.key ?? 'Peasant';
  return (
    <View>
      <StatRow label="Lives lived" value={`${s.livesLived}`} />
      <StatRow label="Oldest age reached" value={`${s.oldestAge}`} />
      <StatRow label="Highest station" value={rank} />
      <StatRow label="Most gold held" value={`${s.mostGold}g`} />
      <StatRow label="Gold earned (all lives)" value={`${s.totalGoldEarned}g`} />
      <StatRow label="Children raised" value={`${s.totalChildren}`} />
      <StatRow label="Best legacy score" value={`${s.bestLegacy}`} />
    </View>
  );
}

function AchievementsSection({ unlocked }: { unlocked: Set<string> }) {
  const earned = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  return (
    <View style={{ gap: 8 }}>
      <PixelText font="body" size={15} color={C.creamBlue} style={{ marginBottom: 4 }}>
        {earned} of {ACHIEVEMENTS.length} deeds accomplished
      </PixelText>
      {ACHIEVEMENTS.map((a) => {
        const has = unlocked.has(a.id);
        const hidden = a.secret && !has;
        return (
          <View
            key={a.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: has ? '#15324f' : '#0e2034',
              borderWidth: 2,
              borderColor: has ? C.charm : '#23415f',
              borderBottomColor: has ? C.charmDark : '#23415f',
              borderRightColor: has ? C.charmDark : '#23415f',
              paddingHorizontal: 10,
              paddingVertical: 9,
              opacity: has ? 1 : 0.6,
            }}
          >
            <PixelText size={20}>{hidden ? '❔' : a.emoji}</PixelText>
            <View style={{ flex: 1, minWidth: 0 }}>
              <PixelText font="pixel" size={7} color={has ? C.charm : '#6f8aa8'}>
                {hidden ? '??? (Secret)' : a.name}
              </PixelText>
              <PixelText font="body" size={14} color={C.creamBlue} style={{ marginTop: 3 }}>
                {hidden ? 'A deed yet to be discovered.' : a.desc}
              </PixelText>
            </View>
            {has && (
              <PixelText font="pixel" size={8} color={C.faith}>
                ✓
              </PixelText>
            )}
          </View>
        );
      })}
    </View>
  );
}

function DynastySection({ progress }: { progress: ProgressSnapshot }) {
  if (progress.dynasty.length === 0) {
    return (
      <PixelText font="body" size={17} color={C.creamBlue} style={{ textAlign: 'center', marginTop: 20 }}>
        No legends yet. Live (and die) to fill these pages.
      </PixelText>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      {progress.dynasty.map((d, i) => (
        <View key={`${d.lifeNo}-${i}`} style={{ backgroundColor: '#15324f', borderWidth: 2, borderColor: '#23415f', borderLeftWidth: 4, borderLeftColor: C.charm, paddingHorizontal: 11, paddingVertical: 9 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <PixelText font="pixel" size={8} color={C.charm}>
              {d.name}
            </PixelText>
            <PixelText font="body" size={14} color={C.creamBlue}>
              legacy {d.legacy}
            </PixelText>
          </View>
          <PixelText font="body" size={15} color={C.creamBlue} style={{ marginTop: 4 }}>
            {d.rank} · died at {d.age}
          </PixelText>
          <PixelText font="body" size={14} color="#9fc4e8" style={{ marginTop: 2 }}>
            {d.cause}
          </PixelText>
        </View>
      ))}
    </View>
  );
}
