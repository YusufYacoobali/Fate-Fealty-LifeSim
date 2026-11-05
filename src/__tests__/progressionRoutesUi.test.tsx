import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {MeTab} from '@/components/tabs/MeTab';
import {AdvancementPanel} from '@/components/tabs/AdvancementPanel';
import {PixelButton} from '@/components/ui/PixelButton';
import {PixelText} from '@/components/ui/PixelText';
import {createLife} from '@/engine/gameState';
import {makeState} from './helpers';
let mockState=makeState();const mockDispatch=jest.fn();
jest.mock('@/state/GameContext',()=>({useGame:()=>({state:mockState,dispatch:mockDispatch})}));
jest.mock('@/components/rpg/RpgPanels',()=>({SkillsEquipmentPanel:()=>null}));
let root:ReactTestRenderer;
afterEach(()=>{act(()=>root?.unmount());jest.clearAllMocks();});
const text=()=>JSON.stringify(root.toJSON());
function tap(label:string){const button=root.root.findAllByType(PixelButton).find(b=>b.findAllByType(PixelText).some(t=>[t.props.children].flat(5).join('')===label));expect(button).toBeDefined();act(()=>button!.props.onPress());}

it('replaces the false ladder with real barony requirements, cost and direct action',()=>{
 mockState=makeState({age:38,rankIdx:3,gold:350,lifetimeUnlocked:true,stats:{health:80,charm:84,wits:76,faith:50}});
 act(()=>{root=create(<MeTab portrait="" firstName="Agnes" epithet="" classRank="Noble" age={38} stats={[]} traits={[]} goal={null} bio=""/>);});
 expect(text()).toContain('ADVANCEMENT');expect(text()).toContain('Age 38+');expect(text()).toContain('Gold held 350g');expect(text()).toContain('90');expect(text()).not.toContain('% TO');expect(text()).not.toContain('PATH TO NOBILITY');
 tap('SEEK A BARONY · 1 ACTION / 1 COURT MATTER');expect(mockDispatch).toHaveBeenCalledWith({type:'COURT',action:'seek_barony'});
});
it('puts a royal child’s actual succession ahead of optional landed titles',()=>{
 mockState=createLife({worldSeed:950119,birthOrigin:'royal',lifetimeUnlocked:true});const nav=jest.fn();
 act(()=>{root=create(<AdvancementPanel state={mockState} onNavigate={nav}/>);});
 expect(text().indexOf('ROYAL SUCCESSION')).toBeLessThan(text().indexOf('SOCIAL STATION'));expect(text()).toContain('Prince');expect(text()).toContain('Designated heir');expect(text()).not.toContain('% TO');
});
it('gives a merchant a real political next step rather than compulsory military promotion',()=>{
 mockState=makeState({age:30,gold:500});mockState.occupation.careerId='trader';const nav=jest.fn(),before=JSON.stringify(mockState);
 act(()=>{root=create(<AdvancementPanel state={mockState} onNavigate={nav}/>);});expect(text()).toContain('REQUEST');expect(text()).toContain('landed nobility');expect(text()).not.toContain('SQUIRE');tap('OPEN SEEK PATRONAGE');expect(nav).toHaveBeenCalledWith('patron');expect(JSON.stringify(mockState)).toBe(before);expect(mockDispatch).not.toHaveBeenCalled();
});
