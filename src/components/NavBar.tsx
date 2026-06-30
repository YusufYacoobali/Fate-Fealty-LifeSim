import React from 'react';
import { View, Pressable } from 'react-native';
import { PixelText } from './ui/PixelText';
import { C } from '@/theme/theme';
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
  { id: 'kin', label: 'KIN', sq: C.faith, sqDark: C.faithDark },
  { id: 'shop', label: 'SHOP', sq: C.orange, sqDark: '#c97a1f' },
  { id: 'me', label: 'ME', sq: C.purple, sqDark: C.purpleDark },
];

export function NavBar({ active, onTab }: { active: Tab; onTab: (t: Tab) => void }) {
  return (
    <View
      style={{
        height: 58,
        backgroundColor: C.blueDeep,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 4,
        paddingBottom: 6,
      }}
    >
      {NAV.map((n) => {
        const on = active === n.id;
        return (
          <Pressable key={n.id} onPress={() => onTab(n.id)} style={{ alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4 }}>
            <View
              style={{
                width: 18,
                height: 18,
                backgroundColor: on ? n.sq : '#3a6aa0',
                borderBottomWidth: 2,
                borderRightWidth: 2,
                borderBottomColor: on ? n.sqDark : '#244a73',
                borderRightColor: on ? n.sqDark : '#244a73',
                borderWidth: on ? 2 : 0,
                borderColor: n.sq,
                borderTopColor: on ? n.sq : 'transparent',
                borderLeftColor: on ? n.sq : 'transparent',
              }}
            />
            <PixelText font="pixel" size={6} color={on ? C.white : '#7fa8d0'} style={{ marginTop: 5 }}>
              {n.label}
            </PixelText>
          </Pressable>
        );
      })}
    </View>
  );
}
