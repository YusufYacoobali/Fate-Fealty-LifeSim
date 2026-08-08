import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { ACTIVITY_DEFS, CATEGORIES } from '@/data/activities';
import { ActivityCategory, GameState } from '@/types/game';
import { C } from '@/theme/theme';
import { ACTIVITY_ICONS } from '@/assets/generatedAssets';
import { CareerPanel } from './career-panel';
import { CareerAction } from '@/engine/careerEngine';
import { deriveLifeRole } from '@/content/persistentStories';

interface Props {
  cat: ActivityCategory | 'all';
  age: number;
  state: GameState;
  onCat: (c: ActivityCategory | 'all') => void;
  onActivity: (id: string) => void;
  onCareer: (action: CareerAction, careerId?: string) => void;
}

export function DoTab({ cat, age, state, onCat, onActivity, onCareer }: Props) {
  const role = deriveLifeRole(state);
  const activities = ACTIVITY_DEFS.filter((a) => (!a.roles || a.roles.includes(role)) && (cat === 'all' || a.cat === cat));

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
              <PixelText font="pixel" size={8} color={on ? c.fg : '#3a5d8a'}>
                {c.label}
              </PixelText>
            </PixelButton>
          );
        })}
      </ScrollView>

      {/* activity grid */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 7 }}>
        {(cat === 'all' || cat === 'work') && <CareerPanel state={state} onAction={onCareer} />}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {activities.map((a) => {
            const ageLocked = a.minAge != null && age < a.minAge;
            const timeLocked = state.actionClock.used >= state.actionClock.cap;
            const locked = ageLocked || timeLocked;
            return (
              <PixelButton
                key={a.id}
                bg={C.parch}
                shadow={C.parchSd}
                light={C.parchSl}
                outline={C.parchBorder}
                onPress={() => onActivity(a.id)}
                disabled={locked}
                style={{ width: '48.5%', marginBottom: 8 }}
                innerStyle={{ paddingHorizontal: 8, paddingVertical: 9, minHeight: 100 }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    backgroundColor: a.iconBg,
                    borderWidth: 2,
                    borderColor: C.inkSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 5,
                  }}
                >
                  <Image source={ACTIVITY_ICONS[a.id]} resizeMode="contain" style={{ width: 36, height: 36 }} />
                </View>
                <PixelText font="pixel" size={8} color="#3a2a08">
                  {a.name}
                </PixelText>
                <PixelText font="body" size={13} color={locked ? C.bad : '#6a5a38'} style={{ marginTop: 4 }}>
                  {timeLocked ? 'No actions remain — age up.' : ageLocked ? `🔒 Age ${a.minAge}+` : a.desc}
                </PixelText>
              </PixelButton>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
