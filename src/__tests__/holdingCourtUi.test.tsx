import {ScrollView} from 'react-native';
import React,{useState} from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {HoldingTab,type HoldingSection} from '@/components/tabs/HoldingTab';
import {CourtPanel,POLITICAL_ACTIONS,ROYAL_GROUPS,CourtEntry} from '@/components/tabs/CourtPanel';
import {PixelButton} from '@/components/ui/PixelButton';
import {PixelText} from '@/components/ui/PixelText';
import {makeState} from './helpers';
import {syncPlayerToWorld} from '@/engine/gameState';
import {courtAvailability,courtPetitionRequirements} from '@/engine/courtEngine';
import {HOLDING_ACTIONS,HOLDING_UPGRADES} from '@/data/holding';
import {gameReducer} from '@/state/gameReducer';
const mockDispatch=jest.fn();jest.mock('@/state/GameContext',()=>({useGame:()=>({dispatch:mockDispatch})}));
jest.mock('@/components/rpg/RpgPanels',()=>({HoldingExpansionPanel:()=>null}));
let root:ReactTestRenderer;afterEach(()=>{act(()=>root?.unmount());jest.clearAllMocks();});
function button(label:string){return root.root.findAllByType(PixelButton).find(b=>b.props.accessibilityLabel===label||b.findAllByType(PixelText).some(t=>[t.props.children].flat(5).join('')===label));}
function text(){return JSON.stringify(root.toJSON());}
function state(){const s=makeState({age:25,gold:200});syncPlayerToWorld(s);return s;}
function tap(label:string){const b=button(label);expect(b).toBeDefined();act(()=>b!.props.onPress());}
it('replaces the three section bodies and never dispatches gameplay while navigating',()=>{
 const s=state(),before=JSON.stringify(s);
 function Harness(){const[section,setSection]=useState<HoldingSection>('estate');return <HoldingTab state={s} section={section} onSectionChange={setSection} onAction={mockDispatch} onUpgrade={mockDispatch}/>;}
 act(()=>{root=create(<Harness/>);});expect(text()).toContain('FAMILY CROFT');expect(text()).not.toContain('COUNCIL MEMBERS');tap('ROYAL COURT');expect(text()).toContain('COUNCIL MEMBERS');expect(text()).not.toContain('YEARLY LEDGER');tap('SWINEFORD');expect(text()).toContain('THE VILLAGE OF SWINEFORD');expect(text()).not.toContain('COUNCIL MEMBERS');expect(mockDispatch).not.toHaveBeenCalled();expect(JSON.stringify(s)).toBe(before);
});
it('retains every estate order and exposes permanent upgrades and expansion management',()=>{
 const s=state();act(()=>{root=create(<HoldingTab state={s} section="estate" onSectionChange={jest.fn()} onAction={mockDispatch} onUpgrade={mockDispatch}/>);});for(const a of HOLDING_ACTIONS)expect(button(a.name)).toBeDefined();expect(button('FENCED FIELD')).toBeUndefined();tap('EXPAND BUILDINGS & UPGRADES');for(const u of HOLDING_UPGRADES)expect(button(u.name)).toBeDefined();tap('WORK THE LAND');expect(mockDispatch).toHaveBeenCalledWith('work_land');
});
it('shows actual office holders and sends a petition for the selected office through the existing reducer',()=>{
 const s=state(),p=s.world.characters[s.playerCharacterId];p.education!.qualifications=['court_education'];p.factionInfluence=25;s.world.factions.crown.playerStanding=10;
 const before=JSON.stringify(s);act(()=>{root=create(<CourtPanel state={s}/>);});for(const id of Object.values(s.world.court!.offices))expect(text()).toContain(s.world.characters[id!].name);
 tap('MARSHAL');expect(JSON.stringify(s)).toBe(before);expect(button('SUBMIT PETITION')!.props.disabled).toBe(false);tap('SUBMIT PETITION');expect(mockDispatch).toHaveBeenCalledWith({type:'COURT',action:'petition',office:'marshal',targetId:undefined,counsel:'consult'});
 const next=gameReducer(s,mockDispatch.mock.calls[0][0]);expect(next.world.court!.petition!.office).toBe('marshal');expect(next.pendingEvent?.eventId).toBe('court_office_contest');expect(next.world.court!.actionsUsed).toBe(1);
});
it('shows genuine petition qualifications, annual limits and the reason a submission is blocked',()=>{
 const s=state();act(()=>{root=create(<CourtPanel state={s}/>);});for(const r of courtPetitionRequirements(s))expect(text()).toContain(r.label);expect(button('SUBMIT PETITION')!.props.disabled).toBe(true);expect(text()).toContain(courtAvailability(s,'petition',undefined,'chancellor'));
 s.world.court!.actionsYear=s.world.currentYear;s.world.court!.actionsUsed=3;act(()=>root.update(<CourtPanel state={{...s}}/>));expect(text()).toContain('Three council matters per year');
});
it('preserves all public, royal, appointment and succession actions without bypassing entitlement',()=>{
 expect(new Set([...POLITICAL_ACTIONS,...ROYAL_GROUPS.flatMap(g=>g.actions),'recognise_claim','takeover','regency_claim']).size).toBe(22);
 const s=state();s.world.court!.rulerId=s.playerCharacterId;s.lifetimeUnlocked=false;act(()=>{root=create(<CourtPanel state={s}/>);});for(const g of ROYAL_GROUPS){tap(g.title+' ▾');expect(text()).toContain(courtAvailability(s,g.actions[0],undefined,'chancellor'));}tap('KINGDOM AFFAIRS ▾');
});
it('uses the direct Court entry callback without spending an action',()=>{
 const s=state(),onOpen=jest.fn();act(()=>{root=create(<CourtEntry state={s} onOpen={onOpen}/>);});tap('COURT & COUNCIL ▸');expect(onOpen).toHaveBeenCalledTimes(1);expect(mockDispatch).not.toHaveBeenCalled();
});

it('places section selectors inside the one main scroller before the section content',()=>{
 const s=state();act(()=>{root=create(<HoldingTab state={s} section="estate" onSectionChange={jest.fn()} onAction={mockDispatch} onUpgrade={mockDispatch}/>);});
 const scroll=root.root.findAllByType(ScrollView).filter(n=>!n.props.horizontal);expect(scroll).toHaveLength(1);
 const nav=scroll[0].findAllByType(PixelButton).filter(n=>['ESTATE','ROYAL COURT','SWINEFORD'].includes(n.props.accessibilityLabel));expect(nav).toHaveLength(3);expect(scroll[0].props.stickyHeaderIndices).toBeUndefined();
});
it('keeps the Court overview compact and help collapsed, textual and free of action controls',()=>{
 const s=state(),p=s.world.characters[s.playerCharacterId];p.factionInfluence=25;s.world.factions.crown.playerStanding=10;
 const before=JSON.stringify(s);act(()=>{root=create(<CourtPanel state={s}/>);});
 const summary=root.root.findByProps({testID:'court-overview'});
 const summaryText=summary.findAllByType(PixelText).map(n=>[n.props.children].flat(5).join('')).join(' ');
 for(const value of ['Treasury: 250g · Legitimacy: 65','Influence: 25 · Crown Support: 10','Court matters remaining: 3/3'])expect(summaryText).toContain(value);
 expect(summaryText).not.toMatch(/personal ability|career reputation|Court professional standing/);expect(root.root.findAllByProps({testID:'court-help'})).toHaveLength(0);
 tap('HOW TO IMPROVE ▾');const help=root.root.findByProps({testID:'court-help'});expect(help.findAllByType(PixelButton)).toHaveLength(0);expect(help.findAllByType(PixelText)).toHaveLength(3);
 const prose=help.findAllByType(PixelText).map(n=>n.props.children).join(' ');expect(prose).toMatch(/Political influence.*patronage.*advice.*alliances/);expect(prose).toMatch(/Crown support.*patronage.*advice/);expect(prose).toContain('Legitimacy');expect(prose).not.toMatch(/\+\d|OPEN |requirements|current caps/);
 tap('HOW TO IMPROVE ▴');expect(root.root.findAllByProps({testID:'court-help'})).toHaveLength(0);expect(mockDispatch).not.toHaveBeenCalled();expect(JSON.stringify(s)).toBe(before);
});
it('preserves the manual barony action and detailed qualifications at Court',()=>{
 const s=makeState({age:38,rankIdx:3,gold:350,lifetimeUnlocked:true,stats:{health:90,charm:84,wits:76,faith:50}});syncPlayerToWorld(s);
 act(()=>{root=create(<CourtPanel state={s} initialAction="seek_barony"/>);});expect(text()).toContain('up to 25 standing');expect(text()).not.toContain('90g paid only if accepted');tap('CONFIRM: BARONIAL RECOGNITION');expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type:'COURT',action:'seek_barony'}));
});
