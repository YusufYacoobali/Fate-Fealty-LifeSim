import React, { useState } from 'react';
import { View } from 'react-native';
import type { CourtOffice, GameState } from '@/types/game';
import { courtAvailability, CourtAction } from '@/engine/courtEngine';
import { courtCandidatesFor, councilAdvice } from '@/engine/courtPolitics';
import { POLITICAL_OFFICES, ROYAL_DECISIONS } from '@/data/politicalOffices';
import { useGame } from '@/state/GameContext';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { PanelChips } from '../ui/PanelChips';
import { PersonPicker } from '../ui/PersonPicker';
import { C, PANEL } from '@/theme/theme';

const SECTIONS = [{ id: 'council',label: 'Council' },{ id: 'intrigue',label: 'Intrigue' },{ id: 'decrees',label: 'Decrees' },{ id: 'succession',label: 'Succession' }] as const;
const LABELS: Partial<Record<CourtAction,string>> = { patron: 'Seek patronage', petition: 'Petition for office', alliance: 'Household alliance', expose: 'Audit court funds', advise: 'Offer advice', appoint: 'Appoint councillor', dismiss: 'Dismiss councillor', recognise_claim: 'Press a royal claim', takeover: 'Seek a takeover', regency_claim: 'Claim after regency', abdicate: 'Abdicate' };
const NEED_PERSON: CourtAction[] = ['patron','alliance','appoint','justice','grant_title','name_heir','disinherit'];
export function CourtPanel({ state }: { state: GameState }) {
  const { dispatch } = useGame();
  const [section, setSection] = useState<typeof SECTIONS[number]['id']>('council');
  const [office, setOffice] = useState<CourtOffice>('chancellor');
  const [selectedAction, setAction] = useState<CourtAction>();
  const [selectedPerson, setPerson] = useState<string>();
  const [counsel, setCounsel] = useState<'consult' | 'override'>('consult');
  const [records, setRecords] = useState(false);
  const [moreAdvice, setMoreAdvice] = useState(false);
  const court = state.world.court; if (!court) return null;
  const player = state.world.characters[state.playerCharacterId], rules = court.rulerId === player.id;
  const actions: CourtAction[] = section === 'council' ? rules ? ['appoint','dismiss'] : ['petition','patron','advise'] : section === 'intrigue' ? ['expose','alliance','patron'] : section === 'decrees' ? rules ? ['tax_relief','tax_raise','religion','mobilise','peace','justice','grant_title'] : ['advise'] : rules ? ['name_heir','disinherit','abdicate'] : ['recognise_claim','takeover','regency_claim'];
  const action = selectedAction && actions.includes(selectedAction) ? selectedAction : actions[0];
  const candidates = courtCandidatesFor(state,action);
  const targetId = candidates.some(c => c.id === selectedPerson) ? selectedPerson : undefined;
  const needsOffice = ['appoint','dismiss','petition'].includes(action);
  const needsPerson = NEED_PERSON.includes(action);
  const reason = courtAvailability(state,action,needsPerson ? targetId : undefined,needsOffice ? office : undefined);
  const label = (id: CourtAction) => LABELS[id] ?? ROYAL_DECISIONS.find(d => d.id === id)?.name ?? id.replaceAll('_',' ');
  const advice = rules && section === 'decrees' ? councilAdvice(state,action) : [];
  const leadOffice: CourtOffice = action === 'mobilise' ? 'marshal' : action === 'religion' ? 'religious_adviser' : action.startsWith('tax_') ? 'treasurer' : 'chancellor';
  const leadAdvice = advice.find(a => a.id === court.offices[leadOffice]) ?? advice[0];
  const shownAdvice = moreAdvice ? advice : leadAdvice ? [leadAdvice] : [];
  return <View style={{ marginBottom: 14 }}>
    <View style={PANEL.parchCard}>
      <PixelText font="pixel" size={9} color={C.blueDeep}>THE ROYAL COURT</PixelText>
      <PixelText size={17} style={{ marginTop: 6 }}>Ruler: {state.world.characters[court.rulerId]?.name}. Heir: {state.world.characters[court.heirId ?? '']?.name ?? 'Disputed'}.</PixelText>
      {court.regentId && <PixelText size={15}>Regent: {state.world.characters[court.regentId]?.name}.</PixelText>}
      <PixelText size={16} style={{ marginTop: 4 }}>Treasury {court.treasury}g · Legitimacy {court.legitimacy} · Your influence {player.factionInfluence ?? 0}</PixelText>
      <PixelText size={14} color={C.textMuted} style={{ marginTop: 5 }}>Three political matters per year.</PixelText>
    </View>
    <PanelChips items={SECTIONS} value={section} onChange={id => { setSection(id); setAction(undefined); setPerson(undefined); }} />
    {section === 'council' && <><PanelChips items={POLITICAL_OFFICES.map(o => ({ id: o.id,label: o.name }))} value={office} onChange={setOffice} /><View style={PANEL.parchCard}><PixelText size={17}>{POLITICAL_OFFICES.find(o => o.id === office)!.name}: {state.world.characters[court.offices[office] ?? '']?.name ?? 'Vacant'}</PixelText><PixelText size={15} color={C.textMuted} style={{ marginTop: 5 }}>An incumbent retains the seal while a petition is considered. Learning, service and council support affect appointments.</PixelText></View></>}
    {section === 'intrigue' && <View style={PANEL.parchCard}><PixelText size={16}>{court.coalitions?.length ? court.coalitions.map(q => `${state.world.characters[q.leaderId]?.name}'s coalition · strength ${q.strength}`).join('\n') : 'No organised opposing coalition is recorded.'}</PixelText><PixelText size={15} color={C.textMuted} style={{ marginTop: 5 }}>Open scandals: {court.scandals.filter(s => !s.resolved).length}. Household alliances and evidence influence later politics.</PixelText></View>}
    {section === 'succession' && <View style={PANEL.parchCard}>{court.claims.filter(q => state.world.characters[q.characterId]?.alive && q.characterId !== court.rulerId).map(q => <PixelText key={q.characterId} size={15} style={{ marginBottom: 4 }}>{state.world.characters[q.characterId].name} · {q.basis} · strength {q.strength}{q.disinherited ? ' · disinherited' : ''}</PixelText>)}<PixelText size={15} color={C.textMuted}>Premium access is required to rule. Royal genealogy and former titles remain recorded.</PixelText></View>}
    {state.age >= 16 && <>
      <PanelChips items={actions.map(id => ({ id,label: label(id) }))} value={action} onChange={id => { setAction(id); setPerson(undefined); }} />
      <View style={PANEL.parchCard}>
        <PixelText size={18}>{label(action)}</PixelText>
        {ROYAL_DECISIONS.find(d => d.id === action) && <PixelText size={16} style={{ marginTop: 6 }}>{ROYAL_DECISIONS.find(d => d.id === action)!.desc}</PixelText>}
        {needsPerson && <><PersonPicker people={candidates} value={targetId} onChange={setPerson} />{!candidates.length && <PixelText size={15} color={C.textMuted}>No living person currently meets this action’s requirements.</PixelText>}</>}
        {needsOffice && section !== 'council' && <PanelChips items={POLITICAL_OFFICES.map(o => ({ id: o.id,label: o.name }))} value={office} onChange={setOffice} />}
        {advice.length > 0 && <><PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 10 }}>COUNCIL ADVICE</PixelText><PixelText size={15} style={{ marginTop: 5 }}>{advice.filter(a => a.support).length} for · {advice.filter(a => !a.support).length} against</PixelText>{shownAdvice.map(a => <PixelText key={a.id} size={15} style={{ marginTop: 6 }}>{a.support ? 'For' : 'Against'} · {a.text}</PixelText>)}{advice.length > 1 && <PixelButton bg={C.lightFill} shadow={C.parchSd} onPress={() => setMoreAdvice(!moreAdvice)} style={{ marginTop: 7 }} innerStyle={{ padding: 8, minHeight: 44 }}><PixelText size={15}>Other council views {moreAdvice ? '▴' : '▾'}</PixelText></PixelButton>}<PanelChips items={[{ id: 'consult',label: 'Hear council' },{ id: 'override',label: 'Act independently' }]} value={counsel} onChange={setCounsel} /></>}
        <PixelButton disabled={!!reason} bg={reason ? C.lightFill : C.parch} shadow={C.parchSd} onPress={() => dispatch({ type: 'COURT',action,targetId: needsPerson ? targetId : undefined,office: needsOffice ? office : undefined,counsel })} style={{ marginTop: 8 }} innerStyle={{ padding: 10, minHeight: 48 }}><PixelText font="pixel" size={7}>{label(action).toUpperCase()}</PixelText><PixelText size={15} color={reason ? C.bad : C.textMuted} style={{ marginTop: 5 }}>{reason ?? '1 action · the court records the decision'}</PixelText></PixelButton>
      </View>
    </>}
    {court.petition && court.petition.applicantId === player.id && <PixelText size={15} style={{ marginTop: 8 }}>Petition: {court.petition.resolved ? court.petition.outcome : 'Awaiting the council’s decision'}{court.petition.outcome === 'conditional' ? ` · court standing ${court.petition.requiredStanding} required` : ''}.</PixelText>}
    <PixelButton bg={C.lightFill} shadow={C.parchSd} onPress={() => setRecords(!records)} style={{ marginTop: 8 }} innerStyle={{ padding: 10 }}><PixelText size={16}>Recent court record {records ? '▴' : '▾'}</PixelText></PixelButton>
    {records && court.records.slice(-5).reverse().map((r,i) => <PixelText key={i} size={15} style={{ marginTop: 7 }}>Year {r.year}: {r.detail}</PixelText>)}
  </View>;
}
export function CourtEntry({ state }: { state: GameState }) {
  const { dispatch } = useGame(), court = state.world.court; if (!court) return null;
  return <PixelButton bg={C.parch} shadow={C.parchSd} onPress={() => dispatch({ type: 'SET_TAB',tab: 'hold' })} style={{ marginBottom: 12 }} innerStyle={{ padding: 11 }}><PixelText font="pixel" size={8} color={C.blueDeep}>COURT & COUNCIL ▸</PixelText><PixelText size={16} style={{ marginTop: 6 }}>{state.world.characters[court.rulerId]?.name} rules. Legitimacy {court.legitimacy}. Open council, decrees and succession in Holding.</PixelText></PixelButton>;
}
