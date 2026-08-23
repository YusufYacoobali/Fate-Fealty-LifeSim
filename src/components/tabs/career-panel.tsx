import React from 'react';
import { Image, View } from 'react-native';
import { GameState } from '@/types/game';
import { CareerAction, careerActionAvailability } from '@/engine/careerEngine';
import { ENTRY_CAREERS, careerById } from '@/data/careers';
import { CAREER_ACTION_ART, CAREER_FAMILY_ART, FEATURE_ART } from '@/assets/generatedAssets';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { C, PANEL } from '@/theme/theme';
import { MAX_ROUTINE_ACTIVITY_USES, routineActivityUseCount } from '@/engine/activityVariety';

function careerRoutineId(action: CareerAction): string | null {
  if (action === 'train') return 'career_train';
  if (action === 'rank_duty') return 'rank_duty';
  return null;
}

export function CareerPanel({ state, onAction }: { state: GameState; onAction: (action: CareerAction, careerId?: string) => void }) {
  const career = careerById(state.occupation.careerId);
  const debt = state.debts.reduce((sum, item) => sum + item.principal, 0);
  const actionsRemaining = Math.max(0, state.actionClock.cap - state.actionClock.used);
  const careerArt = (family: string) => CAREER_FAMILY_ART[family as keyof typeof CAREER_FAMILY_ART] ?? FEATURE_ART.work;
  const currentArt = career ? careerArt(career.family) : null;

  const button = (action: CareerAction, label: string, hint: string, careerId?: string) => {
    const baseAvailability = careerActionAvailability(state, action, careerId);
    const routineId = careerRoutineId(action);
    const routineExhausted = Boolean(
      baseAvailability.available
      && routineId
      && routineActivityUseCount(state, routineId) >= MAX_ROUTINE_ACTIVITY_USES,
    );
    const available = routineExhausted
      ? { available: false, reason: 'Enough for one year — try another pursuit.' }
      : baseAvailability;
    const actionArt = CAREER_ACTION_ART[action as keyof typeof CAREER_ACTION_ART];
    return (
      <PixelButton
        key={`${action}_${careerId ?? ''}`}
        bg={available.available ? C.light : C.lightFill}
        shadow={available.available ? C.blue : C.paleEdge}
        disabled={!available.available}
        onPress={() => onAction(action, careerId)}
        style={{ width: '48.5%', marginBottom: 8 }}
        innerStyle={{ padding: 9, minHeight: 106 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          {actionArt && <Image source={actionArt} resizeMode="contain" style={{ width: 34, height: 34 }} />}
          <PixelText font="pixel" size={7} color={C.blueDark} style={{ flex: 1 }}>{label}</PixelText>
        </View>
        <PixelText font="body" size={14} color={available.available ? C.textMuted : C.bad} style={{ marginTop: 5 }}>
          {available.available ? hint : available.reason}
        </PixelText>
      </PixelButton>
    );
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ borderWidth: 3, borderColor: C.inkSoft, backgroundColor: C.parch }}>
        <Image source={FEATURE_ART.work} resizeMode="cover" style={{ width: '100%', height: 112 }} />
        <View style={{ padding: 10, borderTopWidth: 3, borderTopColor: C.parchSd }}>
          <PixelText font="pixel" size={9} color={C.blueDeep}>WORK BUILDS A LIFE</PixelText>
          <PixelText font="body" size={15} color={C.textDark} style={{ marginTop: 5 }}>
            Take a job, work shifts for gold, then train for experience and better performance. Higher career tiers pay more and help shape your reputation and story path.
          </PixelText>
          <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 5 }}>
            Work at least once each year. Ignoring your job lowers performance and can get you dismissed.
          </PixelText>
        </View>
      </View>

      <View style={[PANEL.parchCard, { marginTop: 9, minHeight: 88 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          {currentArt && (
            <View style={{ width: 48, height: 48, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={currentArt} resizeMode="contain" style={{ width: 41, height: 41 }} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <PixelText font="pixel" size={8} color={C.blueDeep}>CURRENT OCCUPATION</PixelText>
            <PixelText font="body" size={17} color={C.textDark} style={{ marginTop: 5 }}>
              {career ? `${career.title}. About ${career.wage}g per shift.` : 'Unemployed. Choose an occupation below.'}
            </PixelText>
          </View>
        </View>
        <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 6 }}>
          Experience {state.occupation.experience}. Performance {state.occupation.performance}. Debt {debt}g. Actions left {actionsRemaining}.
        </PixelText>
      </View>

      {actionsRemaining === 0 && (
        <View style={{ backgroundColor: C.badBg, borderWidth: 2, borderColor: C.badBorder, padding: 9, marginTop: 8 }}>
          <PixelText font="pixel" size={7} color={C.bad}>THE WORKDAY IS OVER</PixelText>
          <PixelText font="body" size={14} color={C.textDark} style={{ marginTop: 4 }}>Age up to receive a fresh set of actions.</PixelText>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 9 }}>
        {career && button('work', `WORK AS ${career.title.toUpperCase()}`, `Earn about ${career.wage}g and improve performance.`)}
        {career && button('train', 'TRAIN AT WORK', 'Gain experience and performance for promotion.')}
        {career?.promotesTo && button('promote', 'ASK PROMOTION', 'Advance to a better paid career tier.')}
        {career && button('resign', 'RESIGN', 'Leave this occupation.')}
        {button('rank_duty', 'RANK DUTY', 'Earn rewards tied to your social station.')}
        {button(debt ? 'repay' : 'borrow', debt ? 'REPAY DEBT' : 'BORROW 20G', debt ? 'Pay up to 10g.' : 'Debt gains 10% interest each year.')}
        {button('odd_job', 'ODD WORK', 'Small dependable pay without taking a job.')}
        {button('craft', 'CRAFT TO SELL', 'Spend 2g. Wits decides whether it profits.')}
        {button('trade', 'TRADE GOODS', 'Spend 3g. Charm decides whether it profits.')}
      </View>

      {!career && (
        <>
          <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginVertical: 8 }}>CHOOSE AN OCCUPATION</PixelText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {ENTRY_CAREERS.map((entry) => {
              const availability = careerActionAvailability(state, 'apply', entry.id);
              const art = careerArt(entry.family);
              return (
                <PixelButton
                  key={entry.id}
                  bg={availability.available ? C.parch : C.lightFill}
                  shadow={availability.available ? C.parchSd : C.paleEdge}
                  disabled={!availability.available}
                  onPress={() => onAction('apply', entry.id)}
                  style={{ width: '48.5%', marginBottom: 8 }}
                  innerStyle={{ padding: 9, minHeight: 126 }}
                >
                  <View style={{ width: 38, height: 38, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={art} resizeMode="contain" style={{ width: 32, height: 32 }} />
                  </View>
                  <PixelText font="pixel" size={7} color={C.textDark} style={{ marginTop: 6 }}>{entry.title.toUpperCase()}</PixelText>
                  <PixelText font="body" size={14} color={availability.available ? C.textMuted : C.bad} style={{ marginTop: 5 }}>
                    {availability.available ? `${entry.wage}g per shift. ${entry.desc}` : availability.reason}
                  </PixelText>
                </PixelButton>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
