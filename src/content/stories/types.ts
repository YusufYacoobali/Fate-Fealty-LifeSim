import { Effects, Tone } from '@/types/game';

export interface StoryChoice {
  id: string;
  label: string;
  text: string;
  effects: Effects;
  tone?: Tone;
  costGold?: number;
}

export interface StoryNode {
  title: string;
  text: string;
  choices: StoryChoice[];
}

/**
 * Copy for one persistent story, keyed by the suffix of its event id.
 *
 * Flagship stories use `1 2 3 4_bold 4_cautious 4_family 5 6_reconciled
 * 6_hard`; role stories `1 2 3 4 5_duty 5_ambition`; relationship stories
 * `1 2 3 4 5_mend 5_break`; domain stories `1 2 3 4 5_reconciled 5_hard`.
 *
 * The beat that carries a branch MUST set the story variable its transition
 * reads (`approach` on flagship beat 3, `resolution` on every final decision) —
 * see `persistentStories.ts`. A missing variable silently takes the default
 * branch, which is how a story quietly loses half its content.
 */
export type StoryCopy = Record<string, StoryNode>;
