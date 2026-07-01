/**
 * Core type system for the Fate & Fealty engine.
 *
 * Design rule (from the engine spec): only FOUR stats are ever visible to the
 * player — health, charm, wits, faith. Everything else that gives the game depth
 * (path progress, reputation, memories, tags, active story arcs) is HIDDEN state
 * that quietly steers which events fire and how the life unfolds.
 */

// ---------------------------------------------------------------------------
// Stats & ranks
// ---------------------------------------------------------------------------

export type StatKey = 'health' | 'charm' | 'wits' | 'faith';

export type Stats = Record<StatKey, number>;

/** The visible class ladder. Index in RANKS == rankIdx in GameState. */
export type RankKey = 'Peasant' | 'Squire' | 'Knight' | 'Noble';

/**
 * Hidden "life paths". A peasant slowly accrues progress along several of these
 * at once; the dominant path colours which events the Life Director offers and
 * which endings/death causes become possible.
 */
export type PathKey =
  | 'martial' // the road of arms -> knighthood
  | 'court' // charm, scheming, nobility
  | 'church' // faith, the cloister
  | 'labour' // honest peasant toil
  | 'outlaw'; // crime, banditry, the noose

export type PathProgress = Record<PathKey, number>;

export const PATH_KEYS: PathKey[] = ['martial', 'court', 'church', 'labour', 'outlaw'];

// ---------------------------------------------------------------------------
// Difficulty
// ---------------------------------------------------------------------------

export type Difficulty = 'Merciful' | 'Normal' | 'Brutal';

// ---------------------------------------------------------------------------
// Feed (the visible life log)
// ---------------------------------------------------------------------------

export type Tone = 'good' | 'bad' | 'plain';

export interface FeedEntry {
  id: number;
  age: number;
  tag: string;
  tagColor?: string;
  text: string;
  tone: Tone;
  traitId?: string;
}

// ---------------------------------------------------------------------------
// Memories & tags (hidden depth)
// ---------------------------------------------------------------------------

/** A remembered moment. Tags let later events reference the player's history. */
export interface Memory {
  id: number;
  age: number;
  tag: string; // e.g. "betrayed_friend", "won_tourney"
  weight: number; // how strongly it colours future events
  note?: string;
}

// ---------------------------------------------------------------------------
// Traits & perks
// ---------------------------------------------------------------------------

/**
 * A character trait. BIRTH traits are rolled at the start of a life and tweak
 * starting stats; ACQUIRED traits are earned during play from the player's
 * history. Both can carry passive modifiers (success-roll bonus, aging rate)
 * and are mirrored as a `trait_<id>` tag so events can gate on them.
 */
export interface TraitDef {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  kind: 'birth' | 'acquired';
  /** Flat starting-stat shifts (birth traits only). */
  startStats?: Partial<Stats>;
  /** Added to a choice's success chance (e.g. +0.08 for Born Lucky). */
  rollBonus?: number;
  /** Multiplies old-age attrition (e.g. 1.4 Sickly, 0.8 Hale). */
  agingMultiplier?: number;
  /** Acquired traits are granted the first year this predicate holds. */
  earnedWhen?: (s: GameState) => boolean;
}

// ---------------------------------------------------------------------------
// Kin (family, spouse, children, friends, foes)
// ---------------------------------------------------------------------------

export type KinKind = 'mother' | 'father' | 'sibling' | 'spouse' | 'child' | 'friend' | 'foe' | 'liege';

export interface KinMember {
  id: string;
  name: string;
  role: string;
  emoji: string;
  rel: number; // 0..100 relationship
  age: number;
  trait: string;
  bio: string;
  kind: KinKind;
  alive: boolean;
  isHeir?: boolean;
}

/**
 * A request to add a new kin member. Only `kind` is required; the kin factory
 * fills sensible, randomised defaults (name, emoji, trait, bio, starting bond)
 * for anything left unspecified, so content stays terse.
 */
export interface NewKinSpec {
  kind: KinKind;
  name?: string;
  role?: string;
  emoji?: string;
  trait?: string;
  bio?: string;
  rel?: number;
  age?: number;
  isHeir?: boolean;
}

// ---------------------------------------------------------------------------
// Effects & conditions (the data language events are written in)
// ---------------------------------------------------------------------------

export interface Effects {
  health?: number;
  charm?: number;
  wits?: number;
  faith?: number;
  gold?: number;
  /** Progress toward the next rank (0..100 scale, applied to rankProgress). */
  rankProgress?: number;
  /** Hidden reputation shift (-100..100). */
  reputation?: number;
  /** Hidden path progress to add. */
  path?: Partial<PathProgress>;
  addTags?: string[];
  removeTags?: string[];
  /** Record a hidden memory. */
  memory?: { tag: string; weight?: number; note?: string };
  /** Shift a specific kin member's relationship. */
  kinRel?: { id: string; delta: number };
  /** Add one or more new kin members (spouse, child, etc.). */
  addKin?: NewKinSpec | NewKinSpec[];
  /** Mark a kin member (by id or kind) as deceased. */
  killKin?: string;
  /** Force an immediate promotion / demotion regardless of normal progress. */
  promote?: boolean;
  demote?: boolean;
  /** Kill the player. The string is the cause of death. */
  death?: string;
  /** Lighter consequences that get recorded as tags + memories. */
  prison?: boolean;
  exile?: boolean;
}

export interface Condition {
  minAge?: number;
  maxAge?: number;
  minGold?: number;
  maxGold?: number;
  rankAtLeast?: number; // compares to rankIdx
  rankAtMost?: number;
  statAtLeast?: Partial<Stats>;
  statAtMost?: Partial<Stats>;
  hasTags?: string[];
  missingTags?: string[];
  hasTraits?: string[];
  minReputation?: number;
  maxReputation?: number;
  pathAtLeast?: Partial<PathProgress>;
  /** Escape hatch for one-off logic. */
  custom?: (s: GameState) => boolean;
}

// ---------------------------------------------------------------------------
// Events & the story graph
// ---------------------------------------------------------------------------

/** Result of a single choice (or one branch of a success/failure choice). */
export interface Outcome {
  text: string;
  effects?: Effects;
  tag?: string; // feed tag, e.g. "CHOICE"
  tagColor?: string;
  tone?: Tone;
  /**
   * Continue a multi-popup story: the id of the next GameEvent node.
   * `nextWhen` controls whether it opens immediately or waits for next age-up.
   */
  next?: string;
  nextWhen?: 'now' | 'nextYear';
}

export interface Choice {
  label: string;
  hint?: string;
  /** Only show this choice when the condition holds. */
  requires?: Condition;
  /** Gold required to pick this choice (shown greyed/blocked if unaffordable). */
  costGold?: number;
  /**
   * If set, the choice rolls success vs failure. Number in 0..1, or a function
   * of the current state (e.g. higher wits -> better odds).
   */
  successChance?: number | ((s: GameState) => number);
  success?: Outcome;
  failure?: Outcome;
  /** For deterministic choices with no roll. */
  outcome?: Outcome;
}

export type EventCategory =
  | 'child'
  | 'peasant'
  | 'court'
  | 'knight'
  | 'noble'
  | 'faith'
  | 'family'
  | 'plague'
  | 'war'
  | 'arc';

export interface GameEvent {
  id: string;
  category: EventCategory;
  /** Part of a multi-node story arc (shares an arc id). */
  arc?: string;
  title: string;
  text: string | ((s: GameState) => string);
  tagColor?: string;
  ageMin?: number;
  ageMax?: number;
  /** Restrict to certain dominant paths. */
  paths?: PathKey[];
  /** Restrict to certain ranks (by key). */
  ranks?: RankKey[];
  requires?: Condition;
  /** Selection weight for the random picker (default 1). */
  weight?: number;
  /** If true, can fire at most once per life. */
  once?: boolean;
  /** Internal arc nodes are never picked by the random picker. */
  arcNodeOnly?: boolean;
  choices: Choice[];
}

/** A story arc that is mid-flight, waiting to continue on a later age-up. */
export interface ActiveArc {
  arc: string;
  nextNodeId: string;
  startedAge: number;
}

// ---------------------------------------------------------------------------
// Activities, shop, settings
// ---------------------------------------------------------------------------

export type ActivityCategory = 'leisure' | 'work' | 'faith' | 'martial' | 'crime' | 'health';

export interface ActivityDef {
  id: string;
  cat: ActivityCategory;
  name: string;
  icon: string;
  iconBg: string;
  desc: string;
}

export type ShopItemType = 'consumable' | 'perm';

export interface ShopItem {
  id: string;
  name: string;
  short: string;
  icon: string;
  iconBg: string;
  price: number;
  type: ShopItemType;
  eff: Effects;
  desc: string;
}

export interface GameSettings {
  autoScroll: boolean;
  difficulty: Difficulty;
  permadeath: boolean;
  haptics: boolean;
}

export type Tab = 'life' | 'do' | 'kin' | 'shop' | 'me';

// ---------------------------------------------------------------------------
// The full game state
// ---------------------------------------------------------------------------

export interface GameState {
  // --- identity ---
  first: string;
  epithet: string;

  // --- core visible ---
  age: number;
  gold: number;
  income: number;
  expenses: number;
  rankIdx: number; // index into RANKS
  stats: Stats;

  // --- hidden depth ---
  rankProgress: number; // 0..100 toward the next rank
  reputation: number; // -100..100
  paths: PathProgress;
  tags: string[];
  traits: string[]; // trait ids (birth + acquired)
  memories: Memory[];
  activeArcs: ActiveArc[];
  firedOnce: string[]; // ids of `once` events already seen

  // --- relationships ---
  kin: KinMember[];

  // --- possessions ---
  inventory: string[];

  // --- log ---
  feed: FeedEntry[];

  // --- transient UI ---
  tab: Tab;
  selectedKinId: string | null;
  settingsOpen: boolean;
  event: GameEvent | null;

  // --- life goal (assigned at coming-of-age) ---
  goalId: string | null;
  goalDone: boolean;

  // --- death ---
  dead: boolean;
  deathCause: string;
  epitaph: string;
  heirContinued: boolean;

  // --- meta ---
  doCat: ActivityCategory | 'all';
  settings: GameSettings;
  nextId: number;
  bornYear: number;
  lifeNo: number; // dynasty counter
}
