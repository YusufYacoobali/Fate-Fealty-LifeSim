import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MIN_ANDROID_BOTTOM_NAV_GUARD } from '../systemLayout';

/** Dim full-screen backdrop that centres its modal child, matching the mockup. */
export function ModalBackdrop({ children, zIndex = 50 }: { children: React.ReactNode; zIndex?: number }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, MIN_ANDROID_BOTTOM_NAV_GUARD);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        backgroundColor: 'rgba(13,27,46,0.72)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 18 + insets.top,
        paddingHorizontal: 18,
        paddingBottom: 18 + bottomInset,
      }}
    >
      <View style={{ width: '100%' }}>{children}</View>
    </View>
  );
}
