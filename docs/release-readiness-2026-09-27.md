# Release readiness — 27 September 2026

**Verdict: do not submit this update yet.** App-side Meta integration and the supplied App ID/Client Token are configured. External configuration and signed-device verification remain required.

## Automated evidence

- 28 September gameplay follow-up: **583 tests passed across 63 suites**; TypeScript and production exports for iOS, Android and web passed. Browser QA checked category order, quest copy, paid gathering and combat feedback; Lottie previews checked all twelve scenes. See [combat and gathering verification](combat-gathering-polish-2026-09-28.md). Native device performance and release verification remain open.

- Latest navigation/combat follow-up: **63 targeted tests across five suites passed**, including four new navigation/save/result regressions. TypeScript and production exports for iOS, Android and web passed. Browser QA checked Do → Quests, simplified cards and icons, return to Life with auto-scroll disabled, anvil lessons under Craftsmanship, and generated-art combat with timing input outside the bar. See [navigation/combat notes and artwork prompts](navigation-combat-follow-up-2026-09-27.md). These exports are not signed device builds; the older full-suite count below predates this follow-up.
- Follow-up review: **568/568 tests passed across 62 suites**, including 21 targeted attribution/configuration checks; TypeScript passed. Fixed Android pre-consent provider initialization and explicit app-open reporting, purchase-identifier fallback on SDK errors, and restore consent sequencing. Gameplay review and account-side limitations are detailed in [follow-up verification](verification-follow-up-2026-09-27.md).
- Follow-up native verification: fresh Android prebuild, `:meta-activation:compileDebugKotlin` and `:app:processReleaseMainManifest` passed (117 Gradle tasks) in an isolated audit project. The merged release manifest has zero Facebook startup providers and all three automatic initialization/logging/advertising-ID flags are false. The audit uses a minimal JavaScript entry point; it is not a signed full-game build or an iOS compile.
- Gameplay-polish follow-up: **565/565 tests passed across 62 suites** in the final full run; TypeScript passed. Final production JavaScript exports passed for Android, iOS and web. Browser checks verified the Quests layout, immediate crafted-item use, rewarded anvil lessons, concise cost warnings and combat timing from outside the bar. See [gameplay polish](gameplay-polish-2026-09-27.md) for scope and save handling. These exports are not signed binaries; native device checks remain open.
- The gameplay follow-up reconciled the existing reducer merge conflict and marked that file resolved. Other staged work was preserved. The release configuration check still blocks on missing Meta App ID/Client Token and the Android terms URL.
- Full Jest run after integration: 532 tests passed across 58 suites. Three additional checkout-attribution tests passed separately; the targeted tracking/configuration run passed all 18 tests. Total unique tests checked: 535.
- TypeScript check passed after the paywall link nullability fix.
- Expo Doctor: 21/21 checks passed after compatible SDK 57 patch updates.
- Production JavaScript exports succeeded for Android, iOS and web after the native bridge refactor. These are bundles, not signed binaries.
- Android native prebuild and `:meta-activation:compileDebugKotlin` succeeded in an isolated audit project (59 Gradle tasks). This verifies the native bridge, not a signed full-app release. iOS and Android autolinking checks discover the local Meta module and exclude the community package's automatic startup adapter.
- `npm run release:check` correctly identifies missing Meta configuration and the Android terms URL. Production config rejects missing Meta credentials.
- Non-breaking security fixes removed both high-severity findings. `npm audit` still reports 12 moderate findings in the build tooling chain rooted in `xcode` → `uuid`. The suggested forced fix downgrades Expo dependencies; it was not applied. These require dependency/toolchain follow-up, not a claim that the audit is clean.
- Git whitespace validation passed. Existing unrelated workspace edits were preserved.

## External release status checked

EAS project: `bb28a220-3a1e-4c84-8e16-7525b1117aed`.

The latest Android build returned by EAS was `ba180bdb-2633-4a99-88a2-33beb3e14351`, finished 13 August 2026: app 1.0.0, version code 16, Expo SDK 54. The current workspace is app 1.2.0 on SDK 57. That older binary does not include this update. A separate iOS EAS build query returned no builds.

No new cloud build, store submission or release was started. Store approval and current store-listing status were not verified.

## Release blockers and owner actions

1. App ID and Client Token are now configured in the project's `.env` for local/EAS builds. Confirm the Meta app's platform, business/ad account and signing-key settings; account configuration remains unverified.
2. Verify all three purchase plans, the `pro` entitlement and restores in sandbox. RevenueCat → Meta is optional for server-side purchase/subscription reporting and is not required for Meta SDK install events. If using that forwarding integration, configure its credentials and verify purchase/renewal delivery separately. The repository's public RevenueCat keys alone do not prove dashboard configuration is correct.
3. Update the published privacy policy and both stores' privacy disclosures for Meta/RevenueCat processing. Supply a published Android app terms URL, and confirm the iOS EULA choice.
4. Build the actual native release for each intended store. Verify consent/ATT, install reporting, subscription/lifetime purchases, restores, offline behavior and withdrawal on real devices and sandbox accounts.
5. Complete the gameplay/save-migration/device checklist and store metadata/product/review checks in `meta-ads-release.md`. Unit tests and exports cannot prove these are complete.

Windows cannot compile or sign the iOS module. Native install attribution, paid conversions, SKAN/AEM eligibility, store receipt validation, UI/device performance and real-device consent behavior remain unverified until these steps are completed.

Detailed setup and acceptance checklist: [Meta Ads release setup](meta-ads-release.md).
