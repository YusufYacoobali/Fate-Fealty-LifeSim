# App Review fixes — version 1.5 (2)

Apple reviewed on iPad Air (5th generation), iPadOS 27.0. The attached screenshot shows the paywall unable to load the store before checkout. It does not contain a StoreKit/RevenueCat error code, so the original sandbox failure is not yet diagnosed conclusively.

## Changes implemented

- Explicitly disable Expo Audio background playback and recording. Its plugin defaults background playback to enabled, even though the game only plays foreground sound effects. Also disable unused microphone permissions.
- Retry failed customer-info and offering reads up to three times with short backoff. Empty offerings also retry; unavailable plans never substitute another product.
- Add a visible Retry store action and reload products on foreground return. Ignore older responses after a new request or unmount.
- Permit purchase when live products loaded even if an ownership lookup failed. Keep confirmed cached entitlement access on failures; only a confirmed `pro` entitlement unlocks a purchase.
- Log the failed operation, platform, SDK error code and message for diagnosis. Do not log customer info or receipts. Never retry purchase transactions automatically.
- Royal Shop keeps upgrade purchases available to paid subscribers: Monthly → Yearly or Lifetime; Yearly → Lifetime; Lifetime → no further purchases. Determine the owned plan from RevenueCat entitlement metadata and the offering's actual product IDs, including Google base plans.
- Google subscription changes pass the existing product/base-plan ID with `WITHOUT_PRORATION` replacement so checkout replaces the subscription rather than adding another. iOS uses the standard StoreKit purchase flow; changes between billing periods may take effect at renewal depending on the subscription group's levels.
- A subscription management button and a Lifetime purchase notice explain that buying Lifetime does not cancel an existing recurring subscription. Ownership refreshes when returning from store settings.

## Verified locally

- Nine purchase/paywall/access test suites: 70 tests passed, including subscription upgrades, Google replacement arguments, repeat-purchase prevention, ownership updates on purchase/restore/foreground, failed/empty offerings, stale responses, cancellation, attribution and trial/launch gating.
- TypeScript check passed.
- `expo config --type introspect`: generated iOS Info.plist has no `audio` background mode and no microphone usage description.

These checks do not verify App Store Connect/RevenueCat account configuration or real sandbox transactions.

## Free mini-games and crafting

Practice and sparring are permanently free, including after the first-life trial ends. Solo sword and anvil practice keep their existing one-action cost and XP; sparring retains its existing no-action/no-XP rules. Ordinary artisan forge shifts keep normal career pay and rewards. Age, skill, building, imprisonment, resource and action requirements still apply.

Basic recipes are free: Wood axe, Balanced blade, Seed bundle, Repair kit, Healing salve and Travel provisions. Pro retains Mason's tools, Herbal kit, Tempered blade, Quilted armour, Mail shirt and Guild masterpiece, plus optional commissioned forge work. Ordinary quick trade-journey choices remain available. Previously owned premium equipment can still be equipped after Pro expires.

Forge activities remain playable after the three yearly bonus opportunities are used; subsequent sessions retain normal costs/rewards and grant no extra forge bonuses. Shop benefits now advertise advanced crafting rather than selling access to practice mini-games. Rank progression, royal content, premium traits, Live Forever and the 24/50 yearly action split retain their existing rules.

Verified with engine and rendered-control tests covering free entry points, all recipe tiers, normal forge pay, bonus limits, trial expiry and continued practice, advanced-item use after expiry, and the remaining Pro buttons. TypeScript passes.

## Before resubmission

1. Build a **new iOS binary** from this code. The Info.plist change requires a native rebuild. EAS uses remote versioning and auto-increment; verify the final build's marketing version/build number in EAS and App Store Connect (local app.json currently says 1.2.0 while the rejected submission is 1.5).
2. In App Store Connect, confirm Paid Apps Agreement is in effect and required banking/tax information is complete. Verify all premium products have complete metadata, prices and region availability. Attach newly submitted products to the version for review as required.
3. In RevenueCat, verify the Apple app is `com.yacoobali.med`, the iOS public SDK key belongs to it, and the current offering has `$rc_monthly`, `$rc_annual`, `$rc_lifetime` packages mapped to the **Apple** products (not only Google Play/Test Store). Each product must grant `pro`. Compare identifiers exactly with App Store Connect; none are hardcoded in this app.
   Ensure Monthly and Yearly are in the same Apple subscription group so StoreKit handles replacement and renewal timing correctly. Lifetime must be a non-consumable. Test monthly → yearly, monthly → lifetime, yearly → lifetime, and restore a lifetime purchase while the previous subscription remains active. Cancel recurring renewal using Manage subscription when switching to Lifetime.
4. On a fresh physical iPad/TestFlight install, check all three localized prices, buy each plan with separate sandbox test histories as needed, confirm Premium activates, and test restore after reinstall. Test declining ATT as well. A public App Store purchase on an existing phone does not exercise the same sandbox environment.
5. Test opening the paywall offline, reconnecting, then Retry store and foreground return. Checkout must recover without restarting the app. Leave the app during sound effects to verify it does not provide persistent background audio.
6. If sandbox products still fail, capture `[purchases] offerings` / `customer info` logs and RevenueCat native SDK logs. A missing/empty offering is a different diagnosis from a network failure; repeated retries cannot repair account/product mappings.

Do not claim the original sandbox problem is resolved or purchases were tested until the physical-device checks succeed.

References: [Expo SDK 57 Audio configuration](https://docs.expo.dev/versions/v57.0.0/sdk/audio/), [RevenueCat empty offerings troubleshooting](https://www.revenuecat.com/docs/offerings/troubleshooting-offerings), [Apple IAP configuration](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases), [RevenueCat Apple sandbox testing](https://www.revenuecat.com/docs/test-and-launch/sandbox/apple-app-store).

Upgrade behavior reference: [RevenueCat subscription changes and management](https://www.revenuecat.com/docs/subscription-guidance/managing-subscriptions).
