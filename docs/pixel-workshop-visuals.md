# Newspaper and forge visuals

The new art follows the existing `activity-blacksmith.png` pixel-art reference. Fonts, pixel buttons, navigation and the shared parchment/blue/gold palette are retained.

- Village news opens an annual Swineford Gazette with a short pixel Lottie unfolding animation, generated village artwork and readable live-text articles. Closing the paper returns to the same feed position.
- The forge uses a generated pixel workshop with a locally authored pixel hammer and square ember burst. Each accepted strike triggers one animation and optional haptic feedback, including the final strike. Reloading a saved attempt does not replay old strikes or award rewards.
- Settings and system reduced-motion preferences disable decorative movement. Timing assist remains a separate gameplay setting. No animation callback changes scores, items, XP or action costs.
- All images and animations are bundled locally. Web uses Lottie's SVG renderer; iOS and Android use `lottie-react-native`.

## Asset provenance

`assets/generated/forge-workshop-pixel.png` and `gazette-village-pixel.png` were generated with the built-in image generation tool using the existing blacksmith icon as the style reference. Full prompts are in `assets/generated/workshop-visual-prompts.json`. Earlier realistic/engraved concepts were rejected and are not included in the game.

The two original Lottie compositions are reproducible with `node scripts/createPixelAnimations.cjs`. The hammer contact point is aligned to the generated billet, so replacing the scene requires checking that alignment again.

## Validation

TypeScript and all 517 tests across 56 suites pass, including 22 workshop regression tests and 4 animation lifecycle tests. Production JavaScript exports for web, iOS and Android pass. Browser checks at 390 × 844 cover the newspaper opening/closing, complete readable articles, reduced-motion opening without an animation, and all five practice strikes. A mid-attempt refresh retains the strike count; the final strike still animates and free practice leaves gold, actions and XP unchanged. The phone preview caught and corrected intrinsic image sizing and Lottie shape ordering issues.

Native JavaScript exports are build checks, not a physical-device performance test; the new native dependency requires a rebuilt development client/app binary. The preview still logs its pre-existing RevenueCat Web Billing configuration and music autoplay errors; no Lottie errors were observed.
