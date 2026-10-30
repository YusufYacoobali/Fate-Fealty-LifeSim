import { specializationsFor } from '@/data/careerSpecializations';
import { ForgePlayButton } from '../rpg/Workshop';
import React, { useState } from 'react';
import { PanelChips } from '../ui/PanelChips';
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
  const [section, setSection] = useState<'work' | 'profession' | 'commissions' | 'record'>('work');
  const [finances, setFinances] = useState(false);
  const [job, setJob] = useState(ENTRY_CAREERS[0].family);
  const career = careerById(state.occupation.careerId);
  const record = career ? state.world.characters[state.playerCharacterId].professionalHistory?.[career.family] : undefined;
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
        innerStyle={{ padding: 9, minHeight: 88 }}
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
        <Image source={FEATURE_ART.work} resizeMode="cover" style={{ width: '100%', height: 74 }} />
        <View style={{ padding: 10, borderTopWidth: 3, borderTopColor: C.parchSd }}>
          <PixelText font="pixel" size={9} color={C.blueDeep}>WORK BUILDS A LIFE</PixelText>
          <PixelText font="body" size={15} color={C.textDark} style={{ marginTop: 5 }}>
            Work pays wages. Training and professional decisions build your career; qualifications open further paths.
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
          Professional standing {career ? state.world.characters[state.playerCharacterId].professionalHistory?.[career.family]?.reputation ?? 0 : 0}. Experience {state.occupation.experience}. Performance {state.occupation.performance}. Debt {debt}g. Actions left {actionsRemaining}.
        </PixelText>
      </View>

      {actionsRemaining === 0 && (
        <View style={{ backgroundColor: C.badBg, borderWidth: 2, borderColor: C.badBorder, padding: 9, marginTop: 8 }}>
          <PixelText font="pixel" size={7} color={C.bad}>THE WORKDAY IS OVER</PixelText>
          <PixelText font="body" size={14} color={C.textDark} style={{ marginTop: 4 }}>Age up to receive a fresh set of actions.</PixelText>
        </View>
      )}

      <PanelChips items={[{ id: 'work',label: 'Work' }, { id: 'profession',label: 'Profession' }, { id: 'commissions',label: 'Commissions' }, { id: 'record',label: 'Standing' }]} value={section} onChange={setSection} />
      {section === 'profession' && <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {career && specializationsFor(career.family).filter(a => !a.story).map(a => button('specialize', a.name.toUpperCase(), `${a.cost}g · professional milestone`, a.id))}
        </View>}
      {section === 'work' && <><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 9 }}>
        {career && button('work', `WORK AS ${career.title.toUpperCase()}`, `Earn about ${career.wage}g and improve performance.`)}
        {career && button('train', 'TRAIN AT WORK', 'Gain experience and performance for promotion.')}
        {career?.promotesTo && button('promote', 'ASK PROMOTION', 'Advance to a better paid career tier.')}
        {career && button('resign', 'RESIGN', 'Leave this occupation.')}
        {career?.family === 'martial' && button('honour', 'PETITION FOR KNIGHTHOOD', 'Earn an honour through recognised service.')}
      </View>
      <PixelButton bg={C.lightFill} shadow={C.parchSd} onPress={() => setFinances(!finances)} style={{ marginVertical: 8 }} innerStyle={{ padding: 10 }}><PixelText size={16}>Household work & finances {finances ? '▴' : '▾'}</PixelText></PixelButton>
      {finances && <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {button('rank_duty', 'RANK DUTY', 'Earn rewards tied to your social station.')}
        {button(debt ? 'repay' : 'borrow', debt ? 'REPAY DEBT' : 'BORROW 20G', debt ? 'Pay up to 10g.' : 'Debt gains 10% interest each year.')}
        {button('odd_job', 'ODD WORK', 'Small dependable pay without taking a job.')}
        {button('trade', 'TRADE GOODS', 'Spend 3g. Charm decides whether it profits.')}
      </View>}</>}

      {section === 'profession' && !career && <PixelText size={16}>Choose an occupation under Work to begin professional activities.</PixelText>}
      {section === 'commissions' && <><PixelText size={16}>Consequential commissions follow your professional work. Some settle at once; others return for a later reckoning.</PixelText><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 }}>{career && specializationsFor(career.family).filter(a => a.story).map(a => button('specialize', a.name, `${a.cost}g · a named commission`, a.id))}</View>{record?.matters.filter(m => !m.resolved).map((m,i) => <View key={i} style={[PANEL.parchCard,{ marginTop: 6 }]}><PixelText size={16}>{state.world.characters[m.actorId]?.name ?? 'Client unavailable'} · {specializationsFor(career!.family).find(a => a.id === m.id)?.name ?? m.id}. {m.stage === 1 ? 'A later reckoning is pending.' : 'A decision is pending.'}</PixelText></View>)}</>}
      {section === 'record' && <View style={PANEL.parchCard}><PixelText size={17}>Professional reputation: {record?.reputation ?? 0}</PixelText><PixelText size={16} style={{ marginTop: 6 }}>Achievements: {record?.milestones.map(m => m.replaceAll('_',' ')).join(' · ') || 'No milestones yet'}</PixelText><PixelText size={16} style={{ marginTop: 6 }}>Contacts: {record?.contactIds.map(id => state.world.characters[id]?.name).filter(Boolean).join(', ') || 'None yet'}</PixelText><PixelText size={16} style={{ marginTop: 6 }}>Rival: {state.world.characters[record?.rivalId ?? '']?.name ?? 'No established rival'}</PixelText><PixelText size={15} color={C.textMuted} style={{ marginTop: 6 }}>Earlier careers, commissions and relationships remain in your life record.</PixelText></View>}
      {section === 'profession' && career?.family === 'craft' && <ForgePlayButton task={{ kind: 'work' }} label="WORK AT THE ANVIL · 1 ACTION" />}

      {section === 'work' && !career && (
        <>
          <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginVertical: 8 }}>CHOOSE AN OCCUPATION</PixelText>
          <PanelChips items={ENTRY_CAREERS.map(c => ({ id: c.family,label: c.family }))} value={job} onChange={setJob} />
          <View>
            {ENTRY_CAREERS.filter(entry => entry.family === job).map((entry) => {
              const availability = careerActionAvailability(state, 'apply', entry.id);
              const art = careerArt(entry.family);
              return (
                <PixelButton
                  key={entry.id}
                  bg={availability.available ? C.parch : C.lightFill}
                  shadow={availability.available ? C.parchSd : C.paleEdge}
                  disabled={!availability.available}
                  onPress={() => onAction('apply', entry.id)}
                  style={{ marginBottom: 8 }}
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
