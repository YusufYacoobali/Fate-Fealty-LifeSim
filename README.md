# Medieval Life — a pixel-art life sim

A BitLife-style medieval life simulator for mobile, built with **Expo SDK 54 + React Native 0.81 + React 19 + TypeScript**. Be born a muddy peasant in Swineford, age up one year at a time, and claw your way toward knighthood and nobility — or die of a mild cough at 30. The goose is your best friend.

Built to match the pixel-art mockup (`Medieval Life.dc.html`) 1:1, on top of a fully data-driven game engine.

## Running it

```bash
npm install
npm start          # then press a / i / w, or scan the QR with Expo Go
```

Other scripts:

```bash
npm test                     # jest suite (engine, content, services) — 56 tests
npm run typecheck            # tsc --noEmit
npx tsx scripts/simulate.ts      # headless engine soak test (500 random lives)
npx tsx scripts/simulateSmart.ts # focused-play test (rank ladder reachability)
npx tsx scripts/balance.ts       # balance report: rank reach + lifespan per difficulty
```

## Engagement features

- **Notifications** — `src/services/notifications.ts` schedules a single
  *repeating, every-other-day* local reminder (48h interval) with rotating
  medieval flavour text. Permission is requested once on first launch; the
  schedule is idempotent (cancels + reschedules) so relaunching never stacks
  duplicates. Wrapped defensively so it never crashes if local notifications are
  unavailable (e.g. Expo Go on Android).
- **Review prompt** — after **25 cumulative life entries**, and only at a *good
  moment* (a positive beat with no popup/death/settings in the way), a soft
  two-step prompt appears: first "are you enjoying it?" — only an **Aye** routes
  to the OS-native in-app review (`expo-store-review`), which falls back to the
  store page if the native sheet isn't available. Unhappy players are never sent
  to the store, and the prompt shows at most once. The gating logic
  (`src/services/reviewLogic.ts`) is pure and unit-tested.

## The four-stat rule

Only **four stats are ever visible**: ♥ Health, ★ Charm, ✦ Wits, ✝ Faith. All the depth
is *hidden* — path progress, reputation, memories, tags, and active story arcs quietly
steer which events fire and how your life unfolds.

## Architecture

```
src/
  types/game.ts          # the whole type system (state, effects, events, conditions)
  theme/                 # palette + typography pulled from the mockup
  data/                  # static definitions (ranks, names, activities, shop)
  content/               # event banks — pure data, one file per category
    annualMessages.ts  childEvents.ts  peasantEvents.ts  courtierEvents.ts
    knightEvents.ts  nobleEvents.ts  faithEvents.ts  familyEvents.ts
    plagueEvents.ts  warEvents.ts  storyArcs.ts  index.ts (registry)
  engine/                # pure logic — no React, no React Native imports
    random.ts            # RNG toolkit with an INJECTABLE source (see SOLID below)
    gameState.ts         # createLife, clone, feed/memory/money helpers
    consequenceEngine.ts # applies an `Effects` object to state (one chokepoint)
    eventPicker.ts       # condition checks + weighted event selection
    storyGraph.ts        # multi-popup arc resolution (nextNodeId)
    pathProgression.ts   # hidden paths + visible rank ladder
    deathEngine.ts       # mortality checks + death/legacy summary
    activityEngine.ts    # the "DO" tab activity outcomes
    shopEngine.ts        # purchasing
    kinEngine.ts         # relationship interactions (by id)
    kinFactory.ts        # the one place new spouses/children are minted
    traitEngine.ts       # birth/acquired traits + their passive modifiers
    lifecycleEngine.ts   # ongoing world states: kin mortality, illness, prison
    metaProgression.ts   # achievements + lifetime stats / Hall of Legends (pure)
    goalEngine.ts        # coming-of-age life goal: assign at 18, track, reward
    lifeDirector.ts      # orchestrates one age-up (the heartbeat)
  state/                 # React bridge
    gameReducer.ts       # actions -> engine calls (clones, never mutates store)
    GameContext.tsx      # thin composition root (wires the hooks below)
    hooks/
      usePersistentGame.ts   # reducer + hydrate/save lifecycle
      useAppMeta.ts          # cross-life meta (entry counter, flags)
      useReviewGate.ts       # entry counting + review-prompt gating
      useScheduledReminders.ts # every-other-day reminder scheduling
      useCharacterCreation.ts  # first-run + new-life onboarding gate
      useGameFeedback.ts       # haptics on promotion/death transitions
      useMetaProgression.ts    # records lives, unlocks achievements
    persistence.ts       # save/load/clear (per-life game)
    appMeta.ts           # save/load (cross-life metadata)
    viewModel.ts         # pure selectors -> display-ready shapes
  components/            # dumb pixel-art UI (ui primitives, tabs, modals)
  screens/GameScreen.tsx # assembles the whole screen
App.tsx                  # font loading + provider
```

### How a year happens

1. `AGE_UP` action → reducer clones state → `lifeDirector.ageUp(s)`.
2. The Director: bumps age, emits 1–2 annual beats, applies aging attrition,
   **continues an in-flight story arc** or rolls a new weighted main event,
   ticks rank/path progression (may auto-promote), then runs the death engine.
3. If an event is set, the UI opens `EventModal`; choosing an option runs
   `storyGraph.applyChoice`, which applies effects and may chain to a follow-up
   popup (`now`) or queue it for a later year (`nextYear`).

### Writing content

Events are pure data — no code needed to add one. Drop an entry in the relevant
`content/*.ts` file:

```ts
{
  id: 'peasant_rat_granary',
  category: 'peasant',
  title: 'A RAT IN THE GRANARY',
  text: 'A fat rat is eating the winter grain. The elders look at you.',
  ageMin: 8,
  ranks: ['Peasant', 'Squire'],
  choices: [
    { label: 'Hunt it with a broom',
      outcome: { text: 'The rat fled. The village cheered.', effects: { charm: 6, gold: 3 }, tone: 'good' } },
    { label: 'Befriend it',
      // success/failure roll, hidden path progress, memories, chaining:
      successChance: (s) => 0.4 + s.stats.wits / 200,
      success: { text: '...', effects: { wits: 4, path: { outlaw: 1 } }, next: 'some_followup', nextWhen: 'nextYear' },
      failure: { text: '...', effects: { health: -5 } } },
  ],
}
```

Conditions (`requires`, `ageMin/Max`, `ranks`, `paths`, `costGold`) gate when an
event/choice appears; `effects` flow through the single consequence engine, so
stats, gold, rank progress, reputation, paths, tags, memories, kin bonds,
**new kin (`addKin`)**, **kin deaths (`killKin`)**, promotion/demotion, and death
all work uniformly.

## Traits & perks

Every life rolls one of ten **birth traits** (Sickly, Born Lucky, Silver-Tongued…)
that shift starting stats and carry passive modifiers — a success-roll bonus
(`rollBonus`, applied in the story graph) and an old-age attrition multiplier
(`agingMultiplier`, applied in the death engine). **Acquired traits** (War Hero,
Living Saint, Notorious Outlaw, Devoted Parent…) are earned during play from your
memories and reputation, granted automatically each age-up / after each choice.
Traits show as chips on the **Me** tab and are mirrored as `trait_<id>` tags, so
events can gate on them via `requires: { hasTraits: ['lucky'] }`. Registry lives
in `data/traits.ts` (pure data — add a trait in one line).

## Game feel

- **Haptics** (`expo-haptics`, behind a settings toggle) on age-up, choices,
  purchases, plus engine transitions — a success buzz on promotion, an error
  buzz on death.
- **Animated stat bars** that tween to their new value, and transient floating
  **delta badges** (`+4 ♥`, `−2 ★`, gold changes) — all done at the UI layer with
  no engine coupling.

## Character creation

First launch (and every new life / restart) opens a creation screen: name your
peasant, pick a birth trait (or leave it to fate), and choose difficulty. The
choices flow through `NEW_LIFE` options into `createLife`. A `meta.onboarded`
flag tracks whether the player has seen it before.

## Family, spouses & heirs

Marriage events add a real spouse to the roster (`addKin: { kind: 'spouse' }`),
newborn events add a child flagged `isHeir`, and a failed cure marks a parent
deceased (`killKin: 'mother'`). The deceased drop off the living roster but
heirs are counted on the death screen — leave a child behind and **Continue as
Heir** carries half your gold and reputation into the next generation. Kin are
addressed by stable id throughout, so the roster can grow and shrink safely.

## Life goals (the coming-of-age ambition)

At 18 the player is handed a concrete **life goal** alongside the long climb to
nobility — amass 150 gold, raise 3 children, master a stat, live to 65, own an
estate, wed, earn knighthood, and so on (`data/goals.ts`, pure data). The goal is
shown as an always-visible progress banner above the Age-Up button and detailed
on the **Me** tab. It's assigned by `goalEngine` (only from goals not already
satisfied), tracked via a progress fraction, and rewarded once on completion
(gold + reputation + the "Life's Ambition" achievement). Across skilled play
~96% of lives get an ambition and ~25–31% fulfil it — a real accomplishment, not
a formality.

## Meta-progression (across lives)

Progress persists in the cross-life meta store and is surfaced through a
**Chronicle** screen (opened from Settings) with three sections:
- **Stats** — lifetime aggregates (lives lived, oldest age, highest station,
  most gold, children raised, best legacy).
- **Deeds** — a ~19-strong achievements gallery (rank, wealth, attribute,
  family, trait, and dynasty milestones; secret ones stay hidden until earned).
- **Legends** — a Hall of Legends listing your past lives (name, rank, age,
  cause, legacy), newest first, capped at 30.

The logic is pure (`engine/metaProgression.ts` + data-driven `data/achievements.ts`):
achievements are evaluated on every state change (so "reach Knight", "hold 100
gold" pop the moment they happen) and once more at death (for "die"/age
milestones); a freshly unlocked deed slides in as a self-dismissing toast.
Finished lives fold into the stats + Hall of Legends on the death transition.

## Living-world states

The Life Director runs yearly upkeep through `lifecycleEngine`:
- **Kin mortality** — elderly spouses and parents grow old and die (rising
  yearly risk past 50), leaving you widowed/bereaved with the right tags.
- **Illness** — the `ill` state drains health each year until it clears
  naturally or a doctor/herbalist cures it; events like the Sweating Sickness
  can inflict it.
- **Imprisonment** — the `imprisoned` state (from `Effects.prison`, e.g. a
  botched escape from the reeve) blocks free activities and passes years in a
  cell until release.
- **Divorce** — a spouse-only interaction that ends a marriage.

## SOLID notes

- **SRP** — engine modules are one-concern each; the React provider is a thin
  composition root delegating to four single-purpose hooks; kin creation is
  isolated in `kinFactory`.
- **OCP** — the game extends through *data* (events, activities, shop items, kin
  specs) without touching engine code; `Effects`/`Condition` are the stable
  extension language.
- **DIP** — the engine depends on a `RandomSource` abstraction, not global
  `Math.random`. Production binds `Math.random`; tests/sims inject a seeded
  PRNG (`seededSource`) for fully reproducible runs — see `random.test.ts`.
- **Pure core** — nothing under `engine/`, `content/`, or the `*Logic` services
  imports React/React Native, so it's all unit-testable in plain Node.

## Status

- ✅ Expo SDK 54 / RN 0.81 / React 19, TypeScript strict, clean typecheck.
- ✅ Bundles through Metro (788 modules).
- ✅ `npm test` — 99 tests across 16 suites (consequence/path/death/event/story/
  life-director/trait/lifecycle/meta-progression/goal engines, kin factory +
  family effects, seeded-RNG determinism, content integrity, reducer, review +
  notification logic).
- ✅ Engine soak-tested across thousands of lives, all invariants hold.

### Balance

Reaching **Noble** is meant to be hard but not impossible. Difficulty controls
how long you live (not the rank bar), and the modes are tuned so the climb is a
real achievement everywhere rather than trivial on easy / impossible on hard.
Measured Noble-reach rates (`scripts/balance.ts`, skilled-play agent):

| Difficulty | Avg lifespan | Reaches Knight | Reaches Noble | Fulfils life goal |
|------------|-------------:|---------------:|--------------:|------------------:|
| Merciful   | ~52          | ~96%           | **~49%**      | ~31%              |
| Normal     | ~50          | ~96%           | **~27%**      | ~31%              |
| Brutal     | ~42          | ~89%           | **~5%**       | ~26%              |

Careless (random) play reaches Noble ~0% — you cannot stumble into nobility, it
must be earned through deliberate play.
#   F a t e - F e a l t y - L i f e S i m  
 