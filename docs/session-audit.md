# Session audit — 22 September 2026

Reviewed the workshop rewards and persistence, profession journey and delayed callbacks, choice feedback, role-story continuity, newspaper grouping, generated pixel assets and both platform animation renderers.

## Gaps fixed

- Five explicitly paid role-story choices lacked affordability gates. They now require the stated gold; regression tests also verify a free alternative remains available and rejected choices do not alter the state.
- Remaining vocation-story passages jumped ahead by multiple years, declared an heir's future, or asserted untracked property acquisitions. Those passages now describe the current decision and immediate consequences, preserving existing story IDs, branches and effects.
- Native Lottie effects could remain paused after React replays effect setup; the web renderer could be recreated without replaying its opening animation. Lifecycle cleanup now handles both cases. Backgrounding returns decorative art to its resting frame and does not replay old strikes on return.
- Forge marker centre coordinates now match the target-zone and scoring coordinates. The return countdown uses whole seconds.
- Timing Assist now explains its effect on both combat and forge attempts.
- Updated outdated newspaper/test documentation and repaired a mixed-encoding tail in the README without discarding its text.

## Verification

- Full final Jest run: **517 tests passed, 56 suites**, including world/lifetime simulations, workshop rewards, all three trade endings, save restoration, succession, choice gates and animation lifecycle regression tests.
- TypeScript and Git whitespace checks passed.
- Fresh production JavaScript exports passed for web, iOS and Android.
- Browser checks used the separate local preview save: narrow-screen newspaper layout and Escape dismissal, revised settings, and assisted keyboard forge input. Earlier checks in this session covered a complete five-strike run, final-strike animation, interrupted-save restoration and reduced-motion newspaper opening.

## Remaining verification limits

Native exports are not signed app builds or physical-device tests. On-device animation performance, haptics, background/resume timing and screen-reader navigation remain unverified. The preview's existing RevenueCat Web Billing configuration and music autoplay errors remain outside this update; store purchases were not tested. This audit does not establish retention or store-ranking performance.
