import React from 'react';
import { View } from 'react-native';
import { DAILY_REWARDS, DailyRewardStatus } from '@/services/dailyRewards';
import { C } from '@/theme/theme';
import { PixelText } from '../ui/PixelText';
import { RetentionPromptFrame } from './RetentionPromptFrame';

interface Props {
  status: DailyRewardStatus;
  onClaim: () => void;
  onLater: () => void;
}

function bonusText(status: DailyRewardStatus): string {
  const reward = status.reward;
  if (!reward.bonus) return `${reward.gold} gold`;
  const labels = { health: 'health', stores: 'household stores', reputation: 'reputation' };
  return `${reward.gold} gold + ${reward.bonusAmount} ${labels[reward.bonus]}`;
}

export function DailyRewardModal({ status, onClaim, onLater }: Props) {
  return (
    <RetentionPromptFrame
      zIndex={59}
      accent={C.amber}
      eyebrow="DAILY PROVISIONS"
      title={status.reward.label}
      description={
        <View style={{ alignItems: 'center', gap: 6 }}>
          <PixelText font="pixel" size={8} color={C.amber} style={{ textAlign: 'center' }}>{bonusText(status).toUpperCase()}</PixelText>
          <PixelText font="body" size={17} color={C.textBrown} style={{ textAlign: 'center' }}>Day {status.cycleDay} of 7 · {status.nextStreak} day streak</PixelText>
          {status.usedGrace && <PixelText font="body" size={15} color={C.blue} style={{ textAlign: 'center' }}>Thy grace day protected the streak.</PixelText>}
        </View>
      }
      primaryLabel="CLAIM FREE GIFT"
      primaryStyle={{ background: C.gold, shadow: C.amber, light: '#fff1b0', text: C.textDark }}
      onPrimary={onClaim}
      secondaryLabel="LATER"
      onSecondary={onLater}
    >
      {(compact) => (
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 11 }}>
          {DAILY_REWARDS.map((reward) => {
            const active = reward.day === status.cycleDay;
            return (
              <View key={reward.day} accessibilityLabel={`Reward day ${reward.day}`} style={{ flex: 1, height: compact ? 28 : 34, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? C.gold : reward.day < status.cycleDay ? C.goodBg : C.lightFill, borderWidth: active ? 3 : 2, borderColor: active ? C.amber : C.paleEdge }}>
                <PixelText font="pixel" size={compact ? 6 : 7} color={C.textDark}>{reward.day}</PixelText>
              </View>
            );
          })}
        </View>
      )}
    </RetentionPromptFrame>
  );
}
