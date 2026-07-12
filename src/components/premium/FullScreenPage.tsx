import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '@/theme/theme';
import { PixelText } from '../ui/PixelText';
import { MIN_ANDROID_BOTTOM_NAV_GUARD } from '../systemLayout';

interface Props {
  /** Pixel-font strip title at the top of the page. */
  title: string;
  zIndex?: number;
  /** Optional element pinned at the top-right of the title bar (e.g. close). */
  headerRight?: React.ReactNode;
  /** Scrollable page body. */
  children: React.ReactNode;
  /** Optional footer pinned under the scroll area (CTAs, skip links). */
  footer?: React.ReactNode;
}

/**
 * Full-screen takeover surface (onboarding, paywall, premium shop). Unlike
 * ModalBackdrop this owns the whole screen: no dimmed game behind it, so the
 * player's attention stays on the page.
 */
export function FullScreenPage({ title, zIndex = 75, headerRight, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, MIN_ANDROID_BOTTOM_NAV_GUARD);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex, backgroundColor: C.sky }}>
      <View
        style={{
          backgroundColor: C.blueDeep,
          borderBottomWidth: 3,
          borderBottomColor: C.blueDark,
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <PixelText font="pixel" size={9} color={C.cream} style={{ flex: 1, textAlign: 'center' }}>
          {title}
        </PixelText>
        {headerRight && <View style={{ position: 'absolute', right: 10 }}>{headerRight}</View>}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 18 }}>
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            padding: 12,
            paddingBottom: 12 + bottomInset,
            backgroundColor: C.skyDeep,
            borderTopWidth: 3,
            borderTopColor: C.paleEdge,
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
}
