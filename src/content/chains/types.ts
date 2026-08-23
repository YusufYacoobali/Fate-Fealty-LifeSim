import { ContentDomain, Effects, Tone } from '@/types/game';

export interface BeatChoice {
  id: string;
  label: string;
  /** What actually happened. Never a summary of how the player feels about it. */
  text: string;
  effects: Effects;
  tone?: Tone;
  costGold?: number;
}

export interface Beat {
  /**
   * Load-bearing: resolving an event writes its title into world history as a
   * cause, and the next beat is gated on that exact string. Titles must stay
   * unique across the whole registry.
   */
  title: string;
  text: string;
  choices: BeatChoice[];
}

export interface ChainSpec {
  id: string;
  domain: ContentDomain;
  minAge: number;
  beats: Beat[];
}
