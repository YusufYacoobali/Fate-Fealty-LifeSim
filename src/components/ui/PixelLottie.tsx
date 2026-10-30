import React, { useEffect, useRef, useState } from 'react';
import LottieView from 'lottie-react-native';
import { Platform, StyleSheet, View } from 'react-native';

export interface PixelLottieProps {
  source: React.ComponentProps<typeof LottieView>['source'];
  /** Increment only after a real event; zero shows the resting frame. */
  trigger: number;
  reducedMotion: boolean;
  active?: boolean;
  stillProgress?: number;
  onFinish?: () => void;
}

const sourceKeys = new WeakMap<object, number>();
let nextSourceKey = 0;
function sourceKey(source: PixelLottieProps['source']) {
  if (typeof source !== 'object' || source === null) return String(source);
  if (!sourceKeys.has(source)) sourceKeys.set(source, ++nextSourceKey);
  return sourceKeys.get(source);
}

export function PixelLottie(props: PixelLottieProps) {
  // A new composition gets its own native view and load event. An old Android
  // composition must never consume the play command intended for the next one.
  return <LoadedPixelLottie key={sourceKey(props.source)} {...props} />;
}

function LoadedPixelLottie({ source, trigger, reducedMotion, active = true, stillProgress = 0, onFinish }: PixelLottieProps) {
  const ref = useRef<LottieView>(null);
  const [loaded, setLoaded] = useState(false);
  const played = useRef(0);
  const handleLayout = () => {
    // iOS decodes inline JSON synchronously in setSourceJson, before layout.
    // Fabric can drop its load event before the event emitter is attached.
    // Layout is therefore a second readiness signal for bundled JSON only;
    // Android and asynchronous URI sources must still wait for the load event.
    if (Platform.OS === 'ios' && typeof source === 'object' && source !== null && 'layers' in source) {
      setLoaded(true);
    }
  };
  useEffect(() => {
    if (!active || reducedMotion || !trigger) played.current = trigger;
    if (!loaded) return;
    if (!active || reducedMotion || !trigger) { played.current = trigger; ref.current?.pause(); return; }
    if (played.current !== trigger) {
      played.current = trigger;
      if (typeof source === 'object' && source !== null && 'op' in source) {
        // Android play(0) without an end frame resumes at its previous position.
        // Supplying both bounds restarts repeated strikes from their first frame.
        ref.current?.play(Number(source.ip ?? 0), Math.max(0, Math.ceil(Number(source.op)) - 1));
      } else {
        ref.current?.reset(); ref.current?.play();
      }
    }
    // React can tear down and re-run effects without unmounting the view.
    return () => { ref.current?.pause(); played.current = 0; };
  }, [source, trigger, reducedMotion, active, loaded]);
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <LottieView ref={ref} source={source} loop={false} autoPlay={false} onLayout={handleLayout} onAnimationLoaded={() => setLoaded(true)} onAnimationFinish={(cancelled) => { if (!cancelled && active && !reducedMotion) onFinish?.(); }} progress={!active || reducedMotion || !trigger ? stillProgress : undefined} resizeMode="contain" style={StyleSheet.absoluteFill} />
  </View>;
}
