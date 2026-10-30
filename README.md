# Medieval Life — a pixel-art life sim

The `v5` life-depth overhaul adds seven birth origins, playable education, distinct professional careers and a persistent royal court with protected succession. See [the implementation and verification report](docs/life-depth-overhaul.md) for systems, migration behavior, acceptance scenarios and release checks.

A BitLife-style medieval life simulator for mobile, built with **Expo SDK 57 + React Native 0.86 + React 19.2 + TypeScript**. Be born a muddy peasant in Swineford, age up one year at a time, and claw your way toward knighthood and nobility — or die of a mild cough at 30. The goose is your best friend.

Built to match the pixel-art mockup (`Medieval Life.dc.html`) 1:1, on top of a fully data-driven game engine.

The workshop update adds optional five-strike forge play, a four-chapter craft/trade journey, independent career progression, clearer choice results and a quieter life feed. See [the update notes](docs/workshop-update.md) for play instructions, save behaviour and validation limits.

## Running it

Use Node.js 22.13+ (22 LTS) or 24.3+ (24 LTS). SDK 57 uses React Native
0.86.3 and React 19.2.3. Native iOS builds require macOS with Xcode 26.4+
and target iOS 16.4 or later.

```bash
npm install
npm start          # then press a / i / w, or scan the QR with Expo Go
```

After upgrading from SDK 54, rebuild native apps before connecting to Metro.
The ignored `android/` and `ios/` projects are generated from `app.json` with
`npx expo prebuild`; regenerate iOS on macOS or through EAS Build. Previous
local native projects are preserved in `.cache/expo-sdk54-native-backup/`.

Other scripts:

```bash
npm test                     # engine, content, services and RPG regression suite
npm run typecheck            # tsc --noEmit
npx tsx scripts/simulate.ts      # headless engine soak test (500 random lives)
npx tsx scripts/simulateSmart.ts # focused-play test (rank ladder reachability)
npx tsx scripts/balance.ts       # balance report: rank reach + lifespan per difficulty
```

## Persistent-world verification

The regular suite is `npm test`. Release-scale
simulation is available through `npm run test:soak`; it runs 1,500 complete
lives across all difficulties, 100 three-generation dynasties, 700 role lives,
every flagship route/ending and deterministic reload checkpoints.

World responsibilities are split across focused modules: `characterState`,
`stateDefaults`, `worldConditions`, `consequenceScheduler`, `npcDirector`,
`worldIntegrity`, and `worldJournal`. Swineford maintains 30-60 living recurring
characters, and flagship stories use conditional routes and multiple endings.

## Playable RPG expansion (save schema v5)

Age Up remains the main progression control. Optional missions, equipment,
skills and home improvements use actions and game years. The expansion adds
no real-world timers, collection deadlines, offline losses or reminders.

- **Do → Contracts:** three stable yearly offers drawn from twelve templates.
  Starting an offer costs one action; its choices and combat are included.
  Safe work, risky checks, trusted clients, preparation and emergency relief
  offer different approaches. Results can include debts and later consequences.
- **Do → Explore:** woodland, quarry and watchtower each have three stages,
  costing one action per stage. Between visits players can age up, resume or
  abandon. Unfinished journeys never expire. The training yard offers free sparring.
- **Do → Craft / Shop:** four raw materials plus crafted goods, twelve recipes, ordinary /
  fine / masterwork quality, consumable goods and three equipment slots. Costs,
  output and modifiers are shown before spending. Equipment never reapplies
  a possession’s original purchase benefits.
- **Me:** Husbandry, Craftsmanship, Scholarship and Arms advance through use.
  Levels require 20 × current level XP; ordinary deeds grant 6 (3 on failure),
  charged mission stages 10 (5 on failure). Capstones recognise mastery.
- **Holding:** workshop, herb garden, training yard, property benefits and named
  stewards. Twelve harvest, raid and village encounters join the annual pacing.
  Player-started estate decisions share the existing annual management allowance;
  construction uses ordinary actions separately.
- **Careers:** mercenary, caravan and court branches each have three chapters.
  Progress survives career changes, with choices, faction standing and recurring
  clients affecting later chapters. Independent caravans play through three
  decisions for one action and an 8g cargo stake.
- **Duels:** side-on pixel arena, four opponent archetypes, defensive choices,
  timing input, counterattacks, stamina and equipment. Timing Assist supplies
  good results while preserving tactical choices and rewards. Reduced motion
  removes lunges; backgrounding pauses input and resumes with a countdown.

The TypeScript engine owns transactions, mission inputs and combat outcomes.
Annual stories use the existing scheduler; optional missions have separate
state. Active choices and fights guard Age Up at engine level, including when
entry consumed the year’s last action. Save writes are serialized, completed
mission inputs cannot be replayed, and duel phases preserve committed moves.
Schema v3/v4 saves migrate additively. Heirs keep their own skills, inherit
materials/equipment/buildings, and do not inherit personal mission rewards.

Expansion-specific checks live in `rpgExpansion.test.ts` and
`rpgJourneys.test.ts`, including mixed-play dynasty simulations and reloads
through every combat phase. Before store release, run a native release build
on physical iOS and Android devices: check touch responsiveness, background /
resume countdowns, audio/haptics preferences and reduced motion. Web preview
and Metro export checks do not replace this device gate.

Expansion verification on 17 September 2026: all 479 tests across 53 suites
passed, TypeScript passed, and Android/iOS Metro exports completed. Release-scale
checks passed 1,500 lives across difficulties and 100 three-generation dynasties.
The role matrix exposed an expected-child household reference bug; after the
fix, its seeded regression and all 700 role lives passed. Phone-sized browser
checks covered contract costs and completion, Age Up, persisted duel phases,
free sparring and Timing Assist. Physical-device release-build testing remains
outstanding; this update has not been published to the stores.

The [21 September implementation audit](docs/rpg-expansion-audit.md) records
requirement coverage and follow-up fixes to caravan decisions, career milestones,
mastery commissions, contract previews, XP awards and combat accessibility.

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

## Persistent story world (save schema v3)

Swineford is now a deterministic world rather than a disposable kin roster:

- **30 recurring inhabitants** live in persistent families and households, with
  personalities, ambitions, secrets, vulnerabilities, memories, careers and
  mutual relationships.
- **World conditions** track food, prosperity, order, war, disease and religious
  tension. Named causes are surfaced in the Life screen and story explanations.
- **Multi-year stories** use saveable template instances, dynamic NPC casting,
  paced beats, local variables and delayed consequences. The five flagship arcs
  cover rivalry, harvest crisis, inheritance, war and an ambitious child; every
  life role also has its own activities and supporting story.
- **Succession preserves the world**: choosing an heir changes the controlled
  character while families, NPCs, stories, consequences and history continue.
- Saves persist `worldSeed`, the exact `rngState`, and `contentVersion`. Identical
  seeds, content and actions produce identical continuations, including across
  save/load. Removed or renamed story content is recovered through aliases and
  declared safe fallbacks without consuming the world's RNG stream.

The v3 update intentionally starts a fresh active world while preserving the
separate achievements, lifetime Chronicle and paid entitlement stores.

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

## Legacy release status (superseded)

The figures below describe the pre-persistent-world build. Current verification
and soak results are recorded in **Persistent-world verification** above.

- ✅ Expo SDK 54 / RN 0.81 / React 19, TypeScript strict, clean typecheck.
- ✅ Bundles through Metro (788 modules).
- ✅ `npm test` — 517 tests across 56 suites (consequence/path/death/event/story/
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
# Fate-Fealty-LifeSim
# Meta ads and release setup

See [Meta Ads setup](docs/meta-ads-release.md) for the required credentials, RevenueCat connection, consent behavior and device checks. The [27 September release audit](docs/release-readiness-2026-09-27.md) records the checks completed and remaining release blockers. Run `npm run release:check` to validate local release configuration.
