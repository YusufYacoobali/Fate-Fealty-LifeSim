import {useEffect,useState} from 'react';
import type {GameState} from '@/types/game';
import {selectFamilyOverlay,type FamilyOverlay} from '@/engine/familyOverlay';
/** Latch the open informational view so incoming notices never replace typed input. */
export function useFamilyOverlay(state:GameState,allowed:boolean):FamilyOverlay {
 const [current,setCurrent]=useState<FamilyOverlay>(null);
 const selected=selectFamilyOverlay(state,current);
 const key=selected?`${selected.kind}:${selected.id}`:'';
 useEffect(()=>{if(allowed)setCurrent(selected);},[key,allowed]);
 return selected;
}
