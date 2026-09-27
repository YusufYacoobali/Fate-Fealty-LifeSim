# Navigation and combat follow-up

- Restored the original six main navigation buttons and small colored markers, without artwork icons.
- Quests is a category inside **Do**. Contracts, Explore, Craft and Careers use text-only buttons. Old saves on the former main Quests tab migrate to Do → Quests, preserving their section and recipe.
- Contract cards omit the repeated age/action line and the list of choice previews. Each contract and expedition now has a subject-specific pixel icon. Recipe preparation shortcuts remain available.
- Missions open over Life and reveal their results there; existing saves with an open mission also return to Life when resolved. Career journey choices and finished anvil sessions do the same. Result navigation resets the feed filter and reveals the latest entry even with ongoing auto-scroll disabled. Unavailable missions do not navigate or spend an action.
- Craftsmanship is the first Practice skill. Its rewarded beginner anvil lesson is inside that skill's card; the existing age, skill and annual allowance rules remain in force.
- Combat uses new image-generated pixel fighters and a courtyard, matching the existing player portrait and forge artwork. Seven Lottie states animate separate transparent fighter layers and square impact particles. Reduced motion, background pause and full-backdrop timing input remain supported.

## Verification

- 63 targeted tests across five suites passed, including old-save migration, result navigation, unavailable actions, anvil reward settlement and animation lifecycle checks.
- Browser QA confirmed Do → Quests, text-only section buttons, distinct contract icons, contract completion on Life, Craftsmanship first, opening and finishing the anvil lesson, combat artwork loading without browser errors, and timing input from the fight title outside the bar. A disposable local save was used; its fixture test was removed afterward.
- TypeScript passed. Production JavaScript/assets exports passed for iOS, Android and web. No store release or signed device build was performed.

## Artwork provenance and generation prompts

Generated with the built-in image generation tool. Reference images: `assets/generated/portrait-peasant.png` and `assets/generated/forge-workshop-pixel.png`. Source artwork is saved in `assets/generated/combat-fighters-pixel.png` and `assets/generated/combat-yard-pixel.png`. `scripts/createCombatAnimations.cjs` extracts the transparent player/rival sprites with nearest-neighbour sizing and packs them into `assets/animations/pixel-combat-*.json`. The extracted sprites are saved as `combat-player-pixel.png` and `combat-rival-pixel.png` in the same generated-assets directory. No remote image dependency is used by the game.

### Fighter atlas prompt

Use case: stylized-concept. Create one production pixel-art sprite atlas for Fate & Fealty combat. Input 1 is the player's actual pixel portrait: MATCH its chunky pixel grid, chibi proportions, dark outlines, simple dot eyes, cream highlights and restrained colors. Input 2 is style/palette reference only for warm torchlight. Transparent background, no scenery, no text, no labels, no grid lines. Exactly TWO isolated full-body medieval fighters spaced widely apart side by side in equally sized left/right halves, all limbs fully inside each half with generous transparent margins. Left: friendly brown-haired peasant adventurer in dusty blue quilted tunic, leather boots and belt, facing RIGHT in a fighting stance. Right: burly rival in rust-red quilted tunic and leather cap, facing LEFT in a fighting stance. Each holds a short steel sword raised in their forward hand and small round wooden buckler near chest. Same scale, same ground level, 3/4 side view, very readable faces and thick square pixels like reference portrait. These two sprites will be extracted into separate Lottie layers to lunge, dodge, recoil and fall, so keep silhouettes clean and avoid anything connecting them. Crisp actual pixel art, no smooth painting, no antialiasing, no glow, no blood. Landscape 3:2 canvas.

### Courtyard prompt

Use case: stylized-concept. Create a production background for the combat minigame in the same medieval pixel-art game as the reference forge. Match exactly its large square pixel clusters, dark navy outlines and shadow, warm amber lantern lighting, stone masonry and richly textured but readable 16-bit game style. A side-on medieval village training courtyard at dusk: stone wall and gate in the upper background, timber palisade rail behind the arena, warm torch lantern at far left and far right, straw target and stacked barrels at outer edges. Lower half a broad completely EMPTY sandy fighting floor. No characters, no people, no weapons in foreground, no text or UI, no gradients or smooth airbrush, no blur. The two character sprites will be added as animated layers in front later. Calm richly painted pixel environment, warm forge palette. Landscape canvas 3:2, compose with open central floor and enough negative space so fighters can be read at phone size.
