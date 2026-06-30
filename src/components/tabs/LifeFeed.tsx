import React, { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';

interface FeedVM {
  id: number;
  tag: string;
  tagColor: string;
  text: string;
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
      {feed.map((e) => (
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
          <PixelText font="body" size={17} color={C.textDark} style={{ marginTop: 3 }}>
            {e.text}
          </PixelText>
        </View>
      ))}
    </ScrollView>
  );
}
