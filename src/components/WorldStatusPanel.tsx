import React from 'react';
import { View } from 'react-native';
import { GameState, WorldConditionKey } from '@/types/game';
import { PixelText } from './ui/PixelText';
import { C } from '@/theme/theme';
import { strongestConditionReasons } from '@/engine/worldSimulation';

const ITEMS: Array<[WorldConditionKey, string]> = [
  ['foodSecurity', 'FOOD'], ['prosperity', 'WEALTH'], ['publicOrder', 'ORDER'],
  ['warThreat', 'WAR'], ['diseasePressure', 'PLAGUE'], ['religiousTension', 'TENSION'],
];

export function WorldStatusPanel({ state, saveCompatibilityBlocked = false }: { state: GameState; saveCompatibilityBlocked?: boolean }) {
  const mostExtreme = [...ITEMS].sort(([a], [b]) => Math.abs(state.world.conditions[b] - 50) - Math.abs(state.world.conditions[a] - 50))[0][0];
  return (
    <View style={{ backgroundColor: C.blueDeep, paddingHorizontal: 9, paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: C.blue }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
        {ITEMS.map(([key, label]) => {
          const value = state.world.conditions[key];
          const danger = key === 'foodSecurity' || key === 'prosperity' || key === 'publicOrder' ? value < 35 : value > 65;
          return <View key={key} style={{ alignItems: 'center', flex: 1 }}>
            <PixelText font="pixel" size={5} color="#9fc4e8">{label}</PixelText>
            <PixelText font="pixel" size={6} color={danger ? C.health : C.faith}>{value}</PixelText>
          </View>;
        })}
      </View>
      <PixelText font="body" size={12} color="#bcd2eb" style={{ textAlign: 'center', marginTop: 3 }}>
        {state.world.currentYear} · {strongestConditionReasons(state, mostExtreme).join(', ')}
      </PixelText>
      {state.world.recoveryNotice && <PixelText font="body" size={12} color={C.charm} style={{ textAlign: 'center' }}>Some unfinished tales were safely concluded after an update.</PixelText>}
      {saveCompatibilityBlocked && <PixelText font="body" size={12} color={C.health} style={{ textAlign: 'center' }}>This device has a save from a newer game version. It remains untouched; saving is disabled until the game is updated.</PixelText>}
    </View>
  );
}
