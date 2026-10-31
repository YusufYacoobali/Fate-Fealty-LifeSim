# Fate & Fealty v5: single-year narrative validation

31 October 2026 · Implementation `3e9c134` · Compared with `d5506a0` · Controller 4

## Delivered behaviour

All 29 persistent templates and 21 ambient chains have individually rewritten, self-contained encounters. Sixteen distinct later conflicts survive as separate encounters; 48 timed callbacks now read current circumstances. Twelve professional matters finish their selected branch and milestone immediately. Four workshop commissions lose the authored next-year gate and new delayed reward timers while keeping earned work requirements, optional forging and completed progress. Most encounters use one popup; the levy may lead directly to the Rout as the single immediate extra scene.

The registry contains 877 IDs: 520 live passages (427 independent entrypoints), including 483 free and 37 Premium live passages. The 357 read-only passages support already-visible old saves: 189 story beats, 106 chain beats, 48 echoes, 12 professional verdicts and two obsolete arc passages. None can enter new selection. There are 114 conversions and 48 new childhood scenes; 178 annual observations remain. Runtime content validation reports no errors or warnings and no live future chapter edges.

[The conversion audit](single-year-narrative-audit.md) maps every source to its actual response menu, documents the 16 salvaged conflicts and 48 childhood scenes, and supplies 11 exact before/after outcome examples. [All 88 targeted writing revisions](validation/single-year/writing-revisions.json) were checked against the original snapshot and live outcomes; their effects are unchanged. Sincere death, care and bereavement writing was preserved. Event counts are coverage evidence; the actual prose examples establish the editorial change.

## Selection, consequences and compatibility

Fresh, relevant encounters replace the old pressure to continue threads. Career, actual health/legal/secret state and canonical kin receive extra weight. A scene already seen in the current life has only a small residual selection weight. Whole-word shared themes apply one cooldown across differently named tax, levy, relic, forgery and other common premises; “parent” is not classified as “rent”. Generic casting first tries people absent from the recent six encounters, with backtracking and a weighted fallback when the cast is constrained. Fixed characters, carers, spouses, children and actual family enemies retain their identities. Eligibility never generates actors or consumes RNG.

Warnings inspect both chance branches and duel stakes. They cover large personal/household losses, debt, injury, disability, death, imprisonment, serious charges, divorce, dismissal, standing, feuds and major political harm. Professional warnings distinguish the actual harmful methods. An affordability requirement alone is not described as money spent. The existing EventModal warning rows, fonts, animation, sound/haptic paths and button layout are retained. The existing own-family/already-allied political guards and response-before-deposition checks remain covered by the court tests.

Content version 9 keeps save schema 7. Unfinished stories become terminal `retired` records without assumed victories or penalties. Threads/arcs and future professional verdict obligations are archived without rewards. A valid visible legacy passage resolves its saved choice and cast, including a story cast recovered from its own saved metadata; a missing/dead cast closes without replacement or rewards. Re-resolving a finished choice cannot duplicate rewards. Historical choices, genealogies, purchases and world RNG survive. Only empty authored history reminders are removed; existing real financial, relationship, condition and medical consequences remain.

Education duration, pregnancy/adoption, illness progression, clinical follow-up, debt interest, legal proceedings, career advancement and autonomous NPC resentment remain multi-year simulation. Optional caravan/combat gameplay and work/skill-gated career assignments remain. These do not schedule authored chapters.

## Matched deterministic life cohorts

Both revisions ran **2,100 lives**, seeds **840000–842099**, using byte-identical controller and whole-word theme probe files. Seven origin/role cohorts have 300 lives each. Access is 525 free and 1,575 Premium lives; artisan careers rotate across craft, trade, medicine, law and entertainment. Roles/jobs are assigned once at eighteen; subsequent dismissals, political changes and deaths remain real. Free royal births retain their claims without bypassing Premium rule. Two work actions and rest below 75 health use the same policy in each revision. Choices use a deterministic hash; mortality is active. Reload checkpoints occur at twelve, thirty and fifty, with half the cohort continuing from the reloaded state. Neither cohort exercises every manual professional action; exhaustive professional/forge tests and the depth/dynasty tests cover those paths.

These are matched seeds and policy, not identical lifespans: new content and social casting change RNG use and consequences. Independent encounters exclude internal story chapters, callbacks and directed continuations in both revisions. All interactive IDs include those old chapters, so both measures are shown.

| Measure | Before | After |
| --- | ---: | ---: |
| Completed lives | 2,100 | 2,100 |
| Distinct independent encounters per life | 23.57 | 45.86 |
| Distinct interactive IDs per life, including internal passages | 51.71 | 47.16 |
| Independent encounters: min–max | 7–40 | 13–82 |
| Independent encounters: standard deviation | 4.43 | 12.67 |
| Mean death age | 57.50 | 52.64 |
| Distinct independent encounters per 100 life-years | 40.99 | 87.11 |
| Interactive resolutions | 113,580 | 106,923 |
| Popups per life-year | 0.94 | 0.97 |
| Mean years containing a narrative popup | 53.82 | 50.70 |
| Maximum popups in a year | 3 | 2 |
| Repeated interactive resolutions, all IDs | 4,996 | 7,891 |
| Repeated independent resolutions | 1,695 | 391 |
| Independent resolution repeat share | 3.31% | 0.40% |
| Interactive shared-theme recurrences within five years | 145 | 0 |
| Exact annual-message repeats inside twelve years | 0 | 0 |
| Annual shared-theme recurrences inside two years | 113 | 107 |
| Choices causing a serious state change | 4,001 | 10,463 |
| Serious state-change rate | 3.52% | 9.79% |
| Authored schedules created | 17,474 | 0 |
| Maximum simultaneously open authored plots | 9 | 0 |
| Authored plots open at death | 5,652 | 0 |
| Reload comparisons | 5,757 | 5,340 |
| Reload inconsistencies | 0 | 0 |
| Stalls / unfinished lives | 0 / 0 | 0 / 0 |

Independent encounter repetition falls from 3.31% to 0.40%. The all-ID repeat total rises because genuine directed hearings and court events recur; those repetitions remain visible in the table rather than being removed from the report. All-ID variety also falls with the removal of distinct chapter IDs and shorter mean lifespans, while complete independent encounters almost double. [repeat-analysis.json](validation/single-year/repeat-analysis.json) derives the independent/directed split from the recorded event uses and registry metadata.

The serious-change counter records actual death/NPC death, severe health loss or disability, large gold/household/debt changes, loss of job/spouse/crown, a new family enemy or imprisonment. It measures realised harm, not merely a risky option being offered. Open authored plots include active/paused stories, threads, queued arcs and delayed professional verdicts; real legal/medical/pregnancy processes are excluded. The after controller checks for authored plot state after each collected mutation and throws on any occurrence. There are no unfinished lives, stalled encounters or integrity errors. The shared-theme probe is heuristic and checks the listed recurring premises, not every possible resemblance in prose; annual observations have their own pacing policy.

| Role cohort | Before independent encounters/life | After independent encounters/life | After life-years (mean) |
| --- | ---: | ---: | ---: |
| commoner | 23.98 | 47.09 | 53.30 |
| artisan_merchant | 23.49 | 46.60 | 53.02 |
| clergy | 23.85 | 46.13 | 52.34 |
| martial | 23.52 | 46.25 | 52.74 |
| outlaw | 23.69 | 46.18 | 52.30 |
| landed_noble | 23.46 | 44.88 | 51.11 |
| monarch | 22.97 | 43.89 | 53.69 |

## Eligibility by age and actual profession

These are post-resolution eligibility samples from surviving lives, so once-only scenes already encountered are excluded. No actors or eligibility flags are fabricated for this table. Individual orphanhood, illness, legal state, previous choices and kin affect the pool. Full role/access/age and actual-profession/access/age tables are in the JSON reports.

| Age / access | Before eligible mean | After eligible mean | After min–max | Surviving samples |
| --- | ---: | ---: | ---: | ---: |
| 2 / free | 1.61 | 11.34 | 10–12 | 525 |
| 2 / premium | 1.46 | 11.16 | 10–12 | 1,575 |
| 6 / free | 5.76 | 23.03 | 21–25 | 525 |
| 6 / premium | 5.70 | 22.88 | 21–25 | 1,575 |
| 12 / free | 23.49 | 42.49 | 31–48 | 525 |
| 12 / premium | 22.71 | 41.55 | 23–48 | 1,575 |
| 18 / free | 104.51 | 131.17 | 105–159 | 515 |
| 18 / premium | 106.37 | 136.07 | 100–173 | 1,539 |
| 30 / free | 111.87 | 140.00 | 100–184 | 462 |
| 30 / premium | 112.34 | 144.73 | 100–185 | 1,400 |
| 50 / free | 103.12 | 127.41 | 90–164 | 340 |
| 50 / premium | 105.35 | 135.34 | 92–184 | 1,038 |

| Actual profession at 30 / access | Eligible mean | Min–max | Samples |
| --- | ---: | ---: | ---: |
| apprentice/free | 144.20 | 116–167 | 10 |
| apprentice/premium | 153.56 | 130–180 | 36 |
| barber_surgeon/free | 142.11 | 116–155 | 9 |
| barber_surgeon/premium | 137.86 | 111–168 | 36 |
| cleric/free | 135.02 | 100–166 | 58 |
| cleric/premium | 138.52 | 100–171 | 181 |
| copyist/free | 143.86 | 132–161 | 7 |
| copyist/premium | 140.50 | 114–159 | 38 |
| guard/free | 138.92 | 103–167 | 62 |
| guard/premium | 141.71 | 111–166 | 185 |
| minstrel/free | 134.42 | 118–153 | 12 |
| minstrel/premium | 136.84 | 112–159 | 32 |
| none/free | 144.65 | 108–180 | 175 |
| none/premium | 151.69 | 111–185 | 477 |
| poacher_job/free | 135.75 | 110–165 | 57 |
| poacher_job/premium | 139.46 | 110–169 | 189 |
| tenant_farmer/free | 134.76 | 101–153 | 63 |
| tenant_farmer/premium | 141.20 | 111–173 | 192 |
| trader/free | 150.56 | 131–184 | 9 |
| trader/premium | 155.94 | 142–176 | 34 |

The fixed-seed childhood acceptance test separately advances fourteen natural free/Premium lives across all seven origins and requires at least ten surviving samples, with a minimum pool of 15 at six and 35 at twelve. All 48 added childhood scenes have living casts, free responses and complete immediate outcomes.

## Verification

- `npm run typecheck`: passed.
- `npm test -- --runInBand`: **92 suites, 912 tests passed**. The chapter progression contracts were replaced with non-vacuous conversion, current-year closure, legacy-save, actor, choice-idempotency and consequence tests. Existing simulation, purchase, audio, combat, education, pregnancy, legal and court checks remain.
- `MLS_FULL_SOAK=1 npm test -- --runInBand src/__tests__/persistentWorldFullSoak.test.ts -t three-generation`: **100 three-generation dynasties passed**. The full suite also runs the existing 21 paired depth/reload seeds and other world/life soaks. The optional 500-per-difficulty extended matrix was not run in this task.
- Production Expo export for **web, iOS and Android**: passed.
- Chromium against the production export: **40 render/choice/reload states passed** at 280, 320, 390 and 768px, including three enlarged-text cases and an animated typewriter case. Fixtures cover childhood, inheritance, marriage, risky trade, a current family feud, rewritten old comedy, royal danger, a professional case and the two-popup battle. Known severe warning text, bound actors, same-year closure, no open authored plots, choice history and reload RNG were checked. All six tabs also passed at 280px with 1.35× text; People uses the narrow KIN label. Screenshots retain the parchment, pixel fonts, colours and borders. Text enlargement uses browser CSS, not an OS accessibility setting.
- Runtime content validation and `git diff --check`: passed.

[checks.json](validation/single-year/checks.json), [browser.json](validation/single-year/browser.json), [navigation.json](validation/single-year/navigation.json), the source snapshot and full life reports hold the evidence. The catalogue audit includes exact outcome examples; [sample-review.md](validation/single-year/sample-review.md) records qualitative review of complete life sequences and additional role chronologies.

## Remaining release checks

`npm run release:check` still fails because the previously documented **published Android TERMS_OF_USE_URL is missing**. No URL was invented and release configuration was not weakened. Native export proves bundling, not signed device acceptance. Signed iOS/Android testing must still cover real OS text scaling/reduced motion, sound/haptics, background/resume, store purchases/restores and the existing account/privacy/store setup in [meta-ads-release.md](meta-ads-release.md). No store build was submitted or published.

## Reproduction

Use tsx 4.23.15 (the audit runner used `/tmp/fate-review-tools/node_modules/.bin/tsx`). On the implementation revision:

```sh
npx --yes tsx@4.23.15 scripts/auditNarrative.ts --lives=2100 --seed=840000 --label=after-single-year --output=/tmp/after-lives.json
```

For the baseline, create a detached worktree at `d5506a0`, provide its dependencies, and copy **only** the controller and `src/content/sharedNarrativeThemes.ts` from `3e9c134`. Run the same command there with the before label/output. The old content registry does not import the new helper; only the measurement controller uses it, so baseline selection is unchanged. Both recorded runs use controller version 4 and identical helper/controller hashes in checks.json.
