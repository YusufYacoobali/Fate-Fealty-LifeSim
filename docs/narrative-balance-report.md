# Fate & Fealty v5: final narrative balance and comedy pass

31 October 2026 · Baseline `49f5501` · Content version 10 · Save schema 7

Balanced mean death age rises from **52.64 to 60.11**, while explicit event deaths fall from **720 to 100** in 2,100 lives. The like-for-like v5 severe-choice rate changes from **17.82% to 17.86%**. Less immediate death therefore does not mean the removal of serious consequences; the two measurements describe different effects. The result is above the older 57.50-year reference rather than forced to match it.

## Risk-balance audit

The baseline balanced cohort reproduces the previous mean death age of **52.64**. It separates 720 explicit event deaths, 1,296 age-related deaths, 70 health-collapse deaths and 14 illness deaths. This establishes the immediate narrative hazards as a substantial cause of early deaths; the old serious-outcome percentage alone could not establish that. The nine graded branches account for 714 of those 720 explicit baseline deaths; the remaining six are the knowingly accepted poison-tasting danger. `deathEngine.ts` and difficulty modifiers are unchanged.

Nine dangerous branches now have three current-year outcomes: success, a nonfatal setback and a conditional catastrophe. Ferries, quarry shortcuts, the condemned rope, lightning, the damaged bridge, plague responses and battlefield concealment retain real lethal outcomes. Injuries and sickness can still kill a vulnerable player immediately or progress through the existing medical simulation. Knowingly drinking suspected poison, joining a treasonous conspiracy and royal assassination dangers remain lethal under their existing rules.

| Branch | Previous nominal direct death risk | New nominal direct catastrophe risk | Ordinary failed attempt |
| --- | ---: | ---: | --- |
| Overloaded ferry | 40% | 3.2% | Injury and lost health |
| Damaged bridge | 50% | 5% | Wound and lost health |
| Condemned rope | 45% | 5.4% | Broken bone |
| Lightning demonstration | 55% | 12.1% | Burns |
| Quarry at 80 health | 33.6% | 3.36% | Broken bone |
| Fleeing plague | 25% | 2% | Actual lung fever |
| Tending plague at 50 faith | 43.3% | 5.2% | Actual lung fever |
| Barricading against plague | 40% | 1.6% | Actual lung fever |
| Battlefield concealment | 30% | 4.5% | Wound and lost health |

These are nominal direct fatality probabilities before trait adjustments to the first roll. Catastrophe is conditional on failure; health collapse and later illness are additional real risks. The existing warning UI inspects catastrophe as well as success/failure and duel stakes. It still explicitly warns of death, injuries and lasting harm. No guaranteed-survival flag or mortality modifier was introduced.

## Three decision policies

Cautious chooses the least severe authored physical, legal, financial or relationship branch; reckless prefers the most severe; balanced uses the existing deterministic hash across enabled choices. This is a deterministic maximum-authored-severity policy, not a human study or an expected-value optimiser. Hash ties, origins, seed range 840000–842099, once-at-eighteen occupations, Premium distribution, two work actions and rest below 75 health are consistent. Each policy contains **2,100 before and 2,100 after lives**, or **12,600 total**. Natural mortality is active. The RPG helper uses peaceful options and yields timing challenges for every policy, so this evaluates narrative decisions rather than combat timing ability.

| Policy | Mean age before → after | Median before → after | Deaths before 45, before → after | Event-driven deaths per 100 lives, before → after |
| --- | ---: | ---: | ---: | ---: |
| cautious | 59.31 → 61.87 | 59 → 61 | 161 → 13 | 13.57 → 1.10 |
| balanced | 52.64 → 60.11 | 55 → 60 | 505 → 88 | 34.81 → 6 |
| reckless | 46.59 → 57.19 | 49 → 58 | 880 → 260 | 53.76 → 12.71 |

| Death category | Cautious before / after | Balanced before / after | Reckless before / after |
| --- | ---: | ---: | ---: |
| old_age | 1813 / 2071 | 1296 / 1856 | 853 / 1593 |
| illness_and_deterioration | 2 / 6 | 14 / 23 | 16 / 38 |
| explicit_event_death | 285 / 23 | 720 / 100 | 1084 / 169 |
| accumulated_injury_or_health_loss | 0 / 0 | 70 / 121 | 147 / 300 |
| outlaw_hazard | 0 / 0 | 0 / 0 | 0 / 0 |
| military_or_combat_hazard | 0 / 0 | 0 / 0 | 0 / 0 |
| other_identified | 0 / 0 | 0 / 0 | 0 / 0 |

Primary death categories are exclusive: a fatal battlefield choice appears under explicit event death rather than being counted again under background military hazards. A combat death from depleted health is recorded under health loss; its combat stage and challenge origin remain in the raw record. The actual battlefield decision remains identifiable below.

| Explicit fatal choice in the balanced cohorts | Deaths before | Deaths after |
| --- | ---: | ---: |
| `life_pilgrim_bridge/cross` | 117 | 9 |
| `life_lightning_rod/hold` | 109 | 28 |
| `plague_arrives/plague_arrives_choice_2` | 99 | 18 |
| `life_boat_fare/board` | 91 | 7 |
| `life_gallows_rope/climb` | 75 | 10 |
| `plague_arrives/plague_arrives_choice_3` | 71 | 1 |
| `life_quarry_shortcut/ledge` | 62 | 6 |
| `plague_arrives/plague_arrives_choice_1` | 47 | 5 |
| `arc_war_2/arc_war_2_choice_2` | 43 | 10 |
| `life_crown_taster/drink` | 6 | 5 |
| `monarch_assassin/monarch_assassin_choice_1` | 0 | 1 |

Annual health-collapse attribution records the active conditions; an old injury is context, not proof that it caused a death decades later. Every direct event death records the actual event ID, choice ID, label, age, cause and before/after health in `deathDecisions`. The last health-damaging decision is recorded separately rather than automatically blamed for a subsequent natural death.

## Severe consequences

V5 reports new legal charges as well as actual penalties and injuries. Its rate therefore must not be compared directly with the previous 9.79% measure, which excluded many charges. Categories overlap; imprisonment and sentence extensions are custodial legal penalties, while large financial penalties also appear under wealth loss. Lesser fines are not classified as severe financial losses. Counts below are choice incidences with actual changes, not merely warnings shown; a choice killing multiple NPCs contributes one NPC-death incidence.

| Choice-level measure | Cautious before / after | Balanced before / after | Reckless before / after |
| --- | ---: | ---: | ---: |
| Choices resolved | 120039 / 125043 | 106923 / 121877 | 95081 / 116409 |
| Choices with a severe consequence | 1528 / 1315 | 19051 / 21772 | 34864 / 43780 |
| Severe choices as a percentage | 1.27% / 1.05% | 17.82% / 17.86% | 36.67% / 37.61% |

| Category | Cautious before / after | Balanced before / after | Reckless before / after |
| --- | ---: | ---: | ---: |
| debt | 175 / 190 | 438 / 570 | 575 / 753 |
| wealth_loss | 645 / 691 | 2337 / 2672 | 3944 / 4766 |
| legal_charge | 0 / 0 | 8853 / 10866 | 16959 / 22742 |
| imprisonment | 0 / 0 | 5898 / 6917 | 11510 / 14653 |
| disability | 0 / 0 | 637 / 750 | 1255 / 1653 |
| severe_health_loss | 132 / 127 | 1168 / 1691 | 2101 / 3417 |
| family_feud | 0 / 0 | 379 / 514 | 488 / 754 |
| employment_loss | 0 / 0 | 29 / 38 | 45 / 47 |
| relationship_breakdown | 0 / 0 | 28 / 23 | 50 / 55 |
| death | 285 / 23 | 731 / 126 | 1129 / 265 |
| npc_death | 284 / 269 | 207 / 222 | 137 / 170 |
| status_loss | 41 / 16 | 75 / 18 | 95 / 35 |

## Directed events and legal correctness

Previously opening a trial marked its first charge resolved before the player chose. The displayed charge could consequently be another offence or no offence at all. A hearing now snapshots real outstanding charge IDs; every charge receives a finding only when answered. One combined sentence accounts for the actual severity and additional charges, with a reduced confession sentence. Bribery retains its 20g cost, faith and notoriety effects; confession retains restitution up to 12g. Bribery exposed during the hearing is an actual new act, not an invented accusation for variety. Replaying a resolved hearing cannot charge or imprison again; later unrelated charges are not silently consumed.

Presentation distinguishes theft, fraud, forgery, harm, political accusations and other real offences. It uses actual evidence, witnesses, injured households, witness feuds and known prior convictions. A visible unanswered v9 charge consumed by the old opening hook is restored once; completed findings, genealogy, purchases and RNG remain. Content migration adds stable identities to old royal incidents without assuming an outcome.

Royal scandals vary by office and the actual official’s personality. The pending decision identifies one scandal; resolved incidents cannot recover money twice or accidentally resolve the next scandal. Routine automatic scandals have an eight-year gap and one presentation per incident. Manual court investigations remain available. Active trials, actual petitions and urgent opposition/crisis audiences bypass that routine pacing; the response-before-deposition guard remains covered. Unresolved scandals are retained rather than dropped by the old fixed list tail.

| Directed measure | Cautious before → after | Balanced before → after | Reckless before → after |
| --- | ---: | ---: | ---: |
| Legal hearings | 0 → 0 | 8668 → 9828 | 16634 → 20273 |
| Same legal event ID after its first use in a life | 0 → 0 | 6616 → 7740 | 14537 → 18174 |
| Routine royal scandal popups | 1101 → 875 | 1045 → 858 | 1003 → 852 |
| Same royal scandal event ID after first use | 864 → 646 | 821 → 632 | 788 → 625 |
| Opposition audiences | 28 → 29 | 62 → 44 | 88 → 76 |
| Hearings per 100 life-years | 0 → 0 | 7.84 → 7.79 | 17.00 → 16.88 |
| Scandals per 100 life-years | 0.88 → 0.67 | 0.95 → 0.68 | 1.03 → 0.71 |
| Share of life-years with a legal/court popup | 0.91% → 0.70% | 8.84% → 8.50% | 18.12% → 17.65% |

| Premium royal-origin cohort | Cautious before → after | Balanced before → after | Reckless before → after |
| --- | ---: | ---: | ---: |
| Lives | 225 → 225 | 225 → 225 | 225 → 225 |
| Routine scandal popups per life | 4.62 → 3.85 | 4.54 → 3.78 | 4.38 → 3.75 |
| Lives receiving more than one routine scandal | 211 → 212 | 192 → 209 | 190 → 211 |

This is the Premium royal-origin cohort, including childhood and lives ending before adult recognition; it is not a measurement of regnal tenure.

Repeated legal IDs can represent genuinely different crimes. They are reported without suppressing real obligations. Longer lifespans give more opportunities for both crimes and hearings, so per-year rates accompany totals. The share excludes the immediate battlefield scene; all internal passage counts remain in the raw reports.

## Comedy and variety

The focused editorial pass rewrites **52 outcomes across 48 existing events**; nine further court/legal outcome passages were polished with the system changes. Good sincere care, bereavement and tense scenes were retained. **25 new encounters** concentrate on social embarrassment, romance, absurd ambition, grudges and reversals. They include the bribed champion, escaped love letter, Ordinary John’s disguise, jealous portrait, rival’s turning saddle and accidental hero with a dog. No new narrative schedule or UI dashboard was added.

[The editorial audit](narrative-balance-editorial.md) lists every rewritten and added event and supplies twelve exact before/after outcome examples. The 52 original editorial effects were checked against the baseline snapshot. Legal mechanics changes and graded hazards are documented separately rather than described as text-only edits. Taxation, accounts and hearings remain where they serve the setting; the new scenes broaden the comic subjects rather than deleting good examples or imposing a cosmetic keyword quota.

| Variety and integrity | Cautious before → after | Balanced before → after | Reckless before → after |
| --- | ---: | ---: | ---: |
| Distinct independent encounters per life | 56.10 → 58.55 | 45.86 → 52.40 | 36.49 → 44.81 |
| Shared interactive theme recurrences inside five years | 0 → 0 | 0 → 0 | 0 → 0 |
| Authored future schedules | 0 → 0 | 0 → 0 | 0 → 0 |
| Authored plots open at death | 0 → 0 | 0 → 0 | 0 → 0 |
| Reload checkpoints | 5930 → 6130 | 5340 → 6016 | 4738 → 5753 |
| Reload inconsistencies | 0 → 0 | 0 → 0 | 0 → 0 |
| World integrity failures | 0 → 0 | 0 → 0 | 0 → 0 |
| Maximum narrative popups per year | 2 → 2 | 2 → 2 | 2 → 2 |

| Balanced role (300 lives each) | Mean death age before → after | Distinct encounter IDs before → after |
| --- | ---: | ---: |
| commoner | 53.30 → 60.64 | 48.31 → 54.83 |
| artisan_merchant | 53.02 → 61.20 | 47.76 → 54.99 |
| clergy | 52.34 → 60.95 | 47.35 → 54.99 |
| martial | 52.74 → 58.83 | 47.46 → 52.61 |
| outlaw | 52.30 → 58.49 | 47.35 → 52.83 |
| landed_noble | 51.11 → 60.87 | 46.06 → 54.56 |
| monarch | 53.69 → 59.79 | 45.81 → 51.59 |

Complete personal life sequences and additional role chronologies were read for editorial review; findings are in [the sample review](validation/balance/sample-review.md). Counts do not establish humour quality: actual outcomes and complete sequences supply that evidence.

## Verification and release limits

The validation manifest records TypeScript, the full Jest suite, existing depth/reload checks, 100 three-generation dynasties, content validation, production exports for web/iOS/Android and Chromium checks. The existing EventModal and navigation components, pixel fonts, colours, borders, animation and sound/haptic paths were preserved. Browser cases cover 280, 320, 390 and 768px, enlarged text, long multi-charge narration and severe warnings; all six tabs are checked at 280px with 1.35× text. CSS text enlargement is not a substitute for OS accessibility testing.

Signed device testing, real audio/haptics, background/resume, purchases/restores and the previously documented Android terms URL remain release checks. No store submission or native signed build was performed. See [meta-ads-release.md](meta-ads-release.md).

## Reproduction

Use tsx 4.23.15 and run the following for each of `cautious`, `balanced` and `reckless`:

```sh
npx --yes tsx@4.23.15 scripts/auditNarrative.ts --lives=2100 --seed=840000 --policy=balanced --output=/tmp/after-balanced.json
node scripts/reportNarrativeBalance.cjs docs/validation/balance
```

For the before run, create a detached worktree at `49f5501` and copy only `scripts/auditNarrative.ts` and `scripts/narrativeRiskAudit.ts` into it, with the same dependencies. The helper selects audit choices under the stated policy and records effects; the baseline gameplay engine and content are unchanged. UI fixtures and Chromium checks are reproducible with `scripts/createNarrativeBalanceUiFixtures.ts`, `scripts/verifyNarrativeBalanceUi.cjs` and `scripts/verifyNarrativeBalanceNavigation.cjs`. Serve the production export at localhost:8102; install Playwright separately or set `PLAYWRIGHT_MODULE`, and set `CHROMIUM_EXECUTABLE` for a system browser. Raw simulation records remain in the six policy JSON files. `comparison.json` records derived statistics and the explicit player/NPC counter adjustment for earlier v5 instrumentation.
