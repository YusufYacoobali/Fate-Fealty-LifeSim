# Final progression polish

Implemented on `v5`, based on `dd8ebda`, 5 November 2026.

The existing Me helper now explains how standing is earned and lists only unmet requirements from `rankPromotionRequirements()`. The same compact helper, rank tiles, progress bar and promotion popup remain. Completed standing, Pro access and eligibility for the Crown are distinct conditions.

Examples verified in tests:

| Situation | Helper |
| --- | --- |
| Knight, 68 standing, missing money and stats | Build standing through work and achievements. Noble needs 120g, Charm 72 and Wits 58. |
| Knight, 100 standing, only Charm missing | Standing complete. Noble needs Charm 72. |
| Noble, other qualifications met, no Pro | Standing complete. Baron needs Pro. |
| Baron, other qualifications met, no Pro or claim | Standing complete. Monarch needs Pro and a recognised route to the Crown. |
| Baron with a claim, incumbent still alive | Standing complete. Monarch needs succession or political recognition. |
| Baron first in succession to a vacant throne, only Pro missing | Standing complete. Monarch needs Pro. |

All five pre-Monarch levels have tests for missing qualifications, completed standing, and omission of requirements already met. Selecting hints does not mutate the game or RNG.

## Recognition event

`baron_land_grant` is now **THE COUNCIL’S RECOGNITION**. Its introduction, both outcomes and second choice describe the actual standing rewards. The Court action says **Seek Council Recognition**. Event and choice IDs, eligibility, rewards and annual limits are unchanged. A previously saved open scene still resolves after loading, without spending money or directly granting a rank.

## Crown route correction

Previously, reconciliation crowned every eligible claimant as soon as the incumbent died. An ordinary claimant could bypass the final standing/qualification checks, and the automatic promotion route was preempted.

Succession now defers an ordinary player claimant to the existing promotion transaction. The throne must be vacant and the player must be the first eligible documented claimant. Ordinary promotion requires Baron, 100 standing, age 40, 420g held, Charm 90, Wits 85, Faith 60 and Pro. A pending event still resolves before promotion. No new Crown claims, state fields or migration are introduced. The Court displays **Vacant** during this interval.

Actual royal-heir inheritance remains exceptional and requires Pro. Existing explicit political recognition, takeover and regency controls retain their political conditions and Pro checks. Standing alone cannot displace a living ruler. Repeating `recogniseRuler()` for the current ruler now returns false without recording another succession.

| Tested scenario | Result |
| --- | --- |
| Baron, 100 standing, no claim | No promotion; no claim created. |
| Baron, valid claim, living incumbent | No automatic promotion or usurpation. |
| Ordinary claimant first in succession, vacant throne, 99 standing | Waits; survives reload; completing standing through an activity promotes once. |
| Ordinary claimant missing age, gold, Charm, Wits, Faith or Pro | Cannot bypass the missing qualification through succession. |
| Baron married to the ruler | Court creates the existing marriage claim; after the ruler dies and standing finishes, ordinary promotion succeeds. |
| Legitimate royal heir without ordinary qualifications | Existing exceptional inheritance succeeds with Pro; is blocked without Pro. |
| Recognition replay, later action and reload | Exactly one living Monarch, one player claim, one succession history entry and one ordinary promotion memory. |

## Validation

- TypeScript: passed.
- Focused progression, royal Court, politics, UI and title checks: 73 tests passed before the additional edge cases.
- Additional hint, content and progression checks: 64 tests passed, including actual royal marriage, saved recognition and each ordinary Crown gate.
- Full Jest: **108 suites / 1,086 tests passed**, including deterministic life, dynasty, royal succession and save/reload coverage. [Result](jest-results.txt).
- Expo web production export: [passed](web-export-results.txt). This is a JavaScript/assets export, not a signed native build.
- Chromium: ten checks passed, no page errors, at 280/320/390/768px and 1.35× text at 280px. Includes the existing earned promotion popup, meter reset and reload without replay. [Browser results](after-browser.json).

Screenshots retain the existing Me layout:

- [Specific missing Noble qualifications at 68%](after-noble-me-390.png)
- [Completed Baron standing, Crown route still required](after-crown-me-390.png)
- [280px with enlarged text](after-farmer-me-280-large.png)

Device checks are browser emulation; no physical iOS/Android device was tested. Browser verification used the existing natural-rank fixtures/verifier with output redirected here, limited screenshot capture, and the Noble example adjusted to missing qualifications.

Reproduce automated coverage with `npm run typecheck` and `npm test -- --runInBand`. The existing `scripts/verifyNaturalRankUi.cjs` expectations were updated for the new helper wording.

## Changed files

- `src/state/viewModel.ts`: contextual helper text.
- `src/engine/progressionRequirements.ts`: separate access and Crown-route conditions.
- `src/engine/royalSuccessionEngine.ts`: ordinary claimant deferral and recognition replay guard.
- `src/content/premiumEvents.ts`: accurate recognition wording.
- `src/components/tabs/CourtPanel.tsx`: recognition label and vacant-ruler display.
- Progression hints/routes/UI, Court UI and content compatibility tests; existing natural-rank browser verifier expectations.
- This validation report, result files and three screenshots.
