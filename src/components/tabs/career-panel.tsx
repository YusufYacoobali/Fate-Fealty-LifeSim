import React from 'react';
import { View } from 'react-native';
import { GameState } from '@/types/game';
import { CareerAction, careerActionAvailability } from '@/engine/careerEngine';
import { ENTRY_CAREERS, careerAvailability, careerById } from '@/data/careers';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { C, PANEL } from '@/theme/theme';

export function CareerPanel({ state, onAction }: { state: GameState; onAction: (action: CareerAction, careerId?: string) => void }) {
  const career = careerById(state.occupation.careerId);
  const debt = state.debts.reduce((sum, item) => sum + item.principal, 0);
  const button = (action: CareerAction, label: string, hint: string, careerId?: string) => {
    const available = careerActionAvailability(state, action, careerId);
    return <PixelButton key={`${action}_${careerId ?? ''}`} bg={available.available ? C.light : C.lightFill} shadow={available.available ? C.blue : C.paleEdge} disabled={!available.available} onPress={() => onAction(action, careerId)} style={{ width: '48.5%', marginBottom: 7 }} innerStyle={{ padding: 8, minHeight: 70 }}>
      <PixelText font="pixel" size={6} color={C.blueDark}>{label}</PixelText>
      <PixelText font="body" size={13} color={available.available ? C.textMuted : C.bad} style={{ marginTop: 4 }}>{available.available ? hint : available.reason}</PixelText>
    </PixelButton>;
  };

  return <View style={{ marginBottom: 12 }}>
    <View style={PANEL.parchCard}>
      <PixelText font="pixel" size={7} color={C.blueDeep}>WORK, STATION & COIN</PixelText>
      <PixelText font="body" size={16} color={C.textDark} style={{ marginTop: 5 }}>{career ? `${career.icon} ${career.title} · ${career.wage}g per shift` : 'Unemployed · choose an occupation below'}</PixelText>
      <PixelText font="body" size={14} color={C.textMuted}>Experience {state.occupation.experience} · Performance {state.occupation.performance} · Debt {debt}g</PixelText>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 }}>
      {career && button('work', `WORK AS ${career.title.toUpperCase()}`, `Earn about ${career.wage}g`)}
      {career && button('train', 'TRAIN AT WORK', '+experience and performance')}
      {career?.promotesTo && button('promote', 'ASK PROMOTION', 'Advance this career')}
      {career && button('resign', 'RESIGN', 'Leave this occupation')}
      {button('rank_duty', 'RANK DUTY', 'A duty unique to thy station')}
      {button(debt ? 'repay' : 'borrow', debt ? 'REPAY DEBT' : 'BORROW 20G', debt ? 'Pay up to 10g' : '10% annual interest')}
      {button('odd_job', 'ODD WORK', 'Small, dependable pay')}
      {button('craft', 'CRAFT TO SELL', '2g materials · wits roll')}
      {button('trade', 'TRADE GOODS', '3g stock · charm roll')}
    </View>
    {!career && <>
      <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginVertical: 7 }}>AVAILABLE OCCUPATIONS</PixelText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {ENTRY_CAREERS.map((entry) => {
          const reason = careerAvailability(state, entry);
          return <PixelButton key={entry.id} bg={reason ? C.lightFill : C.parch} shadow={reason ? C.paleEdge : C.parchSd} disabled={!!reason} onPress={() => onAction('apply', entry.id)} style={{ width: '48.5%', marginBottom: 7 }} innerStyle={{ padding: 8, minHeight: 82 }}>
            <PixelText font="pixel" size={6} color={C.textDark}>{entry.icon} {entry.title.toUpperCase()}</PixelText>
            <PixelText font="body" size={13} color={reason ? C.bad : C.textMuted} style={{ marginTop: 4 }}>{reason ?? `${entry.wage}g/shift · ${entry.desc}`}</PixelText>
          </PixelButton>;
        })}
      </View>
    </>}
  </View>;
}
