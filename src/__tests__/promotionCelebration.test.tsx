import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {usePromotionCelebration} from '@/state/hooks/usePromotionCelebration';
import {makeState} from './helpers';
let root:ReactTestRenderer,observed:ReturnType<typeof usePromotionCelebration>;
function Harness({state,loaded}:{state:ReturnType<typeof makeState>;loaded:boolean}){observed=usePromotionCelebration(state,loaded);return null;}
afterEach(()=>act(()=>root.unmount()));
it('reuses one celebration for an earned rank increase, never for hydration, reload or continuation',()=>{
 const s=makeState();act(()=>{root=create(<Harness state={s} loaded={false}/>);});const loaded={...s,rankIdx:3};act(()=>root.update(<Harness state={loaded} loaded/>));expect(observed.promotedTo).toBeNull();
 act(()=>root.update(<Harness state={{...loaded,rankIdx:4}} loaded/>));expect(observed.promotedTo).toBe(4);act(()=>observed.dismissPromotion());act(()=>root.update(<Harness state={{...loaded,rankIdx:4}} loaded/>));expect(observed.promotedTo).toBeNull();
 act(()=>root.update(<Harness state={{...loaded,rankIdx:5,playerCharacterId:'new_heir',lifeNo:2}} loaded/>));expect(observed.promotedTo).toBeNull();
});
