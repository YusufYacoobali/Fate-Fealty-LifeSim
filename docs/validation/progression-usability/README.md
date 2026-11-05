# Progression, usability and narrative validation

Implemented on `v5` from reviewed baseline `a29b44f7ccc5aed56fab0a31e428ae8047154353`. Validation date: 5 November 2026. The existing pixel art, parchment panels, fonts, palette, navigation, entitlements and genealogy remain in use.

## Implementation and review

| Stage | Commit | Result |
| --- | --- | --- |
| Shared advancement | `c96ceff` | Actual requirements replace the hereditary rank ladder; direct barony purchase; usable commoner-to-Noble petition; accurate royal status and succession. |
| Political guidance | `44e05d3` | Four distinct political statistics; shared capped gains; all blockers; direct action and learning navigation; honest office benefits. |
| Layout | `e30f277` | Ambition confined to Life; Holding sections are the first item in the main vertical scroller. |
| Narrative and deaths | `4ff15a1` | Bed and relic scenes rewritten; sourced death context, first-cause preservation, idempotent finalisation and relevant chronicles. |
| Character naming | `64ea400` | Explicit name, optional nickname, attached dice and exact preview; shared Unicode validation and local preview randomness. |
| Regression and polish | Final validation commit | Conservative legacy patent recovery, accurate military promotion rationale, immediate off-Life ambition rewards, compatibility expectations, browser scripts and evidence. |

The file-by-file inventory is [changed-files.txt](changed-files.txt). New requirement and title modules are `progressionRequirements.ts`, `advancement.ts`, `titleEngine.ts` and `titleRecovery.ts`. New death and naming helpers are `deathContext.ts` and `nameValidation.ts`. The creator, Me, Court, Careers, Education, Holding and GameScreen consume these alongside the existing engines and persistence code.

## Progression walkthroughs

- **Commoner / merchant:** Me shows the current occupation and its next real job requirements. A commoner aged 18+ can request landed nobility with political influence 15+, Crown support 5+ and a capable living ruler. No Squire or Knight step is required. Opening the petition costs one action and one of three yearly court matters; it can be attempted once per year. The displayed chance includes actual reputation, influence, Crown support, wealth and the existing trait bonus. Refusal remains possible. This single-year petition repairs the audit finding that ordinary commoners had no usable land-title route once the false ladder was removed. It confers neither a job nor the Crown.
- **Soldier / Squire / Knight:** military qualifications, martial occupation, actual age, service standing and required stats determine the ordinary honour route. The separate command-service knighthood route lists Arms level 3, military standing 20+ and recognised command service. Owning land neither substitutes for martial training nor prevents an earned honour. Promotion narration records the actual military requirements.
- **Noble seeking a barony:** Noble/royal estate, age 38, 350g held, Charm 84, Wits 76 and Pro are the six actual requirements. Seek a Barony opens the original `baron_land_grant` opportunity. The manual request costs one action and one court matter; acceptance costs **90g once**, with no second action. A 350g purse becomes 260g before any separate ambition reward. A 400g browser fixture becomes 310g. Declining permits another opportunity in a later year. Random opportunities and the manual action share the same revalidation and atomic grant. Tests cover insufficient reserve, lost qualification, expired access, repeated taps and reload.
- **Baron:** Me records the held title rather than displaying a percentage towards the Crown. A patent does not appoint a monarch or alter occupation.
- **Royal child / claimant:** Prince or Princess requires legitimate parentage to the current living ruler; other recorded relatives display Royal Kin or Royal Claimant. Royal guidance appears first, with the actual designated heir, eligible succession position, competitors, disinheritance and access requirements. Its link opens the royal-claim action. A disinherited claim cannot purchase a phantom recognition/takeover. A royal barony preserves parentage, claims and royal estate.
- **Monarch:** succession, council appointments, occupation and military honours remain distinct. Appointment to a council office grants up to eight political influence once; it does not award the similarly named career, its wages or a new office-duty system.

## Political guidance and navigation

Political influence is personal court influence; Crown support is the Crown faction's view of the player; Court professional standing belongs to the court career; Legitimacy concerns the incumbent monarch's right to rule.

The engine and How to Improve share definitions for Patronage (+7 influence, +4 Crown), Advice (+5 influence, +3 Crown, +2 prosperity), a valid new household alliance (+6 influence), and investigation (+6 influence). Previews report actual gains at caps. Recovered funds and other investigation results are conditional on evidence. Tests compare each displayed gain with execution at ordinary values and near caps, and prove previews are read-only.

Blockers include age, current event/encounter/prison status, yearly action allowance, three court matters, per-action annual limits, living/eligible targets, office selection, education/standing, exact influence/support thresholds, court authority, regency, access and treasury/claim conditions. Open links select an action without executing it. The military learning link selects the actual Martial track; an existing enrolment explains the need to complete or leave it first.

Browser checks verify that moving between Holding sections, leaving and returning to HOLD, and reading Court guidance preserve money, actions and world RNG. The section selector scrolls fully above the visible content viewport. Ambition appears once on Life and nowhere on Do, People, Hold, Shop or Me; its engine tracking/rewards remain independent of presentation. A final integration check found that estate rewards could wait until Age Up. Successful timed actions now check ambition completion within the persisted RNG transaction. The regression and browser fixture sell surplus on HOLD: 149g + 19g proceeds + 15g ambition reward = 183g, one action, one reward, and the tab stays HOLD. Merely opening tabs still cannot award rewards or draw RNG.

## Narrative and death evidence

Controlled execution against the frozen baseline reproduced both incorrect outlaw deaths as a hanging with no criminal case, and the paid barony as 350g → 260g while remaining Noble. Compare [baseline regressions](baseline-regressions.json) with [corrected regressions](after-regressions.json). The latter keeps unknown health collapse honest, leaves the uncharged outlaw alive, and grants the purchased barony exactly once.

The complete rendered introductions, every choice/outcome, actor IDs and unchanged effects are recorded in:

- [A Bed Fit for a Giant](comic_lofty_bed.json)
- [One Elbow Too Many](education_parish_0.json)

The first establishes an invitation to help the actual host with an impractically high bed. The second establishes the church's inventory of relics and a copying error, rather than a change to anatomy. The rendered fixture introduces Agnes as the mentor and Avice as the player's sister and fellow student. The combined relationship appears only when current genealogy and enrolment both justify it. The adjacent wrong-window and feud-tune scenes received bounded context corrections; no large event pack or multi-year story was added.

`truthfulDeaths.test.ts` verifies:

| Fatal transition | Recorded explanation |
| --- | --- |
| Unknown health collapse, including an outlaw with reputation -90 | Honest health collapse, with no invented plague, hanging, debt or royal pursuit. |
| Structured illness | Actual condition name and condition ID; legacy ailments also retain their source. |
| Combat | Actual encounter/opponent and wounds sustained in that fight. |
| Explicit execution event | Its authored execution outcome and event ID; ordinary arrest remains imprisonment in the legal system. |
| Annual pursuit | Only an unresolved serious violent charge plus active suspicion can cause a same-year guard pursuit. The encounter is narrated and the cause is wounds while fleeing guards. Low reputation/path alone cannot trigger it. |
| Recorded death checked again, reloaded, or checked under Live Forever/maximum age | First cause retained; one death memory, history record and end feed entry; no further RNG on completed finalisation. |
| Heir continuation | The outgoing person's death context stays in history; the new player's death state is cleared. |

Death chronicles select actual personal participation and the player's own children, not arbitrary births during the same years. A relationship needs genuinely strong mutual affinity/trust to appear as a close thread. Profession, upbringing and honours remain available when actually recorded.

## Naming, families and save recovery

The same creator is used for first-run creation, Settings → Restart and Death → New Life through `useCharacterCreation`. Names use shared trimming, Unicode, single-line/control-character and 20-character validation. Optional nicknames allow 32 characters. Invalid input shows an explanation without starting a life. Empty nickname means none; undefined nickname retains the legacy engine default for existing callers.

An explicit edit flag preserves a typed `Walter` across gender changes even though Walter is also a generated name. The nickname is independently editable, randomisable or removable. Browser confirmation creates exactly **Walter the Mostly-Honest**, with the chosen gender/difficulty. No-nickname tests create and reload **Éloïse d’Anjou** without trailing spaces. Randomising either field leaves the other settings intact and never advances the saved world's RNG. The engine consumes its original epithet draw before applying a chosen nickname, preserving subsequent seeded world generation. Existing saved identities are not rewritten.

The full suite retains the family tests covering old-age, illness and event widowhood; courtship/proposals/NPC proposals and remarriage; two bereavements and three successive marriages; pregnancy, adoption and optional child naming; names Élodie, Jean-Luc and O’Neill; save/reload and continuation as Élodie. All children retain their original parents, the former player's three marriages remain historical, and the integrity check stays empty. Additional creator and death-context tests cover naming and heir continuation together.

The new legacy patent recovery requires authoritative `baron_land_grant_choice_1` history owned by the current player in their own run. It restores only the missing Baron title/estate/rank, preserves royal estate and claims, and never charges or replays stats, rewards or narration. Declines, other people's choices, inherited/ambiguous memories, a documented demotion, and already reviewed/current patents do not trigger a grant. A persisted per-character review marker makes recovery deterministic and idempotent and prevents later legitimate title loss from being undone. Tests verify unchanged money, stats, memories, relationships, history and RNG. [An actual save produced by the frozen baseline](real-baseline-save-recovery.json) was also recovered: rank 3 → 4, Noble → Baronial, gold unchanged at 260g, with identical RNG/stats/memories/history and an idempotent second load. Incomplete old records are left intact rather than guessing ownership.

## Automated results

Final command results are copied alongside this report in `*-results.txt`:

- Full Jest suite, including deterministic reload, full-life and three-generation dynasty checks: **106 suites / 1,055 tests passed**.
- TypeScript `tsc --noEmit`: **passed**.
- Expo production exports for web, iOS and Android: **passed**. These are JavaScript/assets exports, not signed native store packages.
- [70-life deterministic cohort](cohort.json), seed 950100: all 70 lives completed; **194 reload checkpoints, zero inconsistencies, zero integrity failures/stalls, zero authored multi-year schedules/open stories**. Median age 58; mean 58.26. The original simulation controller and existing mortality settings were used.
- Chromium: [8 baseline scenarios](before-browser.json) and [23 final scenarios](after-browser.json), no page errors. Widths 280/320/390/768; 1.35× text at 280; creator confirmation reachable at narrow/tablet/large text; 390×500 reduced-height keyboard viewport; all six scene outcomes; exact creator confirmation; actual barony payment; immediate ambition completion on HOLD; no navigation costs or RNG draws.

The first full regression run identified three obsolete copy/title expectations, which were updated for the intentional new wording. The validation pass also corrected military promotion narration to describe the actual honour requirements. No test failures were suppressed.

## Before and after screenshots

| Area | Baseline | Updated |
| --- | --- | --- |
| Me / Advancement | [Before](before-me-390.png) | [After](after-me-390.png) |
| Holding space | [Before](before-hold-390.png) | [After](after-hold-390.png) |
| Character creator | [Before](before-creator-390.png) | [After](after-creator-390.png) |
| Bed scene | [Before](before-comic_lofty_bed-390.png) | [After](after-comic_lofty_bed-390.png) |
| Relic scene | [Before](before-education_parish_0-390.png) | [After](after-education_parish_0-390.png) |
| Death report | [Baseline UI](before-death-390.png) | [After](after-death-390.png) |

Additional evidence: [Court guidance at 280px with large text](after-court-guidance-280-large.png), [Court selector scrolled away](after-court-scrolled-390.png), [Royal succession](after-royal-advancement-390.png), [Barony requirements](after-barony-requirements-390.png), [Barony confirmation](after-barony-opportunity-390.png), [Creator at 280px with large text](after-creator-280-large.png), [Exact name preview](after-creator-preview-390.png), [Reduced-height keyboard viewport](after-creator-keyboard-height-390.png). Each rewritten choice also has before-resolution and outcome screenshots at 280px.

Baseline screenshots use a frozen production export of `a29b44f`; comparable deterministic saves exercise the original layout. The death fixture carries a known honest stored cause to compare the death-screen presentation; the actual old outlaw-cause bug is reproduced by the controlled baseline script and covered by corrected death tests rather than inferred from that screenshot.

**Device limitation:** No physical iOS/Android device or native emulator was available. Native safe-area padding remains covered by the existing layout tests; enlarged text and reduced-height keyboard checks here are browser emulation. Actual OS font scaling, IME behaviour, hardware safe areas and signed release installation still need device verification.

## Reproduction

```sh
npm run typecheck
npm test -- --runInBand
# Supply an installed tsx and Playwright module path in the environment used for review.
tsx scripts/auditNarrative.ts --lives=70 --seed=950100 --output=docs/validation/progression-usability/cohort.json
tsx scripts/reportProgressionRegressions.ts v5-after
tsx scripts/createProgressionUiFixtures.ts
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 CI=1 node node_modules/expo/bin/cli export --platform all --max-workers 2 --output-dir /tmp/fate-progression-after
# Serve exported web files locally, then:
PLAYWRIGHT_MODULE=/path/to/playwright PROGRESSION_UI_URL=http://127.0.0.1:8107 node scripts/verifyProgressionUi.cjs
# To reproduce baseline images, serve the frozen baseline and set PROGRESSION_BEFORE=1.
```
