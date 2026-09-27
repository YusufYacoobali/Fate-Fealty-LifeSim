# Meta Ads setup and release audit

Status: **not ready for store release yet**. Meta credentials and account-side setup are still missing. Tracking is disabled in unconfigured development builds; production builds reject missing Meta credentials.

## What is implemented

- Meta Core SDK configuration for iOS and Android, including native install/activation reporting and SKAdNetwork entries from the config plugin.
- Optional ad-measurement consent, saved independently of game saves. iOS also requires ATT authorization. Settings offers the same allow/decline choice. Web and Expo Go do not initialize tracking.
- Consent is checked again when returning to the app and before checkout. Opt-out disables collection and clears RevenueCat matching identifiers; explicit withdrawal attempts an immediate server sync. Offline changes sync when RevenueCat reconnects. Data already delivered is not deleted by changing this preference.
- Attribution is attached to the configured RevenueCat customer before checkout. RevenueCat is the sole revenue-event sender. The app does not report restore, cancel, failed purchase, or a local premium flag as new revenue.
- Automatic Meta purchase logging stays off, preventing a second sender from duplicating RevenueCat events.
- Added privacy links, renewal disclosure, and restore access to both paywalls. iOS uses Apple's standard EULA unless a custom terms URL is supplied. Android still needs a published app terms URL.
- Fixed mobile RevenueCat configuration being attempted on web. Applied compatible Expo SDK 57 patches and non-breaking dependency security fixes.

## What the owner needs to supply

1. Create a Meta developer app with the app-advertising use case. Add iOS and Android platforms: bundle/package `com.yacoobali.med`; Apple store ID `6786423727`. Android activity is `com.yacoobali.med.MainActivity`. Add the appropriate store signing key hashes (including Google Play App Signing) and connect the intended business/ad account.
2. Supply the **Meta App ID** and **Client Token** from App Settings. These are public client configuration. Do not send or embed an App Secret or Conversions API access token in this repository.
3. Publish/update the privacy policy to explain Meta and RevenueCat, device identifiers, app events, purchase data, optional ad measurement, withdrawal and data-deletion contact. The existing published policy says only aggregated/anonymized data is transmitted; that does not describe this integration accurately. Update Apple App Privacy and Google Play Data Safety/advertising-ID declarations to match the final binary and settings.
4. Supply a published Android terms URL (`TERMS_OF_USE_URL`); confirm Apple's standard EULA is appropriate for iOS, or supply your own terms URL for both.
5. Complete the RevenueCat/Meta dashboard steps below, then run the device acceptance checklist. No dashboard integration or live event delivery has been verified in this task.

## Environment and new builds

Copy `.env.example` to `.env.local` for local native builds. Set `META_APP_ID` and `META_CLIENT_TOKEN` there and in EAS's **production** environment (plain/sensitive values available during config evaluation, not secret-only values). Set `TERMS_OF_USE_URL` to your published HTTPS page.

Keep the `react-native-fbsdk-next` autolinking exclusion in `package.json`. Its config plugin configures the native app; `modules/meta-activation` links the native Core SDK and controls initialization. See that module's README for the consent rationale.

Native directories are ignored by Git. EAS regenerates them from the config. Existing local native folders must be regenerated deliberately before local device tests. This change cannot be delivered through an OTA JavaScript update.

After account setup and acceptance testing:

```sh
npm run typecheck
npm test -- --runInBand
npx expo-doctor
npm run release:check
eas build --platform all --profile production
```

Do not submit an older build from the EAS dashboard as this update. Production EAS version numbers are managed remotely with auto-increment.

## RevenueCat and Meta dashboards

Use RevenueCat's Meta Ads **Conversions API** integration. Connect a dataset linked to the Meta app, then place its Dataset ID and CAPI access token in RevenueCat only. Add separate sandbox dataset/token credentials for test purchases. Leave sending events without authorized ATT disabled. Disable automatic in-app purchase logging in Meta's platform settings as well.

Keep the default event mapping: trials → `StartTrial`, initial subscription/renewal → `Subscribe`, lifetime/non-renewing purchase → `fb_mobile_purchase`. Use a consistent gross/net revenue setting. Validate the current offering's monthly, annual and lifetime packages grant the `pro` entitlement on both stores.

For a fresh sandbox customer, inspect identifiers and delivery in RevenueCat Customer History, then confirm receipt and eligibility in Meta Events Manager. Successful delivery alone does not establish campaign attribution or optimization eligibility. Check iOS AEM/SKAN campaign configuration separately; this integration does not implement purchase conversion-value updates.

Reference: [RevenueCat Meta integration](https://www.revenuecat.com/docs/integrations/attribution/meta-ads).

## Device acceptance checklist

- Fresh install: no measurement before consent; allow reports activation/install. Decline still permits normal gameplay and purchases.
- iOS ATT: authorized, denied, restricted, and changing permission in Settings. Denial must keep native measurement and matching identifiers off.
- Android: consent granted/declined, advertising ID unavailable, and background/resume. Inspect a release build's merged permissions.
- Monthly, annual, lifetime and any configured introductory offers: correct store price/currency, exactly one appropriate revenue event, confirmed premium access.
- Cancellation, pending payment, failed payment, restore, refund/expiry and subscription renewal while the app is closed. Restore must not become a new purchase event.
- Withdraw consent, restart and purchase again; inspect RevenueCat attributes/delivery. Test offline withdrawal and reconnection.
- Save migration from the last shipped binary, cold launch, onboarding, font/audio loading, notifications, reduced motion, narrow phones and tablets, foreground/background, and accessibility.
- Signed TestFlight and Play internal-track builds of this exact code, store metadata/screenshots/age ratings, privacy declarations, product approvals, reviewer notes, and final store processing status.

## Audit evidence

See `release-readiness-2026-09-27.md` for checks and remaining limitations.

Sources: [Meta React Native config plugin](https://github.com/thebergamo/react-native-fbsdk-next), [Expo tracking permission](https://docs.expo.dev/versions/v57.0.0/sdk/tracking-transparency/), [Apple review guidance](https://developer.apple.com/app-store/review/guidelines/).
