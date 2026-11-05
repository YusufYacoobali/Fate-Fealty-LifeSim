import type {CourtAction} from '@/engine/courtEngine';
import React,{useState} from 'react';
import {Image,ScrollView,View,useWindowDimensions} from 'react-native';
import type {GameState,HoldingResource} from '@/types/game';
import {currentRank} from '@/state/viewModel';
import {HOLDING_ACTIONS,HOLDING_UNLOCK_AGE,HOLDING_UPGRADES,holdingTitle} from '@/data/holding';
import {holdingActionAvailability,holdingPopulation,holdingPopulationCapacity,holdingProsperity,holdingProsperityReward,holdingUpgradeAvailability,holdingYearlyUpkeep,isHoldingUpgradeActive} from '@/engine/holdingEngine';
import {C,PANEL} from '@/theme/theme';
import {FEATURE_ART,HOLDING_ACTION_ART,HOLDING_RESOURCE_ART,HOLDING_UPGRADE_ART,PAYWALL_ART} from '@/assets/generatedAssets';
import {PixelButton} from '../ui/PixelButton';
import {PixelText} from '../ui/PixelText';
import {StatBar} from '../ui/StatBar';
import {WorldStatusPanel} from '../WorldStatusPanel';
import {HoldingExpansionPanel} from '../rpg/RpgPanels';
import {CourtPanel} from './CourtPanel';
import {HoldingPanel} from './HoldingPanel';
export type HoldingSection='estate'|'court'|'swineford';
interface Props{courtFocus?:CourtAction;state:GameState;section:HoldingSection;onSectionChange:(section:HoldingSection)=>void;onAction:(id:string)=>void;onUpgrade:(id:string)=>void;}
const RESOURCE_STYLE={stores:{label:'STORES',color:'#d8ad62',dark:'#966c2f'},security:{label:'SECURITY',color:C.blue,dark:C.blueDark},loyalty:{label:'LOYALTY',color:C.faith,dark:C.faithDark}};
function recommendation(state: GameState): string {
  if (state.holding.lastActionAge === state.age) return 'Your estate order is complete. Age up to see the yearly result.';
  if (state.holding.stores < 45) return 'Work the Land next. Low Stores can cause hunger and population loss.';
  if (state.holding.security < 45) return 'Secure Bounds next. Low Security risks raids and destroyed buildings.';
  if (state.holding.loyalty < 45) {
    return state.holding.stores >= 14
      ? 'Open the Stores next. Loyalty prevents revolt and protects your rank.'
      : 'Build Stores first, then use them to restore Loyalty.';
  }
  if (holdingProsperity(state) < 75) {
    const lowest = (['stores', 'security', 'loyalty'] as HoldingResource[])
      .reduce((current, key) => state.holding[key] < state.holding[current] ? key : current, 'stores');
    return `Raise ${RESOURCE_STYLE[lowest].label} toward 75 to unlock the prosperity payout.`;
  }
  return 'The estate is thriving. Keep every resource at 75 or more to earn gold and reputation each year.';
}


export function HoldingTab({state,courtFocus,section,onSectionChange,onAction,onUpgrade}:Props){
 const {width,fontScale}=useWindowDimensions(),[buildingsOpen,setBuildingsOpen]=useState(false);
 const managed=state.holding.lastActionAge===state.age,locked=state.age<HOLDING_UNLOCK_AGE;
 const prosperity=holdingProsperity(state),upkeep=holdingYearlyUpkeep(state),reward=holdingProsperityReward(state);
 const columns=width>=720?3:width>=360?2:1;
 const compactNavigation=width<390||width/fontScale<300;
 const orders=HOLDING_ACTIONS.map((action,index)=>({action,index,availability:holdingActionAvailability(state,action.id)})).sort((a,b)=>Number(b.availability.available)-Number(a.availability.available)||a.index-b.index);
 const next=HOLDING_UPGRADES.find(u=>!state.holding.upgrades.includes(u.id)&&holdingUpgradeAvailability(state,u.id).available)??HOLDING_UPGRADES.find(u=>!state.holding.upgrades.includes(u.id));
 return <View style={{flex:1}}>
  <ScrollView key={section} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag" style={{flex:1}} contentContainerStyle={{padding:9,paddingBottom:18,gap:10}}>
  <View style={{flexDirection:'row',gap:4,padding:8,borderBottomWidth:3,borderColor:C.blueDeep}}>
   {([{id:'estate',label:'ESTATE',art:PAYWALL_ART.holding},{id:'court',label:'ROYAL COURT',art:PAYWALL_ART.crown},{id:'swineford',label:'SWINEFORD',art:HOLDING_UPGRADE_ART.stewards_hall}] as const).map(item=><PixelButton key={item.id} accessibilityLabel={item.label} selected={section===item.id} bg={section===item.id?C.charm:C.lightFill} shadow={section===item.id?C.charmDark:C.blueDark} onPress={()=>onSectionChange(item.id)} style={{flex:1,minWidth:0}} innerStyle={{paddingHorizontal:compactNavigation?1:7,paddingVertical:7,minHeight:52,alignItems:'center',justifyContent:'center',gap:4,flexDirection:width>=600?'row':'column'}}>
    <Image source={item.art} resizeMode="contain" style={{width:25,height:25}}/><PixelText font="pixel" size={7} color={C.blueDark} style={{textAlign:'center'}}>{compactNavigation?(item.id==='court'?'COURT':item.id==='swineford'?'VILLAGE':item.label):item.label}</PixelText>
   </PixelButton>)}
  </View>
   {section==='court'?<CourtPanel state={state} initialAction={courtFocus}/>:section==='swineford'?<>
    <View style={PANEL.parchCard}><PixelText font="pixel" size={10} color={C.blueDeep}>THE VILLAGE OF SWINEFORD</PixelText><PixelText size={17} style={{marginTop:7}}>Village conditions affect everyone. Your estate’s Stores support village food; Security and Loyalty support order.</PixelText></View>
    <WorldStatusPanel state={state}/>
   </>:<>
    <View style={{borderWidth:3,borderColor:C.parchSl,backgroundColor:C.blueDeep}}>
     <View style={{padding:10,gap:8}}>
      <PixelText font="pixel" size={10} color={C.charm}>{holdingTitle(state.rankIdx).toUpperCase()}</PixelText>
      <PixelText size={16} color={C.white}>{currentRank(state).key} lands · Dynasty {state.lifeNo}</PixelText>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:14,justifyContent:'space-between'}}><PixelText size={19} color={C.charm}>Prosperity {prosperity}%</PixelText><PixelText size={19} color={C.faith}>People {holdingPopulation(state)}/{holdingPopulationCapacity(state)}</PixelText></View>
      <PixelText size={15} color={C.creamBlue}>{prosperity>=75?`${reward}g + 2 reputation each year`:`At 75% prosperity: ${reward}g + 2 reputation yearly`}</PixelText>
     </View>
     <Image source={FEATURE_ART.holding} resizeMode="cover" style={{width:'100%',height:width>=600?160:110}}/>
    </View>
    <View style={[PANEL.parchCard,{gap:7}]}><PixelText font="pixel" size={8} color={C.blueDeep}>BEST NEXT MOVE</PixelText><PixelText size={17} color={C.textBrown}>{recommendation(state)}</PixelText></View>
    {locked&&<View style={PANEL.parchCard}><PixelText font="pixel" size={8} color={C.amber}>UNDER REGENCY</PixelText><PixelText size={16}>Your family tends the land until you reach {HOLDING_UNLOCK_AGE}.</PixelText></View>}
    <HoldingPanel title="YEARLY LEDGER">
     {(['stores','security','loyalty'] as HoldingResource[]).map(resource=><View key={resource} style={{gap:7,padding:5,borderBottomWidth:1,borderColor:C.parchSd,flexDirection:width>=700?'row':'column'}}>
      <View style={{flex:1,gap:5}}><View style={{flexDirection:'row',alignItems:'center',gap:7,flexWrap:'wrap'}}><Image source={HOLDING_RESOURCE_ART[resource]} resizeMode="contain" style={{width:26,height:26}}/><PixelText font="pixel" size={8} color={RESOURCE_STYLE[resource].dark}>{RESOURCE_STYLE[resource].label}</PixelText><PixelText size={19}>{state.holding[resource]}%</PixelText></View><StatBar value={state.holding[resource]} color={RESOURCE_STYLE[resource].color} dark={RESOURCE_STYLE[resource].dark} height={12} animated={!state.settings.reducedMotion} trackBg={C.lightFill} trackBorder={C.inkSoft}/></View>
      <PixelText size={16} color={C.textBrown} style={width>=700?{flex:1,paddingLeft:9}:undefined}>{resource==='stores'?`Feeds the estate. Yearly upkeep: ${upkeep.stores}.`:resource==='security'?`Protects people and buildings. Yearly upkeep: ${upkeep.security}.`:'Prevents revolt and protects reputation and rank.'}</PixelText>
     </View>)}
     <PixelText size={14} color={C.textMuted}>Prosperity equals the lowest resource. All three at 60+ attract settlers; below 15 for two years risks a crisis.</PixelText>
     {state.holding.criticalYears>0&&<PixelText size={16} color={C.bad}>Another critical year risks famine, raids or revolt.</PixelText>}
    </HoldingPanel>
    <HoldingPanel title="ONE ORDER THIS YEAR" note={managed?'ORDER GIVEN':locked?'LOCKED':'READY'}>
     <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{orders.map(({action,availability})=><PixelButton key={action.id} bg={availability.available?C.parch:C.lightFill} shadow={C.parchSd} disabled={!availability.available} onPress={()=>onAction(action.id)} style={{width:columns===3?'32%':columns===2?'48.5%':'100%'}} innerStyle={{padding:8,gap:7,minHeight:116}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:7}}><Image source={HOLDING_ACTION_ART[action.id as keyof typeof HOLDING_ACTION_ART]} resizeMode="contain" style={{width:32,height:32}}/><PixelText font="pixel" size={7} style={{flex:1}}>{action.name}</PixelText></View>
      <PixelText size={16} color={C.textBrown}>{action.desc}</PixelText>{!availability.available&&<PixelText size={14} color={C.bad}>{availability.reason}</PixelText>}
     </PixelButton>)}</View>
    </HoldingPanel>
    <HoldingPanel title="BUILDINGS & UPGRADES" note={`${state.holding.upgrades.length} improvements`}>
     <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{state.holding.upgrades.map(id=><Image key={id} accessibilityLabel={HOLDING_UPGRADES.find(u=>u.id===id)?.name} source={HOLDING_UPGRADE_ART[id as keyof typeof HOLDING_UPGRADE_ART]} resizeMode="contain" style={{width:34,height:34}}/>)}</View>
     <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={()=>setBuildingsOpen(!buildingsOpen)} innerStyle={{padding:9,gap:6}}>
      <PixelText font="pixel" size={7} color={C.blueDeep}>{buildingsOpen?'CLOSE BUILDINGS & UPGRADES':'EXPAND BUILDINGS & UPGRADES'}</PixelText>
      <PixelText size={17}>{next?`Next: ${next.name} · ${next.price}g`:'All permanent improvements owned'}</PixelText>
      <PixelText size={15} color={C.textMuted}>{next?.desc??'Manage construction, materials and stewardship.'}</PixelText>
     </PixelButton>
     {buildingsOpen&&<>{HOLDING_UPGRADES.map(upgrade=>{const availability=holdingUpgradeAvailability(state,upgrade.id),owned=state.holding.upgrades.includes(upgrade.id);return <PixelButton key={upgrade.id} bg={owned?C.lightFill:C.parch} shadow={C.parchSd} disabled={!availability.available} onPress={()=>onUpgrade(upgrade.id)} innerStyle={{padding:9,gap:6}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Image source={HOLDING_UPGRADE_ART[upgrade.id as keyof typeof HOLDING_UPGRADE_ART]} resizeMode="contain" style={{width:38,height:38}}/><View style={{flex:1,gap:4}}><PixelText font="pixel" size={7}>{upgrade.name}</PixelText><PixelText size={16}>{owned?isHoldingUpgradeActive(state,upgrade.id)?'OWNED':'DORMANT':`${upgrade.price}g`}</PixelText></View></View>
      <PixelText size={16}>{upgrade.desc}</PixelText>{!availability.available&&!owned&&<PixelText size={14} color={C.bad}>{availability.reason}</PixelText>}
     </PixelButton>})}<HoldingExpansionPanel/></>}
    </HoldingPanel>
   </>}
  </ScrollView>
 </View>;
}
