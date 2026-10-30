# Life depth overhaul — implementation and verification

Implemented on `v5`, from `7b851eccb146f14391aa98c0d5b2fd666a8a01c4`. No changes were made to `main`.

## Implemented systems

- **Seven origins:** Peasant, Artisan, Merchant, Church-affiliated, Military, Noble and Royal. Random Birth remains the default. Custom Birth uses the existing creation controls; ordinary origins are free. Royal birth uses the existing entitlement, including the existing first-life sample. Generated parents, household finances, family occupations, contacts, introductions and childhood opportunities differ by origin. Royal birth grants kinship and claims, with an elder sibling ahead in succession.
- **Learning:** household learning, parish learning, guild apprenticeship, cathedral education, martial training and noble tutoring. Remaining without formal education and later-life study remain possible. A bursary provides an accessible route for poor children. Mentors and classmates are canonical characters with their own learning records. Peer misconduct creates relationships, memories and family enemies. Tracks have age and service requirements; six qualifications affect career eligibility. Household learning develops Husbandry without automatically granting literacy.
- **Independent status:** estate, martial honour, profession, office and royal claim are separate. `rankIdx` remains an adapter. General standing does not grant a barony or crown. Existing saved titles receive legacy grants. A noble does not automatically receive military achievements; professional success contributes to legacy scores and death chronicles.
- **Ten professions:** agriculture, craft, trade, church, martial, court, medicine, entertainment, law and outlaw each have three distinct base actions. The six priority families also have two authored commissions each, with three approaches, a later reckoning and distinct outcomes. Professional records, clients, rivals, assistants, milestones and reputation survive job changes. Payments remain owned by the existing career engine; specialization actions have separate bounded costs and rewards. Existing forge, caravan, equipment, contracts and RPG skills remain in use.
- **Persistent politics:** one recognised ruler, a designated heir, regencies, four unique council offices, competing claims, treasury and legitimacy. Free characters can gain patronage, influence and appointments. All player routes to the crown require existing Premium access. Decisions affect food, order, prosperity, religious tension, military threats, factions, legal states, titles and relationships. Officials can divert funds, seek vacant appointments, support claimants, oppose decrees and destabilise a ruler. A failed ruler can be deposed and exiled while the world continues.
- **Continuity:** heirs retain the same court, unresolved scandals, political consequences, household rivalries and unfinished professional matters. A profession can leave family credit without automatically granting the heir the occupation or qualifications. The first-life sample does not become hereditary Premium access.

## Content and pacing

The registry includes 24 authored learning encounters, seven origin encounters, 24 professional commission nodes and the royal accounts scandal. Each education track has four encounters. The Life Director uses its existing single annual event slot; learning encounters occupy at most the scheduled third-year opportunity, while professional reckonings have reliable continuations. Every new event has a selectable affordable route.

Learning is limited to three opportunities per year, professional specialization to three matters per family per year, and court play to three matters per year. All use the existing shared action clock. Completed actions have replay protection; graduation and resolved commissions do not repeat rewards. Classmates, teachers and professional contacts have missing-actor recovery and reference retention.

Existing royal events were integrated with the court: naming an heir selects an actual claimant, the empty treasury event uses royal funds, disputed claims use protected recognition, and abdication/deposition update the ruler. Fixed parental names and universal peasant-family assumptions were removed from the affected content. The existing pixel palette, fonts, illustrations, modals and bottom navigation remain.

## Save compatibility

The game and envelope schema are version 6, while the storage key remains `mls:world:v5` so previous saves cannot be silently shadowed. Versions 3–5 are normalized additively. Migration preserves the world RNG continuation and consumes no random draws. Existing story IDs, trade journeys, crafting, equipment, genealogy, career state and purchase handling remain.

New character fields live on `world.characters`; the court lives on `world.court`. Cloning includes all new nested state. Normalization is idempotent. Newer and unreadable saves block loading and autosave writes instead of being replaced. Store access continues to be revalidated by the existing entitlement flow; background migration does not buy or revoke anything.

## Main changed files

| Area | Files |
| --- | --- |
| Types and migration | `src/types/lifeDepth.ts`, `src/types/game.ts`, `src/engine/lifeDepthState.ts`, `src/engine/gameState.ts`, `src/engine/characterState.ts`, `src/state/persistence.ts` |
| Origins | `src/data/birthOrigins.ts`, `src/engine/birthOriginEngine.ts`, `src/components/modals/CharacterCreation.tsx`, `src/engine/kinFactory.ts` |
| Education | `src/data/education.ts`, `src/engine/educationEngine.ts`, `src/content/educationEvents.ts`, `src/components/tabs/EducationPanel.tsx` |
| Professions | `src/data/careerSpecializations.ts`, `src/data/professionalStories.ts`, `src/engine/careerSpecializationEngine.ts`, `src/engine/careerEngine.ts`, `src/data/careers.ts`, `src/content/careerSpecializationEvents.ts`, `src/components/tabs/career-panel.tsx` |
| Politics | `src/data/politicalOffices.ts`, `src/engine/courtEngine.ts`, `src/engine/royalSuccessionEngine.ts`, `src/content/royalCourtEvents.ts`, `src/components/tabs/CourtPanel.tsx` |
| Integration | `src/state/gameReducer.ts`, `src/engine/director/index.ts`, `src/engine/lifeDirector.ts`, `src/engine/eventPicker.ts`, `src/engine/successionEngine.ts`, `src/engine/npcDirector.ts`, `src/engine/worldEngine.ts`, `src/engine/worldIntegrity.ts`, `src/state/hooks/useProTrial.ts` |
| Status and legacy | `src/engine/pathProgression.ts`, `src/state/viewModel.ts`, `src/engine/deathEngine.ts`, `src/engine/consequenceEngine.ts`, `src/data/achievements.ts`, `src/data/goals.ts`, `src/components/tabs/MeTab.tsx`, `src/components/modals/PromotionScreen.tsx` |
| Existing screens and content | `DoTab.tsx`, `HoldingTab.tsx`, `GameScreen.tsx`, `OnboardingScreen.tsx`, birth/family/annual/premium content and the event registry |
| Verification | New origin, foundation, education, profession, commission, court and acceptance tests; expanded `persistentWorldFullSoak.test.ts`; updated `scripts/simulate.ts`, `scripts/simulateSmart.ts`, `scripts/balance.ts` |

The complete file list is available with `git diff --name-only 7b851ec..v5`.

## Reproducible acceptance scenarios

`src/__tests__/lifeDepthAcceptance.test.ts` covers all six requested scenarios:

1. **A — Peasant physician:** a penniless peasant earns a bursary, gains literacy, enters herb work, trains, treats actual patients, retains an assistant, establishes a recognised practice and becomes a physician while remaining a commoner. Rest is required to survive the workload.
2. **B — Merchant dynasty:** an heir receives family credit, the same commercial rival and an unresolved wool dispute, then concludes that dispute in the inherited world.
3. **C — Noble childhood:** tutoring produces court qualifications, and the same bullied classmate becomes the rival in adult court work.
4. **D — Royal succession:** a royal child begins behind a senior claim, inherits after the competing heir and ruler die, and makes a decision that spends real treasury funds.
5. **E — Failed monarch:** a corrupt appointment and hostile conditions lead to deposition and an ongoing exiled life.
6. **F — Free political career:** a free courtier earns patronage, influence and a unique office while all crown routes remain closed.

These tests control unrelated annual hazards to isolate the gameplay contracts. The full soak exercises the actual Life Director, mortality and autonomous world.

## Validation results

| Check | Result |
| --- | --- |
| `npm test -- --runInBand` | 80 suites, 796 tests passed |
| `npm run typecheck` | Passed |
| `npm run test:soak` | Passed: 7 tests, 2,201 completed lives, 100 three-generation simulations and deterministic checkpoints (938 seconds) |
| `npx tsx scripts/simulate.ts` | 500 complete lives, all invariants passed; mean death age 19.3, oldest 41 |
| `npx tsx scripts/simulateSmart.ts` | 300 complete lives; two reached Monarch |
| `npx tsx scripts/balance.ts --holding` | Passed: 2,000 lives per difficulty; mean lifespan 60.3 Merciful / 55.8 Normal / 42.1 Brutal. A further 30-life smoke run verified the corrected rotating-goal report counter. |
| `npx tsx scripts/auditAges.ts` | Passed; no adult events eligible at ages 0, 2 or 4 |
| Production Expo export for Android, iOS and web | Passed, with production JavaScript/Hermes bundles and assets |
| Browser layout and input | Creation at 320px; education, career and court at 280/320/390px; profile at 280/320px. No document-width overflow or runtime errors. Study, patient care and royal relief each spend one action; relief debits the treasury. The existing category strip continues to scroll horizontally. |
| `npm run release:check` | Blocked by missing published Android `TERMS_OF_USE_URL` |

The full soak completed 500 completed lives per difficulty (1,500 total), 100 three-generation dynasty simulations, another 100 lives per existing life role (700 total), a fixed regression life, every persistent story ending and deterministic reload comparisons. The extension exercises schooling, work, professional milestones and royal relief across backgrounds and entitlement configurations. Twenty-one additional seeded comparisons cover equivalent interrupted/uninterrupted education, career and court play.

The general and focused bot scripts now use seeded worlds and reducer transactions. The balance report counts fulfilled ambitions through the durable `goal_done` tag because the engine rotates active goals immediately. `MLS_BALANCE_LIVES` permits a shorter reporting smoke run; the default remains 2,000 per difficulty. Old assertions about a 30-person population were updated to the existing world’s 60-person limit. The legacy balance agent remains a stat-focused strategy; its printed cumulative rank counters use `rankIdx`, so its Knight-or-higher count includes noble birth. Actual martial honours are checked separately by the new status tests and UI.

The random agent’s 19.3-year average and the balance agent’s 42.1–60.3-year averages reflect different policies, difficulty and access. Healing and household management matter. The six acceptance scenarios separately establish that qualified professionals and political careers can progress without inheriting an aristocratic title.

Professional and court action costs and yearly limits prevent unlimited reward taps. Positive royal funds are capped at 5,000; professional standing remains within -100…100, world conditions within 0…100, and repeated resolved commissions cannot pay again. Broad simulation bounds, save size/load timing and engine p95 budgets remain covered by the existing tests.

Screenshots and command logs were retained in the execution workspace under `/workspace/validation/fate-depth/`. These browser fixtures verify the preserved pixel UI and input paths; native performance remains a device check.

## Remaining release work

No gameplay phase was intentionally deferred. The local release configuration check requires the app’s published HTTPS `TERMS_OF_USE_URL` for Android. That value was absent in the repository and was not invented. Set this to the app’s existing published terms page before a release.

Signed iOS and Android device checks remain outstanding: touch input, safe areas and keyboards, background/resume and process-death recovery, real store purchase/restore and entitlement transitions, notifications/audio, native performance and accessibility. Metro production exports and browser checks establish JavaScript/export and web-layout behavior; native release-device acceptance remains separate.
