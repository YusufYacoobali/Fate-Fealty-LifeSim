import React, { useState } from 'react';
import { View } from 'react-native';
import type { CourtOffice, GameState } from '@/types/game';
import { courtAvailability, CourtAction } from '@/engine/courtEngine';
import { POLITICAL_OFFICES, ROYAL_DECISIONS } from '@/data/politicalOffices';
import { useGame } from '@/state/GameContext';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { C, PANEL } from '@/theme/theme';

export function CourtPanel({ state }: { state: GameState }) {
  const { dispatch } = useGame();
  const [selectedOffice, setSelectedOffice] = useState<CourtOffice>('chancellor');
  const [targetId, setTargetId] = useState<string | undefined>();
  const [selecting, setSelecting] = useState(false);
  const court = state.world.court;
  if (!court) return null;
  const ruler = state.world.characters[court.rulerId];
  const player = state.world.characters[state.playerCharacterId];
  const rules = court.rulerId === player.id;
  const candidates = Object.values(state.world.characters).filter(c => c.alive && c.id !== 'goose' && c.id !== player.id && (c.age >= 16 || court.claims.some(claim => claim.characterId === c.id)));
  const button = (action: CourtAction, label: string, hint?: string, target?: string, office?: CourtOffice) => {
    const reason = courtAvailability(state, action, target, office);
    return <PixelButton key={action} bg={reason ? C.lightFill : C.parch} shadow={C.parchSd} disabled={!!reason} onPress={() => dispatch({ type: 'COURT', action, targetId: target, office })} style={{ width: '48.5%', marginBottom: 8 }} innerStyle={{ padding: 9, minHeight: 84 }}><PixelText font="pixel" size={7}>{label.toUpperCase()}</PixelText><PixelText font="body" size={14} color={reason ? C.bad : C.textMuted} style={{ marginTop: 5 }}>{reason ?? hint ?? '1 action'}</PixelText></PixelButton>;
  };
  return <View style={{ marginBottom: 14 }}>
    <View style={PANEL.parchCard}>
      <PixelText font="pixel" size={9} color={C.blueDeep}>THE ROYAL COURT</PixelText>
      <PixelText font="body" size={17} style={{ marginTop: 6 }}>Ruler: {ruler?.name}. Heir: {state.world.characters[court.heirId ?? '']?.name ?? 'Disputed'}.</PixelText>
      {court.regentId && <PixelText font="body" size={15}>Regent: {state.world.characters[court.regentId]?.name}.</PixelText>}
      <PixelText font="body" size={15}>Treasury {court.treasury}g · Legitimacy {court.legitimacy} · Your influence {player.factionInfluence ?? 0}.</PixelText>
      {POLITICAL_OFFICES.map(o => <PixelText key={o.id} font="body" size={15} style={{ marginTop: 4 }}>{o.name}: {state.world.characters[court.offices[o.id] ?? '']?.name ?? 'Vacant'}</PixelText>)}
      <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 6 }}>Three political matters per year. Offices are appointments; royal kinship is a claim, not a crown.</PixelText>
    </View>
    {state.age >= 16 && <>
      <PixelButton bg={C.light} shadow={C.blue} onPress={() => setSelecting(!selecting)} style={{ marginTop: 8, marginBottom: 8 }} innerStyle={{ padding: 10 }}><PixelText font="body" size={16}>Person: {state.world.characters[targetId ?? '']?.name ?? 'Choose a person'} {selecting ? '▴' : '▾'}</PixelText></PixelButton>
      {selecting && <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>{candidates.map(c => <PixelButton key={c.id} bg={targetId === c.id ? C.charm : C.parch} shadow={C.parchSd} onPress={() => { setTargetId(c.id); setSelecting(false); }} style={{ width: '48.5%', marginBottom: 6 }} innerStyle={{ padding: 8, minHeight: 50 }}><PixelText font="body" size={15}>{c.name} · {c.age}</PixelText></PixelButton>)}</View>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>{POLITICAL_OFFICES.map(o => <PixelButton key={o.id} bg={selectedOffice === o.id ? C.charm : C.lightFill} shadow={C.parchSd} onPress={() => setSelectedOffice(o.id)} style={{ width: '48.5%', marginBottom: 6 }} innerStyle={{ padding: 8 }}><PixelText font="body" size={15}>{o.name}</PixelText></PixelButton>)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 }}>
        {button('patron', 'Seek patronage', 'Gain influence through a real patron.', targetId)}
        {button('alliance', 'Arrange an alliance', 'Bind two households through recorded obligations.', targetId)}
        {button('advise', 'Advise on a decree', 'Correct a levy and gain influence.')}
        {button('expose', 'Audit court funds', 'Investigate diverted treasury money.')}
        {button('petition', 'Petition for office', 'Appointment requires learning, influence and support.', undefined, selectedOffice)}
        {rules ? <>
          {button('appoint', 'Appoint councillor', 'Give the selected office to one adult.', targetId, selectedOffice)}
          {button('dismiss', 'Dismiss councillor', 'Remove the present holder.', undefined, selectedOffice)}
          {ROYAL_DECISIONS.map(d => button(d.id, d.name, d.desc, ['justice','grant_title','name_heir','disinherit'].includes(d.id) ? targetId : undefined))}
          {button('abdicate', 'Abdicate', 'Surrender the crown to an eligible successor.')}
        </> : <>
          {button('recognise_claim', 'Press a royal claim', 'Requires Premium, a documented claim and council support.')}
          {button('takeover', 'Seek a takeover', 'Requires Premium and a failing royal mandate.')}
          {button('regency_claim', 'Seek council recognition', 'Requires Premium and a completed regency.')}
        </>}
      </View>
    </>}
  </View>;
}
