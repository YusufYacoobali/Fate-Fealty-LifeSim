import React, { useEffect, useRef } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';
import { traitIconAsset } from '@/assets/generatedAssets';

interface FeedVM {
  id: number;
  tag: string;
  tagColor: string;
  text: string;
  traitId?: string;
  bg: string;
  border: string;
  sd: string;
  sl: string;
}

export function LifeFeed({ feed, autoScroll }: { feed: FeedVM[]; autoScroll: boolean }) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    if (autoScroll) {
      // Defer to next frame so content has laid out.
      requestAnimationFrame(() => ref.current?.scrollToEnd({ animated: true }));
    }
  }, [feed.length, autoScroll]);

  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 11, paddingBottom: 7, gap: 8 }}
      showsVerticalScrollIndicator
    >
      <PixelText font="pixel" size={7} color={C.blue} style={{ textAlign: 'center', marginVertical: 3 }}>
        ~ THY LIFE SO FAR ~
      </PixelText>
      {feed.map((e) => {
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
            <PixelText font="pixel" size={6} color={e.tagColor}>
              {e.tag}
            </PixelText>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: traitIcon ? 7 : 0, marginTop: 3 }}>
              {traitIcon && <Image source={traitIcon} resizeMode="contain" style={{ width: 24, height: 24, marginTop: 1 }} />}
              <PixelText font="body" size={17} color={C.textDark} style={{ flex: 1 }}>
                {e.text}
              </PixelText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
