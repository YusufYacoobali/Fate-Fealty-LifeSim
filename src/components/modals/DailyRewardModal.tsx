import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, useWindowDimensions } from 'react-native';
import { DAILY_REWARDS, DailyRewardProgress, DailyRewardStatus } from '@/services/dailyRewards';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';

interface Props {
  status: DailyRewardStatus;
  progress: DailyRewardProgress | null;
  onClaim: () => void;
  onLater: () => void;
}

const BONUS_LABEL = { health: 'health', stores: 'stores', reputation: 'renown' } as const;

function rewardSummary(day: number): string {
  const reward = DAILY_REWARDS[day - 1];
  if (!reward) return '';
  return reward.bonus ? `${reward.gold}g +${reward.bonusAmount} ${BONUS_LABEL[reward.bonus]}` : `${reward.gold}g`;
}

/**
 * The daily gift, built for the one job it has: making tomorrow feel worth
 * coming back for. The streak leads, the seven-day track shows exactly how far
 * along the cycle is, and the next two days are named so there is always a
 * concrete reason to return.
 */
export function DailyRewardModal({ status, progress, onClaim, onLater }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 680;
  const reward = status.reward;
  const tomorrow = DAILY_REWARDS[status.cycleDay % DAILY_REWARDS.length];
  const isFinalDay = status.cycleDay === DAILY_REWARDS.length;

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <ModalBackdrop zIndex={60}>
      <View
        style={{
          width: '100%',
          maxWidth: 450,
          alignSelf: 'center',
          backgroundColor: C.parch,
          borderWidth: 4,
          borderColor: C.inkSoft,
          borderTopColor: C.parchSl,
          borderLeftColor: C.parchSl,
          borderBottomColor: C.parchSd,
          borderRightColor: C.parchSd,
          padding: compact ? 11 : 15,
        }}
      >
        <View style={{ backgroundColor: C.amber, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: '#6d4512', borderRightColor: '#6d4512', paddingVertical: 7 }}>
          <PixelText font="pixel" size={compact ? 8 : 9} color="#fff1b0" style={{ textAlign: 'center' }}>
            THE STEWARD'S DAILY GIFT
          </PixelText>
        </View>

        {/* The streak is the hook, so it gets the largest type on the screen. */}
        <View style={{ alignItems: 'center', marginTop: compact ? 10 : 14 }}>
          <PixelText font="pixel" size={7} color={C.textMuted}>UNBROKEN FOR</PixelText>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 5 }}>
            <PixelText size={compact ? 30 : 36}>🔥</PixelText>
            <PixelText font="pixel" size={compact ? 22 : 28} color={C.amber}>{status.nextStreak}</PixelText>
            <PixelText font="body" size={compact ? 18 : 21} color={C.textBrown} style={{ marginBottom: 4 }}>
              {status.nextStreak === 1 ? 'day' : 'days'}
            </PixelText>
          </View>
          {status.usedGrace && (
            <PixelText font="body" size={15} color={C.blue} style={{ textAlign: 'center', marginTop: 5 }}>
              A missed day was forgiven. Thy streak stands.
            </PixelText>
          )}
        </View>

        {/* Seven-day track: what is done, what is today, what is still to come. */}
        <View style={{ flexDirection: 'row', gap: 3, marginTop: compact ? 11 : 15 }}>
          {DAILY_REWARDS.map((item) => {
            const claimed = item.day < status.cycleDay;
            const today = item.day === status.cycleDay;
            const crown = item.day === DAILY_REWARDS.length;
            return (
              <View
                key={item.day}
                accessibilityLabel={`Reward day ${item.day}`}
                style={{
                  flex: 1,
                  paddingVertical: compact ? 5 : 7,
                  alignItems: 'center',
                  backgroundColor: today ? C.gold : claimed ? C.goodBg : C.lightFill,
                  borderWidth: today ? 3 : 2,
                  borderColor: today ? '#6d4512' : claimed ? C.goodBorder : C.paleEdge,
                }}
              >
                <PixelText font="pixel" size={6} color={today ? '#3a2a08' : claimed ? C.good : C.blue}>
                  {claimed ? '✓' : crown ? '👑' : item.day}
                </PixelText>
                <PixelText font="body" size={compact ? 12 : 13} color={today ? '#3a2a08' : C.textMuted} style={{ marginTop: 2 }}>
                  {item.gold}g
                </PixelText>
              </View>
            );
          })}
        </View>

        {/* Today's actual prize. */}
        <View style={{ backgroundColor: '#fff6df', borderWidth: 3, borderColor: C.charm, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: compact ? 9 : 12, marginTop: compact ? 11 : 14, alignItems: 'center' }}>
          <PixelText font="pixel" size={7} color={C.amber}>
            {isFinalDay ? "DAY SEVEN · THE VILLAGE BOUNTY" : `DAY ${status.cycleDay} OF ${DAILY_REWARDS.length}`}
          </PixelText>
          <PixelText font="body" size={compact ? 19 : 22} color={C.textDark} style={{ textAlign: 'center', marginTop: 5 }}>
            {reward.label}
          </PixelText>
          <PixelText font="pixel" size={compact ? 10 : 12} color={C.amber} style={{ textAlign: 'center', marginTop: 7 }}>
            {rewardSummary(status.cycleDay).toUpperCase()}
          </PixelText>
        </View>

        <PixelText font="body" size={15} color={C.textBrown} style={{ textAlign: 'center', marginTop: 9 }}>
          {isFinalDay
            ? 'Return tomorrow and the cycle begins anew, with thy grace day restored.'
            : `Return tomorrow for ${tomorrow.label.toLowerCase()} — ${rewardSummary(status.cycleDay + 1)}.`}
        </PixelText>

        <Animated.View style={{ transform: [{ scale: glow }], marginTop: compact ? 11 : 14 }}>
          <PixelButton bg={C.gold} shadow={C.amber} light="#fff1b0" onPress={onClaim} innerStyle={{ paddingVertical: compact ? 12 : 14, alignItems: 'center' }}>
            <PixelText font="pixel" size={compact ? 9 : 10} color="#3a2a08">
              CLAIM THY GIFT
            </PixelText>
          </PixelButton>
        </Animated.View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
          <PixelText font="body" size={14} color={C.textMuted}>
            {progress ? `Best streak ${Math.max(progress.longestStreak, status.nextStreak)} · ${progress.totalClaims + 1} gifts taken` : ' '}
          </PixelText>
          <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={onLater} innerStyle={{ paddingHorizontal: 11, paddingVertical: 7 }}>
            <PixelText font="pixel" size={7} color={C.blue}>LATER</PixelText>
          </PixelButton>
        </View>
      </View>
    </ModalBackdrop>
  );
}
