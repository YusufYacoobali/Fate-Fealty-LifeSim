import React from 'react';
import { ScrollView } from 'react-native';
import { RpgHub } from '../rpg/RpgPanels';
import { TradeJourneyPanel } from '../rpg/Workshop';
import { useGame } from '@/state/GameContext';

export function QuestsTab() {
  const { state } = useGame();
  return <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
    <RpgHub />
    {state.questSection === 'careers' && <TradeJourneyPanel />}
  </ScrollView>;
}
