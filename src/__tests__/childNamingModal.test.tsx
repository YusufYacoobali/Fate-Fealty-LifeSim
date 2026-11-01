import React from 'react';
import {act,create,ReactTestRenderer} from 'react-test-renderer';
import {TextInput} from 'react-native';
import {ChildNamingModal} from '@/components/modals/ChildNamingModal';
import {PixelButton} from '@/components/ui/PixelButton';
import {PixelText} from '@/components/ui/PixelText';
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
let root:ReactTestRenderer;
afterEach(()=>act(()=>root?.unmount()));
function press(label:string){const b=root.root.findAllByType(PixelButton).find(b=>b.findAllByType(PixelText).some(t=>t.props.children===label));act(()=>b!.props.onPress());}
it('keeps invalid input open with an explanation, then confirms a trimmed Unicode name',()=>{
 const confirm=jest.fn();act(()=>{root=create(<ChildNamingModal suggestedName="Agnes" currentName="Agnes" renaming={false} onConfirm={confirm} onKeep={jest.fn()} onSuggest={jest.fn()} />);});
 act(()=>root.root.findByType(TextInput).props.onChangeText('   '));press('CONFIRM NAME');expect(confirm).not.toHaveBeenCalled();expect(root.root.findAllByType(PixelText).some(t=>t.props.accessibilityRole==='alert')).toBe(true);expect(root.root.findByType(TextInput)).toBeDefined();
 act(()=>root.root.findByType(TextInput).props.onChangeText('  Élodie-Jane  '));press('CONFIRM NAME');expect(confirm).toHaveBeenCalledWith('Élodie-Jane');
});
it('lets a player keep the suggested name without typing, or keep the current name when renaming',()=>{
 const keep=jest.fn();act(()=>{root=create(<ChildNamingModal suggestedName="Agnes" currentName="Agnes" renaming={false} onConfirm={jest.fn()} onKeep={keep} onSuggest={jest.fn()} />);});press('KEEP SUGGESTED NAME');expect(keep).toHaveBeenCalledTimes(1);
 act(()=>root.update(<ChildNamingModal suggestedName="Agnes" currentName="Élodie" renaming onConfirm={jest.fn()} onKeep={keep} onSuggest={jest.fn()} />));press('KEEP CURRENT NAME');expect(keep).toHaveBeenCalledTimes(2);
});
