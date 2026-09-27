# Playable RPG expansion audit

Reviewed 21 September 2026 against the requested expansion. The workspace is now
on Expo 57; this audit preserves that existing upgrade.

## Coverage

| Area | Implementation and checks |
| --- | --- |
| Main life loop | Age Up is guarded by active choices/combat at engine level. Unstarted contracts, paused expeditions, recipes and career chapters do not block it. Existing action caps and entitlement handling remain in use. |
| Work Board | Twelve templates; three stable, age-eligible offers per year from age six. One action per offer, saved attempted records, contextual client/world options, explicit costs, risks and reward previews. |
| Expeditions | Woodland, quarry and watchtower each have three stages. One action per visit, resume/abandon/retreat, separate mission state, safe and risky approaches, no elapsed-time penalties. |
| Skills | Four canonical character skills; levels 1–10, cumulative 20 × level thresholds, 6/3 ordinary XP and 10/5 mission XP. Milestone unlocks, reasons in the feed, four distinct mastery commissions. Heirs retain their own skill records. |
| Crafting and equipment | Twelve recipes, four raw materials plus stackable crafted goods, three quality tiers and three equipment slots. Exact costs and outputs, deterministic crafting, real combat/work/yield modifiers, original purchase effects preserved. |
| Holding | Existing upkeep and buildings retained, three new buildings, ownership benefits, named stewards and twelve encounters. Management shares the annual allowance; construction uses ordinary actions. Severe crises open relevant choices in place of duplicate damage. |
| Careers | Three branches with three named milestones and three chapters each. Relevant assignments, skills, age and faction standing gate advancement; choices affect later options and annual consequences. Progress survives changing careers. |
| Caravan | One action, three choices, saved route/crossing outcomes that change the final return, and a provisions-based community buyer. Old v5 journeys without recorded results retain their original margin. |
| Combat | Tactics and timing, stamina and zero-cost fallback, four archetypes, veteran adaptation, opponent recovery, eight-exchange cap, equipment snapshot, Timing Assist, practice and yield. Completed exchanges and committed threats survive reload. |
| Compatibility | Additive v3/v4 migration, serialized save writes, request/phase guards, missing-client faction fallback, missing-opponent recovery, death cleanup and household inheritance. Existing reminders and daily gifts are outside the new progression. |

## Gaps corrected during this audit

- Early caravan decisions previously changed little beyond XP. Their results now
  change cargo returns and access to a dependable buyer, including after reload.
- Unrelated contracts previously advanced specializations, and assignment gates
  were satisfied by chapters alone. Relevant work now counts toward explicit
  milestones requiring 0, 2 and 4 prior assignments.
- Work Board previews previously omitted contextual alternatives and approach
  costs. They now use the same definitions and checks as the actual encounter.
- Mastery commissions previously shared a generic examination. Each skill now
  has its own professional problem, outcomes and visible title.
- A poor working day that still paid wages previously awarded full XP. It now
  awards half. Additional relevant ordinary activities now train their skills;
  action results are captured before unrelated celebration feed entries.
- Exhausted opponents previously continued attacking. They now recover and leave
  an opening; veterans adapt to the player's previous defence.
- System reduced motion could skip the timing marker and cause an immediate
  miss. The essential timing animation now runs while decorative motion remains
  optional. Background callbacks cannot submit timing results while inactive.

## Verification

Regression coverage lives in `rpgExpansion.test.ts`, `rpgJourneys.test.ts` and
`rpgAudit.test.ts`, alongside the existing life/dynasty, migration, content,
holding, career and duel suites. All **491 tests across 54 suites passed** on the
audited source, as did TypeScript and Android/iOS/web production exports. A
production browser playthrough verified contextual previews, a trusted-client
reward, exactly one charged action, the attempted-offer record after reload,
and Age Up with untouched offers remaining. The browser's native store adapter
reported its existing Web Billing configuration error, so web purchases were
not validated. The audit's deterministic combat balance run
completed all 480 fights across four archetypes, three builds and two timing
policies without stalling or exceeding eight exchanges.

Physical-device release-build validation remains outstanding. ADB reported no
connected Android device during this audit. Before store release, verify touch
latency, timing boundaries, background/resume, audio/haptics and reduced motion
on physical iOS and Android devices. Bundling and engine simulations cannot
establish native responsiveness. No store release was performed.
