import React, { useState } from 'react';
import { View } from 'react-native';
import type { GameState, EducationTrackId, SponsorshipKind } from '@/types/game';
import { EDUCATION_TRACKS, educationTrack } from '@/data/education';
import { EducationAction, educationAvailability, educationFee } from '@/engine/educationEngine';
import { educationHousehold, fundingSponsor } from '@/engine/educationFunding';
import { useGame } from '@/state/GameContext';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';
import { PanelChips } from '../ui/PanelChips';
import { PersonPicker } from '../ui/PersonPicker';
import { courtCandidatesFor } from '@/engine/courtPolitics';
import { C, PANEL } from '@/theme/theme';

const SECTIONS = [{ id: 'learning', label: 'Learning' }, { id: 'funding', label: 'Funding' }, { id: 'people', label: 'People' }, { id: 'record', label: 'Record' }] as const;
const ADULT_NAMES: Record<EducationTrackId,string> = { household: 'Independent household study', parish: 'Adult literacy lessons', guild: 'Late apprenticeship', cathedral: 'Scholarly and religious training', martial: 'Professional martial training', noble: 'Private court tutor' };
export function EducationPanel({ state }: { state: GameState }) {
  const { dispatch } = useGame();
  const [section, setSection] = useState<typeof SECTIONS[number]['id']>('learning');
  const [track, setTrack] = useState<EducationTrackId>('parish');
  const [funding, setFunding] = useState<SponsorshipKind>(state.age < 18 ? 'parish_charity' : 'merit');
  const [sponsorId, setSponsorId] = useState<string>();
  const [more, setMore] = useState(false);
  const e = state.world.characters[state.playerCharacterId].education;
  if (state.age < 5) return <View style={PANEL.parchCard}><PixelText size={16}>Your household guides your first years. Learning paths open at age five.</PixelText></View>;
  if (!e) return null;
  const chosen = e.track ?? track, def = educationTrack(chosen);
  const trackName = (id: EducationTrackId) => state.age >= 18 ? ADULT_NAMES[id] : educationTrack(id).name;
  const button = (action: EducationAction, label: string) => {
    const reason = educationAvailability(state,action,chosen,funding,sponsorId);
    return <PixelButton key={action} bg={reason ? C.lightFill : C.parch} shadow={C.parchSd} disabled={!!reason} onPress={() => dispatch({ type: 'EDUCATION',action,track: chosen,funding,sponsorId })} style={{ marginTop: 7 }} innerStyle={{ padding: 10, minHeight: 48 }}><PixelText font="pixel" size={7}>{label}</PixelText><PixelText size={15} color={reason ? C.bad : C.textMuted} style={{ marginTop: 5 }}>{reason ?? (action === 'enrol' ? `${educationFee(state,chosen)}g tuition · 1 action` : '1 action · three learning opportunities per year')}</PixelText></PixelButton>;
  };
  const sponsor = fundingSponsor(state,funding,chosen,sponsorId);
  return <View style={{ marginBottom: 14 }}>
    <View style={PANEL.parchCard}>
      <PixelText font="pixel" size={9} color={C.blueDeep}>LEARNING & MENTORS</PixelText>
      <PixelText size={18} style={{ marginTop: 6 }}>{e.track ? trackName(e.track) : state.age >= 18 ? 'Learning alongside adult life' : 'Choose your first learning path'}</PixelText>
      {e.track && <><PixelText size={15} style={{ marginVertical: 5 }}>Progress {e.progress}/100 · Conduct concerns {e.misconduct}</PixelText><StatBar value={e.progress} color={C.charm} dark={C.blue} animated={!state.settings.reducedMotion} /></>}
      <PixelText size={15} color={C.textMuted} style={{ marginTop: 6 }}>{e.qualifications.length ? e.qualifications.map(q => q.replaceAll('_',' ')).join(' · ') : 'No qualifications yet. Later study stays open.'}</PixelText>
      {e.track && <PixelText size={15}>Mentor: {state.world.characters[e.mentorId ?? '']?.name ?? 'Awaiting replacement'}</PixelText>}
    </View>
    <PanelChips items={SECTIONS} value={section} onChange={id => { setSection(id); setMore(false); }} />
    {section === 'learning' && <>
      {!e.track ? <View style={PANEL.parchCard}>
        <PanelChips items={EDUCATION_TRACKS.map(t => ({ id: t.id,label: t.id === 'noble' ? 'Court' : t.id === 'household' ? 'Home' : t.id[0].toUpperCase() + t.id.slice(1) }))} value={track} onChange={setTrack} />
        <PixelText size={18}>{trackName(track)}</PixelText><PixelText size={16} style={{ marginTop: 5 }}>{def.years} year{def.years === 1 ? '' : 's'} minimum · begins at {def.minAge}. {def.qualifications.map(q => q.replaceAll('_',' ')).join(', ') || 'Practical household skills'}.</PixelText>
        {button('enrol','BEGIN THIS LEARNING')}
        <PixelButton bg={C.lightFill} shadow={C.parchSd} onPress={() => setSection('funding')} style={{ marginTop: 8 }} innerStyle={{ padding: 10 }}><PixelText size={16}>Explore tuition support ▸</PixelText></PixelButton>
      </View> : <>
        {button('study','STUDY')}{button('practise','PRACTISE')}{button('mentor','ASK YOUR MENTOR')}
        {e.progress >= 100 && button('graduate','COMPLETE TRAINING')}
        <PixelButton bg={C.lightFill} shadow={C.parchSd} onPress={() => setMore(!more)} style={{ marginTop: 8 }} innerStyle={{ padding: 10 }}><PixelText size={16}>Other learning choices {more ? '▴' : '▾'}</PixelText></PixelButton>
        {more && <>{button('challenge',state.age >= 18 ? 'DEBATE A COLLEAGUE' : 'CHALLENGE A CLASSMATE')}{button('bully',state.age >= 18 ? 'HUMILIATE A COLLEAGUE' : 'BULLY A CLASSMATE')}{button('cheat','PASS OFF BORROWED WORK')}{button('skip','SKIP A LESSON')}{button('leave','LEAVE THIS TRAINING')}</>}
      </>}
    </>}
    {section === 'funding' && <View style={PANEL.parchCard}>
      {!e.track && <PanelChips items={EDUCATION_TRACKS.filter(t => t.fee > 0).map(t => ({ id: t.id,label: t.id }))} value={track} onChange={setTrack} />}
      <PixelText size={17}>{trackName(chosen)} · {educationFee(state,chosen)}g still due</PixelText>
      <PanelChips items={[...(state.age < 18 ? [{ id: 'parish_charity' as const,label: 'Charity' }] : []), { id: 'merit' as const,label: 'Merit' }, { id: 'household' as const,label: 'Household' }, { id: 'patron' as const,label: 'Patron' }]} value={funding} onChange={setFunding} />
      {funding === 'patron' && <PersonPicker people={courtCandidatesFor(state,'patron')} value={sponsorId} onChange={setSponsorId} />}
      <PixelText size={16}>{funding === 'household' ? `Household purse: ${educationHousehold(state)?.wealth ?? 0}g. Approval reserves real household resources.` : funding === 'parish_charity' ? 'Limited parish charity helps poor children learn their letters. An application may be declined.' : funding === 'merit' ? 'Learning ability, work, conduct and institutional support affect a limited bursary.' : 'An influential living patron must trust you and be able to pay.'}</PixelText>
      <PixelText size={15} style={{ marginTop: 5 }}>Sponsor: {sponsor?.name ?? 'No suitable sponsor'}. Awards cover one route’s tuition once.</PixelText>
      {button('scholarship','REQUEST THIS SUPPORT')}
      {e.applications?.slice(-1).map((a,i) => <PixelText key={i} size={15} style={{ marginTop: 7 }}>{a.reason}</PixelText>)}
      {e.sponsorships?.map(a => <PixelText key={a.id} size={15} color={C.textMuted} style={{ marginTop: 5 }}>{a.kind === 'legacy' ? 'Existing scholarship honoured' : `${a.track} · ${state.world.characters[a.sponsorId ?? '']?.name ?? a.kind}`} · {a.remaining === null ? 'tuition covered' : `${a.remaining}g remaining`} · {a.status}</PixelText>)}
    </View>}
    {section === 'people' && <View style={PANEL.parchCard}>
      <PixelText size={17}>Mentor: {state.world.characters[e.mentorId ?? '']?.name ?? 'Enrol to meet a mentor'}</PixelText>
      <PixelText size={16} style={{ marginTop: 6 }}>Current fellow learners: {(e.activeClassmateIds ?? e.classmateIds).map(id => state.world.characters[id]?.name).filter(Boolean).join(', ') || 'None yet'}.</PixelText>
      <PixelText size={15} color={C.textMuted} style={{ marginTop: 6 }}>Earlier companions: {e.classmateIds.filter(id => !e.activeClassmateIds?.includes(id)).map(id => state.world.characters[id]?.name).filter(Boolean).join(', ') || 'None'}. Friendships and grudges stay in the world.</PixelText>
    </View>}
    {section === 'record' && <View style={PANEL.parchCard}>{e.history.length ? e.history.map((h,i) => <PixelText key={i} size={16} style={{ marginBottom: 6 }}>Year {h.year} · {educationTrack(h.track).name} · {h.outcome}</PixelText>) : <PixelText size={16}>Your completed, interrupted and dismissed training will be recorded here.</PixelText>}</View>}
  </View>;
}
