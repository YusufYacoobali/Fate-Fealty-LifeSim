# Final balance evidence

31 October 2026 · Baseline `49f5501`

- `before-*.json` / `after-*.json`: six raw deterministic 2,100-life cohorts, with individual rows, actual fatal decisions, per-event use and fourteen full feed transcripts each.
- `comparison.json`: derived statistics, corrected median and the explicit player/NPC measurement adjustment. Raw records are retained unchanged.
- `before-events.json`: baseline registry snapshot for the editorial effect comparisons.
- `writing-revisions.json`: 52 exact before/after passages across 48 events.
- `added-events.json`: 25 complete additional scenes.
- `risk-changes.json`: nine original fatal branches, their new setbacks and conditional catastrophe probabilities.
- `content-checks.json`: current registry validation and editorial effect-comparison counts.
- `sample-review.md`: readings of complete personal narratives and additional policy/role samples.
- `browser.json`, `browser-legal-final.json`, `navigation.json` and five PNGs: production Chromium rendering, choice, same-year closure and save/reload evidence.
- `checks/`: captured TypeScript, Jest, dynasty, export, browser and existing release-gate results.
- `checks.json`: final commands, source identity and validation summary.

Run `npx tsx@4.23.15 scripts/checkNarrativeBalanceEditorial.ts` to repeat the 52 effect comparisons and regenerate the editorial audit. Run `node scripts/reportNarrativeBalance.cjs` from the repository root to rebuild the comparison and report. A cohort must contain the full matched seven-role, free/Premium matrix and finish without a reload failure or stall to be accepted.

## Production browser reproduction

Use tsx 4.23.15 and Playwright with Chromium, provided separately from the app dependencies. Export and serve the production web bundle on port 8102, then run:

```sh
npx tsx@4.23.15 scripts/createNarrativeBalanceUiFixtures.ts
node scripts/verifyNarrativeBalanceUi.cjs
node scripts/verifyNarrativeBalanceNavigation.cjs
```

Set `PLAYWRIGHT_MODULE` if Playwright is outside the local node_modules, `CHROMIUM_EXECUTABLE` to use a system browser, and `NARRATIVE_UI_URL` for another server address. The fixture path defaults to `/tmp/fate-balance-ui-fixtures.json`; the fixture builder accepts a different output path and the checkers accept `NARRATIVE_UI_FIXTURES`.

The main checker covers 36 encounter/width/text/animation combinations. Navigation checks all six tabs at 280px and 1.35× CSS text, including the visible narrow KIN label. A supplementary six-case hearing run checks restitution disclosure and long case narration. CSS enlargement is not OS font scaling. Sound/haptics, native lifecycle, signed builds and store purchase flows require device checks.
