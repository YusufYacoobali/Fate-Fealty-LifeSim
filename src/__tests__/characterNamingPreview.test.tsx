import React from 'react';
import {TextInput} from 'react-native';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {CharacterCreation} from '@/components/modals/CharacterCreation';
import {PixelButton} from '@/components/ui/PixelButton';
import {PixelText} from '@/components/ui/PixelText';
import {createLife,syncPlayerToWorld} from '@/engine/gameState';
import {gameReducer,type NewLifeOptions} from '@/state/gameReducer';
import {fullName} from '@/state/viewModel';
import {normalizeGameState} from '@/state/persistence';
import {personalNameError,NICKNAME_MAX_LENGTH} from '@/engine/nameValidation';
import {runWithWorldRng} from '@/engine/random';
import {spawnKin} from '@/engine/kinFactory';
import {killPlayer} from '@/engine/consequenceEngine';
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:40,left:0,right:0})}));
let root:ReactTestRenderer;const begin=jest.fn();
beforeEach(()=>{begin.mockClear();act(()=>{root=create(<CharacterCreation initialDifficulty="Normal" premiumUnlocked={false} onBegin={begin} onLockedTraitPress={jest.fn()}/>);});});
afterEach(()=>act(()=>root.unmount()));
const field=(label:string)=>root.root.findAllByType(TextInput).find(n=>n.props.accessibilityLabel===label)!;
function type(label:string,value:string){act(()=>field(label).props.onChangeText(value));}
function tap(label:string){const b=root.root.findAllByType(PixelButton).find(n=>n.props.accessibilityLabel===label||n.findAllByType(PixelText).some(t=>t.props.children===label));expect(b).toBeDefined();act(()=>b!.props.onPress());}
const preview=()=>root.root.findAllByType(PixelText).find(n=>n.props.accessibilityLabel==='Full name preview')!.props.children;
it('preserves an explicitly typed generated-list name across gender, household, trait and difficulty changes',()=>{
 type('Name','Walter');type('Nickname','the Mostly-Honest');tap('WOMAN');tap('CUSTOM BIRTH');tap('Merchant');tap('BRUTAL');expect(field('Name').props.value).toBe('Walter');expect(field('Nickname').props.value).toBe('the Mostly-Honest');expect(preview()).toBe('Walter the Mostly-Honest');
 tap('✦ BEGIN THY LIFE');expect(begin).toHaveBeenCalledWith(expect.objectContaining({firstName:'Walter',nickname:'the Mostly-Honest',gender:'woman',difficulty:'Brutal'}));
 const opts=begin.mock.calls[0][0] as NewLifeOptions;const created=gameReducer(createLife({worldSeed:421}),{type:'NEW_LIFE',options:opts});expect(fullName(created)).toBe(preview());
});
it('randomises only the chosen field and never advances an existing saved world RNG',()=>{
 const s=createLife({worldSeed:92481}),before=JSON.stringify(s);type('Name','Élodie');type('Nickname','the Kind');
 runWithWorldRng(s.world,()=>{tap('Generate random name');});expect(field('Nickname').props.value).toBe('the Kind');
 type('Name','Élodie');runWithWorldRng(s.world,()=>tap('Generate random nickname'));expect(field('Name').props.value).toBe('Élodie');expect(JSON.stringify(s)).toBe(before);expect(begin).not.toHaveBeenCalled();
});
it('allows no nickname, trims Unicode names, and persists the exact preview without trailing spaces',()=>{
 type('Name',"  Éloïse d’Anjou  ");tap('NO NICKNAME');expect(preview()).toBe('Éloïse d’Anjou');tap('✦ BEGIN THY LIFE');const s=createLife({worldSeed:182,...begin.mock.calls[0][0]});expect(fullName(s)).toBe('Éloïse d’Anjou');syncPlayerToWorld(s);const loaded=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(fullName(loaded)).toBe(fullName(s));expect(loaded.world.characters[loaded.playerCharacterId].name).toBe('Éloïse d’Anjou');
});
it.each(['','    ','A\nB','A\u0000B','A'.repeat(21)])('rejects invalid names without closing or starting a life (%j)',name=>{
 type('Name',name);tap('✦ BEGIN THY LIFE');expect(begin).not.toHaveBeenCalled();expect(root.root.findAllByType(PixelText).some(t=>t.props.accessibilityRole==='alert')).toBe(true);type('Name','Joan-Marie');tap('✦ BEGIN THY LIFE');expect(begin).toHaveBeenCalledTimes(1);
});
it('validates nicknames and keeps world generation identical regardless of the chosen nickname',()=>{
 type('Nickname','x'.repeat(33));tap('✦ BEGIN THY LIFE');expect(begin).not.toHaveBeenCalled();
 const a=createLife({worldSeed:8123,firstName:'Agnes'}),b=createLife({worldSeed:8123,firstName:'Agnes',nickname:''});expect(a.world.rngState).toEqual(b.world.rngState);expect(a.world).toEqual(b.world);expect(a.traits).toEqual(b.traits);expect(a.stats).toEqual(b.stats);expect(b.epithet).toBe('');expect(personalNameError('the Mostly-Honest',{optional:true,max:NICKNAME_MAX_LENGTH})).toBeNull();
});
it('keeps old names on reload and the heir’s canonical identity on continuation',()=>{
 let s=createLife({worldSeed:886,firstName:'Élodie',nickname:'the Kind',lifetimeUnlocked:true});s.age=40;syncPlayerToWorld(s);const child=spawnKin(s,{kind:'child',age:18,name:'Joan-Marie'});killPlayer(s,'A recorded cause');s=normalizeGameState(JSON.parse(JSON.stringify(s)));expect(fullName(s)).toBe('Élodie the Kind');const next=gameReducer(s,{type:'CONTINUE_AS_HEIR',heirId:child.id,lifetimeUnlocked:true});expect(next.first).toBe('Joan-Marie');expect(next.epithet).toBe('the Heir');expect(next.world.characters[s.playerCharacterId].name).toBe('Élodie');
});
