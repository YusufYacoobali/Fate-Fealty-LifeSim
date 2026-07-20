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
  /** Optional readable-width cap for body and footer content on large screens. */
  contentMaxWidth?: number;
  /** Horizontal/vertical padding around the scrollable body. */
  contentPadding?: number;
  /** Optional colours for themed takeover surfaces such as the royal paywall. */
  backgroundColor?: string;
  headerBackgroundColor?: string;
  headerBorderColor?: string;
  footerBackgroundColor?: string;
  footerBorderColor?: string;
}

/**
 * Full-screen takeover surface (onboarding, paywall, premium shop). Unlike
 * ModalBackdrop this owns the whole screen: no dimmed game behind it, so the
 * player's attention stays on the page.
 */
export function FullScreenPage({
  title,
  zIndex = 75,
  headerRight,
  children,
  footer,
  contentMaxWidth,
  contentPadding = 14,
  backgroundColor = C.sky,
  headerBackgroundColor = C.blueDeep,
  headerBorderColor = C.blueDark,
  footerBackgroundColor = C.skyDeep,
  footerBorderColor = C.paleEdge,
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, MIN_ANDROID_BOTTOM_NAV_GUARD);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex, backgroundColor }}>
      <View
        style={{
          backgroundColor: headerBackgroundColor,
          borderBottomWidth: 3,
          borderBottomColor: headerBorderColor,
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
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: contentPadding,
          paddingBottom: footer ? 18 : 18 + bottomInset,
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: contentMaxWidth }}>{children}</View>
      </ScrollView>
      {footer && (
        <View
          style={{
            padding: 12,
            paddingBottom: 12 + bottomInset,
            backgroundColor: footerBackgroundColor,
            borderTopWidth: 3,
            borderTopColor: footerBorderColor,
          }}
        >
          <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>{footer}</View>
        </View>
      )}
    </View>
  );
}
