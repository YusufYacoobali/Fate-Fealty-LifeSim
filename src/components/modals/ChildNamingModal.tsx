import React, {useEffect,useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,TextInput,useWindowDimensions,View} from 'react-native';
import {ModalBackdrop} from './ModalBackdrop';
import {PixelText} from '../ui/PixelText';
import {PixelButton} from '../ui/PixelButton';
import {C,FONT,PANEL} from '@/theme/theme';
import {childNameError} from '@/engine/childNaming';

export function ChildNamingModal({suggestedName,currentName,renaming,onConfirm,onSuggest,onKeep}: {
  suggestedName:string;currentName:string;renaming:boolean;
  onConfirm:(name:string)=>void;onSuggest:()=>void;onKeep:()=>void;
}) {
  const [name,setName]=useState(suggestedName),[error,setError]=useState<string|null>(null);
  const {height}=useWindowDimensions();
  useEffect(()=>{setName(suggestedName);setError(null);},[suggestedName]);
  const confirm=()=>{const problem=childNameError(name);setError(problem);if(!problem)onConfirm(name.trim());};
  return <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:55}}>
    <ModalBackdrop zIndex={55}>
      <View accessibilityViewIsModal style={[PANEL.parchModal,{width:'100%',maxWidth:440,alignSelf:'center',maxHeight:Math.max(160,height-120)}]}>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{padding:12,gap:12}}>
          <PixelText font="pixel" size={10} color={C.blueDeep} style={{textAlign:'center'}}>{renaming?'RENAME THY CHILD':'NAME THY CHILD'}</PixelText>
          <PixelText font="body" size={20} color={C.textDark}>{renaming?`What name shall ${currentName} bear?`:'A new child has joined thy household. What name shall they bear?'}</PixelText>
          <PixelText font="pixel" size={7} color={C.textBrown}>THY CHILD’S NAME</PixelText>
          <View style={{minHeight:48,backgroundColor:C.parch,borderWidth:3,borderColor:C.inkSoft,borderTopColor:C.parchSl,borderLeftColor:C.parchSl,borderBottomColor:C.parchSd,borderRightColor:C.parchSd,justifyContent:'center'}}>
            <TextInput accessibilityLabel="Child's name" value={name} onChangeText={t=>{setName(t);setError(null);}} placeholder="Name thy child" placeholderTextColor="#b0a070" multiline={false} autoCorrect={false} returnKeyType="done" onSubmitEditing={confirm} style={{fontFamily:FONT.body,fontSize:22,color:C.textDark,paddingHorizontal:10,paddingVertical:8,textAlignVertical:'center'}} />
          </View>
          {error && <PixelText accessibilityRole="alert" font="body" size={18} color={C.bad}>{error}</PixelText>}
          <PixelButton bg={C.light} shadow={C.blue} onPress={onSuggest} innerStyle={{padding:10,alignItems:'center'}}><PixelText font="pixel" size={7} color={C.blueDark} style={{textAlign:'center'}}>ANOTHER SUGGESTION</PixelText></PixelButton>
          <PixelButton bg={C.faith} shadow={C.faithDark} onPress={confirm} innerStyle={{padding:10,alignItems:'center'}}><PixelText font="pixel" size={7} color={C.blueDark} style={{textAlign:'center'}}>CONFIRM NAME</PixelText></PixelButton>
          <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={onKeep} innerStyle={{padding:10,alignItems:'center'}}><PixelText font="pixel" size={7} color={C.blueDark} style={{textAlign:'center'}}>{renaming?'KEEP CURRENT NAME':'KEEP SUGGESTED NAME'}</PixelText></PixelButton>
          <PixelText font="body" size={16} color={C.textMuted} style={{textAlign:'center'}}>Naming is free. Thou may rename a child in People before adulthood.</PixelText>
        </ScrollView>
      </View>
    </ModalBackdrop>
  </KeyboardAvoidingView>;
}
