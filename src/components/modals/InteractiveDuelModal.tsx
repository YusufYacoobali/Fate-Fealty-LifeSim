import React, { useCallback, useEffect, useState } from 'react';
import { AppState, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { cancelAnimation, Easing, ReduceMotion, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GameState } from '@/types/game';
import { Attack, Defence } from '@/types/rpg';
import { combatChoiceReason, combatCost, duelTelegraph, timingWindows } from '@/engine/duelEngine';
import { useGame } from '@/state/GameContext';
import { haptic } from '@/services/haptics';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';

interface Props { state: GameState; onRespond: (id: string) => void; onClose: () => void }
type Pose = 'idle' | 'windup' | 'attack' | 'block' | 'dodge' | 'defeat';
/** Code-native pixel art lets armour, weapons and poses follow actual equipment. */
function Fighter({ enemy, weapon, armour, pose }: { enemy?: boolean; weapon?: string; armour?: string; pose: Pose }) {
  const skin = '#e8b07e', outline = '#152431', cloth = armour ? '#96a4aa' : enemy ? '#9e4845' : '#436fa3';
  const pixels = ['    HHHHH    ', '   HSSSSSH   ', '   HSSKSSH   ', '    SSSSS    ', '     SSS     ', '   OCCCCCO   ', '  OCCCCC C O ', '  SCCCCC C S ', '  SCCCCC C S ', '   CCCCCCC   ', '   OOOOOOO   ', '    PPPPP    ', '    PP PP    ', '    PP PP    ', '    PP PP    ', '   OOO OOO   '];
  const palette: Record<string, string> = { H: armour ? '#bfc9cd' : '#4a3329', S: skin, K: outline, O: outline, C: cloth, P: '#443d40' };
  return <View style={{ width: 104, height: 112, transform: [{ scaleX: enemy ? -1 : 1 }, { rotate: pose === 'defeat' ? '70deg' : pose === 'dodge' ? '-20deg' : '0deg' }] }}>
    {pixels.flatMap((row, y) => [...row].map((cell, x) => cell !== ' ' ? <View key={`${x}:${y}`} style={{ position: 'absolute', left: x * 5 + 5, top: y * 5 + 18, width: 5, height: 5, backgroundColor: palette[cell] }} /> : null))}
    <View style={{ position: 'absolute', left: 65, top: 35, width: 9, height: weapon ? 45 : 22, backgroundColor: weapon ? '#d8e5e4' : skin, borderWidth: 2, borderColor: outline, transform: [{ rotate: pose === 'windup' ? '-35deg' : pose === 'attack' ? '90deg' : pose === 'block' ? '-70deg' : '15deg' }] }} />
    {weapon && <View style={{ position: 'absolute', left: 60, top: 72, width: 20, height: 5, backgroundColor: '#bd974c' }} />}
  </View>;
}
function Arena({ state }: { state: GameState }) {
  const duel = state.duel!, combat = duel.combat!; const motion = useSharedValue(0);
  useEffect(() => { if (!state.settings.reducedMotion) motion.value = withSequence(withTiming(15, { duration: 90 }), withTiming(0, { duration: 150 })); }, [combat.sequence, motion, state.settings.reducedMotion]);
  const playerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: motion.value }] }));
  const pose: Pose = duel.outcome === 'lost' ? 'defeat' : combat.phase === 'attack_timing' ? 'windup' : combat.phase === 'attack' ? combat.defence === 'dodge' ? 'dodge' : 'block' : combat.lastGrade ? 'attack' : 'idle';
  return <View accessibilityLabel={`${combat.practice ? 'Training yard' : duel.kind === 'brawl' ? 'Tavern courtyard' : 'Village arena'}. ${combat.archetype} opponent.`} style={{ height: 145, backgroundColor: combat.practice ? '#536a4e' : duel.kind === 'brawl' ? '#574137' : '#405d79', borderWidth: 3, borderColor: C.inkSoft, overflow: 'hidden', marginVertical: 8 }}>
    {[0, 1, 2, 3, 4].map((i) => <View key={i} style={{ position: 'absolute', left: i * 75 - 10, top: 30, width: 55, height: 85, backgroundColor: '#263e43', borderTopWidth: 8, borderColor: '#a69b81' }} />)}
    <View style={{ position: 'absolute', bottom: 0, height: 25, width: '100%', backgroundColor: '#827357', borderTopWidth: 5, borderColor: '#c8af75' }} />
    <Animated.View style={[{ position: 'absolute', bottom: 10, left: 24 }, playerStyle]}><Fighter weapon={combat.weaponId} armour={combat.armourId} pose={pose} /></Animated.View>
    <View style={{ position: 'absolute', right: 24, bottom: 10 }}><Fighter enemy weapon={duel.kind === 'duel' ? 'sword' : undefined} armour={combat.archetype === 'guard' || combat.archetype === 'veteran' ? 'mail' : undefined} pose={duel.outcome === 'won' ? 'defeat' : combat.phase === 'defence_timing' ? 'windup' : 'idle'} /></View>
    {combat.exposed && <PixelText font="pixel" size={8} color={C.charm} style={{ position: 'absolute', right: 12, top: 7 }}>OPENING!</PixelText>}
    {combat.lastGrade && <PixelText font="pixel" size={8} color={combat.lastGrade === 'miss' ? C.health : C.charm} style={{ position: 'absolute', left: 10, top: 7 }}>{combat.lastGrade.toUpperCase()}</PixelText>}
  </View>;
}
function TimingInput({ state, paused, onResolve }: { state: GameState; paused: boolean; onResolve: (offset: number) => void }) {
  const combat = state.duel!.combat!; const [countdown, setCountdown] = useState(3);
  const position = useSharedValue(-800), fired = useSharedValue(false), running = useSharedValue(false);
  const [width, setWidth] = useState(280); const windows = timingWindows(state);
  useEffect(() => {
    cancelAnimation(position); running.value = false; fired.value = false; position.value = -800; setCountdown(3);
    if (paused) return;
    const two = setTimeout(() => setCountdown(2), 400), one = setTimeout(() => setCountdown(1), 800);
    const start = setTimeout(() => {
      setCountdown(0); running.value = true;
      if (combat.assist) { fired.value = true; onResolve(0); return; }
      // This marker is the input clock, so OS reduced motion must not skip it.
      position.value = withTiming(800, { duration: 1600, easing: Easing.linear, reduceMotion: ReduceMotion.Never }, (finished) => {
        if (finished && !fired.value) { fired.value = true; running.value = false; runOnJS(onResolve)(10000); }
      });
    }, 1200);
    return () => { clearTimeout(two); clearTimeout(one); clearTimeout(start); running.value = false; cancelAnimation(position); };
  }, [combat.sequence, combat.assist, paused, onResolve, position, running, fired]);
  const gesture = Gesture.Tap().onTouchesDown(() => {
    if (!running.value || fired.value) return;
    fired.value = true; running.value = false; const offset = position.value; cancelAnimation(position); runOnJS(onResolve)(offset);
  });
  const marker = useAnimatedStyle(() => ({ transform: [{ translateX: ((position.value + 800) / 1600) * (width - 6) }] }));
  return <View style={{ marginTop: 8 }}><PixelText font="pixel" size={9} color={C.charm} style={{ textAlign: 'center', marginBottom: 8 }}>{paused ? 'PAUSED' : countdown ? `READY · ${countdown}` : 'TAP AT THE CENTRE'}</PixelText>
    <GestureDetector gesture={gesture}><View accessibilityRole="button" accessibilityLabel="Tap when the marker reaches the centre. Timing Assist is available in Me." onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: 70, backgroundColor: '#122d45', borderWidth: 2, borderColor: C.paleEdge, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: `${50 - windows.good / 16}%`, width: `${windows.good / 8}%`, height: 60, backgroundColor: '#486950' }} /><View style={{ position: 'absolute', left: `${50 - windows.perfect / 16}%`, width: `${windows.perfect / 8}%`, height: 60, backgroundColor: '#d7b356' }} /><Animated.View style={[{ width: 6, height: 64, backgroundColor: '#fff9e3' }, marker]} />
    </View></GestureDetector><PixelText font="body" size={15} color={C.creamBlue} style={{ marginTop: 5 }}>Green: good · Gold: perfect · One tap, no second roll.</PixelText></View>;
}
export function DuelModal({ state, onRespond, onClose }: Props) {
  const { dispatch } = useGame(); const { height } = useWindowDimensions();
  const [paused, setPaused] = useState(AppState.currentState !== 'active');
  useEffect(() => { const sub = AppState.addEventListener('change', (value) => setPaused(value !== 'active')); return () => sub.remove(); }, []);
  const duel = state.duel, combat = duel?.combat; const sequence = combat?.sequence ?? 0; const fightId = combat?.id;
  const resolve = useCallback((offsetMs: number) => { if (AppState.currentState === 'background' || AppState.currentState === 'inactive') return; haptic('light', state.settings.haptics); dispatch({ type: 'COMBAT_TIMING', fightId, sequence, offsetMs }); }, [dispatch, fightId, sequence, state.settings.haptics]);
  if (!duel || !combat) return null;
  const opponent = state.world.characters[duel.opponentId]; const timing = combat.phase === 'attack_timing' || combat.phase === 'defence_timing';
  const moves: (Defence | Attack)[] = combat.phase === 'defence' ? ['block', 'dodge', 'parry', 'brace'] : ['quick', 'heavy', 'feint', 'recover'];
  const hints: Record<Defence | Attack, string> = { block: 'Wide window; heavy blows can break through', dodge: 'Good timing avoids damage; armour costs stamina', parry: 'Perfect timing opens a powerful counter', brace: 'Free fallback; absorbs only a little damage', quick: 'Cheap, steady damage', heavy: 'Strong against an exposed opponent', feint: 'Weakens their next defence', recover: 'Give up the strike; restore 30 stamina' };
  return <ModalBackdrop zIndex={70}><ScrollView style={{ maxHeight: height - 65, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#0a2440', borderWidth: 3, borderColor: C.charm }} contentContainerStyle={{ padding: 12 }}>
    <PixelText font="pixel" size={10} color={C.charm}>{combat.practice ? 'THE TRAINING YARD' : duel.kind === 'duel' ? 'A DUEL' : 'A CLASH'}</PixelText><PixelText font="body" size={17} color={C.creamBlue}>{opponent?.name} · {combat.archetype} · Exchange {Math.min(duel.round, 8)}/8</PixelText>
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>{[{ name: 'THEE', vigour: duel.playerVigour, stamina: combat.playerStamina }, { name: 'OPPONENT', vigour: duel.opponentVigour, stamina: combat.opponentStamina }].map((fighter) => <View key={fighter.name} style={{ flex: 1 }}><PixelText font="pixel" size={7} color={C.cream}>{fighter.name} · {fighter.vigour}</PixelText><StatBar value={fighter.vigour} color={C.faith} dark={C.faithDark} height={10} /><PixelText font="body" size={14} color={C.creamBlue}>Stamina {fighter.stamina}</PixelText><StatBar value={fighter.stamina} color={C.charm} dark={C.charmDark} height={6} /></View>)}</View>
    <Arena state={state} />{duel.log.slice(-2).map((line, i) => <PixelText key={`${sequence}:${i}`} font="body" size={15} color={C.creamBlue} style={{ marginBottom: 4 }}>{line}</PixelText>)}
    {duel.outcome ? <><PixelText font="pixel" size={12} color={duel.outcome === 'won' ? C.faith : C.health} style={{ marginVertical: 12 }}>{duel.outcome === 'won' ? 'VICTORY' : duel.outcome === 'lost' ? 'DEFEAT' : 'YIELDED'}</PixelText><PixelText font="body" size={18} color={C.cream}>{duel.verdict}</PixelText><PixelButton bg={C.charm} shadow={C.charmDark} onPress={onClose} style={{ marginTop: 12 }} innerStyle={{ padding: 14 }}><PixelText font="pixel" size={9} color={C.blueDark}>{combat.practice ? 'LEAVE THE YARD' : 'CONTINUE'}</PixelText></PixelButton></> : <>
      <PixelText font="body" size={19} color={C.cream} style={{ marginVertical: 8 }}>{combat.phase.startsWith('defence') ? duelTelegraph(state) : combat.exposed ? 'An opening! Choose how to exploit it.' : 'Your turn to strike — or catch your breath.'}</PixelText>
      {timing ? <TimingInput state={state} paused={paused} onResolve={resolve} /> : <View style={{ gap: 7 }}>{moves.map((move) => { const reason = combatChoiceReason(state, move); return <PixelButton key={move} bg={C.lightFill} shadow={C.paleEdge} disabled={!!reason || paused} onPress={() => dispatch({ type: 'COMBAT_SELECT', fightId, sequence, move })} innerStyle={{ padding: 11, minHeight: 48 }}><PixelText font="pixel" size={8} color={C.blueDark}>{move.toUpperCase()} · {combatCost(state, move)} STAMINA</PixelText><PixelText font="body" size={15} color={reason ? C.bad : C.blue}>{reason ?? hints[move]}</PixelText></PixelButton>; })}<PixelButton bg="#432d32" shadow={C.healthDark} disabled={paused} onPress={() => onRespond('yield')} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="pixel" size={8} color={C.health}>YIELD</PixelText></PixelButton></View>}
    </>}
  </ScrollView></ModalBackdrop>;
}
