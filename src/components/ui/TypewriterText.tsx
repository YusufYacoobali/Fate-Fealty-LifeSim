import React, { useEffect, useRef, useState } from 'react';
import { TextStyle, View } from 'react-native';
import { PixelText } from './PixelText';

interface Props {
  text: string;
  font?: 'pixel' | 'body';
  size?: number;
  color?: string;
  style?: TextStyle;
  /** Colour of the trailing cursor while the line is still being written. */
  cursorColor?: string;
  /** Show the whole line at once (reduced motion, or the player tapped through). */
  instant?: boolean;
  onDone?: () => void;
}

/** How fast the quill moves, and the ceiling on how long any line may take. */
export const CHARS_PER_SECOND = 55;
export const MAX_DURATION_MS = 2600;

/** Below this the timer stops being reliable and starts costing frames. */
export const MIN_TICK_MS = 16;

export interface RevealPacing {
  /** Letters added per tick. */
  step: number;
  /** Milliseconds between ticks. */
  tickMs: number;
  /** How long the whole line will take to write. */
  durationMs: number;
}

/**
 * Pacing for one passage.
 *
 * The cadence is set by the tick interval, not by revealing several letters at
 * once: an ordinary line writes a single letter at a time at the stated speed.
 * Only when a line is long enough that a one-letter cadence would need an
 * unreasonably fast timer does the step grow — which is also what keeps any
 * passage, however wordy, inside `MAX_DURATION_MS`.
 */
export function revealPacing(length: number): RevealPacing {
  if (length <= 0) return { step: 1, tickMs: MIN_TICK_MS, durationMs: 0 };
  const naturalMs = (length / CHARS_PER_SECOND) * 1000;
  const durationMs = Math.min(MAX_DURATION_MS, naturalMs);
  const idealTickMs = durationMs / length;
  const step = Math.max(1, Math.ceil(MIN_TICK_MS / idealTickMs));
  return { step, tickMs: Math.max(MIN_TICK_MS, idealTickMs * step), durationMs };
}

/**
 * Writes a line out a few letters at a time, like a chronicle being set down as
 * it happens.
 *
 * Two details matter more than the effect itself. The full text is rendered
 * invisibly underneath as a layout placeholder, so the panel does not grow line
 * by line and shove the choices around; and long passages speed up rather than
 * running on, so no event can hold the player hostage.
 */
export function TypewriterText({ text, font = 'body', size = 18, color, style, cursorColor, instant = false, onDone }: Props) {
  const [shown, setShown] = useState(instant ? text.length : 0);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    if (instant || text.length === 0) {
      setShown(text.length);
      doneRef.current = true;
      onDone?.();
      return;
    }

    setShown(0);
    const { step, tickMs } = revealPacing(text.length);

    const timer = setInterval(() => {
      setShown((current) => {
        const next = current + step;
        if (next >= text.length) {
          clearInterval(timer);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
          return text.length;
        }
        return next;
      });
    }, tickMs);

    return () => clearInterval(timer);
    // onDone is a stable callback from the caller; re-running on it would restart
    // the animation every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, instant]);

  const writing = shown < text.length;

  return (
    <View>
      {/* Invisible full text: reserves the final height so nothing jumps. */}
      <PixelText font={font} size={size} color={color} style={{ ...style, opacity: 0 }}>
        {text}
      </PixelText>
      <PixelText
        font={font}
        size={size}
        color={color}
        style={{ ...style, position: 'absolute', top: 0, left: 0, right: 0 }}
      >
        {text.slice(0, shown)}
        {writing ? <PixelText font={font} size={size} color={cursorColor ?? color}>▌</PixelText> : null}
      </PixelText>
    </View>
  );
}
