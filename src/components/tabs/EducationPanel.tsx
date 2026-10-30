import React from 'react';
import { View } from 'react-native';
import { GameState } from '@/types/game';
import { EDUCATION_TRACKS, educationTrack } from '@/data/education';
import { EducationAction, educationAvailability, educationFee } from '@/engine/educationEngine';
import { useGame } from '@/state/GameContext';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { C, PANEL } from '@/theme/theme';

export function EducationPanel({ state }: { state: GameState }) {
  const { dispatch } = useGame();
  const e = state.world.characters[state.playerCharacterId].education;
  if (state.age < 5) return <View style={PANEL.parchCard}><PixelText font="body" size={16}>Your household guides your first years. Learning paths open at age five.</PixelText></View>;
  if (!e) return null;
  const button = (action: EducationAction, label: string, track?: typeof e.track) => {
    const reason = educationAvailability(state, action, track ?? undefined);
    return <PixelButton key={`${action}_${track ?? ''}`} bg={reason ? C.lightFill : C.parch} shadow={C.parchSd} disabled={!!reason} onPress={() => dispatch({ type: 'EDUCATION', action, track: track ?? undefined })} style={{ width: '48.5%', marginBottom: 8 }} innerStyle={{ padding: 9, minHeight: 68 }}><PixelText font="pixel" size={7}>{label}</PixelText><PixelText font="body" size={14} color={reason ? C.bad : C.textMuted} style={{ marginTop: 4 }}>{reason ?? (action === 'enrol' && track ? `${educationFee(state, track)}g tuition · 1 action` : '1 action')}</PixelText></PixelButton>;
  };
  return <View style={{ marginBottom: 14 }}>
    <View style={PANEL.parchCard}>
      <PixelText font="pixel" size={9} color={C.blueDeep}>LEARNING & MENTORS</PixelText>
      <PixelText font="body" size={16} style={{ marginTop: 6 }}>{e.track ? `${educationTrack(e.track).name} · ${e.progress}/100 · Conduct concerns ${e.misconduct}` : 'Choose a path, or grow up without formal learning. Later study is always possible.'}</PixelText>
      <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 4 }}>{e.qualifications.length ? e.qualifications.map(q => q.replaceAll('_', ' ')).join(' · ') : 'No qualifications yet.'} Three learning opportunities each year.</PixelText>
      {e.mentorId && <PixelText font="body" size={14} style={{ marginTop: 4 }}>Mentor: {state.world.characters[e.mentorId]?.name ?? 'Awaiting replacement'}. Fellow learners: {e.classmateIds.map(id => state.world.characters[id]?.name).filter(Boolean).join(', ')}.</PixelText>}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 }}>
      {!e.scholarship && button('scholarship', 'EARN A BURSARY')}
      {!e.track && EDUCATION_TRACKS.map(t => button('enrol', t.name.toUpperCase(), t.id))}
      {e.track && <>{button('study', 'STUDY')}{button('practise', 'PRACTISE')}{button('mentor', 'ASK MENTOR')}{button('challenge', 'CHALLENGE CLASSMATE')}{button('bully', 'BULLY CLASSMATE')}{button('cheat', 'CHEAT')}{button('skip', 'SKIP LESSONS')}{button('graduate', 'COMPLETE TRAINING')}{button('leave', 'LEAVE TRAINING')}</>}
    </View>
  </View>;
}
