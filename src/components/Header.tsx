import React from 'react';
import { View } from 'react-native';
import { PixelText } from './ui/PixelText';
import { PixelButton } from './ui/PixelButton';
import { DeltaBadge } from './ui/DeltaBadge';
import { C } from '@/theme/theme';

interface Props {
  portrait: string;
  fullName: string;
  age: number;
  classRank: string;
  gold: number;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

const ACTION_BUTTON_SIZE = 35;
const ACTION_ICON_SIZE = 18;

function HeaderAction({ icon, bg, shadow, onPress }: { icon: string; bg: string; shadow: string; onPress: () => void }) {
  return (
    <PixelButton bg={bg} shadow={shadow} onPress={onPress} innerStyle={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <PixelText size={ACTION_ICON_SIZE} style={{ includeFontPadding: true, lineHeight: 24 }}>
        {icon}
      </PixelText>
    </PixelButton>
  );
}

export function Header({ portrait, fullName, age, classRank, gold, onOpenShop, onOpenSettings }: Props) {
  return (
    <View
      style={{
        backgroundColor: C.blue,
        borderBottomWidth: 4,
        borderBottomColor: C.blueDeep,
        paddingHorizontal: 10,
        paddingTop: 6,
        paddingBottom: 9,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: C.parch,
          borderWidth: 3,
          borderColor: C.inkSoft,
          borderTopColor: '#fffaf0',
          borderLeftColor: '#fffaf0',
          borderBottomColor: C.parchSd,
          borderRightColor: C.parchSd,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PixelText size={21}>{portrait}</PixelText>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <PixelText font="body" size={20} color={C.white} numberOfLines={1}>
          {fullName}
        </PixelText>
        <PixelText font="body" size={13} color={C.creamBlue} numberOfLines={1}>
          Age {age} · {classRank}
        </PixelText>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: C.blueDeep,
            paddingHorizontal: 6,
            paddingVertical: 5,
            borderBottomWidth: 2,
            borderRightWidth: 2,
            borderColor: C.blueDark,
          }}
        >
          <DeltaBadge value={gold} size={23} style={{ right: 2, top: -12 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.charm, borderBottomWidth: 2, borderRightWidth: 2, borderColor: C.charmDark }} />
          <PixelText font="body" size={16} color={C.goldText}>
            {gold}
          </PixelText>
        </View>
        <HeaderAction icon="🛒" bg={C.charm} shadow={C.charmDark} onPress={onOpenShop} />
        <HeaderAction icon="⚙️" bg={C.light} shadow={C.blueMid} onPress={onOpenSettings} />
      </View>
    </View>
  );
}
