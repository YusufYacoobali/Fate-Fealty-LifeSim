import React from 'react';
import {act,create,ReactTestRenderer} from 'react-test-renderer';
import {useGameFeedback} from '@/state/hooks/useGameFeedback';
import {haptic} from '@/services/haptics';
import {makeState} from './helpers';
import {spawnKin,killKin} from '@/engine/kinFactory';
import {cloneState,syncPlayerToWorld} from '@/engine/gameState';
import {gameReducer} from '@/state/gameReducer';
import type {GameState} from '@/types/game';
jest.mock('@/services/haptics',()=>({haptic:jest.fn()}));
function Harness({state}:{state:GameState}){useGameFeedback(state);return null;}
let root:ReactTestRenderer;afterEach(()=>{act(()=>root?.unmount());jest.clearAllMocks();});
it('suppresses simultaneous cheerful haptics for bereavement and never replays them on Continue',()=>{
 let s=makeState({age:25});s.settings.haptics=true;syncPlayerToWorld(s);const spouse=spawnKin(s,{kind:'spouse',age:54});act(()=>{root=create(<Harness state={s}/>);});jest.clearAllMocks();
 s=cloneState(s);killKin(s,spouse.id);s.rankIdx++;s.world.history.push({id:'birth_same_year',year:s.world.currentYear,type:'adoption',participantIds:[],familyIds:[],causes:[],summary:'A child joined the family.',salience:3});act(()=>root.update(<Harness state={s}/>));expect(haptic).not.toHaveBeenCalled();
 s=gameReducer(s,{type:'ACK_LIFE_EVENT',id:s.lifeEvents!.notices[0].id});act(()=>root.update(<Harness state={s}/>));expect(haptic).not.toHaveBeenCalled();
});
it('retains genuine promotion feedback when there is no bereavement',()=>{
 const s=makeState({age:25});s.settings.haptics=true;act(()=>{root=create(<Harness state={s}/>);});jest.clearAllMocks();const next=cloneState(s);next.rankIdx++;act(()=>root.update(<Harness state={next}/>));expect(haptic).toHaveBeenCalledWith('success',true);
});
it('passes the disabled setting through to the haptic service',()=>{
 const s=makeState({age:25});s.settings.haptics=false;act(()=>{root=create(<Harness state={s}/>);});jest.clearAllMocks();const next=cloneState(s);next.rankIdx++;act(()=>root.update(<Harness state={next}/>));expect(haptic).toHaveBeenCalledWith('success',false);
});
