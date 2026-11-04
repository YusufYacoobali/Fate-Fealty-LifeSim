import React from 'react';
import {View} from 'react-native';
import {C,PANEL} from '@/theme/theme';
import {PixelText} from '../ui/PixelText';
/** The same blue section heading and beveled parchment used throughout HOLD. */
export function HoldingPanel({title,note,children}:{title:string;note?:string;children:React.ReactNode}){
 return <View style={[PANEL.parchCard,{padding:3}]}>
  <View style={{backgroundColor:C.blueDeep,padding:8,flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:7}}>
   <PixelText font="pixel" size={8} color={C.white} style={{maxWidth:'100%',flexShrink:1}}>{title}</PixelText>
   {note&&<PixelText font="body" size={16} color={C.charm}>{note}</PixelText>}
  </View>
  <View style={{padding:7,gap:8}}>{children}</View>
 </View>;
}
