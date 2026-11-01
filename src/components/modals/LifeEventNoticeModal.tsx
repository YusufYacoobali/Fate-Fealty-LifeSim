import React from 'react';
import {ScrollView,View,useWindowDimensions} from 'react-native';
import type {LifeEventNotice} from '@/types/game';
import {ModalBackdrop} from './ModalBackdrop';
import {PixelText} from '../ui/PixelText';
import {PixelButton} from '../ui/PixelButton';
import {C,PANEL} from '@/theme/theme';
/** Quiet, static information: no celebration animation, sound or action cost. */
export function LifeEventNoticeModal({notice,onContinue}:{notice:LifeEventNotice;onContinue:()=>void}){
 const {height}=useWindowDimensions();const person=notice.people[0],bereavement=notice.category.endsWith('_death');
 return <ModalBackdrop zIndex={56}>
  <View accessibilityViewIsModal style={[PANEL.parchModal,{width:'100%',maxWidth:480,alignSelf:'center',maxHeight:Math.max(160,height-120)}]}>
   <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:12,gap:14}}>
    <PixelText font="pixel" size={10} color={bereavement?C.blueDeep:C.purpleDark} style={{textAlign:'center'}}>{notice.title}</PixelText>
    <PixelText font="body" size={20} color={C.textBrown} style={{textAlign:'center'}}>{person.name} · {person.age} winters · {person.relationship}</PixelText>
    <PixelText font="body" size={21} color={C.textDark}>{notice.text}</PixelText>
    {notice.cause&&<PixelText font="body" size={16} color={C.textMuted}>{notice.cause}</PixelText>}
    <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={onContinue} innerStyle={{padding:12,alignItems:'center'}}><PixelText font="pixel" size={8} color={C.blueDark}>CONTINUE</PixelText></PixelButton>
   </ScrollView>
  </View>
 </ModalBackdrop>;
}
