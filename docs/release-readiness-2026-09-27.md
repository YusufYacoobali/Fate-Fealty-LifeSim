# Release readiness — 27 September 2026

**Verdict: do not submit this update yet.** App-side Meta integration is implemented, but the Meta app has not been created. External configuration and signed-device verification remain required.

## Automated evidence

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

1. Create/connect the Meta app; provide App ID and Client Token; set production EAS environment values.
2. Connect RevenueCat's Meta integration and sandbox credentials. Verify all three plans, `pro` entitlement, purchase/renewal delivery and Meta campaign eligibility. The repository's public RevenueCat keys alone do not prove dashboard configuration is correct.
3. Update the published privacy policy and both stores' privacy disclosures for Meta/RevenueCat processing. Supply a published Android app terms URL, and confirm the iOS EULA choice.
4. Build the actual native release for each intended store. Verify consent/ATT, install reporting, subscription/lifetime purchases, restores, offline behavior and withdrawal on real devices and sandbox accounts.
5. Complete the gameplay/save-migration/device checklist and store metadata/product/review checks in `meta-ads-release.md`. Unit tests and exports cannot prove these are complete.

Windows cannot compile or sign the iOS module. Native install attribution, paid conversions, SKAN/AEM eligibility, store receipt validation, UI/device performance and real-device consent behavior remain unverified until these steps are completed.

Detailed setup and acceptance checklist: [Meta Ads release setup](meta-ads-release.md).
