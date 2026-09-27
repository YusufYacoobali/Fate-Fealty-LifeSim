# Workshop and professional-life update

This implements the smaller first update: clearer stories and feedback, independent professional progression, one deeper craft/trade journey, and one optional forge game. Three additional mini-games and wider profession expansions remain deferred until playtesting shows this loop is enjoyable.

## Playing the update

- **Do → Craft → Practice at the anvil** opens at age 10. Practice costs no actions or materials and grants no rewards.
- Ironworking recipes offer **Quick craft** and **Play at the anvil**. Craft occupations also offer a paid workshop shift at the anvil. Both routes commit the same normal task and cost once.
- Hammer work has five strikes with Perfect, Good and Miss feedback. A Good total adds 2 Craftsmanship XP; Excellent adds 4 XP and 1 recovered iron. Only three paid attempts per character per world year are eligible. The allowance is reserved at the start, including an attempt later skipped.
- Quick finish keeps the committed item, normal XP and pay without a bonus. An interrupted game saves its targets, completed strikes and result. Repeated or stale inputs cannot pay twice.
- The existing Timing Assist setting gives Good strikes automatically. Touch and keyboard activation are supported; backgrounding pauses input and returning gives a countdown. Reduced motion preserves the timing marker because its movement is the interaction itself.
- **Do → Work → A mark of your own** opens to craft/trade occupations at 18. Four chapters require 0, 2, 4 and 6 relevant assignments, with at most one chapter each year. Ordinary career shifts, successful guild contracts and successful caravan completions count.
- The journey keeps a named buyer, changes their trust, and schedules a later guild payment or complaint. A deceased buyer is explicitly replaced. Its three endings award a personal legacy, memory and achievement; Me and the death summary display the legacy. An heir starts their own professional journey.

## Clarity and continuity

Career promotion uses experience, performance, age, ability and existing entitlement rules, independently of social rank. The header and Me screen show occupation separately; noble and royal story opportunities remain available through station.

Story choices expose authored stakes, known costs and uncertainty. Unaffordable choices are rejected by the engine as well as disabled in the interface. Outcome rows show actual resource/stat changes after clamping. Routine NPC career and arrival notices open as annual pixel newspapers in All and World; deaths, family stories and choices stay visible as individual entries.

Selected role endings no longer declare a burial, a future date, or decades of off-screen life while the player remains active. Childhood firsts are remembered once per character. Other annual flavour has a six-year cooldown, and passages naming the original parents or goose require those characters to be alive.

## Saves and verification

Save schema remains 5 with additive defaults. Content version advances to 5 so older builds cannot silently overwrite newer progression. Loading an older save creates no work, rewards or commissions. Forge and trade state are cloned with the owning character; succession clears the active forge and resets its allowance.

Automated coverage includes baseline work/crafting parity, commission costs, stale and duplicate inputs, final-action completion, interruption/reload, annual caps, free practice, timing assist, all three legacies, delayed payments, client replacement, succession, old-save defaults, affordability and narrative cooldowns. Simulation agents now select enabled choices, matching what the player can actually select.

Browser checks used a separate local save at port 8091: early-year story outcomes, expanding village news, forge practice, a reload after two strikes, a paid wood-axe craft with quick finish, a paid workshop shift, keyboard and pointer input, and a 390 × 844 viewport. The web preview also reports existing billing-key configuration and autoplay errors; purchases were not tested.

Final verification on 22 September 2026: all 517 tests passed across 56 suites, including 22 dedicated workshop/update tests and 4 animation lifecycle tests. TypeScript, diff whitespace checks and Web/Android/iOS production JavaScript exports passed. These exports are not signed native builds. Physical-device timing, screen-reader behaviour and background/resume feel still need device testing. No player-retention or store-ranking claim is established by these checks.
