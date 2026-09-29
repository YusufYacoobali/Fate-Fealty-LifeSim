# Combat playback and compact Do filters

No combat artwork was removed: all 12 duel compositions and five solo compositions remain bundled.

## Fixes

- Native Lottie playback waits for `onAnimationLoaded`. Each source has a separate keyed native view so a play command cannot target the previous composition while Android parses the next one.
- Repeated impacts pass both start and end frames. In the installed Lottie Android implementation, `play(0)` without an end frame takes the resume path, which can leave a completed animation at its final frame.
- The final attack or incoming hit completes before victory/defeat plays. Reduced motion and background interruptions settle the outcome without replaying the old hit.
- Do's horizontal filters cannot shrink vertically. Buttons have a 44-point minimum touch height inside a row with a 65-point minimum height and vertical padding.

## Validation

- 68 unique tests passed across animation lifecycle, combat presentation/economy, solo practice, and workshop suites. Coverage includes every combat/solo source, repeated playback, delayed native loading, source replacement, interruption, reduced motion, completion callbacks, and finishing blows.
- TypeScript check passed.
- Expo JavaScript/asset exports completed for Android, iOS, and web. These are bundle checks, not signed native builds.
- All 17 compositions loaded and completed in the browser animation audit; impact poses were inspected, including heavy attacks in both modes.
- The Do filter row retained a 65-point height and roughly 10 points of clearance above/below its buttons in compact browser previews, including a viewport roughly 360 points wide and one 567 points tall. Browser zoom affected the requested viewport dimensions, so these are not native screen measurements.
- ADB found no connected Android devices. The native playback fix still needs a fresh Android build/device smoke test; no APK was built or installed in this change.
