import React from 'react';
import {act,create,ReactTestRenderer} from 'react-test-renderer';
import {TextInput} from 'react-native';
import {useFamilyOverlay} from '@/state/hooks/useFamilyOverlay';
import {LifeEventNoticeModal} from '@/components/modals/LifeEventNoticeModal';
import {ChildNamingModal} from '@/components/modals/ChildNamingModal';
import {PixelButton} from '@/components/ui/PixelButton';
import {PixelText} from '@/components/ui/PixelText';
import {makeState} from './helpers';
import {spawnKin,killKin} from '@/engine/kinFactory';
import {syncPlayerToWorld} from '@/engine/gameState';
import {gameReducer} from '@/state/gameReducer';
import type {GameState} from '@/types/game';
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
let root:ReactTestRenderer;afterEach(()=>act(()=>root?.unmount()));
function Harness({state,allowed=true,onName=()=>{}}:{state:GameState;allowed?:boolean;onName?:(name:string)=>void}){
 const chosen=useFamilyOverlay(state,allowed);if(!allowed||!chosen)return null;
 return chosen.kind==='notice'?<LifeEventNoticeModal notice={state.lifeEvents!.notices.find(n=>n.id===chosen.id)!} onContinue={()=>{}}/>:<ChildNamingModal key={chosen.id} currentName={state.world.characters[chosen.id].name} suggestedName={state.world.characters[chosen.id].name} renaming={false} onConfirm={onName} onKeep={()=>{}} onSuggest={()=>{}}/>;
}
it('never replaces an open naming input when a personal notice arrives; the notice follows confirmation',()=>{
 let s=makeState({age:25});syncPlayerToWorld(s);const child=spawnKin(s,{kind:'child',age:0}),spouse=spawnKin(s,{kind:'spouse',age:28});act(()=>{root=create(<Harness state={s}/>);});act(()=>root.root.findByType(TextInput).props.onChangeText('Élodie'));killKin(s,spouse.id);
 act(()=>root.update(<Harness state={{...s}}/>));expect(root.root.findByType(TextInput).props.value).toBe('Élodie');expect(root.root.findAllByType(LifeEventNoticeModal)).toHaveLength(0);
 s=gameReducer(s,{type:'CONFIRM_CHILD_NAME',id:child.id,name:'Élodie'});act(()=>root.update(<Harness state={s}/>));expect(root.root.findAllByType(TextInput)).toHaveLength(0);expect(root.root.findByType(LifeEventNoticeModal).props.notice.category).toBe('spouse_death');
});
it('keeps family views hidden behind critical gameplay, then presents the queued notice before naming',()=>{
 const s=makeState({age:25});syncPlayerToWorld(s);spawnKin(s,{kind:'child',age:0});const spouse=spawnKin(s,{kind:'spouse',age:28});killKin(s,spouse.id);act(()=>{root=create(<Harness state={s} allowed={false}/>);});expect(root.toJSON()).toBeNull();act(()=>root.update(<Harness state={s} allowed/>));expect(root.root.findByType(LifeEventNoticeModal)).toBeDefined();expect(root.root.findAllByType(TextInput)).toHaveLength(0);
});
it('renders frozen facts and makes Continue only acknowledge the notice',()=>{
 const s=makeState({age:25});syncPlayerToWorld(s);const spouse=spawnKin(s,{kind:'spouse',age:54,name:'Alys'});killKin(s,spouse.id,'Old age');const n=s.lifeEvents!.notices[0],continued=jest.fn();act(()=>{root=create(<LifeEventNoticeModal notice={n} onContinue={continued}/>);});expect(root.root.findAllByType(PixelText).some(t=>t.props.children===n.text)).toBe(true);expect(root.root.findAllByType(PixelText).some(t=>t.props.children==='Old age')).toBe(true);act(()=>root.root.findByType(PixelButton).props.onPress());expect(continued).toHaveBeenCalledTimes(1);
});
