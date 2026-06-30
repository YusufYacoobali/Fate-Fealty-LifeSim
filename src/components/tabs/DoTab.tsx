import React from 'react';
import { ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { ACTIVITY_DEFS, CATEGORIES } from '@/data/activities';
import { ActivityCategory } from '@/types/game';
import { C } from '@/theme/theme';

interface Props {
  cat: ActivityCategory | 'all';
  onCat: (c: ActivityCategory | 'all') => void;
  onActivity: (id: string) => void;
}

export function DoTab({ cat, onCat, onActivity }: Props) {
  const activities = ACTIVITY_DEFS.filter((a) => cat === 'all' || a.cat === cat);

  return (
    <View style={{ flex: 1 }}>
      {/* category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, borderBottomWidth: 3, borderBottomColor: C.paleEdge }}
        contentContainerStyle={{ gap: 5, paddingHorizontal: 11, paddingTop: 10, paddingBottom: 8 }}
      >
        {CATEGORIES.map((c) => {
          const on = cat === c.id;
          return (
            <PixelButton
              key={c.id}
              bg={on ? c.bg : C.lighter}
              shadow={on ? c.sd : C.paleEdge}
              onPress={() => onCat(c.id)}
              innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <PixelText font="pixel" size={7} color={on ? c.fg : '#3a5d8a'}>
                {c.label}
              </PixelText>
            </PixelButton>
          );
        })}
      </ScrollView>

      {/* activity grid */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 7 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {activities.map((a) => (
            <PixelButton
              key={a.id}
              bg={C.parch}
              shadow={C.parchSd}
              light={C.parchSl}
              outline={C.parchBorder}
              onPress={() => onActivity(a.id)}
              style={{ width: '48.5%', marginBottom: 8 }}
              innerStyle={{ paddingHorizontal: 8, paddingVertical: 9, minHeight: 88 }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: a.iconBg,
                  borderWidth: 2,
                  borderColor: C.inkSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 5,
                }}
              >
                <PixelText size={17}>{a.icon}</PixelText>
              </View>
              <PixelText font="pixel" size={7} color="#3a2a08">
                {a.name}
              </PixelText>
              <PixelText font="body" size={13} color="#6a5a38" style={{ marginTop: 4 }}>
                {a.desc}
              </PixelText>
            </PixelButton>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
