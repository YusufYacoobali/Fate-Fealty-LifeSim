import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import type { PixelLottieProps } from './PixelLottie';

/** Local SVG renderer: no remote animation files, CDN or WASM download. */
export function PixelLottie({ source, trigger, reducedMotion, active = true, stillProgress = 0 }: PixelLottieProps) {
  const container = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);
  const played = useRef(0);
  useEffect(() => {
    if (!container.current) return;
    const instance = lottie.loadAnimation({ container: container.current, renderer: 'svg', loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(source)), rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
    instance.setSubframe(false);
    animation.current = instance;
    played.current = 0;
    return () => { instance.destroy(); animation.current = null; };
  }, [source]);
  useEffect(() => {
    const instance = animation.current;
    if (!instance) return;
    if (!active) { played.current = trigger; instance.goToAndStop(stillProgress * (instance.totalFrames - 1), true); return; }
    if (reducedMotion || !trigger) { played.current = trigger; instance.goToAndStop(stillProgress * (instance.totalFrames - 1), true); }
    else if (played.current !== trigger) { played.current = trigger; instance.goToAndPlay(0, true); }
  }, [source, trigger, reducedMotion, active, stillProgress]);
  return <div ref={container} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
}
