import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

export interface PixelLottieProps {
  source: React.ComponentProps<typeof LottieView>['source'];
  /** Increment only after a real event; zero shows the resting frame. */
  trigger: number;
  reducedMotion: boolean;
  active?: boolean;
  stillProgress?: number;
}

export function PixelLottie({ source, trigger, reducedMotion, active = true, stillProgress = 0 }: PixelLottieProps) {
  const ref = useRef<LottieView>(null);
  const played = useRef(0);
  useEffect(() => {
    if (!active || reducedMotion || !trigger) { played.current = trigger; ref.current?.pause(); return; }
    if (played.current !== trigger) { played.current = trigger; ref.current?.play(0); }
    // React can tear down and re-run effects without unmounting the view.
    return () => { ref.current?.pause(); played.current = 0; };
  }, [source, trigger, reducedMotion, active]);
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <LottieView ref={ref} source={source} loop={false} autoPlay={false} progress={!active || reducedMotion || !trigger ? stillProgress : undefined} resizeMode="contain" style={StyleSheet.absoluteFill} />
  </View>;
}
