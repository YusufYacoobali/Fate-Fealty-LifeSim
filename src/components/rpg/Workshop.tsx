import { CraftedItemActions } from './CraftedItemActions';
import { RpgIcon } from './RpgIcon';
import React, { useEffect, useState } from 'react';
import { AppState, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { cancelAnimation, Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { useGame } from '@/state/GameContext';
import { ForgeTask } from '@/types/rpg';
import { forgeAllowance, forgeAvailability, forgeGrade, forgeWindow } from '@/engine/forgeEngine';
import { TRADE_CHAPTERS, TRADE_ENDINGS, isTradeProfessional, tradeAvailability, tradeProgress, nextTradeCommission } from '@/engine/tradeJourney';
import { skillsOf } from '@/engine/rpgProgress';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { ModalBackdrop } from '../modals/ModalBackdrop';
import { C } from '@/theme/theme';
import { ForgeScene } from './ForgeScene';
import { ProUnlockButton } from './ProUnlockButton';

export function ForgePlayButton({ task, label = 'MAKE AT THE ANVIL · SAME COST' }: { task: ForgeTask; label?: string }) {
  const { state, dispatch } = useGame();
  const reason = forgeAvailability(state, task);
  if (reason === 'Requires Pro') return <ProUnlockButton feature={task.kind === 'commission' ? 'COMMISSIONED FORGE WORK' : 'ADVANCED CRAFTING'} />;
  return <PixelButton bg={C.charm} shadow={C.charmDark} disabled={!!reason} onPress={() => dispatch({ type: 'FORGE_START', task, revision: state.rpg.revision })} style={{ marginTop: 8 }} innerStyle={{ padding: 12, minHeight: 44 }}>
    <PixelText font="pixel" size={7} color={C.blueDark}>{label}</PixelText>
    {reason && <PixelText font="body" size={14} color={C.textBrown}>{reason}</PixelText>}
    {!reason && task.kind !== 'practice' && forgeAllowance(state) === 0 && <PixelText font="body" size={14} color={C.textBrown}>Yearly forge bonuses used; normal rewards still apply.</PixelText>}
  </PixelButton>;
}

export function TradeJourneyPanel() {
  const { state, dispatch } = useGame();
  const progress = tradeProgress(state), commissionIndex=nextTradeCommission(state), chapter = TRADE_CHAPTERS[commissionIndex];
  if (!isTradeProfessional(state) && !progress.chapter) return null;
  return <View style={{ padding: 12, marginBottom: 12, backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchBorder }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><RpgIcon name="careers" /><PixelText font="pixel" size={9} color={C.blueDark}>A MARK OF YOUR OWN</PixelText></View>
    <PixelText font="body" size={16} color={C.textBrown} style={{ marginTop: 8 }}>{progress.ending ? `Legacy earned: ${TRADE_ENDINGS[progress.ending]}. Your working life continues.` : `Chapter ${progress.chapter + 1}/4 · ${progress.assignments} relevant shifts or contracts completed`}</PixelText>
    {progress.clientId && <PixelText font="body" size={16} color={C.textBrown}>Regular buyer: {state.world.characters[progress.clientId]?.name ?? 'The guild'}</PixelText>}
    {chapter && <>
      <PixelText font="body" size={20} color={C.blueDark} style={{ marginTop: 10 }}>{chapter.title}</PixelText>
      <PixelText font="body" size={17} color={C.textBrown}>{chapter.text}</PixelText>
      {chapter.choices.map((choice) => { const reason = tradeAvailability(state, choice.id); return <View key={choice.id} style={{ marginTop: 12 }}>
        <PixelText font="body" size={16} color={C.textBrown}>{choice.stakes} Uses 1 action.</PixelText>
        <PixelButton disabled={!!reason} bg={C.lightFill} shadow={C.paleEdge} onPress={() => dispatch({ type: 'TRADE_CHOOSE', chapter: commissionIndex, choiceId: choice.id })} innerStyle={{ padding: 12, minHeight: 44 }}>
          <PixelText font="body" size={17} color={C.blueDark}>{choice.label} · quick</PixelText>
          {reason && <PixelText font="body" size={14} color={C.textMuted}>{reason}</PixelText>}
        </PixelButton>
        {choice.forge && <ForgePlayButton task={{ kind: 'commission', chapter: commissionIndex, choiceId: choice.id }} />}
      </View>; })}
    </>}
  </View>;
}

export function ForgeModal() {
  const { state, dispatch } = useGame();
  const run = state.rpg.forge!;
  const { height } = useWindowDimensions();
  const [active, setActive] = useState(AppState.currentState !== 'background');
  const [countdown, setCountdown] = useState(0);
  const [width, setWidth] = useState(260);
  const marker = useSharedValue(0), armed = useSharedValue(false);
  const index = run.scores.length;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => { armed.set(false); cancelAnimation(marker); setActive(next === 'active'); if (next === 'active') setCountdown(3); });
    return () => sub.remove();
  }, [armed, marker]);
  useEffect(() => { if (!countdown || !active) return; const timer = setTimeout(() => setCountdown((n) => n - 1), 1000); return () => clearTimeout(timer); }, [countdown, active]);
  useEffect(() => {
    armed.set(false); cancelAnimation(marker);
    if (!active || countdown || run.phase !== 'striking') return;
    marker.set(0);
    // A short reset between blows prevents a double tap becoming the next strike.
    const timer = setTimeout(() => {
      armed.set(true);
      marker.set(withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear, reduceMotion: ReduceMotion.Never }), -1, true, undefined, ReduceMotion.Never));
    }, 350);
    return () => { clearTimeout(timer); armed.set(false); cancelAnimation(marker); };
  }, [run.id, run.phase, index, active, countdown, marker, armed]);
  const strike = (position: number) => { if (AppState.currentState === 'background' || !active || countdown) return; dispatch({ type: 'FORGE_STRIKE', id: run.id, sequence: index, position }); };
  const accessibleStrike = () => { if (armed.get()) { armed.set(false); const position = marker.get(); cancelAnimation(marker); strike(position); } };
  const tap = Gesture.Tap().onEnd((_event, success) => { if (success && armed.get()) { armed.set(false); const position = marker.get(); cancelAnimation(marker); scheduleOnRN(strike, position); } });
  // The marker centre and target zones use the same inner-track coordinates.
  const cursor = useAnimatedStyle(() => ({ transform: [{ translateX: marker.get() * width - 3 }] }));
  const target = run.targets[Math.min(index, 4)], window = forgeWindow(run.level);
  const skill = skillsOf(state).craftsmanship;
  const last = run.scores[index - 1];
  return <ModalBackdrop zIndex={80}>
    <ScrollView style={{ maxHeight: height - 110, width: '100%', maxWidth: 500, alignSelf: 'center', backgroundColor: '#271e25', borderWidth: 3, borderColor: '#b4783b' }} contentContainerStyle={{ padding: 18, gap: 12 }}>
      <PixelText font="pixel" size={11} color="#f4c57b">AT THE ANVIL</PixelText>
      <PixelText font="body" size={21} color="#fff0d4">{run.title}</PixelText>
      <ForgeScene key={run.id} scores={run.scores} active={active} reducedMotion={!!state.settings.reducedMotion} haptics={state.settings.haptics} />
      {run.phase !== 'result' && <PixelText font="body" size={17} color="#efd6b0">{run.practice ? `Your lesson costs 1 action. Finish to earn ${run.lessonXp ?? 0} Craftsmanship XP.` : 'Your normal task is already complete. Its item, pay and XP are safe.'}</PixelText>}
      {run.phase === 'ready' && <>
        <PixelText font="body" size={17} color="#efd6b0">Five blows. Tap HAMMER as the marker crosses the gold zone; its bright centre gives a perfect strike. No time limit.</PixelText>
        <PixelText font="body" size={16} color="#efd6b0">{run.practice ? 'Five blows to learn the rhythm. Your 6 XP are guaranteed, even with Quick finish.' : 'Good: 2 bonus XP. Excellent: 4 bonus XP + 1 recovered iron.'} {run.practice ? '' : run.bonusEligible ? 'This attempt uses one of your 3 yearly bonus opportunities.' : 'Yearly bonus limit reached; play for enjoyment.'}</PixelText>
        <PixelButton bg={C.charm} shadow={C.charmDark} onPress={() => dispatch({ type: 'FORGE_BEGIN', id: run.id })} innerStyle={{ padding: 16 }}><PixelText font="pixel" size={9} color={C.blueDark}>BEGIN HAMMER WORK</PixelText></PixelButton>
      </>}
      {run.phase === 'striking' && <>
        <PixelText font="body" size={19} color="#fff0d4" accessibilityLiveRegion="polite">{!active ? 'Paused' : countdown ? `Ready in ${countdown}…` : `Blow ${index + 1} of 5${index ? ` · Last: ${last === 100 ? 'Perfect' : last === 60 ? 'Good' : 'Miss'}` : ''}`}</PixelText>
        <View onLayout={(e) => setWidth(Math.max(0, e.nativeEvent.layout.width - 4))} style={{ height: 38, backgroundColor: '#141722', borderWidth: 2, borderColor: '#687887', overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: `${(target - window) * 100}%`, width: `${window * 200}%`, height: '100%', backgroundColor: '#8c6227' }} />
          <View style={{ position: 'absolute', left: `${(target - window / 2) * 100}%`, width: `${window * 100}%`, height: '100%', backgroundColor: '#f3c76d' }} />
          <Animated.View style={[{ width: 6, height: 34, backgroundColor: '#fffaf0' }, cursor]} />
        </View>
        <GestureDetector gesture={tap}><Pressable accessible accessibilityRole="button" accessibilityLabel="Hammer the iron" accessibilityHint="Tap when the marker reaches the gold zone. Quick finish earns the normal task rewards." onPress={accessibleStrike} style={{ minHeight: 70, backgroundColor: '#bb7139', borderBottomWidth: 5, borderColor: '#75422a', alignItems: 'center', justifyContent: 'center' }}><PixelText font="pixel" size={12} color="#fff0d4">HAMMER</PixelText></Pressable></GestureDetector>
        <PixelText font="body" size={19} color="#f4c57b">{Array.from({ length: 5 }, (_, i) => run.scores[i] == null ? '○' : run.scores[i] === 100 ? '★' : run.scores[i] === 60 ? '●' : '×').join('   ')}</PixelText>
      </>}
      {run.phase === 'result' && <>
        <PixelText font="pixel" size={10} color="#f4c57b">{run.scores.length === 5 ? forgeGrade(run).toUpperCase() : 'QUICK FINISH'}</PixelText>
        <PixelText font="body" size={18} color="#fff0d4">{run.practice ? `Practice complete. +${run.lessonXp ?? 0} Craftsmanship XP.` : `Normal rewards kept. Bonus: ${run.bonusXp} Craftsmanship XP${run.bonusIron ? ' + 1 iron' : ''}.`}</PixelText>
        <PixelText font="body" size={17} color="#efd6b0">Craftsmanship {skill.level} · {skill.level < 10 ? `${skill.xp}/${skill.level * 20} XP` : 'Maximum level'}{!run.practice ? ` · ${forgeAllowance(state)} bonus opportunities left this year` : ''}</PixelText>
        {run.craftedKey && run.recipeId && <View style={{ backgroundColor: C.parch, padding: 10 }}><CraftedItemActions itemKey={run.craftedKey} recipeId={run.recipeId} /></View>}
        <PixelButton bg={C.charm} shadow={C.charmDark} onPress={() => dispatch({ type: 'FORGE_CLOSE', id: run.id })} innerStyle={{ padding: 16 }}><PixelText font="pixel" size={9} color={C.blueDark}>CONTINUE</PixelText></PixelButton>
      </>}
      {run.phase !== 'result' && <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={() => dispatch({ type: 'FORGE_QUICK', id: run.id })} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="body" size={17} color={C.blueDark}>{run.practice ? `Quick finish · earn ${run.lessonXp ?? 0} XP` : 'Quick finish · keep normal rewards'}</PixelText></PixelButton>}
    </ScrollView>
  </ModalBackdrop>;
}
