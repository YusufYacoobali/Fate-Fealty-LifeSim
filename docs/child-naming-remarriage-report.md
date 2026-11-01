# Child naming and remarriage verification

1 November 2026 · Branch `v5` · Baseline `8630f6a` · Save schema 7 remains unchanged.

Widowhood now follows the canonical reciprocal spouse links. Death clears both active links, removes the current married tag and records the bereavement without removing the person, children or earlier marriages. Divorce and elopement close marriages with distinct reasons. Remarriage establishes a new reciprocal pair and clears current widowhood while retaining prior records and memories.

Child naming uses a small persisted queue owned by the controlled character. Birth, adoption, wardship and direct player-child creation enqueue eligible minors; unrelated NPC births do not. The existing event, combat, forge, settings, onboarding, promotion and achievement overlays take priority. The naming interface then presents one child at a time. Keeping the suggestion requires no typing. Invalid, deceased, adult or unrelated references are skipped, and heir continuation clears the outgoing character’s requests.

Naming, renaming and further suggestions cost no gold or yearly actions and have no Premium gate. Suggestions use a separate deterministic counter, so they do not draw gameplay RNG. Names are trimmed, limited to 20 Unicode code points and reject empty text, control characters and multiline input. Accents, spaces, hyphens and apostrophes are accepted. A validation error leaves the modal open. Confirmed names update canonical characters; only the exact initial birth/placement feed and history IDs are updated for newborn naming. Later renames preserve earlier narration.

## Marriage and save recovery

- Central active-marriage queries are used by courtship, flirting, proposals, NPC offers, affairs, family planning and spouse actor selection. A stale tag cannot block an eligible widowed character; removing a tag cannot permit ordinary courtship while a reciprocal living marriage exists.
- Every mortality path distinguishes death from separation: kin old age, structured illness, world health decline, authored event death, initial family bereavements and controlled-character death/heir transfer.
- Optional per-character marriage records preserve spouse IDs, known dates and ending reasons. Existing relationship history remains. Recovery never invents an unknown starting date. For old cleared-link saves, retained deceased-spouse and former-spouse evidence recovers widowhood; an unexplained married tag alone is removed without inventing a death.
- Integrity repair clears invalid active links instead of forcibly assigning spouses to one another. Deterministic, idempotent recovery preserves RNG and family/history data. Valid saved attraction preferences also survive loading.
- Existing children never gain the new spouse as a biological parent. A separate correction preserves recorded deceased parents when an expected child arrives after bereavement and remarriage. Historical spouses are retained during background-character archival.

## Demonstrated scenarios

Dedicated tests cover old-age, illness and event widowhood; player and NPC proposals; repeated bereavement and remarriage; valid living marriages; divorce and actual affair/elopement actions; impossible stale proposals; affected-save recovery; adoption and wardship; Unicode validation; zero gold/exhausted actions; exact birth-announcement updates; later history preservation; and current/previous marriages after heir continuation.

The complete-life controller starts in childhood with seed **779023**, marries Avice at 18, names Élodie at 19, loses the spouse through the real event consequence handler, reloads the widow, remarries Hilda and names O’Neill at 21. The first child is later renamed **D’Arcy**. Both children retain their original parents. The parent dies naturally at **55**, and the player continues as **D’Arcy** at 36. The recorded chronology, family records and RNG checkpoints matched exactly on an independent replay. The heir screenshot uses that actual resulting save, rather than a fabricated lineage. See [whole-life.json](validation/family/whole-life.json) and [the resulting heir save](validation/family/heir-ui-save.json).

## Verification

| Check | Result |
| --- | --- |
| Full Jest suite | 95 suites, 954 tests passed |
| TypeScript | Passed |
| Existing deterministic life controller | 2,100 natural lives, 300 per role; 525 free and 1,575 Premium |
| Reload checkpoints | 6,017; zero inconsistencies |
| World integrity, stalls and unfinished lives | Zero failures |
| Authored future schedules | 0 |
| Existing multigeneration test | 100 three-generation dynasties passed |
| Complete family life and independent replay | Passed; natural death at 55, then named heir |
| Expo production export | Web, iOS and Android passed |
| Production Chromium checks | 16 cases, 280/320/390/768px, 1.35× text and 430px keyboard-height viewport |

The dynasty check uses the repository’s existing eight-year segments and explicit heir transfers. The full-life cohort keeps generated names; dedicated unit, UI and complete-life cases exercise custom naming. Integrity is asserted at life-end in the broad cohort and at every annual checkpoint in the complete-life controller. No mortality probabilities or difficulty modifiers changed.

The browser checks resolve the active EventModal before naming, reload a pending request, reject empty input without consuming it, name multiple children, retain a new suggestion across reload, rename with genuinely free access and zero actions/gold, accept a proposal from an affected widow save, confirm family-planning access after remarriage, preserve old parent IDs and continue as the named heir. Screenshots were visually reviewed. The existing palette, fonts, parchment, buttons and six bottom tabs remain.

## Screenshots

- [Newborn naming with enlarged text at 280px](validation/family/naming-large-text-280.png)
- [Free Rename Child action in People](validation/family/rename-action-390.png)
- [Renaming with enlarged text at 280px](validation/family/rename-280.png)
- [Names in the People list](validation/family/named-children-390.png)
- [Widow receiving a proposal](validation/family/widow-proposal-390.png)
- [Remarried character’s family-planning actions](validation/family/remarried-390.png)
- [The actual named heir’s family tree at 768px](validation/family/named-heir-tree-768.png)
- [Keyboard-height viewport at 280px](validation/family/naming-keyboard-resize-280.png)

## Changed files

```text
scripts/auditFamilyLife.ts
scripts/createFamilyUiFixtures.ts
scripts/verifyFamilyUi.cjs
src/__tests__/childNamingModal.test.tsx
src/__tests__/childNamingRemarriage.test.ts
src/__tests__/familyPlanning.test.ts
src/__tests__/romanceDiscovery.test.tsx
src/components/modals/ChildNamingModal.tsx
src/components/tabs/KinTab.tsx
src/engine/activityEngine.ts
src/engine/birthCircumstances.ts
src/engine/characterState.ts
src/engine/childNaming.ts
src/engine/consequenceEngine.ts
src/engine/contentRecovery.ts
src/engine/eventPicker.ts
src/engine/familyFormationEngine.ts
src/engine/gameState.ts
src/engine/healthEngine.ts
src/engine/kinFactory.ts
src/engine/kinship.ts
src/engine/lifecycleEngine.ts
src/engine/npcDirector.ts
src/engine/relationshipEngine.ts
src/engine/successionEngine.ts
src/engine/worldEngine.ts
src/engine/worldIntegrity.ts
src/screens/GameScreen.tsx
src/state/gameReducer.ts
src/state/persistence.ts
src/types/game.ts
```

## Reproduction and device limits

Run `npm run typecheck` and `npm test -- --runInBand`. The existing dynasty command is `MLS_FULL_SOAK=1 npm test -- --runInBand src/__tests__/persistentWorldFullSoak.test.ts -t 'three-generation dynasties'`.

Use tsx 4.23.15 for `scripts/auditFamilyLife.ts`, followed by `scripts/createFamilyUiFixtures.ts`. Serve an Expo production export at localhost:8103, then run `scripts/verifyFamilyUi.cjs` with Playwright/Chromium available. `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE` and `FAMILY_UI_URL` select external tools/server. The broad cohort is `scripts/auditNarrative.ts --lives=2100 --seed=840000 --policy=balanced --label=family-regression --output=docs/validation/family/lives-2100.json`.

Captured logs and a source/validation manifest are in [validation/family](validation/family/README.md). The original narrative-balance evidence remains unchanged.

Real OS font scaling, native soft-keyboard behavior, hardware Back, background/resume under memory pressure, sound/haptics, signed TestFlight/Play builds and store purchase/restore checks remain device checks. The existing release configuration also still requires a published Android `TERMS_OF_USE_URL`; this task does not supply or invent a legal URL. No store submission was performed.
