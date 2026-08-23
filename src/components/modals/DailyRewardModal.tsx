import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View, useWindowDimensions } from 'react-native';
import { DAILY_REWARD_ART } from '@/assets/generatedAssets';
import { DAILY_REWARDS, DailyRewardProgress, DailyRewardStatus } from '@/services/dailyRewards';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { shopItemById } from '@/data/shop';

interface Props {
  status: DailyRewardStatus;
  progress: DailyRewardProgress | null;
  onClaim: () => void;
}

const BONUS_LABEL = { health: 'health', stores: 'stores', reputation: 'renown' } as const;

function rewardSummary(day: number): string {
  const reward = DAILY_REWARDS[day - 1];
  if (!reward) return '';
  const bonus = reward.bonus ? ` +${reward.bonusAmount} ${BONUS_LABEL[reward.bonus]}` : '';
  const item = reward.itemId ? shopItemById(reward.itemId) : undefined;
  return `${reward.gold}g${bonus}${item ? ` + ${item.name}` : ''}`;
}

/**
 * A compact royal ledger: the full fortnight is visible at once, today's seal
 * is unmistakable, and the only exit is claiming the allowance.
 */
export function DailyRewardModal({ status, progress, onClaim }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 680;
  const reward = status.reward;
  const rewardItem = reward.itemId ? shopItemById(reward.itemId) : undefined;
  const isMilestone = status.cycleDay === 7 || status.cycleDay === DAILY_REWARDS.length;
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
          maxWidth: 470,
          alignSelf: 'center',
          backgroundColor: '#12345b',
          borderWidth: 4,
          borderColor: '#091d35',
          borderTopColor: '#e5aa2e',
          borderLeftColor: '#e5aa2e',
          borderBottomColor: '#07182c',
          borderRightColor: '#07182c',
          padding: compact ? 7 : 10,
        }}
      >
        <View style={{ borderWidth: 2, borderColor: '#d79b25', backgroundColor: '#f8edcf', padding: compact ? 8 : 11 }}>
          <View style={{ alignItems: 'center', height: compact ? 30 : 38 }}>
            <Image source={DAILY_REWARD_ART.crown} resizeMode="contain" style={{ width: compact ? 42 : 50, height: compact ? 28 : 36 }} />
          </View>

          <View style={{ marginHorizontal: compact ? -3 : 4, backgroundColor: '#f4bd32', borderWidth: 3, borderColor: '#7b4a0e', borderTopColor: '#ffe286', borderLeftColor: '#ffe286', paddingVertical: compact ? 8 : 10 }}>
            <PixelText font="pixel" size={compact ? 8 : 10} color="#3b2708" style={{ textAlign: 'center' }}>
              THE STEWARD'S LEDGER
            </PixelText>
          </View>

          <PixelText font="body" size={compact ? 16 : 18} color={C.textBrown} style={{ textAlign: 'center', marginTop: compact ? 7 : 10 }}>
            Thy daily gift awaits.
          </PixelText>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Image source={DAILY_REWARD_ART.candle} resizeMode="contain" style={{ width: compact ? 25 : 30, height: compact ? 25 : 30 }} />
            <PixelText font="pixel" size={compact ? 7 : 8} color={C.textBrown}>
              STREAK · <PixelText font="pixel" size={compact ? 7 : 8} color={C.amber}>{status.nextStreak} {status.nextStreak === 1 ? 'DAY' : 'DAYS'}</PixelText>
            </PixelText>
          </View>
          {status.usedGrace && (
            <PixelText font="body" size={14} color={C.blue} style={{ textAlign: 'center', marginTop: 3 }}>
              A missed day was forgiven. Thy streak stands.
            </PixelText>
          )}

          {[DAILY_REWARDS.slice(0, 7), DAILY_REWARDS.slice(7)].map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: 'row', gap: 3, marginTop: rowIndex === 0 ? (compact ? 7 : 10) : 6 }}>
              {row.map((item) => {
                const claimed = item.day < status.cycleDay;
                const today = item.day === status.cycleDay;
                const milestone = item.day === 7 || item.day === 14;
                return (
                  <View
                    key={item.day}
                    accessibilityLabel={`Reward day ${item.day}${today ? ', current day' : ''}: ${rewardSummary(item.day)}`}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: compact ? 50 : 59,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: today ? '#ffd45d' : claimed ? '#f4e4b6' : '#e4eef8',
                      borderWidth: today ? 3 : 2,
                      borderColor: today ? '#8c5107' : claimed ? '#c29b4a' : '#83a7cc',
                      borderBottomColor: today ? '#6b3904' : claimed ? '#9b7434' : '#527ba5',
                    }}
                  >
                    {today && <View style={{ position: 'absolute', top: -5, left: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#a62b16', borderWidth: 2, borderColor: '#64180d' }} />}
                    <PixelText font="pixel" size={compact ? 6 : 7} color={today ? '#3a2606' : C.blueDark}>{item.day}</PixelText>
                    {milestone ? (
                      <View style={{ alignItems: 'center' }}>
                        <Image source={DAILY_REWARD_ART.chest} resizeMode="contain" style={{ width: compact ? 19 : 22, height: compact ? 15 : 18 }} />
                        <PixelText font="body" size={compact ? 9 : 11} color={today ? '#4f3005' : C.textBrown}>{item.gold}g</PixelText>
                      </View>
                    ) : (
                      <PixelText font="body" size={compact ? 12 : 14} color={today ? '#4f3005' : C.textBrown} style={{ marginTop: 2 }}>{item.gold}g</PixelText>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <View style={{ height: 1, backgroundColor: '#d7a13d', marginVertical: compact ? 8 : 11 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: compact ? 108 : 126 }}>
            <Image source={DAILY_REWARD_ART.purse} resizeMode="contain" style={{ width: compact ? 118 : 145, height: compact ? 108 : 126 }} />
            <View style={{ flex: 1, paddingLeft: compact ? 5 : 10 }}>
              <PixelText font="pixel" size={compact ? 15 : 19} color="#5a330d">{reward.gold} GOLD</PixelText>
              <PixelText font="pixel" size={compact ? 6 : 7} color={C.blueDark} style={{ marginTop: 8 }}>DAY {status.cycleDay} OF {DAILY_REWARDS.length}</PixelText>
              <PixelText font="body" size={compact ? 14 : 16} color={C.textBrown} style={{ marginTop: 7 }}>{reward.label}.</PixelText>
              {reward.bonus && <PixelText font="body" size={compact ? 13 : 15} color={C.good}>Also +{reward.bonusAmount} {BONUS_LABEL[reward.bonus]}.</PixelText>}
              {rewardItem && <PixelText font="pixel" size={compact ? 6 : 7} color={C.purpleDark} style={{ marginTop: 5 }}>SPECIAL: {rewardItem.name}</PixelText>}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#c5a269', backgroundColor: '#f1dfbd', paddingHorizontal: 8, paddingVertical: compact ? 5 : 7 }}>
            <PixelText font="pixel" size={6} color={C.amber}>›</PixelText>
            <PixelText font="body" size={compact ? 13 : 15} color={C.textBrown} style={{ flex: 1, marginLeft: 7 }}>
              {isFinalDay ? 'The ledger begins anew on the morrow.' : `Return on the morrow for ${rewardSummary(status.cycleDay + 1)}.`}
            </PixelText>
            <Image source={isMilestone ? DAILY_REWARD_ART.chest : DAILY_REWARD_ART.purse} resizeMode="contain" style={{ width: 30, height: 26 }} />
          </View>

          <Animated.View style={{ transform: [{ scale: glow }], marginTop: compact ? 8 : 11 }}>
            <PixelButton bg="#f7c431" shadow="#9a5b08" light="#ffe58a" onPress={onClaim} innerStyle={{ paddingVertical: compact ? 11 : 14, alignItems: 'center' }}>
              <PixelText font="pixel" size={compact ? 9 : 11} color="#3a2606">CLAIM THY GOLD</PixelText>
            </PixelButton>
          </Animated.View>
        </View>

        <PixelText font="pixel" size={compact ? 5 : 6} color="#efbf4b" style={{ textAlign: 'center', marginTop: compact ? 7 : 9 }}>
          BEST STREAK: {Math.max(progress?.longestStreak ?? 0, status.nextStreak)} DAYS · TOTAL GIFTS TAKEN: {(progress?.totalClaims ?? 0) + 1}
        </PixelText>
      </View>
    </ModalBackdrop>
  );
}
