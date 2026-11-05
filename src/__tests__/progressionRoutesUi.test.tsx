import React from 'react';
import {TouchableOpacity} from 'react-native';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {MeTab} from '@/components/tabs/MeTab';
import {PixelText} from '@/components/ui/PixelText';
import {PixelButton} from '@/components/ui/PixelButton';
import {createLife} from '@/engine/gameState';
import {makeState} from './helpers';
import {selectProgressionHint,selectStats,selectTraits,selectRankPath,currentRank} from '@/state/viewModel';
let mockState=makeState();const mockDispatch=jest.fn();
jest.mock('@/state/GameContext',()=>({useGame:()=>({state:mockState,dispatch:mockDispatch})}));
jest.mock('@/components/ui/StatBar',()=>({StatBar:()=>null}));
jest.mock('@/components/rpg/RpgPanels',()=>({SkillsEquipmentPanel:()=>require('react').createElement(require('react-native').Text,null,'SKILLS & EQUIPMENT')}));
let root:ReactTestRenderer;
afterEach(()=>{act(()=>root?.unmount());jest.clearAllMocks();});
const text=()=>JSON.stringify(root.toJSON());
function mount(onLockedRankPress=jest.fn()) {act(()=>{root?.unmount();root=create(<MeTab portrait="" firstName={mockState.first} epithet={mockState.epithet} classRank={currentRank(mockState).key} age={mockState.age} stats={selectStats(mockState)} traits={selectTraits(mockState)} bio="A personal biography." onLockedRankPress={onLockedRankPress}/>);});}
it('restores the compact profile order, one pure hint and status tiles without dashboard controls or ambition',()=>{
 mockState=makeState({age:38,rankIdx:3,gold:350,lifetimeUnlocked:true,stats:{health:80,charm:84,wits:76,faith:50}});const before=JSON.stringify(mockState);mount();
 const rendered=text(),sections=['THY WORKING LIFE','PATH TO NOBILITY','ATTRIBUTES','SKILLS & EQUIPMENT','TRAITS & REPUTE','A personal biography.'];
 for(let i=1;i<sections.length;i++)expect(rendered.indexOf(sections[i])).toBeGreaterThan(rendered.indexOf(sections[i-1]));
 expect(root.root.findAllByProps({testID:'progression-hint'}).filter(n=>n.type===PixelText)).toHaveLength(1);expect(rendered).toContain(selectProgressionHint(mockState));
 for(const removed of ['ADVANCEMENT','SOCIAL STATION','ROYAL SUCCESSION','REQUEST JOB PROMOTION','OPEN ROYAL COURT','AMBITION','% TO','requirements met'])expect(rendered).not.toContain(removed);
 expect(root.root.findAllByType(PixelButton)).toHaveLength(0);expect(JSON.stringify(mockState)).toBe(before);expect(mockDispatch).not.toHaveBeenCalled();
});
it('keeps premium tile locks and their existing access callback, while unlocked tiles cannot act',()=>{
 mockState=makeState({age:30,lifetimeUnlocked:false});const open=jest.fn();mount(open);
 const tiles=root.root.findAllByType(TouchableOpacity);expect(tiles).toHaveLength(6);const locked=tiles.filter(t=>!t.props.disabled);expect(locked.map(t=>t.props.accessibilityLabel)).toEqual(['BARON locked. Opens Lifetime Pass.','KING locked. Opens Lifetime Pass.']);
 act(()=>locked[0].props.onPress());expect(open).toHaveBeenCalledTimes(1);expect(mockDispatch).not.toHaveBeenCalled();
 mockState.lifetimeUnlocked=true;mount(open);expect(root.root.findAllByType(TouchableOpacity).every(t=>t.props.disabled)).toBe(true);
});
it('retains the actual royal status in the profile tiles and the single hint',()=>{
 mockState=createLife({worldSeed:950119,birthOrigin:'royal',lifetimeUnlocked:true});mount();expect(selectRankPath(mockState).map(r=>r.name)).toContain('PRINCE');expect(text()).toContain('PROGRESS TO ');expect(text()).not.toContain('ADVANCEMENT');
 mockState.world.characters[mockState.playerCharacterId].gender='woman';mount();expect(selectRankPath(mockState).map(r=>r.name)).toContain('PRINCESS');expect(text()).toContain('PROGRESS TO ');
});
it('shows the actual standing meter without restoring dashboard controls',()=>{
 mockState=makeState({age:20,rankIdx:1,rankProgress:68});mount();expect(text()).toContain('PROGRESS TO ');expect(text()).toContain('KNIGHT');expect(text()).toContain('68');expect(text()).toContain('Build standing through work and achievements');expect(text()).not.toContain('ADVANCEMENT');expect(root.root.findAllByType(PixelButton)).toHaveLength(0);
});
