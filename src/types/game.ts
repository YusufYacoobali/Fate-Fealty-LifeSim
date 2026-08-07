import type { Thread } from '@/engine/director/threads';

/**
 * Core type system for the Fate & Fealty engine.
 *
 * Design rule: only FOUR character stats are visible — health, charm, wits,
 * faith. The Holding has its own clearly separated management resources, while
 * path progress, reputation, memories, tags, and active story arcs stay hidden.
 */

// ---------------------------------------------------------------------------
// Stats & ranks
// ---------------------------------------------------------------------------

export type StatKey = 'health' | 'charm' | 'wits' | 'faith';

export type Stats = Record<StatKey, number>;

export const STAT_KEYS: StatKey[] = ['health', 'charm', 'wits', 'faith'];

/** The visible class ladder. Index in RANKS == rankIdx in GameState. */
export type RankKey = 'Peasant' | 'Squire' | 'Knight' | 'Noble' | 'Baron' | 'Monarch';

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

export type FeedSource = 'player' | 'npc' | 'world';
export type FeedFilter = 'all' | 'player' | 'world';

export interface FeedEntry {
  id: number;
  age: number;
  tag: string;
  tagColor?: string;
  text: string;
  tone: Tone;
  traitId?: string;
  /** Stable actor attribution prevents dead-player narration and enables filtering. */
  actorId?: string;
  source?: FeedSource;
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
  /** Premium birth traits can be viewed by everyone but only chosen or rolled with access. */
  premium?: boolean;
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

export type KinKind = 'mother' | 'father' | 'sibling' | 'spouse' | 'child' | 'friend' | 'foe' | 'liege' | 'acquaintance';

export type GenderIdentity = 'woman' | 'man';
export type PronounId = 'she' | 'he' | 'they';
export type AttractionPreference = 'women' | 'men' | 'none';

export interface PronounSet {
  id: PronounId;
  subject: 'she' | 'he' | 'they';
  object: 'her' | 'him' | 'them';
  possessive: 'her' | 'his' | 'their';
}

export interface OccupationState {
  careerId: string | null;
  experience: number;
  performance: number;
  workedThisYear: number;
  apprenticeshipYears?: number;
  guildStanding?: number;
  patronId?: string;
  dismissedYear?: number;
}

export interface Debt {
  id: string;
  lenderId?: string;
  principal: number;
  interestRate: number;
}

export interface CharacterCore {
  id: string;
  name: string;
  age: number;
  alive: boolean;
  gender: GenderIdentity;
  pronouns: PronounSet;
  attraction: AttractionPreference;
  stats: Stats;
  traits: string[];
  gold: number;
  rankIdx: number;
  occupation: OccupationState;
  debts: Debt[];
}

export interface KinMember extends CharacterCore {
  role: string;
  emoji: string;
  rel: number; // 0..100 relationship
  trait: string;
  bio: string;
  kind: KinKind;
  isHeir?: boolean;
  householdId?: string;
  healthTags: string[];
  memories: string[];
  /** Stable genealogy/world-simulation links introduced by save schema v3. */
  birthFamilyId?: string;
  parentIds?: string[];
  childIds?: string[];
  spouseId?: string;
  personalityTraits?: string[];
  ambition?: NpcAmbition;
  secret?: NpcSecret;
  secretRevealed?: boolean;
  vulnerability?: NpcVulnerability;
  importance?: CharacterImportance;
  lifeRole?: LifeRole;
  worldMemories?: CharacterMemory[];
  deathYear?: number;
  deathCause?: string;
  healthConditions?: HealthConditionState[];
  legalState?: LegalState;
  secrets?: CharacterSecretState[];
  guardianIds?: string[];
  lineageStatus?: LineageStatus;
  childDevelopment?: ChildDevelopmentState;
  factionId?: FactionKey;
  factionInfluence?: number;
}

export type WorldCharacter = KinMember;

export type HealthConditionKind = 'illness' | 'injury' | 'disability';
export interface HealthConditionState {
  id: string;
  conditionId: string;
  kind: HealthConditionKind;
  severity: number;
  diagnosed: boolean;
  startedYear: number;
  nextReviewYear: number;
  sourceId?: string;
}

export type LegalStatus = 'free' | 'accused' | 'awaiting_trial' | 'imprisoned' | 'exiled' | 'outlawed';
export interface LegalCharge {
  id: string;
  offence: string;
  severity: number;
  evidence: number;
  victimIds: string[];
  witnessIds: string[];
  year: number;
  resolved: boolean;
}
export interface LegalState {
  status: LegalStatus;
  suspicion: number;
  notoriety: number;
  charges: LegalCharge[];
  sentenceYearsRemaining: number;
}

export interface CharacterSecretState {
  id: string;
  type: NpcSecret;
  knownByIds: string[];
  revealed: boolean;
  severity: number;
  createdYear: number;
}

export type LineageStatus = 'marital' | 'acknowledged' | 'disputed' | 'adopted' | 'ward';
export interface ChildDevelopmentState {
  completedMilestones: number[];
  education: 'none' | 'household' | 'craft' | 'church' | 'martial' | 'court';
  investment: number;
  favour: number;
}

export type CharacterImportance = 'core' | 'supporting' | 'background';
export type NpcAmbition =
  | 'protect_family'
  | 'gain_land'
  | 'marry_well'
  | 'join_clergy'
  | 'gain_status'
  | 'become_wealthy'
  | 'avenge_family'
  | 'master_craft'
  | 'win_glory'
  | 'seek_freedom';
export type NpcSecret =
  | 'none'
  | 'hidden_debt'
  | 'forbidden_faith'
  | 'illegitimate_child'
  | 'cowardice_in_battle'
  | 'stolen_property'
  | 'secret_lover'
  | 'false_lineage'
  | 'criminal_contact'
  | 'betrayed_friend';
export type NpcVulnerability =
  | 'pride'
  | 'poverty'
  | 'sick_relative'
  | 'disputed_birth'
  | 'loneliness'
  | 'greed'
  | 'fear'
  | 'envy';

export interface CharacterMemory {
  id: string;
  year: number;
  type: string;
  actorIds: string[];
  storyInstanceId?: string;
  choiceId?: string;
  sentiment: number;
  salience: 1 | 2 | 3 | 4 | 5;
  inherited: boolean;
  summary: string;
}

export interface RelationshipPerspective {
  affinity: number;
  trust: number;
  respect: number;
  attraction: number;
}

export type RelationshipFlag = 'family' | 'spouse' | 'friend' | 'rival' | 'authority' | 'feud' | 'former_spouse' | 'affair';

export interface Relationship {
  id: string;
  aId: string;
  bId: string;
  aToB: RelationshipPerspective;
  bToA: RelationshipPerspective;
  flags: RelationshipFlag[];
  lastInteractionAge: number;
  interactionsThisYear: number;
  sharedMemories: string[];
}

export interface Household {
  id: string;
  memberIds: string[];
  wealth: number;
  headId?: string;
  foodSecurity?: number;
  status?: number;
  residenceQuality?: number;
  capacity?: number;
  storedFood?: number;
}

export interface FamilyMemory {
  id: string;
  year: number;
  type: string;
  sentiment: number;
  salience: number;
  summary: string;
}

export interface FamilyState {
  id: string;
  name: string;
  memberIds: string[];
  reputation: number;
  wealthTier: number;
  allyFamilyIds: string[];
  enemyFamilyIds: string[];
  inheritedMemories: FamilyMemory[];
}

export type RngAlgorithm = 'mulberry32-v1';
export interface PersistedRngState {
  algorithm: RngAlgorithm;
  state: number;
  draws: number;
}

export interface WorldConditions {
  foodSecurity: number;
  prosperity: number;
  publicOrder: number;
  warThreat: number;
  diseasePressure: number;
  religiousTension: number;
}

export type WorldConditionKey = keyof WorldConditions;
export interface ConditionModifier {
  id: string;
  condition: WorldConditionKey;
  label: string;
  delta: number;
  /** Annual pressure is applied once per yearly tick; one-shot modifiers are consumed. */
  application?: 'annual' | 'once';
  sourceId: string;
  expiresYear?: number;
  hiddenUntilRevealed?: boolean;
}

export type LifeRole = 'commoner' | 'artisan_merchant' | 'clergy' | 'martial' | 'landed_noble' | 'monarch' | 'outlaw';
export type StoryScale = 'major' | 'medium' | 'relationship';
export type StoryStatus = 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface StoryInstance {
  id: string;
  templateId: string;
  scale: StoryScale;
  status: StoryStatus;
  bindings: Record<string, string>;
  variables: Record<string, string | number | boolean | null>;
  currentBeatId: string;
  startedYear: number;
  nextEligibleYear: number;
  lastBeatYear: number;
  generationStarted: number;
}

export type ConsequenceScope = 'character' | 'family' | 'household' | 'world';
export type ConsequenceDescriptor =
  | { type: 'effects'; effects: Effects; targetId?: string }
  | { type: 'relationship'; aId: string; bId: string; affinity: number; trust?: number }
  | { type: 'condition'; condition: WorldConditionKey; delta: number; label: string }
  | { type: 'memory'; targetId: string; memoryType: string; sentiment: number; salience: 1 | 2 | 3 | 4 | 5; summary: string }
  | { type: 'history'; historyType: string; summary: string; salience: number };

export interface ScheduledConsequence {
  id: string;
  sourceStoryInstanceId?: string;
  sourceChoiceId?: string;
  dueYear: number;
  expiresYear?: number;
  scope: ConsequenceScope;
  targetIds: string[];
  condition?: { kind: 'character_alive' | 'condition_at_least' | 'condition_at_most'; key?: WorldConditionKey; value?: number };
  resolution: ConsequenceDescriptor;
  explanation: string;
}

export interface WorldHistoryEntry {
  id: string;
  year: number;
  type: string;
  participantIds: string[];
  familyIds: string[];
  storyInstanceId?: string;
  choiceId?: string;
  causes: string[];
  summary: string;
  salience: number;
}

export interface PacingState {
  lastMajorYear: number | null;
  lastImportantYear: number | null;
  quietYearsSinceStory: number;
  /** Consecutive years resolved by a story beat rather than a one-off event. */
  storyBeatsInARow?: number;
  /** Year the once-yearly death hazards were last rolled. */
  hazardsRolledYear?: number;
  /** Consecutive years in which nothing at all happened. */
  quietRun?: number;
  /** Years since the last deliberate good year. */
  yearsSinceReward?: number;
  /** Gap, rolled fresh each time, before the next one is owed. */
  nextRewardAt?: number;
  majorEventsThisLife: number;
  mediumStoriesStarted: number;
  immediateChainDepth: number;
}

export type ContentDomain = 'family' | 'health' | 'crime' | 'career' | 'politics' | 'household' | 'rare';
export type ContentRarity = 'common' | 'uncommon' | 'rare';
export interface ContentLedgerEntry {
  lastYear: number;
  timesResolved: number;
  lastChoiceId?: string;
}

export type ExpectedChildRoute = 'pregnancy' | 'adoption' | 'wardship';
export interface ExpectedChild {
  id: string;
  parentIds: string[];
  route: ExpectedChildRoute;
  dueYear: number;
  householdId: string;
  familyId: string;
  status: 'expected' | 'resolved' | 'cancelled';
  sourceChoiceId?: string;
}

export type FactionKey = 'crown' | 'church' | 'guilds' | 'commons' | 'outlaws';
export interface FactionState {
  id: FactionKey;
  name: string;
  influence: number;
  playerStanding: number;
  leaderId?: string;
  activePressure?: string;
  lastActionYear: number;
}

export interface PlayerRunState {
  /** World year in which control of the current character began. */
  startedYear: number;
  generation: number;
  roleProgress: Partial<Record<LifeRole, number>>;
}

export interface PendingEvent {
  eventId: string;
  storyInstanceId?: string;
  bindings?: Record<string, string>;
}

export type RelationFilter = 'all' | 'family' | 'romance' | 'friends' | 'acquaintances' | 'rivals' | 'authority' | 'deceased';

export interface WorldState {
  relationships: Record<string, Relationship>;
  households: Household[];
  relationFilter: RelationFilter;
  feedFilter: FeedFilter;
  proposalFromId: string | null;
  recentNarrativeIds: string[];
  /** Schema-v3 persistent simulation data. Arrays above remain UI adapters. */
  currentYear: number;
  worldSeed: number;
  rngState: PersistedRngState;
  contentVersion: number;
  characters: Record<string, WorldCharacter>;
  families: Record<string, FamilyState>;
  conditions: WorldConditions;
  conditionModifiers: ConditionModifier[];
  activeStories: StoryInstance[];
  scheduledConsequences: ScheduledConsequence[];
  history: WorldHistoryEntry[];
  pacing: PacingState;
  recoveryNotice: boolean;
  contentLedger: Record<string, ContentLedgerEntry>;
  /** Ambient chains the player has opened and not yet finished. */
  threads?: Thread[];
  repetitionLedger: Record<string, number>;
  recentDomains: ContentDomain[];
  expectedChildren: ExpectedChild[];
  factions: Record<FactionKey, FactionState>;
}

export interface ActionClock {
  used: number;
  cap: number;
  lifetimeUsed: number;
  fullYears: number;
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
  /** Forced gender; omit to let the factory roll one. */
  gender?: GenderIdentity;
  /** Forced attraction; omit to derive it from gender. */
  attraction?: AttractionPreference;
}

// ---------------------------------------------------------------------------
// Holding (rank-scaled land and household management)
// ---------------------------------------------------------------------------

export type HoldingResource = 'stores' | 'security' | 'loyalty';

export type HoldingResources = Record<HoldingResource, number>;

export interface HoldingState extends HoldingResources {
  /** People living on the estate. Optional only for compatibility with old saves. */
  population?: number;
  upgrades: string[];
  /** Character age at which the most recent deliberate action was taken. */
  lastActionAge: number | null;
  /** Consecutive annual ticks with at least one resource below 15. */
  criticalYears: number;
}

export interface HoldingActionDef {
  id: string;
  name: string;
  desc: string;
  minRankIdx: number;
}

export interface HoldingUpgradeDef {
  id: string;
  name: string;
  desc: string;
  price: number;
  minRankIdx: number;
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
  /** Visible Holding resource shifts. */
  holding?: Partial<HoldingResources>;
  addTags?: string[];
  removeTags?: string[];
  /** Record a hidden memory. */
  memory?: { tag: string; weight?: number; note?: string };
  /** Shift a specific kin member's relationship. */
  kinRel?: { id: string; delta: number };
  /** Shift the character bound to a persistent-story role. */
  boundKinRel?: { role: string; delta: number };
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
  /** Persistent-world extensions. Existing effects still target the player. */
  targetCharacterId?: string;
  worldConditions?: Partial<WorldConditions>;
  familyReputation?: { familyId?: string; delta: number };
  storyVariables?: Record<string, string | number | boolean | null>;
  revealSecretOf?: string;
  schedule?: Omit<ScheduledConsequence, 'id'> | Array<Omit<ScheduledConsequence, 'id'>>;
  healthCondition?: { conditionId: string; severity: number; targetId?: string; diagnosed?: boolean };
  removeHealthCondition?: { conditionId: string; targetId?: string };
  legal?: { targetId?: string; suspicion?: number; notoriety?: number; status?: LegalStatus; charge?: Omit<LegalCharge, 'id' | 'year' | 'resolved'>; sentenceYears?: number };
  faction?: { factionId: FactionKey; influence?: number; playerStanding?: number; pressure?: string };
  householdState?: { householdId?: string; wealth?: number; food?: number; quality?: number; capacity?: number; status?: number };
  createSecret?: { targetId?: string; type: NpcSecret; severity: number; knownByIds?: string[] };
  expectChild?: { route: ExpectedChildRoute; parentIds?: string[]; dueInYears?: number };
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
  holdingAtLeast?: Partial<HoldingResources>;
  holdingAtMost?: Partial<HoldingResources>;
  /** Require at least one LIVING kin of each listed kind (e.g. a sibling). */
  hasKinOfKind?: KinKind[];
  /**
   * Cap on LIVING kin of a kind — lets kin-adding events self-balance so the
   * roster can't overflow (e.g. befriend someone only while friends <= 2, or
   * swear to a liege only while lieges = 0).
   */
  kinCountAtMost?: Partial<Record<KinKind, number>>;
  roles?: LifeRole[];
  worldAtLeast?: Partial<WorldConditions>;
  worldAtMost?: Partial<WorldConditions>;
  hasHealthCondition?: string[];
  missingHealthCondition?: string[];
  legalStatuses?: LegalStatus[];
  suspicionAtLeast?: number;
  factionStandingAtLeast?: Partial<Record<FactionKey, number>>;
  householdAtLeast?: Partial<{ wealth: number; food: number; quality: number; status: number }>;
  hasKnownSecret?: boolean;
  hasWorldMemoryType?: string[];
  /** Require every listed shop item to be owned (ids from `data/shop`). */
  hasItems?: string[];
  /** Require none of the listed shop items to be owned. */
  missingItems?: string[];
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
  /** Stable content id used by story transitions and save-safe history. */
  id?: string;
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
  forecast?: { risk: 'low' | 'medium' | 'high'; positive: string[]; negative: string[]; warnsDelayedConsequence?: boolean };
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

export interface EventActorRole {
  minAge?: number;
  maxAge?: number;
  alive?: boolean;
  excludePlayer?: boolean;
  kinds?: KinKind[];
  importance?: CharacterImportance[];
  missingActor: 'clear_event' | 'substitute';
}

export interface EventChainRef {
  /** Chain this beat belongs to, e.g. "stolen_chalice". */
  id: string;
  /** 0-based position of this beat in the chain. */
  index: number;
  /** Total beats in the chain. */
  total: number;
}

export interface GameEvent {
  id: string;
  category: EventCategory;
  /** Premium content; only eligible when lifetimeUnlocked is true. */
  premium?: boolean;
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
  domain?: ContentDomain;
  rarity?: ContentRarity;
  cooldownYears?: number;
  repetitionGroup?: string;
  actorRoles?: Record<string, EventActorRole>;
  editorialScore?: 1 | 2 | 3 | 4 | 5;
  /** Set on ambient chain beats so the director can schedule continuations. */
  chain?: EventChainRef;
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
  /** Youngest age that may attempt this (default 0). Shown as a lock in the UI. */
  minAge?: number;
  roles?: LifeRole[];
  premium?: boolean;
}

export type CareerFamily = 'agriculture' | 'craft' | 'trade' | 'church' | 'martial' | 'court' | 'outlaw' | 'medicine' | 'entertainment' | 'law';

export interface CareerDef {
  id: string;
  family: CareerFamily;
  title: string;
  icon: string;
  tier: number;
  minAge: number;
  minRankIdx: number;
  minStats?: Partial<Stats>;
  minReputation?: number;
  wage: number;
  healthRisk?: number;
  promotesTo?: string;
  desc: string;
  premium?: boolean;
  prestige?: boolean;
}

export type ShopItemType = 'consumable' | 'perm';

/** The stalls and traders of Swineford, each with its own kind of wares. */
export type ShopMarket =
  | 'pedlar'
  | 'market'
  | 'apothecary'
  | 'armourer'
  | 'draper'
  | 'beastmarket'
  | 'reliquary'
  | 'scrivener'
  | 'landagent';

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
  /** Youngest age the merchant will sell this to (default 0). */
  minAge?: number;
  /** Which stall carries it. */
  market: ShopMarket;
  /** Always in stock; everything else rotates from year to year. */
  staple?: boolean;
  /** Chance in 100 that a rotating item is stocked in any given year. */
  stockChance?: number;
  /** Station the seller expects before dealing (default 0). */
  minRankIdx?: number;
}

export interface GameSettings {
  autoScroll: boolean;
  difficulty: Difficulty;
  liveForever: boolean;
  haptics: boolean;
  music: boolean;
  soundEffects: boolean;
  reducedMotion?: boolean;
  /** Collapse the Swineford panel on the Holding page. Carried across lives. */
  villageCollapsed?: boolean;
}

export type Tab = 'life' | 'do' | 'kin' | 'hold' | 'shop' | 'me';

// ---------------------------------------------------------------------------
// The full game state
// ---------------------------------------------------------------------------

export type DuelKind = 'duel' | 'brawl';
export type DuelOutcome = 'won' | 'lost' | 'yielded' | 'refused';

/** A fight in progress, resolved exchange by exchange through the duel modal. */
export interface DuelState {
  opponentId: string;
  kind: DuelKind;
  /** Fight-local composure, 0..100. Not the same as health. */
  playerVigour: number;
  opponentVigour: number;
  round: number;
  /** The telegraphed attack the player is currently answering. */
  moveId: string;
  /** Narration of the exchanges so far, newest last. */
  log: string[];
  /** Set once the fight is decided, before the player closes the modal. */
  outcome?: DuelOutcome;
  /** Closing narration shown with the outcome. */
  verdict?: string;
}

export interface GameState {
  schemaVersion: 4;
  playerCharacterId: string;
  playerRun: PlayerRunState;
  pendingEvent: PendingEvent | null;
  /** Non-null only while a fight is being played out. */
  duel: DuelState | null;
  // --- identity ---
  first: string;
  epithet: string;
  gender: GenderIdentity;
  pronouns: PronounSet;
  attraction: AttractionPreference;

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
  /** @deprecated Compatibility projection. Canonical people live in world.characters. */
  kin: KinMember[];
  world: WorldState;

  // --- time, career, economy ---
  actionClock: ActionClock;
  occupation: OccupationState;
  debts: Debt[];

  // --- possessions ---
  inventory: string[];
  holding: HoldingState;

  // --- log ---
  feed: FeedEntry[];

  // --- transient UI ---
  tab: Tab;
  selectedKinId: string | null;
  settingsOpen: boolean;

  // --- life goal (assigned at coming-of-age) ---
  goalId: string | null;
  goalDone: boolean;

  // --- death ---
  dead: boolean;
  deathCause: string;
  epitaph: string;
  heirContinued: boolean;

  // --- premium entitlement (field name kept for save compatibility; granted
  // by a subscription or the Lifetime Pass) ---
  lifetimeUnlocked: boolean;

  // --- meta ---
  doCat: ActivityCategory | 'all';
  settings: GameSettings;
  nextId: number;
  bornYear: number;
  lifeNo: number; // dynasty counter
}
