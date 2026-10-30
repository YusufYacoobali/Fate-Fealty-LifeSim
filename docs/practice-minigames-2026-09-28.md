# Practice mini-games — 28 September 2026

- **Practice in the Yard** is the first record in Do → Practice. It remains free sparring against a partner, without skill rewards or lasting injuries.
- **Arms** now opens solo sword practice: five timed quick cuts, heavy swings or feints using the combat timing bar, full-screen timing input and the existing pixel animation style. Five solo Lottie assets omit the rival, rival shadow and collision sparks. No opponent, incoming attacks, vigour contest or stamina costs appear in the solo UI.
- Solo training spends one action when opened and awards 6 Arms XP once on completion. Quick finish gives the same XP. Completion returns to Life. The existing advanced Arms training-yard requirement remains; solo drills open at age 8 and stop awarding training at maximum skill.
- **Craftsmanship** uses the anvil mini-game as its practice action. Each session spends one action and grants 6 Craftsmanship XP on completion, including Quick finish. Removed the old once-a-year and below-level-3 restrictions. Training remains available from age 10 through level 9; maximum level disables it. Practice does not grant free iron or consume paid forge bonus opportunities.
- Saved solo swings retain their pending move and sequence. Nested practice progress is cloned independently; repeated, stale or delayed inputs cannot duplicate rewards. Existing fights and forge saves continue to use their established state and settlement paths.

## Verification

- 96 unique targeted tests passed across seven suites. The initial run passed 95 tests; the final six-test practice suite included one additional advanced-anvil regression.
- Checks cover five-swing completion, misses, quick finish during timing, saved sessions, duplicate inputs, stale callbacks, training restrictions, no living sparring partner, skill level increases and repeated anvil sessions in the same year.
- TypeScript and iOS/Android/web production bundle exports passed.
- Browser QA confirmed record order, the solo arena without an opponent, combat timing input, solo completion and Life reward, the Craftsmanship anvil entry and its XP result. No browser errors were reported during these checks.

No store build, submission or deployment was performed. Native device performance and haptic feel were not verified in this pass.
