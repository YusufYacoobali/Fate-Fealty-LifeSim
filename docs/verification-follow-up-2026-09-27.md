# Follow-up verification — 27 September 2026

The gameplay requests are implemented and the regression suite passes. Meta attribution has app-side support and the subsequently supplied App ID/Client Token are configured in `.env`, but is **not verified end to end**: no connected Meta/RevenueCat dashboard or live event delivery was verified.

## Gameplay review

| Request | Review result |
| --- | --- |
| Quests inside Do | Contracts, Explore, Craft and career journeys render only in Do → Quests. Main navigation and quest section buttons have no artwork icons. |
| Useful recipes and immediate actions | All 12 recipes describe their purpose; current matching contracts are linked; exact-quality equipment and consumables have immediate Equip/Use. |
| Continuous multi-stage quests | Journeys advance to the next decision automatically; action reservation, reloads and stale taps are covered by tests. Meaningful decisions still require the player's choice. |
| Useful anvil practice | One beginner lesson per year until Craftsmanship 3, costing one action and granting 6 XP once. Paid forge rewards and annual bonus limits are tested. |
| Combat | Four-exchange limit, seven Lottie scenes, full-backdrop timing input, and event challenges with once-only settlement after reload. |
| Practice and icons | Skills are in Do → Practice; quest, skill and equipment sections use pixel icons. |
| Clearer events and costs | Rival storyline rewritten; the quack's price and shortage appear without repeated cost text. |
| Remove music and Timing Assist | No runtime references remain; old settings are dropped during load. Sound effects remain. |

## Attribution issues found and fixed

1. **Android pre-consent initialization:** Meta's `FacebookInitProvider` calls `sdkInitialize` at startup even with `AutoInitEnabled=false`. A config plugin now removes that provider, and the native bridge explicitly initializes only after consent.
2. **Android app-open reporting:** with automatic logging off, native `activateApp` publishes the install signal but its lifecycle logger suppresses activation events. The bridge now also emits the standard activation event explicitly. Purchases remain excluded from client logging. Android SDK behavior is pinned to 18.3.0.
3. **Identifier fallback:** activation or anonymous-ID failures no longer prevent the separate advertising-ID collection path for consented purchases.
4. **Restore sequencing:** restore now awaits consent reconciliation before calling the store. It never calls the purchase method.

The Meta anonymous ID is attached to the configured RevenueCat customer before checkout. iOS requires both in-app consent and ATT authorization. Decline/withdrawal prevents new app-initiated measurement and clears RevenueCat matching identifiers; already-sent or in-flight SDK data cannot be recalled. RevenueCat is intended to be the only purchase-event sender. That requires its dashboard integration to be enabled; app code alone cannot send RevenueCat events to Meta.

## Verification and remaining gates

- Full Jest run: **568 tests passed across 62 suites**. TypeScript passed.
- Targeted attribution/configuration tests: **21 passed**, including provider-removal idempotence, consent, activation failure, checkout and restore sequencing.
- Fresh Android prebuild, `:meta-activation:compileDebugKotlin` and `:app:processReleaseMainManifest` passed in an isolated audit project. The actual merged release manifest contains no Facebook startup provider; automatic initialization, automatic event logging and advertising-ID collection default to false. This verifies the native integration, not a signed full-game build.
- After adding the supplied credentials, the local release check passes Meta configuration and still blocks on missing `TERMS_OF_USE_URL`.
- No signed app build, store submission, dashboard mutation, live install or sandbox purchase was performed.

To finish attribution: connect the linked dataset and CAPI token in RevenueCat, configure sandbox credentials, and disable duplicate Meta purchase logging. Validate a fresh install and fresh-customer sandbox purchase in RevenueCat Customer History and Meta Events Manager. Verify campaign eligibility separately; this app does not implement purchase SKAN conversion-value updates.

Sources checked: [RevenueCat integration and validation](https://www.revenuecat.com/docs/integrations/attribution/meta-ads), [Meta Android startup provider](https://github.com/facebook/facebook-android-sdk/blob/sdk-version-18.3.0/facebook-core/src/main/java/com/facebook/internal/FacebookInitProvider.kt), [Meta Android automatic-event gate](https://github.com/facebook/facebook-android-sdk/blob/sdk-version-18.3.0/facebook-core/src/main/java/com/facebook/appevents/InternalAppEventsLogger.kt).
