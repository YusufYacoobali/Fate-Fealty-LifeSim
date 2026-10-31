import React from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { PixelText } from './ui/PixelText';
import { C, textSize } from '@/theme/theme';
import { Tab } from '@/types/game';

interface NavDef {
  id: Tab;
  label: string;
  sq: string;
  sqDark: string;
}

const NAV: NavDef[] = [
  { id: 'life', label: 'LIFE', sq: C.health, sqDark: C.healthDark },
  { id: 'do', label: 'DO', sq: C.charm, sqDark: C.charmDark },
  { id: 'kin', label: 'PEOPLE', sq: C.faith, sqDark: C.faithDark },
  { id: 'hold', label: 'HOLD', sq: '#cda35f', sqDark: '#9a7333' },
  { id: 'shop', label: 'SHOP', sq: C.orange, sqDark: '#c97a1f' },
  { id: 'me', label: 'ME', sq: C.purple, sqDark: C.purpleDark },
];

export function NavBar({
  active,
  onTab,
  lockedTabs = {},
}: {
  active: Tab;
  onTab: (t: Tab) => void;
  lockedTabs?: Partial<Record<Tab, boolean>>;
}) {
  const { width, fontScale } = useWindowDimensions();
  const [navWidth, setNavWidth] = React.useState(width);
  const compactPeople = (navWidth - 8) / NAV.length - 2 < textSize(7) * 6 * fontScale + 2;
  return (
    <View
      onLayout={event => setNavWidth(event.nativeEvent.layout.width)}
      style={{
        minHeight: 58,
        flexShrink: 0,
        backgroundColor: C.blueDeep,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingBottom: 6,
      }}
    >
      {NAV.map((n) => {
        const on = active === n.id;
        const locked = !!lockedTabs[n.id];
        return (
          <Pressable
            key={n.id}
            onPress={() => onTab(n.id)}
            accessibilityRole="button"
            accessibilityLabel={locked ? `${n.label} locked. Opens Royal Shop.` : n.label}
            accessibilityState={{ disabled: false }}
            style={{ flex: 1, minWidth: 0, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 1, paddingVertical: 4, minHeight: 48 }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                backgroundColor: locked ? '#596b83' : on ? n.sq : '#3a6aa0',
                borderBottomWidth: 2,
                borderRightWidth: 2,
                borderBottomColor: on ? n.sqDark : '#244a73',
                borderRightColor: on ? n.sqDark : '#244a73',
                borderWidth: on ? 2 : 0,
                borderColor: n.sq,
                borderTopColor: on ? n.sq : 'transparent',
                borderLeftColor: on ? n.sq : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {locked && <PixelText font="pixel" size={7} color={C.charm}>P</PixelText>}
            </View>
            <PixelText font="pixel" size={7} color={locked ? C.charm : on ? C.white : '#7fa8d0'} style={{ marginTop: 5, maxWidth: '100%', textAlign: 'center' }}>
              {n.id === 'kin' && compactPeople ? 'KIN' : n.label}
            </PixelText>
          </Pressable>
        );
      })}
    </View>
  );
}
