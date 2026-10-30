# Combat, quest copy and gathering balance — 28 September 2026

Do categories now begin **All → Quests → Practice**. Quest section introductions no longer repeat action costs or decision counts. Craft keeps the material inventory, Careers keeps specialization requirements, and action buttons retain their actual prices. The shared mission popup no longer adds “No further actions required.”

## Gathering

Each outing spends one action plus gold:

| Material | Gold per outing | Base yield |
| --- | ---: | ---: |
| Timber | 2g | 2 |
| Herbs | 3g | 2 |
| Stone | 4g | 2 |
| Iron | 6g | 2 |

Gathering stays cheaper per material than the shop. Skill, tool and garden bonuses still increase yield without increasing the outing price. The UI and engine share one quote calculation. Unaffordable trips spend nothing; stale repeated inputs cannot pay or grant materials twice. This adjusts dedicated gathering; material rewards from contracts, exploration and other work remain rewards.

## Combat

Twelve Lottie states reuse the existing generated pixel fighters and courtyard. Added larger lunges, anticipation, squash/stretch, impact pauses, recoil, dash trails, slash arcs, shield impacts, dust and shards. Heavy strikes, feints, parries, recovery and defeat have their own states. Outlined pixel callouts include SLASH, SMASH, BLOCK, PARRY, DODGE, WHOOSH, BREATHE and ending verdicts.

The arena adds brief camera recoil, floating damage/safe/recovery feedback and impact-timed haptics. Resolved move/damage values survive the next move selection and reload. Recovery reports the actual stamina gained at the 100-point cap. Recovery does not animate an enemy attack. Ending poses and evasions remain inside the arena.

Reduced motion keeps a static arena and readable outcome text. Backgrounding cancels camera effects and pending impact haptics. Existing timing input and four-exchange combat limits are unchanged.

## Verification

- Full Jest run: **583 tests passed across 63 suites**, including 11 new gathering/combat regressions.
- TypeScript passed.
- Production JavaScript/assets exports passed for iOS, Android and web, including the final animation assets.
- Browser checks: category order, concise Contracts/Explore/Craft headers, retained specialization explanation, gathering labels, actual iron transaction (205g → 199g, 40 → 42 iron, 24 → 23 actions), Craftsmanship first in Practice, combat damage display, capped recovery display, and no browser errors during combat.
- Lottie preview checked all 12 scenes, callouts, impact frames and final victory/defeat poses. Corrected edge clipping during this review.
- Source search found no remaining “no further action” instructions in events/contracts or their shared presenter.

These are local changes and bundle checks. No store release was published. Native animation performance and haptic feel still need a device playtest; browser QA cannot establish those.
