import {OFFICE_APPOINTMENT_INFLUENCE} from '@/data/politicalOffices';
import {baronyRequirements,nobilityRequirements} from '@/engine/progressionRequirements';
import {nobilityProspects} from '@/engine/titleEngine';
import React,{useState,useEffect} from 'react';
import {Image,View,useWindowDimensions} from 'react-native';
import type {CourtOffice,GameState} from '@/types/game';
import {courtAvailability,courtActionBlockers,courtPetitionRequirements,COURT_YEARLY_ACTION_LIMIT,type CourtAction} from '@/engine/courtEngine';
import {courtCandidatesFor,councilAdvice} from '@/engine/courtPolitics';
import {POLITICAL_OFFICES,ROYAL_DECISIONS} from '@/data/politicalOffices';
import {useGame} from '@/state/GameContext';
import {kinIconAsset,PAYWALL_ART,CAREER_FAMILY_ART,GOAL_ICONS} from '@/assets/generatedAssets';
import {PixelButton} from '../ui/PixelButton';
import {PixelText} from '../ui/PixelText';
import {PersonPicker} from '../ui/PersonPicker';
import {C,PANEL} from '@/theme/theme';
import {HoldingPanel} from './HoldingPanel';
export const POLITICAL_ACTIONS:CourtAction[]=['petition','patron','advise','alliance','expose','seek_nobility','seek_barony'];
export const ROYAL_GROUPS:{title:string;actions:CourtAction[]}[]=[
 {title:'KINGDOM AFFAIRS',actions:['tax_relief','tax_raise','religion','peace']},
 {title:'MILITARY & JUSTICE',actions:['mobilise','justice']},
 {title:'NOBILITY & SUCCESSION',actions:['appoint','dismiss','grant_title','name_heir','disinherit','abdicate']},
];
const CLAIM_ACTIONS:CourtAction[]=['recognise_claim','takeover','regency_claim'];
const LABELS:Partial<Record<CourtAction,string>>={seek_nobility:'Request Noble Recognition',seek_barony:'Baronial Recognition',petition:'Petition for Office',patron:'Seek Patronage',advise:'Offer Advice',alliance:'Household Alliance',expose:'Investigate Court Funds',appoint:'Appoint Councillor',dismiss:'Dismiss Councillor',recognise_claim:'Press a Royal Claim',takeover:'Seek a Takeover',regency_claim:'Claim after Regency',abdicate:'Abdicate'};
const DETAILS:Partial<Record<CourtAction,string>>={seek_nobility:'Ask the ruler to recognise your service. Approval adds standing and reputation; it cannot skip ranks.',seek_barony:'Seek recognition for your household. No purchase is required; the next rank still needs completed standing and its qualifications.',petition:'Formally request the selected office. The incumbent keeps the seal until the council decides.',patron:'Ask an adult noble or councillor for patronage. Gain influence and Crown support through service.',advise:'Correct a decree to improve prosperity, influence and Crown support.',alliance:'Agree a new alliance with another eligible household. Existing allies and your own family are excluded.',expose:'Check the court funds. Recover stolen gold when evidence exists; otherwise publish the accounts.',appoint:'Give the selected office to an eligible adult. Replacing its holder risks opposition.',dismiss:'Remove the selected office holder. Expect resentment and political opposition.',abdicate:'Yield the Crown to an eligible successor. Existing claims and family history remain.',recognise_claim:'Ask the council to recognise your documented claim against a weakened mandate.',takeover:'Seek the Crown with influence and council support when the ruler has lost public backing.',regency_claim:'Seek recognition after completing a regency with council agreement.'};
const NEED_PERSON:CourtAction[]=['patron','alliance','appoint','justice','grant_title','name_heir','disinherit'];
const NEED_OFFICE:CourtAction[]=['petition','appoint','dismiss'];
const label=(id:CourtAction)=>LABELS[id]??ROYAL_DECISIONS.find(d=>d.id===id)?.name??id;
export function CourtPanel({state,initialAction}:{state:GameState;initialAction?:CourtAction}){
 const {dispatch}=useGame(),{width}=useWindowDimensions();
 const [office,setOffice]=useState<CourtOffice>('chancellor'),[action,setAction]=useState<CourtAction>(initialAction??'petition');
 const [person,setPerson]=useState<string>(),[group,setGroup]=useState<string>(),[counsel,setCounsel]=useState<'consult'|'override'>('consult');
 const [howToImprove,setHowToImprove]=useState(false);
 const [records,setRecords]=useState(false),[moreAdvice,setMoreAdvice]=useState(false);
 useEffect(()=>{if(initialAction)setAction(initialAction);},[initialAction]);
 const court=state.world.court;if(!court)return <View style={PANEL.parchCard}><PixelText size={18}>No court is recognised.</PixelText></View>;
 const player=state.world.characters[state.playerCharacterId],rules=court.rulerId===player.id;
 const holder=state.world.characters[court.offices[office]??''],officeName=POLITICAL_OFFICES.find(o=>o.id===office)!.name;
 const candidates=courtCandidatesFor(state,action),target=candidates.some(c=>c.id===person)?person:undefined;
 const needsPerson=NEED_PERSON.includes(action),needsOffice=NEED_OFFICE.includes(action);
 const blockers=courtActionBlockers(state,action,needsPerson?target:undefined,needsOffice?office:undefined),reason=blockers[0]??null;
 const requirements=action==='petition'?courtPetitionRequirements(state):action==='seek_barony'?baronyRequirements(state):action==='seek_nobility'?nobilityRequirements(state):[];
 const additionalBlockers=blockers.filter(message=>!requirements.some(r=>message===`${r.label}; current ${r.current}`));
 const advice=rules&&!POLITICAL_ACTIONS.includes(action)&&!CLAIM_ACTIONS.includes(action)?councilAdvice(state,action):[];
 const lead:CourtOffice=action==='mobilise'?'marshal':action==='religion'?'religious_adviser':action.startsWith('tax_')?'treasurer':'chancellor';
 const firstAdvice=advice.find(a=>a.id===court.offices[lead])??advice[0];
 const choose=(id:CourtAction)=>{setAction(id);setPerson(undefined);setMoreAdvice(false);};
 const actionsGrid=(actions:CourtAction[])=><View style={{flexDirection:'row',flexWrap:'wrap',gap:7}}>{actions.map(id=><PixelButton key={id} selected={id===action} bg={id===action?C.charm:C.lightFill} shadow={id===action?C.charmDark:C.blueDark} onPress={()=>choose(id)} style={{width:width>=360?'48.5%':'100%'}} innerStyle={{padding:10,minHeight:49,justifyContent:'center'}}><PixelText font="pixel" size={7} color={C.blueDark}>{label(id).toUpperCase()}</PixelText></PixelButton>)}</View>;
 const royalAction=!POLITICAL_ACTIONS.includes(action);
 const actionDetail=<View style={[PANEL.parchCard,{gap:9}]}>
   <View style={{flexDirection:'row',gap:10,alignItems:'center'}}><Image source={GOAL_ICONS.scholar} resizeMode="contain" style={{width:38,height:38}}/><PixelText font="pixel" size={9} color={C.blueDeep} style={{flex:1}}>{label(action).toUpperCase()}</PixelText></View>
   <PixelText size={18} color={C.textBrown}>{ROYAL_DECISIONS.find(d=>d.id===action)?.desc??DETAILS[action]}</PixelText>
   {needsOffice&&<PixelText size={18}>Selected office: {officeName} · {holder?.name??'Vacant'}</PixelText>}
   {(['seek_barony','seek_nobility'] as CourtAction[]).includes(action)&&<View style={{gap:6}}>{requirements.map(r=><PixelText key={r.label} size={17} color={r.met?C.faithDark:C.textBrown}>{r.met?'✓':'•'} {r.label}: {r.current}</PixelText>)}<PixelText size={17}>{action==='seek_barony'?'Recognition adds up to 25 standing without charging gold or granting a rank directly.':`Current chance if eligible: ${Math.round(nobilityProspects(state).odds*100)}%. ${nobilityProspects(state).detail}`}</PixelText></View>}
   {action==='petition'&&<View style={{gap:6,borderTopWidth:1,borderColor:C.parchSd,paddingTop:9}}><PixelText font="pixel" size={7} color={C.blueDeep}>REQUIREMENTS</PixelText>{requirements.map(r=><PixelText key={r.label} size={17} color={r.met?C.faithDark:C.bad}>{r.met?'✓':'•'} {r.label} · {r.current}</PixelText>)}</View>}
   {needsPerson&&<><PersonPicker key={action} people={candidates} value={target} onChange={setPerson}/>{!candidates.length&&<PixelText size={16}>No living person currently meets this action’s requirements.</PixelText>}</>}
   {advice.length>0&&<View style={{gap:7}}><PixelText font="pixel" size={7} color={C.blueDeep}>COUNCIL ADVICE</PixelText><PixelText size={16}>{advice.filter(a=>a.support).length} for · {advice.filter(a=>!a.support).length} against</PixelText>{(moreAdvice?advice:firstAdvice?[firstAdvice]:[]).map(a=><PixelText key={a.id} size={17}>{a.support?'For':'Against'} · {a.text}</PixelText>)}<PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={()=>setMoreAdvice(!moreAdvice)} innerStyle={{padding:9}}><PixelText size={16}>{moreAdvice?'FEWER COUNCIL VIEWS':'OTHER COUNCIL VIEWS'}</PixelText></PixelButton><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{(['consult','override'] as const).map(id=><PixelButton key={id} selected={counsel===id} bg={counsel===id?C.charm:C.lightFill} shadow={C.paleEdge} onPress={()=>setCounsel(id)} innerStyle={{padding:9}}><PixelText size={16}>{id==='consult'?'Hear council':'Act independently'}</PixelText></PixelButton>)}</View></View>}
   {additionalBlockers.map(message=><PixelText key={message} size={16} color={C.bad}>{message}</PixelText>)}
   <PixelButton disabled={!!reason} bg={reason?C.lightFill:C.charm} shadow={reason?C.paleEdge:C.charmDark} onPress={()=>dispatch({type:'COURT',action,targetId:needsPerson?target:undefined,office:needsOffice?office:undefined,counsel})} innerStyle={{padding:12,minHeight:49,alignItems:'center'}}><PixelText font="pixel" size={8} color={C.blueDark}>{action==='petition'?'SUBMIT PETITION':`CONFIRM: ${label(action).toUpperCase()}`}</PixelText></PixelButton>
   <PixelText size={16} color={C.textMuted}>1 yearly action · 1 court matter</PixelText>
   {court.petition?.applicantId===player.id&&<PixelText size={17} color={C.blueDeep}>Petition for {POLITICAL_OFFICES.find(o=>o.id===court.petition!.office)?.name}: {court.petition.resolved?court.petition.outcome:'Awaiting the council’s decision'}{court.petition.outcome==='conditional'?` · Court professional standing ${court.petition.requiredStanding} required`:''}.</PixelText>}
  </View>;
 return <View style={{gap:10}}>
  <View testID="court-overview" style={[PANEL.parchCard,{gap:8}]}>
   <View style={{flexDirection:'row',alignItems:'center',gap:10}}><Image source={PAYWALL_ART.crown} resizeMode="contain" style={{width:width>=360?60:36,height:60}}/><View style={{flex:1,gap:6}}><PixelText font="pixel" size={10} color={C.blueDeep}>THE ROYAL COURT</PixelText><PixelText size={18}>Ruler: {state.world.characters[court.rulerId]?.name??'Unrecorded'}. Heir: {state.world.characters[court.heirId??'']?.name??'Disputed'}.</PixelText></View></View>
   {court.regentId&&<PixelText size={17}>Regent: {state.world.characters[court.regentId]?.name}</PixelText>}
   <PixelText size={18}>Treasury: {court.treasury}g · Legitimacy: {court.legitimacy}</PixelText>
   <PixelText size={18}>Influence: {player.factionInfluence??0} · Crown Support: {state.world.factions.crown.playerStanding}</PixelText>
   <PixelText size={16} color={C.amber}>Court matters remaining: {Math.max(0,COURT_YEARLY_ACTION_LIMIT-(court.actionsYear===state.world.currentYear?court.actionsUsed:0))}/{COURT_YEARLY_ACTION_LIMIT}</PixelText>
   <PixelButton accessibilityLabel={howToImprove?'HOW TO IMPROVE: hide help':'HOW TO IMPROVE: show help'} bg={C.lightFill} shadow={C.paleEdge} onPress={()=>setHowToImprove(!howToImprove)} innerStyle={{padding:10,minHeight:46}}><PixelText font="pixel" size={7}>HOW TO IMPROVE {howToImprove?'▴':'▾'}</PixelText></PixelButton>
   {howToImprove&&<View testID="court-help" style={{gap:6}}>
    <PixelText size={16}>Political influence: build it through patronage, advice, new household alliances and investigations.</PixelText>
    <PixelText size={16}>Crown support: gain favour through patronage and advice.</PixelText>
    <PixelText size={16}>Legitimacy: the ruler’s authority. A weakened mandate puts the Crown at risk.</PixelText>
   </View>}
  </View>
  <View style={{flexDirection:width>=700?'row':'column',gap:9}}>
   <View style={width>=700?{flex:1}:undefined}><HoldingPanel title="COUNCIL MEMBERS">{POLITICAL_OFFICES.map(o=>{const npc=state.world.characters[court.offices[o.id]??''];return <PixelButton key={o.id} selected={office===o.id} bg={office===o.id?C.charm:C.lightFill} shadow={office===o.id?C.charmDark:C.blueDark} onPress={()=>setOffice(o.id)} innerStyle={{padding:8,flexDirection:'row',alignItems:'center',gap:8,minHeight:56}}>
    <Image source={npc?kinIconAsset(npc.id,npc.kind,npc.gender,npc.age):CAREER_FAMILY_ART[o.id==='religious_adviser'?'church':o.id==='marshal'?'martial':'court']} resizeMode="contain" style={{width:35,height:35}}/><View style={{flex:1,gap:4}}><PixelText font="pixel" size={7} color={C.blueDark}>{o.name.toUpperCase()}</PixelText><PixelText size={18}>{npc?.name??'Vacant'}</PixelText></View><PixelText size={22}>›</PixelText>
   </PixelButton>;})}</HoldingPanel></View>
   <View style={[PANEL.parchCard,{gap:9,...(width>=700?{flex:1}:{})}]}>
    {holder&&<Image source={kinIconAsset(holder.id,holder.kind,holder.gender,holder.age)} resizeMode="contain" style={{width:60,height:60,alignSelf:'flex-start'}}/>}
    <PixelText font="pixel" size={8} color={C.blueDeep}>{officeName.toUpperCase()}: {holder?.name??'VACANT'}</PixelText>
    <PixelText size={18}>{holder?'The incumbent retains the seal while a petition is considered.':'No councillor currently holds this office.'}</PixelText>
    <PixelText size={16} color={C.textBrown}>Education, service and council support affect appointments. Selecting an office does not spend an action.</PixelText>
    {holder?.id===player.id&&<PixelText size={16}>Appointment grants up to {OFFICE_APPOINTMENT_INFLUENCE} political influence once. It records this office without giving you its namesake occupation, an extra wage or a separate set of duties.</PixelText>}
   </View>
  </View>
  <HoldingPanel title="POLITICAL ACTIONS">{actionsGrid(POLITICAL_ACTIONS)}</HoldingPanel>
  {!royalAction&&actionDetail}
  <HoldingPanel title={rules?'ROYAL DECISIONS':'ROYAL SUCCESSION'}>
   {rules?ROYAL_GROUPS.map(g=><View key={g.title} style={{gap:8}}><PixelButton bg={group===g.title?C.charm:C.lightFill} shadow={C.blueDark} onPress={()=>{setGroup(group===g.title?undefined:g.title);choose(g.actions[0]);}} innerStyle={{padding:10,minHeight:46}}><PixelText font="pixel" size={7} color={C.blueDeep}>{g.title} {group===g.title?'▴':'▾'}</PixelText></PixelButton>{group===g.title&&actionsGrid(g.actions)}</View>):actionsGrid(CLAIM_ACTIONS)}
  </HoldingPanel>
  {royalAction&&actionDetail}
  <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={()=>setRecords(!records)} innerStyle={{padding:10}}><PixelText font="pixel" size={7} color={C.blueDeep}>COURT RECORDS & OPPOSITION {records?'▴':'▾'}</PixelText></PixelButton>
  {records&&<View style={[PANEL.parchCard,{gap:8}]}>{court.records.slice(-5).reverse().map((r,i)=><PixelText key={i} size={16}>Year {r.year}: {r.detail}</PixelText>)}<PixelText size={16}>Open scandals: {court.scandals.filter(s=>!s.resolved).length}.</PixelText>{court.coalitions?.map(q=><PixelText key={q.leaderId} size={16}>{state.world.characters[q.leaderId]?.name}’s coalition · strength {q.strength}</PixelText>)}{court.claims.filter(q=>state.world.characters[q.characterId]?.alive&&q.characterId!==court.rulerId).map(q=><PixelText key={q.characterId} size={16}>{state.world.characters[q.characterId].name} · {q.basis} · strength {q.strength}{q.disinherited?' · disinherited':''}</PixelText>)}</View>}
 </View>;
}
export function CourtEntry({state,onOpen}:{state:GameState;onOpen?:()=>void}){
 const {dispatch}=useGame(),court=state.world.court;if(!court)return null;
 return <PixelButton bg={C.parch} shadow={C.parchSd} onPress={()=>onOpen?onOpen():dispatch({type:'SET_TAB',tab:'hold'})} style={{marginBottom:12}} innerStyle={{padding:11,gap:6}}><PixelText font="pixel" size={8} color={C.blueDeep}>COURT & COUNCIL ▸</PixelText><PixelText size={16}>{state.world.characters[court.rulerId]?.name} rules. Legitimacy {court.legitimacy}. Open Royal Court in Holding.</PixelText></PixelButton>;
}
