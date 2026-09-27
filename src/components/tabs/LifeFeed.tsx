import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';
import { VillageNewspaper } from '../modals/VillageNewspaper';
import { traitIconAsset } from '@/assets/generatedAssets';
import { PixelButton } from '../ui/PixelButton';
import { isRoutineNews } from '@/engine/choiceFeedback';
import { FeedFilter, FeedSource } from '@/types/game';

interface FeedVM {
  id: number;
  age: number;
  changes?: string[];
  tag: string;
  tagColor: string;
  text: string;
  traitId?: string;
  bg: string;
  border: string;
  sd: string;
  sl: string;
  source: FeedSource;
}

export function LifeFeed({ feed, autoScroll, filter, onFilter, bornYear, reducedMotion, resultKey }: { bornYear: number; reducedMotion: boolean; feed: FeedVM[]; autoScroll: boolean; filter: FeedFilter; onFilter: (filter: FeedFilter) => void; resultKey?: string }) {
  const [edition, setEdition] = useState<number | null>(null);
  const groups = new Map<number, FeedVM[]>();
  if (filter === 'all' || filter === 'world') for (const entry of feed) if (isRoutineNews(entry)) groups.set(entry.age, [...(groups.get(entry.age) ?? []), entry]);
  const ref = useRef<ScrollView>(null);
  // Returning from a quest reveals its result even with ongoing auto-scroll off.
  useEffect(() => {
    if (!resultKey) return;
    const frame = requestAnimationFrame(() => ref.current?.scrollToEnd({ animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [resultKey]);

  useEffect(() => {
    if (autoScroll) {
      // Defer to next frame so content has laid out.
      requestAnimationFrame(() => ref.current?.scrollToEnd({ animated: true }));
    }
  }, [feed.length, autoScroll]);

  return (
    <View style={{ flex: 1, backgroundColor: C.sky }}>
      <View
        style={{
          backgroundColor: C.skyDeep,
          borderBottomWidth: 2,
          borderBottomColor: C.paleEdge,
          paddingHorizontal: 11,
          paddingTop: 9,
          paddingBottom: 8,
          gap: 7,
        }}
      >
        <PixelText font="pixel" size={8} color={C.blue} style={{ textAlign: 'center' }}>
          ~ THY LIFE SO FAR ~
        </PixelText>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {([['all', 'ALL'], ['player', 'MY LIFE'], ['world', 'WORLD']] as [FeedFilter, string][]).map(([id, label]) => (
            <PixelButton key={id} bg={filter === id ? C.blue : C.lightFill} shadow={filter === id ? C.blueDark : C.paleEdge} onPress={() => onFilter(id)} style={{ flex: 1 }} innerStyle={{ paddingVertical: 6, alignItems: 'center' }}>
              <PixelText font="pixel" size={7} color={filter === id ? C.white : C.blueDark}>{label}</PixelText>
            </PixelButton>
          ))}
        </View>
      </View>
      <ScrollView
        ref={ref}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 11, paddingTop: 8, paddingBottom: 7, gap: 8 }}
        showsVerticalScrollIndicator
      >
        {feed.map((e) => {
          const group = groups.get(e.age);
          if (isRoutineNews(e) && group && group.length > 0) {
            if (group[0].id !== e.id) return null;
            return <View key={e.id} style={{ backgroundColor: C.lightFill, padding: 10, borderWidth: 2, borderColor: C.paleEdge }}>
              <PixelButton bg={C.parch} shadow={C.parchSd} light={C.parchSl} onPress={() => setEdition(e.age)} innerStyle={{ padding: 12, minHeight: 44, gap: 8 }}>
                <PixelText font="pixel" size={8} color={C.blueDark}>SWINEFORD GAZETTE</PixelText>
                <PixelText font="body" size={17} color={C.textBrown}>Village news · year {bornYear + e.age} · {group.length} updates</PixelText>
                <PixelText font="body" size={18} color={C.blue}>Read the newspaper →</PixelText>
              </PixelButton>
            </View>;
          }
          const traitIcon = e.traitId ? traitIconAsset(e.traitId) : undefined;

          return (
            <View
              key={e.id}
              style={{
                backgroundColor: e.bg,
                borderWidth: 3,
                borderColor: e.border,
                borderTopColor: e.sl,
                borderLeftColor: e.sl,
                borderBottomColor: e.sd,
                borderRightColor: e.sd,
                paddingHorizontal: 9,
                paddingVertical: 7,
              }}
            >
              <PixelText font="pixel" size={7} color={e.tagColor}>
                {e.tag}
              </PixelText>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: traitIcon ? 7 : 0, marginTop: 3 }}>
                {traitIcon && <Image source={traitIcon} resizeMode="contain" style={{ width: 24, height: 24, marginTop: 1 }} />}
                <PixelText font="body" size={17} color={C.textDark} style={{ flex: 1 }}>
                  {e.text}
                </PixelText>
              </View>
              {!!e.changes?.length && <PixelText font="body" size={14} color={C.blueDark} style={{ marginTop: 6 }}>Changed: {e.changes.join(' · ')}</PixelText>}
            </View>
          );
        })}
      </ScrollView>
      {edition !== null && <VillageNewspaper articles={groups.get(edition) ?? []} year={bornYear + edition} reducedMotion={reducedMotion} onClose={() => setEdition(null)} />}
    </View>
  );
}
