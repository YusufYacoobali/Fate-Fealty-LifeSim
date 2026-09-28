import { scheduleOnRN } from 'react-native-worklets';
import { PixelLottie } from '../ui/PixelLottie';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { cancelAnimation, Easing, ReduceMotion, useReducedMotion, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { GameState } from '@/types/game';
import { Attack, Defence } from '@/types/rpg';
import { DUEL_MAX_ROUNDS, SOLO_PRACTICE_SWINGS, combatChoiceReason, combatCost, duelTelegraph, timingWindows } from '@/engine/duelEngine';
import { combatPresentation } from '@/engine/combatPresentation';
import { useGame } from '@/state/GameContext';
import { haptic } from '@/services/haptics';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { StatBar } from '../ui/StatBar';

interface Props { state: GameState; onRespond: (id: string) => void; onClose: () => void }
const scenes = {
  idle: require('../../../assets/animations/pixel-combat-idle.json'),
  strike: require('../../../assets/animations/pixel-combat-strike.json'),
  block: require('../../../assets/animations/pixel-combat-block.json'),
  dodge: require('../../../assets/animations/pixel-combat-dodge.json'),
  hurt: require('../../../assets/animations/pixel-combat-hurt.json'),
  miss: require('../../../assets/animations/pixel-combat-miss.json'),
  victory: require('../../../assets/animations/pixel-combat-victory.json'),
  heavy: require('../../../assets/animations/pixel-combat-heavy.json'),
  feint: require('../../../assets/animations/pixel-combat-feint.json'),
  parry: require('../../../assets/animations/pixel-combat-parry.json'),
  recover: require('../../../assets/animations/pixel-combat-recover.json'),
  defeat: require('../../../assets/animations/pixel-combat-defeat.json'),
};
const soloScenes: Partial<typeof scenes> = {
  idle: require('../../../assets/animations/pixel-solo-idle.json'),
  strike: require('../../../assets/animations/pixel-solo-strike.json'),
  heavy: require('../../../assets/animations/pixel-solo-heavy.json'),
  feint: require('../../../assets/animations/pixel-solo-feint.json'),
  miss: require('../../../assets/animations/pixel-solo-miss.json'),
};
function Arena({ state, active }: { state: GameState; active: boolean }) {
  const duel = state.duel!, combat = duel.combat!;
  const systemReducedMotion = useReducedMotion();
  const cue = combatPresentation(duel), action = cue.scene;
  const reducedMotion = !!state.settings.reducedMotion || systemReducedMotion;
  const camera = useSharedValue(0), pop = useSharedValue(0);
  const previousImpact = useRef(combat.impactId ?? 0);
  useEffect(() => {
    cancelAnimation(camera); cancelAnimation(pop); camera.set(0); pop.set(0);
    const fresh = previousImpact.current !== combat.impactId;
    previousImpact.current = combat.impactId ?? 0;
    if (!active || reducedMotion || !combat.impactId || !fresh) return;
    const impactMs = action === 'heavy' ? 350 : action === 'feint' ? 400 : 250;
    pop.set(withDelay(impactMs, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })));
    if (!['idle', 'dodge', 'miss', 'recover'].includes(action)) {
      const amount = action === 'heavy' || action === 'victory' ? 5 : 3;
      camera.set(withDelay(impactMs, withSequence(withTiming(-amount, { duration: 40 }), withTiming(amount, { duration: 45 }), withTiming(-amount / 2, { duration: 45 }), withTiming(0, { duration: 70 }))));
    }
    const timer = setTimeout(() => haptic(action === 'heavy' || action === 'victory' ? 'heavy' : action === 'parry' ? 'success' : 'medium', state.settings.haptics), impactMs);
    return () => { clearTimeout(timer); cancelAnimation(camera); cancelAnimation(pop); };
  }, [combat.impactId, active, reducedMotion, action, camera, pop, state.settings.haptics]);
  const cameraStyle = useAnimatedStyle(() => ({ transform: [{ translateX: camera.get() }, { scale: 1.025 }] }));
  const damageStyle = useAnimatedStyle(() => ({ opacity: pop.get() === 0 ? 0 : pop.get() > .8 ? (1 - pop.get()) * 5 : 1, transform: [{ translateY: -pop.get() * 30 }, { scale: pop.get() < .25 ? .9 + pop.get() * 2 : 1.4 - (pop.get() - .25) * .4 }] }));
  return <View style={{ borderWidth: 3, borderColor: '#b4783b', marginVertical: 10, backgroundColor: '#271e25' }}>
    <View accessibilityLabel={combat.solo ? 'Solo sword practice in the village yard' : combat.practice ? 'Practice in the village yard' : 'Blue fighter faces the red challenger in the village yard'} style={{ width: '100%', aspectRatio: 320 / 208, overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFill, cameraStyle]}>
        <Image source={require('../../../assets/generated/combat-yard-pixel.png')} resizeMode="stretch" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} accessible={false} />
        <PixelLottie source={combat.solo ? soloScenes[action] ?? soloScenes.idle : scenes[action]} trigger={combat.impactId ?? 0} active={active} stillProgress={['victory', 'defeat'].includes(action) ? 1 : 0} reducedMotion={reducedMotion} />
      </Animated.View>
      {!reducedMotion && cue.detail && <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: cue.defending || action === 'recover' ? '9%' : '62%', top: '38%' }, damageStyle]}><PixelText font="pixel" size={13} color={cue.defending && combat.lastDamage ? '#ffb198' : '#fff2c9'} style={{ textShadowColor: '#101a2a', textShadowRadius: 1, textShadowOffset: { width: 2, height: 2 } }}>{cue.detail}</PixelText></Animated.View>}
    </View>
    <View accessibilityLiveRegion="polite" style={{ padding: 8, backgroundColor: '#352830', gap: 5 }}><PixelText font="pixel" size={8} color="#f4c57b">{cue.label}{cue.detail ? `  ${cue.detail}` : ''}</PixelText>{combat.lastGrade === 'perfect' && <PixelText font="pixel" size={7} color="#b5e8e8">{combat.exposed ? 'PERFECT · COUNTER NOW!' : 'PERFECT TIMING'}</PixelText>}</View>
  </View>;
}
/** One UI-thread clock for the marker and every tap across the full backdrop. */
function useTimingInput(state: GameState, paused: boolean, onResolve: (offset: number) => void) {
  const combat = state.duel?.combat;
  const timing = combat?.phase === 'attack_timing' || combat?.phase === 'defence_timing';
  const [ready, setReady] = useState(false), [width, setWidth] = useState(280);
  const position = useSharedValue(-800), armed = useSharedValue(false);
  const windows = timingWindows(state);
  useEffect(() => {
    cancelAnimation(position); armed.set(false); position.set(-800); setReady(false);
    if (!timing || paused) return;
    const start = setTimeout(() => {
      setReady(true); armed.set(true);
      position.set(withTiming(800, { duration: 1600, easing: Easing.linear, reduceMotion: ReduceMotion.Never }, finished => {
        if (finished && armed.get()) { armed.set(false); scheduleOnRN(onResolve, 10000); }
      }));
    }, 350);
    return () => { clearTimeout(start); armed.set(false); cancelAnimation(position); };
  }, [combat?.sequence, timing, paused, onResolve, position, armed]);
  const gesture = Gesture.Tap().enabled(timing && !paused).onTouchesDown(() => {
    if (!armed.get()) return;
    armed.set(false); const offset = position.get(); cancelAnimation(position); scheduleOnRN(onResolve, offset);
  });
  const accessibleTap = () => { if (armed.get()) { armed.set(false); const offset = position.get(); cancelAnimation(position); onResolve(offset); } };
  const marker = useAnimatedStyle(() => ({ transform: [{ translateX: (position.get() + 800) / 1600 * width - 3 }] }));
  const bar = <View style={{ marginTop: 8 }}>
    <PixelText font="pixel" size={9} color="#f4c57b" style={{ textAlign: 'center', marginBottom: 8 }}>{paused ? 'PAUSED' : ready ? 'TAP ANYWHERE' : 'READY…'}</PixelText>
    <Pressable accessibilityRole="button" accessibilityLabel="Time your move. Tap anywhere when the marker reaches gold, or activate this button." onPress={accessibleTap} style={{ paddingVertical: 8 }}>
      <View onLayout={e => setWidth(Math.max(0, e.nativeEvent.layout.width - 4))} style={{ height: 42, backgroundColor: '#141722', borderWidth: 2, borderColor: '#687887', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: `${50 - windows.good / 16}%`, width: `${windows.good / 8}%`, height: '100%', backgroundColor: '#8c6227' }} />
        <View style={{ position: 'absolute', left: `${50 - windows.perfect / 16}%`, width: `${windows.perfect / 8}%`, height: '100%', backgroundColor: '#f3c76d' }} />
        <Animated.View style={[{ width: 6, height: 38, backgroundColor: '#fffaf0' }, marker]} />
      </View>
    </Pressable>
    <PixelText font="body" size={16} color="#efd6b0">Gold centre: perfect · Amber: good. One tap per move.</PixelText>
  </View>;
  return { gesture, bar };
}
export function DuelModal({ state, onRespond, onClose }: Props) {
  const { dispatch } = useGame(); const { height } = useWindowDimensions();
  const [paused, setPaused] = useState(AppState.currentState !== 'active');
  useEffect(() => { const sub = AppState.addEventListener('change', (value) => setPaused(value !== 'active')); return () => sub.remove(); }, []);
  const duel = state.duel, combat = duel?.combat; const sequence = combat?.sequence ?? 0; const fightId = combat?.id;
  const resolve = useCallback((offsetMs: number) => { if (AppState.currentState === 'background' || AppState.currentState === 'inactive') return; dispatch({ type: 'COMBAT_TIMING', fightId, sequence, offsetMs }); }, [dispatch, fightId, sequence]);
  const input = useTimingInput(state, paused, resolve);
  if (!duel || !combat) return null;
  const opponent = state.world.characters[duel.opponentId]; const timing = combat.phase === 'attack_timing' || combat.phase === 'defence_timing';
  const moves: (Defence | Attack)[] = combat.solo ? ['quick', 'heavy', 'feint'] : combat.phase === 'defence' ? ['block', 'dodge', 'parry', 'brace'] : ['quick', 'heavy', 'feint', 'recover'];
  const hints: Record<Defence | Attack, string> = { block: 'Wide window; heavy blows can break through', dodge: 'Good timing avoids damage; armour costs stamina', parry: 'Perfect timing opens a powerful counter', brace: 'Free fallback; absorbs only a little damage', quick: 'Cheap, steady damage', heavy: 'Strong against an exposed opponent', feint: 'Weakens their next defence', recover: 'Give up the strike; restore 30 stamina' };
  if (combat.solo) Object.assign(hints, { quick: 'A short, clean cut', heavy: 'A full sweeping strike', feint: 'A false start, then a quick cut' });
  return <ModalBackdrop zIndex={70} gesture={input.gesture}><ScrollView scrollEnabled={!timing} style={{ maxHeight: height - 65, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#271e25', borderWidth: 3, borderColor: '#b4783b' }} contentContainerStyle={{ padding: 12 }}>
    <PixelText font="pixel" size={10} color={C.charm}>{combat.solo ? 'SOLO SWORD PRACTICE' : combat.practice ? 'THE TRAINING YARD' : duel.kind === 'duel' ? 'A DUEL' : 'A CLASH'}</PixelText><PixelText font="body" size={17} color={C.creamBlue}>{combat.solo ? `${combat.solo.completed}/${SOLO_PRACTICE_SWINGS} swings${duel.outcome ? "" : " · Finish for 6 Arms XP"}` : `${opponent?.name} · ${combat.archetype} · Exchange ${Math.min(duel.round, DUEL_MAX_ROUNDS)}/${DUEL_MAX_ROUNDS}`}</PixelText>
    {!combat.solo && <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>{[{ name: 'THEE', vigour: duel.playerVigour, stamina: combat.playerStamina }, { name: 'OPPONENT', vigour: duel.opponentVigour, stamina: combat.opponentStamina }].map((fighter) => <View key={fighter.name} style={{ flex: 1 }}><PixelText font="pixel" size={7} color={C.cream}>{fighter.name} · {fighter.vigour}</PixelText><StatBar value={fighter.vigour} color={C.faith} dark={C.faithDark} height={10} /><PixelText font="body" size={14} color={C.creamBlue}>Stamina {fighter.stamina}</PixelText><StatBar value={fighter.stamina} color={C.charm} dark={C.charmDark} height={6} /></View>)}</View>}
    {duel.stakes && <PixelText font="body" size={16} color="#f4c57b">{duel.stakes.summary}</PixelText>}
    <Arena state={state} active={!paused} />{duel.log.slice(-2).map((line, i) => <PixelText key={`${sequence}:${i}`} font="body" size={15} color={C.creamBlue} style={{ marginBottom: 4 }}>{line}</PixelText>)}
    {duel.outcome ? <><PixelText font="pixel" size={12} color={duel.outcome === 'won' ? C.faith : C.health} style={{ marginVertical: 12 }}>{combat.solo ? 'PRACTICE COMPLETE' : duel.outcome === 'won' ? 'VICTORY' : duel.outcome === 'lost' ? 'DEFEAT' : 'YIELDED'}</PixelText><PixelText font="body" size={18} color={C.cream}>{duel.verdict}</PixelText><PixelButton bg={C.charm} shadow={C.charmDark} onPress={onClose} style={{ marginTop: 12 }} innerStyle={{ padding: 14 }}><PixelText font="pixel" size={9} color={C.blueDark}>{combat.practice ? 'LEAVE THE YARD' : 'CONTINUE'}</PixelText></PixelButton></> : <>
      <PixelText font="body" size={19} color={C.cream} style={{ marginVertical: 8 }}>{combat.solo ? 'Choose a swing, then tap anywhere as the marker reaches gold.' : combat.phase.startsWith('defence') ? duelTelegraph(state) : combat.exposed ? 'An opening! Choose how to exploit it.' : 'Your turn to strike — or catch your breath.'}</PixelText>
      {timing ? input.bar : <View style={{ gap: 7, flexDirection: 'row', flexWrap: 'wrap' }}>{moves.map((move) => { const reason = combatChoiceReason(state, move); return <PixelButton style={{ width: '48.5%' }} key={move} bg={C.lightFill} shadow={C.paleEdge} disabled={!!reason || paused} onPress={() => dispatch({ type: 'COMBAT_SELECT', fightId, sequence, move })} innerStyle={{ padding: 9, minHeight: 90 }}><PixelText font="pixel" size={7} color={C.blueDark}>{move.toUpperCase()}{!combat.solo && ` · ${combatCost(state, move)} STAMINA`}</PixelText><PixelText font="body" size={15} color={reason ? C.bad : C.blue}>{reason ?? hints[move]}</PixelText></PixelButton>; })}{!combat.solo && <PixelButton style={{ width: '100%' }} bg="#432d32" shadow={C.healthDark} disabled={paused} onPress={() => onRespond('yield')} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="pixel" size={8} color={C.health}>YIELD</PixelText></PixelButton>}</View>}
      {combat.solo && <PixelButton bg={C.lightFill} shadow={C.paleEdge} disabled={paused} onPress={() => dispatch({ type: 'ARMS_PRACTICE_FINISH', fightId: combat.id })} style={{ marginTop: 10 }} innerStyle={{ padding: 12, minHeight: 44 }}><PixelText font="body" size={17} color={C.blueDark}>Quick finish · earn 6 XP</PixelText></PixelButton>}
    </>}
  </ScrollView></ModalBackdrop>;
}
