# Meta activation bridge

This local Expo module links Meta's native Core SDK on iOS and Android. It owns consent-controlled initialization, native install/activation reporting, and the anonymous identifier passed to RevenueCat. It deliberately exposes no purchase logger: RevenueCat owns revenue events.

`react-native-fbsdk-next` is installed **only for its Expo config plugin** (native credentials, settings, URL scheme and Meta SKAdNetwork IDs). `package.json` excludes its native modules from Expo autolinking. Do not remove that exclusion: its Expo AppDelegate subscriber calls Meta initialization at startup, before the in-app consent choice. Our local module links `FBSDKCoreKit` / `facebook-core` directly instead.

All three automatic initialization/event/advertising-ID flags are off in the generated configuration. The bridge is invoked only after the app's saved consent; iOS additionally checks ATT natively. No Facebook Login or Share SDK is needed. Native changes require a new binary, not an OTA update or Expo Go.

On Android, `plugins/withMetaConsent.js` also removes `FacebookInitProvider` from the merged manifest. The SDK's `AutoInitEnabled=false` flag alone does not prevent that provider from calling `sdkInitialize` at process startup. The bridge calls `sdkInitialize` only after opt-in. Keep both the plugin and the native initialization code together.

Android SDK 18.3.0 is pinned for the reviewed behavior. Native `activateApp` publishes the install signal, but its lifecycle app-open logger is gated by automatic event logging. The bridge therefore also logs the standard `EVENT_NAME_ACTIVATED_APP` explicitly after consent. Automatic events and purchases remain off. iOS uses `AppEvents.shared.activateApp()` for both signals.

The JavaScript service serializes native calls and refreshes consent on foreground and before purchase. `activateApp()` is the real native SDK method, not a custom event with a matching name. Purchase amounts, currency, trials, renewals, and lifetime purchases come from RevenueCat's server integration after dashboard setup.
