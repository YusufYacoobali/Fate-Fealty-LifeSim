# Major Life Events & Relationship Polish — v5

Validation date: 1 November 2026 (Europe/London, GMT). Baseline: `dfb62e5`. Implementation commit and file hashes are recorded in [the manifest](validation/milestones/manifest.json).

## Implemented behavior

Eight typed notice categories cover current-spouse, child, parent and guardian deaths; heartbreak; divorce; elopement; and significant affair exposure. Actual transition handlers capture character IDs, names, ages, relationship, cause where known, year and relationship context before destructive updates. Unrelated villagers remain in the feed, previous spouses do not produce false current-spouse bereavements, and births retain the existing naming interface.

The persisted queue deduplicates transition identifiers. All pending notices and the latest 24 acknowledged records are retained; compact seen IDs prevent an old transition from returning after pruning. Names, prose and facts remain frozen across reloads and later character changes. New lives and heir continuation start their own queue. Old saves start silently: historical marriages and deaths already present in birth backgrounds do not become fresh notices.

Required event/combat decisions come first, followed by family notices, child naming, then rewards and promotional prompts. An already-open naming input retains its text when a notice arrives. Multiple notices appear sequentially. CONTINUE acknowledges only the notice: it has no action, gold, Premium, statistic, year or RNG effect. Notices create no scheduled story chapters. The modal uses the existing pixel fonts, parchment, borders, palette and buttons; the existing six bottom tabs remain.

NPC relationship endings require an established marriage, courtship or affair and serious problems. Healthy couples receive no breakup RNG roll. Low affection and trust must be accompanied by repeated mistreatment, unresolved betrayal, a feud or sustained severe strain. Proud/ambitious partners are more likely to leave; patient/loyal partners less likely. Endings resolve immediately in the current year. Marriage endings use reciprocal links and marriage records; affairs and courtships end without creating a divorce. Children and genealogy stay attached to their original parents. Random NPC matchmaking excludes an active courtship; a confirmed marriage to someone else closes that courtship with the correct initiator and affected IDs.

There are 60 original prose variants, with relationship quality, actual medical causes, unresolved infidelity, rivalry, personality, age and initiator selecting the appropriate tone. A deterministic text-only hash chooses a variation and avoids the most recent lines. This consumes no gameplay RNG. Child and ward losses stay sincere. Bereavement suppresses simultaneous cheerful money/promotion/birth audio and success haptics; acknowledgement does not replay them. The notice itself is static and respects reduced-motion behavior.

## Save migration and People labels

Every valid `women`, `men` or `none` preference survives loading. The controlled GameState preference takes precedence, then a valid canonical player preference, with the gender-based fallback used only when neither is valid. The resulting player fields agree, and existing NPC preferences survive both canonical and legacy kin normalization. Tests cover idempotence, unchanged RNG, widowhood, remarriage and heir continuation. Existing save keys, schema version 7, family history and Premium entitlements are retained.

People profiles and lists derive marriage labels from current reciprocal links and recorded endings: Married to …, Widowed, Late spouse, Former spouse, Former spouse · Deceased, or Unmarried as appropriate. A spouse who died during the marriage differs from someone who died after divorce. Stale “Thy Spouse” role text no longer contradicts these labels.

## Actual family-life demonstration

Seed `779023`, Normal difficulty, natural mortality, scripted family choices:

1. Marry Avice at 18. Name the first child Élodie at 19.
2. Avice dies through the existing event consequence handler at 19. Reload the widow save, acknowledge the spouse notice for free, and marry Hilda.
3. Name the second child O’Neill at 21. Rename the first child D’Arcy. The first child retains parents `player_1` + Avice (`kin_214`); the second retains `player_1` + Hilda (`kin_241`).
4. Later parent, spouse and child losses generate distinct personal notices. No future chapters are scheduled by them.
5. The player dies naturally at 55, then continues as D’Arcy at 36. Both previous marriages remain recorded, and outgoing naming/notices do not carry into the heir’s life.

The independent replay produces an identical whole-life JSON, including RNG checkpoints. Integrity is asserted at every annual and family checkpoint. See [whole-life.json](validation/milestones/lifecycle/whole-life.json) and [the resulting real heir save](validation/milestones/lifecycle/heir-ui-save.json). The spouse’s first death is deliberately triggered through the real consequence handler; this is a scenario test rather than a randomly observed event.

## Verification

| Check | Result |
| --- | --- |
| Full Jest suite | 98 suites, 990 tests passed |
| Focused notices, modal, audio and haptics | 4 suites, 41 tests passed |
| TypeScript | Passed |
| Existing deterministic life controller | 2,100 natural lives; 300 per role, 525 free and 1,575 Premium |
| Reload checkpoints | 6017; zero inconsistencies |
| World integrity, stalls, unfinished lives and future authored schedules | Zero failures / zero future schedules |
| Existing multigeneration test | 100 three-generation dynasties passed |
| Whole family life and independent replay | Passed; identical JSON, natural death at 55, continued as D’Arcy |
| Expo production export | Web, iOS and Android passed |
| Production Chromium checks | 58 cases passed; zero page errors |

Raw evidence: [Jest](validation/milestones/tests.txt), [focused tests](validation/milestones/focused-tests.txt), [TypeScript](validation/milestones/typecheck.txt), [dynasties](validation/milestones/dynasties.txt), [life cohort](validation/milestones/lives-2100.json), [family replay](validation/milestones/family-replay.json), [browser checks](validation/milestones/browser.json), [production exports](validation/milestones/production-export.txt), and [release check](validation/milestones/release-check.txt).

The existing dynasty test exercises eight-year segments and two explicit heir transfers per dynasty; it is not 300 complete natural lives. The broad life controller resolves gameplay decisions headlessly and uses generated child names; dedicated UI/unit and whole-family scenarios exercise acknowledgements and custom names. The broad run began before the final prose edits and suppression of notices for deaths already recorded at birth; those changes do not alter mortality, parentage, relationship decisions or RNG. The final full suite, focused tests, dynasty run, family replay, exports and browser checks use the final application source.

Browser cases are deterministic fixtures created through real death, divorce, exposure, elopement and NPC-ending handlers. They are not claimed as naturally sampled lives. Checks cover 280/320/390/768px, 1.35× text at 280px, reduced motion and a 430px-high viewport. Long notices and naming panels scroll, with Continue/Confirm remaining reachable in the short viewport. They verify event → spouse notice → parent notice → two child naming requests, reload persistence, exactly one notice per confirmed transition, free CONTINUE with exhausted actions and zero gold, labels and no horizontal page overflow. Component tests separately verify that an incoming real spouse-death notice preserves an already-typed child name. All screenshots below were visually reviewed.

## Example notifications

These are rendered examples from the actual transition fixtures. Causes and relationship metadata appear separately in the modal. Full snapshots and variant IDs are in [notice-examples.json](validation/milestones/notice-examples.json).

### Loving marriage, spouse aged 54

> Your marriage to Alys ends with their death at 54. You remember a voice more clearly than the important occasions. It is an unexpectedly small thing to miss so much.

### Miserable marriage, spouse aged 54

> Alys has died at 54. Relief and grief sit on the same bench, looking thoroughly ashamed to be seen together. The neighbours offer to explain which one you ought to be feeling.

### Known plague death, loving marriage

> Your spouse, Alys, has died at 54. You no longer have to ask whether there has been any improvement. It is a question you would dearly like to have a reason to ask again.

### Child aged 11, known fever

> Edith, your child, has died at 11. Their name is still part of the way you think about tomorrow. You cannot yet imagine thinking differently.

### Parent aged 66

> Agnes has died at 66. Advice you once hurried past returns to you at its own pace. For once, you cannot interrupt it.

### Patient guardian aged 64

> Your guardian, Rowan, has died at 64. They had a gift for letting a difficult answer arrive slowly. You find yourself wishing for it now.

### Player-initiated divorce

> You and Alys end the marriage. Both of you attempt to preserve your dignity, which proves rather harder to divide than the company. Neither household owes the neighbours a better version of the ending.

### NPC ends a severely mistreated marriage

> Your spouse, Alys, confirms the separation. The trouble between you has finally found an ending, though neither side gets to call it a victory. The next conversation will have to begin somewhere else.

### NPC ends a severely mistreated courtship

> Isolde says the romance is over. You had prepared an impressive reply to a rather different conversation. Its finest sentence is now entirely useless.

### Actual affair exposure to the current spouse

> Your affair with Isolde is known to Alys. You attempt to explain, and make the impressive discovery that honesty would have required a much shorter speech. Nobody offers you a chair.

### Confirmed elopement, including the abandoned spouse

> You and Isolde choose each other openly. The people left behind include Alys. By supper, half the village will claim they arranged it and the other half will claim they tried to stop you.

## Screenshots

- [Loving-spouse notice, 280px](validation/milestones/spouse_tender-280.png)
- [Loving-spouse notice, 320px](validation/milestones/spouse_tender-320.png)
- [Miserable marriage, 390px](validation/milestones/spouse_bitter-390.png)
- [Spouse illness, 390px](validation/milestones/spouse_illness-390.png)
- [Child loss with 1.35× text, 280px](validation/milestones/child_loss-280-large.png)
- [Guardian loss, 390px](validation/milestones/guardian_loss-390.png)
- [NPC ends a marriage, 390px](validation/milestones/npc_breakup-390.png)
- [NPC ends a courtship, 390px](validation/milestones/courtship_breakup-390.png)
- [Affair exposure, 390px](validation/milestones/affair-390.png)
- [Elopement, 390px](validation/milestones/elope-390.png)
- [Critical EventModal has priority](validation/milestones/critical-event-first-390.png)
- [Child naming follows both notices](validation/milestones/naming-after-notices-390.png)
- [Late-spouse profile](validation/milestones/label-spouse_tender-390.png)
- [Deceased former spouse with enlarged text](validation/milestones/label-former_deceased-280-large.png)
- [Tablet notice, 768px](validation/milestones/spouse_tender-768.png)
- [Enlarged text in a short viewport](validation/milestones/spouse_bitter-280-large-short.png)
- [Naming in the short viewport](validation/milestones/naming-after-notices-280-large-short.png)
- [Continue after scrolling a short notice](validation/milestones/priority-spouse_death-continue-280-large-short.png)
- [Confirm after scrolling the short naming panel](validation/milestones/naming-continue-280-large-short.png)

## Remaining native-device and release checks

Browser enlarged text and viewport resizing emulate layout pressure; they do not replace iOS Dynamic Type, Android font scaling, hardware keyboard/safe-area checks, actual audio/haptics, background/resume, force-close recovery or signed-device acceptance. These remain device checks. Expo exports passed; no signed binaries were built or submitted.

The existing `npm run release:check` remains blocked by the missing published Android `TERMS_OF_USE_URL`. Meta/RevenueCat dashboard connections, store/privacy disclosures and signed-device acceptance also remain release gates. No legal URL or third-party dashboard setting was invented for this gameplay task.

## Changed application, test and QA files

```text
scripts/auditFamilyLife.ts
scripts/createMilestoneUiFixtures.ts
scripts/verifyMilestoneUi.cjs
src/__tests__/lifeEventNoticeModal.test.tsx
src/__tests__/lifeEventNotices.test.ts
src/__tests__/useGameAudio.test.tsx
src/__tests__/useGameFeedback.test.tsx
src/components/modals/LifeEventNoticeModal.tsx
src/components/tabs/KinTab.tsx
src/content/lifeEventNotices.ts
src/engine/birthCircumstances.ts
src/engine/characterState.ts
src/engine/familyOverlay.ts
src/engine/gameState.ts
src/engine/healthEngine.ts
src/engine/kinFactory.ts
src/engine/lifeDirector.ts
src/engine/lifeEventNotices.ts
src/engine/lifecycleEngine.ts
src/engine/maritalLabels.ts
src/engine/misdeedEngine.ts
src/engine/relationshipEndings.ts
src/engine/relationshipEngine.ts
src/engine/successionEngine.ts
src/engine/worldEngine.ts
src/screens/GameScreen.tsx
src/state/gameReducer.ts
src/state/hooks/useFamilyOverlay.ts
src/state/hooks/useGameAudio.ts
src/state/hooks/useGameFeedback.ts
src/state/persistence.ts
src/types/game.ts
```

This report and new evidence live under `docs/validation/milestones`; earlier family, balance and narrative reports/screenshots are preserved.
