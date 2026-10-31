# Fate & Fealty v5 — narrative overhaul validation

31 October 2026 (Europe/London). Baseline: `fc98b1a`; validated runtime and audit script: `4980471`. The pixel presentation, EventModal, purchases and save key are preserved. This report accompanies the [pre-edit editorial audit](narrative-overhaul-audit.md), [baseline content snapshot](validation/narrative/baseline.json), [before simulation](validation/narrative/before-lives.json), [after simulation](validation/narrative/after-lives.json) and [sample narrative histories](validation/narrative/editorial-histories.md).

## What changed

The annual pool grows from **38 to 178** individually authored observations: **23 old lines rewritten, 15 retained and 140 new**. All 38 old identifiers remain. New observations cover childhood, household warmth, courtship, work, law, court, faith, sickness, age and rare sights. Eligibility uses the controlled person's actual parents, carers, spouse, children, rivals, occupation, resources, legal status and world conditions. First milestones and rare incidents can be once-only. Exact-ID spacing is twelve years; shared themes have a two-year gap, including within one year. Both ledgers survive saves. Feed-only legacy saves also recognise the original first-milestone wording. Flavour damage alone cannot kill the player.

The old interactive bank received **76 writing revisions**: 56 rewrites, 11 deepened premises and 9 replacements within existing IDs. These include 72 older standalone/directed passages and four ambient-chain passages. The remaining **461 passages retain their writing**. Their identity, education, profession, possession and persistent-story material has been preserved. A few retained passages received correctness changes: a living Roderick for a truce, real reconciliation, a newborn rather than a randomly aged sibling, a living spouse for a marriage continuation and a living goose for goose choices.

Every baseline event and choice ID remains. All load-bearing chain titles remain. The sole essential title correction is `family_mother_ill`: `MAUD TAKES ILL` becomes `A MOTHER TAKES ILL`, because the actual mother may have another name. Content version 8 migrates the old history cause and seeds thematic cooldowns without drawing RNG. The save schema remains version 7.

## Exact content inventory

<!-- COUNTS -->
| Passage type | Before | After |
|---|---:|---:|
| Independent entry points (including chain openings) | 156 | 286 |
| Optional conditional callbacks | 0 | 48 |
| Scheduled chain continuations | 85 | 85 |
| Persistent-story passages | 189 | 189 |
| Other internal/directed passages | 107 | 107 |
| **All registered interactive passages** | **537** | **715** |
| Annual observations (separate) | 38 | 178 |
| Persistent story templates | 29 | 29 |
| Ambient chains | 21 | 21 |
| Free interactive passages | 492 | 664 |
| Premium interactive passages | 45 | 51 |

Of the independent entry points, 21 are chain openings in both versions; standalone entry points grow from 135 to 265.

| Registered category | Before free | Before Premium | Before total | After free | After Premium | After total |
|---|---:|---:|---:|---:|---:|---:|
| arc | 175 | 18 | 193 | 175 | 18 | 193 |
| child | 51 | 0 | 51 | 51 | 0 | 51 |
| court | 29 | 6 | 35 | 40 | 6 | 46 |
| faith | 10 | 1 | 11 | 22 | 1 | 23 |
| family | 24 | 4 | 28 | 109 | 6 | 115 |
| knight | 15 | 0 | 15 | 17 | 0 | 17 |
| noble | 9 | 13 | 22 | 18 | 17 | 35 |
| peasant | 154 | 0 | 154 | 207 | 0 | 207 |
| plague | 20 | 1 | 21 | 20 | 1 | 21 |
| war | 5 | 2 | 7 | 5 | 2 | 7 |
<!-- /COUNTS -->

The 130 new independent encounters are separate premises, not additional beats counted as separate adventures. The 48 callbacks are reported separately. The eight new packs are:

| File | Independent encounters | Coverage |
|---|---:|---|
| `narrativeFamilyEvents.ts` | 20 | Household, inheritance, parenting, siblings, warmth |
| `narrativeRomanceEvents.ts` | 18 | Courtship, consent, marriage, jealousy, separation |
| `narrativeCrimeEvents.ts` | 20 | Fraud, trials, prison, escape, dangerous bargains |
| `narrativeWorkEvents.ts` | 20 | Craft, trade, medicine, law, entertainment, service |
| `narrativePoliticsEvents.ts` | 20 | Noble vanity, public obligations, diplomacy, four adult-monarch decisions |
| `narrativeFaithEvents.ts` | 12 | Parish life, hypocrisy, charity, superstition |
| `narrativeHealthEvents.ts` | 12 | Actual illnesses, recovery, unsafe work, lasting injuries |
| `narrativeRareEvents.ts` | 8 | Unusual visitors, disasters, discoveries and disputed fortunes |

`narrativeCallbackEvents.ts` adds 48 optional, actor-bound responses, including ten linked to rewritten old passages. Ordinary windows are one to three years. Three inherited family echoes can remain available for up to twelve years. They require the actual earlier choice, its recorded actor and a living, suitable participant. They do not replace a dead actor with a stranger. Source choice IDs, bindings and callback provenance are saved in the existing world history rather than a parallel quest database.

## Consequences and continuity

There are **35 explicitly major scenarios**: 33 new and two substantially rewritten. Other older dangerous events, including treason and a duel, retain their consequences. Major labels are checked against actual resulting state, not prose alone.

| Example | State that changes |
|---|---|
| The most alive corpse | Supporting the false death claim records fraud, loses 28 household wealth and damages the actual parent's trust and affection. |
| The prison window / copied key | Successful escape changes legal state; failure adds sentence years rather than replacing a longer existing sentence with a shorter one. |
| The healer's eye paste / broken scaffold | Health conditions use their defined illness/disability kind; blindness or chronic pain persists. |
| The physician's certificate | Dismissal clears current employment while preserving qualifications and professional history. |
| Marriage exit fee / a genuine accepted proposal | Existing marriage links end, or the named consenting person becomes the spouse. An existing spouse leaves their previous household immediately. |
| Sibling's false guarantee / lost shipment | A real loan remains in the debt ledger, with interest; the shipment can also reduce household wealth. |
| A royal condemnation | The bound petitioner actually dies; both canonical families record a feud and lose any alliance. |
| Dishonest coinage / paid relief | Treasury, public order, food security, faction standing and legal records change. Bribes cannot manufacture succession claims. |

Actor casting solves the complete distinct cast before offering a scene. Suitors require adult, unmarried, romance-eligible people; family roles use canonical kinship. Generic human roles exclude Quackbeard; an explicitly authored goose role can still use him. Bound health, relationship, death, feud and legal effects resolve the same IDs shown in the scene.

Seven urgent chains—miller's fever, wounded midwife, winter roof, granary rats, neighbour's fire, stolen chalice and prophetic child—schedule subsequent beats one to two years apart. Existing saved due dates remain intact. The other chains retain their longer timing. Shared cooldown groups cover overlapping relic, tax, goose, courtship and vanity premises. Weights use the currently eligible domain pool and boost actual career, kin and callback relevance. Directed continuations retain continuity priority.

Automatic royal accounting prompts have a three-year gap, using existing saved court decisions. Separate officials' scandals remain real and can still be investigated manually; legal trials and opposition responses retain priority. This prevents a long reign being consumed by the same accounting passage every year. The four new monarch scenes accept ordinary adult petitioners, rather than requiring another landed noble to remain alive in the world.

QA also corrected two save/world issues exposed by the simulations: new households now have the same capacity before and after hydration, and marriage cannot leave a spouse listed in two homes. NPC job assignment respects minimum age. Invalid queued marriage continuations are cleared without resurrecting a spouse or bypassing access checks.

## Before and after writing

These are actual baseline and current excerpts; titles and IDs remain stable except the mother correction above.

<!-- EXCERPTS -->
### `peasant_quack_doctor` — THE QUACK DOCTOR

**Before:** A 'physician' offers a magic healing crystal for 6 gold. It is visibly a pebble.

**After:** {{other}} offers a heated “healing stone” for six gold. The stone is ordinary; the explanation of its value requires a much rarer temperature.

**Before response:** Buy the healing pebble (6g) — You bought the pebble. It did nothing, but you feel optimistic. That counts for something.

**After response:** Buy the warmed stone (6g) — You pay for a warm stone and a rest beside the brazier. The rest helps a little; no illness is cured by the salesmanship.

### `child_bully` — THE MILLER’S BIG SON

**Before:** The miller’s enormous son blocks the lane and demands your lunch, which is one turnip you had plans for.

**After:** {{other}} collects lunches on behalf of the miller’s big son. The supposed protection consists of not being bothered by the people collecting it.

**Before response:** Stand your ground — You stood firm and he backed down! Word spreads that you are not to be trifled with.

**After response:** Refuse the protection fee — You refuse to surrender lunch. {{other}} backs down and remembers exactly who made the collection difficult.

### `faith_relic_vendor` — A PEDLAR OF RELICS

**Before:** A pedlar offers "a genuine feather from the Archangel Gabriel" for 8 gold. It is, unmistakably, a goose feather.

**After:** A pedlar offers a supposedly angelic feather. The story is magnificent; the object is the sort a barnyard bird leaves without an audience.

**Before response:** Buy it faithfully (8g) — You bought the feather and prayed over it nightly. Faith asks no questions. Strangely, you feel comforted.

**After response:** Buy it faithfully (8g) — You bought the feather and prayed over it nightly. Faith asks no questions. Strangely, you feel comforted.

### `court_rivalry` — A RIVAL AT COURT

**Before:** A silken-tongued rival is spreading whispers that you are "merely a jumped-up turnip-picker." The whispers are gaining traction.

**After:** {{other}} dismisses your success as an accident of useful acquaintances. The charge is delivered to as many useful acquaintances as possible.

**Before response:** Outwit them with a clever scheme — You laid a trap of gossip and watched your rival walk into it. They are disgraced; you are admired.

**After response:** Expose the contradiction in the rumour — You make {{other}} answer for the contradictory story. Your reputation rises and the rivalry becomes explicit.

### Annual first steps

**Before:** You took your first steps and immediately fell into a basket of turnips. The village applauded both events.

**After:** You take three determined steps towards a stool. {{carer}} catches you before you discover the fourth is missing.

<!-- /EXCERPTS -->

The new corpse, three-grooms, shade levy and falcon supper scenarios use the requested premises with specific decisions and persistent costs. Jokes are grounded in debt, labour, authority, evidence, public embarrassment and inconvenient affection. Quiet observations, care for older parents and the child's bowl kept warm provide contrast with dangerous choices.

## Paired deterministic life audit

The same controller ran **2,100 lives before and 2,100 after**, seeds 840000–842099, 300 in each of seven origin/role cohorts. One quarter have free access; three quarters have Premium access. Adult jobs or royal recognition are assigned once at eighteen. Artisan careers rotate among apprentice, trader, barber-surgeon, copyist and minstrel. The controller works twice yearly, rests below 75 health, chooses affordable responses by a deterministic hash and resolves RPG encounters peacefully. Mortality remains enabled. Free royal-origin lives remain claimants rather than receiving Premium rulership.

This is a controlled coverage comparison, not a prediction of real player behaviour. Later job/rank changes and natural successions are retained rather than forcing a role back each year. Revisions consume different RNG sequences, so matching seeds do not imply identical life spans. Availability samples include only survivors to each age. A single life is allowed to encounter a tiny fraction of the catalogue.

<!-- SIMULATION -->
| Measure | Before | After |
|---|---:|---:|
| Mean different interactive IDs per life | 50.62 | 51.90 |
| Mean different annual IDs per life | 32.89 | 66.33 |
| Different interactive IDs encountered across cohort | 374 | 544 |
| Different annual IDs encountered across cohort | 38 | 174 |
| Resolved choices | 113,745 | 113,945 |
| Observed serious choices | 677 | 2,992 |
| Serious choice rate | 0.60% | 2.63% |
| Exact annual repeats within twelve years | 51,743 | 0 |
| Broad annual theme repeats within two years | 1,518 | 355 |
| Broad interactive theme repeats within five years | 785 | 420 |
| Optional callbacks encountered | 0 | 528 |
| Callbacks within three years | 0 | 497 |
| Inherited callbacks after three years | 0 | 31 |
| Age-up stalls | 0 | 0 |
| Unfinished simulated lives | 0 | 0 |
| Mean age at death | 57.69 | 57.66 |

The after cohort actually resolved **126/130 new independent premises** (17,658 decisions) and **36/48 callback premises**. All end-of-life world-integrity checks passed. Neither run exceeded two consecutive years without a pending interactive event; this includes infancy, where the suitable pool remains deliberately small.

| Life role (300 lives each) | Mean interactive IDs before → after | Mean annual IDs before → after | After callbacks |
|---|---:|---:|---:|
| commoner | 50.64 → 52.25 | 32.88 → 66.13 | 70 |
| artisan_merchant | 51.55 → 51.42 | 32.80 → 65.09 | 81 |
| clergy | 50.66 → 53.01 | 32.67 → 66.51 | 99 |
| martial | 51.68 → 51.59 | 32.87 → 65.63 | 83 |
| outlaw | 50.59 → 53.17 | 32.57 → 65.66 | 62 |
| landed_noble | 51.19 → 52.37 | 33.25 → 67.04 | 59 |
| monarch | 48.04 → 49.49 | 33.20 → 68.23 | 74 |

### Availability by age and career stage

Counts below are **currently eligible lottery events**, after age, access, cast, context and cooldown gates. They exclude directed story beats. Each cell is the mean before → after, not the complete registered pool.

| Free commoner age | Mean eligible before → after | Before / after survivors sampled | After minimum–maximum |
|---|---:|---:|---:|
| 2 | 1.63 → 1.65 | 75 / 75 | 1–2 |
| 6 | 6.61 → 6.41 | 75 / 75 | 6–8 |
| 12 | 25.48 → 25.00 | 75 / 75 | 21–28 |
| 18 | 40.17 → 105.76 | 75 / 72 | 97–116 |
| 30 | 40.07 → 111.42 | 74 / 71 | 85–126 |
| 50 | 33.50 → 102.72 | 62 / 61 | 77–115 |
| 70 | 44.91 → 103.56 | 11 / 9 | 94–108 |

| Role / work stage | Free at 18 | Free at 30 | Free at 50 | Premium at 30 |
|---|---:|---:|---:|---:|
| commoner | 40.2 → 105.8 | 40.1 → 111.4 | 33.5 → 102.7 | 39.6 → 111.5 |
| artisan_merchant | 43.9 → 104.3 | 40.2 → 111.1 | 35.7 → 102.4 | 39.0 → 111.9 |
| clergy | 41.3 → 101.1 | 40.2 → 108.2 | 36.2 → 99.1 | 38.8 → 108.6 |
| martial | 39.9 → 103.5 | 40.6 → 110.2 | 34.7 → 99.6 | 39.8 → 109.3 |
| outlaw | 42.9 → 101.6 | 38.3 → 105.5 | 34.7 → 97.2 | 38.1 → 106.2 |
| landed_noble | 35.1 → 112.8 | 43.6 → 125.7 | 37.7 → 119.0 | 43.7 → 127.8 |
| monarch | 42.3 → 101.5 | 40.5 → 107.5 | 37.2 → 98.7 | 31.9 → 108.4 |

The commoner cohort works as a tenant farmer, clergy as clerics, martial as guards and outlaw as poachers. Occupational change, dismissal and imprisonment are allowed after the initial assignment. The artisan results combine five rotating occupations. The raw reports also include per-career encounter means, every availability sample count and distinct available-ID counts.

### Story completion and abandonment

| Instance measure | Before | After |
|---|---:|---:|---:|
| Persistent stories opened | 5,971 | 9,096 |
| Persistent stories completed | 2,800 | 4,104 |
| Persistent stories cancelled/failed | 856 | 1,404 |
| Persistent stories still open at death | 2,315 | 3,588 |
| Ambient chains opened | 12,654 | 8,397 |
| Ambient chains completed | 8,634 | 6,361 |
| Persistent completion rate | 46.89% | 45.12% |
| Ambient completion rate | 68.23% | 75.75% |

Ambient instances left unfinished at death: 4,020 before and 2,036 after. These counts are not additional silent endings.
<!-- /SIMULATION -->

An exact annual repeat means the same ID returned within twelve years. Broader annual semantic repeats use a two-year window; interactive semantic repeats use five years and exclude directed continuity/callbacks. The audit's deliberately broad regex groups merge, for example, rent and tax, so these counts are wider than the game's explicit theme ledger. Remaining semantic repeats are reported rather than claimed to be zero.

“Serious” means an observed choice caused death, another character's death, a new disability, imprisonment, loss of spouse/job, at least 15 health loss, at least 20 new debt, or at least 20 household wealth loss. These thresholds measure actual changes; they do not count ominous prose. The controller's choices affect the rate.

Persistent stories track started/completed/cancelled instances throughout the life, including archived stories, rather than counting only the capped end-of-life archive. Open-at-death means unfinished at death, not a blocked story. Ambient chain counts likewise count instances, not merely distinct chain IDs. Shorter urgent chains improve completion opportunities; mortality can still end a long story. The general persistent-story completion percentage is reported separately and is not presented as an improvement if it falls.

## Editorial reading

The [reading appendix](validation/narrative/editorial-histories.md) retains complete chronological player-choice and annual narrative tracks for seven selected lives and one baseline comparison. The raw JSON reports each contain fourteen full feed histories, including routine work, skill and population accounting omitted from the reading view.

The baseline commoner visibly returns to the same pig trough, seven loaves, pudding friar, chicken sums and father's knee. The revised track has household care, money worries, public records, weather, craft mishaps and old-age remembrance between its disputes. The retained pudding and goose passages work better as occasional familiar characters than as the default punchline.

Across the sampled roles, work and origin differ: the merchant starts among cloth scraps and progresses through disputed goods and guild decisions; the clerical life connects charity and parish evidence; the military household begins with ration bureaucracy; the outlaw faces evidence and punishment; noble and royal lives add precedence, public obligations and household status. They still share Swineford, ordinary neighbours and inherited stories. Common content is intentional, so the seven roles are not seven disjoint games.

The reading prompted concrete corrections: no generic human creditors or letter writers cast as the goose, three repeated refusal formulations replaced with premise-specific responses, unnecessary “actual/real” legal/health wording reduced, and separate royal accounting prompts spaced apart. The new warmth passages are retained without appending a joke to every sentence. Legal hearings, lost work, household food and named grudges make the consequences legible. The original story bank's more serious voice remains alongside the new comedy.

## Verification and limits

<!-- CHECKS -->
| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Passed |
| Full Jest suite | 89 suites, 872 tests passed |
| Additional multi-generation/reload subset | 100 three-generation dynasties, deterministic reload checkpoints and 21 education/career/court reload seeds; three selected tests passed |
| Paired narrative life audit | 2,100 before + 2,100 after; no stalls or end-of-life integrity issues |
| Production export | Web, Android and iOS passed |
| Chromium production rendering/choice/reload | 32 states passed; no page errors |
| Diff whitespace | `git diff --check` passed |
<!-- /CHECKS -->

All 130 new independent scenes have a reachable eligible fixture, distinct required actors and an affordable free response. Every selectable outcome branch is executed under its actual requirements; all declared major scenes can change lasting state. All 48 callbacks have valid source choices and reject expired/dead actors. Separate tests cover Premium gates, canonical marriage/feud/death, job preservation, title migration, actor/RNG purity, annual once/theme/cooldown behaviour, reloads, urgent pacing and invalid old continuations. The unchanged legacy stylistic, distinctiveness, reachability and determinism checks still run.

Browser checks use the production export, seven authored situations at 280/320/390/768px, three enlarged-text states at 280px and an animated-text state. They verify rendered canonical actors, no unresolved tokens or page overflow, resolved choice/binding persistence, callback provenance and RNG-preserving reloads. [Evidence](validation/narrative/browser.json) and [280px enlarged-text screenshot](validation/narrative/large-text-280.png) are committed. The choices continue to scroll inside the existing modal.

The simulation does not force every condition, choose every romance route or maintain every reign. Unencountered specialised scenes are covered by eligibility/outcome fixtures, not falsely reported as naturally encountered. Annual observations intentionally have contextual restrictions. Long stories can remain open at death, and broad theme overlap remains. The original event count includes internal passages; independent encounters and callbacks are distinguished throughout this report.

Native bundles were exported; physical iOS/Android device layouts, OS font scaling, store purchases and submission were not exercised by the Chromium checks. No deployment or store release is claimed.

## Reproducing the audit

After `npm ci`, run `npx --yes tsx@4.23.15 scripts/auditNarrative.ts --lives=2100 --seed=840000 --label=after --output=docs/validation/narrative/after-lives.json`. For the before run, check out `fc98b1a` in a separate worktree, copy the same audit script there, install dependencies and run from that worktree with `--label=before --output=docs/validation/narrative/before-lives.json`. Both committed reports use controller version 2. `--offset=N --lives=1` reproduces the corresponding individual cohort without changing its role or access assignment.

Validation commands: `npm run typecheck`; `npm test -- --runInBand`; `MLS_FULL_SOAK=1 npm test -- --runInBand src/__tests__/persistentWorldFullSoak.test.ts --testNamePattern='three-generation|reload'`; and `NODE_ENV=production EXPO_OFFLINE=1 npx expo export --platform all`.
